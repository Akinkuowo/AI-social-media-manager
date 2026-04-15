'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { showAlert } from '@/lib/alerts';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'bg-[#1877F2]' },
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]' },
  { id: 'twitter', name: 'X / Twitter', color: 'bg-[#000000]' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-[#0A66C2]' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-[#010101]' },
];

interface SocialAccount {
  id: string;
  platform: string;
  platformId: string;
  name: string;
  expiresAt?: string;
}

interface Subscription {
  plan: 'FREE' | 'PRO' | 'AGENCY';
  status: string;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const fetchData = async () => {
    try {
      const [accountsRes, subRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/billing/subscription')
      ]);

      if (accountsRes.ok) {
        setAccounts(await accountsRes.json());
      }
      if (subRes.ok) {
        setSubscription(await subRes.json());
      }
    } catch (err) {
      console.error("PAGE_FETCH_ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = (platform: string) => {
    const limit = subscription?.plan === 'FREE' ? 2 : Infinity;
    if (accounts.length >= limit) {
      showAlert.error('Limit Reached', 'Free accounts are limited to 2 social connections. Upgrade to Pro for unlimited accounts!');
      return;
    }
    
    // Redirect to OAuth
    window.location.href = `/api/social/connect/${platform}`;
  };

  const handleRemove = async (accountId: string) => {
    const result = await showAlert.confirm(
      'Disconnect Account?',
      'You will no longer be able to post to this account from the platform.',
      'Yes, Disconnect'
    );

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/social/accounts/${accountId}`, { method: 'DELETE' });
        if (res.ok) {
          showAlert.toast('Account disconnected successfully');
          fetchData();
        }
      } catch (err) {
        showAlert.error('Error', 'Failed to disconnect account');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const isFree = subscription?.plan === 'FREE';
  const connectionLimit = isFree ? 2 : 'Unlimited';

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-12">
      <header className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold">Social Connections</h1>
          <p className="text-sm text-muted mt-1">Manage and connect your brand's social media accounts.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-white/5 px-4 py-2 rounded-2xl">
          <div className="flex flex-col items-end">
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest leading-none mb-1">Account Usage</p>
            <p className="text-sm font-black">{accounts.length} / {connectionLimit}</p>
          </div>
          {isFree && accounts.length >= 2 && (
             <Button variant="primary" size="sm" className="h-8 py-0 px-3 text-[10px] font-bold uppercase tracking-wider">Upgrade</Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {PLATFORMS.map((platform) => {
          const connectedAccount = accounts.find(a => a.platform === platform.id);
          
          return (
            <Card key={platform.id} variant="glass" padding="none" className="overflow-hidden group">
              <div className="flex items-center p-6 max-md:flex-col max-md:items-start max-md:gap-6">
                <div className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg",
                  platform.color
                )}>
                  <ExternalLink size={24} />
                </div>
                
                <div className="flex-1 px-6">
                  <h3 className="text-lg font-bold capitalize">{platform.name}</h3>
                  {connectedAccount ? (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">
                          <ShieldCheck size={12} /> Connected
                        </div>
                        <span className="text-sm font-bold text-foreground">{connectedAccount.name}</span>
                      </div>
                      <p className="text-[10px] text-muted font-mono bg-white/5 w-fit px-1.5 py-0.5 rounded">ID: {connectedAccount.platformId}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted mt-1">Streamline your workflow by connecting your {platform.name} business account.</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {connectedAccount ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleConnect(platform.id)} className="h-9">
                        <RefreshCw size={14} className="mr-2" /> Reconnect
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error hover:bg-error/10 hover:text-error h-9 w-9 p-0" onClick={() => handleRemove(connectedAccount.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => handleConnect(platform.id)}
                      disabled={isFree && accounts.length >= 2}
                      className="h-10"
                    >
                      <Plus size={18} className="mr-2" /> Connect Account
                    </Button>
                  )}
                </div>
              </div>
              
              {connectedAccount?.expiresAt && (
                <div className="bg-white/2 px-6 py-2 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] text-muted">
                     <AlertCircle size={12} className={clsx(
                       new Date(connectedAccount.expiresAt) < new Date() ? "text-error" : "text-warning"
                     )} />
                     {new Date(connectedAccount.expiresAt) < new Date() 
                       ? "Token Expired. Please reconnect to restore posting functionality." 
                       : `Token active until ${new Date(connectedAccount.expiresAt).toLocaleDateString()}`
                     }
                   </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {isFree && (
        <Card variant="glass" padding="lg" className="bg-primary/5 border-primary/10 flex items-center gap-6 mt-4">
           <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
             <Lock size={20} />
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-sm">Need more connections?</h4>
             <p className="text-xs text-muted mt-0.5">Professional and Agency plans include unlimited social account connections and priority support.</p>
           </div>
           <Button variant="primary" size="sm">Compare Plans</Button>
        </Card>
      )}
    </div>
  );
}

