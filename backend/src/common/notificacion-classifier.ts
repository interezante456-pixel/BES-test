/**
 * Palabras clave que califican una notificación SUNAT como urgente/peligrosa.
 * Usar esta función en TODOS los servicios que necesiten clasificar alertas.
 */
const URGENT_KEYWORDS = [
  'orden de pago',
  'coactiv',
  'esquela',
  'embargo',
  'conclusi',
  'ejecucion coactiva',
  'resolucion de multa',
];

export function isUrgentAsunto(asunto: string): boolean {
  if (!asunto) return false;
  const a = asunto.toLowerCase();
  return URGENT_KEYWORDS.some((kw) => a.includes(kw));
}
