// src/lib/redux/api/authApi.ts

import { baseApi, TokenManager } from "./baseApi";
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
      invalidatesTags: ["User"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          console.log(
            "🔍 Auth API - Verify OTP Response:",
            JSON.stringify(data, null, 2),
          );
          console.log("🔍 Auth API - is_registered:", data.is_registered);
          console.log(
            "🔍 Auth API - requires_registration:",
            data.requires_registration,
          );
          console.log(
            "🔍 Auth API - token:",
            data.token ? "✅ Present" : "❌ Missing",
          );

          if (data.status) {
            // ✅ Check if user is registered (has token)
            if (data.token && data.is_registered === true) {
              // Store auth token for registered user
              console.log("✅ Auth API - User is REGISTERED, storing tokens");
              TokenManager.setTokens(data.token, data.refresh_token || "");
              if (data.user) {
                TokenManager.setUserData(data.user);
              }
              localStorage.setItem("user_type", "customer");
              localStorage.setItem("is_logged_in", "true");

              // ✅ Redirect to products page
              if (typeof window !== "undefined") {
                console.log("🚀 Auth API - Redirecting to /products");
                window.location.href = "/products";
              }
            }
            // ❌ User is NOT registered - store temp token for registration
            else if (
              data.requires_registration === true ||
              data.is_registered === false
            ) {
              console.log(
                "❌ Auth API - User is NOT REGISTERED, storing temp token",
              );

              if (data.temp_token) {
                localStorage.setItem("temp_token", data.temp_token);
              }
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

              // ✅ Redirect to registration page
              if (typeof window !== "undefined") {
                const phone = data.phone || "";
                console.log(
                  `🚀 Auth API - Redirecting to registration with phone: ${phone}`,
                );
                window.location.href = `/auth/customer/register?phone=${encodeURIComponent(phone)}`;
              }
            }
            // Fallback: If token exists but is_registered flag is ambiguous
            else if (data.token) {
              console.log(
                "⚠️ Auth API - Token exists but ambiguous status, treating as REGISTERED",
              );
              TokenManager.setTokens(data.token, data.refresh_token || "");
              if (data.user) {
                TokenManager.setUserData(data.user);
              }
              localStorage.setItem("user_type", "customer");
              localStorage.setItem("is_logged_in", "true");

              if (typeof window !== "undefined") {
                console.log("🚀 Auth API - Redirecting to /products");
                window.location.href = "/products";
              }
            }
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
            console.log("OTP stored for verification:", data.otp);
          }
        } catch (error) {
          console.error("Send OTP failed:", error);
        }
      },
    }),

    // Confirm Registration - Complete the registration process
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
            // Store auth token and user data after successful registration
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.data?.user) {
              TokenManager.setUserData(data.data.user);
            }
            // Clean up temp tokens
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            console.log("Registration completed successfully");

            // ✅ Redirect to products page after registration
            if (typeof window !== "undefined") {
              console.log(
                "🚀 Auth API - Registration complete, redirecting to /products",
              );
              window.location.href = "/products";
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
            console.log("Token refreshed successfully");
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          TokenManager.clearTokens();
        }
      },
    }),

    // Logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Clear all tokens and user data
          TokenManager.clearTokens();
          console.log("Logout successful");

          // ✅ Redirect to login page after logout
          if (typeof window !== "undefined") {
            console.log(
              "🚀 Auth API - Logout successful, redirecting to login",
            );
            window.location.href = "/auth/customer/login";
          }
        } catch (error) {
          console.error("Logout failed:", error);
          // Even if API call fails, clear local tokens
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/customer/login";
          }
        }
      },
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;

export default authApi;
