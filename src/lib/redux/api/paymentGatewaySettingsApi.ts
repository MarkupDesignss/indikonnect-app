import { baseApi } from "./baseApi";

// =========================================================
// PAYMENT GATEWAY SETTING ITEM
// =========================================================
export interface PaymentGatewaySettingItem {
  key: string;
  value: string; // "0" | "1" (stored as string boolean)
  data_type: "boolean" | string;
  description?: string;
  is_editable: boolean;
  is_active: boolean;
}

// =========================================================
// PAYMENT GATEWAY SETTINGS RESPONSE
// =========================================================
export interface PaymentGatewaySettingsResponse {
  success: boolean;
  active_gateway: string | null;
  data: PaymentGatewaySettingItem[];
  message?: string;
}

// =========================================================
// PAYMENT GATEWAY SETTINGS API
// =========================================================
export const paymentGatewaySettingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // =====================================================
    // GET PAYMENT GATEWAY SETTINGS
    // GET /settings/payment-gateways
    // =====================================================
    getPaymentGatewaySettings: builder.query<
      PaymentGatewaySettingsResponse,
      void
    >({
      query: () => ({
        url: "/settings/payment-gateways",
        method: "GET",
      }),
      providesTags: ["PaymentGatewaySettings"],
    }),
  }),
});

// =========================================================
// EXPORT HOOKS
// =========================================================
export const {
  useGetPaymentGatewaySettingsQuery,
  useLazyGetPaymentGatewaySettingsQuery,
} = paymentGatewaySettingsApi;