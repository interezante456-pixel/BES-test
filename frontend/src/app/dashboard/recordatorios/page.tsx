"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Building2,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmpresas } from '../empresas/hooks/useEmpresas';
import { toast } from '@/store/useToastStore';

export default function RecordatoriosPage() {
  const { user } = useAuthStore();
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDIENTES' | 'COMPLETADOS' | 'TODOS'>('PENDIENTES');

  // Modal nuevo recordatorio
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaRecordar, setFechaRecordar] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [empresaId, setEmpresaId] = useState('');
  const [saving, setSaving] = useState(false);

  const { empresas } = useEmpresas();

  const fetchRecordatorios = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/recordatorios');
      setRecordatorios(res.data || []);
    } catch (e) {
      console.error('Error cargando recordatorios:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordatorios();
  }, [fetchRecordatorios]);

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/recordatorios/${id}/completar`);
      setRecordatorios((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completado: !r.completado } : r)),
      );
      toast.success('Estado del recordatorio actualizado.');
    } catch {
      toast.error('Error al actualizar recordatorio.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/recordatorios/${id}`);
      setRecordatorios((prev) => prev.filter((r) => r.id !== id));
      toast.success('Recordatorio eliminado.');
    } catch {
      toast.error('Error al eliminar.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaRecordar) return;

    try {
      setSaving(true);
      await api.post('/recordatorios', {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaRecordar: new Date(fechaRecordar).toISOString(),
        empresaId: empresaId || undefined,
      });

      toast.success('Recordatorio programado con éxito.');
      setTitulo('');
      setDescripcion('');
      setIsOpenModal(false);
      fetchRecordatorios();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear recordatorio.');
    } finally {
      setSaving(false);
    }
  };

  const filteredList = recordatorios.filter((r) => {
    if (filter === 'PENDIENTES') return !r.completado;
    if (filter === 'COMPLETADOS') return r.completado;
    return true;
  });

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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpenModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Recordatorio</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('PENDIENTES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'PENDIENTES'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Pendientes ({recordatorios.filter((r) => !r.completado).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('COMPLETADOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'COMPLETADOS'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Completados ({recordatorios.filter((r) => r.completado).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('TODOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'TODOS'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Todos ({recordatorios.length})
        </button>
      </div>

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
            <p className="text-sm font-bold text-gray-300">
              No tienes recordatorios en esta lista
            </p>
            <p className="text-xs text-gray-500">
              ¡Buen trabajo! Estás al día con tus tareas y pendientes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredList.map((rec) => {
              const recFechaStr = new Date(rec.fechaRecordar)
                .toISOString()
                .split('T')[0];
              const esVencido = !rec.completado && recFechaStr < hoyStr;
              const esHoy = !rec.completado && recFechaStr === hoyStr;

              return (
                <div
                  key={rec.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    rec.completado ? 'opacity-50 bg-white/[0.01]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(rec.id)}
                      className="mt-0.5 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer shrink-0"
                    >
                      {rec.completado ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 hover:text-white" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {esVencido && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                            Vencido
                          </span>
                        )}
                        {esHoy && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Hoy
                          </span>
                        )}
                        {rec.empresa && (
                          <span className="text-xs font-bold text-orange-400 truncate">
                            {rec.empresa.razonSocial}
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-sm font-semibold ${
                          rec.completado ? 'line-through text-gray-400' : 'text-white'
                        }`}
                      >
                        {rec.titulo}
                      </div>

                      {rec.descripcion && (
                        <p className="text-xs text-gray-400">
                          {rec.descripcion}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          {new Date(rec.fechaRecordar).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(rec.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Eliminar Recordatorio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nuevo Recordatorio */}
      {isOpenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Nuevo Recordatorio
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Título del Recordatorio *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Llamar a cliente para descargo coactivo"
                  className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Fecha a Recordar *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaRecordar}
                    onChange={(e) => setFechaRecordar(e.target.value)}
                    className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Empresa (Opcional)
                  </label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Sin empresa --</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Detalle Adicional
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Notas adicionales para el seguimiento..."
                  className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Recordatorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
