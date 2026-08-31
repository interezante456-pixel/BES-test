"use client";

import React from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface PlazosProximosListProps {
  plazos: any[];
  onSelectNotificacion: (notif: any) => void;
}

export const PlazosProximosList: React.FC<PlazosProximosListProps> = ({
  plazos,
  onSelectNotificacion,
}) => {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Vencimientos Próximos (Próximos 7 Días)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Plazos de SUNAFIL y fechas de compromiso del equipo
          </p>
        </div>
        <Link
          href="/dashboard/sunafil"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
        >
          Ver SUNAFIL <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
        {plazos.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No hay plazos por vencer en los próximos 7 días.
          </div>
        ) : (
          plazos.map((item) => {
            const esUrgente = item.diasRestantes <= 2;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNotificacion(item)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        esUrgente
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                    >
                      {item.diasRestantes <= 0
                        ? '¡VENCE HOY!'
                        : `Vence en ${item.diasRestantes} día(s)`}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-400 truncate max-w-[200px]">
                      {item.empresa?.razonSocial}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                    {item.asunto}
                  </div>

                  <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span>
                      Fecha límite:{' '}
                      {new Date(item.fechaEfectiva).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1 bg-white/5 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-gray-400 rounded-lg text-xs font-bold transition-all"
                  >
                    Atender
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
