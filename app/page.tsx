'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { isAuthenticated } from '@/lib/auth-setup';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
            ApexJob
          </h1>
          <p className="text-xl md:text-2xl text-slate-600">
            Master Your Job Application Journey
          </p>
        </div>

        {/* Description */}
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Track applications, manage follow-ups, and stay organized with our modern job application dashboard. Built for professionals who want to stay on top of their job search.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 py-8">
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900">Track Applications</h3>
            <p className="text-sm text-slate-600 mt-2">Keep all your job applications in one place</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900">Manage Follow-ups</h3>
            <p className="text-sm text-slate-600 mt-2">Never miss an important deadline</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900">Get Insights</h3>
            <p className="text-sm text-slate-600 mt-2">Understand your application pipeline</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="text-base px-8 py-6"
        >
          Get Started
        </Button>

        {/* Footer */}
        <p className="text-sm text-slate-500">
          No credit card required. Start tracking today.
        </p>
      </div>
    </div>
  );
}
