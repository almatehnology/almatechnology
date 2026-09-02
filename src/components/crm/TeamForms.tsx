'use client';

import { useState, useActionState } from 'react';
import { createUserAction, removeUserAction, resetPasswordAction, toggleUserAction, updateUserNameAction, updateUserSalesRolesAction, type ActionState } from '@/app/[locale]/crm/actions';
import { SALES_ROLES, type SalesRole } from '@/lib/crm-types';
import { salesRoleLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton } from './FormControls';

function RoleCheckboxes({ selected = [] }: { selected?: SalesRole[] }) {
  return <fieldset className="crm-role-fieldset"><legend>Рабочие роли</legend><div className="crm-role-checks">{SALES_ROLES.map((role) => <label key={role} className="crm-check"><input type="checkbox" name="salesRoles" value={role} defaultChecked={selected.includes(role)} />{salesRoleLabels[role]}</label>)}</div><small>Можно выбрать одну, несколько или все четыре роли.</small></fieldset>;
}

export function CreateUserForm({ locale }: { locale: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createUserAction, {});
  return <form action={action} className="crm-form crm-card"><input type="hidden" name="locale" value={locale} /><h2>Новая учётная запись</h2><div className="crm-form-grid"><label>Имя и фамилия<input name="name" required placeholder="Имя Фамилия" /></label><label>Логин<input name="username" required pattern="[A-Za-z0-9_.]+" placeholder="ivan.petrov" /></label><label>Email<input name="email" type="email" required placeholder="name@alma.technology" /></label><label>Доступ<select name="role" defaultValue="user"><option value="user">Сотрудник</option><option value="admin">Администратор</option></select></label><label className="crm-span-2">Временный пароль<input name="password" type="password" required minLength={8} placeholder="Минимум 8 символов" /></label></div><RoleCheckboxes /><ActionMessage state={state} /><SubmitButton>Создать учётную запись</SubmitButton></form>;
}

type Tab = 'roles' | 'password' | 'profile';
export function UserControls({ locale, id, name, banned, salesRoles }: { locale: string; id: string; name: string; banned: boolean; salesRoles: SalesRole[] }) {
  const [tab, setTab] = useState<Tab>('roles');
  const [toggleState, toggleAction] = useActionState<ActionState, FormData>(toggleUserAction, {});
  const [passwordState, passwordAction] = useActionState<ActionState, FormData>(resetPasswordAction, {});
  const [rolesState, rolesAction] = useActionState<ActionState, FormData>(updateUserSalesRolesAction, {});
  const [profileState, profileAction] = useActionState<ActionState, FormData>(updateUserNameAction, {});
  const [removeState, removeAction] = useActionState<ActionState, FormData>(removeUserAction, {});
  return <div className="crm-user-admin"><nav className="crm-user-tabs" aria-label="Управление пользователем"><button type="button" className={tab === 'roles' ? 'active' : ''} onClick={() => setTab('roles')}>Роли</button><button type="button" className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>Пароль</button><button type="button" className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Имя</button></nav>
    <div className="crm-user-tab-content">{tab === 'roles' && <form action={rolesAction} className="crm-form compact"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><RoleCheckboxes selected={salesRoles} /><SubmitButton pendingText="…">Сохранить роли</SubmitButton><ActionMessage state={rolesState} /></form>}{tab === 'password' && <form action={passwordAction} className="crm-inline-form"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><label>Новый пароль<input name="newPassword" type="password" minLength={8} required placeholder="Минимум 8 символов" /></label><SubmitButton pendingText="…">Сохранить пароль</SubmitButton><ActionMessage state={passwordState} /></form>}{tab === 'profile' && <form action={profileAction} className="crm-inline-form"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><label>Имя и фамилия<input name="name" defaultValue={name} required /></label><SubmitButton pendingText="…">Сохранить имя</SubmitButton><ActionMessage state={profileState} /></form>}</div>
    <div className="crm-user-footer"><form action={toggleAction}><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><input type="hidden" name="isBanned" value={String(banned)} /><SubmitButton className="secondary" pendingText="…">{banned ? 'Включить пользователя' : 'Отключить пользователя'}</SubmitButton><ActionMessage state={toggleState} /></form><form action={removeAction} onSubmit={(event) => { if (!window.confirm('Отключить пользователя и освободить активные лиды в общий пул?')) event.preventDefault(); }}><input type="hidden" name="locale" value={locale} /><input type="hidden" name="userId" value={id} /><SubmitButton className="danger" pendingText="…">Удалить и освободить лиды</SubmitButton><ActionMessage state={removeState} /></form></div>
  </div>;
}
