import { baseApi } from "../baseApi";

// ==================================================
// TYPES
// ==================================================

export interface PendingPlacement {
  member_id: number;
  ba_id: string;
  fullname: string;
  registered_at: string;
  has_ordered: boolean;
  unplaced_downline_count: number;
  placement_deadline: string | null;
  is_overdue: boolean;
}

export interface PendingPlacementSlots {
  far_left_ba_id: string | null;
  far_right_ba_id: string | null;
  far_left_id: number | null;
  far_right_id: number | null;
  left_available: boolean;
  right_available: boolean;
}

export interface DistributorPendingPlacementsResponse {
  success: boolean;
  message?: string;
  data: PendingPlacement[];
  total: number;
  slots: PendingPlacementSlots;
}

// ==================================================
// API
// ==================================================

export const distributorPendingPlacementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistributorPendingPlacements: builder.query<
      DistributorPendingPlacementsResponse,
      void
    >({
      query: () => ({
        // Assumes baseApi.baseUrl already includes "/api".
        url: "/distributor/genealogy/pending-placements",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDistributorPendingPlacementsQuery,
} = distributorPendingPlacementsApi;

export default distributorPendingPlacementsApi;
