import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { logout } from '../auth/authSlice';
import { useLogoutMutation } from '@/lib/api/endpoints/authApi';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const useLogoutMutation=()=>{}
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      dispatch(logout());
    }
  };

  return {
    user,
    isAuthenticated,
    token,
    isLoading,
    error,
    isLoggingOut,
    logout: handleLogout,
  };
};