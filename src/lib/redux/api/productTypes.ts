export interface Category {
  id: number;
  name: string | null;
  slug: string;
}

export interface TaxCategory {
  id: number;
  name: string;
  rate: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string; // JSON string
  category_id: number;
  category: Category;
  tax_category_id: number;
  tax_category: TaxCategory;
  retail_price: string;
  retail_price_formatted: string;
  distributor_price: string;
  distributor_price_formatted: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: string;
  is_published: boolean;
  is_wishlisted: boolean;
  images: ProductImage[];
  primary_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  price_range: PriceRange;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
  filters: ProductFilters;
}

// Request parameters
export interface GetProductsParams {
  category_ids?: string; // e.g., "1,2"
  min_price?: number;
  max_price?: number;
  is_published?: boolean | number;
  stock_status?: string; // "in_stock" or "active"
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}
// src/lib/redux/api/productTypes.ts

export interface Category {
  id: number;
  name: string | null;
  slug: string;
  description?: string; // Added for single product response
}

export interface TaxCategory {
  id: number;
  name: string;
  rate: string;
}

export interface ProductImage {
  id: number;
  image: string; // Added for single product response
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string; // JSON string
  category_id: number;
  category: Category;
  tax_category_id: number;
  tax_category?: TaxCategory; // Optional for single product
  retail_price: string;
  retail_price_formatted: string;
  distributor_price: string;
  distributor_price_formatted: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status?: string; // From list response
  status?: string; // From single response
  is_published: boolean;
  is_wishlisted: boolean;
  images: ProductImage[];
  primary_image?: string; // Added for single response
  primary_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  price_range: PriceRange;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
  filters: ProductFilters;
}

// Request parameters
export interface GetProductsParams {
  category_ids?: string; // e.g., "1,2"
  min_price?: number;
  max_price?: number;
  is_published?: boolean | number;
  stock_status?: string; // "in_stock" or "active"
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

// src/lib/redux/api/productTypes.ts

export interface Category {
  id: number;
  name: string | null;
  slug: string;
  description?: string;
}

export interface TaxCategory {
  id: number;
  name: string;
  rate: string;
}

export interface ProductImage {
  id: number;
  image?: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string;
  category_id: number;
  category: Category;
  tax_category_id: number;
  tax_category?: TaxCategory;
  retail_price: string;
  retail_price_formatted: string;
  distributor_price: string;
  distributor_price_formatted: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status?: string;
  status?: string;
  is_published: boolean;
  is_wishlisted: boolean;
  images: ProductImage[];
  primary_image?: string;
  primary_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryProductsResponse {
  category_id: number;
  total: number;
  data: Product[];
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
  filters: ProductFilters;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  price_range: PriceRange;
}

export interface GetProductsParams {
  category_ids?: string;
  min_price?: number;
  max_price?: number;
  is_published?: boolean | number;
  stock_status?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}


export type SingleProductResponse = Product;
