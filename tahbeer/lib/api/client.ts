import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL left empty so provided paths (e.g. "/api/auth/login") are used as-is
const API_BASE_URL = '';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (globalThis.window !== undefined) {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      if (globalThis.window !== undefined) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        globalThis.window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
