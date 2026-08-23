import React from 'react';
import { FileText } from 'lucide-react';
import { AuditLogItem } from '../hooks/useAuditoria';

interface AuditDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const formatDetails = (jsonStr: string | null) => {
    if (!jsonStr) return null;
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Detalles del Evento de Auditoría
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-sm font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-gray-400 block">ID Evento:</span>
              <span className="font-mono text-gray-200">{log.id}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Fecha y Hora:</span>
              <span className="text-gray-200">{new Date(log.createdAt).toLocaleString('es-PE')}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Acción:</span>
              <span className="text-indigo-300 font-bold">{log.accion}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Entidad Afectada:</span>
              <span className="text-gray-200">
                {log.entidad || 'N/A'} (ID: {log.entidadId || 'N/A'})
              </span>
            </div>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Payload / Detalles (JSON):</span>
            <pre className="bg-[#0b0f17] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-52">
              {formatDetails(log.detalles) || 'Sin detalles extra'}
            </pre>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
