"use client";

import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  RefreshCw,
  CheckCircle,
  Volume2,
  VolumeX,
  X,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  Power,
  AlertTriangle,
  Zap,
  HardDrive,
  Mail,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

type Tab = 'schedule' | 'queue' | 'notifications' | 'database';

const DIAS_MAP = [
  { key: 1, label: 'Lun', nombre: 'Lunes' },
  { key: 2, label: 'Mar', nombre: 'Martes' },
  { key: 3, label: 'Mié', nombre: 'Miércoles' },
  { key: 4, label: 'Jue', nombre: 'Jueves' },
  { key: 5, label: 'Vie', nombre: 'Viernes' },
  { key: 6, label: 'Sáb', nombre: 'Sábado' },
  { key: 0, label: 'Dom', nombre: 'Domingo' },
];

function formatHora12(hora24: string): string {
  const [hh, mm] = hora24.split(':').map(Number);
  if (isNaN(hh) || isNaN(mm)) return hora24;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  // Active Tab state (default to 'schedule' for admins, 'notifications' for regular users)
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  // Preferences state (Browser local storage)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // System actions state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Dynamic schedule state
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [sincroActiva, setSincroActiva] = useState(true);
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [horasProgramadas, setHorasProgramadas] = useState<string[]>([
    '06:00',
    '18:00',
  ]);
  const [nuevaHora, setNuevaHora] = useState('12:00');

  useEffect(() => {
    // Si no es admin, forzar pestaña de notificaciones
    if (user && !isAdmin) {
      setActiveTab('notifications');
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const savedSound = localStorage.getItem('bes_sound_enabled');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'schedule') {
      fetchSchedule();
    }
  }, [isAdmin, activeTab]);

  const fetchSchedule = async () => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const res = await api.get('/scraper/schedule');
      if (res.data) {
        setSincroActiva(res.data.sincroAutomaticaActiva ?? true);
        setDiasSeleccionados(res.data.diasSemana || [0, 1, 2, 3, 4, 5, 6]);
        setHorasProgramadas(res.data.horas || ['06:00', '18:00']);
      }
    } catch (err: any) {
      console.error('Error fetching schedule config:', err);
      setScheduleError('No se pudo cargar la configuración de programación.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (horasProgramadas.length === 0) {
      setScheduleError('Debes configurar al menos un horario de ejecución.');
      return;
    }
    if (diasSeleccionados.length === 0) {
      setScheduleError('Debes seleccionar al menos un día de la semana.');
      return;
    }

    setSavingSchedule(true);
    setScheduleSuccess(null);
    setScheduleError(null);

    try {
      const res = await api.put('/scraper/schedule', {
        sincroAutomaticaActiva: sincroActiva,
        diasSemana: diasSeleccionados,
        horas: horasProgramadas,
      });

      setScheduleSuccess('¡Programación guardada y aplicada correctamente!');
      if (res.data) {
        setSincroActiva(res.data.sincroAutomaticaActiva);
        setDiasSeleccionados(res.data.diasSemana);
        setHorasProgramadas(res.data.horas);
      }
      setTimeout(() => setScheduleSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      setScheduleError(
        err.response?.data?.message || 'Error al guardar la programación.',
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('bes_sound_enabled', String(newValue));
  };

  const toggleDia = (diaKey: number) => {
    if (diasSeleccionados.includes(diaKey)) {
      if (diasSeleccionados.length === 1) {
        alert('Debe haber al menos un día seleccionado.');
        return;
      }
      setDiasSeleccionados(diasSeleccionados.filter((d) => d !== diaKey));
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaKey].sort((a, b) => a - b));
    }
  };

  const handleAddHora = () => {
    if (!nuevaHora) return;
    if (horasProgramadas.includes(nuevaHora)) {
      alert('Esta hora ya está en la lista.');
      return;
    }
    const updated = [...horasProgramadas, nuevaHora].sort();
    setHorasProgramadas(updated);
  };

  const handleRemoveHora = (horaToRemove: string) => {
    if (horasProgramadas.length === 1) {
      alert('Debe haber al menos un horario de ejecución programado.');
      return;
    }
    setHorasProgramadas(horasProgramadas.filter((h) => h !== horaToRemove));
  };

  const handleSyncAll = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await api.post('/scraper/sync-all');
      setSyncMessage(
        `Sincronización iniciada: ${res.data.message} (${res.data.count} empresas encoladas).`,
      );
    } catch (error: any) {
      console.error('Error starting massive sync', error);
      setSyncMessage('Error al iniciar la sincronización masiva.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleClearQueue = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await api.post('/scraper/clear-queue');
      setSyncMessage(res.data.message);
    } catch (error: any) {
      console.error('Error clearing queue', error);
      setSyncMessage('Error al cancelar y limpiar la cola de tareas.');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-indigo-400" />
          Configuración del Sistema
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Gestiona los horarios automáticos, cola de tareas, notificaciones y mantenimiento.
        </p>
      </div>

      {/* Tabs list (Navegación Superior Temática) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        {isAdmin && (
          <>
            {/* Tab 1: Horarios de Sincro */}
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Sincronización Automática</span>
            </button>

            {/* Tab 2: Control de Tareas */}
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
                activeTab === 'queue'
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Control de Tareas y Cola</span>
            </button>
          </>
        )}

        {/* Tab 3: Notificaciones y Alertas */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
            activeTab === 'notifications'
              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10 font-bold'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-400" />
          <span>Alertas y Notificaciones</span>
        </button>

        {isAdmin && (
          /* Tab 4: Base de Datos y Backups */
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              activeTab === 'database'
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10 font-bold'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Base de Datos y Backups</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: HORARIOS Y SINCRONIZACIÓN AUTOMÁTICA */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && isAdmin && (
        <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
          {/* Header de la tarjeta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Programación del Robot de Scraping
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  SUNAT
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
                Define los días y los horarios exactos en que el robot revisará automáticamente las casillas electrónicas.
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
                    Días de Ejecución
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

                <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
                  {DIAS_MAP.map((dia) => {
                    const selected = diasSeleccionados.includes(dia.key);
                    return (
                      <button
                        key={dia.key}
                        type="button"
                        onClick={() => toggleDia(dia.key)}
                        className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
                          selected
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                            : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
                        }`}
                      >
                        <span className="text-sm font-bold">{dia.label}</span>
                        <span className="text-[10px] text-gray-400 mt-1 hidden sm:block">
                          {dia.nombre}
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
                      <span className="text-[11px] text-indigo-300/60 font-mono">
                        ({hora})
                      </span>
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
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-300">
                  <span className="font-bold text-white">Resumen: </span>
                  {sincroActiva ? (
                    <>
                      El robot sincronizará{' '}
                      <strong className="text-indigo-400 font-bold">
                        {horasProgramadas.length}{' '}
                        {horasProgramadas.length === 1 ? 'vez' : 'veces'} al día
                      </strong>{' '}
                      en {diasSeleccionados.length} días de la semana (
                      {horasProgramadas.map(formatHora12).join(', ')}).
                    </>
                  ) : (
                    <span className="text-amber-400 font-semibold">
                      La sincronización automática está pausada temporalmente.
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback messages */}
              {scheduleSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              {scheduleError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs sm:text-sm text-red-300 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              {/* Footer con botón de acción */}
              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  className="flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all text-xs sm:text-sm"
                >
                  <Check className="w-4 h-4" />
                  {savingSchedule ? 'Guardando...' : 'Guardar Programación'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: CONTROL DE TAREAS Y COLA (EMERGENCIAS) */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && isAdmin && (
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
                onClick={handleSyncAll}
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
                onClick={handleClearQueue}
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
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: ALERTAS Y NOTIFICACIONES */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-blue-400" />
              Preferencias de Alertas y Sonido
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
              Personaliza cómo recibes las alertas de nuevas resoluciones y notificaciones urgentes.
            </p>
          </div>

          <div className="space-y-4">
            {/* Opción 1: Sonido en tiempo real */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl gap-4">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  Sonido de Alerta en Tiempo Real
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Reproduce un timbre de advertencia cuando el robot detecta resoluciones o documentos urgentes de SUNAT.
                </p>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border self-start sm:self-auto ${
                  soundEnabled
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-white/5'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" /> Sonido Activo
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" /> Silenciado
                  </>
                )}
              </button>
            </div>

            {/* Opción 2: Alertas por Correo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl gap-4">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Alertas por Correo Electrónico (SMTP)
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Envía correos inmediatos al administrador cuando se detectan órdenes de pago o resoluciones coactivas.
                </p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border self-start sm:self-auto ${
                  emailAlerts
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-white/5'
                }`}
              >
                {emailAlerts ? 'Habilitado' : 'Deshabilitado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: BASE DE DATOS Y BACKUPS */}
      {/* ========================================================================= */}
      {activeTab === 'database' && isAdmin && (
        <div className="bg-[#111827] rounded-3xl border border-white/5 p-7 sm:p-9 space-y-8 shadow-xl">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              Mantenimiento y Respaldo de Base de Datos
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
              Instrucciones y comandos recomendados para exportar y respaldar tu base de datos PostgreSQL local en el servidor Xeon.
            </p>
          </div>

          <div className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <HardDrive className="w-4 h-4" />
              Comando de Exportación Rápida
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Ejecuta el siguiente comando en la terminal de tu servidor Xeon para generar una copia de seguridad íntegra de PostgreSQL:
            </p>
            <div className="bg-black/50 border border-white/10 p-4 rounded-2xl font-mono text-xs text-emerald-300 overflow-x-auto select-all shadow-inner">
              docker exec -t bes_postgres pg_dump -U postgres bes_db &gt; backup_bes.sql
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Este comando creará el archivo <code className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">backup_bes.sql</code> conteniendo todas las credenciales, empresas, notificaciones y lecturas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
