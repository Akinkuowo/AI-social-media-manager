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
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Trash2,
  RefreshCw,
  Zap,
  Download
} from 'lucide-react';
import { showAlert } from '@/lib/alerts';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  DRAFT: { bg: 'bg-white/5', text: 'text-muted', icon: Clock, label: 'Draft' },
  SCHEDULED: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Clock, label: 'Scheduled' },
  PUBLISHED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle, label: 'Published' },
  FAILED: { bg: 'bg-red-500/10', text: 'text-red-400', icon: AlertCircle, label: 'Failed' },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState<{
    caption: string;
    type: string;
    status: string;
    socialAccountIds: string[];
    scheduledAt: string;
    isRecurring: boolean;
    recurrenceInterval: string;
  }>({
    caption: '',
    type: 'educational',
    status: 'DRAFT',
    socialAccountIds: [],
    scheduledAt: '',
    isRecurring: false,
    recurrenceInterval: 'daily'
  });

  // AI Generation State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({ platform: 'instagram', trendingTopics: '' });
  const [isRegenerating, setIsRegenerating] = useState(false);

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

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/social/accounts');
      if (res.ok) setSocialAccounts(await res.json());
    } catch {
      console.error("Failed to fetch accounts");
    }
  };

  useEffect(() => {
    fetchCalendar(currentDate);
    fetchAccounts();
  }, [currentDate]);

  const handleAddPost = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const handleDropPost = async (postId: string, newDay: number) => {
    try {
      const postToMove = calendar?.posts.find((p: any) => p.id === postId);
      if (!postToMove || postToMove.day === newDay) return;
      
      const res = await fetch(`/api/calendar/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: newDay })
      });
      
      if (res.ok) {
        showAlert.success("Post Moved", `Rescheduled to day ${newDay}`);
        fetchCalendar(currentDate);
      }
    } catch (err) {
      showAlert.error("Move Failed", "Could not accurately map the post.");
    }
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
        showAlert.success('Cross-Platform Scheduled', 'Posts added to your automated schedule.');
        setIsModalOpen(false);
        setNewPost({ 
          caption: '', 
          type: 'educational', 
          status: 'DRAFT', 
          socialAccountIds: [],
          scheduledAt: '',
          isRecurring: false,
          recurrenceInterval: 'daily'
        });
        fetchCalendar(currentDate);
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to save post.');
    }
  };

  const handleRunPublisher = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const data = await res.json();
      
      if (data.published > 0 || data.failed > 0) {
        showAlert.success(
          'Publisher Complete',
          `✅ ${data.published} published, ❌ ${data.failed} failed out of ${data.total} due posts.`
        );
        fetchCalendar(currentDate);
      } else {
        showAlert.info('No Due Posts', data.message || 'No posts are due for publishing right now.');
      }
    } catch (err) {
      showAlert.error('Publisher Error', 'Failed to run the auto-publisher.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/calendar/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert.success('Deleted', 'Post has been removed from the calendar.');
        setIsDetailModalOpen(false);
        setSelectedPost(null);
        fetchCalendar(currentDate);
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to delete the post.');
    }
  };

  const handleGenerateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAIGenerating(true);
    try {
      const res = await fetch('/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: calendar?.id,
          platform: aiForm.platform,
          trendingTopics: aiForm.trendingTopics,
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
        })
      });
      
      if (res.ok) {
        showAlert.success("30-Day Plan Generated!", "Successfully loaded AI calendar into the grid.");
        setIsAIModalOpen(false);
        fetchCalendar(currentDate);
      } else {
        const data = await res.json();
        showAlert.error("Generation Failed", data.message || "Something went wrong.");
      }
    } catch (err) {
      showAlert.error("Generation Failed", "Could not connect to AI Engine.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleExportCalendar = () => {
    if (!calendar?.posts?.length) {
      return showAlert.info("Empty Calendar", "There are no scheduled posts to export.");
    }
    
    const headers = ["Day", "Platform", "Type", "Status", "Scheduled At", "Caption", "Hashtags"];
    const csvContent = [
      headers.join(","),
      ...calendar.posts.map((post: any) => {
        const d = post.day || "";
        const plat = post.socialAccount?.platform || "unlinked";
        const t = post.type || "";
        const s = post.status || "";
        const sched = post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "";
        const cap = `"${(post.caption || "").replace(/"/g, '""')}"`;
        const hash = `"${(post.hashtags || "").replace(/"/g, '""')}"`;
        return [d, plat, t, s, sched, cap, hash].join(",");
      })
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `social_calendar_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateIdea = async () => {
    if (!selectedPost) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPost.socialAccount?.platform || 'instagram',
          type: selectedPost.type || 'educational',
          tone: 'professional',
          promptOverride: 'Give me a fresh, alternative angle.'
        })
      });
      const data = await res.json();
      if (data.caption) {
        const generatedHashtags = Array.isArray(data.hashtags) ? data.hashtags.join(' ') : data.hashtags;
        
        const patchRes = await fetch(`/api/calendar/${selectedPost.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: data.caption, hashtags: generatedHashtags })
        });
        if (patchRes.ok) {
          setSelectedPost({ ...selectedPost, caption: data.caption, hashtags: generatedHashtags });
          fetchCalendar(currentDate);
          showAlert.success("Idea Regenerated", "Fresh content successfully written.");
        }
      }
    } catch (err) {
      showAlert.error("Regeneration Failed", "Failed to get fresh idea from AI.");
    } finally {
      setIsRegenerating(false);
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
    const platform = post.socialAccount?.platform || 'unlinked';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = posts.reduce((acc: any, post: any) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
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
          <Button variant="ghost" onClick={handleExportCalendar}>
            <Download size={18} className="mr-2 text-muted" /> Export
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => setIsAIModalOpen(true)}
            className="text-primary hover:bg-primary/10 border border-primary/20 bg-primary/5"
          >
            <Sparkles size={18} className="mr-2" /> AI 30-Day Auto-Fill
          </Button>

          <Button 
            variant="ghost" 
            onClick={handleRunPublisher}
            isLoading={isPublishing}
            className="text-emerald-400 hover:bg-emerald-400/10 border border-emerald-400/20"
          >
            <Zap size={18} className="mr-2" /> Run Publisher
          </Button>
          
          <Button onClick={() => handleAddPost(new Date().getDate())}>
            <Plus size={18} className="mr-2" /> Add Post
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
            onEditPost={handleViewPost}
            onDropPost={handleDropPost}
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
              
              <div className="space-y-3 pt-4 border-t border-white/5">
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

              {/* Status Breakdown */}
              {posts.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <p className="text-xs text-muted uppercase font-bold tracking-widest">Status</p>
                  {Object.entries(statusCounts).map(([status, count]: [any, any]) => {
                    const cfg = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon size={12} className={cfg.text} />
                          <span className={clsx("text-sm", cfg.text)}>{cfg.label}</span>
                        </div>
                        <span className={clsx("text-sm font-bold", cfg.text)}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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

      {/* AI Generate Calendar Modal */}
      <Modal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        title={`AI Auto-Fill: ${currentDate.toLocaleString('default', { month: 'long' })}`}
      >
        <form onSubmit={handleGenerateCalendar} className="flex flex-col gap-6 py-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-sm text-primary leading-relaxed font-medium">
              The AI will read your Company's onboarding profile (Niche, Target Audience, and Brand Voice) to automatically craft a hyper-optimized 30-day posting calendar filled with captions, hashtags, and exact posting times.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Primary Platform Focus</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={aiForm.platform}
              onChange={(e) => setAiForm({...aiForm, platform: e.target.value})}
              required
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">X / Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Trending Topics / Specific Themes (Optional)</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-h-[80px]"
              placeholder="E.g. Focus heavily on AI tools, software growth, and summer sales."
              value={aiForm.trendingTopics}
              onChange={(e) => setAiForm({...aiForm, trendingTopics: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsAIModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit" isLoading={isAIGenerating}>
              {isAIGenerating ? "Writing 30 Posts..." : "Generate 30 Days"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Post Modal */}
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Platforms (Select multiple)</label>
            <select 
              multiple
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-capitalize min-h-[100px]"
              value={newPost.socialAccountIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setNewPost({...newPost, socialAccountIds: values});
              }}
              required
            >
              {socialAccounts.map(account => (
                <option key={account.id} value={account.id} className="capitalize py-1">
                  {account.platform} ({account.name})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted">Hold CTRL or CMD to select multiple pipelines.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Exact Dispatch Time (Optional)</label>
              <input 
                type="datetime-local" 
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                value={newPost.scheduledAt}
                onChange={(e) => setNewPost({...newPost, scheduledAt: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Recurring Sequence</label>
              <div className="flex items-center gap-3 h-full">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={newPost.isRecurring}
                    onChange={(e) => setNewPost({...newPost, isRecurring: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Repeat Post
                </label>
                {newPost.isRecurring && (
                  <select 
                    className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    value={newPost.recurrenceInterval}
                    onChange={(e) => setNewPost({...newPost, recurrenceInterval: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit">Schedule Post</Button>
          </div>
        </form>
      </Modal>

      {/* Post Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedPost(null); }}
        title="Post Details"
      >
        {selectedPost && (() => {
          const cfg = STATUS_STYLES[selectedPost.status] || STATUS_STYLES.DRAFT;
          const StatusIcon = cfg.icon;
          return (
            <div className="flex flex-col gap-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded-xl", cfg.bg)}>
                  <StatusIcon size={16} className={cfg.text} />
                  <span className={clsx("text-sm font-bold uppercase tracking-wider", cfg.text)}>{cfg.label}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={handleRegenerateIdea} 
                  isLoading={isRegenerating}
                  className="text-primary hover:bg-primary/10 border border-primary/20"
                >
                  <RefreshCw size={16} className={clsx("mr-2", isRegenerating && "animate-spin")} /> 
                  Regenerate Idea
                </Button>
              </div>

              {/* Status Timeline */}
              <div className="flex items-center gap-2 px-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-400/30" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase">Created</span>
                </div>
                <div className={clsx("flex-1 h-0.5 rounded", selectedPost.status !== 'DRAFT' ? 'bg-blue-400' : 'bg-white/10')} />
                <div className="flex items-center gap-1">
                  <div className={clsx("w-3 h-3 rounded-full border-2", 
                    selectedPost.status !== 'DRAFT' ? 'bg-blue-400 border-blue-400/30' : 'bg-white/10 border-white/20'
                  )} />
                  <span className={clsx("text-[9px] font-bold uppercase", selectedPost.status !== 'DRAFT' ? 'text-blue-400' : 'text-muted')}>Scheduled</span>
                </div>
                <div className={clsx("flex-1 h-0.5 rounded", selectedPost.status === 'PUBLISHED' ? 'bg-emerald-400' : selectedPost.status === 'FAILED' ? 'bg-red-400' : 'bg-white/10')} />
                <div className="flex items-center gap-1">
                  <div className={clsx("w-3 h-3 rounded-full border-2", 
                    selectedPost.status === 'PUBLISHED' ? 'bg-emerald-400 border-emerald-400/30' : 
                    selectedPost.status === 'FAILED' ? 'bg-red-400 border-red-400/30' : 'bg-white/10 border-white/20'
                  )} />
                  <span className={clsx("text-[9px] font-bold uppercase", 
                    selectedPost.status === 'PUBLISHED' ? 'text-emerald-400' : 
                    selectedPost.status === 'FAILED' ? 'text-red-400' : 'text-muted'
                  )}>
                    {selectedPost.status === 'FAILED' ? 'Failed' : 'Published'}
                  </span>
                </div>
              </div>

              {/* Platform & Account */}
              {selectedPost.socialAccount && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {selectedPost.socialAccount.platform.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedPost.socialAccount.name || selectedPost.socialAccount.platform}</p>
                    <p className="text-[10px] text-muted capitalize">{selectedPost.socialAccount.platform}</p>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-muted uppercase font-bold tracking-widest">Caption</label>
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.caption}</p>
                </div>
              </div>

              {/* Hashtags */}
              {selectedPost.hashtags && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest">Hashtags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.hashtags.split(' ').filter(Boolean).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Time */}
              {selectedPost.scheduledAt && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Clock size={14} />
                  <span>Scheduled for: {new Date(selectedPost.scheduledAt).toLocaleString()}</span>
                </div>
              )}

              {/* Error Message (for failed posts) */}
              {selectedPost.status === 'FAILED' && selectedPost.platformOptimized?.error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 font-mono">{selectedPost.platformOptimized.error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  className="flex-1 text-red-400 hover:bg-red-400/10 border border-red-400/20"
                  onClick={() => handleDeletePost(selectedPost.id)}
                >
                  <Trash2 size={16} className="mr-2" /> Delete
                </Button>
                {selectedPost.status === 'DRAFT' && (
                  <Button 
                    className="flex-1"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/calendar/${selectedPost.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'SCHEDULED', scheduledAt: new Date().toISOString() })
                        });
                        if (res.ok) {
                          showAlert.success('Scheduled!', 'Post is now scheduled and ready to publish.');
                          setIsDetailModalOpen(false);
                          fetchCalendar(currentDate);
                        }
                      } catch {
                        showAlert.error('Error', 'Failed to schedule post.');
                      }
                    }}
                  >
                    <Clock size={16} className="mr-2" /> Schedule Now
                  </Button>
                )}
                {(selectedPost.status === 'SCHEDULED' || selectedPost.status === 'FAILED') && (
                  <Button 
                    className="flex-1"
                    onClick={async () => {
                      setIsPublishing(true);
                      try {
                        const res = await fetch('/api/publish', { method: 'POST' });
                        const data = await res.json();
                        showAlert.success('Publisher Ran', `${data.published} published, ${data.failed} failed.`);
                        setIsDetailModalOpen(false);
                        fetchCalendar(currentDate);
                      } catch {
                        showAlert.error('Error', 'Failed to publish.');
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    isLoading={isPublishing}
                  >
                    <Send size={16} className="mr-2" /> Publish Now
                  </Button>
                )}
                {selectedPost.status === 'PUBLISHED' && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold">
                    <CheckCircle size={16} /> Successfully Published
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
