const userModel = require('../model/userModel');

async function getAll(req, res, next) {
  try {
    const users = await userModel.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const { role } = req.body;

    const existing = await userModel.findById(targetId);
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    if (req.user.id === targetId) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    if (existing.role === 'super_admin') {
      const superAdminCount = await userModel.countSuperAdmins();
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'At least one super admin must remain' });
      }
    }

    const user = await userModel.updateRole(targetId, role);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, updateRole };
