import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { ClaimClientButton } from '@/components/crm/ClaimClientButton';
import { ClientDetailTabs } from '@/components/crm/ClientDetailTabs';
import { CrmShell } from '@/components/crm/CrmShell';
import { PipelineStepper } from '@/components/crm/PipelineStepper';
import { getClientDetails, listActiveUsers } from '@/lib/crm';
import { statusLabels } from '@/lib/crm-format';
import { requireUser } from '@/lib/session';

export default async function ClientDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requireUser(locale);
  const details = getClientDetails(user, id);
  if (!details) notFound();
  const { client, interactions, tasks, transfers, reviews, pipelineEvents } = details;
  const users = listActiveUsers().map((item) => ({ id: item.id, name: item.name, salesRoles: item.salesRoles }));
  const title = (client.companyName && client.companyName.trim() !== '-')
    ? client.companyName
    : (client.contactName?.trim() || client.suggestedService || client.sourcePlatform || 'Лид');
  const commissionPool = Math.round(
    (client.cashReceived || 0) *
    ((client.researcherCommissionRate || 0) + (client.verifierCommissionRate || 0) + (client.sdrCommissionRate || 0) + (client.closerCommissionRate || 0))
  ) / 100;
  const canClaim = !client.canEdit && client.ownershipExpired && !['WON', 'LOST', 'VERIFIER_REJECTED', 'SDR_REJECTED', 'NOT_QUALIFIED'].includes(client.status);

  return (
    <CrmShell user={user} locale={locale}>
      <div className="crm-page">
        <Link className="crm-back" href={`/${locale}/crm/clients`}>
          <ArrowLeft size={17} />К списку клиентов
        </Link>

        {/* Client Header */}
        <header className="crm-client-header">
          <div>
            <p className="crm-eyebrow">КЛИЕНТ</p>
            <h1>{title}</h1>
            <span className={`crm-status ${client.status.toLowerCase()}`}>
              {statusLabels[client.status]}
            </span>
            <p>Ответственный: <strong>{client.ownerName}</strong></p>
          </div>
          <div className="crm-contact-links">
            {client.sourceUrl && (
              <a href={client.sourceUrl} target="_blank" rel="noreferrer" title="Открыть первоисточник">
                <ExternalLink size={17} />
                {client.sourcePlatform || 'Источник'}
              </a>
            )}
            {client.phone?.trim() && <a href={`tel:${client.phone.trim()}`}><Phone size={17} />{client.phone.trim()}</a>}
            {client.email?.trim() && <a href={`mailto:${client.email.trim()}`}><Mail size={17} />{client.email.trim()}</a>}
            {client.messenger?.trim() && <span><MessageCircle size={17} />{client.messenger.trim()}</span>}
            {client.website?.trim() && (
              <a href={client.website.trim().startsWith('http') ? client.website.trim() : `https://${client.website.trim()}`} target="_blank" rel="noreferrer">
                <ExternalLink size={17} />Сайт
              </a>
            )}
          </div>
        </header>

        {/* Claim pool notification if ownership expired */}
        {canClaim && (
          <section className="crm-card crm-pool-notice">
            <div>
              <strong>Срок владения истёк</strong>
              <p>Лид вернулся в общий пул и может быть принят сотрудником подходящего этапа.</p>
            </div>
            <ClaimClientButton locale={locale} clientId={client.id} />
          </section>
        )}

        {/* Standalone 4-Stage Stepper without nested boxes */}
        <PipelineStepper client={client} />

        {/* Tabbed workspace: Tab 1 (Текущие действия) with workflow actions and working tools, followed by Card, Tasks, Contacts, History, Quality, Edit */}
        <ClientDetailTabs
          locale={locale}
          client={client}
          tasks={tasks}
          interactions={interactions}
          transfers={transfers}
          reviews={reviews}
          pipelineEvents={pipelineEvents}
          users={users}
          currentUserRoles={user.salesRoles}
          currentUserId={user.id}
          isAdmin={user.role === 'admin'}
          commissionPool={commissionPool}
        />
      </div>
    </CrmShell>
  );
}
