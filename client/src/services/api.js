import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');

    // If no refresh token, clear storage and redirect
    if (!refreshToken) {
      isRefreshing = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    try {
      // Try to refresh the token
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });

      // Store new tokens
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Update authorization header
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      // Process queued requests
      processQueue(null, data.accessToken);

      isRefreshing = false;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear tokens and redirect
      processQueue(refreshError, null);
      isRefreshing = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;
