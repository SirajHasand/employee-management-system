const express = require('express');
const router = express.Router({ mergeParams: true });
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAttendanceByEmployeeId);
router.post('/', attendanceController.createAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;