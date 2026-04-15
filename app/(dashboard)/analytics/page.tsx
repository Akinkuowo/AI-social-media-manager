'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  BarChart2, 
  MousePointer2, 
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

const data = [
  { name: 'Mon', reach: 4000, engagement: 2400 },
  { name: 'Tue', reach: 3000, engagement: 1398 },
  { name: 'Wed', reach: 2000, engagement: 9800 },
  { name: 'Thu', reach: 2780, engagement: 3908 },
  { name: 'Fri', reach: 1890, engagement: 4800 },
  { name: 'Sat', reach: 2390, engagement: 3800 },
  { name: 'Sun', reach: 3490, engagement: 4300 },
];

const platformData = [
  { name: 'Instagram', value: 45, color: '#E1306C' },
  { name: 'Facebook', value: 25, color: '#1877F2' },
  { name: 'X / Twitter', value: 20, color: '#000000' },
  { name: 'LinkedIn', value: 10, color: '#0A66C2' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-sm text-muted mt-1">Track your performance and get AI-driven recommendations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md"><Calendar size={18} className="mr-2" /> Last 30 Days</Button>
          <Button variant="primary" size="md"><Download size={18} className="mr-2" /> Export Report</Button>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <Card variant="glass" padding="md" className="flex flex-col">
          <TrendingUp size={24} className="text-primary mb-2" />
          <span className="text-sm text-muted">Total Reach</span>
          <p className="text-3xl font-bold mt-1">48.2k</p>
          <span className="text-xs text-success mt-2 font-medium">+15.2%</span>
        </Card>
        <Card variant="glass" padding="md" className="flex flex-col">
          <Users size={24} className="text-secondary mb-2" />
          <span className="text-sm text-muted">Audience Growth</span>
          <p className="text-3xl font-bold mt-1">1,240</p>
          <span className="text-xs text-success mt-2 font-medium">+8.4%</span>
        </Card>
        <Card variant="glass" padding="md" className="flex flex-col">
          <BarChart2 size={24} className="text-success mb-2" />
          <span className="text-sm text-muted">Engagement Rate</span>
          <p className="text-3xl font-bold mt-1">4.8%</p>
          <span className="text-xs text-success mt-2 font-medium">+0.6%</span>
        </Card>
        <Card variant="glass" padding="md" className="flex flex-col">
          <MousePointer2 size={24} className="text-warning mb-2" />
          <span className="text-sm text-muted">Link Clicks</span>
          <p className="text-3xl font-bold mt-1">842</p>
          <span className="text-xs text-error mt-2 font-medium">-2.4%</span>
        </Card>
      </section>

      <div className="grid grid-cols-[2fr_1fr] gap-6 max-lg:grid-cols-1">
        <Card variant="glass" padding="lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Reach vs Engagement</h3>
            <p className="text-sm text-muted mt-1">Growth performance over the last 7 days.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="reach" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
                <Area type="monotone" dataKey="engagement" stroke="#6366f1" fillOpacity={1} fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card variant="glass" padding="lg" className="flex flex-col">
          <h3 className="text-lg font-bold mb-6">Platform Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="white" fontSize={12} width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
            {platformData.map((p) => (
              <div key={p.name} className="flex justify-between items-center px-4 py-3 bg-surface rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}></div>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <span className="text-sm font-bold">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <Sparkles size={24} className="text-primary" />
          <h3 className="text-lg font-bold">AI Strategy Recommendations</h3>
        </div>
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h4 className="font-bold mb-2">Best Time to Post</h4>
            <p className="text-sm text-muted">Your audience is most active on <strong className="text-foreground">Tuesdays at 10:00 AM</strong>. Schedule your next big announcement for this slot.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h4 className="font-bold mb-2">Top Content Type</h4>
            <p className="text-sm text-muted"><strong className="text-foreground">Educational Carousel</strong> posts are currently outperforming memes by 2.4x. Focus on "How To" guides this week.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h4 className="font-bold mb-2">Hashtag Strategy</h4>
            <p className="text-sm text-muted">Your reach is boosted by 15% when using niche tags like #SaaSMarketing. Avoid generic ones like #Business.</p>
          </div>
        </div>
        <Button variant="secondary" className="mt-6">Apply All Recommendations</Button>
      </Card>
    </div>
  );
}
