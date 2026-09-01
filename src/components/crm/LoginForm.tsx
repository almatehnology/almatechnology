'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await authClient.signIn.username({
      username: String(form.get('username') || ''),
      password: String(form.get('password') || ''),
    });
    setPending(false);
    if (signInError) {
      setError('Не удалось войти. Проверьте логин и пароль.');
      return;
    }
    router.replace(`/${locale}/crm`);
    router.refresh();
  }

  return <form className="crm-login-form" onSubmit={submit}>
    <label>Логин<input name="username" required autoComplete="username" /></label>
    <label>Пароль<input name="password" type="password" required autoComplete="current-password" /></label>
    {error && <p className="crm-form-message error">{error}</p>}
    <button className="crm-button" disabled={pending}>{pending ? 'Входим…' : 'Войти'}</button>
  </form>;
}
