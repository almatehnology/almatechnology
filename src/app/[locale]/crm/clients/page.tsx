import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { CrmShell } from '@/components/crm/CrmShell';
import { listActiveUsers, listClients, SOURCE_CATEGORIES, type ClientFilters } from '@/lib/crm';
import { formatDateTime, sourceCategoryLabels, sourceCategoryShortLabels, statusLabels } from '@/lib/crm-format';
import { requireUser } from '@/lib/session';

type SearchParams = {
  scope?: 'mine' | 'all' | 'pool' | 'archived';
  status?: string;
  ownerId?: string;
  search?: string;
  attention?: 'overdue' | 'no_next_task';
  sourceCategory?: string;
  sourcePlatform?: string;
};

export default async function ClientsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const filters = await searchParams;
  const selected: ClientFilters = {
    scope: filters.scope || 'mine',
    status: filters.status,
    ownerId: filters.ownerId,
    search: filters.search,
    attention: filters.attention,
    sourceCategory: filters.sourceCategory,
    sourcePlatform: filters.sourcePlatform,
  };
  const clients = listClients(user, selected);
  const users = listActiveUsers();
  const base = `/${locale}/crm/clients`;

  return <CrmShell user={user} locale={locale}><div className="crm-page">
    <header className="crm-page-header"><div><p className="crm-eyebrow">БАЗА ЛИДОВ</p><h1>Клиенты</h1><p>Каждая активная карточка должна иметь ответственного и следующее действие.</p></div><Link className="crm-button" href={`${base}/new`}><Plus size={17} />Новый клиент</Link></header>
    <div className="crm-tabs"><Link href={base} className={selected.scope === 'mine' ? 'active' : ''}>Мои</Link><Link href={`${base}?scope=all`} className={selected.scope === 'all' ? 'active' : ''}>Все</Link><Link href={`${base}?scope=pool`} className={selected.scope === 'pool' ? 'active' : ''}>Общий пул</Link>{user.role === 'admin' && <Link href={`${base}?scope=archived`} className={selected.scope === 'archived' ? 'active' : ''}>Архив</Link>}</div>
    <form className="crm-filter-bar" action={base}>
      <input type="hidden" name="scope" value={selected.scope} />
      <label className="crm-search"><Search size={17} /><input name="search" defaultValue={selected.search} placeholder="Компания, человек, email, телефон, источник" /></label>
      <select name="status" defaultValue={selected.status || ''}><option value="">Все статусы</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select name="sourceCategory" defaultValue={selected.sourceCategory || ''}>
        <option value="">Все категории источников</option>
        {SOURCE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{sourceCategoryLabels[cat]}</option>
        ))}
      </select>
      <input name="sourcePlatform" defaultValue={selected.sourcePlatform || ''} placeholder="Площадка (Upwork, TG…)" style={{ minWidth: 150 }} />
      {(user.role === 'admin' || selected.scope === 'all') && <select name="ownerId" defaultValue={selected.ownerId || ''}><option value="">Все ответственные</option>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      <select name="attention" defaultValue={selected.attention || ''}><option value="">Все действия</option><option value="overdue">Есть просрочка</option><option value="no_next_task">Нет следующего шага</option></select>
      <button className="crm-button secondary" type="submit">Фильтровать</button>
    </form>
    <section className="crm-table-card"><div className="crm-table-scroll"><table className="crm-table"><thead><tr><th>Клиент</th><th>Источник</th><th>Ниша / локация</th><th>Проблема и решение</th><th>Статус</th><th>Ответственный</th><th>Следующее действие</th></tr></thead><tbody>{clients.map((client) => <tr key={client.id}><td><Link href={`${base}/${client.id}`}><strong>{client.companyName || client.contactName}</strong><small>{client.companyName && client.contactName ? client.contactName : client.email || client.phone || 'Контакт не указан'}</small></Link></td><td>{client.sourcePlatform || client.sourceCategory ? <div><strong>{client.sourcePlatform || (client.sourceCategory ? sourceCategoryShortLabels[client.sourceCategory] : '—')}</strong><small>{client.sourceCategory ? sourceCategoryShortLabels[client.sourceCategory] || client.sourceCategory : ''}{client.sourceDetail ? ` · ${client.sourceDetail}` : ''}{client.sourceUrl && <a href={client.sourceUrl} target="_blank" rel="noreferrer" className="crm-source-link" title="Открыть первоисточник" onClick={(e) => e.stopPropagation()}>↗</a>}</small></div> : <span>{client.source || '—'}</span>}</td><td><span>{client.industry || '—'}</span><small>{[client.city, client.country].filter(Boolean).join(', ') || '—'}</small></td><td><span>{client.observedProblem || '—'}</span><small>{client.suggestedService || ''}</small></td><td><span className={`crm-status ${client.status.toLowerCase()}`}>{statusLabels[client.status]}</span></td><td>{client.ownerName}{!client.canEdit && <small>только просмотр</small>}</td><td className={client.nextTaskAt && new Date(client.nextTaskAt) < new Date() ? 'crm-overdue-text' : ''}>{client.nextTaskAt ? <><strong>{formatDateTime(client.nextTaskAt)}</strong><small>{client.nextTaskTitle}</small></> : 'Нет действия'}</td></tr>)}</tbody></table></div>{!clients.length && <div className="crm-empty">По этому фильтру клиентов нет. Добавьте первый лид или измените параметры поиска.</div>}</section>
  </div></CrmShell>;
}
