import axios from "axios";

const normalizeUrl = (url) => url.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }

  if (import.meta.env.DEV) {
    return "/api";
  }

  return "https://lms-mpjz.onrender.com/api";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
