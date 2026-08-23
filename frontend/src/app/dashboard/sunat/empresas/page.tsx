"use client";

import { useState, useRef } from 'react';
import { Plus, Search, RefreshCw, Download, Upload } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import { exportToExcel, readExcelFile, getVal } from '@/lib/excelUtils';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { EmpresaTable } from '../../empresas/components/EmpresaTable';
import { EmpresaFormModal } from '../../empresas/components/EmpresaFormModal';
import { SunatLoginModal } from '../../empresas/components/SunatLoginModal';

export default function SunatEmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<string | null>(null);
  const [empresaToToggle, setEmpresaToToggle] = useState<any | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [sunatEmpresa, setSunatEmpresa] = useState<any | null>(null);
  const [isSunatModalOpen, setIsSunatModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    empresas,
    loading,
    syncingEmpresas,
    syncingAll,
    handleSync,
    handleSyncAll,
    toggleEmpresaActivo,
    deleteEmpresa,
    saveEmpresa,
    user,
  } = useEmpresas();

  // Filtrar solo las empresas habilitadas para SUNAT
  const sunatEmpresas = empresas.filter((emp) => emp.habilitadoSunat !== false);

  const filteredEmpresas = sunatEmpresas.filter(
    (emp) =>
      emp.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm)
  );

  const handleOpenSunat = (empresa: any) => {
    setSunatEmpresa(empresa);
    setIsSunatModalOpen(true);
  };

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingEmpresa(null);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const data = sunatEmpresas.map((emp) => {
      const row: any = {
        'Razón Social': emp.razonSocial,
        'RUC': emp.ruc,
        'Usuario SOL': emp.usuarioSol,
      };

      if (emp.claveSol) {
        row['Clave SOL'] = emp.claveSol;
      }

      row['SUNAT'] = 'SI';
      row['SUNAFIL'] = emp.habilitadoSunafil ? 'SI' : 'NO';
      row['Estado Conexión'] = emp.estadoConexion;
      row['Total Notificaciones'] = emp._count?.notificaciones ?? 0;
      return row;
    });

    exportToExcel(data, 'Empresas_SUNAT', 'SUNAT_Empresas');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await readExcelFile(file);
      setImportPreview(rows);
      setIsImportModalOpen(true);
    } catch (err) {
      console.error('Error reading excel file:', err);
      alert('Error al leer el archivo Excel.');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const row of importPreview) {
      const razonSocial = getVal(row, 'Razón Social', 'Razon Social', 'Empresa', 'Nombre');
      const ruc = getVal(row, 'RUC', 'Ruc');
      const usuarioSol = getVal(row, 'Usuario SOL', 'Usuario Sol', 'UsuarioSOL', 'Usuario');
      const claveSol = getVal(row, 'Clave SOL', 'Clave Sol', 'ClaveSOL', 'Clave');

      const sunatVal = getVal(row, 'SUNAT');
      const sunafilVal = getVal(row, 'SUNAFIL');

      const habilitadoSunat = sunatVal
        ? sunatVal.toUpperCase() === 'SI' || sunatVal.toUpperCase() === 'TRUE'
        : true;
      const habilitadoSunafil = sunafilVal
        ? sunafilVal.toUpperCase() === 'SI' || sunafilVal.toUpperCase() === 'TRUE'
        : false;

      if (!ruc || !razonSocial || !usuarioSol || !claveSol) {
        errors++;
        errorDetails.push(`Fila (${razonSocial || ruc || 'Sin datos'}): Faltan campos requeridos`);
        continue;
      }

      try {
        await saveEmpresa(null, {
          razonSocial,
          ruc,
          usuarioSol,
          claveSol,
          habilitadoSunat,
          habilitadoSunafil,
        });
        success++;
      } catch (err: any) {
        errors++;
        const msg = err.response?.data?.message || err.message || 'Error al guardar';
        errorDetails.push(`RUC ${ruc}: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      }
    }

    setImporting(false);
    setIsImportModalOpen(false);
    setImportPreview([]);

    if (errorDetails.length > 0) {
      alert(
        `Importación finalizada.\n\n✅ Exitosas: ${success}\n❌ Errores: ${errors}\n\nDetalles:\n` +
          errorDetails.slice(0, 8).join('\n')
      );
    } else {
      alert(`✅ Importación completada con éxito: ${success} empresas registradas/actualizadas.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Toolbar alineados */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111827] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white">Directorio de Empresas — SUNAT</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              BUZÓN SOL
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Administra las credenciales Clave SOL y sincronización de tus{' '}
            <strong className="text-emerald-400">{sunatEmpresas.length}</strong> empresas en SUNAT.
          </p>
        </div>

        {/* Toolbar de Botones */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Exportar */}
          <button
            onClick={handleExport}
            disabled={sunatEmpresas.length === 0}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all disabled:opacity-40 whitespace-nowrap"
            title="Exportar a Excel"
          >
            <Download className="w-4 h-4 text-gray-400" />
            <span>Exportar</span>
          </button>

          {/* Importar */}
          {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN') && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap"
                title="Importar desde Excel"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span>Importar</span>
              </button>
            </>
          )}

          {/* Sincronizar Todo */}
          <button
            onClick={handleSyncAll}
            disabled={syncingAll || sunatEmpresas.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Sincronizando...' : 'Sincronizar Todo'}</span>
          </button>

          {/* Nueva Empresa */}
          {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN') && (
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar empresas SUNAT por RUC o Razón Social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111827] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 outline-none text-sm"
        />
      </div>

      {/* Tabla de Empresas */}
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
          onEdit={handleEdit}
          onDelete={(id) => {
            setEmpresaToDelete(id);
            setIsDeleteModalOpen(true);
          }}
          onToggleActivo={(emp) => {
            setEmpresaToToggle(emp);
            setIsToggleModalOpen(true);
          }}
          userRol={user?.rol}
        />
      )}

      {/* Modales */}
      <EmpresaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={saveEmpresa}
        initialData={editingEmpresa}
        defaultEntidad="SUNAT"
      />

      <SunatLoginModal
        isOpen={isSunatModalOpen}
        onClose={() => setIsSunatModalOpen(false)}
        empresa={sunatEmpresa}
      />

      {/* Modal Importación Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        previewRows={importPreview}
        entidad="SUNAT"
        importing={importing}
        onConfirm={handleConfirmImport}
      />

      {/* Modal Confirmar Eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Empresa?"
        message="Esta acción eliminará la empresa y todas sus notificaciones registradas. No se puede deshacer."
        confirmText="Eliminar Empresa"
        confirmVariant="danger"
        onConfirm={async () => {
          if (empresaToDelete) {
            await deleteEmpresa(empresaToDelete);
            setIsDeleteModalOpen(false);
            setEmpresaToDelete(null);
          }
        }}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmpresaToDelete(null);
        }}
      />

      {/* Modal Confirmar Pausar / Reactivar Sincronización */}
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
            await toggleEmpresaActivo(empresaToToggle.id, !empresaToToggle.activo);
            setIsToggleModalOpen(false);
            setEmpresaToToggle(null);
          }
        }}
        onClose={() => {
          setIsToggleModalOpen(false);
          setEmpresaToToggle(null);
        }}
      />
    </div>
  );
}
