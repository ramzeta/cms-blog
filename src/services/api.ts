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
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response;
  },
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response;
  },
  update: async (id: string, userData: any) => {
    // Only send fields that are not empty
    const updateData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== '')
    );
    const response = await api.put(`/users/${id}`, updateData);
    return response;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
};

export const content = {
  getAll: async () => {
    const response = await api.get('/content');
    return response;
  },
  getById: async (id: string) => {
    const response = await api.get(`/content/${id}`);
    return response;
  },
  create: async (contentData: any) => {
    const response = await api.post('/content', contentData);
    return response;
  },
  update: async (id: string, contentData: any) => {
    const response = await api.put(`/content/${id}`, contentData);
    return response;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/content/${id}`);
    return response;
  },
};

export default api;