import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Calendar, Mail, Compass, ShieldCheck, DollarSign, ArrowRight, UserPlus, FileEdit, Trash2, Send, Clock, MapPin, Globe } from 'lucide-react';
import { Project, ProjectState, SectorType, AppSettings } from '../types';

interface MisClientesProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  settings: AppSettings;
  triggerStatusMessage: (message: string) => void;
}

export default function MisClientes({
  projects,
  setProjects,
  settings,
  triggerStatusMessage
}: MisClientesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeStateFilter, setActiveStateFilter] = useState<ProjectState | 'Todos'>('Todos');

  // Form states
  const [comercio, setComercio] = useState('');
  const [sector, setSector] = useState<SectorType>('Comercio');
  const [dominioComprado, setDominioComprado] = useState('');
  const [ubicacion, setUbicacion] = useState('Urretxu');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [precioVenta, setPrecioVenta] = useState(0);

  // Email draft helper modal
  const [draftModalData, setDraftModalData] = useState<{
    project: Project;
    subject: string;
    body: string;
    stage: 'Diseño' | 'Entrega';
  } | null>(null);

  // States pipeline sequence
  const pipelineStates: ProjectState[] = ['Contacto', 'Estructura', 'Diseño', 'Entrega'];

  // Guardar proyecto (Nuevo o Editando)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercio || !ubicacion) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      comercio,
      sector,
      dominioComprado: dominioComprado || `${comercio.toLowerCase().replace(/\s+/g, '')}.eus`,
      ubicacion,
      fechaEntrega: fechaEntrega || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      precioVenta: Number(precioVenta),
      estado: 'Contacto',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);

    // Guardado en Sheets automatizado por Apps Script
    triggerStatusMessage(`Registrando "${comercio}"...`);
    await sendToGoogleAppsScript('create_project', newProject);

    // Reset Form
    setComercio('');
    setSector('Comercio');
    setDominioComprado('');
    setUbicacion('Urretxu');
    setFechaEntrega('');
    setPrecioVenta(0);
    setShowAddModal(false);
  };

  // Enviar a Google Apps Script Webhook
  const sendToGoogleAppsScript = async (action: string, data: any) => {
    if (!settings.googleAppsScriptUrl) {
      // Simulado
      setTimeout(() => {
        triggerStatusMessage(`Sincronizado con Google Sheets con éxito (Simulado)`);
      }, 1000);
      return;
    }

    try {
      // POST al Webhook público del usuario de Google Apps Script
      await fetch(settings.googleAppsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload: data })
      });
      triggerStatusMessage(`Automatización Google Sheets ejecutada con éxito`);
    } catch (err) {
      console.error('Error al conectar con el webhook de Google', err);
      triggerStatusMessage(`Error de envío a Google Sheets. Revisa la URL.`);
    }
  };

  // Cambiar estado del Pipeline e invocar flujos automáticos (Gmail & Calendar)
  const handleChangeState = async (project: Project, nextState: ProjectState) => {
    const updated = projects.map((p) => {
      if (p.id === project.id) {
        const updatedProj = { ...p, estado: nextState };

        // Al mover a "Diseño" o "Entrega", gatillar visualización de Gmail Draft automático
        if (nextState === 'Diseño' || nextState === 'Entrega') {
          generateGmailDraft(updatedProj, nextState);
        }

        // Al mover y tener una Fecha de Entrega, agendar hito en Google Calendar
        if (nextState === 'Entrega' || (nextState === 'Estructura' && p.fechaEntrega)) {
          triggerCalendarAutomation(updatedProj);
        }

        return updatedProj;
      }
      return p;
    });

    setProjects(updated);
    
    // Comunicar cambio a Google Sheets
    triggerStatusMessage(`Actualizando estado de ${project.comercio} a "${nextState}"`);
    const activeProject = updated.find((p) => p.id === project.id);
    if (activeProject) {
      await sendToGoogleAppsScript('update_project_state', activeProject);
    }
  };

  // Generar borrador de Gmail automático
  const generateGmailDraft = (project: Project, stage: 'Diseño' | 'Entrega') => {
    let subject = '';
    let body = '';

    if (stage === 'Diseño') {
      subject = `[Estructura Lista] Propuesta de Diseño Inicial para ${project.comercio}`;
      body = settings.gmailTemplateDiseno
        .replace(/{COMERCIO}/g, project.comercio)
        .replace(/{DOMINIO}/g, project.dominioComprado)
        .replace(/{FECHA_ENTREGA}/g, project.fechaEntrega)
        .replace(/{PRECIO}/g, `${project.precioVenta} €`)
        .replace(/{DEV_NAME}/g, settings.devName);
    } else {
      subject = `¡Web Lista y Desplegada! 🎉 Entrega final para ${project.comercio}`;
      body = settings.gmailTemplateEntrega
        .replace(/{COMERCIO}/g, project.comercio)
        .replace(/{DOMINIO}/g, project.dominioComprado)
        .replace(/{FECHA_ENTREGA}/g, project.fechaEntrega)
        .replace(/{PRECIO}/g, `${project.precioVenta} €`)
        .replace(/{DEV_NAME}/g, settings.devName);
    }

    setDraftModalData({
      project,
      subject,
      body,
      stage
    });
  };

  // Google Calendar Automation
  const triggerCalendarAutomation = async (project: Project) => {
    triggerStatusMessage(`Agendando hito de entrega de "${project.comercio}" en Google Calendar...`);
    
    // Sincronizar vía Sheets Webhook
    await sendToGoogleAppsScript('schedule_calendar', {
      comercio: project.comercio,
      fechaEntrega: project.fechaEntrega,
      summary: `Hito Entrega Web: ${project.comercio}`
    });

    // Marcar como agendado localmente
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, calendarScheduled: true } : p))
    );
  };

  // Descargar archivo .ics real para que el desarrollador pueda guardarlo manualmente en su Google Calendar de inmediato si no tiene configurado el Apps Script
  const handleDownloadICS = (project: Project) => {
    const title = `Hito Entrega de Web: ${project.comercio}`;
    const desc = `Entrega de desarrollo web estilo premium para ${project.comercio}. Dominio asignado: ${project.dominioComprado}`;
    const dateFormatted = project.fechaEntrega.replace(/-/g, '');
    
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JR CRM//Local Scheduler//ES
BEGIN:VEVENT
UID:uid-${project.id}@jrcrm.local
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${dateFormatted}
DTEND;VALUE=DATE:${dateFormatted}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${project.ubicacion}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `entrega-${project.comercio.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerStatusMessage(`Archivo Calendar ICS generado. ¡Importado con 1-click!`);
  };

  // Borrar de local
  const handleDeleteProject = (projectId: string) => {
    if (confirm('¿Seguro que deseas eliminar este proyecto del CRM?')) {
      const p = projects.find((x) => x.id === projectId);
      setProjects(projects.filter((x) => x.id !== projectId));
      if (p) {
        triggerStatusMessage(`Proyecto "${p.comercio}" borrado`);
        sendToGoogleAppsScript('delete_project', { id: projectId });
      }
    }
  };

  const getNextState = (curr: ProjectState): ProjectState | null => {
    const idx = pipelineStates.indexOf(curr);
    if (idx < pipelineStates.length - 1) return pipelineStates[idx + 1];
    return null;
  };

  const filteredProjects = activeStateFilter === 'Todos'
    ? projects
    : projects.filter((p) => p.estado === activeStateFilter);

  return (
    <div className="space-y-8 mt-6">
      
      {/* Cabecera Clientes */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">Gestión de Clientes</h2>
          <p className="text-[#2C3E50]/70 font-medium font-sans">Pipeline de desarrollo, entregas y automatizaciones de Google Workspace integradas.</p>
        </div>
        <div>
          <button
            id="btn-add-client"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-[#1B365D] hover:bg-[#132743] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Pipeline Navigation / State Filters */}
      <div className="bg-slate-200/40 p-1.5 rounded-2xl border border-slate-300/30 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveStateFilter('Todos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeStateFilter === 'Todos' ? 'bg-[#1B365D] text-white' : 'text-slate-600 hover:bg-slate-300/40'
          }`}
        >
          Todos los Proyectos ({projects.length})
        </button>
        {pipelineStates.map((st) => (
          <button
            key={st}
            onClick={() => setActiveStateFilter(st)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeStateFilter === st ? 'bg-[#1B365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300/40'
            }`}
          >
            <span>{st}</span>
            <span className={`h-4 min-w-4 text-[10px] px-1 bg-black/10 flex items-center justify-center rounded-full font-bold`}>
              {projects.filter((p) => p.estado === st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid de Proyectos / Clientes */}
      {filteredProjects.length === 0 ? (
        <div className="liquid-glass p-12 rounded-[24px] text-center border-2 border-dashed border-slate-300/40">
          <Clock className="h-10 w-10 text-slate-400 mx-auto animate-pulse" />
          <h4 className="text-lg font-bold text-[#1B365D] mt-4">Sin proyectos en esta etapa</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 font-medium">Puedes captar clientes en "El Botón de Oro" o pulsar en "Nuevo Proyecto" para registrar uno manualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="liquid-glass p-6 rounded-[24px] border border-[#1B365D]/10 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top line */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/40 pb-3 mb-4">
                    <span className="text-[10px] font-extrabold bg-[#1B365D]/10 text-[#1B365D] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {project.sector}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      project.estado === 'Contacto' ? 'bg-amber-100 text-amber-800' :
                      project.estado === 'Estructura' ? 'bg-purple-100 text-purple-800' :
                      project.estado === 'Diseño' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {project.estado}
                    </span>
                  </div>

                  {/* Detalle */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-extrabold text-[#1B365D] leading-none mb-1">{project.comercio}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{project.ubicacion}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Globe className="h-3.5 w-3.5 text-[#1B365D]/70" />
                      <span className="font-mono text-slate-600">{project.dominioComprado}</span>
                    </div>

                    {/* Meta data blocks */}
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-[#E1E8ED]/20">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Fecha Entrega</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#1B365D]" />
                          {project.fechaEntrega}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-[#E1E8ED]/20">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Precio Web</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block flex items-center gap-0.5">
                          <span className="text-[#1B365D] font-extrabold">{project.precioVenta}</span> €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation Indicators */}
                <div className="flex gap-2 text-[10px] font-bold text-slate-500 mt-4 py-2 border-y border-slate-200/30">
                  {project.calendarScheduled ? (
                    <span className="text-green-700 bg-green-100 rounded-lg px-2 py-0.5 flex items-center gap-1">
                      ✓ Calendar Agendado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownloadICS(project)}
                      className="text-[#1B365D] bg-[#1B365D]/10 hover:bg-[#1B365D]/20 rounded-lg px-2 py-0.5 flex items-center gap-1 transition-all"
                    >
                      📅 Sincronizar Google Calendar
                    </button>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3">
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Registrar baja/borrar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex-1 flex justify-end gap-2">
                    {/* Generar Mail Manual */}
                    {(project.estado === 'Diseño' || project.estado === 'Entrega') && (
                      <button
                        onClick={() => generateGmailDraft(project, project.estado as 'Diseño' | 'Entrega')}
                        className="px-3 py-1.5 text-[#1B365D] border border-[#1B365D]/20 hover:bg-[#1B365D]/5 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Ver Redacción Gmail
                      </button>
                    )}

                    {/* Mover al siguiente estado */}
                    {getNextState(project.estado) && (
                      <button
                        onClick={() => handleChangeState(project, getNextState(project.estado)!)}
                        className="px-3 py-1.5 bg-[#1B365D] hover:bg-[#132743] hover:shadow-sm text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span>Avanzar</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL para añadir proyecto */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="liquid-glass p-6 rounded-[28px] max-w-md w-full z-10 space-y-4 border border-white/50 text-left"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                <h3 className="text-xl font-extrabold text-[#1B365D]">Nuevo Cliente</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="h-7 w-7 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                {/* Nombre de Comercio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre del Comercio *</label>
                  <input
                    type="text"
                    required
                    value={comercio}
                    onChange={(e) => setComercio(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    placeholder="Ej. Barbería Urretxu"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sector *</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as SectorType)}
                    className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                  >
                    <option value="Hostelería">Hostelería</option>
                    <option value="Comercio">Comercio</option>
                    <option value="Servicios">Servicios</option>
                  </select>
                </div>

                {/* Dominio Comprado */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dominio Comprado (Modificable)</label>
                  <input
                    type="text"
                    value={dominioComprado}
                    onChange={(e) => setDominioComprado(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    placeholder="Ej. barberiaurretxu.eus"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Si se deja en blanco se deducirá un dominio .eus automáticamente.</p>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ubicación</label>
                  <input
                    type="text"
                    required
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    placeholder="Ej. Urretxu"
                  />
                </div>

                {/* Fila Doble de Fecha y Precio */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha de Entrega</label>
                    <input
                      type="date"
                      value={fechaEntrega}
                      onChange={(e) => setFechaEntrega(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Precio Web (€)</label>
                    <input
                      type="number"
                      required
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(Number(e.target.value))}
                      className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-confirm-save-client"
                    type="submit"
                    className="flex-1 py-3 bg-[#1B365D] hover:bg-[#132743] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>Guardar y Sheets</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL para visualización y copia de Gmail automática */}
      <AnimatePresence>
        {draftModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDraftModalData(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="liquid-glass p-6 rounded-[28px] max-w-xl w-full z-10 space-y-4 border border-white/50 text-left relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B365D]">Hito: Borrador Gmail Generado</h3>
                    <p className="text-xs font-semibold text-slate-400">Automatizado para la etapa: {draftModalData.stage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDraftModalData(null)}
                  className="h-7 w-7 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Asunto del E-mail</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[#2C3E50]"
                    value={draftModalData.subject}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuerpo del E-mail</label>
                  <textarea
                    readOnly
                    rows={11}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 leading-relaxed text-slate-700"
                    value={draftModalData.body}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(draftModalData.body);
                    triggerStatusMessage(`Contenido del correo para ${draftModalData.project.comercio} copiado!`);
                    setDraftModalData(null);
                  }}
                  className="flex-1 py-3 bg-[#1B365D] hover:bg-[#132743] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Copiar Correo & Marcar</span>
                </button>
                <a
                  href={`mailto:info@${draftModalData.project.dominioComprado}?subject=${encodeURIComponent(draftModalData.subject)}&body=${encodeURIComponent(draftModalData.body)}`}
                  onClick={() => setDraftModalData(null)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>Redactar en Gmail (Apps Link)</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
