import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Share2 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm text-muted">Total Reach</span>
          </div>
          <p className="text-3xl font-bold mb-1">124.5k</p>
          <span className="text-xs text-success">+12.5% vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="text-sm text-muted">Engagements</span>
          </div>
          <p className="text-3xl font-bold mb-1">18.2k</p>
          <span className="text-xs text-success">+8.2% vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <ThumbsUp size={24} />
            </div>
            <span className="text-sm text-muted">Total Likes</span>
          </div>
          <p className="text-3xl font-bold mb-1">84.1k</p>
          <span className="text-xs text-muted">Stable vs last month</span>
        </Card>

        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <span className="text-sm text-muted">Total Shares</span>
          </div>
          <p className="text-3xl font-bold mb-1">4.2k</p>
          <span className="text-xs text-error">-2.1% vs last month</span>
        </Card>
      </section>

      <section className="grid grid-cols-[2fr_1fr] gap-6 max-lg:grid-cols-1">
        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Upcoming Posts</h3>
              <p className="text-sm text-muted mt-1">Your scheduled content for the next 7 days.</p>
            </div>
            <Button variant="primary" size="sm">
              <Plus size={16} className="mr-1" /> Create New
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarIcon size={48} className="text-muted/30 mb-4" />
            <h4 className="text-lg font-semibold mb-2">No posts scheduled yet</h4>
            <p className="text-sm text-muted mb-4">Generate your first 30-day calendar with AI to get started.</p>
            <Button variant="secondary">Generate Calendar</Button>
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm"><strong className="text-foreground">Post published</strong> <span className="text-muted">on Instagram</span></p>
                  <span className="text-xs text-muted">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

const CalendarIcon = ({ size, className }: { size: number, className: string }) => (
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
