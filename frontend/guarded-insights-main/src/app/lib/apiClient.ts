import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { authStorage } from "@/app/lib/authStorage";

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; errors?: Record<string, string> }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.errors) return Object.values(data.errors).join(", ");
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export type { AxiosRequestConfig };
