
import { baseApi } from "./baseApi";

// Types
export interface GetLogoResponse {
  success: boolean;
  data: {
    logo: string;
  };
}

// Logo API
export const logoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogo: builder.query<GetLogoResponse, void>({
      query: () => ({
        url: "/logo",
        method: "GET",
      }),
      keepUnusedDataFor: 3600,
    }),
  }),
  overrideExisting: false,
});

export const { useGetLogoQuery } = logoApi;

export default logoApi;
