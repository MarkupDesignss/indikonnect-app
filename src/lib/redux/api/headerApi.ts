import { baseApi } from "./baseApi";
import { HeaderResponse } from "./headerTypes";

export const headerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get header data
    getHeader: builder.query<HeaderResponse, void>({
      query: () => ({
        url: "/header",
        method: "GET",
      }),
      providesTags: ["Header"],
    }),

    // Get distributor stats
    getDistributorStats: builder.query<HeaderResponse, void>({
      query: () => ({
        url: "/distributor-stats",
        method: "GET",
      }),
      providesTags: ["Header"],
    }),
  }),
});

export const {
  useGetHeaderQuery,
  useGetDistributorStatsQuery,
} = headerApi;

export default headerApi;