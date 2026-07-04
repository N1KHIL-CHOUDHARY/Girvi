import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";
import type { ApiResponse } from "@/types/api";
import type { DashboardStatsResponse } from "@/types/dashboard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const TOKEN_KEY = "auth_token";
const LANGUAGE_KEY = "app_language";

export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: unknown;
  meta?: unknown;
}

export type ExtendedAxiosResponse<T> = Omit<
  AxiosResponse<ApiResponse<T>>,
  "data"
> & {
  success?: boolean;
  message?: string;
  meta?: unknown;
  error?: unknown;
  data: T;
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredLanguage = (): string => {
  if (typeof window === "undefined") {
    return "en";
  }
  return localStorage.getItem(LANGUAGE_KEY) || "en";
};

export const setStoredLanguage = (lang: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  if (lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    const message =
      (typeof payload?.error === "string" && payload.error) ||
      (typeof payload?.message === "string" && payload.message) ||
      error.message ||
      fallbackMessage;

    return message.replace(/"/g, "");
  }

  if (error instanceof Error) {
    return error.message.replace(/"/g, "") || fallbackMessage;
  }

  return fallbackMessage;
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    const language = getStoredLanguage();

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Accept-Language"] = language;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const payload = response.data;

    if (payload && typeof payload === "object" && "success" in payload) {
      const extended = response as ExtendedAxiosResponse<unknown>;
      extended.success = payload.success;
      extended.message = payload.message;
      extended.meta = payload.meta;
      extended.error = payload.error;
      extended.data = payload.data;
    }

    return response;
  },
  (error: AxiosError<ApiErrorPayload>) => {
    const payload = error.response?.data;

    if (payload) {
      if (payload.message) {
        error.message = payload.message;
      }

      if (error.response) {
        const extended = error.response as ExtendedAxiosResponse<unknown>;
        extended.success = payload.success;
        extended.message = payload.message;
        extended.meta = payload.meta;
        extended.error = payload.error;
        extended.data = payload.data;
      }
    }

    if (error.response?.status === 401) {
      setStoredToken(null);

      const url = error.config?.url ?? "";

      if (
        typeof window !== "undefined" &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/signup")
      ) {
        window.location.replace("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await api.get<DashboardStatsResponse>("/app/stat/dashboard");
  return response.data;
}

export default api;
