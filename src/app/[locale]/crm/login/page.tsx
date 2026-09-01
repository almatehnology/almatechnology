import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/crm/LoginForm';
import { getCurrentUser } from '@/lib/session';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (await getCurrentUser()) redirect(`/${locale}/crm`);
  return <main className="crm-login-page"><section className="crm-login-card"><p className="crm-eyebrow">ALMA TECHNOLOGY</p><h1>Рабочее пространство</h1><p>Войдите, чтобы видеть свои задачи и клиентов.</p><LoginForm locale={locale} /></section></main>;
}
