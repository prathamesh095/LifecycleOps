import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

export const metadata: Metadata = {
  title: 'ApexJob',
  description: 'A modern SaaS dashboard for job application tracking',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthInitializer />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}
