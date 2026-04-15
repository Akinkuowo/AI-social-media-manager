'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  PenTool, 
  Image as ImageIcon, 
  BarChart2, 
  Settings, 
  Users,
  LogOut,
  ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Content Calendar', href: '/calendar' },
  { icon: PenTool, label: 'Content Generator', href: '/generate' },
  { icon: ImageIcon, label: 'Media Library', href: '/media' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Social<span className="text-primary">AI</span></span>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
              {isActive && <ChevronRight size={16} className={styles.chevron} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <Link href="/settings" className={styles.navItem}>
          <Settings size={20} className={styles.icon} />
          <span className={styles.label}>Settings</span>
        </Link>
        <button className={`${styles.navItem} ${styles.logout}`}>
          <LogOut size={20} className={styles.icon} />
          <span className={styles.label}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
