"use client";

import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { OraconLogo } from '@/components/OraconLogo';
import { useReportesData } from './hooks/useReportesData';
import { ReportesHeaderBar } from './components/ReportesHeaderBar';
import { ReporteDeudaTable } from './components/ReporteDeudaTable';
import { ReporteVencimientosTable } from './components/ReporteVencimientosTable';
import { ReporteEmpresaMensual } from './components/ReporteEmpresaMensual';

export default function ReportesPage() {
  const { user } = useAuthStore();
  const {
    tipoReporte,
    setTipoReporte,
    empresaId,
    setEmpresaId,
    mesStr,
    setMesStr,
    data,
    loading,
    empresas,
  } = useReportesData();

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
      <ReportesHeaderBar
        tipoReporte={tipoReporte}
        setTipoReporte={setTipoReporte}
        empresaId={empresaId}
        setEmpresaId={setEmpresaId}
        mesStr={mesStr}
        setMesStr={setMesStr}
        empresas={empresas}
        fechaGeneracion={fechaGeneracion}
        onPrint={() => window.print()}
      />

      {/* DOCUMENTO IMPRIMIBLE / VISTA PREVIA PROFESIONAL */}
      <div className="bg-white text-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto font-sans print:p-0 print:shadow-none print:max-w-none print:rounded-none">
        {/* Membrete Oficial */}
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <OraconLogo size="md" showSubtitle={false} />
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">ORACON ASESORES</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Estudio Contable &amp; Consultoría Tributaria
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
            {tipoReporte === 'EMPRESA' && `Reporte Mensual de Notificaciones Oficiales — ${data?.periodo || mesStr}`}
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
          <>
            {tipoReporte === 'DEUDA' && <ReporteDeudaTable data={data} />}
            {tipoReporte === 'VENCIMIENTOS' && <ReporteVencimientosTable data={data} />}
            {tipoReporte === 'EMPRESA' && <ReporteEmpresaMensual data={data} mesStr={mesStr} />}
          </>
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
