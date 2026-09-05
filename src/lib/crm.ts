import 'server-only';

import crypto from 'node:crypto';
import { appTimeZone, db, nowIso } from '@/lib/db';
import { hasSalesRole, type CurrentUser } from '@/lib/session';
import { CLIENT_STATUSES, INTERACTION_CHANNELS, SALES_ROLES, TASK_TYPES, SOURCE_CATEGORIES, type ClientStatus, type InteractionChannel, type InteractionDirection, type SalesRole, type TaskType, type SourceCategory } from '@/lib/crm-types';
import { sourceCategoryLabels } from '@/lib/crm-format';

export { CLIENT_STATUSES, INTERACTION_CHANNELS, SALES_ROLES, TASK_TYPES, SOURCE_CATEGORIES, SOURCE_CATEGORY_PLATFORMS } from '@/lib/crm-types';
export type { ClientStatus, InteractionChannel, InteractionDirection, SalesRole, TaskType, SourceCategory } from '@/lib/crm-types';

export type ClientInput = {
  companyName: string;
  contactName: string;
  position?: string;
  email?: string;
  phone?: string;
  messenger?: string;
  website?: string;
  source?: string;
  sourceCategory?: SourceCategory;
  sourcePlatform?: string;
  sourceDetail?: string;
  sourceUrl?: string;
  country?: string;
  city?: string;
  industry?: string;
  observedProblem?: string;
  suggestedService?: string;
  estimatedValue?: number;
  finalPrice?: number | null;
  cashReceived?: number | null;
  currency?: string;
  generalNotes?: string;
  ownerId?: string;
  verifierOwnerId?: string;
};

export type WorkflowInput = {
  clientId: string;
  action:
    | 'RESEARCHER_SUBMIT'
    | 'VERIFIER_APPROVE' | 'VERIFIER_REJECT'
    | 'SDR_ACCEPT' | 'SDR_REJECT' | 'SDR_REPLIED' | 'SDR_INTERESTED' | 'SDR_QUALIFY'
    | 'CLOSER_ACCEPT' | 'CLOSER_REJECT' | 'CLOSER_OFFER' | 'CLOSER_NEGOTIATION'
    | 'CLOSER_PAYMENT_PENDING' | 'CLOSER_WON' | 'CLOSER_LOST' | 'UPDATE_PAYMENT';
  reason?: string;
  nextOwnerId?: string;
  proposedSolution?: string;
  finalPrice?: number;
  cashReceived?: number;
  currency?: string;
  technicalEstimateNeeded?: boolean;
  decisionMaker?: string;
  budgetNotes?: string;
  desiredTimeline?: string;
  discoveryNotes?: string;
  servicePackage?: string;
};

export type TaskInput = {
  clientId: string;
  assigneeId: string;
  type: TaskType;
  title: string;
  description?: string;
  dueAt: string;
};

export type InteractionInput = {
  clientId: string;
  occurredAt: string;
  channel: InteractionChannel;
  direction: InteractionDirection;
  result: string;
  sentItems?: string;
  expectedFromClient?: string;
  notes?: string;
  nextTask?: Omit<TaskInput, 'clientId'>;
};

export type ClientFilters = {
  scope?: 'mine' | 'all' | 'pool' | 'archived';
  status?: string;
  ownerId?: string;
  search?: string;
  attention?: 'overdue' | 'no_next_task';
  sourceCategory?: string;
  sourcePlatform?: string;
};

export type ClientRow = {
  id: string;
  companyName: string;
  contactName: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  messenger: string | null;
  website: string | null;
  source: string | null;
  sourceCategory: SourceCategory | null;
  sourcePlatform: string | null;
  sourceDetail: string | null;
  sourceUrl: string | null;
  country: string | null;
  city: string | null;
  industry: string | null;
  observedProblem: string | null;
  suggestedService: string | null;
  estimatedValue: number | null;
  currency: string;
  status: ClientStatus;
  ownerId: string;
  ownerName: string;
  generalNotes: string | null;
  lastContactAt: string | null;
  nextTaskAt: string | null;
  nextTaskTitle: string | null;
  archivedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  researcherId: string;
  researcherName: string;
  verifierOwnerId: string | null;
  verifierOwnerName: string | null;
  verifiedById: string | null;
  verifiedByName: string | null;
  verifiedAt: string | null;
  sdrOwnerId: string | null;
  sdrOwnerName: string | null;
  sdrValidatedAt: string | null;
  firstContactedByName: string | null;
  firstContactAt: string | null;
  firstReplyAt: string | null;
  interestedAt: string | null;
  qualifiedAt: string | null;
  closerOwnerId: string | null;
  closerOwnerName: string | null;
  qualificationReviewedAt: string | null;
  discoveryAt: string | null;
  offerSentAt: string | null;
  negotiationAt: string | null;
  paymentPendingAt: string | null;
  closedByName: string | null;
  wonAt: string | null;
  lostAt: string | null;
  lostReason: string | null;
  finalPrice: number | null;
  cashReceived: number;
  paymentReceivedAt: string | null;
  technicalEstimateNeeded: boolean;
  ownershipExpiresAt: string | null;
  ownershipExpired: boolean;
  decisionMaker: string | null;
  budgetNotes: string | null;
  desiredTimeline: string | null;
  discoveryNotes: string | null;
  servicePackage: string | null;
  researcherCommissionRate: number;
  verifierCommissionRate: number;
  sdrCommissionRate: number;
  closerCommissionRate: number;
  canEdit: boolean;
};

type DbClientRow = Omit<ClientRow, 'canEdit'>;

export type TaskRow = {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  phone: string | null;
  messenger: string | null;
  expectedFromClient: string | null;
  assigneeId: string;
  assigneeName: string;
  ownerId: string;
  ownerName: string;
  type: TaskType;
  title: string;
  description: string | null;
  dueAt: string;
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED';
  completedAt: string | null;
  completionResult: string | null;
};

export type InteractionRow = {
  id: string;
  occurredAt: string;
  channel: InteractionChannel;
  direction: InteractionDirection;
  result: string;
  sentItems: string | null;
  expectedFromClient: string | null;
  notes: string | null;
  authorName: string;
};

export type TransferRow = {
  id: string;
  reason: string | null;
  createdAt: string;
  fromName: string;
  toName: string;
  transferredByName: string;
};

export type ReviewRow = {
  id: string;
  reviewType: 'VERIFIER_REVIEW' | 'SDR_VALIDATION' | 'CLOSER_QUALIFICATION';
  result: 'VALID' | 'INVALID';
  reason: string | null;
  reviewerName: string;
  subjectName: string | null;
  createdAt: string;
};

export type PipelineEventRow = {
  id: string;
  fromStage: string | null;
  toStage: string;
  reason: string | null;
  actorName: string;
  createdAt: string;
};

const clientProjection = `
  c.id AS id,
  c.company_name AS companyName,
  c.contact_name AS contactName,
  c.position AS position,
  c.email AS email,
  c.phone AS phone,
  c.messenger AS messenger,
  c.website AS website,
  c.source AS source,
  c.source_category AS sourceCategory,
  c.source_platform AS sourcePlatform,
  c.source_detail AS sourceDetail,
  c.source_url AS sourceUrl,
  c.country AS country,
  c.city AS city,
  c.industry AS industry,
  c.observed_problem AS observedProblem,
  c.suggested_service AS suggestedService,
  c.estimated_value AS estimatedValue,
  c.currency AS currency,
  c.pipeline_stage AS status,
  c.owner_id AS ownerId,
  owner.name AS ownerName,
  c.general_notes AS generalNotes,
  c.last_contact_at AS lastContactAt,
  c.archived_at AS archivedAt,
  c.version AS version,
  c.created_at AS createdAt,
  c.updated_at AS updatedAt,
  c.researcher_id AS researcherId,
  researcher.name AS researcherName,
  c.verifier_owner_id AS verifierOwnerId,
  verifierOwner.name AS verifierOwnerName,
  c.verified_by_id AS verifiedById,
  verifiedBy.name AS verifiedByName,
  c.verified_at AS verifiedAt,
  c.sdr_owner_id AS sdrOwnerId,
  sdrOwner.name AS sdrOwnerName,
  c.sdr_validated_at AS sdrValidatedAt,
  firstContacted.name AS firstContactedByName,
  c.first_contact_at AS firstContactAt,
  c.first_reply_at AS firstReplyAt,
  c.interested_at AS interestedAt,
  c.qualified_at AS qualifiedAt,
  c.closer_owner_id AS closerOwnerId,
  closerOwner.name AS closerOwnerName,
  c.qualification_reviewed_at AS qualificationReviewedAt,
  c.discovery_at AS discoveryAt,
  c.offer_sent_at AS offerSentAt,
  c.negotiation_at AS negotiationAt,
  c.payment_pending_at AS paymentPendingAt,
  closedBy.name AS closedByName,
  c.won_at AS wonAt,
  c.lost_at AS lostAt,
  c.lost_reason AS lostReason,
  c.final_price AS finalPrice,
  c.cash_received AS cashReceived,
  c.payment_received_at AS paymentReceivedAt,
  c.technical_estimate_needed AS technicalEstimateNeeded,
  c.ownership_expires_at AS ownershipExpiresAt,
  (c.ownership_expires_at IS NOT NULL AND julianday(c.ownership_expires_at) < julianday('now')) AS ownershipExpired,
  c.decision_maker AS decisionMaker,
  c.budget_notes AS budgetNotes,
  c.desired_timeline AS desiredTimeline,
  c.discovery_notes AS discoveryNotes,
  c.service_package AS servicePackage,
  c.researcher_commission_rate AS researcherCommissionRate,
  c.verifier_commission_rate AS verifierCommissionRate,
  c.sdr_commission_rate AS sdrCommissionRate,
  c.closer_commission_rate AS closerCommissionRate,
  (
    SELECT t.due_at FROM tasks t
    WHERE t.client_id = c.id AND t.status = 'OPEN'
    ORDER BY t.due_at ASC
    LIMIT 1
  ) AS nextTaskAt,
  (
    SELECT t.title FROM tasks t
    WHERE t.client_id = c.id AND t.status = 'OPEN'
    ORDER BY t.due_at ASC
    LIMIT 1
  ) AS nextTaskTitle
`;

