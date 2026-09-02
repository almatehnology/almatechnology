import { CrmShell } from '@/components/crm/CrmShell';
import { CreateUserForm, UserControls } from '@/components/crm/TeamForms';
import { listUsersForAdmin } from '@/lib/crm';
import { requireAdmin } from '@/lib/session';
import { salesRoleLabels } from '@/lib/crm-format';

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireAdmin(locale);
  const users = listUsersForAdmin();
  return <CrmShell user={user} locale={locale}><div className="crm-page"><header className="crm-page-header"><div><p className="crm-eyebrow">АДМИНИСТРИРОВАНИЕ</p><h1>Команда</h1><p>Управление ролями, именами и доступом сотрудников.</p></div></header><div className="crm-team-grid"><CreateUserForm locale={locale} /><section className="crm-card"><h2>Пользователи</h2><div className="crm-users-list">{users.map((member) => <article key={member.id} className={member.banned ? 'disabled' : ''}><div><strong>{member.name}</strong><span>{member.username || member.email}</span><small>{member.role === 'admin' ? 'Администратор' : 'Сотрудник'} · {member.email} · ID: {member.id}</small><div className="crm-role-badges">{member.salesRoles.length ? member.salesRoles.map((role) => <span key={role}>{salesRoleLabels[role]}</span>) : <span>Рабочие роли не назначены</span>}</div></div>{member.id === user.id ? <span className="crm-self">Вы</span> : <UserControls locale={locale} id={member.id} name={member.name} banned={Boolean(member.banned)} salesRoles={member.salesRoles} />}</article>)}</div></section></div></div></CrmShell>;
}
