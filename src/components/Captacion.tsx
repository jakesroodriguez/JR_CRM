import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, Search, AlertCircle, Phone, MapPin, Globe, CheckCircle, ArrowRight, Star, Plus } from 'lucide-react';
import { LOCAL_POTENTIAL_BUSINESSES } from '../data/mockLeads';
import { Lead } from '../types';

interface CaptacionProps {
  onAddProjectFromLead: (lead: Lead) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export default function Captacion({
  onAddProjectFromLead,
  isScanning,
  setIsScanning
}: CaptacionProps) {
  const [hasScanned, setHasScanned] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [foundLeads, setFoundLeads] = useState<Lead[]>([]);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);

  const scanSteps = [
    'Estableciendo conexión segura con Google Maps Geocoding...',
    'Consultando cuadrantes en Urretxu, Zumarraga y valles colindantes...',
    'Localizando comercios, locales de hostelería y despachos de servicios...',
    'Extrayendo números de teléfono y metadatos de Google Places...',
    'Analizando registros DNS y rastreando etiquetas META en búsqueda de sitios web activos...',
    'Flitrado crítico: Extrayendo únicamente negocios con Website = NULL (Sin presencia digital)...',
    'Compilando listado final de oportunidades calientes en Urretxu y Zumarraga...'
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setHasScanned(false);
    setScanStep(0);
    setFoundLeads([]);
    setScanLogs([]);
    setOutreachLead(null);
  };

