"use client";

import { useState, useRef } from 'react';
import {
  Building2,
  Search,
  RefreshCw,
  Download,
  Plus,
  Upload,
  ExternalLink,
  Sparkles,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { EmpresaFormModal } from '../../empresas/components/EmpresaFormModal';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import ConfirmModal from '@/components/ConfirmModal';
import { exportToExcel, readExcelFile, getVal } from '@/lib/excelUtils';

export default function SunafilEmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { empresas, loading, user, saveEmpresa, deleteEmpresa } = useEmpresas();

  // Filtrar únicamente empresas con habilitadoSunafil === true
  const sunafilEmpresas = empresas.filter((emp) => emp.habilitadoSunafil === true);

  const filteredEmpresas = sunafilEmpresas.filter(
    (emp) =>
      emp.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ruc.includes(searchTerm)
  );

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingEmpresa(null);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const data = sunafilEmpresas.map((emp) => ({
      'Razón Social': emp.razonSocial,
      'RUC': emp.ruc,
      'Módulo': 'SUNAFIL Casilla Electrónica',
      'Estado Casilla': 'Monitoreo Activo (Beta)',
    }));

    exportToExcel(data, 'Empresas_SUNAFIL', 'SUNAFIL_Empresas');
  };

  const handleOpenSunafilCasilla = () => {
    window.open('https://casillaelectronica.sunafil.gob.pe/', '_blank', 'noopener,noreferrer');
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
      const usuarioSol = getVal(row, 'Usuario SOL', 'Usuario Sol', 'Usuario') || 'SOL_DEFAULT';
      const claveSol = getVal(row, 'Clave SOL', 'Clave Sol', 'Clave') || 'CLAVE_DEFAULT';

      if (!ruc || !razonSocial) {
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
          habilitadoSunat: false,
          habilitadoSunafil: true,
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
      alert(`✅ Importación completada con éxito: ${success} empresas registradas en SUNAFIL.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111827] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white">Directorio de Empresas — SUNAFIL</h2>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
              CASILLA ELECTRÓNICA
            </span>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
              BETA
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Empresas registradas para el monitoreo de actuaciones inspectivas (
            <strong className="text-indigo-400">{sunafilEmpresas.length}</strong> activas).
          </p>
        </div>

        {/* Toolbar de Botones */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Exportar */}
          <button
            onClick={handleExport}
            disabled={sunafilEmpresas.length === 0}
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
                title="Importar Excel SUNAFIL"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span>Importar</span>
              </button>
            </>
          )}

          {/* Nueva Empresa SUNAFIL */}
          {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN') && (
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Gestión Unificada por RUC</p>
            <p className="text-[11px] text-gray-400">
              Puedes activar una empresa para SUNAFIL editándola y marcando la casilla correspondiente, o creando una nueva desde aquí.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar empresas SUNAFIL por RUC o Razón Social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111827] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold border-b border-white/5">
              <tr>
                <th className="py-4 px-6">Empresa / Razón Social</th>
                <th className="py-4 px-6">RUC</th>
                <th className="py-4 px-6">Módulo Laboral</th>
                <th className="py-4 px-6 text-center">Estado Casilla</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando empresas SUNAFIL...
                  </td>
                </tr>
              ) : filteredEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-gray-400">No hay empresas asignadas a SUNAFIL.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Crea una nueva empresa o edita una existente para habilitar su casilla SUNAFIL.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmpresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                          {emp.razonSocial.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm line-clamp-1">{emp.razonSocial}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-500 font-mono">RUC: {emp.ruc}</span>
                            {emp.habilitadoSunat !== false && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                + SUNAT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-white">{emp.ruc}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
                        Casilla Electrónica
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Habilitada
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleOpenSunafilCasilla}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-all inline-flex items-center gap-1.5"
                          title="Abrir Casilla Electrónica SUNAFIL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Casilla
                        </button>
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors"
                          title="Editar empresa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEmpresaToDelete(emp.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                          title="Eliminar empresa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      <EmpresaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={saveEmpresa}
        initialData={editingEmpresa}
        defaultEntidad="SUNAFIL"
      />

      {/* Modal Confirmar Eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="¿Eliminar Empresa?"
        message="Esta acción eliminará la empresa del sistema. No se puede deshacer."
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

      {/* Modal Previsualización de Importación */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        previewRows={importPreview}
        entidad="SUNAFIL"
        importing={importing}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
}
