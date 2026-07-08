const express = require('express');
const router = express.Router();

const supplierController = require('../controller/supplierController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { supplierRules } = require('../middleware/validation/supplierValidator');
const { validate } = require('../middleware/validation/authValidator');

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getOne);
router.post('/', authorize('admin'), supplierRules, validate, supplierController.create);
router.put('/:id', authorize('admin'), supplierRules, validate, supplierController.update);
router.delete('/:id', authorize('admin'), supplierController.remove);

module.exports = router;
