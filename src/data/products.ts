import { Product } from "../Screens/types/product";

// Import your images
import Dinner from "../../public/images/Dinner.jpeg";

// Create 48 products for pagination
export const products: Product[] = Array.from({ length: 48 }, (_, i) => {
  const id = i + 1;
  const categories = ["Dinnerware", "Watch", "Business Tools"];
  const names = [
    "Premium Dinner Set",
    "Classic Collection",
    "Luxury Edition",
    "Minimalist Design",
    "Elegant Series",
    "Rustic Collection",
    "Modern Style",
    "Vintage Set",
    "Contemporary Design",
  ];

  const category = categories[id % categories.length];
  const name = `${names[id % names.length]} ${category}`;
  const price = Math.floor(Math.random() * 4000) + 1000;
  const hasDiscount = Math.random() > 0.5;

  return {
    id,
    name,
    category,
    price,
    originalPrice: hasDiscount
      ? price + Math.floor(Math.random() * 2000) + 500
      : null,
    discount: hasDiscount ? Math.floor(Math.random() * 30) + 10 : null,
    image: Dinner, // Using the imported image
    rating: Number((Math.random() * 1.5 + 3).toFixed(1)),
    reviews: Math.floor(Math.random() * 200) + 10,
    inStock: Math.random() > 0.2,
  };
});
