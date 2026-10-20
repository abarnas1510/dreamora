import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  Sparkles,
  Music,
  Mic,
  Moon,
  ChevronRight,
  Sliders,
  Check,
  X,
  History,
  Trees,
  CloudRain,
  Waves,
  Compass
} from 'lucide-react';
import { SLEEP_STORIES } from '../data/storiesData';
import { SleepStory, StoryTag, StoryLengthCategory } from '../types';
import { playAmbientSynth, stopAllAmbientAudio, setSynthVolume } from '../lib/audioSynth';

interface StorytellingRelaxationProps {
  onStoryCompleted?: (storyTitle: string) => void;
  language?: string;
}

export const StorytellingRelaxation: React.FC<StorytellingRelaxationProps> = ({
  onStoryCompleted,
  language
}) => {
  const currentLang = language || localStorage.getItem('dreamora_language') || 'en';
  const [selectedStoryLang, setSelectedStoryLang] = useState<string>(currentLang.slice(0, 2));

  // Sync with prop/localStorage
  useEffect(() => {
    if (language) setSelectedStoryLang(language.slice(0, 2));
  }, [language]);

  const STORY_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ];

  const getStoryTitle = (story: SleepStory, lang: string) => {
    const code = lang.toLowerCase().slice(0, 2) as keyof typeof story.titles;
    return story.titles?.[code] || story.title;
  };

  const getStoryNarrative = (story: SleepStory, lang: string) => {
    const code = lang.toLowerCase().slice(0, 2) as keyof typeof story.narratives;
    return story.narratives?.[code] || story.fullNarrative;
  };
  // Filters
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedLength, setSelectedLength] = useState<string>('All');

  // Player State
  const [activeStory, setActiveStory] = useState<SleepStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);

  // Audio Configuration
  const [audioMode, setAudioMode] = useState<'voice_music' | 'voice_only' | 'music_only'>('voice_music');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Web Speech Voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerRemainingSecs, setTimerRemainingSecs] = useState<number | null>(null);
  const [isTimerPickerOpen, setIsTimerPickerOpen] = useState(false);

  // Favorites & History
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dreamora_favorite_stories');
      return saved ? JSON.parse(saved) : ['story-pines', 'story-lake'];
    } catch {
      return ['story-pines'];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dreamora_recent_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal view for active story player
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  // Refs for audio stop & timers
  const stopAmbientRef = useRef<(() => void) | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const sleepTimerIntervalRef = useRef<number | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const code = currentLang.toLowerCase().slice(0, 2);
        const matchingVoices = voices.filter(v => v.lang.toLowerCase().includes(code));
        setAvailableVoices(matchingVoices.length > 0 ? matchingVoices : voices);

        if (!selectedVoiceURI && voices.length > 0) {
          const calmVoice = matchingVoices[0] || voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen') || v.name.includes('Daniel'))
          ) || voices[0];
          if (calmVoice) setSelectedVoiceURI(calmVoice.voiceURI);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI, currentLang]);

  // Sync volume with synth engine
  useEffect(() => {
    setSynthVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Sleep Timer Countdown Logic
  useEffect(() => {
    if (timerRemainingSecs !== null && timerRemainingSecs > 0 && isPlaying && !isPaused) {
      sleepTimerIntervalRef.current = window.setInterval(() => {
        setTimerRemainingSecs(prev => {
          if (prev !== null && prev <= 1) {
            handlePause();
            setSleepTimerMinutes(null);
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    }

    return () => {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    };
  }, [timerRemainingSecs, isPlaying, isPaused]);

  // Handle Playback Progress
  useEffect(() => {
    if (isPlaying && !isPaused && activeStory) {
      const maxDurationSecs = activeStory.durationMinutes * 60;
      progressTimerRef.current = window.setInterval(() => {
        setProgressSeconds(prev => {
          if (prev >= maxDurationSecs) {
            handleStoryEnded();
            return maxDurationSecs;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, isPaused, activeStory]);

  // Stop all audio & speech synthesis when unmounting / navigating away
  useEffect(() => {
    return () => {
      handleStopAllAudio();
      setIsPlaying(false);
      setIsPaused(false);
    };
  }, []);

  const toggleFavorite = (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId];
      localStorage.setItem('dreamora_favorite_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectStory = (story: SleepStory, autoPlay = true) => {
    // Stop existing playback
    handleStopAllAudio();

    setActiveStory(story);
    setProgressSeconds(0);
    setIsPlayerModalOpen(true);

    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== story.id);
      const updated = [story.id, ...filtered].slice(0, 5);
      localStorage.setItem('dreamora_recent_stories', JSON.stringify(updated));
      return updated;
    });

    if (autoPlay) {
      startStoryAudio(story, audioMode);
    }
  };

  const startStoryAudio = (story: SleepStory, mode: typeof audioMode, langToUse?: string) => {
    handleStopAllAudio();
    setIsPlaying(true);
    setIsPaused(false);

    const activeLang = langToUse || selectedStoryLang || 'en';
    const narrativeText = getStoryNarrative(story, activeLang);

    // 1. Soft Background Music
    if (mode === 'voice_music' || mode === 'music_only') {
      stopAmbientRef.current = playAmbientSynth(story.bgMusicType);
    }

    // 2. Speech Synthesis Narration
    if ((mode === 'voice_music' || mode === 'voice_only') && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrativeText);
      utterance.rate = 0.82; // gentle, slow speech
      utterance.pitch = 0.92;

      const langTagMap: Record<string, string> = {
        en: 'en-US',
        ta: 'ta-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        hi: 'hi-IN',
      };
      const targetTag = langTagMap[activeLang.toLowerCase().slice(0, 2)] || 'en-US';
      utterance.lang = targetTag;

      if (selectedVoiceURI) {
        const found = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (found) utterance.voice = found;
      }

      utterance.onend = () => {
        if (mode === 'voice_only') {
          handleStoryEnded();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    stopAllAmbientAudio();
  };

  const handleResume = () => {
    setIsPaused(false);
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (activeStory) {
      startStoryAudio(activeStory, audioMode);
    }

    if (activeStory && (audioMode === 'voice_music' || audioMode === 'music_only')) {
      stopAmbientRef.current = playAmbientSynth(activeStory.bgMusicType);
    }
  };

  const handleRestart = () => {
    if (!activeStory) return;
    setProgressSeconds(0);
    startStoryAudio(activeStory, audioMode);
  };

  const handleStopAllAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopAllAmbientAudio();
    if (stopAmbientRef.current) {
      stopAmbientRef.current();
      stopAmbientRef.current = null;
    }
  };

  const handleClosePlayerModal = () => {
    handleStopAllAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setIsPlayerModalOpen(false);
  };

  const handleStoryEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
    handleStopAllAudio();
    if (activeStory && onStoryCompleted) {
      onStoryCompleted(activeStory.title);
    }
  };

  const handleNextStory = () => {
    if (!activeStory) return;
    const currentIndex = SLEEP_STORIES.findIndex(s => s.id === activeStory.id);
    const nextIndex = (currentIndex + 1) % SLEEP_STORIES.length;
    handleSelectStory(SLEEP_STORIES[nextIndex], true);
  };

  const handlePrevStory = () => {
    if (!activeStory) return;
    const currentIndex = SLEEP_STORIES.findIndex(s => s.id === activeStory.id);
    const prevIndex = (currentIndex - 1 + SLEEP_STORIES.length) % SLEEP_STORIES.length;
    handleSelectStory(SLEEP_STORIES[prevIndex], true);
  };

  const handleSeek = (newSeconds: number) => {
    setProgressSeconds(newSeconds);
    if (isPlaying && !isPaused && activeStory) {
      // Re-start speech from relative paragraph if possible or keep ambient audio going
    }
  };

  const handleSetSleepTimer = (mins: number | null) => {
    setSleepTimerMinutes(mins);
    setTimerRemainingSecs(mins ? mins * 60 : null);
    setIsTimerPickerOpen(false);
  };

  const handleModeChange = (newMode: 'voice_music' | 'voice_only' | 'music_only') => {
    setAudioMode(newMode);
    if (isPlaying && activeStory) {
      startStoryAudio(activeStory, newMode);
    }
  };

  // Filtered stories
  const filteredStories = SLEEP_STORIES.filter(story => {
    const matchesTag = selectedTag === 'All' || story.tags.includes(selectedTag as StoryTag);
    const matchesLength = selectedLength === 'All' || story.lengthCategory === selectedLength;
    return matchesTag && matchesLength;
  });

  const recentStoryObjects = recentlyPlayed
    .map(id => SLEEP_STORIES.find(s => s.id === id))
    .filter((s): s is SleepStory => s !== undefined);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trees': return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-purple-400" />;
      case 'CloudRain': return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'Waves': return <Waves className="w-5 h-5 text-blue-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-indigo-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section className="p-5 rounded-2xl bg-white/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-500/20 shadow-sm space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Storytelling Relaxation
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
          "Calm bedtime stories with a soft voice"
        </p>
      </div>

      {/* Currently Playing Banner (If story active) */}
      {activeStory && (
        <div
          onClick={() => setIsPlayerModalOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white border border-purple-400/30 shadow-md cursor-pointer flex items-center justify-between group transition-all hover:scale-[1.005]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/30 flex items-center justify-center shrink-0">
              {getStoryIcon(activeStory.iconName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-300">
                  {isPlaying && !isPaused ? 'Playing' : 'Paused'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{getStoryTitle(activeStory, selectedStoryLang)}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && !isPaused) handlePause();
                else handleResume();
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90"
            >
              {isPlaying && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <ChevronRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* Story Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {SLEEP_STORIES.map(story => {
          const title = getStoryTitle(story, selectedStoryLang);

          return (
            <div
              key={story.id}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-purple-100 dark:border-purple-500/15 hover:border-purple-300 dark:hover:border-purple-400/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {title}
                  </h3>
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-md shrink-0">
                    {story.durationMinutes} min
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {story.description}
                </p>
              </div>

              <button
                onClick={() => handleSelectStory(story, true)}
                className="self-start px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Listen
              </button>
            </div>
          );
        })}
      </div>

      {/* FULL-SCREEN / EXPANDED STORY PLAYER MODAL */}
      {isPlayerModalOpen && activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 text-white border border-purple-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 my-auto relative">
            {/* Top Bar: Close + Sleep Timer + Settings */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 rounded-full">
                  📖 Bedtime Story
                </span>
                {sleepTimerMinutes && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timerRemainingSecs ? formatTime(timerRemainingSecs) : `${sleepTimerMinutes}m`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(activeStory.id)}
                  className={`p-2 rounded-full border transition-all ${
                    favorites.includes(activeStory.id)
                      ? 'bg-rose-500/20 border-rose-400 text-rose-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                  title="Favorite Story"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(activeStory.id) ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleClosePlayerModal}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Header & Art */}
            <div className="text-center space-y-2 py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shadow-lg shadow-purple-900/40">
                {getStoryIcon(activeStory.iconName)}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white glow-text">{activeStory.title}</h3>
                <p className="text-xs text-purple-300 font-medium">{activeStory.subtitle}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400">Written by {activeStory.author}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] text-purple-300">{activeStory.durationMinutes} minutes</span>
                </div>
              </div>
            </div>

            {/* Audio Mode Switcher (Voice + Music / Voice Only / Music Only) */}
            <div className="p-1 rounded-2xl bg-white/5 border border-purple-500/20 grid grid-cols-3 gap-1 text-center text-xs">
              <button
                onClick={() => handleModeChange('voice_music')}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  audioMode === 'voice_music'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <Music className="w-3.5 h-3.5" />
                <span className="text-[10px]">Voice + Music</span>
              </button>

              <button
                onClick={() => handleModeChange('voice_only')}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  audioMode === 'voice_only'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="text-[10px]">Voice Only</span>
              </button>

              <button
                onClick={() => handleModeChange('music_only')}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  audioMode === 'music_only'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span className="text-[10px]">Music Only</span>
              </button>
            </div>

            {/* Narrative Scroll Box */}
            <div className="max-h-36 sm:max-h-44 overflow-y-auto p-3.5 rounded-2xl bg-black/30 border border-purple-500/15 text-xs text-purple-100/90 leading-relaxed space-y-2 no-scrollbar text-left font-serif">
              {activeStory.fullNarrative.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={activeStory.durationMinutes * 60}
                value={progressSeconds}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-purple-300 font-mono">
                <span>{formatTime(progressSeconds)}</span>
                <span>{formatTime(activeStory.durationMinutes * 60)}</span>
              </div>
            </div>

            {/* Main Audio Controls */}
            <div className="flex items-center justify-center gap-4 py-1">
              <button
                onClick={handlePrevStory}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                title="Previous Story"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handleRestart}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (isPlaying && !isPaused) handlePause();
                  else handleResume();
                }}
                className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all border border-purple-300/40"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={handleNextStory}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                title="Next Story"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Sleep Timer Trigger */}
              <button
                onClick={() => setIsTimerPickerOpen(!isTimerPickerOpen)}
                className={`p-2.5 rounded-full border transition-all ${
                  sleepTimerMinutes
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                }`}
                title="Sleep Timer"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            {/* Sleep Timer Picker Dropdown / Bar */}
            {isTimerPickerOpen && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-center space-y-2 animate-fade-in">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                  Select Sleep Timer
                </span>
                <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                  {[null, 5, 10, 15, 30, 45, 60].map(mins => (
                    <button
                      key={mins ?? 'off'}
                      onClick={() => handleSetSleepTimer(mins)}
                      className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                        sleepTimerMinutes === mins
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {mins === null ? 'Off' : `${mins} min`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Row: Volume Slider & Voice Assistant Selector */}
            <div className="pt-2 border-t border-purple-500/20 space-y-2">
              <div className="flex items-center gap-3 text-xs text-purple-200">
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(Number(e.target.value));
                  }}
                  className="w-full accent-purple-400 h-1 bg-white/20 rounded-lg"
                />
                <span className="text-[10px] w-8 font-mono">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>

              {/* Voice Selector Option */}
              {availableVoices.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-purple-300 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    Narration Voice:
                  </span>
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => {
                      setSelectedVoiceURI(e.target.value);
                      if (isPlaying && activeStory) {
                        startStoryAudio(activeStory, audioMode);
                      }
                    }}
                    className="bg-slate-900 border border-purple-500/30 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-400 max-w-[200px] truncate"
                  >
                    {availableVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
