import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles,
  FolderOpen,
  Info,
  Check,
  Globe
} from 'lucide-react';

export interface MindMapNode {
  id: string;
  parentId: string | null;
  text: string;
  color: string; // Tailwind bg class
}

export interface MindMap {
  id: string;
  title: string;
  updatedAt: string;
  nodes: MindMapNode[];
}

const COLOR_PRESETS = [
  { name: 'Sky', bg: 'bg-sky-100 border-sky-400 text-sky-800 hover:bg-sky-200 focus:bg-sky-200' },
  { name: 'Emerald', bg: 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200 focus:bg-emerald-200' },
  { name: 'Violet', bg: 'bg-violet-100 border-violet-400 text-violet-800 hover:bg-violet-200 focus:bg-violet-200' },
  { name: 'Amber', bg: 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200 focus:bg-amber-200' },
  { name: 'Rose', bg: 'bg-rose-100 border-rose-400 text-rose-800 hover:bg-rose-200 focus:bg-rose-200' },
  { name: 'Slate', bg: 'bg-slate-100 border-slate-400 text-slate-800 hover:bg-slate-200 focus:bg-slate-200' },
];

interface MindMapBuilderProps {
  language: 'ES' | 'EU';
  triggerStatusMessage: (msg: string) => void;
}

export default function MindMapBuilder({ language, triggerStatusMessage }: MindMapBuilderProps) {
  const [mindMaps, setMindMaps] = useState<MindMap[]>(() => {
    const saved = localStorage.getItem('jr_mindmaps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing mindmaps', e);
      }
    }
    // Default initial mind map
    return [
      {
        id: 'map-1',
        title: language === 'EU' ? 'Proiektu Berria map' : 'Esquema de Proyecto Web',
        updatedAt: new Date().toLocaleDateString(),
        nodes: [
          { id: 'node-root', parentId: null, text: language === 'EU' ? 'Nire Webgunea' : 'Mi Web de Negocios', color: 'bg-sky-100 border-sky-400 text-sky-800' },
          { id: 'node-1', parentId: 'node-root', text: language === 'EU' ? 'Hasierako orria' : 'Página Principal', color: 'bg-violet-100 border-violet-400 text-violet-800' },
          { id: 'node-2', parentId: 'node-root', text: language === 'EU' ? 'Zerbitzuak' : 'Servicios / Reservas', color: 'bg-emerald-100 border-emerald-400 text-emerald-800' },
          { id: 'node-3', parentId: 'node-root', text: language === 'EU' ? 'Kontaktua' : 'Contacto & Google Maps', color: 'bg-amber-100 border-amber-400 text-amber-800' },
          { id: 'node-4', parentId: 'node-1', text: language === 'EU' ? 'Hero Atala' : 'Banner de Bienvenida', color: 'bg-slate-100 border-slate-400 text-slate-800' },
        ]
      }
    ];
  });

  const [activeMapId, setActiveMapId] = useState<string>(() => {
    return mindMaps[0]?.id || '';
  });

  const [newMapTitle, setNewMapTitle] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('jr_mindmaps', JSON.stringify(mindMaps));
  }, [mindMaps]);

  const activeMap = mindMaps.find(m => m.id === activeMapId);

  // Translate labels
  const t = {
    title: language === 'EU' ? 'Mapa Mental Interaktiboak' : 'Mapas Mentales Interactivos',
    desc: language === 'EU' ? 'Sortu, editatu eta antolatu zure ideiak egitura adarretsu batean.' : 'Crea, edita y organiza tus ideas en una estructura ramificada y visual.',
    newMap: language === 'EU' ? 'Mapa Berria' : 'Nuevo Mapa Mental',
    mapTitlePlaceholder: language === 'EU' ? 'Idatzi maparen izena...' : 'Título del nuevo mapa...',
    create: language === 'EU' ? 'Sortu' : 'Crear',
    deleteMap: language === 'EU' ? 'Ezabatu Mapa' : 'Eliminar Mapa',
    selectMap: language === 'EU' ? 'Hautatu Mapa' : 'Seleccionar Mapa',
    lastUpdate: language === 'EU' ? 'Azken eguneratzea' : 'Última actualización',
    instructions: language === 'EU' ? 'Egin klik edozein adarretan testua aldatzeko, berriak gehitzeko (+) edo kolorea aldatzeko.' : 'Haz clic en cualquier nodo para editar el texto, añadir sub-ideas (+), alternar colores o borrar.',
    rootNodeLabel: language === 'EU' ? 'Burututako Ideia' : 'Idea Central',
    addSubidea: language === 'EU' ? 'Gehitu azpi-ideia' : 'Añadir sub-idea',
    changeColor: language === 'EU' ? 'Kolorea' : 'Cambiar Color',
    removeNode: language === 'EU' ? 'Ezabatu adarra' : 'Eliminar sub-idea',
    saveText: language === 'EU' ? 'Gorde' : 'Aceptar',
    cancel: language === 'EU' ? 'Utzi' : 'Cancelar',
    newSubideaDefault: language === 'EU' ? 'Adar berria' : 'Nueva idea',
  };

  const handleCreateMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapTitle.trim()) return;

    const newMap: MindMap = {
      id: `map-${Date.now()}`,
      title: newMapTitle.trim(),
      updatedAt: new Date().toLocaleDateString(),
      nodes: [
        { 
          id: `node-${Date.now()}-root`, 
          parentId: null, 
          text: newMapTitle.trim(), 
          color: 'bg-sky-100 border-sky-400 text-sky-800' 
        }
      ]
    };

    setMindMaps(prev => [newMap, ...prev]);
    setActiveMapId(newMap.id);
    setNewMapTitle('');
    triggerStatusMessage(language === 'EU' ? 'Mapa mental berria sortu da' : 'Nuevo mapa mental creado');
  };

  const handleDeleteActiveMap = () => {
    if (mindMaps.length <= 1) {
      triggerStatusMessage(language === 'EU' ? 'Ezin da azken mapa ezabatu' : 'No puedes eliminar el único mapa restante');
      return;
    }
    const updated = mindMaps.filter(m => m.id !== activeMapId);
    setMindMaps(updated);
    setActiveMapId(updated[0].id);
    triggerStatusMessage(language === 'EU' ? 'Mapa ezabatu da' : 'Mapa mental eliminado con éxito');
  };

  const handleAddChildNode = (parentId: string) => {
    if (!activeMapId) return;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      parentId: parentId,
      text: t.newSubideaDefault,
      color: COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)].bg
    };

    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        updatedAt: new Date().toLocaleDateString(),
        nodes: [...m.nodes, newNode]
      };
    }));

    setEditingNodeId(newNode.id);
    setEditedText(newNode.text);
    triggerStatusMessage(language === 'EU' ? 'Adar berria gehituta' : 'Sub-idea añadida al mapa');
  };

  const handleStartEditing = (node: MindMapNode) => {
    setEditingNodeId(node.id);
    setEditedText(node.text);
  };

  const handleSaveNodeText = (nodeId: string) => {
    if (!activeMapId) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        updatedAt: new Date().toLocaleDateString(),
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, text: editedText.trim() || n.text } : n)
      };
    }));
    setEditingNodeId(null);
  };

  const handleChangeNodeColor = (nodeId: string, colorClass: string) => {
    if (!activeMapId) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, color: colorClass } : n)
      };
    }));
  };

  // Recursively delete a node and all of its descendants
  const handleDeleteNodeAndDescendants = (nodeId: string) => {
    if (!activeMap) return;

    // Sub-function to find all descandant IDs
    const getDescendants = (id: string): string[] => {
      const children = activeMap.nodes.filter(n => n.parentId === id);
      const childIds = children.map(c => c.id);
      return [...childIds, ...childIds.flatMap(cid => getDescendants(cid))];
    };

    const targetIdsToDelete = [nodeId, ...getDescendants(nodeId)];

    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        updatedAt: new Date().toLocaleDateString(),
        nodes: m.nodes.filter(n => !targetIdsToDelete.includes(n.id))
      };
    }));
    
    // Stop editing if deleted active
    if (editingNodeId && targetIdsToDelete.includes(editingNodeId)) {
      setEditingNodeId(null);
    }
    
    triggerStatusMessage(language === 'EU' ? 'Adarra eta haren azpi-atalak ezabatu dira' : 'Sub-idea y ramas derivadas eliminadas');
  };

  // Recursive component to render node and branches
  const renderNodeTree = (node: MindMapNode): React.ReactNode => {
    if (!activeMap) return null;
    const isRoot = node.parentId === null;
    const children = activeMap.nodes.filter(n => n.parentId === node.id);
    const isEditing = editingNodeId === node.id;

    return (
      <div key={node.id} className="flex flex-col items-center relative z-10">
        
        {/* Node card wrapper */}
        <div 
          className={`flex flex-col p-3 rounded-2xl shadow-sm border-2 transition-all max-w-[220px] text-center shrink-0 ${node.color} group relative`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-1.5 p-0.5">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onBlur={() => handleSaveNodeText(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNodeText(node.id);
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                className="w-full text-xs font-bold text-center bg-white/70 rounded-lg px-2 py-1 outline-none text-slate-800 border border-slate-300"
                autoFocus
              />
              <div className="flex justify-center gap-1">
                <button
                  type="button"
                  onMouseDown={() => handleSaveNodeText(node.id)}
                  className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase transition-all"
                >
                  {t.saveText}
                </button>
                <button
                  type="button"
                  onMouseDown={() => setEditingNodeId(null)}
                  className="px-2 py-0.5 bg-slate-300 text-slate-700 rounded text-[9px] font-bold uppercase transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p 
                onClick={() => handleStartEditing(node)}
                className="text-xs font-bold leading-tight cursor-text whitespace-normal break-words py-1 px-1.5 hover:bg-black/5 rounded"
                title={language === 'EU' ? 'Klikatu testua aldatzeko' : 'Haz clic para editar texto'}
              >
                {node.text}
              </p>
              
              {/* Quick Hover Controls panel */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 mt-2 pt-1 border-t border-black/5 transition-opacity duration-200">
                
                {/* Node addition */}
                <button
                  onClick={() => handleAddChildNode(node.id)}
                  className="p-1.5 hover:bg-black/10 rounded-lg text-slate-700 transition-all cursor-pointer"
                  title={t.addSubidea}
                >
                  <Plus className="w-3 w-3" />
                </button>

                {/* Color Picker Toggle inside each node */}
                <span className="relative group/color inline-block">
                  <button
                    className="p-1.5 hover:bg-black/10 rounded-lg text-slate-700 transition-all cursor-pointer"
                    title={t.changeColor}
                  >
                    <Info className="w-3 w-3" />
                  </button>
                  <div className="hidden group-hover/color:grid grid-cols-3 gap-1 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-1 bg-white border border-slate-200 shadow-lg rounded-lg z-30 w-24">
                    {COLOR_PRESETS.map(col => (
                      <button
                        key={col.name}
                        onClick={() => handleChangeNodeColor(node.id, col.bg)}
                        className={`w-4.5 h-4.5 rounded-full border border-slate-300 transition-transform hover:scale-115 ${col.bg.split(' ')[0]}`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </span>

                {/* Direct text edit */}
                <button
                  onClick={() => handleStartEditing(node)}
                  className="p-1.5 hover:bg-black/10 rounded-lg text-slate-700 transition-all cursor-pointer"
                  title={language === 'EU' ? 'Editatu' : 'Editar texto'}
                >
                  <Edit3 className="w-3 w-3" />
                </button>

                {/* Node deletion (non-root only) */}
                {!isRoot && (
                  <button
                    onClick={() => handleDeleteNodeAndDescendants(node.id)}
                    className="p-1.5 hover:bg-red-200 rounded-lg text-red-600 transition-all cursor-pointer"
                    title={t.removeNode}
                  >
                    <Trash2 className="w-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical connector to children block */}
        {children.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="w-[2px] bg-slate-300/80 h-6" />
            <div className="relative flex justify-center gap-6">
              {/* Horizontal crossbar joining branches */}
              <div className="absolute top-0 left-12 right-12 h-[2px] bg-slate-300/80" />
              {children.map(child => renderNodeTree(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B365D]/10 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1B365D] tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-500 animate-pulse rotate-90" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.desc}</p>
        </div>
        
        {/* Selector dropdown for active maps */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-xl border border-white">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            <select
              value={activeMapId}
              onChange={(e) => setActiveMapId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#1B365D] outline-none cursor-pointer"
            >
              {mindMaps.map(map => (
                <option key={map.id} value={map.id}>{map.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDeleteActiveMap}
            type="button"
            className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
            title={t.deleteMap}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Creation form */}
      <form onSubmit={handleCreateMap} className="flex gap-2 bg-white/75 p-2 rounded-2xl border border-white/85">
        <input
          type="text"
          value={newMapTitle}
          onChange={(e) => setNewMapTitle(e.target.value)}
          placeholder={t.mapTitlePlaceholder}
          className="flex-1 text-xs px-3 py-2 bg-transparent outline-none border-none text-[#2C3E50] placeholder:text-slate-400 font-medium"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#1B365D] hover:bg-[#132743] hover:shadow-xs active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
          <span>{t.create}</span>
        </button>
      </form>

      {/* Interactive visual canvas scroll viewer */}
      <div className="w-full overflow-x-auto overflow-y-hidden bg-slate-900/5 hover:bg-slate-900/[0.07] border border-slate-200/50 rounded-[28px] p-8 md:p-12 shadow-inner min-h-[360px] flex justify-center items-start custom-scrollbar">
        {activeMap ? (
          <div className="pt-2 min-w-[max-content] mx-auto select-none">
            {renderNodeTree(activeMap.nodes[0] || { id: 'root', parentId: null, text: 'Vacio', color: 'bg-sky-100' })}
          </div>
        ) : (
          <div className="text-center py-12 mx-auto">
            <GitFork className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400">Selecciona o crea un mapa mental para comenzar.</p>
          </div>
        )}
      </div>

      {/* Small instructional footer note */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-3 rounded-2xl text-[11px] font-semibold text-slate-500">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <p>{t.instructions}</p>
      </div>
    </div>
  );
}
