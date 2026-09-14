import { useState, useRef } from 'react';
import { exportToExcel, readExcelFile, getVal } from '@/lib/excelUtils';
import { toast } from '@/store/useToastStore';

export function useEmpresaExcel(saveEmpresa: (id: string | null, data: any) => Promise<any>) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = (empresas: any[]) => {
    const data = empresas.map((emp) => ({
      'RUC': emp.ruc,
      'Razón Social': emp.razonSocial,
      'Usuario SOL': emp.usuarioSol,
      'Monitoreo SUNAT': emp.habilitadoSunat !== false ? 'SI' : 'NO',
      'Monitoreo SUNAFIL': emp.habilitadoSunafil ? 'SI' : 'NO',
      'Términos SUNAFIL': emp.terminosSunafil || 'SIN_VERIFICAR',
      'Estado Sistema': emp.activo !== false ? 'ACTIVO' : 'INACTIVO',
      'Última Sincronización': emp.ultimaSincronizacion
        ? new Date(emp.ultimaSincronizacion).toLocaleString('es-PE')
        : 'Nunca',
    }));
    exportToExcel(data, 'Directorio_Maestro_Empresas', 'Empresas');
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
      toast.error('Error al leer el archivo Excel.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = async () => {
    if (!importPreview.length) return;
    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of importPreview) {
      const ruc = getVal(row, 'RUC', 'ruc', 'Ruc');
      const razonSocial = getVal(row, 'Razón Social', 'Razon Social', 'razonSocial', 'RAZON SOCIAL');
      const usuarioSol = getVal(row, 'Usuario SOL', 'Usuario Sol', 'usuarioSol', 'USUARIO SOL', 'Usuario', 'usuario');
      const claveSol = getVal(row, 'Clave SOL', 'Clave Sol', 'claveSol', 'CLAVE SOL', 'Clave', 'clave');
      const sunatVal = getVal(row, 'SUNAT', 'sunat', 'Monitoreo SUNAT');
      const sunafilVal = getVal(row, 'SUNAFIL', 'sunafil', 'Monitoreo SUNAFIL');

      if (!ruc || !razonSocial || !usuarioSol || !claveSol) {
        errorCount++;
        continue;
      }

      try {
        await saveEmpresa(null, {
          ruc: String(ruc).trim(),
          razonSocial: String(razonSocial).trim(),
          usuarioSol: String(usuarioSol).trim(),
          claveSol: String(claveSol).trim(),
          habilitadoSunat: sunatVal ? String(sunatVal).toUpperCase() === 'SI' || String(sunatVal) === '1' : true,
          habilitadoSunafil: sunafilVal ? String(sunafilVal).toUpperCase() === 'SI' || String(sunafilVal) === '1' : false,
        });
        successCount++;
      } catch (e) {
        console.error('Import error for row:', row, e);
        errorCount++;
      }
    }

    setImporting(false);
    setIsImportModalOpen(false);
    setImportPreview([]);
    if (successCount > 0) {
      toast.success(`Se importaron ${successCount} empresas correctamente.`);
    }
    if (errorCount > 0) {
      toast.warning(`${errorCount} filas no se pudieron procesar por datos incompletos.`);
    }
  };

  return {
    isImportModalOpen,
    setIsImportModalOpen,
    importPreview,
    importing,
    fileInputRef,
    handleExportExcel,
    handleImportFile,
    handleExecuteImport,
  };
}
