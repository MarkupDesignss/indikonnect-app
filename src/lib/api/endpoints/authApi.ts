import { baseApi } from '../baseApi';
import { setCredentials, setTempToken } from '../../store/features/auth/authSlice';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ConfirmRegistrationRequest,
  ConfirmRegistrationResponse,
  LoginRequest,
  LoginResponse,
  VerifyLoginOtpRequest,
  VerifyLoginOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../../types/auth.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Send OTP for registration
    sendOTP: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: (data) => ({
        url: '/user/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // 2. Verify OTP for registration
    verifyOTP: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/user/verify-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Verify OTP Response:', data);

          if (data.status && data.temp_token) {
            dispatch(setTempToken(data.temp_token));
          }
        } catch (error: any) {
          console.error('OTP verification failed:', error);
        }
      },
    }),

    // 3. Confirm Registration
    confirmRegistration: builder.mutation<ConfirmRegistrationResponse, ConfirmRegistrationRequest>({
      query: (data) => ({
        url: '/user/confirm_registration',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Registration confirmation response:', data);

          if (data.status && data.data?.user && data.token) {
            dispatch(setCredentials({
              user: data.data.user,
              token: data.token,
              refreshToken: data.refresh_token || '',
            }));
          }
        } catch (error: any) {
          console.error('Registration confirmation failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    // 4. Login (send OTP for login)
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: '/user/login',
        method: 'POST',
        body: data,
      }),
    }),

    // 5. Verify Login OTP
    verifyLoginOTP: builder.mutation<VerifyLoginOtpResponse, VerifyLoginOtpRequest>({
      query: (data) => ({
        url: '/user/verify-login-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Verify Login OTP Response:', data);

          if (data.status && data.user && data.token) {
            dispatch(setCredentials({
              user: data.user,
              token: data.token,
              refreshToken: data.refresh_token || '',
            }));
          }
        } catch (error: any) {
          console.error('Login OTP verification failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    // 6. Refresh Token
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/user/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<User, void>({
      query: () => '/user/me',
      providesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/user/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch({ type: 'auth/logout' });
        dispatch(baseApi.util.resetApiState());
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useConfirmRegistrationMutation,
  useLoginMutation,
  useVerifyLoginOTPMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;