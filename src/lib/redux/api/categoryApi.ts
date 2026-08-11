
import { baseApi } from "./baseApi";
import {
  CategoryResponse,
  Category,
} from "./categoryTypes";

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
