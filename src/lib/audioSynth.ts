/**
 * Web Audio API relaxation synth engine for Dreamora.
 * Plays calm, high-quality synthesized ambient audio without external dependencies.
 */

let audioCtx: AudioContext | null = null;
let activeNodes: { stop: () => void }[] = [];
let currentVolume = 0.7;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSynthVolume(volume: number) {
  currentVolume = Math.max(0, Math.min(1, volume));
}

export function playToneFeedback(freq: number, durationSeconds: number = 0.25) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSeconds + 0.05);
  } catch {
    // ignore audio errors
  }
}

export function stopAllAmbientAudio() {
  activeNodes.forEach(node => {
    try {
      node.stop();
    } catch {
      // ignore
    }
  });
  activeNodes = [];
}

export function playAmbientSynth(synthType: string): () => void {
  stopAllAmbientAudio();
  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(currentVolume * 0.5, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let isPlaying = true;
  const localStopFns: (() => void)[] = [];

  const stopFn = () => {
    if (!isPlaying) return;
    isPlaying = false;
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
    setTimeout(() => {
      localStopFns.forEach(fn => fn());
      try {
        masterGain.disconnect();
      } catch {
        // ignore
      }
    }, 1600);
  };

  activeNodes.push({ stop: stopFn });

  if (synthType === 'rain') {
    // Pink noise + lowpass filter for gentle rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();

    localStopFns.push(() => {
      try { whiteNoise.stop(); } catch {}
    });

  } else if (synthType === 'waves' || synthType === 'ocean') {
    // Filtered noise modulated by slow LFO for wave surges
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

    // LFO for wave swelling
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Wave every ~8 seconds

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(masterGain);

    noise.start();
    lfo.start();

    localStopFns.push(() => {
      try { noise.stop(); lfo.stop(); } catch {}
    });

  } else if (synthType === 'piano') {
    // Generative soft ambient pentatonic chords
    const chordNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C D E G A C D E
    let chordTimer: number | null = null;

    const playTone = () => {
      if (!isPlaying) return;
      const note = chordNotes[Math.floor(Math.random() * chordNotes.length)];
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, ctx.currentTime);

      toneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      toneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

      osc.connect(toneGain);
      toneGain.connect(masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 3.6);

      const nextDelay = 1800 + Math.random() * 2500;
      chordTimer = window.setTimeout(playTone, nextDelay);
    };

    playTone();

    localStopFns.push(() => {
      if (chordTimer) clearTimeout(chordTimer);
    });

  } else if (synthType === 'wind' || synthType === 'fireplace' || synthType === 'forest' || synthType === 'ambient') {
    // Soft low drone + resonant sweep
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(masterGain);

    osc1.start();
    osc2.start();

    localStopFns.push(() => {
      try { osc1.stop(); osc2.stop(); } catch {}
    });
  }

  return stopFn;
}

/**
 * Language configuration for 15 BCP-47 supported locales
 */
