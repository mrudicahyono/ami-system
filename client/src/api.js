// axios instance dengan JWT interceptor
import axios from "axios";
import CONFIG from "./config.js";

const api = axios.create({
  baseURL: CONFIG.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: sertakan JWT dari localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(CONFIG.tokenKey);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: tangani 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(CONFIG.tokenKey);
      localStorage.removeItem("ami_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
