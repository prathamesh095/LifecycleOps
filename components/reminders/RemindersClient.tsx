'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { modal } from '@/lib/motion/presets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reminderSchema, ReminderFormData } from '@/lib/schemas';
import { Input, Select } from '@/components/ui/Form';

export function RemindersClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      type: 'normal'
    }
  });

  const handleAddReminder = () => {
    setIsOpen(true);
  };

  const onSubmit = async (data: ReminderFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newReminder = {
        id: crypto.randomUUID(),
        ...data
      };
      
      setReminders(prev => [newReminder, ...prev]);
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Reminders" 
        description="Don't miss a deadline."
      >
        <Button onClick={handleAddReminder}>
          Add Reminder
        </Button>
      </PageHeader>
      
      {reminders.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No reminders set"
            description="Stay organized by setting reminders for interviews and follow-ups."
            actionLabel="Add Reminder"
            onAction={handleAddReminder}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${reminder.type === 'urgent' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-blue-500'}`} />
                <div>
                  <h3 className="font-medium text-neutral-900">{reminder.title}</h3>
                  <p className="text-sm text-neutral-500">Due: {reminder.due_date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <motion.div 
              {...modal}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full m-4" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-6 text-neutral-900">Add Reminder</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Reminder Title"
                  placeholder="e.g. Follow up with recruiter"
                  {...register('title')}
                  error={errors.title?.message}
                />
                
                <Input
                  label="Due Date"
                  type="datetime-local"
                  {...register('due_date')}
                  error={errors.due_date?.message}
                />
                
                <Select
                  label="Priority"
                  options={[
                    { label: 'Normal', value: 'normal' },
                    { label: 'Urgent', value: 'urgent' },
                  ]}
                  {...register('type')}
                  error={errors.type?.message}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsOpen(false);
                      reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                  >
                    Set Reminder
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
