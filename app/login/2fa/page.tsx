'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyTwoFactorAction } from '@/actions/two-factor';

export default function TwoFactorPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated or not logged in at all, redirect accordingly
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && (session.user as any).isTwoFactorAuthenticated) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await verifyTwoFactorAction(code);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Update the session to mark 2FA as completed
        await update({ 
          isTwoFactorAuthenticated: true 
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error("[2FA_PAGE] Unexpected error:", err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse text-primary font-medium text-lg">Verifying Session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-muted">Enter the 6-digit code from your authenticator app to complete your secure login.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}
          
          <Input 
            label="Authentication Code"
            type="text"
            placeholder="000 000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            icon={<Lock size={18} />}
            required
            maxLength={6}
            autoFocus
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Verify Code <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-border/50">
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Back to login
          </button>
        </div>
      </Card>
    </div>
  );
}
