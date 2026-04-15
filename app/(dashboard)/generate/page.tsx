'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  Layout,
  Type,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { showAlert } from '@/lib/alerts';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';

const Instagram = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Twitter = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const Linkedin = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Facebook = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
];

const POST_TYPES = [
  { id: 'educational', name: 'Educational', description: 'Tips, how-tos, and industry knowledge.' },
  { id: 'promotional', name: 'Promotional', description: 'Highlighting products, services, or offers.' },
  { id: 'storytelling', name: 'Storytelling', description: 'Brand journey, personal anecdotes, or client success.' },
  { id: 'humor', name: 'Humorous', description: 'Memes, relatable industry humor, and lighthearted takes.' },
];

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState('instagram');
  const [type, setType] = useState('educational');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ caption: string; hashtags: string[]; mediaPrompt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDay, setScheduleDay] = useState(new Date().getDate());
  const [isScheduling, setIsScheduling] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, type, promptOverride: prompt })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStep(3);
        showAlert.toast('Content generated successfully!');
      } else {
        const error = await res.json();
        showAlert.error('Generation Failed', error.message || 'Something went wrong while generating your post.');
      }
    } catch (err) {
      console.error("GENERATION_FAILED:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showAlert.toast('Copied to clipboard!');
  };

  const handleSchedule = async () => {
    if (!result) return;
    setIsScheduling(true);

    try {
      // 1. Get current month's calendar
      const calRes = await fetch(`/api/calendar?month=${new Date().getMonth()}&year=${new Date().getFullYear()}`);
      if (!calRes.ok) throw new Error("Could not find calendar");
      const calendar = await calRes.json();

      // 2. Schedule the post
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: calendar.id,
          day: scheduleDay,
          type,
          caption: result.caption,
          hashtags: result.hashtags.join(' '),
          // Note: In a real app, we'd selection a socialAccountId too
        })
      });

      if (res.ok) {
        showAlert.success('Scheduled!', 'Your AI content has been added to the calendar.');
        setIsScheduleModalOpen(false);
      }
    } catch (err) {
      console.error("SCHEDULING_FAILED:", err);
      showAlert.error('Error', 'Failed to schedule post.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
          <Sparkles size={16} />
          <span>AI Content Studio</span>
        </div>
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Create Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Amazing</span></h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">Transform your brand voice into high-performing social media content in seconds.</p>
      </header>

      <div className="grid grid-cols-[380px_1fr] gap-12 max-lg:grid-cols-1">
        {/* Sidebar Controls */}
        <aside className="flex flex-col gap-6">
          <Card variant="glass" padding="lg" className="sticky top-8">
            <div className="flex flex-col gap-8">
              {/* Step 1: Platform */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-4 block">1. Select Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={clsx(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2",
                          platform === p.id 
                            ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" 
                            : "bg-surface border-border text-muted hover:border-primary/50"
                        )}
                      >
                        <Icon size={24} className={clsx(platform === p.id ? p.color : "text-muted")} />
                        <span className="text-xs font-bold uppercase tracking-tight">{p.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Post Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-4 block">2. Strategy & Tone</label>
                <div className="flex flex-col gap-3">
                  {POST_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={clsx(
                        "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 text-left",
                        type === t.id 
                          ? "bg-primary/10 border-primary shadow-sm" 
                          : "bg-surface border-border hover:border-primary/50"
                      )}
                    >
                      <div className={clsx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        type === t.id ? "border-primary" : "border-muted"
                      )}>
                        {type === t.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className={clsx("text-sm font-bold", type === t.id ? "text-primary" : "text-foreground")}>{t.name}</p>
                        <p className="text-[10px] text-muted mt-0.5 leading-relaxed">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Input */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted block">3. Content Focus</label>
                <textarea
                  className="w-full h-32 bg-surface rounded-xl border border-border p-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                  placeholder="What should this post be about? (e.g. New sneaker launch, 5 tips for summer hair, our company mission...)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button 
                  className="w-full py-6 rounded-xl text-lg font-bold"
                  isLoading={isGenerating}
                  onClick={handleGenerate}
                  disabled={!prompt}
                >
                  <Sparkles size={20} className="mr-2" /> Generate Post
                </Button>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main>
          <AnimatePresence mode="wait">
            {!result && !isGenerating ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-[32px] bg-surface/30 min-h-[600px] text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-pulse">
                  <Layout size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Your Content Studio is Ready</h3>
                <p className="text-muted max-w-sm mb-8">Fill in the strategy on the left and our AI will generate professional platform-optimized content for you.</p>
                <div className="flex gap-4 opacity-50 grayscale pointer-events-none">
                   <Card padding="md" variant="glass" className="w-32"><Type size={16} /></Card>
                   <Card padding="md" variant="glass" className="w-32"><MessageSquare size={16} /></Card>
                   <Card padding="md" variant="glass" className="w-32"><ImageIcon size={16} /></Card>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 min-h-[600px] text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-8" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Generating Magic...</h3>
                <p className="text-muted">Analying your brand voice and optimizing for {platform}.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-8"
              >
                <Card variant="glass" padding="none" className="overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/5">
                  <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                        <Check size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">Generation Complete</h3>
                        <p className="text-xs text-muted uppercase tracking-widest font-bold">Resonating with your audience</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" onClick={() => handleGenerate()} className="text-muted hover:text-primary">
                         <RefreshCw size={16} className="mr-2" /> Regenerate
                       </Button>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="mb-8">
                       <div className="flex items-center justify-between mb-4">
                         <label className="text-xs font-bold uppercase tracking-widest text-muted">Optimized Caption</label>
                         <button 
                           onClick={() => copyToClipboard(result?.caption || '')}
                           className="text-[10px] font-bold uppercase flex items-center gap-1.5 hover:text-primary transition-colors"
                         >
                           {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                           {copied ? 'Copied!' : 'Copy to Clipboard'}
                         </button>
                       </div>
                       <div className="p-6 rounded-2xl bg-surface/50 border border-border text-lg leading-relaxed whitespace-pre-wrap selection:bg-primary/20">
                         {result?.caption}
                       </div>
                    </div>

                    <div className="mb-8">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted mb-4 block">Recommended Hashtags</label>
                       <div className="flex flex-wrap gap-2">
                         {result?.hashtags.map((tag, i) => (
                           <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer">
                             {tag}
                           </span>
                         ))}
                       </div>
                    </div>

                    <div>
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                           <ImageIcon size={18} />
                         </div>
                         <label className="text-xs font-bold uppercase tracking-widest text-muted">Creative Visualization Asset</label>
                       </div>
                       <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 border-dashed relative group">
                         <p className="text-sm text-secondary/80 italic leading-relaxed">
                           "{result?.mediaPrompt}"
                         </p>
                         <div className="mt-4 flex gap-3">
                            <Button size="sm" variant="secondary" className="text-[10px] font-bold uppercase py-1 h-auto">
                              Copy Prompt
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[10px] font-bold uppercase py-1 h-auto opacity-50">
                              Generate Image (Coming Soon)
                            </Button>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-surface/50 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted font-medium">Auto-saved to your content library</span>
                    <Button variant="primary" size="sm" onClick={() => setIsScheduleModalOpen(true)}>
                       Schedule Post <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </Card>

                {/* Platform Tips Card */}
                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                   <Card variant="glass" padding="md" className="border-l-4 border-l-warning">
                      <h4 className="font-bold text-sm mb-2">Strategy Tip</h4>
                      <p className="text-xs text-muted leading-relaxed">Posts with questions at the end see 45% more engagement on {platform}. Consider adding a poll if the platform supports it.</p>
                   </Card>
                   <Card variant="glass" padding="md" className="border-l-4 border-l-success">
                      <h4 className="font-bold text-sm mb-2">Best Time to Post</h4>
                      <p className="text-xs text-muted leading-relaxed">For your niche {type} content performs best between 11:00 AM and 2:00 PM on weekdays.</p>
                   </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule to Calendar"
      >
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select Day ({format(new Date(), 'MMMM yyyy')})</label>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setScheduleDay(d)}
                  className={clsx(
                    "w-10 h-10 rounded-xl border text-xs font-bold transition-all",
                    scheduleDay === d 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-surface border-border text-muted hover:border-primary/50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
             <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Preview</p>
             <p className="text-xs text-muted line-clamp-2">{result?.caption}</p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSchedule} isLoading={isScheduling}>Confirm Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
