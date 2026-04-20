"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  ArrowLeft,
  LayoutDashboard,
  Activity,
  LogOut,
  Zap,
  DollarSign
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
    </div>;
  }

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Admin Hub", href: "/admin" },
    { icon: Users, label: "User Control", href: "/admin/users" },
    { icon: Zap, label: "Usage & Costs", href: "/admin/usage" },
    { icon: Settings, label: "System Control", href: "/admin/system" },
    { icon: Activity, label: "System Activity", href: "/admin/logs" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-[#12121a] border-r border-white/5 flex flex-col h-screen sticky top-0">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">PLATFORM</h1>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-muted-foreground hover:text-white group"
            >
              <item.icon className="w-5 h-5 group-hover:text-red-500 transition-colors" />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Admin Exit
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md sticky top-0 z-50">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 block">Operational Sovereignty</span>
            <h2 className="text-2xl font-black italic">COMMAND CENTER</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Live</span>
             </div>
          </div>
        </header>
        
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
