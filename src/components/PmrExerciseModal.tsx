import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, RotateCcw } from 'lucide-react';
import { speakCalmGuidance, stopSpeech } from '../lib/audioSynth';

interface PmrExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteExercise: (durationMinutes: number, feelingAfter: string) => void;
  language?: string;
}

const BODY_AREAS = [
  { id: 'hands', name: 'Hands & Wrists', instruction: 'Clench both fists tightly. Feel the tension in your knuckles and forearms.' },
  { id: 'arms', name: 'Arms & Biceps', instruction: 'Bend your elbows and tense your biceps as if flexing.' },
  { id: 'shoulders', name: 'Shoulders & Neck', instruction: 'Shrug your shoulders up towards your ears softly.' },
  { id: 'face', name: 'Face & Jaw', instruction: 'Scrunch your facial muscles and gently press your teeth together.' },
  { id: 'chest', name: 'Chest & Stomach', instruction: 'Take a deep breath and tighten your abdomen muscles.' },
  { id: 'legs', name: 'Legs & Thighs', instruction: 'Press your knees together and squeeze your thigh muscles.' },
  { id: 'feet', name: 'Feet & Toes', instruction: 'Curl your toes downwards and tighten your feet calves.' },
];

export const PmrExerciseModal: React.FC<PmrExerciseModalProps> = ({
  isOpen,
  onClose,
  onCompleteExercise,
  language = 'en'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<'Tense' | 'Release'>('Tense');
  const [phaseCountdown, setPhaseCountdown] = useState(7); // 7s tense, 10s release
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedRating, setSelectedRating] = useState('😊');

  const currentArea = BODY_AREAS[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setPhase('Tense');
      setPhaseCountdown(7);
      setIsActive(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: number;
    if (isActive && !isCompleted) {
      timer = window.setInterval(() => {
        setPhaseCountdown((prev) => {
          if (prev <= 1) {
            if (phase === 'Tense') {
              setPhase('Release');
              speakCalmGuidance('Now release completely. Feel the warmth and relaxation flow through ' + currentArea.name, language);
              return 10;
            } else {
              // Move to next body area
              if (currentStepIndex < BODY_AREAS.length - 1) {
                const nextIdx = currentStepIndex + 1;
                setCurrentStepIndex(nextIdx);
                setPhase('Tense');
                speakCalmGuidance('Focus on your ' + BODY_AREAS[nextIdx].name + '. Tense gently.', language);
                return 7;
              } else {
                setIsActive(false);
                setIsCompleted(true);
                speakCalmGuidance('Wonderful work. Notice the peaceful relaxation across your entire body.', language);
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, currentStepIndex, isCompleted, currentArea, language]);

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
    if (!isActive) {
      setIsActive(true);
      speakCalmGuidance('Focus on your ' + currentArea.name + '. ' + currentArea.instruction, language);
    } else {
      setIsActive(false);
      stopSpeech();
    }
  };

  const handleFinish = () => {
    onCompleteExercise(10, selectedRating);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">💪 Progressive Muscle Relaxation</h2>
            <p className="text-xs text-slate-500">Guided physical tension release</p>
          </div>
          <button
            onClick={() => { stopSpeech(); onClose(); }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="py-6 flex flex-col items-center">
            {/* Step Counter */}
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              Area {currentStepIndex + 1} of {BODY_AREAS.length}
            </div>

            {/* Human Body Illustration Map */}
            <div className="relative w-48 h-48 bg-indigo-50/50 dark:bg-slate-800/60 rounded-full flex items-center justify-center border border-indigo-100 dark:border-slate-700/80 mb-4 p-4">
              <div className="text-center">
                <span className="text-3xl mb-1 block">
                  {currentArea.id === 'hands' ? '🖐️' : currentArea.id === 'arms' ? '💪' : currentArea.id === 'shoulders' ? '🤷' : currentArea.id === 'face' ? '😌' : currentArea.id === 'chest' ? '🫁' : currentArea.id === 'legs' ? '🦵' : '🦶'}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {currentArea.name}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide transition-all ${
                  phase === 'Tense'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {phase} ({phaseCountdown}s)
                </span>
              </div>
            </div>

            {/* Instruction */}
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mb-6 min-h-[3rem] leading-relaxed">
              {currentArea.instruction}
            </p>

            {/* Controls */}
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
                  setCurrentStepIndex(0);
                  setPhase('Tense');
                  setPhaseCountdown(7);
                  stopSpeech();
                }}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">PMR Session Finished ✓</h3>
            <p className="text-xs text-slate-500 mb-6">How are you feeling now?</p>

            <div className="flex gap-3 mb-6">
              {['😞', '😕', '😐', '🙂', '😊'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedRating(emoji)}
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
            >
              Done & Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
