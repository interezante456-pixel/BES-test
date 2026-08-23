import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Si se accede a través de Nginx en Docker (puerto 8080 o producción), usar ruta relativa
    if (window.location.port === '8080' || window.location.port === '80') {
      return '';
    }
    // En desarrollo local (puerto 3000, 3001, 3500, etc.), dirigir al backend en puerto 4000
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3500'
    ) {
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }
    return '';
  }
  return process.env.INTERNAL_API_URL || 'http://backend:3000';
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


