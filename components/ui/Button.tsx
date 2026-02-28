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
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 border border-transparent shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-transparent',
    outline: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
  };

  return cn(
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
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
