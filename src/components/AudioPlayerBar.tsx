import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Clock, X, Music } from 'lucide-react';
import { AudioTrack } from '../types';
import { playAmbientSynth, setSynthVolume, stopAllAmbientAudio } from '../lib/audioSynth';

interface AudioPlayerBarProps {
  track: AudioTrack | null;
  onCloseTrack: () => void;
}

const TIMER_OPTIONS = [
  { label: 'No timer', value: 0 },
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ track, onCloseTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number>(0);
  const [timerMinutesLeft, setTimerMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    if (track) {
      setIsPlaying(true);
      playAmbientSynth(track.synthType);
      setProgress(0);
    } else {
      setIsPlaying(false);
      stopAllAmbientAudio();
    }
  }, [track]);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    let timerInterval: number;
    if (isPlaying && selectedTimer > 0) {
      setTimerMinutesLeft(selectedTimer);
      timerInterval = window.setInterval(() => {
        setTimerMinutesLeft((prev) => {
          if (!prev || prev <= 1) {
            setIsPlaying(false);
            stopAllAmbientAudio();
            return null;
          }
          return prev - 1;
        });
      }, 60000);
    } else {
      setTimerMinutesLeft(null);
    }
    return () => clearInterval(timerInterval);
  }, [isPlaying, selectedTimer]);

  if (!track) return null;

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAllAmbientAudio();
    } else {
      setIsPlaying(true);
      playAmbientSynth(track.synthType);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolumeState(newVol);
    setSynthVolume(isMuted ? 0 : newVol);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setSynthVolume(!isMuted ? 0 : volume);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 px-3 py-2.5 bg-slate-950/80 text-white backdrop-blur-2xl border-t border-purple-500/30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Track Icon & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse border border-purple-400/30 shadow-lg shadow-purple-900/50">
            <Music className="w-5 h-5 text-purple-200" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate text-white">{track.title}</h4>
            <p className="text-[10px] text-purple-300 font-semibold truncate">
              {isPlaying ? 'Playing ambient synth' : 'Paused'}
              {timerMinutesLeft ? ` • Timer ${timerMinutesLeft}m left` : ''}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* -10s */}
          <button
            onClick={() => setProgress((p) => Math.max(0, p - 10))}
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/50 transition-all active:scale-95 border border-purple-400/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          {/* +10s */}
          <button
            onClick={() => setProgress((p) => Math.min(100, p + 10))}
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Sleep Timer dropdown */}
          <div className="relative group">
            <button
              className="p-1.5 rounded-full text-slate-400 hover:text-purple-300 transition-colors"
              title="Sleep Timer"
            >
              <Clock className="w-4 h-4" />
            </button>
            <div className="absolute right-0 bottom-8 hidden group-hover:block bg-slate-900/95 border border-purple-500/30 backdrop-blur-xl rounded-xl p-1.5 shadow-2xl whitespace-nowrap z-50">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTimer(opt.value)}
                  className={`block w-full text-left px-3 py-1 text-[11px] rounded-lg transition-colors ${
                    selectedTimer === opt.value ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-purple-500/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mute */}
          <button onClick={toggleMute} className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button onClick={onCloseTrack} className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
