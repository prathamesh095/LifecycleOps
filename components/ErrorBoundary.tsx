'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-neutral-100">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
            <p className="text-neutral-500 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <div className="bg-rose-50 p-4 rounded-xl mb-6 text-left overflow-auto max-h-40">
              <code className="text-xs text-rose-600 font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
