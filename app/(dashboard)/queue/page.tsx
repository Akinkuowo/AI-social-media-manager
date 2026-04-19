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
  TerminalSquare
} from 'lucide-react';
import { showAlert } from '@/lib/alerts';
import { clsx } from 'clsx';

export default function QueuePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

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
        <Button variant="ghost" onClick={fetchQueue} className="border border-white/10 hover:bg-white/5">
          <RefreshCw size={18} className={clsx("mr-2", isLoading && "animate-spin")} /> 
          Refresh Queue
        </Button>
      </header>

      <Card variant="glass" padding="none" className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50">
          <div className="flex gap-4 text-sm font-bold">
            <span className="text-blue-400">{posts.filter(p => p.status === 'SCHEDULED').length} Pending</span>
            <span className="text-red-400">{posts.filter(p => p.status === 'FAILED').length} Failed</span>
            <span className="text-emerald-400">{posts.filter(p => p.status === 'PUBLISHED').length} Published Recently</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          {isLoading ? (
            <div className="flex justify-center py-12 text-muted">Loading queue...</div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <TerminalSquare size={48} className="opacity-20 mb-4" />
              <p>The queue is completely empty.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
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
