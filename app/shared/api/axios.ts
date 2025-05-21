// api/axios.ts
import axios from "axios";
import { accessTokenKey } from "../utils/strings";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;
console.log(apiKey);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-api-key": apiKey,
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
