import { create } from 'zustand';

const storedToken = localStorage.getItem('auth_token');
const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
};

const storedUser = parseStoredUser();

const useAuthStore = create((set) => ({
  token: storedToken || null,
  user: storedUser,
  isAuthenticated: !!storedToken,

  login: ({ token, id, username, email, role }) => {
    const user = { id: id || null, username, email, role };

    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
