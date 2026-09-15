import React from 'react';
import { X, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getVal } from '@/lib/excelUtils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewRows: any[];
  entidad: 'SUNAT' | 'SUNAFIL';
  importing: boolean;
  onConfirm: () => void;
  onDownloadTemplate?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  previewRows,
  entidad,
  importing,
  onConfirm,
  onDownloadTemplate,
}) => {
  if (!isOpen) return null;

  const isSunat = entidad === 'SUNAT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Previsualización de Importación — {entidad}
            </h3>
            <p className="text-xs text-gray-400">
              Se encontraron {previewRows.length} registros en el archivo Excel.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div
            className={`p-4 rounded-2xl text-xs border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isSunat
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            }`}
          >
            <div>
              {isSunat ? (
                <>
                  🟢 Las columnas requeridas son: <strong>Razón Social, RUC, Usuario SOL, Clave SOL</strong>. Si el RUC ya existe, se actualizarán sus credenciales.
                </>
              ) : (
                <>
                  🔵 Las empresas importadas se registrarán como activas en <strong>SUNAFIL (Casilla Electrónica)</strong>. Si alguna ya existía en SUNAT, ahora estará habilitada en ambas entidades.
                </>
              )}
            </div>
            {onDownloadTemplate && (
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10 self-start sm:self-auto"
                title="Descargar plantilla oficial en Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Descargar Plantilla
              </button>
            )}
          </div>

          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 font-bold border-b border-white/5">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Razón Social</th>
                  <th className="p-3">RUC</th>
                  {isSunat && (
                    <>
                      <th className="p-3">Usuario SOL</th>
                      <th className="p-3">Clave SOL</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {previewRows.slice(0, 10).map((row, idx) => {
                  const razonSocial = getVal(row, 'Razón Social', 'Razon Social', 'Empresa', 'Nombre');
                  const ruc = getVal(row, 'RUC', 'Ruc');
                  const usuarioSol = getVal(row, 'Usuario SOL', 'Usuario Sol', 'UsuarioSOL', 'Usuario');
                  const claveSol = getVal(row, 'Clave SOL', 'Clave Sol', 'ClaveSOL', 'Clave');

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-gray-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">
                        {razonSocial || <span className="text-red-400 italic">Requerido</span>}
                      </td>
                      <td className="p-3 font-mono">
                        {ruc || <span className="text-red-400 italic">Requerido</span>}
                      </td>
                      {isSunat && (
                        <>
                          <td className="p-3 font-mono">
                            {usuarioSol || <span className="text-red-400 italic">Requerido</span>}
                          </td>
                          <td className="p-3 font-mono">
                            {claveSol ? '••••••••' : <span className="text-red-400 italic">Requerido</span>}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {previewRows.length > 10 && (
            <p className="text-center text-xs text-gray-500 italic">
              ... y {previewRows.length - 10} filas más.
            </p>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={importing}
            className={`px-6 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2 ${
              isSunat
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/20'
            }`}
          >
            {importing && <RefreshCw className="w-4 h-4 animate-spin" />}
            {importing ? 'Importando...' : `Confirmar Importación (${previewRows.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
