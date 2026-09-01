import Link from 'next/link';
import { Clock3, Phone, UserRound } from 'lucide-react';
import type { TaskRow } from '@/lib/crm';
import { formatDateTime, isOverdue, taskTypeLabels } from '@/lib/crm-format';
import { CompleteTaskForm } from './TaskForms';

type TeamUser = { id: string; name: string };

export function TaskCard({ task, locale, users, currentUserId, canComplete, showDate = true }: { task: TaskRow; locale: string; users: TeamUser[]; currentUserId: string; canComplete: boolean; showDate?: boolean }) {
  const clientTitle = task.companyName || task.clientName || 'Без названия';
  return <article className={`crm-task ${task.status === 'OPEN' && isOverdue(task.dueAt) ? 'overdue' : ''}`}>
    <div className="crm-task-top"><span className="crm-task-type"><Phone size={15} />{taskTypeLabels[task.type]}</span>{showDate && <span><Clock3 size={15} />{formatDateTime(task.dueAt)}</span>}</div>
    <Link className="crm-task-client" href={`/${locale}/crm/clients/${task.clientId}`}>{clientTitle}</Link>
    <h3>{task.title}</h3>
    {task.description && <p>{task.description}</p>}
    {(task.phone || task.messenger) && <p className="crm-task-contact">{task.phone || task.messenger}</p>}
    {task.expectedFromClient && <p className="crm-task-expected"><b>Ожидаем:</b> {task.expectedFromClient}</p>}
    <div className="crm-task-footer"><span><UserRound size={15} />{task.assigneeName}</span>{task.ownerId !== task.assigneeId && <span>Клиент: {task.ownerName}</span>}</div>
    {canComplete && task.status === 'OPEN' && <CompleteTaskForm locale={locale} task={task} users={users} currentUserId={currentUserId} />}
    {task.status === 'COMPLETED' && <p className="crm-completed">Выполнена {formatDateTime(task.completedAt)}{task.completionResult ? `: ${task.completionResult}` : ''}</p>}
  </article>;
}
