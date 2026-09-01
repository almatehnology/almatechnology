'use client';

import { useTranslations } from 'next-intl';
import { Trophy, Cpu, RefreshCcw, Eye, Zap, Headset } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { advantages } from '@/data/advantages';
import { type ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  Trophy: <Trophy size={24} />,
  Cpu: <Cpu size={24} />,
  RefreshCcw: <RefreshCcw size={24} />,
  Eye: <Eye size={24} />,
  Zap: <Zap size={24} />,
  HeadsetIcon: <Headset size={24} />,
};

export function Advantages() {
  const t = useTranslations('Advantages');

  return (
    <section className="py-20 md:py-28 bg-background-secondary">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((adv, i) => (
            <AnimateOnScroll key={adv.key} delay={i * 0.08}>
              <Card className="h-full bg-background">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 text-accent">
                  {iconMap[adv.icon]}
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(`${adv.key}.title`)}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {t(`${adv.key}.description`)}
                </p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
