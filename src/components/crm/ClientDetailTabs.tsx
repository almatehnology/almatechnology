'use client';

import { useState } from 'react';
import {
  Zap,
  FileText,
  ListChecks,
  MessageSquare,
  History,
  ShieldCheck,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import type { ClientRow, TaskRow, InteractionRow, TransferRow, ReviewRow, PipelineEventRow } from '@/lib/crm';
import type { SalesRole } from '@/lib/crm-types';
import { formatDateTime, interactionChannelLabels, sourceCategoryLabels, statusLabels } from '@/lib/crm-format';
import { TaskCard } from './TaskCard';
import { ClientForm } from './ClientForm';
import { ArchiveClientButton } from './ArchiveClientButton';
import { WorkflowPanel } from './WorkflowPanel';
import { InteractionForm } from './InteractionForm';
import { NewTaskForm } from './TaskForms';
import { TransferForm } from './TransferForm';

type TeamUser = { id: string; name: string; salesRoles: SalesRole[] };

type ClientDetailTabsProps = {
  locale: string;
  client: ClientRow;
  tasks: TaskRow[];
  interactions: InteractionRow[];
  transfers: TransferRow[];
  reviews: ReviewRow[];
  pipelineEvents: PipelineEventRow[];
  users: TeamUser[];
  currentUserRoles: SalesRole[];
  currentUserId: string;
  isAdmin: boolean;
  commissionPool: number;
};

type TabId = 'actions' | 'card' | 'tasks' | 'interactions' | 'history' | 'reviews' | 'edit';

export function ClientDetailTabs({
  locale,
  client,
  tasks,
  interactions,
  transfers,
  reviews,
  pipelineEvents,
  users,
  currentUserRoles,
  currentUserId,
  isAdmin,
  commissionPool,
}: ClientDetailTabsProps) {
  // First tab is 'actions' (Текущие действия)
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  const openTasks = tasks.filter((t) => t.status === 'OPEN');
  const canComplete = (task: { assigneeId: string }) => isAdmin || task.assigneeId === currentUserId;

  const isLeadActive = !['RESEARCH', 'RAW', 'VERIFIER_REJECTED'].includes(client.status);
  const canUseWorkingTools =
    client.canEdit &&
    isLeadActive &&
    (isAdmin || currentUserRoles.includes('SDR') || currentUserRoles.includes('CLOSER'));

  return (
    <div className="crm-detail-tabs-container">
      {/* Tab Navigation */}
      <div className="crm-detail-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'actions'}
          className={`crm-detail-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <Zap size={15} />
          Текущие действия
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'card'}
          className={`crm-detail-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
          onClick={() => setActiveTab('card')}
        >
          <FileText size={15} />
          Карточка лида
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tasks'}
          className={`crm-detail-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListChecks size={15} />
          Задачи
          <span className={`crm-tab-badge ${openTasks.length > 0 ? 'highlight' : ''}`}>
            {openTasks.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'interactions'}
          className={`crm-detail-tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <MessageSquare size={15} />
          История контактов
          <span className="crm-tab-badge">{interactions.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`crm-detail-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={15} />
          История этапов
          <span className="crm-tab-badge">{pipelineEvents.length + transfers.length}</span>
        </button>

        {reviews.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            className={`crm-detail-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <ShieldCheck size={15} />
            Контроль качества
            <span className="crm-tab-badge">{reviews.length}</span>
          </button>
        )}

        {client.canEdit && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'edit'}
            className={`crm-detail-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 size={15} />
            Редактировать
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="crm-tab-panel">
        {/* 1. ТЕКУЩИЕ ДЕЙСТВИЯ (Главный рабочий таб) */}
        {activeTab === 'actions' && (
          <div style={{ display: 'grid', gap: '22px' }}>
            {/* Визард-действие текущей стадии */}
            <WorkflowPanel
              locale={locale}
              client={client}
              users={users}
              currentUserRoles={currentUserRoles}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />

            {/* Рабочие инструменты менеджера (SDR / Closer) */}
            {canUseWorkingTools && (
              <div className="crm-working-tools-block">
                <div className="crm-section-heading">
                  <h2>Рабочие инструменты</h2>
                  <span>Фиксация коммуникации, задачи и передача</span>
                </div>
                <div className="crm-action-grid">
                  <InteractionForm
                    locale={locale}
                    clientId={client.id}
                    users={users}
                    defaultAssigneeId={client.ownerId}
                  />
                  <NewTaskForm
                    locale={locale}
                    clientId={client.id}
                    users={users}
                    defaultAssigneeId={client.ownerId}
                  />
                  <TransferForm
                    locale={locale}
                    clientId={client.id}
                    users={users}
                    currentOwnerId={client.ownerId}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Карточка лида */}
        {activeTab === 'card' && (
          <section className="crm-card">
            <h2>Данные лида</h2>
            <dl className="crm-data-list">
              <div>
                <dt>1. Контактное лицо</dt>
                <dd>{client.contactName || '—'}{client.position ? `, ${client.position}` : ''}</dd>
              </div>
              <div>
                <dt>2. Ниша / сфера</dt>
                <dd>{client.industry || '—'}</dd>
              </div>
              <div>
                <dt>3. Город / страна</dt>
                <dd>{[client.city, client.country].filter(Boolean).join(', ') || '—'}</dd>
              </div>
              <div>
                <dt>4. Категория источника</dt>
                <dd>{client.sourceCategory ? sourceCategoryLabels[client.sourceCategory] || client.sourceCategory : '—'}</dd>
              </div>
              <div>
                <dt>5. Площадка</dt>
                <dd>
                  {client.sourcePlatform || client.source || '—'}
                  {client.sourceDetail ? ` (${client.sourceDetail})` : ''}
                </dd>
              </div>
              <div>
                <dt>6. Ссылка на источник</dt>
                <dd>
                  {client.sourceUrl ? (
                    <a href={client.sourceUrl} target="_blank" rel="noreferrer" className="crm-ext-link">
                      Открыть <ExternalLink size={13} style={{ display: 'inline', marginLeft: 3, verticalAlign: 'middle' }} />
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div><dt>7. Researcher</dt><dd>{client.researcherName}</dd></div>
              <div><dt>8. Verifier</dt><dd>{client.verifiedByName || client.verifierOwnerName || '—'}</dd></div>
              <div><dt>9. SDR</dt><dd>{client.sdrOwnerName || '—'}</dd></div>
              <div><dt>10. Closer</dt><dd>{client.closerOwnerName || '—'}</dd></div>
              <div><dt>11. Ориентир бюджета</dt><dd>{client.estimatedValue ? `${client.estimatedValue} ${client.currency}` : '—'}</dd></div>
              <div><dt>12. Стоимость договора</dt><dd>{client.finalPrice ? `${client.finalPrice} ${client.currency}` : '—'}</dd></div>
              <div><dt>13. Фактически получено</dt><dd>{client.cashReceived ? `${client.cashReceived} ${client.currency}` : '—'}</dd></div>
              <div><dt>14. Комиссионный пул</dt><dd>{client.cashReceived ? `${commissionPool} ${client.currency}` : '—'}</dd></div>
              <div><dt>15. Пакет услуги</dt><dd>{client.servicePackage || '—'}</dd></div>
              <div><dt>16. Decision maker</dt><dd>{client.decisionMaker || '—'}</dd></div>
              <div><dt>17. Бюджет клиента</dt><dd>{client.budgetNotes || '—'}</dd></div>
              <div><dt>18. Желаемый срок</dt><dd>{client.desiredTimeline || '—'}</dd></div>
              <div><dt>19. Последний контакт</dt><dd>{formatDateTime(client.lastContactAt)}</dd></div>
              <div><dt>20. Техническая оценка</dt><dd>{client.technicalEstimateNeeded ? 'Нужна' : 'Нет'}</dd></div>
              <div><dt>21. Срок владения до</dt><dd>{formatDateTime(client.ownershipExpiresAt)}</dd></div>
            </dl>

            <div className="crm-insight">
              <small>22. ЗАМЕЧЕННАЯ ПРОБЛЕМА</small>
              <p className={client.observedProblem ? '' : 'crm-muted'}>{client.observedProblem || '—'}</p>
            </div>
            <div className="crm-insight">
              <small>23. СОГЛАСОВАННОЕ РЕШЕНИЕ</small>
              <p className={client.suggestedService ? '' : 'crm-muted'}>{client.suggestedService || '—'}</p>
            </div>
            {client.discoveryNotes && (
              <div className="crm-insight">
                <small>24. DISCOVERY</small>
                <p>{client.discoveryNotes}</p>
              </div>
            )}
            {client.generalNotes && (
              <div className="crm-insight">
                <small>25. ЗАМЕТКИ</small>
                <p>{client.generalNotes}</p>
              </div>
            )}
          </section>
        )}

        {/* 3. Задачи */}
        {activeTab === 'tasks' && (
          <section className="crm-card">
            <div className="crm-section-heading">
              <h2>Открытые задачи</h2>
              <span>{openTasks.length}</span>
            </div>
            {openTasks.length ? (
              <div className="crm-task-list">
                {openTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    locale={locale}
                    users={users}
                    currentUserId={currentUserId}
                    canComplete={canComplete(task)}
                  />
                ))}
              </div>
            ) : (
              <div className="crm-empty">
                Пока нет открытых задач по этому клиенту.
              </div>
            )}
          </section>
        )}

        {/* 4. История контактов */}
        {activeTab === 'interactions' && (
          <section className="crm-card">
            <div className="crm-section-heading">
              <h2>История контактов</h2>
              <span>{interactions.length}</span>
            </div>
            {interactions.length ? (
              <div className="crm-timeline">
                {interactions.map((interaction) => (
                  <article key={interaction.id}>
                    <div>
                      <strong>{interactionChannelLabels[interaction.channel]}</strong>
                      <span>
                        {interaction.direction === 'OUTBOUND' ? 'Исходящий' : 'Входящий'} · {formatDateTime(interaction.occurredAt)} · {interaction.authorName}
                      </span>
                    </div>
                    <p>{interaction.result}</p>
                    {interaction.sentItems && <small><b>Отправили:</b> {interaction.sentItems}</small>}
                    {interaction.expectedFromClient && <small><b>Ожидаем:</b> {interaction.expectedFromClient}</small>}
                    {interaction.notes && <small><b>Заметка:</b> {interaction.notes}</small>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="crm-empty">Контактов ещё нет.</div>
            )}
          </section>
        )}

        {/* 5. История этапов и передач */}
        {activeTab === 'history' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <section className="crm-card">
              <div className="crm-section-heading">
                <h2>История движения по этапам</h2>
                <span>{pipelineEvents.length}</span>
              </div>
              {pipelineEvents.length ? (
                <div className="crm-timeline">
                  {pipelineEvents.map((event) => (
                    <article key={event.id}>
                      <div>
                        <strong>
                          {event.fromStage ? `${statusLabels[event.fromStage] || event.fromStage} → ` : ''}
                          {statusLabels[event.toStage] || event.toStage}
                        </strong>
                        <span>{formatDateTime(event.createdAt)} · {event.actorName}</span>
                      </div>
                      {event.reason && <p>{event.reason}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="crm-empty">История движения по воронке пуста.</div>
              )}
            </section>

            {transfers.length > 0 && (
              <section className="crm-card">
                <div className="crm-section-heading">
                  <h2>История передач лида</h2>
                  <span>{transfers.length}</span>
                </div>
                <div className="crm-timeline">
                  {transfers.map((transfer) => (
                    <article key={transfer.id}>
                      <div>
                        <strong>{transfer.fromName} → {transfer.toName}</strong>
                        <span>{formatDateTime(transfer.createdAt)} · {transfer.transferredByName}</span>
                      </div>
                      {transfer.reason && <p>{transfer.reason}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* 6. Контроль качества */}
        {activeTab === 'reviews' && reviews.length > 0 && (
          <section className="crm-card">
            <div className="crm-section-heading">
              <h2>Контроль качества</h2>
              <span>{reviews.length}</span>
            </div>
            <div className="crm-timeline">
              {reviews.map((review) => (
                <article key={review.id}>
                  <div>
                    <strong>{review.result === 'VALID' ? '✅ Valid' : '❌ Invalid'} · {review.reviewType.replaceAll('_', ' ')}</strong>
                    <span>{formatDateTime(review.createdAt)} · {review.reviewerName}</span>
                  </div>
                  <p>Оценка работы: {review.subjectName || '—'}</p>
                  {review.reason && <small><b>Причина:</b> {review.reason}</small>}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 7. Редактирование карточки */}
        {activeTab === 'edit' && client.canEdit && (
          <section className="crm-card">
            <h2>Редактирование карточки</h2>
            <ClientForm locale={locale} users={users} client={client} isAdmin={isAdmin} />
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #282a32' }}>
              <ArchiveClientButton locale={locale} clientId={client.id} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
