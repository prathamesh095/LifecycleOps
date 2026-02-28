import { Application } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
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
}

export function FocusPanel({
  title,
  subtitle,
  icon: Icon,
  accentColor,
  items,
  emptyMessage,
  onItemClick
}: FocusPanelProps) {
  
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'red': return {
        icon: 'text-rose-600 bg-rose-50 border-rose-100',
        badge: 'bg-rose-100 text-rose-700',
        border: 'group-hover:border-rose-200'
      };
      case 'amber': return {
        icon: 'text-amber-600 bg-amber-50 border-amber-100',
        badge: 'bg-amber-100 text-amber-700',
        border: 'group-hover:border-amber-200'
      };
      case 'blue': return {
        icon: 'text-blue-600 bg-blue-50 border-blue-100',
        badge: 'bg-blue-100 text-blue-700',
        border: 'group-hover:border-blue-200'
      };
      case 'green': return {
        icon: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'group-hover:border-emerald-200'
      };
      default: return {
        icon: 'text-neutral-600 bg-neutral-50 border-neutral-100',
        badge: 'bg-neutral-100 text-neutral-700',
        border: 'group-hover:border-neutral-200'
      };
    }
  };

  const styles = getAccentStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group flex flex-col h-full bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-200",
        styles.border
      )}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center border shrink-0",
            styles.icon
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        
        {items.length > 0 && (
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
            styles.badge
          )}>
            {items.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-60">
            <p className="text-sm font-medium text-neutral-500">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.slice(0, 5).map(app => (
              <FocusRow 
                key={app.id} 
                application={app} 
                onClick={onItemClick}
              />
            ))}
            {items.length > 5 && (
              <div className="pt-2 text-center">
                <span className="text-xs font-medium text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors">
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
