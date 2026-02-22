const db = require('../config/database');

// Get addresses by employee ID
const getAddressesByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM EmployeeAddress WHERE EmployeeId = $1 ORDER BY IsPrimary DESC',
            [employeeId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create address
const createAddress = async (req, res) => {
    const { employeeId } = req.params;
    const { street, city, country, isprimary } = req.body;
    
    try {
        // If this is primary address, unset any existing primary
        if (isprimary) {
            await db.query(
                'UPDATE EmployeeAddress SET IsPrimary = false WHERE EmployeeId = $1',
                [employeeId]
            );
        }

        const result = await db.query(
            `INSERT INTO EmployeeAddress (EmployeeId, Street, City, Country, IsPrimary) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [employeeId, street, city, country, isprimary || false]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { street, city, country, isprimary } = req.body;
    
    try {
        // Get the address to find employee ID
        const address = await db.query('SELECT EmployeeId FROM EmployeeAddress WHERE Id = $1', [id]);
        
        if (address.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // If this is primary address, unset any existing primary for this employee
        if (isprimary) {
            await db.query(
                'UPDATE EmployeeAddress SET IsPrimary = false WHERE EmployeeId = $1 AND Id != $2',
                [address.rows[0].employeeid, id]
            );
        }

        const result = await db.query(
            `UPDATE EmployeeAddress 
             SET Street = $1, City = $2, Country = $3, IsPrimary = $4, UpdatedAt = CURRENT_TIMESTAMP 
             WHERE Id = $5 RETURNING *`,
            [street, city, country, isprimary, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM EmployeeAddress WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAddressesByEmployeeId,
    createAddress,
    updateAddress,
    deleteAddress
};