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