const clientJoins = `
  JOIN "user" owner ON owner.id = c.owner_id
  JOIN "user" researcher ON researcher.id = c.researcher_id
  LEFT JOIN "user" verifierOwner ON verifierOwner.id = c.verifier_owner_id
  LEFT JOIN "user" verifiedBy ON verifiedBy.id = c.verified_by_id
  LEFT JOIN "user" sdrOwner ON sdrOwner.id = c.sdr_owner_id
  LEFT JOIN "user" firstContacted ON firstContacted.id = c.first_contacted_by_id
  LEFT JOIN "user" closerOwner ON closerOwner.id = c.closer_owner_id
  LEFT JOIN "user" closedBy ON closedBy.id = c.closed_by_id
`;

export function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || null;
}

export function normalizePhone(value?: string) {
  const normalized = value?.replaceAll(/\D/g, '') || '';
  return normalized || null;
}

export function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function text(value?: string | null) {
  return value?.trim() || null;
}

function formatSourceText(input: ClientInput) {
  const category = input.sourceCategory && SOURCE_CATEGORIES.includes(input.sourceCategory) ? input.sourceCategory : null;
  const platform = input.sourcePlatform?.trim() || null;
  const detail = input.sourceDetail?.trim() || null;
  if (input.source?.trim()) return input.source.trim();
  if (!category && !platform) return null;
  const label = category ? sourceCategoryLabels[category] : null;
  const parts: string[] = [];
  if (label) parts.push(`[${label}]`);
  if (platform) parts.push(platform);
  if (detail) parts.push(`(${detail})`);
  return parts.join(' ');
}

function isEditor(client: Pick<ClientRow, 'ownerId'>, user: CurrentUser) {
  return user.role === 'admin' || client.ownerId === user.id;
}

function ensureValidClient(input: ClientInput) {
  if (!input.companyName.trim() && !input.contactName.trim() && !input.sourceUrl?.trim() && !input.suggestedService?.trim()) {
    throw new Error('Укажите компанию, контактное лицо, ссылку на источник или предлагаемую услугу.');
  }
}

function ensureValidTask(input: TaskInput | Omit<TaskInput, 'clientId'>) {
  if (!input.title.trim()) throw new Error('Укажите действие по задаче.');
  if (!TASK_TYPES.includes(input.type)) throw new Error('Некорректный тип задачи.');
  if (Number.isNaN(new Date(input.dueAt).getTime())) throw new Error('Укажите корректную дату задачи.');
}

function ensureActiveUser(userId: string) {
  const user = db.prepare('SELECT id, banned FROM "user" WHERE id = ?').get(userId) as
    | { id: string; banned: number | null }
    | undefined;
  if (!user || user.banned) throw new Error('Выбранный сотрудник недоступен.');
}

function ensureUserHasRole(userId: string, role: SalesRole) {
  ensureActiveUser(userId);
  const user = db.prepare('SELECT role FROM "user" WHERE id = ?').get(userId) as { role: string | null } | undefined;
  if (user?.role === 'admin') return;
  const found = db.prepare('SELECT 1 FROM user_sales_roles WHERE user_id = ? AND sales_role = ?').get(userId, role);
  if (!found) throw new Error(`У выбранного сотрудника нет роли ${role}.`);
}

export type TeamUserRow = { id: string; name: string; email: string; username: string | null; role: string | null; banned: number | null; salesRoles: SalesRole[] };

function withSalesRoles<T extends { id: string }>(users: T[]): Array<T & { salesRoles: SalesRole[] }> {
  const rows = db.prepare('SELECT user_id AS userId, sales_role AS salesRole FROM user_sales_roles').all() as Array<{ userId: string; salesRole: SalesRole }>;
  const byUser = new Map<string, SalesRole[]>();
  for (const row of rows) byUser.set(row.userId, [...(byUser.get(row.userId) || []), row.salesRole]);
  return users.map((user) => ({ ...user, salesRoles: byUser.get(user.id) || [] }));
}

export function listActiveUsers(): TeamUserRow[] {
  const users = db.prepare(`SELECT id, name, email, username, role, banned FROM "user" WHERE COALESCE(banned, 0) = 0 ORDER BY name COLLATE NOCASE`).all() as unknown as Array<Omit<TeamUserRow, 'salesRoles'>>;
  return withSalesRoles(users);
}

export function listUsersForAdmin() {
  const users = db.prepare(`SELECT id, name, email, username, role, banned, createdAt FROM "user" ORDER BY name COLLATE NOCASE`).all() as unknown as Array<{ id: string; name: string; email: string; username: string | null; role: string | null; banned: number | null; createdAt: string }>;
  return withSalesRoles(users);
}

