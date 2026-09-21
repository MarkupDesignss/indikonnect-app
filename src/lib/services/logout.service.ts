// src/lib/services/logout.service.ts

"use client";

import { baseApi } from "../redux/api/baseApi";
import { persistor } from "../redux/store";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Store } from "@reduxjs/toolkit";

import { getAppType, type AppType } from "../appConfig";

export interface LogoutOptions {
  redirectTo?: string;
  callApi?: boolean;
  clearReduxState?: boolean;
  clearPersistedState?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * ---------------------------------------------------------
 * BASE PATH
 * ---------------------------------------------------------
 *
 * Supports deployments such as:
 *
 * https://customer.domain.com/
 * https://customer.domain.com/indiekonnect-web/
 */
const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const pathname = window.location.pathname;

  if (pathname.startsWith("/indiekonnect-web")) {
    return "/indiekonnect-web";
  }

  return "";
};

/**
 * ---------------------------------------------------------
 * DEFAULT REDIRECT
 * ---------------------------------------------------------
 *
 * Redirects to the HOME of the CURRENT domain.
 *
 * Customer:
 * customer.domain.com/
 *
 * Distributor:
 * distributor.domain.com/
 */
const getRedirectUrl = (): string => {
  const basePath = getBasePath();

  return basePath ? `${basePath}/` : "/";
};

/**
 * ---------------------------------------------------------
 * CURRENT APP TYPE
 * ---------------------------------------------------------
 */
const getCurrentAppType = (): AppType => {
  if (typeof window === "undefined") {
    return "customer";
  }

  return getAppType();
};

/**
 * ---------------------------------------------------------
 * CURRENT APP TOKEN
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 * We never use:
 *
 * auth_token || distributor_token
 *
 * because that could accidentally send the wrong token
 * to the logout API.
 */
const getCurrentAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const appType = getCurrentAppType();

  if (appType === "distributor") {
    return localStorage.getItem("distributor_token");
  }

  return localStorage.getItem("auth_token");
};

/**
 * ---------------------------------------------------------
 * CLEAR RTK QUERY CACHE
 * ---------------------------------------------------------
 */
export const clearRTKQueryCache = (store: Store) => {
  if (!store) {
    return;
  }

  try {
    // Complete RTK Query cache reset.
    store.dispatch(baseApi.util.resetApiState());
  } catch {
    // Ignore cache reset failures during logout.
  }
};

/**
 * ---------------------------------------------------------
 * APP-SPECIFIC LOCAL STORAGE KEYS
 * ---------------------------------------------------------
 */
const getAppStorageKeys = (appType: AppType): string[] => {
  const commonKeys = [
    "user_data",
    "user_type",
    "is_logged_in",

    "persist:root",
    "reduxPersist",

    "userData",
    "session",

    "cart",
    "wishlist",

    "temp_token",

    "user",
    "auth",
    "login",

    "token",
    "accessToken",
    "token_expiry",
  ];

  if (appType === "distributor") {
    return [
      ...commonKeys,

      "distributor_token",
      "distributor_refresh_token",

      "distributor_session",
      "distributor_email",
      "distributor_phone",
      "distributor_profile",
    ];
  }

  return [
    ...commonKeys,

    "auth_token",
    "refresh_token",

    "customer_otp",
    "customer_phone",
    "verified_phone",
  ];
};

/**
 * ---------------------------------------------------------
 * CLEAR LOCAL STORAGE
 * ---------------------------------------------------------
 */
const clearAppLocalStorage = (appType: AppType) => {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove = getAppStorageKeys(appType);

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore individual key failures.
    }
  });
};

/**
 * ---------------------------------------------------------
 * CLEAR SESSION STORAGE
 * ---------------------------------------------------------
 *
 * sessionStorage is already origin-scoped, so this only
 * affects the CURRENT customer/distributor domain.
 * ---------------------------------------------------------
 */
const clearAppSessionStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.clear();
  } catch {
    // Ignore sessionStorage failures.
  }
};

/**
 * ---------------------------------------------------------
 * CLEAR CURRENT DOMAIN COOKIES
 * ---------------------------------------------------------
 */
const clearAppCookies = () => {
  if (typeof document === "undefined") {
    return;
  }

  try {
    const cookies = document.cookie.split(";");

    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0]?.trim();

      if (!cookieName) {
        return;
      }

      document.cookie = `${cookieName}=;expires=${new Date(
        0,
      ).toUTCString()};path=/`;

      document.cookie = `${cookieName}=;expires=${new Date(
        0,
      ).toUTCString()};path=/indiekonnect-web`;
    });
  } catch {
    // Ignore cookie cleanup failures.
  }
};

/**
 * ---------------------------------------------------------
 * CLEAR CURRENT ORIGIN INDEXED DB
 * ---------------------------------------------------------
 */
const clearAppIndexedDB = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (!("indexedDB" in window)) {
    return;
  }

  try {
    if (typeof indexedDB.databases === "function") {
      indexedDB
        .databases()
        .then((databases) => {
          databases.forEach((database) => {
            if (!database.name) {
              return;
            }

            try {
              indexedDB.deleteDatabase(database.name);
            } catch {
              // Ignore individual DB failures.
            }
          });
        })
        .catch(() => {
          const fallbackDatabases = [
            "my-app-db",
            "redux-persist",
            "firebase",
            "offline",
          ];

          fallbackDatabases.forEach((dbName) => {
            try {
              indexedDB.deleteDatabase(dbName);
            } catch {
              // Ignore individual DB failures.
            }
          });
        });
    }
  } catch {
    // Ignore IndexedDB failures.
  }
};

/**
 * ---------------------------------------------------------
 * CLEAR CURRENT ORIGIN CACHE STORAGE
 * ---------------------------------------------------------
 */
const clearAppCaches = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (!("caches" in window)) {
    return;
  }

  try {
    caches
      .keys()
      .then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          try {
            caches.delete(cacheName);
          } catch {
            // Ignore individual cache failures.
          }
        });
      })
      .catch(() => {
        // Ignore cache cleanup failures.
      });
  } catch {
    // Ignore cache API failures.
  }
};

/**
 * ---------------------------------------------------------
 * CLEAR ALL CLIENT DATA
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 *
 * This function only operates on the CURRENT ORIGIN.
 *
 * Customer:
 * https://customer.example.com
 *
 * Distributor:
 * https://distributor.example.com
 *
 * These are separate browser origins, so clearing storage
 * here does not clear storage from the other domain.
 */
export const clearAllClientData = (store?: Store) => {
  if (typeof window === "undefined") {
    return;
  }

  const currentAppType = getCurrentAppType();

  // 1. Clear RTK Query state.
  if (store) {
    clearRTKQueryCache(store);
  }

  // 2. Clear only the current app's auth/session keys.
  clearAppLocalStorage(currentAppType);

  // 3. Clear current origin sessionStorage.
  clearAppSessionStorage();

  // 4. Clear current domain cookies.
  clearAppCookies();

  // 5. Clear current origin IndexedDB.
  clearAppIndexedDB();

  // 6. Clear current origin Cache Storage.
  clearAppCaches();
};

/**
 * ---------------------------------------------------------
 * MAIN LOGOUT
 * ---------------------------------------------------------
 */
