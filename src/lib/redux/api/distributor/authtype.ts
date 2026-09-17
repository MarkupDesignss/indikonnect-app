// src/lib/redux/api/distributor/authtype.ts

// ============ Distributor Check Status ============
export interface DistributorCheckStatusRequest {
  phone?: string;
  email?: string;
}
// =====================================================
// CHECK DISTRIBUTOR (BA ID → Sponsor lookup)
// =====================================================

// =====================================================
// CHECK DISTRIBUTOR (BA ID → Sponsor lookup)
// =====================================================

export interface CheckDistributorRequest {
  distributor_id: string;
}

export interface CheckDistributorDistributor {
  id: number;
  distributor_id: string;
  full_name: string;
}

export interface CheckDistributorResponse {
  status: boolean;
  message: string;
  distributor: CheckDistributorDistributor;
  sponsor_id: string;
  is_custom: boolean;
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

// =====================================================
// DISTRIBUTOR LOGIN
//
// Actual API response:
// {
//   "status": true,
//   "message": "Distributor login successful",
//   "token": "675|...",
//   "expires_in": 3600,
//   "refresh_token": "...",
//   "user": {
//     "id": 77,
//     "full_name": "abhay chauhan",
//     "email": "kushankrajput16@gmail.com",
//     "phone": "+911414141414",
//     "distributor_id": "IND-0077",
//     "account_type": "distributor",
//     "distributor_status": "active",
//     "profile_picture": null
//   },
//   "role": null,
//   "distributor_profile": {
//     "id": 39,
//     "kyc_status": "verified",
//     "bank_name": "SBI",
//     "bank_holder_name": "Brad",
//     "bank_ifsc": "UDFVC2345",
//     "aadhaar_verified": 1,
//     "pan_verified": 1,
//     "registration_completed": 1
//   }
// }
// =====================================================

export interface DistributorLoginRequest {
  // ✅ Accepts BOTH email and distributor_id
  // The component passes `login`, the API layer decides which field to send.
  login: string;
  password: string;
}

export interface DistributorLoginUser {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  distributor_id: string;
  account_type: string;
  distributor_status: string;
  profile_picture: string | null;
}

export interface DistributorLoginProfile {
  id: number;
  kyc_status: string;
  bank_name: string | null;
  bank_holder_name: string | null;
  bank_ifsc: string | null;
  aadhaar_verified: number;
  pan_verified: number;
  registration_completed: number;
}

export interface DistributorLoginResponse {
  status: boolean;
  message: string;

  // ✅ API returns `token` (NOT `access_token`)
  token?: string;

  // ✅ Optional alias in case API switches to `access_token`
  access_token?: string;

  expires_in?: number;

  // ✅ API returns `refresh_token`
  refresh_token?: string;

  // ✅ API returns `user` (NOT `user_data`)
  user?: DistributorLoginUser;

  // ✅ Optional alias in case API switches to `user_data`
  user_data?: DistributorLoginUser;

  role?: string | null;

  distributor_profile?: DistributorLoginProfile;
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

export interface Step1PersonalRequest {
  email: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  country?: string;
  terms_condition?: string | number;
  account_type?: string;
  gst_in: string;
  company_name: string;
  password?: string;
  password_confirmation?: string;
}

export interface Step1PersonalResponse {
  status: boolean;
  message: string;
  temp_token?: string;
  next_step?: string;
  data?: any;
}

// ============ Forgot / Reset Password ============

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
  otp?: number;
}

export interface VerifyResetOTPRequest {
  email: string;
  otp: number | string;
}

export interface VerifyResetOTPResponse {
  status: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
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
// Add/update Step5BankRequest
export interface Step5BankRequest {
  phone: string;
  bank_holder_name: string;
  bank_name: string;
  title: string;
  type_of_entity: string;
  branch_name: string;
  encrypted_bank_account: string;
  confirm_account_number: string;
  bank_ifsc: string;
  account_type: string;
  // ✅ NEW fields
  gst_in?: string;
  company_name?: string;
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
