'use client';

import { 
  Application, 
  ApplicationStatus, 
  APPLICATION_STATUS, 
  ActivityType 
} from '@/lib/schemas';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { 
  MoreHorizontal, 
  Eye, 
  History, 
  Calendar as CalendarIcon, 
  Copy, 
  Archive, 
  Trash2,
  AlertCircle,
  Flame,
  Snowflake,
  Clock,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/DropdownMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Calendar } from '@/components/ui/Calendar';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

interface ApplicationsTableProps {
  applications: Application[];
  isLoading?: boolean;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onScheduleFollowUp: (id: string, date: string | undefined) => void;
  onLogActivity: (id: string, type: ActivityType, notes?: string) => void;
  onDelete: (id: string) => void;
}

export function ApplicationsTable({ 
  applications, 
  isLoading = false,
  onStatusChange,
  onScheduleFollowUp,
  onLogActivity,
  onDelete
}: ApplicationsTableProps) {
  
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-neutral-300" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">No applications found</h3>
        <p className="text-neutral-500 text-sm mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50/30 hover:bg-neutral-50/30 border-b border-neutral-100">
            <TableHead className="py-4 font-semibold text-neutral-900">Company</TableHead>
            <TableHead className="py-4 font-semibold text-neutral-900">Role</TableHead>
            <TableHead className="py-4 font-semibold text-neutral-900 w-[120px]">Status</TableHead>
            <TableHead className="py-4 font-semibold text-neutral-900 w-[100px]">Signals</TableHead>
            <TableHead className="py-4 font-semibold text-neutral-900 w-[160px]">Follow-Up</TableHead>
            <TableHead className="py-4 font-semibold text-neutral-900 w-[140px]">Last Activity</TableHead>
            <TableHead className="py-4 w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {applications.map((app) => (
              <ApplicationRow 
                key={app.id} 
                app={app} 
                onStatusChange={onStatusChange}
                onScheduleFollowUp={onScheduleFollowUp}
                onLogActivity={onLogActivity}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

function ApplicationRow({ 
  app, 
  onStatusChange,
  onScheduleFollowUp,
  onLogActivity,
  onDelete
}: { 
  app: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onScheduleFollowUp: (id: string, date: string | undefined) => void;
  onLogActivity: (id: string, type: ActivityType, notes?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative border-b border-neutral-50 transition-colors duration-150 cursor-default",
        isHovered ? "bg-neutral-50/50" : "bg-white"
      )}
    >
      <TableCell className="py-3.5">
        <Link 
          href={`/applications/${app.id}`}
          className="block group-hover:text-blue-600 transition-colors"
        >
          <div className="font-semibold text-neutral-900">{app.company_name}</div>
          <div className="text-xs text-neutral-400 font-normal">{app.location || 'Remote'}</div>
        </Link>
      </TableCell>
      
      <TableCell className="py-3.5">
        <div className="text-sm font-medium text-neutral-700">{app.job_title}</div>
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mt-0.5">
          {app.channel_type.replace('_', ' ')}
        </div>
      </TableCell>

      <TableCell className="py-3.5">
        <StatusBadge 
          status={app.status} 
          onStatusChange={(newStatus) => onStatusChange(app.id, newStatus)} 
        />
      </TableCell>

      <TableCell className="py-3.5">
        <SignalIcons app={app} />
      </TableCell>

      <TableCell className="py-3.5">
        <FollowUpCell 
          app={app} 
          onSchedule={(date) => onScheduleFollowUp(app.id, date)} 
        />
      </TableCell>

      <TableCell className="py-3.5">
        <LastActivityCell date={app.last_activity_at} />
      </TableCell>

      <TableCell className="py-3.5 text-right">
        <RowActions 
          app={app} 
          onLogActivity={(type) => onLogActivity(app.id, type)}
          onScheduleFollowUp={() => {/* Handled by FollowUpCell but can be here too */}}
          onDelete={() => onDelete(app.id)}
        />
      </TableCell>
    </motion.tr>
  );
}

