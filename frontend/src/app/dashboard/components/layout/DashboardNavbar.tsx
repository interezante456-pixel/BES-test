"use client";

import React from 'react';
import { Menu } from 'lucide-react';
import { NotificationBellDropdown } from './NotificationBellDropdown';

interface DashboardNavbarProps {
  onOpenMobileMenu: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onOpenMobileMenu }) => {
  return (
    <header className="h-16 md:h-20 bg-[#111827]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        <p className="text-xs md:text-sm text-gray-400 capitalize">
          {new Date().toLocaleDateString('es-PE', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      <NotificationBellDropdown />
    </header>
  );
};
