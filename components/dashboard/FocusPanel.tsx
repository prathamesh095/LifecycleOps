import { Application } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { FocusRow } from './FocusRow';

interface FocusPanelProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentColor: 'red' | 'amber' | 'blue' | 'green' | 'neutral';
  items: Application[];
  emptyMessage: string;
  onItemClick?: (id: string) => void;
  tier?: 1 | 2 | 3;
}

export function FocusPanel({
  title,
  subtitle,
  icon: Icon,
  accentColor,
  items,
  emptyMessage,
  onItemClick,
  tier = 2
}: FocusPanelProps) {
  
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'red': return {
        icon: 'text-rose-600 bg-rose-50/80 border-rose-100/50',
        badge: 'bg-rose-50 text-rose-600 border-rose-100/50',
        border: 'border-rose-100/30'
      };
      case 'amber': return {
        icon: 'text-amber-600 bg-amber-50/80 border-amber-100/50',
        badge: 'bg-amber-50 text-amber-600 border-amber-100/50',
        border: 'border-amber-100/30'
      };
      case 'blue': return {
        icon: 'text-blue-600 bg-blue-50/80 border-blue-100/50',
        badge: 'bg-blue-50 text-blue-600 border-blue-100/50',
        border: 'border-blue-100/30'
      };
      case 'green': return {
        icon: 'text-emerald-600 bg-emerald-50/80 border-emerald-100/50',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
        border: 'border-emerald-100/30'
      };
      default: return {
        icon: 'text-neutral-600 bg-neutral-50/80 border-neutral-100/50',
        badge: 'bg-neutral-50 text-neutral-600 border-neutral-100/50',
        border: 'border-neutral-200/50'
      };
    }
  };

  const styles = getAccentStyles();
  const isTier1 = tier === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group flex flex-col h-full bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300",
        styles.border,
        isTier1 ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]" : "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-start justify-between border-b border-neutral-100/50 bg-neutral-50/30",
        isTier1 ? "px-6 pt-6 pb-4" : "px-5 pt-5 pb-3"
      )}>
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "rounded-2xl flex items-center justify-center border shrink-0 shadow-sm",
            isTier1 ? "h-10 w-10" : "h-9 w-9",
            styles.icon
          )}>
            <Icon className={cn(isTier1 ? "h-5 w-5" : "h-4 w-4")} strokeWidth={isTier1 ? 2.5 : 2} />
          </div>
          <div>
            <h3 className={cn(
              "text-neutral-900 leading-tight tracking-tight",
              isTier1 ? "text-base font-bold" : "text-sm font-semibold"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-neutral-500 font-medium mt-0.5",
              isTier1 ? "text-sm" : "text-xs"
            )}>
              {subtitle}
            </p>
          </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {items.length > 0 && (
            <motion.div
              key={items.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums border shadow-sm",
                styles.badge
              )}
            >
              {items.length}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        isTier1 ? "px-6 pb-6 pt-2" : "px-5 pb-5 pt-1"
      )}>
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
            <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-neutral-500">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.slice(0, 5).map(app => (
              <FocusRow 
                key={app.id} 
                application={app} 
                onClick={onItemClick}
              />
            ))}
            {items.length > 5 && (
              <div className="pt-3 text-center">
                <span className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors">
                  + {items.length - 5} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
