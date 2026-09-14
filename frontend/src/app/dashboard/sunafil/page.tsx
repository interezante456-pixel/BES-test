"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { SunafilKpiCards } from './components/SunafilKpiCards';
import { SunafilFilterBar } from './components/SunafilFilterBar';
import { SunafilTable } from './components/SunafilTable';
import { SunafilDetailDrawer } from './components/SunafilDetailDrawer';
import { SunafilDeleteModal } from './components/SunafilDeleteModal';
import { useSunafilNotifications } from './hooks/useSunafilNotifications';
import api from '@/lib/api';

export default function SunafilPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const hasSunafil = user?.rol === 'SUPER_ADMIN' || (user?.modulosPermitidos || ['SUNAT']).includes('SUNAFIL');

  React.useEffect(() => {
    if (user && !hasSunafil) router.push('/dashboard');
  }, [user, hasSunafil, router]);

  const {
    canDelete, activeTab, selectedEmpresa, setSelectedEmpresa, searchTerm, setSearchTerm,
    startDate, setStartDate, endDate, setEndDate, estadoFilter, setEstadoFilter,
    page, setPage, notificaciones, setNotificaciones, meta, loading, selectedIds,
    isDeleting, deleteModalState, setDeleteModalState, metrics, loadingMetrics,
    selectedNotif, setSelectedNotif, isDrawerOpen, setIsDrawerOpen, sunafilEmpresas,
    handleTabChange, handleToggleSelect, handleToggleSelectAll, confirmDelete,
    handleExportExcel, handleViewDetail, fetchMetrics, fetchNotificaciones,
  } = useSunafilNotifications();

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
              <h1 className="text-2xl font-bold text-white tracking-tight">Casilla Electrónica — SUNAFIL</h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">CASILLA LABORAL</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Monitoreo centralizado de actuaciones inspectivas, cobranzas, requerimientos y formalización.
            </p>
          </div>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Monitoreo Activo
        </span>
      </div>

      {/* 1. Métricas */}
      <SunafilKpiCards metrics={metrics} activeTab={activeTab} onSelectTab={handleTabChange} loading={loadingMetrics} />

      {/* 2. Filtros */}
      <SunafilFilterBar
        empresas={sunafilEmpresas}
        selectedEmpresa={selectedEmpresa}
        onSelectEmpresa={(id) => { setSelectedEmpresa(id); setPage(1); }}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
        startDate={startDate}
        onStartDateChange={(val) => { setStartDate(val); setPage(1); }}
        endDate={endDate}
        onEndDateChange={(val) => { setEndDate(val); setPage(1); }}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={(val) => { setEstadoFilter(val); setPage(1); }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onExportExcel={handleExportExcel}
        onRefresh={() => { fetchMetrics(); fetchNotificaciones(); }}
        isRefreshing={loading}
        selectedCount={selectedIds.length}
        onDeleteSelected={canDelete && selectedIds.length > 0 ? () => setDeleteModalState({ open: true, type: 'selected' }) : undefined}
        onDeleteAll={canDelete && meta.total > 0 ? () => setDeleteModalState({ open: true, type: 'all' }) : undefined}
      />

      {/* 3. Tabla */}
      <SunafilTable
        notificaciones={notificaciones}
        activeTab={activeTab}
        loading={loading}
        selectedIds={selectedIds}
        canDelete={canDelete}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewDetail={handleViewDetail}
        onDeleteOne={(id) => setDeleteModalState({ open: true, type: 'single', targetId: id })}
      />

      {/* 4. Paginación */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border border-white/5 rounded-2xl">
          <div className="text-xs text-gray-400 font-medium">
            Mostrando <span className="text-white font-bold">{notificaciones.length}</span> de{' '}
            <span className="text-white font-bold">{meta.total}</span> notificaciones
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl disabled:opacity-40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs font-bold text-indigo-300 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              Página {meta.page} de {meta.lastPage}
            </span>
            <button type="button" disabled={page >= meta.lastPage || loading} onClick={() => setPage((p) => p + 1)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl disabled:opacity-40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Drawer de Detalle */}
      <SunafilDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedNotif(null); }}
        notificacion={selectedNotif}
        onNotificacionUpdated={(updated) => {
          setNotificaciones((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
          setSelectedNotif(updated);
        }}
      />

      {/* 6. Modal de Eliminación */}
      <SunafilDeleteModal
        state={deleteModalState}
        selectedCount={selectedIds.length}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteModalState({ open: false, type: 'single' })}
      />
    </div>
  );
}
