
import { baseApi } from "./baseApi";

import {
  ProductsResponse,
  GetProductsParams,
  Product,
  SingleProductResponse,
  CategoryProductsResponse,
} from "./productTypes";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =====================================================
    // GET PRODUCTS WITH FILTERS
    // =====================================================

    getProducts: builder.query<
      ProductsResponse,
      GetProductsParams
    >({
      query: (params) => {
        const queryParams =
          new URLSearchParams();

        // =================================================
        // BRAND IDS
        // Example:
        // brand_ids=3
        // brand_ids=3,5,8
        // =================================================

        if (
          params.brand_ids !==
            undefined &&
          params.brand_ids !== null &&
          params.brand_ids !== ""
        ) {
          queryParams.append(
            "brand_ids",
            String(params.brand_ids),
          );
        }

        // =================================================
        // CATEGORY IDS
        // Example:
        // category_ids=1,2,3
        // =================================================

        if (
          params.category_ids
        ) {
          queryParams.append(
            "category_ids",
            params.category_ids,
          );
        }

        // =================================================
        // MIN PRICE
        // =================================================

        if (
          params.min_price !==
          undefined
        ) {
          queryParams.append(
            "min_price",
            params.min_price.toString(),
          );
        }

        // =================================================
        // MAX PRICE
        // =================================================

        if (
          params.max_price !==
          undefined
        ) {
          queryParams.append(
            "max_price",
            params.max_price.toString(),
          );
        }

        // =================================================
        // PUBLISHED
        // =================================================

        if (
          params.is_published !==
          undefined
        ) {
          queryParams.append(
            "is_published",
            params.is_published.toString(),
          );
        }

        // =================================================
        // STOCK STATUS
        // =================================================

        if (
          params.stock_status
        ) {
          queryParams.append(
            "stock_status",
            params.stock_status,
          );
        }

        // =================================================
        // SEARCH
        // =================================================

        if (
          params.search
        ) {
          queryParams.append(
            "search",
            params.search,
          );
        }

        // =================================================
        // SORT BY
        // =================================================

        if (
          params.sort_by
        ) {
          queryParams.append(
            "sort_by",
            params.sort_by,
          );
        }

        // =================================================
        // SORT DIRECTION
        // =================================================

        if (
          params.sort_direction
        ) {
          queryParams.append(
            "sort_direction",
            params.sort_direction,
          );
        }

        // =================================================
        // PER PAGE
        // =================================================

        if (
          params.per_page
        ) {
          queryParams.append(
            "per_page",
            params.per_page.toString(),
          );
        }

        // =================================================
        // PAGE
        // =================================================

        if (
          params.page
        ) {
          queryParams.append(
            "page",
            params.page.toString(),
          );
        }

        // =================================================
        // NEW ARRIVALS
        //
        // API requires:
        // ?new-arrivals
        //
        // NOT:
        // ?new-arrivals=true
        // =================================================

        if (
          params.new_arrivals
        ) {
          queryParams.append(
            "new-arrivals",
            "",
          );
        }

        // =================================================
        // BUILD FINAL QUERY
        // =================================================

        const queryString =
          queryParams.toString();

        // URLSearchParams creates:
        // new-arrivals=
        //
        // Convert it to:
        // new-arrivals
        const finalQueryString =
          queryString.replace(
            "new-arrivals=",
            "new-arrivals",
          );

        return {
          url: `/products${
            finalQueryString
              ? `?${finalQueryString}`
              : ""
          }`,

          method: "GET",
        };
      },

      providesTags: [
        "Products",
      ],
    }),

    // =====================================================
    // GET PRODUCTS BY CATEGORY ID
    // =====================================================

    getProductsByCategory:
      builder.query<
        CategoryProductsResponse,
        number
      >({
        query: (
          categoryId,
        ) => ({
          url: `/products/category/${categoryId}`,
          method: "GET",
        }),

        providesTags: [
          "Products",
        ],
      }),

    // =====================================================
    // GET SINGLE PRODUCT BY SLUG
    // =====================================================

    getProductBySlug:
      builder.query<
        SingleProductResponse,
        string
      >({
        query: (slug) => ({
          url: `/products/slug/${slug}`,
          method: "GET",
        }),

        providesTags: (
          result,
          error,
          slug,
        ) => [
          {
            type: "Products",
            id: `slug-${slug}`,
          },
        ],
      }),

    // =====================================================
    // GET SINGLE PRODUCT BY ID
    // =====================================================

    getProductById:
      builder.query<
        Product,
        number
      >({
        query: (id) => ({
          url: `/products/${id}`,
          method: "GET",
        }),

        providesTags: (
          result,
          error,
          id,
        ) => [
          {
            type: "Products",
            id,
          },
        ],
      }),

    // =====================================================
    // SEARCH PRODUCTS
    // =====================================================

    searchProducts:
      builder.query<
        ProductsResponse,
        string
      >({
        query: (
          searchTerm,
        ) => ({
          url: `/products?search=${encodeURIComponent(
            searchTerm,
          )}`,

          method: "GET",
        }),

        providesTags: [
          "Products",
        ],
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
