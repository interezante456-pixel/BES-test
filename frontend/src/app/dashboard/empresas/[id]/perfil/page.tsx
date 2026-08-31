"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  RefreshCw,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';
import { EmpresaMetricas } from './components/EmpresaMetricas';
import { LineaTiempo } from './components/LineaTiempo';
import { PdfViewerDrawer } from '../../../components/PdfViewerDrawer';
import { SunafilDetailDrawer } from '../../../sunafil/components/SunafilDetailDrawer';

export default function EmpresaPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const fetchPerfil = useCallback(async () => {
    if (!empresaId) return;
    try {
      setLoading(true);
      const res = await api.get(`/empresas/${empresaId}/perfil`);
      setData(res.data);
    } catch (e: any) {
      console.error('Error cargando perfil de empresa:', e);
      toast.error('Error al cargar perfil de la empresa.');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const handleSyncEmpresa = async () => {
    if (!empresaId) return;
    try {
      setSyncing(true);
      await api.post(`/scraper/sync/${empresaId}`);
      toast.success('Sincronización encolada en segundo plano.');
      fetchPerfil();
    } catch (e: any) {
      toast.error('Error al iniciar sincronización.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
        Cargando perfil 360° de la empresa...
      </div>
    );
  }

  const empresa = data?.empresa;

  return (
    <div className="space-y-6 pb-12">
      {/* Botón Volver */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al directorio
        </button>
      </div>

      {/* Header Banner Empresa */}
      <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {empresa?.razonSocial}
              </h1>
              <span className="text-xs font-mono font-bold bg-white/5 border border-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                RUC: {empresa?.ruc}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    empresa?.estadoConexion === 'CONECTADO'
                      ? 'bg-emerald-400'
                      : 'bg-rose-400'
                  }`}
                />
                Conexión: {empresa?.estadoConexion}
              </span>
              <span>·</span>
              <span>
                Última Sincro:{' '}
                {empresa?.ultimaSincronizacion
                  ? new Date(empresa.ultimaSincronizacion).toLocaleString('es-PE')
                  : 'Nunca'}
              </span>
              {empresa?.habilitadoSunat && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold text-[10px]">
                  SUNAT Habilitado
                </span>
              )}
              {empresa?.habilitadoSunafil && (
                <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-bold text-[10px]">
                  SUNAFIL Habilitado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/bandeja?empresa=${empresaId}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Ver Bandeja</span>
          </button>

          <button
            type="button"
            onClick={handleSyncEmpresa}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>
        </div>
      </div>

      {/* Métricas y Gráficos */}
      {data?.metricas && (
        <EmpresaMetricas
          metricas={data.metricas}
          historicoMensual={data.historicoMensual || []}
        />
      )}

      {/* Línea de Tiempo de Notificaciones */}
      <LineaTiempo
        notificaciones={data?.lineaTiempo || []}
        onSelectNotificacion={(n) => setSelectedNotif(n)}
      />

      {/* Drawers */}
      {selectedNotif && selectedNotif.origen === 'SUNAFIL' ? (
        <SunafilDetailDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchPerfil()}
        />
      ) : (
        <PdfViewerDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchPerfil()}
        />
      )}
    </div>
  );
}
