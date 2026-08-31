"use client";

import React from 'react';
import {
  Building2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Flame,
} from 'lucide-react';
import Link from 'next/link';

interface EmpresaSemaforoItem {
  id: string;
  ruc: string;
  razonSocial: string;
  estadoConexion: string;
  estadoSincro: string;
  ultimaSincronizacion: string | null;
  nuevasHoy: number;
  urgentesHoy: number;
  nivelAlerta: 'ROJO' | 'AMARILLO' | 'VERDE';
}

interface EmpresaSemaforoListProps {
  empresas: EmpresaSemaforoItem[];
  onSelectEmpresa?: (empresaId: string) => void;
}

export const EmpresaSemaforoList: React.FC<EmpresaSemaforoListProps> = ({
  empresas,
}) => {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Semáforo de Monitoreo por Empresa
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Estado de robots y alertas detectadas hoy ({empresas.length} empresas)
          </p>
        </div>
        <Link
          href="/dashboard/sunat/empresas"
          className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
        >
          Ver Directorio <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
        {empresas.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No hay empresas asignadas para monitorear.
          </div>
        ) : (
          empresas.map((emp) => {
            const badgeConfig = {
              ROJO: {
                bg: 'bg-red-500/10 border-red-500/30 text-red-400',
                dot: 'bg-red-500',
                label: emp.estadoSincro === 'ERROR' ? 'Falla Robot' : 'Crítico Hoy',
              },
              AMARILLO: {
                bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                dot: 'bg-amber-400',
                label: `${emp.nuevasHoy} nueva(s)`,
              },
              VERDE: {
                bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                dot: 'bg-emerald-400',
                label: 'Al día',
              },
            }[emp.nivelAlerta];

            return (
              <div
                key={emp.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${badgeConfig.dot}`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                      {emp.razonSocial}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono flex items-center gap-2">
                      <span>RUC: {emp.ruc}</span>
                      {emp.urgentesHoy > 0 && (
                        <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                          <Flame className="w-3 h-3" /> {emp.urgentesHoy} alerta(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeConfig.bg}`}
                  >
                    {badgeConfig.label}
                  </span>
                  <Link
                    href={`/dashboard/bandeja?empresa=${emp.id}`}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all text-xs"
                    title="Ver en Bandeja"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
