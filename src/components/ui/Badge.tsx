import { cn } from '@/lib/utils';

type Props = {
  children: string;
  className?: string;
};

export function Badge({ children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-block rounded-md bg-background-tertiary px-2.5 py-1 text-xs font-medium text-foreground-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
