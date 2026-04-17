'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

export const SOCIAL_SCOPES = {
  facebook: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'instagram_basic', 'instagram_content_publish', 'public_profile']
};

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
  const searchParams = useSearchParams();
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

  const handleConnect = async (platform: string) => {
    const limit = subscription?.plan === 'FREE' ? 2 : Infinity;
    if (accounts.length >= limit) {
      showAlert.error('Limit Reached', 'Free accounts are limited to 2 social connections. Upgrade to Pro for unlimited accounts!');
      return;
    }

    if (platform === 'instagram') {
      const result = await showAlert.confirm(
        'Instagram Connection',
        'Because Instagram is managed by Meta, you will be redirected to log in with Facebook. Please ensure your Instagram Business account is linked to the Facebook Page you select.',
        'Got it, Continue'
      );
      
      if (!result.isConfirmed) {
        return;
      }
    }
    
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
  
  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    switch (error) {
      case 'token_exchange_failed': 
        return 'Facebook Token Exchange Failed. This usually means your CLIENT_SECRET or REDIRECT_URI in the Developer Portal does not match your .env settings.';
      case 'facebook_api_error': 
        return 'Could not retrieve data from Facebook. Please ensure "App Domains" includes localhost and your "Use Case" permissions are active.';
      case 'database_error': 
        return 'Database Sync Error. This could be due to a unique constraint or connection issue. Please try disconnecting and reconnecting.';
      case 'oauth_failed': 
        return 'The connection process was cancelled or failed. Please try again.';
      case 'limit_reached': 
        return 'You have reached the maximum number of social accounts for your plan.';
      case 'no_company': 
        return 'We could not identify your company workspace. Please log in again.';
      case 'no_pages_found': 
        return 'No Facebook Pages specifically selected. Click "Edit Settings" in the Facebook popup and select a Page.';
      default: 
        return 'An unexpected error occurred during connection. Please check your server logs for details.';
    }
  };

  const errorMsg = getErrorMessage(searchParams.get('error'));
  const errorDetails = searchParams.get('details');

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Social Connections</h1>
          <p className="text-muted mt-1">Manage and connect your brand's social media accounts.</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-surface border border-border flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Account Usage</p>
             <p className="text-sm font-black text-foreground">{accounts.length} / {isFree ? '2' : '∞'}</p>
           </div>
           <div className="h-8 w-[1px] bg-border" />
           <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${Math.min((accounts.length / (isFree ? 2 : 10)) * 100, 100)}%` }} 
              />
           </div>
        </div>
      </header>
      
      {errorMsg && (
        <div className="mb-8 p-6 rounded-xl bg-error/10 border border-error/20 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-4 text-error mb-2">
              <AlertCircle size={20} />
              <p className="text-sm font-bold uppercase tracking-wider">{errorMsg}</p>
           </div>
           {errorDetails && (
             <div className="ml-9 p-3 rounded-lg bg-black/20 font-mono text-[10px] text-error/80 break-all border border-error/10">
                Error Trace: {errorDetails}
             </div>
           )}
        </div>
      )}

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
           <Button variant="primary" size="sm" onClick={() => window.location.href = '/settings/billing'}>Compare Plans</Button>
        </Card>
      )}
    </div>
  );
}

