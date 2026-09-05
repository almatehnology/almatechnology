import Link from 'next/link';
import { CrmShell } from '@/components/crm/CrmShell';
import { TaskCard } from '@/components/crm/TaskCard';
import { listActiveUsers, listTasks } from '@/lib/crm';
import { requireUser } from '@/lib/session';

export default async function TasksPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ done?: string }> }) {
  const { locale } = await params;
  const { done } = await searchParams;
  const user = await requireUser(locale);
  const users = listActiveUsers().map((item) => ({ id: item.id, name: item.name }));
  const tasks = listTasks(user, done === '1');
  return (
    <CrmShell user={user} locale={locale}>
      <div className="crm-page">
        <header className="crm-page-header">
          <div>
            <p className="crm-eyebrow">ЗАДАЧИ</p>
            <h1>{user.role === 'admin' ? 'Задачи команды' : 'Мои задачи'}</h1>
            <p>Все назначенные действия в одном списке.</p>
          </div>
          <Link className="crm-button secondary" href={`/${locale}/crm/tasks${done === '1' ? '' : '?done=1'}`}>
            {done === '1' ? 'Только открытые' : 'Показать завершённые'}
          </Link>
        </header>
        {tasks.length ? (
          <div className="crm-task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                locale={locale}
                users={users}
                currentUserId={user.id}
                canComplete={user.role === 'admin' || task.assigneeId === user.id}
              />
            ))}
          </div>
        ) : (
          <div className="crm-empty">Задач пока нет.</div>
        )}
      </div>
    </CrmShell>
  );
}
