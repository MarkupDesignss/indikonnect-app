import { baseApi } from "./baseApi";

// =========================================================
// CHECKOUT SUMMARY ITEM
// =========================================================

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

// =========================================================
// CHECKOUT SUMMARY RESPONSE
// =========================================================

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
        product_id?: number;
        product_name: string;
        product_code: string;
        quantity: number;
        unit_price: number;
        tax_category: string;
        tax_rate: string;
        taxable_value: number;
        tax_amount: number;
        line_total_after_tax: number;
        primary_image?: string;

        images?: {
          id: number;
          image: string;
          image_url: string;
          is_primary: boolean;
          sort_order: number;
        }[];
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
    } | null;

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

// =========================================================
// CHECKOUT SUMMARY PARAMS
// =========================================================

export interface CheckoutSummaryParams {
  address_id?: number;
  coupon_code?: string;
  coins?: number;

  // Buy Now
  product_id?: number;
  quantity?: number;
}

// =========================================================
// PLACE ORDER REQUEST
// =========================================================

export interface PlaceOrderRequest {
  address_id: number;

  grand_total: number;

  payment_gateway: "razorpay" | string;

  // Buy Now
  product_id?: number;
  quantity?: number;

  summary_data?: {
    subtotal: number;
    coupon_discount: number;
    coupon_code: string | null;
    shipping_charge: number;
    coin_redeemed?: number;
    amount_redeemed?: number;
    total_tax: number;
    net_subtotal: number;
    tax_breakdown?: unknown[];
  };
}

// =========================================================
// PLACE ORDER RESPONSE
// =========================================================

export interface PlaceOrderOrder {
  order_id: number;
  order_reference: string;

  subtotal: string | number;
  shipping_charge: string | number;
  total_tax: string | number;
  total_payable: string | number;
}

export interface PlaceOrderResponse {
  success?: boolean;
  message?: string;

  order_group_id?: string;
  order_ids?: number[];
  order_references?: string[];
  total_orders?: number;
  total_amount?: number | string;

  razorpay_order_id?: string;
  razorpay_key?: string;
  status?: string;
  checkout_type?: string;

  tax_split?: {
    delivery_state?: string;
    supplier_state?: string;
    total_cgst?: number;
    total_sgst?: number;
    total_igst?: number;
  };

  orders?: PlaceOrderOrder[];

  data?: {
    order_group_id?: string;
    order_ids?: number[];
    order_references?: string[];
    total_orders?: number;
    total_amount?: number | string;

    razorpay_order_id?: string;
    razorpay_key?: string;
    status?: string;
    checkout_type?: string;

    tax_split?: {
      delivery_state?: string;
      supplier_state?: string;
      total_cgst?: number;
      total_sgst?: number;
      total_igst?: number;
    };

    orders?: PlaceOrderOrder[];

    order_id?: number;
    order_reference?: string;
    amount?: string | number;
  };
}

// =========================================================
// CONFIRMED ORDER IMAGE
// =========================================================

export interface ConfirmedOrderImage {
  id?: number;
  image_url?: string;
  image?: string;
  is_primary?: boolean;
  sort_order?: number;
}

// =========================================================
// CONFIRMED ORDER ITEM
// =========================================================

export interface ConfirmedOrderItem {
  id: number;
  product_id: number;
  variant_id?: number | null;

  product_name: string;
  product_code: string;

  variant_sku?: string | null;

  variant_attributes?: Record<string, string | number | null>;

  quantity: number;

  unit_price: number | string;

  shipping_charge_per_unit?: number | string;
  total_shipping_charge?: number | string;

  gst_rate?: number | string;
  cgst_rate?: number | string;
  sgst_rate?: number | string;
  igst_rate?: number | string;

  gst_amount: number | string;
  cgst_amount?: number | string;
  sgst_amount?: number | string;
  igst_amount?: number | string;

  line_total: number | string;

  delivery_status?: string;
  return_status?: string;

  product_image?: string | null;

  images?: ConfirmedOrderImage[];
  primary_image?: string | null;
}

// =========================================================
// CONFIRMED ORDER ADDRESS
// =========================================================

export interface ConfirmedOrderAddress {
  id: number;

  full_name?: string | null;
  name?: string | null;

  phone?: string | null;

  address_line_1?: string | null;
  address_line_2?: string | null;

  city?: string | null;
  state?: string | null;

  postal_code?: string | null;
  pincode?: string | null;

  country?: string | null;

  full_address?: string | null;
}

// =========================================================
// CONFIRMED ORDER USER
// =========================================================

export interface ConfirmedOrderUser {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  is_distributor?: boolean;
}

// =========================================================
// CONFIRMED ORDER INVOICE
// =========================================================

