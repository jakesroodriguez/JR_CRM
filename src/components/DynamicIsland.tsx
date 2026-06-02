import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Radar, 
  Users, 
  Settings, 
  Activity, 
  Music, 
  Pause, 
  Play, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Search, 
  X, 
  Disc,
  Brain,
  Compass,
  Globe
} from 'lucide-react';
import { ActiveTab, SpotifyTrack } from '../types';

interface DynamicIslandProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  statusMessage?: string;
  isProcessing?: boolean;
  language: 'ES' | 'EU';
  setLanguage: (lang: 'ES' | 'EU') => void;
  
  // Spotify integration props
  isPlaying: boolean;
  activeTrack: SpotifyTrack;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentTime: number;
  duration: number;
  seekTrack: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  trackList: SpotifyTrack[];
  onSelectTrack: (track: SpotifyTrack) => void;
}

export default function DynamicIsland({
  activeTab,
  setActiveTab,
  statusMessage,
  isProcessing = false,
  language,
  setLanguage,
  isPlaying,
  activeTrack,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime,
  duration,
  seekTrack,
  volume,
  onVolumeChange,
  trackList,
  onSelectTrack
}: DynamicIslandProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-listen to keyboard 'toggle-spotify' triggers
  useEffect(() => {
    const handleToggleSpotifyEvent = () => {
      setIsMusicExpanded(prev => !prev);
    };
    window.addEventListener('toggle-spotify', handleToggleSpotifyEvent);
    return () => window.removeEventListener('toggle-spotify', handleToggleSpotifyEvent);
  }, []);

  // Real-time debounce fetch querying the live iTunes Search API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = encodeURIComponent(searchQuery.trim());
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=25`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.results) {
            const mapped: SpotifyTrack[] = data.results
              .map((item: any, idx: number) => ({
                id: `itunes-${item.trackId || idx}-${Date.now()}`,
                title: item.trackName || 'Canción Desconocida',
                artist: item.artistName || 'Artista Desconocido',
                album: item.collectionName || 'Álbum',
                coverUrl: item.artworkUrl100 
                  ? item.artworkUrl100.replace('100x100', '300x300') 
                  : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80',
                audioUrl: item.previewUrl || '',
                duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 30
              }))
              .filter((t: any) => t.audioUrl !== ''); // only tracks with playable sound preview url
            setSearchResults(mapped);
          }
        }
      } catch (err) {
        console.error("Error fetching live iTunes search music:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const getActiveState = () => {
    if (isMusicExpanded) return 'music';
    if (isProcessing) return 'processing';
    if (statusMessage) return 'notifying';
    if (!isNavExpanded) return 'collapsed';
    return isHovered ? 'hovered' : 'idle';
  };

  // Convert time to standard mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter tracklist for Spotify inline search
  const filteredTracks = trackList.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Island Variants for motion
  const islandVariants = {
    collapsed: {
      width: '120px',
      height: '38px',
      borderRadius: '19px',
      backgroundColor: '#090D16', // Slate-950/Black OLED
      boxShadow: '0 8px 16px -4px rgba(27, 54, 93, 0.45)',
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    },
    idle: {
      width: '630px', // Comfortably fit all 6 tabs + language toggle
      height: '48px',
      borderRadius: '24px',
      backgroundColor: '#1E293B', // Slate-800
      boxShadow: '0 10px 25px -5px rgba(27, 54, 93, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    },
    hovered: {
      width: '740px',
      height: '54px',
      borderRadius: '27px',
      backgroundColor: '#0F172A', // Slate-900
      boxShadow: '0 20px 30px -10px rgba(27, 54, 93, 0.4), 0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    },
    processing: {
      width: '540px',
      height: '76px',
      borderRadius: '28px',
      backgroundColor: '#1E1B4B', // Indigo-950
      boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.3)',
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    notifying: {
      width: '390px',
      height: '64px',
      borderRadius: '32px',
      backgroundColor: '#1E3A8A', // Deep Blue-900
      boxShadow: '0 20px 35px -5px rgba(27, 54, 93, 0.3)',
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    music: {
      width: '460px',
      height: isSearchMode ? '340px' : '182px',
      borderRadius: '32px',
      backgroundColor: '#09090B', // OLED black
      boxShadow: '0 25px 50px -12px rgba(0, 0, 10, 0.6)',
      transition: { type: 'spring', stiffness: 280, damping: 22 }
    }
  };

  const tabs = [
    { id: 'Dashboard' as ActiveTab, label: language === 'EU' ? 'Arbela' : 'Dashboard', icon: LayoutDashboard },
    { id: 'Captacion' as ActiveTab, label: language === 'EU' ? 'Bilketa' : 'Captación', icon: Radar },
    { id: 'Clientes' as ActiveTab, label: language === 'EU' ? 'Bezeroak' : 'Clientes', icon: Users },
    { id: 'Cerebro' as ActiveTab, label: language === 'EU' ? 'Garuna' : 'Cerebro', icon: Brain },
    { id: 'Relax' as ActiveTab, label: language === 'EU' ? 'Atseden' : 'Relax', icon: Compass },
    { id: 'Ajustes' as ActiveTab, label: language === 'EU' ? 'Ezarpenak' : 'Ajustes', icon: Settings }
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center items-center pointer-events-none">
      <motion.div
        id="dynamic-island"
        className="pointer-events-auto flex flex-col items-center justify-start overflow-hidden border border-white/10 select-none"
        animate={getActiveState()}
        variants={islandVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {isMusicExpanded ? (
            /* ========================================================= */
            /* SPOTIFY EXPANDED DYNAMIC ISLAND                           */
            /* ========================================================= */
            <motion.div
              key="expanded-music-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-4 flex flex-col text-white"
            >
              {/* Header section */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <Music className="w-3 h-3 text-black fill-black" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#1DB954]">Spotify Premium Connect</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSearchMode(!isSearchMode)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                    title="Buscar canciones"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsMusicExpanded(false);
                      setIsSearchMode(false);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Spotify Panel */}
              {!isSearchMode ? (
                <div className="grid grid-cols-12 gap-3 flex-1 items-center">
                  {/* Rotating Cover album art */}
                  <div className="col-span-4 flex justify-center relative group">
                    <motion.div
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      className="w-20 h-20 rounded-full relative overflow-hidden ring-4 ring-[#1DB954]/20 ring-offset-2 ring-offset-black flex-shrink-0"
                    >
                      <img 
                        src={activeTrack.coverUrl} 
                        alt={activeTrack.album} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Central Hole for Vinyl imitation */}
                      <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-black border-2 border-[#1DB954]/50" />
                    </motion.div>
                  </div>

                  {/* Track information & controls */}
                  <div className="col-span-8 flex flex-col justify-between h-full py-0.5">
                    <div className="text-left">
                      <h4 className="text-sm font-bold truncate text-white leading-tight pr-5">{activeTrack.title}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{activeTrack.artist}</p>
                    </div>

                    {/* Timeline slider slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration || activeTrack.duration)}</span>
                      </div>
                      <div className="relative group/bar pt-1 pb-1">
                        <input
                          type="range"
                          min={0}
                          max={duration || activeTrack.duration || 100}
                          value={currentTime}
                          onChange={(e) => seekTrack(Number(e.target.value))}
                          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
                        />
                        <div className="h-1 bg-slate-800 rounded-full w-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1DB954] group-hover/bar:bg-emerald-400 transition-colors rounded-full"
                            style={{ width: `${((currentTime / (duration || activeTrack.duration || 100)) * 100) || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Integrated controls bottom split (Play, skip, volume) */}
                    <div className="flex items-center justify-between mt-1">
                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button onClick={onPrevTrack} className="hover:text-emerald-400 text-slate-300 transition-all cursor-pointer">
                          <SkipBack className="w-4 h-4 fill-current" />
                        </button>
                        <button 
                          onClick={onTogglePlay} 
                          className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-black flex items-center justify-center transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 fill-current text-black" />
                          ) : (
                            <Play className="w-4 h-4 fill-current text-black ml-0.5" />
                          )}
                        </button>
                        <button onClick={onNextTrack} className="hover:text-emerald-400 text-slate-300 transition-all cursor-pointer font-bold">
                          <SkipForward className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      {/* Small Volume Slider */}
                      <div className="flex items-center gap-1.5 w-24">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={volume * 100}
                          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                          className="w-full accent-[#1DB954] cursor-pointer h-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* INTEGRATED TRACK LIST SEARCH                              */
                /* ========================================================= */
                <div className="flex flex-col flex-1 h-full min-h-0 bg-transparent">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-white/10 text-xs py-2 px-9 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                      placeholder="Buscar por artista o título..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Track scrolling element */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1 select-none flex-shrink-0" id="spotify-track-scroller">
                    {isSearching ? (
                      <div className="text-center text-xs text-slate-400 py-8 flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span className="font-extrabold tracking-tight">
                          {language === 'EU' ? 'Abestiak bilatzen...' : 'Buscando canciones reales...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        {(searchQuery.trim() !== '' ? searchResults : trackList).map((track) => {
                          const isCurrent = track.id === activeTrack.id;
                          return (
                            <div
                              key={track.id}
                              onClick={() => {
                                onSelectTrack(track);
                                setIsSearchMode(false);
                              }}
                              className={`p-2 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all ${
                                isCurrent 
                                  ? 'bg-[#1DB954]/20 border border-[#1DB954]/20 text-white' 
                                  : 'hover:bg-white/5 border border-transparent text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img 
                                  src={track.coverUrl} 
                                  alt={track.title} 
                                  className="w-8 h-8 rounded-lg object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="truncate text-xs">
                                  <p className={`font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-slate-100'}`}>
                                    {track.title}
                                  </p>
                                  <p className="text-slate-400 text-[10px] truncate">{track.artist}</p>
                                </div>
                              </div>
                              
                              {isCurrent && isPlaying && (
                                <div className="flex items-center gap-[2px] h-3 pr-2">
                                  {[1, 2, 3].map((bar) => (
                                    <motion.div 
                                      key={bar}
                                      className="w-[2px] bg-[#1DB954] rounded-full"
                                      animate={{ height: [4, 10, 4] }}
                                      transition={{ duration: 0.5 + bar * 0.1, repeat: Infinity }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {(searchQuery.trim() !== '' ? searchResults : trackList).length === 0 && (
                          <div className="text-center text-xs text-slate-500 py-6">
                            {language === 'EU' ? 'Gizarterik ez da aurkitu.' : 'No se encontraron canciones reales.'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : isProcessing ? (
            /* ========================================================= */
            /* PROCESSING HOVER BUBBLE STATE                             */
            /* ========================================================= */
            <motion.div
              key="processing-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4 px-6 w-full h-full text-slate-100"
            >
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest font-mono">BÚSQUEDA ACTIVA</p>
                <p className="text-sm text-white/95 truncate font-medium">Buscando oportunidades en Urretxu & Zumarraga...</p>
              </div>
              <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            </motion.div>
          ) : statusMessage ? (
            /* ========================================================= */
            /* NOTIFICATION ALERTS BANNER BACKGROUND STATE                */
            /* ========================================================= */
            <motion.div
              key="notify-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 px-6 w-full h-full text-white"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs md:text-sm font-semibold text-white/95 flex-1 text-left truncate">{statusMessage}</p>
              <span className="text-[9px] bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0">Listo</span>
            </motion.div>
          ) : !isNavExpanded ? (
            /* ========================================================= */
            /* TOTALLY COMPRESSED PILL STATE                              */
            /* ========================================================= */
            <motion.button
              key="collapsed-state"
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={() => setIsNavExpanded(true)}
              className="w-full h-full flex items-center justify-center gap-1.5 px-3 relative cursor-pointer select-none group"
            >
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-white tracking-widest uppercase font-mono group-hover:text-sky-300 transition-colors">
                JRGRCM
              </span>
            </motion.button>
          ) : (
            /* ========================================================= */
            /* IDLE NAVIGATION BAR MODE (with miniature active wave support) */
            /* ========================================================= */
            <motion.div
              key="nav-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full h-full px-3 relative"
            >
              {/* Miniature wave indicator & button on the right if song is playing */}
              <div className="flex items-center justify-between w-full h-full">
                {/* Logo Home button to collapse the island back to pill */}
                <button
                  type="button"
                  onClick={() => setIsNavExpanded(false)}
                  className="flex items-center justify-center h-7 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black text-sky-450 hover:text-sky-350 tracking-wider uppercase cursor-pointer select-none transition-all mr-1 shrink-0 border border-white/5"
                  title="Comprimir Isla"
                >
                  JRGRCM
                </button>

                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      id={`nav-btn-${tab.id.toLowerCase()}`}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className="relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-300 group cursor-pointer"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute inset-0 bg-white/10 border border-white/10"
                          style={{ borderRadius: '9999px' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <IconComponent
                        className={`h-[16px] w-[16px] transition-transform duration-300 group-hover:scale-110 z-10 ${
                          isActive ? 'text-[#38BDF8]' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <AnimatePresence>
                        {(isActive || isHovered) && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className={`text-xs font-bold z-10 tracking-tight overflow-hidden select-none whitespace-nowrap ${
                              isActive ? 'text-[#38BDF8]' : 'text-slate-300'
                            }`}
                          >
                            {tab.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}

                {/* Language translation quick switcher (Castellano <-> Vasco) */}
                <button
                  id="btn-language-toggle"
                  type="button"
                  onClick={() => {
                    const nextLang = language === 'ES' ? 'EU' : 'ES';
                    setLanguage(nextLang);
                  }}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/20 text-sky-400 hover:text-sky-300 transition-all cursor-pointer text-[10px] font-black tracking-wider uppercase z-10"
                  title="Aldatu hizkuntza / Cambiar idioma"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language}</span>
                </button>

                {/* Spotify quick hub bubble icon widget inside simple layout */}
                <div className="h-8 border-l border-white/10 mx-1"></div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="spotify-island-quick-control"
                    onClick={() => setIsMusicExpanded(true)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black border border-white/5 hover:border-[#1DB954]/50 transition-all cursor-pointer group"
                    title="Controlar Spotify"
                  >
                    {/* Tiny vinyl rotation */}
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full bg-cover relative flex items-center justify-center flex-shrink-0"
                      style={{ backgroundImage: `url(${activeTrack.coverUrl})` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-black border border-[#1DB954]" />
                    </motion.div>

                    {/* Integrated audio bars equalizer */}
                    <div className="h-3 flex items-center gap-[1.5px] pr-0.5">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-[1.5px] bg-[#1DB954] rounded-full"
                          animate={isPlaying ? { height: [3, 10, 3] } : { height: 3 }}
                          transition={{ duration: 0.5 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
