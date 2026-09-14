import React from 'react';

interface ReporteVencimientosTableProps {
  data: any;
}

export const ReporteVencimientosTable: React.FC<ReporteVencimientosTableProps> = ({ data }) => (
  <div className="space-y-4">
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
      <span className="text-xs font-bold text-amber-800 uppercase">
        Vencimientos en los Próximos 30 Días
      </span>
      <span className="text-xl font-black text-amber-900 font-mono">
        {data?.totalVencimientos || 0} hito(s)
      </span>
    </div>

    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-300 bg-gray-50 text-[11px] font-bold uppercase text-gray-600">
          <th className="py-2 px-3">Fecha Límite</th>
          <th className="py-2 px-3">Entidad</th>
          <th className="py-2 px-3">Empresa</th>
          <th className="py-2 px-3">Requerimiento / Asunto</th>
          <th className="py-2 px-3">Responsable</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data?.items?.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-8 text-center text-gray-500">
              No hay vencimientos programados para los próximos 30 días.
            </td>
          </tr>
        ) : (
          data?.items?.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-mono font-black text-rose-700">
                {new Date(item.fechaLimite || item.fechaCompromiso).toLocaleDateString('es-PE')}
              </td>
              <td className="py-2.5 px-3 font-bold">{item.origen || 'SUNAFIL'}</td>
              <td className="py-2.5 px-3 font-medium">{item.empresa?.razonSocial}</td>
              <td className="py-2.5 px-3 max-w-sm truncate">{item.asunto}</td>
              <td className="py-2.5 px-3 text-gray-600">
                {item.responsable?.nombres || 'Sin asignar'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
