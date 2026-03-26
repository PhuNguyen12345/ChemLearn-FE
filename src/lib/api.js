import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Bạn có thể thêm request/response interceptors ở đây nếu cần (vd thêm token vào headers)

export default api;
