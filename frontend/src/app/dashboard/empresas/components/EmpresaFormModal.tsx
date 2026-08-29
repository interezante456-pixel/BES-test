import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2 } from 'lucide-react';
import { toast } from '@/store/useToastStore';

interface EmpresaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string | null, data: any) => Promise<void>;
  initialData?: any;
  defaultEntidad?: 'SUNAT' | 'SUNAFIL';
}

export const EmpresaFormModal: React.FC<EmpresaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultEntidad,
}) => {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [usuarioSol, setUsuarioSol] = useState('');
  const [claveSol, setClaveSol] = useState('');
  const [habilitadoSunat, setHabilitadoSunat] = useState(true);
  const [habilitadoSunafil, setHabilitadoSunafil] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRuc(initialData.ruc || '');
      setRazonSocial(initialData.razonSocial || '');
      setUsuarioSol(initialData.usuarioSol || '');
      setClaveSol('');
      setHabilitadoSunat(initialData.habilitadoSunat ?? true);
      setHabilitadoSunafil(initialData.habilitadoSunafil ?? false);
    } else {
      setRuc('');
      setRazonSocial('');
      setUsuarioSol('');
      setClaveSol('');
      setHabilitadoSunat(defaultEntidad === 'SUNAFIL' ? false : true);
      setHabilitadoSunafil(defaultEntidad === 'SUNAFIL' ? true : false);
    }
  }, [initialData, isOpen, defaultEntidad]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(initialData ? initialData.id : null, {
        ruc,
        razonSocial,
        usuarioSol,
        habilitadoSunat,
        habilitadoSunafil,
        ...(claveSol ? { claveSol } : {})
      });
      toast.success(initialData ? 'Empresa actualizada correctamente' : 'Empresa registrada con éxito');
      setRuc('');
      setRazonSocial('');
      setUsuarioSol('');
      setClaveSol('');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al guardar la empresa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white">{initialData ? 'Editar Empresa' : 'Vincular Nueva Empresa'}</h3>
          <p className="text-xs text-gray-400 mt-1">Configura las credenciales y entidades donde estará activa la empresa</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">RUC</label>
            <input 
              type="text" required maxLength={11} value={ruc} onChange={(e) => setRuc(e.target.value)}
              className="w-full bg-[#1f2937]/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
              placeholder="206..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">Razón Social</label>
            <input 
              type="text" required value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)}
              className="w-full bg-[#1f2937]/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="Nombre comercial o razón social"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Usuario SOL</label>
              <input 
                type="text" required value={usuarioSol} onChange={(e) => setUsuarioSol(e.target.value)}
                className="w-full bg-[#1f2937]/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                placeholder="MODDATOS"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Clave SOL</label>
              <input 
                type="password" required={!initialData} value={claveSol} onChange={(e) => setClaveSol(e.target.value)}
                className="w-full bg-[#1f2937]/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                placeholder={initialData ? "•••••••• (Sin cambios)" : "Clave SOL"}
              />
            </div>
          </div>

          {/* Entidades Habilitadas */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Entidades de Monitoreo Habilitadas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                habilitadoSunat
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}>
                <input
                  type="checkbox"
                  checked={habilitadoSunat}
                  onChange={(e) => setHabilitadoSunat(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-gray-900 border-gray-700"
                />
                <div>
                  <p className="text-xs font-bold text-white">🔴 SUNAT</p>
                  <p className="text-[10px] text-gray-400">Buzón SOL</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                habilitadoSunafil
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}>
                <input
                  type="checkbox"
                  checked={habilitadoSunafil}
                  onChange={(e) => setHabilitadoSunafil(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 bg-gray-900 border-gray-700"
                />
                <div>
                  <p className="text-xs font-bold text-white">🔵 SUNAFIL</p>
                  <p className="text-[10px] text-gray-400">Casilla Electrónica</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-400 hover:text-white transition-colors text-sm font-semibold">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all text-sm">
              {initialData ? 'Guardar Cambios' : 'Vincular Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
