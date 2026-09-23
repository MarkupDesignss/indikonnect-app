export interface LandingPageImage {
    id: number;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }
  
  export interface LandingPageVideo {
    id: number;
    url?: string;
    alt_text?: string | null;
    is_primary?: boolean;
  }
  
  export interface LandingPageBlock {
    id: number;
    heading: string;
    short_description: string | null;
    description: string | null;
    sort_order: number;
    images: LandingPageImage[];
    videos: LandingPageVideo[];
  }
  
  export interface LandingPageContent {
    id: number;
    title: string;
    slug: string;
    status: string;
    version: string;
    created_at: string;
    updated_at: string;
    blocks: LandingPageBlock[];
  }
  
  export interface LandingPageResponse {
    success: boolean;
    data: LandingPageContent[];
    message?: string;
  }