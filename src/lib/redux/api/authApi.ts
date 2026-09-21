// src/lib/redux/api/authApi.ts

"use client";

import { baseApi, TokenManager, getRedirectUrl } from "./baseApi";

import { getAppType, getAppBasePath } from "@/lib/appConfig";

import {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ConfirmRegistrationRequest,
  ConfirmRegistrationResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  UserProfileResponse,
  DashboardResponse,
} from "./authtype";

// =====================================================
// CUSTOMER APP CHECK
// =====================================================

const isCustomerApp = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return getAppType() === "customer";
};

// =====================================================
// CUSTOMER ROUTE BUILDER
// =====================================================

const getCustomerRoute = (path: string): string => {
  const basePath = getAppBasePath();

  const normalizedBasePath = basePath.replace(/\/+$/, "");

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBasePath}${normalizedPath}`;
};

// =====================================================
// CUSTOMER AUTH API
// =====================================================

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =================================================
    // VERIFY OTP
    // =================================================

    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: "/user/verify-otp",
        method: "POST",
        body: data,
      }),

      transformResponse: (response: VerifyOTPResponse) => {
        return response;
      },

      invalidatesTags: ["User"],

      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          if (!data.status) {
            return;
          }

          // This API is only for customer authentication.
          if (!isCustomerApp()) {
            return;
          }

          // =================================================
          // CASE 1:
          // REGISTERED CUSTOMER
          // =================================================

          if (data.token && data.is_registered === true) {
            TokenManager.setTokens(
              data.token,
              data.refresh_token || "",
              "customer",
            );

            if (data.user) {
              TokenManager.setUserData(data.user);
            }

            // Legacy compatibility
            localStorage.setItem("user_type", "customer");

            localStorage.setItem("is_logged_in", "true");

            localStorage.removeItem("temp_token");

            localStorage.removeItem("verified_phone");

            localStorage.removeItem("customer_otp_verification_data");

            window.location.href = getRedirectUrl();

            return;
          }

          // =================================================
          // CASE 2:
          // CUSTOMER NOT REGISTERED
          // TEMP TOKEN RECEIVED
          // =================================================

          if (data.temp_token && data.is_registered === false) {
            localStorage.setItem("temp_token", data.temp_token);

            if (data.phone) {
              localStorage.setItem("verified_phone", data.phone);

              localStorage.setItem("customer_phone", data.phone);
            }

            localStorage.setItem("user_type", "customer");

            localStorage.setItem(
              "customer_otp_verification_data",
              JSON.stringify({
                phone: data.phone,
                temp_token: data.temp_token,
                verified_at: new Date().toISOString(),
              }),
            );

            const phone = data.phone || "";

            const registerUrl = getCustomerRoute(
              `/auth/customer/register?phone=${encodeURIComponent(phone)}`,
            );

            window.location.href = registerUrl;

            return;
          }

          // =================================================
          // FALLBACK: TOKEN
          // =================================================

          if (data.token) {
            TokenManager.setTokens(
              data.token,
              data.refresh_token || "",
              "customer",
            );

            if (data.user) {
              TokenManager.setUserData(data.user);
            }

            localStorage.setItem("user_type", "customer");

            localStorage.setItem("is_logged_in", "true");

            window.location.href = getRedirectUrl();

            return;
          }

          // =================================================
          // FALLBACK: TEMP TOKEN
          // =================================================

          if (data.temp_token) {
            localStorage.setItem("temp_token", data.temp_token);

            if (data.phone) {
              localStorage.setItem("verified_phone", data.phone);

              localStorage.setItem("customer_phone", data.phone);
            }

            localStorage.setItem(
              "customer_otp_verification_data",
              JSON.stringify({
                phone: data.phone,
                temp_token: data.temp_token,
                verified_at: new Date().toISOString(),
              }),
            );

            const phone = data.phone || "";

            const registerUrl = getCustomerRoute(
              `/auth/customer/register?phone=${encodeURIComponent(phone)}`,
            );

            window.location.href = registerUrl;
          }
        } catch {
          // OTP verification failure
          // is handled by the mutation caller/UI.
        }
      },
    }),

    // =================================================
    // SEND OTP
    // =================================================

    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => ({
        url: "/user/send-otp",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["User"],

      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          if (!isCustomerApp()) {
            return;
          }

          if (data.status && data.otp) {
            localStorage.setItem("customer_otp", data.otp.toString());
          }

          if (data.phone) {
            localStorage.setItem("customer_phone", data.phone);
          }
        } catch {
          // Caller handles mutation error.
        }
      },
    }),

    // =================================================
    // CONFIRM REGISTRATION
    // =================================================

    confirmRegistration: builder.mutation<
      ConfirmRegistrationResponse,
      ConfirmRegistrationRequest
    >({
      query: (data) => ({
        url: "/user/confirm_registration",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),

      invalidatesTags: ["User"],

      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          if (!isCustomerApp()) {
            return;
          }

          if (data.status && data.token) {
            TokenManager.setTokens(
              data.token,
              data.refresh_token || "",
              "customer",
            );

            if (data.data?.user) {
              TokenManager.setUserData(data.data.user);
            }

            // Clear customer temporary registration data
            localStorage.removeItem("temp_token");

            localStorage.removeItem("verified_phone");

            localStorage.removeItem("customer_phone");

            localStorage.removeItem("customer_otp");

            localStorage.removeItem("customer_otp_verification_data");

            // Legacy compatibility
            localStorage.setItem("user_type", "customer");

            localStorage.setItem("is_logged_in", "true");

            window.location.href = getRedirectUrl();
          }
        } catch {
          // Caller handles registration errors.
        }
      },
    }),

    // =================================================
    // REFRESH TOKEN
    // =================================================

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/user/refresh-token",
        method: "POST",
        body: data,
      }),

      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          // Customer refresh only.
          if (!isCustomerApp()) {
            return;
          }

          if (data.status && data.access_token) {
            TokenManager.setTokens(
              data.access_token,
              data.refresh_token || "",
              "customer",
            );
          }
        } catch {
          // Clear only customer authentication.
          if (isCustomerApp()) {
            TokenManager.clearTokens("customer");
          }
        }
      },
    }),

    // =================================================
    // LOGOUT
    // =================================================

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),

      invalidatesTags: ["User"],

      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;

          if (!isCustomerApp()) {
            return;
          }

          // Clear only customer session.
          TokenManager.clearTokens("customer");

          window.location.href = getRedirectUrl();
        } catch {
          // Even if backend logout fails,
          // local customer authentication must
          // still be removed.

          if (isCustomerApp()) {
            TokenManager.clearTokens("customer");

            window.location.href = getRedirectUrl();
          }
        }
      },
    }),

    // =================================================
    // GET USER PROFILE
    // =================================================

    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),

      providesTags: ["User"],
    }),

    // =================================================
    // GET DASHBOARD
    // =================================================

    getDashboard: builder.query<DashboardResponse, void>({
      query: () => ({
        url: "/user/dashboard",
        method: "GET",
      }),

      providesTags: ["Dashboard"],
    }),
  }),
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useGetDashboardQuery,
} = authApi;

export default authApi;
