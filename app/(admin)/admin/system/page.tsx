"use client";

import { useState, useEffect } from "react";
import { 
  Server, 
  Activity, 
  Database, 
  Cpu, 
  Zap, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showAlert } from "@/lib/alerts";

export default function SystemControlPage() {
  const [stats, setStats] = useState({
    pendingPosts: 0,
    failedPosts: 0,
    totalUsers: 0,
    systemLoad: "Normal",
    lastPulse: new Date().toLocaleTimeString(),
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  useEffect(() => {
    // Mock fetching system stats - would connect to real aggregators
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/queue");
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({
            ...prev,
            pendingPosts: data.filter((p: any) => p.status === 'SCHEDULED').length,
            failedPosts: data.filter((p: any) => p.status === 'FAILED').length,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch system stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [msg, ...prev.slice(0, 9)]);
  };

  const handleSystemPulse = async () => {
    setIsProcessing(true);
    addLog("[SYSTEM] Initiating manual publisher heartbeat...");
    try {
      const res = await fetch("/api/cron/publish");
      const data = await res.json();
      if (res.ok) {
        addLog(`[SUCCESS] Publisher run complete. Processed ${data.processedCount} dispatches.`);
        showAlert.success("Pulse Sent", `Processed ${data.processedCount} pending posts.`);
      } else {
        addLog(`[ERROR] Heartbeat failed: ${data.message}`);
        showAlert.error("System Error", data.message);
      }
    } catch (err) {
      addLog("[CRITICAL] Failed to connect to publisher service.");
      showAlert.error("Connection Failed", "Publisher service is unreachable.");
    } finally {
      setIsProcessing(false);
      setStats(prev => ({ ...prev, lastPulse: new Date().toLocaleTimeString() }));
    }
  };

  const systemMetrics = [
    { label: "Publisher Queue", value: `${stats.pendingPosts} Pending`, icon: Server, color: "text-blue-400" },
    { label: "Dispatch Health", value: stats.failedPosts === 0 ? "Optimal" : `${stats.failedPosts} Failures`, icon: Activity, color: stats.failedPosts === 0 ? "text-emerald-400" : "text-red-400" },
    { label: "DB Connections", value: "Active", icon: Database, color: "text-purple-400" },
    { label: "System Load", value: stats.systemLoad, icon: Cpu, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Settings className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">System Sovereignty</h1>
        </div>
        <p className="text-muted-foreground text-sm">Direct governance of background services and platform state.</p>
      </header>

      {/* Primary Pulse Control */}
      <Card variant="glass" padding="lg" className="border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              Publisher Heartbeat
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Manually trigger the background worker to process scheduled dispatches across all active brands.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleSystemPulse}
            isLoading={isProcessing}
            className="w-full md:w-auto px-12 bg-red-600 hover:bg-red-500 shadow-xl shadow-red-600/20"
          >
            Trigger Pulse
          </Button>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((m) => (
          <Card key={m.label} variant="glass" padding="md" className="group hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${m.color}`}>{m.label}</p>
            </div>
            <p className="mt-4 text-2xl font-black">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Logs */}
        <Card variant="glass" padding="none" className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Live Heartbeat Logs
            </h3>
            <span className="text-[10px] text-muted-foreground">Last run: {stats.lastPulse}</span>
          </div>
          <div className="p-4 font-mono text-[11px] space-y-2 min-h-[300px] flex-1 bg-black/40">
            {systemLogs.length === 0 ? (
              <p className="text-muted-foreground opacity-50 italic">System quiet. No active heartbeats recorded.</p>
            ) : (
              systemLogs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Global Stats */}
        <Card variant="glass" padding="lg" className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resource Integrity</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold">API Gateways</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full uppercase">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold">Media Cluster</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full uppercase">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">Cron Scheduler</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full uppercase">External Trigger Required</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] leading-relaxed text-muted-foreground italic">
              * The Cron Scheduler currently requires an external GET trigger to /api/cron/publish in production environments like Vercel or GitHub Actions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
