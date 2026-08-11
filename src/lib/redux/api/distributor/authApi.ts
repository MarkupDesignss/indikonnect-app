// src/lib/redux/api/authApi.ts

import { baseApi } from "../baseApi";
import {
  DistributorCheckStatusRequest,
  DistributorCheckStatusResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyEmailOTPRequest,
  VerifyPhoneOTPRequest,
  Step1PersonalRequest,
  Step1PersonalResponse,
  VerifyOTPResponse
} from "./authtype";



// Define types for Step1 Personal


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Existing endpoint
    distributorCheckStatus: builder.mutation<
      DistributorCheckStatusResponse,
      DistributorCheckStatusRequest
    >({
      query: (data) => ({
        url: "/distributor/check-status",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Distributor Check Status Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Distributor Check Status called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 DISTRIBUTOR CHECK STATUS RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 exists:", data.exists);
          console.log("📌 message:", data.message);
          console.log("📌 current_step:", data.current_step);
          console.log("📌 next_step:", data.next_step);
          console.log("📌 user_data:", data.user_data);
          console.log("=".repeat(60));

          if (data.status) {
            localStorage.setItem(
              "distributor_exists",
              JSON.stringify(data.exists),
            );
            localStorage.setItem("distributor_status", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Distributor check status failed:", error);
        }
      },
    }),

    // Send OTP endpoint
    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => ({
        url: "/distributor/send-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Send OTP Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Send OTP called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 SEND OTP RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 message:", data.message);
          console.log("📌 otp:", data.otp);
          console.log("📌 expires_in:", data.expires_in, "minutes");
          console.log("📌 phone/email:", data.phone || data.email);
          console.log("=".repeat(60));
        } catch (error) {
          console.error("Send OTP failed:", error);
        }
      },
    }),

    // Verify Phone OTP endpoint
    verifyPhoneOTP: builder.mutation<VerifyOTPResponse, VerifyPhoneOTPRequest>({
      query: (data) => ({
        url: "/distributor/verify-phone-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Verify Phone OTP Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Verify Phone OTP called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 VERIFY PHONE OTP RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 message:", data.message);
          if (data.data) {
            console.log("📌 data:", data.data);
          }
          console.log("=".repeat(60));

          if (data.status) {
            localStorage.setItem("phone_verified", "true");
          }
        } catch (error) {
          console.error("Verify Phone OTP failed:", error);
        }
      },
    }),

    // Verify Email OTP endpoint
    verifyEmailOTP: builder.mutation<VerifyOTPResponse, VerifyEmailOTPRequest>({
      query: (data) => ({
        url: "/distributor/verify-email-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Verify Email OTP Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Verify Email OTP called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 VERIFY EMAIL OTP RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 message:", data.message);
          if (data.data) {
            console.log("📌 data:", data.data);
          }
          console.log("=".repeat(60));

          if (data.status) {
            localStorage.setItem("email_verified", "true");
          }
        } catch (error) {
          console.error("Verify Email OTP failed:", error);
        }
      },
    }),

    // ✅ NEW: Step 1 Personal API
    step1Personal: builder.mutation<Step1PersonalResponse, Step1PersonalRequest>({
      query: (data) => ({
        url: "/distributor/step1-personal",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Step 1 Personal Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Step 1 Personal called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 STEP 1 PERSONAL RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 message:", data.message);
          if (data.data) {
            console.log("📌 data:", data.data);
          }
          console.log("=".repeat(60));

          if (data.status) {
            // Store user data or token if returned
            if (data.data?.user) {
              localStorage.setItem("user_data", JSON.stringify(data.data.user));
            }
          }
        } catch (error) {
          console.error("Step 1 Personal failed:", error);
        }
      },
    }),
  }),
});

// Export hooks
export const {
  useDistributorCheckStatusMutation,
  useSendOTPMutation,
  useVerifyPhoneOTPMutation,
  useVerifyEmailOTPMutation,
  useStep1PersonalMutation, // ✅ NEW
} = authApi;

export default authApi;