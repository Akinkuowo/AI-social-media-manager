'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Check, 
  Zap, 
  Crown, 
  Globe, 
  ShieldCheck,
  DownloadCloud
} from 'lucide-react';
import { clsx } from 'clsx';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the power of AI.',
    features: ['3 AI Generations / month', '1 Connected Brand', 'Basic Analytics', 'Community Support'],
    button: 'Current Plan',
    variant: 'secondary'
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing brands needing more scale.',
    features: ['Unlimited AI Generations', '5 Connected Brands', 'Advanced AI Insights', 'Priority Support', 'Custom Brand Voices'],
    button: 'Upgrade to Pro',
    variant: 'primary',
    popular: true
  },
  {
    name: 'Agency',
    price: '$149',
    description: 'Complete control for large teams.',
    features: ['Everything in Pro', 'Unlimited Brands', 'Team Collaboration', 'API Access', 'White-label Reports'],
    button: 'Contact Sales',
    variant: 'glass'
  }
];

export default function BillingPage() {
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
            <span className="text-sm font-semibold text-primary">Free Plan</span>
          </div>
          <h3 className="text-xl font-bold mb-1">You are currently on the Free version</h3>
          <p className="text-sm text-muted">Your next billing date is <strong className="text-foreground">May 14, 2026</strong> (always $0).</p>
        </div>
        <div className="min-w-[200px] w-full md:w-auto">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">AI Generations</span>
              <span className="text-muted">1 / 3 used</span>
            </div>
            <div className="w-full h-2 bg-surface border border-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
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
            <Button variant={plan.variant as any} className="w-full mt-auto" disabled={plan.name === 'Free'}>
              {plan.button}
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
          {[1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 py-4 border-b border-border/50 items-center last:border-0 hover:bg-surface-hover transition-colors rounded-xl px-2 -mx-2">
              <span className="font-medium text-foreground">Apr 14, 2026</span>
              <span className="text-foreground">$0.00</span>
              <span className="text-success font-medium bg-success/10 px-2.5 py-1 rounded-md w-fit">Paid</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-border text-muted hover:text-foreground transition-colors"><DownloadCloud size={16} /></button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
