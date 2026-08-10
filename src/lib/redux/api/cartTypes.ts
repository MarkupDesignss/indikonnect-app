// src/lib/redux/api/cartTypes.ts

export interface CartProduct {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string;
  category_id: number;
  tax_category_id: number;
  retail_price: string;
  distributor_price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_wishlisted: boolean;
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  created_at: string;
  updated_at: string;
  product: CartProduct;
}

export interface CartData {
  id: number;
  user_id: number;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

export interface CartResponse {
  data: CartData;
  is_guest: boolean;
  session_id: string | null;
  user_type: string;
  message: string;
}

export interface CartWithItemsResponse {
  data: CartData;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
  action?: "set" | "increment" | "decrement";
  
}

export interface CartSummary {
  total_items: number;
  total: number;
  total_formatted: string;
}

export interface AddToCartResponse extends CartResponse {
  message: string;
  summary: {
    total_items: number;
    total: number;
    total_formatted: string;
  };
}

export interface ApiResponse {
  message: string;
}

export interface MergeCartResponse {
  message: string;
  data: CartData;
  user_type: string;
}
