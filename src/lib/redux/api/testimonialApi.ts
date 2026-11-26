
import { baseApi } from "@/lib/redux/api/baseApi";

import {
  TestimonialResponse,
} from "@/lib/redux/api/testimonialTypes";

export const testimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Testimonials
    getTestimonials: builder.query<TestimonialResponse, void>({
      query: () => ({
        url: "/testimonials",
        method: "GET",
      }),
      providesTags: ["Testimonial"],
    }),
  }),
});

export const {
  useGetTestimonialsQuery,
} = testimonialApi;

export default testimonialApi;
