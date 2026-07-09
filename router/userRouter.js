const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { updateRoleRules, validate } = require('../middleware/validation/userValidator');

router.use(authenticate);

router.get('/', authorize('admin'), userController.getAll);

router.patch('/:id/role', authorize('super_admin'), updateRoleRules, validate, userController.updateRole);

module.exports = router;
