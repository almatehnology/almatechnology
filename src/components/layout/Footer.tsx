import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { CONTACT_EMAIL, TELEGRAM_URL } from '@/lib/constants';
import { Send, Mail, Code2 } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-secondary">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-foreground">
              alma<span className="text-accent">.technology</span>
            </span>
            <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
              {t('description')}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-2.5 text-foreground-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Send size={18} />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-lg border border-border p-2.5 text-foreground-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://github.com/alma-technology"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-2.5 text-foreground-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Code2 size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('services')}
            </h4>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li><a href="#services" className="transition-colors hover:text-accent">{t('serviceBots')}</a></li>
              <li><a href="#services" className="transition-colors hover:text-accent">{t('serviceWebapps')}</a></li>
              <li><a href="#services" className="transition-colors hover:text-accent">{t('serviceProducts')}</a></li>
              <li><a href="#services" className="transition-colors hover:text-accent">{t('serviceWebsites')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('company')}
            </h4>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li><a href="#portfolio" className="transition-colors hover:text-accent">{t('portfolio')}</a></li>
              <li><a href="#process" className="transition-colors hover:text-accent">{t('process')}</a></li>
              <li><a href="#reviews" className="transition-colors hover:text-accent">{t('reviews')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('contacts')}
            </h4>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-accent">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-6 text-center text-sm text-foreground-subtle">
          {t('copyright', { year })}
        </div>
      </Container>
    </footer>
  );
}
