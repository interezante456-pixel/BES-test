import React from 'react';
import { FileText, Printer, RefreshCw } from 'lucide-react';
import type { TipoReporte } from '../hooks/useReportesData';

interface ReportesHeaderBarProps {
  tipoReporte: TipoReporte;
  setTipoReporte: (t: TipoReporte) => void;
  empresaId: string;
  setEmpresaId: (id: string) => void;
  mesStr: string;
  setMesStr: (m: string) => void;
  empresas: any[];
  fechaGeneracion: string;
  onPrint: () => void;
}

export const ReportesHeaderBar: React.FC<ReportesHeaderBarProps> = ({
  tipoReporte,
  setTipoReporte,
  empresaId,
  setEmpresaId,
  mesStr,
  setMesStr,
  empresas,
  fechaGeneracion,
  onPrint,
}) => {
  const tiposBotones: { key: TipoReporte; label: string; activeClass: string }[] = [
    {
      key: 'DEUDA',
      label: 'Deuda Coactiva Exigible',
      activeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      key: 'VENCIMIENTOS',
      label: 'Vencimientos (30 Días)',
      activeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      key: 'EMPRESA',
      label: 'Mensual por Empresa',
      activeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    },
  ];

  return (
    <div className="print:hidden space-y-6">
      {/* Header principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Centro de Reportes Ejecutivos
              </h1>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold">
                PDF &amp; AUDITORÍA
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Genera informes oficiales listos para enviar a clientes o sustentar fiscalizaciones.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      {/* Selector de Tipo de Reporte y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {tiposBotones.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setTipoReporte(btn.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tipoReporte === btn.key ? btn.activeClass : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Filtros adicionales para reporte por empresa */}
        {tipoReporte === 'EMPRESA' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-[#111827]">
                  {emp.razonSocial}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={mesStr}
              onChange={(e) => setMesStr(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none [color-scheme:dark]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
