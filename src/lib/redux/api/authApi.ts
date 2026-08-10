// src/lib/redux/api/authApi.ts

import { baseApi } from "./baseApi";
import {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ConfirmRegistrationRequest,
  ConfirmRegistrationResponse,
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
          if (data.status) {
            if (data.is_registered === false && data.temp_token && data.phone) {
              // Store temp token for registration (unregistered user)
              localStorage.setItem("temp_token", data.temp_token);
              localStorage.setItem("verified_phone", data.phone);
              console.log("Temp token stored for registration");
            } else if (data.is_registered === true && data.token) {
              // Store auth token for registered user
              localStorage.setItem("auth_token", data.token);
              if (data.user) {
                localStorage.setItem("user_data", JSON.stringify(data.user));
              }
              console.log("Auth token stored for logged in user");
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
            localStorage.setItem("auth_token", data.token);
            if (data.data?.user) {
              localStorage.setItem("user_data", JSON.stringify(data.data.user));
            }
            // Clean up temp tokens
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");
            console.log("Registration completed successfully");
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
} = authApi;

export default authApi;
