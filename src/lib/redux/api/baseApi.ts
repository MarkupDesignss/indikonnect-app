// src/lib/redux/api/baseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { getAppType, getAppBasePath, type AppType } from "@/lib/appConfig";

// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://www.markupdesigns.net/indiekonnect/api/";

// =========================================================
// BASE PATH
// =========================================================
//
// Customer:
// /indiekonnect-web
//
// Distributor:
// /indiekonnect-distributor
//
// During production static builds, NEXT_PUBLIC_APP_BASE_PATH
// is available at build time.
//
// =========================================================

const getBasePath = (): string => {
  if (typeof window === "undefined") {
    const buildBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH || "";

    return buildBasePath;
  }

  const pathname = window.location.pathname;

  const currentAppType = getAppType();

  if (currentAppType === "distributor") {
    return "/indiekonnect-distributor";
  }

  if (pathname.includes("/indiekonnect-web")) {
    return "/indiekonnect-web";
  }

  return "/indiekonnect-web";
};

// =========================================================
// REDIRECT URL
// =========================================================
//
// Customer:
// /indiekonnect-web/
//
// Distributor:
// /indiekonnect-distributor/
//
// =========================================================

const getRedirectUrl = (): string => {
  return `${getBasePath()}/`;
};

// =========================================================
// STORAGE KEY CONFIG
// =========================================================
//
// IMPORTANT:
//
// Same-origin deployment means both applications share
// localStorage.
//
// Therefore authentication keys must remain separate.
//
// Customer:
// auth_token
// refresh_token
//
// Distributor:
// distributor_token
// distributor_refresh_token
//
// User data is also namespaced so distributor data cannot
// overwrite customer data.
// =========================================================

type AppStorageConfig = {
  accessToken: string;
  refreshToken: string;
  userData: string;
  userType: string;
  loggedIn: string;
};

const APP_STORAGE: Record<AppType, AppStorageConfig> = {
  customer: {
    accessToken: "auth_token",
    refreshToken: "refresh_token",
    userData: "customer_user_data",
    userType: "customer_user_type",
    loggedIn: "customer_is_logged_in",
  },

  distributor: {
    accessToken: "distributor_token",
    refreshToken: "distributor_refresh_token",
    userData: "distributor_user_data",
    userType: "distributor_user_type",
    loggedIn: "distributor_is_logged_in",
  },
};

// =========================================================
// APP-SPECIFIC TEMP / SESSION KEYS
// =========================================================

