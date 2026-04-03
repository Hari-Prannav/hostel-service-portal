const express = require('express');
const { loginUser, registerUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginUser);

// Admin specific routes
router.post('/register', protect, authorize('admin'), registerUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;