"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SincroPorDiaChartProps {
  sincroPorDia: { fecha: string; cantidad: number; peligrosas?: number; normales?: number }[];
}

export const SincroPorDiaChart: React.FC<SincroPorDiaChartProps> = ({ sincroPorDia }) => {
  const maxDia = Math.max(...(sincroPorDia?.map((d) => d.cantidad) || [1]), 1);

  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            Evolución de Alertas (7 Días)
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Comparación diaria entre alertas peligrosas e informativas</p>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-rose-400 font-semibold">Peligrosas / Críticas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span className="text-indigo-400 font-semibold">Normales</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-end gap-3 h-48 pt-4">
          {sincroPorDia?.map((dia) => {
            const peligrosas = dia.peligrosas ?? 0;
            const normales = dia.normales ?? dia.cantidad - peligrosas;
            const total = dia.cantidad;
            const heightPct = maxDia > 0 ? (total / maxDia) * 100 : 0;

            const peligrosasPct = total > 0 ? (peligrosas / total) * 100 : 0;
            const normalesPct = total > 0 ? (normales / total) * 100 : 0;

            const dayName = new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
              weekday: 'short',
            });

            return (
              <div
                key={dia.fecha}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
              >
                {/* Tooltip Hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/10 rounded-xl p-2 text-[10px] pointer-events-none z-20 whitespace-nowrap shadow-xl">
                  <p className="font-bold text-white mb-0.5">{dia.fecha}</p>
                  <p className="text-rose-400 font-bold">⚠️ Peligrosas: {peligrosas}</p>
                  <p className="text-indigo-400 font-bold">ℹ️ Normales: {normales}</p>
                  <p className="text-gray-400 pt-0.5 border-t border-white/10">Total: {total}</p>
                </div>

                {/* Total label */}
                <span className="text-[11px] font-bold text-gray-300">{total > 0 ? total : ''}</span>

                {/* Bar container */}
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-gray-800/50 flex flex-col justify-end overflow-hidden transition-all duration-300 min-h-[8px]"
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                >
                  {total > 0 ? (
                    <>
                      {peligrosas > 0 && (
                        <div
                          className="w-full bg-gradient-to-t from-rose-600 to-rose-400 transition-all"
                          style={{ height: `${peligrosasPct}%` }}
                          title={`Peligrosas: ${peligrosas}`}
                        />
                      )}
                      {normales > 0 && (
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                          style={{ height: `${normalesPct}%` }}
                          title={`Normales: ${normales}`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-2 bg-gray-800 rounded-t-md" />
                  )}
                </div>

                {/* Day label */}
                <span className="text-[10px] text-gray-500 font-mono capitalize">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
