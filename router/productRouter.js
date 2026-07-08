const express = require('express');
const router = express.Router();

const productController = require('../controller/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { productRules } = require('../middleware/validation/productValidator');
const { validate } = require('../middleware/validation/authValidator');

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', authorize('admin'), productRules, validate, productController.create);
router.put('/:id', authorize('admin'), productRules, validate, productController.update);
router.delete('/:id', authorize('admin'), productController.remove);

module.exports = router;
