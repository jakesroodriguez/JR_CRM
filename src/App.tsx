import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Star, Calendar, RefreshCcw, Heart, Globe, User, ShieldCheck, Key, LogOut, X, Camera } from 'lucide-react';
import { Project, ActiveTab, AppSettings, Lead, SpotifyTrack } from './types';
import DynamicIsland from './components/DynamicIsland';
import Dashboard from './components/Dashboard';
import Captacion from './components/Captacion';
import MisClientes from './components/MisClientes';
import Ajustes from './components/Ajustes';
import GoogleLogin from './components/GoogleLogin';
import SegundoCerebro from './components/SegundoCerebro';
import RelaxZone from './components/RelaxZone';
import { TRANSLATIONS } from './data/translations';

interface GoogleUser {
  name: string;
  email: string;
  photoUrl: string;
}

// Curated high quality tracks from SoundHelix to make the music playback be 100% real
const SPOTIFY_TRACKS: SpotifyTrack[] = [
  {
    id: 'track-1',
    title: 'La Flaca',
    artist: 'Jarabe de Palo',
    album: 'La Flaca',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372
  },
  {
    id: 'track-2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=150&h=150&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 423
  },
  {
    id: 'track-3',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'Vida',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&h=150&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 302
  },
  {
    id: 'track-4',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=150&h=150&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 318
  }
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
];

