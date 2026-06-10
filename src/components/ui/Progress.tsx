// ============================================================
// Progress — Animated progress bar
// ============================================================

import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-5',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel, color, size = 'md', ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className={cn('w-full', className)} {...props}>
        <div
          ref={ref}
          className={cn(
            'w-full overflow-hidden rounded-full bg-gray-100',
            sizeMap[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${percentage.toFixed(0)}% complete`}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              !color && 'bg-gradient-to-r from-green-500 to-emerald-400'
            )}
            style={{
              width: `${percentage}%`,
              backgroundColor: color || undefined,
            }}
          />
        </div>
        {showLabel && (
          <p className="mt-1 text-xs text-gray-500 text-right">{percentage.toFixed(0)}%</p>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
