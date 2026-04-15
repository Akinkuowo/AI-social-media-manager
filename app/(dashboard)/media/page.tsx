'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  Grid,
  List,
  FolderPlus
} from 'lucide-react';
import { clsx } from 'clsx';

export default function MediaPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [assets, setAssets] = useState<any[]>([
    { id: 1, name: 'Brand_Logo_Primary.png', size: '1.2 MB', type: 'image/png', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop' },
    { id: 2, name: 'Instagram_Story_Quote.jpg', size: '2.4 MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop' },
    { id: 3, name: 'Product_Showcase_Banner.png', size: '4.8 MB', type: 'image/png', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop' },
  ]);

  const generateImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newAsset = {
        id: Date.now(),
        name: `AI_Generated_${assets.length + 1}.png`,
        size: '3.1 MB',
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=2030&auto=format&fit=crop'
      };
      setAssets([newAsset, ...assets]);
      setIsGenerating(false);
      setPrompt('');
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted mt-1">Organize brand assets and generate custom visual content with AI.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md"><FolderPlus size={18} className="mr-2" /> New Folder</Button>
          <Button variant="primary" size="md"><Upload size={18} className="mr-2" /> Upload Media</Button>
        </div>
      </header>

      <div className="grid grid-cols-[300px_1fr] gap-6 max-lg:grid-cols-1">
        <aside className="flex flex-col gap-6">
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-primary" />
              <h3 className="font-bold">AI Image Generator</h3>
            </div>
            <p className="text-sm text-muted mb-4">Describe the image you want to create.</p>
            <textarea 
              className="w-full h-24 bg-surface border border-border rounded-xl p-3 text-sm text-foreground focus:border-border-focus outline-none resize-none mb-4"
              placeholder="e.g. A vibrant neon-styled quote graphic for marketing tips..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Aspect Ratio</label>
              <div className="flex gap-2">
                <span className="flex-1 text-center py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium cursor-pointer">1:1</span>
                <span className="flex-1 text-center py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium cursor-pointer transition-colors">9:16</span>
                <span className="flex-1 text-center py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium cursor-pointer transition-colors">16:9</span>
              </div>
            </div>
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={generateImage}
              isLoading={isGenerating}
              disabled={!prompt}
            >
              Generate Visual
            </Button>
          </Card>

          <nav className="glass rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 px-2">Categories</h4>
            <div className="flex flex-col gap-1">
              <button className="text-left w-full px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium transition-colors">All Assets</button>
              <button className="text-left w-full px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover text-sm font-medium transition-colors">Logos & Icons</button>
              <button className="text-left w-full px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover text-sm font-medium transition-colors">Product Mockups</button>
              <button className="text-left w-full px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover text-sm font-medium transition-colors">AI Generations</button>
            </div>
          </nav>
        </aside>

        <main className="glass rounded-2xl flex flex-col min-h-[600px] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
            <div className="flex items-center gap-3 flex-1 max-w-sm bg-background border border-border rounded-xl px-4 py-2 focus-within:border-primary/50 transition-colors">
              <Search size={18} className="text-muted" />
              <input type="text" placeholder="Search your library..." className="bg-transparent text-sm w-full outline-none text-foreground" />
            </div>
            <div className="flex bg-background border border-border rounded-xl p-1 ml-4">
              <button 
                className={clsx('p-1.5 rounded-lg transition-colors', view === 'grid' ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground')} 
                onClick={() => setView('grid')}
              >
                <Grid size={18} />
              </button>
              <button 
                className={clsx('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground')} 
                onClick={() => setView('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className={clsx('p-6 overflow-y-auto flex-1', view === 'grid' ? 'grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1 select-none' : 'flex flex-col gap-3')}>
            {assets.map((asset) => (
              <Card key={asset.id} variant="glass" padding="none" className={clsx('overflow-hidden flex group transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]', view === 'grid' ? 'flex-col' : 'items-center p-3 gap-4 h-20')}>
                <div className={clsx('relative bg-surface overflow-hidden', view === 'grid' ? 'aspect-square rotate' : 'w-16 h-16 rounded-xl flex-shrink-0')}>
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className={clsx('absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300', view === 'list' && 'hidden')}>
                    <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"><Download size={18} /></button>
                    <button className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className={clsx('flex flex-col flex-1', view === 'grid' ? 'p-4' : '')}>
                  <span className="text-sm font-semibold truncate text-foreground mb-1">{asset.name}</span>
                  <span className="text-xs text-muted font-medium">{asset.size} • {asset.type.split('/')[1].toUpperCase()}</span>
                </div>
                {view === 'list' && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-foreground transition-colors"><Download size={18} /></button>
                    <button className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors"><Trash2 size={18} /></button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
