import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Radar, 
  Users, 
  Settings, 
  Activity, 
  Brain,
  Compass,
  Globe
} from 'lucide-react';
import { ActiveTab } from '../types';

interface DynamicIslandProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  statusMessage?: string;
  isProcessing?: boolean;
  language: 'ES' | 'EU';
  setLanguage: (lang: 'ES' | 'EU') => void;
}

export default function DynamicIsland({
  activeTab,
  setActiveTab,
  statusMessage,
  isProcessing = false,
  language,
  setLanguage
}: DynamicIslandProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const getActiveState = () => {
    if (isProcessing) return 'processing';
    if (statusMessage) return 'notifying';
    if (!isNavExpanded) return 'collapsed';
    return isHovered ? 'hovered' : 'idle';
  };

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
      width: '540px', // Comfortably fit all 6 tabs + language toggle
      height: '48px',
      borderRadius: '24px',
      backgroundColor: '#1E293B', // Slate-800
      boxShadow: '0 10px 25px -5px rgba(27, 54, 93, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    },
    hovered: {
      width: '640px',
      height: '52px',
      borderRadius: '26px',
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
          {isProcessing ? (
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
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-black text-white tracking-widest uppercase font-mono group-hover:text-sky-300 transition-colors">
                JRG CRM
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
                  JRG CRM
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
