import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle, Archive } from 'lucide-react';

/** Badge de módulo SUNAFIL */
export const getModuloBadge = (modulo: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    FISCALIZACION: { label: 'Fiscalización', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    COBRANZA: { label: 'Cobranza', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ACCIONES_PREVIAS: { label: 'Acciones Previas', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    ALERTAS_FORMALIZACION: { label: 'Formalización', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    ALERTAS_SST: { label: 'SST', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };
  const entry = map[modulo];
  return entry ? (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${entry.cls}`}>{entry.label}</span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      {modulo || 'SUNAFIL'}
    </span>
  );
};

/** Badge de estado de gestión */
export const getEstadoGestionBadge = (estado: string | null | undefined) => {
  switch (estado) {
    case 'EN_REVISION': return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-2.5 h-2.5" /> En Revisión</span>;
    case 'REQUIERE_ACCION': return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle className="w-2.5 h-2.5" /> Requiere Acción</span>;
    case 'RESPONDIDO': return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-2.5 h-2.5" /> Respondido</span>;
    case 'ARCHIVADO': return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20"><Archive className="w-2.5 h-2.5" /> Archivado</span>;
    default: return <span className="text-[10px] text-gray-500">—</span>;
  }
};

/** Alerta de plazo vencimiento */
export const getDeadlineAlert = (fechaLimite?: string | Date | null) => {
  if (!fechaLimite) return null;
  const diffDays = Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" /> Vencido ({Math.abs(diffDays)}d)
    </span>
  );
  if (diffDays <= 3) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1 animate-pulse">
      <AlertTriangle className="w-3 h-3" /> Vence en {diffDays}d
    </span>
  );
  if (diffDays <= 7) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
      <Clock className="w-3 h-3" /> {diffDays} días restantes
    </span>
  );
  return <span className="text-[10px] font-medium text-gray-400">Límite: {new Date(fechaLimite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
};

/** Formatear fecha */
export const renderFecha = (d?: string | Date | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};
