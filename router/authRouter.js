const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  validate,
} = require('../middleware/validation/authValidator');

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
