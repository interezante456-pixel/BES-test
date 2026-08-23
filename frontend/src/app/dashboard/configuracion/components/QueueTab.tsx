import React from 'react';
import { Zap, RefreshCw, X, CheckCircle } from 'lucide-react';

interface QueueTabProps {
  syncLoading: boolean;
  syncMessage: string | null;
  onSyncAll: () => void;
  onClearQueue: () => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  syncLoading,
  syncMessage,
  onSyncAll,
  onClearQueue,
}) => {
  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-amber-400" />
          Operaciones Manuales y Cola de Tareas
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
          Comandos de emergencia para forzar ejecuciones inmediatas o limpiar la cola de Redis en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Sincronización Manual Masiva */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between gap-6 hover:border-white/10 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                Forzar Sincronización Masiva
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                Inmediato
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Encola un trabajo de scraping en BullMQ para todas las empresas activas del sistema sin esperar al horario programado.
            </p>
          </div>

          <button
            onClick={onSyncAll}
            disabled={syncLoading}
            className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
            {syncLoading ? 'Encolando empresas...' : 'Sincronizar Todas Ahora'}
          </button>
        </div>

        {/* Card 2: Cancelar y Limpiar Cola */}
        <div className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-3xl flex flex-col justify-between gap-6 hover:border-red-500/20 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-base font-bold text-red-400 flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancelar y Limpiar Cola
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                Emergencia
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Vacía todos los trabajos pendientes, activos y en espera en la cola de Redis, deteniendo de inmediato el robot.
            </p>
          </div>

          <button
            onClick={onClearQueue}
            disabled={syncLoading}
            className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all text-xs border border-red-500/20"
          >
            <X className="w-4 h-4" />
            {syncLoading ? 'Limpiando...' : 'Detener y Vaciar Cola'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-white/[0.02] border border-white/10 text-gray-200 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}
    </div>
  );
};
