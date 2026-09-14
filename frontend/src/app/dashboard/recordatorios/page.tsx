"use client";

import React from 'react';
import { Bell, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecordatorios } from './hooks/useRecordatorios';
import { RecordatoriosFilterBar } from './components/RecordatoriosFilterBar';
import { RecordatorioCard } from './components/RecordatorioCard';
import { NuevoRecordatorioModal } from './components/NuevoRecordatorioModal';

export default function RecordatoriosPage() {
  const { user } = useAuthStore();
  const {
    recordatorios,
    filteredList,
    loading,
    filter,
    setFilter,
    isOpenModal,
    setIsOpenModal,
    saving,
    empresas,
    handleToggle,
    handleDelete,
    handleCreate,
  } = useRecordatorios();

  const hoyStr = new Date().toISOString().split('T')[0];

  if (user && user.rol !== 'SUPER_ADMIN') {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Bell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo en Fase Beta Privada</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          El módulo de Recordatorios y Tareas se encuentra en fase de pruebas y está disponible exclusivamente para Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Recordatorios y Tareas del Equipo
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                OPERACIÓN DIARIA
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Programa alertas personales y tareas vinculadas a empresas o casos específicos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Recordatorio</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <RecordatoriosFilterBar
        filter={filter}
        setFilter={setFilter}
        recordatorios={recordatorios}
      />

      {/* Lista de Recordatorios */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
            Cargando recordatorios...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center text-gray-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 opacity-30" />
            <p className="text-sm font-bold text-gray-300">No tienes recordatorios en esta lista</p>
            <p className="text-xs text-gray-500">¡Buen trabajo! Estás al día con tus tareas y pendientes.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredList.map((rec) => (
              <RecordatorioCard
                key={rec.id}
                rec={rec}
                hoyStr={hoyStr}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Nuevo Recordatorio */}
      <NuevoRecordatorioModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSubmit={handleCreate}
        saving={saving}
        empresas={empresas}
      />
    </div>
  );
}
