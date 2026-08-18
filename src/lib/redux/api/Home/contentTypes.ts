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

  export interface FooterData {
    id: number;
    logo: string;
    title: string;
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    twitter: string | null;
    youtube: string | null;
    email: string;
    phone: string;
    quote1: string;
    quote2: string;
    quote3: string;
    location: string | null;
    copyright: string;
    created_at: string;
    updated_at: string;
    logo_url: string;
  }
  
  export interface FooterResponse {
    success: boolean;
    data: FooterData;
    message: string;
  }

  export interface TopDiscountedProductItem {
    product: {
      id: number;
      product_code: string;
      name: string;
      slug: string;
      description: string | null;
      specification: string | null;
      category_id: number;
  
      category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
      };
  
      tax_category_id: number;
  
      retail_mrp: string;
      retail_price: string;
      retail_discount_type: string;
      retail_discount_value: string;
      retail_discount_amount: number;
      retail_discount_percentage: number;
  
      distributor_mrp: string;
      distributor_price: string;
      distributor_discount_type: string;
      distributor_discount_value: string;
      distributor_discount_amount: number;
      distributor_discount_percentage: number;
  
      stock_quantity: number;
      low_stock_threshold: number;
  
      is_published: boolean;
      is_trending: boolean;
      trending_sort_order: number | null;
      status: string;
      is_wishlisted: boolean;
  
      images: {
        id: number;
        image: string;
        image_url: string;
        sort_order: number;
        is_primary: boolean;
      }[];
  
      primary_image: string;
      primary_image_url: string;
  
      created_at: string;
      updated_at: string;
    };
  
    deal_info: {
      starts_at: string;
      ends_at: string;
      is_active: boolean;
    };
  
    discounts: {
      retail: {
        mrp: string;
        price: string;
        discount_amount: number;
        discount_percentage: number;
        has_discount: boolean;
      };
  
      distributor: {
        mrp: string;
        price: string;
        discount_amount: number;
        discount_percentage: number;
        has_discount: boolean;
      };
  
      max_discount: number;
      discount_type: string;
    };
  }
  
  export interface TopDiscountedProductsResponse {
    data: TopDiscountedProductItem[];
  
    meta: {
      total: number;
      limit: number;
      type: string;
    };
  }

  export interface Statistics {
    total_reviews: number;
    average_rating: number;
    repeat_buyers_percentage: number;
    total_cities: number;
  }
  
  export interface ReviewUser {
    id: number;
    full_name: string;
    profile_picture: string | null;
    state: string;
  }
  
  export interface Review {
    id: number;
    rating: number;
    review_text: string;
    created_at: string | null;
    user: ReviewUser;
  }
  
  export interface StatsResponse {
    success: boolean;
    data: {
      statistics: Statistics;
      reviews: Review[];
    };
  }

  export interface GrowthStep {
    number: string;
    subtitle: string;
    description: string;
    order: number;
    is_active: boolean;
  }
  
  export interface GrowthStepsResponse {
    success: boolean;
    data: {
      title: string;
      steps: GrowthStep[];
      total_steps: number;
    };
  }