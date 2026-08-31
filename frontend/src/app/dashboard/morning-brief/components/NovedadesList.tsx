"use client";

import React from 'react';
import {
  Mail,
  Flame,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface NovedadesListProps {
  novedades: any[];
  onSelectNotificacion: (notif: any) => void;
}

export const NovedadesList: React.FC<NovedadesListProps> = ({
  novedades,
  onSelectNotificacion,
}) => {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Novedades del Día (Últimas 24h)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {novedades.length} notificaciones nuevas descargadas por los robots
          </p>
        </div>
        <Link
          href="/dashboard/bandeja"
          className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
        >
          Ir a Bandeja <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
        {novedades.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500">
            No han ingresado nuevas notificaciones en las últimas 24 horas. ¡Todo al día!
          </div>
        ) : (
          novedades.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotificacion(notif)}
              className="py-3 flex items-start justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-all cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {notif.urgente && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3 text-rose-400" /> Crítico
                    </span>
                  )}
                  <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    {notif.origen || 'SUNAT'}
                  </span>
                  <span className="text-[11px] font-bold text-orange-400 truncate max-w-[200px]">
                    {notif.empresa?.razonSocial}
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                  {notif.asunto}
                </div>

                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                  <span>
                    {new Date(notif.fechaMensaje).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {notif.responsable && (
                    <span className="text-gray-400">
                      · Asignado: {notif.responsable.nombres}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 pt-1">
                <button
                  type="button"
                  className="px-2.5 py-1 bg-white/5 group-hover:bg-indigo-600/30 group-hover:text-indigo-200 text-gray-400 rounded-lg text-xs font-bold transition-all"
                >
                  Abrir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
