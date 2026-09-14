"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfileModal } from './components/UserProfileModal';
import ToastContainer from '@/components/ui/ToastContainer';
import SyncProgressWidget from '@/components/SyncProgressWidget';
import { useLayoutSocket } from './components/layout/hooks/useLayoutSocket';
import { DashboardSidebar } from './components/layout/DashboardSidebar';
import { DashboardNavbar } from './components/layout/DashboardNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hook que administra sockets, perfiles y estadísticas en tiempo real
  useLayoutSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="h-screen w-full bg-[#090d16] flex flex-col md:flex-row relative overflow-hidden">
      {/* Barra lateral */}
      <DashboardSidebar
        user={user}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        logout={logout}
      />

      {/* Contenedor principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Barra superior */}
        <DashboardNavbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Vista activa */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          {children}
        </div>

        {/* Notificaciones globales y progreso de sync */}
        <ToastContainer />
        <SyncProgressWidget />
      </main>

      {/* Modal de perfil */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
