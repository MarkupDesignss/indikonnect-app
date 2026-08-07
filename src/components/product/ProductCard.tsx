import Image from "next/image";
import Dinner from "../../../public/images/Dinner.jpeg";

// Static product data with local images
const PRODUCTS = [
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
  },
];

interface ProductCardProps {
  productId?: number;
}

export default function ProductCard({
  productId = 0,
}: ProductCardProps): JSX.Element {
  // Use the first product if no ID provided, or find by ID
  const product =
    productId > 0
      ? PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
      : PRODUCTS[0];

  const renderRatingStars = (rating: number): string => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      role="article"
    >
      {/* Image Container */}
      <div className="relative pt-[100%] bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          loading="lazy"
        />
        {product.discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            -{product.discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm font-semibold">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-gray-800">
            ¥{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ¥{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 text-sm"
          aria-label={`Rating: ${product.rating} out of 5 stars`}
        >
          <span className="text-yellow-500">
            {renderRatingStars(product.rating)}
          </span>
          <span className="text-gray-400 text-xs">({product.reviews})</span>
        </div>
        <button
          className="w-full mt-3 py-2.5 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
