import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transaction endpoints
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getCategories: () => api.get('/transactions/categories/list'),
};

// Upload endpoints
export const uploadAPI = {
  upload: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  preview: (formData) => api.post('/upload/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
