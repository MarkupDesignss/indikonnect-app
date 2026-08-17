export interface ContentImage {
    id: number;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }
  
  export interface ContentVideo {
    id: number;
    url?: string;
    title?: string | null;
    thumbnail?: string | null;
  }
  
  export interface ContentBlock {
    id: number;
    heading: string | null;
    short_description: string | null;
    description: string | null;
    sort_order: number;
    images: ContentImage[];
    videos: ContentVideo[];
  }
  
  export interface Content {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
    blocks: ContentBlock[];
  }
  
  export interface ContentMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }
  
  export interface ContentResponse {
    success: boolean;
    message?: string;
    data: Content[];
    meta?: ContentMeta;
  }

  export interface ReelProductImage {
    id: number;
    image: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }
  
  export interface ReelProduct {
    id: number;
    product_code: string;
    name: string;
    slug: string;
    category_id: number;
    tax_category_id: number;
    retail_mrp: string;
    retail_price: string;
    distributor_mrp: string | null;
    distributor_price: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    is_published: boolean;
    images: ReelProductImage[];
  }
  
  export interface Reel {
    id: number;
    title: string;
    creator_handle: string;
    followers_count: number;
    video_path: string;
    video_url: string | null;
    video_full_url: string;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    product: ReelProduct | null;
  }
  
  export interface ReelsResponse {
    data: Reel[];
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }

  export interface TrendingProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }
  
  export interface TrendingProduct {
    id: number;
    name: string;
    description: string | null;
    category_id: number;
    tax_category_id: number;
  
    retail_price: string;
    retail_mrp: string;
    retail_discount_type: string | null;
    retail_discount_value: string | null;
  
    distributor_price: string | null;
    distributor_mrp: string | null;
    distributor_discount_type: string | null;
    distributor_discount_value: string | null;
  
    images: TrendingProductImage[];
  }
  
  export interface TrendingProductsResponse {
    success: boolean;
    message: string;
    data: TrendingProduct[];
  }