import api, {
  getApiErrorMessage,
  getStoredLanguage,
  getStoredToken,
  setStoredLanguage,
  setStoredToken,
  type ApiErrorPayload,
  type ExtendedAxiosResponse,
} from "@/lib/api";

export {
  getApiErrorMessage,
  getStoredLanguage,
  getStoredToken,
  setStoredLanguage,
  setStoredToken,
  type ApiErrorPayload,
  type ExtendedAxiosResponse,
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
  meta?: unknown;
}

/* =========================
   AUTH ROUTES
========================= */

export const signup = <T = unknown>(data: unknown) =>
  api.post<T>("/auth/signup", data);

export const login = <T = unknown>(data: unknown) =>
  api.post<T>("/auth/login", data);

export const logout = <T = unknown>() => api.post<T>("/auth/logout");

export const getProfile = <T = unknown>() => api.get<T>("/app/me");

export const changePassword = <T = unknown>(data: unknown) =>
  api.post<T>("/auth/change-password", data);

/* =========================
   USER PREFERENCES
========================= */

export const updateUserPreferences = <T = unknown>(data: unknown) =>
  api.put<T>("/app/users/preferences", data);

/* =========================
   CUSTOMER ROUTES
========================= */

export const getAccounts = <T = unknown>(page = 1, search = "") =>
  api.get<T>("/app/customers", {
    params: { page, search, limit: 10 },
  });

export const getAccountById = <T = unknown>(id: string) =>
  api.get<T>(`/app/customers/${id}`);

export const createAccount = <T = unknown>(data: unknown) =>
  api.post<T>("/app/customers", data);

export const updateAccount = <T = unknown>(id: string, data: unknown) =>
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
  search = "",
  status = "active"
) =>
  api.get<T>("/app/pawns", {
    params: { page, search, status, limit: 10 },
  });

export const getPawnTicketsByAccountId = <T = unknown>(accountId: string) =>
  api.get<T>(`/app/customers/${accountId}/pawns`);

export const getPawnTicketById = <T = unknown>(id: string) =>
  api.get<T>(`/app/pawns/${id}`);

export const createPawnTicket = <T = unknown>(data: unknown) =>
  api.post<T>("/app/pawns", data);

export const updatePawnTicket = <T = unknown>(id: string, data: unknown) =>
  api.patch<T>(`/app/pawns/${id}`, data);

export const deletePawnTicket = <T = unknown>(id: string) =>
  api.delete<T>(`/app/pawns/${id}`);

export const updatePawnTicketStatus = <T = unknown>(id: string, status: string) =>
  api.patch<T>(`/app/pawns/${id}/settle`, { status });

/* =========================
   PAYMENTS
========================= */

export const createPayment = <T = unknown>(data: unknown) =>
  api.post<T>("/app/payments", data);

export const getPaymentsForTicket = <T = unknown>(ticketId: string) =>
  api.get<T>(`/app/payments/ticket/${ticketId}`);

/* =========================
   DASHBOARD / ANALYTICS
========================= */

export const getDashboardStats = <T = unknown>() =>
  api.get<T>("/app/stat/dashboard");

export const getFinancialReport = <T = unknown>(page = 1, search = "") =>
  api.get<T>("/app/stat/financial-report", {
    params: { page, search, limit: 10 },
  });

/* =========================
   SHOP
========================= */

export const getShopDetails = <T = unknown>() => api.get<T>("/app/me");

export const updateShopDetails = <T = unknown>(data: unknown) =>
  api.patch<T>("/app/me", data);

/* =========================
   FILE UPLOAD
========================= */

export const uploadFile = <T = unknown>(file: File) => {
  const form = new FormData();
  form.append("file", file);

  return api.post<T>("/app/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* =========================
   EMPLOYEES
========================= */

export const getEmployees = <T = unknown>() => api.get<T>("/app/employees");

export const createEmployee = <T = unknown>(data: unknown) =>
  api.post<T>("/app/employees", data);

export const updateEmployee = <T = unknown>(id: string, data: unknown) =>
  api.patch<T>(`/app/employees/${id}`, data);

export const deleteEmployee = <T = unknown>(id: string) =>
  api.delete<T>(`/app/employees/${id}`);

/* =========================
   ROLES
========================= */

export const getRoles = <T = unknown>() => api.get<T>("/app/roles");

export const createRole = <T = unknown>(data: unknown) =>
  api.post<T>("/app/roles", data);

export const updateRole = <T = unknown>(id: string, data: unknown) =>
  api.patch<T>(`/app/roles/${id}`, data);

export const deleteRole = <T = unknown>(id: string) =>
  api.delete<T>(`/app/roles/${id}`);

export default api;
