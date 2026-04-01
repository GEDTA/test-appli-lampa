import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5136/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injecte le token JWT dans chaque requête
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('lampadaire_auth');
    if (raw) {
      const auth = JSON.parse(raw) as { token: string };
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
  } catch {
    // pas de token, on continue sans
  }
  return config;
});

// Gestion globale des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lampadaire_auth');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);
