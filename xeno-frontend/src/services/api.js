import axios from "axios";
import { config } from "../config/config";

const API_BASE_URL = config.API_BASE_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthEndpoint = (url = "") => {
  try {
    const u = typeof url === "string" ? url : url?.url || "";
    return u.includes("/tenants/login") || u.includes("/tenants/register");
  } catch {
    return false;
  }
};


api.interceptors.request.use(
  (requestConfig) => {
    if (!isAuthEndpoint(requestConfig.url)) {
      const token = localStorage.getItem("token");
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    if (status === 401 && !isAuthEndpoint(url)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: async (email, password) => {
    const response = await api.post(config.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },
  register: async ({
    name,
    email,
    password,
    store_url,
    api_key,
    webhook_secret,
  }) => {
    const response = await api.post("/tenants/register", {
      name,
      email,
      password,
      store_url,
      api_key,
      webhook_secret,
    });
    return response.data;
  },
};


export const dataAPI = {
  getCustomers: async () => {
    const response = await api.get(config.ENDPOINTS.API.CUSTOMERS);
    return response.data?.customers ?? [];
  },


  getProducts: async () => {
    const response = await api.get(config.ENDPOINTS.API.PRODUCTS);
    return response.data?.products ?? [];
  },

  
  getOrders: async (from = "", to = "") => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await api.get(
      `${config.ENDPOINTS.API.ORDERS}?${params.toString()}`
    );
    
    return response.data?.orders ?? [];
  },

 
  getInsights: async () => {
    const response = await api.get(config.ENDPOINTS.API.INSIGHTS);
    const data = response.data || {};
    return {
      totalCustomers: data.total_customers ?? 0,
      totalOrders: data.total_orders ?? 0,
      totalRevenue: data.total_revenue ?? 0,
      topCustomers: Array.isArray(data.top_customers) ? data.top_customers : [],
      cartSummary: data.cart_summary || {}, 
      checkoutSummary: data.checkout_summary || {}, 
    };
  },
};

export default api;
