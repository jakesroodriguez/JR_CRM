import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  VolumeX, 
  Volume2, 
  Clock, 
  Compass, 
  Music, 
  Palette, 
  Play, 
  Pause, 
  Droplet,
  Sun,
  Flame,
  Moon,
  Check,
  Maximize2,
  Minimize2,
  Plus,
  Trash2
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface RelaxZoneProps {
  language: 'ES' | 'EU';
  wallpaper: string;
  setWallpaper: (url: string) => void;
  triggerStatusMessage: (msg: string) => void;
}

const WALLPAPERS = [
  {
    name: { ES: 'Ninguno (Monocromo)', EU: 'Bat ere ez (Monokromoa)' },
    id: 'none',
    url: '',
    preview: 'bg-radial from-slate-900 to-slate-950 border border-slate-700'
  },
  {
    name: { ES: 'Estrellas Cósmicas', EU: 'Izar Kosmikoak' },
    id: 'stars',
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1920&q=80',
    preview: 'bg-[url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=150&q=80")] bg-cover'
  },
  {
    name: { ES: 'Euskal Herria Bosque', EU: 'Baso Lainotsua' },
    id: 'forest',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1920&q=80',
    preview: 'bg-[url("https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=150&q=80")] bg-cover'
  },
  {
    name: { ES: 'Océano Nocturno', EU: 'Ozeano Iluna' },
    id: 'ocean',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=80',
    preview: 'bg-[url("https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=150&q=80")] bg-cover'
  },
  {
    name: { ES: 'Atardecer Minimalista', EU: 'Ilunabar Minimalista' },
    id: 'sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    preview: 'bg-[url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80")] bg-cover'
  }
];

export default function RelaxZone({ language, wallpaper, setWallpaper, triggerStatusMessage }: RelaxZoneProps) {
  const t = TRANSLATIONS[language];

  // --- FLIP CLOCK TIME STATE ---
  const [time, setTime] = useState(new Date());
  const [isFullscreenClock, setIsFullscreenClock] = useState(false);
  const [customWallpapers, setCustomWallpapers] = useState<{ id: string; name: { ES: string; EU: string }; url: string; preview: string }[]>(() => {
    const saved = localStorage.getItem('jr_custom_wallpapers');
    return saved ? JSON.parse(saved) : [];
  });

  const allWallpapers = [
    ...WALLPAPERS,
    ...customWallpapers
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenClock(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hoursStr = time.getHours().toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  // Handler for uploading custom user photos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      triggerStatusMessage(
        language === 'EU' ? 'Irudiak txikiagoa izan behar du (gehienez 2.5MB)' : 'La imagen debe ser de menos de 2.5MB'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      const newCustom = {
        id: `custom-${Date.now()}`,
        name: { ES: file.name.substring(0, 16), EU: file.name.substring(0, 16) },
        url: base64Url,
        preview: `bg-cover`
      };

      const updated = [...customWallpapers, newCustom];
      setCustomWallpapers(updated);
      localStorage.setItem('jr_custom_wallpapers', JSON.stringify(updated));

      // Auto-set as active
      setWallpaper(base64Url);
      localStorage.setItem('jr_relax_wallpaper', base64Url);

      triggerStatusMessage(
        language === 'EU' ? 'Zure argazkia igo da eta ezarri da!' : '¡Tu foto ha sido subida y aplicada como fondo!'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomWallpaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent setting wallpaper as active
    
    // Find if the active wallpaper is the one being deleted
    const target = customWallpapers.find(w => w.id === id);
    const updated = customWallpapers.filter(w => w.id !== id);
    setCustomWallpapers(updated);
    localStorage.setItem('jr_custom_wallpapers', JSON.stringify(updated));

    if (target && wallpaper === target.url) {
      setWallpaper(''); // reset to monochrome
      localStorage.removeItem('jr_relax_wallpaper');
    }

    triggerStatusMessage(
      language === 'EU' ? 'Zure argazkia ezabatu da' : 'Foto eliminada con éxito'
    );
  };

  // --- AUDIO SYNTHESIZER ENGINE (Web Audio API) ---
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  
  // Synthesizer running state triggers
  const [playRain, setPlayRain] = useState(false);
  const [playDrops, setPlayDrops] = useState(false);
  const [playBansgam, setPlayBansgam] = useState(false);

  // Audio nodes cache references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<AudioNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const intervalDropsRef = useRef<NodeJS.Timeout | null>(null);
  const intervalBansgamRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AudioContext lazily
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new CtxClass();
      audioCtxRef.current = ctx;
      setAudioCtx(ctx);
      return ctx;
    }
    // Resume if suspended (browser security constraint)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // 1. Synthesize Constant Rain Sound (Pink Noise style)
  const startRain = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate white & pinkish filter approximations
    let b0 = 0.0, b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0, b5 = 0.0, b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.08; // Volume reduction
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filters to make it sound like rain
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 850;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;

    const gain = ctx.createGain();
    gain.gain.value = 0.65; // Soft ambiance

    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();

    rainNodeRef.current = whiteNoise;
    rainGainRef.current = gain;
  };

  const stopRain = () => {
    if (rainNodeRef.current) {
      try {
        (rainNodeRef.current as any).stop();
      } catch (err) {}
      rainNodeRef.current = null;
    }
    rainGainRef.current = null;
  };

  // 2. Synthesize Water Drops Sound (Sinusoidal triggers)
  const triggerSingleDrop = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Drops are sharp high pitch slides
    const startFreq = 600 + Math.random() * 800;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const startDrops = (ctx: AudioContext) => {
    const loopInterval = () => {
      const delay = 400 + Math.random() * 1200;
      intervalDropsRef.current = setTimeout(() => {
        triggerSingleDrop(ctx);
        loopInterval();
      }, delay);
    };
    loopInterval();
  };

  const stopDrops = () => {
    if (intervalDropsRef.current) {
      clearTimeout(intervalDropsRef.current);
      intervalDropsRef.current = null;
    }
  };

  // 3. Synthesize Bansgam / Hang Drum (Warm, pentatonic resonant notes)
  // Pentatonic scale corresponding frequencies: A2 (110Hz), C3 (130Hz), D3 (146Hz), E3 (164Hz), G3 (196Hz), A3 (220Hz), C4 (261Hz)
  const PENTATONIC = [110, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63];

  const triggerBansgamNote = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    const resonantFilter = ctx.createBiquadFilter();

    const frequency = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];

    // Setup primary oscillator
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Setup harmonic oscillator for hang metallic aura
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(frequency * 3.01, ctx.currentTime); // Slight detuned harmonic

    // Warm resonant high-Q filter
    resonantFilter.type = 'bandpass';
    resonantFilter.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
    resonantFilter.Q.setValueAtTime(6.0, ctx.currentTime);

    // Exponential decay envelopes
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8); // Long tail decay

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(resonantFilter);
    resonantFilter.connect(ctx.destination);

    // Fallback direct path for base frequencies
    const directGain = ctx.createGain();
    directGain.gain.setValueAtTime(0.001, ctx.currentTime);
    directGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    directGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
    osc.connect(directGain);
    directGain.connect(ctx.destination);

    osc.start();
    oscHarmonic.start();
    osc.stop(ctx.currentTime + 4.0);
    oscHarmonic.stop(ctx.currentTime + 4.0);
  };

  const startBansgam = (ctx: AudioContext) => {
    const loopInterval = () => {
      const delay = 2500 + Math.random() * 4000;
      intervalBansgamRef.current = setTimeout(() => {
        triggerBansgamNote(ctx);
        loopInterval();
      }, delay);
    };
    // Trigger initial note
    triggerBansgamNote(ctx);
    loopInterval();
  };

  const stopBansgam = () => {
    if (intervalBansgamRef.current) {
      clearTimeout(intervalBansgamRef.current);
      intervalBansgamRef.current = null;
    }
  };

  // Toggle Handlers
  const toggleRain = () => {
    const ctx = initAudioContext();
    if (playRain) {
      stopRain();
      setPlayRain(false);
    } else {
      startRain(ctx);
      setPlayRain(true);
      triggerStatusMessage(language === 'EU' ? 'Euriaren soinua aktibatuta' : 'Sonido de lluvia activado');
    }
  };

  const toggleDrops = () => {
    const ctx = initAudioContext();
    if (playDrops) {
      stopDrops();
      setPlayDrops(false);
    } else {
      startDrops(ctx);
      setPlayDrops(true);
      triggerStatusMessage(language === 'EU' ? 'Ur-tantak aktibatuta' : 'Sonido de gotas activado');
    }
  };

  const toggleBansgam = () => {
    const ctx = initAudioContext();
    if (playBansgam) {
      stopBansgam();
      setPlayBansgam(false);
    } else {
      startBansgam(ctx);
      setPlayBansgam(true);
      triggerStatusMessage(language === 'EU' ? 'Bansgam / Zen musika aktibatuta' : 'Música Bansgam / Zen activada');
    }
  };

  // Cleanup synthesizer sound-loops on unmount
  useEffect(() => {
    return () => {
      stopRain();
      stopDrops();
      stopBansgam();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn text-[#2C3E50]">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/50">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-[#1B365D] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> {t.relax}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">{t.relaxTitle}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">{t.relaxDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* RETRO VINTAGE FLIP CLOCK - Span 7 */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div className="liquid-glass p-8 rounded-[32px] flex-1 flex flex-col justify-between items-center text-center space-y-6">
            
            {/* Clock Header with Maximize Button */}
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B365D]" />
                {t.flipClockLabel}
              </h3>
              <button
                type="button"
                onClick={() => setIsFullscreenClock(true)}
                className="px-3 py-1.5 bg-[#1B365D]/5 hover:bg-[#1B365D]/10 hover:shadow-2xs text-[#1B365D] rounded-xl flex items-center justify-center transition-all cursor-pointer gap-1.5 text-[10px] font-black uppercase"
                title={language === 'EU' ? 'Zabaldu' : 'Pantalla Completa'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{language === 'EU' ? 'Zabaldu' : 'Ampliar'}</span>
              </button>
            </div>

            {/* Elegant Modern Flat Clock digits matrix */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-10 select-none">
              
              {/* Hours Block */}
              <div className="flex gap-1.5">
                {hoursStr.split('').map((char, index) => (
                  <div key={`h-${index}`} className="w-14 sm:w-18 h-20 sm:h-24 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 flex items-center justify-center shadow-xs">
                    <span className="text-4xl sm:text-5xl font-extrabold text-[#1B365D] dark:text-sky-300 font-sans tracking-tight">
                      {char}
                    </span>
                  </div>
                ))}
              </div>

              <span className="text-3xl sm:text-4xl font-extrabold text-[#1B365D]/40 dark:text-sky-450/40 animate-pulse">:</span>

              {/* Minutes Block */}
              <div className="flex gap-1.5">
                {minutesStr.split('').map((char, index) => (
                  <div key={`m-${index}`} className="w-14 sm:w-18 h-20 sm:h-24 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 flex items-center justify-center shadow-xs">
                    <span className="text-4xl sm:text-5xl font-extrabold text-[#1B365D] dark:text-sky-300 font-sans tracking-tight">
                      {char}
                    </span>
                  </div>
                ))}
              </div>

              <span className="text-3xl sm:text-4xl font-extrabold text-[#1B365D]/40 dark:text-sky-450/40 animate-pulse">:</span>

              {/* Seconds Block */}
              <div className="flex gap-1.5">
                {secondsStr.split('').map((char, index) => (
                  <div key={`s-${index}`} className="w-10 sm:w-14 h-16 sm:h-20 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-200/20 dark:border-indigo-400/15 flex items-center justify-center shadow-xs self-end">
                    <span className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-sans">
                      {char}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            <p className="text-[10px] uppercase font-black tracking-widest text-[#1B365D] bg-[#1B365D]/5 px-3 py-1 rounded-full leading-relaxed">
              {time.toLocaleDateString(language === 'EU' ? 'eu-ES' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Fullscreen Flip Clock Portal Overlay */}
        <AnimatePresence>
          {isFullscreenClock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col justify-between p-8 md:p-12 text-white select-none bg-slate-950 bg-cover bg-center"
              style={{ 
                backgroundImage: wallpaper ? `url(${wallpaper})` : 'none'
              }}
            >
              {/* Top Bar for close */}
              <div className="flex justify-between items-center w-full z-10 bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#F8FAFC]">
                    {language === 'EU' ? 'Pantaila Osorik Ordularia' : 'Reloj en Pantalla Completa'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreenClock(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-slate-800 text-white hover:text-red-400 border border-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                  title={language === 'EU' ? 'Itxi' : 'Salir'}
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{language === 'EU' ? 'Itxi' : 'Cerrar'}</span>
                </button>
              </div>

              {/* Giant Clock digits */}
              <div className="flex-1 flex flex-col justify-center items-center py-6">
                <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 select-none">
                  {/* Hours */}
                  <div className="flex gap-2 sm:gap-3">
                    {hoursStr.split('').map((char, index) => (
                      <div key={`fs-h-${index}`} className="bg-slate-900/60 w-20 sm:w-32 md:w-36 h-28 sm:h-44 md:h-48 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                        <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-none font-sans drop-shadow-lg">
                          {char}
                        </span>
                      </div>
                    ))}
                  </div>

                  <span className="text-4xl sm:text-7xl md:text-8xl font-black text-sky-450 animate-pulse pb-4">:</span>

                  {/* Minutes */}
                  <div className="flex gap-2 sm:gap-3">
                    {minutesStr.split('').map((char, index) => (
                      <div key={`fs-m-${index}`} className="bg-slate-900/60 w-20 sm:w-32 md:w-36 h-28 sm:h-44 md:h-48 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                        <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-none font-sans drop-shadow-lg">
                          {char}
                        </span>
                      </div>
                    ))}
                  </div>

                  <span className="text-2xl sm:text-5xl md:text-6xl font-black text-indigo-400 animate-pulse pb-4 inline-block">:</span>

                  {/* Seconds */}
                  <div className="flex gap-1.5 self-end mb-4">
                    {secondsStr.split('').map((char, index) => (
                      <div key={`fs-s-${index}`} className="bg-indigo-950/60 w-11 sm:w-16 md:w-20 h-16 sm:h-24 md:h-28 rounded-xl border border-indigo-400/20 shadow-2xl flex items-center justify-center overflow-hidden">
                        <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-sky-300 font-sans">
                          {char}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day / Date subtitle */}
                <p className="text-xs sm:text-sm md:text-base font-extrabold tracking-widest text-[#F8FAFC] uppercase bg-slate-900/50 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full mt-10 shadow-md">
                  {time.toLocaleDateString(language === 'EU' ? 'eu-ES' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* Bottom Wallpaper Picker shelf inside Fullscreen mode */}
              <div className="w-full bg-slate-950/60 backdrop-blur-lg border border-white/10 p-4 rounded-3xl flex flex-col gap-3 mt-auto shadow-2xl z-10">
                <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 text-left">
                  {t.wallpaperSelect}
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                  {allWallpapers.map((wall) => {
                    const isActive = wallpaper === wall.url;
                    const isCustom = wall.id.startsWith('custom-');
                    return (
                      <button
                        key={`fs-wp-${wall.id}`}
                        type="button"
                        onClick={() => {
                          setWallpaper(wall.url);
                          localStorage.setItem('jr_relax_wallpaper', wall.url);
                        }}
                        className={`h-14 w-28 rounded-xl overflow-hidden relative border-2 shrink-0 transition-all cursor-pointer text-left ${
                          isActive ? 'border-sky-400 scale-102 shadow-md' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Visual backdrop */}
                        {isCustom ? (
                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wall.url})` }} />
                        ) : (
                          <div className={`absolute inset-0 ${wall.preview}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                          <span className="text-[8px] font-black text-white truncate max-w-full">
                            {wall.name[language]}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute top-1 right-1 bg-sky-450 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[6]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUDIO SYNTHESIZER / SOUND MIXER - Span 5 */}
        <div className="lg:col-span-5">
          <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1B365D] flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-500" />
                {t.relaxSounds}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {language === 'EU' 
                  ? 'Aktibatu eta nahastu soinu natural prozedural desberdinak lasaitzeko.'
                  : 'Enciende y combina diferentes generadores de sonido procedimentales en vivo.'
                }
              </p>
            </div>

            {/* Individual Sound generators */}
            <div className="space-y-4 py-4">
              
              {/* Sound 1: Rain */}
              <div className="flex items-center justify-between p-3.5 bg-white/70 hover:bg-white rounded-[20px] border border-white transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${playRain ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t.soundRain}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Procedural White rain</p>
                  </div>
                </div>

                <button
                  onClick={toggleRain}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                    playRain 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                      : 'bg-white text-slate-600 hover:text-indigo-600 border-slate-200'
                  }`}
                >
                  {playRain ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Sound 2: Water Drops */}
              <div className="flex items-center justify-between p-3.5 bg-white/70 hover:bg-white rounded-[20px] border border-white transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${playDrops ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Droplet className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t.soundDrops}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resonant Splashes</p>
                  </div>
                </div>

                <button
                  onClick={toggleDrops}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                    playDrops 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' 
                      : 'bg-white text-slate-600 hover:text-emerald-600 border-slate-200'
                  }`}
                >
                  {playDrops ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Sound 3: Bansgam / Pentatonic Hang Drum */}
              <div className="flex items-center justify-between p-3.5 bg-white/70 hover:bg-white rounded-[20px] border border-white transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${playBansgam ? 'bg-[#1B365D]/10 text-[#1B365D]' : 'bg-slate-100 text-slate-400'}`}>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{t.soundSynth}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pentatonic Live Generator</p>
                  </div>
                </div>

                <button
                  onClick={toggleBansgam}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                    playBansgam 
                      ? 'bg-[#1B365D] text-white border-[#1B365D]/40 shadow-xs' 
                      : 'bg-white text-slate-600 hover:text-slate-800 border-slate-200'
                  }`}
                >
                  {playBansgam ? 'ON' : 'OFF'}
                </button>
              </div>

            </div>

            {/* Global Stop all button */}
            {(playRain || playDrops || playBansgam) && (
              <button
                onClick={() => {
                  stopRain();
                  stopDrops();
                  stopBansgam();
                  setPlayRain(false);
                  setPlayDrops(false);
                  setPlayBansgam(false);
                  triggerStatusMessage(language === 'EU' ? 'Soinu guztiak generates itzali dira' : 'Generación de ambientes pausados');
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100/60 border border-red-200 text-red-600 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <VolumeX className="w-4 h-4" />
                {language === 'EU' ? 'Isildu soinu guztiak' : 'Silenciar todo'}
              </button>
            )}

            <div className="text-[9px] font-semibold text-slate-400 uppercase text-center mt-2 tracking-wider">
              Procedural Ambiance Engine (Web Audio API)
            </div>
          </div>
        </div>

      </div>

      {/* WALLPAPER SELECTION GALLERY (WIDESCREEN EXPANSION) */}
      <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6">
        <h3 className="text-sm font-extrabold text-[#1B365D] flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          {t.wallpaperSelect}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {allWallpapers.map((wall) => {
            const isActive = wallpaper === wall.url;
            const isCustom = wall.id.startsWith('custom-');
            return (
              <button
                key={wall.id}
                type="button"
                onClick={() => {
                  setWallpaper(wall.url);
                  localStorage.setItem('jr_relax_wallpaper', wall.url);
                  triggerStatusMessage(
                    language === 'EU' ? 'Horma-papera aldatu da!' : '¡Fondo de pantalla cambiado!'
                  );
                }}
                className={`group relative h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                  isActive ? 'border-sky-500 scale-102 shadow-md' : 'border-slate-200/60 hover:scale-102 hover:border-slate-300'
                }`}
              >
                {/* Visual block */}
                {isCustom ? (
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wall.url})` }} />
                ) : (
                  <div className={`absolute inset-0 ${wall.preview}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/10 to-transparent pt-12 p-3 flex items-end">
                  <span className="text-[10px] font-black text-white group-hover:text-sky-300 transition-colors drop-shadow-md truncate">
                    {wall.name[language]}
                  </span>
                </div>

                {/* Check indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-sky-500 text-white p-1 rounded-full shadow-md z-10">
                    <Check className="w-3 h-3 stroke-[4]" />
                  </div>
                )}

                {/* Delete button for custom backgrounds only */}
                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustomWallpaper(wall.id, e)}
                    className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                    title={language === 'EU' ? 'Ezabatu argazkia' : 'Eliminar foto'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            );
          })}

          {/* Native photo upload slot */}
          <label className="group relative h-24 rounded-2xl border-2 border-dashed border-slate-300/80 hover:border-sky-500 hover:bg-sky-50/10 transition-all cursor-pointer flex flex-col items-center justify-center text-center p-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <div className="p-1.5 bg-slate-200/60 text-slate-500 group-hover:text-sky-500 group-hover:bg-sky-100 transition-all rounded-full">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-500 mt-2 group-hover:text-slate-700 select-none">
              {language === 'EU' ? 'Igo Nire Argazkia' : 'Subir Mi Foto'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
