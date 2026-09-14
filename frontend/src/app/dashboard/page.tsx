"use client";

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { DashboardKpiCards } from './components/dashboard-overview/DashboardKpiCards';
import { RankingEmpresasTable } from './components/dashboard-overview/RankingEmpresasTable';
import { SincroPorDiaChart } from './components/dashboard-overview/SincroPorDiaChart';
import { HistoricoMensualSection } from './components/dashboard-overview/HistoricoMensualSection';

interface Stats {
  totalEmpresas: number;
  empresasSunat?: number;
  empresasSunafil?: number;
  totalNotificaciones: number;
  sinLeer: number;
  sinPdf: number;
  totalPeligrosas?: number;
  totalNormales?: number;
  rankingEmpresas: {
    id: string;
    ruc: string;
    razonSocial: string;
    estadoConexion: string;
    totalNotificaciones: number;
    sinPdf: number;
  }[];
  sincroPorDia: { fecha: string; cantidad: number; peligrosas?: number; normales?: number }[];
  historicoMensual?: { mesKey: string; mesNombre: string; cantidad: number; peligrosas: number; normales: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUNAT' | 'SUNAFIL'>('ALL');

  useEffect(() => {
    api.get('/estadisticas')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con Selector de Entidad */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Panel de Control 360°
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Resumen centralizado de alertas, notificaciones y estado de robots de monitoreo.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-[#111827] p-1 rounded-2xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🌐 Vista General 360°
          </button>
          <button
            onClick={() => setActiveTab('SUNAT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SUNAT' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            SUNAT
          </button>
          <button
            onClick={() => setActiveTab('SUNAFIL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SUNAFIL' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            SUNAFIL (Beta)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKpiCards stats={stats} activeTab={activeTab} />

      {/* Main Grid: Ranking & Evolución 7 Días */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <RankingEmpresasTable ranking={stats?.rankingEmpresas || []} />
        <SincroPorDiaChart sincroPorDia={stats?.sincroPorDia || []} />
      </div>

      {/* Histórico General de Alertas (Vista Mensual) */}
      <HistoricoMensualSection historicoMensual={stats?.historicoMensual || []} />
    </div>
  );
}
