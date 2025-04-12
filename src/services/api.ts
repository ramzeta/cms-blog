import axios from 'axios';

const api = axios.create({
  baseURL: '/',
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
    const response = await api.put(`/users/${id}`, userData);
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

export const search = {
  query: async (searchTerm: string, options: { generate?: boolean; ai?: 'ollama' | 'openai' } = {}) => {
    const params = new URLSearchParams({
      q: searchTerm,
      ...(options.generate ? { generate: 'true' } : {}),
      ...(options.ai ? { ai: options.ai } : {})
    });
    const response = await api.get(`/search?${params}`);
    return response;
  },
};

export const settings = {
  saveApiKey: async (apiKey: string) => {
    const response = await api.post('/settings/openai-key', { apiKey });
    return response;
  },
  checkApiKey: async () => {
    const response = await api.get('/settings/openai-key');
    return response;
  },
};

export const interactions = {
  getForContent: async (contentId: string) => {
    const response = await api.get(`/interactions/${contentId}`);
    return response;
  },
  recordInteraction: async (data: {
    contentId: string;
    fingerprint: string;
    action: 'view' | 'like' | 'comment';
    comment?: string;
  }) => {
    const response = await api.post('/interactions', data);
    return response;
  }
};

export default api;