export interface ConfirmedOrderInvoice {
  invoice_number: string;
  invoice_url: string;
  generated_at: string;
}

// =========================================================
// CONFIRMED ORDER TIMELINE
// =========================================================

export interface ConfirmedOrderTimeline {
  order_placed?: string | null;
  order_confirmed?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

// =========================================================
// CONFIRMED ORDER
// =========================================================

export interface ConfirmedOrder {
  order_id: number;
  order_reference: string;

  order_group_id?: string | null;

  status?: string | null;
  order_status?: string | null;

  order_type: string;
  checkout_type?: string | null;

  order_date?: string | null;
  created_at?: string | null;

  confirmed_date?: string | null;
  confirmed_at?: string | null;

  payment_gateway: string | null;
  gateway_transaction_id: string | null;

  amount_paid: number | string;

  payment_status?: string | null;

  subtotal: number | string;

  coupon_code?: string | null;
  coupon_discount?: number | string;

  total_gst: number | string;

  total_cgst?: number | string;
  total_sgst?: number | string;
  total_igst?: number | string;

  shipping_charge: number | string;

  coin_redeemed?: number | string;
  coin_redeemed_amount?: number | string;

  total_payable: number | string;

  tax_breakdown?: unknown[];

  items: ConfirmedOrderItem[];

  billing_address: ConfirmedOrderAddress;
  delivery_address: ConfirmedOrderAddress;

  user: ConfirmedOrderUser;

  invoice?: ConfirmedOrderInvoice | null;

  timeline?: ConfirmedOrderTimeline;
}

// =========================================================
// AGGREGATED SUMMARY
// =========================================================

export interface ConfirmedOrderAggregatedSummary {
  order_group_id: string;

  total_orders: number;

  order_references: string[];

  order_ids: number[];

  subtotal: number | string;

  total_gst: number | string;

  total_cgst: number | string;

  total_sgst: number | string;

  total_igst: number | string;

  shipping_charge: number | string;

  coupon_code: string | null;

  coupon_discount: number | string;

  coin_redeemed: number | string;

  coin_redeemed_amount: number | string;

  total_payable: number | string;

  amount_paid?: number | string;

  total_items: number;
}

// =========================================================
// CONFIRMED ORDER DATA
// =========================================================

export interface ConfirmedOrderData {
  is_grouped: boolean;

  order_group_id: string;

  aggregated_summary: ConfirmedOrderAggregatedSummary;

  orders: ConfirmedOrder[];
}

// =========================================================
// CONFIRMED ORDER RESPONSE
// =========================================================

export interface ConfirmedOrderResponse {
  success: boolean;

  data: ConfirmedOrderData;

  message?: string;
}

// =========================================================
// CHECKOUT API
// =========================================================

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // CHECKOUT SUMMARY
    // =====================================================

    getCheckoutSummary: builder.query<
      CheckoutSummaryResponse,
      CheckoutSummaryParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};

        if (params?.address_id !== undefined) {
          queryParams.address_id = params.address_id;
        }

        if (params?.coupon_code) {
          queryParams.coupon_code = params.coupon_code;
        }

        if (params?.coins !== undefined) {
          queryParams.coins = params.coins;
        }

        if (params?.product_id !== undefined) {
          queryParams.product_id = params.product_id;
        }

        if (params?.quantity !== undefined) {
          queryParams.quantity = params.quantity;
        }

        return {
          url: "/checkout/summary",
          method: "GET",
          params: queryParams,
        };
      },

      providesTags: ["Cart"],
    }),

    // =====================================================
    // PLACE ORDER
    // =====================================================

    placeOrder: builder.mutation<
      PlaceOrderResponse,
      PlaceOrderRequest
    >({
      query: (data) => {
        const body: Record<string, any> = {
          address_id: data.address_id,
          grand_total: data.grand_total,
          payment_gateway: data.payment_gateway,
        };

        if (data.summary_data) {
          body.summary_data = data.summary_data;
        }

        if (data.product_id !== undefined) {
          body.product_id = data.product_id;
        }

        if (data.quantity !== undefined) {
          body.quantity = data.quantity;
        }

        return {
          url: "/checkout/place-order",
          method: "POST",
          body,
        };
      },

      invalidatesTags: ["Cart"],
    }),

    // =====================================================
    // CONFIRMED ORDER
    // =====================================================

    getConfirmedOrder: builder.query<
      ConfirmedOrderResponse,
      string
    >({
      query: (orderGroupId) => ({
        url: `/orders/confirmed/${encodeURIComponent(orderGroupId)}`,
        method: "GET",
      }),
    }),
  }),
});

// =========================================================
// EXPORT HOOKS
// =========================================================

export const {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
  useGetConfirmedOrderQuery,
} = checkoutApi;