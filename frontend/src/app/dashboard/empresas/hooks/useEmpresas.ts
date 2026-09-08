import { useState, useEffect, useCallback, useRef } from 'react';
import { Empresa } from '@/types/empresa';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { useSyncStore } from '@/store/useSyncStore';

export function useEmpresas() {
  const { user, isAuthenticated } = useAuthStore();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const empresasRef = useRef<Empresa[]>([]);
  empresasRef.current = empresas;

  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingEmpresas, setSyncingEmpresas] = useState<Record<string, boolean>>({});

  const fetchEmpresas = useCallback(async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(res.data);
    } catch (error) {
      console.error("Error fetching empresas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Cargar empresas y suscribirse a WebSockets por usuario
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Resetear empresas atascadas una sola vez al montar
    api.post('/empresas/reset-stuck', {}).catch(() => {});
    
    fetchEmpresas();

    if (user?.id) {
      const socket = getSocket();

      const handleSyncFinished = (data: any) => {
        setSyncingEmpresas(prev => ({ ...prev, [data.empresaId]: false }));
        const emp = empresasRef.current.find(e => e.id === data.empresaId);
        const name = emp ? (emp.razonSocial || emp.ruc) : 'Empresa';
        const portalName = data.portal === 'SUNAFIL' ? 'Casilla SUNAFIL' : 'Buzón SUNAT';
        useSyncStore.getState().recordEmpresaSync(name, true);
        toast.success(`Sincronización completada: ${name}`, portalName);
        fetchEmpresas();
      };

      const handleSyncError = (data: any) => {
        setSyncingEmpresas(prev => ({ ...prev, [data.empresaId]: false }));
        const emp = empresasRef.current.find(e => e.id === data.empresaId);
        const name = emp ? (emp.razonSocial || emp.ruc) : 'Empresa';
        useSyncStore.getState().recordEmpresaSync(`${name} (Error)`, false);
        toast.error(data.message || 'Error de conexión', `Error: ${name}`);
        fetchEmpresas();
      };

      socket.on(`sync-finished-${user.id}`, handleSyncFinished);
      socket.on(`sync-error-${user.id}`, handleSyncError);

      return () => {
        socket.off(`sync-finished-${user.id}`, handleSyncFinished);
        socket.off(`sync-error-${user.id}`, handleSyncError);
      };
    }
  }, [isAuthenticated, user?.id, fetchEmpresas]);


  // 2. Polling cada 15s cuando hay empresas sincronizando (para capturar completions)
  const hasSyncing = empresas.some(e => e.estadoSincro === 'SYNCING');
  useEffect(() => {
    if (!hasSyncing) return;
    const interval = setInterval(() => fetchEmpresas(), 15000);
    return () => clearInterval(interval);
  }, [hasSyncing, fetchEmpresas]);


  const handleSync = async (empresaId: string) => {
    try {
      setSyncingEmpresas(prev => ({ ...prev, [empresaId]: true }));
      const emp = empresasRef.current.find(e => e.id === empresaId);
      const name = emp ? (emp.razonSocial || emp.ruc) : 'Empresa';
      useSyncStore.getState().startSync(1, 'SUNAT');
      toast.info(`Iniciando conexión para ${name}...`, "Sincronizando");
      await api.post(`/scraper/sync/${empresaId}`, {});
    } catch (error) {
      setSyncingEmpresas(prev => ({ ...prev, [empresaId]: false }));
      toast.error("No se pudo iniciar la sincronización de la empresa");
    }
  };

  const handleSyncSunafil = async (empresaId: string) => {
    try {
      setSyncingEmpresas(prev => ({ ...prev, [empresaId]: true }));
      const emp = empresasRef.current.find(e => e.id === empresaId);
      const name = emp ? (emp.razonSocial || emp.ruc) : 'Empresa';
      useSyncStore.getState().startSync(1, 'SUNAFIL');
      toast.info(`Iniciando conexión SUNAFIL para ${name}...`, "Sincronizando");
      const res = await api.post(`/scraper/sync-sunafil/${empresaId}`, {});
      return res.data;
    } catch (error: any) {
      setSyncingEmpresas(prev => ({ ...prev, [empresaId]: false }));
      toast.error(error?.response?.data?.message || "Error al sincronizar SUNAFIL");
    }
  };

  const handleSyncAll = async () => {
    const activeEmpresas = empresas.filter(e => e.activo !== false && e.habilitadoSunat !== false);
    if (activeEmpresas.length === 0) {
      toast.warning("No hay empresas activas de SUNAT para sincronizar");
      return;
    }

    setSyncingAll(true);
    const newSyncingState = { ...syncingEmpresas };
    activeEmpresas.forEach(emp => { newSyncingState[emp.id] = true; });
    setSyncingEmpresas(newSyncingState);

    try {
      const res = await api.post('/scraper/sync-all', {});
      const count = res.data.count ?? activeEmpresas.length;
      useSyncStore.getState().startSync(count, 'SUNAT');
      toast.info(`Se encolaron ${count} empresas activas para sincronización SUNAT.`, 'Sincronización Masiva');
    } catch (error) {
      toast.error("Error al iniciar la sincronización masiva");
      setSyncingEmpresas({});
    } finally {
      setSyncingAll(false);
    }
  };

  const [syncingSunafilAll, setSyncingSunafilAll] = useState(false);

  const handleSyncSunafilAll = async () => {
    const activeEmpresas = empresas.filter(e => e.activo !== false && e.habilitadoSunafil === true);
    if (activeEmpresas.length === 0) {
      toast.warning("No hay empresas activas de SUNAFIL para sincronizar");
      return;
    }

    setSyncingSunafilAll(true);
    const newSyncingState = { ...syncingEmpresas };
    activeEmpresas.forEach(emp => { newSyncingState[emp.id] = true; });
    setSyncingEmpresas(newSyncingState);

    try {
      const res = await api.post('/scraper/sync-all-sunafil', {});
      const count = res.data.count ?? activeEmpresas.length;
      useSyncStore.getState().startSync(count, 'SUNAFIL');
      toast.info(`Se encolaron ${count} empresas activas para sincronización SUNAFIL.`, 'Sincronización Masiva SUNAFIL');
    } catch (error) {
      toast.error("Error al iniciar la sincronización masiva de SUNAFIL");
      setSyncingEmpresas({});
    } finally {
      setSyncingSunafilAll(false);
    }
  };

  const toggleEmpresaActivo = async (id: string, currentActivo: boolean) => {
    const nuevoEstado = !currentActivo;
    try {
      await api.patch(`/empresas/${id}`, { activo: nuevoEstado });
      await fetchEmpresas();
      toast.success(`Empresa ${nuevoEstado ? 'reactivada' : 'pausada'} correctamente`);
    } catch (error) {
      toast.error("Error al cambiar el estado de la empresa");
    }
  };


  const deleteEmpresa = async (id: string) => {
    try {
      await api.delete(`/empresas/${id}`);
      await fetchEmpresas();
      toast.success("Empresa eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la empresa");
    }
  };

  const saveEmpresa = async (id: string | null, data: any) => {
    if (id) {
      await api.patch(`/empresas/${id}`, data);
    } else {
      await api.post('/empresas', data);
    }
    await fetchEmpresas();
  };

  return {
    empresas,
    loading,
    syncingEmpresas,
    syncingAll,
    syncingSunafilAll,
    handleSync,
    handleSyncSunafil,
    handleSyncAll,
    handleSyncSunafilAll,
    toggleEmpresaActivo,
    deleteEmpresa,
    saveEmpresa,
    user
  };
}

