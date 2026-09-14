import React from 'react';
import { Building2, RefreshCw, Edit2, Trash2, Clock, Power, ExternalLink, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmpresaTableProps {
  empresas: any[];
  syncingEmpresas: Record<string, boolean>;
  onSync: (id: string) => void;
  onEdit?: (empresa: any) => void;
  onDelete?: (id: string) => void;
  onToggleActivo?: (empresa: any) => void;
  onOpenSunat?: (empresa: any) => void;
  userRol?: string;
}

export const EmpresaTable: React.FC<EmpresaTableProps> = ({
  empresas,
  syncingEmpresas,
  onSync,
  onEdit,
  onDelete,
  onToggleActivo,
  onOpenSunat,
  userRol,
}) => {
  const router = useRouter();
  const canManage = userRol === 'SUPER_ADMIN' || userRol === 'ADMIN';

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4 border-b border-white/5">Empresa / RUC / Usuario SOL</th>
              <th className="px-6 py-4 border-b border-white/5">Última Sincro</th>
              <th className="px-6 py-4 border-b border-white/5">Estado Sincro</th>
              <th className="px-6 py-4 border-b border-white/5">Notif. {new Date().getFullYear()}</th>
              <th className="px-6 py-4 border-b border-white/5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {empresas.map((emp) => {
              const isDeshabilitado = emp.activo === false;
              const isSyncing = syncingEmpresas[emp.id];

              return (
                <tr
                  key={emp.id}
                  className={`hover:bg-white/[0.02] transition-colors group ${
                    isDeshabilitado ? 'opacity-60 bg-black/20' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border transition-all ${
                          isDeshabilitado
                            ? 'from-gray-900 to-gray-800 border-white/5'
                            : 'from-gray-800 to-gray-700 border-white/10 group-hover:from-blue-600 group-hover:to-indigo-600'
                        }`}
                      >
                        <Building2 className={`w-5 h-5 ${isDeshabilitado ? 'text-gray-500' : 'text-white'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                          {emp.razonSocial}
                          {isDeshabilitado && (
                            <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">RUC: {emp.ruc}</span>
                          {emp.usuarioSol && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                              <span className="text-[10px] text-cyan-400/70 font-sans font-semibold">SOL:</span>
                              {emp.usuarioSol}
                            </span>
                          )}
                          {emp.habilitadoSunat !== false && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              SUNAT
                            </span>
                          )}
                          {emp.habilitadoSunafil && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              SUNAFIL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 whitespace-nowrap">
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
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.estadoConexion === 'ERROR'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.estadoConexion === 'ERROR' ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
                        }`}
                      />
                      {emp.estadoConexion || 'CONECTADO'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-200">
                      {emp._count?.notificaciones ?? emp.notificacionesCount ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSync(emp.id)}
                        disabled={isSyncing || isDeshabilitado}
                        className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 rounded-lg transition-all"
                        title="Sincronizar ahora"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={() => router.push(`/dashboard/empresas/${emp.id}/perfil`)}
                        className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 rounded-lg transition-all"
                        title="Ver Perfil 360°"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>

                      {onOpenSunat && (
                        <button
                          onClick={() => onOpenSunat(emp)}
                          className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 rounded-lg transition-all"
                          title="Acceso SUNAT"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManage && onToggleActivo && (
                        <button
                          onClick={() => onToggleActivo(emp)}
                          className={`p-2 rounded-lg border transition-all ${
                            isDeshabilitado
                              ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'
                          }`}
                          title={isDeshabilitado ? 'Reactivar sincronización' : 'Pausar sincronización'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManage && onEdit && (
                        <button
                          onClick={() => onEdit(emp)}
                          className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManage && onDelete && (
                        <button
                          onClick={() => onDelete(emp.id)}
                          className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
