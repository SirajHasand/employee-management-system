const express = require('express');
const router = express.Router({ mergeParams: true });
const salaryController = require('../controllers/salaryController');

router.get('/', salaryController.getSalariesByEmployeeId);
router.post('/', salaryController.createSalary);
router.put('/:id', salaryController.updateSalary);
router.delete('/:id', salaryController.deleteSalary);

module.exports = router;