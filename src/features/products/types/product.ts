import { StaticImageData } from "next/image";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string | StaticImageData;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
}

export interface NewsletterState {
  email: string;
  isSubmitted: boolean;
}
