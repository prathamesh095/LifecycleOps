'use client';

import { motion, AnimatePresence } from 'motion/react';
import { modal } from '@/lib/motion/presets';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, ApplicationFormData, APPLICATION_STATUS, CHANNEL_TYPE, ChannelType } from '@/lib/schemas';
import { useApplicationStore } from '@/lib/store';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FileText, Link as LinkIcon, X, UploadCloud, Plus } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
}

const TABS: { id: ChannelType; label: string; color: string }[] = [
  { id: 'DIRECT_APPLY', label: 'Direct Apply', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'OUTREACH', label: 'Outreach', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'REFERRAL', label: 'Referral', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'RECRUITER', label: 'Recruiter', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'FOLLOW_UP', label: 'Follow-Up', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const DEFAULT_FORM_VALUES: any = {
  channel_type: 'DIRECT_APPLY',
  status: 'APPLIED',
  action_date: new Date().toISOString().split('T')[0],
  company_name: '',
  job_title: '',
  location: '',
  notes: '',
  drive_links: [],
  contact_id: '',
  
  // New Universal Defaults
  role_family: undefined,
  seniority_level: undefined,
  department: '',
  work_type: undefined,
  city: '',
  country: '',
  timezone: '',
  first_action_date: new Date().toISOString().split('T')[0],
  source_attribution_primary: '',
  tags: [],
  fit_score: undefined,
  confidence_score: undefined,
  
  user_interest_level: 'MEDIUM',
  strategic_value: undefined,
  next_follow_up_at: '',
  follow_up_reason: '',

  // Tab specific defaults
  application_source: '',
  cover_letter_included: false,
  job_posting_url: '',
  job_id: '',
  resume_version: '',
  application_platform: '',
  application_method: undefined,
  confirmation_received: false,
  ats_detected: false,
  screening_questions_completed: false,
  salary_range_posted: '',
  
  contact_name: '',
  contact_email: '',
  outreach_channel: '',
  template_used: '',
  message_preview: '',
  outreach_type: undefined,
  personalization_level: undefined,
  response_received: false,
  
  referrer_name: '',
  referrer_company: '',
  relationship_strength: undefined,
  referral_status: '',
  referral_type: undefined,
  
  recruiter_name: '',
  recruiter_email: '',
  recruiting_agency: '',
  recruiter_contacted: false,
  recruiter_type: undefined,
  who_initiated: undefined,
  
  follow_up_type: '',
  follow_up_channel: '',
  follow_up_outcome: '',
  sentiment_change: undefined,
};

export function AddApplicationModal({ isOpen, onClose, onSubmit }: AddApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<ChannelType>('DIRECT_APPLY');
  const [attachmentMode, setAttachmentMode] = useState<'FILE' | 'LINK'>('FILE');
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const contacts = useApplicationStore(state => state.contacts);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES, /* {
      channel_type: 'DIRECT_APPLY',
      status: 'APPLIED',
      action_date: new Date().toISOString().split('T')[0],
      company_name: '',
      job_title: '',
      location: '',
      notes: '',
      drive_links: [],
      contact_id: '',
      
      // New Universal Defaults
      role_family: undefined,
      seniority_level: undefined,
      department: '',
      work_type: undefined,
      city: '',
      country: '',
      timezone: '',
      first_action_date: new Date().toISOString().split('T')[0],
      source_attribution_primary: '',
      tags: [],
      fit_score: undefined,
      confidence_score: undefined,
      
      user_interest_level: 'MEDIUM',
      strategic_value: undefined,
      next_follow_up_at: '',
      follow_up_reason: '',

      // Tab specific defaults
      application_source: '',
      cover_letter_included: false,
      job_posting_url: '',
      job_id: '',
      resume_version: '',
      application_platform: '',
      application_method: undefined,
      confirmation_received: false,
      ats_detected: false,
      screening_questions_completed: false,
      salary_range_posted: '',
      
      contact_name: '',
      contact_email: '',
      outreach_channel: '',
      template_used: '',
      message_preview: '',
      outreach_type: undefined,
      personalization_level: undefined,
      response_received: false,
      
      referrer_name: '',
      referrer_company: '',
      relationship_strength: undefined,
      referral_status: '',
      referral_type: undefined,
      
      recruiter_name: '',
      recruiter_email: '',
      recruiting_agency: '',
      recruiter_contacted: false,
      recruiter_type: undefined,
      who_initiated: undefined,
      
      follow_up_type: '',
      follow_up_channel: '',
      follow_up_outcome: '',
    } as any */
  });

  const driveLinks = watch('drive_links') || [];
  const companyName = watch('company_name');
  const jobTitle = watch('job_title');
  const applications = useApplicationStore(state => state.applications);

  // DUPLICATE DETECTION
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem('apex_app_draft');
      if (draft) {
        setHasDraft(true);
      }
    } else {
      setHasDraft(false);
    }
  }, [isOpen]);

  const restoreDraft = () => {
    const draft = localStorage.getItem('apex_app_draft');
    if (draft) {
      const data = JSON.parse(draft);
      // We need to reset the form with this data
      // But we need to be careful about dates and such.
      // reset(data) might work if data matches schema.
      reset(data);
      setHasDraft(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('apex_app_draft');
    setHasDraft(false);
  };
  
  useEffect(() => {
    if (!companyName || !jobTitle) {
      setDuplicateWarning(null);
      return;
    }
    const match = applications.find(app => 
      app.company_name.toLowerCase() === companyName.toLowerCase() && 
      app.job_title.toLowerCase() === jobTitle.toLowerCase()
    );
    if (match) {
      setDuplicateWarning(`Possible duplicate: ${match.company_name} - ${match.job_title} (${match.status})`);
    } else {
      setDuplicateWarning(null);
    }
  }, [companyName, jobTitle, applications]);

  // AUTOSAVE LOGIC
  useEffect(() => {
    if (isOpen && isDirty) {
      const subscription = watch((value) => {
        localStorage.setItem('apex_app_draft', JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [isOpen, isDirty, watch]);

  // Restore draft on open if exists and form is empty-ish
  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem('apex_app_draft');
      if (draft && !isDirty) {
        try {
          // Optional: could ask user. For now, we just log availability or could silently restore.
          // To be safe, we won't auto-overwrite unless explicitly requested or if it's a fresh open.
          // Let's just stick to the requested "True Autosave" which usually implies seamless restoration.
          // However, without a "Restore" UI, auto-restoring might be annoying if they want to start fresh.
          // We will skip auto-restore for now to be safe, but the save is happening.
        } catch (e) {}
      }
    }
  }, [isOpen, isDirty]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        channel_type: 'DIRECT_APPLY',
        status: 'APPLIED',
        action_date: new Date().toISOString().split('T')[0],
        company_name: '',
        job_title: '',
        location: '',
        notes: '',
        drive_links: [],
        contact_id: '',
        
        user_interest_level: 'MEDIUM',
        strategic_value: undefined,
        next_follow_up_at: '',
        follow_up_reason: '',

        application_source: '',
        cover_letter_included: false,
        job_posting_url: '',
        job_id: '',
        resume_version: '',
        
        contact_name: '',
        contact_email: '',
        outreach_channel: '',
        template_used: '',
        message_preview: '',
        
        referrer_name: '',
        referrer_company: '',
        relationship_strength: undefined,
        referral_status: '',
        
        recruiter_name: '',
        recruiter_email: '',
        recruiting_agency: '',
        recruiter_contacted: false,
        
        follow_up_type: '',
        follow_up_channel: '',
        follow_up_outcome: '',
      } as any);
      setActiveTab('DIRECT_APPLY');
    }
  }, [isOpen, reset]);

  // Update channel_type when tab changes
  useEffect(() => {
    setValue('channel_type', activeTab);
  }, [activeTab, setValue]);

  const handleAddDriveLink = () => {
    if (!driveLinkInput) return;
    try {
      new URL(driveLinkInput); // Simple validation
      setValue('drive_links', [...driveLinks, driveLinkInput]);
      setDriveLinkInput('');
    } catch (e) {
      // Invalid URL
    }
  };

  const handleRemoveDriveLink = (index: number) => {
    setValue('drive_links', driveLinks.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div 
            {...modal}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] flex flex-col overflow-hidden" 
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-neutral-100">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Initialize New Record</h2>
              
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                      activeTab === tab.id 
                        ? tab.color
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Draft Restore Banner */}
                {hasDraft && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-blue-800 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="font-medium">Unsaved draft found</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={clearDraft}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Discard
                      </button>
                      <button 
                        type="button" 
                        onClick={restoreDraft}
                        className="text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-md transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                )}

                {/* Duplicate Warning */}
                {duplicateWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-amber-800 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-medium">{duplicateWarning}</span>
                  </div>
                )}

                {/* SECTION 1: IDENTITY LAYER */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Identity</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <Input
                      label="Company Entity *"
                      placeholder="e.g. Google"
                      {...register('company_name')}
                      error={errors.company_name?.message}
                      autoFocus
                    />
                    <Input
                      label="Role Title *"
                      placeholder="e.g. Senior Product Designer"
                      {...register('job_title')}
                      error={errors.job_title?.message}
                    />
                    
                    <Controller
                      control={control}
                      name="role_family"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Role Family</label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select family" />
                            </SelectTrigger>
                            <SelectContent>
                              {['ENGINEERING', 'DESIGN', 'PRODUCT', 'DATA', 'SALES', 'MARKETING', 'OPERATIONS', 'OTHER'].map(f => (
                                <SelectItem key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="seniority_level"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Seniority</label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL', 'EXECUTIVE'].map(l => (
                                <SelectItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />

                    <Input
                      label="Department"
                      placeholder="e.g. Cloud Platform"
                      {...register('department')}
                    />
                    
                    <Controller
                      control={control}
                      name="contact_id"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Primary Contact</label>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a contact" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {contacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.name} ({contact.company})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* SECTION 2: LOCATION & WORK TYPE */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Location</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <Controller
                      control={control}
                      name="work_type"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Work Type</label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {['REMOTE', 'HYBRID', 'ONSITE'].map(t => (
                                <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                    
                    <Input
                      label="City"
                      placeholder="e.g. San Francisco"
                      {...register('city')}
                    />
                    
                    <Input
                      label="Country"
                      placeholder="e.g. USA"
                      {...register('country')}
                    />

                    <Input
                      label="Timezone"
                      placeholder="e.g. PST"
                      {...register('timezone')}
                    />
                  </div>
                </div>

                {/* SECTION 3: TIMELINE & STATUS */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Timeline</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Current Status *</label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className={cn(errors.status && "border-rose-500")}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {APPLICATION_STATUS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0) + status.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.status?.message && (
                            <p className="text-xs text-rose-500 font-medium">
                              {errors.status.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="action_date"
                      render={({ field }) => (
                        <DatePicker
                          label="Last Action Date *"
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          error={errors.action_date?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="first_action_date"
                      render={({ field }) => (
                        <DatePicker
                          label="First Action Date"
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="next_follow_up_at"
                      render={({ field }) => (
                        <DatePicker
                          label="Next Follow-Up"
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          error={errors.next_follow_up_at?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Tab Specific Fields */}
                <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 space-y-6">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider opacity-60">
                    {TABS.find(t => t.id === activeTab)?.label} Details
                  </h3>

                  {activeTab === 'DIRECT_APPLY' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <Input
                          label="Application Source *"
                          placeholder="e.g. LinkedIn, Company Site"
                          {...register('application_source')}
                          error={(errors as any).application_source?.message}
                        />
                        <Input
                          label="Job Posting URL"
                          placeholder="https://..."
                          {...register('job_posting_url')}
                          error={(errors as any).job_posting_url?.message}
                        />
                        <Input
                          label="Job ID / Req #"
                          placeholder="e.g. 49210"
                          {...register('job_id')}
                        />
                        <Input
                          label="Platform"
                          placeholder="e.g. Workday, Greenhouse"
                          {...register('application_platform')}
                        />
                        
                        <Controller
                          control={control}
                          name="application_method"
                          render={({ field }) => (
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-neutral-700">Method</label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['WEB_FORM', 'EASY_APPLY', 'EMAIL', 'OTHER'].map(m => (
                                    <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />

                        <Input
                          label="Salary Range"
                          placeholder="e.g. $150k - $180k"
                          {...register('salary_range_posted')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {[
                          { id: 'cover_letter_included', label: 'Cover Letter Included' },
                          { id: 'confirmation_received', label: 'Confirmation Received' },
                          { id: 'ats_detected', label: 'ATS Detected' },
                          { id: 'screening_questions_completed', label: 'Screening Qs Done' }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id={item.id}
                              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                              {...register(item.id as any)}
                            />
                            <label htmlFor={item.id} className="text-sm font-medium text-neutral-700">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Email Specifics */}
                      {watch('application_method') === 'EMAIL' && (
                        <div className="pt-4 border-t border-neutral-200 mt-4">
                          <h4 className="text-xs font-bold text-neutral-400 uppercase mb-4">Email Details</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <Input
                              label="Sent To Email"
                              placeholder="jobs@company.com"
                              {...register('application_email_address')}
                            />
                            <Input
                              label="Subject Line"
                              placeholder="Application for..."
                              {...register('email_subject_used')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'OUTREACH' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <Input
                          label="Contact Name *"
                          placeholder="e.g. Sarah Smith"
                          {...register('contact_name')}
                          error={(errors as any).contact_name?.message}
                        />
                        <Input
                          label="Contact Email"
                          placeholder="sarah@company.com"
                          {...register('contact_email')}
                          error={(errors as any).contact_email?.message}
                        />
                        
                        <Controller
                          control={control}
                          name="outreach_type"
                          render={({ field }) => (
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-neutral-700">Type</label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['COLD', 'WARM', 'REFERRAL_REQUEST', 'NETWORKING'].map(t => (
                                    <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />

                        <Input
                          label="Channel"
                          placeholder="e.g. LinkedIn DM"
                          {...register('outreach_channel')}
                        />
                        
                        <Controller
                          control={control}
                          name="personalization_level"
                          render={({ field }) => (
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-neutral-700">Personalization</label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['LOW', 'MEDIUM', 'HIGH'].map(l => (
                                    <SelectItem key={l} value={l}>{l}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />

                        <Input
                          label="Template Used"
                          placeholder="e.g. Cold Outreach V1"
                          {...register('template_used')}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700">Message Preview</label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900 resize-y"
                          placeholder="Paste message content..."
                          {...register('message_preview')}
                        />
                      </div>

                      <div className="pt-4 border-t border-neutral-200">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase mb-4">Response Tracking</h4>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="flex items-center gap-3 pt-8">
                            <input 
                              type="checkbox" 
                              id="response_received"
                              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                              {...register('response_received')}
                            />
                            <label htmlFor="response_received" className="text-sm font-medium text-neutral-700">
                              Response Received
                            </label>
                          </div>
                          
                          <Controller
                            control={control}
                            name="response_sentiment"
                            render={({ field }) => (
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700">Sentiment</label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sentiment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'REFERRAL' && (
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Referrer Name *"
                        placeholder="e.g. John Doe"
                        {...register('referrer_name')}
                        error={(errors as any).referrer_name?.message}
                      />
                      <Input
                        label="Referrer Company"
                        placeholder="e.g. Google"
                        {...register('referrer_company')}
                      />
                      
                      <Controller
                        control={control}
                        name="referral_type"
                        render={({ field }) => (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700">Type</label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {['INTERNAL_SUBMISSION', 'EMAIL_INTRO', 'PORTAL_REFERRAL'].map(t => (
                                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />

                      <Controller
                        control={control}
                        name="relationship_strength"
                        render={({ field }) => (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700">Relationship Strength</label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strength" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WEAK">Weak</SelectItem>
                                <SelectItem value="MODERATE">Moderate</SelectItem>
                                <SelectItem value="STRONG">Strong</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                      
                      <Input
                        label="Referrer Role"
                        placeholder="e.g. Senior Engineer"
                        {...register('referrer_role')}
                      />
                      
                      <Input
                        label="How you know them"
                        placeholder="e.g. Former colleague"
                        {...register('how_you_know_them')}
                      />
                    </div>
                  )}

                  {activeTab === 'RECRUITER' && (
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Recruiter Name *"
                        placeholder="e.g. Jane Doe"
                        {...register('recruiter_name')}
                        error={(errors as any).recruiter_name?.message}
                      />
                      <Input
                        label="Recruiter Email"
                        placeholder="jane@recruiting.com"
                        {...register('recruiter_email')}
                        error={(errors as any).recruiter_email?.message}
                      />
                      
                      <Controller
                        control={control}
                        name="recruiter_type"
                        render={({ field }) => (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700">Type</label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {['INTERNAL', 'EXTERNAL_AGENCY'].map(t => (
                                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />

                      <Input
                        label="Agency / Company"
                        placeholder="e.g. Tech Recruiters Inc."
                        {...register('recruiting_agency')}
                      />
                      
                      <Controller
                        control={control}
                        name="who_initiated"
                        render={({ field }) => (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700">Initiated By</label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select initiator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ME">Me</SelectItem>
                                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />

                      <div className="flex items-center gap-3 pt-8">
                        <input 
                          type="checkbox" 
                          id="recruiter_contacted"
                          className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          {...register('recruiter_contacted')}
                        />
                        <label htmlFor="recruiter_contacted" className="text-sm font-medium text-neutral-700">
                          Recruiter Contacted
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === 'FOLLOW_UP' && (
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Follow-Up Type *"
                        placeholder="e.g. Check-in"
                        {...register('follow_up_type')}
                        error={(errors as any).follow_up_type?.message}
                      />
                      <Input
                        label="Channel"
                        placeholder="e.g. Email"
                        {...register('follow_up_channel')}
                      />
                      <Input
                        label="Outcome"
                        placeholder="e.g. No response"
                        {...register('follow_up_outcome')}
                      />
                      
                      <Controller
                        control={control}
                        name="sentiment_change"
                        render={({ field }) => (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700">Sentiment Change</label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select change" />
                              </SelectTrigger>
                              <SelectContent>
                                {['IMPROVED', 'UNCHANGED', 'WORSENED'].map(s => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider opacity-60">
                      Attachments
                    </h3>
                    <div className="flex bg-neutral-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('FILE')}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-md transition-all",
                          attachmentMode === 'FILE' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
                        )}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('LINK')}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-md transition-all",
                          attachmentMode === 'LINK' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
                        )}
                      >
                        Google Drive
                      </button>
                    </div>
                  </div>

                  {attachmentMode === 'FILE' ? (
                    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-neutral-300 transition-colors cursor-pointer bg-neutral-50/50">
                      <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center mb-3 text-neutral-500">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-neutral-500 mt-1">PDF, DOCX up to 10MB</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Paste Google Drive link..."
                            value={driveLinkInput}
                            onChange={(e) => setDriveLinkInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDriveLink())}
                            className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900"
                          />
                        </div>
                        <Button type="button" variant="outline" onClick={handleAddDriveLink}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {driveLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {driveLinks.map((link, i) => (
                            <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-100 max-w-full">
                              <LinkIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[200px]">{link}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveDriveLink(i)}
                                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* INTELLIGENCE LAYER */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Intelligence</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-700">Strategic Notes</label>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900 resize-y"
                        placeholder="Add strategic context, next steps, or thoughts..."
                        {...register('notes')}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700">Tags (comma separated)</label>
                        <Controller
                          control={control}
                          name="tags"
                          render={({ field }) => (
                            <TagsInput 
                              value={field.value} 
                              onChange={field.onChange} 
                            />
                          )}
                        />
                         <p className="text-[10px] text-neutral-400">Separate tags with commas</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Fit Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="85"
                            {...register('fit_score', { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-neutral-700">Confidence (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="60"
                            {...register('confidence_score', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-neutral-100 bg-neutral-50/50 backdrop-blur-sm flex justify-between items-center">
              <div className="text-xs text-neutral-400 font-medium">
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="application-form"
                  isLoading={isSubmitting}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20"
                >
                  Create Record
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TagsInput({ value, onChange }: { value?: string[], onChange: (val: string[]) => void }) {
  const [inputValue, setInputValue] = useState(value?.join(', ') || '');
  const joinedValue = value?.join(', ') || '';
  const [prevJoinedValue, setPrevJoinedValue] = useState(joinedValue);

  if (joinedValue !== prevJoinedValue) {
    setPrevJoinedValue(joinedValue);
    setInputValue(joinedValue);
  }

  return (
    <Input
      placeholder="e.g. remote, high-pay, referral"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={() => {
        const array = inputValue.split(',').map(t => t.trim()).filter(Boolean);
        onChange(array);
        setInputValue(array.join(', '));
      }}
    />
  );
}