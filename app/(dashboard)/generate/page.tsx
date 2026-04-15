'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PenTool, Sparkles, RefreshCw, Copy, Check, Camera, MessageSquare, Briefcase, Clock, Send } from 'lucide-react';
import { clsx } from 'clsx';

export default function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('instagram');
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setResults({
        instagram: {
          caption: `🚀 Are you ready to scale your business? \n\nWe've been working on something huge at SocialAI. Our latest features are designed to help you save 20+ hours a week on social media management. \n\nKey benefits:\n✨ AI-powered calendar generation\n📈 Deep analytics insights\n🕒 Precision scheduling\n\nLink in bio to try it now! #SaaS #AI #Productivity #MarketingTips`,
          hashtags: "#entrepreneur #marketing #tech #innovation"
        },
        twitter: {
          thread: [
            "1/ Social media management doesn't have to be a full-time job. Here's how to automate your workflow using AI. 🧵",
            "2/ First, define your brand voice. Consistency is key to building trust with your audience. AI can help maintain that tone across all posts.",
            "3/ Second, batch your generation. Don't create one-by-one. Generate a month's worth of ideas in one sitting.",
            "4/ Finally, use analytics to iterate. See what works and double down on it. 🚀 #SaaS #GrowthHacking"
          ]
        },
        linkedin: {
          post: `I'm thrilled to announce the launch of SocialAI. \n\nOver the past year, we've seen how business owners struggle to keep up with the demands of modern social media. The constant pressure to be "on" is real. \n\nThat's why we built an AI manager that doesn't just generate text, but understands your brand's DNA. \n\nJoin 500+ businesses who are already reclaiming their time. \n\n#AI #StartupLife #SocialMediaMarketing`
        }
      });
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'instagram', label: 'Instagram', icon: Camera },
    { key: 'twitter', label: 'X / Twitter', icon: MessageSquare },
    { key: 'linkedin', label: 'LinkedIn', icon: Briefcase },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">AI Content Generator</h1>
        <p className="text-sm text-muted mt-1">Draft high-performing posts for any platform in seconds.</p>
      </header>

      <div className="grid grid-cols-[1fr_1.2fr] gap-6 max-lg:grid-cols-1">
        <Card variant="glass" padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold">What would you like to post about?</h3>
            <p className="text-sm text-muted mt-1">Enter a topic, link, or product description.</p>
          </div>
          <textarea 
            className="w-full h-32 bg-surface border border-border rounded-xl p-4 text-foreground text-sm placeholder:text-muted/50 outline-none focus:border-border-focus resize-none transition-colors"
            placeholder="e.g. Tips for small business branding in 2024..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Tone of Voice</label>
              <select className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-border-focus">
                <option>Professional</option>
                <option>Witty & Sassy</option>
                <option>Educational</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Marketing Goal</label>
              <select className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-border-focus">
                <option>Engagement</option>
                <option>Sales</option>
                <option>Awareness</option>
              </select>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full mt-6" onClick={generateContent} isLoading={isGenerating} disabled={!topic || isGenerating}>
            <Sparkles size={18} className="mr-2" /> Generate Variations
          </Button>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <Card variant="glass" padding="lg" className="flex-1">
            {!results ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PenTool size={48} className="text-muted/20 mb-4" />
                <p className="text-muted">Generated content will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results[activeTab].caption || results[activeTab].post || results[activeTab].thread.join('\n'))}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={generateContent}><RefreshCw size={16} /></Button>
                </div>

                {activeTab === 'instagram' && (
                  <div>
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{results.instagram.caption}</p>
                    <div className="mt-4 text-sm text-primary font-medium">{results.instagram.hashtags}</div>
                  </div>
                )}

                {activeTab === 'twitter' && (
                  <div className="flex flex-col gap-3">
                    {results.twitter.thread.map((tweet: string, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{tweet}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'linkedin' && (
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{results.linkedin.post}</p>
                )}

                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  <Button variant="secondary" size="md"><Clock size={16} className="mr-2" /> Schedule</Button>
                  <Button variant="primary" size="md"><Send size={16} className="mr-2" /> Post Now</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
