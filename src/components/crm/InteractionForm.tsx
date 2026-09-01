'use client';

import { useActionState, useState } from 'react';
import { addInteractionAction, type ActionState } from '@/app/[locale]/crm/actions';
import { INTERACTION_CHANNELS, TASK_TYPES } from '@/lib/crm-types';
import { interactionChannelLabels, taskTypeLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton, defaultLocalDateTime } from './FormControls';

type TeamUser = { id: string; name: string };

export function InteractionForm({ locale, clientId, users, defaultAssigneeId }: { locale: string; clientId: string; users: TeamUser[]; defaultAssigneeId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(addInteractionAction, {});
  const [nextTask, setNextTask] = useState(false);
  const [occurredAt] = useState(() => defaultLocalDateTime(0));
  const [nextDueAt] = useState(() => defaultLocalDateTime(60));
  return <form action={action} className="crm-form crm-card crm-action-form">
    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="clientId" value={clientId} />
    <h3>Зафиксировать контакт</h3>
    <div className="crm-form-grid">
      <label>Когда<input name="occurredAt" required type="datetime-local" defaultValue={occurredAt} /></label>
      <label>Канал<select name="channel" defaultValue="CALL">{INTERACTION_CHANNELS.map((channel) => <option key={channel} value={channel}>{interactionChannelLabels[channel]}</option>)}</select></label>
      <label>Направление<select name="direction" defaultValue="OUTBOUND"><option value="OUTBOUND">Исходящий</option><option value="INBOUND">Входящий</option></select></label>
      <label className="crm-span-2">Результат<input name="result" required placeholder="Клиент попросил прислать кейсы и вернуться через неделю" /></label>
      <label className="crm-span-2">Что отправили<textarea name="sentItems" rows={2} placeholder="Коммерческое предложение, кейсы, презентация…" /></label>
      <label className="crm-span-2">Что ожидаем от клиента<textarea name="expectedFromClient" rows={2} placeholder="Решение, ТЗ, контакты ЛПР…" /></label>
      <label className="crm-span-2">Дополнительная заметка<textarea name="notes" rows={3} /></label>
    </div>
    <label className="crm-check"><input type="checkbox" name="nextTaskEnabled" checked={nextTask} onChange={(event) => setNextTask(event.target.checked)} />Создать напоминание о следующем шаге</label>
    {nextTask && <div className="crm-form-grid crm-subform">
      <label>Тип<select name="nextTaskType" defaultValue="CALL">{TASK_TYPES.map((type) => <option key={type} value={type}>{taskTypeLabels[type]}</option>)}</select></label>
      <label>Исполнитель<select name="nextAssigneeId" defaultValue={defaultAssigneeId}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
      <label className="crm-span-2">Следующее действие<input name="nextTaskTitle" required placeholder="Перезвонить и уточнить решение" /></label>
      <label className="crm-span-2">Когда<input name="nextTaskDueAt" required type="datetime-local" defaultValue={nextDueAt} /></label>
      <label className="crm-span-2">Контекст<textarea name="nextTaskDescription" rows={2} /></label>
    </div>}
    <ActionMessage state={state} /><SubmitButton>Сохранить контакт</SubmitButton>
  </form>;
}
