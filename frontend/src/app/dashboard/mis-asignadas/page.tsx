"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { ESTADOS_GESTION } from '../components/NotifGestionPanel';
import { PdfViewerDrawer } from '../components/PdfViewerDrawer';
import { SunafilDetailDrawer } from '../sunafil/components/SunafilDetailDrawer';

export default function MisAsignadasPage() {
  const { user } = useAuthStore();
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('ALL');
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const fetchMisAsignadas = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
        estadoGestion: estadoFilter,
        search: searchTerm || undefined,
      };
      const res = await api.get('/notificaciones/mis-asignadas', { params });
      setNotificaciones(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, lastPage: 1 });
    } catch (e) {
      console.error('Error cargando mis asignadas:', e);
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter, searchTerm]);

  useEffect(() => {
    fetchMisAsignadas();
  }, [fetchMisAsignadas]);

  if (user && user.rol !== 'SUPER_ADMIN') {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <UserCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo en Fase Beta Privada</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Este apartado se encuentra actualmente en fase de pruebas y está disponible exclusivamente para Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Mis Notificaciones Asignadas
              </h1>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold">
                BANDEJA PERSONAL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Casos y requerimientos asignados a tu nombre ({meta.total} total)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMisAsignadas}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111827] border border-white/5 p-3 rounded-2xl">
        {/* Pestañas de Estado */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setEstadoFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              estadoFilter === 'ALL'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos
          </button>
          {ESTADOS_GESTION.map((est) => (
            <button
              key={est.value}
              type="button"
              onClick={() => {
                setEstadoFilter(est.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                estadoFilter === est.value
                  ? est.color
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {est.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por asunto, empresa..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Listado / Tabla */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
            Cargando tus notificaciones asignadas...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <UserCheck className="w-12 h-12 mx-auto text-gray-600 opacity-40" />
            <p className="text-sm font-bold text-gray-300">
              No tienes notificaciones en este estado
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Cuando un administrador te asigne notificaciones para dar seguimiento o resolver requerimientos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notificaciones.map((notif) => {
              const estConfig =
                ESTADOS_GESTION.find((e) => e.value === notif.estadoGestion) ||
                ESTADOS_GESTION[0];
              const Icon = estConfig.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotif(notif)}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${estConfig.color}`}
                      >
                        <Icon className="w-3 h-3" /> {estConfig.label}
                      </span>
                      <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md font-mono">
                        {notif.origen || 'SUNAT'}
                      </span>
                      <span className="text-xs font-bold text-orange-400 truncate">
                        {notif.empresa?.razonSocial}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        ({notif.empresa?.ruc})
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                      {notif.asunto}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <span>
                        Fecha:{' '}
                        {new Date(notif.fechaMensaje).toLocaleDateString('es-PE')}
                      </span>
                      {notif.fechaCompromiso && (
                        <span className="text-indigo-400 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          <Calendar className="w-3 h-3" /> Límite:{' '}
                          {new Date(notif.fechaCompromiso).toLocaleDateString('es-PE')}
                        </span>
                      )}
                      {notif.notasInternas && (
                        <span className="text-gray-400 italic line-clamp-1 max-w-md">
                          Nota: "{notif.notasInternas}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 text-xs font-bold rounded-xl transition-all"
                    >
                      Gestionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#0d1320] border-t border-white/5">
            <div className="text-xs text-gray-400">
              Mostrando <span className="text-white font-bold">{notificaciones.length}</span> de{' '}
              <span className="text-white font-bold">{meta.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg disabled:opacity-40 text-xs flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-xs text-orange-300 font-bold px-2">
                Página {meta.page} de {meta.lastPage}
              </span>
              <button
                type="button"
                disabled={page >= meta.lastPage || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg disabled:opacity-40 text-xs flex items-center gap-1 cursor-pointer"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedNotif && selectedNotif.origen === 'SUNAFIL' ? (
        <SunafilDetailDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchMisAsignadas()}
        />
      ) : (
        <PdfViewerDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchMisAsignadas()}
        />
      )}
    </div>
  );
}
