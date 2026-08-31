"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  User,
  Calendar,
  MessageSquare,
  Send,
  Save,
  Loader2,
  Tag,
  X,
  Plus,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';

interface NotifGestionPanelProps {
  notificacion: any;
  onUpdated?: (updatedNotif: any) => void;
}

export const ESTADOS_GESTION = [
  {
    value: 'EN_REVISION',
    label: 'En Revisión',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: Clock,
  },
  {
    value: 'REQUIERE_ACCION',
    label: 'Requiere Acción',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    icon: AlertCircle,
  },
  {
    value: 'RESPONDIDO',
    label: 'Respondido',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
  },
  {
    value: 'ARCHIVADO',
    label: 'Archivado',
    color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    icon: Archive,
  },
];

export const NotifGestionPanel: React.FC<NotifGestionPanelProps> = ({
  notificacion,
  onUpdated,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  const [estadoGestion, setEstadoGestion] = useState<string>(
    notificacion?.estadoGestion || 'EN_REVISION',
  );
  const [responsableId, setResponsableId] = useState<string>(
    notificacion?.responsableId || '',
  );
  const [fechaCompromiso, setFechaCompromiso] = useState<string>(
    notificacion?.fechaCompromiso
      ? new Date(notificacion.fechaCompromiso).toISOString().split('T')[0]
      : '',
  );
  const [notasInternas, setNotasInternas] = useState<string>(
    notificacion?.notasInternas || '',
  );

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [savingGestion, setSavingGestion] = useState(false);
  const [sendingComentario, setSendingComentario] = useState(false);
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  // Etiquetas
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<any[]>([]);
  const [etiquetasAsignadas, setEtiquetasAsignadas] = useState<any[]>(
    notificacion?.etiquetas?.map((e: any) => e.etiqueta || e) || [],
  );
  const [isCrearEtiquetaOpen, setIsCrearEtiquetaOpen] = useState(false);
  const [nuevaEtiquetaNombre, setNuevaEtiquetaNombre] = useState('');
  const [nuevaEtiquetaColor, setNuevaEtiquetaColor] = useState('#f97316');

  // Cargar lista de usuarios para asignar si es Admin
  useEffect(() => {
    if (isAdmin) {
      api
        .get('/admin/usuarios')
        .then((res) => setUsuarios(res.data || []))
        .catch(() => {});
    }
    // Cargar catálogo de etiquetas
    api
      .get('/etiquetas')
      .then((res) => setEtiquetasDisponibles(res.data || []))
      .catch(() => {});
  }, [isAdmin]);

  const handleAsignarEtiqueta = async (etiquetaId: string) => {
    try {
      await api.post('/etiquetas/asignar', {
        notificacionId: notificacion.id,
        etiquetaId,
      });
      const seleccionada = etiquetasDisponibles.find((e) => e.id === etiquetaId);
      if (seleccionada && !etiquetasAsignadas.some((e) => e.id === etiquetaId)) {
        setEtiquetasAsignadas((prev) => [...prev, seleccionada]);
      }
      toast.success('Etiqueta asignada.');
    } catch {
      toast.error('Error al asignar etiqueta.');
    }
  };

  const handleDesasignarEtiqueta = async (etiquetaId: string) => {
    try {
      await api.delete(`/etiquetas/${etiquetaId}/notificacion/${notificacion.id}`);
      setEtiquetasAsignadas((prev) => prev.filter((e) => e.id !== etiquetaId));
      toast.success('Etiqueta retirada.');
    } catch {
      toast.error('Error al retirar etiqueta.');
    }
  };

  const handleCrearEtiqueta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaEtiquetaNombre.trim()) return;
    try {
      const res = await api.post('/etiquetas', {
        nombre: nuevaEtiquetaNombre.trim(),
        color: nuevaEtiquetaColor,
      });
      const nueva = res.data;
      setEtiquetasDisponibles((prev) => [...prev, nueva]);
      await handleAsignarEtiqueta(nueva.id);
      setNuevaEtiquetaNombre('');
      setIsCrearEtiquetaOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear etiqueta.');
    }
  };

  // Cargar bitácora de comentarios
  const fetchComentarios = useCallback(async () => {
    if (!notificacion?.id) return;
    try {
      setLoadingComentarios(true);
      const res = await api.get(`/notificaciones/${notificacion.id}/comentarios`);
      setComentarios(res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingComentarios(false);
    }
  }, [notificacion?.id]);

  useEffect(() => {
    fetchComentarios();
    setEstadoGestion(notificacion?.estadoGestion || 'EN_REVISION');
    setResponsableId(notificacion?.responsableId || '');
    setFechaCompromiso(
      notificacion?.fechaCompromiso
        ? new Date(notificacion.fechaCompromiso).toISOString().split('T')[0]
        : '',
    );
    setNotasInternas(notificacion?.notasInternas || '');
  }, [notificacion, fetchComentarios]);

  const handleSaveGestion = async () => {
    try {
      setSavingGestion(true);
      const payload: any = {
        estadoGestion,
        notasInternas,
        fechaCompromiso: fechaCompromiso ? new Date(fechaCompromiso).toISOString() : null,
      };

      if (isAdmin) {
        payload.responsableId = responsableId || null;
      }

      const res = await api.patch(
        `/notificaciones/${notificacion.id}/gestion`,
        payload,
      );

      toast.success('Gestión de notificación actualizada correctamente.');
      if (onUpdated) onUpdated(res.data);
      fetchComentarios();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar gestión.');
    } finally {
      setSavingGestion(false);
    }
  };

  const handleAddComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    try {
      setSendingComentario(true);
      await api.post(`/notificaciones/${notificacion.id}/comentarios`, {
        texto: nuevoComentario.trim(),
      });
      setNuevoComentario('');
      toast.success('Nota agregada a la bitácora.');
      fetchComentarios();
    } catch {
      toast.error('Error al agregar comentario.');
    } finally {
      setSendingComentario(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Panel de Estado y Asignación */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Flujo de Trabajo y Gestión
          </h4>
          {notificacion?.responsableNombre && (
            <span className="text-[11px] font-semibold text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
              <User className="w-3 h-3 text-orange-400" />
              {notificacion.responsableNombre}
            </span>
          )}
        </div>

        {/* Selector de Estado */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">
            Estado de Gestión
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ESTADOS_GESTION.map((est) => {
              const Icon = est.icon;
              const isSelected = estadoGestion === est.value;
              return (
                <button
                  key={est.value}
                  type="button"
                  onClick={() => setEstadoGestion(est.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? est.color + ' ring-1 ring-white/20'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{est.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Asignación de Responsable y Fecha Compromiso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Asignado a */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1 flex items-center gap-1.5">
              <User className="w-3 h-3 text-orange-400" />
              Responsable
            </label>
            {isAdmin ? (
              <select
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Sin asignar --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombres} {u.apellidos} ({u.rol})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                {notificacion?.responsableNombre || 'Sin asignar'}
              </div>
            )}
          </div>

          {/* Fecha Límite de Atención / Compromiso */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-400" />
              Fecha Límite Atención
            </label>
            <input
              type="date"
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Etiquetas Personalizadas */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-orange-400" />
              Etiquetas del Caso
            </label>
            <button
              type="button"
              onClick={() => setIsCrearEtiquetaOpen(!isCrearEtiquetaOpen)}
              className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Nueva
            </button>
          </div>

          {/* Formulario mini para crear nueva etiqueta */}
          {isCrearEtiquetaOpen && (
            <form
              onSubmit={handleCrearEtiqueta}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 mb-2"
            >
              <input
                type="text"
                placeholder="Nombre etiqueta (ej: FISCALIZACION_2026)"
                value={nuevaEtiquetaNombre}
                onChange={(e) => setNuevaEtiquetaNombre(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="color"
                value={nuevaEtiquetaColor}
                onChange={(e) => setNuevaEtiquetaColor(e.target.value)}
                className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                title="Elegir color"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold"
              >
                Crear
              </button>
            </form>
          )}

          {/* Chips asignados */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {etiquetasAsignadas.map((et) => (
              <span
                key={et.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm"
                style={{ backgroundColor: `${et.color}30`, borderColor: `${et.color}60`, borderWidth: 1 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: et.color }}
                />
                {et.nombre}
                <button
                  type="button"
                  onClick={() => handleDesasignarEtiqueta(et.id)}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Dropdown para asignar etiquetas existentes */}
            {etiquetasDisponibles.filter(
              (ed) => !etiquetasAsignadas.some((ea) => ea.id === ed.id),
            ).length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAsignarEtiqueta(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-white/5 border border-white/10 text-gray-400 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="" disabled>
                  + Agregar existente...
                </option>
                {etiquetasDisponibles
                  .filter(
                    (ed) => !etiquetasAsignadas.some((ea) => ea.id === ed.id),
                  )
                  .map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.nombre}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {/* Notas Internas Libres */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 block mb-1">
            Instrucciones o Notas del Caso
          </label>
          <textarea
            rows={2}
            value={notasInternas}
            onChange={(e) => setNotasInternas(e.target.value)}
            placeholder="Ej: Se coordinó con el cliente, el contador preparará el descargo para presentar el viernes..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Botón Guardar Gestión */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSaveGestion}
            disabled={savingGestion}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {savingGestion ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* 2. Bitácora de Comentarios e Historial */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Bitácora de Seguimiento ({comentarios.length})
          </h4>
        </div>

        {/* Formulario nuevo comentario */}
        <form onSubmit={handleAddComentario} className="flex gap-2">
          <input
            type="text"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe una actualización o nota rápida..."
            className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sendingComentario || !nuevoComentario.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            {sendingComentario ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* Lista de comentarios */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5">
          {loadingComentarios ? (
            <div className="text-center text-xs text-gray-500 py-3">
              Cargando historial...
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-3">
              No hay notas ni comentarios registrados aún.
            </div>
          ) : (
            comentarios.map((c) => (
              <div key={c.id} className="pt-2.5 first:pt-0">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-gray-300">
                    {c.usuarioNombre || 'Usuario'}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {new Date(c.createdAt).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-300 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  {c.texto}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
