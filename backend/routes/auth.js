const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Authenticate manager & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/profile
// @desc    Get manager profile
// @access  Private
router.get('/profile', authController.getProfile);

module.exports = router;