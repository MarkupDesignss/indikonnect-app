// src/lib/redux/api/cartApi.ts
import { baseApi } from "./baseApi";
import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartSummary,
  AddToCartResponse,
  ApiResponse,
  MergeCartResponse,
} from "./cartTypes";

interface CouponsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Coupon[];
    total: number;
    per_page: number;
  };
}

/* =========================================================
   CART LIVE STOCK TYPES
========================================================= */

export interface CartStockItem {
  product_id: number;
  requested_quantity: number;
  stock_quantity: number;
  available: boolean;
  status: string;
}

export interface CartStockResponse {
  success: boolean;
  data: {
    all_available: boolean;
    total_items: number;
    available_items: number;
    unavailable_items: number;
    items: CartStockItem[];
  };
  message?: string;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get cart
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: "/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // Add item to cart
    addToCart: builder.mutation<AddToCartResponse, AddToCartRequest>({
      query: (data) => ({
        url: "/cart/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation<
      ApiResponse,
      {
        itemId: number;
        data: UpdateCartItemRequest;
      }
    >({
      query: ({ itemId, data }) => ({
        url: `/cart/update/${itemId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation<ApiResponse, number>({
      query: (itemId) => ({
        url: `/cart/remove/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Clear cart
    clearCart: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: "/cart/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Merge guest cart with user cart
    mergeCart: builder.mutation<MergeCartResponse, { sessionId?: string }>({
      query: ({ sessionId }) => {
        const headers: Record<string, string> = {};
        if (sessionId) {
          headers["X-Session-ID"] = sessionId;
        }
        return {
          url: "/cart/merge",
          method: "POST",
          headers,
        };
      },
      invalidatesTags: ["Cart"],
    }),

    // Get cart summary
    getCartSummary: builder.query<CartSummary, void>({
      query: () => ({
        url: "/cart/summary",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    getCoupons: builder.query<CouponsResponse, void>({
      query: () => ({
        url: "/coupons",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    /* =======================================================
       LIVE STOCK CHECK FOR ENTIRE CART
       GET /carts/{cartId}/check-stock
       Returns availability for every product in the cart.
       `cache: no-store` + `Cache-Control: no-cache` ensure
       the freshest data is fetched every time.
    ======================================================= */

    checkCartStock: builder.mutation<CartStockResponse, { cartId: number }>({
      query: ({ cartId }) => ({
        url: `/carts/${encodeURIComponent(String(cartId))}/check-stock`,
        method: "GET",
        cache: "no-store" as RequestCache,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }),
      // Cart contents did not change, but stock availability might have.
      // Invalidate Cart so the cart page refetches the latest quantities.
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useMergeCartMutation,
  useGetCartSummaryQuery,
  useGetCouponsQuery,
  useLazyGetCartQuery,
  useLazyGetCartSummaryQuery,
  useCheckCartStockMutation,
} = cartApi;

export default cartApi;
