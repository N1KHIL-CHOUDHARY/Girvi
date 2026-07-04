import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

/* =========================
   CONFIG
========================= */

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'auth_token';
const LANGUAGE_KEY = 'app_language';

/* =========================
   TYPES
========================= */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
  meta?: unknown;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: unknown;
  meta?: unknown;
}

export interface ExtendedAxiosResponse<T = unknown>
  extends AxiosResponse<ApiResponse<T>> {
  success?: boolean;
  message?: string;
  meta?: unknown;
  error?: unknown;
  data: T;
}

/* =========================
   TOKEN HELPERS
========================= */

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/* =========================
   LANGUAGE HELPERS
========================= */

export const getStoredLanguage = (): string =>
  localStorage.getItem(LANGUAGE_KEY) || 'en';

export const setStoredLanguage = (lang: string): void => {
  if (lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
};

/* =========================
   AXIOS INSTANCE
========================= */

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    const language = getStoredLanguage();

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = language;

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const payload = response.data;

    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload
    ) {
      (response as ExtendedAxiosResponse).success = payload.success;
      (response as ExtendedAxiosResponse).message = payload.message;
      (response as ExtendedAxiosResponse).meta = payload.meta;
      (response as ExtendedAxiosResponse).error = payload.error;
      (response as ExtendedAxiosResponse).data = payload.data;
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const payload = error.response?.data;

    if (payload) {
      if (payload.message) {
        error.message = payload.message;
      }

      if (error.response) {
        (error.response as ExtendedAxiosResponse).success = payload.success;
        (error.response as ExtendedAxiosResponse).message = payload.message;
        (error.response as ExtendedAxiosResponse).meta = payload.meta;
        (error.response as ExtendedAxiosResponse).error = payload.error;
        (error.response as ExtendedAxiosResponse).data = payload.data;
      }
    }

    if (error.response?.status === 401) {
      setStoredToken(null);

      const url = error.config?.url ?? '';

      if (
        typeof window !== 'undefined' &&
        !url.includes('/auth/login') &&
        !url.includes('/auth/signup')
      ) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   AUTH ROUTES
========================= */

export const signup = <T = unknown>(data: unknown) =>
  api.post<T>('/auth/signup', data);

export const login = <T = unknown>(data: unknown) =>
  api.post<T>('/auth/login', data);

export const logout = <T = unknown>() =>
  api.post<T>('/auth/logout');

export const getProfile = <T = unknown>() =>
  api.get<T>('/app/me');

export const changePassword = <T = unknown>(data: unknown) =>
  api.post<T>('/auth/change-password', data);

/* =========================
   USER PREFERENCES
========================= */

export const updateUserPreferences = <T = unknown>(data: unknown) =>
  api.put<T>('/app/users/preferences', data);

/* =========================
   CUSTOMER ROUTES
========================= */

export const getAccounts = <T = unknown>(
  page = 1,
  search = ''
) =>
  api.get<T>('/app/customers', {
    params: {
      page,
      search,
      limit: 10,
    },
  });

export const getAccountById = <T = unknown>(id: string) =>
  api.get<T>(`/app/customers/${id}`);

export const createAccount = <T = unknown>(data: unknown) =>
  api.post<T>('/app/customers', data);

export const updateAccount = <T = unknown>(
  id: string,
  data: unknown
) =>
  api.patch<T>(`/app/customers/${id}`, data);

export const deleteAccount = <T = unknown>(id: string) =>
  api.delete<T>(`/app/customers/${id}`);

export const getAccountStats = <T = unknown>(id: string) =>
  api.get<T>(`/app/customers/${id}/stats`);

/* =========================
   PAWN TICKETS
========================= */

export const getPawnTickets = <T = unknown>(
  page = 1,
  search = '',
  status = 'active'
) =>
  api.get<T>('/app/pawns', {
    params: {
      page,
      search,
      status,
      limit: 10,
    },
  });

export const getPawnTicketsByAccountId = <T = unknown>(
  accountId: string
) =>
  api.get<T>(`/app/customers/${accountId}/pawns`);

export const getPawnTicketById = <T = unknown>(id: string) =>
  api.get<T>(`/app/pawns/${id}`);

export const createPawnTicket = <T = unknown>(data: unknown) =>
  api.post<T>('/app/pawns', data);

export const updatePawnTicket = <T = unknown>(
  id: string,
  data: unknown
) =>
  api.patch<T>(`/app/pawns/${id}`, data);

export const deletePawnTicket = <T = unknown>(id: string) =>
  api.delete<T>(`/app/pawns/${id}`);

export const updatePawnTicketStatus = <T = unknown>(
  id: string,
  status: string
) =>
  api.patch<T>(`/app/pawns/${id}/settle`, {
    status,
  });

/* =========================
   PAYMENTS
========================= */

export const createPayment = <T = unknown>(data: unknown) =>
  api.post<T>('/app/payments', data);

export const getPaymentsForTicket = <T = unknown>(
  ticketId: string
) =>
  api.get<T>(`/app/payments/ticket/${ticketId}`);

/* =========================
   DASHBOARD
========================= */

export const getDashboardStats = <T = unknown>() =>
  api.get<T>('/app/stat/dashboard');

export const getFinancialReport = <T = unknown>(
  page = 1,
  search = ''
) =>
  api.get<T>('/app/stat/financial-report', {
    params: {
      page,
      search,
      limit: 10,
    },
  });

/* =========================
   SHOP
========================= */

export const getShopDetails = <T = unknown>() =>
  api.get<T>('/app/me');

export const updateShopDetails = <T = unknown>(data: unknown) =>
  api.patch<T>('/app/me', data);

/* =========================
   FILE UPLOAD
========================= */

export const uploadFile = <T = unknown>(file: File) => {
  const form = new FormData();
  form.append('file', file);

  return api.post<T>('/app/upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/* =========================
   EMPLOYEES
========================= */

export const getEmployees = <T = unknown>() =>
  api.get<T>('/app/employees');

export const createEmployee = <T = unknown>(data: unknown) =>
  api.post<T>('/app/employees', data);

export const updateEmployee = <T = unknown>(
  id: string,
  data: unknown
) =>
  api.patch<T>(`/app/employees/${id}`, data);

export const deleteEmployee = <T = unknown>(id: string) =>
  api.delete<T>(`/app/employees/${id}`);

/* =========================
   ROLES
========================= */

export const getRoles = <T = unknown>() =>
  api.get<T>('/app/roles');

export const createRole = <T = unknown>(data: unknown) =>
  api.post<T>('/app/roles', data);

export const updateRole = <T = unknown>(
  id: string,
  data: unknown
) =>
  api.patch<T>(`/app/roles/${id}`, data);

export const deleteRole = <T = unknown>(id: string) =>
  api.delete<T>(`/app/roles/${id}`);

/* =========================
   EXPORT
========================= */

export default api;