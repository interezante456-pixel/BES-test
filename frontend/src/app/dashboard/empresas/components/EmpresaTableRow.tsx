import React from 'react';
import {
  Building2,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  Clock,
  KeyRound,
  ShieldCheck,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmpresaTableRowProps {
  emp: any;
  isSyncing?: boolean;
  canManage: boolean;
  onSyncSunat: (id: string) => void;
  onSyncSunafil: (id: string) => void;
  onToggleSunat: (id: string) => void;
  onToggleSunafil: (id: string) => void;
  onOpenEdit: (empresa: any) => void;
  onOpenDelete: (empresa: any) => void;
  onOpenToggleActivo: (empresa: any) => void;
  onOpenSunatModal: (empresa: any) => void;
}

export const EmpresaTableRow: React.FC<EmpresaTableRowProps> = ({
  emp,
  isSyncing,
  canManage,
  onSyncSunat,
  onSyncSunafil,
  onToggleSunat,
  onToggleSunafil,
  onOpenEdit,
  onOpenDelete,
  onOpenToggleActivo,
  onOpenSunatModal,
}) => {
  const router = useRouter();
  const isInactiva = emp.activo === false;
  const isSunatOn = emp.habilitadoSunat !== false;
  const isSunafilOn = Boolean(emp.habilitadoSunafil);

  return (
    <tr className={`hover:bg-white/[0.02] transition-colors group ${isInactiva ? 'opacity-50 bg-black/20' : ''}`}>
      {/* Empresa / RUC */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
              isInactiva
                ? 'bg-gray-900 border-white/5 text-gray-500'
                : 'bg-gradient-to-br from-gray-800 to-gray-700 border-white/10 text-white group-hover:from-orange-500 group-hover:to-amber-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{emp.razonSocial}</span>
              {isInactiva && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                  PAUSADA
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-gray-400 text-[11px]">RUC: {emp.ruc}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Usuario SOL */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 w-fit">
          <KeyRound className="w-3 h-3 text-cyan-400" />
          {emp.usuarioSol}
        </span>
      </td>

      {/* Switch Monitoreo SUNAT */}
      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center gap-1">
          <button
            onClick={() => canManage && onToggleSunat(emp.id)}
            disabled={!canManage || isInactiva}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isSunatOn ? 'bg-emerald-500' : 'bg-gray-700'
            } ${!canManage || isInactiva ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isSunatOn ? 'Desactivar monitoreo SUNAT' : 'Activar monitoreo SUNAT'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSunatOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isSunatOn ? 'text-emerald-400' : 'text-gray-500'}`}>
            {isSunatOn ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </td>

      {/* Switch Monitoreo SUNAFIL */}
      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center gap-1">
          <button
            onClick={() => canManage && onToggleSunafil(emp.id)}
            disabled={!canManage || isInactiva}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isSunafilOn ? 'bg-indigo-600' : 'bg-gray-700'
            } ${!canManage || isInactiva ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isSunafilOn ? 'Desactivar monitoreo SUNAFIL' : 'Activar monitoreo SUNAFIL'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSunafilOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSunafilOn ? 'text-indigo-400' : 'text-gray-500'}`}>
              {isSunafilOn ? 'Activo' : 'Inactivo'}
            </span>
            {isSunafilOn && emp.terminosSunafil === 'ACEPTADOS' && (
              <span title="Términos aceptados en SUNAFIL" className="text-emerald-400 font-bold">✓</span>
            )}
          </div>
        </div>
      </td>

      {/* Última Sincro */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-300 flex items-center gap-1.5 whitespace-nowrap font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {emp.ultimaSincronizacion
              ? new Date(emp.ultimaSincronizacion).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Nunca'}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">{emp.estadoConexion || 'CONECTADO'}</span>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {isSunatOn && (
            <button
              onClick={() => onSyncSunat(emp.id)}
              disabled={isSyncing || isInactiva}
              className={`p-2 rounded-lg border transition-all ${
                isSyncing
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
              }`}
              title="Sincronizar Notificaciones SUNAT"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {isSunafilOn && (
            <button
              onClick={() => onSyncSunafil(emp.id)}
              disabled={isSyncing || isInactiva}
              className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 rounded-lg transition-all"
              title="Sincronizar Casilla SUNAFIL"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => router.push(`/dashboard/empresas/${emp.id}/perfil`)}
            className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 rounded-lg transition-all"
            title="Ver Perfil 360° y Línea de Tiempo"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenSunatModal(emp)}
            className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 rounded-lg transition-all"
            title="Acceso a SUNAT (Autocompletar)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {canManage && (
            <>
              <button
                onClick={() => onOpenToggleActivo(emp)}
                className={`p-2 rounded-lg border transition-all ${
                  isInactiva
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'
                }`}
                title={isInactiva ? 'Reactivar empresa' : 'Pausar empresa'}
              >
                <Power className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenEdit(emp)}
                className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Editar Credenciales y Configuración"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenDelete(emp)}
                className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 rounded-lg transition-all"
                title="Eliminar empresa definitivamente del sistema"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
