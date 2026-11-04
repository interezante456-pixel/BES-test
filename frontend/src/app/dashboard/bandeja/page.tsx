"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { PdfViewerDrawer } from '../components/PdfViewerDrawer';
import { ZipExportButton } from '../components/ZipExportButton';
import { PaginationControls } from '@/components/PaginationControls';
import { NotificationFilterBar } from '../components/NotificationFilterBar';
import { NotificationItem } from '../components/NotificationItem';
import { useNotificationList } from '../hooks/useNotificationList';

function BandejaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const empresaFilterId = searchParams.get('empresa');

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
    retrying,
    setPage,
    setSearchTerm,
    setStartDate,
    setEndDate,
    getPdfUrl,
    markAsRead,
    clearInbox,
    retryPdf,
    clearFilters,
  } = useNotificationList({
    endpoint: '/notificaciones',
    empresaFilterId,
  });

  const [selectedNotifForDrawer, setSelectedNotifForDrawer] = useState<any | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleViewPdf = async (notif: any) => {
    await markAsRead(notif.id);
    const pdfUrl = getPdfUrl(notif.rutaArchivoPdf);
    setSelectedNotifForDrawer({
      ...notif,
      rutaArchivoPdf: pdfUrl,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="w-7 h-7 text-blue-400" />
            Bandeja de Entrada
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Notificaciones SUNAT sin revisar. Al abrir el PDF, se marcarán como revisadas para todos los usuarios de esta empresa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notificaciones.length > 0 && (
            <ZipExportButton
              notificaciones={notificaciones.map((n) => ({
                id: n.id,
                asunto: n.asunto,
                rutaArchivoPdf: getPdfUrl(n.rutaArchivoPdf),
              }))}
            />
          )}
          <button
            onClick={() => router.push('/dashboard/archivo')}
            className="text-sm text-gray-400 hover:text-indigo-400 transition-colors underline underline-offset-2"
          >
            Ver historial leídas →
          </button>
        </div>
      </div>

      {/* Search & Date Filters + Categorías de Alertas */}
      <NotificationFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        empresaFilterId={empresaFilterId}
        categoriaFilter={categoriaFilter}
        onCategoriaFilterChange={setCategoriaFilter}
        counts={counts}
        onClearEmpresaFilter={() => router.push('/dashboard/bandeja')}
        onClearFilters={() => {
          clearFilters();
          if (empresaFilterId) router.push('/dashboard/bandeja');
        }}
      />

      {/* List */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">Cargando bandeja...</div>
      ) : (
        <div className="bg-[#111827] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Notificaciones Sin Leer
            </h3>
            <div className="flex items-center gap-3">
              {notificaciones.length > 0 && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors border border-red-400/20"
                >
                  <Trash2 className="w-4 h-4" /> Limpiar Todo
                </button>
              )}
              <span className="bg-blue-500/10 text-blue-400 py-1.5 px-4 rounded-xl text-sm font-semibold border border-blue-500/20">
                {notificaciones.length} Sin Leer
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {notificaciones.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <MailOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-lg">¡Bandeja vacía!</p>
                <p className="text-sm text-gray-500 mt-2">No tienes notificaciones sin leer.</p>
                <button
                  onClick={() => router.push('/dashboard/archivo')}
                  className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                >
                  Ver historial de notificaciones leídas →
                </button>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notificacion={notif}
                  mode="inbox"
                  retrying={retrying[notif.id]}
                  onClick={() => handleViewPdf(notif)}
                  onRetryPdf={(e) => {
                    e.stopPropagation();
                    void retryPdf(notif.id);
                  }}
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

      <PdfViewerDrawer
        isOpen={!!selectedNotifForDrawer}
        onClose={() => setSelectedNotifForDrawer(null)}
        notificacion={selectedNotifForDrawer}
      />

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={async () => {
          await clearInbox();
          setIsClearModalOpen(false);
        }}
        title="¿Limpiar Bandeja?"
        message="¿Estás seguro de eliminar todas las notificaciones? Esta acción borrará los registros de forma irreversible."
      />
    </div>
  );
}

export default function BandejaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">Cargando bandeja...</div>}>
      <BandejaContent />
    </Suspense>
  );
}
