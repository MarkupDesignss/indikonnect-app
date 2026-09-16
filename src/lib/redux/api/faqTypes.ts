export interface FAQ {
    id: number;
    question: string;
    answer: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface FAQMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }
  
  export interface FAQResponse {
    success: boolean;
    data: FAQ[];
    meta: FAQMeta;
  }