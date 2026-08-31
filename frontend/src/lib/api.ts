import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Si se navega en local (localhost o 127.0.0.1)
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      // Si se accede a través del reverse proxy Nginx (puerto 8080 o 80), usar rutas relativas
      if (window.location.port === '8080' || window.location.port === '80') {
        return '';
      }
      // Si se accede directo al frontend (puerto 3500, 3000, etc.), llamar al backend en puerto 4000
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }

    // En producción (ej: panel.oracon.com)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
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


