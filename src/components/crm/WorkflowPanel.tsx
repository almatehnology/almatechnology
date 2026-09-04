'use client';

import { useActionState } from 'react';
import {
  ArrowRight,
  Trophy,
  Info,
} from 'lucide-react';
import { advanceWorkflowAction, type ActionState } from '@/app/[locale]/crm/actions';
import type { ClientRow } from '@/lib/crm';
import type { SalesRole } from '@/lib/crm-types';
import { statusLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton } from './FormControls';

type TeamUser = { id: string; name: string; salesRoles: SalesRole[] };

const verifierReasons = [
  'Проблема отсутствует',
  'Бизнес закрыт',
  'Неправильный контакт',
  'Дубль',
  'Не наш целевой клиент',
  'Компания неправильно оценена',
];

const sdrReasons = [
  'Проблема отсутствует',
  'Бизнес закрыт',
  'Неправильный контакт',
  'Дубль',
  'Не наш целевой клиент',
  'Данные Verifier неполные или неверные',
];

const qualificationReasons = [
  'Клиент не заинтересован',
  'SDR неправильно понял ответ',
  'Нет реальной потребности',
  'Не decision maker',
  'Ожидал бесплатную услугу',
  'Не соответствует целевой аудитории',
  'Данные SDR неполные или неверные',
];

const lostReasons = [
  'Дорого',
  'Выбрал конкурента',
  'Передумал',
  'Задача отложена',
  'Нет бюджета',
  'Не доверяет',
  'Не можем реализовать',
  'Перестал отвечать',
];

