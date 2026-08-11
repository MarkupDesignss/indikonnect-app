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
  UserProfileResponse,
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
      // ✅ transformResponse - runs before onQueryStarted
      transformResponse: (response: any, meta, arg) => {
        console.log("🔴🔴🔴 TRANSFORM RESPONSE CALLED");
        console.log("📦 Raw Response:", JSON.stringify(response, null, 2));
        console.log("📌 Response status:", response.status);
        console.log("📌 is_registered:", response.is_registered);
        console.log("📌 token exists:", !!response.token);
        console.log("📌 temp_token exists:", !!response.temp_token);

        // Return the response unchanged
        return response;
      },
      invalidatesTags: ["User"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢🟢🟢 ON QUERY STARTED - verifyOTP called with:", arg);

        try {
          const { data } = await queryFulfilled;

          console.log("=".repeat(60));
          console.log("🔍 AUTH API - VERIFY OTP RESPONSE RECEIVED");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 is_registered:", data.is_registered);
          console.log("📌 requires_registration:", data.requires_registration);
          console.log("📌 token:", data.token ? "✅ EXISTS" : "❌ MISSING");
          console.log(
            "📌 temp_token:",
            data.temp_token ? "✅ EXISTS" : "❌ MISSING",
          );
          console.log("📌 message:", data.message);
          console.log("=".repeat(60));

          if (!data.status) {
            console.log("❌ API returned status: false");
            return;
          }

          // CASE 1: User IS registered (has token)
          if (data.token && data.is_registered === true) {
            console.log(
              "✅✅✅ CASE 1: USER IS REGISTERED - Redirecting to /products",
            );

            // Store tokens
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.user) {
              TokenManager.setUserData(data.user);
            }
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            // Clear any temp data
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");

            // Redirect to products
            if (typeof window !== "undefined") {
              console.log("🚀 Redirecting to /products");
              setTimeout(() => {
                window.location.href = "/products";
              }, 100);
            }
            return;
          }

          // CASE 2: User is NOT registered (has temp_token)
          if (data.temp_token && data.is_registered === false) {
            console.log(
              "❌❌❌ CASE 2: USER IS NOT REGISTERED - Redirecting to registration",
            );

            // Store temp token for registration
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

            // Redirect to registration
            if (typeof window !== "undefined") {
              const phone = data.phone || "";
              console.log(
                `🚀 Redirecting to /auth/customer/register?phone=${encodeURIComponent(phone)}`,
              );
              setTimeout(() => {
                window.location.href = `/auth/customer/register?phone=${encodeURIComponent(phone)}`;
              }, 100);
            }
            return;
          }

          // CASE 3: Fallback - if we have token, treat as registered
          if (data.token) {
            console.log("⚠️ Fallback: Token exists, treating as registered");
            TokenManager.setTokens(data.token, data.refresh_token || "");
            if (data.user) {
              TokenManager.setUserData(data.user);
            }
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.location.href = "/products";
              }, 100);
            }
            return;
          }

          // CASE 4: Fallback - if we have temp_token, treat as unregistered
          if (data.temp_token) {
            console.log(
              "⚠️ Fallback: temp_token exists, treating as unregistered",
            );
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

          console.log("❌ Unknown response structure:", data);
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
            console.log("✅ OTP stored for verification:", data.otp);
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
            if (data.data?.user) {
              TokenManager.setUserData(data.data.user);
            }
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");
            localStorage.setItem("user_type", "customer");
            localStorage.setItem("is_logged_in", "true");

            console.log("✅ Registration completed successfully");

            if (typeof window !== "undefined") {
              console.log("🚀 Registration complete, redirecting to /products");
              setTimeout(() => {
                window.location.href = "/products";
              }, 100);
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
            console.log("✅ Token refreshed successfully");
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
          TokenManager.clearTokens();
          console.log("✅ Logout successful");
          if (typeof window !== "undefined") {
            window.location.href = "/auth/customer/login";
          }
        } catch (error) {
          console.error("Logout failed:", error);
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/customer/login";
          }
        }
      },
    }),

    getUserProfile: builder.query<UserProfileResponse, void>({ 
      query: () => ({ url: "/user/profile", method: "GET", }), 
      providesTags: ["User"], }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetUserProfileQuery
} = authApi;

export default authApi;
