// ============================================================
// Skeleton — Loading placeholder component
// ============================================================

import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

function Skeleton({ className, lines, ...props }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded-md bg-gray-200',
              i === lines - 1 ? 'h-4 w-3/4' : 'h-4 w-full',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };
