// src/lib/redux/api/baseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API configuration
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://www.markupdesigns.net/indikonnect/api/",
    prepareHeaders: (headers) => {
      // Add authorization token if available
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Distributor", "Customer", "User", "Order", "Products","Cart"],
  endpoints: () => ({}),
});

export default baseApi;
