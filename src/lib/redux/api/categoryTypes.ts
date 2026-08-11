
export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
  meta: CategoryMeta;
}
