import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function storeToken(token, remember = true) {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearStoredToken();
      // Keep it simple and reliable: hard redirect to login.
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  },
);

export function extractErrorMessage(err) {
  if (!err?.response) {
    return `Khong ket noi duoc toi backend ${API_BASE_URL}. Hay kiem tra server FastAPI da chay chua.`;
  }
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    "Da xay ra loi"
  );
}

export default api;
