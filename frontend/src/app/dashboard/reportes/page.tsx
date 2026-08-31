"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  AlertTriangle,
  CircleDollarSign,
  RefreshCw,
  Download,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmpresas } from '../empresas/hooks/useEmpresas';
import { OraconLogo } from '@/components/OraconLogo';

export default function ReportesPage() {
  const { user } = useAuthStore();
  const [tipoReporte, setTipoReporte] = useState<'DEUDA' | 'VENCIMIENTOS' | 'EMPRESA'>('DEUDA');
  const [empresaId, setEmpresaId] = useState<string>('');
  const [mesStr, setMesStr] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { empresas } = useEmpresas();

  // Seleccionar primera empresa por defecto
  useEffect(() => {
    if (empresas.length > 0 && !empresaId) {
      setEmpresaId(empresas[0].id);
    }
  }, [empresas, empresaId]);

  const fetchReporte = useCallback(async () => {
    try {
      setLoading(true);
      if (tipoReporte === 'DEUDA') {
        const res = await api.get('/reportes/deuda-exigible');
        setData(res.data);
      } else if (tipoReporte === 'VENCIMIENTOS') {
        const res = await api.get('/reportes/vencimientos', { params: { dias: 30 } });
        setData(res.data);
      } else if (tipoReporte === 'EMPRESA' && empresaId) {
        const res = await api.get(`/reportes/empresa/${empresaId}/mensual`, {
          params: { mes: mesStr },
        });
        setData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte:', e);
    } finally {
      setLoading(false);
    }
  }, [tipoReporte, empresaId, mesStr]);

  useEffect(() => {
    fetchReporte();
  }, [fetchReporte]);

  const handlePrint = () => {
    window.print();
  };

  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (user && user.rol !== 'SUPER_ADMIN') {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo en Fase Beta Privada</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          El Centro de Reportes Ejecutivos está actualmente en fase de pruebas internas y está reservado exclusivamente para Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Controles superiores (se ocultan al imprimir) */}
      <div className="print:hidden space-y-6">
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
                  PDF & AUDITORÍA
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Genera informes oficiales listos para enviar a clientes o sustentar fiscalizaciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Selector de Tipo de Reporte y Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] border border-white/5 p-3 rounded-2xl">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTipoReporte('DEUDA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tipoReporte === 'DEUDA'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Deuda Coactiva Exigible
            </button>
            <button
              type="button"
              onClick={() => setTipoReporte('VENCIMIENTOS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tipoReporte === 'VENCIMIENTOS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Vencimientos (30 Días)
            </button>
            <button
              type="button"
              onClick={() => setTipoReporte('EMPRESA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tipoReporte === 'EMPRESA'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Mensual por Empresa
            </button>
          </div>

          {/* Opciones secundarias si es reporte de empresa */}
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

      {/* DOCUMENTO IMPRIMIBLE / VISTA PREVIA PROFESIONAL */}
      <div className="bg-white text-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto font-sans print:p-0 print:shadow-none print:max-w-none print:rounded-none">
        {/* Membrete Oficial */}
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <OraconLogo size="md" showSubtitle={false} />
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">
                ORACON ASESORES
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Estudio Contable & Consultoría Tributaria
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-500 font-mono">
            <div>Plataforma BES — Fiscalización 360°</div>
            <div>Emitido: {fechaGeneracion}</div>
          </div>
        </div>

        {/* Título del Reporte */}
        <div className="mb-6">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
            {tipoReporte === 'DEUDA' && 'Informe de Contingencias y Deuda Coactiva Exigible'}
            {tipoReporte === 'VENCIMIENTOS' && 'Calendario de Vencimientos Laborales y Tributarios (30 Días)'}
            {tipoReporte === 'EMPRESA' &&
              `Reporte Mensual de Notificaciones Oficiales — ${data?.periodo || mesStr}`}
          </h3>
          {tipoReporte === 'EMPRESA' && data?.empresa && (
            <div className="mt-1 text-xs font-bold text-gray-700">
              Contribuyente: {data.empresa.razonSocial} | RUC: {data.empresa.ruc}
            </div>
          )}
        </div>

        {/* Contenido según tipo de reporte */}
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
            Cargando datos del informe...
          </div>
        ) : (
          <div>
            {/* 1. CASO DEUDA */}
            {tipoReporte === 'DEUDA' && (
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
                          <td className="py-2.5 px-3 max-w-xs truncate font-medium">
                            {c.asunto}
                          </td>
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
            )}

            {/* 2. CASO VENCIMIENTOS */}
            {tipoReporte === 'VENCIMIENTOS' && (
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
                            {new Date(item.fechaLimite || item.fechaCompromiso).toLocaleDateString(
                              'es-PE',
                            )}
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
            )}

            {/* 3. CASO EMPRESA MENSUAL */}
            {tipoReporte === 'EMPRESA' && (
              <div className="space-y-4">
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
                          <td className="py-2.5 px-3 text-gray-600">
                            {n.estadoGestion || 'Sin gestión'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pie de Página Oficial Imprimible */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500">
          <div>
            Documento de control emitido por el sistema BES Platform para{' '}
            <strong>ORACON ESTUDIO CONTABLE</strong>.
          </div>
          <div>Página 1 de 1</div>
        </div>
      </div>
    </div>
  );
}
