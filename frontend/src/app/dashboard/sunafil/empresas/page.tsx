"use client";

import { useState, useRef, useEffect } from 'react';
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
  Power,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';
import { EmpresaFormModal } from '../../empresas/components/EmpresaFormModal';
import { SunafilLoginModal } from '../../empresas/components/SunafilLoginModal';
import { ExcelImportModal } from '@/components/ExcelImportModal';
import ConfirmModal from '@/components/ConfirmModal';
import { exportToExcel, readExcelFile, getVal } from '@/lib/excelUtils';

export default function SunafilEmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<string | null>(null);
  const [empresaToToggle, setEmpresaToToggle] = useState<any | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [sunafilDetailsEmpresa, setSunafilDetailsEmpresa] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    handleSyncSunafil,
    toggleEmpresaActivo,
    deleteEmpresa,
    saveEmpresa,
    user,
  } = useEmpresas();

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

  const handleOpenDetails = (empresa: any) => {
    setSunafilDetailsEmpresa(empresa);
    setIsDetailsModalOpen(true);
  };

  const handleOpenCasilla = (empresa: any) => {
    if (extensionInstalled) {
      window.postMessage(
        {
          type: 'BES_FILL_SUNAT',
          incognito: false,
          data: {
            ruc: empresa.ruc,
            usuarioSol: empresa.usuarioSol,
            claveSol: empresa.claveSol,
            url: sunafilOAuthUrl,
          },
        },
        '*',
      );
    } else {
      handleOpenDetails(empresa);
    }
  };

  const openNewModal = () => {
    setEditingEmpresa(null);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const data = sunafilEmpresas.map((emp) => ({
      'Razón Social': emp.razonSocial,
      'RUC': emp.ruc,
      'Usuario SOL': emp.usuarioSol,
      'Módulo': 'SUNAFIL Casilla Electrónica',
      'Estado Casilla': emp.activo !== false ? 'Habilitada' : 'Deshabilitada',
      'Última Sincronización': emp.ultimaSincronizacion
        ? new Date(emp.ultimaSincronizacion).toLocaleString('es-PE')
        : 'Nunca',
      'Estado Sincro': emp.estadoSincro || 'ESPERA',
    }));

    exportToExcel(data, 'Empresas_SUNAFIL', 'SUNAFIL_Empresas');
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
            Empresas registradas para el monitoreo de actuaciones inspectivas y alertas laborales (
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
            <p className="text-xs font-bold text-white">Monitoreo Automatizado de Casilla SUNAFIL</p>
            <p className="text-[11px] text-gray-400">
              Sincroniza notificaciones de Fiscalización, Cobranza, Acciones Previas (plazos) y Alertas de Formalización / SST.
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
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-4 px-6">Empresa / RUC</th>
                <th className="py-4 px-6">Módulo Laboral</th>
                <th className="py-4 px-6">Términos Casilla</th>
                <th className="py-4 px-6">Última Sincro</th>
                <th className="py-4 px-6">Estado Sincro</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando empresas SUNAFIL...
                  </td>
                </tr>
              ) : filteredEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-gray-400">No hay empresas asignadas a SUNAFIL.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Crea una nueva empresa o edita una existente para habilitar su casilla SUNAFIL.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmpresas.map((emp) => {
                  const isDeshabilitado = emp.activo === false;
                  const isSyncing = !!syncingEmpresas[emp.id];

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-white/[0.02] transition-colors group ${
                        isDeshabilitado ? 'opacity-60 bg-black/20' : ''
                      }`}
                    >
                      {/* Empresa / RUC */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border font-bold shrink-0 transition-all ${
                              isDeshabilitado
                                ? 'from-gray-900 to-gray-800 border-white/5 text-gray-500'
                                : 'from-indigo-950 to-indigo-900 border-indigo-500/20 text-indigo-300 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white'
                            }`}
                          >
                            {emp.razonSocial.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                              {emp.razonSocial}
                              {isDeshabilitado && (
                                <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono text-gray-500">RUC: {emp.ruc}</span>
                              {emp.habilitadoSunat !== false && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  + SUNAT
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Módulo Laboral */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
                          Casilla Electrónica
                        </span>
                      </td>

                      {/* Términos Casilla */}
                      <td className="py-4 px-6">
                        {emp.terminosSunafil === 'ACEPTADOS' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ACEPTADOS
                          </span>
                        ) : emp.terminosSunafil === 'PENDIENTE_ACEPTACION' ? (
                          <button
                            onClick={() => handleOpenDetails(emp)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                            title="⚠️ El titular no ha aceptado los Términos y Condiciones. Haz clic para abrir Casilla y aceptarlos."
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>PENDIENTE TÉRMINOS</span>
                          </button>
                        ) : emp.terminosSunafil === 'PENDIENTE_CONTACTO' ? (
                          <button
                            onClick={() => handleOpenDetails(emp)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                            title="⚠️ La empresa no tiene contactos registrados en la Casilla SUNAFIL. Haz clic para abrir y registrarlos."
                          >
                            <UserPlus className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>FALTA CONTACTO</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            SIN VERIFICAR
                          </span>
                        )}
                      </td>

                      {/* Última Sincro */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {emp.ultimaSincronizacion
                            ? new Date(emp.ultimaSincronizacion).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Nunca'}
                        </span>
                      </td>

                      {/* Estado Sincro */}
                      <td className="py-4 px-6">
                        {isDeshabilitado ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            DESHABILITADO
                          </span>
                        ) : isSyncing || emp.estadoSincro === 'SYNCING' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            SINCRONIZANDO
                          </span>
                        ) : emp.estadoSincro === 'TERMINOS_PENDIENTES' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap" title="El scraper no puede sincronizar porque los Términos y Condiciones no han sido aceptados">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            TÉRMINOS PENDIENTES
                          </span>
                        ) : emp.estadoSincro === 'CONTACTO_PENDIENTE' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full border border-orange-400/20 whitespace-nowrap" title="El scraper no puede sincronizar porque falta registrar por lo menos un contacto en la Casilla SUNAFIL">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            CONTACTO PENDIENTE
                          </span>
                        ) : emp.estadoSincro === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            TERMINADO
                          </span>
                        ) : emp.estadoSincro === 'ERROR' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            ERROR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            ESPERA
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sincronizar SUNAFIL */}
                          <button
                            onClick={() => handleSyncSunafil(emp.id)}
                            disabled={isSyncing || isDeshabilitado}
                            className={`p-2 rounded-xl border transition-all ${
                              isDeshabilitado
                                ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-gray-600'
                                : isSyncing
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20'
                            }`}
                            title={isDeshabilitado ? 'Empresa deshabilitada' : 'Sincronizar Notificaciones SUNAFIL'}
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                          </button>

                          {/* Abrir Casilla Directa con Autocompletado */}
                          <button
                            onClick={() => handleOpenCasilla(emp)}
                            className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                            title="Abrir y Autocompletar Casilla SUNAFIL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Casilla</span>
                          </button>

                          {/* Ver Detalles / Acceso Clave SOL */}
                          <button
                            onClick={() => handleOpenDetails(emp)}
                            className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 rounded-xl transition-all"
                            title="Ver Detalles y Acceso Casilla SUNAFIL"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Acciones de Administrador */}
                          {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN') && (
                            <>
                              {/* Habilitar / Deshabilitar */}
                              <button
                                onClick={() => {
                                  setEmpresaToToggle(emp);
                                  setIsToggleModalOpen(true);
                                }}
                                className={`p-2 rounded-xl border transition-all ${
                                  isDeshabilitado
                                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'
                                }`}
                                title={isDeshabilitado ? 'Habilitar empresa' : 'Deshabilitar empresa'}
                              >
                                <Power className="w-4 h-4" />
                              </button>

                              {/* Editar */}
                              <button
                                onClick={() => handleEdit(emp)}
                                className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                title="Editar empresa"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Eliminar */}
                              <button
                                onClick={() => {
                                  setEmpresaToDelete(emp.id);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 rounded-xl transition-all"
                                title="Eliminar empresa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Edición / Creación */}
      <EmpresaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={saveEmpresa}
        initialData={editingEmpresa}
        defaultEntidad="SUNAFIL"
      />

      {/* Modal Detalles y Clave SOL SUNAFIL */}
      <SunafilLoginModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSunafilDetailsEmpresa(null);
        }}
        empresa={sunafilDetailsEmpresa}
        onSync={handleSyncSunafil}
        isSyncing={sunafilDetailsEmpresa ? !!syncingEmpresas[sunafilDetailsEmpresa.id] : false}
      />

      {/* Modal Confirmar Toggle Activo/Inactivo */}
      <ConfirmModal
        isOpen={isToggleModalOpen}
        title={empresaToToggle?.activo === false ? '¿Habilitar Empresa?' : '¿Deshabilitar Empresa?'}
        message={
          empresaToToggle?.activo === false
            ? `Se reanudará el monitoreo y sincronización para ${empresaToToggle?.razonSocial}.`
            : `Al deshabilitar ${empresaToToggle?.razonSocial}, no se ejecutarán sincronizaciones automáticas ni manuales.`
        }
        confirmText={empresaToToggle?.activo === false ? 'Habilitar' : 'Deshabilitar'}
        confirmVariant={empresaToToggle?.activo === false ? 'primary' : 'danger'}
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
