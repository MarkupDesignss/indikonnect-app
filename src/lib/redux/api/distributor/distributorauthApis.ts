// src/lib/redux/api/distributor/authApi.ts

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
  VerifyOTPResponse,
  Step2SponsorRequest,
  Step2SponsorResponse,
  Step3AadhaarRequest,
  Step3AadhaarResponse,
  Step4PANRequest,
  Step4PANResponse,
  Step5BankRequest,
  Step5BankResponse,
  Step6LocationRequest,
  Step6LocationResponse,
  Step7SubmitRequest,
  Step7SubmitResponse,
  GetStepDataRequest,
  GetStepDataResponse,
} from "./authtype";

// Define tag types for cache invalidation
export const DISTRIBUTOR_TAGS = {
  CHECK_STATUS: "DistributorCheckStatus",
  STEP_DATA: "DistributorStepData",
  PERSONAL: "DistributorPersonal",
  SPONSOR: "DistributorSponsor",
  AADHAAR: "DistributorAadhaar",
  PAN: "DistributorPAN",
  BANK: "DistributorBank",
  LOCATION: "DistributorLocation",
  SUBMIT: "DistributorSubmit",
} as const;

export const distributorAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Distributor check status - Updated to use email
    distributorCheckStatus: builder.mutation<
      DistributorCheckStatusResponse,
      DistributorCheckStatusRequest
    >({
      query: (data) => ({
        url: "/distributor/check-status",
        method: "POST",
        body: {
          email: data.email, // Send only email in the request body
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.CHECK_STATUS],
    }),

    // Get step data for a specific step
    getStepData: builder.query<GetStepDataResponse, GetStepDataRequest>({
      query: ({ step, phone }) => ({
        url: `/distributor/step-data/${step}/${phone}`,
        method: "GET",
      }),
      providesTags: (result, error, { step }) => [
        { type: DISTRIBUTOR_TAGS.STEP_DATA, id: step },
      ],
      transformResponse: (response: GetStepDataResponse) => {
        return response;
      },
    }),

    // Send OTP
    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => {
        const requestBody: {
          type: SendOTPRequest["type"];
          email?: string;
          phone?: string;
          temp_token?: string;
        } = {
          type: data.type,
        };

        if (data.type === "email") {
          requestBody.email = data.email;
        } else if (data.type === "phone") {
          requestBody.phone = data.phone;
        } else if (data.type === "both") {
          if (data.email) {
            requestBody.email = data.email;
          }

          if (data.phone) {
            requestBody.phone = data.phone;
          }
        }

        if (data.temp_token) {
          requestBody.temp_token = data.temp_token;
        }

        return {
          url: "/distributor/send-otp",
          method: "POST",
          body: requestBody,
        };
      },
      transformResponse: (response: SendOTPResponse) => {
        return response;
      },
    }),

    // Verify phone OTP
    verifyPhoneOTP: builder.mutation<VerifyOTPResponse, VerifyPhoneOTPRequest>({
      query: (data) => {
        const requestBody: {
          phone: string;
          otp: string;
          temp_token?: string;
        } = {
          phone: data.phone,
          otp: data.otp,
        };

        if (data.temp_token) {
          requestBody.temp_token = data.temp_token;
        }

        return {
          url: "/distributor/verify-phone-otp",
          method: "POST",
          body: requestBody,
        };
      },
    }),

    // Verify email OTP
    verifyEmailOTP: builder.mutation<VerifyOTPResponse, VerifyEmailOTPRequest>({
      query: (data) => {
        const requestBody: {
          email: string;
          otp: string;
          temp_token?: string;
        } = {
          email: data.email,
          otp: data.otp,
        };

        if (data.temp_token) {
          requestBody.temp_token = data.temp_token;
        }

        return {
          url: "/distributor/verify-email-otp",
          method: "POST",
          body: requestBody,
        };
      },
    }),

    // Step 1 - Personal
    step1Personal: builder.mutation<
      Step1PersonalResponse,
      Step1PersonalRequest
    >({
      query: (data) => ({
        url: "/distributor/step1-personal",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.PERSONAL],
    }),

    // Step 2 - Sponsor
    step2Sponsor: builder.mutation<Step2SponsorResponse, Step2SponsorRequest>({
      query: (data) => ({
        url: "/distributor/step2-sponsor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.SPONSOR],
    }),

    // Step 3 - Aadhaar
    step3Aadhaar: builder.mutation<Step3AadhaarResponse, Step3AadhaarRequest>({
      query: (data) => ({
        url: "/distributor/step3-aadhaar",
        method: "POST",
        body: {
          phone: data.phone,
          encrypted_aadhaar: data.encrypted_aadhaar,
          aadhaar_consent: data.aadhaar_consent,
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.AADHAAR],
    }),

    // Step 4 - PAN
    step4PAN: builder.mutation<Step4PANResponse, Step4PANRequest>({
      query: (data) => ({
        url: "/distributor/step4-pan",
        method: "POST",
        body: {
          phone: data.phone,
          encrypted_pan: data.encrypted_pan,
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.PAN],
    }),

    // Step 5 - Bank
    step5Bank: builder.mutation<Step5BankResponse, Step5BankRequest>({
      query: (data) => ({
        url: "/distributor/step5-bank",
        method: "POST",
        body: {
          phone: data.phone,
          bank_holder_name: data.bank_holder_name,
          bank_name: data.bank_name,
          title: data.title,
          type_of_entity: data.type_of_entity,
          branch_name: data.branch_name,
          encrypted_bank_account: data.encrypted_bank_account,
          confirm_account_number: data.confirm_account_number,
          bank_ifsc: data.bank_ifsc,
          account_type: data.account_type,
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.BANK],
    }),

    // Step 6 - Location
    step6Location: builder.mutation<
      Step6LocationResponse,
      Step6LocationRequest
    >({
      query: (data) => ({
        url: "/distributor/step6-location",
        method: "POST",
        body: {
          phone: data.phone,
          location_consent: data.location_consent,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.LOCATION],
    }),

    // Step 7 - Submit
    step7Submit: builder.mutation<Step7SubmitResponse, Step7SubmitRequest>({
      query: (data) => ({
        url: "/distributor/step7-submit",
        method: "POST",
        body: {
          phone: data.phone,
          accept_terms: data.accept_terms,
          accept_agreement: data.accept_agreement,
          accept_code_of_conduct: data.accept_code_of_conduct,
        },
      }),
      invalidatesTags: [DISTRIBUTOR_TAGS.SUBMIT],
    }),
  }),
});

// Export hooks
export const {
  useDistributorCheckStatusMutation,
  useGetStepDataQuery,
  useLazyGetStepDataQuery,
  useSendOTPMutation,
  useVerifyPhoneOTPMutation,
  useVerifyEmailOTPMutation,
  useStep1PersonalMutation,
  useStep2SponsorMutation,
  useStep3AadhaarMutation,
  useStep4PANMutation,
  useStep5BankMutation,
  useStep6LocationMutation,
  useStep7SubmitMutation,
} = distributorAuthApi;

export default distributorAuthApi;
