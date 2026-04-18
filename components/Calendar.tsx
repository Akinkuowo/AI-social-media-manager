'use client';

import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Pencil
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';

const Instagram = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Twitter = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const Linkedin = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Facebook = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

interface Post {
  id: string;
  day: number;
  type: string;
  caption: string;
  hashtags?: string;
  status: string;
  scheduledAt?: string;
  socialAccount?: {
    platform: string;
    name?: string;
  };
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; pulse?: boolean }> = {
  DRAFT: { icon: Pencil, color: 'text-muted', label: 'Draft' },
  SCHEDULED: { icon: Clock, color: 'text-blue-400', label: 'Scheduled', pulse: true },
  PUBLISHED: { icon: CheckCircle, color: 'text-emerald-400', label: 'Published' },
  FAILED: { icon: AlertCircle, color: 'text-red-400', label: 'Failed' },
  PENDING_REVIEW: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
  APPROVED: { icon: CheckCircle, color: 'text-sky-400', label: 'Approved' },
};

interface CalendarProps {
  posts: Post[];
  onAddPost: (day: number) => void;
  onEditPost: (post: Post) => void;
  onDropPost?: (postId: string, newDay: number) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const Calendar = ({ posts, onAddPost, onEditPost, onDropPost, currentDate, onDateChange }: CalendarProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  return (
    <div className="flex flex-col h-full bg-surface/30 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
            <p className="text-xs text-muted uppercase tracking-widest font-bold mt-0.5">Content Schedule</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayPosts = posts.filter(p => p.day === day.getDate() && isCurrentMonth);

          return (
            <div 
              key={day.toString()}
              onDragOver={(e) => {
                // Prevent default to allow drop
                if (isCurrentMonth) e.preventDefault(); 
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedPostId = e.dataTransfer.getData('postId');
                if (droppedPostId && onDropPost && isCurrentMonth) {
                  onDropPost(droppedPostId, day.getDate());
                }
              }}
              className={clsx(
                "min-h-[140px] p-2 border-r border-b border-white/5 transition-all relative group",
                !isCurrentMonth ? "bg-black/20 opacity-30" : "bg-white/0 hover:bg-white/2",
                isToday && "bg-primary/5"
              )}
            >
              <div className="flex justify-between items-start mb-2 px-1">
                <span className={clsx(
                  "text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full",
                  isToday ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-muted/80"
                )}>
                  {format(day, 'd')}
                </span>
                
                {isCurrentMonth && (
                  <button 
                    onClick={() => onAddPost(day.getDate())}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-all"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <AnimatePresence mode="popLayout">
                  {dayPosts.map((post) => {
                    const PlatformIcon = PLATFORM_ICONS[post.socialAccount?.platform || 'instagram'] || Instagram;
                    const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <motion.div
                        layoutId={post.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={post.id}
                        draggable={true}
                        onDragStart={(e: any) => {
                          e.dataTransfer.setData('postId', post.id);
                        }}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          onEditPost(post);
                        }}
                        className={clsx(
                          "px-2 py-1.5 rounded-xl border text-[10px] font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
                          post.status === 'SCHEDULED' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                          post.status === 'DRAFT' ? "bg-surface text-muted border-white/10" :
                          post.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          post.status === 'FAILED' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-surface text-foreground border-white/5"
                        )}
                      >
                        <PlatformIcon size={11} className="flex-shrink-0" />
                        <span className="truncate flex-1">{post.caption.substring(0, 25)}...</span>
                        <StatusIcon size={10} className={clsx("flex-shrink-0", statusCfg.color, statusCfg.pulse && "animate-pulse")} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {isToday && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
