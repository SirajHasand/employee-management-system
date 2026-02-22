const db = require('../config/database');

// Get attendance by employee ID
const getAttendanceByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM EmployeeAttendance WHERE EmployeeId = $1 ORDER BY Date DESC',
            [employeeId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create attendance record
const createAttendance = async (req, res) => {
    const { employeeId } = req.params;
    const { date, checkin, checkout, ispresent } = req.body;
    
    try {
        const result = await db.query(
            `INSERT INTO EmployeeAttendance (EmployeeId, Date, CheckIn, CheckOut, IsPresent) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (EmployeeId, Date) 
             DO UPDATE SET CheckIn = EXCLUDED.CheckIn, CheckOut = EXCLUDED.CheckOut, 
                           IsPresent = EXCLUDED.IsPresent
             RETURNING *`,
            [employeeId, date, checkin, checkout, ispresent]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update attendance
const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { checkin, checkout, ispresent } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE EmployeeAttendance 
             SET CheckIn = $1, CheckOut = $2, IsPresent = $3 
             WHERE Id = $4 RETURNING *`,
            [checkin, checkout, ispresent, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete attendance
const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM EmployeeAttendance WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAttendanceByEmployeeId,
    createAttendance,
    updateAttendance,
    deleteAttendance
};