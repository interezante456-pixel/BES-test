"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Bell,
  Settings,
  Shield,
  ShieldCheck,
  Archive,
  Mail,
  TrendingUp,
  Sun,
  UserCheck,
  Calendar,
  FileText,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';

interface DashboardNavLinksProps {
  user: any;
  onItemClick: () => void;
}

export const DashboardNavLinks: React.FC<DashboardNavLinksProps> = ({ user, onItemClick }) => {
  const pathname = usePathname();
  const { sinLeer, sinLeerSunafil } = useNotificationStore();

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';
  const userModulos = user?.modulosPermitidos || ['SUNAT'];
  const hasModule = (m: string) => isSuperAdmin || userModulos.includes(m as any);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
      {/* SECCIÓN 1: GENERAL */}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">General</p>
        <div className="space-y-1">
          <Link
            href="/dashboard/morning-brief"
            onClick={onItemClick}
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
            onClick={onItemClick}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isActive('/dashboard', true)
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Panel de Control 360°
          </Link>
          {(isSuperAdmin || user?.rol === 'ADMIN') && (
            <Link
              href="/dashboard/empresas"
              onClick={onItemClick}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive('/dashboard/empresas', true)
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              Directorio Empresas
            </Link>
          )}
          {isSuperAdmin && (
            <>
              <Link
                href="/dashboard/mis-asignadas"
                onClick={onItemClick}
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
                onClick={onItemClick}
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
                onClick={onItemClick}
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
                onClick={onItemClick}
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
              onClick={onItemClick}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive('/dashboard/sunat/empresas')
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Empresas SUNAT
            </Link>
            <Link
              href="/dashboard/bandeja"
              onClick={onItemClick}
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
              onClick={onItemClick}
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

      {/* SECCIÓN 3: SUNAFIL (Casilla) */}
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
              onClick={onItemClick}
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
              onClick={onItemClick}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive('/dashboard/sunafil', true)
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Casilla Notificaciones</span>
              </div>
              {sinLeerSunafil > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md font-bold">
                  {sinLeerSunafil}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: SISTEMA */}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Sistema</p>
        <div className="space-y-1">
          {(isSuperAdmin || user?.rol === 'ADMIN') && (
            <Link
              href="/dashboard/admin"
              onClick={onItemClick}
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

          {isSuperAdmin && (
            <Link
              href="/dashboard/admin/auditoria"
              onClick={onItemClick}
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
            onClick={onItemClick}
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
  );
};
