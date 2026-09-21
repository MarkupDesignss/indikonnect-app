"use client";

import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";

import { ArrowLeft, ArrowRight, ShoppingCart, Heart } from "lucide-react";

import { useRouter } from "next/navigation";

import { useDispatch } from "react-redux";

import { useAddToCartMutation } from "@/lib/redux/api/cartApi";

import { showToast } from "../../lib/slices/toastSlice";

import { useTokenCheck } from "@/hooks/useTokenCheck";

import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import { getAppType, getAppBasePath } from "@/lib/appConfig";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   PRODUCT CARD
========================================================= */

export default function ProductCard({
  product,
}: ProductCardProps): JSX.Element {
  const router = useRouter();

  const dispatch = useDispatch();

  /* =========================================================
     APP / AUTH
  ========================================================= */

  const { hasToken, appType } = useTokenCheck();

  /*
   * Option B:
   *
   * Customer:
   * /indiekonnect-web/
   *
   * Distributor:
   * /indiekonnect-distributor/
   *
   * getAppType() is the source of truth.
   */
  const currentAppType = useMemo(() => {
    if (typeof window !== "undefined") {
      return getAppType();
    }

    return appType;
  }, [appType]);

  const isDistributor = currentAppType === "distributor";

  const isCustomer = currentAppType === "customer";

  /* =========================================================
     APP BASE PATH
  ========================================================= */

  const appBasePath = getAppBasePath();

  /*
   * Customer:
   * /indiekonnect-web
   *
   * Distributor:
   * /indiekonnect-distributor
   */
  const placeholderImage = `${appBasePath}/images/placeholder.jpg`;

  /* =========================================================
     STATES
  ========================================================= */

  const [isHovered, setIsHovered] = useState(false);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =========================================================
     API
  ========================================================= */

  const [addToCart] = useAddToCartMutation();

  const [addToWishlist] = useAddToWishlistMutation();

  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  /*
   * Wishlist is a protected API.
   *
   * Guest:
   * skip query
   *
   * Logged in:
   * query normally
   */
  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    undefined,
    {
      skip: hasToken !== true,
    },
  );

  /* =========================================================
     LOGIN PATH
  ========================================================= */

  const getLoginPath = () => {
    return currentAppType === "distributor"
      ? "/auth/distributor/login"
      : "/auth/customer/login";
  };

  /* =========================================================
     LOGIN GUARD
  ========================================================= */

  const requireLogin = (): boolean => {
    if (hasToken !== true) {
      router.push(getLoginPath());

      return false;
    }

    return true;
  };

  /* =========================================================
     WISHLIST SYNC
  ========================================================= */

  useEffect(() => {
    /*
     * Guest users should never inherit
     * an authenticated wishlist state.
     */
    if (hasToken !== true) {
      setIsWishlisted(false);
      return;
    }

    if (wishlistData?.data) {
      const isInWishlist = wishlistData.data.some(
        (item: any) => Number(item?.product_id) === Number(product.id),
      );

      setIsWishlisted(isInWishlist);
    }
  }, [wishlistData, product.id, hasToken]);

  /* =========================================================
     RESET IMAGE STATE WHEN PRODUCT CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentImageIndex(0);

    setIsImageLoaded(false);
  }, [product.id]);

  /* =========================================================
     IMAGES
  ========================================================= */

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || placeholderImage];

  const totalImages = images.length;

  /* =========================================================
     PREVIOUS IMAGE
  ========================================================= */

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsImageLoaded(false);

    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  /* =========================================================
     NEXT IMAGE
  ========================================================= */

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsImageLoaded(false);

    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  /* =========================================================
     PRODUCT DETAILS
  ========================================================= */

  const handleCardClick = () => {
    if (product.slug && product.slug.trim() !== "") {
      router.push(`/product/${product.slug}`);

      return;
    }

    if (product.id) {
      router.push(`/product/${product.id}`);

      return;
    }

    if (product.name) {
      const generatedSlug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (generatedSlug) {
        router.push(`/product/${generatedSlug}`);
      }
    }
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!requireLogin()) {
      return;
    }

    if (!product.inStock || isAddingToCart) {
      return;
    }

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

  /* =========================================================
     BUY NOW
  ========================================================= */

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!requireLogin()) {
      return;
    }

    if (!product.inStock || isBuyingNow) {
      return;
    }

    setIsBuyingNow(true);

    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      }).unwrap();

      dispatch(
        showToast({
          message: "Redirecting to checkout...",
          type: "info",
        }),
      );

      const params = new URLSearchParams({
        product_id: String(product.id),
        quantity: "1",
      });

      router.push(`/checkout?${params.toString()}`);
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to process your order",
          type: "error",
        }),
      );

      setIsBuyingNow(false);
    }
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!requireLogin()) {
      return;
    }

    if (isWishlistLoading) {
      return;
    }

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

  /* =========================================================
     CARD ANIMATION
  ========================================================= */

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

  /* =========================================================
     IMAGE ANIMATION
  ========================================================= */

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

  /* =========================================================
     WISHLIST BUTTON ANIMATION
  ========================================================= */

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

  /* =========================================================
     SHIMMER
  ========================================================= */

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

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discountPct =
    product.discount ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null);

  /* =========================================================
     RENDER
  ========================================================= */

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
          IMAGE SECTION
      ====================================================== */}

      <motion.div
        className="relative aspect-[4/3.6] flex-shrink-0 overflow-hidden bg-[#f4f3ee]"
        variants={imageVariants}
        initial="initial"
        whileHover="hover"
      >
        {/* PRODUCT IMAGE */}

        <motion.div
          key={currentImageIndex}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: isImageLoaded ? 1 : 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImageIndex] || placeholderImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 300px"
            className="object-cover"
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
        </motion.div>

        {/* SHIMMER */}

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
            IMAGE NAVIGATION
        ================================================== */}

        {totalImages > 1 && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 6,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="absolute bottom-2 right-2 z-20 flex items-center gap-1"
              >
                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={handlePrevImage}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 hover:bg-white/75"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={handleNextImage}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 hover:bg-white/75"
                  aria-label="Next image"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* =================================================
            OUT OF STOCK
        ================================================== */}

        {!product.inStock && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#111111]/55 backdrop-blur-sm"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
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
        {/* CATEGORY */}

        <span className="text-[8px] font-semibold uppercase tracking-wide text-[#8b918f]">
          {product.category || "Uncategorized"}
        </span>

        {/* PRODUCT NAME */}

        <h3 className="mt-1 line-clamp-1 text-[13px] font-semibold leading-snug text-[#111111]">
          {product.name}
        </h3>

        {/* RATING */}

        <div className="mt-1 flex items-center gap-1">
          <span className="text-[10px] leading-none tracking-[1px] text-[#111111]">
            ★★★★★
          </span>

          <span className="text-[9px] text-[#8b918f]">({product.reviews})</span>
        </div>

        {/* PRICE */}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[15px] font-bold text-[#111111]">
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </span>

          {product.originalPrice && (
            <span className="text-[10px] text-[#8b918f] line-through">
              ₹{Number(product.originalPrice).toLocaleString("en-IN")}
            </span>
          )}

          {discountPct && discountPct > 0 && (
            <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-semibold text-white">
              SAVE {discountPct}%
            </span>
          )}
        </div>

        {/* PUSH BUTTONS TO BOTTOM */}

        <div className="flex-1" />

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="mt-2 flex items-center gap-1.5">
          {/* BUY NOW */}

          <motion.button
            type="button"
            whileTap={
              product.inStock && !isBuyingNow
                ? {
                    scale: 0.97,
                  }
                : {}
            }
            onClick={handleBuyNow}
            disabled={!product.inStock || isBuyingNow}
            className={`h-9 flex-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wide transition-colors ${
              product.inStock && !isBuyingNow
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
            whileTap={
              product.inStock && !isAddingToCart
                ? {
                    scale: 0.97,
                  }
                : {}
            }
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
              product.inStock && !isAddingToCart
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
