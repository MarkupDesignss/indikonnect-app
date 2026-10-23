
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
// SET PLACEMENT TYPES
// ==================================================

export interface SetPlacementRequest {
  ba_id: string;
  side: 1 | 2;
}

export interface SetPlacementResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

// ==================================================
// API
// ==================================================

export const distributorPendingPlacementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Pending Placements
    getDistributorPendingPlacements: builder.query<
      DistributorPendingPlacementsResponse,
      void
    >({
      query: () => ({
        url: "/distributor/genealogy/pending-placements",
        method: "GET",
      }),
      providesTags: ["DistributorPendingPlacements"],
    }),

    // POST: Set Placement
    setDistributorPlacement: builder.mutation<
      SetPlacementResponse,
      SetPlacementRequest
    >({
      query: (body) => ({
        url: "/distributor/genealogy/set-placement",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DistributorPendingPlacements"],
    }),
  }),
});

// ==================================================
// EXPORT HOOKS
// ==================================================

export const {
  useGetDistributorPendingPlacementsQuery,
  useSetDistributorPlacementMutation,
} = distributorPendingPlacementsApi;

export default distributorPendingPlacementsApi;
