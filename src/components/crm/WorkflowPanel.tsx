'use client';

import { useActionState } from 'react';
import { advanceWorkflowAction, type ActionState } from '@/app/[locale]/crm/actions';
import type { ClientRow } from '@/lib/crm';
import type { SalesRole } from '@/lib/crm-types';
import { statusLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton } from './FormControls';

type TeamUser = { id: string; name: string; salesRoles: SalesRole[] };

const verifierReasons = ['Проблема отсутствует', 'Бизнес закрыт', 'Неправильный контакт', 'Дубль', 'Не наш целевой клиент', 'Компания неправильно оценена'];
const sdrReasons = ['Проблема отсутствует', 'Бизнес закрыт', 'Неправильный контакт', 'Дубль', 'Не наш целевой клиент', 'Данные Verifier неполные или неверные'];
const qualificationReasons = ['Клиент не заинтересован', 'SDR неправильно понял ответ', 'Нет реальной потребности', 'Не decision maker', 'Ожидал бесплатную услугу', 'Не соответствует целевой аудитории', 'Данные SDR неполные или неверные'];
const lostReasons = ['Дорого', 'Выбрал конкурента', 'Передумал', 'Задача отложена', 'Нет бюджета', 'Не доверяет', 'Не можем реализовать', 'Перестал отвечать'];

