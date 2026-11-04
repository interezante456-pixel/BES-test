'use client';

import React, { useEffect } from 'react';
import { useSyncStore, SyncSource, PortalSyncState } from '@/store/useSyncStore';
import { RefreshCw, CheckCircle2, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface PortalSyncCardProps {
  source: SyncSource;
  state: PortalSyncState;
  onToggleMinimize: () => void;
  onClose: () => void;
}

function PortalSyncCard({
  source,
  state,
  onToggleMinimize,
  onClose,
}: PortalSyncCardProps) {
  const {
    isSyncing,
    isFinished,
    total,
    completed,
    successCount,
    errorCount,
    lastEmpresaName,
    isMinimized,
  } = state;

  // Auto-cierre suave tras 10 segundos al finalizar este portal
  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onClose]);

  if (!isSyncing && !isFinished) return null;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isSunafil = source === 'SUNAFIL';

  // Configuración de estilo y temática según portal
  const theme = isSunafil
    ? {
        borderNormal: 'border-indigo-500/30 shadow-indigo-500/10',
        badgeBg: 'bg-indigo-500/15 text-indigo-400',
        spinnerColor: 'text-indigo-400',
        progressBar: 'bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500',
        title: isFinished ? 'Sincronización SUNAFIL Finalizada' : 'Sincronizando SUNAFIL Casilla',
        label: 'SUNAFIL',
      }
    : {
        borderNormal: 'border-orange-500/30 shadow-orange-500/10',
        badgeBg: 'bg-orange-500/15 text-orange-400',
        spinnerColor: 'text-orange-400',
        progressBar: 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500',
        title: isFinished ? 'Sincronización SUNAT Finalizada' : 'Sincronizando SUNAT Buzón',
        label: 'SUNAT',
      };

  // Estado Minimizador (Píldora compacta flotante)
  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={onToggleMinimize}
        aria-label="Expandir sincronización"
        className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/95 border ${
          isFinished ? 'border-emerald-500/40 text-emerald-300' : theme.borderNormal
        } text-white shadow-2xl backdrop-blur-xl cursor-pointer hover:brightness-110 transition-all group`}
      >
        {isFinished ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <RefreshCw className={`w-4 h-4 ${theme.spinnerColor} animate-spin`} />
        )}
        <span className="text-xs font-semibold">
          {theme.label}: {isFinished ? 'Listo' : `${percentage}% (${completed}/${total})`}
        </span>
        <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-84 sm:w-96 rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 overflow-hidden ${
        isFinished
          ? 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-500/10'
          : `bg-slate-900/95 ${theme.borderNormal}`
      }`}
    >
      {/* Cabecera del Widget */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isFinished ? 'bg-emerald-500/15 text-emerald-400' : theme.badgeBg
            }`}
          >
            {isFinished ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${theme.spinnerColor} animate-spin`} />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white tracking-wide truncate">
              {theme.title}
            </h4>
            <p className="text-[11px] text-gray-400 truncate">
              {isFinished
                ? `${successCount} correctas · ${errorCount} errores`
                : `${completed} de ${total} empresas procesadas`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onToggleMinimize}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Minimizar"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cuerpo y Barra de Progreso */}
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Progreso general</span>
            <span
              className={`font-bold ${
                isFinished ? 'text-emerald-400' : isSunafil ? 'text-indigo-400' : 'text-orange-400'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFinished
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : theme.progressBar
              }`}
              style={{ width: `${Math.max(percentage, 5)}%` }}
            />
          </div>
        </div>

        {/* Último estado procesado */}
        {lastEmpresaName && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate flex-1 font-mono text-[11px]">
              {lastEmpresaName}
            </span>
            {isFinished && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                LISTO
              </span>
            )}
          </div>
        )}

        {/* Botón de cierre en éxito */}
        {isFinished && (
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all text-center"
          >
            Entendido, cerrar
          </button>
        )}
      </div>
    </div>
  );
}

export default function SyncProgressWidget() {
  const { portals, toggleMinimize, closeWidget } = useSyncStore();

  const activePortals = (['SUNAT', 'SUNAFIL'] as const).filter(
    (p) => portals[p].isSyncing || portals[p].isFinished,
  );

  if (activePortals.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none items-end">
      {activePortals.map((source) => (
        <PortalSyncCard
          key={source}
          source={source}
          state={portals[source]}
          onToggleMinimize={() => toggleMinimize(source)}
          onClose={() => closeWidget(source)}
        />
      ))}
    </div>
  );
}
