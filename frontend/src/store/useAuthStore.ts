import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Token solo en memoria — NO en localStorage (vulnerable a XSS)
  // La cookie httpOnly lo gestiona automáticamente para las peticiones al backend
  token: typeof window !== 'undefined' ? sessionStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!sessionStorage.getItem('token') : false,
  user: typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || 'null') : null,
  setAuth: (token, user) => {
    // Guardar en sessionStorage (se limpia al cerrar el tab, más seguro que localStorage)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    // Limpiar cualquier token residual en localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token, isAuthenticated: true, user });
  },
  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user });
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


