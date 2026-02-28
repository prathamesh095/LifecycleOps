'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Book, MessageCircle, FileText } from 'lucide-react';

export function HelpClient() {
  return (
    <PageContainer>
      <PageHeader 
        title="Help & Support" 
        description="Get help with ApexJob."
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-neutral-300 cursor-pointer transition-colors group">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 text-neutral-500 group-hover:text-neutral-900 transition-colors">
              <Book className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">
              Read our detailed guides and tutorials to get the most out of ApexJob.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-neutral-300 cursor-pointer transition-colors group">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 text-neutral-500 group-hover:text-neutral-900 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">
              Need help? Chat with our support team for quick answers.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-neutral-300 cursor-pointer transition-colors group">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 text-neutral-500 group-hover:text-neutral-900 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">API Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">
              Detailed API documentation for developers building on ApexJob.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
