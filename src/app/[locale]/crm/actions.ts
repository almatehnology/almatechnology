'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  INTERACTION_CHANNELS,
  TASK_TYPES,
  addInteraction,
  advanceWorkflow,
  archiveClient,
  claimExpiredClient,
  completeTask,
  createClient,
  createTask,
  findClientDuplicates,
  localDateTimeToIso,
  transferClient,
  updateClient,
  updateUserSalesRoles,
  type ClientInput,
  type InteractionChannel,
  type SalesRole,
  type TaskType,
  type WorkflowInput,
} from '@/lib/crm';
import { SALES_ROLES } from '@/lib/crm-types';
import { requireAdmin, requireUser } from '@/lib/session';

export type ActionState = { error?: string; success?: string; clientId?: string };

function value(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function optionalValue(formData: FormData, name: string) {
  const item = value(formData, name);
  return item || undefined;
}

function localeOf(formData: FormData) {
  const locale = value(formData, 'locale');
  return locale === 'en' ? 'en' : 'ru';
}

function clientInput(formData: FormData): ClientInput {
  return {
    companyName: value(formData, 'companyName'),
    contactName: value(formData, 'contactName'),
    position: optionalValue(formData, 'position'),
    email: optionalValue(formData, 'email'),
    phone: optionalValue(formData, 'phone'),
    messenger: optionalValue(formData, 'messenger'),
    website: optionalValue(formData, 'website'),
    source: optionalValue(formData, 'source'),
    country: optionalValue(formData, 'country'),
    city: optionalValue(formData, 'city'),
    industry: optionalValue(formData, 'industry'),
    observedProblem: optionalValue(formData, 'observedProblem'),
    suggestedService: optionalValue(formData, 'suggestedService'),
    estimatedValue: optionalValue(formData, 'estimatedValue') ? Number(optionalValue(formData, 'estimatedValue')) : undefined,
    currency: optionalValue(formData, 'currency'),
    generalNotes: optionalValue(formData, 'generalNotes'),
    ownerId: optionalValue(formData, 'ownerId'),
    verifierOwnerId: optionalValue(formData, 'verifierOwnerId'),
  };
}

function pathFor(formData: FormData, suffix = '') {
  return `/${localeOf(formData)}/crm${suffix}`;
}

export async function createClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser(localeOf(formData));
    const input = clientInput(formData);
    const duplicates = findClientDuplicates(input);
    if (duplicates.length) {
      const labels = duplicates.map((client) => client.companyName || client.contactName).join(', ');
      return { error: `Похоже, такой лид уже есть: ${labels}. Откройте существующую карточку, чтобы не пересекаться с коллегами.` };
    }
    const id = createClient(user, input);
    revalidatePath(pathFor(formData));
    return { success: 'Клиент создан.', clientId: id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось создать клиента.' };
  }
}

export async function updateClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const user = await requireUser(locale);
    updateClient(user, clientId, clientInput(formData), Number(value(formData, 'version')));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    revalidatePath(pathFor(formData, '/clients'));
    return { success: 'Карточка клиента сохранена.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось сохранить клиента.' };
  }
}

export async function archiveClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    archiveClient(await requireUser(locale), clientId);
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, '/clients'));
    return { success: 'Клиент перенесён в архив.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось архивировать клиента.' };
  }
}

export async function claimExpiredClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    claimExpiredClient(await requireUser(locale), clientId);
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    revalidatePath(pathFor(formData, '/clients'));
    return { success: 'Лид закреплён за вами на следующие 90 дней.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось забрать лид из пула.' };
  }
}

export async function createTaskAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const type = value(formData, 'type');
    if (!TASK_TYPES.includes(type as TaskType)) throw new Error('Некорректный тип задачи.');
    createTask(await requireUser(locale), {
      clientId,
      assigneeId: value(formData, 'assigneeId'),
      type: type as TaskType,
      title: value(formData, 'title'),
      description: optionalValue(formData, 'description'),
      dueAt: localDateTimeToIso(value(formData, 'dueAt')),
    });
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    revalidatePath(pathFor(formData, '/tasks'));
    return { success: 'Задача поставлена.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось поставить задачу.' };
  }
}

export async function addInteractionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const channel = value(formData, 'channel');
    if (!INTERACTION_CHANNELS.includes(channel as InteractionChannel)) throw new Error('Некорректный канал связи.');
    const withNextTask = value(formData, 'nextTaskEnabled') === 'on';
    const nextType = value(formData, 'nextTaskType');
    if (withNextTask && !TASK_TYPES.includes(nextType as TaskType)) throw new Error('Некорректный тип следующей задачи.');
    addInteraction(await requireUser(locale), {
      clientId,
      occurredAt: localDateTimeToIso(value(formData, 'occurredAt')),
      channel: channel as InteractionChannel,
      direction: value(formData, 'direction') === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
      result: value(formData, 'result'),
      sentItems: optionalValue(formData, 'sentItems'),
      expectedFromClient: optionalValue(formData, 'expectedFromClient'),
      notes: optionalValue(formData, 'notes'),
      nextTask: withNextTask ? {
        assigneeId: value(formData, 'nextAssigneeId'),
        type: nextType as TaskType,
        title: value(formData, 'nextTaskTitle'),
        description: optionalValue(formData, 'nextTaskDescription'),
        dueAt: localDateTimeToIso(value(formData, 'nextTaskDueAt')),
      } : undefined,
    });
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    return { success: 'Контакт зафиксирован.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось сохранить контакт.' };
  }
}

