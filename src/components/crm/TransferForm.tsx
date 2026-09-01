'use client';

import { useActionState, useState } from 'react';
import { transferClientAction, type ActionState } from '@/app/[locale]/crm/actions';
import { TASK_TYPES } from '@/lib/crm-types';
import { taskTypeLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton, defaultLocalDateTime } from './FormControls';

type TeamUser = { id: string; name: string };

export function TransferForm({ locale, clientId, users, currentOwnerId }: { locale: string; clientId: string; users: TeamUser[]; currentOwnerId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(transferClientAction, {});
  const [dueAt] = useState(() => defaultLocalDateTime(60));
  return <form action={action} className="crm-form crm-card crm-action-form">
    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="clientId" value={clientId} />
    <h3>Передать клиента</h3>
    <div className="crm-form-grid">
      <label>Новый ответственный<select name="toUserId" required defaultValue=""><option value="" disabled>Выберите сотрудника</option>{users.filter((user) => user.id !== currentOwnerId).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
      <label>Первое действие<select name="handoffTaskType" defaultValue="CALL">{TASK_TYPES.map((type) => <option key={type} value={type}>{taskTypeLabels[type]}</option>)}</select></label>
      <label className="crm-span-2">Что нужно сделать<input name="handoffTaskTitle" required placeholder="Связаться с клиентом и продолжить диалог" /></label>
      <label className="crm-span-2">Когда<input name="handoffTaskDueAt" required type="datetime-local" defaultValue={dueAt} /></label>
      <label className="crm-span-2">Контекст для нового менеджера<textarea name="handoffTaskDescription" rows={3} placeholder="На чём остановились, что уже обещали, важные детали" /></label>
      <label className="crm-span-2">Причина передачи<textarea name="reason" rows={2} placeholder="Необязательно" /></label>
    </div>
    <label className="crm-check"><input type="checkbox" name="reassignOpenTasks" defaultChecked />Передать новому ответственному все открытые задачи по клиенту</label>
    <ActionMessage state={state} /><SubmitButton>Передать клиента</SubmitButton>
  </form>;
}
