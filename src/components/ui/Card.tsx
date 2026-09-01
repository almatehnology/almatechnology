import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className, hover = true }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background-secondary p-6 md:p-8',
        hover && 'transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(250,204,21,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
