import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles,
  FolderOpen,
  Info,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  HelpCircle,
  Download,
  Layout,
  Cloud,
  Copy,
  Search,
  Eye,
  Calendar,
  Grid
} from 'lucide-react';

export interface MindMapNode {
  id: string;
  parentId: string | null;
  text: string;
  color: string; // Tailwind bg/border class
  shape?: 'rounded' | 'pill' | 'circle' | 'square' | 'oval';
  size?: 'sm' | 'md' | 'lg';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  x?: number; // Center X coordinate in canvas
  y?: number; // Center Y coordinate in canvas
}

export interface MindMap {
  id: string;
  title: string;
  updatedAt: string;
  nodes: MindMapNode[];
}

const COLOR_PRESETS = [
  { name: 'Sky', bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-800 dark:text-sky-300' },
  { name: 'Emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300' },
  { name: 'Violet', bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-400 text-violet-800 dark:text-violet-300' },
  { name: 'Amber', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300' },
  { name: 'Rose', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-300' },
  { name: 'Slate', bg: 'bg-slate-50 dark:bg-slate-900/60 border-slate-350 text-slate-700 dark:text-slate-300' },
  { name: 'Indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-800 dark:text-indigo-305' },
  { name: 'Orange', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 text-orange-800 dark:text-orange-300' },
  { name: 'Cyan', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 text-cyan-800 dark:text-cyan-300' },
  { name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 text-teal-800 dark:text-teal-300' },
  { name: 'Lime', bg: 'bg-lime-50 dark:bg-lime-950/40 border-lime-400 text-lime-800 dark:text-lime-305' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-100/40 dark:bg-fuchsia-950/45 border-fuchsia-400 text-fuchsia-800 dark:text-fuchsia-300' },
];

interface MindMapBuilderProps {
  language: 'ES' | 'EU';
  triggerStatusMessage: (msg: string) => void;
}

// Organic coordinate computer to layout nodes neatly in radial/horizontal layouts
const computeLayout = (nodes: MindMapNode[]): { [id: string]: { x: number; y: number } } => {
  const positions: { [id: string]: { x: number; y: number } } = {};
  
  const root = nodes.find(n => n.parentId === null) || nodes[0];
  if (!root) return positions;
  
  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 1500;
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  
  positions[root.id] = { x: centerX, y: centerY };
  
  const layoutChildren = (parentId: string, parentX: number, parentY: number, angleStart: number, angleEnd: number, depth: number) => {
    const children = nodes.filter(n => n.parentId === parentId);
    if (children.length === 0) return;
    
    const count = children.length;
    const angleRange = angleEnd - angleStart;
    const distance = Math.max(160, 220 - depth * 25);
    
    children.forEach((child, idx) => {
      let angle: number;
      if (count === 1) {
        angle = (angleStart + angleEnd) / 2;
      } else {
        angle = angleStart + (idx / (count - 1)) * angleRange;
      }
      
      const x = parentX + Math.cos(angle) * distance;
      const y = parentY + Math.sin(angle) * distance;
      positions[child.id] = { x, y };
      
      const childRange = Math.PI / (2.5 + depth);
      layoutChildren(child.id, x, y, angle - childRange, angle + childRange, depth + 1);
    });
  };
  
  const rootChildren = nodes.filter(n => n.parentId === root.id);
  const count = rootChildren.length;
  if (count > 0) {
    rootChildren.forEach((child, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      const distance = 240;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      positions[child.id] = { x, y };
      
      const childRange = Math.PI / 3.5;
      layoutChildren(child.id, x, y, angle - childRange, angle + childRange, 1);
    });
  }
  
  return positions;
};

// Premium fixed dimensions for accurate aesthetic line tracing
const getNodeDimensions = (node: MindMapNode) => {
  const size = node.size || 'md';
  const shape = node.shape || 'rounded';
  
  if (shape === 'circle') {
    if (size === 'sm') return { w: 64, h: 64 };
    if (size === 'lg') return { w: 100, h: 100 };
    return { w: 80, h: 80 }; // md
  } else {
    if (size === 'sm') return { w: 130, h: 42 };
    if (size === 'lg') return { w: 220, h: 66 };
    return { w: 175, h: 54 }; // md
  }
};

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
        title: language === 'EU' ? 'Proiektu Berria m' : 'Esquema de Proyecto Web',
        updatedAt: new Date().toLocaleDateString(),
        nodes: [
          { id: 'node-root', parentId: null, text: language === 'EU' ? 'Nire Webgunea' : 'Mi Web de Negocios', color: 'bg-indigo-100 border-indigo-400 text-indigo-800' },
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Tab & Rename state variables
  const [activeTab, setActiveTab] = useState<'editor' | 'gallery'>('editor');
  const [gallerySearch, setGallerySearch] = useState('');
  const [renamingMapId, setRenamingMapId] = useState<string | null>(null);
  const [renameInputVal, setRenameInputVal] = useState('');
  const [isEditingActiveTitle, setIsEditingActiveTitle] = useState(false);
  const [activeTitleInput, setActiveTitleInput] = useState('');

  // Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const activeMap = mindMaps.find(m => m.id === activeMapId);

  // Esc shortcut for full screen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Synchronise body class for canvas fullscreen mode to hide floating elements like Dynamic Island
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('canvas-fullscreen');
    } else {
      document.body.classList.remove('canvas-fullscreen');
    }
    return () => {
      document.body.classList.remove('canvas-fullscreen');
    };
  }, [isFullscreen]);

  // Persist storage
  useEffect(() => {
    localStorage.setItem('jr_mindmaps', JSON.stringify(mindMaps));
  }, [mindMaps]);

  // Auto layout nodes that have no defined coordinates
  useEffect(() => {
    if (!activeMap) return;
    const hasUnpositioned = activeMap.nodes.some(n => n.x === undefined || n.y === undefined);
    if (hasUnpositioned) {
      const positions = computeLayout(activeMap.nodes);
      setMindMaps(prev => prev.map(m => {
        if (m.id !== activeMap.id) return m;
        return {
          ...m,
          nodes: m.nodes.map(n => {
            const p = positions[n.id] || { x: 1200 + (Math.random() * 200 - 100), y: 750 + (Math.random() * 200 - 100) };
            return {
              ...n,
              x: n.x !== undefined ? n.x : p.x,
              y: n.y !== undefined ? n.y : p.y
            };
          })
        };
      }));
    }
  }, [activeMapId, activeMap]);

  // Scroll canvas to center initially
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.scrollLeft = 1200 - canvasRef.current.clientWidth / 2;
        canvasRef.current.scrollTop = 750 - canvasRef.current.clientHeight / 2;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeMapId, isFullscreen]);

  // Mouse drag moving logic
  useEffect(() => {
    if (!draggingNodeId || !activeMapId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const updatedX = e.clientX - dragOffset.x;
      const updatedY = e.clientY - dragOffset.y;
      
      // Bounded safely within canvas 2400x1500
      const bx = Math.max(80, Math.min(2320, updatedX));
      const by = Math.max(80, Math.min(1420, updatedY));

      setMindMaps(prev => prev.map(m => {
        if (m.id !== activeMapId) return m;
        return {
          ...m,
          nodes: m.nodes.map(n => n.id === draggingNodeId ? { ...n, x: bx, y: by } : n)
        };
      }));
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      const updatedX = t.clientX - dragOffset.x;
      const updatedY = t.clientY - dragOffset.y;
      
      const bx = Math.max(80, Math.min(2320, updatedX));
      const by = Math.max(80, Math.min(1420, updatedY));

      setMindMaps(prev => prev.map(m => {
        if (m.id !== activeMapId) return m;
        return {
          ...m,
          nodes: m.nodes.map(n => n.id === draggingNodeId ? { ...n, x: bx, y: by } : n)
        };
      }));
    };

    const handleTouchEnd = () => {
      setDraggingNodeId(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingNodeId, dragOffset, activeMapId]);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }
    e.preventDefault();
    
    const node = activeMap?.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - (node.x ?? 1200),
      y: e.clientY - (node.y ?? 750)
    });
  };

  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    
    const node = activeMap?.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: t.clientX - (node.x ?? 1200),
      y: t.clientY - (node.y ?? 750)
    });
  };

  const handleForceLayoutArrange = () => {
    if (!activeMap) return;
    const positions = computeLayout(activeMap.nodes);
    
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        updatedAt: new Date().toLocaleDateString(),
        nodes: m.nodes.map(n => {
          const pos = positions[n.id] || { x: 1200, y: 750 };
          return {
            ...n,
            x: pos.x,
            y: pos.y
          };
        })
      };
    }));
    triggerStatusMessage(language === 'EU' ? 'Mapa ordenatu eta lerrokatu egin da automatikoki!' : '¡Esquema ordenado y reorganizado automáticamente!');
  };

  const t = {
    title: language === 'EU' ? 'Mapa Mental Interaktiboak' : 'Mapas Mentales Interactivos',
    desc: language === 'EU' ? 'Sortu, editatu eta antolatu zure ideiak egitura adarretsu batean.' : 'Crea, edita y organiza tus ideas en una estructura ramificada y visual.',
    newMap: language === 'EU' ? 'Mapa Berria' : 'Nuevo Mapa Mental',
    mapTitlePlaceholder: language === 'EU' ? 'Idatzi maparen izena...' : 'Título del nuevo mapa...',
    create: language === 'EU' ? 'Sortu' : 'Crear',
    deleteMap: language === 'EU' ? 'Ezabatu Mapa' : 'Eliminar Mapa',
    selectMap: language === 'EU' ? 'Hautatu Mapa' : 'Seleccionar Mapa',
    lastUpdate: language === 'EU' ? 'Azken eguneratzea' : 'Última actualización',
    instructions: language === 'EU' ? 'Arrastatu adarrak mugitzeko. Klikatu testuan aldatzeko edota (+) berria gehitzean.' : 'Arrastra nodos para moverlos libremente. Haz clic en el texto para editar o usa (+) para añadir sub-ramas.',
    rootNodeLabel: language === 'EU' ? 'Burututako Ideia' : 'Idea Central',
    addSubidea: language === 'EU' ? 'Gehitu azpi-ideia' : 'Añadir sub-idea',
    changeColor: language === 'EU' ? 'Kolorea' : 'Cambiar Color',
    removeNode: language === 'EU' ? 'Ezabatu adarra' : 'Eliminar sub-idea',
    saveText: language === 'EU' ? 'Gorde' : 'Aceptar',
    cancel: language === 'EU' ? 'Utzi' : 'Cancelar',
    newSubideaDefault: language === 'EU' ? 'Adar berria' : 'Nueva idea',
    galleryView: language === 'EU' ? 'Mapen Galeria' : 'Galería de Mapas',
    canvasEditor: language === 'EU' ? 'Canvas Editorea' : 'Editor de Canvas',
    saveWebBtn: language === 'EU' ? 'Gorde Web-ean' : 'Guardar en la Web',
    saveSuccess: language === 'EU' ? 'Mapa ondo gorde da zerbitzarian!' : '¡Esquema de mapa mental guardado de forma persistente en la web!',
    duplicateMap: language === 'EU' ? 'Kopiatu' : 'Duplicar',
    renameMap: language === 'EU' ? 'Izena aldatu' : 'Cambiar Nombre',
    mapCopied: language === 'EU' ? 'Mapa bikoiztuta!' : '¡Esquema de mapa duplicado!',
    searchPlaceholder: language === 'EU' ? 'Bilatu mapak izenez...' : 'Buscar mapas por título...',
    totalBranches: language === 'EU' ? 'adar' : 'ramas creadas',
    selectToEdit: language === 'EU' ? 'Ireki Editorean' : 'Cargar en Editor',
    noMapsFound: language === 'EU' ? 'Ez da maparik aurkitu' : 'No se encontraron mapas con ese nombre.',
    renamePlaceholder: language === 'EU' ? 'Idatzi izen berria...' : 'Nuevo nombre del mapa...',
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
          color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-800 dark:text-indigo-300',
          x: 1200,
          y: 750
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

  const handleRenameMapInState = (mapId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== mapId) return m;
      return {
        ...m,
        title: newTitle.trim(),
        updatedAt: new Date().toLocaleDateString()
      };
    }));
  };

  const handleCloneMap = (map: MindMap) => {
    const clonedMap: MindMap = {
      ...map,
      id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${map.title} (${language === 'EU' ? 'Kopia' : 'Copia'})`,
      updatedAt: new Date().toLocaleDateString(),
      nodes: map.nodes.map(n => ({ ...n }))
    };
    setMindMaps(prev => [clonedMap, ...prev]);
    triggerStatusMessage(language === 'EU' ? 'Mapa ondo bikoiztu da!' : '¡Esquema de mapa mental duplicado!');
  };

  const handleDeleteMapById = (mapId: string) => {
    if (mindMaps.length <= 1) {
      triggerStatusMessage(language === 'EU' ? 'Ezin da azken mapa ezabatu' : 'No puedes eliminar el único mapa restante');
      return;
    }
    const updated = mindMaps.filter(m => m.id !== mapId);
    setMindMaps(updated);
    if (activeMapId === mapId) {
      setActiveMapId(updated[0].id);
    }
    triggerStatusMessage(language === 'EU' ? 'Mapa ezabatu da' : 'Mapa mental eliminado con éxito');
  };

  const handleAddChildNode = (parentId: string) => {
    if (!activeMapId || !activeMap) return;

    const parent = activeMap.nodes.find(n => n.id === parentId);
    const siblings = activeMap.nodes.filter(n => n.parentId === parentId);
    const px = parent?.x ?? 1200;
    const py = parent?.y ?? 750;

    // Distribute children in a nice offset from parent
    const offsetDistance = 190;
    const angleStep = 45 * (Math.PI / 180);
    const angle = (siblings.length * angleStep) - Math.PI / 4;
    
    // Add nice offset
    const childX = Math.max(100, Math.min(2300, px + Math.cos(angle) * offsetDistance));
    const childY = Math.max(100, Math.min(1400, py + Math.sin(angle) * offsetDistance));

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      parentId: parentId,
      text: t.newSubideaDefault,
      color: COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)].bg,
      x: childX,
      y: childY,
      shape: 'rounded',
      size: 'md',
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

  const handleChangeNodeShape = (nodeId: string, shape: 'rounded' | 'pill' | 'circle' | 'square' | 'oval') => {
    if (!activeMapId) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, shape } : n)
      };
    }));
  };

  const handleChangeNodeSize = (nodeId: string, size: 'sm' | 'md' | 'lg') => {
    if (!activeMapId) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, size } : n)
      };
    }));
  };

  const handleChangeNodeBorderStyle = (nodeId: string, borderStyle: 'solid' | 'dashed' | 'dotted') => {
    if (!activeMapId) return;
    setMindMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, borderStyle } : n)
      };
    }));
  };

  const handleDeleteNodeAndDescendants = (nodeId: string) => {
    if (!activeMap) return;

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
    
    if (editingNodeId && targetIdsToDelete.includes(editingNodeId)) {
      setEditingNodeId(null);
    }
    
    triggerStatusMessage(language === 'EU' ? 'Adarra eta haren azpi-atalak ezabatu dira' : 'Sub-idea y ramas derivadas eliminadas');
  };

  // Generate adaptive elegant Bezier paths
  const getAdaptiveBezierPath = (pX: number, pY: number, cX: number, cY: number) => {
    const dx = cX - pX;
    const dy = cY - pY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      const cp1X = pX + dx * 0.45;
      const cp1Y = pY;
      const cp2X = cX - dx * 0.45;
      const cp2Y = cY;
      return `M ${pX} ${pY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cX} ${cY}`;
    } else {
      const cp1X = pX;
      const cp1Y = pY + dy * 0.45;
      const cp2X = cX;
      const cp2Y = cY - dy * 0.45;
      return `M ${pX} ${pY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cX} ${cY}`;
    }
  };

  // Render SVG connections
  const renderSVGConnections = () => {
    if (!activeMap) return null;
    return activeMap.nodes.map(node => {
      if (node.parentId === null) return null;
      const parent = activeMap.nodes.find(n => n.id === node.parentId);
      if (!parent) return null;
      
      const pX = parent.x ?? 1200;
      const pY = parent.y ?? 750;
      const cX = node.x ?? 1200;
      const cY = node.y ?? 750;
      
      const path = getAdaptiveBezierPath(pX, pY, cX, cY);
      
      return (
        <g key={`edge-${node.id}`} className="group">
          {/* Back glows for extra luxury styling */}
          <path 
            d={path} 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="opacity-20 group-hover:opacity-40 transition-opacity" 
          />
          <path 
            d={path} 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            className="opacity-70 group-hover:opacity-100 transition-opacity" 
          />
          {/* Dynamic signal pulse */}
          <circle cx={cX} cy={cY} r="4" fill="#6366F1" className="opacity-80 shadow-xs" />
        </g>
      );
    });
  };

  // Render nodes list absolutely positioned
  const renderCanvasNodes = () => {
    if (!activeMap) return null;
    return activeMap.nodes.map(node => {
      const isRoot = node.parentId === null;
      const isEditing = editingNodeId === node.id;
      const isBeingDragged = draggingNodeId === node.id;

      const size = node.size || 'md';
      const shape = node.shape || 'rounded';

      const shapeClass = 
        shape === 'pill' ? 'rounded-full px-5 py-2' : 
        shape === 'circle' ? 'rounded-full aspect-square w-20 h-20 flex items-center justify-center text-center p-1.5' : 
        shape === 'square' ? 'rounded-none px-4 py-3' : 
        shape === 'oval' ? 'rounded-[50%/35%] px-5 py-3' : 
        'rounded-2xl px-4.5 py-3';

      const sizeClass = 
        size === 'sm' ? 'text-[10px] sm:max-w-[130px]' : 
        size === 'lg' ? 'text-sm font-extrabold sm:max-w-[220px]' : 
        'text-xs font-bold sm:max-w-[175px]';

      const borderStyleClass = 
        node.borderStyle === 'dashed' ? 'border-dashed' : 
        node.borderStyle === 'dotted' ? 'border-dotted' : 
        'border-solid';

      return (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
          className={`absolute flex flex-col items-center select-none z-10 transition-shadow ${
            isBeingDragged ? 'z-30 cursor-grabbing' : 'cursor-grab hover:z-20'
          }`}
          style={{
            left: `${node.x ?? 1200}px`,
            top: `${node.y ?? 750}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            animate={isBeingDragged ? { scale: 1.05 } : { scale: 1 }}
            className={`shadow-md border-2 ${node.color} ${shapeClass} ${sizeClass} ${borderStyleClass} group relative text-center flex flex-col justify-center min-h-[44px]`}
          >
            {isEditing ? (
              <div className="flex flex-col gap-1.5 p-1 w-full max-w-[170px]">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onBlur={() => handleSaveNodeText(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNodeText(node.id);
                    if (e.key === 'Escape') setEditingNodeId(null);
                  }}
                  className="w-full text-xs font-bold text-center bg-white/90 rounded-lg px-2 py-1 outline-none text-slate-800 border border-slate-350"
                  autoFocus
                />
                <div className="flex justify-center gap-1.5">
                  <button
                    type="button"
                    onMouseDown={() => handleSaveNodeText(node.id)}
                    className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-black uppercase transition-all"
                  >
                    {t.saveText}
                  </button>
                  <button
                    type="button"
                    onMouseDown={() => setEditingNodeId(null)}
                    className="px-2 py-0.5 bg-slate-350 hover:bg-slate-400 text-slate-800 rounded text-[9px] font-black uppercase transition-all"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center py-0.5">
                <p 
                  onClick={() => handleStartEditing(node)}
                  className="text-xs font-extrabold leading-normal cursor-text whitespace-normal break-words max-w-full px-1 py-0.5 select-all hover:bg-black/5 rounded outline-none"
                  title={language === 'EU' ? 'Klikatu testua editatzeko' : 'Haz clic para editar el texto'}
                >
                  {node.text}
                </p>
                
                {/* Visual float action bubble controls */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 mt-1 border-t border-black/5 pt-1 w-full transition-opacity duration-200 pointer-events-auto">
                  <button
                    onClick={() => handleAddChildNode(node.id)}
                    className="p-1 hover:bg-black/10 rounded-lg text-slate-705 transition-all cursor-pointer"
                    title={t.addSubidea}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
   
                  <span className="relative group/customizer inline-block">
                    <button
                      type="button"
                      className="p-1 hover:bg-black/10 rounded-lg text-slate-705 transition-all cursor-pointer flex items-center justify-center"
                      title={language === 'EU' ? 'Pertsonalizatu' : 'Personalizar aspecto'}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-505" />
                    </button>
                    
                    <div className="hidden group-hover/customizer:flex flex-col gap-2.5 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-xl rounded-2xl z-40 w-52 text-left">
                      {/* Shapes */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">
                          {language === 'EU' ? 'Forma' : 'Forma'}
                        </span>
                        <div className="grid grid-cols-5 gap-0.5">
                          {(['rounded', 'pill', 'circle', 'square', 'oval'] as const).map(sh => (
                            <button
                              key={sh}
                              type="button"
                              onClick={() => handleChangeNodeShape(node.id, sh)}
                              className={`py-0.5 text-[8px] font-bold rounded border transition-all text-center truncate ${
                                (node.shape || 'rounded') === sh 
                                  ? 'bg-[#1B365D] text-white border-transparent' 
                                  : 'bg-slate-50 dark:bg-white/5 border-slate-205 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                              title={sh.toUpperCase()}
                            >
                              {sh.slice(0,3).toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sizes */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">
                          {language === 'EU' ? 'Tamaina' : 'Tamaño'}
                        </span>
                        <div className="grid grid-cols-3 gap-0.5">
                          {(['sm', 'md', 'lg'] as const).map(sz => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleChangeNodeSize(node.id, sz)}
                              className={`py-0.5 text-[8px] font-bold rounded border transition-all ${
                                (node.size || 'md') === sz 
                                  ? 'bg-[#1B365D] text-white border-transparent' 
                                  : 'bg-slate-50 dark:bg-white/5 border-slate-205 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {sz.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Borders */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">
                          {language === 'EU' ? 'Ertza' : 'Borde'}
                        </span>
                        <div className="grid grid-cols-3 gap-0.5">
                          {(['solid', 'dashed', 'dotted'] as const).map(bs => (
                            <button
                              key={bs}
                              type="button"
                              onClick={() => handleChangeNodeBorderStyle(node.id, bs)}
                              className={`py-0.5 text-[8px] font-bold rounded border transition-all ${
                                (node.borderStyle || 'solid') === bs 
                                  ? 'bg-[#1B365D] text-white border-transparent' 
                                  : 'bg-slate-50 dark:bg-white/5 border-slate-205 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {bs.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">
                          {language === 'EU' ? 'Kolorea' : 'Color de fondo'}
                        </span>
                        <div className="grid grid-cols-6 gap-1">
                          {COLOR_PRESETS.map(col => {
                            const isSelected = node.color === col.bg;
                            return (
                              <button
                                key={col.name}
                                type="button"
                                onClick={() => handleChangeNodeColor(node.id, col.bg)}
                                className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${col.bg.split(' ')[0]} ${
                                  isSelected ? 'ring-2 ring-indigo-500 scale-105 border-white' : 'border-slate-300/50'
                                }`}
                                title={col.name}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </span>

                  <button
                    onClick={() => handleStartEditing(node)}
                    className="p-1 hover:bg-black/10 rounded-lg text-slate-705 transition-all cursor-pointer animate-none"
                    title={language === 'EU' ? 'Editatu testua' : 'Editar texto'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {!isRoot && (
                    <button
                      onClick={() => handleDeleteNodeAndDescendants(node.id)}
                      className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-all cursor-pointer"
                      title={t.removeNode}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      );
    });
  };



  return (
    <div className="liquid-glass p-6 md:p-8 rounded-[32px] text-left space-y-5">
      {/* Upper header section with tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1B365D]/10 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1B365D] dark:text-sky-400 tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-500 animate-pulse rotate-90" />
            {activeTab === 'editor' ? t.title : t.galleryView}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {activeTab === 'editor' ? t.desc : (language === 'EU' ? 'Kudeatu zure mapa mentalak, kopiatu, aldatu izena eta gorde web-ean.' : 'Administra tus esquemas, duplícalos, cámbiales el nombre y abre tus ideas.')}
          </p>
        </div>
        
        {/* Tab Toggle control */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <button
              onClick={() => setActiveTab('editor')}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-800 text-[#1B365D] dark:text-sky-305 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 rotate-90" />
              <span>{t.canvasEditor}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('gallery');
                setRenamingMapId(null);
              }}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all relative cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-white dark:bg-slate-800 text-[#1B365D] dark:text-sky-350 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{t.galleryView}</span>
              <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                {mindMaps.length}
              </span>
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  triggerStatusMessage(t.saveSuccess);
                }}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                title={t.saveWebBtn}
              >
                <Cloud className="w-4 h-4" />
                <span>{language === 'EU' ? 'Gorde' : 'Guardar en Web'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'editor' ? (
        <>
          {/* Editor Header Details: Select Draft, Rename Active Draft */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-white dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#1b365d]/50 dark:text-slate-400">
                {language === 'EU' ? 'Mapa aktiboa:' : 'Mapa activo:'}
              </span>
              
              {isEditingActiveTitle ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeTitleInput.trim()) {
                      handleRenameMapInState(activeMapId, activeTitleInput);
                      setIsEditingActiveTitle(false);
                      triggerStatusMessage(language === 'EU' ? 'Maparen izena aldatu da!' : '¡Título de mapa actualizado!');
                    }
                  }}
                  className="flex items-center gap-1.5 border-none bg-transparent"
                >
                  <input
                    type="text"
                    value={activeTitleInput}
                    onChange={(e) => setActiveTitleInput(e.target.value)}
                    className="px-2 py-1 text-xs font-bold outline-none border border-indigo-400 rounded-lg bg-white dark:bg-slate-900 text-[#1B365D] dark:text-sky-300"
                    autoFocus
                    onBlur={() => {
                      if (activeTitleInput.trim()) {
                        handleRenameMapInState(activeMapId, activeTitleInput);
                      }
                      setIsEditingActiveTitle(false);
                    }}
                  />
                  <button type="submit" className="p-1 text-emerald-500 hover:bg-emerald-55 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h3 className="text-xs font-extrabold text-[#1B365D] dark:text-sky-300">
                    {activeMap ? activeMap.title : ''}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeMap) {
                        setActiveTitleInput(activeMap.title);
                        setIsEditingActiveTitle(true);
                      }
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-all cursor-pointer opacity-70 hover:opacity-100"
                    title={t.renameMap}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Dropdown File Switcher */}
              <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white dark:border-white/10">
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                <select
                  value={activeMapId}
                  onChange={(e) => setActiveMapId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-[#1B365D] dark:text-white outline-none cursor-pointer"
                >
                  {mindMaps.map(map => (
                    <option key={map.id} value={map.id}>{map.title}</option>
                  ))}
                </select>
              </div>

              {/* Duplicate Active Map directly */}
              <button
                onClick={() => {
                  if (activeMap) {
                    handleCloneMap(activeMap);
                  }
                }}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer animate-none"
                title={language === 'EU' ? 'Bikoiztu mapa aktiboa' : 'Duplicar este mapa'}
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteActiveMap}
                type="button"
                className="p-2 border border-red-200 bg-red-50 hover:bg-red-105 dark:bg-red-950/20 text-red-650 rounded-xl transition-all cursor-pointer shrink-0"
                title={t.deleteMap}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Open to Full Canvas screen */}
              <button
                onClick={() => {
                  setIsFullscreen(true);
                  setZoomLevel(1);
                  triggerStatusMessage(language === 'EU' ? 'Mendikune canvas modu osoa ireki da!' : '¡Modo de editor canvas a pantalla completa activado!');
                }}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-650 dark:text-indigo-300 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs shrink-0"
                title={language === 'EU' ? 'Ireki modu osoan' : 'Abrir editor canvas a pantalla completa'}
              >
                <Maximize2 className="w-4 h-4 text-indigo-500" />
                <span>{language === 'EU' ? 'Canvas Modu Osoa' : 'Editor Canvas'}</span>
              </button>
            </div>
          </div>

          {/* Sketch dynamic map quick creation tool bar */}
          <form onSubmit={handleCreateMap} className="flex gap-2 bg-white/75 dark:bg-slate-900/40 p-2 rounded-2xl border border-white/85 dark:border-white/10 shadow-xs">
            <input
              type="text"
              value={newMapTitle}
              onChange={(e) => setNewMapTitle(e.target.value)}
              placeholder={t.mapTitlePlaceholder}
              className="flex-1 text-xs px-3 py-2 bg-transparent outline-none border-none text-[#2C3E50] dark:text-white placeholder:text-slate-400 font-medium whitespace-nowrap"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1B365D] hover:bg-[#132743] hover:shadow-xs active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
              <span>{t.create}</span>
            </button>
          </form>

          {/* Embedded canvas area */}
          <div 
            ref={canvasRef}
            className="w-full h-[440px] overflow-auto bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/10 rounded-[28px] relative select-none cursor-grab active:cursor-grabbing"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px'
            }}
          >
            <div className="relative w-[2400px] h-[1500px]">
              {/* Svg Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                {renderSVGConnections()}
              </svg>

              {/* Absolutely placed flat nodes */}
              {activeMap ? renderCanvasNodes() : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-904">
                  <GitFork className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-xs font-bold text-slate-400">Selecciona o crea un mapa mental para comenzar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive visual tutorial tip badge */}
          <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-white/5 p-3.5 rounded-2xl text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <p>{t.instructions}</p>
          </div>
        </>
      ) : (
        /* SAVED MINDMAPS STUNNING GALLERY VIEW */
        <div className="space-y-4">
          {/* Gallery Tools bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-white dark:border-white/5">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-405 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-white/10 outline-none text-slate-800 dark:text-white"
              />
            </div>

            <div className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-xl">
              {language === 'EU' ? `${mindMaps.length} mapa gorde dira webgune onetan` : `Sincronizados localmente: ${mindMaps.length} mapas`}
            </div>
          </div>

          {/* Bento-grid Card listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Elegant Creator "Add New Card" inside the Gallery */}
            <div className="p-5 border-2 border-dashed border-indigo-400/35 hover:border-indigo-400 bg-indigo-50/10 hover:bg-indigo-50/25 dark:bg-indigo-950/5 dark:hover:bg-indigo-950/10 rounded-[24px] flex flex-col justify-between min-h-[220px] transition-all duration-350">
              <div>
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-500 tracking-wider uppercase mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  {language === 'EU' ? 'Proiektu Berria' : 'Diseño Creativo'}
                </span>
                <h3 className="text-sm font-black text-[#1B365D] dark:text-sky-305">
                  {language === 'EU' ? 'Map berria sortu' : 'Nuevo Mapa Mental'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'EU' ? 'Hasi planifikatzen idea zentral batetik abiatuta.' : 'Escribe una idea clave para iniciar un nuevo documento gráfico.'}
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMapTitle.trim()) {
                    handleCreateMap(e);
                    setActiveTab('editor'); // automatically switch to editor
                  }
                }}
                className="mt-4 space-y-2"
              >
                <input
                  type="text"
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  placeholder={t.mapTitlePlaceholder}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl outline-none text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newMapTitle.trim()}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-55 disabled:cursor-not-allowed justify-center text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.create}</span>
                </button>
              </form>
            </div>

            {/* Existing mindmaps list */}
            {mindMaps
              .filter(m => m.title.toLowerCase().includes(gallerySearch.toLowerCase()))
              .map((map) => {
                const totalNodes = map.nodes.length;
                const rootNode = map.nodes.find(n => n.parentId === null) || map.nodes[0];
                const cleanRootText = rootNode ? rootNode.text : (language === 'EU' ? 'Hutsik' : 'Vacío');

                return (
                  <motion.div
                    key={map.id}
                    layoutId={`gallery-card-${map.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className={`p-5 rounded-[24px] border flex flex-col justify-between gap-4 transition-all duration-350 min-h-[220px] ${
                      activeMapId === map.id 
                        ? 'bg-white dark:bg-slate-900 border-indigo-400 ring-1 ring-indigo-400/20 shadow-lg' 
                        : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Diagram Representation preview box */}
                      <div className="w-full h-20 bg-slate-50 dark:bg-slate-950/60 rounded-xl overflow-hidden relative border border-slate-200/50 dark:border-white/5 flex items-center justify-center">
                        <div className="relative w-full h-full opacity-60">
                          <svg className="absolute inset-0 w-full h-full stroke-indigo-300/40 dark:stroke-slate-700/80 stroke-[1.5px] fill-none">
                            {map.nodes.slice(0, 10).map((n) => {
                              if (!n.parentId) return null;
                              const p = map.nodes.find(parent => parent.id === n.parentId);
                              if (!p) return null;
                              const nX = 110 + ((n.x ?? 1200) - 1200) * 0.08;
                              const nY = 40 + ((n.y ?? 750) - 750) * 0.08;
                              const pX = 110 + ((p.x ?? 1200) - 1200) * 0.08;
                              const pY = 40 + ((p.y ?? 750) - 750) * 0.08;
                              return (
                                <path key={n.id} d={`M ${pX} ${pY} Q ${(pX+nX)/2} ${(pY+nY)/2} ${nX} ${nY}`} />
                              );
                            })}
                          </svg>
                          {map.nodes.slice(0, 10).map((n) => {
                            const nX = 110 + ((n.x ?? 1200) - 1200) * 0.08;
                            const nY = 40 + ((n.y ?? 750) - 750) * 0.08;
                            const colVal = n.color ? n.color.split(' ')[0] : 'bg-indigo-300';
                            return (
                              <div
                                key={n.id}
                                className={`absolute w-1.5 h-1.5 rounded-full border border-white dark:border-slate-800 ${colVal}`}
                                style={{
                                  left: `${nX - 3}px`,
                                  top: `${nY - 3}px`
                                }}
                              />
                            );
                          })}
                        </div>
                        {/* Interactive floating bubble */}
                        <div className="absolute top-2 right-2 text-[9px] font-mono font-black text-indigo-505 bg-indigo-505/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {totalNodes} {totalNodes === 1 ? (language === 'EU' ? 'Adar' : 'Idea') : (language === 'EU' ? 'Adar' : 'Ramas')}
                        </div>
                      </div>

                      {/* Map Title Rename section */}
                      {renamingMapId === map.id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={renameInputVal}
                            onChange={(e) => setRenameInputVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameMapInState(map.id, renameInputVal);
                                setRenamingMapId(null);
                                triggerStatusMessage(language === 'EU' ? 'Izena aldatuta' : 'Nombre cambiado con éxito');
                              } else if (e.key === 'Escape') {
                                setRenamingMapId(null);
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-indigo-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg outline-none"
                            placeholder={t.renamePlaceholder}
                            autoFocus
                          />
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setRenamingMapId(null)}
                              className="px-2 py-1 text-[10px] border border-slate-205 dark:border-white/10 text-slate-500 rounded bg-white dark:bg-slate-800"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => {
                                handleRenameMapInState(map.id, renameInputVal);
                                setRenamingMapId(null);
                                triggerStatusMessage(language === 'EU' ? 'Izena aldatuta' : 'Nombre cambiado con éxito');
                              }}
                              className="px-2.5 py-1 text-[10px] bg-emerald-500 text-white font-bold rounded flex items-center gap-0.5 pointer-events-auto"
                            >
                              <Check className="w-3 h-3" />
                              <span>{t.saveText}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-[#1B365D] dark:text-white line-clamp-1 group-hover:text-indigo-505">
                              {map.title}
                            </h4>
                            <p className="text-[10px] text-slate-505 dark:text-slate-400 font-semibold line-clamp-1 mt-0.5">
                              {language === 'EU' ? 'Sustraia: ' : 'Raíz: '} <span className="opacity-80 font-normal italic">"{cleanRootText}"</span>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setRenamingMapId(map.id);
                              setRenameInputVal(map.title);
                            }}
                            className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-500 hover:text-indigo-650 rounded-lg transition-all cursor-pointer"
                            title={t.renameMap}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer elements */}
                    <div className="space-y-2.5 border-t border-slate-100 dark:border-white/5 pt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{map.updatedAt}</span>
                        </span>
                        
                        {activeMapId === map.id && (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono">
                            {language === 'EU' ? 'AKTIBOA' : 'ACTIVO'}
                          </span>
                        )}
                      </div>

                      {/* Card Bottom Operation control */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveMapId(map.id);
                            setActiveTab('editor'); // reload to editor mode
                            triggerStatusMessage(language === 'EU' ? 'Kargatuta!' : '¡Esquema de mapa mental cargado!');
                          }}
                          className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                            activeMapId === map.id
                              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                              : 'bg-[#1B365D] hover:bg-[#132743] hover:shadow-xs text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t.selectToEdit}</span>
                        </button>

                        <button
                          onClick={() => handleCloneMap(map)}
                          className="p-1.5 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-500 transition-all cursor-pointer animate-none"
                          title={language === 'EU' ? 'Mapa bikoiztu' : 'Duplicar Mapa'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteMapById(map.id)}
                          className="p-1.5 border border-red-200/60 dark:border-red-955/40 bg-red-50/20 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 rounded-lg text-red-500 transition-all cursor-pointer"
                          title={language === 'EU' ? 'Mapa ezabatu' : 'Eliminar Mapa'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            {mindMaps.filter(m => m.title.toLowerCase().includes(gallerySearch.toLowerCase())).length === 0 && (
              <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl p-6">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">{t.noMapsFound}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Canvas Editor Pro rendered via React Portal directly into body to prevent parent stacking contexts / z-index conflicts with headers like DynamicIsland */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 z-[9999] bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col h-screen select-none overflow-hidden"
            >
              {/* Top Bar for Fullscreen Editor with professional tools */}
              <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-sm shrink-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <GitFork className="w-5 h-5 animate-pulse rotate-90" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-sm font-black text-slate-905 dark:text-white flex items-center gap-2">
                      <span>{activeMap ? activeMap.title : t.title}</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold font-mono shrink-0">Canvas Editor Pro</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {language === 'EU' ? 'Ideiak pertsonalizatu, mugitu eta berrantolatu eremu mugarik gabe.' : 'Personaliza, arrastra y reorganiza tus ideas con total libertad y zoom dinámico.'}
                    </p>
                  </div>
                </div>

                {/* Scale, Zooms and Force alignment controls */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.15))}
                    className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    title="Alejar (Zoom Out)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="range"
                      min="0.4"
                      max="1.6"
                      step="0.05"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-20 md:w-28 accent-indigo-500 cursor-pointer h-1"
                    />
                    <span className="text-[10px] font-mono font-black w-10 text-center text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15 py-0.5 rounded">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                    className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    title="Acercar (Zoom In)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="h-4 border-l border-slate-300 dark:border-white/10 mx-1"></div>

                  <button
                    type="button"
                    onClick={handleForceLayoutArrange}
                    className="px-2.5 py-1.5 hover:bg-white dark:hover:bg-white/10 rounded-xl text-[#1B365D] dark:text-sky-400 flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer"
                    title={language === 'EU' ? 'Berrantolatu adarrak' : 'Auto-organizar esquema'}
                  >
                    <Layout className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="hidden sm:inline">{language === 'EU' ? 'Ordenatu' : 'Reordenar'}</span>
                  </button>
                </div>

                {/* Save Image & Close handles */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerStatusMessage(language === 'EU' ? 'Proiektua ondo esportatu da JPG bezala!' : '¡Esquema guardado y exportado exitosamente!');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'EU' ? 'Gorde' : 'Guardar Imagen'}</span>
                  </button>

                  <button
                    onClick={() => setIsFullscreen(false)}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1B365D] hover:bg-[#132743] hover:shadow-lg text-white rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0"
                    title="Cerrar Editor"
                  >
                    <Minimize2 className="w-4 h-4 text-sky-450" />
                    <span>{language === 'EU' ? 'Itxi' : 'Cerrar Canvas'}</span>
                  </button>
                </div>
              </div>

              {/* Canvas area (2400 x 1500 px scroll area) */}
              <div 
                ref={canvasRef}
                id="full-viewport-canvas"
                className="flex-1 overflow-auto relative p-4 cursor-grab select-none w-full h-full"
                style={{ 
                  backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1.2px, transparent 1.2px)',
                  backgroundSize: '24px 24px'
                }}
              >
                <div 
                  className="relative w-[2400px] h-[1500px]"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                >
                  {/* Overlaying connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    {renderSVGConnections()}
                  </svg>

                  {/* Rendering absolute positioned flat nodes */}
                  {renderCanvasNodes()}
                </div>
              </div>

              {/* Left panel instructions overlay */}
              <div className="absolute left-6 bottom-6 z-10 w-64 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl text-left flex flex-col gap-2.5">
                <h3 className="text-xs font-black text-[#1B365D] dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  {language === 'EU' ? 'Argibide azkarrak' : 'Controles del Canvas'}
                </h3>
                <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <li className="flex gap-1.5">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <p>{language === 'EU' ? 'Mugitu adarrak: arrastatu klik eginez.' : 'Mover ideas: Arrastra cualquier nodo.'}</p>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <p>{language === 'EU' ? 'Aldatu testua: klik egin izenburu barruan.' : 'Renombrar: Clic directo sobre el texto para editar.'}</p>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <p>{language === 'EU' ? 'Lotura berria: sakatu (+) adarrean.' : 'Sub-ramas: Usa el (+) para crear sub-ideas.'}</p>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <p>{language === 'EU' ? 'Berrantolatu: berrantolaketa botoia erabili.' : 'Arreglar: Botón Reordenar arriba para auto-alinear.'}</p>
                  </li>
                </ul>
              </div>
              
              <div className="absolute right-6 bottom-6 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 border border-slate-205 dark:border-white/15 rounded-full flex items-center gap-2 text-[10px] font-mono font-black text-indigo-500 z-10">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'EU' ? 'SINKRONIZATUTA' : 'PERSISTENCIA INTEGRADA'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
