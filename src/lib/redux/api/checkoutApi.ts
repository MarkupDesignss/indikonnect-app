import { baseApi } from "./baseApi";

export interface CheckoutSummaryItem {
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  tax_category: string;
  tax_rate: string;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  line_total: number;
}

export interface CheckoutSummaryResponse {
  success: boolean;
  data: {
    subtotal: number;
    coupon_discount: number;
    coupon: {
      code: string;
      title: string;
      type: string;
      value: string;
      discount_amount: number;
    } | null;
    subtotal_after_discount: number;
    product_tax_breakdown: Record<
      string,
      {
        product_name: string;
        product_code: string;
        quantity: number;
        unit_price: number;
        tax_category: string;
        tax_rate: string;
        taxable_value: number;
        tax_amount: number;
        line_total_after_tax: number;
      }
    >;
    additional_tax_on_subtotal: {
      description: string;
      rate: string;
      amount: number;
    } | null;
    total_tax: number;
    tax_by_category: {
      category: string;
      rate: string;
      taxable_amount: number;
      tax_amount: number;
      cgst: number;
      sgst: number;
      igst: number;
      is_gst: boolean;
    }[];
    shipping_cost: number;
    shipping_method: {
      id?: number;
      name?: string;
      code?: string;
    } | null;
    subtotal_after_discount_and_tax: number;
    coin_balance: number;
    max_coins_redeemable: number;
    coins_used: number;
    amount_redeemed: number;
    coin_redemption: {
      coins_used: number;
      amount_redeemed: number;
    } | null;
    grand_total: number;
    items: CheckoutSummaryItem[];
    tax_breakdown: {
      product_name: string;
      tax_category: string;
      rate: string;
      cgst: number;
      sgst: number;
      igst: number;
    }[];
    delivery_address: {
      id: number;
      full_address: string;
      state: string;
    };
    summary: {
      subtotal: number;
      less_coupon: number;
      net_subtotal: number;
      product_gst_18: number;
      product_other_tax: number;
      additional_gst_on_subtotal: number;
      total_tax: number;
      plus_shipping: number;
      less_coins: number;
      grand_total: number;
    };
  };
  message?: string;
}

export interface CheckoutSummaryParams {
  address_id: number;
  coupon_code?: string;
  shipping_method_id?: number;
  coins?: number;
}

export interface PlaceOrderRequest {
  address_id: number;
  grand_total: number;
  payment_gateway: "razorpay" | string;
  summary_data?: {
    subtotal: number;
    coupon_discount: number;
    coupon_code: string | null;
    shipping_charge: number;
    shipping_method_id: number | null;
    coin_redeemed: number;
    amount_redeemed: number;
    total_tax: number;
    net_subtotal: number;
  };
}

export interface PlaceOrderResponse {
  success: boolean;
  data?: {
    order_id: number;
    order_reference: string;
    amount: string | number;
    razorpay_order_id: string;
    razorpay_key: string;
    status?: string;
    [key: string]: any;
  };
  message?: string;
}

export interface ConfirmedOrderImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface ConfirmedOrderItem {
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  commissionable_volume: number;
  images: ConfirmedOrderImage[];
  primary_image: string;
}

export interface ConfirmedOrderAddress {
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

export interface ConfirmedOrderUser {
  id: number;
  name: string | null;
  email: string;
  phone: string;
  is_distributor: boolean;
}

export interface ConfirmedOrderInvoice {
  invoice_number: string;
  invoice_url: string;
  generated_at: string;
}

export interface ConfirmedOrderTimeline {
  order_placed: string;
  order_confirmed: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ConfirmedOrder {
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
  items: ConfirmedOrderItem[];
  billing_address: ConfirmedOrderAddress;
  delivery_address: ConfirmedOrderAddress;
  user: ConfirmedOrderUser;
  invoice: ConfirmedOrderInvoice | null;
  timeline: ConfirmedOrderTimeline;
}

export interface ConfirmedOrderResponse {
  success: boolean;
  data: ConfirmedOrder;
  message?: string;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutSummary: builder.query<
      CheckoutSummaryResponse,
      CheckoutSummaryParams
    >({
      query: ({
        address_id,
        coupon_code,
        shipping_method_id,
        coins,
      }) => ({
        url: "/checkout/summary",
        method: "GET",
        params: {
          address_id,
          ...(coupon_code ? { coupon_code } : {}),
          ...(shipping_method_id ? { shipping_method_id } : {}),
          ...(coins !== undefined ? { coins } : {}),
        },
      }),
    }),

    placeOrder: builder.mutation<
      PlaceOrderResponse,
      PlaceOrderRequest
    >({
      query: (data) => ({
        url: "/checkout/place-order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Get Confirmed Order Details
    getConfirmedOrder: builder.query<
      ConfirmedOrderResponse,
      string
    >({
      query: (orderReference) => ({
        url: `/orders/confirmed/${orderReference}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
  useGetConfirmedOrderQuery,
} = checkoutApi;

