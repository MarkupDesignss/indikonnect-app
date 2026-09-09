
export interface Testimonial {
  id: number;
  video_path: string;
  video_title: string;
  person_name: string;
  heading: string;
  rating: string;
  text: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface TestimonialPagination {
  current_page: number;
  data: Testimonial[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: TestimonialLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TestimonialResponse {
  success: boolean;
  data: TestimonialPagination;
  message: string;
}

