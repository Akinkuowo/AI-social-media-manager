'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  Calendar, 
  PenTool, 
  Image as ImageIcon, 
  BarChart2, 
  Settings, 
  Users,
  Share2,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Content Calendar', href: '/calendar' },
  { icon: PenTool, label: 'Content Generator', href: '/generate' },
  { icon: ImageIcon, label: 'Media Library', href: '/media' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Share2, label: 'Social Connections', href: '/settings/accounts' },
  { icon: Users, label: 'Team', href: '/team' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="glass w-64 flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <span className="text-xl font-extrabold tracking-tight">
          Social<span className="text-primary">AI</span>
        </span>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-muted hover:text-foreground hover:bg-surface-hover'
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
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-all duration-200">
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
  );
};
