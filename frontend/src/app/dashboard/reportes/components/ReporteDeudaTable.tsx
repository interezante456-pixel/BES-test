import React from 'react';

interface ReporteDeudaTableProps {
  data: any;
}

export const ReporteDeudaTable: React.FC<ReporteDeudaTableProps> = ({ data }) => (
  <div className="space-y-4">
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
      <span className="text-xs font-bold text-rose-800 uppercase">
        Total Casos Detectados con Deuda / Coactivo
      </span>
      <span className="text-xl font-black text-rose-900 font-mono">
        {data?.totalCasos || 0} caso(s)
      </span>
    </div>

    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-300 bg-gray-50 text-[11px] font-bold uppercase text-gray-600">
          <th className="py-2 px-3">Empresa</th>
          <th className="py-2 px-3">Fecha</th>
          <th className="py-2 px-3">Asunto / Resolución</th>
          <th className="py-2 px-3">Expediente</th>
          <th className="py-2 px-3 text-right">Monto Exigible</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data?.casos?.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-8 text-center text-gray-500">
              No se detectaron notificaciones con deuda coactiva exigible.
            </td>
          </tr>
        ) : (
          data?.casos?.map((c: any) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-bold">{c.empresa?.razonSocial}</td>
              <td className="py-2.5 px-3 text-gray-600 font-mono">
                {new Date(c.fechaMensaje).toLocaleDateString('es-PE')}
              </td>
              <td className="py-2.5 px-3 max-w-xs truncate font-medium">{c.asunto}</td>
              <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                {c.expedienteCoactivo || '—'}
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-black text-rose-700">
                {c.montoExigible || '—'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
