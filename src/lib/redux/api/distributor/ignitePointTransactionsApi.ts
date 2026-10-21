import { baseApi } from "../baseApi";

export type IgnitePointType =
  | "cash_bal"
  | "green_bal"
  | "yellow_bal"
  | "blue_bal"
  | string;

export type IgniteTransactionType = string;

export interface IgnitePointTransaction {
  id: number;
  created_at: string;

  point_type: IgnitePointType;
  tx_type: IgniteTransactionType;
  description: string;

  amount: string;
  bal_after: string;
  order_no: string | number | null;
  redemption_id: number | null;
  rel_member_id: number | null;
  rel_ba_id: string | null;
  member_note: string | null;
}


export interface IgnitePointTransactionsResponse {
  success: boolean;
  message?: string;

  data: IgnitePointTransaction[];

  total: number;
  has_more: boolean;
  after_id: number;
}

export interface IgnitePointTransactionsParams {
  after_id?: number;
}

// ==================================================
// RTK QUERY API
// ==================================================

export const ignitePointTransactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIgnitePointTransactions: builder.query<
      IgnitePointTransactionsResponse,
      IgnitePointTransactionsParams
    >({
      query: ({ after_id = 0 }) => ({
        url: "/ignite/point-txs",
        method: "GET",
        params: { after_id },
      }),
    }),
  }),
});

export const {
  useGetIgnitePointTransactionsQuery,
  useLazyGetIgnitePointTransactionsQuery,
} = ignitePointTransactionsApi;

export default ignitePointTransactionsApi;