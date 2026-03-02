'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { pressable } from '@/lib/motion/presets';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const buttonVariants = ({ 
  variant = 'primary', 
  size = 'md', 
  className 
}: { 
  variant?: ButtonVariant | null, 
  size?: ButtonSize | null, 
  className?: string 
} = {}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent shadow-sm shadow-indigo-200',
    secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-transparent',
    outline: 'bg-white/50 backdrop-blur-sm text-neutral-900 border border-neutral-200 hover:bg-white hover:border-neutral-300 shadow-sm',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-xl',
    md: 'h-11 px-5 text-sm rounded-2xl',
    lg: 'h-13 px-7 text-base rounded-2xl',
  };

  return cn(
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    variant ? variants[variant] : variants.primary,
    size ? sizes[size] : sizes.md,
    className
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...pressable}
        className={buttonVariants({ variant, size, className })}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
