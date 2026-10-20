import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'full' | 'symbol' | 'mono';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  variant = 'full',
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', tagline: 'text-[10px]' },
    lg: { icon: 54, text: 'text-3xl', tagline: 'text-xs' },
    xl: { icon: 72, text: 'text-4xl', tagline: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Dreamora Crescent Moon + Wave Swirl + Star Vector Logo */}
      <svg
        width={dim.icon}
        height={dim.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        {variant === 'mono' ? (
          <>
            {/* Mono version (Deep Navy) */}
            <path
              d="M 50 8 C 73 8 92 27 92 50 C 92 73 73 92 50 92 C 38 92 27 87 20 78 C 35 84 55 80 65 68 C 78 54 75 30 58 18 C 45 10 28 11 16 19 C 25 12 37 8 50 8 Z"
              fill="currentColor"
            />
            <path
              d="M 18 78 C 28 65 42 62 55 68 C 65 73 75 72 82 66 C 72 80 52 86 32 82 C 25 80 20 79 18 78 Z"
              fill="currentColor"
              opacity="0.8"
            />
            {/* Sparkle star */}
            <path
              d="M 44 32 L 46 38 L 52 40 L 46 42 L 44 48 L 42 42 L 36 40 L 42 38 Z"
              fill="currentColor"
            />
          </>
        ) : (
          <>
            {/* Crescent Moon (Deep Navy) */}
            <path
              d="M 50 6 C 74 6 94 26 94 50 C 94 74 74 94 50 94 C 38 94 26 89 18 80 C 35 86 58 82 68 68 C 82 52 78 26 58 14 C 44 8 28 9 16 18 C 26 10 38 6 50 6 Z"
              fill="#1E2255"
            />
            {/* Lavender upper wave swirl */}
            <path
              d="M 16 68 C 22 55 36 50 50 56 C 62 62 74 60 82 52 C 78 68 60 76 44 74 C 32 72 22 72 16 68 Z"
              fill="#A791DE"
            />
            {/* Teal lower wave swirl */}
            <path
              d="M 22 78 C 30 68 44 65 58 70 C 68 74 78 72 85 64 C 77 82 55 88 34 84 C 27 82 23 80 22 78 Z"
              fill="#3FB2BE"
            />
            {/* Golden 4-point Sparkle Star */}
            <path
              d="M 46 28 L 48.5 35.5 L 56 38 L 48.5 40.5 L 46 48 L 43.5 40.5 L 36 38 L 43.5 35.5 Z"
              fill="#F4C77A"
            />
          </>
        )}
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${dim.text}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Dreamora
          </span>
          {showTagline && (
            <span className={`font-medium tracking-widest text-indigo-600/80 dark:text-indigo-400/80 uppercase mt-0.5 ${dim.tagline}`}>
              Sleep Well. Live Well.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
