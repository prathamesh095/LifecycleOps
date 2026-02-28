'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart2 } from 'lucide-react';

export function AnalyticsClient() {
  return (
    <PageContainer>
      <PageHeader 
        title="Analytics" 
        description="Insights into your job search."
      />
      
      <Card>
        <EmptyState
          icon={BarChart2}
          title="No data available"
          description="Analytics will appear here once you start tracking your applications."
        />
      </Card>
    </PageContainer>
  );
}
