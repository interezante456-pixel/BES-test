import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Detectar si es una IP de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const isLocalNetwork =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname);

    if (isLocalNetwork) {
      // Si se accede a través del reverse proxy Nginx (puerto 8080 o 80), usar rutas relativas
      if (port === '8080' || port === '80' || port === '') {
        return '';
      }
      // Si se accede directo al frontend (puerto 3500, 3000, etc.), llamar al backend en puerto 4000
      return `${window.location.protocol}//${hostname}:4000`;
    }

    // En producción (ej: panel.oracon.com) - usar rutas relativas ya que nginx hace el proxy
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


