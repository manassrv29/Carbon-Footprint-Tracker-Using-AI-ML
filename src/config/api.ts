// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  CARBON: {
    LOGS: `${API_BASE_URL}/api/carbon/logs`,
    STATS: `${API_BASE_URL}/api/carbon/stats`,
  },
  CORPORATE: {
    DASHBOARD: `${API_BASE_URL}/api/corporate/dashboard`,
  },
  REPORTS: {
    WEEKLY: `${API_BASE_URL}/api/reports/weekly`,
    MONTHLY: `${API_BASE_URL}/api/reports/monthly`,
  },
  FOOD: {
    DATABASE: `${API_BASE_URL}/api/food-carbon/database`,
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function for making authenticated requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(getApiUrl(url), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};
