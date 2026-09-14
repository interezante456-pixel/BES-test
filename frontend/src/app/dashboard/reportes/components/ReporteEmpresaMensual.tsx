import React from 'react';

interface ReporteEmpresaMensualProps {
  data: any;
  mesStr: string;
}

export const ReporteEmpresaMensual: React.FC<ReporteEmpresaMensualProps> = ({ data, mesStr }) => (
  <div className="space-y-4">
    {/* KPI Cards */}
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
        <span className="text-[11px] font-bold text-gray-500 uppercase block">
          Total Documentos Oficiales
        </span>
        <span className="text-xl font-black text-gray-900 font-mono">
          {data?.totalNotificaciones || 0}
        </span>
      </div>
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <span className="text-[11px] font-bold text-rose-700 uppercase block">
          Deuda Exigible Estimada
        </span>
        <span className="text-xl font-black text-rose-900 font-mono">
          {data?.deudaTotalEstimada || 'S/ 0.00'}
        </span>
      </div>
    </div>

    {/* Contribuyente info */}
    {data?.empresa && (
      <div className="mb-2 text-xs font-bold text-gray-700">
        Contribuyente: {data.empresa.razonSocial} | RUC: {data.empresa.ruc} | Período: {data?.periodo || mesStr}
      </div>
    )}

    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-300 bg-gray-50 text-[11px] font-bold uppercase text-gray-600">
          <th className="py-2 px-3">Fecha</th>
          <th className="py-2 px-3">Origen</th>
          <th className="py-2 px-3">Asunto</th>
          <th className="py-2 px-3">Monto / Deuda</th>
          <th className="py-2 px-3">Gestión</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data?.notificaciones?.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-8 text-center text-gray-500">
              No se registraron notificaciones para esta empresa en el período seleccionado.
            </td>
          </tr>
        ) : (
          data?.notificaciones?.map((n: any) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-mono">
                {new Date(n.fechaMensaje).toLocaleDateString('es-PE')}
              </td>
              <td className="py-2.5 px-3 font-bold">{n.origen || 'SUNAT'}</td>
              <td className="py-2.5 px-3 max-w-sm truncate">{n.asunto}</td>
              <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                {n.montoExigible || '—'}
              </td>
              <td className="py-2.5 px-3 text-gray-600">{n.estadoGestion || 'Sin gestión'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
