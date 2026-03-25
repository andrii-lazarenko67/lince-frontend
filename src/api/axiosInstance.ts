import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add client context header for service provider mode
    const selectedClientId = localStorage.getItem('selectedClientId');
    if (selectedClientId) {
      config.headers['X-Client-Id'] = selectedClientId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Subscription expired / cancelled / trial ended — redirect to blocked page
    // Do NOT intercept 402s that come from the billing routes themselves
    // (e.g. creating a checkout session), only from data routes
    if (error.response?.status === 402) {
      const requestUrl: string = error.config?.url || '';
      const isBillingRoute = requestUrl.includes('/billing');
      if (!isBillingRoute) {
        window.location.href = '/billing/blocked';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
