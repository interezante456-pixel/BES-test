"use client";

import { useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuditoria, AuditLogItem } from './hooks/useAuditoria';
import { AuditFilterBar } from './components/AuditFilterBar';
import { AuditTable } from './components/AuditTable';
import { AuditDetailModal } from './components/AuditDetailModal';

export default function AuditoriaPage() {
  const {
    logs,
    loading,
    search,
    accionFilter,
    accionesUnicas,
    page,
    totalPages,
    totalItems,
    isSuperAdmin,
    setPage,
    handleSearchChange,
    handleAccionFilterChange,
    fetchLogs,
  } = useAuditoria();

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-[#111827] rounded-3xl border border-white/5 max-w-lg mx-auto mt-10">
        <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Acceso Restringido</h3>
        <p className="text-xs text-gray-400">
          El módulo de auditoría es de acceso exclusivo para la cuenta Super Administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            Registro de Auditoría de Sistema
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Historial completo de acciones, accesos, consultas y cambios realizados en el sistema.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Logs
        </button>
      </div>

      {/* Filters Bar */}
      <AuditFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        accionFilter={accionFilter}
        onAccionFilterChange={handleAccionFilterChange}
        accionesUnicas={accionesUnicas}
        totalItems={totalItems}
      />

      {/* Table */}
      <AuditTable
        logs={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSelectLog={setSelectedLog}
      />

      {/* Modal Details */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
