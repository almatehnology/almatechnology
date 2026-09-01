'use client';

import { useActionState } from 'react';
import { claimExpiredClientAction, type ActionState } from '@/app/[locale]/crm/actions';
import { ActionMessage, SubmitButton } from './FormControls';

export function ClaimClientButton({ locale, clientId }: { locale: string; clientId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(claimExpiredClientAction, {});
  return <form action={action} className="crm-form compact"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="clientId" value={clientId} /><ActionMessage state={state} /><SubmitButton>Забрать лид из общего пула</SubmitButton></form>;
}
