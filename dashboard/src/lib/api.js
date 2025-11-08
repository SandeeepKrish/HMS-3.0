// dashboard/src/lib/api.js
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4001").replace(/\/$/, "");
const baseURL = API_BASE + "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true, // keep cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Request interceptor: attach bearer token if present in localStorage
api.interceptors.request.use((config) => {
  try {
    // priority: adminToken -> doctorToken -> patientToken
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("doctorToken") ||
      localStorage.getItem("patientToken");

    if (token) {
      config.headers = config.headers || {};
      // only attach if not already present
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // If sending FormData, let browser set the Content-Type (multipart boundary)
    if (config.data && config.data instanceof FormData) {
      if (config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
}, (err) => Promise.reject(err));

// Response interceptor: helpful logging for 401 during dev
api.interceptors.response.use((res) => res, (error) => {
  if (error?.response?.status === 401) {
    // optional: auto-signout logic can go here
    console.warn("API 401 — unauthorized. Consider redirecting to login.");
  }
  return Promise.reject(error);
});

export default api;
export { API_BASE };
