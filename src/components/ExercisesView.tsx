import React from 'react';
import { Activity, Wind, Play } from 'lucide-react';
import { StorytellingRelaxation } from './StorytellingRelaxation';
import { AudioTrack } from '../types';

interface ExercisesViewProps {
  onStartBreathingModal: () => void;
  onStartPmrModal: () => void;
  onSelectAudioTrack?: (track: AudioTrack) => void;
  language?: string;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  onStartBreathingModal,
  onStartPmrModal,
  language
}) => {
  return (
    <div className="pb-24 space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
      {/* 1. STORYTELLING RELAXATION SECTION */}
      <StorytellingRelaxation language={language} />

      {/* 2. PROGRESSIVE MUSCLE RELAXATION SECTION */}
      <section className="p-5 rounded-2xl bg-white/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-500/20 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Progressive Muscle Relaxation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              "Gently relax your body with guided voice instructions."
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/30 self-start sm:self-auto shrink-0">
            10 min
          </span>
        </div>

        <div className="pt-1">
          <button
            onClick={onStartPmrModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Exercise
          </button>
        </div>
      </section>

      {/* 3. BREATHING EXERCISE SECTION */}
      <section className="p-5 rounded-2xl bg-white/80 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-500/20 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wind className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              4-7-8 Breathing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              "Slow your breathing and settle into relaxation."
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-500/20 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-500/30 self-start sm:self-auto shrink-0">
            5 min
          </span>
        </div>

        <div className="pt-1">
          <button
            onClick={onStartBreathingModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Breathing
          </button>
        </div>
      </section>
    </div>
  );
};

