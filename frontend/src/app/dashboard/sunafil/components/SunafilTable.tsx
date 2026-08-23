"use client";

import React from 'react';
import {
  Inbox,
  Clock,
  Calendar,
  AlertTriangle,
  Users,
  Eye,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';

interface SunafilTableProps {
  notificaciones: any[];
  activeTab: string;
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetail: (notif: any) => void;
  onDeleteOne: (id: string) => void;
}

export const SunafilTable: React.FC<SunafilTableProps> = ({
  notificaciones,
  activeTab,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetail,
  onDeleteOne,
}) => {
  const allSelected =
    notificaciones.length > 0 && notificaciones.every((n) => selectedIds.includes(n.id));

  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case 'FISCALIZACION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Fiscalización
          </span>
        );
      case 'COBRANZA':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Cobranza
          </span>
        );
      case 'ACCIONES_PREVIAS':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Acciones Previas
          </span>
        );
      case 'ALERTAS_FORMALIZACION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Formalización
          </span>
        );
      case 'ALERTAS_SST':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SST
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {modulo || 'SUNAFIL'}
          </span>
        );
    }
  };

  const renderFecha = (d?: string | Date | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDeadlineAlert = (fechaLimite?: string | Date | null) => {
    if (!fechaLimite) return null;
    const now = new Date();
    const limit = new Date(fechaLimite);
    const diffDays = Math.ceil((limit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Vencido ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> Vence en {diffDays}d
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> {diffDays} días restantes
        </span>
      );
    }

    return (
      <span className="text-[10px] font-medium text-gray-400">
        Límite: {renderFecha(fechaLimite)}
      </span>
    );
  };

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.02] text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
            <tr>
              {/* Checkbox seleccionar todo */}
              <th className="py-4 px-4 text-center w-10">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  disabled={notificaciones.length === 0}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </th>

              <th className="py-4 px-4">Empresa / RUC</th>
              {activeTab === 'ALL' && <th className="py-4 px-4">Módulo</th>}
              <th className="py-4 px-4">Identificador / Referencia</th>
              <th className="py-4 px-4">Asunto / Detalle</th>

              {/* Columnas especializadas según pestaña */}
              {activeTab === 'ACCIONES_PREVIAS' && (
                <>
                  <th className="py-4 px-4">Fecha Notif.</th>
                  <th className="py-4 px-4">Plazo</th>
                  <th className="py-4 px-4">Fecha Límite</th>
                </>
              )}

              {activeTab === 'ALERTAS_FORMALIZACION' && (
                <>
                  <th className="py-4 px-4">Fecha Notif.</th>
                  <th className="py-4 px-4">Límite Respuesta</th>
                  <th className="py-4 px-4 text-center">Trabajadores</th>
                </>
              )}

              {(activeTab === 'FISCALIZACION' || activeTab === 'COBRANZA') && (
                <>
                  <th className="py-4 px-4">Intendencia</th>
                  <th className="py-4 px-4">Fecha</th>
                  <th className="py-4 px-4">Estado</th>
                </>
              )}

              {activeTab === 'ALERTAS_SST' && (
                <>
                  <th className="py-4 px-4">Fecha Depósito</th>
                  <th className="py-4 px-4">Fecha Notif.</th>
                  <th className="py-4 px-4">Estado</th>
                </>
              )}

              {activeTab === 'ALL' && (
                <>
                  <th className="py-4 px-4">Fecha</th>
                  <th className="py-4 px-4">Vencimiento / Plazo</th>
                </>
              )}

              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Cargando notificaciones de SUNAFIL...
                </td>
              </tr>
            ) : notificaciones.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-gray-400">
                    No se encontraron notificaciones en esta sección.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ejecuta la sincronización en el Directorio de Empresas para actualizar los registros.
                  </p>
                </td>
              </tr>
            ) : (
              notificaciones.map((notif) => {
                const isSelected = selectedIds.includes(notif.id);

                return (
                  <tr
                    key={notif.id}
                    className={`transition-colors group ${
                      isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Checkbox individual */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(notif.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Empresa */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-xs">
                          {notif.empresa?.razonSocial?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs line-clamp-1">
                            {notif.empresa?.razonSocial}
                          </p>
                          <p className="text-[11px] font-mono text-gray-500">
                            RUC: {notif.empresa?.ruc}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Módulo (Solo en pestaña Todas) */}
                    {activeTab === 'ALL' && (
                      <td className="py-4 px-4">
                        {getModuloBadge(notif.moduloSunafil)}
                      </td>
                    )}

                    {/* Código / Referencia */}
                    <td className="py-4 px-4 font-mono text-xs text-indigo-300 font-semibold">
                      {notif.codigoReferencia || notif.fileId || '—'}
                    </td>

                    {/* Asunto */}
                    <td className="py-4 px-4">
                      <p className="text-xs font-semibold text-white line-clamp-1 max-w-xs">
                        {notif.asunto}
                      </p>
                    </td>

                    {/* Columnas específicas: ACCIONES PREVIAS */}
                    {activeTab === 'ACCIONES_PREVIAS' && (
                      <>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}
                        </td>
                        <td className="py-4 px-4">
                          {notif.plazoDias ? (
                            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                              {notif.plazoDias} días
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getDeadlineAlert(notif.fechaLimite)}
                        </td>
                      </>
                    )}

                    {/* Columnas específicas: FORMALIZACIÓN */}
                    {activeTab === 'ALERTAS_FORMALIZACION' && (
                      <>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}
                        </td>
                        <td className="py-4 px-4">
                          {getDeadlineAlert(notif.fechaLimite)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {notif.trabajadoresIncorporados != null ? (
                            <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Users className="w-3 h-3" /> {notif.trabajadoresIncorporados} trab.
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </>
                    )}

                    {/* Columnas específicas: FISCALIZACIÓN / COBRANZA */}
                    {(activeTab === 'FISCALIZACION' || activeTab === 'COBRANZA') && (
                      <>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {notif.intendencia || '—'}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaMensaje)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {notif.estado || 'REGISTRADO'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Columnas específicas: SST */}
                    {activeTab === 'ALERTAS_SST' && (
                      <>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaDeposito)}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {notif.estado || 'REGISTRADO'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Columnas: TODAS */}
                    {activeTab === 'ALL' && (
                      <>
                        <td className="py-4 px-4 text-xs text-gray-400">
                          {renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}
                        </td>
                        <td className="py-4 px-4">
                          {notif.fechaLimite ? getDeadlineAlert(notif.fechaLimite) : '—'}
                        </td>
                      </>
                    )}

                    {/* Acciones: Ver Detalle y Eliminar */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewDetail(notif)}
                          className="p-2 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/30 text-gray-300 hover:text-indigo-300 rounded-xl transition-all inline-flex items-center gap-1 text-xs font-bold"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detalle
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteOne(notif.id)}
                          className="p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
