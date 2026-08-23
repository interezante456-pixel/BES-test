"use client";

import React from 'react';
import {
  Inbox,
  Search,
  DollarSign,
  AlertTriangle,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface SunafilMetrics {
  total: number;
  fiscalizacion: number;
  cobranza: number;
  accionesPrevias: number;
  formalizacion: number;
  sst: number;
  porVencer: number;
}

interface SunafilKpiCardsProps {
  metrics: SunafilMetrics;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  loading?: boolean;
}

export const SunafilKpiCards: React.FC<SunafilKpiCardsProps> = ({
  metrics,
  activeTab,
  onSelectTab,
  loading = false,
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total SUNAFIL',
      subtitle: 'Consolidado general',
      count: metrics.total,
      icon: Inbox,
      gradient: 'from-indigo-600/20 to-purple-600/20',
      border: 'border-indigo-500/30',
      activeBorder: 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      id: 'FISCALIZACION',
      title: 'Fiscalización Laboral',
      subtitle: 'Órdenes de inspección',
      count: metrics.fiscalizacion,
      icon: Search,
      gradient: 'from-blue-600/20 to-cyan-600/20',
      border: 'border-blue-500/20',
      activeBorder: 'border-blue-400 bg-blue-950/40 ring-2 ring-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'COBRANZA',
      title: 'Cobranza Ordinaria',
      subtitle: 'Expedientes y multas',
      count: metrics.cobranza,
      icon: DollarSign,
      gradient: 'from-amber-600/20 to-orange-600/20',
      border: 'border-amber-500/20',
      activeBorder: 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      id: 'ACCIONES_PREVIAS',
      title: 'Acciones Previas',
      subtitle: 'Cartas inductivas / disuasivas',
      count: metrics.accionesPrevias,
      badge: metrics.porVencer > 0 ? `${metrics.porVencer} por vencer` : null,
      icon: AlertTriangle,
      gradient: 'from-rose-600/20 to-pink-600/20',
      border: 'border-rose-500/20',
      activeBorder: 'border-rose-400 bg-rose-950/40 ring-2 ring-rose-500/30',
      iconColor: 'text-rose-400',
    },
    {
      id: 'ALERTAS_FORMALIZACION',
      title: 'Formalización Laboral',
      subtitle: 'Trabajadores en planilla',
      count: metrics.formalizacion,
      icon: Users,
      gradient: 'from-purple-600/20 to-indigo-600/20',
      border: 'border-purple-500/20',
      activeBorder: 'border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      id: 'ALERTAS_SST',
      title: 'Seguridad y Salud (SST)',
      subtitle: 'Condiciones de trabajo',
      count: metrics.sst,
      icon: ShieldCheck,
      gradient: 'from-emerald-600/20 to-teal-600/20',
      border: 'border-emerald-500/20',
      activeBorder: 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeTab === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectTab(c.id)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group cursor-pointer bg-[#111827] ${
              isActive ? c.activeBorder : `${c.border} hover:border-white/20 hover:bg-white/[0.02]`
            }`}
          >
            {/* Background gradient hint */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity`}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${c.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {c.badge && (
                  <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
                    {c.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {loading ? '—' : c.count}
                </div>
                <div className="text-xs font-bold text-gray-200 line-clamp-1 mt-0.5">
                  {c.title}
                </div>
                <div className="text-[10px] text-gray-400 line-clamp-1">
                  {c.subtitle}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
