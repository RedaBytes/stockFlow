const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../middleware/validators/authValidators');
const userModel = require('../models/userModel');

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;