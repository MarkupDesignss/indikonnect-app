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
          ...(shipping_method_id
            ? { shipping_method_id }
            : {}),
          ...(coins !== undefined ? { coins } : {}),
        },
      }),
    }),
  }),
});

export const {
  useGetCheckoutSummaryQuery,
} = checkoutApi;