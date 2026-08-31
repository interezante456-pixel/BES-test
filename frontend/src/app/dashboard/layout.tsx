"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import api from '@/lib/api';
import { Building2, Bell, LogOut, Settings, Shield, ShieldCheck, Archive, Mail, TrendingUp, Menu, X, User, Sun, UserCheck, Calendar, FileText } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { UserProfileModal } from './components/UserProfileModal';

import { OraconLogo } from '@/components/OraconLogo';
import ToastContainer from '@/components/ui/ToastContainer';
import SyncProgressWidget from '@/components/SyncProgressWidget';
import { useSyncStore } from '@/store/useSyncStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { sinLeer, fetchStats } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleNotifications = async () => {
    if (!showNotifications) {
      setNotifLoading(true);
      try {
        const res = await api.get('/notificaciones');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setRecentNotifications(list.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent notifications", error);
      } finally {
        setNotifLoading(false);
      }
    }
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    
    // Cargar estadísticas iniciales
    fetchStats();

    // Reutilizar la conexión del WebSocket compartido
    const socket = getSocket();

    const handleSyncFinished = (data: any) => {
      console.log(`[WS] Sincronización completada para empresa: ${data.empresaId}`);
      fetchStats(); // Refrescar estadísticas en tiempo real
    };

    const handleSyncError = (data: any) => {
      console.log(`[WS] Error de sincronización: ${data.message}`);
      fetchStats(); // Refrescar estadísticas igualmente
    };


    const handleNotificacionLeidaGlobal = () => {
      fetchStats(); // Refrescar estadísticas y badges en tiempo real
    };

    socket.on(`sync-finished-${user.id}`, handleSyncFinished);
    socket.on(`sync-error-${user.id}`, handleSyncError);
    socket.on('notificacion:leida', handleNotificacionLeidaGlobal);
    socket.on('notificacion:todas_leidas', handleNotificacionLeidaGlobal);

    return () => {
      socket.off(`sync-finished-${user.id}`, handleSyncFinished);
      socket.off(`sync-error-${user.id}`, handleSyncError);
      socket.off('notificacion:leida', handleNotificacionLeidaGlobal);
      socket.off('notificacion:todas_leidas', handleNotificacionLeidaGlobal);
    };
  }, [isAuthenticated, user, router, fetchStats]);

  // Cerrar menú móvil cuando cambie la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted || !isAuthenticated) return null;

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';
  const userModulos = user?.modulosPermitidos || ['SUNAT'];
  const hasModule = (m: string) => isSuperAdmin || userModulos.includes(m as any);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="h-screen w-full bg-[#090d16] flex flex-col md:flex-row relative overflow-hidden">
      {/* Backdrop para móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Drawer en móvil, estático en desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 h-full bg-[#111827] border-r border-white/5 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center">
            <OraconLogo size="sm" showSubtitle={false} className="mr-3" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">ORACON</h1>
              <p className="text-[10px] text-orange-400 font-medium tracking-wide">ESTUDIO CONTABLE</p>
            </div>
          </div>
          {/* Botón cerrar para móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          {/* SECCIÓN 1: GENERAL */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">General</p>
            <div className="space-y-1">
              <Link
                href="/dashboard/morning-brief"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive('/dashboard/morning-brief')
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                Morning Brief
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  HOY
                </span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive('/dashboard', true)
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Panel de Control 360°
              </Link>
              {/* Módulos en BETA: Visibles exclusivamente para SUPER_ADMIN */}
              {user?.rol === 'SUPER_ADMIN' && (
                <>
                  <Link
                    href="/dashboard/mis-asignadas"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive('/dashboard/mis-asignadas')
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>Mis Asignadas</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      BETA
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/calendario"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive('/dashboard/calendario')
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Calendario</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      BETA
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/recordatorios"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive('/dashboard/recordatorios')
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Recordatorios</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      BETA
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/reportes"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive('/dashboard/reportes')
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span>Reportes</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      BETA
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: SUNAT (Buzón SOL) */}
          {hasModule('SUNAT') && (
            <div>
              <div className="flex items-center justify-between px-4 mb-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SUNAT (Buzón SOL)</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-1">
                <Link
                  href="/dashboard/sunat/empresas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/sunat/empresas') || isActive('/dashboard/empresas')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Empresas SUNAT
                </Link>
                <Link
                  href="/dashboard/bandeja"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/bandeja')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    Bandeja de Entrada
                  </div>
                  {sinLeer > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-bold">
                      {sinLeer}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/archivo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/archivo')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Archive className="w-4 h-4 text-emerald-400" />
                  Archivo Histórico
                </Link>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: SUNAFIL (Casilla Electrónica - Beta / Privado) */}
          {hasModule('SUNAFIL') && (
            <div>
              <div className="flex items-center justify-between px-4 mb-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SUNAFIL (Casilla)</p>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold">
                  BETA
                </span>
              </div>
              <div className="space-y-1">
                <Link
                  href="/dashboard/sunafil/empresas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/sunafil/empresas')
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Empresas SUNAFIL
                </Link>
                <Link
                  href="/dashboard/sunafil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/sunafil', true)
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  Casilla Notificaciones
                </Link>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: SISTEMA & ADMINISTRACIÓN */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Sistema</p>
            <div className="space-y-1">
              {(isSuperAdmin || user?.rol === 'ADMIN') && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    pathname === '/dashboard/admin'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Gestión Usuarios
                </Link>
              )}

              {/* Auditoría EXCLUSIVA para SUPER_ADMIN */}
              {isSuperAdmin && (
                <Link
                  href="/dashboard/admin/auditoria"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive('/dashboard/admin/auditoria')
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Auditoría General
                </Link>
              )}

              <Link
                href="/dashboard/configuracion"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive('/dashboard/configuracion')
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Configuración
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 md:p-6 border-t border-white/5 space-y-3">
          {/* Botón de Perfil de Usuario */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 p-2.5 -mx-1 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all group"
            title="Ver mi perfil de usuario"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                <span className="truncate">{user?.nombre}</span>
              </p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => { logout().then(() => router.push('/login')); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Modal de Perfil de Usuario */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 md:h-20 bg-[#111827]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Botón menú hamburguesa para móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <p className="text-xs md:text-sm text-gray-400 capitalize">
              {new Date().toLocaleDateString('es-PE', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 md:p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {sinLeer > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 border-2 border-[#111827] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5">
                  {sinLeer > 99 ? '99+' : sinLeer}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <h4 className="font-bold text-white text-sm">Notificaciones Recientes</h4>
                  {sinLeer > 0 && (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                      {sinLeer} nuevas
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifLoading ? (
                    <p className="text-xs text-gray-500 text-center py-4">Cargando...</p>
                  ) : recentNotifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No hay notificaciones sin leer.</p>
                  ) : (
                    recentNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(`/dashboard/bandeja?empresa=${n.empresa.id}`);
                        }}
                        className="p-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="text-[11px] font-bold text-gray-300 truncate max-w-[150px]">{n.empresa.razonSocial}</span>
                          <span className="text-[9px] text-gray-500 flex-shrink-0">
                            {new Date(n.fechaMensaje).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{n.asunto}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="pt-3 border-t border-white/5 mt-3 flex justify-between">
                  <Link
                    href="/dashboard/bandeja"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                  >
                    Ver bandeja completa
                  </Link>
                  <Link
                    href="/dashboard/archivo"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors font-medium"
                  >
                    Ver archivo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          {children}
        </div>

        <ToastContainer />
        <SyncProgressWidget />
      </main>
    </div>
  );
}

