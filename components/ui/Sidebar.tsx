'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Home, 
  Calendar, 
  PenTool, 
  Zap,
  Image as ImageIcon, 
  BarChart2, 
  Settings, 
  Users,
  Share2,
  LogOut,
  ChevronRight,
  Target,
  ShieldAlert,
  Clock,
  Code2,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Hardened role check for reliability
  const userRole = (session?.user as any)?.role;
  const isAdmin = String(userRole).toUpperCase() === 'ADMIN';

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    ...(isAdmin ? [{ icon: ShieldAlert, label: 'Admin Hub', href: '/admin', color: 'text-red-500' }] : []),
    { icon: Calendar, label: 'Content Calendar', href: '/calendar' },
    { icon: PenTool, label: 'Content Generator', href: '/generate' },
    { icon: Zap, label: 'AI Strategy Assistant', href: '/strategy' },
    { icon: ImageIcon, label: 'Media Library', href: '/media' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: Code2, label: 'API Access', href: '/api' },
    { icon: Clock, label: 'Publisher Queue', href: '/queue', color: 'text-blue-400' },
    { icon: Target, label: 'Competitor Monitoring', href: '/competitors' },
    { icon: Share2, label: 'Social Connections', href: '/settings/accounts' },
    { icon: Users, label: 'Team', href: '/team' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={clsx(
        "glass w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 transition-transform duration-300 z-[100]",
        "fixed lg:sticky lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">
            Social<span className="text-primary">AI</span>
          </span>
          <button onClick={onClose} className="lg:hidden text-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted hover:text-foreground hover:bg-surface-hover',
                  (item as any).color
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={16} className="text-primary/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border flex flex-col gap-1">
          <Link 
            href="/settings" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-error hover:bg-error/10 transition-all duration-200 w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
