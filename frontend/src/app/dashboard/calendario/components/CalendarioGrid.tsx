"use client";

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CalendarioGridProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  eventos: any[];
  onSelectDia: (diaStr: string, eventosDia: any[]) => void;
  onNuevoEvento: () => void;
  loading?: boolean;
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarioGrid: React.FC<CalendarioGridProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  eventos,
  onSelectDia,
  onNuevoEvento,
  loading = false,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Primer día del mes (1 = lunes, ..., 0 = domingo en JS normal)
  const primerDiaSemana = (new Date(year, month, 1).getDay() + 6) % 7; // Convertir 0 a Lunes
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  const hoyStr = new Date().toISOString().split('T')[0];

  // Agrupar eventos por YYYY-MM-DD
  const eventosPorDia = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const ev of eventos) {
      const key = ev.fecha;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [eventos]);

  const mesNombre = currentMonth.toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header del Calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white capitalize tracking-tight">
              {mesNombre}
            </h2>
            <p className="text-xs text-gray-400">
              {eventos.length} vencimientos y compromisos en este período
            </p>
          </div>
        </div>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToday}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-white/10"
            title="Mes Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-white/10"
            title="Mes Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNuevoEvento}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Evento</span>
          </button>
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-white/5">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 gap-2">
        {/* Celdas vacías del mes anterior */}
        {Array.from({ length: primerDiaSemana }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] sm:min-h-[110px] rounded-2xl bg-white/[0.01] border border-transparent opacity-30 pointer-events-none"
          />
        ))}

        {/* Días del mes */}
        {Array.from({ length: diasEnMes }).map((_, i) => {
          const diaNum = i + 1;
          const diaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
          const esHoy = diaStr === hoyStr;
          const evs = eventosPorDia.get(diaStr) || [];
          const tieneSunafil = evs.some((e) => e.tipo === 'SUNAFIL_VENCIMIENTO');
          const tieneCompromiso = evs.some((e) => e.tipo === 'COMPROMISO_EQUIPO');

          return (
            <div
              key={diaStr}
              onClick={() => onSelectDia(diaStr, evs)}
              className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                esHoy
                  ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                  : evs.length > 0
                  ? 'bg-[#151c2d] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    esHoy
                      ? 'bg-orange-500 text-white font-black'
                      : 'text-gray-300 group-hover:text-white'
                  }`}
                >
                  {diaNum}
                </span>

                {evs.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                    {evs.length}
                  </span>
                )}
              </div>

              {/* Eventos mini en la casilla */}
              <div className="space-y-1 my-1 overflow-hidden">
                {evs.slice(0, 2).map((ev, idx) => {
                  const tagColor =
                    ev.tipo === 'SUNAFIL_VENCIMIENTO'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : ev.tipo === 'COMPROMISO_EQUIPO'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

                  return (
                    <div
                      key={idx}
                      className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${tagColor}`}
                    >
                      {ev.titulo}
                    </div>
                  );
                })}
                {evs.length > 2 && (
                  <div className="text-[9px] text-gray-500 font-bold pl-1">
                    +{evs.length - 2} más...
                  </div>
                )}
              </div>

              {/* Indicador inferior de tipo */}
              <div className="flex items-center gap-1">
                {tieneSunafil && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-rose-400"
                    title="Vencimiento SUNAFIL"
                  />
                )}
                {tieneCompromiso && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    title="Compromiso de Equipo"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
