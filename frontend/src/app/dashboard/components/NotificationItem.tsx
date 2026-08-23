import React from 'react';
import {
  Mail,
  MailOpen,
  Clock,
  FileText,
  AlertTriangle,
  CircleDollarSign,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { NotificationItemData } from '../hooks/useNotificationList';

interface NotificationItemProps {
  notificacion: NotificationItemData;
  mode: 'inbox' | 'archive';
  isSelected?: boolean;
  canSelect?: boolean;
  canDelete?: boolean;
  retrying?: boolean;
  onSelect?: () => void;
  onClick: () => void;
  onDelete?: () => void;
  onRetryPdf?: (e: React.MouseEvent) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notificacion,
  mode,
  isSelected = false,
  canSelect = false,
  canDelete = false,
  retrying = false,
  onSelect,
  onClick,
  onDelete,
  onRetryPdf,
}) => {
  const isInbox = mode === 'inbox';

  return (
    <div
      className={`p-6 flex items-start gap-4 sm:gap-6 transition-colors hover:bg-white/[0.02] cursor-pointer group ${
        isInbox ? 'bg-blue-500/[0.02]' : ''
      } ${isSelected ? 'bg-blue-500/[0.04]' : ''}`}
      onClick={onClick}
    >
      {/* Checkbox de Selección Masiva */}
      {canSelect && onSelect && (
        <div className="pt-2.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="text-gray-500 hover:text-white transition-colors"
            title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-500" />
            ) : (
              <Square className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
            )}
          </button>
        </div>
      )}

      {/* Icono de Estado */}
      <div className="pt-1 flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            isInbox
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              : notificacion.estado === 'SIN_PDF'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-gray-800 border-white/10 text-gray-500'
          }`}
        >
          {isInbox ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`font-semibold ${isInbox ? 'text-white' : 'text-gray-300'}`}>
              {notificacion.empresa.razonSocial}
            </span>
            <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
              RUC: {notificacion.empresa.ruc}
            </span>
            {notificacion.montoExigible && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <CircleDollarSign className="w-3.5 h-3.5" /> Deuda Exigible: {notificacion.montoExigible}
              </span>
            )}
            {notificacion.expedienteCoactivo && (
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-400" /> Exp: {notificacion.expedienteCoactivo}
              </span>
            )}
            {!isInbox && notificacion.estado === 'SIN_PDF' && (
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                SIN PDF
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {new Date(notificacion.fechaMensaje).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: isInbox ? undefined : 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <h4
          className={`truncate mb-1 ${
            isInbox ? 'text-lg font-bold text-blue-100' : 'text-base font-medium text-gray-400'
          }`}
        >
          {notificacion.asunto}
        </h4>

        {/* Acciones & Estado PDF */}
        <div className="flex flex-col gap-2 mt-2">
          {notificacion.estado === 'SIN_PDF' ? (
            isInbox ? (
              <div className="flex items-center gap-3 text-amber-400/80 text-sm bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">PDF no disponible temporalmente en los servidores de SUNAT.</span>
                {onRetryPdf && (
                  <button
                    onClick={onRetryPdf}
                    disabled={retrying}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                    {retrying ? 'Reintentando...' : '🔄 Reintentar PDF'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400/70 text-xs mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                PDF no disponible en servidores SUNAT
              </div>
            )
          ) : notificacion.rutaArchivoPdf ? (
            <span
              className={`flex items-center gap-2 text-sm font-medium ${
                isInbox ? 'text-blue-400' : 'text-indigo-400/70'
              }`}
            >
              <FileText className="w-4 h-4" />{' '}
              {isInbox ? 'Click para ver el documento PDF' : 'Ver PDF →'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Botón eliminar individual */}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
          title="Eliminar notificación"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
