const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/me', authenticateToken, userController.getCurrentUser);
router.put('/:id', authenticateToken, userController.updateUser);

// Admin only routes
router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);

module.exports = router;