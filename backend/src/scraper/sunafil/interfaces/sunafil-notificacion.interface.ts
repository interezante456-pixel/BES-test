export enum ModuloSunafil {
  FISCALIZACION = 'FISCALIZACION',
  COBRANZA = 'COBRANZA',
  ACCIONES_PREVIAS = 'ACCIONES_PREVIAS',
  ALERTAS_FORMALIZACION = 'ALERTAS_FORMALIZACION',
  ALERTAS_SST = 'ALERTAS_SST',
  ORIENTACION = 'ORIENTACION',
}

export interface BaseSunafilRecord {
  modulo: ModuloSunafil;
  codigoReferencia: string; // Orden de Inspección, Expediente Sancionador, Registro, etc.
  intendencia?: string;
  asunto: string;
  estado: string;
  fechaDeposito?: Date | null;
  fechaNotificacion?: Date | null;
  fechaAcuseRecibo?: Date | null;
  fechaLimite?: Date | null; // Fecha límite de presentación o respuesta
  plazoDias?: number | null;
  trabajadoresIncorporados?: number | null;
  
  // Metadatos preparados para PDFs (Fase 2)
  tienePdf: boolean;
  docActionSelector?: string; // Selector o identificador para accionar descarga
  rutaArchivoPdf?: string | null;
  pdfDescargado?: boolean;
  
  // Atributos adicionales dinámicos
  metadataExtra?: Record<string, any>;
}

export interface SyncSunafilOptions {
  descargarPdfs?: boolean;
  maxRegistrosPorModulo?: number;
}

export interface SyncSunafilResult {
  empresaRuc: string;
  totalExtraidas: number;
  nuevasGuardadas: number;
  porModulo: {
    fiscalizacion: number;
    cobranza: number;
    accionesPrevias: number;
    formalizacion: number;
    sst: number;
  };
  notificaciones: BaseSunafilRecord[];
}
