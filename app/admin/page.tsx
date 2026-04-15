'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  CreditCard, 
  Activity, 
  Cpu, 
  ShieldAlert,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-8 max-md:p-4 min-h-screen">
      <header className="flex items-center justify-between bg-surface/50 p-6 rounded-2xl border border-border max-md:flex-col max-md:gap-4 max-md:items-start shadow-sm backdrop-blur-md">
        <div>
          <div className="inline-flex items-center rounded-md bg-error/10 px-2 py-1 text-xs font-medium text-error ring-1 ring-inset ring-error/20 mb-3">
            Platform Admin
          </div>
          <h1 className="text-2xl font-bold text-foreground">System Overview</h1>
          <p className="text-sm text-muted mt-1">Global monitoring and management of SocialAI instances.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2.5 focus-within:border-primary/50 transition-colors w-full max-w-sm shrink-0">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search users, companies..." className="bg-transparent text-sm w-full outline-none text-foreground placeholder:text-muted" />
        </div>
      </header>

      <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <Card variant="flat" padding="md" className="flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-primary" />
            <span className="text-sm text-muted font-medium">Total Users</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">1,284</h3>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Card>
        <Card variant="flat" padding="md" className="flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-success" />
            <span className="text-sm text-muted font-medium">Weekly Revenue</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">$12,450</h3>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-success to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Card>
        <Card variant="flat" padding="md" className="flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={20} className="text-warning" />
            <span className="text-sm text-muted font-medium">AI Token Usage</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">4.2M</h3>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Card>
        <Card variant="flat" padding="md" className="flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={20} className="text-secondary" />
            <span className="text-sm text-muted font-medium">System Uptime</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">99.98%</h3>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Card>
      </section>

      <div className="grid grid-cols-[2fr_1fr] gap-6 max-lg:grid-cols-1">
        <Card variant="glass" padding="lg" className="flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-lg font-bold">Recent Subscriptions</h3>
            <Button variant="ghost" size="sm">View All <ArrowUpRight size={16} className="ml-1.5" /></Button>
          </div>
          <div className="w-full text-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3 text-muted font-semibold uppercase tracking-wider text-xs">
              <span>Company</span>
              <span>Plan</span>
              <span>Revenue</span>
              <span>Status</span>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 py-4 border-t border-border/30 hover:bg-surface-hover/50 transition-colors -mx-4 px-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">T</div>
                  <span className="font-medium">TechFlow Inc.</span>
                </div>
                <span className="text-muted font-medium">Agency</span>
                <span className="font-medium">$149.00</span>
                <div><span className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">Active</span></div>
              </div>
            ))}
          </div>
        </Card>

        <section className="flex flex-col gap-6">
          <Card variant="glass" padding="md" className="flex flex-col">
            <h3 className="text-base font-bold mb-4 pb-3 border-b border-border/50">Service Status</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-surface/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm font-medium">API Gateway</span>
                </div>
                <span className="text-xs font-mono text-muted">24ms</span>
              </div>
              <div className="flex justify-between items-center bg-surface/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm font-medium">Gemini API</span>
                </div>
                <span className="text-xs font-mono text-muted">450ms</span>
              </div>
              <div className="flex justify-between items-center bg-surface/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></div>
                  <span className="text-sm font-medium text-warning">Image Gen Engine</span>
                </div>
                <span className="text-xs font-mono text-muted text-warning">2.4s</span>
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="md" className="border-warning/30 bg-warning/5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={18} className="text-warning" />
              <h4 className="font-bold text-warning text-sm">Active Alerts</h4>
            </div>
            <div className="bg-surface/80 p-3 rounded-lg border border-warning/20">
              <p className="text-sm font-medium text-foreground mb-1">High API latency detected in US-East regions.</p>
              <span className="text-xs text-muted">12 mins ago</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
