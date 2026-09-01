'use client';

import { useActionState } from 'react';
import { createClientAction, updateClientAction, type ActionState } from '@/app/[locale]/crm/actions';
import type { ClientRow } from '@/lib/crm';
import type { SalesRole } from '@/lib/crm-types';
import { ActionMessage, SubmitButton, useRedirectOnClientCreated } from './FormControls';

type TeamUser = { id: string; name: string; salesRoles?: SalesRole[] };

export function ClientForm({ locale, users, client, isAdmin }: { locale: string; users: TeamUser[]; client?: ClientRow; isAdmin: boolean }) {
  const action = client ? updateClientAction : createClientAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  useRedirectOnClientCreated(state, locale);

  return (
    <form action={formAction} className="crm-form crm-card">
      <input type="hidden" name="locale" value={locale} />
      {client && <><input type="hidden" name="clientId" value={client.id} /><input type="hidden" name="version" value={client.version} /></>}
      <div className="crm-form-grid">
        <label>Компания<input name="companyName" defaultValue={client?.companyName} placeholder="Например, Orion Studio" /></label>
        <label>Контактное лицо<input name="contactName" defaultValue={client?.contactName} placeholder="Имя и фамилия" /></label>
        <label>Должность<input name="position" defaultValue={client?.position || ''} placeholder="CEO, маркетолог…" /></label>
        <label>Email<input name="email" type="email" defaultValue={client?.email || ''} placeholder="name@company.com" /></label>
        <label>Телефон<input name="phone" type="tel" defaultValue={client?.phone || ''} placeholder="+54 …" /></label>
        <label>Мессенджер<input name="messenger" defaultValue={client?.messenger || ''} placeholder="Telegram, WhatsApp" /></label>
        <label>Сайт<input name="website" defaultValue={client?.website || ''} placeholder="https://…" /></label>
        <label>Источник<input name="source" defaultValue={client?.source || ''} placeholder="Поиск, рекомендация…" /></label>
        <label>Страна<input name="country" defaultValue={client?.country || ''} placeholder="Argentina" /></label>
        <label>Город<input name="city" defaultValue={client?.city || ''} placeholder="Mendoza" /></label>
        <label>Ниша<input name="industry" defaultValue={client?.industry || ''} placeholder="Стоматология, туризм…" /></label>
        <label>Ориентир суммы<input name="estimatedValue" type="number" min="0" step="1" defaultValue={client?.estimatedValue ?? ''} placeholder="200" /></label>
        <label>Валюта<select name="currency" defaultValue={client?.currency || 'USD'}><option value="USD">USD</option><option value="ARS">ARS</option><option value="EUR">EUR</option></select></label>
        {!client && <label>Передать Verifier<select name="verifierOwnerId" defaultValue=""><option value="">Пока оставить у себя</option>{users.filter((teamUser) => teamUser.salesRoles?.includes('VERIFIER')).map((teamUser) => <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>)}</select></label>}
        {isAdmin && !client && <label>Технический владелец<select name="ownerId" defaultValue=""><option value="">Назначается автоматически</option>{users.map((teamUser) => <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>)}</select></label>}
      </div>
      <div className="crm-form-grid">
        <label className="crm-span-2">Замеченная проблема<textarea name="observedProblem" defaultValue={client?.observedProblem || ''} rows={3} placeholder="Например: на мобильном неудобна запись, нет WhatsApp или формы заявки" /></label>
        <label className="crm-span-2">Что предложить<textarea name="suggestedService" defaultValue={client?.suggestedService || ''} rows={3} placeholder="Например: Landing + WhatsApp + онлайн-заявка" /></label>
      </div>
      <label>Общие заметки<textarea name="generalNotes" defaultValue={client?.generalNotes || ''} rows={4} placeholder="Контекст, договорённости, важные детали" /></label>
      <ActionMessage state={state} />
      <SubmitButton>{client ? 'Сохранить изменения' : 'Создать клиента'}</SubmitButton>
    </form>
  );
}
