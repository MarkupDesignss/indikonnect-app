// src/lib/redux/api/wishlistApi.ts

import { baseApi } from "../baseApi";
import {
  AddToWishlistRequest,
  AddToWishlistResponse,
  GetWishlistResponse,
  RemoveFromWishlistRequest,
  RemoveFromWishlistResponse,
  MoveToCartRequest,
  MoveToCartResponse,
  MoveAllToCartResponse,
} from "./wishlistTypes";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET Wishlist - Fetch all wishlist items
    getWishlist: builder.query<GetWishlistResponse, void>({
      query: () => ({
        url: "/wishlist",
        method: "GET",
      }),
      providesTags: ["Wishlist"],
    }),

    // 2. POST - Add product to wishlist
    addToWishlist: builder.mutation<
      AddToWishlistResponse,
      AddToWishlistRequest
    >({
      query: (data) => ({
        url: "/wishlist/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Wishlist", "Product"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("Product added to wishlist:", data.message);
        } catch (error) {
          console.error("Failed to add to wishlist:", error);
        }
      },
    }),

    // 3. POST - Remove product from wishlist
    removeFromWishlist: builder.mutation<
      RemoveFromWishlistResponse,
      RemoveFromWishlistRequest
    >({
      query: (data) => ({
        url: "/wishlist/remove",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Wishlist", "Product"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("Product removed from wishlist:", data.message);
        } catch (error) {
          console.error("Failed to remove from wishlist:", error);
        }
      },
    }),

    // 4. POST - Move single product to cart
    moveToCart: builder.mutation<MoveToCartResponse, MoveToCartRequest>({
      query: (data) => ({
        url: "/wishlist/move-to-cart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Wishlist", "Cart", "Product"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("Product moved to cart:", data.message);
        } catch (error) {
          console.error("Failed to move to cart:", error);
        }
      },
    }),

    // 5. POST - Move all wishlist items to cart
    moveAllToCart: builder.mutation<MoveAllToCartResponse, void>({
      query: () => ({
        url: "/wishlist/move-all-to-cart",
        method: "POST",
      }),
      invalidatesTags: ["Wishlist", "Cart", "Product"],
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("All items moved to cart:", data.message);
        } catch (error) {
          console.error("Failed to move all items to cart:", error);
        }
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useMoveToCartMutation,
  useMoveAllToCartMutation,
} = wishlistApi;

export default wishlistApi;
