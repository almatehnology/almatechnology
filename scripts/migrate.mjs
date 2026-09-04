import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { admin, username } from 'better-auth/plugins';

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'crm.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');

const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:7800',
  secret: process.env.BETTER_AUTH_SECRET || 'development-secret-change-me-development-secret',
  emailAndPassword: { enabled: true, autoSignIn: false, minPasswordLength: 8 },
  disabledPaths: ['/sign-up/email', '/is-username-available'],
  plugins: [
    username({ displayUsername: false, immutableUsername: true, minUsernameLength: 3, maxUsernameLength: 30 }),
    admin(),
  ],
});

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`);

const hasMigration = db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?');
const saveMigration = db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)');

function migrate(version, sql) {
  if (hasMigration.get(version)) return;
  const transaction = db.transaction(() => {
    db.exec(sql);
    saveMigration.run(version, new Date().toISOString());
  });
  transaction();
}

migrate('001_crm_core', `
  CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    position TEXT,
    email TEXT,
    phone TEXT,
    messenger TEXT,
    website TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','CONTACTED','QUALIFYING','PROPOSAL_SENT','WAITING_CLIENT','ON_HOLD','WON','LOST')),
    owner_id TEXT NOT NULL REFERENCES user(id),
    created_by_id TEXT NOT NULL REFERENCES user(id),
    general_notes TEXT,
    normalized_email TEXT,
    normalized_phone TEXT,
    last_contact_at TEXT,
    archived_at TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK(length(trim(company_name)) > 0 OR length(trim(contact_name)) > 0)
  );

  CREATE TABLE interactions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES user(id),
    occurred_at TEXT NOT NULL,
    channel TEXT NOT NULL CHECK(channel IN ('CALL','EMAIL','MESSENGER','MEETING','OTHER')),
    direction TEXT NOT NULL CHECK(direction IN ('OUTBOUND','INBOUND')),
    result TEXT NOT NULL,
    sent_items TEXT,
    expected_from_client TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    assignee_id TEXT NOT NULL REFERENCES user(id),
    created_by_id TEXT NOT NULL REFERENCES user(id),
    completed_by_id TEXT REFERENCES user(id),
    type TEXT NOT NULL CHECK(type IN ('CALL','EMAIL','MESSAGE','MEETING','OTHER')),
    title TEXT NOT NULL,
    description TEXT,
    due_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','COMPLETED','CANCELLED')),
    completed_at TEXT,
    completion_result TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE client_transfers (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES user(id),
    to_user_id TEXT NOT NULL REFERENCES user(id),
    transferred_by_id TEXT NOT NULL REFERENCES user(id),
    reason TEXT,
    handoff_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX clients_owner_status_idx ON clients(owner_id, status, updated_at DESC);
  CREATE INDEX clients_email_idx ON clients(normalized_email);
  CREATE INDEX clients_phone_idx ON clients(normalized_phone);
  CREATE INDEX interactions_client_date_idx ON interactions(client_id, occurred_at DESC);
  CREATE INDEX tasks_assignee_status_due_idx ON tasks(assignee_id, status, due_at);
  CREATE INDEX tasks_client_status_due_idx ON tasks(client_id, status, due_at);
  CREATE INDEX transfers_client_date_idx ON client_transfers(client_id, created_at DESC);
`);

migrate('002_lead_research_fields', `
  ALTER TABLE clients ADD COLUMN country TEXT;
  ALTER TABLE clients ADD COLUMN city TEXT;
  ALTER TABLE clients ADD COLUMN industry TEXT;
  ALTER TABLE clients ADD COLUMN observed_problem TEXT;
  ALTER TABLE clients ADD COLUMN suggested_service TEXT;
  ALTER TABLE clients ADD COLUMN estimated_value REAL;
  ALTER TABLE clients ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
  CREATE INDEX clients_industry_idx ON clients(industry);
`);

migrate('003_deal_amount', `
  ALTER TABLE clients ADD COLUMN deal_amount REAL;
`);

migrate('004_sales_factory', `
  CREATE TABLE user_sales_roles (
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    sales_role TEXT NOT NULL CHECK(sales_role IN ('RESEARCHER','VERIFIER','SDR','CLOSER')),
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, sales_role)
  );

  CREATE TABLE lead_reviews (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    review_type TEXT NOT NULL CHECK(review_type IN ('VERIFIER_REVIEW','SDR_VALIDATION','CLOSER_QUALIFICATION')),
    result TEXT NOT NULL CHECK(result IN ('VALID','INVALID')),
    reason TEXT,
    reviewed_by_id TEXT NOT NULL REFERENCES user(id),
    subject_user_id TEXT REFERENCES user(id),
    created_at TEXT NOT NULL,
    UNIQUE(client_id, review_type)
  );

  CREATE TABLE pipeline_events (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    changed_by_id TEXT NOT NULL REFERENCES user(id),
    reason TEXT,
    created_at TEXT NOT NULL
  );

  ALTER TABLE clients ADD COLUMN pipeline_stage TEXT NOT NULL DEFAULT 'RAW';
  ALTER TABLE clients ADD COLUMN researcher_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN verifier_owner_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN verified_by_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN verified_at TEXT;
  ALTER TABLE clients ADD COLUMN sdr_owner_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN sdr_validated_by_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN sdr_validated_at TEXT;
  ALTER TABLE clients ADD COLUMN first_contacted_by_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN first_contact_at TEXT;
  ALTER TABLE clients ADD COLUMN first_reply_at TEXT;
  ALTER TABLE clients ADD COLUMN interested_at TEXT;
  ALTER TABLE clients ADD COLUMN qualified_at TEXT;
  ALTER TABLE clients ADD COLUMN closer_owner_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN qualification_reviewed_by_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN qualification_reviewed_at TEXT;
  ALTER TABLE clients ADD COLUMN discovery_at TEXT;
  ALTER TABLE clients ADD COLUMN offer_sent_at TEXT;
  ALTER TABLE clients ADD COLUMN negotiation_at TEXT;
  ALTER TABLE clients ADD COLUMN payment_pending_at TEXT;
  ALTER TABLE clients ADD COLUMN closed_by_id TEXT REFERENCES user(id);
  ALTER TABLE clients ADD COLUMN won_at TEXT;
  ALTER TABLE clients ADD COLUMN lost_at TEXT;
  ALTER TABLE clients ADD COLUMN lost_reason TEXT;
  ALTER TABLE clients ADD COLUMN final_price REAL;
  ALTER TABLE clients ADD COLUMN cash_received REAL NOT NULL DEFAULT 0;
  ALTER TABLE clients ADD COLUMN payment_received_at TEXT;
  ALTER TABLE clients ADD COLUMN technical_estimate_needed INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE clients ADD COLUMN researcher_commission_rate REAL NOT NULL DEFAULT 3;
  ALTER TABLE clients ADD COLUMN verifier_commission_rate REAL NOT NULL DEFAULT 2;
  ALTER TABLE clients ADD COLUMN sdr_commission_rate REAL NOT NULL DEFAULT 5;
  ALTER TABLE clients ADD COLUMN closer_commission_rate REAL NOT NULL DEFAULT 10;

  UPDATE clients SET
    researcher_id = created_by_id,
    final_price = deal_amount,
    cash_received = CASE WHEN status = 'WON' THEN COALESCE(deal_amount, 0) ELSE 0 END,
    payment_received_at = CASE WHEN status = 'WON' THEN updated_at ELSE NULL END,
    won_at = CASE WHEN status = 'WON' THEN updated_at ELSE NULL END,
    lost_at = CASE WHEN status = 'LOST' THEN updated_at ELSE NULL END,
    first_contact_at = last_contact_at,
    pipeline_stage = CASE status
      WHEN 'NEW' THEN 'RAW'
      WHEN 'CONTACTED' THEN 'CONTACTED'
      WHEN 'QUALIFYING' THEN 'QUALIFIED'
      WHEN 'PROPOSAL_SENT' THEN 'OFFER'
      WHEN 'WAITING_CLIENT' THEN 'PAYMENT_PENDING'
      WHEN 'ON_HOLD' THEN 'NEGOTIATION'
      WHEN 'WON' THEN 'WON'
      WHEN 'LOST' THEN 'LOST'
      ELSE 'RAW'
    END;

  INSERT OR IGNORE INTO user_sales_roles (user_id, sales_role, created_at)
    SELECT id, 'RESEARCHER', datetime('now') FROM user;
  INSERT OR IGNORE INTO user_sales_roles (user_id, sales_role, created_at)
    SELECT id, 'VERIFIER', datetime('now') FROM user;
  INSERT OR IGNORE INTO user_sales_roles (user_id, sales_role, created_at)
    SELECT id, 'SDR', datetime('now') FROM user;
  INSERT OR IGNORE INTO user_sales_roles (user_id, sales_role, created_at)
    SELECT id, 'CLOSER', datetime('now') FROM user;

  CREATE INDEX user_sales_roles_role_idx ON user_sales_roles(sales_role, user_id);
  CREATE INDEX lead_reviews_type_date_idx ON lead_reviews(review_type, created_at);
  CREATE INDEX lead_reviews_subject_idx ON lead_reviews(subject_user_id, review_type, result);
  CREATE INDEX pipeline_events_client_date_idx ON pipeline_events(client_id, created_at);
  CREATE INDEX clients_pipeline_stage_idx ON clients(pipeline_stage, updated_at DESC);
  CREATE INDEX clients_researcher_idx ON clients(researcher_id, created_at);
  CREATE INDEX clients_verifier_idx ON clients(verifier_owner_id, verified_at);
  CREATE INDEX clients_sdr_idx ON clients(sdr_owner_id, first_contact_at);
  CREATE INDEX clients_closer_idx ON clients(closer_owner_id, qualified_at);
