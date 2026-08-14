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
// src/lib/redux/api/authtype.ts

export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  status: boolean;
  message: string;
  otp?: number;
  phone?: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: number;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: any;
  is_registered?: boolean;
  requires_registration?: boolean;
  temp_token?: string;
  phone?: string;
}

export interface ConfirmRegistrationRequest {
  temp_token: string;
  phone: string;
  full_name: string;
  email?: string;
  country?: string;
  terms_condition?: boolean;
}

export interface ConfirmRegistrationResponse {
  status: boolean;
  message: string;
  token?: string;
  refresh_token?: string;
  expires_in?: number;
  data?: {
    user: any;
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

export interface UserProfile {
  id: number;
  distributor_id: number | null;
  full_name: string; email: string;
  phone: string; phone_verified_at: string | null;
  country: string | null;
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
  registration_completed_at:
  string | null;
  created_at: string;
  updated_at: string;
  roles: any[];
}

export interface UserProfileResponse {
  status: boolean;
  message: string;
  user: UserProfile;
}


export interface DashboardResponse {
  success: boolean;
  data: {
    user: {
      name: string;
      email: string;
      account_type: string;
      member_since: string;
    };
    stats: {
      total_orders: number;
      wishlist: number;
      points_earned: string;
      reviews: number;
      average_rating: number;
      cart_items: number;
    };
    latest_order: {
      order_reference: string;
      order_date: string;
      status: string;
      total_payable: string;
      courier_company: string | null;
      courier_tracking_number: string | null;
      courier_status: string | null;
      courier_delivery_date: string | null;
      expected_delivery: string | null;
      items: Array<{
        product_id: number;
        product_code: string;
        name: string;
        quantity: number;
        unit_price: string;
        line_total: string;
        images: Array<{
          id: number;
          image_url: string;
          is_primary: boolean;
        }>;
      }>;
    };
    recent_activity: Array<{
      event: string;
      date: string;
      points_earned: string;
      status: string;
      order_reference: string;
    }>;
  };
}