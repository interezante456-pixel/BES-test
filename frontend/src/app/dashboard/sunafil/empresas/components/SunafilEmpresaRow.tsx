import React from 'react';
import {
  Building2,
  RefreshCw,
  ExternalLink,
  Power,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

interface SunafilEmpresaRowProps {
  emp: any;
  isSyncing: boolean;
  userRol?: string;
  onSync: (id: string) => void;
  onOpenCasilla: (emp: any) => void;
  onToggle: (emp: any) => void;
}

export const SunafilEmpresaRow: React.FC<SunafilEmpresaRowProps> = ({
  emp,
  isSyncing,
  userRol,
  onSync,
  onOpenCasilla,
  onToggle,
}) => {
  const isDeshabilitado = emp.activo === false;

  const renderTerminos = () => {
    if (emp.terminosSunafil === 'ACEPTADOS') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" /> ACEPTADOS
        </span>
      );
    }
    if (emp.terminosSunafil === 'PENDIENTE_ACEPTACION') {
      return (
        <button onClick={() => onOpenCasilla(emp)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.15)]" title="⚠️ Términos no aceptados. Haz clic para abrir Casilla.">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> <span>PENDIENTE TÉRMINOS</span>
        </button>
      );
    }
    if (emp.terminosSunafil === 'PENDIENTE_CONTACTO') {
      return (
        <button onClick={() => onOpenCasilla(emp)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(249,115,22,0.15)]" title="⚠️ Falta contacto en Casilla SUNAFIL.">
          <UserPlus className="w-3.5 h-3.5 text-orange-400 shrink-0" /> <span>FALTA CONTACTO</span>
        </button>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-gray-500" /> SIN VERIFICAR
      </span>
    );
  };

  const renderEstadoSincro = () => {
    if (isDeshabilitado) return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />DESHABILITADO</span>;
    if (isSyncing || emp.estadoSincro === 'SYNCING') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />SINCRONIZANDO</span>;
    if (emp.estadoSincro === 'TERMINOS_PENDIENTES') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />TÉRMINOS PENDIENTES</span>;
    if (emp.estadoSincro === 'CONTACTO_PENDIENTE') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full border border-orange-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" />CONTACTO PENDIENTE</span>;
    if (emp.estadoSincro === 'SUCCESS') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />TERMINADO</span>;
    if (emp.estadoSincro === 'ERROR') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />ERROR</span>;
    return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-gray-600" />ESPERA</span>;
  };

  return (
    <tr className={`hover:bg-white/[0.02] transition-colors group ${isDeshabilitado ? 'opacity-60 bg-black/20' : ''}`}>
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border transition-all ${isDeshabilitado ? 'from-gray-900 to-gray-800 border-white/5 text-gray-500' : 'from-indigo-950 to-indigo-900 border-indigo-500/20 text-indigo-300 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white'}`}>
            <Building2 className={`w-5 h-5 ${isDeshabilitado ? 'text-gray-500' : 'text-indigo-300 group-hover:text-white'}`} />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
              {emp.razonSocial}
              {isDeshabilitado && <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Inactiva</span>}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">RUC: {emp.ruc}</span>
              {emp.usuarioSol && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400/70 font-sans font-semibold">SOL:</span>
                  {emp.usuarioSol}
                </span>
              )}
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">SUNAFIL</span>
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-6">{renderTerminos()}</td>

      <td className="py-4 px-6">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          {emp.ultimaSincronizacion
            ? new Date(emp.ultimaSincronizacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Nunca'}
        </span>
      </td>

      <td className="py-4 px-6">{renderEstadoSincro()}</td>

      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onSync(emp.id)}
            disabled={isSyncing || isDeshabilitado}
            className={`p-2 rounded-xl border transition-all ${isDeshabilitado ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-gray-600' : isSyncing ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20'}`}
            title={isDeshabilitado ? 'Empresa deshabilitada' : 'Sincronizar Notificaciones SUNAFIL'}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={() => onOpenCasilla(emp)}
            className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Abrir y Autocompletar Casilla SUNAFIL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Casilla</span>
          </button>

          {(userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') && (
            <button
              onClick={() => onToggle(emp)}
              className={`p-2 rounded-xl border transition-all ${isDeshabilitado ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'}`}
              title={isDeshabilitado ? 'Habilitar empresa' : 'Deshabilitar empresa'}
            >
              <Power className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
