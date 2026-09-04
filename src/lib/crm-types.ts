export const CLIENT_STATUSES = [
  'RESEARCH',
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

export const SOURCE_CATEGORIES = [
  'JOB_BOARD',
  'PRO_NETWORK',
  'FREELANCE',
  'DIRECT_SALES',
  'SOCIAL_MEDIA',
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type SalesRole = (typeof SALES_ROLES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number];
export type InteractionDirection = 'OUTBOUND' | 'INBOUND';
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];

export const SOURCE_CATEGORY_PLATFORMS: Record<SourceCategory, readonly string[]> = {
  JOB_BOARD: [
    'HeadHunter',
    'Habr Карьера',
    'RemoteOK',
    'Indeed',
    'Wellfound',
    'Djinni',
    'Glassdoor',
    'Сайт компании / Карьера',
  ],
  PRO_NETWORK: [
    'LinkedIn',
    'Xing',
    'Polywork',
  ],
  FREELANCE: [
    'Upwork',
    'Fiverr',
    'Freelancer.com',
    'Kwork',
    'Habr Freelance',
    'FL.ru',
    'Toptal',
  ],
  DIRECT_SALES: [
    'Google Карты',
    '2GIS',
    'Яндекс Карты',
    'Отраслевой справочник / Каталог',
    'Холодный аутрич / База',
    'Рекомендация / Сарафан',
  ],
  SOCIAL_MEDIA: [
    'Telegram',
    'Instagram',
    'Facebook',
    'VK',
    'Twitter / X',
    'Discord',
    'Reddit',
  ],
} as const;

