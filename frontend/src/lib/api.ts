import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Si se accede directamente al frontend en puerto 3500 (sin pasar por Nginx),
    // dirigir las peticiones de API al backend en puerto 4000
    if (window.location.port === '3500') {
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }
    // Si se accede a través de Nginx (puerto 8080, 80 o cualquier host/IP), usar ruta relativa
    // para que use exactamente el mismo host y puerto del navegador (ej: http://panel.oracon.com:8080 o http://192.168.1.36:8080)
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


