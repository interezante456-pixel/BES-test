import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';
import { DIAS_MAP, formatHora12 } from './useScheduleConfig';

export function useSunafilScheduleConfig(isAdmin: boolean) {
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [sincroActiva, setSincroActiva] = useState(true);
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([1, 2, 3, 4, 5]);
  const [horasProgramadas, setHorasProgramadas] = useState<string[]>(['07:00']);
  const [nuevaHora, setNuevaHora] = useState('07:00');
  const [soloActivas, setSoloActivas] = useState(true);

  const [lastSaved, setLastSaved] = useState<{
    sincroActiva: boolean;
    dias: number[];
    horas: string[];
    soloActivas: boolean;
    updatedAt?: string;
  } | null>(null);

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const res = await api.get('/scraper/sunafil-schedule');
      if (res.data) {
        const activa = res.data.sincroAutomaticaActiva ?? true;
        const dias = res.data.diasSemana || [1, 2, 3, 4, 5];
        const horas = res.data.horas || ['07:00'];
        const solo = res.data.soloActivas ?? true;
        setSincroActiva(activa);
        setDiasSeleccionados(dias);
        setHorasProgramadas(horas);
        setSoloActivas(solo);
        setLastSaved({ sincroActiva: activa, dias: [...dias].sort((a,b)=>a-b), horas: [...horas].sort(), soloActivas: solo, updatedAt: res.data.updatedAt });
      }
    } catch (err: any) {
      setScheduleError('No se pudo cargar la configuracion SUNAFIL.');
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchSchedule(); }, [isAdmin, fetchSchedule]);

  const hasUnsavedChanges = Boolean(
    lastSaved && (
      sincroActiva !== lastSaved.sincroActiva ||
      soloActivas !== lastSaved.soloActivas ||
      JSON.stringify([...diasSeleccionados].sort((a,b)=>a-b)) !== JSON.stringify(lastSaved.dias) ||
      JSON.stringify([...horasProgramadas].sort()) !== JSON.stringify(lastSaved.horas)
    )
  );

  const toggleDia = (diaKey: number) => {
    if (diasSeleccionados.includes(diaKey)) {
      if (diasSeleccionados.length === 1) { toast.warning('Debe haber al menos un dia seleccionado.', 'Horarios SUNAFIL'); return; }
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== diaKey));
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaKey].sort((a,b)=>a-b));
    }
  };

  const handleAddHora = () => {
    if (!nuevaHora) return;
    if (horasProgramadas.includes(nuevaHora)) { toast.warning('Esta hora ya esta en la lista.', 'Horarios SUNAFIL'); return; }
    setHorasProgramadas([...horasProgramadas, nuevaHora].sort());
  };

  const handleRemoveHora = (h: string) => {
    if (horasProgramadas.length === 1) { toast.warning('Debe haber al menos un horario programado.', 'Horarios SUNAFIL'); return; }
    setHorasProgramadas(horasProgramadas.filter(x => x !== h));
  };

  const handleSaveSchedule = async () => {
    if (!horasProgramadas.length || !diasSeleccionados.length) { setScheduleError('Debes configurar dias y horarios.'); return; }
    setSavingSchedule(true); setScheduleSuccess(null); setScheduleError(null);
    try {
      const res = await api.put('/scraper/sunafil-schedule', { sincroAutomaticaActiva: sincroActiva, diasSemana: diasSeleccionados, horas: horasProgramadas, soloActivas });
      if (res.data) {
        const { sincroAutomaticaActiva: activa, diasSemana: dias, horas, soloActivas: solo } = res.data;
        setSincroActiva(activa); setDiasSeleccionados(dias); setHorasProgramadas(horas); setSoloActivas(solo);
        setLastSaved({ sincroActiva: activa, dias: [...dias].sort((a,b)=>a-b), horas: [...horas].sort(), soloActivas: solo, updatedAt: new Date().toISOString() });
      }
      const nombresDias = diasSeleccionados.map(k => DIAS_MAP.find(d => d.key === k)?.label).filter(Boolean).join(', ');
      setScheduleSuccess(`Programacion SUNAFIL guardada. Dias: [${nombresDias}] a las [${horasProgramadas.map(formatHora12).join(', ')}]. ${soloActivas ? 'Solo activas.' : 'Re-escaneo completo.'}`);
      setTimeout(() => setScheduleSuccess(null), 7000);
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Error al guardar la programacion SUNAFIL.');
    } finally {
      setSavingSchedule(false);
    }
  };

  return { scheduleLoading, savingSchedule, scheduleSuccess, scheduleError, sincroActiva, diasSeleccionados, horasProgramadas, nuevaHora, soloActivas, lastSaved, hasUnsavedChanges, setSincroActiva, setDiasSeleccionados, setHorasProgramadas, setNuevaHora, setSoloActivas, toggleDia, handleAddHora, handleRemoveHora, handleSaveSchedule, fetchSchedule };
}
