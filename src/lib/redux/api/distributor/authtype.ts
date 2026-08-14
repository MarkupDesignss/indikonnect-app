// src/lib/redux/api/distributor/authtype.ts

// ============ Distributor Check Status ============
export interface DistributorCheckStatusRequest {
  phone?: string;
  email?: string;
}

export interface DistributorCheckStatusResponse {
  status: boolean;
  message: string;
  data?: {
    exists: boolean;
    phone?: string;
    email?: string;
    is_verified?: boolean;
    registration_step?: number;
    [key: string]: any;
  };
}

// Add these types to your authtype.ts file

export interface DistributorLoginRequest {
  email: string;
  password: string;
}

export interface DistributorLoginResponse {
  status: boolean;
  message: string;
  data?: {
    token?: string;
    distributor?: {
      id: string;
      email: string;
      name?: string;
      phone?: string;
      // Add other distributor fields as needed
    };
  };
}

// ============ Send OTP ============
export interface SendOTPRequest {
  email?: string;
  phone?: string;
  type: "email" | "phone" | "both";
  temp_token?: string;
}

export interface SendOTPResponse {
  status: boolean;
  message: string;
  email?: string;
  phone?: string;
  otp?: number;
  expires_in?: number;
  temp_token: string;
}

// ============ Verify OTP ============
export interface VerifyPhoneOTPRequest {
  phone: string;
  otp: string | number;
  temp_token?: string;
}

export interface VerifyEmailOTPRequest {
  email: string;
  otp: string | number;
  temp_token?: string;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  temp_token?: string;
  phone?: string;
  email?: string;
  is_verified?: boolean;
  next_step?: string;
}

// ============ Step 1: Personal Information ============
// Add account_type to Step1PersonalRequest interface

export interface Step1PersonalRequest {
  email: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  country?: string;
  terms_condition?: string | number;
  account_type?: string; // ✅ Add this field
  password?: string;
  password_confirmation?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
  otp?: number;
}

// Verify Reset OTP
export interface VerifyResetOTPRequest {
  email: string;
  otp: number | string;
}

export interface VerifyResetOTPResponse {
  status: boolean;
  message: string;
}

// Reset Password
export interface ResetPasswordRequest {
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
}
export interface Step1PersonalResponse {
  status: boolean;
  message: string;
  temp_token?: string;
  next_step?: string;
  data?: any;
}

// ============ Step 2: Sponsor ============
export interface Step2SponsorRequest {
  phone: string;
  sponsor_id: string;
  placement_leg: "left" | "right";
}

export interface Step2SponsorResponse {
  status: boolean;
  message: string;
  sponsor_name?: string;
  sponsor_id?: string;
  placement_leg?: string;
  data?: any;
}

// ============ Step 3: Aadhaar ============
export interface Step3AadhaarRequest {
  phone: string;
  encrypted_aadhaar: string;
  aadhaar_consent: boolean;
}

export interface Step3AadhaarResponse {
  status: boolean;
  message?: string;
  data?: {
    aadhaar_verified?: boolean;
    [key: string]: any;
  };
}

// ============ Step 4: PAN ============
export interface Step4PANRequest {
  phone: string;
  encrypted_pan: string;
}

export interface Step4PANResponse {
  status: boolean;
  message?: string;
  data?: {
    pan_verified?: boolean;
    pan_number?: string;
    [key: string]: any;
  };
}

// ============ Step 5: Bank ============
export interface Step5BankRequest {
  phone: string;
  bank_holder_name: string;
  bank_name: string;
  branch_name: string;
  encrypted_bank_account: string;
  confirm_account_number: string;
  bank_ifsc: string;
  account_type: string;
}

export interface Step5BankResponse {
  status: boolean;
  message?: string;
  data?: {
    bank_verified?: boolean;
    bank_account_masked?: string;
    [key: string]: any;
  };
}

// ============ Step 6: Location ============
export interface Step6LocationRequest {
  phone: string;
  location_consent: number;
  latitude: number;
  longitude: number;
}

export interface Step6LocationResponse {
  status: boolean;
  message?: string;
  data?: {
    location_verified?: boolean;
    [key: string]: any;
  };
}

// ============ Step 7: Submit ============
export interface Step7SubmitRequest {
  phone: string;
  accept_terms: number;
  accept_agreement: number;
  accept_code_of_conduct: number;
}

export interface Step7SubmitResponse {
  status: boolean;
  message?: string;
  data?: {
    application_id?: string;
    distributor_id?: string;
    status?: string;
    [key: string]: any;
  };
}

// ============ Get Step Data ============
export interface GetStepDataRequest {
  step: number;
  phone: string;
}

export interface GetStepDataResponse {
  status: boolean;
  message?: string;
  data?: {
    // Step 1: Personal Information
    full_name?: string;
    date_of_birth?: string;
    email?: string;
    mobile?: string;

    // Step 2: Sponsor
    sponsor_id?: string;
    sponsor_name?: string;
    placement_leg?: string;

    // Step 3: Aadhaar
    aadhaar_number?: string;
    aadhaar_verified?: boolean;
    aadhaar_consent?: boolean;

    // Step 4: PAN
    pan_number?: string;
    pan_verified?: boolean;
    pan_registered_name?: string;

    // Step 5: Bank
    bank_title?: string;
    bank_account_holder_name?: string;
    bank_entity_type?: string;
    bank_name?: string;
    bank_branch?: string;
    bank_account_number?: string;
    bank_ifsc_code?: string;
    bank_account_type?: string;
    bank_verified?: boolean;

    // Step 6: Location
    location_consent?: boolean;
    latitude?: number;
    longitude?: number;
    location_verified?: boolean;

    // Step 7: Submit
    terms_accepted?: boolean;
    agreement_accepted?: boolean;
    code_of_conduct_accepted?: boolean;
    application_submitted?: boolean;
    application_id?: string;
    distributor_id?: string;
  };
}
