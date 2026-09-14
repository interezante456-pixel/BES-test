"use client";

import { useState, useEffect } from 'react';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { SunafilLoginModal } from '../../empresas/components/SunafilLoginModal';
import ConfirmModal from '@/components/ConfirmModal';
import { exportToExcel } from '@/lib/excelUtils';
import { SunafilEmpresasHeader } from './components/SunafilEmpresasHeader';
import { SunafilEmpresaTable } from './components/SunafilEmpresaTable';

export default function SunafilEmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaToToggle, setEmpresaToToggle] = useState<any | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
  const [sunafilDetailsEmpresa, setSunafilDetailsEmpresa] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  const sunafilOAuthUrl =
    'https://api-seguridad.sunat.gob.pe/v1/clientessol/b6474e23-8a3b-4153-b301-dafcc9646250/oauth2/login?originalUrl=https://casillaelectronica.sunafil.gob.pe/si.inbox/Login/Empresa&state=s';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BES_EXTENSION_INSTALLED') {
        setExtensionInstalled(true);
      }
    };
    window.addEventListener('message', handleMessage);
    window.postMessage({ type: 'BES_CHECK_EXTENSION' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const {
    empresas,
    loading,
    syncingEmpresas,
    syncingSunafilAll,
    handleSyncSunafil,
    handleSyncSunafilAll,
    toggleEmpresaActivo,
    user,
  } = useEmpresas();

  const sunafilEmpresas = empresas.filter((emp) => emp.habilitadoSunafil === true);
  const filteredEmpresas = sunafilEmpresas.filter(
    (emp) =>
      emp.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm),
  );

  const handleOpenDetails = (empresa: any) => {
    setSunafilDetailsEmpresa(empresa);
    setIsDetailsModalOpen(true);
  };

  const handleOpenCasilla = (empresa: any) => {
    if (extensionInstalled) {
      window.postMessage(
        { type: 'BES_FILL_SUNAT', incognito: false, credentials: { ruc: empresa.ruc, usuario: empresa.usuarioSol, clave: empresa.claveSol, portal: 'SUNAFIL', portalUrl: sunafilOAuthUrl } },
        '*',
      );
    } else {
      handleOpenDetails(empresa);
    }
  };

  const handleExport = () => {
    const data = sunafilEmpresas.map((emp) => {
      const row: any = { 'Razón Social': emp.razonSocial, 'RUC': emp.ruc, 'Usuario SOL': emp.usuarioSol };
      row['SUNAT'] = emp.habilitadoSunat !== false ? 'SI' : 'NO';
      row['SUNAFIL'] = 'SI';
      row['Términos SUNAFIL'] = emp.terminosSunafil || 'SIN_VERIFICAR';
      row['Estado Conexión'] = emp.estadoConexion;
      row['Estado Sincro'] = emp.estadoSincro;
      row['Última Sincronización'] = emp.ultimaSincronizacion ? new Date(emp.ultimaSincronizacion).toLocaleString('es-PE') : 'Nunca';
      return row;
    });
    exportToExcel(data, 'Empresas_SUNAFIL', 'SUNAFIL_Empresas');
  };

  return (
    <div className="space-y-6">
      <SunafilEmpresasHeader
        sunafilEmpresas={sunafilEmpresas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        syncingSunafilAll={syncingSunafilAll}
        onExport={handleExport}
        onSyncAll={() => setIsSyncConfirmOpen(true)}
        userRol={user?.rol}
      />

      <SunafilEmpresaTable
        filteredEmpresas={filteredEmpresas}
        loading={loading}
        syncingEmpresas={syncingEmpresas}
        userRol={user?.rol}
        onSync={handleSyncSunafil}
        onOpenCasilla={handleOpenCasilla}
        onToggle={(emp) => { setEmpresaToToggle(emp); setIsToggleModalOpen(true); }}
      />

      {/* Modales */}
      <SunafilLoginModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSunafilDetailsEmpresa(null); }}
        empresa={sunafilDetailsEmpresa}
        onSync={handleSyncSunafil}
        isSyncing={sunafilDetailsEmpresa ? !!syncingEmpresas[sunafilDetailsEmpresa.id] : false}
      />

      <ConfirmModal
        isOpen={isToggleModalOpen}
        title={empresaToToggle?.activo === false ? '¿Habilitar Empresa?' : '¿Deshabilitar Empresa?'}
        message={empresaToToggle?.activo === false ? `Se reanudará el monitoreo y sincronización para ${empresaToToggle?.razonSocial}.` : `Al deshabilitar ${empresaToToggle?.razonSocial}, no se ejecutarán sincronizaciones automáticas ni manuales.`}
        confirmText={empresaToToggle?.activo === false ? 'Habilitar' : 'Deshabilitar'}
        confirmVariant={empresaToToggle?.activo === false ? 'primary' : 'danger'}
        onConfirm={async () => { if (empresaToToggle) { await toggleEmpresaActivo(empresaToToggle.id, empresaToToggle.activo ?? true); setIsToggleModalOpen(false); setEmpresaToToggle(null); } }}
        onClose={() => { setIsToggleModalOpen(false); setEmpresaToToggle(null); }}
      />

      <ConfirmModal
        isOpen={isSyncConfirmOpen}
        title="¿Iniciar Sincronización Masiva SUNAFIL?"
        message={`Se iniciará la sincronización en segundo plano de las ${sunafilEmpresas.filter((e) => e.activo !== false).length} empresas activas en SUNAFIL Casilla Electrónica. Podrás seguir el avance en tiempo real en la pantalla.`}
        confirmText="Sí, Sincronizar Todo"
        cancelText="No, Cancelar"
        confirmVariant="sync"
        onConfirm={() => { setIsSyncConfirmOpen(false); handleSyncSunafilAll(); }}
        onClose={() => setIsSyncConfirmOpen(false)}
      />
    </div>
  );
}
