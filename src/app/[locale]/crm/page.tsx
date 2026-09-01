import Link from 'next/link';
import { ArrowRight, CircleAlert, ListChecks } from 'lucide-react';
import { TaskCard } from '@/components/crm/TaskCard';
import { CrmShell } from '@/components/crm/CrmShell';
import { getSalesStats, listActiveUsers, listClients, listTasksForDashboard } from '@/lib/crm';
import { requireUser } from '@/lib/session';

export default async function CrmDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const users = listActiveUsers().map((item) => ({ id: item.id, name: item.name }));
  const dashboard = listTasksForDashboard(user);
  const sales = getSalesStats(user);
  const unattended = listClients(user, { scope: user.role === 'admin' ? 'all' : 'mine', attention: 'no_next_task' });
  const canComplete = (task: { assigneeId: string }) => user.role === 'admin' || task.assigneeId === user.id;

  return <CrmShell user={user} locale={locale}><div className="crm-page">
    <header className="crm-page-header"><div><p className="crm-eyebrow">ПЛАН НА ДЕНЬ</p><h1>Сегодня, {dashboard.dateLabel}</h1><p>Сначала закройте просроченные действия, затем — сегодняшние.</p></div><Link href={`/${locale}/crm/clients/new`} className="crm-button">Новый клиент</Link></header>
    <div className="crm-stat-grid"><div><CircleAlert size={20} /><strong>{dashboard.overdue.length}</strong><span>просрочено</span></div><div><ListChecks size={20} /><strong>{dashboard.today.length}</strong><span>на сегодня</span></div><div><ArrowRight size={20} /><strong>{unattended.length}</strong><span>без следующего шага</span></div></div>
    <section className="crm-section"><div className="crm-section-heading"><h2>Сквозная воронка</h2><Link href={`/${locale}/crm/analytics`}>Подробные KPI</Link></div><div className="crm-funnel crm-funnel-wide"><div><strong>{sales.leads}</strong><span>найдено</span></div><div><strong>{sales.valid}</strong><span>валидные</span></div><div><strong>{sales.contacted}</strong><span>контакты</span></div><div><strong>{sales.replies}</strong><span>ответы</span></div><div><strong>{sales.interested}</strong><span>интерес</span></div><div><strong>{sales.qualified}</strong><span>qualified</span></div><div><strong>{sales.proposals}</strong><span>предложения</span></div><div><strong>{sales.won}</strong><span>оплаты</span></div><div className="revenue"><strong>{sales.revenue.length ? sales.revenue.map((item) => `${item.amount} ${item.currency}`).join(' · ') : '0 USD'}</strong><span>cash received</span></div></div></section>
    {dashboard.overdue.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>Просрочено</h2><span>Не оставляйте без решения</span></div><div className="crm-task-list">{dashboard.overdue.map((task) => <TaskCard key={task.id} task={task} locale={locale} users={users} currentUserId={user.id} canComplete={canComplete(task)} />)}</div></section>}
    <section className="crm-section"><div className="crm-section-heading"><h2>На сегодня</h2><span>{dashboard.today.length ? 'Запланированные действия' : 'Новых задач нет'}</span></div>{dashboard.today.length ? <div className="crm-task-list">{dashboard.today.map((task) => <TaskCard key={task.id} task={task} locale={locale} users={users} currentUserId={user.id} canComplete={canComplete(task)} />)}</div> : <div className="crm-empty">Сегодня всё под контролем. Можно добавить новых лидов или проверить клиентов без следующего действия.</div>}</section>
    {unattended.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>Клиенты без следующего шага</h2><Link href={`/${locale}/crm/clients?attention=no_next_task`}>Открыть список</Link></div><div className="crm-inline-list">{unattended.slice(0, 6).map((client) => <Link key={client.id} href={`/${locale}/crm/clients/${client.id}`}>{client.companyName || client.contactName}<span>{client.status}</span></Link>)}</div></section>}
    {dashboard.upcoming.length > 0 && <section className="crm-section"><div className="crm-section-heading"><h2>Ближайшие 7 дней</h2></div><div className="crm-task-list">{dashboard.upcoming.map((task) => <TaskCard key={task.id} task={task} locale={locale} users={users} currentUserId={user.id} canComplete={canComplete(task)} />)}</div></section>}
  </div></CrmShell>;
}
