import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success')) {
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
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// --- Auth Routes ---
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const loginWithGoogle = (idToken) => api.post('/auth/google', { idToken });
export const getProfile = () => api.get('/app/me');
export const changePassword = (data) => api.post('/auth/change-password', data); // NEW

// --- Customer (Account) Routes ---
export const getAccounts = (page = 1, search = "") => {
  return api.get('/app/customers', {
    params: { page, search, limit: 10 }
  });
};
export const getAccountById = (id) => api.get(`/app/customers/${id}`);
export const createAccount = (data) => api.post('/app/customers', data);
export const updateAccount = (id, data) => api.patch(`/app/customers/${id}`, data);
export const deleteAccount = (id) => api.delete(`/app/customers/${id}`);
export const getAccountStats = (id) => api.get(`/app/customers/${id}/stats`);

// --- Pawn Ticket Routes ---
// --- Pawn Ticket Routes ---
export const getPawnTickets = (page = 1, search = "", status = "active") => { // <-- 1. Add status
  return api.get('/app/pawns', {
    params: {
      page,
      search,
      status, // <-- 2. Send status to backend
      limit: 10
    }
  });
};
export const getPawnTicketsByAccountId = (accountId) => {
  return api.get(`/app/customers/${accountId}/pawns`); 
};
export const getPawnTicketById = (id) => api.get(`/app/pawns/${id}`);
export const createPawnTicket = (data) => api.post('/app/pawns', data);
export const updatePawnTicket = (id, data) => api.patch(`/app/pawns/${id}`, data);
export const deletePawnTicket = (id) => api.delete(`/app/pawns/${id}`);
export const updatePawnTicketStatus = (id, status) => {
  return api.patch(`/app/pawns/${id}/settle`, { status }); 
};

export const createPayment = (data) => api.post('/app/payments', data);
export const getPaymentsForTicket = (ticketId) => api.get(`/app/payments/ticket/${ticketId}`);

export const getDashboardStats = () => api.get('/app/stat/dashboard');

export const getShopDetails = () => api.get('/app/shop'); // NEW
export const updateShopDetails = (data) => api.patch('/app/shop', data); // NEW

// --- Upload ---
export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/app/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getEmployees = () => api.get('/app/employees');
export const createEmployee = (data) => api.post('/app/employees', data);
export const updateEmployee = (id, data) => api.patch(`/app/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/app/employees/${id}`);

export const getRoles = () => api.get('/app/roles');
export const createRole = (data) => api.post('/app/roles', data);
export const updateRole = (id, data) => api.patch(`/app/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/app/roles/${id}`);

export default api;