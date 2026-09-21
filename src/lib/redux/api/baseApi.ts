import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

/* =========================================================
   BASE PATH
========================================================= */

const getBasePath = () => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;

    if (pathname.includes("/indiekonnect-web")) {
      return "/indiekonnect-web";
    }

    return "";
  }

  return "";
};

/* =========================================================
   REDIRECT URL
   Used only when an authenticated session is no longer valid.
========================================================= */

const getRedirectUrl = () => {
  const basePath = getBasePath();

  return basePath ? `${basePath}/` : "/";
};

/* =========================================================
   TOKEN MANAGER
========================================================= */

const TokenManager = {
  /* =======================================================
     ACCESS TOKEN
  ======================================================= */

  getAccessToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    // Customer token first
    const customerToken = localStorage.getItem("auth_token");

    if (customerToken) {
      return customerToken;
    }

    // Distributor token
    const distributorToken = localStorage.getItem("distributor_token");

    if (distributorToken) {
      return distributorToken;
    }

    return null;
  },

  /* =======================================================
     REFRESH TOKEN
  ======================================================= */

  getRefreshToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    // Customer refresh token
    const customerRefreshToken = localStorage.getItem("refresh_token");

    if (customerRefreshToken) {
      return customerRefreshToken;
    }

    // Distributor refresh token
    const distributorRefreshToken = localStorage.getItem(
      "distributor_refresh_token",
    );

    if (distributorRefreshToken) {
      return distributorRefreshToken;
    }

    return null;
  },

  /* =======================================================
     SET TOKENS
  ======================================================= */

  setTokens: (accessToken: string, refreshToken: string, userType?: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const type = userType || localStorage.getItem("user_type");

    console.log("💾 Saving refreshed tokens for:", type);

    if (type === "distributor") {
      localStorage.setItem("distributor_token", accessToken);

      localStorage.setItem("distributor_refresh_token", refreshToken);

      localStorage.removeItem("auth_token");

      localStorage.removeItem("refresh_token");

      localStorage.setItem("user_type", "distributor");

      localStorage.setItem("is_logged_in", "true");

      console.log("✅ Distributor tokens refreshed successfully");
    } else {
      localStorage.setItem("auth_token", accessToken);

      localStorage.setItem("refresh_token", refreshToken);

      localStorage.removeItem("distributor_token");

      localStorage.removeItem("distributor_refresh_token");

      localStorage.setItem("user_type", "customer");

      localStorage.setItem("is_logged_in", "true");

      console.log("✅ Customer tokens refreshed successfully");
    }

    console.log("📦 Updated token state:", {
      auth_token: Boolean(localStorage.getItem("auth_token")),

      refresh_token: Boolean(localStorage.getItem("refresh_token")),

      distributor_token: Boolean(localStorage.getItem("distributor_token")),

      distributor_refresh_token: Boolean(
        localStorage.getItem("distributor_refresh_token"),
      ),

      user_type: localStorage.getItem("user_type"),

      is_logged_in: localStorage.getItem("is_logged_in"),
    });
  },

  /* =======================================================
     CLEAR TOKENS
  ======================================================= */

  clearTokens: () => {
    if (typeof window === "undefined") {
      return;
    }

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

    console.log("🗑️ All authentication tokens cleared");
  },

  /* =======================================================
     USER DATA
  ======================================================= */

  getUserData: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const userData = localStorage.getItem("user_data");

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  setUserData: (userData: any) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("user_data", JSON.stringify(userData));

    console.log("✅ User data saved:", userData);
  },

  /* =======================================================
     USER TYPE
  ======================================================= */

  getUserType: () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("user_type");
  },

  /* =======================================================
     DISTRIBUTOR CHECK
  ======================================================= */

  isDistributor: () => {
    if (typeof window === "undefined") {
      return false;
    }

    const distributorToken = localStorage.getItem("distributor_token");

    const userType = localStorage.getItem("user_type");

    return Boolean(distributorToken && userType === "distributor");
  },

  /* =======================================================
     CUSTOMER CHECK
  ======================================================= */

  isCustomer: () => {
    if (typeof window === "undefined") {
      return false;
    }

    const customerToken = localStorage.getItem("auth_token");

    const userType = localStorage.getItem("user_type");

    return Boolean(customerToken && userType === "customer");
  },
};

/* =========================================================
   BASE QUERY
========================================================= */

const baseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.markupdesigns.net/indiekonnect/api/",

  prepareHeaders: (headers) => {
    const token = TokenManager.getAccessToken();

    /*
     * Guest:
     * No Authorization header.
     *
     * Logged-in:
     * Send current access token.
     */

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

/* =========================================================
   AUTH SESSION FAILURE
========================================================= */

const redirectAuthenticatedUserToLanding = () => {
  TokenManager.clearTokens();

  if (typeof window !== "undefined") {
    const redirectUrl = getRedirectUrl();

    console.log(`🔄 Auth session expired. Redirecting to: ${redirectUrl}`);

    window.location.href = redirectUrl;
  }
};

/* =========================================================
   BASE QUERY WITH REFRESH TOKEN
========================================================= */

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  /*
   * IMPORTANT:
   *
   * Read access token BEFORE making the request.
   *
   * This allows us to distinguish:
   *
   * Guest request
   *       vs
   * Authenticated request
   */

  const accessTokenBeforeRequest = TokenManager.getAccessToken();

  const hadAccessToken = Boolean(accessTokenBeforeRequest);

  /* =======================================================
     FIRST API REQUEST
  ======================================================= */

  let result = await baseQuery(args, api, extraOptions);

  /* =======================================================
     CASE 1: GUEST USER
     
     No access token existed before request.
     
     If API returns 401:
     
     ✅ Do nothing
     ✅ Do not refresh
     ✅ Do not clear tokens
     ✅ Do not redirect
     
     Guest can continue browsing Indie,
     Products and Product Details.
  ======================================================= */

  if (result.error?.status === 401 && !hadAccessToken) {
    console.log("ℹ️ Guest request returned 401. Staying on current page.");

    return result;
  }

  /* =======================================================
     CASE 2: AUTHENTICATED USER
     
     Access token existed but API returned 401.
     
     This means access token may have expired.
     
     Try refresh token.
  ======================================================= */

  if (result.error?.status === 401 && hadAccessToken) {
    console.log("🔐 Access token expired. Trying refresh token...");

    const refreshToken = TokenManager.getRefreshToken();

    /* =====================================================
       NO REFRESH TOKEN
       
       Authenticated session is no longer valid.
       
       Clear tokens + Landing.
    ===================================================== */

    if (!refreshToken) {
      console.log("❌ No refresh token available. Session expired.");

      redirectAuthenticatedUserToLanding();

      return result;
    }

    try {
      /* ===================================================
         REFRESH TOKEN API
      =================================================== */

      const refreshResult = await baseQuery(
        {
          url: "/user/refresh-token",
          method: "POST",
          body: {
            refresh_token: refreshToken,
          },
        },
        api,
        extraOptions,
      );

      /* ===================================================
         REFRESH TOKEN EXPIRED / INVALID
         
         Both access + refresh session invalid.
         
         Clear + Landing.
      =================================================== */

      if (refreshResult.error?.status === 401) {
        console.log("❌ Refresh token expired/invalid. Logging out.");

        redirectAuthenticatedUserToLanding();

        return result;
      }

      /* ===================================================
         REFRESH API RETURNED DATA
      =================================================== */

      if (refreshResult.data) {
        const data = refreshResult.data as {
          status?: boolean;
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };

        /* ================================================
           REFRESH SUCCESS
        ================================================= */

        if (data.status && data.access_token) {
          console.log("✅ Token refresh successful. Saving new tokens...");

          /*
           * Save new access + refresh token.
           *
           * Existing user_type determines whether
           * customer or distributor token storage
           * is used.
           */

          TokenManager.setTokens(
            data.access_token,
            data.refresh_token || refreshToken,
          );

          /* ==============================================
             RETRY ORIGINAL REQUEST
          ============================================== */

          console.log("🔁 Retrying original API request with new token...");

          result = await baseQuery(args, api, extraOptions);

          /*
           * If retry succeeds:
           *
           * return new API response.
           */

          if (!result.error) {
            console.log(
              "✅ Original API request succeeded after token refresh.",
            );

            return result;
          }

          /*
           * If retry still returns 401,
           * session is no longer valid.
           */

          if (result.error?.status === 401) {
            console.log(
              "❌ Retried request still returned 401. Session expired.",
            );

            redirectAuthenticatedUserToLanding();

            return result;
          }

          return result;
        }
      }

      /* ===================================================
         REFRESH RESPONSE INVALID
      =================================================== */

      console.log("❌ Token refresh failed. Logging out.");

      redirectAuthenticatedUserToLanding();

      return result;
    } catch (error) {
      /* ===================================================
         REFRESH REQUEST ERROR
      =================================================== */

      console.error("❌ Token refresh error:", error);

      redirectAuthenticatedUserToLanding();

      return result;
    }
  }

  /* =======================================================
     NORMAL RESPONSE
  ======================================================= */

  return result;
};

/* =========================================================
   BASE API
========================================================= */

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
    "OrderStatus",
    "Brand",
    "UserProfile",
    "Testimonial",
    "Orders",
    "FAQ",
  ],

  endpoints: () => ({}),
});

/* =========================================================
   EXPORTS
========================================================= */

export { TokenManager, getRedirectUrl };

export default baseApi;
