
import { baseApi } from "./baseApi";

import {
  TestimonialResponse,
} from "./testimonialTypes";

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