function StatusBadge({ 
  status, 
  onStatusChange 
}: { 
  status: ApplicationStatus; 
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const getStatusStyles = (s: ApplicationStatus) => {
    switch (s) {
      case 'OFFER': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
      case 'INTERVIEWING': return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
      case 'APPLIED': return 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100';
      case 'GHOSTED': return 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100 hover:bg-neutral-100';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide transition-all active:scale-95",
          getStatusStyles(status)
        )}>
          {status === 'INTERVIEWING' ? 'Interview' : status}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 rounded-xl shadow-lg border-neutral-100">
        <DropdownMenuLabel className="text-[10px] uppercase text-neutral-400 tracking-widest">Change Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={status} onValueChange={(v) => onStatusChange(v as ApplicationStatus)}>
          {APPLICATION_STATUS.map((s) => (
            <DropdownMenuRadioItem key={s} value={s} className="text-xs py-2 cursor-pointer">
              {s}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignalIcons({ app }: { app: Application }) {
  const signals = [];
  
  if (app.is_overdue) signals.push({ icon: AlertCircle, color: 'text-rose-500', label: 'Overdue Follow-up' });
  if (app.follow_up_status === 'DUE_SOON') signals.push({ icon: Clock, color: 'text-amber-500', label: 'Follow-up Due Soon' });
  if (app.is_heating_up) signals.push({ icon: Flame, color: 'text-orange-500', label: 'Heating Up' });
  if (app.is_cooling) signals.push({ icon: Snowflake, color: 'text-blue-400', label: 'Cooling Down' });
  if (app.is_high_priority) signals.push({ icon: CheckCircle2, color: 'text-emerald-500', label: 'High Priority' });

  return (
    <div className="flex items-center gap-1.5">
      {signals.slice(0, 3).map((sig, i) => (
        <div key={i} title={sig.label} className={cn("p-1 rounded-md bg-neutral-50", sig.color)}>
          <sig.icon className="w-3.5 h-3.5" />
        </div>
      ))}
      {signals.length === 0 && <span className="text-neutral-200 text-xs">—</span>}
    </div>
  );
}

function FollowUpCell({ 
  app, 
  onSchedule 
}: { 
  app: Application; 
  onSchedule: (date: string | undefined) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(
    app.next_follow_up_at ? parseISO(app.next_follow_up_at) : undefined
  );

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onSchedule(newDate?.toISOString());
    toast.success(newDate ? 'Follow-up scheduled' : 'Follow-up cleared');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "text-xs font-medium transition-colors hover:text-blue-600 active:scale-95 text-left",
          app.is_overdue ? "text-rose-600" : app.next_follow_up_at ? "text-neutral-700" : "text-neutral-400"
        )}>
          {app.next_follow_up_at ? format(parseISO(app.next_follow_up_at), 'MMM d, yyyy') : 'Not scheduled'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-neutral-100" align="start">
        <div className="p-3 border-b border-neutral-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-900">Schedule Follow-up</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => handleSelect(undefined)}
          >
            Clear
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="rounded-b-2xl"
        />
      </PopoverContent>
    </Popover>
  );
}

function LastActivityCell({ date }: { date?: string }) {
  if (!date) return <span className="text-neutral-300 text-xs">—</span>;

  const parsedDate = parseISO(date);
  const relative = formatDistanceToNow(parsedDate, { addSuffix: true });

  return (
    <div className="flex flex-col" title={format(parsedDate, 'PPP p')}>
      <span className="text-xs text-neutral-600 font-medium">{relative}</span>
    </div>
  );
}

function RowActions({ 
  app, 
  onLogActivity, 
  onScheduleFollowUp, 
  onDelete 
}: { 
  app: Application;
  onLogActivity: (type: ActivityType) => void;
  onScheduleFollowUp: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-neutral-100 rounded-full transition-transform active:scale-90">
          <MoreHorizontal className="h-4 w-4 text-neutral-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl border-neutral-100 p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] uppercase text-neutral-400 tracking-widest">Options</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/applications/${app.id}`} className="flex items-center px-2 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 transition-colors">
            <Eye className="mr-2.5 h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium">View Details</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 bg-neutral-50" />
        
        <DropdownMenuItem 
          className="flex items-center px-2 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 transition-colors"
          onClick={() => onLogActivity('NOTE_ADDED')}
        >
          <History className="mr-2.5 h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium">Log Activity</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center px-2 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 transition-colors"
          onClick={() => {/* Handled by FollowUpCell but can trigger modal here */}}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium">Schedule Follow-up</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center px-2 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 transition-colors">
          <Copy className="mr-2.5 h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium">Duplicate</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center px-2 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 transition-colors">
          <Archive className="mr-2.5 h-4 w-4 text-neutral-400" />
          <span className="text-sm font-medium">Archive</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 bg-neutral-50" />
        
        <DropdownMenuItem 
          className="flex items-center px-2 py-2 cursor-pointer rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50 transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to delete this application?')) {
              onDelete();
              toast.error('Application deleted');
            }
          }}
        >
          <Trash2 className="mr-2.5 h-4 w-4" />
          <span className="text-sm font-medium">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-50 bg-neutral-50/30">
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-b border-neutral-50 flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}
