import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { toast } from '@/store/useToastStore';

export function useLayoutSocket() {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { fetchStats } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Cargar estadísticas iniciales
    fetchStats();

    // Sincronizar perfil fresco del servidor en F5 o carga inicial
    api.get('/usuarios/profile/me')
      .then((res) => {
        if (res.data) {
          updateUser({
            modulosPermitidos: res.data.modulosPermitidos,
            rol: res.data.rol,
            nombres: res.data.nombres,
            apellidos: res.data.apellidos,
            dni: res.data.dni,
            email: res.data.email,
            telegramChatId: res.data.telegramChatId,
          });
        }
      })
      .catch((err) => {
        console.error("Error al sincronizar perfil fresco", err);
      });

    // Reutilizar la conexión del WebSocket compartido
    const socket = getSocket();

    const handleSyncFinished = (data: any) => {
      console.log(`[WS] Sincronización completada para empresa: ${data.empresaId}`);
      fetchStats();
    };

    const handleSyncError = (data: any) => {
      console.log(`[WS] Error de sincronización: ${data.message}`);
      fetchStats();
    };

    const handleNotificacionLeidaGlobal = () => {
      fetchStats();
    };

    const handlePermissionsUpdated = (data: any) => {
      if (data.userId === user.id || !data.userId) {
        console.log('[WS] Permisos de usuario actualizados:', data);
        updateUser({
          modulosPermitidos: data.modulosPermitidos,
          rol: data.rol,
        });

        const newModulos = data.modulosPermitidos || [];
        const isStillSuperAdmin = data.rol === 'SUPER_ADMIN';

        if (!isStillSuperAdmin && !newModulos.includes('SUNAFIL')) {
          if (pathname.startsWith('/dashboard/sunafil')) {
            router.push('/dashboard');
            toast.warning(
              'El módulo SUNAFIL ha sido desasignado de tu cuenta por un administrador.',
              'Acceso Restringido'
            );
          } else {
            toast.info('Tus módulos asignados han sido actualizados por un administrador.');
          }
        } else {
          toast.info('Tus permisos y módulos asignados han sido actualizados.');
        }
      }
    };

    socket.on(`sync-finished-${user.id}`, handleSyncFinished);
    socket.on(`sync-error-${user.id}`, handleSyncError);
    socket.on('notificacion:leida', handleNotificacionLeidaGlobal);
    socket.on('notificacion:todas_leidas', handleNotificacionLeidaGlobal);
    socket.on(`user:permissions-updated-${user.id}`, handlePermissionsUpdated);
    socket.on('user:permissions-updated', handlePermissionsUpdated);

    return () => {
      socket.off(`sync-finished-${user.id}`, handleSyncFinished);
      socket.off(`sync-error-${user.id}`, handleSyncError);
      socket.off('notificacion:leida', handleNotificacionLeidaGlobal);
      socket.off('notificacion:todas_leidas', handleNotificacionLeidaGlobal);
      socket.off(`user:permissions-updated-${user.id}`, handlePermissionsUpdated);
      socket.off('user:permissions-updated', handlePermissionsUpdated);
    };
  }, [isAuthenticated, user?.id, router, fetchStats, updateUser, pathname]);

  // Protección de ruta automática: Si se desasigna un módulo mientras navega
  useEffect(() => {
    if (!user || user.rol === 'SUPER_ADMIN') return;
    const modulos = user.modulosPermitidos || ['SUNAT'];
    if (pathname.startsWith('/dashboard/sunafil') && !modulos.includes('SUNAFIL')) {
      router.push('/dashboard');
      toast.warning('No tienes permisos asignados para el módulo SUNAFIL.', 'Acceso Restringido');
    }
  }, [pathname, user?.modulosPermitidos, user?.rol, router]);
}
