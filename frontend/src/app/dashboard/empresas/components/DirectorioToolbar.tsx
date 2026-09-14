import React from 'react';
import { Search, X } from 'lucide-react';

interface DirectorioToolbarProps {
  activeTab: 'TODAS' | 'SUNAT' | 'SUNAFIL' | 'INACTIVAS';
  setActiveTab: (tab: 'TODAS' | 'SUNAT' | 'SUNAFIL' | 'INACTIVAS') => void;
  totalCount: number;
  sunatCount: number;
  sunafilCount: number;
  inactivasCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const DirectorioToolbar: React.FC<DirectorioToolbarProps> = ({
  activeTab,
  setActiveTab,
  totalCount,
  sunatCount,
  sunafilCount,
  inactivasCount,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111827] p-3 rounded-2xl border border-white/5 shadow-xl">
      {/* Pestañas rápidas */}
      <div className="flex items-center gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('TODAS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'TODAS'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Todas ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('SUNAT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SUNAT'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          SUNAT ({sunatCount})
        </button>
        <button
          onClick={() => setActiveTab('SUNAFIL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SUNAFIL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          SUNAFIL ({sunafilCount})
        </button>
        <button
          onClick={() => setActiveTab('INACTIVAS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'INACTIVAS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/5'
          }`}
        >
          Inactivas ({inactivasCount})
        </button>
      </div>

      {/* Buscador */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por RUC, razón o SOL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1f2937]/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
