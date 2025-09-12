export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Xeno Dashboard",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/tenants/login",
    },
    API: {
      CUSTOMERS: "/api/customers",
      PRODUCTS: "/api/products",
      ORDERS: "/api/orders",
      INSIGHTS: "/api/insights",
    },
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: "16rem",
    HEADER_HEIGHT: "4rem",
    ANIMATION_DURATION: 200,
  },
};

export default config;
