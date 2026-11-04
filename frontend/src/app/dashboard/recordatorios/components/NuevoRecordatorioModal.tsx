import React, { useState } from 'react';
import { Bell } from 'lucide-react';

interface NuevoRecordatorioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descripcion?: string;
    fechaRecordar: string;
    empresaId?: string;
  }) => Promise<void>;
  saving: boolean;
  empresas: any[];
}

export const NuevoRecordatorioModal: React.FC<NuevoRecordatorioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  saving,
  empresas,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaRecordar, setFechaRecordar] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [empresaId, setEmpresaId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaRecordar) return;
    await onSubmit({ titulo, descripcion, fechaRecordar, empresaId });
    // Reset form on success
    setTitulo('');
    setDescripcion('');
    setFechaRecordar(new Date().toISOString().split('T')[0]);
    setEmpresaId('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Nuevo Recordatorio
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recordatorio-titulo" className="text-xs font-semibold text-gray-300 block mb-1.5">
              Título del Recordatorio *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              id="recordatorio-titulo"
              placeholder="Ej: Llamar a cliente para descargo coactivo"
              className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="recordatorio-fecha" className="text-xs font-semibold text-gray-300 block mb-1.5">
                Fecha a Recordar *
              </label>
              <input
                id="recordatorio-fecha"
                type="date"
                required
                value={fechaRecordar}
                onChange={(e) => setFechaRecordar(e.target.value)}
                className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label htmlFor="recordatorio-empresa" className="text-xs font-semibold text-gray-300 block mb-1.5">
                Empresa (Opcional)
              </label>
              <select
                id="recordatorio-empresa"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">-- Sin empresa --</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.razonSocial}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="recordatorio-descripcion" className="text-xs font-semibold text-gray-300 block mb-1.5">
              Detalle Adicional
            </label>
            <textarea
              id="recordatorio-descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Notas adicionales para el seguimiento..."
              className="w-full bg-[#1e293b]/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
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
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
