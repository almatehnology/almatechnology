'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientAction, updateClientAction, type ActionState } from '@/app/[locale]/crm/actions';
import type { ClientRow } from '@/lib/crm';
import { CURRENCIES, currencyLabels, SOURCE_CATEGORIES, SOURCE_CATEGORY_PLATFORMS, type SalesRole, type SourceCategory } from '@/lib/crm-types';
import { sourceCategoryLabels } from '@/lib/crm-format';
import { ActionMessage, SubmitButton, useRedirectOnClientCreated } from './FormControls';

type TeamUser = { id: string; name: string; salesRoles?: SalesRole[] };

function detectInitialCategory(client?: ClientRow): { category: SourceCategory | ''; platform: string; isCustom: boolean } {
  if (client?.sourceCategory && SOURCE_CATEGORIES.includes(client.sourceCategory)) {
    const cat = client.sourceCategory;
    const plat = client.sourcePlatform || '';
    const isKnown = (SOURCE_CATEGORY_PLATFORMS[cat] as readonly string[]).includes(plat);
    return { category: cat, platform: plat, isCustom: Boolean(plat && !isKnown) };
  }
  const rawSource = (client?.sourcePlatform || client?.source || '').trim();
  if (!rawSource) return { category: '', platform: '', isCustom: false };

  for (const [cat, platforms] of Object.entries(SOURCE_CATEGORY_PLATFORMS) as [SourceCategory, readonly string[]][]) {
    const found = platforms.find(
      (p) => p.toLowerCase() === rawSource.toLowerCase() || rawSource.toLowerCase().includes(p.toLowerCase())
    );
    if (found) {
      return { category: cat, platform: found, isCustom: false };
    }
  }

  return { category: '', platform: rawSource, isCustom: true };
}

