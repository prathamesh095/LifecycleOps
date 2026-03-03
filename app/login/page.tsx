'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { setUserId } from '@/lib/auth-setup';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, create a demo user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(userId);
      
      // Set a demo session token
      document.cookie = `session=${userId}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      toast.success('Welcome to ApexJob!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
        return;
      }

      const data = await response.json();
      setUserId(data.user.id);
      
      // Set session cookie
      document.cookie = `session=${data.sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      toast.success('Login successful!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">ApexJob</CardTitle>
            <CardDescription>Job application tracking made simple</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Login Button */}
            <Button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? 'Logging in...' : 'Try Demo'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center">
              Demo mode creates a temporary account. No registration needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
