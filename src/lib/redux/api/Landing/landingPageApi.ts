import { baseApi } from "../baseApi";
import {
  LandingPageResponse,
} from "./landingPageTypes";

export const landingPageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPage: builder.query<LandingPageResponse, void>({
      query: () => ({
        url: "/contents/landing-page",
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetLandingPageQuery,
} = landingPageApi;

export default landingPageApi;