import React, { useState, useEffect } from 'react';
import {
  Brain,
  Volume2,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  HeartHandshake,
  FileText,
  CheckSquare,
  Square,
  Play,
  Plus,
  Info
} from 'lucide-react';
import { EDUCATION_ARTICLES } from '../data/mockData';
import { EducationArticle, ThoughtEntry, ClinicalTreatmentPlan, ClinicalPlanTask } from '../types';
import { speakCalmGuidance, stopSpeech } from '../lib/audioSynth';
import { getTranslations } from '../lib/i18n';

interface CbtiViewProps {
  activeClinicalPlan?: ClinicalTreatmentPlan | null;
  onUpdateClinicalPlan?: (plan: ClinicalTreatmentPlan | null) => void;
  onOpenThoughtModal: () => void;
  onOpenClinicalPlanModal: () => void;
  onNavigateTab?: (tab: 'home' | 'cbti' | 'monitor' | 'diary' | 'profile' | 'exercises' | 'daytime') => void;
  onOpenPmrModal?: () => void;
  onOpenBreathingModal?: () => void;
  savedThoughts?: ThoughtEntry[];
  language?: string;
}

export const CbtiView: React.FC<CbtiViewProps> = ({
  activeClinicalPlan,
  onUpdateClinicalPlan,
  onOpenThoughtModal,
  onOpenClinicalPlanModal,
  onNavigateTab,
  onOpenPmrModal,
  onOpenBreathingModal,
  savedThoughts = [],
  language = 'en'
}) => {
  const t = getTranslations(language);

  // UI Accordion / Collapse States
  const [showThisWeek, setShowThisWeek] = useState(true);
  const [expandedOtherWeek, setExpandedOtherWeek] = useState<number | null>(null);
  const [showClinicalDetails, setShowClinicalDetails] = useState(false);
  const [showPreviousThoughts, setShowPreviousThoughts] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<EducationArticle | null>(null);
  const [showAiMore, setShowAiMore] = useState(false);

  // Guided Thought modal state
  const [guidedThoughtStep, setGuidedThoughtStep] = useState<number | null>(null);
  const [speakingThoughtId, setSpeakingThoughtId] = useState<string | null>(null);

  // Selected Week state (default to active plan currentWeekNumber or 1)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(
    activeClinicalPlan?.currentWeekNumber || 1
  );

  // Guided CBT Reflection State
  const [guidedData, setGuidedData] = useState({
    thought: '',
    emotion: 'Anxious',
    evidenceFor: '',
    evidenceAgainst: '',
    alternative: '',
    balanced: ''
  });

  const shortAiTip = "Your body builds sleep pressure the longer you stay awake. Avoiding unplanned daytime naps protects your natural sleep drive at night.";
  const extendedAiTip = "Sleep pressure (Homeostatic Sleep Drive) accumulates continuously during waking hours. Consistent wake-up times strengthen your circadian rhythm. If you cannot sleep within 20 minutes, leave bed and engage in a calm activity until drowsy.";

  // Cancel speech synthesis on component unmount / navigation away
  useEffect(() => {
    return () => {
      stopSpeech();
      setSpeakingThoughtId(null);
    };
  }, []);

  const handleSpeak = (text: string, id?: string) => {
    const speechId = id || text;
    if (speakingThoughtId === speechId) {
      stopSpeech();
      setSpeakingThoughtId(null);
    } else {
      stopSpeech();
      setSpeakingThoughtId(speechId);
      speakCalmGuidance(text, language, () => {
        setSpeakingThoughtId(null);
      });
    }
  };

  // Toggle task completion
  const handleToggleTask = (taskToToggle: ClinicalPlanTask, weekNum: number) => {
    if (!activeClinicalPlan || !onUpdateClinicalPlan) return;

    if (activeClinicalPlan.weeks) {
      const updatedWeeks = activeClinicalPlan.weeks.map((wk) => {
        if (wk.weekNumber === weekNum) {
          return {
            ...wk,
            tasks: wk.tasks.map((t) =>
              t.id === taskToToggle.id ? { ...t, completed: !t.completed } : t
            )
          };
        }
        return wk;
      });

      onUpdateClinicalPlan({
        ...activeClinicalPlan,
        weeks: updatedWeeks
      });
    } else if (activeClinicalPlan.unorganizedTasks) {
      const updatedTasks = activeClinicalPlan.unorganizedTasks.map((t) =>
        t.id === taskToToggle.id ? { ...t, completed: !t.completed } : t
      );
      onUpdateClinicalPlan({
        ...activeClinicalPlan,
        unorganizedTasks: updatedTasks
      });
    }
  };

  // Execute task action linking to existing features
  const handleStartTask = (task: ClinicalPlanTask) => {
    const link = task.linkedFeature || task.category;

    if (link === 'education' || link === 'sleep_education') {
      setShowEducationModal(true);
    } else if (link === 'thoughts' || link === 'cognitive_restructuring') {
      onOpenThoughtModal();
    } else if (link === 'diary' || link === 'sleep_diary' || link === 'stimulus_control') {
      if (onNavigateTab) onNavigateTab('diary');
    } else if (link === 'pmr') {
      if (onOpenPmrModal) onOpenPmrModal();
      else if (onNavigateTab) onNavigateTab('exercises');
    } else if (link === 'breathing') {
      if (onOpenBreathingModal) onOpenBreathingModal();
      else if (onNavigateTab) onNavigateTab('exercises');
    } else if (link === 'exercises' || link === 'relaxation' || link === 'storytelling') {
      if (onNavigateTab) onNavigateTab('exercises');
    } else if (link === 'daytime' || link === 'daytime_activity') {
      if (onNavigateTab) onNavigateTab('daytime');
    } else if (link === 'monitor' || link === 'sleep_monitoring') {
      if (onNavigateTab) onNavigateTab('monitor');
    } else {
      if (selectedWeekNumber) handleToggleTask(task, selectedWeekNumber);
    }
  };

  // Weeks calculation
  const weeksList = activeClinicalPlan?.weeks || [];
  const totalWeeks = weeksList.length || 5;

  const currentWeekObj = weeksList.find(
    (w) => w.weekNumber === selectedWeekNumber
  ) || weeksList[0];

  const currentWeekTasks = currentWeekObj
    ? currentWeekObj.tasks
    : activeClinicalPlan?.unorganizedTasks || [];

  const completedCount = currentWeekTasks.filter((t) => t.completed).length;
  const totalCount = currentWeekTasks.length || 5;

  const otherWeeks = weeksList.filter((w) => w.weekNumber !== selectedWeekNumber);

  return (
    <div className="pb-24 space-y-4 animate-fade-in w-full max-w-lg mx-auto text-left">
      {/* 1. TOP — CBT-I HEADER */}
      <div className="glass-card p-4 flex items-center justify-between border border-purple-200 dark:border-purple-500/20">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {t.headers.cbtiTherapy}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cognitive Behavioral Therapy for Insomnia
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Your Sleep Journey
          </span>
        </div>
      </div>

      {/* 2. MY CBT-I PLAN — PRIMARY SECTION */}
      <section className="glass-card p-4 space-y-3 border border-purple-200 dark:border-purple-500/25 bg-gradient-to-br from-purple-50/60 via-slate-50 to-indigo-50/40 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/30 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            MY CBT-I PLAN
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
              ✓ ACTIVE
            </span>
          </h2>
          {activeClinicalPlan && (
            <button
              onClick={onOpenClinicalPlanModal}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5"
            >
              <span>Manage Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-500/15">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Week {selectedWeekNumber} of {totalWeeks}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {completedCount} / {totalCount} tasks completed
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-500/15">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Target wake-up
            </span>
            <span className="font-bold text-purple-700 dark:text-purple-300">
              {activeClinicalPlan?.wakeUpTarget || '07:00 AM'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-500/15 col-span-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Sleep window
            </span>
            <span className="font-bold text-purple-700 dark:text-purple-300">
              {activeClinicalPlan
                ? `${activeClinicalPlan.sleepWindowStart} – ${activeClinicalPlan.sleepWindowEnd}`
                : '11:30 PM – 07:00 AM'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowThisWeek(!showThisWeek)}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98"
        >
          <span>{showThisWeek ? 'Hide This Week' : 'View This Week'}</span>
          {showThisWeek ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </section>

      {/* 3. CURRENT WEEK ONLY */}
      {showThisWeek && (
        <section className="glass-card p-4 space-y-2.5 border border-purple-200 dark:border-purple-500/20">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>THIS WEEK</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                (Week {selectedWeekNumber})
              </span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {completedCount}/{totalCount} Completed
            </span>
          </div>

          <div className="space-y-2">
            {currentWeekTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                  task.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-700 dark:text-slate-300'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTask(task, selectedWeekNumber)}
                    className="text-purple-600 dark:text-purple-400 shrink-0 hover:scale-110 transition-transform"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                    )}
                  </button>
                  <span
                    className={`text-xs font-bold truncate ${
                      task.completed
                        ? 'line-through text-slate-500 dark:text-slate-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => handleStartTask(task)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-transform active:scale-95 flex items-center gap-1 ${
                    task.completed
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{task.completed ? 'Review' : 'Start'}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. OTHER WEEKS */}
      {otherWeeks.length > 0 && (
        <section className="glass-card p-3.5 space-y-2 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            OTHER WEEKS
          </h3>

          <div className="space-y-1.5">
            {otherWeeks.map((wk) => {
              const wkCompleted = wk.tasks.filter((t) => t.completed).length;
              const isExpanded = expandedOtherWeek === wk.weekNumber;

              return (
                <div
                  key={wk.weekNumber}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/60 dark:bg-slate-800/40"
                >
                  <button
                    onClick={() =>
                      setExpandedOtherWeek(isExpanded ? null : wk.weekNumber)
                    }
                    className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    <span>Week {wk.weekNumber}</span>
                    <div className="flex items-center gap-2 text-slate-500 font-normal">
                      <span>
                        {wkCompleted} / {wk.tasks.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                      {wk.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{task.title}</span>
                          </div>
                          <button
                            onClick={() => handleStartTask(task)}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 text-[11px] font-bold rounded-lg"
                          >
                            Start
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. CLINICAL PLAN DETAILS */}
      <section className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setShowClinicalDetails(!showClinicalDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {showClinicalDetails ? '▾ Clinical Plan Details' : '▸ Clinical Plan Details'}
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            {showClinicalDetails ? 'Collapse' : 'Expand'}
          </span>
        </button>

        {showClinicalDetails && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Clinician:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {activeClinicalPlan?.clinicianName || 'Dr. Sarah Jenkins, MD'}
              </span>
            </div>

            {activeClinicalPlan?.clinicName && (
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Clinic:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeClinicalPlan.clinicName}
                </span>
              </div>
            )}

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Target wake-up time:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {activeClinicalPlan?.wakeUpTarget || '07:00 AM'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">Sleep window:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {activeClinicalPlan
                  ? `${activeClinicalPlan.sleepWindowStart} – ${activeClinicalPlan.sleepWindowEnd}`
                  : '11:30 PM – 07:00 AM'}
              </span>
            </div>

            {activeClinicalPlan?.bedtimeGuidance && (
              <div className="space-y-1 pt-1">
                <span className="text-slate-500 font-medium block">Original instructions:</span>
                <p className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] leading-relaxed italic">
                  "{activeClinicalPlan.bedtimeGuidance}"
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. DROP YOUR THOUGHTS / THOUGHT WORK */}
      <section className="glass-card p-4 space-y-3 border border-purple-200 dark:border-purple-500/20">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            💭 THOUGHT WORK
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Record and reflect on thoughts related to sleep.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenThoughtModal}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Thought</span>
          </button>

          <button
            onClick={() => setGuidedThoughtStep(1)}
            className="flex-1 py-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800 transition-transform active:scale-95"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Guided CBT</span>
          </button>
        </div>

        {/* Previous Thoughts Expandable Section */}
        {savedThoughts.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowPreviousThoughts(!showPreviousThoughts)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <span>Previous Thoughts ({savedThoughts.length})</span>
              {showPreviousThoughts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {showPreviousThoughts && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {savedThoughts.map((tItem) => (
                  <div
                    key={tItem.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        {tItem.emotion || 'Thought'}
                      </span>
                      <span>
                        {new Date(tItem.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="italic text-slate-800 dark:text-slate-200">
                      "{tItem.thoughtText}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 7. CBT-I EDUCATION */}
      <section className="glass-card p-4 space-y-2.5 border border-purple-200 dark:border-purple-500/20">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            📖 CBT-I EDUCATION
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Learn about sleep and CBT-I.
          </p>
        </div>

        <button
          onClick={() => setShowEducationModal(true)}
          className="w-full py-2 bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 text-purple-900 dark:text-purple-200 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5 transition-transform active:scale-98"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Education ({EDUCATION_ARTICLES.length} Modules)</span>
        </button>
      </section>

      {/* 8. AI SUPPORTIVE SUGGESTION */}
      <section className="glass-card p-3.5 space-y-2 border border-purple-200/60 dark:border-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            ✨ AI SUPPORT
          </span>
          <button
            onClick={() => handleSpeak(shortAiTip)}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline bg-purple-100 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-full"
          >
            <Volume2 className="w-3 h-3" />
            <span>{speakingThoughtId === shortAiTip ? 'Stop Audio' : 'Listen'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{shortAiTip}"
        </p>

        <button
          onClick={() => setShowAiMore(!showAiMore)}
          className="text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-0.5 hover:underline"
        >
          <span>{showAiMore ? '▸ Less' : '▸ More'}</span>
        </button>

        {showAiMore && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-purple-100 dark:border-purple-900/40">
            {extendedAiTip}
          </p>
        )}
      </section>

      {/* MODAL: CBT-I EDUCATION LIBRARY */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                CBT-I Sleep Education Library
              </h3>
              <button
                onClick={() => setShowEducationModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {EDUCATION_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500 cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                      {article.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.durationMinutes} min
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: READ ARTICLE */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-600">
                  {selectedArticle.category.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleSpeak(selectedArticle.content, selectedArticle.id)}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                {speakingThoughtId === selectedArticle.id ? 'Stop Audio' : 'Listen Article'}
              </button>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GUIDED CBT THOUGHT REFLECTION */}
      {guidedThoughtStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                Guided CBT Thought Re-framing
              </h3>
              <button
                onClick={() => setGuidedThoughtStep(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            {guidedThoughtStep === 1 && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-purple-600 block">Step 1 of 3: Identify the Thought</span>
                <p className="text-slate-600 dark:text-slate-300">
                  What specific thought is keeping you awake or causing worry?
                </p>
                <textarea
                  value={guidedData.thought}
                  onChange={(e) => setGuidedData({ ...guidedData, thought: e.target.value })}
                  placeholder="e.g. If I don't sleep right now, tomorrow will be ruined..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setGuidedThoughtStep(2)}
                  disabled={!guidedData.thought.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
                >
                  Next Step: Examine Evidence →
                </button>
              </div>
            )}

            {guidedThoughtStep === 2 && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-purple-600 block">Step 2 of 3: Examine Evidence</span>
                <p className="text-slate-600 dark:text-slate-300">
                  What evidence supports this thought, and what evidence goes against it?
                </p>
                <div>
                  <label className="block text-slate-500 mb-1">Evidence Against (What worked in the past?):</label>
                  <textarea
                    value={guidedData.evidenceAgainst}
                    onChange={(e) => setGuidedData({ ...guidedData, evidenceAgainst: e.target.value })}
                    placeholder="e.g. I have survived tough days before after poor sleep and managed to do my tasks..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGuidedThoughtStep(1)} className="px-3 py-2 text-slate-500">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setGuidedData({
                        ...guidedData,
                        balanced:
                          "My body is resting even when I am awake in bed. I have handled challenging days after poor sleep before, and resting calmly helps my brain recharge."
                      });
                      setGuidedThoughtStep(3);
                    }}
                    className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl"
                  >
                    Generate Balanced Thought →
                  </button>
                </div>
              </div>
            )}

            {guidedThoughtStep === 3 && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-emerald-600 block">Step 3 of 3: Balanced Re-framed Perspective</span>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Balanced Perspective:</p>
                  <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{guidedData.balanced}"
                  </p>
                </div>
                <button
                  onClick={() => setGuidedThoughtStep(null)}
                  className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl"
                >
                  Save & Complete Reflection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
