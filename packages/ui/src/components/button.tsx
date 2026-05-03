import * as React from 'react';

import { cn } from '@ekonomi/utils';

type ButtonVariant = 'default' | 'secondary' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  default:
    'bg-stone-900 text-white shadow-sm hover:bg-stone-800 focus-visible:ring-stone-300',
  secondary:
    'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 focus-visible:ring-stone-200',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-200'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
