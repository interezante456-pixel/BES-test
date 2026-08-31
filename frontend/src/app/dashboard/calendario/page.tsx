"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmpresas } from '../empresas/hooks/useEmpresas';
import { toast } from '@/store/useToastStore';
import { CalendarioGrid } from './components/CalendarioGrid';
import { DiaEventosModal } from './components/DiaEventosModal';
import { NuevoEventoModal } from './components/NuevoEventoModal';
import { PdfViewerDrawer } from '../components/PdfViewerDrawer';
import { SunafilDetailDrawer } from '../sunafil/components/SunafilDetailDrawer';

export default function CalendarioPage() {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [selectedDia, setSelectedDia] = useState<{
    open: boolean;
    diaStr: string;
    eventos: any[];
  }>({ open: false, diaStr: '', eventos: [] });

  const [isNuevoEventoOpen, setIsNuevoEventoOpen] = useState(false);
  const [nuevoEventoFecha, setNuevoEventoFecha] = useState<string | undefined>(
    undefined,
  );

  // Drawer de notificación seleccionada
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const { empresas } = useEmpresas();

  const fetchCalendario = useCallback(async () => {
    try {
      setLoading(true);
      const mesStr = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1,
      ).padStart(2, '0')}`;
      const res = await api.get('/estadisticas/calendario', {
        params: { mes: mesStr },
      });
      setEventos(res.data.eventos || []);
    } catch (e) {
      console.error('Error cargando calendario:', e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendario();
  }, [fetchCalendario]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDeleteEventoManual = async (id: string) => {
    try {
      await api.delete(`/estadisticas/calendario/${id}`);
      toast.success('Evento eliminado del calendario.');
      fetchCalendario();
      setSelectedDia((prev) => ({
        ...prev,
        eventos: prev.eventos.filter((e) => e.id !== id),
      }));
    } catch {
      toast.error('Error al eliminar evento.');
    }
  };

  if (user && user.rol !== 'SUPER_ADMIN') {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo en Fase Beta Privada</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          El Calendario de Vencimientos se encuentra actualmente en fase de pruebas y está restringido para Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Calendario de Vencimientos y Compromisos
              </h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                AGENDA 360°
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Visualización consolidada de plazos legales de SUNAFIL, vencimientos SUNAT y compromisos del equipo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchCalendario}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Cuadrícula de Calendario */}
      <CalendarioGrid
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        eventos={eventos}
        onSelectDia={(diaStr, evs) =>
          setSelectedDia({ open: true, diaStr, eventos: evs })
        }
        onNuevoEvento={() => {
          setNuevoEventoFecha(undefined);
          setIsNuevoEventoOpen(true);
        }}
        loading={loading}
      />

      {/* Modal Detalle de Día */}
      <DiaEventosModal
        isOpen={selectedDia.open}
        onClose={() =>
          setSelectedDia({ open: false, diaStr: '', eventos: [] })
        }
        diaStr={selectedDia.diaStr}
        eventos={selectedDia.eventos}
        onSelectNotificacion={(notif) => setSelectedNotif(notif)}
        onDeleteEventoManual={handleDeleteEventoManual}
        onAgregarEventoDia={(diaStr) => {
          setNuevoEventoFecha(diaStr);
          setIsNuevoEventoOpen(true);
        }}
      />

      {/* Modal Nuevo Evento */}
      <NuevoEventoModal
        isOpen={isNuevoEventoOpen}
        onClose={() => setIsNuevoEventoOpen(false)}
        initialFecha={nuevoEventoFecha}
        empresas={empresas}
        onCreated={() => fetchCalendario()}
      />

      {/* Drawers */}
      {selectedNotif && selectedNotif.origen === 'SUNAFIL' ? (
        <SunafilDetailDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchCalendario()}
        />
      ) : (
        <PdfViewerDrawer
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          notificacion={selectedNotif}
          onNotificacionUpdated={() => fetchCalendario()}
        />
      )}
    </div>
  );
}
