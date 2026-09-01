'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-text hover:bg-accent-hover font-semibold shadow-[0_0_20px_rgba(252,238,33,0.2)] hover:shadow-[0_0_30px_rgba(252,238,33,0.3)]',
  secondary:
    'border border-border bg-transparent text-foreground hover:border-accent hover:text-accent',
  ghost:
    'bg-transparent text-foreground-muted hover:text-foreground hover:bg-background-tertiary',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
