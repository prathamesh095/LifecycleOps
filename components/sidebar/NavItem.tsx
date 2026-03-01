'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { pressable } from '@/lib/motion/presets';

import * as Tooltip from '@radix-ui/react-tooltip';
import { useSidebar } from './SidebarContext';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const MotionLink = motion.create(Link);

export function NavItem({ href, label, icon: Icon, isActive, onClick, isCollapsed: propIsCollapsed }: NavItemProps) {
  const { isCollapsed: contextIsCollapsed } = useSidebar();
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : contextIsCollapsed;

  const content = (
    <MotionLink
      href={href}
      onClick={onClick}
      {...pressable}
      className={cn(
        'group flex h-11 items-center gap-3 rounded-xl transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10',
        isCollapsed ? 'justify-center px-0 w-11 mx-auto' : 'px-3 w-full',
        isActive
          ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50 font-medium'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
          isActive ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-600'
        )}
      />
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="truncate"
        >
          {label}
        </motion.span>
      )}
    </MotionLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip.Provider delayDuration={0}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            {content}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={12}
              className="z-[100] rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg animate-in fade-in zoom-in-95 duration-200"
            >
              {label}
              <Tooltip.Arrow className="fill-neutral-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return content;
}
