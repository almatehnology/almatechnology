'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground-muted">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-foreground placeholder:text-foreground-subtle transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-[120px] resize-y',
            error && 'border-error focus:border-error focus:ring-error',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
