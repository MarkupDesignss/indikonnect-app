import Cookies from "js-cookie";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";

export const getToken = () => Cookies.get(TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

export const setTokens = (token: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    expires: 7,
    secure: isProduction,
    sameSite: "lax" as const,
  };

  Cookies.set(TOKEN_KEY, token, options);
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, options);
};

export const removeTokens = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = () => !!getToken();
