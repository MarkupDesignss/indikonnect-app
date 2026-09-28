export interface FAQSection {
  id: number;
  name: string;
  slug: string;
}

export interface FAQ {
  id: number;
  section_id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  section?: FAQSection;
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