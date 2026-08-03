import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/lib/api/endpoints/authApi';
import { usersApi } from '@/lib/api/endpoints/usersApi';
import { dashboardApi } from '@/lib/api/endpoints/dashboardApi';
import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';

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
        ignoredActions: ['persist/PERSIST'],
        ignoredActionPaths: ['payload.user.createdAt', 'payload.user.updatedAt'],
      },
    }).concat(
      authApi.middleware,
      usersApi.middleware,
      dashboardApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;