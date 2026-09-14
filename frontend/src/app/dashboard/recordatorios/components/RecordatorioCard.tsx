import React from 'react';
import { CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react';

interface RecordatorioCardProps {
  rec: any;
  hoyStr: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecordatorioCard: React.FC<RecordatorioCardProps> = ({
  rec,
  hoyStr,
  onToggle,
  onDelete,
}) => {
  const recFechaStr = new Date(rec.fechaRecordar).toISOString().split('T')[0];
  const esVencido = !rec.completado && recFechaStr < hoyStr;
  const esHoy = !rec.completado && recFechaStr === hoyStr;

  return (
    <div
      className={`p-4 flex items-start justify-between gap-4 transition-colors ${
        rec.completado ? 'opacity-50 bg-white/[0.01]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggle(rec.id)}
          className="mt-0.5 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer shrink-0"
        >
          {rec.completado ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500 hover:text-white" />
          )}
        </button>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {esVencido && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                Vencido
              </span>
            )}
            {esHoy && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                Hoy
              </span>
            )}
            {rec.empresa && (
              <span className="text-xs font-bold text-orange-400 truncate">
                {rec.empresa.razonSocial}
              </span>
            )}
          </div>

          <div
            className={`text-sm font-semibold ${
              rec.completado ? 'line-through text-gray-400' : 'text-white'
            }`}
          >
            {rec.titulo}
          </div>

          {rec.descripcion && (
            <p className="text-xs text-gray-400">{rec.descripcion}</p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              {new Date(rec.fechaRecordar).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDelete(rec.id)}
          className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Eliminar Recordatorio"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
