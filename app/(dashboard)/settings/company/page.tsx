'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Save, Palette, Target, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { INDUSTRIES, BUSINESS_GOALS, TARGET_AUDIENCES } from '@/lib/constants';
import { showAlert } from '@/lib/alerts';

export default function CompanySettingsPage() {
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
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        console.log("[SETTINGS] Fetching company data...");
        const res = await fetch('/api/company');
        
        if (res.ok) {
          const data = await res.json();
          console.log("[SETTINGS] Company data received:", data);
          setFormData({
            companyName: data.name || '',
            niche: data.niche || '',
            brandVoice: data.brandVoice || 'professional',
            targetAudience: data.targetAudience || '',
            businessGoals: data.businessGoals || '',
            primaryColor: data.primaryColor || '#3b82f6',
            secondaryColor: data.secondaryColor || '#1e3a8a',
            brandFont: data.brandFont || 'Inter',
            logo: data.logo || '',
          });
          if (data.logo) {
            setLogoPreview(data.logo);
          }
        } else {
          console.error(`[SETTINGS] Fetch failed with status: ${res.status}`);
          showAlert.error('Load Failed', 'Could not retrieve your company profile. Please check your connection.');
        }
      } catch (err) {
        console.error("[SETTINGS] Unexpected fetch error:", err);
        showAlert.error('Data Error', 'An unexpected error occurred while loading your profile.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      let finalLogoUrl = formData.logo;

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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, logo: finalLogoUrl }),
      });

      if (res.ok) {
        showAlert.success('Identity Updated', 'Your brand assets and settings have been saved successfully.');
      } else {
        const errorData = await res.json();
        showAlert.error('Save Failed', errorData.message || 'Failed to update company settings.');
      }
      
    } catch (err) {
      showAlert.error('Connection Error', 'An error occurred while saving. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl w-full">
        <header className="animate-pulse">
          <div className="h-8 w-64 bg-surface rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-surface rounded-lg"></div>
        </header>
        <Card variant="glass" padding="lg">
          <div className="flex flex-col gap-6">
            <div className="h-6 w-48 bg-surface rounded-lg mb-4"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-12 bg-surface rounded-xl"></div>
              <div className="h-12 bg-surface rounded-xl"></div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="h-6 w-48 bg-surface rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-surface rounded-xl"></div>
            <div className="h-12 bg-surface rounded-xl"></div>
            <div className="h-12 bg-surface rounded-xl"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full">
      <header>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your brand assets and marketing configuration.</p>
      </header>



      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Building2 size={20} className="text-primary"/> General Information</h3>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Input 
            label="Company Name" 
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Industry / Niche</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.niche}
              onChange={(e) => setFormData({...formData, niche: e.target.value})}
            >
              <option value="" disabled>Select an industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Target size={20} className="text-primary"/> Setup & Goals</h3>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Primary Business Goals</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.businessGoals}
              onChange={(e) => setFormData({...formData, businessGoals: e.target.value})}
            >
              <option value="" disabled>Select business goal</option>
              {BUSINESS_GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Target Audience</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
            >
              <option value="" disabled>Select target audience</option>
              {TARGET_AUDIENCES.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brand Voice</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.brandVoice}
              onChange={e => setFormData({...formData, brandVoice: e.target.value})}
            >
              <option value="professional">Professional</option>
              <option value="funny">Funny</option>
              <option value="educational">Educational</option>
              <option value="inspirational">Inspirational</option>
              <option value="sassy">Sassy</option>
            </select>
          </div>
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Palette size={20} className="text-primary"/> Brand Assets</h3>
        
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted" />}
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
            <label className="block text-sm font-medium mb-2">Typography</label>
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
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} isLoading={isLoading}>
          <Save size={18} className="mr-2"/> Save Brand Identity
        </Button>
      </div>
    </div>
  );
}
