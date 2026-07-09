const db = require('../config/db');

async function createUser({ name, email, passwordHash, role = 'staff' }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function setResetToken(userId, tokenHash, expiresAt) {
  await db.query(
    `UPDATE users SET reset_token_hash = $1, reset_token_expires = $2 WHERE id = $3`,
    [tokenHash, expiresAt, userId]
  );
}

async function findByResetTokenHash(tokenHash) {
  const result = await db.query(
    `SELECT * FROM users
     WHERE reset_token_hash = $1 AND reset_token_expires > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function updatePasswordAndClearReset(userId, passwordHash) {
  await db.query(
    `UPDATE users
     SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  );
}

async function findAll() {
  const result = await db.query(
    `SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC`
  );
  return result.rows;
}

async function updateRole(userId, role) {
  const result = await db.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, name, email, role, created_at`,
    [role, userId]
  );
  return result.rows[0] || null;
}

async function countAdmins() {
  const result = await db.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
  return result.rows[0].count;
}

async function countSuperAdmins() {
  const result = await db.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'super_admin'`);
  return result.rows[0].count;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAll,
  updateRole,
  countAdmins,
  countSuperAdmins,
  setResetToken,
  findByResetTokenHash,
  updatePasswordAndClearReset,
};
