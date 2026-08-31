"use client";

import React from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface DiaEventosModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaStr: string;
  eventos: any[];
  onSelectNotificacion: (notif: any) => void;
  onDeleteEventoManual?: (id: string) => void;
  onAgregarEventoDia: (diaStr: string) => void;
}

export const DiaEventosModal: React.FC<DiaEventosModalProps> = ({
  isOpen,
  onClose,
  diaStr,
  eventos,
  onSelectNotificacion,
  onDeleteEventoManual,
  onAgregarEventoDia,
}) => {
  if (!isOpen) return null;

  const fechaFormateada = new Date(diaStr + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white capitalize flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              {fechaFormateada}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {eventos.length} evento(s) programado(s) para este día
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Eventos */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1 space-y-3">
          {eventos.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              No hay vencimientos ni eventos registrados en esta fecha.
            </div>
          ) : (
            eventos.map((ev) => (
              <div
                key={ev.id}
                className="pt-3 first:pt-0 flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ev.tipo === 'SUNAFIL_VENCIMIENTO'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : ev.tipo === 'COMPROMISO_EQUIPO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {ev.tipo === 'SUNAFIL_VENCIMIENTO'
                        ? 'Vencimiento SUNAFIL'
                        : ev.tipo === 'COMPROMISO_EQUIPO'
                        ? 'Compromiso Equipo'
                        : 'Nota / Recordatorio'}
                    </span>
                    {ev.empresa && (
                      <span className="text-xs font-bold text-orange-400 truncate">
                        {ev.empresa.razonSocial}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-white">
                    {ev.titulo}
                  </div>

                  {ev.descripcion && (
                    <div className="text-[11px] text-gray-400 line-clamp-2">
                      {ev.descripcion}
                    </div>
                  )}

                  {ev.notasInternas && (
                    <div className="text-[11px] text-amber-300/80 italic">
                      Nota interna: "{ev.notasInternas}"
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1 pt-1">
                  {ev.notificacionId && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectNotificacion({
                          id: ev.notificacionId,
                          asunto: ev.descripcion,
                          origen: ev.origen,
                          empresa: ev.empresa,
                        });
                      }}
                      className="p-1.5 bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 rounded-lg text-xs font-bold transition-all"
                      title="Ver Notificación"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {ev.esManual && onDeleteEventoManual && (
                    <button
                      type="button"
                      onClick={() => onDeleteEventoManual(ev.id)}
                      className="p-1.5 bg-white/5 hover:bg-rose-600/30 text-rose-400 rounded-lg text-xs transition-all"
                      title="Eliminar Evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onAgregarEventoDia(diaStr);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar evento a este día</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