const clearCustomerSessionKeys = () => {
  if (typeof window === "undefined") {
    return;
  }

  const keys = [
    "customer_otp",
    "customer_phone",
    "verified_phone",
    "temp_token",
    "customer_otp_verification_data",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const clearDistributorSessionKeys = () => {
  if (typeof window === "undefined") {
    return;
  }

  const keys = [
    "distributor_session",
    "distributor_email",
    "distributor_phone",
    "distributor_temp_token",
    "distributor_otp_verification_data",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};

// =========================================================
// LEGACY AUTH STATE SYNC
// =========================================================
//
// Existing parts of the application may still read:
//
// user_data
// user_type
// is_logged_in
//
// We keep these keys for backward compatibility.
//
// But their values always represent the currently active
// app's session.
//
// If the current app logs out and the other app is still
// logged in, the legacy values are restored from the
// remaining app's namespaced storage.
// =========================================================

const syncLegacyAuthState = () => {
  if (typeof window === "undefined") {
    return;
  }

  const customerToken = localStorage.getItem(APP_STORAGE.customer.accessToken);

  const distributorToken = localStorage.getItem(
    APP_STORAGE.distributor.accessToken,
  );

  // Distributor still logged in.
  if (distributorToken) {
    const distributorUserData = localStorage.getItem(
      APP_STORAGE.distributor.userData,
    );

    localStorage.setItem("user_type", "distributor");

    localStorage.setItem("is_logged_in", "true");

    if (distributorUserData) {
      localStorage.setItem("user_data", distributorUserData);
    } else {
      localStorage.removeItem("user_data");
    }

    return;
  }

  // Customer still logged in.
  if (customerToken) {
    const customerUserData = localStorage.getItem(
      APP_STORAGE.customer.userData,
    );

    localStorage.setItem("user_type", "customer");

    localStorage.setItem("is_logged_in", "true");

    if (customerUserData) {
      localStorage.setItem("user_data", customerUserData);
    } else {
      localStorage.removeItem("user_data");
    }

    return;
  }

  // No authenticated app remains.
  localStorage.removeItem("user_data");

  localStorage.removeItem("user_type");

  localStorage.removeItem("is_logged_in");
};

// =========================================================
// TOKEN MANAGER
// =========================================================

const TokenManager = {
  // =======================================================
  // GET ACCESS TOKEN
  // =======================================================

  getAccessToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const appType = getAppType();

    return localStorage.getItem(APP_STORAGE[appType].accessToken);
  },

  // =======================================================
  // GET REFRESH TOKEN
  // =======================================================

  getRefreshToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const appType = getAppType();

    return localStorage.getItem(APP_STORAGE[appType].refreshToken);
  },

  // =======================================================
  // SET TOKENS
  // =======================================================
  //
  // IMPORTANT:
  //
  // Never delete the opposite application's token.
  //
  // Customer login can coexist with distributor login.
  // Distributor login can coexist with customer login.
  // =======================================================

  setTokens: (
    accessToken: string,
    refreshToken: string,
    explicitAppType?: AppType,
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    const currentAppType = getAppType();

    // If caller explicitly says which app token this is,
    // make sure it matches the current app.
    if (explicitAppType && explicitAppType !== currentAppType) {
      return;
    }

    const appType = explicitAppType || currentAppType;

    const storage = APP_STORAGE[appType];

    localStorage.setItem(storage.accessToken, accessToken);

    if (refreshToken) {
      localStorage.setItem(storage.refreshToken, refreshToken);
    } else {
      localStorage.removeItem(storage.refreshToken);
    }

    localStorage.setItem(storage.userType, appType);

    localStorage.setItem(storage.loggedIn, "true");

    // Keep existing components compatible.
    localStorage.setItem("user_type", appType);

    localStorage.setItem("is_logged_in", "true");
  },

  // =======================================================
  // CLEAR TOKENS
  // =======================================================
  //
  // Only the CURRENT application's auth/session is removed.
  // =======================================================

  clearTokens: (explicitAppType?: AppType) => {
    if (typeof window === "undefined") {
      return;
    }

    const appType = explicitAppType || getAppType();

    const storage = APP_STORAGE[appType];

    // Current app's authentication.
    localStorage.removeItem(storage.accessToken);

    localStorage.removeItem(storage.refreshToken);

    localStorage.removeItem(storage.userData);

    localStorage.removeItem(storage.userType);

    localStorage.removeItem(storage.loggedIn);

    // Current app specific data.
    if (appType === "customer") {
      clearCustomerSessionKeys();
    } else {
      clearDistributorSessionKeys();
    }

    // Restore common legacy state from the
    // other application if it is still logged in.
    syncLegacyAuthState();
  },

  // =======================================================
  // GET USER DATA
  // =======================================================

  getUserData: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const appType = getAppType();

    const storage = APP_STORAGE[appType];

    const userData = localStorage.getItem(storage.userData);

    // Current app's namespaced data.
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }

    // Backward compatibility.
    const legacyUserData = localStorage.getItem("user_data");

    if (!legacyUserData) {
      return null;
    }

    try {
      return JSON.parse(legacyUserData);
    } catch {
      return null;
    }
  },

  // =======================================================
  // SET USER DATA
  // =======================================================

  setUserData: (userData: any) => {
    if (typeof window === "undefined") {
      return;
    }

    const appType = getAppType();

    const storage = APP_STORAGE[appType];

    const serialized = JSON.stringify(userData);

    // App-specific user data.
    localStorage.setItem(storage.userData, serialized);

    // Backward compatibility for existing components.
    localStorage.setItem("user_data", serialized);

    localStorage.setItem("user_type", appType);

    localStorage.setItem("is_logged_in", "true");
  },

  // =======================================================
  // USER TYPE
  // =======================================================

  getUserType: () => {
    if (typeof window === "undefined") {
      return null;
    }

    const appType = getAppType();

    const accessToken = TokenManager.getAccessToken();

    if (!accessToken) {
      return null;
    }

    return appType;
  },

  // =======================================================
  // DISTRIBUTOR CHECK
  // =======================================================

  isDistributor: () => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      getAppType() === "distributor" &&
      Boolean(localStorage.getItem(APP_STORAGE.distributor.accessToken))
    );
  },

  // =======================================================
  // CUSTOMER CHECK
  // =======================================================

  isCustomer: () => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      getAppType() === "customer" &&
      Boolean(localStorage.getItem(APP_STORAGE.customer.accessToken))
    );
  },
};

