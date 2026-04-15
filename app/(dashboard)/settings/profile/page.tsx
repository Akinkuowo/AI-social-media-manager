'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, ShieldAlert, Smartphone, Save, KeyRound, Loader2 } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const initTwoFactor = async () => {
    setIsSettingUp(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setQrCodeData(data.qrCode);
        setTwoFactorSecret(data.secret);
        setShowTwoFactorSetup(true);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initialize 2FA.' });
    } finally {
      setIsSettingUp(false);
    }
  };

  const verifyTwoFactor = async (enable: boolean) => {
    setIsVerifying(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode, enable }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowTwoFactorSetup(false);
        setVerifyCode('');
        
        // Refresh the session with the new 2FA status
        await update({
          ...session,
          user: {
            ...session?.user,
            twoFactorEnabled: enable
          },
          twoFactorEnabled: enable
        });
        
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Verification failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const is2FAEnabled = (session?.user as any)?.twoFactorEnabled;

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full">
      <header>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your personal profile and security preferences.</p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
          {message.text}
        </div>
      )}

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><KeyRound size={20} className="text-primary"/> Personal Information</h3>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Input label="Full Name" defaultValue={session?.user?.name || ""} />
          <Input label="Email Address" defaultValue={session?.user?.email || ""} disabled />
        </div>
        <Button className="mt-6"><Save size={16} className="mr-2"/> Save Changes</Button>
      </Card>

      <Card variant="glass" padding="lg">
        <div className="flex items-start justify-between max-md:flex-col max-md:gap-4 border-b border-border/50 pb-6 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield size={20} className={is2FAEnabled ? "text-success" : "text-secondary"} /> Two-Factor Authentication
            </h3>
            <p className="text-sm text-muted mt-1 max-w-lg">Protect your account with an extra layer of security. Once configured, you'll be required to enter both your password and an authentication code from your mobile phone in order to sign in.</p>
          </div>
          <div>
            {is2FAEnabled ? (
              <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl border border-success/20 font-bold text-sm">
                <Shield size={16} /> Enabled
              </div>
            ) : (
              <Button variant="secondary" onClick={initTwoFactor} isLoading={isSettingUp}>Enable 2FA</Button>
            )}
          </div>
        </div>

        {showTwoFactorSetup && (
          <div className="flex flex-col gap-6 bg-surface/50 p-6 rounded-xl border border-border">
            <h4 className="font-bold flex items-center gap-2"><Smartphone size={18} /> Setup Authenticator App</h4>
            <div className="grid grid-cols-[auto_1fr] gap-8 max-md:grid-cols-1 items-center">
              <div className="bg-white p-4 rounded-2xl w-48 h-48 border border-white/20">
                {qrCodeData ? <img src={qrCodeData} alt="QR Code" className="w-full h-full object-contain" /> : <Loader2 className="w-8 h-8 animate-spin text-primary m-auto mt-16" />}
              </div>
              <div className="flex flex-col gap-4 max-w-sm">
                <ol className="list-decimal pl-5 text-sm text-muted flex flex-col gap-2">
                  <li>Download a verification app like <strong className="text-foreground">Google Authenticator</strong> or <strong className="text-foreground">Authy</strong>.</li>
                  <li>Scan the QR code with your app.</li>
                  <li>Enter the 6-digit code generated by the app to verify and activate.</li>
                </ol>
                <div className="mt-2">
                  <Input 
                    placeholder="Enter 6-digit code" 
                    value={verifyCode} 
                    onChange={e => setVerifyCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button variant="primary" className="mt-3 w-full" onClick={() => verifyTwoFactor(true)} isLoading={isVerifying} disabled={verifyCode.length !== 6}>
                    Verify and Activate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {is2FAEnabled && (
          <div className="mt-6 flex items-start gap-4 p-4 rounded-xl border border-warning/30 bg-warning/5">
            <ShieldAlert size={24} className="text-warning flex-shrink-0" />
            <div className="text-sm">
              <strong className="text-foreground block mb-1">To disable 2FA</strong>
              <p className="text-muted mb-3">If you lose access to your authenticator app, you will need to use a recovery code or contact support to regain access. Disable it below if you need to.</p>
              <div className="flex gap-2">
                <Input placeholder="Current 6-digit code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} className="w-48" />
                <Button variant="error" onClick={() => verifyTwoFactor(false)} isLoading={isVerifying} disabled={verifyCode.length !== 6}>Disable 2FA</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
