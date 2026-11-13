/**
 * Centralized API service for communicating with the Flask REST Backend.
 * Automatically handles Authorization headers with JWT tokens.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ai_finance_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errMessage = 'An error occurred while communicating with the server.';
    try {
      const errData = await res.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errMessage);
  }
  return res.json();
};

export const api = {
  // Authentication
  auth: {
    register: (data) =>
      fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),

    login: (identifier, password) =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      }).then(handleResponse),

    demoLogin: () =>
      fetch(`${API_BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(handleResponse),

    getProfile: () =>
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    updateProfile: (data) =>
      fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    logout: () =>
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Transactions
  transactions: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/transactions${query ? `?${query}` : ''}`;
      return fetch(url, { method: 'GET', headers: { ...getAuthHeaders(), 'Cache-Control': 'no-cache' }, cache: 'no-store' }).then(handleResponse);
    },

    create: (data) =>
      fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Budgets
  budgets: {
    getAll: () =>
      fetch(`${API_BASE_URL}/budgets`, { headers: getAuthHeaders() }).then(handleResponse),

    createOrUpdate: (data) =>
      fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Analytics
  analytics: {
    getDashboard: () =>
      fetch(`${API_BASE_URL}/analytics/dashboard`, { headers: getAuthHeaders() }).then(handleResponse)
  },

  // Predictions
  predictions: {
    getPredictions: () =>
      fetch(`${API_BASE_URL}/predictions`, { headers: getAuthHeaders() }).then(handleResponse)
  },

  // AI Assistant
  ai: {
    chat: (message) =>
      fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
      }).then(handleResponse),

    getHistory: () =>
      fetch(`${API_BASE_URL}/ai/history`, { headers: getAuthHeaders() }).then(handleResponse),

    clearHistory: () =>
      fetch(`${API_BASE_URL}/ai/history`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Reports
  reports: {
    getMonthly: () =>
      fetch(`${API_BASE_URL}/reports/monthly`, { headers: getAuthHeaders() }).then(handleResponse),

    getExportCsvUrl: () => `${API_BASE_URL}/reports/export-csv`
  },

  // Health
  checkHealth: () =>
    fetch(`${API_BASE_URL}/health`).then(handleResponse)
};
