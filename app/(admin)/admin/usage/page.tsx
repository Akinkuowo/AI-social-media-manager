import { 
  BarChart3, 
  Zap, 
  DollarSign, 
  History, 
  Info,
  ArrowUpRight,
  Monitor,
  Cpu,
  RefreshCcw,
  Filter
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminUsagePage() {
  const usageLogs = await prisma.usageLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    take: 50
  });

  const aggregate = await prisma.usageLog.aggregate({
    _sum: {
      tokens: true,
      costEstimate: true
    },
    _count: {
      id: true
    }
  });

  const totalCost = aggregate._sum.costEstimate || 0;
  const totalTokens = aggregate._sum.tokens || 0;
  const totalEvents = aggregate._count.id || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic">RESOURCE CONSUMPTION</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">Monitoring AI token liquidity and operational burn rates.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
              <Filter className="w-3.5 h-3.5" />
              Filter Ops
           </button>
           <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/90 transition-all">
              <RefreshCcw className="w-3.5 h-3.5" />
              Sync Metrics
           </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8 group overflow-hidden relative">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                 <DollarSign className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">Cumulative Cost</span>
           </div>
           <h3 className="text-4xl font-black italic tracking-tighter">${totalCost.toFixed(4)}</h3>
           <p className="text-xs text-muted-foreground mt-2 font-medium">Estimated USD Burn (Gemini 1.5 Flash)</p>
           <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all" />
        </div>

        <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8 group overflow-hidden relative">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                 <Cpu className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">Total Complexity</span>
           </div>
           <h3 className="text-4xl font-black italic tracking-tighter">{(totalTokens / 1000).toFixed(1)}k</h3>
           <p className="text-xs text-muted-foreground mt-2 font-medium">Input/Output Tokens Processed</p>
           <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
        </div>

        <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8 group overflow-hidden relative">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                 <Zap className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">Operation Count</span>
           </div>
           <h3 className="text-4xl font-black italic tracking-tighter">{totalEvents}</h3>
           <p className="text-xs text-muted-foreground mt-2 font-medium">AI Generation Cycles Triggered</p>
           <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
        </div>
      </div>

      {/* Usage Logs Table */}
      <div className="space-y-4">
         <h3 className="text-sm font-black italic uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4 text-red-500" />
            OPERATIONAL HISTORY
         </h3>
         <div className="bg-[#12121a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                 <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operator</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Complexity</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cost (Est)</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timestamp</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {usageLogs.map((log) => (
                 <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                   <td className="px-6 py-5">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-white">{log.user.name || 'Admin Script'}</span>
                         <span className="text-[10px] text-muted-foreground font-medium">{log.user.email}</span>
                      </div>
                   </td>
                   <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                         <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ">{log.action}</span>
                      </div>
                   </td>
                   <td className="px-6 py-5">
                      <span className="text-xs font-bold text-white">{(log.tokens || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">Tokens</span></span>
                   </td>
                   <td className="px-6 py-5">
                      <span className="text-xs font-black italic text-green-500">${(log.costEstimate || 0).toFixed(5)}</span>
                   </td>
                   <td className="px-6 py-5 text-muted-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</span>
                   </td>
                 </tr>
               ))}
               {usageLogs.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                         <Monitor className="w-12 h-12 text-muted-foreground/10 mx-auto" />
                         <h4 className="text-sm font-bold text-muted-foreground italic">No consumption recorded yet.</h4>
                         <p className="text-[10px] text-muted-foreground/60">Generate social content or a calendar to see real-time AI cost analysis.</p>
                      </div>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* Pricing Footnote */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex items-start gap-4">
         <Info className="w-5 h-5 text-red-500 mt-0.5" />
         <div>
            <h4 className="text-sm font-bold text-red-500 italic">FINANCIAL DISCLOSURE</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Cost estimates are calculated using real-time Gemini 1.5/2.5 Flash pricing indices ($0.35 per 1,000,000 tokens). These figures represent variable costs of AI liquidity and do not include fixed platform overhead or social media API tiering expenses.
            </p>
         </div>
      </div>
    </div>
  );
}
