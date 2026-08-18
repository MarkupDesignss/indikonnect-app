import { baseApi } from "../baseApi";

import type {
  ContentResponse,
  ReelsResponse,
  TrendingProductsResponse,
  FooterResponse,
  TopDiscountedProductsResponse,
  StatsResponse,
  GrowthStepsResponse,
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
    getTrendingProducts: builder.query<TrendingProductsResponse, void>({
      query: () => ({
        url: "/products/trending",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Top Discounted Products
    getTopDiscountedProducts: builder.query<
      TopDiscountedProductsResponse,
      void
    >({
      query: () => ({
        url: "/products-top-discounted",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Footer
    getFooter: builder.query<FooterResponse, void>({
      query: () => ({
        url: "/footer",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Statistics & Reviews
    getStats: builder.query<StatsResponse, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get Growth Steps
    getGrowthSteps: builder.query<GrowthStepsResponse, void>({
      query: () => ({
        url: "/growth-steps",
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
  useGetTopDiscountedProductsQuery,
  useGetFooterQuery,
  useGetStatsQuery,
  useGetGrowthStepsQuery,
} = contentApi;

export default contentApi;