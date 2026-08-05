import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "@/lib/api/endpoints/authApi";
import { usersApi } from "@/lib/api/endpoints/usersApi";
import { dashboardApi } from "@/lib/api/endpoints/dashboardApi";
import authReducer from "./features/auth/authSlice";
import uiReducer from "./features/ui/uiSlice";

// Custom middleware for logging in development only
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Dispatching:", action);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredActionPaths: [
          "payload.user.createdAt",
          "payload.user.updatedAt",
          "payload.createdAt",
          "payload.updatedAt",
          "meta.arg.originalArgs",
          "meta.baseQueryMeta",
        ],
        ignoredPaths: [
          "auth.user.createdAt",
          "auth.user.updatedAt",
          "dashboard.data",
          "users.data",
        ],
      },
      // Important for RTK Query
      immutableCheck: {
        ignoredPaths: ["dashboard.data", "users.data"],
      },
    }).concat(
      // Add logger only in development
      process.env.NODE_ENV === "development" ? loggerMiddleware : [],
      authApi.middleware,
      usersApi.middleware,
      dashboardApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== "production",
  preloadedState: typeof window !== "undefined" ? undefined : undefined,
});

// Enable listeners for refetchOnFocus/refetchOnReconnect
if (typeof window !== "undefined") {
  setupListeners(store.dispatch);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
