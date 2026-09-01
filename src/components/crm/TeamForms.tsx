'use client';

import { useActionState } from 'react';
import { createUserAction, resetPasswordAction, toggleUserAction, updateUserSalesRolesAction, type ActionState } from '@/app/[locale]/crm/actions';
import { SALES_ROLES, type SalesRole } from '@/lib/crm-types';
import { salesRoleLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton } from './FormControls';

function RoleCheckboxes({ selected = [] }: { selected?: SalesRole[] }) {
  return <fieldset className="crm-role-fieldset"><legend>Рабочие роли</legend><div className="crm-role-checks">{SALES_ROLES.map((role) => <label key={role} className="crm-check"><input type="checkbox" name="salesRoles" value={role} defaultChecked={selected.includes(role)} />{salesRoleLabels[role]}</label>)}</div><small>Можно выбрать одну, несколько или все четыре роли.</small></fieldset>;
}

export function CreateUserForm({ locale }: { locale: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createUserAction, {});
  return <form action={action} className="crm-form crm-card"><input type="hidden" name="locale" value={locale} /><h2>Новая учётная запись</h2><div className="crm-form-grid"><label>Имя<input name="name" required placeholder="Имя сотрудника" /></label><label>Логин<input name="username" required pattern="[A-Za-z0-9_.]+" placeholder="ivan.petrov" /></label><label>Email<input name="email" type="email" required placeholder="name@alma.technology" /></label><label>Доступ<select name="role" defaultValue="user"><option value="user">Сотрудник</option><option value="admin">Администратор</option></select></label><label className="crm-span-2">Временный пароль<input name="password" type="password" required minLength={8} placeholder="Минимум 8 символов" /></label></div><RoleCheckboxes /><ActionMessage state={state} /><SubmitButton>Создать учётную запись</SubmitButton></form>;
}

export function UserControls({ locale, id, banned, salesRoles }: { locale: string; id: string; banned: boolean; salesRoles: SalesRole[] }) {
  const [toggleState, toggleAction] = useActionState<ActionState, FormData>(toggleUserAction, {});
  const [passwordState, passwordAction] = useActionState<ActionState, FormData>(resetPasswordAction, {});
  const [rolesState, rolesAction] = useActionState<ActionState, FormData>(updateUserSalesRolesAction, {});
  return <div className="crm-user-controls"><details><summary>Рабочие роли</summary><form action={rolesAction} className="crm-form compact crm-user-role-form"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><RoleCheckboxes selected={salesRoles} /><SubmitButton pendingText="…">Сохранить роли</SubmitButton><ActionMessage state={rolesState} /></form></details><form action={toggleAction}><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><input type="hidden" name="isBanned" value={String(banned)} /><SubmitButton className="secondary" pendingText="…">{banned ? 'Включить' : 'Отключить'}</SubmitButton><ActionMessage state={toggleState} /></form><details><summary>Сбросить пароль</summary><form action={passwordAction} className="crm-inline-form"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><input name="newPassword" type="password" minLength={8} required placeholder="Новый пароль" /><SubmitButton pendingText="…">Сохранить</SubmitButton><ActionMessage state={passwordState} /></form></details></div>;
}