export function ClientForm({
  locale,
  users,
  client,
  isAdmin,
  className = 'crm-form crm-card',
}: {
  locale: string;
  users: TeamUser[];
  client?: ClientRow;
  isAdmin: boolean;
  className?: string;
}) {
  const router = useRouter();
  const action = client ? updateClientAction : createClientAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  useRedirectOnClientCreated(state, locale);

  useEffect(() => {
    if (state.success && client) {
      router.refresh();
    }
  }, [state.success, client, router]);

  const initial = detectInitialCategory(client);
  const [category, setCategory] = useState<SourceCategory | ''>(initial.category);
  const [platform, setPlatform] = useState<string>(initial.isCustom ? '' : initial.platform);
  const [isCustomPlatform, setIsCustomPlatform] = useState<boolean>(initial.isCustom);
  const [customPlatform, setCustomPlatform] = useState<string>(initial.isCustom ? initial.platform : '');

  const availablePlatforms = category ? (SOURCE_CATEGORY_PLATFORMS[category] || []) : [];

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="locale" value={locale} />
      {client && (
        <>
          <input type="hidden" name="clientId" value={client.id} />
          <input type="hidden" name="version" value={client.version} />
        </>
      )}

      <div className="crm-form-grid">
        <label>Компания<input name="companyName" defaultValue={client?.companyName} placeholder="Например, Orion Studio" /></label>
        <label>Контактное лицо<input name="contactName" defaultValue={client?.contactName} placeholder="Имя и фамилия" /></label>
        <label>Должность<input name="position" defaultValue={client?.position || ''} placeholder="CEO, маркетолог…" /></label>
        <label>Email<input name="email" type="email" defaultValue={client?.email || ''} placeholder="name@company.com" /></label>
        <label>Телефон<input name="phone" type="tel" defaultValue={client?.phone || ''} placeholder="+54 …" /></label>
        <label>Мессенджер<input name="messenger" defaultValue={client?.messenger || ''} placeholder="Telegram, WhatsApp" /></label>
        <label>Сайт компании<input name="website" defaultValue={client?.website || ''} placeholder="https://…" /></label>
        <label>Ниша<input name="industry" defaultValue={client?.industry || ''} placeholder="Стоматология, туризм…" /></label>
      </div>

      <div className="crm-form-section-title">
        <h3>Источник лидогенерации</h3>
        <p>Категория поиска, площадка и ссылка на проект, вакансию или профиль</p>
      </div>

      <div className="crm-form-grid">
        <label>
          Категория источника
          <select
            name="sourceCategory"
            value={category}
            onChange={(e) => {
              const nextCat = e.target.value as SourceCategory | '';
              setCategory(nextCat);
              if (nextCat) {
                const nextPlatforms = SOURCE_CATEGORY_PLATFORMS[nextCat];
                if (!isCustomPlatform && !nextPlatforms.includes(platform)) {
                  setPlatform(nextPlatforms[0] || '');
                }
              }
            }}
          >
            <option value="">Выберите категорию...</option>
            {SOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{sourceCategoryLabels[cat]}</option>
            ))}
          </select>
        </label>

        <label>
          Конкретная площадка
          <select
            value={isCustomPlatform ? '__custom__' : platform}
            disabled={!category}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setIsCustomPlatform(true);
              } else {
                setIsCustomPlatform(false);
                setPlatform(e.target.value);
              }
            }}
          >
            <option value="">{category ? 'Выберите площадку...' : 'Сначала выберите категорию'}</option>
            {availablePlatforms.map((plat) => (
              <option key={plat} value={plat}>{plat}</option>
            ))}
            <option value="__custom__">Другая площадка (ввести вручную)...</option>
          </select>
        </label>
      </div>

      {isCustomPlatform && (
        <label>
          Название другой площадки
          <input
            value={customPlatform}
            onChange={(e) => setCustomPlatform(e.target.value)}
            placeholder="Например: Dribbble, Glassdoor, ProZ, WhatsApp-сообщество…"
          />
        </label>
      )}

      <input type="hidden" name="sourcePlatform" value={isCustomPlatform ? customPlatform : platform} />

      <div className="crm-form-grid">
        <label>
          Ссылка на источник (проект, вакансия, профиль)
          <input
            name="sourceUrl"
            defaultValue={client?.sourceUrl || ''}
            placeholder="https://upwork.com/jobs/... или https://t.me/..."
          />
        </label>
        <label>
          Канал / Сообщество / Поисковый запрос
          <input
            name="sourceDetail"
            defaultValue={client?.sourceDetail || ''}
            placeholder="Например: @react_jobs_chat, чат предпринимателей, поиск на картах"
          />
        </label>
      </div>

      <div className="crm-form-grid">
        <label>Страна<input name="country" defaultValue={client?.country || ''} placeholder="Argentina" /></label>
        <label>Город<input name="city" defaultValue={client?.city || ''} placeholder="Mendoza" /></label>
        <label>Ориентир суммы<input name="estimatedValue" type="number" min="0" step="0.01" defaultValue={client?.estimatedValue ?? ''} placeholder="200" /></label>
        {client && (
          <>
            <label>Стоимость договора<input name="finalPrice" type="number" min="0" step="0.01" defaultValue={client?.finalPrice ?? ''} placeholder="400" /></label>
            <label>Фактически получено<input name="cashReceived" type="number" min="0" step="0.01" defaultValue={client?.cashReceived ?? ''} placeholder="400" /></label>
          </>
        )}
        <label>
          Валюта
          <select name="currency" defaultValue={client?.currency || 'USD'}>
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {currencyLabels[curr] || curr}
              </option>
            ))}
          </select>
        </label>
        {!client && (
          <label>
            Предпочтительный Verifier
            <select name="verifierOwnerId" defaultValue="">
              <option value="">Свободный пул (или назначить позже)</option>
              {users.filter((teamUser) => teamUser.salesRoles?.includes('VERIFIER')).map((teamUser) => (
                <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>
              ))}
            </select>
          </label>
        )}
        {isAdmin && !client && (
          <label>
            Технический владелец
            <select name="ownerId" defaultValue="">
              <option value="">Назначается автоматически</option>
              {users.map((teamUser) => (
                <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>
              ))}
            </select>
          </label>
        )}
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
