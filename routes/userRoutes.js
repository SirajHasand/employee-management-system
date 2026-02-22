const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/protect');

// Public routes (no protection)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', userController.logout);

// Protected routes
router.get('/me', protect, userController.getCurrentUser);
router.put('/:id', protect, userController.updateUser);
router.get('/', protect, userController.getAllUsers);

module.exports = router;