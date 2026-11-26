
import { baseApi } from "@/lib/redux/api/baseApi";
import {
  CategoryResponse,
  Category,
} from "@/lib/redux/api/categoryTypes";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Categories
    getCategories: builder.query<CategoryResponse, void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
} = categoryApi;

export default categoryApi;
