import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Container className="text-center">
        <h1 className="text-8xl font-bold text-accent font-mono">404</h1>
        <p className="mt-4 text-xl text-foreground-muted">
          {t('title')}
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>{t('home')}</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
