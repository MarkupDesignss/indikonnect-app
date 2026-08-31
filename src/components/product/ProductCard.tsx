"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { showToast } from "../../lib/slices/toastSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    image: string;
    images?: string[]; // optional gallery — enables the carousel pagination bar
    rating: number;
    reviews: number;
    inStock: boolean;
    isWishlisted?: boolean;
    size?: string; // e.g. "100 ML"
    gender?: "men" | "women" | "unisex"; // pill shown next to size
    badge?: string; // e.g. "BEST SELLER" | "FRAGSTALK SPECIAL"
    extraOff?: number; // e.g. 200 -> "Extra ₹200 OFF" ribbon on image
  };
}

export default function ProductCard({
  product,
}: ProductCardProps): JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Add to cart mutation
  const [addToCart] = useAddToCartMutation();

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData, refetch: refetchWishlist } =
    useGetWishlistQuery();

  useEffect(() => {
    if (wishlistData?.data) {
      const isInWishlist = wishlistData.data.some(
        (item: any) => item.product_id === product.id,
      );
      setIsWishlisted(isInWishlist);
    }
  }, [wishlistData, product.id]);

  // Gallery images — falls back to the single `image` field when no gallery is passed
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/indiekonnect-web/images/placeholder.jpg"];
  const totalImages = images.length;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoaded(false);
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  // Navigate to product detail page
  const handleCardClick = () => {
    if (product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  // Handle Add to Cart with API
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!product.inStock || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      }).unwrap();

      dispatch(
        showToast({
          message: `${product.name} added to cart successfully! 🛒`,
          type: "success",
        }),
      );
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist({ product_id: product.id }).unwrap();
        setIsWishlisted(false);
        dispatch(
          showToast({
            message: `${product.name} removed from wishlist`,
            type: "info",
          }),
        );
      } else {
        await addToWishlist({ product_id: product.id }).unwrap();
        setIsWishlisted(true);
        dispatch(
          showToast({
            message: `${product.name} added to wishlist! ❤️`,
            type: "success",
          }),
        );
      }
      await refetchWishlist();
    } catch (error: any) {
      console.error("Wishlist operation failed:", error);
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to update wishlist",
          type: "error",
        }),
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Handle Quick View
  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product?.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    hover: {
      y: -4,
      boxShadow:
        "0 16px 32px -12px rgba(7, 26, 65, 0.12), 0 6px 16px -6px rgba(7, 26, 65, 0.06)",
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const exitVariants = {
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.25, ease: "easeIn" },
    },
  };

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.01, transition: { duration: 0.15 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } },
  };

  const wishlistButtonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.15,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.85, transition: { duration: 0.1 } },
  };

  const shimmerVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "200% 200%"],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  // Discount % derived from originalPrice/price if not passed explicitly
  const discountPct =
    product.discount ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) *
        100,
      )
      : null);

  const genderStyles: Record<string, string> = {
    men: "bg-[#eef1fb] text-[#3d4ea3]",
    women: "bg-[#fbeef6] text-[#a33d84]",
    unisex: "bg-[#fbf6e4] text-[#9c7f16]",
  };
  const genderLabel: Record<string, string> = {
    men: "FOR MEN",
    women: "FOR WOMEN",
    unisex: "UNISEX",
  };
  const gender = product.gender || "unisex";

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden border border-[#ece9e2] relative h-full flex flex-col group cursor-pointer"
      variants={{ ...cardVariants, ...exitVariants }}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="article"
    >
      {/* Image Container */}
      <motion.div
        className="relative pt-[100%] bg-[#f4f3ee] overflow-hidden flex-shrink-0"
        variants={imageVariants}
        initial="initial"
        whileHover="hover"
      >
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 p-6 sm:p-8"
        >
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover p-2 rounded-[15px]"
            loading="lazy"
            onLoadingComplete={() => setIsImageLoaded(true)}
          />
        </motion.div>

        {/* Shimmer Loading */}
        {!isImageLoaded && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#f4f3ee] via-[#e5e3dc] to-[#f4f3ee]"
            variants={shimmerVariants}
            animate="animate"
            style={{ backgroundSize: "200% 200%" }}
          />
        )}

        {/* Top-left tag badge (Best Seller / Fragstalk Special) */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 bg-[#8a6a3f] text-white px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-bold tracking-wide uppercase z-10 shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Top-right wishlist heart */}
        <motion.button
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          variants={wishlistButtonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
        >
          <motion.svg
            className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
            fill={isWishlisted ? "#ef4444" : "none"}
            stroke={isWishlisted ? "#ef4444" : "#4b4f4d"}
            viewBox="0 0 24 24"
            animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>

          {isWishlistLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-3 h-3 border-2 border-[#071a41] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </motion.button>

        {/* Extra OFF ribbon */}
        {product.extraOff && product.extraOff > 0 && (
          <motion.div
            className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="w-4 h-4 rounded-full bg-[#e0432b] text-white text-[9px] flex items-center justify-center font-bold">
              %
            </span>
            <span className="leading-tight">
              <span className="block text-[8px] text-[#7d827f]">Extra</span>
              <span className="block text-[11px] font-bold text-[#111111]">
                {product.extraOff} OFF
              </span>
            </span>
          </motion.div>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <motion.div
            className="absolute inset-0 bg-[#071a41]/60 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="bg-white/95 text-[#071a41] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xl border border-[#071a41]/30">
              Out of Stock
            </span>
          </motion.div>
        )}

        {/* Quick View Button */}
        <AnimatePresence>
          {isHovered && product.inStock && (
            <motion.button
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-[#071a41] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-lg shadow-black/10 z-10 whitespace-nowrap border border-[#071a41]/20"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#071a41",
                color: "white",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickView}
            >
              Quick View
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image Carousel Pagination Bar — 01/03  ▬▬▬▬▬▬▭▭▭  ← → */}
      {totalImages > 1 && (
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-[#ece9e2]">
          <span className="text-[11px] sm:text-xs font-medium text-[#2b2118] tabular-nums shrink-0">
            {String(currentImageIndex + 1).padStart(2, "0")}/
            {String(totalImages).padStart(2, "0")}
          </span>

          <div className="relative flex-1 h-1 rounded-full bg-[#e5e2da] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[#2b2118]"
              animate={{
                width: `${((currentImageIndex + 1) / totalImages) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#e2dfd6] bg-white text-[#2b2118] flex items-center justify-center"
              onClick={handlePrevImage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Previous image"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2b2118] text-white flex items-center justify-center"
              onClick={handleNextImage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Next image"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Brand + Rating row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] text-[#111111] uppercase tracking-wide font-semibold">
            {product.category || "Uncategorized"}
          </span>
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#111111] font-medium">
            <span className="text-[#F5A623]">★</span>
            {product.rating.toFixed(1)}
            <span className="text-[#8b918f]">| {product.reviews}</span>
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#111111] mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="text-sm sm:text-lg font-bold text-[#111111]">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] sm:text-xs text-[#8b918f] line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
          {discountPct && discountPct > 0 && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-white bg-emerald-500 px-1.5 py-0.5 rounded">
              SAVE {discountPct}%
            </span>
          )}
        </div>

        {/* Size + Gender pills */}
        <div className="flex items-center gap-2 mb-1">
          {product.size && (
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#111111] border border-[#e2dfd6] rounded-full px-2.5 py-1">
              {product.size}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          )}
          <span
            className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-medium rounded-full px-2.5 py-1 ${genderStyles[gender]}`}
          >
            {genderLabel[gender]}
          </span>
        </div>

        <div className="flex-1" />

        {/* Add to Cart Button */}
        <motion.button
          className={`w-full mt-3 py-2.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wide transition-colors duration-200 relative overflow-hidden flex-shrink-0 ${product.inStock && !isAddingToCart
            ? "bg-[#111111] text-white hover:bg-black"
            : product.inStock && isAddingToCart
              ? "bg-[#7d827f] text-white cursor-wait"
              : "bg-[#e7e5df] text-[#7d827f] cursor-not-allowed"
            }`}
          variants={buttonVariants}
          initial="initial"
          whileHover={product.inStock && !isAddingToCart ? "hover" : {}}
          whileTap={product.inStock && !isAddingToCart ? "tap" : {}}
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.inStock || isAddingToCart}
          onClick={handleAddToCart}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isAddingToCart ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span>Adding...</span>
              </>
            ) : product.inStock ? (
              "Add to Cart"
            ) : (
              "Out of Stock"
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}