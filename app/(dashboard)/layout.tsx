'use client';

import { Sidebar } from '@/components/ui/Sidebar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Menu, Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (status === "loading" || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const userName = session?.user?.name || "User";
  const firstName = userName.split(' ')[0];
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-[80]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-muted"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold leading-tight">
                Welcome back, <span className="text-primary">{firstName}</span>
              </h2>
              <p className="hidden sm:block text-xs text-muted mt-1 font-medium">Here's what's happening with your brands today.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-white/10">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs lg:text-sm">{initial}</div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-black leading-none">{userName}</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Free Plan</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
