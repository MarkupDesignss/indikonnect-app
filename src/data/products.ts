import Dinner from "../../public/indiekonnect-web/images/Dinner.jpeg";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: any;
  rating: number;
  reviews: number;
  inStock: boolean;
  description?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Premium Porcelain Dinner Set",
    category: "Dinnerware",
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    image: Dinner,
    rating: 4.5,
    reviews: 128,
    inStock: true,
    description:
      "Experience luxury dining with our premium porcelain dinner set. Crafted with the finest materials, this set brings elegance to every meal.",
  },
  {
    id: 2,
    name: "Classic Ceramic Bowls Set",
    category: "Dinnerware",
    price: 1899,
    originalPrice: null,
    discount: null,
    image: Dinner,
    rating: 4.8,
    reviews: 96,
    inStock: true,
    description:
      "Beautiful ceramic bowls perfect for everyday use. Durable, microwave-safe, and dishwasher-friendly.",
  },
  {
    id: 3,
    name: "Luxury Gold-Trim Dinnerware",
    category: "Dinnerware",
    price: 4599,
    originalPrice: 5599,
    discount: 18,
    image: Dinner,
    rating: 4.2,
    reviews: 73,
    inStock: false,
    description:
      "Elegant dinnerware with gold trim accents. Perfect for special occasions and fine dining experiences.",
  },
  {
    id: 4,
    name: "Minimalist Stoneware Collection",
    category: "Dinnerware",
    price: 2499,
    originalPrice: null,
    discount: null,
    image: Dinner,
    rating: 4.6,
    reviews: 205,
    inStock: true,
    description:
      "Modern stoneware collection with minimalist design. Durable and perfect for contemporary homes.",
  },
  {
    id: 5,
    name: "Elegant Crystal Glass Set",
    category: "Dinnerware",
    price: 3299,
    originalPrice: 4299,
    discount: 23,
    image: Dinner,
    rating: 4.7,
    reviews: 157,
    inStock: true,
    description:
      "Premium crystal glass set that adds sophistication to any table setting.",
  },
  {
    id: 6,
    name: "Rustic Farmhouse Dinner Set",
    category: "Dinnerware",
    price: 2799,
    originalPrice: null,
    discount: null,
    image: Dinner,
    rating: 4.3,
    reviews: 89,
    inStock: true,
    description:
      "Charming farmhouse-style dinnerware with rustic appeal. Perfect for cozy family meals.",
  },
];

export function getProductById(id: number): Product | undefined {
  console.log("Looking for product with ID:", id);
  const found = products.find((product) => product.id === id);
  console.log("Found product:", found);
  return found;
}

export function getAllProductIds(): number[] {
  return products.map((product) => product.id);
}
