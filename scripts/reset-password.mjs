import path from 'node:path';
import Database from 'better-sqlite3';
import { hashPassword } from 'better-auth/crypto';

const targetUsername = process.argv[2] || 'admin';
const newPassword = process.argv[3];

if (!newPassword) {
  console.error('Usage: node scripts/reset-password.mjs <username> <new-password>');
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error('Password must be at least 8 characters long.');
  process.exit(1);
}

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'crm.sqlite');
const db = new Database(databasePath);
db.pragma('foreign_keys = ON');

const user = db.prepare('SELECT id, name, username, email FROM "user" WHERE username = ? OR email = ?').get(targetUsername, targetUsername);
if (!user) {
  console.error(`User "${targetUsername}" not found.`);
  process.exit(1);
}

const hashedPassword = await hashPassword(newPassword);

const account = db.prepare('SELECT id FROM account WHERE userId = ? AND providerId = ?').get(user.id, 'credential');
if (account) {
  db.prepare('UPDATE account SET password = ?, updatedAt = ? WHERE id = ?').run(
    hashedPassword,
    new Date().toISOString(),
    account.id
  );
  console.log(`Password updated successfully for user "${user.username}" (${user.email}).`);
} else {
  const accountId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO account (id, issuer, accountId, providerId, userId, password, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    accountId,
    'local',
    user.id,
    'credential',
    user.id,
    hashedPassword,
    new Date().toISOString(),
    new Date().toISOString()
  );
  console.log(`Credential account created and password set for user "${user.username}".`);
}

db.close();
