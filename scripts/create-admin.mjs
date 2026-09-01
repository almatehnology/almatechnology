import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { betterAuth } from 'better-auth';
import { admin, username } from 'better-auth/plugins';

const required = ['ADMIN_NAME', 'ADMIN_LOGIN', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} must be provided to create the first administrator.`);
}

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'crm.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('foreign_keys = ON');

const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:7800',
  secret: process.env.BETTER_AUTH_SECRET || 'development-secret-change-me-development-secret',
  emailAndPassword: { enabled: true, autoSignIn: false, minPasswordLength: 8 },
  disabledPaths: ['/sign-up/email', '/is-username-available'],
  plugins: [username({ displayUsername: false, immutableUsername: true }), admin()],
});

const userCount = db.prepare('SELECT COUNT(*) AS count FROM "user"').get().count;
if (userCount > 0) throw new Error('The database already has users. Create further accounts through CRM → Team.');

const result = await auth.api.createUser({
  body: {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
    data: { username: process.env.ADMIN_LOGIN },
  },
});

if (!result?.user) throw new Error('Administrator was not created.');
const insertRole = db.prepare('INSERT OR IGNORE INTO user_sales_roles (user_id, sales_role, created_at) VALUES (?, ?, ?)');
for (const role of ['RESEARCHER', 'VERIFIER', 'SDR', 'CLOSER']) {
  insertRole.run(result.user.id, role, new Date().toISOString());
}
console.log(`Administrator created: ${result.user.name}`);
db.close();
