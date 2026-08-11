// types/subscriberTypes.ts
export interface SubscriberRequest {
    email: string;
  }
  
  export interface SubscriberResponse {
    success: boolean;
    message: string;
    data?: {
      id: string;
      email: string;
      isActive: boolean;
      subscribedAt: string;
    };
  }
  
  export interface SubscribersListResponse {
    subscribers: SubscriberResponse[];
    total: number;
    page: number;
    limit: number;
  }