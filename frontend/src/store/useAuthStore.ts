import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => Promise<void>;
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  isAuthenticated: typeof window !== 'undefined' ? !!getStoredToken() : false,
  user: getStoredUser(),

  setAuth: (token, user) => {
    // Sincronizar en ambos almacenamientos para persistencia tras F5 y compatibilidad con Axios
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, isAuthenticated: true, user });
  },

  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...partial };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: async () => {
    // Limpiar la cookie httpOnly desde el servidor
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));
