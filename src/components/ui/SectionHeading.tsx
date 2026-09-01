import { cn } from '@/lib/utils';

type Props = {
  heading: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  className?: string;
};

export function SectionHeading({ heading, subtitle, badge, centered = true, className }: Props) {
  return (
    <div className={cn('mb-12 md:mb-16', centered && 'text-center', className)}>
      {badge && (
        <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent-glow px-4 py-1.5 text-sm font-medium text-accent">
          {badge}
        </span>
      )}
      <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-tight tracking-tight">
        {heading}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-foreground-muted max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
