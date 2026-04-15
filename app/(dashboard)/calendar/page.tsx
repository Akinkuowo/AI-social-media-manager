'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Filter, Download } from 'lucide-react';
import { clsx } from 'clsx';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, -1));

  const generateCalendar = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth.getMonth() + 1, year: currentMonth.getFullYear() }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      } else {
        const errorData = await res.json();
        if (errorData.message === "No company found") {
          alert('You need to complete onboarding to generate a calendar. Please go to /onboarding.');
          window.location.href = '/onboarding';
        } else {
          alert('Failed to generate calendar: ' + errorData.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduledAt), cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div key={day.toString()} className={clsx(
            'min-h-[100px] p-2 border border-border rounded-xl relative group transition-colors',
            isCurrentMonth ? 'bg-surface hover:bg-surface-hover' : 'opacity-30'
          )}>
            <span className="text-xs font-medium text-muted">{formattedDate}</span>
            <div className="mt-1 flex flex-col gap-1">
              {dayPosts.map((post, idx) => (
                <div key={idx} className="text-[10px] px-2 py-1 rounded-md bg-primary/15 text-primary truncate">
                  {post.type}
                </div>
              ))}
            </div>
            <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-surface-hover text-muted hover:text-foreground flex items-center justify-center transition-all">
              <Plus size={14} />
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="flex flex-col gap-1">{rows}</div>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-sm text-muted mt-1">Manage and schedule your AI-generated social media posts.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md"><Download size={18} className="mr-2" /> Export</Button>
          <Button variant="primary" size="md" onClick={generateCalendar} isLoading={isGenerating}>
            <Sparkles size={18} className="mr-2" /> Generate 30 Days
          </Button>
        </div>
      </div>

      <Card variant="glass" padding="none">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"><ChevronLeft size={20} /></button>
            <h2 className="text-lg font-bold min-w-[200px] text-center">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"><ChevronRight size={20} /></button>
          </div>
          <Button variant="ghost" size="sm"><Filter size={16} className="mr-2" /> Filters</Button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs font-semibold text-muted text-center py-2">{day}</div>
            ))}
          </div>
          {renderCells()}
        </div>
      </Card>
    </div>
  );
}
