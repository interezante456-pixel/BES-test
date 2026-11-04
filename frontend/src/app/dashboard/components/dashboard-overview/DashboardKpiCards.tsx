"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, FileX, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

interface DashboardKpiCardsProps {
  stats: any;
  activeTab: 'ALL' | 'SUNAT' | 'SUNAFIL';
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ stats, activeTab }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Empresas Monitoreadas"
        value={stats?.totalEmpresas ?? 0}
        icon={<Building2 className="w-6 h-6" />}
        color="indigo"
        subtitle={`${stats?.empresasSunat ?? 0} en SUNAT • ${stats?.empresasSunafil ?? 0} en SUNAFIL`}
        onClick={() =>
          router.push(activeTab === 'SUNAFIL' ? '/dashboard/sunafil/empresas' : '/dashboard/sunat/empresas')
        }
        clickable
      />
      <KpiCard
        label="Total Notificaciones"
        value={activeTab === 'SUNAFIL' ? 0 : stats?.totalNotificaciones ?? 0}
        icon={<Mail className="w-6 h-6" />}
        color="blue"
        subtitle={activeTab === 'SUNAFIL' ? 'SUNAFIL (En pruebas)' : 'recibidos en SUNAT'}
        onClick={() => router.push(activeTab === 'SUNAFIL' ? '/dashboard/sunafil' : '/dashboard/bandeja')}
        clickable
      />
      <KpiCard
        label="Alertas Críticas / Coactivas"
        value={activeTab === 'SUNAFIL' ? 0 : stats?.totalPeligrosas ?? 0}
        icon={<ShieldAlert className="w-6 h-6" />}
        color="rose"
        subtitle="coactivas / resoluciones"
        onClick={() => router.push('/dashboard/bandeja')}
        clickable
      />
      <KpiCard
        label="Sin Leer (Pendientes)"
        value={activeTab === 'SUNAFIL' ? 0 : stats?.sinLeer ?? 0}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="amber"
        subtitle="pendientes de revisión"
        onClick={() => router.push('/dashboard/bandeja')}
        clickable
      />
      <KpiCard
        label="PDFs No Encontrados"
        value={activeTab === 'SUNAFIL' ? 0 : stats?.sinPdf ?? 0}
        icon={<FileX className="w-6 h-6" />}
        color="red"
        subtitle="errores en portal"
      />
    </div>
  );
};

function KpiCard({
  label,
  value,
  icon,
  color,
  subtitle,
  onClick,
  clickable,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'indigo' | 'blue' | 'amber' | 'red' | 'emerald' | 'rose';
  subtitle: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/20 text-red-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} border rounded-3xl p-5 ${
        clickable ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${colors[color].split(' ').pop()}`}>
          {icon}
        </div>
        {clickable && <ExternalLink className="w-3.5 h-3.5 text-gray-500" />}
      </div>
      <p className="text-3xl font-black text-white mb-0.5">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold text-white/80">{label}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}
