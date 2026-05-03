import axios from 'axios';

const isProd = import.meta.env.PROD;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProd ? 'https://task-management-y37e.onrender.com/api' : 'http://localhost:5000/api'),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
