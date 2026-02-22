const db = require('../config/database');

// Get salary history by employee ID
const getSalariesByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM EmployeeSalary WHERE EmployeeId = $1 ORDER BY EffectiveFrom DESC',
            [employeeId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create salary record
const createSalary = async (req, res) => {
    const { employeeId } = req.params;
    const { basicsalary, allowance, effectivefrom, isactive } = req.body;
    
    try {
        // If this salary is active, deactivate other active salaries
        if (isactive) {
            await db.query(
                'UPDATE EmployeeSalary SET IsActive = false WHERE EmployeeId = $1 AND IsActive = true',
                [employeeId]
            );
        }

        const result = await db.query(
            `INSERT INTO EmployeeSalary (EmployeeId, BasicSalary, Allowance, EffectiveFrom, IsActive) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [employeeId, basicsalary, allowance, effectivefrom, isactive || true]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update salary record
const updateSalary = async (req, res) => {
    const { id } = req.params;
    const { basicsalary, allowance, effectivefrom, isactive } = req.body;
    
    try {
        // Get the salary record to find employee ID
        const salary = await db.query('SELECT EmployeeId FROM EmployeeSalary WHERE Id = $1', [id]);
        
        if (salary.rows.length === 0) {
            return res.status(404).json({ error: 'Salary record not found' });
        }

        // If this salary is being set as active, deactivate other active salaries for this employee
        if (isactive) {
            await db.query(
                'UPDATE EmployeeSalary SET IsActive = false WHERE EmployeeId = $1 AND Id != $2 AND IsActive = true',
                [salary.rows[0].employeeid, id]
            );
        }

        const result = await db.query(
            `UPDATE EmployeeSalary 
             SET BasicSalary = $1, Allowance = $2, EffectiveFrom = $3, IsActive = $4 
             WHERE Id = $5 RETURNING *`,
            [basicsalary, allowance, effectivefrom, isactive, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete salary record
const deleteSalary = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM EmployeeSalary WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Salary record not found' });
        }
        res.json({ message: 'Salary record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getSalariesByEmployeeId,
    createSalary,
    updateSalary,
    deleteSalary
};