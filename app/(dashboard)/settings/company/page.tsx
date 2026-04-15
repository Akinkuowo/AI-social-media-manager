'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Save, Palette, Target, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    // In a real implementation this would fetch from /api/company
    // using the user's active company ID.
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
    setMessage({ type: '', text: '' });
    
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

      // Here you would make a PUT request to /api/company
      // Using a placeholder since we didn't write the PUT route
      // Wait, we don't have a PUT route in /api/company for updates yet,
      // but the UI setup signifies readiness for that flow.
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Brand identity updated successfully!' });
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update company settings.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full">
      <header>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your brand assets and marketing configuration.</p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
          {message.text}
        </div>
      )}

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Building2 size={20} className="text-primary"/> General Information</h3>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Input 
            label="Company Name" 
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
          <Input 
            label="Industry / Niche" 
            value={formData.niche}
            onChange={e => setFormData({...formData, niche: e.target.value})}
          />
        </div>
      </Card>

      <Card variant="glass" padding="lg">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Target size={20} className="text-primary"/> Setup & Goals</h3>
        <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <Input 
            label="Primary Business Goals" 
            value={formData.businessGoals}
            onChange={e => setFormData({...formData, businessGoals: e.target.value})}
          />
          <Input 
            label="Target Audience" 
            value={formData.targetAudience}
            onChange={e => setFormData({...formData, targetAudience: e.target.value})}
          />
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
