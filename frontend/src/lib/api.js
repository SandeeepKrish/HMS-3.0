// frontend/src/lib/api.js
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4001").replace(/\/$/, "");

const instance = axios.create({
  baseURL: API_BASE + "/api/v1",
  withCredentials: true, // keep cookies support
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage (if any) to Authorization header
instance.interceptors.request.use((config) => {
  // Prefer specific tokens (admin/doctor/patient). Fall back to generic "token"
  const token =
    localStorage.getItem("patientToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("doctorToken") ||
    localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    // If your backend expects Bearer token:
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Optional: log 401/403 so you can debug in browser console
instance.interceptors.response.use((res) => res, (err) => {
  if (err?.response?.status === 401 || err?.response?.status === 403) {
    console.warn("API 401/403 — unauthorized. Clearing auth tokens might help.");
  }
  return Promise.reject(err);
});

export default instance;
export { API_BASE };
