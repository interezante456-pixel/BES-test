import React from 'react';
import { RefreshCw, Activity, Clock, Laptop, Eye } from 'lucide-react';
import { AuditLogItem } from '../hooks/useAuditoria';
import { PaginationControls } from '@/components/PaginationControls';

interface AuditTableProps {
  logs: AuditLogItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectLog: (log: AuditLogItem) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  logs,
  loading,
  page,
  totalPages,
  onPageChange,
  onSelectLog,
}) => {
  const getAccionBadgeClass = (accion: string) => {
    const acc = accion.toUpperCase();
    if (acc.includes('CREAR') || acc.includes('REGISTRO')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (acc.includes('ELIMINAR') || acc.includes('FALLIDO')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (acc.includes('SCRAPING') || acc.includes('INICIAR')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (acc.includes('DESCARGAR') || acc.includes('LEER')) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <span>Cargando registro de auditoría...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
          <Activity className="w-10 h-10 text-gray-600 mb-1" />
          <p className="font-semibold text-white">No se encontraron eventos de auditoría</p>
          <p className="text-xs text-gray-500">Prueba ajustando los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1f2937]/50 text-gray-400 uppercase text-xs border-b border-white/5 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Acción</th>
                <th className="py-3.5 px-4">Entidad</th>
                <th className="py-3.5 px-4">IP / Origen</th>
                <th className="py-3.5 px-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(log.createdAt).toLocaleString('es-PE')}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {log.usuario ? (
                      (() => {
                        const fullName = log.usuario.nombres && log.usuario.apellidos
                          ? `${log.usuario.nombres} ${log.usuario.apellidos}`
                          : (log.usuario.nombre || log.usuario.email);
                        const initial = fullName.charAt(0).toUpperCase();
                        return (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                              {initial}
                            </div>
                            <div>
                              <p className="font-medium text-white text-xs">{fullName}</p>
                              <p className="text-[11px] text-gray-400 font-mono">{log.usuario.email}</p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 text-xs font-mono">
                        <Laptop className="w-3 h-3" /> Sistema / Worker
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${getAccionBadgeClass(
                        log.accion
                      )}`}
                    >
                      {log.accion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-gray-300">
                    {log.entidad || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="compact"
      />
    </div>
  );
};
