const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const protect = require('../middleware/protect');

router.use(protect); // Protect all employee routes

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;