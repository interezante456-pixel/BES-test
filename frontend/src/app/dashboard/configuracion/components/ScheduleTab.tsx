import React from 'react';
import {
  Calendar,
  Clock,
  Plus,
  X,
  Check,
  Power,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  CircleDashed,
  Save,
  RefreshCw,
} from 'lucide-react';
import { DIAS_MAP, formatHora12 } from '../hooks/useScheduleConfig';

interface ScheduleTabProps {
  scheduleLoading: boolean;
  savingSchedule: boolean;
  scheduleSuccess: string | null;
  scheduleError: string | null;
  sincroActiva: boolean;
  diasSeleccionados: number[];
  horasProgramadas: string[];
  nuevaHora: string;
  lastSaved: any;
  hasUnsavedChanges: boolean;
  setSincroActiva: (val: boolean) => void;
  setDiasSeleccionados: (val: number[]) => void;
  setHorasProgramadas: (val: string[]) => void;
  setNuevaHora: (val: string) => void;
  toggleDia: (diaKey: number) => void;
  handleAddHora: () => void;
  handleRemoveHora: (hora: string) => void;
  handleSaveSchedule: () => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  scheduleLoading,
  savingSchedule,
  scheduleSuccess,
  scheduleError,
  sincroActiva,
  diasSeleccionados,
  horasProgramadas,
  nuevaHora,
  lastSaved,
  hasUnsavedChanges,
  setSincroActiva,
  setDiasSeleccionados,
  setHorasProgramadas,
  setNuevaHora,
  toggleDia,
  handleAddHora,
  handleRemoveHora,
  handleSaveSchedule,
}) => {
  return (
    <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
      {/* Header de la tarjeta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Programación del Robot de Scraping</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              SUNAT
            </span>

            {/* Badge de estado en tiempo real */}
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
                ⚠️ Cambios sin guardar
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Servidor sincronizado
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
            Selecciona los días activos haciendo clic sobre ellos y pulsa{' '}
            <strong>Guardar Programación</strong> para persistirlos.
          </p>
        </div>

        {/* Switch Maestro */}
        <button
          type="button"
          onClick={() => setSincroActiva(!sincroActiva)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
            sincroActiva
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10'
              : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-sm shadow-red-500/10'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{sincroActiva ? 'Sincronización ACTIVA' : 'Sincronización PAUSADA'}</span>
        </button>
      </div>

      {scheduleLoading ? (
        <div className="flex items-center justify-center p-12 text-gray-400 text-xs gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Cargando programación actual...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sección: Días de la semana */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Días de Ejecución ({diasSeleccionados.length} activos)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDiasSeleccionados([0, 1, 2, 3, 4, 5, 6])}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Todos los días
                </button>
                <span className="text-gray-700">•</span>
                <button
                  type="button"
                  onClick={() => setDiasSeleccionados([1, 2, 3, 4, 5])}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Lun a Vie (Días hábiles)
                </button>
              </div>
            </div>

            {/* Grid de Días con Alto Contraste */}
            <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
              {DIAS_MAP.map((dia) => {
                const selected = diasSeleccionados.includes(dia.key);
                return (
                  <button
                    key={dia.key}
                    type="button"
                    onClick={() => toggleDia(dia.key)}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border transition-all relative overflow-hidden group ${
                      selected
                        ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40 scale-[1.02]'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {selected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300 font-bold" />
                      ) : (
                        <CircleDashed className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                      )}
                      <span className="text-sm font-black tracking-wide">{dia.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold mt-0.5 hidden sm:block ${
                        selected ? 'text-indigo-100' : 'text-gray-400'
                      }`}
                    >
                      {dia.nombre}
                    </span>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${
                        selected ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {selected ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección: Horarios de Ejecución */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" />
                Horarios de Ejecución (Hora de Perú - UTC-5)
              </label>
              <button
                type="button"
                onClick={() => setHorasProgramadas(['06:00', '18:00'])}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Restablecer a cada 12h (6:00 AM y 6:00 PM)
              </button>
            </div>

            {/* Badges de horas activas */}
            <div className="flex flex-wrap gap-2.5">
              {horasProgramadas.map((hora) => (
                <div
                  key={hora}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-xs font-bold text-indigo-300 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-sm font-bold text-white">{formatHora12(hora)}</span>
                  <span className="text-[11px] text-indigo-300/60 font-mono">({hora})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHora(hora)}
                    className="p-1 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors ml-1"
                    title="Eliminar este horario"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Control para agregar nuevo horario */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-3.5 py-2">
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="bg-transparent text-white font-mono text-sm focus:outline-none [color-scheme:dark]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddHora}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-bold text-xs rounded-2xl transition-all"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                Agregar Horario
              </button>
            </div>
          </div>

          {/* Resumen dinámico en Card */}
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-gray-300">
                <span className="font-bold text-white">Configuración Seleccionada: </span>
                {sincroActiva ? (
                  <>
                    <strong className="text-indigo-400 font-bold">
                      {horasProgramadas.length}{' '}
                      {horasProgramadas.length === 1 ? 'ejecución' : 'ejecuciones'} al día
                    </strong>{' '}
                    en {diasSeleccionados.length} días (
                    <span className="text-white font-semibold">
                      {diasSeleccionados
                        .map((k) => DIAS_MAP.find((d) => d.key === k)?.label)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                    ) a las {horasProgramadas.map(formatHora12).join(', ')}.
                  </>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    La sincronización automática está pausada temporalmente.
                  </span>
                )}
              </div>
            </div>

            {lastSaved && (
              <div className="text-[11px] text-gray-500 border-t border-white/5 pt-2 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Guardado actualmente en base de datos:{' '}
                  <strong className="text-gray-300">
                    {lastSaved.dias
                      .map((k: number) => DIAS_MAP.find((d) => d.key === k)?.label)
                      .filter(Boolean)
                      .join(', ')}{' '}
                    ({lastSaved.horas.map(formatHora12).join(', ')})
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {scheduleSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">{scheduleSuccess}</span>
            </div>
          )}

          {scheduleError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs sm:text-sm text-red-300 flex items-center gap-3 animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{scheduleError}</span>
            </div>
          )}

          {/* Footer con botón de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="text-xs text-gray-400">
              {hasUnsavedChanges ? (
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Tienes cambios sin guardar. Haz clic en el botón para aplicarlos.
                </span>
              ) : (
                <span className="text-emerald-400/80 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Tus horarios están guardados y activos en el robot.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className={`flex items-center gap-2.5 px-8 py-4 font-black rounded-2xl shadow-xl transition-all text-xs sm:text-sm ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-orange-600 via-indigo-600 to-indigo-500 hover:from-orange-500 hover:to-indigo-400 text-white shadow-indigo-600/30 scale-105 ring-2 ring-white/20 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white shadow-indigo-600/20'
              }`}
            >
              <Save className="w-4 h-4" />
              {savingSchedule
                ? 'Guardando en Servidor...'
                : hasUnsavedChanges
                ? 'Guardar Cambios Pendientes'
                : 'Guardar Programación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
