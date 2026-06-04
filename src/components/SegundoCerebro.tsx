import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Bookmark, 
  Flame, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Zap, 
  Award,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS, MOTIVATIONAL_PHRASES, AI_NEWS } from '../data/translations';
import MindMapBuilder from './MindMapBuilder';

const CURATED_SYNONYMS: { [word: string]: { es: string[]; eu: string[] } } = {
  digitalizar: {
    es: ['automatizar', 'digitalizar', 'modernizar', 'virtualizar', 'sistematizar', 'tecnologizar'],
    eu: ['digitalizatu', 'automatizatu', 'modernizatu', 'birtualizatu', 'eguneratu']
  },
  vender: {
    es: ['comercializar', 'facturar', 'rentabilizar', 'colocar', 'distribuir', 'expender'],
    eu: ['saldu', 'merkaturatu', 'fakturatu', 'ustiatu', 'banatu']
  },
  crear: {
    es: ['diseñar', 'desarrollar', 'producir', 'fundar', 'estructurar', 'idear', 'confeccionar'],
    eu: ['sortu', 'diseinatu', 'garatu', 'eraiki', 'egituratu', 'asmatu']
  },
  proyecto: {
    es: ['iniciativa', 'plan', 'propuesta', 'emprendimiento', 'desarrollo', 'esquema', 'diseño'],
    eu: ['proiektua', 'ekimena', 'plana', 'egitasmoa', 'erronka']
  },
  servicio: {
    es: ['prestación', 'asistencia', 'cobertura', 'soporte', 'contribución', 'utilidad', 'labor'],
    eu: ['zerbitzua', 'laguntza', 'estaldura', 'babesa', 'onura']
  },
  cliente: {
    es: ['comprador', 'consumidor', 'adquiriente', 'patrocinador', 'usuario', 'destinatario'],
    eu: ['bezeroa', 'eroslea', 'kontsumitzailea', 'erabiltzailea']
  },
  diseño: {
    es: ['maquetación', 'interfaz', 'arquitectura', 'estética', 'estructura', 'bosquejo', 'trazo'],
    eu: ['diseinua', 'makizazioa', 'itxura', 'estetika', 'egitura', 'zirriborroa']
  },
  contacto: {
    es: ['lead', 'oportunidad', 'prospecto', 'vinculación', 'enlace', 'conexión', 'afiliado'],
    eu: ['kontaktua', 'lotura', 'harremana', 'aukera', 'kidea']
  },
  entrega: {
    es: ['lanzamiento', 'despliegue', 'suministro', 'remisión', 'concesión', 'finalización'],
    eu: ['entrega', 'aurkezpena', 'hedapena', 'hornidura', 'bukaera']
  },
  rápido: {
    es: ['ágil', 'veloz', 'eficiente', 'fluido', 'expedito', 'inmediato', 'dinámico'],
    eu: ['azkarra', 'bizkorra', 'arina', 'arina', 'efizientea', 'jarraitua']
  },
  bonito: {
    es: ['estético', 'armonioso', 'atractivo', 'elegante', 'pulido', 'sofisticado', 'visual'],
    eu: ['polita', 'estetikoa', 'erakargarria', 'dotorea', 'lanztatua']
  },
  ayudar: {
    es: ['potenciar', 'colaborar', 'digitalizar', 'impulsar', 'facilitar', 'asistir'],
    eu: ['lagundu', 'bultzatu', 'indartu', 'erraztu', 'babestu']
  }
};

interface Routine {
  id: string;
  name: string;
  streak: number;
  completedDays: { [dateStr: string]: boolean };
}

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string; // Tailwind background color class
  createdAt: string;
  todos: { id: string; text: string; completed: boolean }[];
}

interface SegundoCerebroProps {
  language: 'ES' | 'EU';
  triggerStatusMessage: (msg: string) => void;
}

