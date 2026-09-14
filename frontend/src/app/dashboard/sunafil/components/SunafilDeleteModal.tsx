import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface SunafilDeleteModalProps {
  state: {
    open: boolean;
    type: 'single' | 'selected' | 'all';
    targetId?: string;
  };
  selectedCount: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const SunafilDeleteModal: React.FC<SunafilDeleteModalProps> = ({
  state,
  selectedCount,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!state.open) return null;

  const getMessage = () => {
    if (state.type === 'single') return 'Esta notificación será eliminada definitivamente de la base de datos.';
    if (state.type === 'selected') return `Se eliminarán permanentemente las ${selectedCount} notificaciones seleccionadas.`;
    return 'Se eliminarán todas las notificaciones registradas de las empresas.';
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">¿Confirmar eliminación?</h3>
            <p className="text-xs text-gray-400">{getMessage()}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
