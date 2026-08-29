import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";
export type { ApiResponse };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const TOKEN_KEY = "auth_token";
const LANGUAGE_KEY = "app_language";

export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: unknown;
  meta?: unknown;
}

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
    const isSecure = process.env.NODE_ENV === "production";
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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

export const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    let message: string = fallbackMessage;
    if (typeof payload?.error === "string") {
      message = payload.error;
    } else if (payload?.error && typeof payload.error === "object" && "message" in payload.error && typeof (payload.error as any).message === "string") {
      message = (payload.error as any).message;
    } else if (typeof payload?.message === "string") {
      message = payload.message;
    } else if (error.message) {
      message = error.message;
    }
    return message.replace(/"/g, "");
  }

  if (error instanceof Error) {
    return error.message.replace(/"/g, "") || fallbackMessage;
  }

  return fallbackMessage;
};

export const buildCleanParams = (params: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const key in params) {
    const val = params[key];
    if (val === '' || val === null || val === undefined || val === 'undefined') {
      continue;
    }
    if (val === 'all' && key !== 'search') {
      continue;
    }
    clean[key] = val;
  }
  return clean;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response.data as any;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data?.data?.token;

        if (newToken) {
          setStoredToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          setStoredToken(null);
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setStoredToken(null);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const signup = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/signup", data);
  return res as unknown as ApiResponse<T>;
};

export const login = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/login", data);
  return res as unknown as ApiResponse<T>;
};

export const logout = async <T = unknown>(): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/auth/logout");
    return res as unknown as ApiResponse<T>;
  } catch {
    return { success: true, message: "Logged out" } as any;
  }
};

export const getProfile = async <T = unknown>(): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>("/app/profile/me");
  return res as unknown as ApiResponse<T>;
};

export const changePassword = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/change-password", data);
  return res as unknown as ApiResponse<T>;
};

export const updateUserPreferences = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.put<ApiResponse<T>>("/app/profile/users/preferences", data);
  return res as unknown as ApiResponse<T>;
};

export const getAccounts = async <T = unknown>(page = 1, search = ""): Promise<ApiResponse<T>> => {
  const params = buildCleanParams({ page, search, limit: 10 });
  const res = await apiClient.get<ApiResponse<T>>("/app/customers", { params });
  return res as unknown as ApiResponse<T>;
};

export const getAccountById = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}`);
  return res as unknown as ApiResponse<T>;
};

export const createAccount = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/app/customers", data);
  return res as unknown as ApiResponse<T>;
};

export const updateAccount = async <T = unknown>(id: string, data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.patch<ApiResponse<T>>(`/app/customers/${id}`, data);
  return res as unknown as ApiResponse<T>;
};

export const deleteAccount = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.delete<ApiResponse<T>>(`/app/customers/${id}`);
  return res as unknown as ApiResponse<T>;
};

export const getAccountStats = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}/stats`);
  return res as unknown as ApiResponse<T>;
};

export const getCustomerTickets = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}/tickets`);
  return res as unknown as ApiResponse<T>;
};

export const getPawnTicketsByAccountId = getCustomerTickets;

export const getPawnTickets = async <T = unknown>(page = 1, search = "", status = ""): Promise<ApiResponse<T>> => {
  const params = buildCleanParams({ page, search, status, limit: 10 });
  const res = await apiClient.get<ApiResponse<T>>("/app/pawns", { params });
  return res as unknown as ApiResponse<T>;
};

export const getPawnTicketById = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>(`/app/pawns/${id}`);
  return res as unknown as ApiResponse<T>;
};

export const createPawnTicket = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/app/pawns", data);
  return res as unknown as ApiResponse<T>;
};

export const updatePawnTicket = async <T = unknown>(id: string, data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.put<ApiResponse<T>>(`/app/pawns/${id}`, data);
  return res as unknown as ApiResponse<T>;
};

export const deletePawnTicket = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.delete<ApiResponse<T>>(`/app/pawns/${id}`);
  return res as unknown as ApiResponse<T>;
};

export const updatePawnTicketStatus = async <T = unknown>(id: string, status: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.patch<ApiResponse<T>>(`/app/pawns/${id}/status`, { status });
  return res as unknown as ApiResponse<T>;
};

export const getPaymentsForTicket = async <T = unknown>(ticketId: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>(`/app/payments/ticket/${ticketId}`);
  return res as unknown as ApiResponse<T>;
};

export const createPayment = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/app/payments", data);
  return res as unknown as ApiResponse<T>;
};

export const getEmployees = async <T = unknown>(): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>("/app/employees");
  return res as unknown as ApiResponse<T>;
};

export const createEmployee = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/app/employees", data);
  return res as unknown as ApiResponse<T>;
};

export const deleteEmployee = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.delete<ApiResponse<T>>(`/app/employees/${id}`);
  return res as unknown as ApiResponse<T>;
};

export const getRoles = async <T = unknown>(): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>("/app/roles");
  return res as unknown as ApiResponse<T>;
};

export const getFinancialReport = async <T = unknown>(page = 1, search = ""): Promise<ApiResponse<T>> => {
  const params = buildCleanParams({ page, search, limit: 10 });
  const res = await apiClient.get<ApiResponse<T>>("/app/reports/financial", { params });
  return res as unknown as ApiResponse<T>;
};

export const getPaymentsLedger = getFinancialReport;

export const fetchDashboardStats = async <T = unknown>(): Promise<ApiResponse<T>> => {
  const res = await apiClient.get<ApiResponse<T>>("/app/reports/dashboard");
  return res as unknown as ApiResponse<T>;
};

export const getDashboardStats = fetchDashboardStats;

export const uploadFile = async <T = unknown>(fileOrFormData: File | FormData): Promise<ApiResponse<T>> => {
  let body: FormData;
  if (typeof File !== "undefined" && fileOrFormData instanceof File) {
    body = new FormData();
    body.append("file", fileOrFormData);
  } else {
    body = fileOrFormData as FormData;
  }
  const res = await apiClient.post<ApiResponse<T>>("/app/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
  return res as unknown as ApiResponse<T>;
};

export const forgotPassword = async <T = unknown>(email: string): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/forgot-password", { email });
  return res as unknown as ApiResponse<T>;
};

export const resetPassword = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/reset-password", data);
  return res as unknown as ApiResponse<T>;
};

export const profileApi = {
  getProfile: async <T = unknown>(): Promise<ApiResponse<T>> => {
    return getProfile<T>();
  },
  updateProfile: async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
    const res = await apiClient.patch<ApiResponse<T>>("/app/profile/me", data);
    return res as unknown as ApiResponse<T>;
  },
  changePassword: async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
    const res = await apiClient.post<ApiResponse<T>>("/app/profile/change-password", data);
    return res as unknown as ApiResponse<T>;
  },
};

export default apiClient;
