import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ActivityType, ACTIVITY_TYPE } from '@/lib/schemas';
import { Send, Calendar as CalendarIcon } from 'lucide-react';
import { ActivityTypeSelect } from './ActivityTypeSelect';
import { motion, AnimatePresence } from 'motion/react';
import { DatePicker } from '@/components/ui/DatePicker';

interface ActivityComposerProps {
  onAddActivity: (type: ActivityType, notes: string, date?: Date) => void;
}

export function ActivityComposer({ onAddActivity }: ActivityComposerProps) {
  const [type, setType] = useState<ActivityType>('NOTE_ADDED');
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(() => new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    
    onAddActivity(type, notes, type === 'INTERVIEW_SCHEDULED' ? interviewDate : undefined);
    setNotes('');
    setType('NOTE_ADDED');
  };

  const isInterview = type === 'INTERVIEW_SCHEDULED';

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-lg shadow-neutral-200/20 p-3 sticky bottom-6 z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <ActivityTypeSelect value={type} onChange={setType} />

          <div className="flex-1 relative">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isInterview ? "e.g. Final round with VP of Engineering" : "Log an activity..."}
              className="w-full h-11 rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all placeholder:text-neutral-400"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!notes.trim()}
              className="absolute right-1.5 top-1.5 h-8 w-8 p-0 rounded-xl"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isInterview && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-1 flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <CalendarIcon className="h-3 w-3" />
                  Interview Date
                </div>
                <div className="w-48">
                  <DatePicker date={interviewDate} setDate={setInterviewDate} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
