import React from 'react';
import { Search as SearchIcon, X as XIcon, FilterX as FilterIcon } from 'lucide-react';

interface NotificationFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  empresaFilterId?: string | null;
  onClearEmpresaFilter?: () => void;
  onClearFilters: () => void;
}

export const NotificationFilterBar: React.FC<NotificationFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  empresaFilterId,
  onClearEmpresaFilter,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(searchTerm || startDate || endDate || empresaFilterId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#111827] p-4 rounded-3xl border border-white/5">
        {/* Buscador de Texto (6 columnas) */}
        <div className="md:col-span-6 flex items-center gap-3 bg-white/[0.02] px-4 py-1.5 rounded-2xl border border-white/5">
          <SearchIcon className="text-gray-500 w-5 h-5 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por RUC, Empresa o Asunto..."
            className="flex-1 bg-transparent border-none text-white outline-none placeholder-gray-500 py-2 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Fecha Desde (3 columnas) */}
        <div className="md:col-span-3 flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-500 font-semibold uppercase flex-shrink-0">Desde:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="flex-1 bg-transparent border-none text-white outline-none text-sm [color-scheme:dark] cursor-pointer"
          />
          {startDate && (
            <button
              onClick={() => onStartDateChange('')}
              className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Input Fecha Hasta (3 columnas) */}
        <div className="md:col-span-3 flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-500 font-semibold uppercase flex-shrink-0">Hasta:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="flex-1 bg-transparent border-none text-white outline-none text-sm [color-scheme:dark] cursor-pointer"
          />
          {endDate && (
            <button
              onClick={() => onEndDateChange('')}
              className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Botones de acción de filtros activos */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end gap-3">
          {empresaFilterId && onClearEmpresaFilter && (
            <button
              onClick={onClearEmpresaFilter}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-xs transition-colors border border-red-500/20"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              Quitar Filtro Empresa
            </button>
          )}
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium text-xs transition-colors border border-white/5"
          >
            <XIcon className="w-3.5 h-3.5" />
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
