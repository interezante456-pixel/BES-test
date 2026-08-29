import React from 'react';
import {
  Search as SearchIcon,
  X as XIcon,
  FilterX as FilterIcon,
  AlertTriangle,
  FileText,
  CircleDollarSign,
  Layers,
} from 'lucide-react';

export type CategoriaAlertaFilter = 'ALL' | 'CRITICA' | 'FISCALIZACION' | 'DEUDA';

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
  categoriaFilter?: CategoriaAlertaFilter;
  onCategoriaFilterChange?: (cat: CategoriaAlertaFilter) => void;
  counts?: {
    total: number;
    criticas: number;
    fiscalizacion: number;
    deuda: number;
  };
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
  categoriaFilter = 'ALL',
  onCategoriaFilterChange,
  counts,
}) => {
  const hasActiveFilters = Boolean(
    searchTerm || startDate || endDate || empresaFilterId || categoriaFilter !== 'ALL',
  );

  return (
    <div className="space-y-3">
      {/* Botones de Filtro Rápido por Categoría de Alerta */}
      {onCategoriaFilterChange && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onCategoriaFilterChange('ALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              categoriaFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-[#111827] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas</span>
            {counts && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.total}</span>}
          </button>

          <button
            onClick={() => onCategoriaFilterChange('CRITICA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              categoriaFilter === 'CRITICA'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>🔴 Críticas / Coactivas</span>
            {counts && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-900/40 text-rose-200 border border-rose-500/30">
                {counts.criticas}
              </span>
            )}
          </button>

          <button
            onClick={() => onCategoriaFilterChange('FISCALIZACION')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              categoriaFilter === 'FISCALIZACION'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>🟡 Fiscalización / Requerimientos</span>
            {counts && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/40 text-amber-200 border border-amber-500/30">
                {counts.fiscalizacion}
              </span>
            )}
          </button>

          <button
            onClick={() => onCategoriaFilterChange('DEUDA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              categoriaFilter === 'DEUDA'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>💰 Con Deuda Exigible</span>
            {counts && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/40 text-emerald-200 border border-emerald-500/30">
                {counts.deuda}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Rango de Fechas */}
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
