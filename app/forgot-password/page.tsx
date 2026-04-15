"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password reset email sent! Please check your inbox.");
      } else {
        setError(data.message || "Failed to send reset email.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted text-sm">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-success/10 border border-success/30 text-success text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
            disabled={isLoading || !!success}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || !!success || !email}
            className="w-full mt-2"
          >
            Send Reset Link <Send size={18} className="ml-2" />
          </Button>

          <Link href="/login" className="w-full">
            <Button type="button" variant="ghost" className="w-full mt-1">
              <ArrowLeft size={18} className="mr-2" /> Back to Login
            </Button>
          </Link>
        </form>
      </Card>
    </div>
  );
}
