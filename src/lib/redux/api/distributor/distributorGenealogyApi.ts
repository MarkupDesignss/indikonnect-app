
import { baseApi } from "../baseApi";

// --------------------------------------------------
// Types
// --------------------------------------------------

export interface GenealogyMember {
  member_id: number;
  ba_id: string;

  unilevel_parent_id: number | null;
  unilevel_parent_ba_id: string | null;

  binary_parent_id: number | null;
  binary_parent_ba_id: string | null;
  binary_side: number | null;

  cv_left: string;
  cv_right: string;

  floating_cv_left: string;
  floating_cv_right: string;

  total_cv_left: string;
  total_cv_right: string;

  level: number;

  far_left_id: number | null;
  far_left_ba_id: string | null;

  far_right_id: number | null;
  far_right_ba_id: string | null;
}

// --------------------------------------------------
// Genealogy Tree Types
// --------------------------------------------------

export interface DistributorGenealogyData {
  root: GenealogyMember;
  rows: GenealogyMember[];

  left_volume: string;
  right_volume: string;
  weaker_leg: string;

  depth: number;
  total_nodes: number;

  cv_settled_left: string;
  cv_settled_right: string;

  cv_floating_left: string;
  cv_floating_right: string;
}

export interface DistributorGenealogyResponse {
  success: boolean;
  message?: string;
  data: DistributorGenealogyData;
}

// --------------------------------------------------
// My Referrals Types
// --------------------------------------------------

export interface GenealogyReferral {
  member_id: number;
  ba_id: string;

  unilevel_parent_id: number | null;
  unilevel_parent_ba_id: string | null;

  binary_parent_id: number | null;
  binary_parent_ba_id: string | null;
  binary_side: number | null;

  cv_left: string;
  cv_right: string;

  floating_cv_left: string;
  floating_cv_right: string;

  total_cv_left: string;
  total_cv_right: string;

  level: number;

  name: string | null;
  joined_at: string | null;
}

export interface DistributorReferralsResponse {
  success: boolean;
  message?: string;
  data: GenealogyReferral[];
  total: number;
}

// --------------------------------------------------
// APIs
// --------------------------------------------------

export const distributorGenealogyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Distributor Genealogy Tree
    getDistributorGenealogyTree: builder.query<
      DistributorGenealogyResponse,
      void
    >({
      query: () => ({
        url: "/distributor/genealogy/tree",
        method: "GET",
      }),
    }),

    // 2. Distributor My Referrals
    getDistributorMyReferrals: builder.query<
      DistributorReferralsResponse,
      void
    >({
      query: () => ({
        url: "/distributor/genealogy/my-referrals",
        method: "GET",
      }),
    }),
  }),
});

// --------------------------------------------------
// Hooks
// --------------------------------------------------

export const {
  useGetDistributorGenealogyTreeQuery,
  useGetDistributorMyReferralsQuery,
} = distributorGenealogyApi;

export default distributorGenealogyApi;
