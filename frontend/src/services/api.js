const API_BASE = '/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const userInfo = localStorage.getItem('aura_user');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    } catch (e) {
      console.error('Error reading stored token', e);
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = (data && data.message) || res.statusText || 'An error occurred';
    throw new Error(error);
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfile: (data) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        query.append(key, params[key]);
      }
    });
    return fetch(`${API_BASE}/products?${query.toString()}`).then(handleResponse);
  },

  getProductById: (id) =>
    fetch(`${API_BASE}/products/${id}`).then(handleResponse),

  getCategories: () =>
    fetch(`${API_BASE}/products/meta/categories`).then(handleResponse),

  createProduct: (data) =>
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateProduct: (id, data) =>
    fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  createReview: (id, review) =>
    fetch(`${API_BASE}/products/${id}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(review),
    }).then(handleResponse),

  // Orders
  createOrder: (orderData) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/myorders`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getOrderById: (id) =>
    fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAllOrders: (status) => {
    const query = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/orders${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  cancelOrder: (id, reason) =>
    fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handleResponse),

  returnOrder: (id, returnData) =>
    fetch(`${API_BASE}/orders/${id}/return`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(returnData),
    }).then(handleResponse),

  // Stats
  getDashboardStats: () =>
    fetch(`${API_BASE}/stats/dashboard`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Seed Reset
  resetDatabase: () =>
    fetch(`${API_BASE}/seed/reset`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),
};
