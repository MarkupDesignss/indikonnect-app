// src/lib/redux/api/productApi.ts
import { baseApi } from "./baseApi";
import type {
  ProductsResponse,
  GetProductsParams,
  Product,
  SingleProductResponse,
  CategoryProductsResponse,
} from "./productTypes";

export interface CheckStockParams {
  product_id: number;
  quantity?: number;
}

export interface CheckStockResponse {
  success: boolean;
  data: {
    product_id: number;
    stock_quantity: number;
    available: boolean;
  };
  message?: string;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET PRODUCTS WITH FILTERS
    getProducts: builder.query<ProductsResponse, GetProductsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (
          params.brand_ids !== undefined &&
          params.brand_ids !== null &&
          params.brand_ids !== ""
        ) {
          queryParams.append("brand_ids", String(params.brand_ids));
        }
        if (params.category_ids)
          queryParams.append("category_ids", params.category_ids);
        if (
          params.subcategory_ids !== undefined &&
          params.subcategory_ids !== null &&
          params.subcategory_ids !== ""
        ) {
          queryParams.append("subcategory_ids", String(params.subcategory_ids));
        }
        if (params.min_price !== undefined)
          queryParams.append("min_price", params.min_price.toString());
        if (params.max_price !== undefined)
          queryParams.append("max_price", params.max_price.toString());
        if (params.is_published !== undefined)
          queryParams.append("is_published", params.is_published.toString());
        if (params.stock_status)
          queryParams.append("stock_status", params.stock_status);
        if (params.search) queryParams.append("search", params.search);
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.sort_by) queryParams.append("sort_by", params.sort_by);
        if (params.sort_direction)
          queryParams.append("sort_direction", params.sort_direction);
        if (params.per_page)
          queryParams.append("per_page", params.per_page.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.new_arrivals) queryParams.append("new-arrivals", "");
        const finalQueryString = queryParams
          .toString()
          .replace("new-arrivals=", "new-arrivals");
        return {
          url: `/products${finalQueryString ? `?${finalQueryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Products"],
    }),
    // GET PRODUCTS BY CATEGORY
    getProductsByCategory: builder.query<CategoryProductsResponse, number>({
      query: (categoryId) => ({
        url: `/products/category/${categoryId}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    // GET PRODUCT BY SLUG
    getProductBySlug: builder.query<SingleProductResponse, string>({
      query: (slug) => ({ url: `/products/slug/${slug}`, method: "GET" }),
      providesTags: (_result, _error, slug) => [
        { type: "Products", id: `slug-${slug}` },
      ],
    }),
    // GET PRODUCT BY ID
    getProductById: builder.query<Product, number>({
      query: (id) => ({ url: `/products/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),
    // LIVE STOCK: GET network request, invoked as an RTK mutation for on-demand requests.
    // No RTK Query query cache is reused on successive trigger calls.
    //
    // `invalidatesTags: ["Products"]` ensures every subscribed product query
    // (listing, category, slug detail, by-id, search) automatically refetches
    // after each stock check, so any UI displaying stock stays synchronized
    // with the backend — no manual `refetch()` / `dispatch(invalidateTags())`
    // is required at the component layer.
    checkProductStock: builder.mutation<CheckStockResponse, CheckStockParams>({
      query: ({ product_id, quantity = 1 }) => ({
        url: `/products/${encodeURIComponent(String(product_id))}/check-stock`,
        method: "GET",
        params: { quantity },
        cache: "no-store" as RequestCache,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }),
      invalidatesTags: ["Products"],
    }),
    // NOTIFY PRODUCT
    notifyProduct: builder.mutation<any, { product_id: number }>({
      query: (body) => ({ url: "/notify-me", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),
    // SEARCH PRODUCTS
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
  useNotifyProductMutation,
  useCheckProductStockMutation,
} = productApi;

export default productApi;
