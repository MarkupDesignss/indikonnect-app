
export interface ContactRequest {
    name: string;
    email: string;
    phone: string;
    message: string;
  }
  
  export interface ContactResponse {
    success: boolean;
    message: string;
    data?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      createdAt: string;
    };
  }