const NOTE_COLORS = [
  { class: 'bg-[#FEF08A] hover:bg-[#FDE047]/60 text-yellow-900 border-yellow-300', label: 'Amarillo' },
  { class: 'bg-[#FECDD3] hover:bg-[#FDA4AF]/60 text-rose-900 border-rose-300', label: 'Rosa' },
  { class: 'bg-[#BAE6FD] hover:bg-[#7DD3FC]/60 text-sky-900 border-sky-300', label: 'Celeste' },
  { class: 'bg-[#A7F3D0] hover:bg-[#6EE7B7]/60 text-emerald-900 border-emerald-300', label: 'Esmeralda' },
  { class: 'bg-[#F5F5F7] hover:bg-[#E5E5EA]/60 text-slate-900 border-slate-300', label: 'Gris' }
];

export default function SegundoCerebro({ language, triggerStatusMessage }: SegundoCerebroProps) {
  const t = TRANSLATIONS[language];
  const todayStr = new Date().toISOString().split('T')[0];

  // --- STATE FOR DAILY ROUTINES ---
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('jr_cerebro_routines');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rot-1', name: language === 'EU' ? 'Mugikorra deskonektatu 1H' : 'Desconectar móvil 1H', streak: 4, completedDays: { [todayStr]: true } },
      { id: 'rot-2', name: language === 'EU' ? 'Métricas de captación revisatu' : 'Revisar métricas de captación', streak: 2, completedDays: { [todayStr]: false } },
      { id: 'rot-3', name: language === 'EU' ? '15 minutu egunero irakurri' : 'Leer 15 minutos diario', streak: 7, completedDays: { [todayStr]: true } }
    ];
  });

  // --- STATE FOR GOOGLE KEEP STYLE NOTES ---
  const [notes, setNotes] = useState<KeepNote[]>(() => {
    const saved = localStorage.getItem('jr_cerebro_keep_notes');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'note-1',
        title: language === 'EU' ? 'Eginbeharrak' : 'Estrategias CRM',
        content: language === 'EU' ? 'Proposamen berria prestatu bezeroentzat.' : 'Preparar la nueva propuesta comercial enfocada en pequeños comercios.',
        color: 'bg-[#FEF08A]',
        createdAt: '02/06/2026',
        todos: [
          { id: 'todo-1', text: language === 'EU' ? 'Diseinua bukatu' : 'Revisar dominio .eus', completed: true },
          { id: 'todo-2', text: language === 'EU' ? 'Testak egin' : 'Configurar Apps Script', completed: false }
        ]
      },
      {
        id: 'note-2',
        title: 'Atajos Teclado',
        content: 'Alt + 1: Dashboard\nAlt + 2: Captación\nAlt + 3: Clientes\nAlt + 4: Ajustes',
        color: 'bg-[#BAE6FD]',
        createdAt: '02/06/2026',
        todos: []
      }
    ];
  });

  // --- STATE FOR ACTIVE MOTIVATION ---
  const [motivationIndex, setMotivationIndex] = useState(0);

  // --- STATE FOR SYNONYMS SEARCH ---
  const [synonymSearch, setSynonymSearch] = useState('');

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('jr_cerebro_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('jr_cerebro_keep_notes', JSON.stringify(notes));
  }, [notes]);

  // --- ACTIONS FOR DAILY ROUTINES ---
  const [newRoutineName, setNewRoutineName] = useState('');

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    const newRot: Routine = {
      id: `rot-${Date.now()}`,
      name: newRoutineName.trim(),
      streak: 0,
      completedDays: {}
    };
    setRoutines(prev => [...prev, newRot]);
    setNewRoutineName('');
    triggerStatusMessage(language === 'EU' ? 'Errutina berria gehitu da' : 'Nueva rutina añadida');
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(rot => {
      if (rot.id !== id) return rot;
      const isDoneToday = rot.completedDays[todayStr] ?? false;
      const updatedDays = { ...rot.completedDays, [todayStr]: !isDoneToday };
      return {
        ...rot,
        completedDays: updatedDays
      };
    }));
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(rot => rot.id !== id));
    triggerStatusMessage(language === 'EU' ? 'Errutina ezabatu da' : 'Rutina eliminada');
  };

  // --- ACTIONS FOR KEEP NOTES ---
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-[#FEF08A]');
  const [noteSearch, setNoteSearch] = useState('');

  // Embedded todo item builder inside new note form
  const [tempTodos, setTempTodos] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTempTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTempTodos(prev => [...prev, {
      id: `temp-${Date.now()}`,
      text: newTodoText.trim(),
      completed: false
    }]);
    setNewTodoText('');
  };

  const handleRemoveTempTodo = (id: string) => {
    setTempTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim() && tempTodos.length === 0) return;
    
    const newNote: KeepNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim() || (language === 'EU' ? 'Oharra' : 'Nota'),
      content: newNoteContent.trim(),
      color: selectedColor,
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      todos: tempTodos
    };

    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setSelectedColor('bg-[#FEF08A]');
    setTempTodos([]);
    triggerStatusMessage(language === 'EU' ? 'Oharra gorde da!' : '¡Nota guardada!');
  };

  const handleToggleNoteTodo = (noteId: string, todoId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      return {
        ...note,
        todos: note.todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t)
      };
    }));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    triggerStatusMessage(language === 'EU' ? 'Oharra ezabatu da' : 'Nota eliminada');
  };

  // Switch motivation quote
  const handleNextMotivation = () => {
    setMotivationIndex(prev => (prev + 1) % MOTIVATIONAL_PHRASES.length);
  };

  // Filter keep notes
  const filteredNotes = notes.filter(n => {
    const matchesTitle = n.title.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesContent = n.content.toLowerCase().includes(noteSearch.toLowerCase());
    return matchesTitle || matchesContent;
  });

  // Calculate generic routines progress
  const routinesDoneTodayCount = routines.filter(r => r.completedDays[todayStr]).length;
  const totalRoutinesCount = routines.length;
  const routinesProgressPercent = totalRoutinesCount > 0 
    ? Math.round((routinesDoneTodayCount / totalRoutinesCount) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn text-[#2C3E50]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1B365D]/10">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B365D]/10 text-[#1B365D] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Brain className="w-3.5 h-3.5" /> {t.cerebro}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">{t.cerebroTitle}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">{t.cerebroDesc}</p>
        </div>
      </div>

      {/* Grid containing Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SECTION 1: APARTADO 1 - RUTINAS DIARIAS (Span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#1B365D] tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#1B365D] animate-pulse" />
                  {t.rutinas}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.rutinasDesc}</p>
              </div>
              
              {/* Progress pill indicator */}
              <div className="bg-[#1B365D] text-white text-[11px] font-black px-2.5 py-1 rounded-full shrink-0">
                {routinesDoneTodayCount}/{totalRoutinesCount}
              </div>
            </div>

            {/* Progress Bar widget */}
            {totalRoutinesCount > 0 && (
              <div className="space-y-1.5 bg-white/40 p-3 rounded-2xl border border-white/60">
                <div className="flex justify-between text-[10px] font-extrabold text-[#1B365D] uppercase tracking-wider">
                  <span>{t.routinesCompleted}</span>
                  <span>{routinesProgressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1B365D] to-indigo-600 transition-all duration-500" 
                    style={{ width: `${routinesProgressPercent}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Add new personal routine */}
            <form onSubmit={handleAddRoutine} className="flex gap-2 items-center bg-white/75 p-2 rounded-2xl border border-white/85">
              <input
                type="text"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                placeholder={t.agregarRutina}
                className="flex-1 text-xs px-3 py-2 bg-transparent outline-none border-none text-[#2C3E50] placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1B365D] hover:bg-[#132743] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.agregar}</span>
              </button>
            </form>

            {/* List of routines */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {routines.map((rot) => {
                  const isCompletedToday = rot.completedDays[todayStr] ?? false;
                  return (
                    <motion.div
                      key={rot.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group relative p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isCompletedToday 
                          ? 'bg-[#1B365D]/5 border-emerald-500/20' 
                          : 'bg-white border-white/80 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Checker circle */}
                        <button
                          onClick={() => handleToggleRoutine(rot.id)}
                          type="button"
                          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0"
                          style={{
                            borderColor: isCompletedToday ? '#1B365D' : '#94A3B8',
                            backgroundColor: isCompletedToday ? '#1B365D' : 'transparent'
                          }}
                        >
                          {isCompletedToday && <Check className="w-4 h-4 text-white stroke-[4]" />}
                        </button>

                        <div className="text-left min-w-0">
                          <p className={`text-xs font-bold leading-tight ${isCompletedToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {rot.name}
                          </p>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteRoutine(rot.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {routines.length === 0 && (
                <div className="text-center py-8">
                  <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Introduce una rutina para empezar.</p>
                </div>
              )}
            </div>
          </div>

          {/* DICCIONARIO CREATIVO DE SINÓNIMOS */}
          <div className="glass-card p-6 md:p-8 text-left space-y-4 shadow-sm border border-[#1B365D]/10">
            <div>
              <h2 className="text-lg font-extrabold text-[#1B365D] tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                {language === 'EU' ? 'Sinonimo Hiztegi Bizia' : 'Diccionario de Sinónimos'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {language === 'EU' ? 'Hitz gakoen sinonimoak bilatu eta kopiatu testuak aberasteko' : 'Busca y copia alternativas rápidas para mejorar tu copywriting'}
              </p>
            </div>

            {/* Synonym selector / Search field */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={synonymSearch}
                  onChange={(e) => setSynonymSearch(e.target.value)}
                  placeholder={language === 'EU' ? 'Idatzi hitz bat (Adib: digitalizar, crear)...' : 'Buscar sinónimos (Ej: digitalizar, crear, rápido)...'}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/15 focus:bg-white transition-all"
                />
              </div>

              {/* Dynamic curated suggestions button list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.keys(CURATED_SYNONYMS).slice(0, 6).map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => setSynonymSearch(word)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
                  >
                    #{word}
                  </button>
                ))}
              </div>

              {/* Matching synonyms result */}
              <div className="bg-white/50 p-4 rounded-xl border border-slate-200/40 space-y-3">
                {(() => {
                  const cleanedQuery = synonymSearch.trim().toLowerCase();
                  if (!cleanedQuery) {
                    return (
                      <div className="text-center py-4 text-slate-400 text-xs">
                        {language === 'EU' ? 'Hitz bat hautatu sinonimoak ikusteko.' : 'Introduce o selecciona una palabra clave para descubrir sinónimos.'}
                      </div>
                    );
                  }

                  // Look up word matching keys
                  const matchKey = Object.keys(CURATED_SYNONYMS).find(
                    key => key.includes(cleanedQuery) || cleanedQuery.includes(key)
                  );

                  if (matchKey) {
                    const group = CURATED_SYNONYMS[matchKey];
                    const activeList = language === 'EU' ? group.eu : group.es;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-indigo-500/5 px-2.5 py-1 rounded-md mb-2">
                          <span className="text-xs font-extrabold text-[#1B365D] uppercase tracking-wide">
                            {matchKey}
                          </span>
                          <span className="text-[9px] bg-indigo-600 text-white font-extrabold rounded-md px-1.5 py-0.5 uppercase tracking-widest leading-none">
                            {activeList.length} {language === 'EU' ? 'Sinonimo' : 'Alternativas'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {activeList.map((syn) => (
                            <button
                              key={syn}
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(syn);
                                triggerStatusMessage(
                                  language === 'EU' 
                                    ? `Kopiatuta: "${syn}"` 
                                    : `Copiado: "${syn}"`
                                );
                              }}
                              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-[#2C3E50] border border-slate-200/80 hover:border-slate-350 rounded-lg text-left text-xs font-bold transition-all relative overflow-hidden group/item cursor-pointer flex items-center justify-between"
                              title={language === 'EU' ? 'Sakatu kopiatzeko' : 'Haz clic para copiar'}
                            >
                              <span className="truncate pr-1">{syn}</span>
                              <span className="text-[8px] uppercase tracking-widest text-[#1B365D]/60 font-black opacity-0 group-hover/item:opacity-100 transition-opacity">Copy</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-3 py-1">
                        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 text-xs text-slate-550 flex gap-2 items-start text-left">
                          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-700">{language === 'EU' ? 'Hitz horrentzat ez dugu presetik' : 'Palabra no registrada'}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {language === 'EU' 
                                ? 'Saiatu digitalizar, vender, crear, proyecto, servicio, rápido o bonito' 
                                : 'Prueba buscando palabras como: digitalizar, vender, crear, proyecto, servicio, rápido o bonito.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: APARTADO 2 - GOOGLE KEEP STYLE NOTES (Span 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#1B365D] tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B365D]" />
                  {t.notesKeep}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.notesDesc}</p>
              </div>

              {/* Note search input */}
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder="Buscar nota..."
                className="w-full sm:w-44 text-xs px-3 py-1.5 bg-white/70 border border-slate-200/50 rounded-xl outline-none text-[#2C3E50]"
              />
            </div>

            {/* Create new keep-style note block */}
            <div className="bg-white/90 p-5 rounded-[24px] border border-slate-200/50 space-y-4 shadow-2xs">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder={language === 'EU' ? 'Oharraren izenburua...' : 'Título de la nota...'}
                className="w-full text-xs font-extrabold bg-transparent outline-none border-b border-slate-100 pb-1.5 text-[#1B365D] placeholder:text-slate-400"
              />

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder={t.nuevaNota}
                rows={2}
                className="w-full text-xs bg-transparent outline-none resize-none text-[#2C3E50] placeholder:text-slate-400 leading-relaxed"
              />

              {/* Checklist builder embedded in adding note */}
              {tempTodos.length > 0 && (
                <div className="space-y-1.5 p-2 bg-slate-50 rounded-xl">
                  {tempTodos.map(todo => (
                    <div key={todo.id} className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <span>{todo.text}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTempTodo(todo.id)} 
                        className="text-red-400 hover:text-red-600 font-bold px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form to add embedded tasks to the note */}
              <form onSubmit={handleAddTempTodo} className="flex gap-1.5 items-center bg-slate-100/70 p-1.5 rounded-xl">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder={language === 'EU' ? 'Gehitu barne-ataza...' : 'Añadir tarea interna...'}
                  className="flex-1 bg-transparent border-none outline-none text-[11px] px-2"
                />
                <button
                  type="submit"
                  className="p-1 px-2.5 bg-slate-300 hover:bg-slate-400 text-slate-700 font-extrabold text-[10px] rounded-lg transition-all"
                >
                  + Todo
                </button>
              </form>

              {/* Color picker and submit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{language === 'EU' ? 'Kolorea' : 'Color'}:</span>
                  <div className="flex gap-1.5">
                    {NOTE_COLORS.map(colorClass => (
                      <button
                        key={colorClass.class}
                        onClick={() => setSelectedColor(colorClass.class)}
                        className={`w-5 h-5 rounded-full border transition-transform ${colorClass.class} ${
                          selectedColor === colorClass.class ? 'scale-120 border-slate-600 ring-1 ring-slate-400' : 'border-slate-300/60'
                        }`}
                        title={colorClass.label}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-[#1B365D] hover:bg-[#132743] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                  {t.guardarNota}
                </button>
              </div>
            </div>

            {/* List of notes rendered in a Bento Fluid 2-column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-left space-y-4 hover:shadow-md transition-all ${note.color}`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black tracking-tight leading-tight uppercase">
                          {note.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-black/45 hover:text-red-600 transition-colors cursor-pointer"
                          title="Eliminar pensamiento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {note.content && (
                        <p className="text-[11px] font-semibold leading-relaxed mt-2 whitespace-pre-wrap opacity-90">
                          {note.content}
                        </p>
                      )}

                      {/* Embedded Todo checklist inside note card */}
                      {note.todos.length > 0 && (
                        <div className="space-y-1.5 mt-3 pt-3 border-t border-black/5">
                          {note.todos.map((todo) => (
                            <button
                              key={todo.id}
                              onClick={() => handleToggleNoteTodo(note.id, todo.id)}
                              className="w-full flex items-center gap-2 text-[11px] font-bold text-left hover:opacity-85"
                            >
                              {todo.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-black shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-black/55 shrink-0" />
                              )}
                              <span className={todo.completed ? 'line-through opacity-50' : ''}>
                                {todo.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-extrabold opacity-60 flex justify-between pt-1">
                      <span>Google Keep Card</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredNotes.length === 0 && (
                <div className="col-span-full text-center py-6">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-400">Ninguna nota encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAPAS MENTALES SECTION (FULL WIDTH) */}
      <MindMapBuilder language={language} triggerStatusMessage={triggerStatusMessage} />

      {/* SECTION 3: APARTADO 3 - NOVEDADES DE IA & PALABRAS MOTIVADORAS (Full Width Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* motivation widget */}
        <div className="md:col-span-4 h-full">
          <div className="bg-gradient-to-br from-indigo-900 to-[#1B365D] text-white p-6 md:p-8 rounded-[32px] h-full flex flex-col justify-between text-left space-y-6 shadow-lg border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Brain className="w-32 h-32 text-white" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8] bg-white/10 px-2.5 py-1 rounded-full inline-block">
                {t.motivationTitle}
              </span>
              
              <p className="text-sm md:text-base font-extrabold italic tracking-tight leading-relaxed mt-4 text-[#F8FAFC]">
                "{MOTIVATIONAL_PHRASES[motivationIndex][language]}"
              </p>
            </div>

            <button
              onClick={handleNextMotivation}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white border border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 self-start cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              {t.motivationBtn}
            </button>
          </div>
        </div>

        {/* AI novelties for developers list */}
        <div className="md:col-span-8">
          <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#1B365D] tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500 fill-indigo-100/50" />
                {t.noveltiesAI}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.noveltiesAIDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AI_NEWS.map((newsItem, i) => (
                <div 
                  key={i} 
                  className="bg-white/80 border border-white hover:bg-white p-4 rounded-2xl flex flex-col justify-between text-left transition-all hover:shadow-xs group"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-2">
                      {newsItem.category}
                    </span>
                    <h4 className="text-xs font-black text-[#1B365D] leading-snug group-hover:text-indigo-700 transition-colors">
                      {newsItem.title[language]}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-2 leading-relaxed">
                      {newsItem.desc[language]}
                    </p>
                  </div>

                  <a
                    href={newsItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-black uppercase text-[#1B365D] hover:text-indigo-600 mt-4 inline-flex items-center gap-1 transition-all"
                  >
                    <span>{language === 'EU' ? 'Bisitatu gunea' : 'Saber más'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              ))}
            </div>

            {/* AI Dev Tip box */}
            <div className="bg-amber-500/10 border border-amber-300/30 p-4 rounded-2xl flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest">{language === 'EU' ? 'Garatzaileentzako AA Gomendioa' : 'Tip de Productividad IA'}</p>
                <p className="text-[11px] font-bold text-[#2C3E50]/90 mt-1 leading-relaxed">
                  {language === 'EU' 
                    ? "Erabili komando autonomoen kargatzaileak zure lehenengo bezeroak bilatzeko. Kode-proiektuentzako eta dokumentazio herdoilduak automatizatzeko 'Vite' erabili daiteke."
                    : "Instala herramientas de depuración asistida por IA en tu IDE local para predecir cuellos de botella en peticiones asíncronas y optimizar los bucles de renderizado en React."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
