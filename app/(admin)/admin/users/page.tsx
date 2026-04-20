import { 
  Users, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Ban, 
  ShieldCheck,
  Calendar,
  Mail,
  MoreHorizontal,
  Circle
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function adminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          activityLogs: true,
          companies: true
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic">USER GOVERNANCE</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">Manage platform access, roles, and security protocols.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Identity..." 
                className="bg-[#12121a] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-all w-64"
              />
           </div>
           <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all">
              <UserPlus className="w-4 h-4" />
              New Identity
           </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#12121a] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sovereign Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Growth Units</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Engagement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Activation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-red-500 group-hover:bg-red-500/10 transition-colors">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name || 'Anonymous'}</p>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'ADMIN' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      <Circle className="w-2 h-2 fill-current" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-white">{user._count.companies} Brands</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Associated Pools</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-white">{user._count.activityLogs}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Events Logs</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all" title="Modify Access">
                          <ShieldCheck className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all" title="Restrict Access">
                          <Ban className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-all">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
