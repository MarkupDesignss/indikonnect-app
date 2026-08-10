// src/lib/services/logout.service.ts

import { baseApi } from "../redux/api/baseApi";
import { persistor } from "../redux/store";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Store } from "@reduxjs/toolkit";

export interface LogoutOptions {
  redirectTo?: string;
  callApi?: boolean;
  clearReduxState?: boolean;
  clearPersistedState?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

// Comprehensive cache clearing for RTK Query
export const clearRTKQueryCache = (store: Store) => {
  if (!store) return;

  try {
    // 1. Reset all API state - clears all queries, mutations, and tags
    store.dispatch(baseApi.util.resetApiState());

    // 2. Invalidate all tags - forces refetching
    const allTags = [
      "Distributor",
      "Customer",
      "User",
      "Order",
      "Wishlist",
      "Product",
      "Addresses",
      "Cart",
    ];
    store.dispatch(baseApi.util.invalidateTags(allTags));

    // 3. Remove all cached data manually
    const state = store.getState();
    if (state.api) {
      // Clear query cache
      Object.keys(state.api.queries || {}).forEach((queryKey) => {
        store.dispatch(baseApi.util.removeQueryResult(queryKey));
      });

      // Clear mutation cache
      Object.keys(state.api.mutations || {}).forEach((mutationKey) => {
        store.dispatch(baseApi.util.removeMutationResult(mutationKey));
      });
    }

    console.log("✅ RTK Query cache cleared successfully");
  } catch (error) {
    console.warn("Failed to clear RTK Query cache:", error);
  }
};

// Clear all client-side data including RTK Query
export const clearAllClientData = (store?: Store) => {
  if (typeof window === "undefined") return;

  // 1. Clear RTK Query cache first
  if (store) {
    clearRTKQueryCache(store);
  }

  // 2. Clear localStorage - Remove specific auth keys
  try {
    const keysToRemove = [
      "auth_token",
      "refresh_token",
      "user",
      "persist:root",
      "reduxPersist",
      "userData",
      "session",
      "token",
      "accessToken",
    ];
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    // Optional: Clear all localStorage
    // localStorage.clear();
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }

  // 3. Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn("Failed to clear sessionStorage:", error);
  }

  // 4. Clear cookies
  try {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=; expires=${new Date(0).toUTCString()}; path=/`);
    });
  } catch (error) {
    console.warn("Failed to clear cookies:", error);
  }

  // 5. Clear IndexedDB
  try {
    if (window.indexedDB) {
      indexedDB
        .databases?.()
        .then((dbs) => {
          dbs.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        })
        .catch(() => {
          ["my-app-db", "redux-persist", "firebase", "offline"].forEach(
            (dbName) => {
              try {
                indexedDB.deleteDatabase(dbName);
              } catch (e) {}
            },
          );
        });
    }
  } catch (error) {
    console.warn("Failed to clear IndexedDB:", error);
  }

  // 6. Clear Service Worker Cache
  try {
    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        })
        .catch(() => {});
    }
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }

  console.log("✅ All client data cleared");
};

// Main logout function with store access
export const performLogout = async (
  store: Store,
  router?: AppRouterInstance,
  options: LogoutOptions = {},
) => {
  const {
    redirectTo = "/login",
    callApi = true,
    clearReduxState = true,
    clearPersistedState = true,
    onSuccess,
    onError,
  } = options;

  try {
    // 1. Call logout API if needed
    if (callApi) {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.warn("Logout API failed with status:", response.status);
        }
      } catch (error) {
        console.warn("Logout API call failed:", error);
        // Continue with local logout even if API fails
      }
    }

    // 2. Clear RTK Query cache and all client data
    clearAllClientData(store);

    // 3. Clear persisted state (Redux Persist) - only if persistor exists
    if (clearPersistedState && persistor) {
      try {
        if (typeof persistor.purge === "function") {
          await persistor.purge();
        }
        if (typeof persistor.flush === "function") {
          await persistor.flush();
        }
      } catch (error) {
        console.warn("Failed to purge persisted state:", error);
      }
    }

    // 4. Reset Redux store completely (if you have a reset reducer)
    if (clearReduxState) {
      try {
        store.dispatch({ type: "RESET_APP_STATE" });
      } catch (error) {
        console.warn("Failed to reset Redux state:", error);
      }
    }

    // 5. Clear RTK Query cache again to be safe
    if (store) {
      store.dispatch(baseApi.util.resetApiState());
    }

    // 6. Call success callback
    if (onSuccess) {
      onSuccess();
    }

    // 7. Redirect
    if (router && typeof window !== "undefined") {
      router.push(redirectTo);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }

    console.log("✅ Logout completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);

    // Even if error, try to clear data and redirect
    clearAllClientData(store);
    if (router) {
      router.push(redirectTo);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }

    if (onError) {
      onError(error);
    }

    return { success: false, error };
  }
};

// Force logout without API calls
export const forceLogout = (
  store: Store,
  router?: AppRouterInstance,
  redirectTo = "/login",
) => {
  clearAllClientData(store);
  if (router) {
    router.push(redirectTo);
  } else if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
};
