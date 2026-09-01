'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Quote } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { testimonials } from '@/data/testimonials';

export function Testimonials() {
  const t = useTranslations('Testimonials');
  const locale = useLocale();

  return (
    <section id="reviews" className="py-20 md:py-28">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((review, i) => (
            <AnimateOnScroll key={review.id} delay={i * 0.1}>
              <Card className="h-full flex flex-col">
                <Quote size={24} className="mb-4 text-accent/40" />
                <p className="flex-1 text-foreground-muted leading-relaxed">
                  &ldquo;{locale === 'ru' ? review.quoteRu : review.quoteEn}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold">
                    {(locale === 'ru' ? review.nameRu : review.nameEn)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {locale === 'ru' ? review.nameRu : review.nameEn}
                    </div>
                    <div className="text-xs text-foreground-subtle">
                      {locale === 'ru' ? review.companyRu : review.companyEn}
                    </div>
                  </div>
                </div>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
