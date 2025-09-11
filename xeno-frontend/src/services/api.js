import axios from 'axios';
import { config } from '../config/config';

const API_BASE_URL = config.API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isAuthEndpoint = (url = '') => {
  try {
    const u = typeof url === 'string' ? url : url?.url || '';
    return u.includes('/tenants/login') || u.includes('/tenants/register');
  } catch {
    return false;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (requestConfig) => {
    if (!isAuthEndpoint(requestConfig.url)) {
      const token = localStorage.getItem('token');
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    if (status === 401 && !isAuthEndpoint(url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return; // stop further handling
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post(config.ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  },
  register: async ({ name, email, password, store_url, api_key }) => {
    const response = await api.post('/tenants/register', { name, email, password, store_url, api_key });
    return response.data;
  },
};

// Data API
export const dataAPI = {
  // Customers
  getCustomers: async () => {
    const response = await api.get(config.ENDPOINTS.API.CUSTOMERS);
    // Backend returns: { customers: rows }
    return response.data?.customers ?? [];
  },

  // Products
  getProducts: async () => {
    const response = await api.get(config.ENDPOINTS.API.PRODUCTS);
    // Backend returns: { products: rows }
    return response.data?.products ?? [];
  },

  // Orders
  getOrders: async (from = '', to = '') => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get(`${config.ENDPOINTS.API.ORDERS}?${params.toString()}`);
    // Backend returns: { orders: rows }
    return response.data?.orders ?? [];
  },

  // Insights
  getInsights: async () => {
    const response = await api.get(config.ENDPOINTS.API.INSIGHTS);
    const data = response.data || {};
    // Map snake_case from backend to camelCase for frontend
    return {
      totalCustomers: data.total_customers ?? 0,
      totalOrders: data.total_orders ?? 0,
      totalRevenue: data.total_revenue ?? 0,
      topCustomers: Array.isArray(data.top_customers) ? data.top_customers : [],
    };
  },
};

export default api;