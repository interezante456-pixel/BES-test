"use client";

import React from 'react';
import { Inbox, Eye, Trash2, CheckSquare, Square, Users } from 'lucide-react';
import {
  getModuloBadge,
  getEstadoGestionBadge,
  getDeadlineAlert,
  renderFecha,
} from './SunafilBadges';

interface SunafilTableProps {
  notificaciones: any[];
  activeTab: string;
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetail: (notif: any) => void;
  onDeleteOne: (id: string) => void;
  canDelete?: boolean;
}

export const SunafilTable: React.FC<SunafilTableProps> = ({
  notificaciones, activeTab, loading, selectedIds,
  onToggleSelect, onToggleSelectAll, onViewDetail, onDeleteOne, canDelete = false,
}) => {
  const allSelected = notificaciones.length > 0 && notificaciones.every((n) => selectedIds.includes(n.id));
  const totalCols = (canDelete ? 1 : 0) + (activeTab === 'ALL' ? 8 : 7);

  const renderHeaders = () => (
    <tr>
      {canDelete && (
        <th className="py-4 px-4 text-center w-10">
          <button type="button" onClick={onToggleSelectAll} disabled={notificaciones.length === 0} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-gray-600" />}
          </button>
        </th>
      )}
      <th className="py-4 px-2 w-6" />
      <th className="py-4 px-4">Empresa / RUC</th>
      {activeTab === 'ALL' && <th className="py-4 px-4">Módulo</th>}
      <th className="py-4 px-4">Identificador / Referencia</th>
      <th className="py-4 px-4">Asunto / Detalle</th>
      {activeTab === 'ACCIONES_PREVIAS' && <><th className="py-4 px-4">Fecha Notif.</th><th className="py-4 px-4">Plazo</th><th className="py-4 px-4">Fecha Límite</th></>}
      {activeTab === 'ALERTAS_FORMALIZACION' && <><th className="py-4 px-4">Fecha Notif.</th><th className="py-4 px-4">Límite Respuesta</th><th className="py-4 px-4 text-center">Trabajadores</th></>}
      {(activeTab === 'FISCALIZACION' || activeTab === 'COBRANZA') && <><th className="py-4 px-4">Intendencia</th><th className="py-4 px-4">Fecha</th><th className="py-4 px-4">Estado</th></>}
      {activeTab === 'ALERTAS_SST' && <><th className="py-4 px-4">Fecha Depósito</th><th className="py-4 px-4">Fecha Notif.</th><th className="py-4 px-4">Estado</th></>}
      {activeTab === 'ALL' && <><th className="py-4 px-4">Estado Gestión</th><th className="py-4 px-4">Fecha</th><th className="py-4 px-4">Vencimiento / Plazo</th></>}
      <th className="py-4 px-6 text-right">Acciones</th>
    </tr>
  );

  const renderRow = (notif: any) => {
    const isSelected = selectedIds.includes(notif.id);
    return (
      <tr key={notif.id} className={`transition-colors group ${isSelected ? 'bg-indigo-500/10' : notif.leidoGlobal ? 'hover:bg-white/[0.02]' : 'bg-sky-950/10 hover:bg-sky-950/20'}`}>
        {canDelete && (
          <td className="py-4 px-4 text-center">
            <button type="button" onClick={() => onToggleSelect(notif.id)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />}
            </button>
          </td>
        )}
        <td className="py-4 px-2 text-center">
          {!notif.leidoGlobal ? (
            <span className="relative flex h-2.5 w-2.5 mx-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
            </span>
          ) : <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/10 mx-auto" />}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-xs">
              {notif.empresa?.razonSocial?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div>
              <p className="font-bold text-white text-xs line-clamp-1">{notif.empresa?.razonSocial}</p>
              <p className="text-[11px] font-mono text-gray-500">RUC: {notif.empresa?.ruc}</p>
            </div>
          </div>
        </td>
        {activeTab === 'ALL' && <td className="py-4 px-4">{getModuloBadge(notif.moduloSunafil)}</td>}
        <td className="py-4 px-4 font-mono text-xs text-indigo-300 font-semibold">{notif.codigoReferencia || notif.fileId || '—'}</td>
        <td className="py-4 px-4"><p className="text-xs font-semibold text-white line-clamp-1 max-w-xs">{notif.asunto}</p></td>
        {activeTab === 'ACCIONES_PREVIAS' && (<><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}</td><td className="py-4 px-4">{notif.plazoDias ? <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">{notif.plazoDias} días</span> : '—'}</td><td className="py-4 px-4">{getDeadlineAlert(notif.fechaLimite)}</td></>)}
        {activeTab === 'ALERTAS_FORMALIZACION' && (<><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}</td><td className="py-4 px-4">{getDeadlineAlert(notif.fechaLimite)}</td><td className="py-4 px-4 text-center">{notif.trabajadoresIncorporados != null ? <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Users className="w-3 h-3" /> {notif.trabajadoresIncorporados} trab.</span> : '—'}</td></>)}
        {(activeTab === 'FISCALIZACION' || activeTab === 'COBRANZA') && (<><td className="py-4 px-4 text-xs text-gray-400">{notif.intendencia || '—'}</td><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaMensaje)}</td><td className="py-4 px-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{notif.estado || 'REGISTRADO'}</span></td></>)}
        {activeTab === 'ALERTAS_SST' && (<><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaDeposito)}</td><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}</td><td className="py-4 px-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{notif.estado || 'REGISTRADO'}</span></td></>)}
        {activeTab === 'ALL' && (<><td className="py-4 px-4">{getEstadoGestionBadge(notif.estadoGestion)}</td><td className="py-4 px-4 text-xs text-gray-400">{renderFecha(notif.fechaNotificacion || notif.fechaMensaje)}</td><td className="py-4 px-4">{notif.fechaLimite ? getDeadlineAlert(notif.fechaLimite) : '—'}</td></>)}
        <td className="py-4 px-6 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={() => onViewDetail(notif)} className="p-2 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/30 text-gray-300 hover:text-indigo-300 rounded-xl transition-all inline-flex items-center gap-1 text-xs font-bold cursor-pointer" title="Ver detalle completo">
              <Eye className="w-3.5 h-3.5" /> Detalle
            </button>
            {canDelete && (
              <button type="button" onClick={() => onDeleteOne(notif.id)} className="p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-xl transition-all cursor-pointer" title="Eliminar notificación">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.02] text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
            {renderHeaders()}
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {loading ? (
              <tr><td colSpan={totalCols} className="py-12 text-center text-gray-500"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />Cargando notificaciones de SUNAFIL...</td></tr>
            ) : notificaciones.length === 0 ? (
              <tr><td colSpan={totalCols} className="py-12 text-center text-gray-500"><Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="font-semibold text-gray-400">No se encontraron notificaciones en esta sección.</p><p className="text-xs text-gray-600 mt-1">Ejecuta la sincronización en el Directorio de Empresas para actualizar los registros.</p></td></tr>
            ) : (
              notificaciones.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
