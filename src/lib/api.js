import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Assuming Spring Boot runs on 8080
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor (optional: handle 401 Unauthorized globally)
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // Optionally redirect to login or clear token
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
