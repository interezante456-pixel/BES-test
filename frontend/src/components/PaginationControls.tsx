import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  variant?: 'compact' | 'standard';
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemLabel = 'registros',
  onPageChange,
  variant = 'standard',
}) => {
  if (totalPages <= 1) return null;

  if (variant === 'compact') {
    return (
      <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <span>Página {currentPage} de {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-2 bg-[#1f2937] hover:bg-white/10 rounded-xl border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="p-2 bg-[#1f2937] hover:bg-white/10 rounded-xl border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
      <div className="text-sm text-gray-400">
        Mostrando página <span className="text-white font-medium">{currentPage}</span> de{' '}
        <span className="text-white font-medium">{totalPages}</span>
        {totalItems !== undefined && (
          <> ({totalItems} {itemLabel})</>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
