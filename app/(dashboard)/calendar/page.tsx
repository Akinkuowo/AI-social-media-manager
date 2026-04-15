'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  TrendingUp, 
  Layout, 
  Target, 
  Share2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { showAlert } from '@/lib/alerts';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({
    caption: '',
    type: 'educational',
    status: 'DRAFT'
  });
  const router = useRouter();

  const fetchCalendar = async (date: Date) => {
    setIsLoading(true);
    try {
      const month = date.getMonth();
      const year = date.getFullYear();
      const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setCalendar(data);
      }
    } catch (err) {
      console.error("FAILED_TO_FETCH_CALENDAR:", err);
      showAlert.error('Sync Failed', 'Could not load your calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentDate);
  }, [currentDate]);

  const handleAddPost = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendar || !selectedDay) return;

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: calendar.id,
          day: selectedDay,
          ...newPost
        })
      });

      if (res.ok) {
        showAlert.success('Scheduled', 'Post added to your calendar.');
        setIsModalOpen(false);
        setNewPost({ caption: '', type: 'educational', status: 'DRAFT' });
        fetchCalendar(currentDate);
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to save post.');
    }
  };

  if (isLoading && !calendar) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const posts = calendar?.posts || [];
  const platforms = posts.reduce((acc: any, post: any) => {
    const platform = post.socialAccount?.platform || 'instagram';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-140px)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-sm text-muted mt-1">Manage your multi-platform content schedule effortlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/generate')}>
            <Sparkles size={18} className="mr-2 text-primary" /> AI Studio
          </Button>
          <Button onClick={() => handleAddPost(new Date().getDate())}>
            <Plus size={18} className="mr-2" /> New Post
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_300px] gap-8 h-full overflow-hidden">
        <div className="overflow-auto pr-2 custom-scrollbar">
          <Calendar 
            posts={posts}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAddPost={handleAddPost}
            onEditPost={(post) => {
              showAlert.info('Coming Soon', 'Detailed post editing is currently under development.');
            }}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Card variant="glass" padding="lg">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Month Summary
            </h3>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-xs text-muted uppercase font-bold tracking-widest">Total Scheduled</p>
                <p className="text-3xl font-black">{posts.length}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                {Object.entries(platforms).map(([platform, count]: [any, any]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                      <span className="text-sm capitalize">{platform}</span>
                    </div>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-xs text-muted italic">No posts scheduled yet.</p>}
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="lg" className="bg-primary/5 border-primary/10">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
              <Target size={18} className="text-primary" /> Strategy Tip
            </h3>
            <p className="text-xs leading-relaxed text-muted font-medium">
              Based on your <span className="text-primary">Engagement Goals</span>, we recommend posting at least 3 times a week between 6 PM and 9 PM.
            </p>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Schedule Post for Day ${selectedDay}`}
      >
        <form onSubmit={handleSavePost} className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Post Content</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-h-[120px]"
              placeholder="What would you like to share?"
              value={newPost.caption}
              onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Post Type</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={newPost.type}
              onChange={(e) => setNewPost({...newPost, type: e.target.value})}
            >
              <option value="educational">🎓 Educational</option>
              <option value="promotional">🔥 Promotional</option>
              <option value="storytelling">📖 Storytelling</option>
              <option value="behind-the-scenes">🤳 Behind the Scenes</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit">Schedule Post</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
