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
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=31536000; SameSite=Lax; Secure`;
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

import {
  devUserProfile,
  devDashboardStats,
  devCustomers,
  devPawnTickets,
  devPayments,
  devEmployees,
  devRoles,
} from "./devMockData";

export const signup = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/auth/signup", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Signed up in development mode", data: { token: "dev-jwt-token" } as any };
    }
    throw err;
  }
};

export const login = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/auth/login", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Logged in in development mode", data: { token: "dev-jwt-token" } as any };
    }
    throw err;
  }
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
  try {
    const res = await apiClient.get<ApiResponse<T>>("/app/profile/me");
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, data: devUserProfile as unknown as T };
    }
    throw err;
  }
};

export const changePassword = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  const res = await apiClient.post<ApiResponse<T>>("/auth/change-password", data);
  return res as unknown as ApiResponse<T>;
};

export const updateUserPreferences = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.put<ApiResponse<T>>("/app/profile/users/preferences", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Preferences updated", data: data as any };
    }
    throw err;
  }
};

export const getAccounts = async <T = unknown>(page = 1, search = ""): Promise<ApiResponse<T>> => {
  try {
    const params = buildCleanParams({ page, search, limit: 10 });
    const res = await apiClient.get<ApiResponse<T>>("/app/customers", { params });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const filtered = devCustomers.filter((c) =>
        !search ? true : c.full_name.toLowerCase().includes(search.toLowerCase()) || c.phone_number.includes(search)
      );
      return {
        success: true,
        data: filtered as unknown as T,
        meta: { total: filtered.length, page, limit: 10, totalPages: 1 },
      };
    }
    throw err;
  }
};

export const getAccountById = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const found = devCustomers.find((c) => c.id === id) || devCustomers[0];
      return { success: true, data: found as unknown as T };
    }
    throw err;
  }
};

export const createAccount = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/app/customers", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Customer created", data: { id: `cust-${Date.now()}`, ...(data as any) } as any };
    }
    throw err;
  }
};

export const updateAccount = async <T = unknown>(id: string, data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.put<ApiResponse<T>>(`/app/customers/${id}`, data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Customer updated", data: { id, ...(data as any) } as any };
    }
    throw err;
  }
};

export const deleteAccount = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.delete<ApiResponse<T>>(`/app/customers/${id}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Customer deleted" } as any;
    }
    throw err;
  }
};

export const getAccountStats = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}/stats`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        data: {
          stats: {
            total_active_loan: 1200,
            total_loan_value: 2500,
            total_tickets: 2,
            active_tickets: 1,
            total_interest_paid: 120,
            total_principal_paid: 1300,
          },
        } as any,
      };
    }
    throw err;
  }
};

export const getCustomerTickets = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>(`/app/customers/${id}/tickets`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const tickets = devPawnTickets.filter((t) => t.customer_id === id || t.customer?.id === id);
      return { success: true, data: (tickets.length > 0 ? tickets : [devPawnTickets[0]]) as unknown as T };
    }
    throw err;
  }
};

export const getPawnTicketsByAccountId = getCustomerTickets;

export const getPawnTickets = async <T = unknown>(page = 1, search = "", status = ""): Promise<ApiResponse<T>> => {
  try {
    const params = buildCleanParams({ page, search, status, limit: 10 });
    const res = await apiClient.get<ApiResponse<T>>("/app/pawns", { params });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      let list = devPawnTickets;
      if (status && status !== "all") {
        list = list.filter((t) => t.status === status);
      }
      if (search) {
        list = list.filter(
          (t) =>
            t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
            t.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.items?.[0]?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return {
        success: true,
        data: list as unknown as T,
        meta: { total: list.length, page, limit: 10, totalPages: 1 },
      };
    }
    throw err;
  }
};

export const getPawnTicketById = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>(`/app/pawns/${id}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const found = devPawnTickets.find((t) => t.id === id) || devPawnTickets[0];
      return { success: true, data: found as unknown as T };
    }
    throw err;
  }
};

export const createPawnTicket = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/app/pawns", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Ticket created", data: { id: `pt-${Date.now()}`, ...(data as any) } as any };
    }
    throw err;
  }
};

export const updatePawnTicket = async <T = unknown>(id: string, data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.put<ApiResponse<T>>(`/app/pawns/${id}`, data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Ticket updated", data: { id, ...(data as any) } as any };
    }
    throw err;
  }
};

