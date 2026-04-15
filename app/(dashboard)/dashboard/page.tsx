import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Share2 
} from 'lucide-react';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <section className={styles.statsGrid}>
        <Card variant="glass" padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.blue}`}>
              <TrendingUp size={24} />
            </div>
            <span className={styles.statLabel}>Total Reach</span>
          </div>
          <p className={styles.statValue}>124.5k</p>
          <span className={`${styles.trend} ${styles.positive}`}>+12.5% vs last month</span>
        </Card>

        <Card variant="glass" padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.purple}`}>
              <MessageSquare size={24} />
            </div>
            <span className={styles.statLabel}>Engagements</span>
          </div>
          <p className={styles.statValue}>18.2k</p>
          <span className={`${styles.trend} ${styles.positive}`}>+8.2% vs last month</span>
        </Card>

        <Card variant="glass" padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.green}`}>
              <ThumbsUp size={24} />
            </div>
            <span className={styles.statLabel}>Total Likes</span>
          </div>
          <p className={styles.statValue}>84.1k</p>
          <span className={`${styles.trend} ${styles.neutral}`}>Stable vs last month</span>
        </Card>

        <Card variant="glass" padding="md" className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.yellow}`}>
              <Share2 size={24} />
            </div>
            <span className={styles.statLabel}>Total Shares</span>
          </div>
          <p className={styles.statValue}>4.2k</p>
          <span className={`${styles.trend} ${styles.negative}`}>-2.1% vs last month</span>
        </Card>
      </section>

      <section className={styles.mainGrid}>
        <Card variant="glass" padding="lg" className={styles.calendarPreview}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Upcoming Posts</h3>
              <p>Your scheduled content for the next 7 days.</p>
            </div>
            <Button variant="primary" size="sm">
              <Plus size={16} /> Create New
            </Button>
          </div>
          
          <div className={styles.emptyState}>
            <div className={styles.calendarIcon}>
              <Calendar size={48} className={styles.faint} />
            </div>
            <h4>No posts scheduled yet</h4>
            <p>Generate your first 30-day calendar with AI to get started.</p>
            <Button variant="secondary" className="mt-4">Generate Calendar</Button>
          </div>
        </Card>

        <Card variant="glass" padding="lg" className={styles.activityFeed}>
          <h3>Recent Activity</h3>
          <div className={styles.feedList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.feedItem}>
                <div className={styles.feedDot}></div>
                <div className={styles.feedContent}>
                  <p><strong>Post published</strong> on Instagram</p>
                  <span>2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

// Simple Calendar component since we'll build the full one later
const Calendar = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
