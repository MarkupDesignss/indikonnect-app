
import { baseApi } from "../baseApi";

export interface BuybackItem {
  order_line_id: number;
  quantity: number;
  reason: string;
}

export interface BuybackInitiateRequest {
  items: BuybackItem[];
  return_reason: string;
  declares_marketable: boolean;
  declares_unsold: boolean;
  declares_unused: boolean;
}

export interface BuybackInitiateResponse {
  success: boolean;
  message?: string;
  data?: {
    buyback_reference?: string;
    order_reference?: string;
    status?: string;
    initiated_at?: string;
    total_items?: number;
    [key: string]: any;
  };
}

export const buybackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiateBuyback: builder.mutation<
      BuybackInitiateResponse,
      BuybackInitiateRequest
    >({
      query: (body) => ({
        url: `/distributor/buyback/initiate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useInitiateBuybackMutation } = buybackApi;

export default buybackApi;