"use client";

import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Mail,
  FileX,
  Building,
  ShieldCheck,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

interface EmpresaMetricasProps {
  metricas: {
    totalNotificaciones: number;
    sinLeer: number;
    sinPdf: number;
    atendidas: number;
    sunatCount: number;
    sunafilCount: number;
    moduloSunafilCount: Record<string, number>;
  };
  historicoMensual: { mes: string; cantidad: number }[];
}

export const EmpresaMetricas: React.FC<EmpresaMetricasProps> = ({
  metricas,
  historicoMensual,
}) => {
  const maxMensual = Math.max(...historicoMensual.map((h) => h.cantidad), 1);

  const kpis = [
    {
      title: 'Total Notificaciones',
      count: metricas.totalNotificaciones,
      icon: Inbox,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Atendidas / Leídas',
      count: metricas.atendidas,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Pendientes Sin Leer',
      count: metricas.sinLeer,
      icon: Mail,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Sin Archivo PDF',
      count: metricas.sinPdf,
      icon: FileX,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPIs Superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-3xl bg-[#111827] border ${k.border} shadow-lg relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-2xl ${k.bg} flex items-center justify-center ${k.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {k.count}
              </div>
              <div className="text-xs font-bold text-gray-300 mt-0.5">
                {k.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Paneles de Distribución y Gráfico Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución SUNAT vs SUNAFIL */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-400" />
            Distribución por Entidad y Módulo
          </h3>

          <div className="space-y-3">
            {/* SUNAT Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">SUNAT (Buzón SOL)</span>
                <span className="text-white font-mono">
                  {metricas.sunatCount} (
                  {metricas.totalNotificaciones > 0
                    ? Math.round(
                        (metricas.sunatCount / metricas.totalNotificaciones) *
                          100,
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{
                    width: `${
                      metricas.totalNotificaciones > 0
                        ? (metricas.sunatCount / metricas.totalNotificaciones) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* SUNAFIL Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-400">SUNAFIL (Casilla Laboral)</span>
                <span className="text-white font-mono">
                  {metricas.sunafilCount} (
                  {metricas.totalNotificaciones > 0
                    ? Math.round(
                        (metricas.sunafilCount / metricas.totalNotificaciones) *
                          100,
                      )
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{
                    width: `${
                      metricas.totalNotificaciones > 0
                        ? (metricas.sunafilCount /
                            metricas.totalNotificaciones) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Submódulos SUNAFIL */}
            {metricas.sunafilCount > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    Fiscaliz.
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {metricas.moduloSunafilCount.FISCALIZACION || 0}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    Cobranza
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {metricas.moduloSunafilCount.COBRANZA || 0}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    Acc. Previas
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {metricas.moduloSunafilCount.ACCIONES_PREVIAS || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico Histórico 12 Meses */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Actividad Notificaciones (Últimos 12 Meses)
          </h3>

          <div className="h-40 flex items-end justify-between gap-1 pt-6 px-1">
            {historicoMensual.map((item, idx) => {
              const alturaPct = Math.round((item.cantidad / maxMensual) * 100);
              const labelMes = item.mes.split('-')[1]; // mes en 2 dígitos

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-7 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.mes}: {item.cantidad}
                  </div>

                  <div
                    className="w-full max-w-[20px] bg-gradient-to-t from-indigo-600/30 to-indigo-500 rounded-t-lg group-hover:from-orange-500/50 group-hover:to-orange-400 transition-all"
                    style={{ height: `${Math.max(alturaPct, 4)}%` }}
                  />
                  <span className="text-[9px] text-gray-500 font-mono">
                    {labelMes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
