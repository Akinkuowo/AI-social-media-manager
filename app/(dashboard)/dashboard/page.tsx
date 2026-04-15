'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Share2,
  Calendar as LucideCalendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [calendar, setCalendar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, calRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch(`/api/calendar?month=${new Date().getMonth()}&year=${new Date().getFullYear()}`)
        ]);

        if (statsRes.ok) setData(await statsRes.json());
        if (calRes.ok) setCalendar(await calRes.json());
      } catch (err) {
        console.error("DASHBOARD_FETCH_ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const { totalStats, engagementRate } = data || {};
  const upcomingPosts = (calendar?.posts || [])
    .filter((p: any) => p.day >= new Date().getDate())
    .slice(0, 4);
  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm text-muted">Total Reach</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalStats?.reach?.toLocaleString() || '0'}</p>
          <span className="text-xs text-success">+12.5% vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="text-sm text-muted">Engagement Rate</span>
          </div>
          <p className="text-3xl font-bold mb-1">{(engagementRate || 0).toFixed(1)}%</p>
          <span className="text-xs text-success">+8.2% vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <ThumbsUp size={24} />
            </div>
            <span className="text-sm text-muted">Total Likes</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalStats?.likes?.toLocaleString() || '0'}</p>
          <span className="text-xs text-muted">Stable vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <span className="text-sm text-muted">Total Shares</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalStats?.shares?.toLocaleString() || '0'}</p>
          <span className="text-xs text-error">-2.1% vs last month</span>
        </Card>
      </section>

      <section className="grid grid-cols-[2fr_1fr] gap-6 max-lg:grid-cols-1">
        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Upcoming Posts</h3>
              <p className="text-sm text-muted mt-1">Your scheduled content for the next 7 days.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => router.push('/generate')}>
              <Plus size={16} className="mr-1" /> Create New
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            {upcomingPosts.length > 0 ? (
              upcomingPosts.map((post: any) => (
                <div key={post.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {post.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">{post.caption.substring(0, 60)}...</p>
                    <p className="text-xs text-muted uppercase tracking-widest font-bold mt-1">{post.type}</p>
                  </div>
                  <div className={clsx(
                    "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    post.status === 'SCHEDULED' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {post.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <LucideCalendar size={48} className="text-muted/30 mb-4" />
                <h4 className="text-lg font-semibold mb-2">No posts scheduled yet</h4>
                <p className="text-sm text-muted mb-4">Generate your first post with AI to see it here.</p>
                <Button variant="secondary" onClick={() => router.push('/generate')}>
                   <Sparkles size={16} className="mr-2" /> Start Generating
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm"><strong className="text-foreground">Post published</strong> <span className="text-muted">on Instagram</span></p>
                  <span className="text-xs text-muted">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

const CalendarIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