`);

migrate('005_sales_context_and_ownership', `
  ALTER TABLE clients ADD COLUMN ownership_expires_at TEXT;
  ALTER TABLE clients ADD COLUMN decision_maker TEXT;
  ALTER TABLE clients ADD COLUMN budget_notes TEXT;
  ALTER TABLE clients ADD COLUMN desired_timeline TEXT;
  ALTER TABLE clients ADD COLUMN discovery_notes TEXT;
  ALTER TABLE clients ADD COLUMN service_package TEXT;
  UPDATE clients SET ownership_expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', created_at, '+90 days') WHERE ownership_expires_at IS NULL;
  CREATE INDEX clients_ownership_expiry_idx ON clients(ownership_expires_at, pipeline_stage);
`);

migrate('006_normalize_ownership_time', `
  UPDATE clients
  SET ownership_expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', ownership_expires_at)
  WHERE ownership_expires_at IS NOT NULL;
`);

migrate('007_commission_split_50', `
  UPDATE clients SET researcher_commission_rate = 7.5, verifier_commission_rate = 7.5,
    sdr_commission_rate = 17.5, closer_commission_rate = 17.5;
`);

migrate('008_client_source_structure', `
  ALTER TABLE clients ADD COLUMN source_category TEXT;
  ALTER TABLE clients ADD COLUMN source_platform TEXT;
  ALTER TABLE clients ADD COLUMN source_detail TEXT;
  ALTER TABLE clients ADD COLUMN source_url TEXT;

  CREATE INDEX IF NOT EXISTS clients_source_category_idx ON clients(source_category);
  CREATE INDEX IF NOT EXISTS clients_source_platform_idx ON clients(source_platform);

  UPDATE clients SET source_platform = source WHERE source_platform IS NULL AND source IS NOT NULL;
`);

migrate('009_ensure_commission_and_pipeline', `
  UPDATE clients SET
    researcher_commission_rate = 7.5,
    verifier_commission_rate = 7.5,
    sdr_commission_rate = 17.5,
    closer_commission_rate = 17.5
  WHERE researcher_commission_rate != 7.5 OR verifier_commission_rate != 7.5 OR sdr_commission_rate != 17.5 OR closer_commission_rate != 17.5;
`);

console.log(`Database is ready: ${databasePath}`);
db.close();

