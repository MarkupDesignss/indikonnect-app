// src/lib/redux/api/distributor/authtype.ts

// =====================================================
// CORRECTION REQUEST / RESPONSE
// =====================================================

export type CorrectionReason =
  | "wrong_name_at_signup"
  | "wrong_dob_at_signup"
  | "both_wrong_at_signup"
  | "typo_mistake"
  | "legal_name_change"
  | "dob_data_entry_error";

export interface CorrectionRequest {
  email: string;
  reason: CorrectionReason;
  full_name: string;
  date_of_birth: string;
}

export interface CorrectionResponse {
  status: boolean;
  message: string;
  data: any;
}

// =====================================================
// DISTRIBUTOR CHECK STATUS
// =====================================================

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

// =====================================================
// DISTRIBUTOR LOGIN
// =====================================================

export interface DistributorLoginRequest {
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
  token?: string;
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  user?: DistributorLoginUser;
  user_data?: DistributorLoginUser;
  role?: string | null;
  distributor_profile?: DistributorLoginProfile;
}

// =====================================================
// SEND / VERIFY OTP
// =====================================================

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

// =====================================================
// STEP 1 - PERSONAL
// =====================================================

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

// =====================================================
// FORGOT / RESET PASSWORD
// =====================================================

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

// =====================================================
// STEP 2 - SPONSOR
// =====================================================

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

// =====================================================
// STEP 3 - AADHAAR
// =====================================================

export interface Step3AadhaarRequest {
  phone: string;
  encrypted_aadhaar: string;
  aadhaar_consent: number | string;
  reference_id?: string;
  otp?: string;
}

export interface Step3AadhaarResponse {
  status: boolean;
  message?: string;
  step?: number;
  reference_id?: string | number;
  data?: {
    reference_id?: string | number;
    [key: string]: any;
  };
  [key: string]: any;
}

// =====================================================
// STEP 4 - PAN
// =====================================================

export interface Step4PANRequest {
  phone: string;
  encrypted_pan: string;
  name_as_per_pan?: string;
  date_of_birth?: string;
  aadhaar_number?: string;
}

export interface Step4PANResponse {
  status: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: {
    pan_verified?: boolean;
    pan_number?: string;
    [key: string]: any;
  };
}

// =====================================================
// STEP 5 - BANK
// =====================================================

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

// =====================================================
// STEP 6 - LOCATION
// =====================================================

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

// =====================================================
// STEP 7 - SUBMIT
// =====================================================

export interface Step7SubmitRequest {
  phone: string;
  accept_terms: number;
  accept_agreement: number;
  accept_code_of_conduct: number;
  accept_terms_text: string; // ✅ typed acceptance text
}

export interface Step7SubmitResponse {
  status: boolean;
  success?: boolean;
  message?: string;
  data?: {
    application_id?: string;
    distributor_id?: string;
    status?: string;
    [key: string]: any;
  };
}

// =====================================================
// GET STEP DATA
// ✅ FIXED: Now includes `step_data`, `completed_steps`, etc.
// =====================================================

export interface GetStepDataRequest {
  step: number | string;
  phone: string;
}

export interface StepDataUser {
  id?: number;
  distributor_id?: string | null;
  full_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  date_of_birth?: string;
  account_type?: string;
  registration_step?: number;
  is_registered?: boolean;
  distributor_status?: string;
  phone_verified?: number;
  phone_verified_at?: string | null;
  email_verified_at?: string | null;
  sponsor_id?: string | null;
  placement_leg?: string | null;
  location_consent_given?: number;
  aadhaar_last4?: string | null;
  pan_last4?: string | null;
  account_last4?: string | null;
  [key: string]: any;
}

export interface StepDataProfile {
  id?: number;
  kyc_status?: string;
  aadhaar_verified?: boolean;
  encrypted_aadhaar?: string;
  aadhaar_verified_at?: string | null;
  pan_verified?: boolean;
  encrypted_pan?: string;
  pan_verified_at?: string | null;
  type_of_entity?: string | null;
  title?: string | null;
  bank_verified?: boolean;
  bank_name?: string | null;
  bank_holder_name?: string | null;
  bank_ifsc?: string | null;
  branch_name?: string | null;
  account_type?: string | null;
  location_consent?: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
  registration_completed?: boolean;
  [key: string]: any;
}

export interface CompletedSteps {
  step_1_personal_info?: boolean;
  step_2_sponsor?: boolean;
  step_3_aadhaar?: boolean;
  step_4_pan?: boolean;
  step_5_bank?: boolean;
  step_6_location?: boolean;
  step_7_submitted?: boolean;
  [key: string]: boolean | undefined;
}

export interface GetStepDataResponse {
  status: boolean;
  message?: string;
  step?: number;
  step_data?: {
    user?: StepDataUser;
    distributor_profile?: StepDataProfile;
  };
  completed_steps?: CompletedSteps;
  registration_status?: string | null;
  is_complete?: boolean;
  terms_conditions?: string;
  data?: any;
}