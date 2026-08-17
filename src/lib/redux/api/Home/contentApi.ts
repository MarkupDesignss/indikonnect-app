import { baseApi } from "../baseApi";

import type {
  ContentResponse,
  ReelsResponse,
  TrendingProductsResponse,
} from "./contentTypes";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all website contents
    getContents: builder.query<ContentResponse, void>({
      query: () => ({
        url: "/contents",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Deal of the Day Products
    getDealOfTheDayProducts: builder.query<ContentResponse, void>({
      query: () => ({
        url: "/products-deal-of-the-day",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Reels
    getReels: builder.query<ReelsResponse, void>({
      query: () => ({
        url: "/reels",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Trending Products
    getTrendingProducts: builder.query<
      TrendingProductsResponse,
      void
    >({
      query: () => ({
        url: "/products/trending",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetDealOfTheDayProductsQuery,
  useGetReelsQuery,
  useGetTrendingProductsQuery,
} = contentApi;

export default contentApi;