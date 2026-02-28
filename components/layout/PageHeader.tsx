import { cn } from '@/lib/utils';
import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // For right-side actions
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-12', className)}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-base text-neutral-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
