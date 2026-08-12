
export interface ShippingMethod {
    id: number;
    name: string;
    code: string;
    description: string;
    base_rate: string;
    rate_type: string;
    rate_value: string | null;
    min_order_amount: string | null;
    max_order_amount: string | null;
    estimated_days: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ShippingMethodsResponse {
    success: boolean;
    data: ShippingMethod[];
    message: string;
  }