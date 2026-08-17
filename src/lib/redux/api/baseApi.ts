// src/lib/redux/api/baseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// ✅ FIX: Get the base path for redirects
const getBasePath = () => {
  if (typeof window !== "undefined") {
    // Check if we're in a subdirectory
    const pathname = window.location.pathname;
    if (pathname.includes("/indiekonnect-web")) {
      return "/indiekonnect-web";
    }
    return "";
  }
  return "";
};

// ✅ FIX: Always redirect to home page with base path
const getRedirectUrl = () => {
  const basePath = getBasePath();
  return basePath ? `${basePath}/` : "/";
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

  setTokens: (accessToken: string, refreshToken: string, userType?: string) => {
    if (typeof window !== "undefined") {
      const type = userType || localStorage.getItem("user_type");

      console.log("💾 Saving tokens for user type:", type);

      if (type === "distributor") {
        localStorage.setItem("distributor_token", accessToken);
        localStorage.setItem("distributor_refresh_token", refreshToken);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.setItem("user_type", "distributor");
        localStorage.setItem("is_logged_in", "true");
        console.log("✅ Distributor tokens saved successfully");
      } else {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.removeItem("distributor_token");
        localStorage.removeItem("distributor_refresh_token");
        localStorage.setItem("user_type", "customer");
        localStorage.setItem("is_logged_in", "true");
        console.log("✅ Customer tokens saved successfully");
      }

      console.log("📦 Token storage state:", {
        distributor_token: !!localStorage.getItem("distributor_token"),
        distributor_refresh_token: !!localStorage.getItem(
          "distributor_refresh_token",
        ),
        auth_token: !!localStorage.getItem("auth_token"),
        refresh_token: !!localStorage.getItem("refresh_token"),
        user_type: localStorage.getItem("user_type"),
        is_logged_in: localStorage.getItem("is_logged_in"),
      });
    }
  },

  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("distributor_token");
      localStorage.removeItem("distributor_refresh_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("temp_token");
      localStorage.removeItem("verified_phone");
      localStorage.removeItem("customer_otp");
      localStorage.removeItem("customer_phone");
      localStorage.removeItem("user_type");
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("distributor_session");
      localStorage.removeItem("distributor_email");
      localStorage.removeItem("distributor_phone");

      console.log("🗑️ All tokens cleared");
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
      console.log("✅ User data saved:", userData);
    }
  },

  getUserType: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_type");
    }
    return null;
  },

  isDistributor: () => {
    if (typeof window !== "undefined") {
      const distributorToken = localStorage.getItem("distributor_token");
      const userType = localStorage.getItem("user_type");
      return !!(distributorToken && userType === "distributor");
    }
    return false;
  },

  isCustomer: () => {
    if (typeof window !== "undefined") {
      const customerToken = localStorage.getItem("auth_token");
      const userType = localStorage.getItem("user_type");
      return !!(customerToken && userType === "customer");
    }
    return false;
  },
};

// Base query with refresh token logic
const baseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.markupdesigns.net/indiekonnect/api/",
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
        const refreshResult = await baseQuery(
          {
            url: "/user/refresh-token",
            method: "POST",
            body: { refresh_token: refreshToken },
          },
          api,
          extraOptions,
        );

        if (refreshResult.error && refreshResult.error.status === 401) {
          console.log("Refresh token expired, logging out...");
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            const redirectUrl = getRedirectUrl();
            console.log(`🔄 Redirecting to: ${redirectUrl}`);
            window.location.href = redirectUrl;
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
            TokenManager.setTokens(data.access_token, data.refresh_token);
            result = await baseQuery(args, api, extraOptions);
          } else {
            console.log("Token refresh failed, logging out...");
            TokenManager.clearTokens();
            if (typeof window !== "undefined") {
              const redirectUrl = getRedirectUrl();
              console.log(`🔄 Redirecting to: ${redirectUrl}`);
              window.location.href = redirectUrl;
            }
          }
        } else {
          console.log("Token refresh failed (no data), logging out...");
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            const redirectUrl = getRedirectUrl();
            console.log(`🔄 Redirecting to: ${redirectUrl}`);
            window.location.href = redirectUrl;
          }
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        TokenManager.clearTokens();
        if (typeof window !== "undefined") {
          const redirectUrl = getRedirectUrl();
          console.log(`🔄 Redirecting to: ${redirectUrl}`);
          window.location.href = redirectUrl;
        }
      }
    } else {
      console.log("No refresh token available, logging out...");
      TokenManager.clearTokens();
      if (typeof window !== "undefined") {
        const redirectUrl = getRedirectUrl();
        console.log(`🔄 Redirecting to: ${redirectUrl}`);
        window.location.href = redirectUrl;
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
    "Dashboard",
    "Dashboard",
    "OrderStatus",
    "Category"
  ],
  endpoints: () => ({}),
});

export { TokenManager, getRedirectUrl };
export default baseApi;
