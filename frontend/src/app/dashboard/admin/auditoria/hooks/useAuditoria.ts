import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export interface AuditLogItem {
  id: string;
  usuarioId: string | null;
  accion: string;
  entidad: string | null;
  entidadId: string | null;
  detalles: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  usuario?: {
    id: string;
    nombres?: string;
    apellidos?: string;
    nombre?: string;
    email: string;
    rol: string;
  } | null;
}

export function useAuditoria() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accionFilter, setAccionFilter] = useState('');
  const [accionesUnicas, setAccionesUnicas] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';

  const fetchAcciones = useCallback(async () => {
    try {
      const res = await api.get('/auditoria/acciones');
      setAccionesUnicas(res.data);
    } catch (e) {
      console.error('Error cargando acciones únicas:', e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (search) params.search = search;
      if (accionFilter) params.accion = accionFilter;

      const res = await api.get('/auditoria', { params });
      setLogs(res.data.items || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalItems(res.data.meta?.total || 0);
    } catch (e) {
      console.error('Error cargando logs de auditoría:', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, accionFilter]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAcciones();
    }
  }, [fetchAcciones, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [fetchLogs, isSuperAdmin]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleAccionFilterChange = (val: string) => {
    setAccionFilter(val);
    setPage(1);
  };

  return {
    logs,
    loading,
    search,
    accionFilter,
    accionesUnicas,
    page,
    totalPages,
    totalItems,
    isSuperAdmin,
    setPage,
    handleSearchChange,
    handleAccionFilterChange,
    fetchLogs,
  };
}
