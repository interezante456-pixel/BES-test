"use client";

import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Upload,
  RefreshCw,
  FileText,
  Calendar,
  Building2,
  Clock,
  CircleDollarSign,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';

interface PdfMissingStateProps {
  notificacion: any;
  onPdfUploaded: (updatedNotif: any) => void;
}

export const PdfMissingState: React.FC<PdfMissingStateProps> = ({
  notificacion,
  onPdfUploaded,
}) => {
  const [retrying, setRetrying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSunafil =
    notificacion.origen === 'SUNAFIL' ||
    Boolean(notificacion.moduloSunafil) ||
    notificacion.asunto?.toLowerCase().includes('sunafil');

  const codigo =
    notificacion.codigoReferencia ||
    notificacion.metadataExtra?.registro ||
    notificacion.expedienteCoactivo ||
    notificacion.fileId;

  // Reintentar descarga automática (SUNAT)
  const handleRetryDownload = async () => {
    setRetrying(true);
    try {
      const res = await api.post(`/scraper/retry-pdf/${notificacion.id}`);
      if (res.data?.success && res.data?.url) {
        toast.success('¡PDF descargado con éxito desde el servidor!', 'Descarga Completada');
        onPdfUploaded({
          ...notificacion,
          rutaArchivoPdf: res.data.url,
          pdfDescargado: true,
        });
      } else {
        toast.warning(
          res.data?.message || 'No se pudo recuperar el PDF automáticamente. Puedes subirlo manualmente.',
          'Reintento Finalizado'
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Error al intentar conectar con el portal para recuperar el PDF.',
        'Fallo de Descarga'
      );
    } finally {
      setRetrying(false);
    }
  };

  // Subir PDF manual
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      toast.error('Por favor selecciona un archivo en formato PDF.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('El archivo PDF no debe exceder los 20 MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/notificaciones/${notificacion.id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Documento PDF adjuntado correctamente al expediente.', 'PDF Guardado');
      onPdfUploaded(res.data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Error al guardar el archivo PDF.',
        'Error de Subida'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full my-auto p-4 sm:p-6 space-y-6">
      {/* Tarjeta de Alerta de Estado */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300 mb-2">
            {isSunafil ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                SUNAFIL · Casilla Electrónica
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                SUNAT · Buzón SOL
              </>
            )}
          </span>
          <h4 className="text-lg font-extrabold text-white">Archivo PDF No Disponible Aún</h4>
          <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1 leading-relaxed">
            {isSunafil
              ? 'Esta notificación fue indexada desde la Casilla de SUNAFIL con todos sus metadatos, pero el archivo adjunto aún no ha sido descargado al servidor local.'
              : 'Este documento fue registrado desde el Buzón de SUNAT, pero su archivo PDF no se descargó en la sincronización inicial.'}
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          {/* Input oculto de archivo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Subiendo PDF...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir Archivo PDF
              </>
            )}
          </button>

          {!isSunafil && (
            <button
              onClick={handleRetryDownload}
              disabled={retrying}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                  Descargando de SUNAT...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Reintentar Descarga SUNAT
                </>
              )}
            </button>
          )}

          {isSunafil && (
            <a
              href="https://casillaelectronica.sunafil.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-indigo-500/30 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Casilla SUNAFIL
            </a>
          )}
        </div>
      </div>

      {/* Ficha Resumen de la Notificación */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h5 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            Ficha del Documento
          </h5>
          <span className="text-[10px] text-gray-500 font-mono">
            ID: {notificacion.id.slice(0, 8)}...
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Empresa */}
          {notificacion.empresa && (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Empresa
              </span>
              <p className="font-semibold text-white">{notificacion.empresa.razonSocial}</p>
              <p className="font-mono text-gray-400 text-[11px]">RUC: {notificacion.empresa.ruc}</p>
            </div>
          )}

          {/* Expediente / Registro */}
          {codigo && (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Registro / Expediente
              </span>
              <p className="font-mono font-semibold text-amber-300 break-all">{codigo}</p>
              <p className="text-[10px] text-gray-500">Identificador oficial</p>
            </div>
          )}

          {/* Fechas */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Fecha del Mensaje
            </span>
            <p className="font-semibold text-gray-200">
              {new Date(notificacion.fechaMensaje).toLocaleString('es-PE')}
            </p>
            {notificacion.fechaDeposito && (
              <p className="text-[11px] text-gray-400">
                Depósito: {new Date(notificacion.fechaDeposito).toLocaleDateString('es-PE')}
              </p>
            )}
          </div>

          {/* Plazos y Vencimiento */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" /> Plazo / Vencimiento
            </span>
            <p className="font-semibold text-white">
              {notificacion.plazoDias ? `${notificacion.plazoDias} días hábiles` : 'No especificado'}
            </p>
            {notificacion.fechaLimite ? (
              <p className="text-[11px] font-bold text-rose-400">
                Límite: {new Date(notificacion.fechaLimite).toLocaleDateString('es-PE')}
              </p>
            ) : (
              <p className="text-[11px] text-gray-500">Sin fecha límite estricta</p>
            )}
          </div>

          {/* Deuda / Monto Exigible */}
          {notificacion.montoExigible && (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" /> Deuda Exigible Coactiva
              </span>
              <p className="font-bold text-emerald-400 text-sm">
                S/ {notificacion.montoExigible}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
