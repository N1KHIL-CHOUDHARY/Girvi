import axios from 'axios';

/* =========================
   CONFIG
========================= */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'auth_token';
const LANGUAGE_KEY = 'app_language';

/* =========================
   TOKEN HELPERS
========================= */

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

/* =========================
   LANGUAGE HELPERS
========================= */

export const getStoredLanguage = () =>
  localStorage.getItem(LANGUAGE_KEY) || 'en';

export const setStoredLanguage = (lang) => {
  if (lang) localStorage.setItem(LANGUAGE_KEY, lang);
};

/* =========================
   AXIOS INSTANCE
========================= */

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    const language = getStoredLanguage();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 Send language to backend
    config.headers['Accept-Language'] = language;

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => {
    const payload = response?.data;

    if (
      payload &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'success')
    ) {
      response.success = payload.success;
      response.message = payload.message;
      response.meta = payload.meta;
      response.error = payload.error;
      response.data = payload.data;
    }

    return response;
  },
  (error) => {
    const payload = error.response?.data;

    if (payload && typeof payload === 'object') {
      if (payload.message) {
        error.message = payload.message;
      }

      if (error.response) {
        error.response.success = payload.success;
        error.response.message = payload.message;
        error.response.meta = payload.meta;
        error.response.error = payload.error;
        error.response.data = payload.data;
      }
    }

    // 🔐 Auto logout on 401
    if (error.response?.status === 401) {
      setStoredToken(null);

      if (
        typeof window !== 'undefined' &&
        !error.config?.url?.includes('/auth/login') &&
        !error.config?.url?.includes('/auth/signup')
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

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/app/me');
export const changePassword = (data) =>
  api.post('/auth/change-password', data);

/* =========================
   USER PREFERENCES
========================= */

export const updateUserPreferences = (data) =>
  api.put('/app/users/preferences', data);

/* =========================
   CUSTOMER (ACCOUNT) ROUTES
========================= */

export const getAccounts = (page = 1, search = '') =>
  api.get('/app/customers', {
    params: { page, search, limit: 10 }
  });

export const getAccountById = (id) =>
  api.get(`/app/customers/${id}`);

export const createAccount = (data) =>
  api.post('/app/customers', data);

export const updateAccount = (id, data) =>
  api.patch(`/app/customers/${id}`, data);

export const deleteAccount = (id) =>
  api.delete(`/app/customers/${id}`);

export const getAccountStats = (id) =>
  api.get(`/app/customers/${id}/stats`);

/* =========================
   PAWN TICKET ROUTES
========================= */

export const getPawnTickets = (
  page = 1,
  search = '',
  status = 'active'
) =>
  api.get('/app/pawns', {
    params: {
      page,
      search,
      status,
      limit: 10
    }
  });

export const getPawnTicketsByAccountId = (accountId) =>
  api.get(`/app/customers/${accountId}/pawns`);

export const getPawnTicketById = (id) =>
  api.get(`/app/pawns/${id}`);

export const createPawnTicket = (data) =>
  api.post('/app/pawns', data);

export const updatePawnTicket = (id, data) =>
  api.patch(`/app/pawns/${id}`, data);

export const deletePawnTicket = (id) =>
  api.delete(`/app/pawns/${id}`);

export const updatePawnTicketStatus = (id, status) =>
  api.patch(`/app/pawns/${id}/settle`, { status });

/* =========================
   PAYMENTS
========================= */

export const createPayment = (data) =>
  api.post('/app/payments', data);

export const getPaymentsForTicket = (ticketId) =>
  api.get(`/app/payments/ticket/${ticketId}`);

/* =========================
   DASHBOARD / REPORTS
========================= */

export const getDashboardStats = () =>
  api.get('/app/stat/dashboard');

export const getFinancialReport = (page = 1, search = '') =>
  api.get('/app/stat/financial-report', {
    params: { page, search, limit: 10 }
  });



export const getShopDetails = () =>
  api.get('/app/me');

export const updateShopDetails = (data) =>
  api.patch('/app/me', data);



export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);

  return api.post('/app/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/* =========================
   EMPLOYEES
========================= */

export const getEmployees = () => api.get('/app/employees');
export const createEmployee = (data) =>
  api.post('/app/employees', data);
export const updateEmployee = (id, data) =>
  api.patch(`/app/employees/${id}`, data);
export const deleteEmployee = (id) =>
  api.delete(`/app/employees/${id}`);

/* =========================
   ROLES
========================= */

export const getRoles = () => api.get('/app/roles');
export const createRole = (data) =>
  api.post('/app/roles', data);
export const updateRole = (id, data) =>
  api.patch(`/app/roles/${id}`, data);
export const deleteRole = (id) =>
  api.delete(`/app/roles/${id}`);

/* =========================
   EXPORT DEFAULT
========================= */

export default api;
