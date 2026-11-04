"use client";

import React, { useState } from 'react';
import { X, Calendar, Building2, Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/store/useToastStore';

interface NuevoEventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFecha?: string;
  empresas: any[];
  onCreated: () => void;
}

export const NuevoEventoModal: React.FC<NuevoEventoModalProps> = ({
  isOpen,
  onClose,
  initialFecha,
  empresas,
  onCreated,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(
    initialFecha || new Date().toISOString().split('T')[0],
  );
  const [empresaId, setEmpresaId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fecha) {
      toast.warning('Título y fecha son requeridos.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/estadisticas/calendario', {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha: new Date(fecha).toISOString(),
        empresaId: empresaId || undefined,
        tipo: 'MANUAL',
      });

      toast.success('Evento agregado al calendario.');
      setTitulo('');
      setDescripcion('');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            Nuevo Evento en Calendario
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="evento-titulo" className="text-xs font-semibold text-gray-300 block mb-1.5">
              Título del Evento / Compromiso *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              id="evento-titulo"
              placeholder="Ej: Presentar descargo SUNAT de Empresa ABC"
              className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="evento-fecha" className="text-xs font-semibold text-gray-300 block mb-1.5">
                Fecha *
              </label>
              <input
                id="evento-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label htmlFor="evento-empresa" className="text-xs font-semibold text-gray-300 block mb-1.5">
                Empresa (Opcional)
              </label>
              <select
                id="evento-empresa"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- General / Ninguna --</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.razonSocial}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="evento-descripcion" className="text-xs font-semibold text-gray-300 block mb-1.5">
              Detalle o Instrucciones Adicionales
            </label>
            <textarea
              id="evento-descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Notas o tareas específicas para este vencimiento..."
              className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Guardar Evento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
