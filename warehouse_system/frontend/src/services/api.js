import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  me: () => api.get('/users/me/'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users/', { params }),
  getById: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  changeRole: (id, role) => api.post(`/users/${id}/change_role/`, { role }),
};

export const catalogAPI = {
  categories: {
    getAll: () => api.get('/catalog/categories/'),
    create: (data) => api.post('/catalog/categories/', data),
    update: (id, data) => api.patch(`/catalog/categories/${id}/`, data),
    delete: (id) => api.delete(`/catalog/categories/${id}/`),
  },
  units: {
    getAll: () => api.get('/catalog/units/'),
    create: (data) => api.post('/catalog/units/', data),
    update: (id, data) => api.patch(`/catalog/units/${id}/`, data),
    delete: (id) => api.delete(`/catalog/units/${id}/`),
  },
  products: {
    getAll: (params) => api.get('/catalog/products/', { params }),
    getById: (id) => api.get(`/catalog/products/${id}/`),
    create: (data) => api.post('/catalog/products/', data),
    update: (id, data) => api.patch(`/catalog/products/${id}/`, data),
    delete: (id) => api.delete(`/catalog/products/${id}/`),
  },
};

export const warehouseAPI = {
  warehouses: {
    getAll: () => api.get('/warehouse/warehouses/'),
    create: (data) => api.post('/warehouse/warehouses/', data),
    update: (id, data) => api.patch(`/warehouse/warehouses/${id}/`, data),
    delete: (id) => api.delete(`/warehouse/warehouses/${id}/`),
  },
  counterparties: {
    getAll: (params) => api.get('/warehouse/counterparties/', { params }),
    create: (data) => api.post('/warehouse/counterparties/', data),
    update: (id, data) => api.patch(`/warehouse/counterparties/${id}/`, data),
    delete: (id) => api.delete(`/warehouse/counterparties/${id}/`),
  },
  movementTypes: {
    getAll: () => api.get('/warehouse/movement-types/'),
  },
  stocks: {
    getAll: (params) => api.get('/warehouse/stocks/', { params }),
  },
  movements: {
    getAll: (params) => api.get('/warehouse/movements/', { params }),
    getById: (id) => api.get(`/warehouse/movements/${id}/`),
    create: (data) => api.post('/warehouse/movements/', data),
    update: (id, data) => api.patch(`/warehouse/movements/${id}/`, data),
    approve: (id) => api.post(`/warehouse/movements/${id}/approve/`),
    cancel: (id) => api.post(`/warehouse/movements/${id}/cancel/`),
  },
};

export const auditAPI = {
  logs: {
    getAll: (params) => api.get('/audit/logs/', { params }),
  },
  notifications: {
    getAll: () => api.get('/audit/notifications/'),
    unreadCount: () => api.get('/audit/notifications/unread_count/'),
    markRead: (id) => api.post(`/audit/notifications/${id}/mark_read/`),
    markAllRead: () => api.post('/audit/notifications/mark_all_read/'),
  },
};

export default api;