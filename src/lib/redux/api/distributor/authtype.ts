// src/lib/redux/api/authtype.ts

// ============================================
// SHARED TYPES
// ============================================

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
// src/lib/redux/api/authtype.ts

// Add these types
export interface DistributorCheckStatusRequest {
  phone: string;
}

export interface DistributorCheckStatusResponse {
  status: boolean;
  exists: boolean;
  message: string;
  current_step: number;
  next_step: number;
  user_data: null | {
    // Define user data structure if needed
    id?: number;
    name?: string;
    phone?: string;
    // etc.
  };
}
export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  phone?: string;
  temp_token?: string;
  is_registered?: boolean;
  requires_registration?: boolean;
  token?: string;
  refresh_token?: string;
  expires_in?: number;
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
  temp_token: string;
  phone: string;
  full_name: string;
  email?: string;
  country?: string;
  terms_condition?: boolean;
  company_name?: string;
  account_type?: string;
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

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  status: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LogoutResponse {
  status: boolean;
  message: string;
}

// ============================================
// DISTRIBUTOR SPECIFIC TYPES
// ============================================

export interface DistributorSendOTPRequest {
  phone: string;
  type: "phone" | "email"; // Based on your API
}

export interface DistributorSendOTPResponse {
  status: boolean;
  message: string;
  phone: string;
  otp: number;
  expires_in: number;
  temp_token: string | null;
}

export interface DistributorVerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface DistributorVerifyOTPResponse {
  status: boolean;
  message: string;
  token?: string;
  refresh_token?: string;
  temp_token?: string;
  phone?: string;
  distributor_id?: number;
  is_registered?: boolean;
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

export interface DistributorConfirmRegistrationRequest {
  temp_token: string;
  phone: string;
  full_name: string;
  email: string;
  country: string;
  company_name: string;
  terms_condition: boolean;
  account_type?: string;
}

export interface DistributorConfirmRegistrationResponse {
  status: boolean;
  message: string;
  token: string;
  refresh_token: string;
  expires_in: number;
  data?: {
    user: {
      id: number;
      distributor_id: number;
      full_name: string;
      email: string;
      phone: string;
      country: string;
      company_name: string;
      account_type: string;
      is_registered: boolean;
      is_active: boolean;
      [key: string]: any;
    };
  };
}
