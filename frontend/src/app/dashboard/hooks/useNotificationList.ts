import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { getSocket } from '@/lib/socket';
import { getAlertBadgeInfo } from '@/lib/notificacion-badge.helper';
import { CategoriaAlertaFilter } from '../components/NotificationFilterBar';
import { toast } from '@/store/useToastStore';


export interface NotificationEmpresa {
  id?: string;
  ruc: string;
  razonSocial: string;
}

export interface NotificationItemData {
  id: string;
  asunto: string;
  fechaMensaje: string;
  estado?: string;
  rutaArchivoPdf?: string | null;
  montoExigible?: string | null;
  expedienteCoactivo?: string | null;
  empresa: NotificationEmpresa;
}

interface UseNotificationListOptions {
  endpoint: '/notificaciones' | '/notificaciones/archivo';
  empresaFilterId?: string | null;
}

export function useNotificationList({ endpoint, empresaFilterId }: UseNotificationListOptions) {
  const [rawNotificaciones, setRawNotificaciones] = useState<NotificationItemData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaAlertaFilter>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { decrementSinLeer, fetchStats } = useNotificationStore();

  const canDelete = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  // Conteos de categorías en base a las notificaciones cargadas
  const counts = useMemo(() => {
    let criticas = 0;
    let fiscalizacion = 0;
    let deuda = 0;

    for (const n of rawNotificaciones) {
      const info = getAlertBadgeInfo(n.asunto);
      if (info.level === 'CRITICA') criticas++;
      if (info.level === 'FISCALIZACION') fiscalizacion++;
      if (n.montoExigible) deuda++;
    }

    return {
      total: rawNotificaciones.length,
      criticas,
      fiscalizacion,
      deuda,
    };
  }, [rawNotificaciones]);

  // Lista filtrada según la pestaña de categoría seleccionada
  const notificaciones = useMemo(() => {
    if (categoriaFilter === 'ALL') return rawNotificaciones;
    if (categoriaFilter === 'CRITICA') {
      return rawNotificaciones.filter((n) => getAlertBadgeInfo(n.asunto).level === 'CRITICA');
    }
    if (categoriaFilter === 'FISCALIZACION') {
      return rawNotificaciones.filter((n) => getAlertBadgeInfo(n.asunto).level === 'FISCALIZACION');
    }
    if (categoriaFilter === 'DEUDA') {
      return rawNotificaciones.filter((n) => Boolean(n.montoExigible));
    }
    return rawNotificaciones;
  }, [rawNotificaciones, categoriaFilter]);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (empresaFilterId) params.append('empresa', empresaFilterId);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`${endpoint}?${params.toString()}`);
      setRawNotificaciones(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page: 1, lastPage: 1 });
      setSelectedIds([]);
    } catch (error) {
      console.error('Error loading notifications', error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, empresaFilterId, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated) fetchNotificaciones();
  }, [isAuthenticated, fetchNotificaciones]);

  // Sincronización en tiempo real vía WebSockets
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();

    const handleNotificacionLeida = (data: { id: string }) => {
      if (endpoint === '/notificaciones') {
        // En bandeja: remover la notificación inmediatamente de la vista en vivo
        setRawNotificaciones((prev) => prev.filter((n) => n.id !== data.id));
        setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        decrementSinLeer();
      } else if (endpoint === '/notificaciones/archivo') {
        // En archivo: refrescar silenciosamente para incluir la recién leída
        fetchNotificaciones();
      }
    };

    const handleTodasLeidas = () => {
      if (endpoint === '/notificaciones') {
        setRawNotificaciones([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } else if (endpoint === '/notificaciones/archivo') {
        fetchNotificaciones();
      }
      fetchStats();
    };

    socket.on('notificacion:leida', handleNotificacionLeida);
    socket.on('notificacion:todas_leidas', handleTodasLeidas);

    return () => {
      socket.off('notificacion:leida', handleNotificacionLeida);
      socket.off('notificacion:todas_leidas', handleTodasLeidas);
    };
  }, [isAuthenticated, endpoint, decrementSinLeer, fetchStats, fetchNotificaciones]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, startDate, endDate, empresaFilterId]);

  const getPdfUrl = (ruta: string | null | undefined): string | null => {
    if (!ruta) return null;
    const fileName = ruta.split('/uploads/').pop();
    if (!fileName) return null;
    if (typeof window !== 'undefined' && window.location.port === '3500') {
      return `${window.location.protocol}//${window.location.hostname}:4000/uploads/${fileName}`;
    }
    return `/uploads/${fileName}`;
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notificaciones/${id}/read`);
      setRawNotificaciones((prev) => prev.filter((n) => n.id !== id));
      decrementSinLeer();
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const clearInbox = async () => {
    await api.patch('/notificaciones/mark-all-read');
    await fetchNotificaciones();
    fetchStats();
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notificaciones/${id}`);
      setRawNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };

  const bulkDeleteNotifications = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/notificaciones/bulk-delete', { ids: selectedIds });
      setRawNotificaciones((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk deleting notifications', error);
    }
  };

  const retryPdf = async (notifId: string) => {
    setRetrying((prev) => ({ ...prev, [notifId]: true }));
    try {
      const res = await api.post(`/scraper/retry-pdf/${notifId}`, {}, { timeout: 120000 });
      if (res.data?.success) {
        toast.success('Documento PDF recuperado con éxito desde SUNAT', 'Recuperación PDF');
        await fetchNotificaciones();
      } else {
        toast.error(
          res.data?.message || 'No se pudo recuperar el PDF desde SUNAT. Es posible que el documento haya expirado.',
          'Error PDF'
        );
      }
    } catch {
      toast.error('No se pudo recuperar el PDF en este momento. Inténtalo más tarde.', 'Error de Conexión');
    } finally {
      setRetrying((prev) => ({ ...prev, [notifId]: false }));
    }
  };


  const allSelected =
    notificaciones.length > 0 && notificaciones.every((n) => selectedIds.includes(n.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const currentIds = notificaciones.map((n) => n.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const newIds = new Set([...selectedIds, ...notificaciones.map((n) => n.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCategoriaFilter('ALL');
  };

  return {
    notificaciones,
    meta,
    page,
    loading,
    searchTerm,
    startDate,
    endDate,
    categoriaFilter,
    setCategoriaFilter,
    counts,
    selectedIds,
    allSelected,
    canDelete,
    retrying,
    setPage,
    setSearchTerm,
    setStartDate,
    setEndDate,
    getPdfUrl,
    markAsRead,
    clearInbox,
    deleteNotification,
    bulkDeleteNotifications,
    retryPdf,
    toggleSelectAll,
    toggleSelectOne,
    clearFilters,
    fetchNotificaciones,
  };
}
