'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, X, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'PUBLISH_SUCCESS' | 'PUBLISH_FAILED' | 'ANALYTICS_READY' | 'COMMENT_RECEIVED' | 'SYSTEM_ALERT';
  isRead: boolean;
  link?: string;
  createdAt: string;
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PUBLISH_SUCCESS': return <CheckCircle2 size={16} className="text-success" />;
      case 'PUBLISH_FAILED': return <AlertCircle size={16} className="text-error" />;
      case 'ANALYTICS_READY': return <Check size={16} className="text-primary" />;
      default: return <Megaphone size={16} className="text-muted" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-2.5 rounded-2xl border transition-all duration-300",
          isOpen ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-muted hover:text-foreground hover:bg-white/10"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-background animate-bounce mt-[-4px] mr-[-4px]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-[400px] max-md:w-[300px] bg-[#0d0d0d] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest">Notifications</h3>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={clsx(
                      "p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group relative",
                      !notif.isRead && "bg-primary/5"
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold leading-tight">{notif.title}</h4>
                        <p className="text-[11px] text-muted mt-1 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <span className="text-[10px] text-muted font-medium opacity-50">
                             {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {notif.link && (
                             <Link 
                               href={notif.link} 
                               onClick={() => setIsOpen(false)}
                               className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                             >
                               <ExternalLink size={10} /> View details
                             </Link>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center opacity-40">
                  <Bell size={40} className="mx-auto mb-4 stroke-[1px]" />
                  <p className="text-xs font-medium">All caught up! No new alerts.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-white/2 border-t border-white/5 text-center">
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest pointer-events-none">
                  Showing latest alerts
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
