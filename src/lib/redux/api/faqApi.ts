import { baseApi } from "@/lib/redux/api/baseApi";
import type { FAQResponse } from "@/lib/redux/api/faqTypes";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFAQs: builder.query<FAQResponse, void>({
      query: () => ({
        url: "/faqs",
        method: "GET",
      }),
      providesTags: ["FAQ"],
    }),
  }),
});

export const {
  useGetFAQsQuery,
} = faqApi;

export default faqApi;