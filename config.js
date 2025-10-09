// API Configuration - Using Next.js API routes
export const API_BASE_URL = "/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/admin/logout`,
  ADMIN_ME: `${API_BASE_URL}/admin/me`,
  ADMIN_CUSTOMERS: `${API_BASE_URL}/admin/customers`,
  ADMIN_COUPONS: `${API_BASE_URL}/admin/coupons`,
  ADMIN_ORDERS: `${API_BASE_URL}/admin/orders`,

  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/products`,

  // Shipping endpoints
  SHIPPING: `${API_BASE_URL}/shipping`,
  SHIPPING_ADD: `${API_BASE_URL}/shipping/add`,

  // User endpoints
  USERS_SIGNUP: `${API_BASE_URL}/users/signup`,
  USERS_LOGIN: `${API_BASE_URL}/users/login`,
  USERS_LOGOUT: `${API_BASE_URL}/users/logout`,
  USERS_ME: `${API_BASE_URL}/users/me`,
  USERS_PROFILE: `${API_BASE_URL}/users/profile`,

  // Cart endpoints
  CART_ADD: `${API_BASE_URL}/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/cart/update`,
  CART_REMOVE: `${API_BASE_URL}/cart/remove`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,

  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/contact/submit`,
};

// Helper function to get API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
