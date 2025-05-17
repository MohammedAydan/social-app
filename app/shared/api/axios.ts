// api/axios.ts
import axios from "axios";
import { accessTokenKey } from "../utils/strings";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  let token: string | null = null;

  token = localStorage.getItem(accessTokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem(accessTokenKey);
    }

    return Promise.reject(error);
  }
);

export default api;
