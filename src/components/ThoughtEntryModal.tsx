import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, CheckCircle2, Mic, MicOff, Volume2, VolumeX, Brain } from 'lucide-react';
import { ThoughtEntry } from '../types';
import { speakCalmGuidance, stopSpeech } from '../lib/audioSynth';
import { getTranslations } from '../lib/i18n';

interface ThoughtEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveThought: (thought: ThoughtEntry) => void;
  language?: string;
}

const EMOTION_OPTIONS = [
  { emoji: '😞', label: 'Worried', color: 'hover:bg-amber-100 dark:hover:bg-amber-900/40' },
  { emoji: '😟', label: 'Anxious', color: 'hover:bg-orange-100 dark:hover:bg-orange-900/40' },
  { emoji: '😐', label: 'Neutral', color: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  { emoji: '🙂', label: 'Hopeful', color: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40' },
  { emoji: '😊', label: 'Calm', color: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40' },
];

export const ThoughtEntryModal: React.FC<ThoughtEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveThought,
  language = 'en'
}) => {
  const t = getTranslations(language);
  const [thoughtText, setThoughtText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('Anxious');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Voice Input Speech Recognition
  const handleToggleVoiceInput = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported by your current browser. You can type your thought directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      const speechLangMap: Record<string, string> = {
        en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN',
        mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
        es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP'
      };
      recognition.lang = speechLangMap[language] || 'en-US';

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.onerror = () => setIsListeningVoice(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setThoughtText(prev => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const handleGenerateReflection = async () => {
    if (!thoughtText.trim()) return;
    setIsGeneratingAi(true);
    setAiReflection(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/ai/thought-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          thoughtText,
          emotion: selectedEmotion,
          language
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reflectionText = data.reflection || data.balancedPerspective ||
        `It's understandable to feel ${selectedEmotion.toLowerCase()} right now. Thoughts about sleep often multiply when we lie awake, but resting quietly without pressure still restores your body's energy.`;
      setAiReflection(reflectionText);
    } catch {
      setAiReflection(
        `It sounds like this thought is creating tension. Remember that thoughts are mental events rather than absolute predictions. Giving yourself permission to rest without forcing sleep is a gentle way forward.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsSpeaking(false);
    }
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [isOpen]);

  const handleSpeakReflection = () => {
    if (!aiReflection) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      stopSpeech();
      setIsSpeaking(true);
      speakCalmGuidance(aiReflection, language, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleSave = () => {
    if (!thoughtText.trim()) return;

    const newThought: ThoughtEntry = {
      id: 'thought-' + Date.now(),
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      thoughtText,
      emotion: selectedEmotion,
      emotionIntensity: 6,
      aiReflection: aiReflection || undefined
    };

    onSaveThought(newThought);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setThoughtText('');
      setAiReflection(null);
      stopSpeech();
      setIsSpeaking(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 transition-all my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.headers.dropThoughts}
              </h2>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                {t.headers.whatIsOnYourMind}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Thought Saved</h3>
            <p className="text-xs text-slate-500 mt-1">Your reflection is safely stored in your CBT-I journal.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Input Label & Textarea + Voice Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.headers.whatIsOnYourMind}
                </label>

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    isListeningVoice
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md'
                      : 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 hover:bg-purple-200'
                  }`}
                  title="Voice Input Dictation"
                >
                  {isListeningVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListeningVoice ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="Write your sleep thoughts, worries, or feelings here without judgment..."
                rows={4}
                className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Emotion Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                How does this thought make you feel?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {EMOTION_OPTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedEmotion(item.label)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                      selectedEmotion === item.label
                        ? 'border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 font-bold ring-2 ring-purple-500/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 ' + item.color
                    }`}
                  >
                    <span className="text-xl mb-0.5">{item.emoji}</span>
                    <span className="text-[10px] whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflect Action Button & AI Response Box */}
            {aiReflection ? (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900 dark:text-purple-200">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    CBT-I Gentle Reflection
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={handleSpeakReflection}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      isSpeaking
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-purple-200 dark:bg-purple-500/30 text-purple-900 dark:text-purple-200 border-purple-300 hover:bg-purple-300'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop' : t.buttons.listen}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-purple-100/90 leading-relaxed font-sans">
                  {aiReflection}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateReflection}
                disabled={!thoughtText.trim() || isGeneratingAi}
                className="w-full py-2.5 px-4 rounded-2xl border border-purple-300 dark:border-purple-500/40 bg-purple-100/80 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {isGeneratingAi ? 'Reflecting quietly...' : t.headers.reflectOnThought}
              </button>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                {t.buttons.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!thoughtText.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {t.buttons.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

