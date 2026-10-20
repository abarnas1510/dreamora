import React from 'react';
import { Home, Brain, Activity, Moon, BookOpen } from 'lucide-react';
import { getTranslations } from '../lib/i18n';

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: any) => void;
  onChangeTab?: (tab: any) => void;
  language?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onChangeTab,
  language = 'en'
}) => {
  const t = getTranslations(language);

  const handleTabClick = (tab: string) => {
    if (onChangeTab) onChangeTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'cbti', label: t.nav.cbti, icon: Brain },
    { id: 'exercises', label: t.nav.exercises || 'Exercises', icon: Activity },
    { id: 'monitor', label: t.nav.monitor || 'Monitor', icon: Moon },
    { id: 'diary', label: t.nav.diary || 'Sleep Diary', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto z-30 w-full bg-[#faf6f0]/95 dark:bg-[#090514]/95 backdrop-blur-2xl border-t border-amber-900/10 dark:border-purple-500/20 px-2 sm:px-4 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all box-border min-h-[60px]">
      <div className="grid grid-cols-5 w-full items-center text-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            ((activeTab === 'sleep-diary' || activeTab === 'diary') && (item.id === 'diary' || item.id === 'sleep-diary'));
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-300 focus:outline-none ${
                isActive
                  ? 'text-purple-800 dark:text-purple-300 font-bold scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-900 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all shrink-0 ${
                  isActive
                    ? 'bg-purple-200/80 dark:bg-purple-500/25 text-purple-900 dark:text-purple-200 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-300 dark:border-purple-500/40'
                    : 'hover:bg-purple-100/60 dark:hover:bg-purple-500/10'
                }`}
              >
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold mt-1 truncate max-w-full leading-none ${isActive ? 'text-purple-950 dark:text-purple-200 dark:glow-text' : 'text-slate-600 dark:text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

