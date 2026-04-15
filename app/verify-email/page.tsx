'use client';

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const onSubmit = useCallback(async () => {
    if (success || error) return;

    if (!token) {
      setError("Missing verification token!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          {loading && <Loader2 className="w-16 h-16 animate-spin text-primary" />}
          {success && <CheckCircle2 className="w-16 h-16 text-success" />}
          {error && <XCircle className="w-16 h-16 text-error" />}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">
          {loading ? "Verifying Email..." : success ? "Email Verified" : "Verification Failed"}
        </h1>
        
        <p className="text-muted mb-8">
          {loading ? "Please wait while we verify your email address." : success || error}
        </p>

        {!loading && (
          <Button onClick={() => router.push("/login")} className="w-full">
            Back to Login
          </Button>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
