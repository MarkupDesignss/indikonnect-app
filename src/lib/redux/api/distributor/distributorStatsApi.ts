import { baseApi } from "../baseApi";

// --------------------------------------------------
// Rank condition types
// --------------------------------------------------

export interface RankCondition {
  current: number | string;
  required: number | string;
  met: boolean;
  rank_no?: number;
}

export interface RankConditions {
  steps: RankCondition;
  direct_cv: RankCondition;
  downlines_one_below: RankCondition;
  downlines_two_below: RankCondition;
  tenure: RankCondition;
}

export interface DistributorRank {
  rank_no: number;
  name: string;
  step_comm: string;
  max_weekly_steps: number;
  met: boolean;
  conditions: RankConditions;
}

export interface SalesMonth {
  year: number;
  month_no: number;
  label: string;
  start_date: string;
  end_date: string;
}

export interface RankSnapshot {
  rank_no: number;
  base_rank_no: number;
  eligible_rank_no: number;
}

export interface ClosingRankSnapshot {
  met_rank_no: number;
  eligible_rank_no: number;
  rank_no: number;
}

export interface RankProgress {
  sales_month: SalesMonth;
  current: RankSnapshot;
  closing: ClosingRankSnapshot;
  ranks: DistributorRank[];
}

// --------------------------------------------------
// Distributor stats data
// --------------------------------------------------

export interface DistributorStatsData {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  distributor_id: string;

  total_orders: number;
  total_amount_mrp: number;
  total_savings: number;
  total_cv: string;
  total_coins_redeemed: number;

  account_type: string;
  joined_at: string;

  rank_progress: RankProgress;
}

export interface DistributorStatsResponse {
  success: boolean;
  data: DistributorStatsData;
  message?: string;
}

// --------------------------------------------------
// API
// --------------------------------------------------

export const distributorStatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistributorStats: builder.query<
      DistributorStatsResponse,
      void
    >({
      query: () => ({
        url: "/distributor-stats",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDistributorStatsQuery,
} = distributorStatsApi;

export default distributorStatsApi;