function WorkflowForm({ locale, clientId, action, children, button }: { locale: string; clientId: string; action: string; children?: React.ReactNode; button: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(advanceWorkflowAction, {});
  return <form action={formAction} className="crm-form compact crm-workflow-form"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="clientId" value={clientId} /><input type="hidden" name="workflowAction" value={action} />{children}<ActionMessage state={state} /><SubmitButton>{button}</SubmitButton></form>;
}

function ReasonSelect({ reasons }: { reasons: string[] }) {
  return <label>Причина<select name="reason" required defaultValue=""><option value="" disabled>Выберите причину</option>{reasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></label>;
}

function OwnerSelect({ users, role, label }: { users: TeamUser[]; role: SalesRole; label: string }) {
  return <label>{label}<select name="nextOwnerId" required defaultValue=""><option value="" disabled>Выберите сотрудника</option>{users.filter((user) => user.salesRoles.includes(role)).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>;
}

export function WorkflowPanel({ locale, client, users, currentUserRoles, isAdmin }: { locale: string; client: ClientRow; users: TeamUser[]; currentUserRoles: SalesRole[]; isAdmin: boolean }) {
  const can = (role: SalesRole) => isAdmin || currentUserRoles.includes(role);
  const empty = <p className="crm-muted">На этом этапе действие ожидается от назначенного сотрудника с нужной ролью.</p>;
  let content: React.ReactNode = empty;

  if (client.status === 'RAW' && can('VERIFIER')) content = <div className="crm-workflow-actions"><WorkflowForm locale={locale} clientId={client.id} action="VERIFIER_APPROVE" button="Подтвердить и передать SDR"><OwnerSelect users={users} role="SDR" label="Следующий SDR" /></WorkflowForm><WorkflowForm locale={locale} clientId={client.id} action="VERIFIER_REJECT" button="Отклонить лид"><ReasonSelect reasons={verifierReasons} /></WorkflowForm></div>;
  if (client.status === 'VERIFIED' && can('SDR')) content = <div className="crm-workflow-actions"><WorkflowForm locale={locale} clientId={client.id} action="SDR_ACCEPT" button="Подтвердить качество Verifier" /><WorkflowForm locale={locale} clientId={client.id} action="SDR_REJECT" button="Вернуть как плохо проверенный"><ReasonSelect reasons={sdrReasons} /></WorkflowForm></div>;
  if (client.status === 'SDR_VALIDATED' && can('SDR')) content = <p className="crm-muted">Зафиксируйте первый исходящий контакт в форме ниже. Карточка автоматически перейдёт на этап «Связались».</p>;
  if (client.status === 'CONTACTED' && can('SDR')) content = <WorkflowForm locale={locale} clientId={client.id} action="SDR_REPLIED" button="Зафиксировать ответ клиента" />;
  if (client.status === 'REPLIED' && can('SDR')) content = <WorkflowForm locale={locale} clientId={client.id} action="SDR_INTERESTED" button="Ответ положительный — есть интерес" />;
  if (client.status === 'INTERESTED' && can('SDR')) content = <WorkflowForm locale={locale} clientId={client.id} action="SDR_QUALIFY" button="Квалифицировать и передать Closer"><OwnerSelect users={users} role="CLOSER" label="Следующий Closer" /></WorkflowForm>;
  if (client.status === 'QUALIFIED' && can('CLOSER')) content = <div className="crm-workflow-actions"><WorkflowForm locale={locale} clientId={client.id} action="CLOSER_ACCEPT" button="Квалификация корректна — начать Discovery" /><WorkflowForm locale={locale} clientId={client.id} action="CLOSER_REJECT" button="Вернуть как Not Qualified"><ReasonSelect reasons={qualificationReasons} /></WorkflowForm></div>;
  if (client.status === 'DISCOVERY' && can('CLOSER')) content = <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_OFFER" button="Зафиксировать отправленное предложение"><div className="crm-form-grid"><label>Decision maker<input name="decisionMaker" required placeholder="Имя и роль принимающего решение" /></label><label>Бюджет<input name="budgetNotes" required placeholder="Диапазон или «пока неизвестен»" /></label><label>Желаемый срок<input name="desiredTimeline" required placeholder="Например, в течение 2 недель" /></label><label>Пакет<select name="servicePackage" required defaultValue=""><option value="" disabled>Выберите пакет</option><option value="LANDING">Landing · $200–400</option><option value="SITE_FIX">Site Fix · $105–300</option><option value="AUTOMATION">Automation · $200–700</option><option value="PAYMENTS">Payments · $250–700</option><option value="CUSTOM">Нестандартная задача</option></select></label></div><label>Что выяснили на Discovery<textarea name="discoveryNotes" required rows={3} placeholder="Что не работает, насколько важно, ограничения и договорённости" /></label><label>Согласованное решение<textarea name="proposedSolution" required defaultValue={client.suggestedService || ''} rows={3} /></label><div className="crm-form-grid"><label>Стоимость договора<input name="finalPrice" type="number" min="0.01" step="0.01" required /></label><label>Валюта<select name="currency" defaultValue={client.currency}><option>USD</option><option>ARS</option><option>EUR</option></select></label></div><label className="crm-check"><input type="checkbox" name="technicalEstimateNeeded" />Нужна техническая оценка</label><small className="crm-muted">Для нестандартной задачи или цены вне коридора отметка технической оценки включится автоматически.</small></WorkflowForm>;
  if (['OFFER', 'NEGOTIATION', 'PAYMENT_PENDING'].includes(client.status) && can('CLOSER')) content = <div className="crm-workflow-actions">{client.status === 'OFFER' && <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_NEGOTIATION" button="Перейти к переговорам" />}{client.status !== 'PAYMENT_PENDING' && <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_PAYMENT_PENDING" button="Условия согласованы — ожидаем оплату"><label>Финальная стоимость<input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required /></label></WorkflowForm>}<WorkflowForm locale={locale} clientId={client.id} action="CLOSER_WON" button="Оплата получена — закрыть сделку"><div className="crm-form-grid"><label>Стоимость договора<input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required /></label><label>Фактически получено<input name="cashReceived" type="number" min="0.01" step="0.01" required /></label></div></WorkflowForm><WorkflowForm locale={locale} clientId={client.id} action="CLOSER_LOST" button="Закрыть как проигранную"><ReasonSelect reasons={lostReasons} /></WorkflowForm></div>;
  if (client.status === 'WON' && can('CLOSER')) content = <WorkflowForm locale={locale} clientId={client.id} action="UPDATE_PAYMENT" button="Обновить полученную сумму"><div className="crm-form-grid"><label>Стоимость договора<input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required /></label><label>Всего фактически получено<input name="cashReceived" type="number" min="0.01" step="0.01" defaultValue={client.cashReceived || ''} required /></label></div></WorkflowForm>;
  if (['VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED', 'LOST'].includes(client.status)) content = <p className="crm-muted">Воронка завершена с отказом: {client.lostReason || 'причина не указана'}.</p>;

  return <section className="crm-card crm-workflow"><div className="crm-section-heading"><h2>Конвейер продаж</h2><span className={`crm-status ${client.status.toLowerCase()}`}>{statusLabels[client.status]}</span></div>{content}</section>;
}
