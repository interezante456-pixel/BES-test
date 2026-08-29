"use client";

import { useState, Suspense } from 'react';
import { Archive, Trash2, CheckSquare, Square } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { PdfViewerDrawer } from '../components/PdfViewerDrawer';
import { PaginationControls } from '@/components/PaginationControls';
import { NotificationFilterBar } from '../components/NotificationFilterBar';
import { NotificationItem } from '../components/NotificationItem';
import { useNotificationList } from '../hooks/useNotificationList';

function ArchivoContent() {
  const {
    notificaciones,
    meta,
    page,
    loading,
    searchTerm,
    startDate,
    endDate,
    categoriaFilter,
    setCategoriaFilter,
    counts,
    selectedIds,
    allSelected,
    canDelete,
    setPage,
    setSearchTerm,
    setStartDate,
    setEndDate,
    getPdfUrl,
    deleteNotification,
    bulkDeleteNotifications,
    toggleSelectAll,
    toggleSelectOne,
    clearFilters,
  } = useNotificationList({
    endpoint: '/notificaciones/archivo',
  });

  const [selectedNotifForPdf, setSelectedNotifForPdf] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Archive className="w-7 h-7 text-gray-400" />
            Archivo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Historial de todas las notificaciones procesadas y leídas.
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          {meta.total} registros en total
        </span>
      </div>

      {/* Search & Date Filters + Categorías de Alertas */}
      <NotificationFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        categoriaFilter={categoriaFilter}
        onCategoriaFilterChange={setCategoriaFilter}
        counts={counts}
        onClearFilters={clearFilters}
      />

      {/* Toolbar para Selección Múltiple y Borrado Masivo (ADMIN / SUPER_ADMIN) */}
      {canDelete && notificaciones.length > 0 && (
        <div className="flex items-center justify-between bg-[#111827] px-6 py-3.5 rounded-2xl border border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-gray-500" />
              )}
              <span>
                {selectedIds.length > 0
                  ? `${selectedIds.length} seleccionado(s) de ${notificaciones.length}`
                  : 'Seleccionar todo'}
              </span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar seleccionados ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">Cargando archivo...</div>
      ) : (
        <div className="bg-[#111827] rounded-3xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {notificaciones.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-lg">El archivo está vacío</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchTerm
                    ? 'No se encontraron resultados.'
                    : 'Las notificaciones leídas aparecerán aquí.'}
                </p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notificacion={notif}
                  mode="archive"
                  isSelected={selectedIds.includes(notif.id)}
                  canSelect={canDelete}
                  canDelete={canDelete}
                  onSelect={() => toggleSelectOne(notif.id)}
                  onClick={() =>
                    setSelectedNotifForPdf({
                      ...notif,
                      rutaArchivoPdf: getPdfUrl(notif.rutaArchivoPdf),
                    })
                  }
                  onDelete={() => setDeleteTarget(notif.id)}
                />
              ))
            )}
          </div>

          <PaginationControls
            currentPage={meta.page}
            totalPages={meta.lastPage}
            totalItems={meta.total}
            itemLabel="notificaciones"
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Visor de PDF */}
      <PdfViewerDrawer
        isOpen={!!selectedNotifForPdf}
        onClose={() => setSelectedNotifForPdf(null)}
        notificacion={selectedNotifForPdf}
      />

      {/* Modal Confirmar Eliminación Individual */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteNotification(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        title="¿Eliminar notificación?"
        message="Se eliminará esta notificación y su PDF del sistema de forma permanente. Esta acción no se puede deshacer."
      />

      {/* Modal Confirmar Eliminación Masiva */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={async () => {
          await bulkDeleteNotifications();
          setShowBulkConfirm(false);
        }}
        title={`¿Eliminar ${selectedIds.length} notificación(es)?`}
        message={`Se eliminarán permanentemente las ${selectedIds.length} notificaciones seleccionadas y sus archivos PDF asociados. Esta acción no se puede deshacer.`}
      />
    </div>
  );
}

export default function ArchivoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">Cargando archivo...</div>}>
      <ArchivoContent />
    </Suspense>
  );
}
