import { baseApi } from "../baseApi";

import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./userTypes";

export interface UserNotification {
  id: number;
  user_id: number;
  email_notifications: boolean;
  order_updates: boolean;
  payment_alerts: boolean;
  promotional_emails: boolean;
  security_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationsResponse {
  success: boolean;
  data: UserNotification;
}

export interface ToggleNotificationRequest {
  type:
    | "email_notifications"
    | "order_updates"
    | "payment_alerts"
    | "promotional_emails"
    | "security_alerts";
  status: boolean;
}

export interface ToggleNotificationResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: UserNotification;
}

export interface UserProfile {
  id: number;
  distributor_id: number | null;
  full_name: string;
  email: string;
  phone: string;
  phone_verified_at: string | null;
  country: string;
  date_of_birth: string | null;
  account_type: string;
  terms_condition: boolean;
  otp: string | null;
  otp_expires_at: string | null;
  temp_verification_token: string | null;
  otp_verified_at: string | null;
  email_verified_at: string | null;
  email_otp: string | null;
  email_otp_expires_at: string | null;
  phone_verified: number;
  aadhaar_last4: string | null;
  pan_last4: string | null;
  account_last4: string | null;
  accept_terms: number;
  accept_agreement: number;
  accept_code_of_conduct: number;
  location_consent_given: number;
  is_registered: boolean;
  is_active: boolean;
  profile_picture: string | null;
  role_id: number | null;
  sponsor_id: number | null;
  placement_leg: string | null;
  distributor_status: string | null;
  activation_date: string | null;
  registration_step: number;
  temp_token: string | null;
  registration_completed_at: string | null;
  created_at: string;
  updated_at: string;
  roles: unknown[];
}

export interface UserProfileResponse {
  status: boolean;
  message: string;
  user: UserProfile;
}

export interface UpdateUserProfileResponse {
  status: boolean;
  message: string;
  user?: UserProfile;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/user/change-password",
        method: "POST",
        body,
      }),
    }),

    getUserNotifications: builder.query<
      UserNotificationsResponse,
      void
    >({
      query: () => ({
        url: "/user-notifications",
        method: "GET",
      }),
    }),

    toggleNotification: builder.mutation<
      ToggleNotificationResponse,
      ToggleNotificationRequest
    >({
      query: (body) => ({
        url: "/user-notifications/toggle",
        method: "POST",
        body,
      }),
    }),

    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/user/profile",
        method: "GET",
      }),
    }),

    updateUserProfile: builder.mutation<
      UpdateUserProfileResponse,
      FormData
    >({
      query: (formData) => ({
        url: "/user/profile",
        method: "POST",
        body: formData,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useChangePasswordMutation,
  useGetUserNotificationsQuery,
  useToggleNotificationMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = userApi;

export default userApi;