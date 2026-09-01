export const CLIENT_STATUSES = [
  'RAW',
  'VERIFIED',
  'VERIFIER_REJECTED',
  'SDR_VALIDATED',
  'SDR_REJECTED',
  'CONTACTED',
  'REPLIED',
  'INTERESTED',
  'QUALIFIED',
  'NOT_QUALIFIED',
  'DISCOVERY',
  'OFFER',
  'NEGOTIATION',
  'PAYMENT_PENDING',
  'WON',
  'LOST',
] as const;

export const SALES_ROLES = ['RESEARCHER', 'VERIFIER', 'SDR', 'CLOSER'] as const;

export const TASK_TYPES = ['CALL', 'EMAIL', 'MESSAGE', 'MEETING', 'OTHER'] as const;
export const INTERACTION_CHANNELS = ['CALL', 'EMAIL', 'MESSENGER', 'MEETING', 'OTHER'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type SalesRole = (typeof SALES_ROLES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number];
export type InteractionDirection = 'OUTBOUND' | 'INBOUND';
