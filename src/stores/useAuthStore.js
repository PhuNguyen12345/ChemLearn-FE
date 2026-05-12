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

  login: ({ token, id, username, email, role, fullName, avatarUrl, isActive, bio, specialization, degree, workplace }) => {
    const user = {
      id: id || null,
      username,
      email,
      role,
      fullName,
      avatarUrl,
      isActive,
      bio,
      specialization,
      degree,
      workplace,
    };

    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.user) {
        return state;
      }

      const user = {
        ...state.user,
        ...updates,
      };

      localStorage.setItem('auth_user', JSON.stringify(user));

      return { user };
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
