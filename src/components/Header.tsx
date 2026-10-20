import React from 'react';
import { Sun, Moon, Bell, User, Sparkles, Mic, ListChecks } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeMode } from '../types';

interface HeaderProps {
  activeTab?: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  unreadNotificationsCount?: number;
  unreadNotificationCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenDaytimeActivities: () => void;
  onOpenVoiceCompanion?: () => void;
  onOpenAuth?: () => void;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  unreadNotificationsCount,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenDaytimeActivities,
  onOpenVoiceCompanion,
  userAvatar,
  userName
}) => {
  const unreadCount = unreadNotificationCount ?? unreadNotificationsCount ?? 0;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 backdrop-blur-xl bg-[#faf6f0]/95 dark:bg-[#090514]/95 border-b border-amber-900/10 dark:border-purple-500/15 transition-all shadow-xs dark:shadow-lg dark:shadow-purple-950/20 box-border pt-[env(safe-area-inset-top,0px)] px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]">
      <div className="w-full max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto py-2.5 flex items-center justify-between gap-2 min-w-0">
        {/* Left: Logo & App Name */}
        <button
          onClick={onOpenProfile}
          className="flex-1 min-w-0 flex items-center text-left focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl transition-transform active:scale-95"
          title="Dreamora"
        >
          <Logo size="sm" showTagline={false} className="max-w-full" />
        </button>

        {/* Right: Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2.5">
          {/* Dreamora Voice Companion Button */}
          {onOpenVoiceCompanion && (
            <button
              onClick={onOpenVoiceCompanion}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
              title="Speak with Dreamora Voice Companion"
            >
              <Mic className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span className="hidden sm:inline font-semibold">Voice</span>
            </button>
          )}

          {/* Current Date (Desktop/Tablet) */}
          <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase whitespace-nowrap">
            {currentDate}
          </span>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-purple-500/15 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 shrink-0"
            title="Notification Center"
          >
            <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs border border-white dark:border-slate-900 leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Daytime Activities Secondary Shortcut */}
          <button
            onClick={onOpenDaytimeActivities}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-400/10 dark:hover:bg-purple-400/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 font-medium text-[11px] transition-all focus:outline-none shrink-0"
            title="Daytime Activities"
          >
            <ListChecks className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="hidden xs:inline">Daytime</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-purple-500/15 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 shrink-0"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'light' ? (
              <Sun className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-purple-400 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Circular Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-900/40 hover:scale-105 transition-all focus:outline-none border border-purple-400/30 shrink-0 overflow-hidden"
            title="Open Profile"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName || 'Profile'} className="w-full h-full object-cover rounded-full" />
            ) : userName ? (
              <span>{userName[0]?.toUpperCase()}</span>
            ) : (
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
