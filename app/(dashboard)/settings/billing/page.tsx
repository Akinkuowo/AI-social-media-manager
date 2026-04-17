'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Check, 
  Zap, 
  Crown, 
  Globe, 
  ShieldCheck,
  DownloadCloud,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { showAlert } from '@/lib/alerts';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    description: 'Perfect for exploring the power of AI.',
    features: ['3 AI Generations / month', '1 Connected Brand', 'Basic Analytics', 'Community Support'],
    button: 'Current Plan',
    variant: 'secondary'
  },
  {
    name: 'Pro',
    price: '₦20k',
    description: 'For growing brands needing more scale.',
    features: ['Unlimited AI Generations', '5 Connected Brands', 'Advanced AI Insights', 'Priority Support', 'Custom Brand Voices'],
    button: 'Upgrade to Pro',
    variant: 'primary',
    popular: true
  },
  {
    name: 'Agency',
    price: '₦50k',
    description: 'Complete control for large teams.',
    features: ['Everything in Pro', 'Unlimited Brands', 'Team Collaboration', 'API Access', 'White-label Reports'],
    button: 'Upgrade to Agency',
    variant: 'glass'
  }
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [subRes, invRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/history')
      ]);

      if (subRes.ok) setSubscription(await subRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
    } catch (err) {
      console.error("FAILED_TO_FETCH_BILLING:", err);
      showAlert.error('Billing Error', 'We could not retrieve your billing details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Paystack Verification Logic
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference') || params.get('trxref');
      
      if (reference) {
        setIsProcessing(true);
        fetch('/api/billing/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        })
        .then(res => res.json().then(data => ({ status: res.status, ok: res.ok, data })))
        .then(({ ok, data }) => {
           if (ok) {
             showAlert.success('Payment Successful', `Welcome to the ${data.plan} plan!`);
             fetchData();
           } else {
             showAlert.error('Payment Failed', data.message || 'Transaction failed.');
           }
        })
        .catch(() => showAlert.error('Error', 'Network error during verification.'))
        .finally(() => {
           window.history.replaceState({}, document.title, window.location.pathname);
           setIsProcessing(false);
        });
      }
    }
  }, []);

  const handleUpgrade = async (planName: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/billing/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName })
      });
      const data = await res.json();
      
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        showAlert.error('Initialization Failed', data.message);
        setIsProcessing(false);
      }
    } catch (err) {
      showAlert.error('Network Error', 'Failed to connect to the payment gateway.');
      setIsProcessing(false);
    }
  };

  if (isLoading || isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        {isProcessing && <p className="text-sm font-medium text-muted animate-pulse">Processing Payment Gateway...</p>}
      </div>
    );
  }

  const currentUsage = subscription?.usageCount || 0;
  const maxUsage = subscription?.plan === 'AGENCY' ? Infinity : subscription?.plan === 'PRO' ? 100 : 3;
  const usagePercentage = maxUsage === Infinity ? 10 : Math.min((currentUsage / maxUsage) * 100, 100);
  const planName = subscription?.plan || 'FREE';

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-12">
      <header>
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your account plan and billing details.</p>
      </header>

      <Card variant="glass" padding="lg" className="flex items-center justify-between border-l-4 border-l-primary max-md:flex-col max-md:items-start max-md:gap-6">
        <div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full w-fit mb-4">
            <Zap size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary capitalize">{planName.toLowerCase()} Plan</span>
          </div>
          <h3 className="text-xl font-bold mb-1">
            You are currently on the {planName === 'FREE' ? 'Free version' : `${planName.toLowerCase()} plan`}
          </h3>
          <p className="text-sm text-muted">
            {subscription?.currentPeriodEnd 
              ? `Your next billing date is ${format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}.`
              : "No upcoming payments scheduled."}
          </p>
        </div>
        <div className="min-w-[200px] w-full md:w-auto">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">AI Generations</span>
              <span className="text-muted">
                {currentUsage} / {maxUsage === Infinity ? '∞' : maxUsage} used
              </span>
            </div>
            <div className="w-full h-2 bg-surface border border-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        {plans.map((plan) => (
          <Card key={plan.name} variant="glass" padding="lg" className={clsx('relative flex flex-col h-full', plan.popular && 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.1)] -translate-y-2')}>
            {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">Most Popular</div>}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6">
                {plan.name === 'Free' && <Globe size={24} />}
                {plan.name === 'Pro' && <Crown size={24} className="text-warning" />}
                {plan.name === 'Agency' && <ShieldCheck size={24} className="text-primary" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted font-medium">/month</span>
              </div>
              <p className="text-sm text-muted mb-8 min-h-[40px]">{plan.description}</p>
            </div>
            <div className="flex flex-col gap-4 mb-8 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm">
                  <Check size={18} className="text-success flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <Button 
              variant={plan.variant as any} 
              className="w-full mt-auto" 
              disabled={planName.toUpperCase() === plan.name.toUpperCase()}
              onClick={() => {
                if (plan.name === 'Free') return;
                handleUpgrade(plan.name);
              }}
            >
              {planName.toUpperCase() === plan.name.toUpperCase() ? 'Current Plan' : plan.button}
            </Button>
          </Card>
        ))}
      </div>

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6">Billing History</h3>
        <div className="w-full text-sm">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 py-3 border-b border-border/50 text-muted font-semibold">
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-center">Invoice</span>
          </div>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 py-4 border-b border-border/50 items-center last:border-0 hover:bg-surface-hover transition-colors rounded-xl px-2 -mx-2">
                <span className="font-medium text-foreground">{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                <span className="text-foreground">${invoice.amount.toFixed(2)}</span>
                <span className={clsx(
                  "text-xs font-bold px-2.5 py-1 rounded-md w-fit uppercase tracking-wider",
                  invoice.status === 'paid' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {invoice.status}
                </span>
                <button 
                  onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-border text-muted hover:text-foreground transition-colors"
                  title="Download Receipt"
                >
                  <DownloadCloud size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-muted">
              No billing history available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
