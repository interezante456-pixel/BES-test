import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Si se accede directamente al frontend en puerto 3500 (sin pasar por Nginx puerto 80),
    // dirigir las peticiones de API al backend en puerto 4000
    if (window.location.port === '3500') {
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Interceptor: añadir el token JWT como Bearer en cada petición al backend
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;


