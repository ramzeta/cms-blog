import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const content = {
  getAll: async () => {
    const response = await api.get('/content');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },
  create: async (contentData: any) => {
    const response = await api.post('/content', contentData);
    return response.data;
  },
  update: async (id: string, contentData: any) => {
    const response = await api.put(`/content/${id}`, contentData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
};

export default api;