// Empty list since user requested all invented client/project data be removed
const INITIAL_PROJECTS: Project[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  googleAppsScriptUrl: '',
  devName: 'Jon',
  gmailTemplateDiseno:
    'Kaixo!\n\nTe escribo para comentarte que la estructura preliminar de vuestra web para {COMERCIO} ya está finalizada. Hemos fijado el dominio provisional en {DOMINIO} para que puedas visualizar la arquitectura básica.\n\nHe cargado los colores corporativos y la distribución funcional que acordamos. Ahora me encuentro perfilando la fase de Diseño Creativo, donde añadiré imágenes y animaciones interactivas.\n\nEcha un vistazo a este enlace provisional y me dices qué opiniones tienes. Nuestra fecha estimada de entrega sigue en pie para el {FECHA_ENTREGA}.\n\nUn abrazo,\n{DEV_NAME}',
  gmailTemplateEntrega:
    'Kaixo!\n\nMe alegra mucho comunicarte que la página web de {COMERCIO} está 100% terminada, probada y desplegada bajo el dominio oficial {DOMINIO}! 🎉\n\nEstá perfectamente optimizada para dispositivos móviles (revisada en múltiples tabletas y teléfonos), carga a máxima velocidad y todas las integraciones (fichas del sector, llamadas de un toque y mapas de dirección) operan de forma perfecta.\n\nTe adjunto la factura definitiva por valor de {PRECIO}, tal y como acordamos. Ha sido un auténtico placer ayudarte a digitalizar y escalar tu negocio.\n\nQuedo a tu total disposición para cualquier consulta de soporte.\n\nUn afectuoso saludo,\n{DEV_NAME}',
  keyboardShortcutsEnabled: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dashboard');
  const [language, setLanguage] = useState<'ES' | 'EU'>(() => {
    const saved = localStorage.getItem('jr_crm_language');
    return (saved === 'EU' || saved === 'ES') ? (saved as 'ES' | 'EU') : 'ES';
  });
  const [wallpaper, setWallpaper] = useState<string>(() => {
    return localStorage.getItem('jr_relax_wallpaper') || '';
  });
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Authenticated user session
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('jr_crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // LocalStorage state persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('jr_crm_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean up previously created mock projects as requested by the user
          const cleaned = parsed.filter((p: any) => p && p.id !== 'proj-1' && p.id !== 'proj-2' && p.id !== 'proj-3');
          return cleaned.map((p: any) => ({ ...p, precioVenta: 0 }));
        }
      } catch (e) {
        // Silently fall back
      }
    }
    return INITIAL_PROJECTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('jr_crm_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure keyboardShortcutsEnabled is set
        if (parsed.keyboardShortcutsEnabled === undefined) {
          parsed.keyboardShortcutsEnabled = true;
        }
        return parsed;
      } catch (e) {
        // Let fall back
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Spotify active playing States
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack>(SPOTIFY_TRACKS[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(372);
  const [volume, setVolume] = useState(0.5);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Profile modal input fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  // Sincronize profile fields when modal opens
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhoto(user.photoUrl);
    }
  }, [isProfileModalOpen, user]);

  // Unified HTML5 Spotify audio preview loop manager
  useEffect(() => {
    const audio = new Audio(activeTrack.audioUrl);
    audio.volume = volume;
    setAudioElement(audio);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTrackEnded = () => {
      // Loop or go to next track automatically
      const currentIndex = SPOTIFY_TRACKS.findIndex(t => t.id === activeTrack.id);
      const nextIndex = (currentIndex + 1) % SPOTIFY_TRACKS.length;
      setActiveTrack(SPOTIFY_TRACKS[nextIndex]);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleTrackEnded);

    if (isPlaying) {
      audio.play().catch(err => {
        console.warn("Navegadores bloquean autoplay sin interacción previa del usuario. Pausando.", err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleTrackEnded);
    };
  }, [activeTrack]);

  // Audio Playback action controller APIs
  const handleTogglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Error reproduciendo audio: ", err);
      });
    }
  };

  const handleNextTrack = () => {
    const currentIndex = SPOTIFY_TRACKS.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % SPOTIFY_TRACKS.length;
    setActiveTrack(SPOTIFY_TRACKS[nextIndex]);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    const currentIndex = SPOTIFY_TRACKS.findIndex(t => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + SPOTIFY_TRACKS.length) % SPOTIFY_TRACKS.length;
    setActiveTrack(SPOTIFY_TRACKS[prevIndex]);
    setCurrentTime(0);
  };

  const handleSeek = (time: number) => {
    if (!audioElement) return;
    audioElement.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (audioElement) {
      audioElement.volume = vol;
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setActiveTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Keyboard shortcut listener hook
  useEffect(() => {
    if (settings.keyboardShortcutsEnabled === false) return;

    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Direct escape if typing
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || 
         activeEl.tagName === 'TEXTAREA' || 
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Alt + Key mapping
      if (e.altKey) {
        if (key === '1') {
          e.preventDefault();
          setActiveTab('Dashboard');
          triggerStatusMessage('Sección: Dashboard');
        } else if (key === '2') {
          e.preventDefault();
          setActiveTab('Captacion');
          triggerStatusMessage('Sección: Captación de Leads');
        } else if (key === '3') {
          e.preventDefault();
          setActiveTab('Clientes');
          triggerStatusMessage('Sección: Gestión de Clientes');
        } else if (key === '4') {
          e.preventDefault();
          setActiveTab('Ajustes');
          triggerStatusMessage('Sección: Ajustes generales');
        } else if (key === 'm') {
          e.preventDefault();
          // Dispatch custom event to notify Dynamic Island to toggle music expanded view
          window.dispatchEvent(new CustomEvent('toggle-spotify'));
          triggerStatusMessage('Teclado: Reproductor Spotify');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [settings.keyboardShortcutsEnabled]);

  useEffect(() => {
    localStorage.setItem('jr_crm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('jr_crm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('jr_crm_language', language);
  }, [language]);

  // Expand and contract notifications inside the Dynamic Island
  const triggerStatusMessage = (message: string) => {
    setStatusMessage(message);
    const timer = setTimeout(() => {
      setStatusMessage('');
    }, 4500);
    return () => clearTimeout(timer);
  };

  // Convert a Lead into a Live project & navigate to project manager
  const handleAddProjectFromLead = (lead: Lead) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      comercio: lead.name,
      sector: lead.sector,
      dominioComprado: `${lead.name.toLowerCase().replace(/\s+/g, '')}.eus`,
      ubicacion: lead.location,
      fechaEntrega: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ahead limit
      precioVenta: 0, // Standard conversion price
      estado: 'Contacto',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveTab('Clientes');
    triggerStatusMessage(`¡${lead.name} captado con éxito! Se ha creado un borrador.`);
  };

  const handleResetDatabase = () => {
    if (confirm('¿Estás seguro de que deseas reajustar los proyectos de fábrica? Esta acción eliminará los clientes actuales localmente.')) {
      setProjects(INITIAL_PROJECTS);
      setSettings(DEFAULT_SETTINGS);
      triggerStatusMessage('Base de datos restablecida.');
    }
  };

  // Profile saver trigger
  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      triggerStatusMessage('El nombre y el correo de Google son obligatorios');
      return;
    }
    const updatedUser = {
      name: editName,
      email: editEmail,
      photoUrl: editPhoto
    };
    setUser(updatedUser);
    localStorage.setItem('jr_crm_user', JSON.stringify(updatedUser));
    setIsProfileModalOpen(false);
    triggerStatusMessage('¡Perfil guardado correctamente!');
  };

  // If user is not logged in with Google, require authentication first
  if (!user) {
    return (
      <GoogleLogin
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          localStorage.setItem('jr_crm_user', JSON.stringify(loggedInUser));
          triggerStatusMessage(`Sesión iniciada como ${loggedInUser.email}`);
        }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 relative selection:bg-[#1B365D]/20 selection:text-[#1B365D] bg-[#F8FAFC] transition-all duration-1000 bg-cover bg-fixed bg-center"
      style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
    >
      {/* Ambient background blur card layer if custom wallpaper is enabled */}
      {wallpaper && (
        <div className="absolute inset-0 bg-[#F8FAFC]/82 backdrop-blur-xs z-0 pointer-events-none transition-all duration-1000" />
      )}
      
      {/* 1. Dynamic Island Component with full Spotify callbacks and translation context */}
      <DynamicIsland
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusMessage={statusMessage}
        isProcessing={isScanning}
        language={language}
        setLanguage={setLanguage}
        
        isPlaying={isPlaying}
        activeTrack={activeTrack}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        seekTrack={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        trackList={SPOTIFY_TRACKS}
        onSelectTrack={handleSelectTrack}
      />

      {/* Google User Avatar Profile Floating Hub (Top Right Corner) */}
      <div id="google-session-badge" className="fixed top-6 right-6 z-[60] flex flex-col items-end">
        <button
          id="user-profile-menu-button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="h-11 px-3 py-1 bg-white/70 hover:bg-white backdrop-blur-md border border-white/50 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group select-none hover:scale-101 duration-150"
        >
          <img
            src={user.photoUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="hidden md:flex flex-col items-start pr-1 text-left">
            <span className="text-xs font-bold text-slate-800 tracking-tight leading-none">{user.name}</span>
            <span className="text-[9px] font-semibold text-emerald-600 leading-none mt-0.5 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Activo
            </span>
          </div>
        </button>
        
        <AnimatePresence>
          {isUserMenuOpen && (
            <>
              {/* Click outside backdrop for convenience */}
              <div 
                className="fixed inset-0 z-10 cursor-default" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="relative z-20 mt-2 w-64 glass-card p-5 flex flex-col gap-3 shadow-xl border border-white/80"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden text-left">
                    <h4 className="text-sm font-bold text-[#1B365D] truncate">{user.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 truncate leading-tight">{user.email}</p>
                  </div>
                </div>
                
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center mt-1">
                  Google Secure SSO Active
                </div>

                <div className="space-y-1.5">
                  <button
                    id="btn-trigger-edit-profile-modal"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    Editar mi Perfil
                  </button>

                  <button
                    id="btn-google-signout"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setUser(null);
                      localStorage.removeItem('jr_crm_user');
                      triggerStatusMessage('Has cerrado sesión correctamente.');
                    }}
                    className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100/70 text-red-600 border border-red-200/50 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Blur Spheres for Liquid Glass Vibes */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#1B365D]/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-10">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'Dashboard' && (
              <Dashboard projects={projects} />
            )}

            {activeTab === 'Captacion' && (
              <Captacion
                onAddProjectFromLead={handleAddProjectFromLead}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
              />
            )}

            {activeTab === 'Clientes' && (
              <MisClientes
                projects={projects}
                setProjects={setProjects}
                settings={settings}
                triggerStatusMessage={triggerStatusMessage}
              />
            )}

            {activeTab === 'Ajustes' && (
              <Ajustes
                settings={settings}
                setSettings={setSettings}
                onResetDatabase={handleResetDatabase}
                triggerStatusMessage={triggerStatusMessage}
                user={user}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  localStorage.setItem('jr_crm_user', JSON.stringify(updated));
                }}
              />
            )}

            {activeTab === 'Cerebro' && (
              <SegundoCerebro
                language={language}
                triggerStatusMessage={triggerStatusMessage}
              />
            )}

            {activeTab === 'Relax' && (
              <RelaxZone
                language={language}
                wallpaper={wallpaper}
                setWallpaper={setWallpaper}
                triggerStatusMessage={triggerStatusMessage}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* DYNAMIC PROFILE EDIT MODAL POPUP */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop blur element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-[#1B365D]/30 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white/95 rounded-[32px] border border-slate-200/80 shadow-2xl p-8 max-w-md w-full z-10 text-[#2C3E50]"
            >
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-extrabold text-[#1B365D] tracking-tight">Editar Perfil Google</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileModal} className="space-y-5">
                {/* Visual Avatar presets quick select */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img 
                      src={editPhoto} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-[#1B365D] rounded-full text-white shadow-md border border-white">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Elegir Preset</label>
                    <div className="flex gap-2">
                      {AVATAR_PRESETS.map((pUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditPhoto(pUrl)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform duration-150 hover:scale-105 cursor-pointer ${
                            editPhoto === pUrl ? 'border-[#1B365D] ring-2 ring-[#1B365D]/15' : 'border-slate-200'
                          }`}
                        >
                          <img src={pUrl} alt="Preset selector" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      className="w-full text-sm p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:bg-white outline-none transition-all"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Jakes Rodriguez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email de Administrador</label>
                    <input
                      type="email"
                      className="w-full text-sm p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:bg-white outline-none transition-all placeholder:lowercase"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">URL de Foto Personalizada</label>
                    <input
                      type="url"
                      className="w-full text-sm p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[#2C3E50] font-mono focus:ring-2 focus:ring-[#1B365D]/20 focus:bg-white outline-none transition-all"
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-profile-modal-save"
                    type="submit"
                    className="flex-1 py-3 bg-[#1B365D] hover:bg-[#132743] hover:shadow-lg text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer removed to avoid distractions as requested */}

    </div>
  );
}
