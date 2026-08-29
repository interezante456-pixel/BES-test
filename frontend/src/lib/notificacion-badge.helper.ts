export type AlertLevel = 'CRITICA' | 'FISCALIZACION' | 'INFORMATIVO';

export interface AlertBadgeInfo {
  level: AlertLevel;
  label: string;
  badgeClass: string;
  borderClass: string;
  iconBgClass: string;
}

const CRITICA_KEYWORDS = [
  'orden de pago',
  'coactiv',
  'ejecucion coactiva',
  'embargo',
  'resolucion de multa',
  'resolución de multa',
  'multa',
  'retencion',
  'retención',
];

const FISCALIZACION_KEYWORDS = [
  'requerimiento',
  'fiscalizaci',
  'fiscalizacion',
  'carta de presentaci',
  'carta de presentacion',
  'esquela',
  'inductiva',
  'carta inductiva',
  'citacion',
  'citación',
];

export function getAlertBadgeInfo(asunto: string = ''): AlertBadgeInfo {
  const a = asunto.toLowerCase();

  if (CRITICA_KEYWORDS.some((kw) => a.includes(kw))) {
    return {
      level: 'CRITICA',
      label: 'ALERTA CRÍTICA',
      badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold',
      borderClass: 'border-l-4 border-l-rose-500 bg-rose-500/[0.02]',
      iconBgClass: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    };
  }

  if (FISCALIZACION_KEYWORDS.some((kw) => a.includes(kw))) {
    return {
      level: 'FISCALIZACION',
      label: 'FISCALIZACIÓN / REQ.',
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold',
      borderClass: 'border-l-4 border-l-amber-500 bg-amber-500/[0.02]',
      iconBgClass: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    };
  }

  return {
    level: 'INFORMATIVO',
    label: 'NOTIFICACIÓN',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold',
    borderClass: 'border-l-4 border-l-transparent',
    iconBgClass: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };
}
