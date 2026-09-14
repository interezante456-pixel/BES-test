"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { toast } from '@/store/useToastStore';

export type RecordatorioFilter = 'PENDIENTES' | 'COMPLETADOS' | 'TODOS';

export function useRecordatorios() {
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecordatorioFilter>('PENDIENTES');

  // Estado del modal de creación
  const [isOpenModal, setIsOpenModal] = useState(false);
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

  const handleCreate = async (data: {
    titulo: string;
    descripcion?: string;
    fechaRecordar: string;
    empresaId?: string;
  }) => {
    try {
      setSaving(true);
      await api.post('/recordatorios', {
        titulo: data.titulo.trim(),
        descripcion: data.descripcion?.trim() || undefined,
        fechaRecordar: new Date(data.fechaRecordar).toISOString(),
        empresaId: data.empresaId || undefined,
      });
      toast.success('Recordatorio programado con éxito.');
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

  return {
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
  };
}
