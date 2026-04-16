import { useNavigate } from 'react-router-dom';
import useAuthStore from './useAuthStore';
import api from '@/lib/api';

/**
 * Hook to handle user logout
 * Calls backend logout endpoint, then clears auth state from localStorage and Zustand store
 * Finally redirects to login page
 * @returns {function} logout function that can be called on button click or other events
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const storeLogout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  const logout = async () => {
    try {
      // Call backend logout endpoint to notify server
      await api.post('/api/auth/logout', {});
    } catch (err) {
      console.error('Logout request failed:', err);
      // Continue with frontend logout even if backend call fails
    } finally {
      // Clear local auth state regardless of backend response
      storeLogout();
      navigate('/', { replace: true });
    }
  };

  return logout;
};
