import { create } from 'zustand';

export interface SyncState {
  isSyncing: boolean;
  source: 'SUNAT' | 'SUNAFIL';
  total: number;
  completed: number;
  successCount: number;
  errorCount: number;
  lastEmpresaName: string;
  isFinished: boolean;
  isMinimized: boolean;
  startSync: (total: number, source?: 'SUNAT' | 'SUNAFIL') => void;
  recordEmpresaSync: (empresaName: string, success: boolean) => void;
  finishSync: () => void;
  toggleMinimize: () => void;
  closeWidget: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  source: 'SUNAT',
  total: 0,
  completed: 0,
  successCount: 0,
  errorCount: 0,
  lastEmpresaName: '',
  isFinished: false,
  isMinimized: false,

  startSync: (total: number, source = 'SUNAT') => {
    set({
      isSyncing: true,
      source,
      total,
      completed: 0,
      successCount: 0,
      errorCount: 0,
      lastEmpresaName: 'Iniciando conexión...',
      isFinished: false,
      isMinimized: false,
    });
  },

  recordEmpresaSync: (empresaName: string, success: boolean) => {
    const { completed, total, successCount, errorCount } = get();
    const newCompleted = completed + 1;
    const effectiveTotal = total > 0 ? Math.max(total, newCompleted) : newCompleted;
    const newSuccess = success ? successCount + 1 : successCount;
    const newError = !success ? errorCount + 1 : errorCount;
    const isFinished = newCompleted >= effectiveTotal;

    set({
      total: effectiveTotal,
      completed: newCompleted,
      successCount: newSuccess,
      errorCount: newError,
      lastEmpresaName: empresaName,
      isFinished,
      isSyncing: !isFinished,
    });
  },


  finishSync: () => {
    set((state) => ({
      completed: state.total > 0 ? state.total : state.completed,
      isFinished: true,
      isSyncing: false,
    }));
  },

  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),

  closeWidget: () =>
    set({
      isSyncing: false,
      isFinished: false,
      total: 0,
      completed: 0,
      lastEmpresaName: '',
    }),
}));
