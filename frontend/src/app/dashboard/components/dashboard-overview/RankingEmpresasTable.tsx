"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, FileX, ExternalLink } from 'lucide-react';

interface RankingEmpresasTableProps {
  ranking: {
    id: string;
    ruc: string;
    razonSocial: string;
    estadoConexion: string;
    totalNotificaciones: number;
    sinPdf: number;
  }[];
}

export const RankingEmpresasTable: React.FC<RankingEmpresasTableProps> = ({ ranking }) => {
  const router = useRouter();

  return (
    <div className="xl:col-span-2 bg-[#111827] rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          Ranking de Empresas con Problemas
        </h3>
        <span className="text-[10px] md:text-xs text-gray-500">Ordenado por PDFs no encontrados</span>
      </div>

      <div className="divide-y divide-white/5">
        {!ranking || ranking.length === 0 ? (
          <div className="p-8 md:p-10 text-center text-gray-500 text-sm">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 text-emerald-500/40" />
            <p>¡Sin problemas detectados! Todo en orden.</p>
          </div>
        ) : (
          ranking.map((emp, idx) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 hover:bg-white/[0.02] transition-colors group"
            >
              {/* Rank */}
              <span
                className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : idx === 1
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    : idx === 2
                    ? 'bg-orange-900/30 text-orange-400 border border-orange-700/30'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                }`}
              >
                {idx + 1}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs md:text-sm truncate">{emp.razonSocial}</p>
                <p className="text-gray-500 text-[11px] font-mono">RUC: {emp.ruc}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                {emp.sinPdf > 0 && (
                  <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg">
                    <FileX className="w-3 h-3 md:w-3.5 md:h-3.5" /> {emp.sinPdf}{' '}
                    <span className="hidden sm:inline">sin PDF</span>
                  </span>
                )}
                <span className="text-[10px] md:text-xs text-gray-500 hidden sm:inline">
                  {emp.totalNotificaciones} total
                </span>
                <button
                  onClick={() => router.push(`/dashboard/bandeja?empresa=${emp.id}`)}
                  className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                  aria-label="Ver en bandeja"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
