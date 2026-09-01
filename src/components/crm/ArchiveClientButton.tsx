'use client';

import { useActionState } from 'react';
import { archiveClientAction, type ActionState } from '@/app/[locale]/crm/actions';
import { ActionMessage, SubmitButton } from './FormControls';

export function ArchiveClientButton({ locale, clientId }: { locale: string; clientId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(archiveClientAction, {});
  return <form action={action} className="crm-archive-form">
    <input type="hidden" name="locale" value={locale} />
    <input type="hidden" name="clientId" value={clientId} />
    <SubmitButton className="secondary" pendingText="…">Архивировать клиента</SubmitButton>
    <ActionMessage state={state} />
  </form>;
}
