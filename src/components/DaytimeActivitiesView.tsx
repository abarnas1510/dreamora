import React, { useState } from 'react';
import { ListChecks, Sparkles, Gamepad2, Footprints, Clock, Check, ArrowRight, Play } from 'lucide-react';
import { DAYTIME_ACTIVITIES, QUICK_GAMES } from '../data/mockData';
import { DaytimeActivity, QuickGame } from '../types';

interface DaytimeActivitiesViewProps {
  onStartGame: (game: QuickGame) => void;
}

const FEELING_CHIPS = [
  { label: 'Sleepy', emoji: '😴' },
  { label: 'Tired', emoji: '🥱' },
  { label: 'Bored', emoji: '😐' },
  { label: 'Stressed', emoji: '😟' },
  { label: 'Low', emoji: '😔' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Good', emoji: '🙂' },
];

export const DaytimeActivitiesView: React.FC<DaytimeActivitiesViewProps> = ({
  onStartGame
}) => {
  const [selectedFeeling, setSelectedFeeling] = useState<string>('Sleepy');
  const [freeTextFeeling, setFreeTextFeeling] = useState<string>('');
  const [activeActivityTimer, setActiveActivityTimer] = useState<DaytimeActivity | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedActivities, setCompletedActivities] = useState<string[]>([
    'Morning outdoor walk',
    '5-min puzzle'
  ]);

  // Dynamic recommendations based on feeling
  const filteredActivities = DAYTIME_ACTIVITIES.filter((act) =>
    act.appropriateFor.includes(selectedFeeling.toLowerCase())
  );

  const startTimedActivity = (act: DaytimeActivity) => {
    setActiveActivityTimer(act);
    setTimerSecondsLeft(act.durationMinutes * 60);
    setIsTimerRunning(true);
  };

  const handleMarkSelfReportDone = (actName: string) => {
    if (!completedActivities.includes(actName)) {
      setCompletedActivities([...completedActivities, actName]);
    }
  };

  return (
    <div className="pb-24 space-y-5 animate-fade-in w-full max-w-full mx-auto">
      {/* Header */}
      <div className="glass-card p-4 flex items-center justify-between border border-purple-200 dark:border-purple-500/20">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 dark:glow-text">
            <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Daytime Activities
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Find something that fits how you feel right now</p>
        </div>
      </div>

      {/* SECTION 1 — CHECK IN */}
      <section className="glass-card p-5 border border-[#DDD6FE] dark:border-purple-500/20 bg-purple-50/90 dark:bg-gradient-to-br dark:from-purple-900 dark:via-indigo-950 dark:to-slate-950 shadow-sm dark:shadow-xl space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#241B3A] dark:text-purple-200 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#6D28D9] dark:text-purple-300 animate-pulse" />
          💭 How are you feeling right now?
        </div>
        <p className="text-xs text-[#5B536B] dark:text-purple-200/90 leading-relaxed">
          Tell us what you're experiencing, and we’ll suggest suitable activities to keep you engaged.
        </p>

        {/* Feeling Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {FEELING_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setSelectedFeeling(chip.label)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                selectedFeeling === chip.label
                  ? 'border-purple-400 bg-purple-200 dark:bg-purple-500/40 text-[#4C1D95] dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'border-[#DDD6FE] dark:border-purple-400/30 bg-purple-50/80 dark:bg-white/10 text-[#40384D] dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-white/20'
              }`}
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>

        {/* Free-text input */}
        <div className="pt-2">
          <input
            type="text"
            value={freeTextFeeling}
            onChange={(e) => setFreeTextFeeling(e.target.value)}
            placeholder="Or drop what you feel... (e.g. 'Feeling sleepy and bored at 2 PM')"
            className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-white/10 border border-[#DDD6FE] dark:border-purple-400/30 text-[#241B3A] dark:text-white placeholder-[#6B6475] dark:placeholder-slate-300 focus:outline-none focus:border-purple-400 dark:focus:border-purple-300"
          />
        </div>
      </section>

      {/* Active Timed Activity Bar */}
      {activeActivityTimer && (
        <section className="glass-card p-4 border border-purple-500/40 bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-xl space-y-2 animate-bounce-short">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold flex items-center gap-1.5 text-purple-200">
              <Footprints className="w-4 h-4 text-purple-400" />
              {activeActivityTimer.title}
            </span>
            <span className="font-mono text-base font-bold text-purple-300 glow-text">
              {Math.floor(timerSecondsLeft / 60)}:{timerSecondsLeft % 60 < 10 ? '0' : ''}{timerSecondsLeft % 60}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                handleMarkSelfReportDone(activeActivityTimer.title);
                setActiveActivityTimer(null);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Mark Completed ✓
            </button>
            <button
              onClick={() => setActiveActivityTimer(null)}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-xs rounded-xl text-slate-300 border border-purple-500/20"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* SECTION 2 — PERSONALIZED RECOMMENDATIONS */}
      <section className="glass-card p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          ⭐ Recommended for You ({selectedFeeling})
        </h3>

        <div className="space-y-2">
          {(filteredActivities.length > 0 ? filteredActivities : DAYTIME_ACTIVITIES.slice(0, 3)).map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-purple-200/60 dark:border-purple-500/15 flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-400/40 transition-all"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{act.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{act.description}</p>
                <span className="text-[10px] text-purple-800 dark:text-purple-300 font-bold uppercase tracking-wider mt-1 inline-block">
                  {act.durationMinutes} min • {act.activityType}
                </span>
              </div>

              <div className="shrink-0 ml-2">
                {act.activityType === 'timed' ? (
                  <button
                    onClick={() => startTimedActivity(act)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 border border-purple-400/30"
                  >
                    <Play className="w-3 h-3 fill-current" /> Start
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkSelfReportDone(act.title)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      completedActivities.includes(act.title)
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-white/10 hover:bg-purple-200 dark:hover:bg-white/15 border-purple-200 dark:border-purple-500/20 text-purple-900 dark:text-purple-200'
                    }`}
                  >
                    {completedActivities.includes(act.title) ? '✓ Completed' : 'Done'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — QUICK GAMES */}
      <section className="glass-card p-4 space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Quick Games
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">Short, calm activities to keep your mind engaged</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {QUICK_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => onStartGame(game)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/15 hover:border-purple-300 dark:hover:border-purple-400/40 flex items-center justify-between cursor-pointer transition-all group"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">{game.name}</h4>
                <span className="text-[10px] text-purple-800 dark:text-purple-300/70 font-semibold">{game.durationMinutes} min</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — TODAY'S ACTIVITY HISTORY */}
      <section className="glass-card p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          📋 Today's Activity History
        </h3>
        <div className="space-y-1.5 text-xs">
          {completedActivities.map((item) => (
            <div key={item} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
          {completedActivities.length === 0 && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">No activities logged yet today.</p>
          )}
        </div>
      </section>
    </div>
  );
};
