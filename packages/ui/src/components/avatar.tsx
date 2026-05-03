import type { HTMLAttributes } from 'react';

import { cn, getInitials } from '@ekonomi/utils';

export function Avatar({
  firstName,
  lastName,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  firstName: string;
  lastName: string;
}) {
  return (
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-sm font-semibold text-stone-700',
        className
      )}
      {...props}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
