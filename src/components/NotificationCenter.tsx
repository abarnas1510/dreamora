import React from 'react';
import { X, Bell, CheckCheck, Moon, Brain, Sunrise, Headphones, Heart, Clock, BookOpen, Check, ListChecks } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead?: (id: string) => void;
  onDismissNotification?: (id: string) => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onMarkAsRead,
  onDismissNotification,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  // Filter unread and non-dismissed notifications
  const visibleNotifications = notifications.filter((n) => !n.read && !n.dismissed);
  const unreadCount = visibleNotifications.length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'wake_up': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'wind_down': return <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case 'sleep_tracking': return <Clock className="w-4 h-4 text-purple-500" />;
      case 'cbti_task':
      case 'cbti': return <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'sleep_diary': return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'daytime_activity': return <ListChecks className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'audio': return <Headphones className="w-4 h-4 text-teal-500" />;
      case 'encouragement': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'sleep_schedule': return <Clock className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const isToday = (notif: AppNotification) => {
    if (notif.timestamp?.startsWith('Today')) return true;
    if (notif.createdAt) {
      const createdDate = new Date(notif.createdAt).toDateString();
      const todayDate = new Date().toDateString();
      return createdDate === todayDate;
    }
    return false;
  };

  const todayNotifications = visibleNotifications.filter(isToday);
  const earlierNotifications = visibleNotifications.filter((n) => !isToday(n));

  const renderNotificationCard = (notif: AppNotification) => (
    <div
      key={notif.id}
      className={`p-3.5 rounded-2xl border transition-all ${
        !notif.read
          ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 shadow-2xs'
          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            {getIcon(notif.type)}
          </div>
          <div className="min-w-0">
            <h4
              onClick={() => onSelectNotification(notif)}
              className={`text-xs cursor-pointer hover:underline truncate ${
                !notif.read
                  ? 'font-bold text-slate-900 dark:text-slate-100'
                  : 'font-semibold text-slate-700 dark:text-slate-300'
              }`}
            >
              {notif.title}
            </h4>
            <span className="text-[10px] text-slate-400 block">{notif.timestamp}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!notif.read && (
            <button
              onClick={() => onMarkAsRead ? onMarkAsRead(notif.id) : onSelectNotification(notif)}
              title="Mark as Read"
              className="text-[10px] bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800/80 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 transition-colors"
            >
              <Check className="w-3 h-3" /> Mark Read
            </button>
          )}
          {onDismissNotification && (
            <button
              onClick={() => onDismissNotification(notif.id)}
              title="Dismiss"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p
        onClick={() => onSelectNotification(notif)}
        className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed cursor-pointer"
      >
        {notif.body}
      </p>

      {notif.actionText && (
        <div className="mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-900/40 flex justify-end">
          <button
            onClick={() => onSelectNotification(notif)}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-all active:scale-95"
          >
            {notif.actionText} &gt;
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 transition-all text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">NOTIFICATIONS</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-bold"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="py-3 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {todayNotifications.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Today</span>
                <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                {todayNotifications.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {earlierNotifications.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Earlier</span>
                <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                {earlierNotifications.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {visibleNotifications.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">You’re all caught up</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No active notifications right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
