import { create } from 'zustand';

// Store lưu trạng thái đăng nhập và thông tin người dùng
const useAuthStore = create((set) => ({
  user: null, // Thông tin người dùng (id, name, email, role, ...)
  isAuthenticated: false, // Trạng thái login
  
  login: (userData) => set({
    user: userData,
    isAuthenticated: true
  }),

  logout: () => set({
    user: null,
    isAuthenticated: false
  })
}));

export default useAuthStore;
