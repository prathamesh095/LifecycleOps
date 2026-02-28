import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ActivityType, ACTIVITY_TYPE } from '@/lib/schemas';
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface ActivityComposerProps {
  onAddActivity: (type: ActivityType, notes: string) => void;
}

export function ActivityComposer({ onAddActivity }: ActivityComposerProps) {
  const [type, setType] = useState<ActivityType>('NOTE_ADDED');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    
    onAddActivity(type, notes);
    setNotes('');
    setType('NOTE_ADDED');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 sticky bottom-6 z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="w-48 shrink-0">
            <Select value={type} onValueChange={(val) => setType(val as ActivityType)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPE.map(t => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Log an activity..."
              className="w-full h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white transition-all"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!notes.trim()}
              className="absolute right-1 top-1 h-8 w-8 p-0 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
