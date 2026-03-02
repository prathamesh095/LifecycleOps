'use client';

import { useApplicationStore } from '@/lib/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Bell, Check, Clock, AlertCircle, Briefcase, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function NotificationPanel() {
  const [mounted, setMounted] = useState(false);
  const notifications = useApplicationStore(state => state.notifications);
  const markNotificationRead = useApplicationStore(state => state.markNotificationRead);
  const markAllNotificationsRead = useApplicationStore(state => state.markAllNotificationsRead);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) {
    return (
      <button className="relative rounded-full p-2.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-100">
        <Bell className="h-5 w-5" />
      </button>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP_OVERDUE': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case 'FOLLOW_UP_DUE_SOON': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'INTERVIEW_SCHEDULED': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'OFFER_RECEIVED': return <Star className="h-4 w-4 text-emerald-500" />;
      case 'HIGH_PRIORITY_OPPORTUNITY': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'REMINDER_DUE': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-neutral-500" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    if (notification.related_entity_type === 'APPLICATION') {
      router.push(`/applications/${notification.related_entity_id}`);
    } else if (notification.related_entity_type === 'CONTACT') {
      router.push(`/contacts/${notification.related_entity_id}`);
    } else if (notification.related_entity_type === 'REMINDER') {
      router.push(`/reminders`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative rounded-full p-2.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-100">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"
              />
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-xl border-neutral-200/60 overflow-hidden bg-white/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100/50 bg-neutral-50/50">
          <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllNotificationsRead}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                <Bell className="h-4 w-4 text-neutral-300" />
              </div>
              <p className="text-sm font-medium text-neutral-500">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100/50">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-neutral-50/80",
                    !notification.read ? "bg-blue-50/30" : ""
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border shadow-sm",
                      !notification.read ? "bg-white border-neutral-200" : "bg-neutral-50 border-neutral-100"
                    )}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        !notification.read ? "text-neutral-900" : "text-neutral-700"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] font-medium text-neutral-400 whitespace-nowrap mt-0.5">
                        {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs mt-0.5 line-clamp-2",
                      !notification.read ? "text-neutral-600 font-medium" : "text-neutral-500"
                    )}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 flex items-center justify-center w-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
