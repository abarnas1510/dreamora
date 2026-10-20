import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1800,
}) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#faf6f0] dark:bg-[#05020a] transition-opacity duration-500 select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-xs animate-fade-in">
        {/* Prominent centered Dreamora moon logo */}
        <div className="relative p-4 rounded-3xl bg-white/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-500/20 backdrop-blur-md shadow-xl dark:shadow-purple-950/40">
          <Logo size="xl" showText={false} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dreamora
          </h1>
          <p className="text-xs font-medium text-purple-800/80 dark:text-purple-300/80 uppercase tracking-widest">
            Your journey to better sleep
          </p>
        </div>

        {/* Minimalist loading ring indicator */}
        <div className="pt-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-300/40 dark:border-purple-500/30 border-t-purple-700 dark:border-t-purple-400 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};
