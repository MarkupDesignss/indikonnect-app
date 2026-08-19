export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }
  
  export interface ChangePasswordResponse {
    success: boolean;
    message: string;
  }