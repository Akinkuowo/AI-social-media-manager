import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { User, Building2, CreditCard, Shield, Palette, Zap } from 'lucide-react';

export default function SettingsHubPage() {
  const settingCards = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal details, email, and Two-Factor Authentication.',
      icon: <User className="text-primary" size={24} />,
      href: '/settings/profile',
      features: ['2FA Security', 'Password Reset', 'Personal Information']
    },
    {
      title: 'Company Identity',
      description: 'Configure your brand assets, logo, and customize your AI marketing voice.',
      icon: <Building2 className="text-secondary" size={24} />,
      href: '/settings/company',
      features: ['Logo & Colors', 'Tone of Voice', 'Business Goals']
    },
    {
      title: 'Billing & Plan',
      description: 'Upgrade your limits, manage payment methods, and review invoices.',
      icon: <CreditCard className="text-success" size={24} />,
      href: '/settings/billing',
      features: ['Subscription Management', 'API Usage', 'Invoice History']
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl w-full">
      <header>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-sm text-muted mt-1">Configure your personal security, brand identity, and subscription limits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {settingCards.map((card, index) => (
          <Link href={card.href} key={index} className="block group">
            <Card variant="glass" padding="lg" className="h-full hover:-translate-y-1 transition-all duration-300 border border-border group-hover:border-primary/30 group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)]">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                {card.description}
              </p>
              
              <div className="flex flex-col gap-2 mt-auto">
                <hr className="border-border border-dashed mb-2" />
                {card.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted font-medium">
                    <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
