import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Brain, Moon, Calendar, Sun, CheckCircle2, RefreshCw, VolumeX, Settings2, Send, AlertCircle, MessageSquare } from 'lucide-react';
import { UserPreferences, ThoughtEntry, SleepDiaryEntry } from '../types';
import { speakCalmGuidance, stopSpeech, BCP47_LANG_MAP } from '../lib/audioSynth';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'listening_wait';

export interface VoiceCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  preferences: UserPreferences;
  onUpdatePreferences?: (prefs: Partial<UserPreferences>) => void;
  onSaveThought?: (entry: { thoughtText: string; emotion?: string }) => void;
  onSaveSleepDiary?: (entry: { bedtime?: string; wakeTime?: string; numberOfAwakenings?: number }) => void;
  onOpenExercise?: (exerciseType: string) => void;
  targetWakeTime?: string;
  recentAwakenings?: number;
}

const SUPPORTED_VOICE_LANGS = Object.entries(BCP47_LANG_MAP).map(([code, info]) => {
  const langInfo = info as { tag: string; name: string; nativeName: string; greeting: string };
  return {
    code,
    label: langInfo.nativeName !== langInfo.name ? `${langInfo.nativeName} (${langInfo.name})` : langInfo.name,
    speechTag: langInfo.tag,
    greeting: langInfo.greeting
  };
});



