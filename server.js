const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const departmentRoutes = require('./routes/departmentRoutes');
const positionRoutes = require('./routes/positionRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const addressRoutes = require('./routes/addressRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes'); // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees/:employeeId/addresses', addressRoutes);
app.use('/api/employees/:employeeId/salaries', salaryRoutes);
app.use('/api/employees/:employeeId/documents', documentRoutes);
app.use('/api/employees/:employeeId/attendance', attendanceRoutes);
app.use('/api/users', userRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Employee Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});