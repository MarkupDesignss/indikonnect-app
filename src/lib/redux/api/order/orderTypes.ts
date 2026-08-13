export interface OrderImage {
    id: number;
    image_url: string;
    is_primary: boolean;
  }
  
  export interface OrderItem {
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    gst_amount: number;
    line_total: number;
    commissionable_volume: number;
    images: OrderImage[];
    primary_image: string;
  }
  
  export interface OrderAddress {
    id: number;
    full_name: string | null;
    phone: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string | null;
    country: string;
    full_address: string;
  }
  
  export interface OrderUser {
    id: number;
    name: string | null;
    email: string;
    phone: string;
    is_distributor: boolean;
  }
  
  export interface OrderInvoice {
    invoice_number: string;
    invoice_url: string;
    generated_at: string;
  }
  
  export interface OrderTimeline {
    order_placed: string;
    order_confirmed: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
  }
  
  export interface Order {
    order_id: number;
    order_reference: string;
    order_status: string;
    order_type: string;
    order_date: string;
    confirmed_date: string | null;
    payment_gateway: string | null;
    gateway_transaction_id: string | null;
    amount_paid: number;
    payment_status: string;
    subtotal: number;
    total_gst: number;
    shipping_charge: number;
    coin_redeemed: number;
    coin_redeemed_amount: number;
    total_payable: number;
    tax_breakdown: unknown[];
    items: OrderItem[];
    billing_address: OrderAddress;
    delivery_address: OrderAddress;
    user: OrderUser;
    invoice: OrderInvoice | null;
    timeline: OrderTimeline;
  }
  
  export interface MyOrdersResponse {
    success: boolean;
    data: Order[];
  }
  
  export interface OrderStatusesResponse {
    success: boolean;
    data: string[];
  }