"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  RefreshCw,
  TrendingUp,
  Building2,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { MorningBriefStats } from './components/MorningBriefStats';
import { EmpresaSemaforoList } from './components/EmpresaSemaforoList';
import { NovedadesList } from './components/NovedadesList';
import { PlazosProximosList } from './components/PlazosProximosList';
import { PdfViewerDrawer } from '../components/PdfViewerDrawer';
import { SunafilDetailDrawer } from '../sunafil/components/SunafilDetailDrawer';

export default function MorningBriefPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const fetchBrief = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/estadisticas/morning-brief');
      setData(res.data);
    } catch (e) {
      console.error('Error cargando Morning Brief:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
  }, [fetchBrief]);

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner Profesional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-950/40 via-[#111827] to-indigo-950/40 border border-orange-500/20 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/10 shrink-0">
            <Sun className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {getSaludo()}, {user?.nombres || 'Equipo'}
              </h1>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Resumen Diario
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {fechaHoy} — Monitor de alertas, vencimientos y robots en las últimas 24 horas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBrief}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Métricas Superiores */}
      <MorningBriefStats
        resumen={
          data?.resumen || {
            nuevas24h: 0,
            urgentes24h: 0,
            misAsignadasPendientes: 0,
            plazos3Dias: 0,
            empresasConError: 0,
          }
        }
        loading={loading}
      />

      {/* 3. Panel Central: Novedades del día + Semáforo de empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NovedadesList
          novedades={data?.novedades24h || []}
          onSelectNotificacion={(n) => setSelectedNotif(n)}
        />
        <EmpresaSemaforoList empresas={data?.semaforoEmpresas || []} />
      </div>

      {/* 4. Panel Inferior: Vencimientos y plazos próximos */}
      <PlazosProximosList
        plazos={data?.plazosProximos || []}
        onSelectNotificacion={(n) => setSelectedNotif(n)}
      />

      {/* Drawers para abrir detalle según origen */}
      {selectedNotif && selectedNotif.origen === 'SUNAFIL' ? (
        <SunafilDetailDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchBrief()}
        />
      ) : (
        <PdfViewerDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchBrief()}
        />
      )}
    </div>
  );
}
