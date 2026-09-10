import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ 
  baseURL: API_BASE_URL, 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  const token = localStorage.getItem("fittrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`API Error: ${error.config?.url}`, error);
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest.headers?.Authorization &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      // Clear the invalid token
      localStorage.removeItem("fittrack_token");
      localStorage.removeItem("fittrack_refresh");
      // Retry without the Authorization header
      delete originalRequest.headers.Authorization;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;