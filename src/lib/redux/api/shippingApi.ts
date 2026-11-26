// src/lib/redux/api/shippingApi.ts

import { baseApi } from "@/lib/redux/api/baseApi";
import { ShippingMethodsResponse } from "@/lib/redux/api/shippingTypes";

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all shipping methods
    getShippingMethods: builder.query<ShippingMethodsResponse, void>({
      query: () => ({
        url: "/shipping-methods",
        method: "GET",
      }),
      providesTags: ["ShippingMethods"],
    }),
  }),
});

export const {
  useGetShippingMethodsQuery,
  useLazyGetShippingMethodsQuery,
} = shippingApi;

export default shippingApi;