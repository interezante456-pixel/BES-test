"use client";

import React from 'react';
import {
  BellRing,
  Flame,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

interface MorningBriefStatsProps {
  resumen: {
    nuevas24h: number;
    urgentes24h: number;
    misAsignadasPendientes: number;
    plazos3Dias: number;
    empresasConError: number;
  };
  loading?: boolean;
}

export const MorningBriefStats: React.FC<MorningBriefStatsProps> = ({
  resumen,
  loading = false,
}) => {
  const cards = [
    {
      id: 'nuevas',
      title: 'Llegadas Hoy',
      subtitle: 'Últimas 24 horas',
      count: resumen.nuevas24h,
      icon: BellRing,
      color: 'text-blue-400',
      gradient: 'from-blue-600/20 to-indigo-600/20',
      border: 'border-blue-500/30',
    },
    {
      id: 'urgentes',
      title: 'Alertas Críticas',
      subtitle: 'Coactivas y resoluciones',
      count: resumen.urgentes24h,
      icon: Flame,
      color: 'text-rose-400',
      gradient: 'from-rose-600/20 to-red-600/20',
      border: 'border-rose-500/30',
      pulse: resumen.urgentes24h > 0,
    },
    {
      id: 'asignadas',
      title: 'Mis Pendientes',
      subtitle: 'Asignadas a mi cargo',
      count: resumen.misAsignadasPendientes,
      icon: UserCheck,
      color: 'text-orange-400',
      gradient: 'from-orange-600/20 to-amber-600/20',
      border: 'border-orange-500/30',
    },
    {
      id: 'vencimientos',
      title: 'Vencen ≤ 3 días',
      subtitle: 'Plazos de respuesta',
      count: resumen.plazos3Dias,
      icon: AlertTriangle,
      color: 'text-amber-400',
      gradient: 'from-amber-600/20 to-yellow-600/20',
      border: 'border-amber-500/30',
      pulse: resumen.plazos3Dias > 0,
    },
    {
      id: 'errores',
      title: 'Robots con Falla',
      subtitle: 'Requiere revisión Clave SOL',
      count: resumen.empresasConError,
      icon: ShieldAlert,
      color: 'text-red-400',
      gradient: 'from-red-600/20 to-rose-600/20',
      border: 'border-red-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`p-4 rounded-3xl border bg-[#111827] relative overflow-hidden transition-all shadow-lg ${c.border}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-20 pointer-events-none`}
            />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${c.color}`}
                >
                  <Icon className={`w-4 h-4 ${c.pulse ? 'animate-bounce' : ''}`} />
                </div>
                {c.pulse && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Atención
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight font-mono">
                  {loading ? '—' : c.count}
                </div>
                <div className="text-xs font-bold text-gray-200 mt-0.5">
                  {c.title}
                </div>
                <div className="text-[11px] text-gray-400 line-clamp-1">
                  {c.subtitle}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
