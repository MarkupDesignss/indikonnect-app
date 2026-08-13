// src/lib/redux/api/baseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Helper to get correct login redirect
const getRedirectUrl = () => {
  if (typeof window === "undefined") return "/auth/customer/login";
  const userType = localStorage.getItem("user_type");
  return userType === "distributor"
    ? "/auth/distributor/login"
    : "/auth/customer/login";
};

// Token management utilities
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== "undefined") {
      // Check for Customer token first
      const customerToken = localStorage.getItem("auth_token");
      if (customerToken) return customerToken;
      // Then check for Distributor token
      const distributorToken = localStorage.getItem("distributor_token");
      if (distributorToken) return distributorToken;
    }
    return null;
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      const customerRefresh = localStorage.getItem("refresh_token");
      if (customerRefresh) return customerRefresh;
      const distributorRefresh = localStorage.getItem(
        "distributor_refresh_token",
      );
      if (distributorRefresh) return distributorRefresh;
    }
    return null;
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== "undefined") {
      const userType = localStorage.getItem("user_type");
      if (userType === "distributor") {
        localStorage.setItem("distributor_token", accessToken);
        localStorage.setItem("distributor_refresh_token", refreshToken);
        // Clear any stale customer tokens
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      } else {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        // Clear any stale distributor tokens
        localStorage.removeItem("distributor_token");
        localStorage.removeItem("distributor_refresh_token");
      }
    }
  },

  clearTokens: () => {
    if (typeof window !== "undefined") {
      // Clear Customer Tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");

      // Clear Distributor Tokens
      localStorage.removeItem("distributor_token");
      localStorage.removeItem("distributor_refresh_token");

      // Clear Session Data
      localStorage.removeItem("user_data");
      localStorage.removeItem("temp_token");
      localStorage.removeItem("verified_phone");
      localStorage.removeItem("customer_otp");
      localStorage.removeItem("customer_phone");
      localStorage.removeItem("user_type");
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("distributor_session");
      localStorage.removeItem("distributor_email");
    }
  },

  getUserData: () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  setUserData: (userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  },
};

// Base query with refresh token logic
const baseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.markupdesigns.net/indikonnect/api/",
  prepareHeaders: (headers) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Custom base query with refresh token handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If unauthorized, try to refresh token
  if (result.error && result.error.status === 401) {
    const refreshToken = TokenManager.getRefreshToken();

    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await baseQuery(
          {
            url: "/user/refresh-token",
            method: "POST",
            body: { refresh_token: refreshToken },
          },
          api,
          extraOptions,
        );

        // Check if refresh token itself is expired or invalid
        if (refreshResult.error && refreshResult.error.status === 401) {
          console.log("Refresh token expired, logging out...");
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = getRedirectUrl();
          }
          return result;
        }

        if (refreshResult.data) {
          const data = refreshResult.data as {
            status: boolean;
            access_token: string;
            refresh_token: string;
            expires_in: number;
          };

          if (data.status && data.access_token) {
            // Store new tokens
            TokenManager.setTokens(data.access_token, data.refresh_token);

            // Retry the original request with new token
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Refresh failed - logout user
            console.log("Token refresh failed, logging out...");
            TokenManager.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = getRedirectUrl();
            }
          }
        } else {
          // Refresh failed - logout user
          console.log("Token refresh failed (no data), logging out...");
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = getRedirectUrl();
          }
        }
      } catch (error) {
        // Refresh error - logout user
        console.error("Token refresh error:", error);
        TokenManager.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = getRedirectUrl();
        }
      }
    } else {
      // No refresh token - logout user
      console.log("No refresh token available, logging out...");
      TokenManager.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = getRedirectUrl();
      }
    }
  }

  return result;
};

// Base API configuration
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Distributor",
    "Customer",
    "User",
    "Order",
    "Wishlist",
    "Product",
    "Products",
    "Addresses",
    "Cart",
    "Contact",
    "Subscriber",
    "Category",
    "Header",
    "ShippingMethods",
  ],
  endpoints: () => ({}),
});

export { TokenManager, getRedirectUrl };
export default baseApi;