export function listClients(user: CurrentUser, filters: ClientFilters = {}): ClientRow[] {
  const scope = filters.scope || 'mine';
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (scope === 'archived') {
    if (user.role !== 'admin') return [];
    conditions.push('c.archived_at IS NOT NULL');
  } else {
    conditions.push('c.archived_at IS NULL');
    if (scope === 'mine') {
      conditions.push('c.owner_id = ?');
      params.push(user.id);
    } else if (scope === 'pool') {
      conditions.push(`julianday(c.ownership_expires_at) < julianday(?) AND c.pipeline_stage NOT IN ('WON', 'LOST', 'VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED')`);
      params.push(nowIso());
    }
  }

  if (filters.status && CLIENT_STATUSES.includes(filters.status as ClientStatus)) {
    conditions.push('c.pipeline_stage = ?');
    params.push(filters.status);
  }

  if (filters.ownerId && (user.role === 'admin' || scope === 'all')) {
    conditions.push('c.owner_id = ?');
    params.push(filters.ownerId);
  }

  if (filters.sourceCategory && SOURCE_CATEGORIES.includes(filters.sourceCategory as SourceCategory)) {
    conditions.push('c.source_category = ?');
    params.push(filters.sourceCategory);
  }

  if (filters.sourcePlatform?.trim()) {
    conditions.push('lower(c.source_platform) = lower(?)');
    params.push(filters.sourcePlatform.trim());
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim().toLowerCase()}%`;
    conditions.push(`(
      lower(c.company_name) LIKE ? OR lower(c.contact_name) LIKE ? OR
      lower(COALESCE(c.email, '')) LIKE ? OR lower(COALESCE(c.phone, '')) LIKE ? OR
      lower(COALESCE(c.website, '')) LIKE ? OR lower(COALESCE(c.source_platform, '')) LIKE ? OR
      lower(COALESCE(c.source_detail, '')) LIKE ?
    )`);
    params.push(term, term, term, term, term, term, term);
  }

  if (filters.attention === 'overdue') {
    conditions.push(`EXISTS (SELECT 1 FROM tasks t WHERE t.client_id = c.id AND t.status = 'OPEN' AND t.due_at < ?)`);
    params.push(nowIso());
  }
  if (filters.attention === 'no_next_task') {
    conditions.push(`c.pipeline_stage NOT IN ('WON', 'LOST', 'VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED') AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.client_id = c.id AND t.status = 'OPEN')`);
  }

  const rows = db
    .prepare(`
      SELECT ${clientProjection}
      FROM clients c
      ${clientJoins}
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE WHEN EXISTS (SELECT 1 FROM tasks t WHERE t.client_id = c.id AND t.status = 'OPEN' AND t.due_at < ?) THEN 0 ELSE 1 END,
        nextTaskAt IS NULL,
        nextTaskAt ASC,
        c.updated_at DESC
    `)
    .all(...params, nowIso()) as DbClientRow[];

  return rows.map((row) => ({ ...row, canEdit: isEditor(row, user) }));
}

export function getClient(user: CurrentUser, clientId: string): ClientRow | null {
  const row = db
    .prepare(`SELECT ${clientProjection} FROM clients c ${clientJoins} WHERE c.id = ?`)
    .get(clientId) as DbClientRow | undefined;
  if (!row || (row.archivedAt && user.role !== 'admin')) return null;
  return { ...row, canEdit: isEditor(row, user) };
}

export function getClientDetails(user: CurrentUser, clientId: string) {
  const client = getClient(user, clientId);
  if (!client) return null;

  const interactions = db
    .prepare(`
      SELECT i.id, i.occurred_at AS occurredAt, i.channel, i.direction, i.result, i.sent_items AS sentItems,
             i.expected_from_client AS expectedFromClient, i.notes, author.name AS authorName
      FROM interactions i JOIN "user" author ON author.id = i.author_id
      WHERE i.client_id = ? ORDER BY i.occurred_at DESC, i.created_at DESC
    `)
    .all(clientId) as InteractionRow[];

  const tasks = db
    .prepare(`
      SELECT t.id, t.client_id AS clientId, c.contact_name AS clientName, c.company_name AS companyName, c.phone AS phone, c.messenger AS messenger,
             (SELECT i.expected_from_client FROM interactions i WHERE i.client_id = c.id AND i.expected_from_client IS NOT NULL ORDER BY i.occurred_at DESC LIMIT 1) AS expectedFromClient,
             t.assignee_id AS assigneeId, assignee.name AS assigneeName, c.owner_id AS ownerId, owner.name AS ownerName,
             t.type, t.title, t.description, t.due_at AS dueAt, t.status, t.completed_at AS completedAt,
             t.completion_result AS completionResult
      FROM tasks t
      JOIN clients c ON c.id = t.client_id
      JOIN "user" assignee ON assignee.id = t.assignee_id
      JOIN "user" owner ON owner.id = c.owner_id
      WHERE t.client_id = ? ORDER BY CASE WHEN t.status = 'OPEN' THEN 0 ELSE 1 END, t.due_at ASC
    `)
    .all(clientId) as TaskRow[];

  const transfers = db
    .prepare(`
      SELECT tr.id, tr.reason, tr.created_at AS createdAt, fromUser.name AS fromName, toUser.name AS toName, actor.name AS transferredByName
      FROM client_transfers tr
      JOIN "user" fromUser ON fromUser.id = tr.from_user_id
      JOIN "user" toUser ON toUser.id = tr.to_user_id
      JOIN "user" actor ON actor.id = tr.transferred_by_id
      WHERE tr.client_id = ? ORDER BY tr.created_at DESC
    `)
    .all(clientId) as TransferRow[];

  const reviews = db.prepare(`
    SELECT r.id, r.review_type AS reviewType, r.result, r.reason, reviewer.name AS reviewerName,
           subject.name AS subjectName, r.created_at AS createdAt
    FROM lead_reviews r
    JOIN "user" reviewer ON reviewer.id = r.reviewed_by_id
    LEFT JOIN "user" subject ON subject.id = r.subject_user_id
    WHERE r.client_id = ? ORDER BY r.created_at DESC
  `).all(clientId) as ReviewRow[];

  const pipelineEvents = db.prepare(`
    SELECT e.id, e.from_stage AS fromStage, e.to_stage AS toStage, e.reason,
           actor.name AS actorName, e.created_at AS createdAt
    FROM pipeline_events e JOIN "user" actor ON actor.id = e.changed_by_id
    WHERE e.client_id = ? ORDER BY e.created_at DESC
  `).all(clientId) as PipelineEventRow[];

  return { client, interactions, tasks, transfers, reviews, pipelineEvents };
}

export function findClientDuplicates(input: Pick<ClientInput, 'email' | 'phone' | 'companyName'> & { sourceUrl?: string | null }) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const company = input.companyName.trim().toLowerCase();
  const sourceUrl = input.sourceUrl?.trim();

  if (email) {
    clauses.push('c.normalized_email = ?');
    params.push(email);
  }
  if (phone) {
    clauses.push('c.normalized_phone = ?');
    params.push(phone);
  }
  if (company.length >= 3 && company !== '-') {
    clauses.push('lower(c.company_name) = ?');
    params.push(company);
  }
  if (sourceUrl && sourceUrl.length >= 10) {
    clauses.push('c.source_url = ?');
    params.push(sourceUrl);
  }
  if (!clauses.length) return [] as ClientRow[];

  return db
    .prepare(`SELECT ${clientProjection} FROM clients c ${clientJoins} WHERE c.archived_at IS NULL AND (${clauses.join(' OR ')}) LIMIT 10`)
    .all(...params) as DbClientRow[];
}

export function createClient(user: CurrentUser, input: ClientInput) {
  ensureValidClient(input);
  if (!hasSalesRole(user, 'RESEARCHER')) throw new Error('Для добавления лидов нужна роль Lead Researcher.');
  const verifierOwnerId = input.verifierOwnerId || null;
  if (verifierOwnerId) ensureUserHasRole(verifierOwnerId, 'VERIFIER');
  const ownerId = user.id;
  ensureActiveUser(ownerId);
  const id = crypto.randomUUID();
  const now = nowIso();

  const category = input.sourceCategory && SOURCE_CATEGORIES.includes(input.sourceCategory) ? input.sourceCategory : null;
  const platform = text(input.sourcePlatform);
  const detail = text(input.sourceDetail);
  const url = normalizeUrl(input.sourceUrl);

  db.prepare(`
    INSERT INTO clients (
      id, company_name, contact_name, position, email, phone, messenger, website,
      source, source_category, source_platform, source_detail, source_url,
      country, city, industry,
      observed_problem, suggested_service, estimated_value, currency, status, pipeline_stage,
      researcher_commission_rate, verifier_commission_rate, sdr_commission_rate, closer_commission_rate,
      owner_id, created_by_id, researcher_id, verifier_owner_id, ownership_expires_at, general_notes,
      normalized_email, normalized_phone, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `).run(
    id,
    input.companyName.trim(),
    input.contactName.trim(),
    text(input.position),
    text(input.email),
    text(input.phone),
    text(input.messenger),
    text(input.website),
    formatSourceText(input),
    category,
    platform,
    detail,
    url,
    text(input.country),
    text(input.city),
    text(input.industry),
    text(input.observedProblem),
    text(input.suggestedService),
    Number.isFinite(input.estimatedValue) ? input.estimatedValue : null,
    text(input.currency) || 'USD',
    'NEW',
    'RESEARCH',
    7.5, 7.5, 17.5, 17.5,
    ownerId,
    user.id,
    user.id,
    verifierOwnerId,
    new Date(new Date(now).getTime() + 90 * 86_400_000).toISOString(),
    text(input.generalNotes),
    normalizeEmail(input.email),
    normalizePhone(input.phone),
    now, now,
  );
  db.prepare(`INSERT INTO pipeline_events (id, client_id, from_stage, to_stage, changed_by_id, created_at) VALUES (?, ?, NULL, 'RESEARCH', ?, ?)`)
    .run(crypto.randomUUID(), id, user.id, now);
  return id;
}

export function updateClient(user: CurrentUser, clientId: string, input: ClientInput, version: number) {
  ensureValidClient(input);
  const client = getClient(user, clientId);
  if (!client) throw new Error('Клиент не найден.');
  if (!isEditor(client, user)) throw new Error('Вы не можете изменять этого клиента.');

  const category = input.sourceCategory && SOURCE_CATEGORIES.includes(input.sourceCategory) ? input.sourceCategory : null;
  const platform = text(input.sourcePlatform);
  const detail = text(input.sourceDetail);
  const url = normalizeUrl(input.sourceUrl);
  const nextEstimatedValue = input.estimatedValue !== undefined
    ? (Number.isFinite(input.estimatedValue) ? input.estimatedValue : null)
    : client.estimatedValue;
  const nextFinalPrice = input.finalPrice !== undefined
    ? (Number.isFinite(input.finalPrice) ? input.finalPrice : null)
    : client.finalPrice;
  const nextCashReceived = input.cashReceived !== undefined
    ? (Number.isFinite(input.cashReceived) ? input.cashReceived : 0)
    : client.cashReceived;
  const nextCurrency = text(input.currency) || client.currency || 'USD';

  const result = db.prepare(`
    UPDATE clients SET
      company_name = ?, contact_name = ?, position = ?, email = ?, phone = ?, messenger = ?, website = ?,
      source = ?, source_category = ?, source_platform = ?, source_detail = ?, source_url = ?,
      country = ?, city = ?, industry = ?, observed_problem = ?, suggested_service = ?,
      estimated_value = ?, final_price = ?, deal_amount = ?, cash_received = ?, currency = ?,
      general_notes = ?, normalized_email = ?, normalized_phone = ?,
      updated_at = ?, version = version + 1
    WHERE id = ? AND version = ?
  `).run(
    input.companyName.trim(), input.contactName.trim(), text(input.position), text(input.email), text(input.phone),
    text(input.messenger), text(input.website),
    formatSourceText(input), category, platform, detail, url,
    text(input.country), text(input.city), text(input.industry),
    text(input.observedProblem), text(input.suggestedService),
    nextEstimatedValue,
    nextFinalPrice,
    nextFinalPrice,
    nextCashReceived,
    nextCurrency,
    text(input.generalNotes),
    normalizeEmail(input.email), normalizePhone(input.phone), nowIso(), clientId, version,
  );
  if (!result.changes) throw new Error('Карточка была изменена другим пользователем. Обновите страницу и повторите действие.');
}

const legacyStatusByStage: Record<ClientStatus, string> = {
  RESEARCH: 'NEW', RAW: 'NEW', VERIFIED: 'NEW', VERIFIER_REJECTED: 'LOST', SDR_VALIDATED: 'QUALIFYING', SDR_REJECTED: 'LOST',
  CONTACTED: 'CONTACTED', REPLIED: 'QUALIFYING', INTERESTED: 'QUALIFYING', QUALIFIED: 'QUALIFYING',
  NOT_QUALIFIED: 'LOST', DISCOVERY: 'QUALIFYING', OFFER: 'PROPOSAL_SENT', NEGOTIATION: 'ON_HOLD',
  PAYMENT_PENDING: 'WAITING_CLIENT', WON: 'WON', LOST: 'LOST',
};

function requireWorkflowRole(user: CurrentUser, role: SalesRole, assignedUserId?: string | null) {
  if (!hasSalesRole(user, role)) throw new Error(`Для этого действия нужна роль ${role}.`);
  if (user.role !== 'admin' && assignedUserId && assignedUserId !== user.id) {
    throw new Error('Этот этап назначен другому сотруднику.');
  }
}

function requireReason(reason?: string) {
  if (!reason?.trim()) throw new Error('Выберите или укажите причину.');
  return reason.trim();
}

function requireAmount(amount: number | undefined, label: string) {
  if (!Number.isFinite(amount) || Number(amount) <= 0) throw new Error(`Укажите ${label}.`);
  return Number(amount);
}

const priceCorridors: Record<string, { min: number; max: number } | null> = {
  LANDING: { min: 200, max: 400 },
  SITE_FIX: { min: 105, max: 300 },
  AUTOMATION: { min: 200, max: 700 },
  PAYMENTS: { min: 250, max: 700 },
  CUSTOM: null,
};

function setPipelineStage(
  client: ClientRow,
  user: CurrentUser,
  nextStage: ClientStatus,
  fields: Record<string, unknown> = {},
  reason?: string,
) {
  const allowedFields = new Set([
    'owner_id', 'verified_by_id', 'verified_at', 'sdr_owner_id', 'sdr_validated_by_id', 'sdr_validated_at',
    'first_contacted_by_id', 'first_contact_at', 'first_reply_at', 'interested_at', 'qualified_at',
    'closer_owner_id', 'qualification_reviewed_by_id', 'qualification_reviewed_at', 'discovery_at',
    'offer_sent_at', 'negotiation_at', 'payment_pending_at', 'closed_by_id', 'won_at', 'lost_at',
    'lost_reason', 'final_price', 'deal_amount', 'cash_received', 'payment_received_at', 'currency',
    'technical_estimate_needed', 'suggested_service', 'decision_maker', 'budget_notes', 'desired_timeline',
    'discovery_notes', 'service_package', 'ownership_expires_at', 'verifier_owner_id',
  ]);
  const entries = Object.entries(fields);
  if (entries.some(([key]) => !allowedFields.has(key))) throw new Error('Некорректное изменение этапа.');
  const now = nowIso();
  const sql = `UPDATE clients SET pipeline_stage = ?, status = ?, ${entries.map(([key]) => `${key} = ?`).join(', ')}${entries.length ? ',' : ''} updated_at = ?, version = version + 1 WHERE id = ? AND pipeline_stage = ?`;
  const result = db.prepare(sql).run(nextStage, legacyStatusByStage[nextStage], ...entries.map(([, value]) => value), now, client.id, client.status);
  if (!result.changes) throw new Error('Этап уже изменён другим пользователем. Обновите страницу.');
  db.prepare(`INSERT INTO pipeline_events (id, client_id, from_stage, to_stage, changed_by_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(crypto.randomUUID(), client.id, client.status, nextStage, user.id, text(reason), now);
}

function addReview(client: ClientRow, user: CurrentUser, reviewType: ReviewRow['reviewType'], result: ReviewRow['result'], subjectUserId: string | null, reason?: string) {
  db.prepare(`INSERT INTO lead_reviews (id, client_id, review_type, result, reason, reviewed_by_id, subject_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(crypto.randomUUID(), client.id, reviewType, result, text(reason), user.id, subjectUserId, nowIso());
}

export function advanceWorkflow(user: CurrentUser, input: WorkflowInput) {
  const client = getClient(user, input.clientId);
  if (!client) throw new Error('Клиент не найден.');
  if (client.archivedAt) throw new Error('Архивную карточку нельзя двигать по воронке.');

  const transaction = db.transaction(() => {
    const now = nowIso();
    switch (input.action) {
      case 'RESEARCHER_SUBMIT': {
        requireWorkflowRole(user, 'RESEARCHER', client.researcherId);
        if (client.status !== 'RESEARCH') throw new Error('Карточка уже передана на этап верификации.');
        const nextOwnerId = input.nextOwnerId || client.verifierOwnerId || null;
        if (nextOwnerId) {
          ensureUserHasRole(nextOwnerId, 'VERIFIER');
        }
        setPipelineStage(client, user, 'RAW', {
          verifier_owner_id: nextOwnerId,
          owner_id: nextOwnerId || client.ownerId,
        });
        break;
      }
      case 'VERIFIER_APPROVE': {
        requireWorkflowRole(user, 'VERIFIER', client.verifierOwnerId);
        if (client.status !== 'RAW') throw new Error('Этот лид уже проверен.');
        if (!input.nextOwnerId) throw new Error('Назначьте SDR.');
        ensureUserHasRole(input.nextOwnerId, 'SDR');
        addReview(client, user, 'VERIFIER_REVIEW', 'VALID', client.researcherId);
        setPipelineStage(client, user, 'VERIFIED', { verified_by_id: user.id, verified_at: now, sdr_owner_id: input.nextOwnerId, owner_id: input.nextOwnerId, ownership_expires_at: new Date(new Date(now).getTime() + 90 * 86_400_000).toISOString() });
        break;
      }
      case 'VERIFIER_REJECT': {
        requireWorkflowRole(user, 'VERIFIER', client.verifierOwnerId);
        if (client.status !== 'RAW') throw new Error('Этот лид уже проверен.');
        const reason = requireReason(input.reason);
        addReview(client, user, 'VERIFIER_REVIEW', 'INVALID', client.researcherId, reason);
        setPipelineStage(client, user, 'VERIFIER_REJECTED', { verified_by_id: user.id, verified_at: now, lost_reason: reason }, reason);
        break;
      }
      case 'SDR_ACCEPT': {
        requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
        if (client.status !== 'VERIFIED') throw new Error('Лид ещё не передан SDR или уже проверен.');
        addReview(client, user, 'SDR_VALIDATION', 'VALID', client.verifiedById);
        setPipelineStage(client, user, 'SDR_VALIDATED', { sdr_validated_by_id: user.id, sdr_validated_at: now });
        break;
      }
      case 'SDR_REJECT': {
        requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
        if (client.status !== 'VERIFIED') throw new Error('Лид ещё не передан SDR или уже проверен.');
        const reason = requireReason(input.reason);
        addReview(client, user, 'SDR_VALIDATION', 'INVALID', client.verifiedById, reason);
        setPipelineStage(client, user, 'SDR_REJECTED', { sdr_validated_by_id: user.id, sdr_validated_at: now, lost_reason: reason }, reason);
        break;
      }
      case 'SDR_REPLIED': {
        requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
        if (client.status !== 'CONTACTED') throw new Error('Сначала зафиксируйте первый исходящий контакт.');
        setPipelineStage(client, user, 'REPLIED', { first_reply_at: now });
        break;
      }
      case 'SDR_INTERESTED': {
        requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
        if (client.status !== 'REPLIED') throw new Error('Сначала зафиксируйте ответ клиента.');
        setPipelineStage(client, user, 'INTERESTED', { interested_at: now });
        break;
      }
      case 'SDR_QUALIFY': {
        requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
        if (client.status !== 'INTERESTED') throw new Error('Клиент должен подтвердить интерес.');
        if (!input.nextOwnerId) throw new Error('Назначьте Closer.');
        ensureUserHasRole(input.nextOwnerId, 'CLOSER');
        setPipelineStage(client, user, 'QUALIFIED', { qualified_at: now, closer_owner_id: input.nextOwnerId, owner_id: input.nextOwnerId });
        break;
      }
      case 'CLOSER_ACCEPT': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (client.status !== 'QUALIFIED') throw new Error('Лид ещё не передан Closer или уже оценён.');
        addReview(client, user, 'CLOSER_QUALIFICATION', 'VALID', client.sdrOwnerId);
        setPipelineStage(client, user, 'DISCOVERY', { qualification_reviewed_by_id: user.id, qualification_reviewed_at: now, discovery_at: now });
        break;
      }
      case 'CLOSER_REJECT': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (client.status !== 'QUALIFIED') throw new Error('Лид ещё не передан Closer или уже оценён.');
        const reason = requireReason(input.reason);
        addReview(client, user, 'CLOSER_QUALIFICATION', 'INVALID', client.sdrOwnerId, reason);
        setPipelineStage(client, user, 'NOT_QUALIFIED', { qualification_reviewed_by_id: user.id, qualification_reviewed_at: now, lost_reason: reason }, reason);
        break;
      }
      case 'CLOSER_OFFER': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (client.status !== 'DISCOVERY') throw new Error('Предложение можно отправить после этапа Discovery.');
        const finalPrice = requireAmount(input.finalPrice, 'финальную стоимость');
        const servicePackage = input.servicePackage || '';
        if (!(servicePackage in priceCorridors)) throw new Error('Выберите утверждённый пакет услуги.');
        const corridor = priceCorridors[servicePackage];
        const outsideCorridor = !corridor || finalPrice < corridor.min || finalPrice > corridor.max;
        const decisionMaker = requireReason(input.decisionMaker);
        const budgetNotes = requireReason(input.budgetNotes);
        const desiredTimeline = requireReason(input.desiredTimeline);
        const discoveryNotes = requireReason(input.discoveryNotes);
        setPipelineStage(client, user, 'OFFER', {
          offer_sent_at: now, final_price: finalPrice, deal_amount: finalPrice, currency: text(input.currency) || client.currency || 'USD',
          suggested_service: text(input.proposedSolution) || client.suggestedService,
          technical_estimate_needed: input.technicalEstimateNeeded || outsideCorridor ? 1 : 0,
          service_package: servicePackage, decision_maker: decisionMaker, budget_notes: budgetNotes,
          desired_timeline: desiredTimeline, discovery_notes: discoveryNotes,
        });
        break;
      }
      case 'CLOSER_NEGOTIATION': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (client.status !== 'OFFER') throw new Error('Переговоры начинаются после предложения.');
        setPipelineStage(client, user, 'NEGOTIATION', { negotiation_at: now });
        break;
      }
      case 'CLOSER_PAYMENT_PENDING': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (!['OFFER', 'NEGOTIATION'].includes(client.status)) throw new Error('Сначала согласуйте предложение.');
        const finalPrice = input.finalPrice ? requireAmount(input.finalPrice, 'финальную стоимость') : client.finalPrice;
        if (!finalPrice) throw new Error('Укажите финальную стоимость.');
        setPipelineStage(client, user, 'PAYMENT_PENDING', {
          payment_pending_at: now,
          final_price: finalPrice,
          deal_amount: finalPrice,
          currency: text(input.currency) || client.currency || 'USD',
        });
        break;
      }
      case 'CLOSER_WON': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (!['OFFER', 'NEGOTIATION', 'PAYMENT_PENDING'].includes(client.status)) throw new Error('Сделка ещё не готова к оплате.');
        const finalPrice = input.finalPrice ? requireAmount(input.finalPrice, 'финальную стоимость') : client.finalPrice;
        if (!finalPrice) throw new Error('Укажите финальную стоимость.');
        const cash = requireAmount(input.cashReceived, 'фактически полученную сумму');
        setPipelineStage(client, user, 'WON', {
          final_price: finalPrice,
          deal_amount: finalPrice,
          cash_received: cash,
          payment_received_at: now,
          payment_pending_at: client.paymentPendingAt || now,
          closed_by_id: user.id,
          won_at: now,
          currency: text(input.currency) || client.currency || 'USD',
        });
        break;
      }
      case 'UPDATE_PAYMENT': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (client.status !== 'WON') throw new Error('Доплату можно внести только в выигранную сделку.');
        const cash = requireAmount(input.cashReceived, 'общую фактически полученную сумму');
        const finalPrice = input.finalPrice ? requireAmount(input.finalPrice, 'финальную стоимость') : client.finalPrice;
        setPipelineStage(client, user, 'WON', {
          cash_received: cash,
          final_price: finalPrice,
          deal_amount: finalPrice,
          payment_received_at: now,
          currency: text(input.currency) || client.currency || 'USD',
        }, 'Обновлена сумма оплаты');
        break;
      }
      case 'CLOSER_LOST': {
        requireWorkflowRole(user, 'CLOSER', client.closerOwnerId);
        if (!['DISCOVERY', 'OFFER', 'NEGOTIATION', 'PAYMENT_PENDING'].includes(client.status)) throw new Error('Сделка сейчас не находится у Closer.');
        const reason = requireReason(input.reason);
        setPipelineStage(client, user, 'LOST', { lost_at: now, lost_reason: reason }, reason);
        break;
      }
    }
  });
  transaction();
}

export function updateUserSalesRoles(userId: string, roles: SalesRole[]) {
  ensureActiveUser(userId);
  const selected = [...new Set(roles.filter((role) => SALES_ROLES.includes(role)))];
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM user_sales_roles WHERE user_id = ?').run(userId);
    const insert = db.prepare('INSERT INTO user_sales_roles (user_id, sales_role, created_at) VALUES (?, ?, ?)');
    for (const role of selected) insert.run(userId, role, nowIso());
  });
  transaction();
}

export function updateUserName(userId: string, name: string) {
  db.prepare('UPDATE "user" SET name = ?, updatedAt = ? WHERE id = ?').run(name.trim(), new Date().toISOString(), userId);
}

export function releaseUserLeads(userId: string) {
  const now = nowIso();
  db.transaction(() => {
    db.prepare(`UPDATE clients SET ownership_expires_at = ?, updated_at = ?, version = version + 1 WHERE owner_id = ? AND archived_at IS NULL AND pipeline_stage NOT IN ('WON','LOST','VERIFIER_REJECTED','SDR_REJECTED','NOT_QUALIFIED')`).run(now, now, userId);
    db.prepare('UPDATE "user" SET banned = 1, updatedAt = ? WHERE id = ?').run(now, userId);
  })();
}

export function claimExpiredClient(user: CurrentUser, clientId: string) {
  const client = getClient(user, clientId);
  if (!client) throw new Error('Клиент не найден.');
  if (!client.ownershipExpiresAt || new Date(client.ownershipExpiresAt).getTime() > Date.now()) throw new Error('Срок владения этим лидом ещё не истёк.');
  if (['WON', 'LOST', 'VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED'].includes(client.status)) throw new Error('Завершённую карточку нельзя забрать из пула.');
  const role: SalesRole = client.status === 'RESEARCH' ? 'RESEARCHER' : client.status === 'RAW' ? 'VERIFIER' : ['VERIFIED', 'SDR_VALIDATED', 'CONTACTED', 'REPLIED', 'INTERESTED'].includes(client.status) ? 'SDR' : 'CLOSER';
  requireWorkflowRole(user, role);
  const assignment = role === 'RESEARCHER' ? 'researcher_id' : role === 'VERIFIER' ? 'verifier_owner_id' : role === 'SDR' ? 'sdr_owner_id' : 'closer_owner_id';
  const now = nowIso();
  const expires = new Date(new Date(now).getTime() + 90 * 86_400_000).toISOString();
  const transaction = db.transaction(() => {
    const result = db.prepare(`UPDATE clients SET owner_id = ?, ${assignment} = ?, ownership_expires_at = ?, updated_at = ?, version = version + 1 WHERE id = ? AND julianday(ownership_expires_at) < julianday(?)`)
      .run(user.id, user.id, expires, now, clientId, now);
    if (!result.changes) throw new Error('Лид уже забрал другой сотрудник. Обновите страницу.');
    db.prepare(`INSERT INTO client_transfers (id, client_id, from_user_id, to_user_id, transferred_by_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(crypto.randomUUID(), clientId, client.ownerId, user.id, user.id, 'Возврат из общего пула после 90 дней', now);
  });
  transaction();
}

export function archiveClient(user: CurrentUser, clientId: string) {
  const client = getClient(user, clientId);
  if (!client) throw new Error('Клиент не найден.');
  if (!isEditor(client, user)) throw new Error('Вы не можете архивировать этого клиента.');
  db.prepare('UPDATE clients SET archived_at = ?, updated_at = ?, version = version + 1 WHERE id = ?')
    .run(nowIso(), nowIso(), clientId);
}

function assertCanWorkWithClient(user: CurrentUser, clientId: string) {
  const client = getClient(user, clientId);
  if (!client) throw new Error('Клиент не найден.');
  if (!isEditor(client, user)) throw new Error('Вы не можете изменять этого клиента.');
  return client;
}

function insertTask(user: CurrentUser, input: TaskInput) {
  ensureValidTask(input);
  ensureActiveUser(input.assigneeId);
  const id = crypto.randomUUID();
  const now = nowIso();
  db.prepare(`
    INSERT INTO tasks (id, client_id, assignee_id, created_by_id, type, title, description, due_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, input.clientId, input.assigneeId, user.id, input.type, input.title.trim(), text(input.description), input.dueAt, now, now);
  return id;
}

export function createTask(user: CurrentUser, input: TaskInput) {
  assertCanWorkWithClient(user, input.clientId);
  return insertTask(user, input);
}

export function addInteraction(user: CurrentUser, input: InteractionInput) {
  const client = assertCanWorkWithClient(user, input.clientId);
  if (!INTERACTION_CHANNELS.includes(input.channel)) throw new Error('Некорректный канал связи.');
  if (input.direction !== 'OUTBOUND' && input.direction !== 'INBOUND') throw new Error('Некорректное направление связи.');
  if (!input.result.trim()) throw new Error('Укажите результат контакта.');
  if (Number.isNaN(new Date(input.occurredAt).getTime())) throw new Error('Укажите корректную дату контакта.');

  const transaction = db.transaction(() => {
    const now = nowIso();
    db.prepare(`
      INSERT INTO interactions (id, client_id, author_id, occurred_at, channel, direction, result, sent_items, expected_from_client, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(), input.clientId, user.id, input.occurredAt, input.channel, input.direction,
      input.result.trim(), text(input.sentItems), text(input.expectedFromClient), text(input.notes), now, now,
    );
    db.prepare('UPDATE clients SET last_contact_at = ?, updated_at = ?, version = version + 1 WHERE id = ?')
      .run(input.occurredAt, now, client.id);
    if (client.status === 'SDR_VALIDATED' && input.direction === 'OUTBOUND') {
      requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
      setPipelineStage(client, user, 'CONTACTED', { first_contacted_by_id: user.id, first_contact_at: input.occurredAt });
    } else if (client.status === 'CONTACTED' && input.direction === 'INBOUND') {
      requireWorkflowRole(user, 'SDR', client.sdrOwnerId);
      setPipelineStage(client, user, 'REPLIED', { first_reply_at: input.occurredAt });
    }
    if (input.nextTask) insertTask(user, { ...input.nextTask, clientId: input.clientId });
  });
  transaction();
}

