import { 
  Users, 
  CreditCard, 
  Zap, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  ShieldCheck,
  Globe
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Aggregate real data from Prisma
  const userCount = await prisma.user.count();
  const companyCount = await prisma.company.count();
  
  // Usage Aggregation (Cost Monitoring)
  const usageStats = await prisma.usageLog.aggregate({
    _sum: {
      tokens: true,
      costEstimate: true
    }
  });

  const totalTokens = usageStats._sum.tokens || 0;
  const totalCost = usageStats._sum.costEstimate || 0;

  const quickStats = [
    { 
      label: "Total Platform Users", 
      value: userCount.toString(), 
      change: "+12.5%", 
      trend: "up", 
      icon: Users,
      color: "blue"
    },
    { 
      label: "Active Subscriptions", 
      value: companyCount.toString(), 
      change: "+8.2%", 
      trend: "up", 
      icon: CreditCard,
      color: "green"
    },
    { 
      label: "AI Burn Rate (Total)", 
      value: `$${totalCost.toFixed(2)}`, 
      sub: `${(totalTokens / 1000).toFixed(1)}k tokens`,
      change: "-2.4%", 
      trend: "down", 
      icon: Zap,
      color: "yellow"
    },
    { 
      label: "System Latency", 
      value: "142ms", 
      change: "Stable", 
      trend: "up", 
      icon: Globe,
      color: "purple"
    },
  ];

  return (
    <div className="space-y-10">
      {/* Top Section - Pulse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-[#12121a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
               </div>
               <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3" />
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-2xl font-black italic">{stat.value}</h3>
               {'sub' in stat && <p className="text-[10px] text-muted-foreground font-medium">{stat.sub as string}</p>}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Growth */}
        <div className="lg:col-span-2 bg-[#12121a] border border-white/5 rounded-3xl p-8 relative">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 italic">
                   <TrendingUp className="w-5 h-5 text-red-500" />
                   PLATFORM VELOCITY
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Tracking user onboarding and subscription conversion.</p>
              </div>
           </div>
           
           {/* Mock Chart Area */}
           <div className="h-64 flex items-end gap-2 px-2">
              {[40, 65, 45, 90, 65, 80, 55, 70, 45, 60, 85, 95].map((val, i) => (
                <div key={i} className="flex-1 space-y-2 group">
                   <div 
                    className="w-full bg-red-500/10 hover:bg-red-500/30 rounded-t-lg transition-all duration-300 relative"
                    style={{ height: `${val}%` }}
                   >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                       {val}k
                     </div>
                   </div>
                   <div className="h-1 bg-white/5 w-full rounded" />
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
           </div>
        </div>

        {/* System Health Alerts */}
        <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8">
           <h3 className="text-xl font-bold mb-6 italic flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              PRIORITY LOGS
           </h3>
           <div className="space-y-4">
              {[
                { type: "success", msg: "v2.5 Engine Deployed", time: "2h ago" },
                { type: "alert", msg: "API Spikes in N-Virginia", time: "4h ago" },
                { type: "info", msg: "New Admin Promoted", time: "6h ago" },
                { type: "success", msg: "Weekly Backup verified", time: "1d ago" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                   <div className={`p-2 rounded-lg ${log.type === 'success' ? 'bg-green-500/10 text-green-500' : log.type === 'alert' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {log.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate tracking-tight">{log.msg}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{log.time}</p>
                   </div>
                </div>
              ))}
           </div>
           
           <button className="w-full mt-6 py-4 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
              View All Systems
           </button>
        </div>
      </div>
    </div>
  );
}