// =========================================================
// AUTH HEADERS
// =========================================================

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders: (headers) => {
    const token = TokenManager.getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

// =========================================================
// REFRESH REQUEST
// =========================================================
//
// Uses a separate baseQuery so the expired access token is
// NOT automatically attached to the refresh request.
// =========================================================

const refreshBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");

    return headers;
  },
});

// =========================================================
// AUTH SESSION FAILURE
// =========================================================

const redirectAuthenticatedUserToLanding = () => {
  TokenManager.clearTokens();

  if (typeof window !== "undefined") {
    window.location.href = getRedirectUrl();
  }
};

// =========================================================
// BASE QUERY WITH REFRESH TOKEN
// =========================================================

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // -------------------------------------------------------
  // TOKEN STATE BEFORE REQUEST
  // -------------------------------------------------------

  const accessTokenBeforeRequest = TokenManager.getAccessToken();

  const hadAccessToken = Boolean(accessTokenBeforeRequest);

  // -------------------------------------------------------
  // FIRST REQUEST
  // -------------------------------------------------------

  let result = await baseQuery(args, api, extraOptions);

  // -------------------------------------------------------
  // GUEST + 401
  // -------------------------------------------------------
  //
  // Public APIs may return 401.
  // Do not refresh, clear or redirect a guest.
  // -------------------------------------------------------

  if (result.error?.status === 401 && !hadAccessToken) {
    return result;
  }

  // -------------------------------------------------------
  // AUTHENTICATED + 401
  // -------------------------------------------------------

  if (result.error?.status === 401 && hadAccessToken) {
    const refreshToken = TokenManager.getRefreshToken();

    // -----------------------------------------------------
    // NO REFRESH TOKEN
    // -----------------------------------------------------

    if (!refreshToken) {
      redirectAuthenticatedUserToLanding();

      return result;
    }

    try {
      // ---------------------------------------------------
      // REFRESH TOKEN REQUEST
      // ---------------------------------------------------

      const refreshResult = await refreshBaseQuery(
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

      // ---------------------------------------------------
      // REFRESH FAILED
      // ---------------------------------------------------

      if (refreshResult.error) {
        if (refreshResult.error.status === 401) {
          redirectAuthenticatedUserToLanding();

          return result;
        }

        redirectAuthenticatedUserToLanding();

        return result;
      }

      // ---------------------------------------------------
      // REFRESH RESPONSE
      // ---------------------------------------------------

      if (refreshResult.data) {
        const data = refreshResult.data as {
          status?: boolean;
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        if (data.status && data.access_token) {
          const currentAppType = getAppType();

          TokenManager.setTokens(
            data.access_token,
            data.refresh_token || refreshToken,
            currentAppType,
          );

          // ------------------------------------------------
          // RETRY ORIGINAL REQUEST
          // ------------------------------------------------

          result = await baseQuery(args, api, extraOptions);

          // ------------------------------------------------
          // RETRY SUCCESS
          // ------------------------------------------------

          if (!result.error) {
            return result;
          }

          // ------------------------------------------------
          // RETRY STILL 401
          // ------------------------------------------------

          if (result.error?.status === 401) {
            redirectAuthenticatedUserToLanding();

            return result;
          }

          return result;
        }
      }

      // ---------------------------------------------------
      // INVALID REFRESH RESPONSE
      // ---------------------------------------------------

      redirectAuthenticatedUserToLanding();

      return result;
    } catch {
      redirectAuthenticatedUserToLanding();

      return result;
    }
  }

  // -------------------------------------------------------
  // NORMAL RESPONSE
  // -------------------------------------------------------

  return result;
};

// =========================================================
// BASE API
// =========================================================

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

// =========================================================
// EXPORTS
// =========================================================

export { TokenManager, getRedirectUrl };

export default baseApi;
