'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';

const NAV_ITEMS = ['services', 'portfolio', 'process', 'reviews', 'contact'] as const;

export function Header() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-accent',
          scrolled && 'shadow-[0_2px_20px_rgba(252,238,33,0.15)]',
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between md:h-20">
            <a href="#" className="shrink-0 h-16 md:h-20 flex items-center">
              <Image
                src="/logos/alma-technology-logo.png"
                alt="ALMA TEHNOLOGY"
                width={1360}
                height={530}
                className="h-full w-auto"
                priority
              />
            </a>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  className="text-sm font-medium text-accent-text/70 transition-colors hover:text-accent-text cursor-pointer"
                >
                  {t(item)}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              <LanguageSwitcher className="border-accent-text/20 text-accent-text/70 hover:border-accent-text hover:text-accent-text" />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => scrollTo('contact')}
                className="border-accent-text bg-accent-text text-accent hover:bg-accent-text/90 hover:border-accent-text/90 hover:text-accent"
              >
                {t('contact')}
              </Button>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-accent-text/70 hover:text-accent-text transition-colors md:hidden cursor-pointer"
            >
              <Menu size={24} />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
