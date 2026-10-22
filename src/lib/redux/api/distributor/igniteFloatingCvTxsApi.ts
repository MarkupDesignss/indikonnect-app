import { baseApi } from "../baseApi";

export interface IgniteCVWeek {
  year: number;
  week_no: number;
}

export interface IgniteFloatingCVTransaction {
  id: number;
  created_at: string;
  side: number;
  amount: string;
  description: string;

  buyer_member_id: number | null;
  buyer_ba_id: string | null;
  order_no: string | null;

  sales_week: IgniteCVWeek | null;
  settlement_week: IgniteCVWeek | null;
}

export interface IgniteFloatingCVTxsResponse {
  success: boolean;
  message?: string;
  data: IgniteFloatingCVTransaction[];
  total: number;
  has_more: boolean;
  after_id: number;
}

export interface IgniteFloatingCVTxsParams {
  after_id?: number;
}

export const igniteFloatingCvTxsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIgniteFloatingCvTxs: builder.query<
      IgniteFloatingCVTxsResponse,
      IgniteFloatingCVTxsParams
    >({
      query: ({ after_id = 0 }) => ({
        // Assumes baseApi.baseUrl already contains "/api".
        url: "/ignite/floating-cv-txs",
        method: "GET",
        params: { after_id },
      }),
    }),
  }),
});

export const {
  useGetIgniteFloatingCvTxsQuery,
  useLazyGetIgniteFloatingCvTxsQuery,
} = igniteFloatingCvTxsApi;

export default igniteFloatingCvTxsApi;