const db = require('../config/db');

async function storeToken({ userId, tokenHash, expiresAt }) {
  const result = await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findValidToken(tokenHash) {
  const result = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revokeToken(tokenHash) {
  await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
}

async function revokeAllForUser(userId) {
  await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
}

module.exports = {
  storeToken,
  findValidToken,
  revokeToken,
  revokeAllForUser,
};
