'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function LoginForm({ locale }: { locale: string }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const login = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '');

    const { error: signInError } = login.includes('@')
      ? await authClient.signIn.email({ email: login, password })
      : await authClient.signIn.username({ username: login, password });

    if (signInError) {
      setPending(false);
      setError('Не удалось войти. Проверьте логин и пароль.');
      return;
    }

    // Full page reload/redirect to ensure session cookie is attached cleanly
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/${locale}/crm`;
  }

  return (
    <form className="crm-login-form" onSubmit={submit}>
      <label>
        Логин или Email
        <input
          name="username"
          required
          autoComplete="username"
          placeholder="admin или admin@alma.local"
          defaultValue="admin"
        />
      </label>
      <label>
        Пароль
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="admin12345"
        />
      </label>
      {error && <p className="crm-form-message error">{error}</p>}
      <button className="crm-button" disabled={pending}>
        {pending ? 'Входим…' : 'Войти'}
      </button>
    </form>
  );
}