  useEffect(() => {
    if (!isScanning) return;

    if (scanStep < scanSteps.length) {
      const timer = setTimeout(() => {
        setScanLogs((prev) => [...prev, scanSteps[scanStep]]);
        setScanStep((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      // Fin del escaneo
      const timer = setTimeout(() => {
        setIsScanning(false);
        setHasScanned(true);
        // Filtramos negocios locales del listado que no tengan web
        const filtered = LOCAL_POTENTIAL_BUSINESSES.filter((b) => !b.hasWebsite);
        setFoundLeads(filtered);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isScanning, scanStep]);

  // Plantilla de mensaje de contacto rápido
  const getOutreachMessage = (lead: Lead) => {
    return `Kaixo, ${lead.name}!\n\nMe llamo Jon y soy desarrollador web aquí en Urretxu. He visto vuestra ficha de Google Maps y me he dado cuenta de que no tenéis vuestra página web activa.\n\nHoy en día, más del 80% de los vecinos de Urretxu y Zumarraga buscan vuestro sector en el móvil antes de salir de casa o para pedir por teléfono. Estoy ayudando a comercios locales a digitalizarse con diseños ultra-rápidos que multiplican clientes.\n\n¿Te vendría bien una llamada de 5 minutos el lunes para que te enseñe una propuesta visual gratuita de cómo se vería ${lead.name} en internet?\n\nUn saludo, Jon (JR Web Development)`;
  };

  const handleCopyOutreach = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mensaje de prospección copiado al portapapeles. ¡Listo para enviar!');
  };

  return (
    <div className="space-y-8 mt-6">
      
      {/* Cabecera de Captación */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">El Botón de Oro</h2>
          <p className="text-[#2C3E50]/70 font-medium">Buscador y extractor automático de negocios sin página web en la comarca del Urola.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-100 text-orange-700 flex items-center gap-1.5 border border-orange-200">
            Filtro: Sin presencia web
          </span>
        </div>
      </div>

      {/* Main Scanner Card */}
      {!isScanning && !hasScanned ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass p-8 rounded-[32px] text-center max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 relative overflow-hidden group border-2 border-dashed border-[#1B365D]/20 hover:border-[#1B365D]/40 transition-all duration-300"
        >
          {/* Fondo estético */}
          <div className="absolute inset-0 bg-radial-gradient from-[#1B365D]/5 to-transparent pointer-events-none" />
          
          <div className="p-5 bg-[#1B365D]/15 rounded-full text-[#1B365D] relative">
            <Radar className="h-14 w-14 animate-pulse" />
            <span className="absolute inset-0 rounded-full bg-[#1B365D]/10 animate-ping" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-[#1B365D]">Prospección Inteligente de Urretxu</h3>
            <p className="text-[#2C3E50]/70 text-sm max-w-md mx-auto">
              Sincroniza y escanea la base de datos local de Google Maps para identificar comercios analógicos con un alto factor de conversión.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="btn-oro-search"
              onClick={handleStartScan}
              className="px-8 py-4 bg-[#1B365D] hover:bg-[#132743] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-3 group text-base"
            >
              <Star className="h-5 w-5 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Buscar Oportunidades en Urretxu</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-4">
            <Globe className="h-4 w-4" />
            <span>Verifica registros WHOIS, DNS y Google Place Ratings en Zumarraga y alrededores</span>
          </div>
        </motion.div>
      ) : null}

      {/* Pantalla de Escaneo Activo */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="liquid-glass p-8 rounded-[32px] max-w-2xl mx-auto space-y-6 overflow-hidden relative"
          >
            <div className="flex items-center gap-4 border-b border-slate-200/50 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1B365D] flex items-center justify-center text-white">
                <Radar className="h-5 w-5 animate-spin" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-[#1B365D]">Mapeador Google Places Activo</h3>
                <p className="text-xs font-semibold text-slate-400">Analizando cobertura de red comercial</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#1B365D]/10 text-[#1B365D] px-2.5 py-1 rounded-lg">
                Paso {scanLogs.length} de {scanSteps.length}
              </span>
            </div>

            {/* Consola de logs simulada */}
            <div className="bg-[#0F172A] text-[#38BDF8] p-5 rounded-2xl h-[180px] overflow-y-auto font-mono text-xs space-y-2 border border-white/5 shadow-inner">
              <AnimatePresence>
                {scanLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-emerald-400">⚡</span>
                    <span className="text-white/90">{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="animate-pulse flex items-center gap-1.5 h-4 pt-1 font-semibold text-emerald-400">
                <span>⚡</span>
                <span>Procesando trazas de red y mapeando webs locales...</span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#1B365D]">
                <span>Escaneando metabuscadores</span>
                <span>{Math.round((scanLogs.length / scanSteps.length) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#1B365D] to-[#38BDF8]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(scanLogs.length / scanSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados de Prospección */}
      <AnimatePresence>
        {hasScanned && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Cabecera / Estadísticas de la búsqueda */}
            <div className="liquid-glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#1B365D]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B365D] text-base">Escaneo Completado con Éxito</h3>
                  <p className="text-xs font-semibold text-slate-500">Se han auditado 16 fichas de Maps en Urretxu y Zumarraga.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center sm:text-right">
                  <span className="block text-2xl font-extrabold text-[#1B365D]">{foundLeads.length}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Oportunidades Sin Presencia</span>
                </div>
              </div>
            </div>

            {/* Grid de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  whileHover={{ y: -4 }}
                  className="liquid-glass p-6 rounded-[24px] flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 relative border border-[#1B365D]/10"
                >
                  <div className="space-y-4">
                    {/* Badge Sector */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        lead.sector === 'Hostelería' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        lead.sector === 'Comercio' ? 'bg-[#38BDF8]/10 text-[#1B365D] border border-[#38BDF8]/20' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {lead.sector}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-100/50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-red-200">
                        <Globe className="h-3 w-3" />
                        Sin Página Web
                      </span>
                    </div>

                    {/* Comercio Info */}
                    <div>
                      <h4 className="text-xl font-bold text-[#1B365D] leading-tight group-hover:text-[#132743]">{lead.name}</h4>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.location}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 mt-1.5 hover:underline transition-all duration-200 group/map inline-flex"
                        title="Ver en Google Maps"
                      >
                        <MapPin className="h-3.5 w-3.5 text-blue-500 group-hover/map:scale-110 transition-transform" />
                        <span>{lead.location} ↗</span>
                      </a>
                    </div>

                    {/* Descripción de oportunidad */}
                    <div className="p-3 bg-white/40 border border-[#E1E8ED]/30 rounded-xl">
                      <p className="text-xs text-[#2C3E50]/80 font-medium leading-relaxed italic">
                        "{lead.notes}"
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2C3E50]">
                      <Phone className="h-3.5 w-3.5 text-[#1B365D]" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>

                  {/* Acciones del Lead */}
                  <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => setOutreachLead(lead)}
                      className="px-3 py-2 bg-[#E1E8ED]/50 hover:bg-[#E1E8ED]/80 text-[#1B365D] text-xs font-bold rounded-xl transition-all"
                    >
                      Ver Mensaje
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddProjectFromLead(lead)}
                      className="px-3 py-2 bg-[#1B365D] hover:bg-[#132743] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 group"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Captar Web
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reset/Buscar más */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleStartScan}
                className="px-6 py-2.5 bg-white border border-[#E1E8ED] hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Radar className="h-4 w-4 text-[#1B365D]" />
                Volver a Escanear Urretxu / Zumarraga
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal / Panel de Mensaje de Outreach */}
      <AnimatePresence>
        {outreachLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOutreachLead(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="liquid-glass p-6 rounded-[28px] max-w-lg w-full z-10 space-y-4 border border-white/50 relative text-left"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                <div>
                  <h3 className="text-xl font-bold text-[#1B365D]">{outreachLead.name}</h3>
                  <p className="text-xs font-semibold text-slate-400">Guion de prospección personalizado</p>
                </div>
                <button
                  onClick={() => setOutreachLead(null)}
                  className="h-7 w-7 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Copia este mensaje y envíalo:</p>
                <textarea
                  readOnly
                  rows={10}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 leading-relaxed text-slate-700"
                  value={getOutreachMessage(outreachLead)}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyOutreach(getOutreachMessage(outreachLead!))}
                  className="flex-1 py-3 bg-[#1B365D] hover:bg-[#132743] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
                  <span>Copiar Mensaje de Oro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddProjectFromLead(outreachLead!);
                    setOutreachLead(null);
                  }}
                  className="px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-all"
                >
                  Captar Directamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