export function completeTask(user: CurrentUser, taskId: string, result?: string, nextTask?: Omit<TaskInput, 'clientId'>) {
  const task = db.prepare('SELECT id, client_id AS clientId, assignee_id AS assigneeId, status FROM tasks WHERE id = ?').get(taskId) as
    | { id: string; clientId: string; assigneeId: string; status: string }
    | undefined;
  if (!task) throw new Error('Задача не найдена.');
  if (task.status !== 'OPEN') throw new Error('Эта задача уже закрыта.');
  if (user.role !== 'admin' && task.assigneeId !== user.id) throw new Error('Вы не назначены исполнителем этой задачи.');
  if (nextTask) ensureValidTask(nextTask);

  const transaction = db.transaction(() => {
    const now = nowIso();
    db.prepare(`UPDATE tasks SET status = 'COMPLETED', completed_at = ?, completed_by_id = ?, completion_result = ?, updated_at = ? WHERE id = ?`)
      .run(now, user.id, text(result), now, taskId);
    if (nextTask) insertTask(user, { ...nextTask, clientId: task.clientId });
  });
  transaction();
}

export function transferClient(
  user: CurrentUser,
  clientId: string,
  toUserId: string,
  reason: string | undefined,
  reassignOpenTasks: boolean,
  handoffTask: Omit<TaskInput, 'clientId' | 'assigneeId'> & { dueAt: string },
) {
  const client = assertCanWorkWithClient(user, clientId);
  if (client.ownerId === toUserId) throw new Error('Этот сотрудник уже является ответственным за клиента.');
  ensureActiveUser(toUserId);
  ensureValidTask({ ...handoffTask, clientId, assigneeId: toUserId });

  const transaction = db.transaction(() => {
    const now = nowIso();
    const update = db.prepare('UPDATE clients SET owner_id = ?, updated_at = ?, version = version + 1 WHERE id = ? AND owner_id = ?')
      .run(toUserId, now, clientId, client.ownerId);
    if (!update.changes) throw new Error('Клиент уже был передан. Обновите страницу.');
    if (reassignOpenTasks) {
      db.prepare(`UPDATE tasks SET assignee_id = ?, updated_at = ? WHERE client_id = ? AND status = 'OPEN'`).run(toUserId, now, clientId);
    }
    const handoffTaskId = insertTask(user, { ...handoffTask, clientId, assigneeId: toUserId });
    db.prepare(`
      INSERT INTO client_transfers (id, client_id, from_user_id, to_user_id, transferred_by_id, reason, handoff_task_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), clientId, client.ownerId, toUserId, user.id, text(reason), handoffTaskId, now);
  });
  transaction();
}

export function listTasksForDashboard(user: CurrentUser) {
  const bounds = getDayBounds(new Date(), appTimeZone);
  const base = `
    SELECT t.id, t.client_id AS clientId, c.contact_name AS clientName, c.company_name AS companyName, c.phone AS phone, c.messenger AS messenger,
           (SELECT i.expected_from_client FROM interactions i WHERE i.client_id = c.id AND i.expected_from_client IS NOT NULL ORDER BY i.occurred_at DESC LIMIT 1) AS expectedFromClient,
           t.assignee_id AS assigneeId, assignee.name AS assigneeName, c.owner_id AS ownerId, owner.name AS ownerName,
           t.type, t.title, t.description, t.due_at AS dueAt, t.status, t.completed_at AS completedAt,
           t.completion_result AS completionResult
    FROM tasks t
    JOIN clients c ON c.id = t.client_id
    JOIN "user" assignee ON assignee.id = t.assignee_id
    JOIN "user" owner ON owner.id = c.owner_id
  `;
  const where = user.role === 'admin' ? `t.status = 'OPEN'` : `t.status = 'OPEN' AND t.assignee_id = ?`;
  const params = user.role === 'admin' ? [] : [user.id];

  const overdue = db.prepare(`${base} WHERE ${where} AND t.due_at < ? ORDER BY t.due_at ASC`).all(...params, bounds.start) as TaskRow[];
  const today = db.prepare(`${base} WHERE ${where} AND t.due_at >= ? AND t.due_at < ? ORDER BY t.due_at ASC`).all(...params, bounds.start, bounds.end) as TaskRow[];
  const upcoming = db.prepare(`${base} WHERE ${where} AND t.due_at >= ? AND t.due_at < ? ORDER BY t.due_at ASC`).all(...params, bounds.end, bounds.nextWeek) as TaskRow[];
  return { overdue, today, upcoming, dateLabel: bounds.label };
}

export function getSalesStats(user: CurrentUser) {
  const scope = user.role === 'admin' ? '' : 'WHERE owner_id = ?';
  const params = user.role === 'admin' ? [] : [user.id];
  const row = db.prepare(`
    SELECT
      COUNT(*) AS leads,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM lead_reviews r WHERE r.client_id = clients.id AND r.review_type = 'VERIFIER_REVIEW' AND r.result = 'VALID') THEN 1 ELSE 0 END) AS valid,
      SUM(CASE WHEN first_contact_at IS NOT NULL THEN 1 ELSE 0 END) AS contacted,
      SUM(CASE WHEN first_reply_at IS NOT NULL THEN 1 ELSE 0 END) AS replies,
      SUM(CASE WHEN interested_at IS NOT NULL THEN 1 ELSE 0 END) AS interested,
      SUM(CASE WHEN qualified_at IS NOT NULL THEN 1 ELSE 0 END) AS qualified,
      SUM(CASE WHEN offer_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS proposals,
      SUM(CASE WHEN won_at IS NOT NULL AND cash_received > 0 THEN 1 ELSE 0 END) AS won
    FROM clients ${scope} ${scope ? 'AND archived_at IS NULL' : 'WHERE archived_at IS NULL'}
  `).get(...params) as { leads: number; valid: number | null; contacted: number | null; replies: number | null; interested: number | null; qualified: number | null; proposals: number | null; won: number | null };
  const revenue = db.prepare(`
    SELECT currency, COALESCE(SUM(cash_received), 0) AS amount
    FROM clients ${scope ? 'WHERE owner_id = ? AND' : 'WHERE'} archived_at IS NULL AND won_at IS NOT NULL AND cash_received > 0
    GROUP BY currency ORDER BY currency
  `).all(...params) as Array<{ currency: string; amount: number }>;
  return {
    leads: row.leads || 0,
    valid: row.valid || 0,
    contacted: row.contacted || 0,
    replies: row.replies || 0,
    interested: row.interested || 0,
    qualified: row.qualified || 0,
    proposals: row.proposals || 0,
    won: row.won || 0,
    revenue,
  };
}

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'all';

function analyticsBounds(period: AnalyticsPeriod) {
  const current = new Date();
  const local = getTimeZoneParts(current, appTimeZone);
  let startParts = { year: local.year, month: local.month, day: local.day };
  if (period === 'week') {
    const weekday = new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay() || 7;
    startParts = addDays(startParts, 1 - weekday);
  } else if (period === 'month') {
    startParts = { year: local.year, month: local.month, day: 1 };
  }
  const start = period === 'all' ? '1970-01-01T00:00:00.000Z' : zonedDateToUtc(startParts, appTimeZone).toISOString();
  return { start, end: current.toISOString() };
}

function percentage(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

type CountRow = { total: number; positive?: number; negative?: number; amount?: number; average?: number };

export function getKpiReport(user: CurrentUser, period: AnalyticsPeriod = 'month', selectedUserId?: string) {
  const { start, end } = analyticsBounds(period);
  const members = (user.role === 'admin' ? listActiveUsers() : listActiveUsers().filter((member) => member.id === user.id)).filter((member) => !selectedUserId || user.role === 'admin' && member.id === selectedUserId);

  const people = members.map((member) => {
    const submitted = (db.prepare(`SELECT COUNT(*) AS total FROM clients WHERE researcher_id = ? AND created_at >= ? AND created_at <= ?`).get(member.id, start, end) as CountRow).total;
    const researcherReviews = db.prepare(`SELECT COUNT(*) AS total, SUM(result = 'VALID') AS positive, SUM(result = 'INVALID') AS negative FROM lead_reviews WHERE review_type = 'VERIFIER_REVIEW' AND subject_user_id = ? AND created_at >= ? AND created_at <= ?`)
      .get(member.id, start, end) as CountRow;
    const verifierReviews = db.prepare(`SELECT COUNT(*) AS total, SUM(result = 'VALID') AS positive, SUM(result = 'INVALID') AS negative FROM lead_reviews WHERE review_type = 'VERIFIER_REVIEW' AND reviewed_by_id = ? AND created_at >= ? AND created_at <= ?`)
      .get(member.id, start, end) as CountRow;
    const verifierAudit = db.prepare(`SELECT COUNT(*) AS total, SUM(result = 'VALID') AS positive, SUM(result = 'INVALID') AS negative FROM lead_reviews WHERE review_type = 'SDR_VALIDATION' AND subject_user_id = ? AND created_at >= ? AND created_at <= ?`)
      .get(member.id, start, end) as CountRow;
    const sdr = db.prepare(`SELECT
        SUM(first_contacted_by_id = ? AND first_contact_at >= ? AND first_contact_at <= ?) AS total,
        SUM(sdr_owner_id = ? AND first_reply_at >= ? AND first_reply_at <= ?) AS replies,
        SUM(sdr_owner_id = ? AND interested_at >= ? AND interested_at <= ?) AS interested,
        SUM(sdr_owner_id = ? AND qualified_at >= ? AND qualified_at <= ?) AS qualified
      FROM clients`).get(member.id, start, end, member.id, start, end, member.id, start, end, member.id, start, end) as { total: number | null; replies: number | null; interested: number | null; qualified: number | null };
    const meetings = (db.prepare(`SELECT COUNT(*) AS total FROM interactions WHERE author_id = ? AND channel = 'MEETING' AND occurred_at >= ? AND occurred_at <= ?`).get(member.id, start, end) as CountRow).total;
    const followUps = db.prepare(`SELECT COUNT(*) AS total, SUM(t.completed_at IS NOT NULL AND t.completed_at <= t.due_at) AS positive,
        SUM(t.completed_at IS NULL OR t.completed_at > t.due_at) AS negative
      FROM tasks t JOIN clients c ON c.id = t.client_id
      WHERE c.sdr_owner_id = ? AND t.assignee_id = ? AND t.due_at >= ? AND t.due_at <= ? AND t.due_at <= ?`)
      .get(member.id, member.id, start, end, nowIso()) as CountRow;
    const sdrAudit = db.prepare(`SELECT COUNT(*) AS total, SUM(result = 'VALID') AS positive, SUM(result = 'INVALID') AS negative FROM lead_reviews WHERE review_type = 'CLOSER_QUALIFICATION' AND subject_user_id = ? AND created_at >= ? AND created_at <= ?`)
      .get(member.id, start, end) as CountRow;
    const closer = db.prepare(`SELECT
        SUM(closer_owner_id = ? AND qualified_at >= ? AND qualified_at <= ?) AS total,
        SUM(closed_by_id = ? AND won_at >= ? AND won_at <= ? AND cash_received > 0) AS won,
        AVG(CASE WHEN closed_by_id = ? AND won_at >= ? AND won_at <= ? THEN julianday(payment_received_at) - julianday(qualified_at) END) AS salesCycle
      FROM clients`).get(member.id, start, end, member.id, start, end, member.id, start, end) as { total: number | null; won: number | null; salesCycle: number | null };
    const closerMoney = db.prepare(`SELECT currency, SUM(cash_received) AS revenue, AVG(final_price) AS averageDeal
      FROM clients WHERE closed_by_id = ? AND won_at >= ? AND won_at <= ? AND cash_received > 0 GROUP BY currency ORDER BY currency`)
      .all(member.id, start, end) as Array<{ currency: string; revenue: number; averageDeal: number }>;
    const paymentCohort = db.prepare(`SELECT COUNT(*) AS total, SUM(cash_received > 0) AS positive FROM clients WHERE closer_owner_id = ? AND payment_pending_at >= ? AND payment_pending_at <= ?`)
      .get(member.id, start, end) as CountRow;

    const contacts = sdr.total || 0;
    const replies = sdr.replies || 0;
    const interested = sdr.interested || 0;
    const qualified = sdr.qualified || 0;
    const verifierAudited = verifierAudit.total || 0;
    const sdrAudited = sdrAudit.total || 0;
    return {
      id: member.id,
      name: member.name,
      salesRoles: member.salesRoles,
      researcher: {
        submitted,
        target: 20,
        reviewed: researcherReviews.total || 0,
        valid: researcherReviews.positive || 0,
        validityRate: percentage(researcherReviews.positive || 0, researcherReviews.total || 0),
        qualityTarget: 75,
      },
      verifier: {
        reviews: verifierReviews.total || 0,
        target: 50,
        accepted: verifierReviews.positive || 0,
        audited: verifierAudited,
        correct: verifierAudit.positive || 0,
        accuracy: percentage(verifierAudit.positive || 0, verifierAudited),
        falsePositiveRate: percentage(verifierAudit.negative || 0, verifierAudited),
        accuracyTarget: 85,
        falsePositiveMax: 15,
      },
      sdr: {
        contacts,
        contactTarget: 30,
        replies,
        replyRate: percentage(replies, contacts),
        interested,
        positiveReplyRate: percentage(interested, contacts),
        qualified,
        qualifiedRate: percentage(qualified, contacts),
        meetings,
        followUpsDue: followUps.total || 0,
        followUpsOnTime: followUps.positive || 0,
        followUpRate: percentage(followUps.positive || 0, followUps.total || 0),
        audited: sdrAudited,
        correctlyQualified: sdrAudit.positive || 0,
        qualificationAccuracy: percentage(sdrAudit.positive || 0, sdrAudited),
        qualificationTarget: 80,
      },
      closer: {
        received: closer.total || 0,
        won: closer.won || 0,
        closeRate: percentage(closer.won || 0, closer.total || 0),
        money: closerMoney.map((item) => ({ ...item, averageDeal: Math.round(item.averageDeal * 100) / 100 })),
        salesCycleDays: Math.round((closer.salesCycle || 0) * 10) / 10,
        paymentPending: paymentCohort.total || 0,
        paid: paymentCohort.positive || 0,
        paymentConversion: percentage(paymentCohort.positive || 0, paymentCohort.total || 0),
      },
    };
  });

  const scopeSql = user.role === 'admin' ? '' : 'AND owner_id = ?';
  const scopeParams = user.role === 'admin' ? [] : [user.id];

  const sourceCategories = db.prepare(`SELECT
      COALESCE(source_category, 'OTHER') AS category,
      currency,
      COUNT(*) AS leads,
      SUM(EXISTS (SELECT 1 FROM lead_reviews r WHERE r.client_id = clients.id AND r.review_type = 'VERIFIER_REVIEW' AND r.result = 'VALID')) AS valid,
      SUM(first_contact_at IS NOT NULL) AS contacted,
      SUM(qualified_at IS NOT NULL) AS qualified,
      SUM(won_at IS NOT NULL AND cash_received > 0) AS won,
      COALESCE(SUM(cash_received), 0) AS revenue
    FROM clients WHERE archived_at IS NULL AND created_at >= ? AND created_at <= ? ${scopeSql}
    GROUP BY COALESCE(source_category, 'OTHER'), currency ORDER BY revenue DESC, leads DESC`).all(start, end, ...scopeParams) as Array<{ category: string; currency: string; leads: number; valid: number; contacted: number; qualified: number; won: number; revenue: number }>;

  const sourcePlatforms = db.prepare(`SELECT
      COALESCE(source_category, 'OTHER') AS category,
      COALESCE(NULLIF(trim(source_platform), ''), NULLIF(trim(source), ''), 'Не указана') AS platform,
      currency,
      COUNT(*) AS leads,
      SUM(EXISTS (SELECT 1 FROM lead_reviews r WHERE r.client_id = clients.id AND r.review_type = 'VERIFIER_REVIEW' AND r.result = 'VALID')) AS valid,
      SUM(first_contact_at IS NOT NULL) AS contacted,
      SUM(qualified_at IS NOT NULL) AS qualified,
      SUM(won_at IS NOT NULL AND cash_received > 0) AS won,
      COALESCE(SUM(cash_received), 0) AS revenue
    FROM clients WHERE archived_at IS NULL AND created_at >= ? AND created_at <= ? ${scopeSql}
    GROUP BY COALESCE(source_category, 'OTHER'), COALESCE(NULLIF(trim(source_platform), ''), NULLIF(trim(source), ''), 'Не указана'), currency ORDER BY revenue DESC, leads DESC LIMIT 30`).all(start, end, ...scopeParams) as Array<{ category: string; platform: string; currency: string; leads: number; valid: number; contacted: number; qualified: number; won: number; revenue: number }>;

  const revenue = db.prepare(`SELECT currency, SUM(cash_received) AS cash, SUM(final_price) AS contractValue,
      SUM(cash_received * (researcher_commission_rate + verifier_commission_rate + sdr_commission_rate + closer_commission_rate) / 100.0) AS commissionPool,
      SUM(cash_received * researcher_commission_rate / 100.0) AS researcherCommission,
      SUM(cash_received * verifier_commission_rate / 100.0) AS verifierCommission,
      SUM(cash_received * sdr_commission_rate / 100.0) AS sdrCommission,
      SUM(cash_received * closer_commission_rate / 100.0) AS closerCommission
    FROM clients WHERE won_at >= ? AND won_at <= ? AND cash_received > 0 ${scopeSql}
    GROUP BY currency ORDER BY currency`).all(start, end, ...scopeParams) as Array<Record<string, number | string>>;

  return {
    period,
    start,
    end,
    people,
    categories: sourceCategories.map((c) => ({
      ...c,
      categoryLabel: sourceCategoryLabels[c.category as SourceCategory] || (c.category === 'OTHER' ? 'Без категории / Прочее' : c.category),
      revenuePerLead: c.leads ? Math.round(c.revenue / c.leads * 100) / 100 : 0,
    })),
    platforms: sourcePlatforms.map((p) => ({
      ...p,
      categoryLabel: sourceCategoryLabels[p.category as SourceCategory] || (p.category === 'OTHER' ? 'Прочее' : p.category),
      revenuePerLead: p.leads ? Math.round(p.revenue / p.leads * 100) / 100 : 0,
    })),
    sources: sourcePlatforms.map((source) => ({
      source: source.platform !== 'Не указана' && source.category !== 'OTHER' && sourceCategoryLabels[source.category as SourceCategory]
        ? `${sourceCategoryLabels[source.category as SourceCategory]}: ${source.platform}`
        : source.platform,
      currency: source.currency,
      leads: source.leads,
      valid: source.valid,
      contacted: source.contacted,
      qualified: source.qualified,
      won: source.won,
      revenue: source.revenue,
      revenuePerLead: source.leads ? Math.round(source.revenue / source.leads * 100) / 100 : 0,
    })),
    revenue,
  };
}

export function listTasks(user: CurrentUser, includeCompleted = false) {
  const where = user.role === 'admin'
    ? includeCompleted ? `1 = 1` : `t.status = 'OPEN'`
    : includeCompleted ? `t.assignee_id = ?` : `t.assignee_id = ? AND t.status = 'OPEN'`;
  const params = user.role === 'admin' ? [] : [user.id];
  return db.prepare(`
    SELECT t.id, t.client_id AS clientId, c.contact_name AS clientName, c.company_name AS companyName, c.phone AS phone, c.messenger AS messenger,
           (SELECT i.expected_from_client FROM interactions i WHERE i.client_id = c.id AND i.expected_from_client IS NOT NULL ORDER BY i.occurred_at DESC LIMIT 1) AS expectedFromClient,
           t.assignee_id AS assigneeId, assignee.name AS assigneeName, c.owner_id AS ownerId, owner.name AS ownerName,
           t.type, t.title, t.description, t.due_at AS dueAt, t.status, t.completed_at AS completedAt,
           t.completion_result AS completionResult
    FROM tasks t
    JOIN clients c ON c.id = t.client_id
    JOIN "user" assignee ON assignee.id = t.assignee_id
    JOIN "user" owner ON owner.id = c.owner_id
    WHERE ${where}
    ORDER BY CASE WHEN t.status = 'OPEN' THEN 0 ELSE 1 END, t.due_at ASC
  `).all(...params) as TaskRow[];
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') };
}

function timezoneOffset(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - date.getTime();
}

function zonedDateToUtc(parts: { year: number; month: number; day: number; hour?: number; minute?: number; second?: number }, timeZone: string) {
  const guessedUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
  const firstOffset = timezoneOffset(new Date(guessedUtc), timeZone);
  let utc = guessedUtc - firstOffset;
  const correctedOffset = timezoneOffset(new Date(utc), timeZone);
  if (correctedOffset !== firstOffset) utc = guessedUtc - correctedOffset;
  return new Date(utc);
}

function addDays(parts: { year: number; month: number; day: number }, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function getDayBounds(now: Date, timeZone: string) {
  const today = getTimeZoneParts(now, timeZone);
  const date = { year: today.year, month: today.month, day: today.day };
  const start = zonedDateToUtc(date, timeZone);
  const end = zonedDateToUtc(addDays(date, 1), timeZone);
  const nextWeek = zonedDateToUtc(addDays(date, 8), timeZone);
  const label = new Intl.DateTimeFormat('ru-RU', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  return { start: start.toISOString(), end: end.toISOString(), nextWeek: nextWeek.toISOString(), label };
}

export function localDateTimeToIso(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error('Укажите корректные дату и время.');
  const [, year, month, day, hour, minute] = match;
  return zonedDateToUtc({
    year: Number(year), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute),
  }, appTimeZone).toISOString();
}
