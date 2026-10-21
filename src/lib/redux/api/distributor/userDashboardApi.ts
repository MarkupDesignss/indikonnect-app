import { baseApi } from "../baseApi";

export interface DashboardUser {
  name: string;
  email: string;
  account_type: string;
  member_since: string;
}

export interface DashboardStats {
  total_orders: number;
  wishlist: number;
  points_earned: string;
  reviews: number;
  average_rating: number;
  cart_items: number;
}

export interface DashboardImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

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

export interface DashboardLatestOrder {
  order_reference?: string;
  order_number?: string;
  reference?: string;
  status?: string;
  total_amount?: string | number;
  created_at?: string;
  [key: string]: unknown;
}

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

export const userDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDashboard: builder.query<UserDashboardResponse, void>({
      query: () => ({
        url: "/user/dashboard",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUserDashboardQuery } = userDashboardApi;

export default userDashboardApi;