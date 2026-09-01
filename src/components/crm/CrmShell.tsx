'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, CalendarDays, CheckSquare, LogOut, Shield, UsersRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import type { CurrentUser } from '@/lib/session';

const navigation = [
  { key: 'today', href: '', label: 'Сегодня', icon: CheckSquare },
  { key: 'clients', href: '/clients', label: 'Клиенты', icon: UsersRound },
  { key: 'tasks', href: '/tasks', label: 'Все задачи', icon: CalendarDays },
  { key: 'analytics', href: '/analytics', label: 'Аналитика', icon: BarChart3 },
];

export function CrmShell({ user, locale, children }: { user: CurrentUser; locale: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/crm`;

  async function signOut() {
    await authClient.signOut();
    router.replace(`${base}/login`);
    router.refresh();
  }

  return (
    <div className="crm-app">
      <aside className="crm-sidebar">
        <Link href={base} className="crm-brand">alma<span>.crm</span></Link>
        <nav className="crm-nav" aria-label="CRM">
          {navigation.map((item) => {
            const href = `${base}${item.href}`;
            const active = item.href ? pathname.startsWith(href) : pathname === base;
            const Icon = item.icon;
            return <Link key={item.key} href={href} className={active ? 'active' : ''}><Icon size={18} />{item.label}</Link>;
          })}
          {user.role === 'admin' && (
            <Link href={`${base}/team`} className={pathname.startsWith(`${base}/team`) ? 'active' : ''}><Shield size={18} />Команда</Link>
          )}
        </nav>
        <div className="crm-user">
          <div><strong>{user.name}</strong><span>{user.role === 'admin' ? 'Администратор' : user.salesRoles.join(' · ') || 'Без роли'}</span></div>
          <button type="button" onClick={signOut} aria-label="Выйти"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="crm-main">{children}</main>
    </div>
  );
}
