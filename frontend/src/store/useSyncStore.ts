import { create } from 'zustand';

export type SyncSource = 'SUNAT' | 'SUNAFIL';

export interface PortalSyncState {
  isSyncing: boolean;
  total: number;
  completed: number;
  successCount: number;
  errorCount: number;
  lastEmpresaName: string;
  isFinished: boolean;
  isMinimized: boolean;
}

const initialPortalState: PortalSyncState = {
  isSyncing: false,
  total: 0,
  completed: 0,
  successCount: 0,
  errorCount: 0,
  lastEmpresaName: '',
  isFinished: false,
  isMinimized: false,
};

export interface SyncState {
  // Estado por portal
  portals: Record<SyncSource, PortalSyncState>;

  // Métodos por portal
  startSync: (total: number, source?: SyncSource) => void;
  recordEmpresaSync: (empresaName: string, success: boolean, source?: SyncSource) => void;
  finishSync: (source?: SyncSource) => void;
  toggleMinimize: (source?: SyncSource) => void;
  closeWidget: (source?: SyncSource) => void;

  // Compatibilidad legacy (refleja el portal activo prioritario)
  isSyncing: boolean;
  source: SyncSource;
  total: number;
  completed: number;
  successCount: number;
  errorCount: number;
  lastEmpresaName: string;
  isFinished: boolean;
  isMinimized: boolean;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  portals: {
    SUNAT: { ...initialPortalState },
    SUNAFIL: { ...initialPortalState },
  },

  // Campos legacy
  isSyncing: false,
  source: 'SUNAT',
  total: 0,
  completed: 0,
  successCount: 0,
  errorCount: 0,
  lastEmpresaName: '',
  isFinished: false,
  isMinimized: false,

  startSync: (total: number, source: SyncSource = 'SUNAT') => {
    set((state) => {
      const updatedPortals = {
        ...state.portals,
        [source]: {
          isSyncing: true,
          total,
          completed: 0,
          successCount: 0,
          errorCount: 0,
          lastEmpresaName: 'Iniciando conexión...',
          isFinished: false,
          isMinimized: false,
        },
      };

      return {
        portals: updatedPortals,
        // Sync legacy compat
        isSyncing: true,
        source,
        total,
        completed: 0,
        successCount: 0,
        errorCount: 0,
        lastEmpresaName: 'Iniciando conexión...',
        isFinished: false,
        isMinimized: false,
      };
    });
  },

  recordEmpresaSync: (empresaName: string, success: boolean, source?: SyncSource) => {
    set((state) => {
      // Si no se especifica origen, inferir cuál está sincronizando
      let targetSource: SyncSource = source || 'SUNAT';
      if (!source) {
        if (state.portals.SUNAFIL.isSyncing && !state.portals.SUNAT.isSyncing) {
          targetSource = 'SUNAFIL';
        } else if (state.portals.SUNAT.isSyncing) {
          targetSource = 'SUNAT';
        }
      }

      const pState = state.portals[targetSource];
      const newCompleted = pState.completed + 1;
      const effectiveTotal = pState.total > 0 ? Math.max(pState.total, newCompleted) : newCompleted;
      const newSuccess = success ? pState.successCount + 1 : pState.successCount;
      const newError = !success ? pState.errorCount + 1 : pState.errorCount;
      const isFinished = newCompleted >= effectiveTotal;

      const updatedPortal: PortalSyncState = {
        ...pState,
        total: effectiveTotal,
        completed: newCompleted,
        successCount: newSuccess,
        errorCount: newError,
        lastEmpresaName: empresaName,
        isFinished,
        isSyncing: !isFinished,
      };

      const updatedPortals = {
        ...state.portals,
        [targetSource]: updatedPortal,
      };

      const anySyncing = Object.values(updatedPortals).some((p) => p.isSyncing);

      return {
        portals: updatedPortals,
        isSyncing: anySyncing,
        source: targetSource,
        total: updatedPortal.total,
        completed: updatedPortal.completed,
        successCount: updatedPortal.successCount,
        errorCount: updatedPortal.errorCount,
        lastEmpresaName: empresaName,
        isFinished,
      };
    });
  },

  finishSync: (source: SyncSource = 'SUNAT') => {
    set((state) => {
      const pState = state.portals[source];
      const updatedPortals = {
        ...state.portals,
        [source]: {
          ...pState,
          completed: pState.total > 0 ? pState.total : pState.completed,
          isFinished: true,
          isSyncing: false,
        },
      };
      const anySyncing = Object.values(updatedPortals).some((p) => p.isSyncing);
      return {
        portals: updatedPortals,
        isSyncing: anySyncing,
        isFinished: true,
      };
    });
  },

  toggleMinimize: (source?: SyncSource) => {
    set((state) => {
      if (source) {
        return {
          portals: {
            ...state.portals,
            [source]: {
              ...state.portals[source],
              isMinimized: !state.portals[source].isMinimized,
            },
          },
          isMinimized: !state.isMinimized,
        };
      }
      return { isMinimized: !state.isMinimized };
    });
  },

  closeWidget: (source?: SyncSource) => {
    set((state) => {
      if (source) {
        return {
          portals: {
            ...state.portals,
            [source]: { ...initialPortalState },
          },
          isSyncing: Object.entries(state.portals).some(([k, v]) => k !== source && v.isSyncing),
        };
      }
      return {
        portals: {
          SUNAT: { ...initialPortalState },
          SUNAFIL: { ...initialPortalState },
        },
        isSyncing: false,
        isFinished: false,
        total: 0,
        completed: 0,
        lastEmpresaName: '',
      };
    });
  },
}));
