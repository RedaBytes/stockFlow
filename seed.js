

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 12;

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stockflow.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123';

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);


  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash
     RETURNING id, name, email, role, created_at`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
  );

  const user = result.rows[0];
  console.log('Admin user ready:');
  console.log(`  id:    ${user.id}`);
  console.log(`  name:  ${user.name}`);
  console.log(`  email: ${user.email}`);
  console.log(`  role:  ${user.role}`);
  console.log('');
  console.log(`Log in with email "${ADMIN_EMAIL}" and the password you set (default: "ChangeMe123" if you did not override ADMIN_PASSWORD).`);
}

seedAdmin()
  .catch((err) => {
    console.error('Failed to seed admin user:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    db.pool.end();
  });
