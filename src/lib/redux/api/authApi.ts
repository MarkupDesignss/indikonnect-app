// src/lib/redux/api/authApi.ts

import { baseApi } from "./baseApi";
import {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from "./authtype";
// Types for Send OTP

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
          if (data.status && data.temp_token) {
            // Store temp token for registration
            localStorage.setItem("temp_token", data.temp_token);
            localStorage.setItem("verified_phone", data.phone);
            console.log("OTP verified successfully");
          }
        } catch (error) {
          console.error("OTP verification failed:", error);
        }
      },
    }),

    // Send OTP - Real API
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
            // Store OTP for verification
            localStorage.setItem("customer_otp", data.otp.toString());
            localStorage.setItem("customer_phone", data.phone);
            console.log("OTP stored for verification:", data.otp);
          }
        } catch (error) {
          console.error("Send OTP failed:", error);
        }
      },
    }),
  }),
});

export const { useSendOTPMutation,useVerifyOTPMutation } = authApi;

export default authApi;
