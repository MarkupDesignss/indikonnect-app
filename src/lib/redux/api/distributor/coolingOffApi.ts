// src/lib/redux/api/order/coolingOffApi.ts
import { baseApi } from "../baseApi";

export interface CoolingOffEligibilityResponse {
  success: boolean;
  data: {
    order_reference: string;
    is_eligible: boolean;
    cooling_off_days: number;
    days_since_purchase: number;
    remaining_days: number;
    expiry_date: string;
    order_status: string;
    has_pending_return: boolean;
    has_approved_return: boolean;
    reason_required: boolean;
    scope: string;
  };
}

export interface CoolingOffWithdrawResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const coolingOffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET eligibility
    getCoolingOffEligibility: builder.query<
      CoolingOffEligibilityResponse,
      string
    >({
      query: (orderReference) => ({
        url: `/orders/${orderReference}/cooling-off-eligibility`,
        method: "GET",
      }),
      providesTags: (result, error, orderReference) => [
        { type: "Orders", id: orderReference },
      ],
    }),

    // ✅ POST withdraw
    withdrawCoolingOff: builder.mutation<
      CoolingOffWithdrawResponse,
      { orderReference: string; reason?: string }
    >({
      query: ({ orderReference, reason }) => ({
        url: `/orders/${orderReference}/cooling-off-withdraw`,
        method: "POST",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetCoolingOffEligibilityQuery,
  useLazyGetCoolingOffEligibilityQuery,
  useWithdrawCoolingOffMutation,
} = coolingOffApi;

export default coolingOffApi;