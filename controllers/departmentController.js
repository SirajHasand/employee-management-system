const db = require('../config/database');

// Get all departments
const getAllDepartments = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Department ORDER BY Id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Department WHERE Id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create department
const createDepartment = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Department (Name, Description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Department name already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Update department
const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE Department SET Name = $1, Description = $2, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Department name already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Department WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};