const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateRegister,
    validateLogin,
    checkValidation
} = require('../utils/validation');

// Public routes
router.post('/register', validateRegister, checkValidation, registerUser);
router.post('/login', validateLogin, checkValidation, loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;