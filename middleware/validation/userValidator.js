const { body, validationResult } = require('express-validator');

const updateRoleRules = [
  body('role').isIn(['admin', 'staff']).withMessage("Role must be 'admin' or 'staff'"),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  }
  next();
}

module.exports = { updateRoleRules, validate };
