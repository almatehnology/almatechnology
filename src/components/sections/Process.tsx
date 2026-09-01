'use client';

import { useTranslations } from 'next-intl';
import { ClipboardList, PenTool, Code2, TestTube2, Rocket } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { processSteps } from '@/data/process';
import { type ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  ClipboardList: <ClipboardList size={24} />,
  PenTool: <PenTool size={24} />,
  Code2: <Code2 size={24} />,
  TestTube2: <TestTube2 size={24} />,
  Rocket: <Rocket size={24} />,
};

export function Process() {
  const t = useTranslations('Process');

  return (
    <section id="process" className="py-20 md:py-28">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:hidden" />
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-border" />

          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-5 md:gap-6">
            {processSteps.map((step, i) => (
              <AnimateOnScroll key={step.key} delay={i * 0.15} direction={i % 2 === 0 ? 'up' : 'up'}>
                <div className="relative flex gap-4 md:flex-col md:text-center md:gap-0">
                  {/* Step circle */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background text-accent md:mx-auto">
                    {iconMap[step.icon]}
                  </div>

                  <div className="md:mt-4">
                    <span className="text-xs font-mono text-accent font-semibold">{step.number}</span>
                    <h3 className="mt-1 text-base font-semibold">
                      {t(`steps.${step.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                      {t(`steps.${step.key}.description`)}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
