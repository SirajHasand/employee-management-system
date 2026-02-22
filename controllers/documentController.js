const db = require('../config/database');

// Get documents by employee ID
const getDocumentsByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM EmployeeDocument WHERE EmployeeId = $1 ORDER BY UploadedAt DESC',
            [employeeId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create document record
const createDocument = async (req, res) => {
    const { employeeId } = req.params;
    const { documentname, filepath } = req.body;
    
    try {
        const result = await db.query(
            `INSERT INTO EmployeeDocument (EmployeeId, DocumentName, FilePath) 
             VALUES ($1, $2, $3) RETURNING *`,
            [employeeId, documentname, filepath]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update document
const updateDocument = async (req, res) => {
    const { id } = req.params;
    const { documentname, filepath } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE EmployeeDocument 
             SET DocumentName = $1, FilePath = $2 
             WHERE Id = $3 RETURNING *`,
            [documentname, filepath, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete document
const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM EmployeeDocument WHERE Id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getDocumentsByEmployeeId,
    createDocument,
    updateDocument,
    deleteDocument
};