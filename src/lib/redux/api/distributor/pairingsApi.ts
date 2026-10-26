// lib/redux/api/distributor/pairingsApi.ts
import { baseApi } from "../baseApi";

export interface PairingWeek {
  year: number;
  week_no: number;
}

export interface PairingRecord {
  [key: string]: unknown;
}

export interface PairingsResponse {
  success: boolean;
  data: PairingRecord[];
  total: number;
  week: PairingWeek;
}

export const pairingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPairings: builder.query<
      PairingsResponse,
      { year: number; week_no: number }
    >({
      query: ({ year, week_no }) => ({
        url: "/distributor/genealogy/pairings",
        method: "GET",
        params: { year, week_no },
      }),
    }),
  }),
});

export const { useGetPairingsQuery } = pairingsApi;

export default pairingsApi;