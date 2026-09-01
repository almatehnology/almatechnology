'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === 'ru' ? 'en' : 'ru';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        'rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:border-accent hover:text-accent cursor-pointer',
        className,
      )}
    >
      {locale === 'ru' ? 'EN' : 'RU'}
    </button>
  );
}
