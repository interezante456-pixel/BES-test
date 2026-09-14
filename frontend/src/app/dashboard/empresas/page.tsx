"use client";

import React, { useState } from 'react';
import { Building2, Upload, Plus, Download } from 'lucide-react';
import { useEmpresas } from './hooks/useEmpresas';
import { useEmpresaExcel } from './hooks/useEmpresaExcel';
import { EmpresaFormModal } from './components/EmpresaFormModal';
import { SunatLoginModal } from './components/SunatLoginModal';
import { SunafilLoginModal } from './components/SunafilLoginModal';
import { DirectorioKpiCards } from './components/DirectorioKpiCards';
import { DirectorioToolbar } from './components/DirectorioToolbar';
import { DirectorioEmpresaTable } from './components/DirectorioEmpresaTable';
import ConfirmModal from '@/components/ConfirmModal';
import { ExcelImportModal } from '@/components/ExcelImportModal';

export default function DirectorioEmpresasPage() {
  const [activeTab, setActiveTab] = useState<'TODAS' | 'SUNAT' | 'SUNAFIL' | 'INACTIVAS'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<any | null>(null);

  const [isToggleActivoModalOpen, setIsToggleActivoModalOpen] = useState(false);
  const [empresaToToggleActivo, setEmpresaToToggleActivo] = useState<any | null>(null);

  const [isSunatModalOpen, setIsSunatModalOpen] = useState(false);
  const [sunatEmpresa, setSunatEmpresa] = useState<any | null>(null);

  const [isSunafilModalOpen, setIsSunafilModalOpen] = useState(false);
  const [sunafilEmpresa, setSunafilEmpresa] = useState<any | null>(null);

  const {
    empresas,
    loading,
    syncingEmpresas,
    handleSync,
    handleSyncSunafil,
    toggleEmpresaActivo,
    toggleSunat,
    toggleSunafil,
    deleteEmpresa,
    saveEmpresa,
    user,
  } = useEmpresas();

  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importPreview,
    importing,
    fileInputRef,
    handleExportExcel,
    handleImportFile,
    handleExecuteImport,
  } = useEmpresaExcel(saveEmpresa);

  const canManage = user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN';

  // Conteos
  const totalCount = empresas.length;
  const sunatCount = empresas.filter((e) => e.habilitadoSunat !== false).length;
  const sunafilCount = empresas.filter((e) => e.habilitadoSunafil === true).length;
  const inactivasCount = empresas.filter((e) => e.activo === false).length;

  // Filtrado
  const filteredEmpresas = empresas.filter((emp) => {
    if (activeTab === 'SUNAT' && emp.habilitadoSunat === false) return false;
    if (activeTab === 'SUNAFIL' && !emp.habilitadoSunafil) return false;
    if (activeTab === 'INACTIVAS' && emp.activo !== false) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        emp.ruc.includes(term) ||
        emp.razonSocial?.toLowerCase().includes(term) ||
        emp.usuarioSol?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!empresaToDelete) return;
    await deleteEmpresa(empresaToDelete.id);
    setIsDeleteModalOpen(false);
    setEmpresaToDelete(null);
  };

  const handleConfirmToggleActivo = async () => {
    if (!empresaToToggleActivo) return;
    await toggleEmpresaActivo(empresaToToggleActivo.id, empresaToToggleActivo.activo !== false);
    setIsToggleActivoModalOpen(false);
    setEmpresaToToggleActivo(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] via-[#162032] to-[#111827] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Directorio Maestro de Empresas</h1>
            <p className="text-xs text-gray-400">
              Control central de credenciales SOL y activación de monitoreo para SUNAT y SUNAFIL
            </p>
          </div>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {canManage && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-white/5 transition-all shadow-sm"
                title="Importar empresas desde archivo Excel"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                Importar Excel
              </button>

              <button
                onClick={() => {
                  setEditingEmpresa(null);
                  setIsFormModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nueva Empresa
              </button>
            </>
          )}

          <button
            onClick={() => handleExportExcel(empresas)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-white/5 transition-all shadow-sm"
            title="Exportar directorio completo a Excel"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DirectorioKpiCards
        totalCount={totalCount}
        sunatCount={sunatCount}
        sunafilCount={sunafilCount}
        inactivasCount={inactivasCount}
      />

      {/* Toolbar con filtros y buscador */}
      <DirectorioToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={totalCount}
        sunatCount={sunatCount}
        sunafilCount={sunafilCount}
        inactivasCount={inactivasCount}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Tabla de Empresas */}
      <DirectorioEmpresaTable
        empresas={filteredEmpresas}
        loading={loading}
        searchTerm={searchTerm}
        syncingEmpresas={syncingEmpresas}
        canManage={canManage}
        onSyncSunat={handleSync}
        onSyncSunafil={handleSyncSunafil}
        onToggleSunat={toggleSunat}
        onToggleSunafil={toggleSunafil}
        onOpenEdit={(emp) => {
          setEditingEmpresa(emp);
          setIsFormModalOpen(true);
        }}
        onOpenDelete={(emp) => {
          setEmpresaToDelete(emp);
          setIsDeleteModalOpen(true);
        }}
        onOpenToggleActivo={(emp) => {
          setEmpresaToToggleActivo(emp);
          setIsToggleActivoModalOpen(true);
        }}
        onOpenSunatModal={(emp) => {
          setSunatEmpresa(emp);
          setIsSunatModalOpen(true);
        }}
      />

      {/* Modales */}
      <EmpresaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={saveEmpresa}
        initialData={editingEmpresa}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Empresa del Sistema?"
        message={
          empresaToDelete
            ? `Estás a punto de eliminar definitivamente "${empresaToDelete.razonSocial}" (RUC: ${empresaToDelete.ruc}). Esta acción borrará todo su historial de notificaciones tanto de SUNAT como de SUNAFIL y no se puede deshacer.`
            : ''
        }
        confirmText="Sí, Eliminar Definitivamente"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={isToggleActivoModalOpen}
        onClose={() => setIsToggleActivoModalOpen(false)}
        onConfirm={handleConfirmToggleActivo}
        title={empresaToToggleActivo?.activo === false ? '¿Reactivar Empresa?' : '¿Pausar Empresa?'}
        message={
          empresaToToggleActivo
            ? `¿Deseas ${
                empresaToToggleActivo.activo === false ? 'reactivar' : 'pausar temporalmente'
              } la empresa "${empresaToToggleActivo.razonSocial}"?`
            : ''
        }
        confirmText={empresaToToggleActivo?.activo === false ? 'Reactivar' : 'Pausar'}
        cancelText="Cancelar"
        confirmVariant="warning"
      />

      <SunatLoginModal
        isOpen={isSunatModalOpen}
        onClose={() => setIsSunatModalOpen(false)}
        empresa={sunatEmpresa}
      />

      <SunafilLoginModal
        isOpen={isSunafilModalOpen}
        onClose={() => setIsSunafilModalOpen(false)}
        empresa={sunafilEmpresa}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        previewRows={importPreview}
        entidad="SUNAT"
        importing={importing}
        onConfirm={handleExecuteImport}
      />
    </div>
  );
}
