"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  FileText,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { NotifGestionPanel } from '../../components/NotifGestionPanel';

interface SunafilDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notificacion: any | null;
  onNotificacionUpdated?: (updated: any) => void;
}

export const SunafilDetailDrawer: React.FC<SunafilDetailDrawerProps> = ({
  isOpen,
  onClose,
  notificacion,
  onNotificacionUpdated,
}) => {
  const [currentNotif, setCurrentNotif] = useState<any>(notificacion);

  useEffect(() => {
    setCurrentNotif(notificacion);
  }, [notificacion]);

  if (!isOpen || !currentNotif) return null;

  const renderFecha = (d?: string | Date | null) => {
    if (!d) return 'No registrada';
    return new Date(d).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sunafilOAuthUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative bg-gradient-to-b from-indigo-500/10 to-transparent">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Detalle de Notificación Laboral
              </h3>
              <p className="text-xs text-indigo-300 font-mono">
                {notificacion.moduloSunafil || 'SUNAFIL'} — {notificacion.codigoReferencia || notificacion.fileId}
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                {notificacion.empresa?.razonSocial}
              </div>
              <div className="text-[11px] font-mono text-gray-400">
                RUC: {notificacion.empresa?.ruc}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Asunto */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Asunto / Requerimiento
            </div>
            <div className="text-sm font-semibold text-white leading-relaxed">
              {notificacion.asunto}
            </div>
          </div>

          {/* Fechas y Plazos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fecha Depósito
              </div>
              <div className="text-xs font-semibold text-gray-200">
                {renderFecha(notificacion.fechaDeposito)}
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
              <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fecha Notificación
              </div>
              <div className="text-xs font-semibold text-gray-200">
                {renderFecha(notificacion.fechaNotificacion || notificacion.fechaMensaje)}
              </div>
            </div>

            {notificacion.plazoDias && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Plazo Otorgado
                </div>
                <div className="text-sm font-bold text-amber-400">
                  {notificacion.plazoDias} días hábiles
                </div>
              </div>
            )}

            {notificacion.fechaLimite && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Fecha Límite
                </div>
                <div className="text-xs font-bold text-rose-300">
                  {renderFecha(notificacion.fechaLimite)}
                </div>
              </div>
            )}
          </div>

          {/* Intendencia */}
          {notificacion.intendencia && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-400">Intendencia Competente</div>
                <div className="text-xs font-semibold text-white">{notificacion.intendencia}</div>
              </div>
            </div>
          )}

          {/* Trabajadores incorporados si aplica */}
          {currentNotif.trabajadoresIncorporados != null && (
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-3.5 flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-purple-300">
                  {currentNotif.trabajadoresIncorporados} Trabajadores Involucrados
                </div>
                <div className="text-[11px] text-gray-400">
                  Alerta laboral sobre incorporación a planilla.
                </div>
              </div>
            </div>
          )}

          {/* Panel de Gestión Interna y Seguimiento */}
          <div className="pt-2">
            <NotifGestionPanel
              notificacion={currentNotif}
              onUpdated={(updated) => {
                setCurrentNotif(updated);
                if (onNotificacionUpdated) onNotificacionUpdated(updated);
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0b0f19] flex items-center justify-between gap-3">
          <button
            onClick={() => window.open(sunafilOAuthUrl, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2.5 rounded-xl transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir Portal SUNAFIL
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
