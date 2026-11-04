"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { OraconLogo } from '@/components/OraconLogo';
import { DashboardNavLinks } from './DashboardNavLinks';
import { APP_CONFIG } from '@/config/version';

interface DashboardSidebarProps {
  user: any;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onOpenProfile: () => void;
  logout: () => Promise<void>;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  user,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onOpenProfile,
  logout,
}) => {
  const router = useRouter();

  return (
    <>
      {/* Backdrop para móvil */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú móvil"
          tabIndex={-1}
          className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-40 md:hidden border-0 cursor-default p-0 m-0 transition-opacity"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar Drawer */}
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
          <button
            onClick={onCloseMobileMenu}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links de navegación */}
        <DashboardNavLinks user={user} onItemClick={onCloseMobileMenu} />

        {/* Footer del Sidebar */}
        <div className="p-4 md:p-6 border-t border-white/5 space-y-3">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full text-left flex items-center gap-3 p-2.5 -mx-1 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all group"
            title="Ver mi perfil de usuario"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                {user?.nombre}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </button>

          <button
            onClick={() => {
              logout().then(() => router.push('/login'));
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>BES Suite</span>
            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 font-semibold tracking-wide">
              {APP_CONFIG.version}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
