import { baseApi } from "../baseApi";

// =====================================================
// DASHBOARD USER
// =====================================================

export interface DashboardUser {
  name: string;
  email: string;
  account_type: string;
  member_since: string;
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export interface DashboardStats {
  total_orders: number;
  wishlist: number;
  points_earned: string;
  reviews: number;
  average_rating: number;
  cart_items: number;
}

// =====================================================
// DASHBOARD IMAGE
// =====================================================

export interface DashboardImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

// =====================================================
// DASHBOARD WISHLIST ITEM
// =====================================================

export interface DashboardWishlistItem {
  id: number;
  product_id: number;
  product_code: string;
  name: string;
  slug: string;
  retail_price: string;
  distributor_price: string;
  images: DashboardImage[];
  added_at: string;
}

// =====================================================
// DASHBOARD CART ITEM
// =====================================================

export interface DashboardCartItem {
  id: number;
  product_id: number;
  product_code: string;
  name: string;
  slug: string;
  quantity: number;
  unit_price: string;
  line_total: number;
  images: DashboardImage[];
}

// =====================================================
// DASHBOARD ACTIVITY
// =====================================================

export interface DashboardActivity {
  type: string;
  event: string;
  created_at: string;
  updated_at: string;
  created_timestamp: number;
  updated_timestamp: number;
  product_id?: number;
  wishlist_id?: number;
  quantity?: number;
  product_name?: string;
}

// =====================================================
// IGNITE DASHBOARD
// =====================================================

export interface IgniteDashboard {
  member_id?: number;
  ba_id?: string;
  rank_no?: number;
  base_rank_no?: number;
  eligible_rank_no?: number;
  cv_left?: string;
  cv_right?: string;
  floating_cv_left?: string;
  floating_cv_right?: string;
  total_cv_left?: string;
  total_cv_right?: string;
  cash_bal?: string;
  green_bal?: string;
  yellow_bal?: string;
  blue_bal?: string;
  membership_status?: string;
  total_steps?: number;
  qualified_at?: string;
  is_placed?: boolean;
  placement_leg?: number;
}

// =====================================================
// DASHBOARD LATEST ORDER
// =====================================================

export interface DashboardLatestOrder {
  order_reference?: string;
  order_number?: string;
  reference?: string;
  status?: string;
  total_amount?: string | number;
  created_at?: string;
  [key: string]: unknown;
}

// =====================================================
// USER DASHBOARD RESPONSE
// =====================================================

export interface UserDashboardResponse {
  success: boolean;
  message?: string;
  data: {
    user: DashboardUser;
    stats: DashboardStats;
    latest_order: DashboardLatestOrder | null;
    recent_activity: DashboardActivity[];
    wishlist: DashboardWishlistItem[];
    cart: DashboardCartItem[];
    ignite: IgniteDashboard | null;
  };
}

// =====================================================
// CREATE CORRECTION REQUEST
// =====================================================

export interface CreateCorrectionRequestPayload {
  reason: string;
}

export interface CreateCorrectionRequestResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string | string[]>;
}

// =====================================================
// PLACE BANKED TC
// =====================================================

export interface PlaceBankedTcPayload {
  ba_id: string;
  side: 1 | 2;
}

export interface PlaceBankedTcResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string | string[]>;
}

// =====================================================
// USER DASHBOARD API
// =====================================================

export const userDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // -------------------------------------------------
    // GET USER DASHBOARD
    // -------------------------------------------------

    getUserDashboard: builder.query<UserDashboardResponse, void>({
      query: () => ({
        url: "/user/dashboard",
        method: "GET",
      }),
    }),

    // -------------------------------------------------
    // CREATE CORRECTION REQUEST
    // -------------------------------------------------

    createCorrectionRequest: builder.mutation<
      CreateCorrectionRequestResponse,
      CreateCorrectionRequestPayload
    >({
      query: (body) => ({
        url: "/correction-requests",
        method: "POST",
        body,
      }),
    }),

    // -------------------------------------------------
    // PLACE BANKED TC
    // -------------------------------------------------

    placeBankedTc: builder.mutation<
      PlaceBankedTcResponse,
      PlaceBankedTcPayload
    >({
      query: (body) => ({
        url: "/distributor/genealogy/place-banked-tc",
        method: "POST",
        body,
      }),
    }),
  }),
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
  useGetUserDashboardQuery,
  useCreateCorrectionRequestMutation,
  usePlaceBankedTcMutation,
} = userDashboardApi;

export default userDashboardApi;