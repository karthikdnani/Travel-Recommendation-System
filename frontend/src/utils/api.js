import axios from 'axios';

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Trips
export const generateTrip = (data) => API.post('/trips/generate', data);
export const getTrips = (params) => API.get('/trips', { params });
export const getTrip = (id) => API.get(`/trips/${id}`);
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);
export const deleteTrip = (id) => API.delete(`/trips/${id}`);
export const getDashboard = () => API.get('/trips/user/dashboard');

// Users
export const updateProfile = (data) => API.put('/users/profile', data);
export const changePassword = (data) => API.put('/users/change-password', data);

export default API;