export const performLogout = async (
  store: Store,
  router?: AppRouterInstance,
  options: LogoutOptions = {},
) => {
  const defaultRedirect = getRedirectUrl();

  const {
    redirectTo = defaultRedirect,
    callApi = true,
    clearReduxState = true,
    clearPersistedState = true,
    onSuccess,
    onError,
  } = options;

  try {
    /**
     * -----------------------------------------------------
     * CURRENT APP TYPE
     * -----------------------------------------------------
     */
    const currentAppType = getCurrentAppType();

    /**
     * -----------------------------------------------------
     * CURRENT APP TOKEN ONLY
     * -----------------------------------------------------
     */
    const token = getCurrentAccessToken();

    /**
     * -----------------------------------------------------
     * CALL LOGOUT API
     * -----------------------------------------------------
     *
     * Only send the token belonging to the current domain.
     */
    if (callApi && token) {
      try {
        const apiBaseUrl = (
          process.env.NEXT_PUBLIC_API_URL ||
          "https://www.markupdesigns.net/indikonnect/api/"
        ).replace(/\/+$/, "");

        const response = await fetch(`${apiBaseUrl}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // We intentionally continue local cleanup even
        // when backend logout fails.
        if (!response.ok) {
          // No user-facing action required here.
        }
      } catch {
        // Continue local logout even if API fails.
      }
    }

    /**
     * -----------------------------------------------------
     * CLEAR CLIENT DATA
     * -----------------------------------------------------
     */
    clearAllClientData(store);

    /**
     * -----------------------------------------------------
     * CLEAR REDUX PERSIST
     * -----------------------------------------------------
     */
    if (clearPersistedState && persistor) {
      try {
        if (typeof persistor.flush === "function") {
          await persistor.flush();
        }

        if (typeof persistor.purge === "function") {
          await persistor.purge();
        }
      } catch {
        // Ignore persistence cleanup failures.
      }
    }

    /**
     * -----------------------------------------------------
     * RESET REDUX STORE
     * -----------------------------------------------------
     */
    if (clearReduxState) {
      try {
        store.dispatch({
          type: "RESET_APP_STATE",
        });
      } catch {
        // Ignore Redux reset failures.
      }
    }

    /**
     * -----------------------------------------------------
     * RESET RTK QUERY ONE MORE TIME
     * -----------------------------------------------------
     */
    try {
      store.dispatch(baseApi.util.resetApiState());
    } catch {
      // Ignore RTK reset failures.
    }

    /**
     * -----------------------------------------------------
     * SUCCESS CALLBACK
     * -----------------------------------------------------
     */
    if (onSuccess) {
      try {
        onSuccess();
      } catch {
        // Ignore callback errors.
      }
    }

    /**
     * -----------------------------------------------------
     * REDIRECT
     * -----------------------------------------------------
     *
     * "/" means HOME OF THE CURRENT DOMAIN.
     *
     * Customer:
     * customer.domain.com/
     *
     * Distributor:
     * distributor.domain.com/
     */
    if (typeof window !== "undefined") {
      if (router) {
        router.push(redirectTo);
      } else {
        window.location.href = redirectTo;
      }
    }

    return {
      success: true,
      appType: currentAppType,
    };
  } catch (error) {
    /**
     * -----------------------------------------------------
     * FALLBACK CLEANUP
     * -----------------------------------------------------
     */
    try {
      clearAllClientData(store);
    } catch {
      // Ignore cleanup failure.
    }

    if (typeof window !== "undefined") {
      if (router) {
        router.push(redirectTo || "/");
      } else {
        window.location.href = redirectTo || "/";
      }
    }

    if (onError) {
      try {
        onError(error);
      } catch {
        // Ignore callback error.
      }
    }

    return {
      success: false,
      error,
    };
  }
};

/**
 * ---------------------------------------------------------
 * FORCE LOGOUT
 * ---------------------------------------------------------
 *
 * No logout API call.
 * Immediately clears current app data and redirects.
 */
export const forceLogout = (
  store: Store,
  router?: AppRouterInstance,
  redirectTo?: string,
) => {
  const finalRedirect = redirectTo || getRedirectUrl();

  clearAllClientData(store);

  if (typeof window !== "undefined") {
    if (router) {
      router.push(finalRedirect);
    } else {
      window.location.href = finalRedirect;
    }
  }
};
