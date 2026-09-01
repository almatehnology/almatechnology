'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { CONTACT_EMAIL, TELEGRAM_URL } from '@/lib/constants';

export function ContactForm() {
  const t = useTranslations('Contact');
  const tv = useTranslations('Contact.validation');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setServerError(false);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setServerError(true);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-background-secondary">
      <Container>
        <AnimateOnScroll>
          <SectionHeading heading={t('heading')} subtitle={t('subtitle')} />
        </AnimateOnScroll>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 md:grid-cols-5">
            {/* Form */}
            <AnimateOnScroll className="md:col-span-3" direction="left">
              {submitted ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/5 p-12 text-center">
                  <CheckCircle2 size={48} className="mb-4 text-success" />
                  <p className="text-lg font-medium text-success">{t('success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label={t('name')}
                    placeholder={t('name')}
                    error={errors.name ? tv(errors.name.message as string) : undefined}
                    {...register('name')}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label={t('email')}
                      type="email"
                      placeholder="email@example.com"
                      error={errors.email ? tv(errors.email.message as string) : undefined}
                      {...register('email')}
                    />
                    <Input
                      label={t('phone')}
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      {...register('phone')}
                    />
                  </div>
                  <Input
                    label={t('budget')}
                    placeholder={t('budgetPlaceholder')}
                    {...register('budget')}
                  />
                  <Textarea
                    label={t('message')}
                    placeholder={t('message')}
                    error={errors.message ? tv(errors.message.message as string) : undefined}
                    {...register('message')}
                  />

                  {serverError && (
                    <p className="text-sm text-error">{t('error')}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSubmitting}
                    icon={<Send size={18} />}
                    className="w-full"
                  >
                    {t('submit')}
                  </Button>
                </form>
              )}
            </AnimateOnScroll>

            {/* Contact info sidebar */}
            <AnimateOnScroll className="md:col-span-2" direction="right">
              <div className="space-y-8">
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
                    Email
                  </h4>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
                    Telegram
                  </h4>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                  >
                    @almatechnology
                  </a>
                </div>

                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="font-mono text-sm text-foreground-subtle">
                    <span className="text-accent">const</span>{' '}
                    <span className="text-foreground">response</span> ={' '}
                    <span className="text-accent">await</span>{' '}
                    <span className="text-foreground-muted">alma</span>
                    <span className="text-accent">.</span>
                    <span className="text-foreground-muted">build</span>
                    {'({'}
                    <br />
                    {'  '}idea: <span className="text-accent">&quot;yours&quot;</span>,
                    <br />
                    {'  '}quality: <span className="text-accent">&quot;exceptional&quot;</span>,
                    <br />
                    {'  '}deadline: <span className="text-accent">&quot;on time&quot;</span>
                    <br />
                    {'});'}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </Container>
    </section>
  );
}
