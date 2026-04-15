"use client";

import Link from "next/link";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Check, 
  Globe, 
  Crown, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { clsx } from "clsx";

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the power of AI.',
    features: ['3 AI Generations / month', '1 Connected Brand', 'Basic Analytics', 'Community Support'],
    button: 'Start Free',
    variant: 'secondary'
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing brands needing more scale.',
    features: ['Unlimited AI Generations', '5 Connected Brands', 'Advanced AI Insights', 'Priority Support', 'Custom Brand Voices'],
    button: 'Start Free Trial',
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

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass flex justify-between items-center px-16 py-6 sticky top-0 z-50 mt-4 mx-8 rounded-2xl max-lg:px-8">
        <div>
          <Link href="/" className="text-2xl font-extrabold tracking-tight hover:-translate-y-0.5 transition-transform inline-block">
            Social<span className="text-primary">AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-foreground font-medium transition-all duration-300">Pricing</Link>
          <Link href="/login" className="font-semibold px-6 py-3 text-muted hover:text-foreground transition-all duration-300">Login</Link>
          <Link href="/register" className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-8 py-20 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-16">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted">
            Choose the plan that best fits your brand's needs. Scale your social media presence with superhuman intelligence.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-[1200px] w-full max-lg:grid-cols-1">
          {plans.map((plan) => (
            <Card key={plan.name} variant="glass" padding="lg" className={clsx('relative flex flex-col h-full transition-transform duration-300 hover:-translate-y-1', plan.popular && 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.1)]')}>
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_14px_rgba(59,130,246,0.3)]">Most Popular</div>}
              <div>
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6">
                  {plan.name === 'Free' && <Globe size={24} className="text-foreground" />}
                  {plan.name === 'Pro' && <Crown size={24} className="text-warning" />}
                  {plan.name === 'Agency' && <ShieldCheck size={24} className="text-primary" />}
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
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
              <Link href="/register" className="w-full mt-auto block">
                <Button variant={plan.variant as any} className="w-full h-12">
                  {plan.button} {plan.popular && <ArrowRight size={16} className="ml-2" />}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
