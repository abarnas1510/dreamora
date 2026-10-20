import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, RotateCcw, Lightbulb, Shuffle, HelpCircle, Play, Sparkles } from 'lucide-react';
import { QuickGame } from '../types';
import { playToneFeedback } from '../lib/audioSynth';

interface QuickGamesModalProps {
  isOpen: boolean;
  game?: QuickGame | null;
  selectedGame?: QuickGame | null;
  onClose: () => void;
  onCompleteGame?: (gameName: string, feelingAfter: string) => void;
}

// MEMORY MATCH DATA
const MEMORY_CARDS = ['🌙', '⭐', '☁️', '🌊', '🌿', '🧘', '🌙', '⭐', '☁️', '🌊', '🌿', '🧘'];

// WORD CHALLENGE PUZZLES
const WORD_PUZZLES = [
  { word: 'DREAM', hint: 'Visions and feelings during deep sleep' },
  { word: 'SLEEP', hint: 'Restful, essential nightly state' },
  { word: 'PEACE', hint: 'Tranquil, undisturbed state of mind' },
  { word: 'CLOUD', hint: 'Soft, white, floating high in the sky' },
  { word: 'SERENE', hint: 'Quiet, peaceful, and untroubled' }
];

// PATTERN MEMORY PADS
const PATTERN_PADS = [
  { id: 0, label: 'Night Moon', emoji: '🌙', name: 'Purple', bgClass: 'bg-purple-600 dark:bg-purple-700', activeClass: 'bg-purple-300 ring-4 ring-purple-400 scale-105 shadow-[0_0_25px_rgba(168,85,247,0.9)]', freq: 329.63 },
  { id: 1, label: 'Ocean Waves', emoji: '🌊', name: 'Cyan', bgClass: 'bg-cyan-600 dark:bg-cyan-700', activeClass: 'bg-cyan-300 ring-4 ring-cyan-400 scale-105 shadow-[0_0_25px_rgba(6,182,212,0.9)]', freq: 392.00 },
  { id: 2, label: 'Forest Leaf', emoji: '🌿', name: 'Emerald', bgClass: 'bg-emerald-600 dark:bg-emerald-700', activeClass: 'bg-emerald-300 ring-4 ring-emerald-400 scale-105 shadow-[0_0_25px_rgba(16,185,129,0.9)]', freq: 440.00 },
  { id: 3, label: 'Golden Star', emoji: '⭐', name: 'Gold', bgClass: 'bg-amber-500 dark:bg-amber-600', activeClass: 'bg-amber-200 ring-4 ring-amber-300 scale-105 shadow-[0_0_25px_rgba(245,158,11,0.9)]', freq: 523.25 },
];

