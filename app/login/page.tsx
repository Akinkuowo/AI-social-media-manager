'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { loginAction } from '@/actions/login';
import { showAlert } from '@/lib/alerts';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await loginAction({ email, password });

      if (result?.error) {
        showAlert.error('Login Failed', 'The email or password you entered is incorrect.');
      } else if (result?.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error("[LOGIN_PAGE] Unexpected error:", err);
      showAlert.error('System Error', 'An unexpected error occurred during login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6">
            <span className="text-2xl font-extrabold tracking-tight">
              Social<span className="text-primary">AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted">Login to manage your social media presence.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          
          <Input 
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            showPasswordToggle
            required
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-secondary transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            Login <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:text-secondary font-medium transition-colors">
            Sign up for free
          </Link>
        </div>
      </Card>
    </div>
  );
}
