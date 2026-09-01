const appTimeZone = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'America/Argentina/Mendoza';

export const statusLabels: Record<string, string> = {
  RAW: 'Найден Researcher',
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
