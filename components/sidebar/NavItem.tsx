'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pressable } from '@/lib/motion/presets';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
}

const MotionLink = motion.create(Link);

export function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <MotionLink
      href={href}
      onClick={onClick}
      {...pressable}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10',
        isActive
          ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-neutral-900'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
          isActive ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-600'
        )}
      />
      <span>{label}</span>
    </MotionLink>
  );
}
