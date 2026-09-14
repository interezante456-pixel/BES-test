import { create } from 'zustand';
import api from '@/lib/api';

interface NotificationState {
  sinLeer: number;
  sinLeerSunafil: number;
  fetchStats: () => Promise<void>;
  decrementSinLeer: (origen?: 'SUNAT' | 'SUNAFIL') => void;
  setSinLeer: (count: number, origen?: 'SUNAT' | 'SUNAFIL') => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  sinLeer: 0,
  sinLeerSunafil: 0,
  fetchStats: async () => {
    try {
      const res = await api.get('/estadisticas');
      set({
        sinLeer: res.data?.sinLeerSunat ?? res.data?.sinLeer ?? 0,
        sinLeerSunafil: res.data?.sinLeerSunafil ?? 0,
      });
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  },
  decrementSinLeer: (origen = 'SUNAT') =>
    set((state) =>
      origen === 'SUNAFIL'
        ? { sinLeerSunafil: Math.max(0, state.sinLeerSunafil - 1) }
        : { sinLeer: Math.max(0, state.sinLeer - 1) },
    ),
  setSinLeer: (count, origen = 'SUNAT') =>
    set(origen === 'SUNAFIL' ? { sinLeerSunafil: count } : { sinLeer: count }),
}));
