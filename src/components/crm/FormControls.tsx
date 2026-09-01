'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/app/[locale]/crm/actions';

export function SubmitButton({ children, pendingText = 'Сохраняем…', className = '' }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={`crm-button ${className}`} type="submit" disabled={pending}>{pending ? pendingText : children}</button>;
}

export function ActionMessage({ state }: { state: ActionState }) {
  if (!state.error && !state.success) return null;
  return <p className={state.error ? 'crm-form-message error' : 'crm-form-message success'}>{state.error || state.success}</p>;
}

export function useNewTaskToggle() {
  const [enabled, setEnabled] = useState(false);
  return { enabled, setEnabled };
}

export function useRedirectOnClientCreated(state: ActionState, locale: string) {
  const router = useRouter();
  useEffect(() => {
    if (state.clientId) router.replace(`/${locale}/crm/clients/${state.clientId}`);
  }, [locale, router, state.clientId]);
}

export function defaultLocalDateTime(addMinutes = 30) {
  const date = new Date(Date.now() + addMinutes * 60_000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
