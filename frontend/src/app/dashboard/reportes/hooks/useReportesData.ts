"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useEmpresas } from '../../empresas/hooks/useEmpresas';

export type TipoReporte = 'DEUDA' | 'VENCIMIENTOS' | 'EMPRESA';

export function useReportesData() {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('DEUDA');
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

  return {
    tipoReporte,
    setTipoReporte,
    empresaId,
    setEmpresaId,
    mesStr,
    setMesStr,
    data,
    loading,
    empresas,
  };
}