export const QuickGamesModal: React.FC<QuickGamesModalProps> = ({
  isOpen,
  game,
  selectedGame,
  onClose,
  onCompleteGame
}) => {
  const activeGame = game || selectedGame;

  // Game Type Determination
  const gameType = activeGame?.gameType || (activeGame?.id === 'game-word' ? 'word_challenge' : activeGame?.id === 'game-pattern' ? 'pattern_game' : 'memory_match');

  // Shared State
  const [gameDone, setGameDone] = useState(false);
  const [selectedRating, setSelectedRating] = useState('🙂');

  // --- 1. MEMORY MATCH STATE ---
  const [memoryCards, setMemoryCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // --- 2. WORD CHALLENGE STATE ---
  const [wordLevel, setWordLevel] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; char: string }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [wordStatusText, setWordStatusText] = useState('');
  const [isWordCorrect, setIsWordCorrect] = useState(false);

  // --- 3. PATTERN MEMORY STATE ---
  const [patternRound, setPatternRound] = useState(1);
  const [patternSequence, setPatternSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [patternPhase, setPatternPhase] = useState<'idle' | 'showing' | 'user_turn' | 'error'>('idle');
  const [userStep, setUserStep] = useState(0);
  const showingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset and Initialize Game on Open
  useEffect(() => {
    if (isOpen && activeGame) {
      setGameDone(false);
      setSelectedRating('🙂');

      if (gameType === 'memory_match') {
        const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
        setMemoryCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMemoryMoves(0);
      } else if (gameType === 'word_challenge') {
        setWordLevel(0);
        setupWordLevel(0);
      } else if (gameType === 'pattern_game') {
        initPatternGame();
      }
    }
    return () => {
      if (showingTimeoutRef.current) clearTimeout(showingTimeoutRef.current);
    };
  }, [isOpen, activeGame, gameType]);

  if (!isOpen || !activeGame) return null;

  // ==========================================
  // MEMORY MATCH LOGIC
  // ==========================================
  const handleMemoryCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    playToneFeedback(440 + index * 20, 0.15);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (memoryCards[first] === memoryCards[second]) {
        playToneFeedback(659.25, 0.25);
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === memoryCards.length) {
          setTimeout(() => setGameDone(true), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const restartMemoryGame = () => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMemoryMoves(0);
  };

  // ==========================================
  // WORD CHALLENGE LOGIC
  // ==========================================
  function setupWordLevel(levelIndex: number) {
    const currentPuzzle = WORD_PUZZLES[levelIndex] || WORD_PUZZLES[0];
    const letters = currentPuzzle.word.split('').map((char, id) => ({ id, char }));
    // Shuffle letters
    let shuffled = [...letters].sort(() => Math.random() - 0.5);
    // Ensure it's not identical to answer
    if (shuffled.map((l) => l.char).join('') === currentPuzzle.word && currentPuzzle.word.length > 2) {
      shuffled = shuffled.reverse();
    }
    setScrambledLetters(shuffled);
    setSelectedIndices([]);
    setShowHint(false);
    setWordStatusText('');
    setIsWordCorrect(false);
  }

  const handleSelectLetterTile = (index: number) => {
    if (selectedIndices.includes(index) || isWordCorrect) return;
    playToneFeedback(500 + selectedIndices.length * 50, 0.15);
    setSelectedIndices([...selectedIndices, index]);
  };

  const handleDeselectLetterTile = (positionInSelected: number) => {
    if (isWordCorrect) return;
    const newIndices = [...selectedIndices];
    newIndices.splice(positionInSelected, 1);
    setSelectedIndices(newIndices);
  };

  const handleShuffleWordTiles = () => {
    const shuffled = [...scrambledLetters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setSelectedIndices([]);
  };

  const handleCheckWord = () => {
    const currentPuzzle = WORD_PUZZLES[wordLevel];
    const currentGuess = selectedIndices.map((idx) => scrambledLetters[idx].char).join('');

    if (currentGuess === currentPuzzle.word) {
      playToneFeedback(523.25, 0.2);
      setTimeout(() => playToneFeedback(659.25, 0.3), 150);
      setIsWordCorrect(true);
      setWordStatusText('✨ Perfect! Correct Word!');

      setTimeout(() => {
        if (wordLevel + 1 < WORD_PUZZLES.length) {
          setWordLevel((lvl) => lvl + 1);
          setupWordLevel(wordLevel + 1);
        } else {
          setGameDone(true);
        }
      }, 1200);
    } else {
      playToneFeedback(220, 0.25);
      setWordStatusText('Not quite right. Try rearranging!');
      setTimeout(() => setWordStatusText(''), 2000);
    }
  };

  // ==========================================
  // PATTERN MEMORY LOGIC
  // ==========================================
  function initPatternGame() {
    // Create random 6-step sequence
    const seq = Array.from({ length: 7 }, () => Math.floor(Math.random() * 4));
    setPatternSequence(seq);
    setPatternRound(1);
    setPatternPhase('idle');
    setUserStep(0);
    setActivePad(null);
  }

  const startPatternSequence = (roundNum = patternRound) => {
    setPatternPhase('showing');
    setUserStep(0);
    setActivePad(null);

    const sequenceLength = roundNum + 2; // Round 1: 3 steps, Round 2: 4 steps, etc.
    const stepsToShow = patternSequence.slice(0, sequenceLength);

    let step = 0;
    const playNextStep = () => {
      if (step < stepsToShow.length) {
        const padId = stepsToShow[step];
        setActivePad(padId);
        playToneFeedback(PATTERN_PADS[padId].freq, 0.35);

        showingTimeoutRef.current = setTimeout(() => {
          setActivePad(null);
          step++;
          showingTimeoutRef.current = setTimeout(playNextStep, 250);
        }, 450);
      } else {
        setPatternPhase('user_turn');
      }
    };

    showingTimeoutRef.current = setTimeout(playNextStep, 400);
  };

  const handlePadUserTap = (padId: number) => {
    if (patternPhase !== 'user_turn') return;

    setActivePad(padId);
    playToneFeedback(PATTERN_PADS[padId].freq, 0.25);
    setTimeout(() => setActivePad(null), 200);

    const targetPad = patternSequence[userStep];
    if (padId === targetPad) {
      const nextStep = userStep + 1;
      const roundLength = patternRound + 2;

      if (nextStep === roundLength) {
        // Passed this round!
        playToneFeedback(659.25, 0.3);
        if (patternRound >= 4) {
          // Completed all 4 rounds!
          setTimeout(() => setGameDone(true), 600);
        } else {
          setPatternPhase('idle');
          setPatternRound((r) => r + 1);
          setTimeout(() => {
            startPatternSequence(patternRound + 1);
          }, 800);
        }
      } else {
        setUserStep(nextStep);
      }
    } else {
      // Gentle error handling
      setPatternPhase('error');
      playToneFeedback(180, 0.3);
      setTimeout(() => {
        setPatternPhase('idle');
        startPatternSequence(patternRound);
      }, 1200);
    }
  };

  // Finish Handler
  const handleFinish = () => {
    if (onCompleteGame) {
      onCompleteGame(activeGame.name, selectedRating);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 text-center transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🎮</span>
              <span>{activeGame.name}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeGame.description || 'Short, calm daytime mind engagement'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GAME CONTENT AREA */}
        {!gameDone ? (
          <div className="py-4">
            {/* ==================== 1. MEMORY MATCH ==================== */}
            {gameType === 'memory_match' && (
              <div className="flex flex-col items-center">
                <div className="flex justify-between items-center w-full max-w-xs mb-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>Match serene symbol pairs</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">Moves: {memoryMoves}</span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 w-full max-w-xs mb-5">
                  {memoryCards.map((symbol, idx) => {
                    const isFlipped = flipped.includes(idx) || matched.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMemoryCardClick(idx)}
                        className={`h-16 rounded-xl font-bold text-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                          isFlipped
                            ? 'bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-400 text-slate-900 dark:text-slate-100 scale-100'
                            : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isFlipped ? symbol : '✨'}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={restartMemoryGame}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart Pairs
                </button>
              </div>
            )}

            {/* ==================== 2. WORD CHALLENGE ==================== */}
            {gameType === 'word_challenge' && (
              <div className="flex flex-col items-center space-y-4">
                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{ width: `${((wordLevel + 1) / WORD_PUZZLES.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center w-full text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Puzzle {wordLevel + 1} of {WORD_PUZZLES.length}</span>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Hint'}
                  </button>
                </div>

                {/* Hint panel */}
                {showHint && (
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 font-medium w-full">
                    💡 {WORD_PUZZLES[wordLevel].hint}
                  </div>
                )}

                {/* Answer slots */}
                <div className="flex justify-center gap-2 py-2 min-h-[52px]">
                  {Array.from({ length: WORD_PUZZLES[wordLevel].word.length }).map((_, slotIdx) => {
                    const selectedTileIdx = selectedIndices[slotIdx];
                    const char = selectedTileIdx !== undefined ? scrambledLetters[selectedTileIdx]?.char : '';
                    return (
                      <button
                        key={slotIdx}
                        onClick={() => slotIdx < selectedIndices.length && handleDeselectLetterTile(slotIdx)}
                        className={`w-10 h-12 rounded-xl font-bold text-lg flex items-center justify-center border-2 transition-all ${
                          isWordCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                            : char
                            ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-500 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>

                {/* Status text */}
                {wordStatusText && (
                  <p className={`text-xs font-bold ${isWordCorrect ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-rose-500'}`}>
                    {wordStatusText}
                  </p>
                )}

                {/* Letter tiles palette */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {scrambledLetters.map((tile, idx) => {
                    const isUsed = selectedIndices.includes(idx);
                    return (
                      <button
                        key={tile.id}
                        disabled={isUsed || isWordCorrect}
                        onClick={() => handleSelectLetterTile(idx)}
                        className={`w-10 h-10 rounded-xl font-bold text-base flex items-center justify-center border transition-all ${
                          isUsed
                            ? 'opacity-30 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 scale-95'
                            : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 shadow-xs active:scale-95'
                        }`}
                      >
                        {tile.char}
                      </button>
                    );
                  })}
                </div>

                {/* Game controls */}
                <div className="flex items-center gap-2 pt-2 w-full">
                  <button
                    onClick={handleShuffleWordTiles}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0"
                    title="Shuffle Letters"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedIndices([])}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckWord}
                    disabled={selectedIndices.length !== WORD_PUZZLES[wordLevel].word.length || isWordCorrect}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Check Word
                  </button>
                </div>
              </div>
            )}

            {/* ==================== 3. PATTERN MEMORY ==================== */}
            {gameType === 'pattern_game' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex justify-between items-center w-full text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Round {patternRound} of 4</span>
                  <span className="text-purple-600 dark:text-purple-400">Sequence length: {patternRound + 2}</span>
                </div>

                {/* Status indicator */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full flex items-center justify-center gap-2">
                  {patternPhase === 'showing' && <span className="animate-pulse text-purple-600 dark:text-purple-400">👀 Watch the glowing pattern...</span>}
                  {patternPhase === 'user_turn' && <span className="text-emerald-600 dark:text-emerald-400">👇 Your turn! Repeat the pattern.</span>}
                  {patternPhase === 'error' && <span className="text-rose-500">Almost! Replaying sequence...</span>}
                  {patternPhase === 'idle' && (
                    <button
                      onClick={() => startPatternSequence(patternRound)}
                      className="text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold"
                    >
                      <Play className="w-4 h-4 fill-current" /> Tap to Start Round {patternRound}
                    </button>
                  )}
                </div>

                {/* 4 Colored Glowing Pads */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs py-2">
                  {PATTERN_PADS.map((pad) => {
                    const isActive = activePad === pad.id;
                    return (
                      <button
                        key={pad.id}
                        disabled={patternPhase !== 'user_turn'}
                        onClick={() => handlePadUserTap(pad.id)}
                        className={`h-24 rounded-2xl flex flex-col items-center justify-center text-white transition-all duration-200 shadow-md ${
                          isActive
                            ? pad.activeClass
                            : `${pad.bgClass} opacity-85 hover:opacity-100 hover:scale-[1.02]`
                        }`}
                      >
                        <span className="text-2xl mb-1">{pad.emoji}</span>
                        <span className="text-xs font-bold">{pad.label}</span>
                      </button>
                    );
                  })}
                </div>

                {patternPhase === 'idle' && (
                  <button
                    onClick={() => startPatternSequence(patternRound)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Start Round {patternRound}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ==================== GAME COMPLETE OVERLAY ==================== */
          <div className="py-6 flex flex-col items-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Great Job! {activeGame.name} Completed 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              How are you feeling right now?
            </p>

            {/* Rating chips */}
            <div className="flex gap-2.5 mb-6">
              {['😴', '😐', '🙂', '⚡', '😊'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedRating(emoji)}
                  className={`text-2xl p-2.5 rounded-2xl border transition-all ${
                    selectedRating === emoji
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-950 scale-110 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Finish & Save Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