export const VoiceCompanionModal: React.FC<VoiceCompanionModalProps> = ({
  isOpen,
  onClose,
  userName,
  preferences,
  onUpdatePreferences,
  onSaveThought,
  onSaveSleepDiary,
  onOpenExercise,
  targetWakeTime = '07:00 AM',
  recentAwakenings = 0
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [dreamoraReply, setDreamoraReply] = useState<string>('');
  const [activeLang, setActiveLang] = useState<string>(preferences.voiceLanguage || preferences.language || 'en');
  const [detectedActionInfo, setDetectedActionInfo] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  // Time of day calculation
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'daytime';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const getLangObj = (code: string) => {
    return SUPPORTED_VOICE_LANGS.find((l) => l.code === code) || SUPPORTED_VOICE_LANGS[1];
  };

  useEffect(() => {
    isComponentMounted.current = true;

    // Listen for speech synthesis voices
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      isComponentMounted.current = false;
      stopSpeech();
      stopRecognition();
    };
  }, []);

  // When modal opens, initialize with initial greeting; when closed, stop speech/recognition
  useEffect(() => {
    if (isOpen) {
      setMicError(null);
      const langObj = getLangObj(activeLang);
      setDreamoraReply(langObj.greeting);
    } else {
      stopSpeech();
      stopRecognition();
      setVoiceState('idle');
    }
    return () => {
      stopSpeech();
      stopRecognition();
    };
  }, [isOpen, activeLang]);

  // Sync language with preferences
  useEffect(() => {
    if (preferences.voiceLanguage) {
      setActiveLang(preferences.voiceLanguage);
    } else if (preferences.language) {
      setActiveLang(preferences.language);
    }
  }, [preferences.voiceLanguage, preferences.language]);

  // Clean stop of synthesis
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Clean stop of recognition
  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  // Speak response using Web Speech Synthesis with full multi-sentence chunking
  const speakText = (text: string, onEnded?: () => void) => {
    stopSpeech();
    if (isComponentMounted.current) setVoiceState('speaking');

    speakCalmGuidance(
      text,
      activeLang,
      () => {
        if (isComponentMounted.current) {
          setVoiceState('listening_wait');
          if (onEnded) onEnded();
        }
      },
      {
        speed: preferences.voiceSpeed || 'slow',
        volume: (preferences.voiceVolume ?? 90) / 100,
        onStart: () => {
          if (isComponentMounted.current) setVoiceState('speaking');
        }
      }
    );
  };

  // Start Speech Recognition
  const startListening = () => {
    setMicError(null);
    stopSpeech();
    stopRecognition();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use the text input below.');
      setVoiceState('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      const langObj = getLangObj(activeLang);
      recognition.lang = langObj.speechTag;

      let finalTranscript = '';

      recognition.onstart = () => {
        if (isComponentMounted.current) {
          setVoiceState('listening');
          setTranscript('');
        }
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (isComponentMounted.current) {
          setTranscript(finalTranscript || interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (isComponentMounted.current) {
          setVoiceState('idle');
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            setMicError('Microphone access was denied. Please allow microphone permissions or type your message below.');
          } else if (event.error === 'no-speech') {
            setMicError('No speech was detected. Please try tapping the microphone again or type below.');
          } else if (event.error === 'audio-capture') {
            setMicError('No microphone was found. You can type your message below.');
          } else {
            setMicError(`Voice error: ${event.error}. You can type your message below.`);
          }
        }
      };

      recognition.onend = () => {
        if (!isComponentMounted.current) return;
        const spokenText = finalTranscript.trim();
        if (spokenText.length > 0) {
          handleUserSpeech(spokenText);
        } else {
          setVoiceState('idle');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setMicError('Could not start microphone. You can type your message below.');
      setVoiceState('idle');
    }
  };

  // Process User Speech or Typed Text through server API
  const handleUserSpeech = async (speechText: string) => {
    if (!speechText || !speechText.trim()) return;

    setVoiceState('thinking');
    setTranscript(speechText);
    setDetectedActionInfo(null);
    setMicError(null);

    const tod = getTimeOfDay();
    const contextPayload = {
      userName,
      timeOfDay: tod,
      localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetWakeTime,
      recentAwakenings
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/ai/voice-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userSpeech: speechText,
          language: activeLang,
          context: contextPayload
        })
      });

      clearTimeout(timeoutId);

      let reply = "I am listening. How can I help support your rest?";
      let data: any = {};

      if (res.ok) {
        data = await res.json();
        reply = data.responseText || reply;
      }

      setDreamoraReply(reply);

      // Execute detected action (save thought / save sleep diary / recommend exercise)
      if (data.detectedAction === 'save_thought' && data.extractedData?.thoughtText) {
        if (onSaveThought) {
          onSaveThought({
            thoughtText: data.extractedData.thoughtText,
            emotion: data.extractedData.emotion || 'Sleep Concern'
          });
        }
        setDetectedActionInfo('💭 Saved to Drop Your Thoughts');
      } else if (data.detectedAction === 'save_sleep_diary') {
        if (onSaveSleepDiary) {
          onSaveSleepDiary({
            bedtime: data.extractedData?.bedtime || '11:00 PM',
            wakeTime: data.extractedData?.wakeTime || '07:00 AM',
            numberOfAwakenings: data.extractedData?.awakenings ?? 2
          });
        }
        setDetectedActionInfo('📑 Recorded in Sleep Diary');
      } else if (data.detectedAction === 'recommend_exercise') {
        setDetectedActionInfo('🧘 Exercise Recommendation Ready');
      }

      // Speak response once, then STOP & WAIT
      speakText(reply);

    } catch (err) {
      console.error('Voice processing error:', err);
      const fallbackReply = "I am here with you. Feel free to tell me what is on your mind.";
      setDreamoraReply(fallbackReply);
      speakText(fallbackReply);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      const query = textInput.trim();
      setTextInput('');
      handleUserSpeech(query);
    }
  };

  // Activate session by tapping microphone or toggle
  const handleActivate = () => {
    if (voiceState === 'speaking') {
      stopSpeech();
      setVoiceState('listening_wait');
      return;
    }
    if (voiceState === 'listening') {
      stopRecognition();
      setVoiceState('idle');
      return;
    }
    startListening();
  };

  const handleLanguageChange = (code: string) => {
    setActiveLang(code);
    if (onUpdatePreferences) {
      onUpdatePreferences({ voiceLanguage: code, language: code });
    }
  };

  if (!isOpen) return null;

  const currentLang = getLangObj(activeLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-white relative overflow-hidden max-h-[92vh] flex flex-col justify-between">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                Dreamora Voice
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30 font-semibold">
                  AI Companion
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Calm CBT-I Voice Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Quick Selector */}
            <select
              value={activeLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-purple-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
            >
              {SUPPORTED_VOICE_LANGS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Voice Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                stopSpeech();
                stopRecognition();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Settings Panel (Collapsible) */}
        {showVoiceSettings && (
          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 text-xs animate-fade-in relative z-10 shrink-0">
            <span className="font-bold text-purple-300 block">Voice Assistant Controls</span>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Voice Speed</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onUpdatePreferences?.({ voiceSpeed: 'slow' })}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    preferences.voiceSpeed === 'slow' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Slow (Meditative)
                </button>
                <button
                  onClick={() => onUpdatePreferences?.({ voiceSpeed: 'normal' })}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                    preferences.voiceSpeed !== 'slow' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  Normal
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Preview Voice Output</span>
              <button
                onClick={() => speakText(currentLang.greeting)}
                className="px-3 py-1 bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Test Voice
              </button>
            </div>
          </div>
        )}

        {/* Scrollable conversation body */}
        <div className="overflow-y-auto space-y-4 pr-1 relative z-10 flex-grow">
          {/* Mic error notice if any */}
          {micError && (
            <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{micError}</p>
              </div>
            </div>
          )}

          {/* Center Orb & Visual Voice State */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3 relative">
            <div className="relative flex items-center justify-center">
              {/* Pulsing rings based on state */}
              {voiceState === 'listening' && (
                <div className="absolute w-28 h-28 rounded-full bg-purple-500/30 animate-ping pointer-events-none" />
              )}
              {voiceState === 'speaking' && (
                <div className="absolute w-28 h-28 rounded-full bg-indigo-500/30 animate-pulse pointer-events-none" />
              )}
              {voiceState === 'thinking' && (
                <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-spin pointer-events-none border border-dashed border-emerald-400/40" />
              )}

              <button
                type="button"
                onClick={handleActivate}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                  voiceState === 'listening'
                    ? 'bg-rose-600 text-white shadow-rose-900/50 scale-105'
                    : voiceState === 'speaking'
                    ? 'bg-indigo-600 text-white shadow-indigo-900/50 animate-bounce'
                    : voiceState === 'thinking'
                    ? 'bg-purple-700 text-white opacity-80'
                    : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-400 text-white hover:scale-105 shadow-purple-900/50'
                }`}
                title="Tap to speak"
              >
                {voiceState === 'listening' ? (
                  <Mic className="w-8 h-8 animate-pulse" />
                ) : voiceState === 'speaking' ? (
                  <Volume2 className="w-8 h-8" />
                ) : voiceState === 'thinking' ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status Label Banner */}
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                {voiceState === 'idle' && 'Tap Mic or Type Below'}
                {voiceState === 'listening' && 'Listening…'}
                {voiceState === 'thinking' && 'Thinking…'}
                {voiceState === 'speaking' && 'Dreamora is speaking…'}
                {voiceState === 'listening_wait' && 'Listening for you…'}
              </span>

              <p className="text-xs font-medium text-slate-300">
                {voiceState === 'idle' && `Speak or type in ${currentLang.label}`}
                {voiceState === 'listening' && `Listening in ${currentLang.label}...`}
                {voiceState === 'thinking' && `Processing intent & context...`}
                {voiceState === 'speaking' && `Speaking response...`}
                {voiceState === 'listening_wait' && `Dreamora is waiting for your next turn`}
              </p>
            </div>
          </div>

          {/* Display Transcribed User Speech */}
          {transcript && (
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 space-y-1 text-xs animate-fade-in">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">You Said</span>
              <p className="text-slate-200 italic font-medium">"{transcript}"</p>
            </div>
          )}

          {/* Display Dreamora Response */}
          {dreamoraReply && (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Dreamora Companion
                </span>
                {voiceState === 'speaking' && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-lg text-slate-300 flex items-center gap-1"
                  >
                    <VolumeX className="w-3 h-3" />
                    Stop Voice
                  </button>
                )}
              </div>
              <p className="text-slate-100 font-medium leading-relaxed">{dreamoraReply}</p>

              {/* Action Badge if auto-saved */}
              {detectedActionInfo && (
                <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {detectedActionInfo}
                </div>
              )}
            </div>
          )}

          {/* Action Prompt when Exercise is Recommended */}
          {detectedActionInfo?.includes('Exercise') && onOpenExercise && (
            <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl flex items-center justify-between text-xs animate-fade-in">
              <span className="text-indigo-200 font-medium">Would you like to start Storytelling Relaxation now?</span>
              <button
                type="button"
                onClick={() => {
                  onOpenExercise('Storytelling Relaxation');
                  onClose();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md text-xs"
              >
                Start Story
              </button>
            </div>
          )}

          {/* Quick Prompts Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Try asking:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleUserSpeech("I woke up twice last night")}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 rounded-xl text-[11px] text-slate-300 hover:text-white transition-all text-left"
              >
                "I woke up twice last night"
              </button>
              <button
                type="button"
                onClick={() => handleUserSpeech("I feel worried about sleeping tonight")}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 rounded-xl text-[11px] text-slate-300 hover:text-white transition-all text-left"
              >
                "I feel worried about sleeping"
              </button>
              <button
                type="button"
                onClick={() => handleUserSpeech("Recommend a relaxation exercise")}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 rounded-xl text-[11px] text-slate-300 hover:text-white transition-all text-left"
              >
                "Recommend a relaxation exercise"
              </button>
            </div>
          </div>
        </div>

        {/* Text Input Bar & Action Controls */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2 relative z-10 shrink-0">
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Type a message in ${currentLang.label}...`}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 transition-colors pr-8"
              />
              <MessageSquare className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={!textInput.trim() || voiceState === 'thinking'}
              className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl shadow-md transition-all shrink-0 flex items-center justify-center"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleActivate}
              className={`p-2.5 rounded-2xl text-white font-bold transition-all shrink-0 flex items-center justify-center ${
                voiceState === 'listening'
                  ? 'bg-rose-600 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
              title={voiceState === 'listening' ? 'Stop listening' : 'Start microphone'}
            >
              {voiceState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
