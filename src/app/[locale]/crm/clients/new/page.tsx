import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from '@/components/crm/ClientForm';
import { CrmShell } from '@/components/crm/CrmShell';
import { listActiveUsers } from '@/lib/crm';
import { requireUser } from '@/lib/session';

export default async function NewClientPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const users = listActiveUsers().map((item) => ({ id: item.id, name: item.name, salesRoles: item.salesRoles }));
  return <CrmShell user={user} locale={locale}><div className="crm-page crm-narrow"><Link className="crm-back" href={`/${locale}/crm/clients`}><ArrowLeft size={17} />К списку клиентов</Link><header className="crm-page-header"><div><p className="crm-eyebrow">НОВЫЙ ЛИД</p><h1>Добавить клиента</h1><p>Сначала зафиксируйте конкретную проблему бизнеса — это основа для персонального первого сообщения.</p></div></header><ClientForm locale={locale} users={users} isAdmin={user.role === 'admin'} /></div></CrmShell>;
}
