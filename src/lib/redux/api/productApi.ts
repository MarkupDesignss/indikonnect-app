// src/lib/redux/api/productApi.ts

import { baseApi } from "./baseApi";
import {
  ProductsResponse,
  GetProductsParams,
  Product,
  SingleProductResponse,
  CategoryProductsResponse,
} from "./producttypes";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get products with filters
    getProducts: builder.query<ProductsResponse, GetProductsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.category_ids) {
          queryParams.append("category_ids", params.category_ids);
        }
        if (params.min_price !== undefined) {
          queryParams.append("min_price", params.min_price.toString());
        }
        if (params.max_price !== undefined) {
          queryParams.append("max_price", params.max_price.toString());
        }
        if (params.is_published !== undefined) {
          queryParams.append("is_published", params.is_published.toString());
        }
        if (params.stock_status) {
          queryParams.append("stock_status", params.stock_status);
        }
        if (params.search) {
          queryParams.append("search", params.search);
        }
        if (params.sort_by) {
          queryParams.append("sort_by", params.sort_by);
        }
        if (params.sort_direction) {
          queryParams.append("sort_direction", params.sort_direction);
        }
        if (params.per_page) {
          queryParams.append("per_page", params.per_page.toString());
        }
        if (params.page) {
          queryParams.append("page", params.page.toString());
        }

        const queryString = queryParams.toString();
        return {
          url: `/products${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Products"],
    }),

    // Get products by category ID
    getProductsByCategory: builder.query<CategoryProductsResponse, number>({
      query: (categoryId) => ({
        url: `/products/category/${categoryId}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),

    // Get single product by slug
    getProductBySlug: builder.query<SingleProductResponse, string>({
      query: (slug) => ({
        url: `/products/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [
        { type: "Products", id: `slug-${slug}` },
      ],
    }),

    // Get single product by ID
    getProductById: builder.query<Product, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // Search products
    searchProducts: builder.query<ProductsResponse, string>({
      query: (searchTerm) => ({
        url: `/products?search=${encodeURIComponent(searchTerm)}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
  useLazyGetProductsQuery,
  useLazyGetProductBySlugQuery,
  useLazyGetProductsByCategoryQuery,
} = productApi;

export default productApi;
