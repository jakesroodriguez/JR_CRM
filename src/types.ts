/**
 * Types definition for JRG CRM
 */

export type SectorType = 'Hostelería' | 'Comercio' | 'Servicios';

export type ProjectState = 'Contacto' | 'Estructura' | 'Diseño' | 'Entrega';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  sector: SectorType;
  location: string;
  hasWebsite: boolean;
  website?: string;
  notes?: string;
  contacted?: boolean;
}

export interface Project {
  id: string;
  comercio: string;
  sector: SectorType;
  dominioComprado: string;
  ubicacion: string;
  fechaEntrega: string;
  precioVenta: number;
  estado: ProjectState;
  calendarScheduled?: boolean;
  gmailDraftGenerated?: boolean;
  createdAt: string;
}

export interface AppSettings {
  googleAppsScriptUrl: string;
  devName: string;
  gmailTemplateDiseno: string;
  gmailTemplateEntrega: string;
  keyboardShortcutsEnabled?: boolean;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string; // HTML5 Audio source
  duration: number; // in seconds
}

export type ActiveTab = 'Dashboard' | 'Captacion' | 'Clientes' | 'Ajustes' | 'Cerebro' | 'Relax';
