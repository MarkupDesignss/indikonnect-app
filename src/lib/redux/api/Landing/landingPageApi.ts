import { baseApi } from "@/lib/redux/api/baseApi";
import {
  LandingPageResponse,
} from "@/lib/redux/api/Landing/landingPageTypes";

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