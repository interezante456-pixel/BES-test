import React from 'react';
import { Search, Filter } from 'lucide-react';

interface AuditFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  accionFilter: string;
  onAccionFilterChange: (val: string) => void;
  accionesUnicas: string[];
  totalItems: number;
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  search,
  onSearchChange,
  accionFilter,
  onAccionFilterChange,
  accionesUnicas,
  totalItems,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por acción, usuario, IP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#1f2937] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-500"
        />
      </div>

      {/* Filter Accion */}
      <div className="relative">
        <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          value={accionFilter}
          onChange={(e) => onAccionFilterChange(e.target.value)}
          className="w-full bg-[#1f2937] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none"
        >
          <option value="">Todas las acciones</option>
          {accionesUnicas.map((acc) => (
            <option key={acc} value={acc}>
              {acc}
            </option>
          ))}
        </select>
      </div>

      {/* Stats counter */}
      <div className="flex items-center justify-end px-4 text-sm text-gray-400 font-medium">
        Total de Registros: <span className="text-white font-bold ml-2">{totalItems}</span>
      </div>
    </div>
  );
};
