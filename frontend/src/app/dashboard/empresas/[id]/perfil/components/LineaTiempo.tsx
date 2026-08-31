"use client";

import React from 'react';
import {
  Calendar,
  FileText,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  CircleDollarSign,
} from 'lucide-react';

interface LineaTiempoProps {
  notificaciones: any[];
  onSelectNotificacion: (notif: any) => void;
}

export const LineaTiempo: React.FC<LineaTiempoProps> = ({
  notificaciones,
  onSelectNotificacion,
}) => {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Línea de Tiempo de Notificaciones
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Registro cronológico detallado de las últimas {notificaciones.length} comunicaciones oficiales
          </p>
        </div>
      </div>

      {notificaciones.length === 0 ? (
        <div className="text-center py-12 text-xs text-gray-500">
          Esta empresa no tiene notificaciones registradas todavía.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-6">
          {notificaciones.map((notif) => {
            const fechaStr = new Date(
              notif.fechaMensaje || notif.createdAt,
            ).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            const esSunafil = notif.origen === 'SUNAFIL';

            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotificacion(notif)}
                className="relative group cursor-pointer"
              >
                {/* Punto en la línea de tiempo */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-[#111827] flex items-center justify-center transition-all ${
                    esSunafil
                      ? 'bg-indigo-500 group-hover:bg-indigo-400 group-hover:scale-125'
                      : 'bg-emerald-500 group-hover:bg-emerald-400 group-hover:scale-125'
                  }`}
                />

                {/* Tarjeta de notificación en el timeline */}
                <div className="bg-white/[0.02] group-hover:bg-white/[0.04] border border-white/5 group-hover:border-white/15 p-4 rounded-2xl transition-all space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          esSunafil
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {notif.origen || 'SUNAT'}
                      </span>
                      {notif.moduloSunafil && (
                        <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                          {notif.moduloSunafil}
                        </span>
                      )}
                      {notif.montoExigible && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CircleDollarSign className="w-3 h-3" /> {notif.montoExigible}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 font-mono">
                      {fechaStr}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {notif.asunto}
                  </h4>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                    <div className="flex items-center gap-3">
                      {notif.codigoReferencia && (
                        <span className="font-mono text-gray-500">
                          Ref: {notif.codigoReferencia}
                        </span>
                      )}
                      {notif.estadoGestion && (
                        <span className="text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded">
                          {notif.estadoGestion}
                        </span>
                      )}
                      {notif.responsable && (
                        <span className="text-gray-400">
                          Resp: {notif.responsable.nombres}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="text-xs font-bold text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Ver Detalle <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
