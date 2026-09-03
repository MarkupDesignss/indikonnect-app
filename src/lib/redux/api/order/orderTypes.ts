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

  export interface CancelOrderRequest {
    reason: string;
  }
  
  export interface CancelOrderResponse {
    success: boolean;
    message: string;
    data?: {
      orderReference: string;
      status: string;
      cancelledAt: string;
    };
  }

  
  export interface ReturnItem {
    order_line_id: string | number;
    quantity: number;
    reason: string;
    images?: File[];
  }
  
  export interface InitiateReturnRequest {
    order_reference: string;
    items: ReturnItem[];
  }
  
  export interface InitiateReturnResponse {
    success: boolean;
    message?: string;
    data?: any;
  }
  
  export interface InvoiceResponse {
    success: boolean;
    data: {
      invoice: {
        id: number;
        invoice_number: string;
        issued_at: string;
        subtotal_before_redemption: string;
        coin_redeemed: string;
        total_taxable: string;
        total_cgst: string;
        total_sgst: string;
        total_igst: string;
        total_tax: string;
        coupon_code: string | null;
        coupon_discount: string;
        shipping_charge: string;
        subtotal_after_discount: string;
        total: string;
        total_payable: string;
        line_items: string;
        summary_snapshot: string;
        seller_details: {
          name: string;
          gstin: string;
          address: string;
        };
        buyer_details: {
          name: string;
          gstin: string;
          address: string;
        };
        delivery_state: string;
      };
  
      order: {
        id: number;
        order_reference: string;
        order_type: string;
        subtotal: string;
        total_gst: string;
        shipping_charge: string;
        coin_redeemed: string;
        coin_redeemed_amount: string;
        total_payable: string;
        amount_paid: string;
        status: string;
        payment_gateway: string;
        gateway_transaction_id: string;
        confirmed_at: string;
        courier_company: string | null;
        courier_tracking_number: string | null;
        courier_status: string | null;
        courier_delivery_date: string | null;
        delivery_notes: string | null;
        tax_breakdown: string;
        summary_data: any;
        created_at: string;
        updated_at: string;
      };
  
      order_lines: {
        id: number;
        product_id: number;
        product_name: string;
        product_code: string;
        quantity: number;
        unit_price: string;
        gst_rate: string;
        gst_amount: string;
        line_total: string;
        commissionable_volume: string;
        tax_data: any;
        product_image: string;
        product_images: string[];
      }[];
    };
  }

  export interface AddRatingReviewRequest {
    rating: number;
    review_text: string;
    order_id?: number; // Made optional
    order_line_id: number; // Required - this is the line/item ID
    product_id: number;
    images?: File[];
  }
  
  export interface AddRatingReviewResponse {
    success: boolean;
    message: string;
    data?: any;
  }