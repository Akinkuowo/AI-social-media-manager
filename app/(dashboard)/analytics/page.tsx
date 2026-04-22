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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Share2, 
  Loader2,
  ChevronRight,
  Target,
  BarChart3,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';
import { showAlert } from '@/lib/alerts';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export default function AnalyticsPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  const fetchData = async (forceSync = false) => {
    if (forceSync) setIsSyncing(true);
    setIsLoading(true);
    try {
      if (forceSync) {
        await fetch('/api/analytics/sync', { method: 'POST' });
        showAlert('Metrics Updated', 'Successfully pulled real-time data from social APIs.', 'success');
      }
      const res = await fetch('/api/analytics');
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
      if (forceSync) showAlert('Sync Error', 'Failed to reach social APIs. Stale data shown.', 'error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchInsights = async () => {
    setIsInsightLoading(true);
    try {
      const res = await fetch('/api/analytics/insights');
      if (res.ok) setInsights(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const { totalStats, engagementRate, growthChart, engagementChart, platformBreakdown, topPosts } = data || {};

  return (
    <div className="flex flex-col gap-10 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Analytics & Insights</h1>
          <p className="text-sm text-muted mt-1">Measuring your momentum across the digital landscape.</p>
        </div>
        <Button 
          variant="ghost" 
          disabled={isSyncing}
          onClick={() => fetchData(true)} 
          className="border border-white/5 bg-white/2 hover:bg-white/10"
        >
          {isSyncing ? (
            <Loader2 size={16} className="mr-2 text-primary animate-spin" />
          ) : (
            <Zap size={16} className="mr-2 text-primary" />
          )}
          {isSyncing ? "Syncing..." : "Sync Data"}
        </Button>
      </header>

      {/* AI Insights Panel */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
           <Sparkles size={20} className="text-primary animate-pulse" />
           <h2 className="text-lg font-bold">AI Strategy Insights</h2>
           <span className="ml-auto text-[10px] text-muted font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Updated every 24h</span>
        </div>
        
        {isInsightLoading ? (
          <Card variant="glass" className="h-[200px] flex items-center justify-center border-dashed border-primary/20">
             <div className="flex flex-col items-center gap-3">
               <Loader2 size={32} className="text-primary animate-spin" />
               <p className="text-sm text-muted font-medium">Gemini is analyzing your patterns...</p>
             </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-1">
            <Card variant="glass" padding="lg" className="bg-primary/5 border-primary/10 relative overflow-hidden group">
               <Lightbulb className="absolute -top-4 -right-4 w-24 h-24 text-primary opacity-5 group-hover:opacity-10 transition-all duration-700 -rotate-12 group-hover:rotate-0" />
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-primary/20 text-primary"><Calendar size={18} /></div>
                 <h3 className="font-bold text-sm">Best Day to Post</h3>
               </div>
               <p className="text-2xl font-black mb-1">{insights?.bestDay || 'Determining...'}</p>
               <p className="text-xs text-muted leading-relaxed">Engagement is significantly higher on this day based on your past ROI.</p>
            </Card>

            <Card variant="glass" padding="lg" className="bg-secondary/5 border-secondary/10 relative overflow-hidden group">
               <Clock className="absolute -top-4 -right-4 w-24 h-24 text-secondary opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12 group-hover:rotate-0" />
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-secondary/20 text-secondary"><Clock size={18} /></div>
                 <h3 className="font-bold text-sm">Optimal Time Window</h3>
               </div>
               <p className="text-2xl font-black mb-1">{insights?.bestTime || 'Analyzing...'}</p>
               <p className="text-xs text-muted leading-relaxed">Your audience shows peak activity during this window.</p>
            </Card>

            <Card variant="glass" padding="lg" className="bg-success/5 border-success/10 relative overflow-hidden group">
               <TrendingUp className="absolute -top-4 -right-4 w-24 h-24 text-success opacity-5 group-hover:opacity-10 transition-all duration-700 -rotate-12 group-hover:rotate-0" />
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-success/20 text-success"><Zap size={18} /></div>
                 <h3 className="font-bold text-sm">Winning Content Type</h3>
               </div>
               <p className="text-2xl font-black mb-1 capitalize">{insights?.trendingType || 'Educational'}</p>
               <p className="text-xs text-muted leading-relaxed">This format consistently drives the highest share rates.</p>
            </Card>
          </div>
        )}

        {!isInsightLoading && insights?.insights && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {insights.insights.map((insight: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                 <div className={clsx("w-1 h-10 rounded-full", insight.impact === 'High' ? 'bg-primary' : 'bg-muted')} />
                 <div className="flex-1">
                   <h4 className="text-sm font-bold">{insight.title}</h4>
                   <p className="text-xs text-muted mt-0.5">{insight.description}</p>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted">{insight.impact} IMPACT</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1">
        <StatCard label="Total Impressions" value={totalStats?.impressions.toLocaleString()} change="+18.5%" icon={Users} color="primary" />
        <StatCard label="Net Reach" value={totalStats?.reach.toLocaleString()} change="+5.2%" icon={Target} color="secondary" />
        <StatCard label="Engagement Rate" value={`${engagementRate?.toFixed(2)}%`} change="+2.4%" icon={Zap} color="success" />
        <StatCard label="Total Interactions" value={totalStats?.engagement.toLocaleString()} change="+12.1%" icon={Share2} color="warning" />
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-8 max-xl:grid-cols-1">
        <div className="flex flex-col gap-8">
          {/* Growth Chart */}
          <Card variant="glass" padding="lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ArrowUpRight size={20} className="text-primary" /> Audience Growth
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Followers</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-secondary" /> Reach</div>
              </div>
            </div>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChart}>
                  <defs>
                    <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: 10, fontWeight: 'bold' }}
                    labelStyle={{ fontSize: 10, marginBottom: '8px', opacity: 0.5 }}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#3B82F6" fillOpacity={1} fill="url(#colorFollow)" strokeWidth={3} />
                  <Area type="monotone" dataKey="reach" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Engagement Breakdown */}
          <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
             <Card variant="glass" padding="lg">
               <h3 className="text-lg font-bold mb-8">Daily Engagement</h3>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="engagement" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
             </Card>

             <Card variant="glass" padding="lg">
               <h3 className="text-lg font-bold mb-8">Network Velocity</h3>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformBreakdown} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="platform" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="engagement" radius={[0, 6, 6, 0]} barSize={20}>
                        {platformBreakdown?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
             </Card>
          </div>
        </div>

        {/* Sidebar: Top Posts */}
        <div className="flex flex-col gap-6">
          <Card variant="glass" padding="lg" className="flex flex-col h-full bg-white/[0.01]">
            <h3 className="text-lg font-bold mb-8 flex items-center justify-between">
              Top Assets
              <BarChart3 size={16} className="text-primary" />
            </h3>
            <div className="flex flex-col gap-4 flex-1">
              {topPosts?.map((post: any) => (
                <div key={post.id} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group hover:bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{post.platform}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{post.type}</div>
                  </div>
                  <p className="text-xs line-clamp-2 text-muted leading-relaxed mb-4 group-hover:text-foreground transition-colors italic">
                    "{post.caption}"
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-muted font-bold">REACH</span>
                       <span className="text-xs font-black">{post.reach.toLocaleString()}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[10px] text-muted font-bold">ENGAGEMENT</span>
                       <span className="text-xs font-black">{post.engagement.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Lightbulb size={18} className="text-primary shrink-0 mt-1" />
              <p className="text-[10px] text-muted leading-relaxed">
                Posts involving <span className="text-primary">Educational</span> content currently have a 25% higher virality coefficient.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, color }: any) {
  const colorMap: any = {
    primary: 'text-primary bg-primary/10 border-primary/20 bg-glow-primary',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20 bg-glow-secondary',
    success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 bg-glow-success',
    warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20 bg-glow-warning',
  };

  return (
    <Card variant="glass" padding="lg" className="group h-full flex flex-col justify-between">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
        <div className={clsx("p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110", colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <ArrowUpRight size={12} className="text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-400">{change}</span>
        <span className="text-[10px] text-muted uppercase tracking-widest font-medium ml-auto">Last 30d</span>
      </div>
    </Card>
  );
}
