"use client";

import React from 'react';
import {
  Search,
  Building2,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  X,
  Trash2,
} from 'lucide-react';

interface SunafilFilterBarProps {
  empresas: any[];
  selectedEmpresa: string;
  onSelectEmpresa: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  estadoFilter: string;
  onEstadoFilterChange: (val: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportExcel: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onDeleteAll?: () => void;
}

export const SunafilFilterBar: React.FC<SunafilFilterBarProps> = ({
  empresas,
  selectedEmpresa,
  onSelectEmpresa,
  searchTerm,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  estadoFilter,
  onEstadoFilterChange,
  activeTab,
  onTabChange,
  onExportExcel,
  onRefresh,
  isRefreshing = false,
  selectedCount = 0,
  onDeleteSelected,
  onDeleteAll,
}) => {
  const tabs = [
    { id: 'ALL', label: 'Todas las Notificaciones' },
    { id: 'FISCALIZACION', label: 'Fiscalización' },
    { id: 'COBRANZA', label: 'Cobranza' },
    { id: 'ACCIONES_PREVIAS', label: 'Acciones Previas' },
    { id: 'ALERTAS_FORMALIZACION', label: 'Formalización' },
    { id: 'ALERTAS_SST', label: 'Seguridad y Salud (SST)' },
  ];

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
      {/* 1. Selector de Pestañas (Tabs) y Acciones en Masa */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Acciones de eliminación masiva */}
        {selectedCount > 0 && onDeleteSelected && (
          <div className="flex items-center gap-2 shrink-0 animate-in fade-in">
            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar ({selectedCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Filtros Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Buscador */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por orden, expediente, asunto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selector de Empresa */}
        <div className="md:col-span-3 relative">
          <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <select
            value={selectedEmpresa}
            onChange={(e) => onSelectEmpresa(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
          >
            <option value="all">🏢 Todas las empresas SUNAFIL</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.razonSocial} ({emp.ruc})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Rango Fechas */}
        <div className="md:col-span-3 flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-1/2 bg-[#1e293b]/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
            title="Fecha Desde"
          />
          <span className="text-gray-500 text-xs">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-1/2 bg-[#1e293b]/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
            title="Fecha Hasta"
          />
        </div>

        {/* Acciones: Refrescar, Vaciar y Exportar */}
        <div className="md:col-span-2 flex items-center justify-end gap-2">
          {onDeleteAll && (
            <button
              type="button"
              onClick={onDeleteAll}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all"
              title="Vaciar / Eliminar todas las notificaciones"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-all"
            title="Actualizar listado"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            title="Exportar a Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
