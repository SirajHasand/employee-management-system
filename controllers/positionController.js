const db = require('../config/database');

// Get all positions
const getAllPositions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Position ORDER BY Id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get position by ID
const getPositionById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Position WHERE Id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create position
const createPosition = async (req, res) => {
    const { title, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Position (Title, Description) VALUES ($1, $2) RETURNING *',
            [title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Position title already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Update position
const updatePosition = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE Position SET Title = $1, Description = $2, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $3 RETURNING *',
            [title, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Position title already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Delete position
const deletePosition = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Position WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }
        res.json({ message: 'Position deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition
};