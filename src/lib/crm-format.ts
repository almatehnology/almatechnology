const appTimeZone = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'America/Argentina/Mendoza';

export const statusLabels: Record<string, string> = {
  RESEARCH: 'Сбор данных (Researcher)',
  RAW: 'Ожидает верификатора',
  VERIFIED: 'Проверен Verifier',
  VERIFIER_REJECTED: 'Отклонён Verifier',
  SDR_VALIDATED: 'Принят SDR',
  SDR_REJECTED: 'Возвращён SDR',
  CONTACTED: 'Связались',
  REPLIED: 'Получен ответ',
  INTERESTED: 'Есть интерес',
  QUALIFIED: 'Передан Closer',
  NOT_QUALIFIED: 'Плохая квалификация',
  DISCOVERY: 'Выявление задачи',
  OFFER: 'Предложение отправлено',
  NEGOTIATION: 'Переговоры',
  PAYMENT_PENDING: 'Ожидаем оплату',
  WON: 'Оплата получена',
  LOST: 'Сделка проиграна',
};

export const salesRoleLabels: Record<string, string> = {
  RESEARCHER: 'Lead Researcher',
  VERIFIER: 'Verifier',
  SDR: 'SDR / Setter',
  CLOSER: 'Closer',
};

export const taskTypeLabels: Record<string, string> = {
  CALL: 'Звонок',
  EMAIL: 'Письмо',
  MESSAGE: 'Сообщение',
  MEETING: 'Встреча',
  OTHER: 'Другое',
};

export const interactionChannelLabels: Record<string, string> = {
  CALL: 'Звонок',
  EMAIL: 'Email',
  MESSENGER: 'Мессенджер',
  MEETING: 'Встреча',
  OTHER: 'Другое',
};

export const sourceCategoryLabels: Record<string, string> = {
  JOB_BOARD: 'Найм и постоянная работа',
  PRO_NETWORK: 'Профессиональные сети',
  FREELANCE: 'Фриланс-биржи',
  DIRECT_SALES: 'Прямые продажи (холодные)',
  SOCIAL_MEDIA: 'Соцсети и сообщества',
};

export const sourceCategoryShortLabels: Record<string, string> = {
  JOB_BOARD: 'Найм',
  PRO_NETWORK: 'Профсети',
  FREELANCE: 'Биржи',
  DIRECT_SALES: 'Прямой поиск',
  SOCIAL_MEDIA: 'Соцсети',
};

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: appTimeZone,
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: appTimeZone,
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(value));
}

export function isOverdue(value: string) {
  return new Date(value).getTime() < Date.now();
}

export function formatBudgetRange(min?: number | null, max?: number | null, currency = 'USD') {
  const hasMin = typeof min === 'number' && Number.isFinite(min);
  const hasMax = typeof max === 'number' && Number.isFinite(max);
  if (hasMin && hasMax) {
    if (min === max) return `${min} ${currency}`;
    return `${min} – ${max} ${currency}`;
  }
  if (hasMin) return `от ${min} ${currency}`;
  if (hasMax) return `до ${max} ${currency}`;
  return '—';
}

export type DeadlineInfo = {
  formatted: string;
  status: 'expired' | 'today' | 'urgent' | 'soon' | 'normal' | 'none';
  label: string | null;
  daysRemaining: number | null;
};

export function getDeadlineInfo(value?: string | null): DeadlineInfo {
  if (!value) return { formatted: '—', status: 'none', label: null, daysRemaining: null };
  const dateStr = value.slice(0, 10);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return { formatted: '—', status: 'none', label: null, daysRemaining: null };

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return { formatted: '—', status: 'none', label: null, daysRemaining: null };
  }

  const monthsGenitive = [
    'янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня',
    'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
  ];
  const formatted = `${day} ${monthsGenitive[month]} ${year}`;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(year, month, day);
  const diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / 86400000);

  if (diffDays < 0) {
    return {
      formatted,
      status: 'expired',
      label: 'Истёк',
      daysRemaining: diffDays,
    };
  }
  if (diffDays === 0) {
    return {
      formatted,
      status: 'today',
      label: 'Сегодня',
      daysRemaining: 0,
    };
  }
  if (diffDays === 1) {
    return {
      formatted,
      status: 'urgent',
      label: 'Завтра',
      daysRemaining: 1,
    };
  }
  if (diffDays <= 3) {
    return {
      formatted,
      status: 'soon',
      label: `Осталось ${diffDays} дн.`,
      daysRemaining: diffDays,
    };
  }
  return {
    formatted,
    status: 'normal',
    label: `Осталось ${diffDays} дн.`,
    daysRemaining: diffDays,
  };
}
