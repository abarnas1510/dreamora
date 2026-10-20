import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Clock, Plus, Minus, ArrowRight, Brain, Cpu, Wifi, Sunrise, ListChecks } from 'lucide-react';
import {
  SleepTrackingState,
  NightAwakenings,
  CbtiPlanItem,
  ThoughtEntry
} from '../types';
import { HomeSleepTrackerCard } from './HomeSleepTrackerCard';
import {
  getUserSleepSessions,
  getActiveSleepSession,
  SleepSession
} from '../lib/sleepDataStore';

interface HomeViewProps {
  userName: string;
  userId?: string;
  onOpenThoughtModal: () => void;
  onOpenDaytimeView: () => void;
  onOpenCbtiView: () => void;
  onOpenExercisesView: () => void;
  onOpenMonitorView?: () => void;
  onStartExerciseModal: (exerciseId: string) => void;
  savedThoughts: ThoughtEntry[];
  language?: string;
}

const ROTATING_MESSAGES = [
  "Every night is a new opportunity to rest and reset.",
  "Small steps can make a meaningful difference.",
  "Be patient with yourself today.",
  "Take today one step at a time.",
  "Notice your progress, not just the difficult nights."
];

export const HomeView: React.FC<HomeViewProps> = ({
  userName,
  userId = 'default_user',
  onOpenThoughtModal,
  onOpenDaytimeView,
  onOpenCbtiView,
  onOpenExercisesView,
  onOpenMonitorView,
  onStartExerciseModal,
  savedThoughts
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Real user sleep sessions state
  const [userSessions, setUserSessions] = useState<SleepSession[]>([]);

  useEffect(() => {
    const loaded = getUserSleepSessions(userId);
    setUserSessions(loaded);
  }, [userId]);

  const completedSessions = userSessions.filter(s => s.status === 'completed');
  const latestSession = completedSessions.length > 0 ? completedSessions[0] : null;
  const activeSession = userSessions.find(s => s.status === 'active') || null;

  // Night Awakenings Counter State (for current session/manual logging)
  const [awakenings, setAwakenings] = useState<NightAwakenings>({
    wokeUpCount: latestSession?.awakeningsCount || 0,
    gotOutOfBedCount: 0
  });

  // CBT-I Plan items
  const [todayPlan] = useState<CbtiPlanItem[]>([
    { id: 'plan-1', title: 'CBT-I Exercise', subtitle: 'Challenge a sleep-related thought', category: 'exercise', durationMinutes: 10, completed: false, iconName: 'Brain', assignedByClinician: true },
    { id: 'plan-2', title: 'Daytime Activity', subtitle: '20-minute outdoor walk', category: 'daytime', durationMinutes: 20, completed: false, iconName: 'ListChecks' },
    { id: 'plan-3', title: 'Evening Sleep Routine', subtitle: 'Progressive muscle relaxation', category: 'routine', durationMinutes: 10, completed: false, iconName: 'Moon', assignedByClinician: true }
  ]);

  // Rotate encouraging messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pb-24 space-y-5 animate-fade-in w-full max-w-full mx-auto">
      {/* Welcome Hero Banner */}
      <section className="glass-card p-5 relative overflow-hidden bg-purple-50/90 dark:bg-gradient-to-br dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-950/80 border border-[#DDD6FE] dark:border-purple-500/20 shadow-sm dark:shadow-xl dark:shadow-purple-950/20">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-[#241B3A] dark:text-white dark:glow-text">Good morning, <span className="font-extrabold">{userName}</span> 👋</h1>
          </div>
          <p className="text-xs text-[#5B536B] dark:text-purple-200/90 mt-2.5 font-normal leading-relaxed min-h-[2rem]">
            “{ROTATING_MESSAGES[messageIndex]}”
          </p>
        </div>
      </section>

      {/* Responsive Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {/* Drop Your Thoughts Compact Card */}
        <section className="glass-card p-4 hover:border-purple-500/30 transition-all h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">💭</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Drop your thoughts</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">What’s on your mind today?</p>
              </div>
            </div>
            {savedThoughts.length > 0 && (
              <span className="text-[10px] bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-500/20">
                {savedThoughts.length} saved
              </span>
            )}
          </div>

          <button
            onClick={onOpenThoughtModal}
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-purple-200 dark:border-purple-500/15 hover:border-purple-400/40 text-left text-xs text-slate-600 dark:text-slate-400 hover:text-purple-800 dark:hover:text-purple-200 transition-all flex items-center justify-between group"
          >
            <span>Write anything you’d like to share...</span>
            <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Mood Check-in */}
        <section className="glass-card p-4 h-full flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">How are you feeling today?</h3>
          <div className="grid grid-cols-5 gap-2 my-auto">
            {['😞', '😕', '😐', '🙂', '😊'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedMood(emoji)}
                className={`p-2.5 rounded-xl border text-center text-xl transition-all ${
                  selectedMood === emoji
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-110'
                    : 'border-slate-200 dark:border-slate-800/40 hover:bg-purple-50 dark:hover:bg-white/5'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        {/* Home Sleep Tracking Card */}
        <HomeSleepTrackerCard
          userId={userId}
          onSessionChange={() => {
            const loaded = getUserSleepSessions(userId);
            setUserSessions(loaded);
          }}
        />

        {/* Night Awakenings Counters */}
        <section className="glass-card p-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Night Awakenings</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Counter 1: Woke up */}
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-purple-200/60 dark:border-purple-500/15 text-center">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-2">Woke up during sleep</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setAwakenings((p) => ({ ...p, wokeUpCount: Math.max(0, p.wokeUpCount - 1) }))}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white flex items-center justify-center transition-all font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-bold text-slate-900 dark:text-white w-6">{awakenings.wokeUpCount}</span>
                <button
                  onClick={() => setAwakenings((p) => ({ ...p, wokeUpCount: p.wokeUpCount + 1 }))}
                  className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-900/30 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Counter 2: Got out of bed */}
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-purple-200/60 dark:border-purple-500/15 text-center">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-2">Got out of bed</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setAwakenings((p) => ({ ...p, gotOutOfBedCount: Math.max(0, p.gotOutOfBedCount - 1) }))}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white flex items-center justify-center transition-all font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-bold text-slate-900 dark:text-white w-6">{awakenings.gotOutOfBedCount}</span>
                <button
                  onClick={() => setAwakenings((p) => ({ ...p, gotOutOfBedCount: p.gotOutOfBedCount + 1 }))}
                  className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-900/30 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Today's CBT-I Plan */}
        <section className="glass-card p-4 space-y-3 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Today’s CBT-I Plan</h3>
            </div>
            <button
              onClick={onOpenCbtiView}
              className="text-[11px] text-purple-700 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5"
            >
              View Full Plan &gt;
            </button>
          </div>

          <div className="space-y-2">
            {todayPlan.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (card.category === 'exercise') onStartExerciseModal('ex-pmr');
                  else if (card.category === 'daytime') onOpenDaytimeView();
                  else onStartExerciseModal('ex-breathing');
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/15 hover:border-purple-300 dark:hover:border-purple-400/40 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                    {card.iconName === 'Brain' ? <Brain className="w-4 h-4" /> : card.iconName === 'ListChecks' || card.iconName === 'Sunrise' || card.iconName === 'Sun' ? <ListChecks className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{card.title}</h4>
                      {card.assignedByClinician && (
                        <span className="text-[9px] bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                          Clinician
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{card.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  <Clock className="w-3 h-3" />
                  <span>{card.durationMinutes} min</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
