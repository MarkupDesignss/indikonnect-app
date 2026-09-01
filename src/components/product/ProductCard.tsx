"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ShoppingCart, Heart } from "lucide-react";
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
    images?: string[];
    rating: number;
    reviews: number;
    inStock: boolean;
    isWishlisted?: boolean;
    size?: string;
    gender?: "men" | "women" | "unisex";
    badge?: string;
    extraOff?: number;
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
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData, refetch: refetchWishlist } =
    useGetWishlistQuery();

  /* -------------------------------------------------------
     Wishlist Sync
  ------------------------------------------------------- */
  useEffect(() => {
    if (wishlistData?.data) {
      const isInWishlist = wishlistData.data.some(
        (item: any) => item.product_id === product.id,
      );

      setIsWishlisted(isInWishlist);
    }
  }, [wishlistData, product.id]);

  /* -------------------------------------------------------
     Images
  ------------------------------------------------------- */
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/indiekonnect-web/images/placeholder.jpg"];

  const totalImages = images.length;

  /* -------------------------------------------------------
     Previous Image
  ------------------------------------------------------- */
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsImageLoaded(false);

    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  /* -------------------------------------------------------
     Next Image
  ------------------------------------------------------- */
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsImageLoaded(false);

    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  /* -------------------------------------------------------
     Product Details
  ------------------------------------------------------- */
  const handleCardClick = () => {
    if (product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  /* -------------------------------------------------------
     Add To Cart
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
     Buy Now - Enhanced with loading state and better UX
  ------------------------------------------------------- */
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!product.inStock || isBuyingNow) return;

    setIsBuyingNow(true);

    try {
      // First, add the product to cart
      await addToCart({
        product_id: product.id,
        quantity: 1,
      }).unwrap();

      // Show a quick toast notification
      dispatch(
        showToast({
          message: `Redirecting to checkout...`,
          type: "info",
        }),
      );

      // Then redirect to checkout with the product
      const params = new URLSearchParams({
        product_id: String(product.id),
        quantity: String(1),
      });

      router.push(`/checkout?${params.toString()}`);
    } catch (error: any) {
      console.error("Failed to process buy now:", error);

      dispatch(
        showToast({
          message: error?.data?.message || "Failed to process your order",
          type: "error",
        }),
      );

      setIsBuyingNow(false);
    }
  };

  /* -------------------------------------------------------
     Wishlist
  ------------------------------------------------------- */
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist({
          product_id: product.id,
        }).unwrap();

        setIsWishlisted(false);

        dispatch(
          showToast({
            message: `${product.name} removed from wishlist`,
            type: "info",
          }),
        );
      } else {
        await addToWishlist({
          product_id: product.id,
        }).unwrap();

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

  /* -------------------------------------------------------
     Card Animation
  ------------------------------------------------------- */
  const cardVariants = {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.99,
    },

    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },

    hover: {
      y: -2,
      boxShadow:
        "0 10px 22px -10px rgba(7, 26, 65, 0.12), 0 4px 10px -6px rgba(7, 26, 65, 0.06)",
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      },
    },

    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  /* -------------------------------------------------------
     Image Animation
  ------------------------------------------------------- */
  const imageVariants = {
    initial: {
      scale: 1,
    },

    hover: {
      scale: 1.035,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  /* -------------------------------------------------------
     Wishlist Button Animation
  ------------------------------------------------------- */
  const wishlistButtonVariants = {
    initial: {
      scale: 1,
    },

    hover: {
      scale: 1.12,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },

    tap: {
      scale: 0.86,
      transition: {
        duration: 0.1,
      },
    },
  };

  /* -------------------------------------------------------
     Shimmer
  ------------------------------------------------------- */
  const shimmerVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "200% 200%"],

      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  /* -------------------------------------------------------
     Discount
  ------------------------------------------------------- */
  const discountPct =
    product.discount ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) *
        100,
      )
      : null);

  return (
    <motion.div
      className="group relative flex h-full w-full max-w-[100%] cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[#ece9e2] bg-white"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="article"
    >
      {/* =====================================================
          IMAGE SECTION — wider + taller
      ====================================================== */}

      <motion.div
        className="relative aspect-[4/3.6] flex-shrink-0 overflow-hidden bg-[#f4f3ee]"
        variants={imageVariants}
        initial="initial"
        whileHover="hover"
      >
        {/* Product Image */}

        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isImageLoaded ? 1 : 0,
          }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 300px"
            className="object-cover"
            loading="lazy"
            onLoadingComplete={() => setIsImageLoaded(true)}
          />
        </motion.div>

        {/* Shimmer */}

        {!isImageLoaded && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#f4f3ee] via-[#e5e3dc] to-[#f4f3ee]"
            variants={shimmerVariants}
            animate="animate"
            style={{
              backgroundSize: "200% 200%",
            }}
          />
        )}

        {/* =================================================
            WISHLIST BUTTON
        ================================================== */}

        <motion.button
          type="button"
          className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm"
          variants={wishlistButtonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
        >
          <motion.span
            animate={
              isWishlisted
                ? {
                  scale: [1, 1.2, 1],
                }
                : {}
            }
            transition={{
              duration: 0.3,
            }}
          >
            <Heart
              className="h-4 w-4"
              fill={isWishlisted ? "#111111" : "none"}
              stroke="#111111"
              strokeWidth={1.8}
            />
          </motion.span>

          {isWishlistLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
            >
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
            </motion.div>
          )}
        </motion.button>

        {/* =================================================
            BADGE
        ================================================== */}

        {product.badge && (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-[#111111] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* =================================================
            EXTRA OFF
        ================================================== */}

        {product.extraOff && product.extraOff > 0 && (
          <motion.div
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-md bg-white px-2 py-1.5 shadow-md"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e0432b] text-[8px] font-bold text-white">
              %
            </span>

            <span className="leading-tight">
              <span className="block text-[7px] text-[#7d827f]">Extra</span>

              <span className="block text-[10px] font-bold text-[#111111]">
                {product.extraOff} OFF
              </span>
            </span>
          </motion.div>
        )}

        {/* =================================================
            IMAGE COUNT + ARROWS
        ================================================== */}

        {totalImages > 1 && (
          <>
            <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/55 px-2 py-1 text-[8px] font-semibold text-white backdrop-blur-sm">
              {currentImageIndex + 1}/{totalImages}
            </span>

            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handlePrevImage}
                    className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111111] shadow-sm"
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </motion.button>

                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleNextImage}
                    className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111111] shadow-sm"
                    aria-label="Next image"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </>
        )}

        {/* =================================================
            OUT OF STOCK
        ================================================== */}

        {!product.inStock && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#111111]/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="rounded-md border border-[#111111]/20 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#111111] shadow-xl">
              Out of Stock
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* =====================================================
          CONTENT SECTION
      ====================================================== */}

      <div className="flex flex-1 flex-col p-3 pt-2">
        {/* Category */}

        <span className="text-[8px] font-semibold uppercase tracking-wide text-[#8b918f]">
          {product.category || "Uncategorized"}
        </span>

        {/* Product Name */}

        <h3 className="mt-1 line-clamp-1 text-[13px] font-semibold leading-snug text-[#111111]">
          {product.name}
        </h3>

        {/* =================================================
            RATING
        ================================================== */}

        <div className="mt-1 flex items-center gap-1">
          <span className="text-[10px] leading-none tracking-[1px] text-[#111111]">
            ★★★★★
          </span>

          <span className="text-[9px] text-[#8b918f]">({product.reviews})</span>
        </div>

        {/* =================================================
            PRICE
        ================================================== */}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[15px] font-bold text-[#111111]">
            ₹{product.price.toLocaleString()}
          </span>

          {product.originalPrice && (
            <span className="text-[10px] text-[#8b918f] line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}

          {discountPct && discountPct > 0 && (
            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-semibold text-white">
              SAVE {discountPct}%
            </span>
          )}
        </div>

        {/* Push buttons to bottom */}

        <div className="flex-1" />

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="mt-2 flex items-center gap-1.5">
          {/* BUY NOW - Enhanced with loading state */}

          <motion.button
            type="button"
            whileTap={product.inStock && !isBuyingNow ? { scale: 0.97 } : {}}
            onClick={handleBuyNow}
            disabled={!product.inStock || isBuyingNow}
            className={`h-9 flex-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wide transition-colors ${product.inStock && !isBuyingNow
                ? "bg-[#111111] text-white hover:bg-black"
                : product.inStock && isBuyingNow
                  ? "bg-[#333333] text-white/70"
                  : "cursor-not-allowed bg-[#e7e5df] text-[#7d827f]"
              }`}
          >
            {isBuyingNow ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : product.inStock ? (
              "Buy Now"
            ) : (
              "Sold Out"
            )}
          </motion.button>

          {/* ADD TO CART */}

          <motion.button
            type="button"
            whileTap={product.inStock && !isAddingToCart ? { scale: 0.97 } : {}}
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${product.inStock && !isAddingToCart
                ? "border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white"
                : "cursor-not-allowed border-[#e7e5df] text-[#7d827f]"
              }`}
          >
            {isAddingToCart ? (
              <motion.div
                className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}