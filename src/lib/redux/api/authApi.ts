// src/lib/redux/api/authApi.ts

import { baseApi, TokenManager, getRedirectUrl } from "./baseApi";
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

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Verify OTP
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: "/user/verify-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        return response;
      },
      invalidatesTags: ["User"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          if (!data.status) return;

          // CASE 1: User IS registered (has token)
          if (data.token && data.is_registered === true) {
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.user) TokenManager.setUserData(data.user);
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");

            if (typeof window !== "undefined") {
              setTimeout(() => (window.location.href = "/products"), 100);
            }
            return;
          }

          // CASE 2: User is NOT registered (has temp_token)
          if (data.temp_token && data.is_registered === false) {
            localStorage.setItem("temp_token", data.temp_token);
            if (data.phone) {
              localStorage.setItem("verified_phone", data.phone);
              localStorage.setItem("customer_phone", data.phone);
            }
            localStorage.setItem("user_type", "customer");
            localStorage.setItem(
              "otp_verification_data",
              JSON.stringify({
                phone: data.phone,
                temp_token: data.temp_token,
                verified_at: new Date().toISOString(),
              }),
            );

            if (typeof window !== "undefined") {
              const phone = data.phone || "";
              setTimeout(() => {
                window.location.href = `/auth/customer/register?phone=${encodeURIComponent(phone)}`;
              }, 100);
            }
            return;
          }

          // Fallback for tokens
          if (data.token) {
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.user) TokenManager.setUserData(data.user);
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            if (typeof window !== "undefined") {
              setTimeout(() => (window.location.href = "/products"), 100);
            }
            return;
          }

          if (data.temp_token) {
            localStorage.setItem("temp_token", data.temp_token);
            if (data.phone) {
              localStorage.setItem("verified_phone", data.phone);
              localStorage.setItem("customer_phone", data.phone);
            }

            if (typeof window !== "undefined") {
              const phone = data.phone || "";
              setTimeout(() => {
                window.location.href = `/auth/customer/register?phone=${encodeURIComponent(phone)}`;
              }, 100);
            }
            return;
          }
        } catch (error) {
          console.error("OTP verification failed:", error);
        }
      },
    }),

    // Send OTP
    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => ({
        url: "/user/send-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.status && data.otp) {
            localStorage.setItem("customer_otp", data.otp.toString());
            localStorage.setItem("customer_phone", data.phone);
          }
        } catch (error) {
          console.error("Send OTP failed:", error);
        }
      },
    }),

    // Confirm Registration
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
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.status && data.token) {
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.data?.user) TokenManager.setUserData(data.data.user);
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            if (typeof window !== "undefined") {
              setTimeout(() => (window.location.href = "/products"), 100);
            }
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),

    // Refresh Token
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/user/refresh-token",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.status && data.access_token) {
            TokenManager.setTokens(data.access_token, data.refresh_token);
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          TokenManager.clearTokens();
        }
      },
    }),

    // Logout - ✅ FIX: Dynamic Redirect based on user_type
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          TokenManager.clearTokens();
          console.log("✅ Logout successful");
          if (typeof window !== "undefined") {
            // 🔥 FIX: Redirect to the CORRECT login page based on user type
            window.location.href = getRedirectUrl();
          }
        } catch (error) {
          console.error("Logout failed:", error);
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = getRedirectUrl();
          }
        }
      },
    }),

    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({ url: "/user/profile", method: "GET" }),
      providesTags: ["User"],
    }),

    getDashboard: builder.query<DashboardResponse, void>({
      query: () => ({
        url: "/user/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useGetDashboardQuery
} = authApi;

export default authApi;
