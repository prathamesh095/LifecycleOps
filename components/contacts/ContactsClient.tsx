'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { modal } from '@/lib/motion/presets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/schemas';
import { Input } from '@/components/ui/Form';
import { useApplicationStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ContactsClient() {
  const [isOpen, setIsOpen] = useState(false);
  const contacts = useApplicationStore(state => state.contacts);
  const addContact = useApplicationStore(state => state.addContact);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const handleAddContact = () => {
    setIsOpen(true);
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      const newContact = {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString()
      };
      
      addContact(newContact);
      setIsOpen(false);
      reset();
      toast.success('Contact added');
    } catch (error) {
      console.error('Failed to create contact:', error);
      toast.error('Failed to create contact');
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Contacts" 
        description="Your network and recruiters."
      >
        <Button onClick={handleAddContact}>
          Add Contact
        </Button>
      </PageHeader>
      
      {contacts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No contacts found"
            description="Build your network by adding recruiters and hiring managers."
            actionLabel="Add Contact"
            onAction={handleAddContact}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card 
              key={contact.id} 
              className="p-5 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] duration-200"
              onClick={() => router.push(`/contacts/${contact.id}`)}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-semibold text-lg border border-neutral-200">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{contact.name}</h3>
                  <p className="text-sm text-neutral-500">{contact.role}</p>
                </div>
              </div>
              <div className="text-sm text-neutral-600">
                <p className="font-medium">{contact.company}</p>
                {contact.email && <p className="text-neutral-400 mt-1">{contact.email}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div 
              {...modal}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full m-4 border border-neutral-100" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-6 text-neutral-900">Add Contact</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Name"
                  placeholder="e.g. Jane Doe"
                  {...register('name')}
                  error={errors.name?.message}
                  autoFocus
                />
                
                <Input
                  label="Role"
                  placeholder="e.g. Technical Recruiter"
                  {...register('role')}
                  error={errors.role?.message}
                />
                
                <Input
                  label="Company"
                  placeholder="e.g. Acme Corp"
                  {...register('company')}
                  error={errors.company?.message}
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="jane@example.com"
                  {...register('email')}
                  error={errors.email?.message}
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
                    Save Contact
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
