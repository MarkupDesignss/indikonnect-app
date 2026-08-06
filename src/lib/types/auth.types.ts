export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  status: boolean;
  message: string;
  phone: string;
  otp: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string | number;
}

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
  temp_token?: string;
}

export interface ConfirmRegistrationRequest {
  email: string;
  account_type: string;
  temp_token: string;
  full_name: string;
  phone: string;
  country: string;
  terms_condition: string;
  company_name?: string;
}

export interface ConfirmRegistrationResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface ResendOtpRequest {
  phone: string;
}

export interface ResendOtpResponse {
  status: boolean;
  message: string;
  phone: string;
  otp?: number;
}

export interface LoginRequest {
  phone: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
  requiresRegistration?: boolean;
}

export interface VerifyLoginOtpRequest {
  phone: string;
  otp: string | number;
}

export interface VerifyLoginOtpResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  role?: string;
  account_type?: string;
  country?: string;
  company_name?: string;
  createdAt?: string;
  updatedAt?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tempToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  phoneNumber: string | null;
  otpData: {
    phone: string;
    otp: number | null;
  } | null;
  view: 'login' | 'otp' | 'register';
  otpSent: boolean;
  timer: number;
  error: string | null;
  registrationData: Partial<ConfirmRegistrationRequest> | null;
}