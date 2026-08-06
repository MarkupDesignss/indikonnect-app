import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const setAuthData = (token: string, refreshToken: string, user: User) => {
  const options = {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  Cookies.set(TOKEN_KEY, token, options);
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, options);
  Cookies.set(USER_KEY, JSON.stringify(user), options);
};

export const getToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const getUser = (): User | null => {
  const userData = Cookies.get(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
};

export const removeAuthData = () => {
  Cookies.remove(TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
  Cookies.remove(USER_KEY, { path: '/' });
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};