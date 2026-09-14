import React from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import { EmpresaTableRow } from './EmpresaTableRow';

interface DirectorioEmpresaTableProps {
  empresas: any[];
  loading: boolean;
  searchTerm: string;
  syncingEmpresas: Record<string, boolean>;
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

export const DirectorioEmpresaTable: React.FC<DirectorioEmpresaTableProps> = ({
  empresas,
  loading,
  searchTerm,
  syncingEmpresas,
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
  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/5">
              <th className="px-6 py-4">Empresa / RUC</th>
              <th className="px-6 py-4">Usuario SOL</th>
              <th className="px-6 py-4 text-center">Monitoreo SUNAT</th>
              <th className="px-6 py-4 text-center">Monitoreo SUNAFIL</th>
              <th className="px-6 py-4">Última Sincro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-3" />
                  <p className="font-semibold">Cargando directorio de empresas...</p>
                </td>
              </tr>
            ) : empresas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                  <p className="font-semibold text-white">No se encontraron empresas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {searchTerm ? 'Prueba ajustando los términos de búsqueda' : 'Comienza vinculando tu primera empresa'}
                  </p>
                </td>
              </tr>
            ) : (
              empresas.map((emp) => (
                <EmpresaTableRow
                  key={emp.id}
                  emp={emp}
                  isSyncing={syncingEmpresas[emp.id]}
                  canManage={canManage}
                  onSyncSunat={onSyncSunat}
                  onSyncSunafil={onSyncSunafil}
                  onToggleSunat={onToggleSunat}
                  onToggleSunafil={onToggleSunafil}
                  onOpenEdit={onOpenEdit}
                  onOpenDelete={onOpenDelete}
                  onOpenToggleActivo={onOpenToggleActivo}
                  onOpenSunatModal={onOpenSunatModal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
