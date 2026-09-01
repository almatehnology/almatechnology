import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { ArchiveClientButton } from '@/components/crm/ArchiveClientButton';
import { ClientForm } from '@/components/crm/ClientForm';
import { ClaimClientButton } from '@/components/crm/ClaimClientButton';
import { CrmShell } from '@/components/crm/CrmShell';
import { InteractionForm } from '@/components/crm/InteractionForm';
import { TaskCard } from '@/components/crm/TaskCard';
import { NewTaskForm } from '@/components/crm/TaskForms';
import { TransferForm } from '@/components/crm/TransferForm';
import { WorkflowPanel } from '@/components/crm/WorkflowPanel';
import { getClientDetails, listActiveUsers } from '@/lib/crm';
import { formatDateTime, interactionChannelLabels, statusLabels } from '@/lib/crm-format';
import { requireUser } from '@/lib/session';

export default async function ClientDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requireUser(locale);
  const details = getClientDetails(user, id);
  if (!details) notFound();
  const { client, interactions, tasks, transfers, reviews, pipelineEvents } = details;
  const users = listActiveUsers().map((item) => ({ id: item.id, name: item.name, salesRoles: item.salesRoles }));
  const title = client.companyName || client.contactName;
  const canComplete = (task: { assigneeId: string }) => user.role === 'admin' || task.assigneeId === user.id;
  const commissionPool = Math.round(client.cashReceived * (client.researcherCommissionRate + client.verifierCommissionRate + client.sdrCommissionRate + client.closerCommissionRate)) / 100;
  const canClaim = !client.canEdit && client.ownershipExpired && !['WON', 'LOST', 'VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED'].includes(client.status);

  return <CrmShell user={user} locale={locale}><div className="crm-page">
    <Link className="crm-back" href={`/${locale}/crm/clients`}><ArrowLeft size={17} />К списку клиентов</Link>
    <header className="crm-client-header">
      <div><p className="crm-eyebrow">КЛИЕНТ</p><h1>{title}</h1><span className={`crm-status ${client.status.toLowerCase()}`}>{statusLabels[client.status]}</span><p>Ответственный: <strong>{client.ownerName}</strong></p></div>
      <div className="crm-contact-links">{client.phone && <a href={`tel:${client.phone}`}><Phone size={17} />{client.phone}</a>}{client.email && <a href={`mailto:${client.email}`}><Mail size={17} />{client.email}</a>}{client.messenger && <span><MessageCircle size={17} />{client.messenger}</span>}{client.website && <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noreferrer"><ExternalLink size={17} />Сайт</a>}</div>
    </header>
    {canClaim && <section className="crm-card crm-pool-notice"><div><strong>Срок владения истёк</strong><p>Лид вернулся в общий пул и может быть принят сотрудником подходящего этапа.</p></div><ClaimClientButton locale={locale} clientId={client.id} /></section>}

    <div className="crm-detail-grid">
      <section className="crm-card"><h2>Карточка лида</h2><dl className="crm-data-list">
        <div><dt>Контакт</dt><dd>{client.contactName || '—'}{client.position ? `, ${client.position}` : ''}</dd></div>
        <div><dt>Ниша</dt><dd>{client.industry || '—'}</dd></div><div><dt>Город / страна</dt><dd>{[client.city, client.country].filter(Boolean).join(', ') || '—'}</dd></div><div><dt>Источник</dt><dd>{client.source || '—'}</dd></div>
        <div><dt>Researcher</dt><dd>{client.researcherName}</dd></div><div><dt>Verifier</dt><dd>{client.verifiedByName || client.verifierOwnerName || '—'}</dd></div><div><dt>SDR</dt><dd>{client.sdrOwnerName || '—'}</dd></div><div><dt>Closer</dt><dd>{client.closerOwnerName || '—'}</dd></div>
        <div><dt>Ориентир</dt><dd>{client.estimatedValue ? `${client.estimatedValue} ${client.currency}` : '—'}</dd></div><div><dt>Стоимость договора</dt><dd>{client.finalPrice ? `${client.finalPrice} ${client.currency}` : '—'}</dd></div><div><dt>Фактически получено</dt><dd>{client.cashReceived ? `${client.cashReceived} ${client.currency}` : '—'}</dd></div><div><dt>Комиссионный пул</dt><dd>{client.cashReceived ? `${commissionPool} ${client.currency}` : '—'}</dd></div>
        <div><dt>Пакет</dt><dd>{client.servicePackage || '—'}</dd></div><div><dt>Decision maker</dt><dd>{client.decisionMaker || '—'}</dd></div><div><dt>Бюджет</dt><dd>{client.budgetNotes || '—'}</dd></div><div><dt>Желаемый срок</dt><dd>{client.desiredTimeline || '—'}</dd></div>
        <div><dt>Последний контакт</dt><dd>{formatDateTime(client.lastContactAt)}</dd></div><div><dt>Техническая оценка</dt><dd>{client.technicalEstimateNeeded ? 'Нужна' : 'Нет'}</dd></div>
        <div><dt>Владение до</dt><dd>{formatDateTime(client.ownershipExpiresAt)}</dd></div>
      </dl>
      {client.observedProblem && <div className="crm-insight"><small>ЗАМЕЧЕННАЯ ПРОБЛЕМА</small><p>{client.observedProblem}</p></div>}
      {client.suggestedService && <div className="crm-insight"><small>СОГЛАСОВАННОЕ РЕШЕНИЕ</small><p>{client.suggestedService}</p></div>}
      {client.discoveryNotes && <div className="crm-insight"><small>DISCOVERY</small><p>{client.discoveryNotes}</p></div>}
      {client.generalNotes && <div className="crm-insight"><small>ЗАМЕТКИ</small><p>{client.generalNotes}</p></div>}</section>
      <section className="crm-card"><h2>Открытые задачи</h2>{tasks.filter((task) => task.status === 'OPEN').length ? <div className="crm-task-list">{tasks.filter((task) => task.status === 'OPEN').map((task) => <TaskCard key={task.id} task={task} locale={locale} users={users} currentUserId={user.id} canComplete={canComplete(task)} />)}</div> : <p className="crm-muted">Пока нет следующего действия. Создайте задачу, чтобы не потерять лид.</p>}</section>
    </div>

    <section className="crm-section"><WorkflowPanel locale={locale} client={client} users={users} currentUserRoles={user.salesRoles} isAdmin={user.role === 'admin'} /></section>
    {client.canEdit && <div className="crm-action-grid"><InteractionForm locale={locale} clientId={client.id} users={users} defaultAssigneeId={client.ownerId} /><NewTaskForm locale={locale} clientId={client.id} users={users} defaultAssigneeId={client.ownerId} /><TransferForm locale={locale} clientId={client.id} users={users} currentOwnerId={client.ownerId} /></div>}

    <section className="crm-section"><div className="crm-section-heading"><h2>История контактов</h2><span>{interactions.length}</span></div>{interactions.length ? <div className="crm-timeline">{interactions.map((interaction) => <article key={interaction.id}><div><strong>{interactionChannelLabels[interaction.channel]}</strong><span>{interaction.direction === 'OUTBOUND' ? 'Исходящий' : 'Входящий'} · {formatDateTime(interaction.occurredAt)} · {interaction.authorName}</span></div><p>{interaction.result}</p>{interaction.sentItems && <small><b>Отправили:</b> {interaction.sentItems}</small>}{interaction.expectedFromClient && <small><b>Ожидаем:</b> {interaction.expectedFromClient}</small>}{interaction.notes && <small><b>Заметка:</b> {interaction.notes}</small>}</article>)}</div> : <div className="crm-empty">Контактов ещё нет. Зафиксируйте первый результат общения.</div>}</section>
    {transfers.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>Передачи</h2></div><div className="crm-timeline">{transfers.map((transfer) => <article key={transfer.id}><div><strong>{transfer.fromName} → {transfer.toName}</strong><span>{formatDateTime(transfer.createdAt)} · {transfer.transferredByName}</span></div>{transfer.reason && <p>{transfer.reason}</p>}</article>)}</div></section>}
    {reviews.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>Контроль качества</h2><span>{reviews.length}</span></div><div className="crm-timeline">{reviews.map((review) => <article key={review.id}><div><strong>{review.result === 'VALID' ? '✅ Valid' : '❌ Invalid'} · {review.reviewType.replaceAll('_', ' ')}</strong><span>{formatDateTime(review.createdAt)} · {review.reviewerName}</span></div><p>Оценка работы: {review.subjectName || '—'}</p>{review.reason && <small><b>Причина:</b> {review.reason}</small>}</article>)}</div></section>}
    {pipelineEvents.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>История этапов</h2></div><div className="crm-timeline">{pipelineEvents.map((event) => <article key={event.id}><div><strong>{event.fromStage ? `${statusLabels[event.fromStage] || event.fromStage} → ` : ''}{statusLabels[event.toStage] || event.toStage}</strong><span>{formatDateTime(event.createdAt)} · {event.actorName}</span></div>{event.reason && <p>{event.reason}</p>}</article>)}</div></section>}
    {client.canEdit && <details className="crm-edit-details"><summary>Редактировать карточку клиента</summary><ClientForm locale={locale} users={users} client={client} isAdmin={user.role === 'admin'} /><ArchiveClientButton locale={locale} clientId={client.id} /></details>}
  </div></CrmShell>;
}
