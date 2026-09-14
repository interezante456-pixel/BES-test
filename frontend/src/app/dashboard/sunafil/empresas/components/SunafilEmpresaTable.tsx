import React from 'react';
import { RefreshCw, Building2 } from 'lucide-react';
import { SunafilEmpresaRow } from './SunafilEmpresaRow';

interface SunafilEmpresaTableProps {
  filteredEmpresas: any[];
  loading: boolean;
  syncingEmpresas: Record<string, boolean>;
  userRol?: string;
  onSync: (id: string) => void;
  onOpenCasilla: (emp: any) => void;
  onToggle: (emp: any) => void;
}

export const SunafilEmpresaTable: React.FC<SunafilEmpresaTableProps> = ({
  filteredEmpresas,
  loading,
  syncingEmpresas,
  userRol,
  onSync,
  onOpenCasilla,
  onToggle,
}) => (
  <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
          <tr>
            <th className="py-4 px-6">Empresa / RUC / Usuario SOL</th>
            <th className="py-4 px-6">Términos Casilla</th>
            <th className="py-4 px-6">Última Sincro</th>
            <th className="py-4 px-6">Estado Sincro</th>
            <th className="py-4 px-6 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-gray-300">
          {loading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Cargando empresas SUNAFIL...
              </td>
            </tr>
          ) : filteredEmpresas.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-gray-400">No hay empresas asignadas a SUNAFIL.</p>
                <p className="text-xs text-gray-600 mt-1">
                  Activa el interruptor SUNAFIL en el Directorio Maestro para monitorear empresas aquí.
                </p>
              </td>
            </tr>
          ) : (
            filteredEmpresas.map((emp) => (
              <SunafilEmpresaRow
                key={emp.id}
                emp={emp}
                isSyncing={!!syncingEmpresas[emp.id]}
                userRol={userRol}
                onSync={onSync}
                onOpenCasilla={onOpenCasilla}
                onToggle={onToggle}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
