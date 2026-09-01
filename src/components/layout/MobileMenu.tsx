'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_ITEMS = ['services', 'portfolio', 'process', 'reviews', 'contact'] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isOpen, onClose }: Props) {
  const t = useTranslations('Nav');

  const handleClick = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div className="flex h-full flex-col px-6 py-6">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mt-12 flex flex-1 flex-col gap-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => handleClick(item)}
                  className="text-left text-2xl font-medium text-foreground-muted transition-colors hover:text-accent cursor-pointer"
                >
                  {t(item)}
                </button>
              ))}
            </nav>

            <div className="pb-8">
              <LanguageSwitcher className="w-full justify-center" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
