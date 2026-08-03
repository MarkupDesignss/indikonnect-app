import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';
import { getToken, getRefreshToken, setTokens, removeTokens } from '@/lib/utils/cookies';
import type { LoginResponse } from '@/lib/types/auth.types';

// Base query with token management
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // If unauthorized, try to refresh token
  if (result.error?.status === 401) {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      try {
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { token, refreshToken: newRefreshToken } = refreshResult.data as {
            token: string;
            refreshToken: string;
          };
          
          // Update tokens
          setTokens(token, newRefreshToken);
          
          // Update state
          if (api.dispatch) {
            // You might want to dispatch an action to update tokens in state
          }

          // Retry original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed - logout
          removeTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
  }

  return result;
};

// Create base API instance
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Users', 'Dashboard'],
  endpoints: () => ({}),
});

export default baseApi;