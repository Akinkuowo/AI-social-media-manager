'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Hash, 
  Megaphone,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Send,
  Zap,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { showAlert } from '@/lib/alerts';

type StrategyTask = 'ideas' | 'trends' | 'competitors' | 'hashtags' | 'campaigns';

const STRATEGY_MODULES = [
  { id: 'ideas', icon: Lightbulb, label: 'Content Ideas', color: 'bg-amber-500', description: 'Fresh post concepts tailored to your brand.' },
  { id: 'trends', icon: TrendingUp, label: 'Trending Topics', color: 'bg-emerald-500', description: 'Identify what is viral in your niche right now.' },
  { id: 'competitors', icon: Target, label: 'Competitor SWOT', color: 'bg-blue-500', description: 'Analyze market gaps and competitor weaknesses.' },
  { id: 'hashtags', icon: Hash, label: 'Hashtag Clusters', color: 'bg-purple-500', description: 'Data-driven hashtag strategies for discovery.' },
  { id: 'campaigns', icon: Megaphone, label: 'Campaign Ideas', color: 'bg-rose-500', description: '30-day campaign themes for your business goals.' },
] as const;

export default function StrategyPage() {
  const [activeTask, setActiveTask] = useState<StrategyTask | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState('');
  const [copied, setCopied] = useState(false);

  const handleApplyStrategy = async (task: StrategyTask) => {
    setActiveTask(task);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/strategy/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, competitorNames: competitors }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        showAlert.error('Error', 'Failed to consult the AI assistant.');
      }
    } catch (err) {
      console.error(err);
      showAlert.error('Error', 'Network connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showAlert.success('Copied', 'Strategy copied to clipboard.');
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Zap size={24} />
          </div>
          <h1 className="text-3xl font-black font-heading tracking-tight">AI Strategy Assistant</h1>
        </div>
        <p className="text-muted text-sm max-w-2xl leading-relaxed">
          Your personal CMO in a box. Select a module below to generate high-level marketing concepts, 
          competitive research, and viral trend analysis specifically for your brand.
        </p>
      </header>

      <div className="grid grid-cols-[380px_1fr] gap-10 max-xl:grid-cols-1">
        {/* Left Sidebar: Modules */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-2 px-2">Strategy Modules</h3>
          {STRATEGY_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => handleApplyStrategy(module.id)}
              disabled={isLoading}
              className={clsx(
                "group text-left p-5 rounded-3xl border transition-all duration-300 flex items-center gap-4",
                activeTask === module.id 
                  ? "bg-primary/10 border-primary/20 scale-[1.02] shadow-lg shadow-primary/5" 
                  : "bg-surface/50 border-white/5 hover:bg-white/5 hover:scale-[1.01]"
              )}
            >
              <div className={clsx("p-3 rounded-2xl text-white transition-transform group-hover:rotate-6", module.color)}>
                <module.icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className={clsx("font-bold text-sm", activeTask === module.id ? "text-primary" : "text-foreground")}>
                  {module.label}
                </h4>
                <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{module.description}</p>
              </div>
              <ChevronRight size={16} className={clsx("transition-transform", activeTask === module.id ? "text-primary rotate-90" : "text-muted")} />
            </button>
          ))}

          {activeTask === 'competitors' && (
            <div className="mt-4 p-5 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Target Competitors (Optional)</label>
              <input 
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="e.g. Nike, Adidas, Puma"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-secondary/50"
              />
            </div>
          )}
        </div>

        {/* Right Pane: Results */}
        <Card variant="glass" padding="none" className="min-h-[600px] flex flex-col overflow-hidden relative">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/30 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest">Strategy Workspace</span>
            </div>
            {result && (
              <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-8 rounded-lg bg-white/5 border border-white/5">
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                <span className="ml-2 text-xs">{copied ? 'Copied' : 'Copy Strategy'}</span>
              </Button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-dots-active">
            {!activeTask && !isLoading && !result && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Sparkles size={64} className="mb-6 stroke-[1px] text-primary" />
                <h3 className="text-xl font-bold mb-2">Ready to expand?</h3>
                <p className="text-sm max-w-sm">Select a module on the left to begin your brand's AI-assisted strategic deep dive.</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 size={42} className="text-primary animate-spin" />
                <div className="text-center">
                  <h4 className="font-bold">Consulting the Strategist</h4>
                  <p className="text-xs text-muted">Running competitive research and creative mapping...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="prose prose-invert prose-p:text-sm prose-h1:text-xl prose-h2:text-lg prose-headings:font-black max-w-none animate-in fade-in duration-700">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>

          {result && (
            <div className="p-6 border-t border-white/5 bg-surface/30 flex items-center justify-center">
              <p className="text-[10px] text-muted font-medium italic">
                * Strategic advice is AI-generated based on your brand niche. Always review for local market accuracy.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
