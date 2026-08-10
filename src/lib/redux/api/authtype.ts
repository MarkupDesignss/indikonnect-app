export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  status: boolean;
  message: string;
  phone: string;
  otp: number;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  temp_token: string;
  phone: string;
}
// src/lib/redux/api/authtype.ts

export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  status: boolean;
  message: string;
  phone: string;
  otp?: string | number;
  expires_in?: number;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  phone?: string;
  temp_token?: string;
  is_registered?: boolean;
  requires_registration?: boolean;
  token?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    country?: string;
    account_type?: string;
    [key: string]: any;
  };
}

export interface ConfirmRegistrationRequest {
  email: string;
  account_type: string;
  temp_token: string;
  full_name: string;
  phone: string;
  country: string;
  terms_condition: string | boolean;
  company_name: string;
}

export interface ConfirmRegistrationResponse {
  status: boolean;
  message: string;
  token: string;
  expires_in?: number;
  refresh_token?: string;
  data?: {
    user: {
      id: number;
      distributor_id: number | null;
      full_name: string;
      email: string;
      phone: string;
      phone_verified_at: string | null;
      country: string;
      account_type: string;
      terms_condition: boolean;
      otp: string | null;
      otp_expires_at: string | null;
      temp_verification_token: string | null;
      otp_verified_at: string | null;
      email_verified_at: string | null;
      is_registered: boolean;
      is_active: boolean;
      profile_picture: string | null;
      role_id: number | null;
      sponsor_id: number | null;
      placement_leg: string | null;
      distributor_status: string;
      activation_date: string | null;
      created_at: string;
      updated_at: string;
      [key: string]: any;
    };
    role: any | null;
    business_profile: any | null;
  };
}
