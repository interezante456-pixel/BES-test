"use client";

import React from 'react';
import { Tag, Plus, X } from 'lucide-react';

interface NotifEtiquetasManagerProps {
  notificacionId: string;
  etiquetasDisponibles: any[];
  etiquetasAsignadas: any[];
  isCrearEtiquetaOpen: boolean;
  setIsCrearEtiquetaOpen: (v: boolean) => void;
  nuevaEtiquetaNombre: string;
  setNuevaEtiquetaNombre: (v: string) => void;
  nuevaEtiquetaColor: string;
  setNuevaEtiquetaColor: (v: string) => void;
  onAsignar: (etiquetaId: string) => void;
  onDesasignar: (etiquetaId: string) => void;
  onCrear: (e: React.FormEvent) => void;
}

export const NotifEtiquetasManager: React.FC<NotifEtiquetasManagerProps> = ({
  etiquetasDisponibles, etiquetasAsignadas,
  isCrearEtiquetaOpen, setIsCrearEtiquetaOpen,
  nuevaEtiquetaNombre, setNuevaEtiquetaNombre,
  nuevaEtiquetaColor, setNuevaEtiquetaColor,
  onAsignar, onDesasignar, onCrear,
}) => {
  const disponiblesNoAsignadas = etiquetasDisponibles.filter(
    (ed) => !etiquetasAsignadas.some((ea) => ea.id === ed.id),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-orange-400" /> Etiquetas del Caso
        </label>
        <button type="button" onClick={() => setIsCrearEtiquetaOpen(!isCrearEtiquetaOpen)}
          className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer">
          <Plus className="w-3 h-3" /> Nueva
        </button>
      </div>

      {isCrearEtiquetaOpen && (
        <form onSubmit={onCrear} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
          <input type="text" placeholder="Nombre etiqueta (ej: FISCALIZACION_2026)"
            value={nuevaEtiquetaNombre} onChange={(e) => setNuevaEtiquetaNombre(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none" />
          <input type="color" value={nuevaEtiquetaColor} onChange={(e) => setNuevaEtiquetaColor(e.target.value)}
            className="w-6 h-6 rounded border-none bg-transparent cursor-pointer" title="Elegir color" />
          <button type="submit" className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold">Crear</button>
        </form>
      )}

      <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
        {etiquetasAsignadas.map((et) => (
          <span key={et.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: `${et.color}30`, borderColor: `${et.color}60`, borderWidth: 1 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: et.color }} />
            {et.nombre}
            <button type="button" onClick={() => onDesasignar(et.id)} className="hover:opacity-75 cursor-pointer ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {disponiblesNoAsignadas.length > 0 && (
          <select onChange={(e) => { if (e.target.value) { onAsignar(e.target.value); e.target.value = ''; } }}
            defaultValue="" className="bg-white/5 border border-white/10 text-gray-400 text-[11px] rounded-lg px-2 py-1 focus:outline-none">
            <option value="" disabled>+ Agregar existente...</option>
            {disponiblesNoAsignadas.map((ed) => (<option key={ed.id} value={ed.id}>{ed.nombre}</option>))}
          </select>
        )}
      </div>
    </div>
  );
};
