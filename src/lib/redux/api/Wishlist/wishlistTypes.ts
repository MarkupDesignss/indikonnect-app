// src/lib/redux/api/wishlistTypes.ts

// ============ PRODUCT IMAGE TYPE ============
export interface WishlistProductImage {
  id: number;
  image: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

// ============ CATEGORY TYPE ============
export interface WishlistCategory {
  id: number;
  name: string | null;
  slug: string;
}

// ============ PRODUCT TYPE ============
export interface WishlistProduct {
  id: number;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  specification: string;
  category_id: number;
  category: WishlistCategory;
  tax_category_id: number;
  retail_price: string;
  retail_price_formatted: string;
  distributor_price: string;
  distributor_price_formatted: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: string;
  is_published: boolean;
  status: string;
  is_wishlisted: boolean;
  images: WishlistProductImage[];
  primary_image: string;
  primary_image_url: string;
  created_at: string;
  updated_at: string;
}

// ============ WISHLIST ITEM TYPE ============
export interface WishlistItem {
  id: number;
  product_id: number;
  product: WishlistProduct;
  added_at: string;
}

// ============ REQUEST TYPES ============

// Add to Wishlist Request
export interface AddToWishlistRequest {
  product_id: number;
}

// Remove from Wishlist Request
export interface RemoveFromWishlistRequest {
  product_id: number;
}

// Move to Cart Request
export interface MoveToCartRequest {
  product_id: number;
  quantity: number;
}

// Move All to Cart Request
export interface MoveAllToCartRequest {
  // No parameters needed
}

// ============ RESPONSE TYPES ============

// Add to Wishlist Response
export interface AddToWishlistResponse {
  message: string;
  data: WishlistItem;
}

// Get Wishlist Response
export interface GetWishlistResponse {
  data: WishlistItem[];
  total: number;
}

// Remove from Wishlist Response
export interface RemoveFromWishlistResponse {
  message: string;
  product_id: number;
}

// Move to Cart Response
export interface MoveToCartResponse {
  message: string;
  cart_item_id: number;
  product_id: number;
  quantity: number;
  removed_from_wishlist: boolean;
}

// Move All to Cart Response
export interface MoveAllToCartResponse {
  message: string;
  moved_count: number;
  failed_count: number;
  items: Array<{
    product_id: number;
    quantity: number;
    status: "success" | "failed";
    message?: string;
  }>;
}
