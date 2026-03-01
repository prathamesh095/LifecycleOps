'use client';

import { useApplicationStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Building, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export function ContactDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const contact = useApplicationStore(state => state.contacts.find(c => c.id === id));
  const applications = useApplicationStore(state => state.applications);
  const activities = useApplicationStore(state => state.activities);

  if (!contact) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-neutral-500">Contact not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/contacts')}>
            Back to Contacts
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Find related applications
  const relatedApplications = applications.filter(app => 
    app.contact_id === contact.id || 
    (contact.email && app.contact_email === contact.email)
  ).sort((a, b) => b.priority_score - a.priority_score);

  // Find outreach history (activities related to this contact)
  // For simplicity, we'll look at activities from related applications that might be outreach
  const outreachHistory = relatedApplications.flatMap(app => {
    const appActivities = activities[app.id] || [];
    return appActivities.filter(act => 
      act.activity_type === 'FOLLOWED_UP' || 
      act.activity_type === 'RECRUITER_REPLY' ||
      (act.notes && act.notes.toLowerCase().includes('email'))
    ).map(act => ({ ...act, application: app }));
  }).sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFER': return 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-bg)]';
      case 'INTERVIEWING': return 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-bg)]';
      case 'APPLIED': return 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary-subtle)]';
      case 'REJECTED': return 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-bg)]';
      case 'GHOSTED': return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'WITHDRAWN': return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <button 
          onClick={() => router.push('/contacts')}
          className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section 1: Contact Overview */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-6 rounded-3xl shadow-sm border-neutral-200/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-2xl shadow-sm border border-neutral-200/50">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{contact.name}</h1>
                <p className="text-sm font-medium text-neutral-500">{contact.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-neutral-700">{contact.company}</span>
              </div>
              {contact.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <a href={`mailto:${contact.email}`} className="font-medium text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
            </div>

            {contact.notes && (
              <div className="mt-6 pt-6 border-t border-neutral-100/50">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{contact.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sections 2 & 3: Related Applications & Outreach */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Section 2: Related Applications */}
          <Card className="p-6 rounded-3xl shadow-sm border-neutral-200/60">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-4">Related Applications</h2>
            
            {relatedApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                <Briefcase className="h-8 w-8 text-neutral-300 mb-3" />
                <p className="text-sm font-medium text-neutral-500">No applications linked to this contact yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedApplications.map(app => (
                  <div 
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-neutral-200/60 bg-white hover:bg-neutral-50/80 hover:shadow-sm cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200/50">
                        <Briefcase className="h-4 w-4 text-neutral-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{app.company_name}</h4>
                        <p className="text-xs font-medium text-neutral-500">{app.job_title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm",
                        getStatusColor(app.status)
                      )}>
                        {app.status === 'INTERVIEWING' ? 'Interview' : app.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 3: Email / Outreach History */}
          <Card className="p-6 rounded-3xl shadow-sm border-neutral-200/60">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-4">Outreach History</h2>
            
            {outreachHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                <Mail className="h-8 w-8 text-neutral-300 mb-3" />
                <p className="text-sm font-medium text-neutral-500">No outreach history found.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                {outreachHistory.map((activity, index) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-50 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-neutral-200/60 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-900">{activity.application.company_name}</span>
                        <span className="text-[10px] font-medium text-neutral-400">
                          {formatDistanceToNow(parseISO(activity.activity_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">{activity.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
