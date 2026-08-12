// src/lib/redux/api/shippingApi.ts

import { baseApi } from "./baseApi";
import { ShippingMethodsResponse } from "./shippingTypes";

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