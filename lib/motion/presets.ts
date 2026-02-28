import { HTMLMotionProps } from 'motion/react';
import { duration, ease } from './tokens';

// Tactile press feedback (scale down slightly)
export const pressable: HTMLMotionProps<any> = {
  whileTap: { scale: 0.97 },
  transition: { 
    duration: duration.fast, 
    ease: ease.easeOut 
  }
};

// Subtle hover lift and tint (for cards/interactive items)
export const hoverable: HTMLMotionProps<any> = {
  whileHover: { 
    y: -1,
    transition: { duration: duration.normal, ease: ease.easeOut }
  },
  whileTap: { scale: 0.98 }
};

// Modal entrance/exit
export const modal = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.normal, ease: ease.easeOut }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: duration.fast, ease: ease.easeOut }
  }
};

// Drawer slide (mobile sidebar)
export const drawer = {
  initial: { x: '-100%' },
  animate: { 
    x: 0,
    transition: { duration: duration.drawer, ease: ease.easeOut }
  },
  exit: { 
    x: '-100%',
    transition: { duration: duration.drawer, ease: ease.easeOut }
  }
};

// Fade in (for page transitions or content)
export const fadeIn = {
  initial: { opacity: 0, y: 4 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: duration.normal, ease: ease.easeOut }
  },
  exit: { 
    opacity: 0, 
    transition: { duration: duration.fast }
  }
};

// List item stagger
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03
    }
  }
};
