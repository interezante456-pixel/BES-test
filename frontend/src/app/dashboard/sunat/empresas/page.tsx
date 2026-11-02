"use client";

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { exportToExcel } from '@/lib/excelUtils';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { EmpresaTable } from '../../empresas/components/EmpresaTable';
import { SunatLoginModal } from '../../empresas/components/SunatLoginModal';
import { SunatEmpresasHeader } from './components/SunatEmpresasHeader';

export default function SunatEmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaToToggle, setEmpresaToToggle] = useState<any | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
  const [sunatEmpresa, setSunatEmpresa] = useState<any | null>(null);
  const [isSunatModalOpen, setIsSunatModalOpen] = useState(false);

  const {
    empresas,
    loading,
    syncingEmpresas,
    syncingAll,
    handleSync,
    handleSyncAll,
    toggleEmpresaActivo,
    user,
  } = useEmpresas();

  const sunatEmpresas = empresas.filter((emp) => emp.habilitadoSunat !== false);
  const filteredEmpresas = sunatEmpresas.filter(
    (emp) =>
      emp.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm),
  );

  const handleOpenSunat = (empresa: any) => {
    setSunatEmpresa(empresa);
    setIsSunatModalOpen(true);
  };

  const handleExport = () => {
    const data = sunatEmpresas.map((emp) => {
      const row: any = {
        'Razón Social': emp.razonSocial,
        'RUC': emp.ruc,
        'Usuario SOL': emp.usuarioSol,
      };
      row['SUNAT'] = 'SI';
      row['SUNAFIL'] = emp.habilitadoSunafil ? 'SI' : 'NO';
      row['Estado Conexión'] = emp.estadoConexion;
      row['Total Notificaciones'] = emp._count?.notificaciones ?? 0;
      return row;
    });
    exportToExcel(data, 'Empresas_SUNAT', 'SUNAT_Empresas');
  };

  return (
    <div className="space-y-6">
      <SunatEmpresasHeader
        sunatEmpresas={sunatEmpresas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        syncingAll={syncingAll}
        onExport={handleExport}
        onSyncAll={() => setIsSyncConfirmOpen(true)}
        userRol={user?.rol}
      />

      {/* Tabla */}
      {loading ? (
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-12 text-center text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          Cargando empresas SUNAT...
        </div>
      ) : (
        <EmpresaTable
          empresas={filteredEmpresas}
          syncingEmpresas={syncingEmpresas}
          onSync={handleSync}
          onOpenSunat={handleOpenSunat}
          onToggleActivo={(emp: any) => {
            setEmpresaToToggle(emp);
            setIsToggleModalOpen(true);
          }}
          userRol={user?.rol}
        />
      )}

      {/* Modales */}
      <SunatLoginModal
        isOpen={isSunatModalOpen}
        onClose={() => setIsSunatModalOpen(false)}
        empresa={sunatEmpresa}
      />

      <ConfirmModal
        isOpen={isToggleModalOpen}
        title={empresaToToggle?.activo ? '¿Pausar sincronización?' : '¿Reactivar sincronización?'}
        message={
          empresaToToggle?.activo
            ? `La empresa "${empresaToToggle?.razonSocial}" dejará de consultarse automáticamente por el robot.`
            : `La empresa "${empresaToToggle?.razonSocial}" volverá a ser incluida en las consultas periódicas.`
        }
        confirmText={empresaToToggle?.activo ? 'Pausar Empresa' : 'Reactivar Empresa'}
        confirmVariant={empresaToToggle?.activo ? 'warning' : 'primary'}
        onConfirm={async () => {
          if (empresaToToggle) {
            await toggleEmpresaActivo(empresaToToggle.id, empresaToToggle.activo ?? true);
            setIsToggleModalOpen(false);
            setEmpresaToToggle(null);
          }
        }}
        onClose={() => {
          setIsToggleModalOpen(false);
          setEmpresaToToggle(null);
        }}
      />

      <ConfirmModal
        isOpen={isSyncConfirmOpen}
        title="¿Iniciar Sincronización Masiva?"
        message={`Se iniciará la sincronización en segundo plano de las ${sunatEmpresas.filter((e) => e.activo !== false).length} empresas activas en SUNAT Buzón SOL. Podrás seguir el avance en tiempo real en la pantalla.`}
        confirmText="Sí, Sincronizar Todo"
        cancelText="No, Cancelar"
        confirmVariant="sync"
        onConfirm={() => {
          setIsSyncConfirmOpen(false);
          void handleSyncAll();
        }}
        onClose={() => setIsSyncConfirmOpen(false)}
      />
    </div>
  );
}
