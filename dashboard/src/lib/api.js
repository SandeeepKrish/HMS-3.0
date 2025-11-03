// dashboard/src/lib/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4001";

const api = axios.create({
    baseURL: API_BASE + "/api/v1",
    withCredentials: true, // if your backend uses cookies; keep if you need it
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
export { API_BASE };
