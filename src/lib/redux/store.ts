import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import toastReducer from "../slices/toastSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      toast: toastReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: { ignoredActions: ["persist/PERSIST"] },
      }).concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
