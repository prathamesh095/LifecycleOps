import { Application } from '@/lib/schemas';
import { ExternalLink, Copy } from 'lucide-react';

interface ContextPanelProps {
  application: Application;
}

export function ContextPanel({ application }: ContextPanelProps) {
  const {
    application_source,
    job_posting_url,
    resume_version,
    channel_type,
    user_interest_level,
    strategic_value
  } = application;

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
