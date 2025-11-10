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

export const setAuthToken = (token) => {
  if (token) {
    // We already set this in the interceptor, but localStorage is good.
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// --- Auth Routes ---
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/app/me'); // Corrected from /auth/me

// --- Customer (Account) Routes ---
export const getAccounts = (page = 1, search = "") => {
  return api.get('/app/customers', {
    params: {
      page,
      search,
      limit: 10
    }
  });
};

export const getAccountById = (id) => api.get(`/app/customers/${id}`);
export const createAccount = (data) => api.post('/app/customers', data);
export const updateAccount = (id, data) => api.put(`/app/customers/${id}`);
export const deleteAccount = (id) => api.delete(`/app/customers/${id}`);
export const getAccountStats = (id) => api.get(`/app/customers/${id}/`);

// --- Pawn Ticket Routes ---
export const getPawnTickets = (page = 1, search = "") => {
  return api.get('/app/pawns', {
    params: {
      page,
      search,
      limit: 10
    }
  });
};

export const getPawnTicketsByAccountId = (accountId) => {
  // This now matches your new backend route
  return api.get(`/app/customers/${accountId}/pawns`); 
};
export const createPawnTicket = (data) => api.post('/app/pawns', data);
export const updatePawnTicket = (id, data) => api.put(`/app/pawns/${id}`);
export const deletePawnTicket = (id) => api.delete(`/app/pawns/${id}`);
export const updatePawnTicketStatus = (id, status, settled_date = null) => {
  return api.patch(`/app/pawns/${id}/settle`, { status, settled_date });
};

// --- Analytics Route ---
export const getDashboardStats = () => api.get('/app/dashboard');

// --- Employee Routes ---
export const getEmployees = () => api.get('/app/employees');
export const createEmployee = (data) => api.post('/app/employees', data);
export const updateEmployee = (id, data) => api.put(`/app/employees/${id}`);
export const deleteEmployee = (id) => api.delete(`/app/employees/${id}`);

// --- Role Routes ---
export const getRoles = () => api.get('/app/roles');
export const createRole = (data) => api.post('/app/roles', data);
export const updateRole = (id, data) => api.put(`/app/roles/${id}`);
export const deleteRole = (id) => api.delete(`/app/roles/${id}`);

export default api;