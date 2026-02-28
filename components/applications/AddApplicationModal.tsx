'use client';

import { motion, AnimatePresence } from 'motion/react';
import { modal } from '@/lib/motion/presets';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, ApplicationFormData, APPLICATION_STATUS, CHANNEL_TYPE, ChannelType } from '@/lib/schemas';
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

export function AddApplicationModal({ isOpen, onClose, onSubmit }: AddApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<ChannelType>('DIRECT_APPLY');
  const [attachmentMode, setAttachmentMode] = useState<'FILE' | 'LINK'>('FILE');
  const [driveLinkInput, setDriveLinkInput] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting }
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema) as any,
    defaultValues: {
      channel_type: 'DIRECT_APPLY',
      status: 'APPLIED',
      action_date: new Date().toISOString().split('T')[0],
      company_name: '',
      job_title: '',
      location: '',
      notes: '',
      drive_links: [],
      
      user_interest_level: 'MEDIUM',
      strategic_value: undefined,
      next_follow_up_at: '',
      follow_up_reason: '',

      // Tab specific defaults - Initialize all to avoid type errors with discriminated unions
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
    } as any
  });

  const driveLinks = watch('drive_links') || [];

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
                
                {/* Core Fields */}
                <div className="grid grid-cols-2 gap-6">
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
                  <Input
                    label="Location"
                    placeholder="e.g. Remote / NYC"
                    {...register('location')}
                    error={errors.location?.message}
                  />
                   
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
                          <p className="text-xs text-rose-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
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
                        label="Action Date *"
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        error={errors.action_date?.message}
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

                {/* Tab Specific Fields */}
                <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 space-y-6">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider opacity-60">
                    {TABS.find(t => t.id === activeTab)?.label} Details
                  </h3>

                  {activeTab === 'DIRECT_APPLY' && (
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
                      <div className="flex items-center gap-3 pt-8">
                        <input 
                          type="checkbox" 
                          id="cover_letter"
                          className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          {...register('cover_letter_included')}
                        />
                        <label htmlFor="cover_letter" className="text-sm font-medium text-neutral-700">
                          Cover Letter Included
                        </label>
                      </div>
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
                        <Input
                          label="Outreach Channel"
                          placeholder="e.g. LinkedIn DM"
                          {...register('outreach_channel')}
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
                      <Input
                        label="Recruiting Agency"
                        placeholder="e.g. Tech Recruiters Inc."
                        {...register('recruiting_agency')}
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

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">
                    Strategic Notes
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900 resize-y"
                    placeholder="Add strategic context, next steps, or thoughts..."
                    {...register('notes')}
                  />
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/30 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="application-form"
                isLoading={isSubmitting}
              >
                Create Record
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
