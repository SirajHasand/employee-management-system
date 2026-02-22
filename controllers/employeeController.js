const db = require('../config/database');

// Get all employees with department and position details
const getAllEmployees = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, d.Name as DepartmentName, p.Title as PositionTitle 
            FROM Employee e
            LEFT JOIN Department d ON e.DepartmentId = d.Id
            LEFT JOIN Position p ON e.PositionId = p.Id
            WHERE e.IsDeleted = false
            ORDER BY e.Id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get employee by ID with all related details
const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await db.query(`
            SELECT e.*, d.Name as DepartmentName, p.Title as PositionTitle 
            FROM Employee e
            LEFT JOIN Department d ON e.DepartmentId = d.Id
            LEFT JOIN Position p ON e.PositionId = p.Id
            WHERE e.Id = $1 AND e.IsDeleted = false
        `, [id]);
        
        if (employee.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Get addresses
        const addresses = await db.query(
            'SELECT * FROM EmployeeAddress WHERE EmployeeId = $1',
            [id]
        );

        // Get salary history
        const salaries = await db.query(
            'SELECT * FROM EmployeeSalary WHERE EmployeeId = $1 ORDER BY EffectiveFrom DESC',
            [id]
        );

        // Get documents
        const documents = await db.query(
            'SELECT * FROM EmployeeDocument WHERE EmployeeId = $1',
            [id]
        );

        // Get attendance
        const attendance = await db.query(
            'SELECT * FROM EmployeeAttendance WHERE EmployeeId = $1 ORDER BY Date DESC LIMIT 10',
            [id]
        );

        res.json({
            ...employee.rows[0],
            addresses: addresses.rows,
            salaries: salaries.rows,
            documents: documents.rows,
            attendance: attendance.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create employee
const createEmployee = async (req, res) => {
    const { fullname, email, dateofbirth, hiredate, departmentid, positionid } = req.body;
    
    try {
        // Check if department exists
        const deptCheck = await db.query('SELECT Id FROM Department WHERE Id = $1', [departmentid]);
        if (deptCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Department not found' });
        }

        // Check if position exists
        const posCheck = await db.query('SELECT Id FROM Position WHERE Id = $1', [positionid]);
        if (posCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Position not found' });
        }

        const result = await db.query(
            `INSERT INTO Employee (FullName, Email, DateOfBirth, HireDate, DepartmentId, PositionId) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [fullname, email, dateofbirth, hiredate, departmentid, positionid]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Update employee
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { fullname, email, dateofbirth, hiredate, departmentid, positionid } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE Employee 
             SET FullName = $1, Email = $2, DateOfBirth = $3, HireDate = $4, 
                 DepartmentId = $5, PositionId = $6, UpdatedAt = CURRENT_TIMESTAMP 
             WHERE Id = $7 AND IsDeleted = false RETURNING *`,
            [fullname, email, dateofbirth, hiredate, departmentid, positionid, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Soft delete employee
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE Employee SET IsDeleted = true WHERE Id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};