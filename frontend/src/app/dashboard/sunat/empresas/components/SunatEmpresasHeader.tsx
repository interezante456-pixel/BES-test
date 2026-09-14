import React from 'react';
import { Building2, Search, RefreshCw, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SunatEmpresasHeaderProps {
  sunatEmpresas: any[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  syncingAll: boolean;
  onExport: () => void;
  onSyncAll: () => void;
  userRol?: string;
}

export const SunatEmpresasHeader: React.FC<SunatEmpresasHeaderProps> = ({
  sunatEmpresas,
  searchTerm,
  setSearchTerm,
  syncingAll,
  onExport,
  onSyncAll,
  userRol,
}) => (
  <>
    {/* Header & Toolbar */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111827] p-6 rounded-3xl border border-white/5 shadow-xl">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-white">Empresas Monitoreadas — SUNAT</h2>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
            BUZÓN SOL
          </span>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          Revisión y sincronización de las{' '}
          <strong className="text-emerald-400">{sunatEmpresas.length}</strong> empresas activas en Buzón SOL.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button
          onClick={onExport}
          disabled={sunatEmpresas.length === 0}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer"
          title="Exportar a Excel"
        >
          <Download className="w-4 h-4 text-gray-400" />
          <span>Exportar</span>
        </button>

        <button
          onClick={onSyncAll}
          disabled={syncingAll || sunatEmpresas.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
          <span>{syncingAll ? 'Sincronizando...' : 'Sincronizar Todo'}</span>
        </button>
      </div>
    </div>

    {/* Banner Informativo a Directorio */}
    <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">
            ¿Deseas vincular nuevas empresas o modificar credenciales SOL?
          </p>
          <p className="text-[11px] text-gray-400">
            La gestión integral de empresas y asignaciones se realiza desde el directorio central.
          </p>
        </div>
      </div>
      {(userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') && (
        <Link
          href="/dashboard/empresas"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all whitespace-nowrap"
        >
          <span>Ir al Directorio Maestro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>

    {/* Barra de Búsqueda */}
    <div className="relative">
      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Buscar empresas SUNAT por RUC o Razón Social..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#111827] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 outline-none text-sm"
      />
    </div>
  </>
);
