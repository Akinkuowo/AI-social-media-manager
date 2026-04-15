'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Share2, 
  Loader2,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("PAGE_FETCH_ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const { totalStats, engagementRate, timeSeries, platformBreakdown, topPosts } = data || {};

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header>
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        <p className="text-sm text-muted mt-1">Deep insights into your brand's social media growth and audience engagement.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1">
        <StatCard 
          label="Total Reach" 
          value={totalStats?.reach.toLocaleString()} 
          change="+12.5%" 
          icon={Users} 
          color="primary"
        />
        <StatCard 
          label="Engagement" 
          value={totalStats?.engagement.toLocaleString()} 
          change="+8.2%" 
          icon={Target} 
          color="secondary"
        />
        <StatCard 
          label="Engagement Rate" 
          value={`${engagementRate?.toFixed(2)}%`} 
          change="+1.4%" 
          icon={TrendingUp} 
          color="success"
        />
        <StatCard 
          label="Total Shares" 
          value={totalStats?.shares.toLocaleString()} 
          change="+22.1%" 
          icon={Share2} 
          color="warning"
        />
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-8 max-xl:grid-cols-1">
        <div className="flex flex-col gap-8">
          {/* Main Growth Chart */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" /> Engagement Trends
            </h3>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#3B82F6" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} />
                  <Area type="monotone" dataKey="engagement" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorEngagement)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Platform Performance */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-bold mb-8">Platform Breakdown</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="platform" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="engagement" radius={[0, 8, 8, 0]} barSize={32}>
                    {platformBreakdown?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Sidebar: Top Posts */}
        <div className="flex flex-col gap-6">
          <Card variant="glass" padding="lg" className="flex flex-col h-full">
            <h3 className="text-lg font-bold mb-6">Top Performing Posts</h3>
            <div className="flex flex-col gap-4 flex-1">
              {topPosts?.map((post: any) => (
                <div key={post.id} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{post.platform}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{post.type}</div>
                  </div>
                  <p className="text-xs line-clamp-2 text-muted leading-relaxed group-hover:text-foreground transition-colors mb-3">
                    {post.caption}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col">
                         <span className="text-[10px] text-muted font-bold">REACH</span>
                         <span className="text-xs font-black">{post.reach}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] text-muted font-bold">ENG.</span>
                         <span className="text-xs font-black">{post.engagement}</span>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
              {(!topPosts || topPosts.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <AlertCircle size={40} className="mb-4" />
                  <p className="text-sm font-medium">No high-performing posts recorded yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, color }: any) {
  const colorMap: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };

  return (
    <Card variant="glass" padding="lg" className="relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div className={clsx("p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span className="text-xs font-bold text-success animate-pulse">{change}</span>
        <span className="text-[10px] text-muted uppercase tracking-widest font-bold">vs last month</span>
      </div>
      
      {/* Background Decorative Element */}
      <div className={clsx("absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10 transition-all duration-700 group-hover:opacity-20", 
        color === 'primary' ? 'bg-primary' : 
        color === 'secondary' ? 'bg-secondary' : 
        color === 'success' ? 'bg-success' : 'bg-warning'
      )}></div>
    </Card>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
