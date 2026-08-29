export interface Empresa {
  id: string;
  ruc: string;
  razonSocial: string;
  usuarioSol?: string;
  claveSol?: string;
  activo?: boolean;
  habilitadoSunat?: boolean;
  habilitadoSunafil?: boolean;
  estadoSincro?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR' | 'TERMINOS_PENDIENTES' | string;
  ultimaSincro?: string | null;
  ultimaSincronizacion?: string | null;

  createdAt?: string;
  updatedAt?: string;
  _count?: {
    notificaciones?: number;
  };
  [key: string]: any;
}

