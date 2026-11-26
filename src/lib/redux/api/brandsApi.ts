import { baseApi } from "@/lib/redux/api/baseApi";
import { GetBrandsResponse } from "@/lib/redux/api/brandsTypes";

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET - Fetch all brands
    getBrands: builder.query<GetBrandsResponse, void>({
      query: () => ({
        url: "/brands",
        method: "GET",
      }),
      providesTags: ["Brand"],

      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("Brands retrieved successfully:", data);
        } catch (error) {
          console.error("Failed to fetch brands:", error);
        }
      },
    }),
  }),
});

export const {
  useGetBrandsQuery,
} = brandsApi;

export default brandsApi;