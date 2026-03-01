import { Application } from '@/lib/schemas';
import { ExternalLink, User } from 'lucide-react';
import { useApplicationStore } from '@/lib/store';
import Link from 'next/link';

interface ContextPanelProps {
  application: Application;
}

export function ContextPanel({ application }: ContextPanelProps) {
  const contacts = useApplicationStore(state => state.contacts);
  
  const {
    application_source,
    job_posting_url,
    resume_version,
    channel_type,
    user_interest_level,
    strategic_value,
    contact_id
  } = application;

  const linkedContact = contact_id ? contacts.find(c => c.id === contact_id) : null;

  const items = [
    { label: 'Source', value: application_source },
    { label: 'Channel', value: channel_type.replace('_', ' ') },
    { label: 'Interest', value: user_interest_level },
    { label: 'Strategic Value', value: strategic_value || 'Not set' },
    { label: 'Resume', value: resume_version || 'Default' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Context</h2>
      
      <div className="space-y-4">
        {linkedContact && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-neutral-500 font-medium">Primary Contact</span>
            <Link 
              href={`/contacts/${linkedContact.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              {linkedContact.name}
            </Link>
          </div>
        )}

        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <span className="text-sm text-neutral-500 font-medium">{item.label}</span>
            <span className="text-sm text-neutral-900 font-semibold capitalize">{item.value}</span>
          </div>
        ))}

        {job_posting_url && (
          <div className="pt-2 border-t border-neutral-100 mt-2">
            <a 
              href={job_posting_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Job Posting
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
