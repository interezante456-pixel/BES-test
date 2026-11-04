"use client";

import React from 'react';
import {
  CheckCircle2, Clock, AlertCircle, Archive, User, Calendar, Save, Loader2,
} from 'lucide-react';

export const ESTADOS_GESTION = [
  { value: 'EN_REVISION', label: 'En Revisión', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
  { value: 'REQUIERE_ACCION', label: 'Requiere Acción', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: AlertCircle },
  { value: 'RESPONDIDO', label: 'Respondido', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  { value: 'ARCHIVADO', label: 'Archivado', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30', icon: Archive },
];

interface NotifEstadoFormProps {
  notificacion: any;
  estadoGestion: string;
  setEstadoGestion: (v: string) => void;
  responsableId: string;
  setResponsableId: (v: string) => void;
  fechaCompromiso: string;
  setFechaCompromiso: (v: string) => void;
  notasInternas: string;
  setNotasInternas: (v: string) => void;
  usuarios: any[];
  isAdmin: boolean;
  saving: boolean;
  onSave: () => void;
  etiquetasSlot?: React.ReactNode;
}

export const NotifEstadoForm: React.FC<NotifEstadoFormProps> = ({
  notificacion, estadoGestion, setEstadoGestion, responsableId, setResponsableId,
  fechaCompromiso, setFechaCompromiso, notasInternas, setNotasInternas,
  usuarios, isAdmin, saving, onSave, etiquetasSlot,
}) => (
  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Flujo de Trabajo y Gestión
      </h4>
      {notificacion?.responsableNombre && (
        <span className="text-[11px] font-semibold text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
          <User className="w-3 h-3 text-orange-400" /> {notificacion.responsableNombre}
        </span>
      )}
    </div>

    {/* Selector de Estado */}
    <div>
      <span className="text-xs font-semibold text-gray-300 block mb-2">Estado de Gestión</span>
      <div className="grid grid-cols-2 gap-2">
        {ESTADOS_GESTION.map((est) => {
          const Icon = est.icon;
          const isSelected = estadoGestion === est.value;
          return (
            <button key={est.value} type="button" onClick={() => setEstadoGestion(est.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected ? est.color + ' ring-1 ring-white/20' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" /><span>{est.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Responsable y Fecha */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div>
        <label className="text-[11px] font-semibold text-gray-400 block mb-1 flex items-center gap-1.5">
          <User className="w-3 h-3 text-orange-400" /> Responsable
        </label>
        {isAdmin ? (
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500">
            <option value="">-- Sin asignar --</option>
            {usuarios.map((u) => (<option key={u.id} value={u.id}>{u.nombres} {u.apellidos} ({u.rol})</option>))}
          </select>
        ) : (
          <div className="text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
            {notificacion?.responsableNombre || 'Sin asignar'}
          </div>
        )}
      </div>
      <div>
        <label className="text-[11px] font-semibold text-gray-400 block mb-1 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-indigo-400" /> Fecha Límite Atención
        </label>
        <input type="date" value={fechaCompromiso} onChange={(e) => setFechaCompromiso(e.target.value)}
          className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]" />
      </div>
    </div>

    {/* Slot para etiquetas */}
    {etiquetasSlot}

    {/* Notas */}
    <div>
      <label htmlFor="notif-notas-internas" className="text-[11px] font-semibold text-gray-400 block mb-1">Instrucciones o Notas del Caso</label>
      <textarea id="notif-notas-internas" rows={2} value={notasInternas} onChange={(e) => setNotasInternas(e.target.value)}
        placeholder="Ej: Se coordinó con el cliente, el contador preparará el descargo para presentar el viernes..."
        className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none" />
    </div>

    <div className="flex justify-end pt-1">
      <button type="button" onClick={onSave} disabled={saving}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        <span>Guardar Cambios</span>
      </button>
    </div>
  </div>
);
