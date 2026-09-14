"use client";

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { useAuthStore } from '@/store/useAuthStore';
import { exportToExcel } from '@/lib/excelUtils';
import { toast } from '@/store/useToastStore';
import type { SunafilMetrics } from '../components/SunafilKpiCards';

export function useSunafilNotifications() {
  const { user } = useAuthStore();
  const canDelete = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    type: 'single' | 'selected' | 'all';
    targetId?: string;
  }>({ open: false, type: 'single' });
  const [metrics, setMetrics] = useState<SunafilMetrics>({
    total: 0, noLeidas: 0, fiscalizacion: 0, cobranza: 0, accionesPrevias: 0, formalizacion: 0, sst: 0, porVencer: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { empresas } = useEmpresas();
  const sunafilEmpresas = empresas.filter((e) => e.habilitadoSunafil === true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const params = selectedEmpresa !== 'all' ? { empresa: selectedEmpresa } : {};
      const res = await api.get('/notificaciones/sunafil/metricas', { params });
      setMetrics(res.data);
    } catch (_e) {
      console.error('Error fetching sunafil metrics.');
    } finally {
      setLoadingMetrics(false);
    }
  }, [selectedEmpresa]);

  const fetchNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page, limit, empresa: selectedEmpresa, modulo: activeTab,
        search: searchTerm || undefined, startDate: startDate || undefined,
        endDate: endDate || undefined, estado: estadoFilter,
      };
      const res = await api.get('/notificaciones/sunafil', { params });
      setNotificaciones(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, lastPage: 1 });
      setSelectedIds([]);
    } catch (_e) {
      console.error('Error fetching sunafil notifications.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedEmpresa, activeTab, searchTerm, startDate, endDate, estadoFilter]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  useEffect(() => { fetchNotificaciones(); }, [fetchNotificaciones]);

  const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); setSelectedIds([]); };
  const handleToggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const handleToggleSelectAll = () => {
    if (notificaciones.every((n) => selectedIds.includes(n.id))) setSelectedIds([]);
    else setSelectedIds(notificaciones.map((n) => n.id));
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (deleteModalState.type === 'single' && deleteModalState.targetId) {
        await api.delete(`/notificaciones/${deleteModalState.targetId}`);
      } else if (deleteModalState.type === 'selected' && selectedIds.length > 0) {
        await api.post('/notificaciones/bulk-delete', { ids: selectedIds });
      } else if (deleteModalState.type === 'all') {
        await api.delete('/notificaciones');
      }
      setDeleteModalState({ open: false, type: 'single' });
      setSelectedIds([]);
      fetchMetrics();
      fetchNotificaciones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar notificaciones');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (notificaciones.length === 0) { toast.warning('No hay notificaciones para exportar.'); return; }
    const data = notificaciones.map((n) => ({
      'Empresa': n.empresa?.razonSocial || '', 'RUC': n.empresa?.ruc || '',
      'Módulo': n.moduloSunafil || '', 'Identificador': n.codigoReferencia || n.fileId || '',
      'Asunto': n.asunto || '',
      'Fecha Notificación': n.fechaNotificacion ? new Date(n.fechaNotificacion).toLocaleDateString('es-PE') : '',
      'Fecha Depósito': n.fechaDeposito ? new Date(n.fechaDeposito).toLocaleDateString('es-PE') : '',
      'Plazo (Días)': n.plazoDias || '',
      'Fecha Límite': n.fechaLimite ? new Date(n.fechaLimite).toLocaleDateString('es-PE') : '',
      'Intendencia': n.intendencia || '', 'Trabajadores': n.trabajadoresIncorporados ?? '', 'Estado': n.estado || '',
    }));
    exportToExcel(data, `SUNAFIL_Notificaciones_${activeTab}`, 'Notificaciones_SUNAFIL');
  };

  const handleViewDetail = (notif: any) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
    if (!notif.leidoGlobal) {
      api.patch(`/notificaciones/${notif.id}/read`).then(() => {
        setNotificaciones((prev) => prev.map((n) => n.id === notif.id ? { ...n, leidoGlobal: true } : n));
        fetchMetrics();
      }).catch(() => {});
    }
  };

  return {
    user, canDelete, activeTab, selectedEmpresa, setSelectedEmpresa, searchTerm, setSearchTerm,
    startDate, setStartDate, endDate, setEndDate, estadoFilter, setEstadoFilter,
    page, setPage, notificaciones, setNotificaciones, meta, loading, selectedIds,
    isDeleting, deleteModalState, setDeleteModalState, metrics, loadingMetrics,
    selectedNotif, setSelectedNotif, isDrawerOpen, setIsDrawerOpen,
    sunafilEmpresas, handleTabChange, handleToggleSelect, handleToggleSelectAll,
    confirmDelete, handleExportExcel, handleViewDetail, fetchMetrics, fetchNotificaciones,
  };
}
