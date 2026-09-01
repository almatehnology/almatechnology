'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { portfolio } from '@/data/portfolio';

export function Portfolio() {
  const t = useTranslations('Portfolio');
  const locale = useLocale();

  return (
    <section id="portfolio" className="py-20 md:py-28 bg-background-secondary">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-2">
          {portfolio.map((project, i) => (
            <AnimateOnScroll key={project.id} delay={i * 0.1}>
              <Card className="group h-full bg-background overflow-hidden">
                <div className="relative mb-6 aspect-video rounded-lg bg-background-tertiary flex items-center justify-center overflow-hidden border border-border">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={locale === 'ru' ? project.titleRu : project.titleEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="text-4xl font-bold text-accent/20 font-mono">
                        {project.id.split('-').map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="mt-2 text-sm text-foreground-subtle">
                        {locale === 'ru' ? project.titleRu : project.titleEn}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                      {locale === 'ru' ? project.titleRu : project.titleEn}
                    </h3>
                    <p className="mt-2 text-foreground-muted text-sm leading-relaxed">
                      {locale === 'ru' ? project.descriptionRu : project.descriptionEn}
                    </p>
                  </div>
                  {project.url && (
                    <a
                      href={project.url}
                      className="shrink-0 rounded-lg border border-border p-2 text-foreground-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
