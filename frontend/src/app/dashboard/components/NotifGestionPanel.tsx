"use client";

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { NotifEstadoForm, ESTADOS_GESTION } from './gestion-notificacion/NotifEstadoForm';
import { NotifEtiquetasManager } from './gestion-notificacion/NotifEtiquetasManager';
import { NotifComentariosThread } from './gestion-notificacion/NotifComentariosThread';

export { ESTADOS_GESTION };

interface NotifGestionPanelProps {
  notificacion: any;
  onUpdated?: (updatedNotif: any) => void;
}

export const NotifGestionPanel: React.FC<NotifGestionPanelProps> = ({
  notificacion,
  onUpdated,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  // Estado form
  const [estadoGestion, setEstadoGestion] = useState<string>(notificacion?.estadoGestion || 'EN_REVISION');
  const [responsableId, setResponsableId] = useState<string>(notificacion?.responsableId || '');
  const [fechaCompromiso, setFechaCompromiso] = useState<string>(
    notificacion?.fechaCompromiso ? new Date(notificacion.fechaCompromiso).toISOString().split('T')[0] : '',
  );
  const [notasInternas, setNotasInternas] = useState<string>(notificacion?.notasInternas || '');
  const [savingGestion, setSavingGestion] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Comentarios
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
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

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/usuarios').then((res) => setUsuarios(res.data || [])).catch(() => {});
    }
    api.get('/etiquetas').then((res) => setEtiquetasDisponibles(res.data || [])).catch(() => {});
  }, [isAdmin]);

  const fetchComentarios = useCallback(async () => {
    if (!notificacion?.id) return;
    try {
      setLoadingComentarios(true);
      const res = await api.get(`/notificaciones/${notificacion.id}/comentarios`);
      setComentarios(res.data || []);
    } catch { /* ignore */ } finally {
      setLoadingComentarios(false);
    }
  }, [notificacion?.id]);

  useEffect(() => {
    fetchComentarios();
    setEstadoGestion(notificacion?.estadoGestion || 'EN_REVISION');
    setResponsableId(notificacion?.responsableId || '');
    setFechaCompromiso(notificacion?.fechaCompromiso ? new Date(notificacion.fechaCompromiso).toISOString().split('T')[0] : '');
    setNotasInternas(notificacion?.notasInternas || '');
  }, [notificacion, fetchComentarios]);

  const handleSaveGestion = async () => {
    try {
      setSavingGestion(true);
      const payload: any = { estadoGestion, notasInternas, fechaCompromiso: fechaCompromiso ? new Date(fechaCompromiso).toISOString() : null };
      if (isAdmin) payload.responsableId = responsableId || null;
      const res = await api.patch(`/notificaciones/${notificacion.id}/gestion`, payload);
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
      await api.post(`/notificaciones/${notificacion.id}/comentarios`, { texto: nuevoComentario.trim() });
      setNuevoComentario('');
      toast.success('Nota agregada a la bitácora.');
      fetchComentarios();
    } catch { toast.error('Error al agregar comentario.'); } finally {
      setSendingComentario(false);
    }
  };

  const handleAsignarEtiqueta = async (etiquetaId: string) => {
    try {
      await api.post('/etiquetas/asignar', { notificacionId: notificacion.id, etiquetaId });
      const sel = etiquetasDisponibles.find((e) => e.id === etiquetaId);
      if (sel && !etiquetasAsignadas.some((e) => e.id === etiquetaId)) setEtiquetasAsignadas((p) => [...p, sel]);
      toast.success('Etiqueta asignada.');
    } catch { toast.error('Error al asignar etiqueta.'); }
  };

  const handleDesasignarEtiqueta = async (etiquetaId: string) => {
    try {
      await api.delete(`/etiquetas/${etiquetaId}/notificacion/${notificacion.id}`);
      setEtiquetasAsignadas((p) => p.filter((e) => e.id !== etiquetaId));
      toast.success('Etiqueta retirada.');
    } catch { toast.error('Error al retirar etiqueta.'); }
  };

  const handleCrearEtiqueta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaEtiquetaNombre.trim()) return;
    try {
      const res = await api.post('/etiquetas', { nombre: nuevaEtiquetaNombre.trim(), color: nuevaEtiquetaColor });
      const nueva = res.data;
      setEtiquetasDisponibles((p) => [...p, nueva]);
      await handleAsignarEtiqueta(nueva.id);
      setNuevaEtiquetaNombre('');
      setIsCrearEtiquetaOpen(false);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error al crear etiqueta.'); }
  };

  return (
    <div className="space-y-6">
      <NotifEstadoForm
        notificacion={notificacion}
        estadoGestion={estadoGestion}
        setEstadoGestion={setEstadoGestion}
        responsableId={responsableId}
        setResponsableId={setResponsableId}
        fechaCompromiso={fechaCompromiso}
        setFechaCompromiso={setFechaCompromiso}
        notasInternas={notasInternas}
        setNotasInternas={setNotasInternas}
        usuarios={usuarios}
        isAdmin={isAdmin}
        saving={savingGestion}
        onSave={handleSaveGestion}
        etiquetasSlot={
          <NotifEtiquetasManager
            notificacionId={notificacion.id}
            etiquetasDisponibles={etiquetasDisponibles}
            etiquetasAsignadas={etiquetasAsignadas}
            isCrearEtiquetaOpen={isCrearEtiquetaOpen}
            setIsCrearEtiquetaOpen={setIsCrearEtiquetaOpen}
            nuevaEtiquetaNombre={nuevaEtiquetaNombre}
            setNuevaEtiquetaNombre={setNuevaEtiquetaNombre}
            nuevaEtiquetaColor={nuevaEtiquetaColor}
            setNuevaEtiquetaColor={setNuevaEtiquetaColor}
            onAsignar={handleAsignarEtiqueta}
            onDesasignar={handleDesasignarEtiqueta}
            onCrear={handleCrearEtiqueta}
          />
        }
      />

      <NotifComentariosThread
        comentarios={comentarios}
        nuevoComentario={nuevoComentario}
        setNuevoComentario={setNuevoComentario}
        loadingComentarios={loadingComentarios}
        sendingComentario={sendingComentario}
        onSubmit={handleAddComentario}
      />
    </div>
  );
};
