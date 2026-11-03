import { baseApi } from "../baseApi";

export interface TrackingCvCounterParams {
  ba_id: string;
  year: number;
  week_no: number;
}

export const trackingCvCounterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrackingCvCounter: builder.query<unknown, TrackingCvCounterParams>({
      query: ({ ba_id, year, week_no }) => ({
        url: "/distributor/genealogy/cv-counter",
        method: "GET",
        params: {
          ba_id,
          year,
          week_no,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTrackingCvCounterQuery,
  useLazyGetTrackingCvCounterQuery,
} = trackingCvCounterApi;
