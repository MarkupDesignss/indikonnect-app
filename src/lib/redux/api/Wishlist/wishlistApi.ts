import { baseApi } from "../baseApi";
import {
    AddToWishlistRequest,
    AddToWishlistResponse,
    GetWishlistResponse,
    RemoveFromWishlistRequest,
    RemoveFromWishlistResponse,
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
        addToWishlist: builder.mutation<AddToWishlistResponse, AddToWishlistRequest>({
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
        removeFromWishlist: builder.mutation<RemoveFromWishlistResponse, RemoveFromWishlistRequest>({
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
    }),
});


export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApi;

export default wishlistApi;