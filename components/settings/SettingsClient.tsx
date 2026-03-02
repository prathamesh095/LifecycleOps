'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Bell, Shield, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { hoverable, pressable } from '@/lib/motion/presets';

import { SyncCard } from '@/components/settings/SyncCard';

export function SettingsClient() {
  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        description="Manage your account and preferences."
      />
      
      <div className="space-y-6">
        <SyncCard />

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your public profile and personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              {...hoverable}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100"
            >
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Personal Information</p>
                <p className="text-xs text-neutral-500">Update your name, email, and avatar.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => console.log('Edit profile')}>
                Edit
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose how you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              {...hoverable}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100"
            >
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Email Notifications</p>
                <p className="text-xs text-neutral-500">Daily summaries and important updates.</p>
              </div>
              <motion.div {...pressable} className="h-5 w-9 rounded-full bg-neutral-900 relative cursor-pointer">
                <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
              </motion.div>
            </motion.div>
            <motion.div 
              {...hoverable}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100"
            >
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Push Notifications</p>
                <p className="text-xs text-neutral-500">Real-time alerts on your devices.</p>
              </div>
              <motion.div {...pressable} className="h-5 w-9 rounded-full bg-neutral-200 relative cursor-pointer">
                <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Keep your account safe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              {...hoverable}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100"
            >
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Password</p>
                <p className="text-xs text-neutral-500">Last changed 3 months ago.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => console.log('Update password')}>
                Update
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
