'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RotateCw,
  RefreshCw,
  TerminalSquare,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { showAlert } from '@/lib/alerts';
import { clsx } from 'clsx';

export default function QueuePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const platforms = [...new Set(posts.map(p => p.socialAccount?.platform).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const matchStatus = filterStatus === 'ALL' || post.status === filterStatus;
    const matchPlatform = filterPlatform === 'ALL' || post.socialAccount?.platform === filterPlatform;
    const matchSearch = searchQuery === '' || 
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.id.includes(searchQuery);
    return matchStatus && matchPlatform && matchSearch;
  });

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error(err);
      showAlert.error('Error', 'Failed to fetch the posting queue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPublisher = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/cron/publish');
      const data = await res.json();
      if (res.ok) {
        showAlert.success('Success', `Publisher run complete. Processed ${data.processedCount || 0} posts.`);
        fetchQueue();
      } else {
        showAlert.error('Error', data.message || 'Failed to trigger publisher.');
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to establish connection to publisher.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRetry = async (postId: string) => {
    setIsRetrying(postId);
    try {
      const res = await fetch(`/api/queue/${postId}/retry`, { method: 'POST' });
      if (res.ok) {
        showAlert.success('Pushed to Queue', 'Post was successfully pushed back to the publisher queue.');
        fetchQueue();
      } else {
        showAlert.error('Retry Failed', 'Could not move the post back to SCHEDULED.');
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to establish connection.');
    } finally {
      setIsRetrying(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Clock size={16} className="text-blue-400" />;
      case 'FAILED': return <AlertCircle size={16} className="text-red-400" />;
      case 'PUBLISHED': return <CheckCircle size={16} className="text-emerald-400" />;
      default: return <Clock size={16} className="text-muted" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publisher Queue & Logs</h1>
          <p className="text-sm text-muted mt-1">Monitor the background workers, recurring loops, and failed dispatches.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={handleRunPublisher} 
            isLoading={isProcessing}
            className="border border-primary/20 hover:bg-primary/5 text-primary"
          >
            <Zap size={18} className="mr-2" /> 
            Run Publisher
          </Button>
          <Button variant="ghost" onClick={fetchQueue} className="border border-white/10 hover:bg-white/5">
            <RefreshCw size={18} className={clsx("mr-2", isLoading && "animate-spin")} /> 
            Refresh Queue
          </Button>
        </div>
      </header>

      <Card variant="glass" padding="none" className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-surface/50">
          <div className="flex gap-4 text-xs font-bold">
            <span className={clsx("cursor-pointer transition-colors", filterStatus === 'ALL' ? "text-primary border-b border-primary" : "text-muted hover:text-white")} onClick={() => setFilterStatus('ALL')}>
              All ({posts.length})
            </span>
            <span className={clsx("cursor-pointer transition-colors", filterStatus === 'SCHEDULED' ? "text-blue-400 border-b border-blue-400" : "text-muted hover:text-blue-400")} onClick={() => setFilterStatus('SCHEDULED')}>
              Pending ({posts.filter(p => p.status === 'SCHEDULED').length})
            </span>
            <span className={clsx("cursor-pointer transition-colors", filterStatus === 'FAILED' ? "text-red-400 border-b border-red-400" : "text-muted hover:text-red-400")} onClick={() => setFilterStatus('FAILED')}>
              Failed ({posts.filter(p => p.status === 'FAILED').length})
            </span>
            <span className={clsx("cursor-pointer transition-colors", filterStatus === 'PUBLISHED' ? "text-emerald-400 border-b border-emerald-400" : "text-muted hover:text-emerald-400")} onClick={() => setFilterStatus('PUBLISHED')}>
              Published ({posts.filter(p => p.status === 'PUBLISHED').length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
            {/* Search */}
            <div className="relative flex-1 max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text"
                placeholder="Search caption or ID..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Platform Select */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted" />
              <select 
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground capitalize cursor-pointer hover:bg-black/60 transition-colors"
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
              >
                <option value="ALL">All Platforms</option>
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          {isLoading ? (
            <div className="flex justify-center py-12 text-muted">Loading queue metadata...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <TerminalSquare size={48} className="opacity-10 mb-4" />
              <p className="text-sm">No dispatches match your current criteria.</p>
              {(filterStatus !== 'ALL' || filterPlatform !== 'ALL' || searchQuery !== '') && (
                <Button variant="ghost" size="sm" className="mt-4 text-primary" onClick={() => {
                  setFilterStatus('ALL');
                  setFilterPlatform('ALL');
                  setSearchQuery('');
                }}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-surface border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-black/20">
                        {getStatusIcon(post.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Post #{post.id.slice(-6)}</span>
                          <span className="text-[10px] uppercase font-black tracking-wider text-muted bg-white/5 px-2 py-0.5 rounded-full">
                            {post.socialAccount?.platform || 'Unknown'}
                          </span>
                          {post.isRecurring && (
                            <span className="text-[10px] uppercase font-black tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              🔄 Auto-Repeats {post.recurrenceInterval}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1">
                          Scheduled for: {new Date(post.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {post.status === 'FAILED' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-400 hover:bg-red-400/10 border border-red-400/20"
                        onClick={() => handleRetry(post.id)}
                        isLoading={isRetrying === post.id}
                      >
                        <RotateCw size={14} className="mr-2" /> Retry Publisher
                      </Button>
                    )}
                  </div>

                  <div className="px-4 py-3 bg-black/20 rounded-xl text-sm leading-relaxed border border-white/5">
                    {post.caption}
                  </div>

                  {post.errorLog && (
                    <div className="px-4 py-3 bg-red-500/10 rounded-xl border border-red-500/20 flex gap-3 text-red-300">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs font-mono">{post.errorLog}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
