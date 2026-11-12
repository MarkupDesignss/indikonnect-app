
// src/lib/redux/api/baseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { getAppType, type AppType } from "@/lib/appConfig";

// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://www.markupdesigns.net/indiekonnect/api/";

// =========================================================
// BASE PATH
// =========================================================

const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_BASE_PATH || "";
  }

  const currentAppType = getAppType();

  if (currentAppType === "distributor") {
    return "/indiekonnect-distributor";
  }

  return "/indiekonnect-web";
};

// =========================================================
// LOGIN REDIRECT URL
// =========================================================

const getRedirectUrl = (): string => {
  const appType = getAppType();

  if (appType === "distributor") {
    return `${getBasePath()}/auth/distributor/login/`;
  }

  return `${getBasePath()}/auth/customer/login/`;
};

// =========================================================
// STORAGE KEY CONFIG
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
// CLEAR CUSTOMER SESSION
// =========================================================

const clearCustomerSessionKeys = () => {
  if (typeof window === "undefined") return;

  const keys = [
    "customer_otp",
    "customer_phone",
    "verified_phone",
    "temp_token",
    "customer_otp_verification_data",
  ];

  keys.forEach((key) => localStorage.removeItem(key));
};

// =========================================================
// CLEAR DISTRIBUTOR SESSION
// =========================================================

const clearDistributorSessionKeys = () => {
  if (typeof window === "undefined") return;

  const keys = [
    "distributor_session",
    "distributor_email",
    "distributor_phone",
    "distributor_temp_token",
    "distributor_otp_verification_data",
  ];

  keys.forEach((key) => localStorage.removeItem(key));
};

// =========================================================
// LEGACY AUTH STATE SYNC
// =========================================================

const syncLegacyAuthState = () => {
  if (typeof window === "undefined") return;

  const customerToken = localStorage.getItem(
    APP_STORAGE.customer.accessToken,
  );

  const distributorToken = localStorage.getItem(
    APP_STORAGE.distributor.accessToken,
  );

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

  localStorage.removeItem("user_data");
  localStorage.removeItem("user_type");
  localStorage.removeItem("is_logged_in");
};

// =========================================================
// TOKEN MANAGER
// =========================================================

const TokenManager = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;

    const appType = getAppType();

    return localStorage.getItem(
      APP_STORAGE[appType].accessToken,
    );
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;

    const appType = getAppType();

    return localStorage.getItem(
      APP_STORAGE[appType].refreshToken,
    );
  },

  setTokens: (
    accessToken: string,
    refreshToken: string,
    explicitAppType?: AppType,
  ) => {
    if (typeof window === "undefined") return;

    const currentAppType = getAppType();

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

    localStorage.setItem("user_type", appType);
    localStorage.setItem("is_logged_in", "true");
  },

  clearTokens: (explicitAppType?: AppType) => {
    if (typeof window === "undefined") return;

    const appType = explicitAppType || getAppType();
    const storage = APP_STORAGE[appType];

    localStorage.removeItem(storage.accessToken);
    localStorage.removeItem(storage.refreshToken);
    localStorage.removeItem(storage.userData);
    localStorage.removeItem(storage.userType);
    localStorage.removeItem(storage.loggedIn);

    if (appType === "customer") {
      clearCustomerSessionKeys();
    } else {
      clearDistributorSessionKeys();
    }

    syncLegacyAuthState();
  },

  getUserData: () => {
    if (typeof window === "undefined") return null;

    const appType = getAppType();
    const storage = APP_STORAGE[appType];

    const userData = localStorage.getItem(storage.userData);

    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }

    const legacyUserData = localStorage.getItem("user_data");

    if (!legacyUserData) return null;

    try {
      return JSON.parse(legacyUserData);
    } catch {
      return null;
    }
  },

  setUserData: (userData: any) => {
    if (typeof window === "undefined") return;

    const appType = getAppType();
    const storage = APP_STORAGE[appType];

    const serialized = JSON.stringify(userData);

    localStorage.setItem(storage.userData, serialized);
    localStorage.setItem("user_data", serialized);
    localStorage.setItem("user_type", appType);
    localStorage.setItem("is_logged_in", "true");
  },

  getUserType: () => {
    if (typeof window === "undefined") return null;

    const appType = getAppType();
    const accessToken = TokenManager.getAccessToken();

    if (!accessToken) return null;

    return appType;
  },

  isDistributor: () => {
    if (typeof window === "undefined") return false;

    return (
      getAppType() === "distributor" &&
      Boolean(
        localStorage.getItem(
          APP_STORAGE.distributor.accessToken,
        ),
      )
    );
  },

  isCustomer: () => {
    if (typeof window === "undefined") return false;

    return (
      getAppType() === "customer" &&
      Boolean(
        localStorage.getItem(
          APP_STORAGE.customer.accessToken,
        ),
      )
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
// AUTH SESSION FAILURE / 401 REDIRECT
// =========================================================

const redirectAuthenticatedUserToLanding = () => {
  if (typeof window === "undefined") return;

  const redirectUrl = getRedirectUrl();

  // Clear only current app session
  TokenManager.clearTokens(getAppType());

  // Prevent redirect loop on login page
  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";

  const targetPath =
    new URL(redirectUrl, window.location.origin).pathname.replace(/\/+$/, "");

  if (currentPath === targetPath) {
    return;
  }

  // Redirect to correct login page
  window.location.replace(redirectUrl);
};

// =========================================================
// BASE QUERY WITH 401 HANDLING
// =========================================================

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Any API returning HTTP 401 → Login redirect
  if (result.error?.status === 401) {
    redirectAuthenticatedUserToLanding();
  }

  return result;
};

// =========================================================
// BASE API
// =========================================================

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    // GLOBAL / LEGACY
    "Distributor",
    "Customer",
    "User",
    "UserProfile",
    "Order",
    "Orders",
    "OrderStatus",
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
    "Brand",
    "Testimonial",
    "FAQ",
    "UserDashboard",
    "AvailablePlacements",
    "MyAccounts",
    "TCBankDashboard",

    // DISTRIBUTOR AUTH / KYC FLOW
    "DistributorCheckStatus",
    "DistributorCheckDistributor",
    "DistributorStepData",
    "DistributorPersonal",
    "DistributorSponsor",
    "DistributorAadhaar",
    "DistributorPAN",
    "DistributorBank",
    "DistributorLocation",
    "DistributorSubmit",
    "ForgotPassword",
    "ResetPassword",
    "DistributorPendingPlacements",

    // CORRECTION / ADMIN REQUESTS
    "Correction",

    // OPTIONAL
    "Notifications",
    "KYCStatus",
    "PaymentGatewaySettings",
  ],

  endpoints: () => ({}),
});

// =========================================================
// EXPORTS
// =========================================================

export { TokenManager, getRedirectUrl };

export default baseApi;
