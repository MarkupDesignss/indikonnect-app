import { baseApi } from "./baseApi";
import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartData,
  CartSummary,
  AddToCartResponse,
  ApiResponse,
  MergeCartResponse,
} from "./cartTypes";

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

    // Apply coupon
    applyCoupon: builder.mutation<CartResponse, { coupon_code: string }>({
      query: (data) => ({
        url: "/cart/coupon",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove coupon
    removeCoupon: builder.mutation<CartResponse, void>({
      query: () => ({
        url: "/cart/coupon",
        method: "DELETE",
      }),
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
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useLazyGetCartQuery,
  useLazyGetCartSummaryQuery,
} = cartApi;

export default cartApi;
