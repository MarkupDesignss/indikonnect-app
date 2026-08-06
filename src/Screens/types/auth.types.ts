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
    temp_token?: string;
    phone?: string;
    user?: User;
    token?: string;
    refreshToken?: string;
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
    data?: {
        user: User;
        role: any;
        business_profile: any;
    };
    token?: string;
    refresh_token?: string;
    expires_in?: number;
}

export interface LoginRequest {
    phone: string;
}

export interface LoginResponse {
    status: boolean;
    message: string;
    phone?: string;
    otp?: number;
    account_type?: string;
}

export interface VerifyLoginOtpRequest {
    phone: string;
    otp: string | number;
}

export interface VerifyLoginOtpResponse {
    status: boolean;
    message: string;
    token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: User;
    role?: any;
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

export interface User {
    id: number;
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
    business_status: string | null;
    profile_picture: string | null;
    role_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
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