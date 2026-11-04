"use client";

import { useEffect, useState, useRef } from 'react';
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  Building,
  Calendar,
  CircleDollarSign,
  Users,
  Clock,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import api from '@/lib/api';
import { getAlertBadgeInfo } from '@/lib/notificacion-badge.helper';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { NotifGestionPanel } from './NotifGestionPanel';
import { PdfMissingState } from './PdfMissingState';

interface LecturaHistorial {
  usuarioId: string;
  nombreCompleto: string;
  abiertaEn: string;
}

interface PdfViewerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notificacion: any;
  onNotificacionUpdated?: (updated: any) => void;
}

export function PdfViewerDrawer({
  isOpen,
  onClose,
  notificacion,
  onNotificacionUpdated,
}: PdfViewerDrawerProps) {
  const [activeTab, setActiveTab] = useState<'DOCUMENTO' | 'GESTION'>('DOCUMENTO');
  const [currentNotif, setCurrentNotif] = useState<any>(notificacion);
  const [historial, setHistorial] = useState<LecturaHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentNotif(notificacion);
    setActiveTab('DOCUMENTO');
  }, [notificacion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cargar historial de lecturas cuando se abre el drawer
  useEffect(() => {
    if (isOpen && currentNotif?.id) {
      setLoadingHistorial(true);
      api
        .get(`/notificaciones/${currentNotif.id}/historial`)
        .then((res) => setHistorial(res.data || []))
        .catch(() => setHistorial([]))
        .finally(() => setLoadingHistorial(false));
    } else {
      setHistorial([]);
    }
  }, [isOpen, currentNotif?.id]);

  if (!isOpen || !currentNotif) return null;

  const rawPdfUrl = currentNotif.rutaArchivoPdf;
  const token = useAuthStore.getState().token;
  const pdfUrl = rawPdfUrl
    ? `${rawPdfUrl}${rawPdfUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token || '')}`
    : null;

  const alertInfo = getAlertBadgeInfo(currentNotif.asunto);
  const isSunafil =
    currentNotif.origen === 'SUNAFIL' ||
    Boolean(currentNotif.moduloSunafil) ||
    currentNotif.asunto?.toLowerCase().includes('sunafil');

  const handlePdfUpdated = (updated: any) => {
    setCurrentNotif(updated);
    if (onNotificacionUpdated) onNotificacionUpdated(updated);
  };

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/notificaciones/${currentNotif.id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Documento PDF actualizado correctamente.', 'PDF Guardado');
      handlePdfUpdated(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar el archivo PDF.', 'Error');
    } finally {
      setUploadingPdf(false);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <button type="button" aria-label="Cerrar visor" tabIndex={-1} className="absolute inset-0 w-full h-full bg-transparent border-0 cursor-default p-0 m-0" onClick={onClose} />

      {/* Centered Modal Content Box */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#111827] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden z-10">
        {/* Header con información rica */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#1f2937]/50 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs ${alertInfo.badgeClass}`}>
                {alertInfo.level === 'CRITICA' && <AlertTriangle className="w-3.5 h-3.5" />}
                {alertInfo.level === 'FISCALIZACION' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                {alertInfo.label}
              </span>

              {isSunafil && (
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  SUNAFIL
                </span>
              )}

              {currentNotif.montoExigible && (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CircleDollarSign className="w-3.5 h-3.5" /> Deuda Exigible: {currentNotif.montoExigible}
                </span>
              )}

              {currentNotif.expedienteCoactivo && (
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> Exp: {currentNotif.expedienteCoactivo}
                </span>
              )}

              {currentNotif.empresa && (
                <span className="text-xs text-gray-300 flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 font-mono truncate max-w-full">
                  <Building className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  {currentNotif.empresa.ruc} - {currentNotif.empresa.razonSocial}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-2">
              {currentNotif.asunto}
            </h3>

            <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Fecha del Mensaje: {new Date(currentNotif.fechaMensaje).toLocaleString('es-PE')}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="file"
              ref={replaceFileInputRef}
              onChange={handleReplaceFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {pdfUrl && (
              <>
                <button
                  onClick={() => replaceFileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium text-xs border border-white/10 transition-all cursor-pointer"
                  title="Subir una nueva versión o reemplazo del PDF"
                >
                  <Upload className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">Reemplazar PDF</span>
                </button>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-all shadow-md shadow-indigo-500/20"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar PDF
                </a>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas (Documento vs Gestión) */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-white/5 bg-[#111827]">
          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTO')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DOCUMENTO'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documento PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GESTION')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'GESTION'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Gestión y Bitácora</span>
            {currentNotif?.estadoGestion && (
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono">
                {currentNotif.estadoGestion}
              </span>
            )}
          </button>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-[#0a0f1c] relative flex flex-col p-3 min-h-0 overflow-y-auto">
          {activeTab === 'DOCUMENTO' ? (
            pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full rounded-2xl border border-white/5 bg-white min-h-[500px]"
                title={`Visor PDF ${isSunafil ? 'SUNAFIL' : 'SUNAT'}`}
              />
            ) : (
              <PdfMissingState
                notificacion={currentNotif}
                onPdfUploaded={handlePdfUpdated}
              />
            )
          ) : (
            <div className="max-w-2xl mx-auto w-full py-2">
              <NotifGestionPanel
                notificacion={currentNotif}
                onUpdated={(updated) => {
                  setCurrentNotif(updated);
                  if (onNotificacionUpdated) onNotificacionUpdated(updated);
                }}
              />
            </div>
          )}
        </div>

        {/* Historial de Auditoría */}
        {(historial.length > 0 || loadingHistorial) && (
          <div className="flex-shrink-0 border-t border-white/10 bg-[#1f2937]/30 px-5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Visto por
              </span>
            </div>
            {loadingHistorial ? (
              <div className="text-xs text-gray-500 animate-pulse">Cargando historial...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {historial.map((entrada, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[11px] font-medium px-2.5 py-1 rounded-full"
                  >
                    <span className="font-semibold">{entrada.nombreCompleto}</span>
                    <span className="text-indigo-400/60">·</span>
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-300/70">
                      {new Date(entrada.abiertaEn).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
