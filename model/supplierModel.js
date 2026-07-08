const db = require('../config/db');

async function findAll() {
  const result = await db.query('SELECT * FROM suppliers ORDER BY id');
  return result.rows;
}

async function findById(id) {
  const result = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create({ name, email, phone }) {
  const result = await db.query(
    `INSERT INTO suppliers (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
    [name, email || null, phone || null]
  );
  return result.rows[0];
}

async function update(id, { name, email, phone }) {
  const result = await db.query(
    `UPDATE suppliers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *`,
    [name, email || null, phone || null, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

async function count() {
  const result = await db.query('SELECT COUNT(*)::int AS count FROM suppliers');
  return result.rows[0].count;
}

module.exports = { findAll, findById, create, update, remove, count };
