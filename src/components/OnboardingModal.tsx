import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { OnboardingData } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: (data: OnboardingData) => void;
}

const GOAL_OPTIONS = [
  { id: 'understand', label: '😴 Understanding my sleep' },
  { id: 'cbti', label: '🧠 Learning about CBT-I' },
  { id: 'routine', label: '🌙 Building a better sleep routine' },
  { id: 'tracking', label: '📝 Tracking my sleep' },
  { id: 'relaxation', label: '🧘 Relaxation and exercises' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userName,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['cbti', 'routine']);
  const [wakeUpTime, setWakeUpTime] = useState('07:00 AM');
  const [reminders, setReminders] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);

  if (!isOpen) return null;

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleFinish = () => {
    onComplete({
      goals: selectedGoals,
      wakeUpTime,
      sleepDiaryReminders: reminders,
      hasClinicalPlan: hasPlan
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="py-4 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Welcome to Dreamora, {userName} 👋
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We’re here to help you rest better with evidence-based Cognitive Behavioral Therapy for Insomnia (CBT-I).
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 mt-4"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* STEP 2: Goals */}
        {step === 2 && (
          <div className="py-2 space-y-3 text-left">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 text-center">
              What would you like help with?
            </h2>
            <p className="text-[11px] text-slate-500 text-center">Select all that apply:</p>

            <div className="space-y-2">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = selectedGoals.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleGoal(opt.id)}
                    className={`w-full p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl mt-3"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 3: Wake-up time */}
        {step === 3 && (
          <div className="py-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              What time do you usually wake up?
            </h2>
            <p className="text-xs text-slate-500">Keeping a consistent wake-up time builds strong sleep pressure.</p>

            <input
              type="text"
              value={wakeUpTime}
              onChange={(e) => setWakeUpTime(e.target.value)}
              className="w-full p-3 text-center text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />

            <button
              onClick={() => setStep(4)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 4: Reminders */}
        {step === 4 && (
          <div className="py-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Would you like sleep diary reminders?
            </h2>
            <p className="text-xs text-slate-500">A quick morning nudge helps track your progress effortlessly.</p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setReminders(true)}
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  reminders ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200'
                }`}
              >
                Yes, remind me
              </button>
              <button
                onClick={() => setReminders(false)}
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  !reminders ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200'
                }`}
              >
                Not now
              </button>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl mt-3"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 5: Clinical Plan check */}
        {step === 5 && (
          <div className="py-3 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Do you already have a CBT-I treatment plan from a clinician?
            </h2>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setHasPlan(true);
                  handleFinish();
                }}
                className="w-full p-3 rounded-xl border border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 text-xs font-semibold text-left flex justify-between items-center"
              >
                <span>Yes, I have one</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => {
                  setHasPlan(false);
                  handleFinish();
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-left flex justify-between items-center"
              >
                <span>No, not yet</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
