import 'server-only';

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'crm.sqlite');

function createDatabase() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');
  database.pragma('synchronous = NORMAL');
  return database;
}

const globalForDatabase = globalThis as unknown as {
  almaDatabase?: Database.Database;
};

export const db = globalForDatabase.almaDatabase ?? createDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForDatabase.almaDatabase = db;
}

export const appTimeZone = process.env.APP_TIMEZONE || 'America/Argentina/Mendoza';

export function nowIso() {
  return new Date().toISOString();
}
