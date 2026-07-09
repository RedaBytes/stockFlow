

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 12;

const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || process.env.ADMIN_NAME || 'Super Admin';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@stockflow.local';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

async function seedSuperAdmin() {
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, SALT_ROUNDS);


  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'super_admin')
     ON CONFLICT (email)
     DO UPDATE SET role = 'super_admin', password_hash = EXCLUDED.password_hash
     RETURNING id, name, email, role, created_at`,
    [SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, passwordHash]
  );

  const user = result.rows[0];
  console.log('Super admin user ready:');
  console.log(`  id:    ${user.id}`);
  console.log(`  name:  ${user.name}`);
  console.log(`  email: ${user.email}`);
  console.log(`  role:  ${user.role}`);
  console.log('');
  console.log(`super admin email "${SUPER_ADMIN_EMAIL}" and the password you set (default: "ChangeMe123" if you did not override SUPER_ADMIN_PASSWORD).`);
}

seedSuperAdmin()
  .catch((err) => {
    console.error('Failed to seed super admin user:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    db.pool.end();
  });