function WorkflowForm({
  locale,
  clientId,
  action,
  children,
  button,
  className = '',
}: {
  locale: string;
  clientId: string;
  action: string;
  children?: React.ReactNode;
  button: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(advanceWorkflowAction, {});
  return (
    <form action={formAction} className={`crm-form compact crm-workflow-form ${className}`.trim()}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="workflowAction" value={action} />
      {children}
      <ActionMessage state={state} />
      <SubmitButton className="crm-wizard-btn-next">{button}</SubmitButton>
    </form>
  );
}

function ReasonSelect({ reasons }: { reasons: string[] }) {
  return (
    <label>
      Причина
      <select name="reason" required defaultValue="">
        <option value="" disabled>Выберите причину</option>
        {reasons.map((reason) => (
          <option key={reason} value={reason}>{reason}</option>
        ))}
      </select>
    </label>
  );
}

function OwnerSelect({ users, role, label }: { users: TeamUser[]; role: SalesRole; label: string }) {
  return (
    <label>
      {label}
      <select name="nextOwnerId" required defaultValue="">
        <option value="" disabled>Выберите сотрудника</option>
        {users
          .filter((user) => user.salesRoles.includes(role))
          .map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
      </select>
    </label>
  );
}

export function WorkflowPanel({
  locale,
  client,
  users,
  currentUserRoles,
  isAdmin,
  currentUserId,
}: {
  locale: string;
  client: ClientRow;
  users: TeamUser[];
  currentUserRoles: SalesRole[];
  isAdmin: boolean;
  currentUserId?: string;
}) {
  const can = (role: SalesRole) => isAdmin || currentUserRoles.includes(role);

  const isSdrCurrent = ['VERIFIED', 'SDR_VALIDATED', 'CONTACTED', 'REPLIED', 'INTERESTED'].includes(client.status);
  const isCloserCurrent = ['QUALIFIED', 'DISCOVERY', 'OFFER', 'NEGOTIATION', 'PAYMENT_PENDING'].includes(client.status);

  // Observer helper info for researchers & non-active team members
  const isUserResearcher = currentUserId ? client.researcherId === currentUserId : currentUserRoles.includes('RESEARCHER');
  const userCommissionText = isUserResearcher
    ? `Ваша комиссия Researcher составляет ${client.researcherCommissionRate}% от суммы закрытия сделки.`
    : null;

  // 3. Render action area content
  let actionContent: React.ReactNode = null;

  // A. Terminal state WON
  if (client.status === 'WON') {
    actionContent = (
      <div className="crm-wizard-won-card">
        <div className="crm-wizard-won-header">
          <Trophy size={28} color="#86efac" />
          <div>
            <h3>🎉 Сделка успешно выиграна и оплачена!</h3>
            <p className="crm-muted" style={{ margin: 0 }}>
              Финальная сумма договора: <strong>{client.finalPrice} {client.currency}</strong> · Получено: <strong>{client.cashReceived} {client.currency}</strong>
            </p>
          </div>
        </div>
        {can('CLOSER') && (
          <details className="crm-wizard-alt" style={{ marginTop: '14px' }}>
            <summary>Внести доплату или обновить сумму оплаты...</summary>
            <div className="crm-wizard-alt-form">
              <WorkflowForm locale={locale} clientId={client.id} action="UPDATE_PAYMENT" button="Обновить оплату">
                <div className="crm-form-grid">
                  <label>
                    Стоимость договора
                    <input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required />
                  </label>
                  <label>
                    Всего фактически получено
                    <input name="cashReceived" type="number" min="0.01" step="0.01" defaultValue={client.cashReceived || ''} required />
                  </label>
                </div>
              </WorkflowForm>
            </div>
          </details>
        )}
      </div>
    );
  }

  // B. Terminal state REJECTED / LOST
  else if (['VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED', 'LOST'].includes(client.status)) {
    actionContent = (
      <div className="crm-wizard-lost-card">
        <h3>Воронка остановлена ({statusLabels[client.status]})</h3>
        <p style={{ margin: '4px 0 0', color: '#cbd5e1' }}>
          Причина: <strong>{client.lostReason || 'причина не была указана'}</strong>
        </p>
      </div>
    );
  }

  // C. Step 1: RESEARCHER (Status === RESEARCH)
  else if (client.status === 'RESEARCH') {
    const isResearcher = can('RESEARCHER') || (currentUserId && (client.researcherId === currentUserId || client.ownerId === currentUserId));
    if (isResearcher) {
      actionContent = (
        <div className="crm-wizard-action-area">
          <div className="crm-wizard-action-header">
            <span className="crm-wizard-step-label">Шаг 1 из 4 · Researcher</span>
            <h3>Подготовка и передача карточки лида</h3>
            <p>
              Карточка находится в вашем ведении. Вы можете проверить данные и при необходимости отредактировать их во вкладке «Редактировать». Когда всё готово к модерации, передайте карточку Verifier.
            </p>
          </div>
          <WorkflowForm
            locale={locale}
            clientId={client.id}
            action="RESEARCHER_SUBMIT"
            button={<>Далее: Отправить на проверку Verifier <ArrowRight size={16} /></>}
          >
            <label>
              Назначить Verifier
              <select name="nextOwnerId" defaultValue={client.verifierOwnerId || ''}>
                <option value="">Свободный пул (любой доступный Verifier)</option>
                {users
                  .filter((user) => user.salesRoles.includes('VERIFIER'))
                  .map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
              </select>
            </label>
          </WorkflowForm>
        </div>
      );
    } else {
      actionContent = (
        <div className="crm-wizard-observer-card">
          <Info size={20} />
          <div>
            <h4>Лид в работе у Researcher</h4>
            <p>
              Карточка заполняется и подготавливается сотрудником <strong>{client.researcherName}</strong>. Она ещё не отправлена на этап верификации.
            </p>
          </div>
        </div>
      );
    }
  }

  // D. Step 2: VERIFIER (Status === RAW)
  else if (client.status === 'RAW') {
    if (can('VERIFIER')) {
      actionContent = (
        <div className="crm-wizard-action-area">
          <div className="crm-wizard-action-header">
            <span className="crm-wizard-step-label">Шаг 2 из 4 · Verifier</span>
            <h3>Проверка компании и контактов</h3>
            <p>Убедитесь в актуальности гипотезы и наличии ЛПР. Если всё корректно, назначьте SDR и нажмите «Далее».</p>
          </div>
          <WorkflowForm
            locale={locale}
            clientId={client.id}
            action="VERIFIER_APPROVE"
            button={<>Далее: Подтвердить и передать SDR <ArrowRight size={16} /></>}
          >
            <OwnerSelect users={users} role="SDR" label="Назначить ответственного SDR *" />
          </WorkflowForm>
          <details className="crm-wizard-alt">
            <summary>Отклонить лид (не наш профиль, дубль, закрыт)...</summary>
            <div className="crm-wizard-alt-form">
              <WorkflowForm
                locale={locale}
                clientId={client.id}
                action="VERIFIER_REJECT"
                button="Отклонить лид"
              >
                <ReasonSelect reasons={verifierReasons} />
              </WorkflowForm>
            </div>
          </details>
        </div>
      );
    } else {
      actionContent = (
        <div className="crm-wizard-observer-card">
          <Info size={20} />
          <div>
            <h4>Лид ожидает проверки Verifier</h4>
            <p>
              Карточка находится на этапе модерации. Назначенный Verifier:{' '}
              <strong>{client.verifierOwnerName || 'Свободный пул'}</strong>.{' '}
              {userCommissionText}
            </p>
          </div>
        </div>
      );
    }
  }

  // D. Step 3: SDR (VERIFIED, SDR_VALIDATED, CONTACTED, REPLIED, INTERESTED)
  else if (isSdrCurrent) {
    if (can('SDR')) {
      if (client.status === 'VERIFIED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 3 из 4 · SDR приёмка</span>
              <h3>Приёмка проверенного лида</h3>
              <p>Verifier подтвердил качество лида. Подтвердите готовность к исходящему контакту.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="SDR_ACCEPT"
              button={<>Далее: Принять лид в работу <ArrowRight size={16} /></>}
            />
            <details className="crm-wizard-alt">
              <summary>Вернуть как некачественный...</summary>
              <div className="crm-wizard-alt-form">
                <WorkflowForm
                  locale={locale}
                  clientId={client.id}
                  action="SDR_REJECT"
                  button="Вернуть Verifier как брак"
                >
                  <ReasonSelect reasons={sdrReasons} />
                </WorkflowForm>
              </div>
            </details>
          </div>
        );
      } else if (client.status === 'SDR_VALIDATED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 3 из 4 · Первый контакт</span>
              <h3>Совершите первый исходящий контакт</h3>
              <p>
                Напишите клиенту в мессенджер, на почту или позвоните, а затем зафиксируйте контакт в блоке «Зафиксировать контакт» ниже на странице. Карточка автоматически перейдёт на шаг «Связались».
              </p>
            </div>
          </div>
        );
      } else if (client.status === 'CONTACTED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 3 из 4 · Ожидание ответа</span>
              <h3>Первый контакт отправлен</h3>
              <p>Когда клиент ответит на ваше сообщение или звонок, зафиксируйте факт ответа.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="SDR_REPLIED"
              button={<>Далее: Клиент ответил <ArrowRight size={16} /></>}
            />
          </div>
        );
      } else if (client.status === 'REPLIED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 3 из 4 · Проверка интереса</span>
              <h3>Клиент вышел на диалог</h3>
              <p>Если клиент подтвердил интерес к улучшению сайта, автоматизации или разработке, нажмите «Далее».</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="SDR_INTERESTED"
              button={<>Далее: Ответ положительный — есть интерес <ArrowRight size={16} /></>}
            />
          </div>
        );
      } else if (client.status === 'INTERESTED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 3 из 4 · Квалификация и передача</span>
              <h3>Интерес подтверждён! Передача Closer</h3>
              <p>Выберите ответственного Closer для проведения Discovery-сессии и подготовки коммерческого предложения.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="SDR_QUALIFY"
              button={<>Далее: Квалифицировать и передать Closer <ArrowRight size={16} /></>}
            >
              <OwnerSelect users={users} role="CLOSER" label="Назначить ответственного Closer *" />
            </WorkflowForm>
          </div>
        );
      }
    } else {
      actionContent = (
        <div className="crm-wizard-observer-card">
          <Info size={20} />
          <div>
            <h4>Лид на этапе коммуникации (SDR)</h4>
            <p>
              Ответственный SDR: <strong>{client.sdrOwnerName || 'Назначенный сотрудник'}</strong> · Текущий статус: <strong>{statusLabels[client.status]}</strong>. {userCommissionText}
            </p>
          </div>
        </div>
      );
    }
  }

  // E. Step 4: CLOSER (QUALIFIED, DISCOVERY, OFFER, NEGOTIATION, PAYMENT_PENDING)
  else if (isCloserCurrent) {
    if (can('CLOSER')) {
      if (client.status === 'QUALIFIED') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 4 из 4 · Closer приёмка</span>
              <h3>Приёмка квалифицированного лида</h3>
              <p>SDR передал лид с подтверждённым интересом. Проверьте карточку и начните этап Discovery.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="CLOSER_ACCEPT"
              button={<>Далее: Начать Discovery <ArrowRight size={16} /></>}
            />
            <details className="crm-wizard-alt">
              <summary>Вернуть SDR как неквалифицированный...</summary>
              <div className="crm-wizard-alt-form">
                <WorkflowForm
                  locale={locale}
                  clientId={client.id}
                  action="CLOSER_REJECT"
                  button="Вернуть SDR как Not Qualified"
                >
                  <ReasonSelect reasons={qualificationReasons} />
                </WorkflowForm>
              </div>
            </details>
          </div>
        );
      } else if (client.status === 'DISCOVERY') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 4 из 4 · Discovery и оффер</span>
              <h3>Фиксация Discovery и подготовка предложения</h3>
              <p>Заполните ключевые договоренности с клиентом, выберите пакет и зафиксируйте предложение.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="CLOSER_OFFER"
              button={<>Далее: Зафиксировать отправленное предложение <ArrowRight size={16} /></>}
            >
              <div className="crm-form-grid">
                <label>
                  Decision maker *
                  <input name="decisionMaker" required placeholder="Имя и должность принимающего решение" />
                </label>
                <label>
                  Бюджет *
                  <input name="budgetNotes" required placeholder="Диапазон или «до $1000»" />
                </label>
                <label>
                  Желаемый срок *
                  <input name="desiredTimeline" required placeholder="Например, 10–14 дней" />
                </label>
                <label>
                  Пакет услуги *
                  <select name="servicePackage" required defaultValue="">
                    <option value="" disabled>Выберите пакет</option>
                    <option value="LANDING">Landing · $200–400</option>
                    <option value="SITE_FIX">Site Fix · $105–300</option>
                    <option value="AUTOMATION">Automation · $200–700</option>
                    <option value="PAYMENTS">Payments · $250–700</option>
                    <option value="CUSTOM">Нестандартная задача</option>
                  </select>
                </label>
              </div>
              <label>
                Что выяснили на Discovery *
                <textarea name="discoveryNotes" required rows={3} placeholder="Проблемы, цели, технические ограничения" />
              </label>
              <label>
                Предлагаемое решение *
                <textarea name="proposedSolution" required defaultValue={client.suggestedService || ''} rows={3} />
              </label>
              <div className="crm-form-grid">
                <label>
                  Стоимость договора *
                  <input name="finalPrice" type="number" min="0.01" step="0.01" required />
                </label>
                <label>
                  Валюта
                  <select name="currency" defaultValue={client.currency}>
                    <option>USD</option>
                    <option>ARS</option>
                    <option>EUR</option>
                  </select>
                </label>
              </div>
              <label className="crm-check" style={{ marginTop: '8px' }}>
                <input type="checkbox" name="technicalEstimateNeeded" />
                Требуется техническая оценка тимлида
              </label>
            </WorkflowForm>
          </div>
        );
      } else if (client.status === 'OFFER') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 4 из 4 · Предложение отправлено</span>
              <h3>Оффер передан клиенту</h3>
              <p>Ожидается реакция клиента. Если клиент готов обсуждать детали и согласовывать договор, нажмите «Далее».</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="CLOSER_NEGOTIATION"
              button={<>Далее: Перейти к переговорам <ArrowRight size={16} /></>}
            />
            <details className="crm-wizard-alt">
              <summary>Другие действия (оплата сразу / проигрыш)...</summary>
              <div className="crm-wizard-alt-form">
                <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_PAYMENT_PENDING" button="Клиент сразу согласился — ожидать оплату">
                  <label>
                    Финальная стоимость договора
                    <input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required />
                  </label>
                </WorkflowForm>
                <div style={{ marginTop: '12px' }}>
                  <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_LOST" button="Закрыть сделку как проигранную">
                    <ReasonSelect reasons={lostReasons} />
                  </WorkflowForm>
                </div>
              </div>
            </details>
          </div>
        );
      } else if (client.status === 'NEGOTIATION') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 4 из 4 · Переговоры</span>
              <h3>Согласование условий договора</h3>
              <p>Когда условия и финальный чек согласованы, переведите сделку на этап выставления счёта и ожидания оплаты.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="CLOSER_PAYMENT_PENDING"
              button={<>Далее: Условия согласованы — ожидать оплату <ArrowRight size={16} /></>}
            >
              <label>
                Итоговая согласованная стоимость договора *
                <input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required />
              </label>
            </WorkflowForm>
            <details className="crm-wizard-alt">
              <summary>Клиент отказался на переговорах...</summary>
              <div className="crm-wizard-alt-form">
                <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_LOST" button="Закрыть как проигранную">
                  <ReasonSelect reasons={lostReasons} />
                </WorkflowForm>
              </div>
            </details>
          </div>
        );
      } else if (client.status === 'PAYMENT_PENDING') {
        actionContent = (
          <div className="crm-wizard-action-area">
            <div className="crm-wizard-action-header">
              <span className="crm-wizard-step-label">Шаг 4 из 4 · Ожидание оплаты</span>
              <h3>Счёт выставлен клиенту</h3>
              <p>После поступления первого платежа или полной суммы зафиксируйте оплату для закрытия сделки.</p>
            </div>
            <WorkflowForm
              locale={locale}
              clientId={client.id}
              action="CLOSER_WON"
              button={<>Далее: Оплата поступила — закрыть сделку! <Trophy size={16} /></>}
            >
              <div className="crm-form-grid">
                <label>
                  Финальная сумма договора *
                  <input name="finalPrice" type="number" min="0.01" step="0.01" defaultValue={client.finalPrice || ''} required />
                </label>
                <label>
                  Фактически получено (предоплата или 100%) *
                  <input name="cashReceived" type="number" min="0.01" step="0.01" defaultValue={client.cashReceived || client.finalPrice || ''} required />
                </label>
              </div>
            </WorkflowForm>
            <details className="crm-wizard-alt">
              <summary>Клиент передумал платить...</summary>
              <div className="crm-wizard-alt-form">
                <WorkflowForm locale={locale} clientId={client.id} action="CLOSER_LOST" button="Закрыть как отказ">
                  <ReasonSelect reasons={lostReasons} />
                </WorkflowForm>
              </div>
            </details>
          </div>
        );
      }
    } else {
      actionContent = (
        <div className="crm-wizard-observer-card">
          <Info size={20} />
          <div>
            <h4>Лид на этапе закрытия сделки (Closer)</h4>
            <p>
              Ответственный Closer: <strong>{client.closerOwnerName || 'Назначенный сотрудник'}</strong> · Текущий шаг: <strong>{statusLabels[client.status]}</strong>. {userCommissionText}
            </p>
          </div>
        </div>
      );
    }
  }

  return actionContent;
}
