import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fittrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 comes back with a token, clear the stale token and retry once without it
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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