export async function completeTaskAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const withNextTask = value(formData, 'nextTaskEnabled') === 'on';
    const nextType = value(formData, 'nextTaskType');
    if (withNextTask && !TASK_TYPES.includes(nextType as TaskType)) throw new Error('Некорректный тип следующей задачи.');
    completeTask(await requireUser(locale), value(formData, 'taskId'), optionalValue(formData, 'completionResult'), withNextTask ? {
      assigneeId: value(formData, 'nextAssigneeId'),
      type: nextType as TaskType,
      title: value(formData, 'nextTaskTitle'),
      description: optionalValue(formData, 'nextTaskDescription'),
      dueAt: localDateTimeToIso(value(formData, 'nextTaskDueAt')),
    } : undefined);
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, '/tasks'));
    if (clientId) revalidatePath(pathFor(formData, `/clients/${clientId}`));
    return { success: 'Задача выполнена.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось завершить задачу.' };
  }
}

export async function transferClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const type = value(formData, 'handoffTaskType');
    if (!TASK_TYPES.includes(type as TaskType)) throw new Error('Некорректный тип задачи.');
    transferClient(
      await requireUser(locale),
      clientId,
      value(formData, 'toUserId'),
      optionalValue(formData, 'reason'),
      value(formData, 'reassignOpenTasks') === 'on',
      {
        type: type as TaskType,
        title: value(formData, 'handoffTaskTitle'),
        description: optionalValue(formData, 'handoffTaskDescription'),
        dueAt: localDateTimeToIso(value(formData, 'handoffTaskDueAt')),
      },
    );
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    revalidatePath(pathFor(formData, '/clients'));
    return { success: 'Клиент передан новому ответственному.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось передать клиента.' };
  }
}

export async function advanceWorkflowAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const clientId = value(formData, 'clientId');
    const action = value(formData, 'workflowAction') as WorkflowInput['action'];
    advanceWorkflow(await requireUser(locale), {
      clientId,
      action,
      reason: optionalValue(formData, 'reason'),
      nextOwnerId: optionalValue(formData, 'nextOwnerId'),
      proposedSolution: optionalValue(formData, 'proposedSolution'),
      finalPrice: optionalValue(formData, 'finalPrice') ? Number(optionalValue(formData, 'finalPrice')) : undefined,
      cashReceived: optionalValue(formData, 'cashReceived') ? Number(optionalValue(formData, 'cashReceived')) : undefined,
      currency: optionalValue(formData, 'currency'),
      technicalEstimateNeeded: value(formData, 'technicalEstimateNeeded') === 'on',
      decisionMaker: optionalValue(formData, 'decisionMaker'),
      budgetNotes: optionalValue(formData, 'budgetNotes'),
      desiredTimeline: optionalValue(formData, 'desiredTimeline'),
      discoveryNotes: optionalValue(formData, 'discoveryNotes'),
      servicePackage: optionalValue(formData, 'servicePackage'),
    });
    revalidatePath(pathFor(formData));
    revalidatePath(pathFor(formData, `/clients/${clientId}`));
    revalidatePath(pathFor(formData, '/clients'));
    revalidatePath(pathFor(formData, '/analytics'));
    return { success: 'Этап и показатели обновлены.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось обновить этап.' };
  }
}

export async function createUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    await requireAdmin(locale);
    const name = value(formData, 'name');
    const email = value(formData, 'email');
    const username = value(formData, 'username');
    const password = value(formData, 'password');
    const role = value(formData, 'role') === 'admin' ? 'admin' : 'user';
    if (!name || !email || !username || !password) throw new Error('Заполните все поля пользователя.');
    const response = await auth.api.createUser({
      body: { name, email, password, role, data: { username } },
      headers: await headers(),
    });
    if (!response) throw new Error('Не удалось создать пользователя.');
    const createdUser = response.user as { id: string } | undefined;
    if (!createdUser?.id) throw new Error('Учётная запись создана, но роли не назначены. Обновите страницу и назначьте их вручную.');
    const roles = SALES_ROLES.filter((salesRole) => formData.getAll('salesRoles').includes(salesRole));
    updateUserSalesRoles(createdUser.id, roles);
    revalidatePath(pathFor(formData, '/team'));
    return { success: 'Учётная запись создана.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось создать пользователя.' };
  }
}

export async function updateUserSalesRolesAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    await requireAdmin(locale);
    const roles = SALES_ROLES.filter((salesRole) => formData.getAll('salesRoles').includes(salesRole)) as SalesRole[];
    updateUserSalesRoles(value(formData, 'userId'), roles);
    revalidatePath(pathFor(formData, '/team'));
    return { success: 'Рабочие роли сохранены.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось изменить рабочие роли.' };
  }
}


export async function toggleUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    const currentUser = await requireAdmin(locale);
    const userId = value(formData, 'userId');
    if (userId === currentUser.id) throw new Error('Нельзя отключить собственную учётную запись.');
    const isBanned = value(formData, 'isBanned') === 'true';
    if (isBanned) {
      await auth.api.unbanUser({ body: { userId }, headers: await headers() });
    } else {
      await auth.api.banUser({ body: { userId }, headers: await headers() });
    }
    revalidatePath(pathFor(formData, '/team'));
    return { success: isBanned ? 'Пользователь активирован.' : 'Пользователь отключён.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось изменить пользователя.' };
  }
}

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const locale = localeOf(formData);
    await requireAdmin(locale);
    const password = value(formData, 'newPassword');
    if (password.length < 8) throw new Error('Пароль должен содержать минимум 8 символов.');
    await auth.api.setUserPassword({ body: { userId: value(formData, 'userId'), newPassword: password }, headers: await headers() });
    return { success: 'Пароль обновлён.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Не удалось обновить пароль.' };
  }
}
