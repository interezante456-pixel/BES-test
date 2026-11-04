import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';

export const DIAS_MAP = [
  { key: 1, label: 'Lun', nombre: 'Lunes' },
  { key: 2, label: 'Mar', nombre: 'Martes' },
  { key: 3, label: 'Mié', nombre: 'Miércoles' },
  { key: 4, label: 'Jue', nombre: 'Jueves' },
  { key: 5, label: 'Vie', nombre: 'Viernes' },
  { key: 6, label: 'Sáb', nombre: 'Sábado' },
  { key: 0, label: 'Dom', nombre: 'Domingo' },
];

export function formatHora12(hora24: string): string {
  const [hh, mm] = hora24.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return hora24;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export function useScheduleConfig(isAdmin: boolean) {
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [sincroActiva, setSincroActiva] = useState(true);
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [horasProgramadas, setHorasProgramadas] = useState<string[]>([
    '06:00',
    '18:00',
  ]);
  const [nuevaHora, setNuevaHora] = useState('12:00');

  const [lastSaved, setLastSaved] = useState<{
    sincroActiva: boolean;
    dias: number[];
    horas: string[];
    updatedAt?: string;
  } | null>(null);

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const res = await api.get('/scraper/schedule');
      if (res.data) {
        const activa = res.data.sincroAutomaticaActiva ?? true;
        const dias = res.data.diasSemana || [0, 1, 2, 3, 4, 5, 6];
        const horas = res.data.horas || ['06:00', '18:00'];

        setSincroActiva(activa);
        setDiasSeleccionados(dias);
        setHorasProgramadas(horas);
        setLastSaved({
          sincroActiva: activa,
          dias: [...dias].sort((a, b) => a - b),
          horas: [...horas].sort(),
          updatedAt: res.data.updatedAt,
        });
      }
    } catch (err: any) {
      console.error('Error fetching schedule config:', err);
      setScheduleError('No se pudo cargar la configuración de programación.');
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchSchedule();
    }
  }, [isAdmin, fetchSchedule]);

  const hasUnsavedChanges = Boolean(
    lastSaved &&
      (sincroActiva !== lastSaved.sincroActiva ||
        JSON.stringify([...diasSeleccionados].sort((a, b) => a - b)) !==
          JSON.stringify(lastSaved.dias) ||
        JSON.stringify([...horasProgramadas].sort()) !==
          JSON.stringify(lastSaved.horas))
  );

  const toggleDia = (diaKey: number) => {
    if (diasSeleccionados.includes(diaKey)) {
      if (diasSeleccionados.length === 1) {
        toast.warning('Debe haber al menos un día seleccionado.', 'Horarios');
        return;
      }
      setDiasSeleccionados(diasSeleccionados.filter((d) => d !== diaKey));
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaKey].sort((a, b) => a - b));
    }
  };

  const handleAddHora = () => {
    if (!nuevaHora) return;
    if (horasProgramadas.includes(nuevaHora)) {
      toast.warning('Esta hora ya está en la lista.', 'Horarios');
      return;
    }
    const updated = [...horasProgramadas, nuevaHora].sort();
    setHorasProgramadas(updated);
  };

  const handleRemoveHora = (horaToRemove: string) => {
    if (horasProgramadas.length === 1) {
      toast.warning('Debe haber al menos un horario de ejecución programado.', 'Horarios');
      return;
    }
    setHorasProgramadas(horasProgramadas.filter((h) => h !== horaToRemove));
  };


  const handleSaveSchedule = async () => {
    if (horasProgramadas.length === 0) {
      setScheduleError('Debes configurar al menos un horario de ejecución.');
      return;
    }
    if (diasSeleccionados.length === 0) {
      setScheduleError('Debes seleccionar al menos un día de la semana.');
      return;
    }

    setSavingSchedule(true);
    setScheduleSuccess(null);
    setScheduleError(null);

    try {
      const res = await api.put('/scraper/schedule', {
        sincroAutomaticaActiva: sincroActiva,
        diasSemana: diasSeleccionados,
        horas: horasProgramadas,
      });

      if (res.data) {
        const activa = res.data.sincroAutomaticaActiva;
        const dias = res.data.diasSemana;
        const horas = res.data.horas;

        setSincroActiva(activa);
        setDiasSeleccionados(dias);
        setHorasProgramadas(horas);
        setLastSaved({
          sincroActiva: activa,
          dias: [...dias].sort((a, b) => a - b),
          horas: [...horas].sort(),
          updatedAt: new Date().toISOString(),
        });
      }

      const nombresDias = diasSeleccionados
        .map((k) => DIAS_MAP.find((d) => d.key === k)?.label)
        .filter(Boolean)
        .join(', ');

      setScheduleSuccess(
        `✓ ¡Programación guardada en el servidor! Días activos: [${nombresDias}] a las [${horasProgramadas.map(formatHora12).join(', ')}].`
      );
      setTimeout(() => setScheduleSuccess(null), 7000);
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      setScheduleError(
        err.response?.data?.message || 'Error al guardar la programación en el servidor.'
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  return {
    scheduleLoading,
    savingSchedule,
    scheduleSuccess,
    scheduleError,
    sincroActiva,
    diasSeleccionados,
    horasProgramadas,
    nuevaHora,
    lastSaved,
    hasUnsavedChanges,
    setSincroActiva,
    setDiasSeleccionados,
    setHorasProgramadas,
    setNuevaHora,
    toggleDia,
    handleAddHora,
    handleRemoveHora,
    handleSaveSchedule,
    fetchSchedule,
  };
}
