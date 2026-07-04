
const db = require('../config/db');

async function createUser({ name, email, passwordHash, role = 'staff', warehouseId = null }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role, warehouse_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, warehouse_id, is_active, created_at`,
    [name, email, passwordHash, role, warehouseId]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `SELECT id, name, email, role, warehouse_id, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
};
