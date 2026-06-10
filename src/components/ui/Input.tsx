// ============================================================
// Input — shadcn/ui base component
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, id, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-4 py-2 text-sm text-gray-900 ring-offset-background',
            'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error ? 'border-red-300 focus-visible:ring-red-500' : 'border-gray-200',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && errorId && (
          <p id={errorId} className="mt-1 text-xs text-red-500" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
