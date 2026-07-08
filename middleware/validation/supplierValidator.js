const { body } = require('express-validator');

const supplierRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 150 }).withMessage('Name too long'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Must be a valid email'),
  body('phone').optional({ nullable: true, checkFalsy: true }).isLength({ max: 30 }).withMessage('Phone too long'),
];

module.exports = { supplierRules };
