"use client";

import { useState, useEffect } from 'react';
import { Settings, Clock, Zap, Bell, Database } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useScheduleConfig } from './hooks/useScheduleConfig';
import { ScheduleTab } from './components/ScheduleTab';
import { QueueTab } from './components/QueueTab';
import { NotificationsTab } from './components/NotificationsTab';
import { DatabaseTab } from './components/DatabaseTab';

type Tab = 'schedule' | 'queue' | 'notifications' | 'database';

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  // Active Tab state
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  // Preferences state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // System actions state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Custom hook for schedule logic
  const scheduleConfig = useScheduleConfig(isAdmin);

  useEffect(() => {
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

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('bes_sound_enabled', String(newValue));
  };

  const handleSyncAll = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await api.post('/scraper/sync-all');
      setSyncMessage(
        `Sincronización iniciada: ${res.data.message} (${res.data.count} empresas encoladas).`
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

      {/* Tabs list (Navegación Superior) */}
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
              {scheduleConfig.hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Cambios pendientes" />
              )}
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

      {/* Tab Panels */}
      {activeTab === 'schedule' && isAdmin && (
        <ScheduleTab {...scheduleConfig} />
      )}

      {activeTab === 'queue' && isAdmin && (
        <QueueTab
          syncLoading={syncLoading}
          syncMessage={syncMessage}
          onSyncAll={handleSyncAll}
          onClearQueue={handleClearQueue}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsTab
          soundEnabled={soundEnabled}
          emailAlerts={emailAlerts}
          onToggleSound={handleSoundToggle}
          onToggleEmail={() => setEmailAlerts(!emailAlerts)}
        />
      )}

      {activeTab === 'database' && isAdmin && (
        <DatabaseTab />
      )}
    </div>
  );
}
