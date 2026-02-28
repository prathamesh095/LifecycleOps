'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 mb-5 shadow-sm">
        <Icon className="h-7 w-7 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-8 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
