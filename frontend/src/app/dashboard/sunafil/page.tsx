"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, ChevronLeft, ChevronRight, Trash2, AlertTriangle, X } from 'lucide-react';
import api from '@/lib/api';
import { useEmpresas } from '../empresas/hooks/useEmpresas';
import { useAuthStore } from '@/store/useAuthStore';
import { SunafilKpiCards, SunafilMetrics } from './components/SunafilKpiCards';
import { SunafilFilterBar } from './components/SunafilFilterBar';
import { SunafilTable } from './components/SunafilTable';
import { SunafilDetailDrawer } from './components/SunafilDetailDrawer';
import { exportToExcel } from '@/lib/excelUtils';
import { toast } from '@/store/useToastStore';

export default function SunafilPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canDelete = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';
  const hasSunafil = user?.rol === 'SUPER_ADMIN' || (user?.modulosPermitidos || ['SUNAT']).includes('SUNAFIL');

  // Si el usuario no tiene acceso a SUNAFIL, redirigir a /dashboard
  useEffect(() => {
    if (user && !hasSunafil) {
      router.push('/dashboard');
    }
  }, [user, hasSunafil, router]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('ALL');

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    type: 'single' | 'selected' | 'all';
    targetId?: string;
  }>({ open: false, type: 'single' });

  const [metrics, setMetrics] = useState<SunafilMetrics>({
    total: 0,
    noLeidas: 0,
    fiscalizacion: 0,
    cobranza: 0,
    accionesPrevias: 0,
    formalizacion: 0,
    sst: 0,
    porVencer: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { empresas } = useEmpresas();
  const sunafilEmpresas = empresas.filter((e) => e.habilitadoSunafil === true);

  // Cargar Métricas
  const fetchMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const params = selectedEmpresa !== 'all' ? { empresa: selectedEmpresa } : {};
      const res = await api.get('/notificaciones/sunafil/metricas', { params });
      setMetrics(res.data);
    } catch (e) {
      console.error('Error fetching sunafil metrics:', e);
    } finally {
      setLoadingMetrics(false);
    }
  }, [selectedEmpresa]);

  // Cargar Notificaciones
  const fetchNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        empresa: selectedEmpresa,
        modulo: activeTab,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        estado: estadoFilter,
      };

      const res = await api.get('/notificaciones/sunafil', { params });
      setNotificaciones(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, lastPage: 1 });
      setSelectedIds([]); // reset selection on new data
    } catch (e) {
      console.error('Error fetching sunafil notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedEmpresa, activeTab, searchTerm, startDate, endDate, estadoFilter]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  // Manejar cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds([]);
  };

  // Manejo de Selección
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (notificaciones.every((n) => selectedIds.includes(n.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notificaciones.map((n) => n.id));
    }
  };

  // Eliminaciones
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (deleteModalState.type === 'single' && deleteModalState.targetId) {
        await api.delete(`/notificaciones/${deleteModalState.targetId}`);
      } else if (deleteModalState.type === 'selected' && selectedIds.length > 0) {
        await api.post('/notificaciones/bulk-delete', { ids: selectedIds });
      } else if (deleteModalState.type === 'all') {
        await api.delete('/notificaciones');
      }

      setDeleteModalState({ open: false, type: 'single' });
      setSelectedIds([]);
      fetchMetrics();
      fetchNotificaciones();
    } catch (err: any) {
      console.error('Error deleting notifications:', err);
      toast.error(err.response?.data?.message || 'Error al eliminar notificaciones');
    } finally {
      setIsDeleting(false);
    }
  };

  // Exportación a Excel
  const handleExportExcel = () => {
    if (notificaciones.length === 0) {
      toast.warning('No hay notificaciones para exportar.');
      return;
    }

    const data = notificaciones.map((n) => ({
      'Empresa': n.empresa?.razonSocial || '',
      'RUC': n.empresa?.ruc || '',
      'Módulo': n.moduloSunafil || '',
      'Identificador': n.codigoReferencia || n.fileId || '',
      'Asunto': n.asunto || '',
      'Fecha Notificación': n.fechaNotificacion
        ? new Date(n.fechaNotificacion).toLocaleDateString('es-PE')
        : '',
      'Fecha Depósito': n.fechaDeposito
        ? new Date(n.fechaDeposito).toLocaleDateString('es-PE')
        : '',
      'Plazo (Días)': n.plazoDias || '',
      'Fecha Límite': n.fechaLimite
        ? new Date(n.fechaLimite).toLocaleDateString('es-PE')
        : '',
      'Intendencia': n.intendencia || '',
      'Trabajadores': n.trabajadoresIncorporados ?? '',
      'Estado': n.estado || '',
    }));

    exportToExcel(data, `SUNAFIL_Notificaciones_${activeTab}`, 'Notificaciones_SUNAFIL');
  };

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-[#111827] to-purple-950/30 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Casilla Electrónica — SUNAFIL
              </h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                CASILLA LABORAL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Monitoreo centralizado de actuaciones inspectivas, cobranzas, requerimientos y formalización.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Monitoreo Activo
          </span>
        </div>
      </div>

      {/* 1. Tarjetas Métricas Superiores */}
      <SunafilKpiCards
        metrics={metrics}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        loading={loadingMetrics}
      />

      {/* 2. Barra de Pestañas y Filtros */}
      <SunafilFilterBar
        empresas={sunafilEmpresas}
        selectedEmpresa={selectedEmpresa}
        onSelectEmpresa={(id) => {
          setSelectedEmpresa(id);
          setPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(val) => {
          setStartDate(val);
          setPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(val) => {
          setEndDate(val);
          setPage(1);
        }}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={(val) => {
          setEstadoFilter(val);
          setPage(1);
        }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onExportExcel={handleExportExcel}
        onRefresh={() => {
          fetchMetrics();
          fetchNotificaciones();
        }}
        isRefreshing={loading}
        selectedCount={selectedIds.length}
        onDeleteSelected={
          canDelete && selectedIds.length > 0
            ? () => setDeleteModalState({ open: true, type: 'selected' })
            : undefined
        }
        onDeleteAll={
          canDelete && meta.total > 0
            ? () => setDeleteModalState({ open: true, type: 'all' })
            : undefined
        }
      />

      {/* 3. Tabla Adaptable según Módulo */}
      <SunafilTable
        notificaciones={notificaciones}
        activeTab={activeTab}
        loading={loading}
        selectedIds={selectedIds}
        canDelete={canDelete}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewDetail={(notif) => {
          setSelectedNotif(notif);
          setIsDrawerOpen(true);
          // Mark as read automatically when opening detail
          if (!notif.leidoGlobal) {
            api.patch(`/notificaciones/${notif.id}/read`).then(() => {
              // Update local state to reflect read status
              setNotificaciones((prev) =>
                prev.map((n) =>
                  n.id === notif.id ? { ...n, leidoGlobal: true } : n
                )
              );
              // Refresh metrics to update noLeidas count
              fetchMetrics();
            }).catch(() => {/* silent */});
          }
        }}
        onDeleteOne={(id) => {
          setDeleteModalState({ open: true, type: 'single', targetId: id });
        }}
      />

      {/* 4. Paginación */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border border-white/5 rounded-2xl">
          <div className="text-xs text-gray-400 font-medium">
            Mostrando <span className="text-white font-bold">{notificaciones.length}</span> de{' '}
            <span className="text-white font-bold">{meta.total}</span> notificaciones
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs font-bold text-indigo-300 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              Página {meta.page} de {meta.lastPage}
            </span>
            <button
              type="button"
              disabled={page >= meta.lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Drawer de Detalle Completo */}
      <SunafilDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedNotif(null);
        }}
        notificacion={selectedNotif}
        onNotificacionUpdated={(updated) => {
          // Sync updated notification back into the table list
          setNotificaciones((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );
          setSelectedNotif(updated);
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalState.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Confirmar eliminación?</h3>
                <p className="text-xs text-gray-400">
                  {deleteModalState.type === 'single'
                    ? 'Esta notificación será eliminada definitivamente de la base de datos.'
                    : deleteModalState.type === 'selected'
                    ? `Se eliminarán permanentemente las ${selectedIds.length} notificaciones seleccionadas.`
                    : 'Se eliminarán todas las notificaciones registradas de las empresas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeleteModalState({ open: false, type: 'single' })}
                disabled={isDeleting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
