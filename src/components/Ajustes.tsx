import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Clipboard, 
  Check, 
  FileCode, 
  Database, 
  Mail, 
  ShieldCheck, 
  User, 
  Keyboard, 
  Camera, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';
import { AppSettings } from '../types';

interface GoogleUser {
  name: string;
  email: string;
  photoUrl: string;
}

interface AjustesProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  onResetDatabase: () => void;
  triggerStatusMessage: (msg: string) => void;
  user: GoogleUser;
  onUpdateUser: (updatedUser: GoogleUser) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
];

export default function Ajustes({
  settings,
  setSettings,
  onResetDatabase,
  triggerStatusMessage,
  user,
  onUpdateUser
}: AjustesProps) {
  // Tabs state
  const [activeSubTab, setActiveSubTab] = useState<'integrations' | 'profile' | 'keyboard'>('integrations');

  // Integrations state
  const [googleUrls, setGoogleUrls] = useState(settings.googleAppsScriptUrl);
  const [devName, setDevName] = useState(settings.devName);
  const [templateDiseno, setTemplateDiseno] = useState(settings.gmailTemplateDiseno);
  const [templateEntrega, setTemplateEntrega] = useState(settings.gmailTemplateEntrega);
  const [copiedScript, setCopiedScript] = useState(false);

  // Profile Edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhoto, setProfilePhoto] = useState(user.photoUrl);

  // Keyboard settings state
  const [kbEnabled, setKbEnabled] = useState(settings.keyboardShortcutsEnabled ?? true);

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      googleAppsScriptUrl: googleUrls,
      devName,
      gmailTemplateDiseno: templateDiseno,
      gmailTemplateEntrega: templateEntrega,
      keyboardShortcutsEnabled: kbEnabled
    });
    triggerStatusMessage('Ajustes y conectividad de Google guardados');
  };

  // Save Profile handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      triggerStatusMessage('Error: Nombre y Email son requeridos');
      return;
    }
    onUpdateUser({
      name: profileName,
      email: profileEmail,
      photoUrl: profilePhoto
    });
    triggerStatusMessage('¡Perfil de administrador de Google actualizado!');
  };

  // Apps Script blueprint code
  const appsScriptCode = `/**
 * GOOGLE APPS SCRIPT - CONECTOR CENTRAL "JRG CRM"
 * 
 * Instrucciones:
 * 1. Entra a https://script.google.com con tu cuenta de Google.
 * 2. Crea un proyecto nuevo llamado "JRG CRM Connector".
 * 3. Reemplaza el código existente con este código.
 */

function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    var action = data.action;
    var payload = data.payload;

    if (action === 'create_project') {
      appendProjectToSheet(payload);
    } else if (action === 'update_project_state') {
      updateProjectStateInSheet(payload);
    } else if (action === 'schedule_calendar') {
      scheduleCalendarEvent(payload);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'OK' }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendProjectToSheet(project) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("JRG CRM Base Central");
  var sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Nombre Comercio", "Sector", "Dominio Comprado", "Ubicación", "Fecha Entrega", "Precio Venta", "Estado Actual", "Fecha Creación"]);
  }
  sheet.appendRow([
    project.id,
    project.comercio,
    project.sector,
    project.dominioComprado,
    project.ubicacion,
    project.fechaEntrega,
    project.precioVenta,
    project.estado,
    project.createdAt
  ]);
}

function updateProjectStateInSheet(project) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === project.id) {
      sheet.getRange(i + 1, 8).setValue(project.estado);
      break;
    }
  }
}

function scheduleCalendarEvent(eventData) {
  var calendar = CalendarApp.getDefaultCalendar();
  if (calendar) {
    var title = "ENTREGA WEB: " + eventData.comercio;
    var targetDate = new Date(eventData.fechaEntrega);
    calendar.createAllDayEvent(title, targetDate, {
      description: "Hito programado automáticamente desde JRG CRM. Dominio: " + eventData.dominioComprado
    });
  }
}`;

  return (
    <div className="space-y-8 mt-6">
      
      {/* Cabecera de Ajustes */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">Panel de Configuración</h2>
          <p className="text-[#2C3E50]/70 font-semibold font-sans">
            Personaliza el entorno del CRM, accesos directos, perfiles de sesión y automatizaciones con Google Workspace.
          </p>
        </div>
      </div>

      {/* SEGMENTED SUBTAB SELECTOR */}
      <div className="flex p-1 bg-slate-200/60 rounded-2xl w-full max-w-lg border border-slate-300/40 select-none">
        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'integrations'
              ? 'bg-white text-[#1B365D] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Integración Google
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-white text-[#1B365D] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Editar Perfil
        </button>
        <button
          id="btn-tab-shortcuts"
          onClick={() => setActiveSubTab('keyboard')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'keyboard'
              ? 'bg-white text-[#1B365D] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Teclado & Atajos
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: INTEGRACIONES */}
          {activeSubTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <form onSubmit={handleSaveSettings} className="liquid-glass p-6 rounded-[24px] space-y-5">
                  <h3 className="text-lg font-extrabold text-[#1B365D] border-b border-slate-200/50 pb-2.5 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    Parámetros de Integración
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nombre del Desarrollador (Firmas)
                    </label>
                    <input
                      type="text"
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                      placeholder="Ej. Jon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Webhook Google Apps Script URL
                    </label>
                    <input
                      type="url"
                      value={googleUrls}
                      onChange={(e) => setGoogleUrls(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-white font-mono border border-[#E1E8ED] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                      placeholder="https://script.google.com/macros/s/.../exec"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-semibold">
                      Al configurar esta URL, cada alta de proyecto o actualización de estado se enviará directamente a tu hoja de cálculo Google Sheets y agendará eventos en Google Calendar automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-cyan-600" />
                      Plantilla Email: Estado "Diseño"
                    </label>
                    <textarea
                      value={templateDiseno}
                      onChange={(e) => setTemplateDiseno(e.target.value)}
                      rows={5}
                      className="w-full text-xs font-sans p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed text-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Plantilla Email: Estado "Entrega Final"
                    </label>
                    <textarea
                      value={templateEntrega}
                      onChange={(e) => setTemplateEntrega(e.target.value)}
                      rows={5}
                      className="w-full text-xs font-sans p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed text-slate-700 font-medium"
                    />
                    <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-400 mt-1 leading-relaxed">
                      <span>Comodines:</span>
                      <span className="text-[#1B365D]">{`{COMERCIO}`}</span>
                      <span className="text-[#1B365D]">{`{DOMINIO}`}</span>
                      <span className="text-[#1B365D]">{`{FECHA_ENTREGA}`}</span>
                      <span className="text-[#1B365D]">{`{PRECIO}`}</span>
                      <span className="text-[#1B365D]">{`{DEV_NAME}`}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col md:flex-row gap-4">
                    <button
                      type="button"
                      onClick={onResetDatabase}
                      className="px-4 py-3 bg-red-100 hover:bg-red-200/80 text-red-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resetear Base Datos
                    </button>
                    <button
                      id="submit-integrations-settings"
                      type="submit"
                      className="flex-1 py-3 bg-[#1B365D] hover:bg-[#132743] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <Save className="h-4 w-4" />
                      Guardar Automatizaciones
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="liquid-glass p-6 rounded-[24px] space-y-4 text-left">
                  <h3 className="text-lg font-bold text-[#1B365D] flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-indigo-600" />
                    Macro de Conexión Google
                  </h3>
                  <p className="text-xs text-[#2C3E50]/70 font-semibold leading-relaxed">
                    JRG CRM incluye soporte universal para Google Apps Script. Copia esta macro para vincular tu cuenta:
                  </p>

                  <div className="relative mt-4">
                    <div className="absolute top-2 right-2 z-10 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(appsScriptCode);
                          setCopiedScript(true);
                          triggerStatusMessage('Código copiado al portapapeles');
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-white border border-slate-200 shadow-xs ${
                          copiedScript ? 'text-green-600' : 'text-slate-600 hover:text-[#1B365D]'
                        }`}
                      >
                        {copiedScript ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-3.5 w-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      readOnly
                      className="w-full h-[240px] text-[10px] font-mono p-4 bg-slate-900 text-slate-300 rounded-xl leading-relaxed outline-none border border-slate-950 shadow-inner"
                      value={appsScriptCode}
                    />
                  </div>

                  <div className="flex gap-2.5 items-center bg-cyan-100/50 p-4 border border-cyan-200/60 rounded-xl text-[10px] leading-relaxed text-cyan-800 font-semibold">
                    <Database className="h-5 w-5 text-cyan-600 shrink-0" />
                    <span>Esta macro creará automáticamente la hoja Excel "JRG CRM Base Central" y sincronizará agendas sin necesidad de bases de datos de terceros.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MI PERFIL (EDITAR PERFIL) */}
          {activeSubTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSaveProfile} className="liquid-glass p-8 rounded-[24px] space-y-6 text-left">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                  <div className="p-2 bg-[#1B365D]/10 rounded-xl text-[#1B365D]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1B365D] tracking-tight">Editar Perfil de Acceso</h3>
                    <p className="text-xs font-semibold text-slate-500">Modifica tus credenciales de sesión local simulando seguridad de cuenta de Google.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                  <div className="relative">
                    <img
                      src={profilePhoto}
                      alt="Vista de Perfil"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-[#1B365D] rounded-full text-white shadow-md border-2 border-white">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temas de Avatar Rápidos</label>
                    <div className="flex gap-3">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfilePhoto(preset)}
                          className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                            profilePhoto === preset ? 'border-[#1B365D] ring-2 ring-[#1B365D]/20 shadow-md' : 'border-slate-200'
                          }`}
                        >
                          <img src={preset} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={`Preset ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                      placeholder="Jakes Rodriguez"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico (Google)</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-white border border-[#E1E8ED] text-[#2C3E50] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none placeholder:lowercase"
                      placeholder="ejemplo@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enlace de Imagen Personalizada</label>
                  <input
                    type="url"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-white font-mono border border-[#E1E8ED] text-slate-700 focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-save-profile-custom"
                    className="w-full py-3.5 bg-[#1B365D] hover:bg-[#132743] hover:shadow-lg text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Actualizar Datos de Administrador
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: KEYBOARD SHORTCUTS */}
          {activeSubTab === 'keyboard' && (
            <div className="max-w-2xl mx-auto">
              <div className="liquid-glass p-8 rounded-[24px] space-y-6 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1B365D]/10 rounded-xl text-[#1B365D]">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#1B365D] tracking-tight">Atajos de Teclado</h3>
                      <p className="text-xs font-semibold text-slate-500">Agiliza la navegación del sistema usando teclas rápidas dedicadas.</p>
                    </div>
                  </div>

                  {/* Toggle controller */}
                  <button
                    id="btn-toggle-shortcuts-state"
                    onClick={() => {
                      const updated = !kbEnabled;
                      setKbEnabled(updated);
                      setSettings({
                        ...settings,
                        keyboardShortcutsEnabled: updated
                      });
                      triggerStatusMessage(`Atajos de teclado: ${updated ? 'Habilitados' : 'Deshabilitados'}`);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      kbEnabled 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-red-50 text-red-500 border-red-200'
                    }`}
                  >
                    {kbEnabled ? 'Activos (ON)' : 'Ocultos (OFF)'}
                  </button>
                </div>

                {/* Shortcuts Simulator */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mapeo de Funciones del Teclado</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Key 1 */}
                    <div className="p-4 bg-white/60 border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-xs select-none">
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-[#1B365D]">Sección Dashboard</p>
                        <p className="text-[11px] font-semibold text-slate-400">Ir de inmediato a estadísticas generales.</p>
                      </div>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md border border-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-400 self-center font-bold text-xs">+</span>
                        <kbd className="px-2.5 py-1 bg-[#1B365D] text-white font-mono font-black text-xs rounded-md border border-[#132743] shadow-sm">1</kbd>
                      </div>
                    </div>

                    {/* Key 2 */}
                    <div className="p-4 bg-white/60 border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-xs select-none">
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-[#1B365D]">Sección Captación</p>
                        <p className="text-[11px] font-semibold text-slate-400">Ir al escáner de comercios sin web.</p>
                      </div>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md border border-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-400 self-center font-bold text-xs">+</span>
                        <kbd className="px-2.5 py-1 bg-[#1B365D] text-white font-mono font-black text-xs rounded-md border border-[#132743] shadow-sm">2</kbd>
                      </div>
                    </div>

                    {/* Key 3 */}
                    <div className="p-4 bg-white/60 border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-xs select-none">
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-[#1B365D]">Sección Clientes</p>
                        <p className="text-[11px] font-semibold text-slate-400">Acceder al listado de clientes en curso.</p>
                      </div>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md border border-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-400 self-center font-bold text-xs">+</span>
                        <kbd className="px-2.5 py-1 bg-[#1B365D] text-white font-mono font-black text-xs rounded-md border border-[#132743] shadow-sm">3</kbd>
                      </div>
                    </div>

                    {/* Key 4 */}
                    <div className="p-4 bg-white/60 border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-xs select-none">
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-[#1B365D]">Sección Ajustes</p>
                        <p className="text-[11px] font-semibold text-slate-400">Administrar parámetros y firmas.</p>
                      </div>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md border border-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-400 self-center font-bold text-xs">+</span>
                        <kbd className="px-2.5 py-1 bg-[#1B365D] text-white font-mono font-black text-xs rounded-md border border-[#132743] shadow-sm">4</kbd>
                      </div>
                    </div>

                    {/* Key M */}
                    <div className="p-4 bg-white/60 border border-slate-200/50 rounded-2xl flex items-center justify-between col-span-1 md:col-span-2 shadow-xs select-none">
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
                          <span>Menú Música / Spotify</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400">Maximiza o minimiza el reproductor multimedia integrado de la Isla Dinámica de forma instantánea.</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <kbd className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-md border border-slate-300 shadow-sm">Alt</kbd>
                        <span className="text-slate-400 self-center font-bold text-xs">+</span>
                        <kbd className="px-3 py-1 bg-emerald-600 text-white font-mono font-extrabold text-xs rounded-md border border-emerald-700 shadow-sm">M</kbd>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div className="text-xs font-semibold text-slate-600 leading-normal">
                    <strong>Pista de navegación rápida:</strong> El sistema previene el uso de estos atajos cuando te encuentres escribiendo datos dentro de formularios, áreas de texto o buscadores para evitar interrupciones o pulsaciones en blanco involuntarias.
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