export const BCP47_LANG_MAP: Record<string, { tag: string; name: string; nativeName: string; greeting: string }> = {
  en: { tag: 'en-US', name: 'English', nativeName: 'English', greeting: "Hello! I'm Dreamora. How are you feeling today?" },
  hi: { tag: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', greeting: "नमस्ते! मैं ड्रीमौरा हूँ। आज आप कैसा महसूस कर रहे हैं?" },
  ta: { tag: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', greeting: "வணக்கம்! நான் Dreamora. இன்று எப்படி இருக்கீங்க?" },
  te: { tag: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', greeting: "నమస్కారం! నేను డ్రీమోరా. ఈ రోజు ఎలా ఉన్నారు?" },
  bn: { tag: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', greeting: "হ্যালো! আমি ড্রিমোরা। আজ আপনার কেমন লাগছে?" },
  mr: { tag: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', greeting: "नमस्कार! मी ड्रीमॉरा आहे. आज तुम्हाला कसे वाटत आहे?" },
  gu: { tag: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', greeting: "નમસ્તે! હું ડ્રીમોરા છું. આજે તમે કેવું અનુભવી રહ્યા છો?" },
  kn: { tag: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', greeting: "ನಮಸ್ಕಾರ! ನಾನು ಡ್ರೀಮೋರಾ. ಇಂದು ಹೇಗಿದ್ದೀರಿ?" },
  ml: { tag: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', greeting: "നമസ്കാരം! ഞാൻ ഡ്യൂമോറ. ഇന്ന് എങ്ങനെയുണ്ട്?" },
  pa: { tag: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਡ੍ਰੀਮੋਰਾ ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?" },
  es: { tag: 'es-ES', name: 'Spanish', nativeName: 'Español', greeting: "¡Hola! Soy Dreamora. ¿Cómo te sientes hoy?" },
  fr: { tag: 'fr-FR', name: 'French', nativeName: 'Français', greeting: "Bonjour ! Je suis Dreamora. Comment vous sentez-vous aujourd'hui ?" },
  de: { tag: 'de-DE', name: 'German', nativeName: 'Deutsch', greeting: "Hallo! Ich bin Dreamora. Wie fühlen Sie sich heute?" },
  zh: { tag: 'zh-CN', name: 'Mandarin', nativeName: '中文', greeting: "你好！我是 Dreamora。你今天感觉怎么样？" },
  ja: { tag: 'ja-JP', name: 'Japanese', nativeName: '日本語', greeting: "こんにちは！Dreamoraです。今日の気分はいかがですか？" },
};

export function getBCP47Tag(langCode: string): string {
  const code = (langCode || 'en').toLowerCase().trim();
  return BCP47_LANG_MAP[code]?.tag || 'en-US';
}

/**
 * Safely split text into natural speech chunks at sentence/punctuation boundaries
 */
export function splitTextIntoChunks(text: string, maxChunkLen = 150): string[] {
  if (!text || !text.trim()) return [];

  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxChunkLen) {
    return [cleaned];
  }

  // Split by sentence termination punctuation: . ! ? । \n
  const rawSentences = cleaned.match(/[^.!?।\n]+[.!?।\n]+/g) || [cleaned];

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + ' ' + trimmed).trim().length <= maxChunkLen) {
      currentChunk = (currentChunk + ' ' + trimmed).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      if (trimmed.length <= maxChunkLen) {
        currentChunk = trimmed;
      } else {
        // Split long sentences by clause punctuation like commas/semicolons/dashes
        const subParts = trimmed.match(/[^,;,，、-]+[,;,，、-]?/g) || [trimmed];
        for (const part of subParts) {
          const partTrimmed = part.trim();
          if (!partTrimmed) continue;

          if ((currentChunk + ' ' + partTrimmed).trim().length <= maxChunkLen) {
            currentChunk = (currentChunk + ' ' + partTrimmed).trim();
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = partTrimmed;
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Find best matching speech voice for locale tag and language code
 */
export function findBestVoiceForLang(
  voices: SpeechSynthesisVoice[],
  targetLangTag: string,
  langCode: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const target = targetLangTag.toLowerCase();
  const primaryCode = langCode.toLowerCase().trim();

  // 1. Exact match (e.g. ta-in === ta-in)
  let match = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === target);

  // 2. Subtag match (e.g. ta-IN matches ta)
  if (!match) {
    match = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(primaryCode));
  }

  // 3. Name or substring match
  if (!match) {
    match = voices.find(
      (v) => v.lang.toLowerCase().includes(primaryCode) || v.name.toLowerCase().includes(primaryCode)
    );
  }

  return match || null;
}

let currentSpeechKeepAliveTimer: any = null;
let activeSpeechCancelFn: (() => void) | null = null;

export interface SpeechOptions {
  speed?: 'slow' | 'normal' | number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onChunkStart?: (chunkIdx: number, totalChunks: number) => void;
  onEnded?: () => void;
  onError?: (err: any) => void;
}

/**
 * Text-to-Speech synthesizer using Web Speech API for calm guidance in chosen language
 */
export function speakCalmGuidance(
  text: string,
  langCode?: string,
  onEnded?: () => void,
  options?: SpeechOptions
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text || !text.trim()) {
      if (onEnded) onEnded();
      resolve();
      return;
    }

    // Always stop previous speech before starting new utterance
    stopSpeech();

    const currentLang = (langCode || localStorage.getItem('dreamora_language') || 'en').toLowerCase().trim();
    const targetLangTag = getBCP47Tag(currentLang);
    const chunks = splitTextIntoChunks(text, 150);

    if (chunks.length === 0) {
      if (onEnded) onEnded();
      resolve();
      return;
    }

    let isCancelled = false;

    // Cancellation handle
    activeSpeechCancelFn = () => {
      isCancelled = true;
      if (currentSpeechKeepAliveTimer) {
        clearInterval(currentSpeechKeepAliveTimer);
        currentSpeechKeepAliveTimer = null;
      }
    };

    // Keep alive timer for Chrome/Safari Web Speech engine
    currentSpeechKeepAliveTimer = setInterval(() => {
      if (!isCancelled && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      }
    }, 3500);

    let chunkIdx = 0;

    const playNextChunk = () => {
      if (isCancelled) {
        if (onEnded) onEnded();
        resolve();
        return;
      }

      if (chunkIdx >= chunks.length) {
        stopSpeech();
        if (onEnded) onEnded();
        resolve();
        return;
      }

      const chunkText = chunks[chunkIdx];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = targetLangTag;

      let rate = 0.88;
      if (options?.speed === 'slow') rate = 0.82;
      else if (options?.speed === 'normal') rate = 0.95;
      else if (typeof options?.speed === 'number') rate = options.speed;

      utterance.rate = rate;
      utterance.pitch = options?.pitch ?? 0.96;
      utterance.volume = options?.volume ?? 0.9;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = findBestVoiceForLang(voices, targetLangTag, currentLang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (chunkIdx === 0 && options?.onStart) {
          options.onStart();
        }
        if (options?.onChunkStart) {
          options.onChunkStart(chunkIdx, chunks.length);
        }
      };

      utterance.onend = () => {
        if (isCancelled) return;
        chunkIdx++;
        setTimeout(() => {
          if (!isCancelled) playNextChunk();
        }, 120);
      };

      utterance.onerror = (e) => {
        console.warn(`TTS error on chunk ${chunkIdx}:`, e);
        if (isCancelled) return;
        chunkIdx++;
        setTimeout(() => {
          if (!isCancelled) playNextChunk();
        }, 100);
      };

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Failed to play speech utterance:', e);
        chunkIdx++;
        playNextChunk();
      }
    };

    playNextChunk();
  });
}

export function stopSpeech() {
  if (activeSpeechCancelFn) {
    activeSpeechCancelFn();
    activeSpeechCancelFn = null;
  }
  if (currentSpeechKeepAliveTimer) {
    clearInterval(currentSpeechKeepAliveTimer);
    currentSpeechKeepAliveTimer = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }
}

export function stopAllVoiceAndAudio() {
  stopSpeech();
  stopAllAmbientAudio();
}
