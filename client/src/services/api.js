import axios from "axios";
import { config } from "../config/config";

const API_BASE_URL = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${config.ENDPOINTS.AUTH.LOGIN}`, {
        email,
        password,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async ({
    name,
    email,
    password,
    store_url,
    api_key,
    webhook_secret,
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tenants/register`, {
        name,
        email,
        password,
        store_url,
        api_key,
        webhook_secret,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const dataAPI = {
  getCustomers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${config.ENDPOINTS.API.CUSTOMERS}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      return response.data?.customers ?? [];
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${config.ENDPOINTS.API.PRODUCTS}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      return response.data?.products ?? [];
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  getOrders: async (from = "", to = "") => {
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const response = await axios.get(
        `${API_BASE_URL}${config.ENDPOINTS.API.ORDERS}?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      return response.data?.orders ?? [];
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  getInsights: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${config.ENDPOINTS.API.INSIGHTS}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      const data = response.data || {};
      return {
        totalCustomers: data.total_customers ?? 0,
        totalOrders: data.total_orders ?? 0,
        totalRevenue: data.total_revenue ?? 0,
        topCustomers: Array.isArray(data.top_customers) ? data.top_customers : [],
        cartSummary: data.cart_summary || {},
        checkoutSummary: data.checkout_summary || {},
      };
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      throw error;
    }
  },
};

