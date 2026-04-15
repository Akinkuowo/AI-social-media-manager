'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Target, 
  ArrowRight,
  Palette
} from 'lucide-react';
import { clsx } from 'clsx';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    niche: '',
    brandVoice: 'professional',
    targetAudience: '',
    businessGoals: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    brandFont: 'Inter',
    logo: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let finalLogoUrl = formData.logo;

      // Upload logo if provided
      if (logoFile) {
        const fileData = new FormData();
        fileData.append('file', logoFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalLogoUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logo: finalLogoUrl }),
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={clsx('w-10 h-1.5 rounded-full transition-colors duration-500', step >= s ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-surface')}></div>
        ))}
      </div>

      <div className="w-full max-w-[500px]">
        {step === 1 && (
          <Card variant="glass" padding="lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Building2 size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Company Details</h1>
              <p className="text-muted">Tell us about the brand you want to manage.</p>
            </div>
            <div className="flex flex-col gap-5">
              <Input 
                label="Company Name"
                placeholder="e.g. Acme Creative"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
              <Input 
                label="Industry / Niche"
                placeholder="e.g. Digital Marketing, SaaS, Fashion"
                value={formData.niche}
                onChange={(e) => setFormData({...formData, niche: e.target.value})}
                required
              />
              <Button size="lg" onClick={handleNext} disabled={!formData.companyName || !formData.niche} className="mt-4">
                Next Step <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card variant="glass" padding="lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Palette size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Brand Voice</h1>
              <p className="text-muted">How should your AI manager sound?</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['Professional', 'Funny', 'Educational', 'Inspirational', 'Sassy'].map((voice) => (
                <div 
                  key={voice}
                  className={clsx(
                    'p-4 text-center rounded-xl font-medium cursor-pointer transition-all duration-300',
                    formData.brandVoice === voice.toLowerCase() 
                      ? 'bg-primary text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]' 
                      : 'bg-surface hover:bg-surface-hover border border-border'
                  )}
                  onClick={() => setFormData({...formData, brandVoice: voice.toLowerCase()})}
                >
                  {voice}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1" onClick={handleBack}>Back</Button>
              <Button className="flex-[2]" onClick={handleNext}>Next Step <ArrowRight size={18} className="ml-2" /></Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card variant="glass" padding="lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Target & Goals</h1>
              <p className="text-muted">What are we trying to achieve?</p>
            </div>
            <div className="flex flex-col gap-5">
              <Input 
                label="Target Audience"
                placeholder="e.g. Small business owners, tech enthusiasts"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              />
              <Input 
                label="Primary Business Goal"
                placeholder="e.g. Brand awareness, Generate sales, Engagement"
                value={formData.businessGoals}
                onChange={(e) => setFormData({...formData, businessGoals: e.target.value})}
              />
              <div className="flex gap-4 mt-4">
                <Button variant="ghost" className="flex-1" onClick={handleBack}>Back</Button>
                <Button className="flex-[2]" onClick={handleNext}>Next Step <ArrowRight size={18} className="ml-2" /></Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card variant="glass" padding="lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Palette size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Visual Assets</h1>
              <p className="text-muted">Define your brand identity.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="text-muted" />}
                  </div>
                  <input type="file" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" onChange={handleLogoChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                    <span className="text-sm font-mono">{formData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                    <span className="text-sm font-mono">{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand Font</label>
                <select 
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  value={formData.brandFont}
                  onChange={e => setFormData({...formData, brandFont: e.target.value})}
                >
                  <option value="Inter">Inter (Modern & Clean)</option>
                  <option value="Roboto">Roboto (Geometric)</option>
                  <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  <option value="Outfit">Outfit (Tech & Bold)</option>
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <Button variant="ghost" className="flex-1" onClick={handleBack}>Back</Button>
                <Button className="flex-[2]" onClick={handleSubmit} isLoading={isLoading}>Complete Setup</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