export const deletePawnTicket = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.delete<ApiResponse<T>>(`/app/pawns/${id}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Ticket deleted" } as any;
    }
    throw err;
  }
};

export const updatePawnTicketStatus = async <T = unknown>(id: string, status: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.patch<ApiResponse<T>>(`/app/pawns/${id}/status`, { status });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: `Status updated to ${status}`, data: { id, status } as any };
    }
    throw err;
  }
};

export const getPaymentsForTicket = async <T = unknown>(ticketId: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>(`/app/payments/ticket/${ticketId}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const filtered = devPayments.filter((p) => p.ticket_id === ticketId);
      return { success: true, data: (filtered.length > 0 ? filtered : devPayments.slice(0, 2)) as unknown as T };
    }
    throw err;
  }
};

export const createPayment = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/app/payments", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Payment recorded", data: { id: `pay-${Date.now()}`, ...(data as any) } as any };
    }
    throw err;
  }
};

export const getEmployees = async <T = unknown>(): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>("/app/employees");
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, data: devEmployees as unknown as T };
    }
    throw err;
  }
};

export const createEmployee = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/app/employees", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Employee created", data: { id: `emp-${Date.now()}`, ...(data as any) } as any };
    }
    throw err;
  }
};

export const deleteEmployee = async <T = unknown>(id: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.delete<ApiResponse<T>>(`/app/employees/${id}`);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Employee deleted" } as any;
    }
    throw err;
  }
};

export const getRoles = async <T = unknown>(): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>("/app/roles");
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, data: devRoles as unknown as T };
    }
    throw err;
  }
};

export const getFinancialReport = async <T = unknown>(page = 1, search = ""): Promise<ApiResponse<T>> => {
  try {
    const params = buildCleanParams({ page, search, limit: 10 });
    const res = await apiClient.get<ApiResponse<T>>("/app/reports/financial", { params });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      const rows = devPawnTickets.map((t) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        customer_name: t.customer?.full_name ?? "Customer",
        original_loan_amount: Number(t.original_loan_amount),
        loan_amount: Number(t.loan_amount),
        total_interest_paid: Number(t.loan_amount) * 0.06,
        total_principal_paid: t.status === "settled" ? Number(t.original_loan_amount) : 0,
        status: t.status,
      }));
      return {
        success: true,
        data: rows as unknown as T,
        meta: { total: rows.length, page, limit: 10, totalPages: 1 },
      };
    }
    throw err;
  }
};

export const getPaymentsLedger = getFinancialReport;

export const fetchDashboardStats = async <T = unknown>(): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.get<ApiResponse<T>>("/app/reports/dashboard");
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, data: devDashboardStats as unknown as T };
    }
    throw err;
  }
};

export const getDashboardStats = fetchDashboardStats;


export const uploadFile = async <T = unknown>(fileOrFormData: File | FormData): Promise<ApiResponse<T>> => {
  try {
    let body: FormData;
    if (typeof File !== "undefined" && fileOrFormData instanceof File) {
      body = new FormData();
      body.append("file", fileOrFormData);
    } else {
      body = fileOrFormData as FormData;
    }
    const res = await apiClient.post<ApiResponse<T>>("/app/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, data: { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80" } as any };
    }
    throw err;
  }
};

export const forgotPassword = async <T = unknown>(email: string): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/auth/forgot-password", { email });
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Reset link sent" } as any;
    }
    throw err;
  }
};

export const resetPassword = async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
  try {
    const res = await apiClient.post<ApiResponse<T>>("/auth/reset-password", data);
    return res as unknown as ApiResponse<T>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, message: "Password reset" } as any;
    }
    throw err;
  }
};

export const profileApi = {
  getProfile: async <T = unknown>(): Promise<ApiResponse<T>> => {
    return getProfile<T>();
  },
  updateProfile: async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
    try {
      const res = await apiClient.patch<ApiResponse<T>>("/app/profile/me", data);
      return res as unknown as ApiResponse<T>;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        return { success: true, message: "Profile updated", data: data as any };
      }
      throw err;
    }
  },
  changePassword: async <T = unknown>(data: unknown): Promise<ApiResponse<T>> => {
    try {
      const res = await apiClient.post<ApiResponse<T>>("/app/profile/change-password", data);
      return res as unknown as ApiResponse<T>;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        return { success: true, message: "Password changed" } as any;
      }
      throw err;
    }
  },
};

export default apiClient;

