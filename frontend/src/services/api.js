import axios from 'axios';

// 1. Set the base URL of your backend
const API_URL = 'http://localhost:5000/api/v1';

// 2. Create an "instance" of axios
const api = axios.create({
  baseURL: API_URL,
});

// 3. Use an "interceptor" to automatically add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Service ---
export const signup = (data) => api.post('/auth/signup', data); // { shop_name, full_name, email, password }
export const login = (data) => api.post('/auth/login', data); // { email, password }
export const getMyProfile = () => api.get('/app/me');

// --- Customer Service ---
export const createCustomer = (data) => api.post('/app/customers', data);
export const getCustomers = () => api.get('/app/customers');
export const getCustomerById = (id) => api.get(`/app/customers/${id}`);
export const updateCustomer = (id, data) => api.put(`/app/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/app/customers/${id}`);

// --- Pawn Ticket Service ---
export const createPawnTicket = (data) => api.post('/app/pawns', data);
export const getPawnTickets = () => api.get('/app/pawns');
export const getPawnTicketById = (id) => api.get(`/app/pawns/${id}`);
export const settlePawnTicket = (id) => api.patch(`/app/pawns/${id}/settle`);
export const deletePawnTicket = (id) => api.delete(`/app/pawns/${id}`);

// --- Payment Service ---
export const createPayment = (data) => api.post('/app/payments', data);
export const getPaymentsForTicket = (ticketId) => api.get(`/app/payments/ticket/${ticketId}`);

// --- Analytics Service ---
export const getDashboardStats = () => api.get('/app/dashboard');

// --- Employee Service (Owner-Only) ---
export const getEmployees = () => api.get('/app/employees');
export const createEmployee = (data) => api.post('/app/employees', data);
export const updateEmployee = (id, data) => api.put(`/app/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/app/employees/${id}`);

// --- Role Service (Owner-Only) ---
export const getRoles = () => api.get('/app/roles');
export const createRole = (data) => api.post('/app/roles', data);
export const updateRole = (id, data) => api.put(`/app/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/app/roles/${id}`);

// --- File Upload Service ---
// This one is special: it needs a 'Content-Type': 'multipart/form-data' header
export const uploadImage = (formData) => {
  return api.post('/app/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;