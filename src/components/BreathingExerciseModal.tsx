import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, CheckCircle2, RotateCcw } from 'lucide-react';
import { speakCalmGuidance, stopSpeech } from '../lib/audioSynth';
import { getBreathingPrompts } from '../lib/i18n';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteExercise: (durationMinutes: number, feelingAfter: string) => void;
  language?: string;
}

type Phase = 'In' | 'Hold' | 'Out';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  onCompleteExercise,
  language = 'en'
}) => {
  const prompts = getBreathingPrompts(language);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60);
  const [phase, setPhase] = useState<Phase>('In');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [mode, setMode] = useState<'voice_anim' | 'anim_only' | 'voice_only'>('voice_anim');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedRating, setSelectedEmotion] = useState('😊');

  useEffect(() => {
    if (isOpen) {
      setRemainingSeconds(targetDurationMinutes * 60);
      setIsActive(false);
      setIsCompleted(false);
      setPhase('In');
      setPhaseSeconds(4);
    }
  }, [isOpen, targetDurationMinutes]);

  useEffect(() => {
    let timer: number;
    if (isActive && remainingSeconds > 0) {
      timer = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });

        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            if (phase === 'In') {
              setPhase('Hold');
              if (mode.includes('voice')) speakCalmGuidance(prompts.hold, language);
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Out');
              if (mode.includes('voice')) speakCalmGuidance(prompts.breatheOut, language);
              return 6;
            } else {
              setPhase('In');
              if (mode.includes('voice')) speakCalmGuidance(prompts.breatheIn, language);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, remainingSeconds, phase, mode, language, prompts]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsActive(false);
    }
    return () => {
      stopSpeech();
      setIsActive(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleStart = () => {
    if (!isActive && remainingSeconds > 0) {
      setIsActive(true);
      if (mode.includes('voice')) speakCalmGuidance(prompts.breatheIn, language);
    } else {
      setIsActive(false);
      stopSpeech();
    }
  };

  const handleFinish = () => {
    onCompleteExercise(targetDurationMinutes, selectedRating);
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">🌬️ Breathing Exercise</h2>
            <p className="text-xs text-slate-500">Slow your breathing & settle your mind</p>
          </div>
          <button
            onClick={() => { stopSpeech(); onClose(); }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="py-6 flex flex-col items-center justify-center">
            {/* Duration Selector */}
            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full">
              {[2, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTargetDurationMinutes(mins)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    targetDurationMinutes === mins
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Visual Breathing Circle */}
            <div className="relative w-52 h-52 flex items-center justify-center my-4">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/30 to-teal-400/20 border-2 border-indigo-400/50 transition-all duration-1000 ease-in-out ${
                  isActive
                    ? phase === 'In'
                      ? 'scale-110 blur-none'
                      : phase === 'Hold'
                      ? 'scale-110 brightness-110'
                      : 'scale-75 blur-sm'
                    : 'scale-90 opacity-70'
                }`}
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  {isActive ? (phase === 'In' ? 'Breathe In' : phase === 'Hold' ? 'Hold' : 'Breathe Out') : 'Ready'}
                </span>
                <span className="text-3xl font-light text-slate-900 dark:text-slate-100 font-mono">
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">{phaseSeconds}s</span>
              </div>
            </div>

            {/* Mode Toggles */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setMode('voice_anim')}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
                  mode === 'voice_anim'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <Volume2 className="w-3 h-3" /> Voice + Anim
              </button>
              <button
                onClick={() => setMode('anim_only')}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
                  mode === 'anim_only'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <VolumeX className="w-3 h-3" /> Anim Only
              </button>
            </div>

            {/* Play/Pause Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleStart}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsActive(false);
                  setRemainingSeconds(targetDurationMinutes * 60);
                  stopSpeech();
                }}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="py-8 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Exercise Completed ✓</h3>
            <p className="text-xs text-slate-500 mb-6">How are you feeling now?</p>

            <div className="flex gap-3 mb-6">
              {['😞', '😕', '😐', '🙂', '😊'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmotion(emoji)}
                  className={`text-2xl p-2 rounded-2xl border transition-transform ${
                    selectedRating === emoji ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 scale-125' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Done & Save Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
