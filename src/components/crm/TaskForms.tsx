'use client';

import { useActionState, useState } from 'react';
import { completeTaskAction, createTaskAction, type ActionState } from '@/app/[locale]/crm/actions';
import type { TaskRow } from '@/lib/crm';
import { TASK_TYPES } from '@/lib/crm-types';
import { taskTypeLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton, defaultLocalDateTime } from './FormControls';

type TeamUser = { id: string; name: string };

function TaskFields({ users, defaultAssigneeId, prefix = '' }: { users: TeamUser[]; defaultAssigneeId: string; prefix?: string }) {
  const [defaultDate] = useState(() => defaultLocalDateTime(60));
  const name = (field: string) => `${prefix}${field}`;
  return <div className="crm-form-grid">
    <label>Тип<select name={name('type')} defaultValue="CALL">{TASK_TYPES.map((type) => <option key={type} value={type}>{taskTypeLabels[type]}</option>)}</select></label>
    <label>Исполнитель<select name={name('assigneeId')} defaultValue={defaultAssigneeId}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
    <label className="crm-span-2">Что сделать<input name={name('title')} required placeholder="Позвонить и уточнить решение" /></label>
    <label className="crm-span-2">Когда<input name={name('dueAt')} required type="datetime-local" defaultValue={defaultDate} /></label>
    <label className="crm-span-2">Контекст<textarea name={name('description')} rows={3} placeholder="Что обсудить, что уже обещали" /></label>
  </div>;
}

export function NewTaskForm({ locale, clientId, users, defaultAssigneeId }: { locale: string; clientId: string; users: TeamUser[]; defaultAssigneeId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createTaskAction, {});
  return <form action={action} className="crm-form crm-card crm-action-form">
    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="clientId" value={clientId} />
    <h3>Поставить задачу</h3>
    <TaskFields users={users} defaultAssigneeId={defaultAssigneeId} />
    <ActionMessage state={state} /><SubmitButton>Поставить задачу</SubmitButton>
  </form>;
}

export function CompleteTaskForm({ locale, task, users, currentUserId }: { locale: string; task: TaskRow; users: TeamUser[]; currentUserId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(completeTaskAction, {});
  const [nextTask, setNextTask] = useState(false);
  const [defaultDate] = useState(() => defaultLocalDateTime(60));
  return <details className="crm-complete-task">
    <summary>Отметить выполненной</summary>
    <form action={action} className="crm-form compact">
      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="clientId" value={task.clientId} />
      <label>Результат<textarea name="completionResult" rows={2} placeholder="Кратко: что сделали и какой итог" /></label>
      <label className="crm-check"><input type="checkbox" name="nextTaskEnabled" checked={nextTask} onChange={(event) => setNextTask(event.target.checked)} />Создать следующее действие</label>
      {nextTask && <div className="crm-form-grid">
        <label>Тип<select name="nextTaskType" defaultValue="CALL">{TASK_TYPES.map((type) => <option key={type} value={type}>{taskTypeLabels[type]}</option>)}</select></label>
        <label>Исполнитель<select name="nextAssigneeId" defaultValue={currentUserId}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label className="crm-span-2">Что сделать<input name="nextTaskTitle" required placeholder="Следующий контакт" /></label>
        <label className="crm-span-2">Когда<input name="nextTaskDueAt" required type="datetime-local" defaultValue={defaultDate} /></label>
        <label className="crm-span-2">Комментарий<textarea name="nextTaskDescription" rows={2} /></label>
      </div>}
      <ActionMessage state={state} /><SubmitButton>Готово</SubmitButton>
    </form>
  </details>;
}
