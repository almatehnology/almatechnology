'use client';

import { useTranslations } from 'next-intl';
import { Bot, AppWindow, Blocks, Globe, Wrench } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { services } from '@/data/services';
import { type ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  Bot: <Bot size={28} />,
  AppWindow: <AppWindow size={28} />,
  Blocks: <Blocks size={28} />,
  Globe: <Globe size={28} />,
  Wrench: <Wrench size={28} />,
};

export function Services() {
  const t = useTranslations('Services');

  return (
    <section id="services" className="py-20 md:py-28">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <AnimateOnScroll key={service.key} delay={i * 0.1}>
              <Card className="h-full">
                <div className="mb-4 inline-flex rounded-lg bg-accent-glow p-3 text-accent">
                  {iconMap[service.icon]}
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(`${service.key}.title`)}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {t(`${service.key}.description`)}
                </p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
