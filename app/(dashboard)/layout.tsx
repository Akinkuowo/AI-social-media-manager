import { Sidebar } from '@/components/ui/Sidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.greeting}>Welcome back, <span className="text-primary">Alex</span></h2>
            <p className={styles.subtitle}>Here's what's happening with your brands today.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>A</div>
              <span className={styles.userName}>Alex Rivera</span>
            </div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
