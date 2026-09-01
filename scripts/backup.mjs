import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'crm.sqlite');
const backupDirectory = process.env.BACKUP_DIR || path.join(process.cwd(), 'data', 'backups');
fs.mkdirSync(backupDirectory, { recursive: true });

const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const destination = path.join(backupDirectory, `crm-${timestamp}.sqlite`);
const db = new Database(databasePath, { readonly: true });

await db.backup(destination);
db.close();
console.log(`Backup created: ${destination}`);
