// app/page.tsx or app/(routes)/page.tsx
"use client";

// ============================================
// STYLES IMPORTS
// ============================================
import m from "./motion.module.css";
import s from "./IndieKonnectHome.module.css";

// ============================================
// CUSTOM HOOKS
// ============================================
import useMagnetic from "./useParallax";

// ============================================
// ANIMATIONS
// ============================================
import {
  ripple,
  flyToCart,
  bumpBadge,
  heartPop,
  bannerMove,
  bannerLeave,
} from "./interactions";

// ============================================
// REACT & NEXT
// ============================================
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================
// COMPONENTS
// ============================================
import Footer from "../../Footer/Footer";
import Header from "../Header";

// ============================================
// DATA
// ============================================
import { ticker } from "../catalog";

// ============================================
// ICONS
// ============================================
import { FaTruck, FaLock, FaUndo, FaHeadset } from "react-icons/fa";

// ============================================
// REDUX API
// ============================================
import {
  useGetContentsQuery,
  useGetDealOfTheDayProductsQuery,
  useGetGrowthStepsQuery,
  useGetProductSectionsQuery,
  useGetReelsQuery,
  useGetTrendingProductsQuery,
} from "@/lib/redux/api/Home/contentApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";

import {
  useAddToCartMutation,
  useUpdateCartItemMutation,
} from "@/lib/redux/api/cartApi";

import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/Profile/userApi";
import ShopReelsRow from "./ShopReel";
import { useGetBrandsQuery } from "@/lib/redux/api/brandsApi";


const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerContainer = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

// ============================================
// PRICING HELPER FUNCTIONS
// ============================================

const getProductPrice = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(product.distributor_price || product.retail_price || 0);
  }

  return Number(product.retail_price || 0);
};

const getProductMrp = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(product.distributor_mrp || product.retail_mrp || 0);
  }

  return Number(product.retail_mrp || 0);
};

const getFormattedPrice = (product: any, userType?: string) => {
  const price = getProductPrice(product, userType);
  return `₹${price.toLocaleString("en-IN")}`;
};

const getDiscountPercentage = (product: any, userType?: string) => {
  if (!product) return 0;

  const mrp = getProductMrp(product, userType);
  const price = getProductPrice(product, userType);

  if (mrp > 0 && price > 0 && mrp > price) {
    return Math.round(((mrp - price) / mrp) * 100);
  }
  return 0;
};

// ============================================
// CHILD COMPONENTS
// ============================================

// 1. DEAL BANNER with Parallax + Tilt + Spotlight
function DealBanner({ rawProduct, index, router, parallaxRef, userType }: any) {
  const product = rawProduct?.product || rawProduct;

  const productImage =
    product?.primary_image_url ||
    product?.images?.find((img: any) => img?.is_primary)?.image_url ||
    product?.images?.[0]?.image_url ||
    "/images/placeholder-promo.jpg";

  const price = getProductPrice(product, userType);
  const mrp = getProductMrp(product, userType);
  const discountPercent = getDiscountPercentage(product, userType);

  const handleShopNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);

    const categoryName = product?.category?.name;

    if (!categoryName) {
      return;
    }

    const params = new URLSearchParams({
      category: categoryName,
    });

    router.push(`/products/?${params.toString()}`);
  };

  return (
    <motion.div
      onMouseMove={bannerMove}
      onMouseLeave={bannerLeave}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.65,
        delay: 0.12 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative h-[300px] overflow-hidden rounded-[20px] bg-[#dfe8f0] [transform-style:preserve-3d] shadow-[0_8px_30px_rgba(7,26,65,0.08)] sm:h-[360px] lg:h-[390px] xl:h-[420px]"
    >
      {/* Product Image */}
      <div ref={parallaxRef} className={m.pxFrame}>
        <img
          src={productImage}
          alt={product?.name || "Product"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder-promo.jpg";
          }}
        />
      </div>

      {/* Image Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

      {/* Decorative Spot */}
      <div
        data-spot
        className={index === 0 ? m.spot : `${m.spot} ${m.spotGold}`}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-start px-7 py-8 sm:px-9 sm:py-10 lg:px-10 lg:py-11 xl:px-12 xl:py-12">
        {/* Deal Label */}
        <motion.p
          initial={{
            opacity: 0,
            y: 8,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.2 + index * 0.08,
            duration: 0.5,
          }}
          className="text-[13px] font-medium tracking-[-0.01em] text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:text-[15px]"
        >
          Today's Best Deal
        </motion.p>

        {/* Category Name */}
        <motion.h2
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.28 + index * 0.08,
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-3 max-w-[430px] whitespace-pre-line text-[30px] font-semibold leading-[1.03] tracking-[-0.045em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)] sm:text-[38px] lg:text-[42px] xl:text-[46px]"
        >
          {product?.category?.name}
        </motion.h2>

        {/* Discount */}
        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.36 + index * 0.08,
            duration: 0.5,
          }}
          className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.2)] sm:text-[22px] lg:text-[24px]"
        >
          {discountPercent > 0
            ? `Up to ${discountPercent}% Off!`
            : "Special Offer"}
        </motion.p>

        {/* Shop Now Button */}
        <motion.button
          type="button"
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.5 + index * 0.08,
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={handleShopNow}
          className={`${m.glass} mt-auto flex h-[52px] items-center justify-center gap-3 rounded-[13px] bg-white px-7 text-[14px] font-semibold tracking-[-0.01em] text-[#111827] shadow-[0_8px_25px_rgba(0,0,0,0.14)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)] sm:h-[56px] sm:px-8 sm:text-[15px]`}
        >
          <span>Shop now</span>

          <ArrowRight
            size={19}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

function BrandCard({ brand, router }: any) {
  const image = brand.banner || brand.logo || "/images/placeholder.png";
  const brandName = brand.title || "Brand";
  const discount = brand.discount_percentage || 0;

  const handleBrandClick = () => {
    if (!brand.id) return;
    // Encode brand ID for URL
    router.push(`/products/?brand_ids=${encodeURIComponent(brand.id)}`);
  };

  return (
    <div
      className="relative h-[380px] w-[260px] shrink-0 snap-start overflow-hidden rounded-[10px] bg-[#111111] sm:h-[440px] sm:w-[300px] group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
      onClick={handleBrandClick}
    >
      <img
        src={image}
        alt={brandName}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        onError={(e) => {
          e.currentTarget.src = "/images/placeholder.png";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-[11px] font-bold text-[#111111] shadow-lg">
          {discount}% OFF
        </div>
      )}

      {/* Brand Name - Top */}
      <div className="relative z-10 flex h-full flex-col items-center justify-start pt-8 px-5">
        <h3 className="text-xl font-semibold text-white drop-shadow-lg sm:text-2xl">
          {brandName}
        </h3>
        {brand.product_count && (
          <p className="mt-1 text-sm text-white/70">
            {brand.product_count} Products
          </p>
        )}
      </div>

      {/* Shop Button - Bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrandClick();
          }}
          className="w-full max-w-[180px] rounded-[8px] bg-white px-8 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#111111] shadow-lg transition-all duration-300 hover:bg-[#111111] hover:text-white hover:shadow-xl transform hover:scale-105"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}

// 3. LIFESTYLE BANNER with Parallax
function LifestyleBanner({ apiResponse, router, parallaxRef }: any) {
  const secondBannerContent = apiResponse?.data?.find(
    (item: any) => item.slug === "home-page-second-banner",
  );
  const secondBannerBlock = secondBannerContent?.blocks?.[0];
  const secondBannerImage =
    secondBannerBlock?.images?.find((image: any) => image?.is_primary)?.url ||
    secondBannerBlock?.images?.[0]?.url ||
    "/indiekonnect-web/images/prod.png";

  return (
    <section className="w-full bg-[#11101f]">
      <div className="relative mx-auto min-h-[520px] w-full max-w-[1900px] overflow-hidden">
        <div ref={parallaxRef} className={m.pxFrame}>
          <img
            src={secondBannerImage}
            alt={
              secondBannerBlock?.images?.find((image: any) => image?.is_primary)
                ?.alt_text ||
              secondBannerContent?.title ||
              "Premium Lifestyle"
            }
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/indiekonnect-web/images/prod.png";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#11101f]/95 via-[#11101f]/70 to-transparent" />

        <div className="relative z-10 flex min-h-[620px] items-center">
          <div className="w-full max-w-[620px] px-7 py-16 sm:px-12 md:px-16 lg:ml-[5%] lg:px-0">
            {secondBannerBlock?.heading && (
              <div
                className="mb-5 text-[14px] font-medium tracking-wide text-white/85 sm:text-[16px] [&>h1]:m-0 [&>h2]:m-0 [&>h3]:m-0 [&>p]:m-0 [&>h1]:font-medium [&>h2]:font-medium [&>h3]:font-medium [&>p]:font-medium [&>h1]:text-[14px] [&>h2]:text-[14px] [&>h3]:text-[14px] [&>p]:text-[14px] sm:[&>h1]:text-[16px] sm:[&>h2]:text-[16px] sm:[&>h3]:text-[16px] sm:[&>p]:text-[16px]"
                dangerouslySetInnerHTML={{ __html: secondBannerBlock.heading }}
              />
            )}

            {secondBannerBlock?.short_description && (
              <div
                className="max-w-[650px] text-white [&>h1]:m-0 [&>h2]:m-0 [&>h3]:m-0 [&>p]:m-0 [&>h1]:text-[42px] [&>h1]:font-semibold [&>h1]:leading-[1.08] [&>h1]:tracking-[-0.035em] [&>h2]:text-[42px] [&>h2]:font-semibold [&>h2]:leading-[1.08] [&>h2]:tracking-[-0.035em] [&>h3]:text-[42px] [&>h3]:font-semibold [&>h3]:leading-[1.08] [&>h3]:tracking-[-0.035em] [&>p]:text-[42px] [&>p]:font-semibold [&>p]:leading-[1.08] [&>p]:tracking-[-0.035em] sm:[&>h1]:text-[52px] sm:[&>h2]:text-[52px] sm:[&>h3]:text-[52px] sm:[&>p]:text-[52px] md:[&>h1]:text-[60px] md:[&>h2]:text-[60px] md:[&>h3]:text-[60px] md:[&>p]:text-[60px] lg:[&>h1]:text-[68px] lg:[&>h2]:text-[68px] lg:[&>h3]:text-[68px] lg:[&>p]:text-[68px] xl:[&>h1]:text-[72px] xl:[&>h2]:text-[72px] xl:[&>h3]:text-[72px] xl:[&>p]:text-[72px]"
                dangerouslySetInnerHTML={{
                  __html: secondBannerBlock.short_description,
                }}
              />
            )}

            <button
              type="button"
              onClick={(e) => {
                ripple(e);
                router.push("/products");
              }}
              className={`${m.glass} mt-9 inline-flex items-center gap-3 rounded-[10px] bg-white px-7 py-4 text-[14px] font-semibold text-[#171717] shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition-all duration-200 hover:bg-[#f2f2f2] hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-[15px]`}
            >
              Explore All Products
              <span className="text-[20px] leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


// ============================================
// NEW ARRIVAL CARD — Banner Style (fixed height)
// ============================================
function NewArrivalCard({ product, router }: any) {
  const image =
    product?.primary_image_url ||
    product?.images?.find((img: any) => img?.is_primary)?.image_url ||
    product?.images?.[0]?.image_url ||
    "/images/placeholder.png";

  const brand = product?.brand?.name || product?.name || "Brand";

  return (
    <div className="relative h-[380px] w-[260px] shrink-0 snap-start overflow-hidden rounded-[10px] bg-[#111111] sm:h-[440px] sm:w-[300px]">
      <img
        src={image}
        alt={product?.name}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/images/placeholder.png";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-6 text-center">
        <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-white sm:text-[18px]">
          {brand}
        </p>

        <button
          type="button"
          onClick={() =>
            product?.slug && router.push(`/product/${product.slug}/`)
          }
          className="rounded-[6px] bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#111111] shadow-lg transition-all duration-300 hover:bg-[#111111] hover:text-white"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}

// ============================================
// BEST SELLER CARD — Compact Style (fixed height)
// ============================================
function BestSellerCard({
  product,
  index,
  router,
  userType,
  wish,
  handleToggleWishlist,
}: any) {
  const price =
    userType === "distributor"
      ? Number(
        product.distributor_price ||
        product.current_price ||
        product.retail_price ||
        0,
      )
      : Number(product.current_price || product.retail_price || 0);

  const mrp =
    userType === "distributor"
      ? Number(
        product.distributor_mrp ||
        product.original_price ||
        product.retail_mrp ||
        0,
      )
      : Number(product.original_price || product.retail_mrp || 0);

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const image =
    product.primary_image_url ||
    product.images?.find((img: any) => img?.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    "/images/placeholder.png";

  const rating =
    product.reviews?.average_rating ??
    product.reviews_summary?.average_rating ??
    product.rating ??
    0;
  const reviews =
    product.reviews?.total_reviews ??
    product.reviews_summary?.total_reviews ??
    product.review_count ??
    0;
  const isWishlisted = wish[product.id] || false;
  const brand = product.brand?.name || "Brand";
  const category = product.category?.name || "";

  return (
    <div className="group w-[190px] shrink-0 sm:w-[210px]">
      {/* IMAGE — fixed square */}
      <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#f4f3ee]">
        <img
          src={image}
          alt={product.name}
          loading={index < 4 ? "eager" : "lazy"}
          className="h-full w-full cursor-pointer object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
          onClick={() =>
            product?.slug && router.push(`/product/${product.slug}/`)
          }
        />

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(e) => handleToggleWishlist(product.id, product.name, e)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition hover:bg-[#111111] hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[13px] w-[13px]"
            fill={isWishlisted ? "#111111" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>
      </div>

      {/* RATING */}
      <div className="mt-2 flex items-center gap-1">
        <span className="text-[11px] font-semibold text-[#111111]">
          {Number(rating).toFixed(1)}
        </span>
        <span className="text-[11px] text-[#111111]">★</span>
        <span className="text-[10px] text-[#999999]">|{reviews}</span>
      </div>

      {/* BRAND | CATEGORY */}
      <p
        onClick={() =>
          product?.slug && router.push(`/product/${product.slug}/`)
        }
        className="mt-1 cursor-pointer text-[12px] font-semibold text-[#111111] sm:text-[13px]"
      >
        {brand} | {category || "Product"}
      </p>

      {/* SHORT DESC — product name */}
      <p className="mt-0.5 line-clamp-1 text-[11px] text-[#777777]">
        {product.name}
      </p>

      {/* PRICE */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px]">
        <span className="font-semibold text-[#111111]">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {mrp > price && (
          <span className="text-[#999999] line-through">
            ₹{mrp.toLocaleString("en-IN")}
          </span>
        )}
        {discount > 0 && (
          <span className="font-medium text-[#1a8a3f]">{discount}% off</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// BEST OFFERS ROW — Horizontal Scroll with Arrows
// ============================================

function BestOffersRow({
  products = [],
  userType,
  wish,
  router,
  handleToggleWishlist,
  isFetching,
  isError,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (isFetching) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[8px] bg-[#e8e6e1] sm:h-[320px] sm:w-[210px]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-[13px] font-medium text-[#777777]">
          Failed to load offers
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-[13px] font-medium text-[#777777]">
          No offers available
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* LEFT ARROW */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Previous"
        className="absolute left-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
      >
        <ChevronLeft size={19} strokeWidth={1.7} />
      </button>

      {/* RIGHT ARROW */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Next"
        className="absolute right-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
      >
        <ChevronRight size={19} strokeWidth={1.7} />
      </button>

      {/* SCROLL ROW */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5 sm:px-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.slice(0, 12).map((product: any, index: number) => {
          const price =
            userType === "distributor"
              ? Number(
                product.distributor_price ||
                product.current_price ||
                product.retail_price ||
                0,
              )
              : Number(product.current_price || product.retail_price || 0);

          const mrp =
            userType === "distributor"
              ? Number(
                product.distributor_mrp ||
                product.original_price ||
                product.retail_mrp ||
                0,
              )
              : Number(product.original_price || product.retail_mrp || 0);

          const discount =
            mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          const image =
            product.primary_image_url ||
            product.images?.find((img: any) => img?.is_primary)?.image_url ||
            product.images?.[0]?.image_url ||
            "/images/placeholder.png";

          const rating = product.reviews?.average_rating ?? product.rating ?? 0;
          const reviews =
            product.reviews?.total_reviews ?? product.review_count ?? 0;
          const isWishlisted = wish[product.id] || false;
          const brand = product.brand?.name || "Brand";

          return (
            <div
              key={product.id || index}
              className="group w-[190px] shrink-0 sm:w-[210px]"
            >
              {/* IMAGE — fixed square with offer badge */}
              <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#f4f3ee]">
                <img
                  src={image}
                  alt={product.name}
                  loading={index < 4 ? "eager" : "lazy"}
                  className="h-full w-full cursor-pointer object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.png";
                  }}
                  onClick={() =>
                    product?.slug && router.push(`/product/${product.slug}/`)
                  }
                />

                {/* Offer Badge */}
                {discount > 0 && (
                  <div className="absolute left-2 top-2 rounded-full bg-[#1a8a3f] px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
                    {discount}% OFF
                  </div>
                )}

                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  onClick={(e) =>
                    handleToggleWishlist(product.id, product.name, e)
                  }
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition hover:bg-[#111111] hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[13px] w-[13px]"
                    fill={isWishlisted ? "#111111" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    />
                  </svg>
                </button>
              </div>

              {/* RATING */}
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[11px] font-semibold text-[#111111]">
                  {Number(rating).toFixed(1)}
                </span>
                <span className="text-[11px] text-[#111111]">★</span>
                <span className="text-[10px] text-[#999999]">|{reviews}</span>
              </div>

              {/* BRAND | NAME */}
              <p
                onClick={() =>
                  product?.slug && router.push(`/product/${product.slug}/`)
                }
                className="mt-1 cursor-pointer text-[12px] font-semibold text-[#111111] sm:text-[13px]"
              >
                {brand} | {product.name}
              </p>

              {/* PRICE */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px]">
                <span className="font-semibold text-[#111111]">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {mrp > price && (
                  <span className="text-[#999999] line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="font-medium text-[#1a8a3f]">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// POPULAR PRODUCTS ROW — Like Best Sellers Style
// ============================================

function PopularProductsRow({
  products = [],
  userType,
  wish,
  router,
  handleToggleWishlist,
  handleAddToCart,
  isProductsLoading,
  isProductsError,
  refetchProducts,
  getProductImage,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (isProductsLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[8px] bg-[#e8e6e1] sm:h-[320px] sm:w-[210px]"
          />
        ))}
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <button
          type="button"
          onClick={() => refetchProducts()}
          className="rounded-full bg-[#111111] px-6 py-2.5 text-[12px] font-medium text-white shadow-[0_5px_15px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-[#292929] active:scale-[0.98]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-[13px] text-[#777777]">No products available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* LEFT ARROW */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Previous"
        className="absolute left-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
      >
        <ChevronLeft size={19} strokeWidth={1.7} />
      </button>

      {/* RIGHT ARROW */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Next"
        className="absolute right-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
      >
        <ChevronRight size={19} strokeWidth={1.7} />
      </button>

      {/* SCROLL ROW */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5 sm:px-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product: any, index: number) => {
          const price =
            userType === "distributor"
              ? Number(product.distributor_price || product.retail_price || 0)
              : Number(product.retail_price || 0);

          const mrp =
            userType === "distributor"
              ? Number(product.distributor_mrp || product.retail_mrp || 0)
              : Number(product.retail_mrp || 0);

          const discount =
            mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          const image = getProductImage(product);
          const rating = product.reviews?.average_rating ?? product.rating ?? 0;
          const reviews =
            product.reviews?.total_reviews ?? product.review_count ?? 0;
          const isWishlisted = wish[product.id] || false;
          const brand = product.brand?.name || "Brand";

          return (
            <div
              key={product.id || index}
              className="flex h-[300px] w-[190px] shrink-0 snap-start flex-col sm:h-[320px] sm:w-[210px]"
            >
              {/* IMAGE — fixed square */}
              <div className="relative h-[190px] shrink-0 overflow-hidden rounded-[8px] bg-[#f4f3ee] sm:h-[210px]">
                <img
                  src={image}
                  alt={product.name}
                  loading={index < 4 ? "eager" : "lazy"}
                  className="h-full w-full cursor-pointer object-contain p-3 transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.png";
                  }}
                  onClick={() =>
                    product?.slug && router.push(`/product/${product.slug}/`)
                  }
                />

                {/* Popular Badge */}
                <div className="absolute left-2 top-2">
                  <span className="inline-flex rounded-full bg-white px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:px-2.5 sm:text-[8px]">
                    {index === 0 ? "Popular" : index === 1 ? "New" : "Featured"}
                  </span>
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-[#111111] shadow-[0_3px_10px_rgba(0,0,0,0.10)]">
                      <span className="font-bold">%</span>
                      {discount}% OFF
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  onClick={(e) =>
                    handleToggleWishlist(product.id, product.name, e)
                  }
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition hover:bg-[#111111] hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[13px] w-[13px]"
                    fill={isWishlisted ? "#111111" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    />
                  </svg>
                </button>
              </div>

              {/* CONTENT — fixed layout without extra gaps */}
              <div className="flex flex-1 flex-col pt-1.5">
                {/* RATING - fixed height */}
                <div className="flex h-[18px] items-center gap-1">
                  <span className="text-[11px] font-semibold text-[#111111]">
                    {Number(rating).toFixed(1)}
                  </span>
                  <span className="text-[11px] text-[#111111]">★</span>
                  <span className="text-[10px] text-[#999999]">
                    |{reviews}
                  </span>
                </div>

                {/* BRAND | NAME — line-clamp-2 with fixed height */}
                <p
                  onClick={() =>
                    product?.slug && router.push(`/product/${product.slug}/`)
                  }
                  className="line-clamp-2 h-[32px] cursor-pointer text-[12px] font-semibold leading-[1.3] text-[#111111] sm:text-[13px]"
                >
                  {brand} | {product.name}
                </p>

                {/* PRICE — directly below name with mt-1 */}
                <div className=" flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px]">
                  <span className="font-semibold text-[#111111]">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  {mrp > price && (
                    <span className="text-[#999999] line-through">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="font-medium text-[#1a8a3f]">
                      {discount}% off
                    </span>
                  )}
                </div>

                {/* Spacer to push everything up if needed */}
                <div className="flex-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function IndieKonnectHome() {
  const router = useRouter();

  // ============================================
  // GET USER TYPE FROM PROFILE
  // ============================================

  const { data: userProfile } = useGetUserProfileQuery({});
  const userType = userProfile?.user?.account_type || "customer";

  // ============================================
  // STATE HOOKS
  // ============================================
  const [wish, setWish] = useState<Record<string | number, boolean>>({});
  const [level, setLevel] = useState(0);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // ============================================
  // REF HOOKS
  // ============================================
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  // Parallax refs
  const dealParallaxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lifestyleParallaxRef = useRef<HTMLDivElement | null>(null);

  // ============================================
  // MOTION HOOKS
  // ============================================
  const shopBtn = useMagnetic();
  const exploreBtn = useMagnetic();

  // ============================================
  // API HOOKS
  // ============================================
  const { data: apiResponse, isLoading, error } = useGetContentsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: dealProductResponse } = useGetDealOfTheDayProductsQuery();
  const {
    data: reelsData,
    isLoading: isReelsLoading,
    error: reelsError,
  } = useGetReelsQuery({});
  const {
    data: trendingResponse,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    refetch: refetchTrending,
  } = useGetTrendingProductsQuery();
  const {
    data: productSections,
    isFetching,
    isError,
  } = useGetProductSectionsQuery();
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    is_published: 1,
    per_page: 20,
    page: 1,
  });
  const { data: growthStepsData, isLoading: isGrowthStepsLoading } =
    useGetGrowthStepsQuery();

  // BRANDS API
  const { data: brandsData, isLoading: isBrandsLoading, error: brandsError } = useGetBrandsQuery({});

  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();
  const [addToWishlistMutation] = useAddToWishlistMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    {},
  );

  // ============================================
  // DATA NORMALIZATION
  // ============================================

  const dealProducts = useMemo(() => {
    if (Array.isArray(dealProductResponse)) return dealProductResponse;
    if (Array.isArray(dealProductResponse?.data))
      return dealProductResponse.data;
    return [];
  }, [dealProductResponse]);

  const products = productsResponse?.data ?? [];
  const trendingProducts = trendingResponse?.data ?? [];
  const newArrivals = productSections?.data?.new_arrivals?.products || [];
  const bestSellers = productSections?.data?.best_sellers?.products || [];
  const bestOffers = productSections?.data?.best_offers?.products || [];

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    const rawData = categoriesData.data || categoriesData;
    if (Array.isArray(rawData)) return rawData;
    if (rawData?.data && Array.isArray(rawData.data)) return rawData.data;
    if (rawData?.categories && Array.isArray(rawData.categories))
      return rawData.categories;
    if (rawData?.items && Array.isArray(rawData.items)) return rawData.items;
    return [];
  }, [categoriesData]);

  const growthSteps =
    growthStepsData?.data?.steps?.filter((step: any) => step.is_active) ?? [];
  const growthTitle =
    growthStepsData?.data?.title || "A growth ladder for leaders";
  const activeLevel =
    growthSteps.length > 0 ? Math.min(level, growthSteps.length - 1) : 0;

  // ============================================
  // PARALLAX EFFECT
  // ============================================

  useEffect(() => {
    if (!dealProducts || dealProducts.length === 0) return;

    const cleanups: (() => void)[] = [];

    dealParallaxRefs.current.forEach((el, index) => {
      if (!el) return;
      const amount = index === 0 ? 26 : 38;

      const handleScroll = () => {
        try {
          const rect = el.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const scrollProgress = 1 - rect.top / viewportHeight;
          const offset = Math.max(0, Math.min(scrollProgress, 1)) * amount;
          el.style.transform = `translateY(${offset}px)`;
        } catch (err) {
          // Silent fail
        }
      };

      requestAnimationFrame(handleScroll);

      window.addEventListener("scroll", handleScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", handleScroll));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [dealProducts]);

  useEffect(() => {
    if (!apiResponse) return;

    const el = lifestyleParallaxRef.current;
    if (!el) return;

    const amount = 46;
    const handleScroll = () => {
      try {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollProgress = 1 - rect.top / viewportHeight;
        const offset = Math.max(0, Math.min(scrollProgress, 1)) * amount;
        el.style.transform = `translateY(${offset}px)`;
      } catch (err) {
        // Silent fail
      }
    };

    requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [apiResponse]);

  // ============================================
  // WISHLIST SYNC
  // ============================================

  useEffect(() => {
    if (!wishlistData?.data) return;
    const wishState: Record<string | number, boolean> = {};
    wishlistData.data.forEach((item: any) => {
      if (item.product_id) {
        wishState[item.product_id] = true;
      }
    });
    setWish(wishState);
  }, [wishlistData]);

  // ============================================
  // AUTO SCROLL
  // ============================================

  useEffect(() => {
    if (products.length === 0) return;
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= products.length) return 0;
        return nextIndex;
      });
    }, 3000);
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [products.length]);

  useEffect(() => {
    if (!scrollContainerRef.current || products.length === 0) return;
    const container = scrollContainerRef.current;
    const card = container.children[0] as HTMLElement | undefined;
    const cardWidth = card?.clientWidth || 0;
    const gap = 16;
    const scrollPosition = currentIndex * (cardWidth + gap);
    container.scrollTo({ left: scrollPosition, behavior: "smooth" });
  }, [currentIndex, products.length]);

  // ============================================
  // HELPERS
  // ============================================

  const getProductImage = (product: any) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img?.is_primary);
      return (
        primary?.image_url ||
        product.images[0]?.image_url ||
        "/images/placeholder.png"
      );
    }
    return product?.primary_image_url || "/images/placeholder.png";
  };

  const getProductPriceHelper = (product: any, userType?: string) => {
    if (!product) return 0;
    if (userType === "distributor") {
      return Number(product.distributor_price || product.retail_price || 0);
    }
    return Number(product.retail_price || 0);
  };

  const getProductPrice = (product: any) => {
    if (!product) return "₹0";
    const price = getProductPriceHelper(product, userType);
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getTextFromHtml = (html: string) => {
    if (!html) return "";
    return stripHtml(html);
  };

  // ============================================
  // HERO CONTENT — MULTI-BANNER CAROUSEL
  // ============================================

  const homeContent = apiResponse?.data?.find(
    (item: any) => item.slug === "home" || item.title === "Home",
  );

  const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1600&q=80";

  const heroSlides = useMemo(() => {
    const blocks = homeContent?.blocks || [];

    const slides = blocks
      .slice()
      .sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      .map((block: any, idx: number) => {
        const img =
          block?.images?.find((image: any) => image?.is_primary) ||
          block?.images?.[0];
        if (!img?.url) return null;

        return {
          id: block?.id ?? idx,
          image: img.url,
          alt: img.alt_text || homeContent?.title || "IndieKonnect banner",
          heading: block?.heading ? getTextFromHtml(block.heading) : "",
          shortDescription: block?.short_description || "",
          ctaPrimary: block?.cta_primary_text || "",
          ctaSecondary: block?.cta_secondary_text || "",
          collectionLabel: block?.collection_label || "",
          navigationUrl: block?.navigation_url || block?.cta_url || "/products",
          discountBadge: block?.discount_badge
            ? {
              prefix: block.discount_badge.prefix || "Up To",
              value: block.discount_badge.value || "40",
              suffix: block.discount_badge.suffix || "OFF",
            }
            : null,
        };
      })
      .filter(Boolean) as Array<{
        id: string | number;
        image: string;
        alt: string;
        heading: string;
        shortDescription: string;
        ctaPrimary: string;
        ctaSecondary: string;
        collectionLabel: string;
        navigationUrl: string;
        discountBadge: { prefix: string; value: string; suffix: string } | null;
      }>;

    if (slides.length > 0) return slides;

    return [
      {
        id: "fallback",
        image: FALLBACK_HERO_IMAGE,
        alt: "Hero banner - IndieKonnect",
        heading: "Elevate Your · Summer Style",
        shortDescription:
          "Beauty, crockery,<br />jewellery and <span style='font-style:italic;color:#C9A96E'>watches</span><br />for the modern home.",
        ctaPrimary: "Shop Now",
        ctaSecondary: "Explore Collection",
        collectionLabel: "New Season · 2026",
        navigationUrl: "/products",
        discountBadge: { prefix: "Up To", value: "40", suffix: "OFF" },
      },
    ];
  }, [homeContent]);

  useEffect(() => {
    if (heroIndex >= heroSlides.length) setHeroIndex(0);
  }, [heroSlides.length, heroIndex]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[heroIndex] || heroSlides[0];

  const goToHeroSlide = (idx: number) => {
    if (heroSlides.length === 0) return;
    setHeroIndex(
      ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length,
    );
  };

  // ============================================
  // TOAST
  // ============================================

  const showCustomToast = (
    type: "success" | "error" | "info",
    message: string,
    productName?: string,
  ) => {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 420px;
        width: 100%;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    const colors = { success: "#4BBF8A", error: "#FF4757", info: "#C9A96E" };

    toast.style.cssText = `
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #1a1a1a;
      padding: 18px 24px;
      border-radius: 16px;
      border-left: 5px solid ${colors[type]};
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6);
      transform: translateX(100%);
      animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    `;

    const iconMap = { success: "✓", error: "✕", info: "ℹ" };
    toast.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <div style="
          width:32px;
          height:32px;
          border-radius:50%;
          background:${colors[type]}15;
          border: 2px solid ${colors[type]}30;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          color:${colors[type]};
          font-size:16px;
          font-weight:bold;
        ">${iconMap[type]}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;letter-spacing:-0.2px;margin-bottom:2px;">
            ${productName || ""}
          </div>
          <div style="font-size:13.5px;color:#4a4a4a;line-height:1.4;font-weight:400;">
            ${message}
          </div>
        </div>
        <button class="toast-close-btn" style="background:none;border:none;color:#999;font-size:18px;cursor:pointer;padding:0 0 0 8px;line-height:1;">×</button>
      </div>
    `;

    toastContainer.appendChild(toast);

    const removeToast = () => {
      toast.style.animation =
        "slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
      setTimeout(() => {
        toast.remove();
        if (toastContainer && toastContainer.children.length === 0) {
          toastContainer.remove();
        }
      }, 400);
    };

    toast
      .querySelector(".toast-close-btn")
      ?.addEventListener("click", removeToast);

    if (!document.getElementById("toast-styles")) {
      const style = document.createElement("style");
      style.id = "toast-styles";
      style.textContent = `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (toast.parentNode) removeToast();
    }, 4000);
  };

  // ============================================
  // ADD TO CART
  // ============================================

  const handleAddToCart = async (
    productId: string | number,
    productName: string,
    productImage: string,
    productPrice: number,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      ripple(e);
      flyToCart(e);
    }

    try {
      const response = await addToCartMutation({
        product_id: productId,
        quantity: 1,
      }).unwrap();

      if (
        response?.message === "Item added to cart successfully" ||
        response?.data?.items
      ) {
        const serverItemId =
          response?.data?.item?.id ?? response?.data?.id ?? productId;

        setCartItems((prev) => {
          const existing = prev.find((item) => item.product_id === productId);
          if (existing) {
            return prev.map((item) =>
              item.product_id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [
            ...prev,
            {
              id: serverItemId,
              product_id: productId,
              name: productName,
              image: productImage,
              price: productPrice,
              quantity: 1,
            },
          ];
        });

        setCartTotal((prev) => prev + productPrice);
        setCartSidebarOpen(true);

        setTimeout(() => bumpBadge(), 780);
      } else {
        throw new Error(response?.message || "Failed to add item to cart");
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      showCustomToast(
        "error",
        error?.data?.message || error?.message || "Failed to add item to cart",
        productName,
      );
    }
  };

  // ============================================
  // WISHLIST
  // ============================================

  const handleToggleWishlist = async (
    productId: string | number,
    productName: string,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      heartPop(e);
    }

    const isWishlisted = wish[productId] || false;

    try {
      if (isWishlisted) {
        const response = await removeFromWishlistMutation({
          product_id: productId,
        }).unwrap();
        if (response?.message || response?.data || response?.success === true) {
          setWish((current) => ({ ...current, [productId]: false }));
          showCustomToast(
            "success",
            "Removed from your wishlist ❤️",
            productName,
          );
          refetchWishlist();
        } else {
          throw new Error(
            response?.message || "Failed to remove from wishlist",
          );
        }
      } else {
        const response = await addToWishlistMutation({
          product_id: productId,
        }).unwrap();
        const responseMessage = response?.message?.toLowerCase?.() || "";

        if (
          response?.already_exists ||
          (responseMessage.includes("already") &&
            responseMessage.includes("wishlist"))
        ) {
          setWish((current) => ({ ...current, [productId]: true }));
          showCustomToast("info", "Already in your wishlist ❤️", productName);
          refetchWishlist();
          return;
        }

        if (response?.message || response?.data || response?.success === true) {
          setWish((current) => ({ ...current, [productId]: true }));
          showCustomToast("success", "Added to wishlist! ❤️", productName);
          refetchWishlist();
        } else {
          throw new Error(response?.message || "Failed to add to wishlist");
        }
      }
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);
      const errorMessage = error?.data?.message || error?.message || "";
      const lowerErrorMessage = errorMessage.toLowerCase();

      if (
        (lowerErrorMessage.includes("already") &&
          lowerErrorMessage.includes("wishlist")) ||
        error?.data?.already_exists
      ) {
        setWish((current) => ({ ...current, [productId]: true }));
        showCustomToast("info", "Already in your wishlist ❤️", productName);
        refetchWishlist();
        return;
      }

      showCustomToast(
        "error",
        errorMessage || "Failed to update wishlist",
        productName,
      );
    }
  };

  // ============================================
  // CART UPDATE
  // ============================================

  const handleUpdateCart = async (
    itemId: number,
    productId: number,
    action: "increment" | "decrement",
  ) => {
    const currentItem = cartItems.find((item) => item.product_id === productId);
    if (!currentItem) return;
    if (action === "decrement" && currentItem.quantity <= 1) return;

    try {
      const response = await updateCartItemMutation({
        itemId,
        data: { product_id: productId, quantity: 1, action },
      }).unwrap();

      const quantityChange = action === "increment" ? 1 : -1;
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantityChange }
            : item,
        ),
      );
      setCartTotal((prev) =>
        Math.max(0, prev + currentItem.price * quantityChange),
      );
      showCustomToast(
        "success",
        action === "increment" ? "Quantity increased" : "Quantity decreased",
      );
    } catch (error: any) {
      console.error("Update cart error:", error);
      showCustomToast(
        "error",
        error?.data?.message || error?.message || "Failed to update cart",
      );
    }
  };

 
  const handleCloseCart = () => {
    setCartSidebarOpen(false);
  };


  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.stickyHeaderWrapper}>
          <Header />
        </div>
        <div className={s.loadingContainer}>
          <div className={s.loaderRing}>
            <div className={s.loaderRingInner} />
          </div>
          <p className={s.loadingText}>Loading experience...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error("API Error:", error);
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={s.page}>
      {/* ==========================================
          MARQUEE
      ========================================== */}

      <div className={s.marqueeWrapper}>
        <div className={s.marquee}>
          {[0, 1].map((dup) => (
            <div key={dup} className={s.marqueeItem}>
              {ticker.map((t) => (
                <span key={t}>
                  {t.includes("•") ? <span className={s.gold}>{t}</span> : t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className={s.stickyHeaderWrapper}>
        <Header />
      </div>

      {/* ============================================================
          HERO — PREMIUM CENTERED BANNER CAROUSEL
      ============================================================ */}

      <section className="relative w-full overflow-hidden bg-white py-1 sm:py-2 lg:py-0">
        <div className="relative h-[185px] w-full sm:h-[275px] md:h-[355px] lg:h-[430px] xl:h-[620px]">
          <AnimatePresence initial={false}>
            {heroSlides.map((slide, index) => {
              const total = heroSlides.length;

              let diff = index - heroIndex;

              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isActive = diff === 0;
              const isNearby = Math.abs(diff) <= 1;

              if (!isNearby) return null;

              return (
                <motion.div
                  key={slide.id}
                  initial={{
                    opacity: 0,
                    x: diff > 0 ? "100%" : "-100%",
                    scale: 1,
                  }}
                  animate={{
                    opacity: 1,
                    x: "0%",
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: diff > 0 ? "-100%" : "100%",
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.68,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (diff === -1) {
                        goToHeroSlide(heroIndex - 1);
                        return;
                      }

                      if (diff === 1) {
                        goToHeroSlide(heroIndex + 1);
                        return;
                      }

                      if (slide?.navigationUrl) {
                        router.push(slide.navigationUrl);
                      } else if (slide?.ctaPrimary || slide?.ctaSecondary) {
                        router.push("/products");
                      }
                    }}
                    className="group relative block h-full w-full overflow-hidden rounded-none border-0 bg-[#edf1ee] shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#071a41]/40"
                    aria-label={
                      slide.heading || slide.alt || `Banner ${index + 1}`
                    }
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      draggable={false}
                      loading={isActive ? "eager" : "lazy"}
                      className="block h-full w-full select-none object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.008]"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-promo.jpg";
                      }}
                    />

                    {!isActive && (
                      <span className="pointer-events-none absolute inset-0 bg-black/[0.025]" />
                    )}

                    {isActive && (
                      <span className="pointer-events-none absolute inset-0 ring-1 ring-black/[0.035]" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Desktop Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() => goToHeroSlide(heroIndex - 1)}
                className="absolute left-3 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white/95 text-[#111827] shadow-[0_6px_20px_rgba(0,0,0,0.09)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white lg:flex xl:left-5"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Next banner"
                onClick={() => goToHeroSlide(heroIndex + 1)}
                className="absolute right-3 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white/95 text-[#111827] shadow-[0_6px_20px_rgba(0,0,0,0.09)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white lg:flex xl:right-5"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {heroSlides.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1.5 sm:mt-3">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToHeroSlide(idx)}
                aria-label={`Go to banner ${idx + 1}`}
                className={`h-[5px] rounded-full transition-all duration-300 ${idx === heroIndex
                  ? "w-7 bg-[#071a41]"
                  : "w-[5px] bg-[#cfd3d7] hover:bg-[#aeb4bb]"
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          PAGE WRAPPER
      ========================================== */}

      <div className="relative z-[3] overflow-clip bg-white">
        {/* ==========================================
            SHOP DEALS BY CATEGORY
        ========================================== */}

        <motion.section
          className="relative w-full overflow-hidden bg-white py-10 sm:py-12 lg:py-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-7"
            >
              <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#101827] sm:text-[32px]">
                Shop by Category
              </h2>
              <p className="mt-2 text-[11px] leading-5 text-[#686868] sm:text-[12px]">
                Explore our curated collection.
              </p>
            </motion.div>

            <div className="relative w-full">
              {/* Left Fade */}
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-12 lg:w-14" />

              {/* Right Fade */}
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-12 lg:w-14" />

              {/* Left Arrow */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("category-scroll");
                  container?.scrollBy({ left: -320, behavior: "smooth" });
                }}
                aria-label="Previous categories"
                className="absolute left-0 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#20252d] shadow-[0_6px_25px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:border-[#071A41] hover:bg-[#071A41] hover:text-white active:scale-95 sm:h-10 sm:w-10"
              >
                <ChevronLeft size={19} strokeWidth={1.7} />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("category-scroll");
                  container?.scrollBy({ left: 320, behavior: "smooth" });
                }}
                aria-label="Next categories"
                className="absolute right-0 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#20252d] shadow-[0_6px_25px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:border-[#071A41] hover:bg-[#071A41] hover:text-white active:scale-95 sm:h-10 sm:w-10"
              >
                <ChevronRight size={19} strokeWidth={1.7} />
              </button>


              {/* Category Scroll */}
              <div className="relative w-full">
                {/* Left Fade */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-14 lg:w-16" />

                {/* Right Fade */}
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-14 lg:w-16" />

                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById("category-scroll");
                    container?.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                  aria-label="Previous categories"
                  className="absolute left-1 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#20252d] shadow-[0_6px_25px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:border-[#071A41] hover:bg-[#071A41] hover:text-white active:scale-95 sm:h-10 sm:w-10"
                >
                  <ChevronLeft size={19} strokeWidth={1.7} />
                </button>

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById("category-scroll");
                    container?.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                  aria-label="Next categories"
                  className="absolute right-1 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#20252d] shadow-[0_6px_25px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:border-[#071A41] hover:bg-[#071A41] hover:text-white active:scale-95 sm:h-10 sm:w-10"
                >
                  <ChevronRight size={19} strokeWidth={1.7} />
                </button>

                {/* Category Scroll */}
                <div
                  id="category-scroll"
                  className="flex w-full items-start gap-4 overflow-x-auto scroll-smooth px-12 pb-3 pt-1 scrollbar-hide sm:gap-5 sm:px-16 md:gap-6 md:px-16 lg:gap-7 lg:px-20"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {categories.map((category: any, index: number) => (
                    <motion.div
                      key={category.id || `${category.title}-${index}`}
                      variants={scaleIn}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() =>
                        router.push(
                          `/products/?category=${encodeURIComponent(
                            category.title,
                          )}`,
                        )
                      }
                      className="group shrink-0 cursor-pointer text-center w-[calc((100vw-140px)/2)] max-w-[230px] sm:w-[220px] sm:max-w-none md:w-[250px] lg:w-[270px] xl:w-[290px]"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px] bg-[#f3f3f3] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.10)]">
                        <img
                          src={
                            category.image ||
                            "https://via.placeholder.com/300x375"
                          }
                          alt={category.title}
                          loading={index < 5 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300x375";
                          }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <h3 className="mt-3 truncate text-center text-[13px] font-semibold leading-5 tracking-[-0.01em] text-[#202020] transition-colors duration-300 group-hover:text-[#071A41] sm:text-[14px] md:text-[15px]">
                        {category.title}
                      </h3>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ==========================================
            BRANDS SECTION — Replacing New Arrivals
        ========================================== */}

        <motion.section
          className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-8"
            >
              <span className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Fresh Finds
              </span>
              <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                New Arrivals
              </h2>
              <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                Discover the latest products
                <br className="hidden sm:block" />
                freshly added to our collection
              </p>
            </motion.div>
            {isBrandsLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[380px] w-[260px] shrink-0 animate-pulse rounded-[10px] bg-[#f4f3ee] sm:h-[440px] sm:w-[300px]"
                  />
                ))}
              </div>
            ) : brandsData?.data?.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-[13px] font-medium text-[#777777]">
                  No brands available
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* LEFT ARROW */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("brands-scroll");
                    el?.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                  aria-label="Previous"
                  className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
                >
                  <ChevronLeft size={19} strokeWidth={1.7} />
                </button>

                {/* RIGHT ARROW */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("brands-scroll");
                    el?.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                  aria-label="Next"
                  className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
                >
                  <ChevronRight size={19} strokeWidth={1.7} />
                </button>

                {/* SCROLL ROW */}
                <div
                  id="brands-scroll"
                  className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5 sm:px-10"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {brandsData?.data?.map((brand: any, index: number) => (
                    <BrandCard
                      key={brand.id || index}
                      brand={brand}
                      router={router}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ==========================================
            BEST SELLERS SECTION — Compact Row
        ========================================== */}

        <motion.section
          className="relative w-full overflow-hidden bg-[#fafaf8] py-8 sm:py-10 lg:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-8"
            >
              <span className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Customer Favorites
              </span>
              <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                Best Sellers
              </h2>
              <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                Our most loved products
                <br className="hidden sm:block" />
                trusted by thousands
              </p>
            </motion.div>

            {isFetching ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[300px] w-[190px] shrink-0 animate-pulse rounded-[8px] bg-[#e8e6e1] sm:h-[320px] sm:w-[210px]"
                  />
                ))}
              </div>
            ) : bestSellers.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-[13px] font-medium text-[#777777]">
                  No best sellers available
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* LEFT ARROW */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("best-sellers-scroll");
                    el?.scrollBy({ left: -300, behavior: "smooth" });
                  }}
                  aria-label="Previous"
                  className="absolute left-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
                >
                  <ChevronLeft size={19} strokeWidth={1.7} />
                </button>

                {/* RIGHT ARROW */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("best-sellers-scroll");
                    el?.scrollBy({ left: 300, behavior: "smooth" });
                  }}
                  aria-label="Next"
                  className="absolute right-0 top-[95px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-105 hover:bg-[#111111] hover:text-white sm:flex"
                >
                  <ChevronRight size={19} strokeWidth={1.7} />
                </button>

                {/* SCROLL ROW */}
                <div
                  id="best-sellers-scroll"
                  className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5 sm:px-10"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {bestSellers
                    .slice(0, 12)
                    .map((product: any, index: number) => (
                      <BestSellerCard
                        key={product.id || index}
                        product={product}
                        index={index}
                        router={router}
                        userType={userType}
                        wish={wish}
                        handleToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ==========================================
    BEST OFFERS SECTION — Horizontal Scroll Row
========================================== */}

        <motion.section
          className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-8"
            >
              <span className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Special Deals
              </span>
              <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                Best Offers
              </h2>
              <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                Exclusive discounts
                <br className="hidden sm:block" />
                on premium products
              </p>
            </motion.div>

            <BestOffersRow
              products={bestOffers}
              userType={userType}
              wish={wish}
              router={router}
              handleToggleWishlist={handleToggleWishlist}
              isFetching={isFetching}
              isError={isError}
            />
          </div>
        </motion.section>

        {/* ==========================================
            DEAL BANNERS (Limited time deals removed)
        ========================================== */}

        <section className="relative w-full overflow-hidden bg-white py-5 sm:py-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5 xl:gap-6">
              {dealProducts && dealProducts.length > 0 ? (
                dealProducts.map((rawProduct: any, index: number) => {
                  const setRef = (el: HTMLDivElement | null) => {
                    if (el) {
                      dealParallaxRefs.current[index] = el;
                    }
                  };

                  return (
                    <DealBanner
                      key={rawProduct?.product?.id || rawProduct?.id || index}
                      rawProduct={rawProduct}
                      index={index}
                      router={router}
                      parallaxRef={setRef}
                      userType={userType}
                    />
                  );
                })
              ) : (
                <div className="col-span-full flex h-[300px] items-center justify-center rounded-[20px] bg-[#dfe8f0] shadow-[0_8px_30px_rgba(7,26,65,0.08)] sm:h-[360px] lg:h-[390px] xl:h-[420px]">
                  <p className="font-medium text-gray-500">No deal available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================
    POPULAR PRODUCTS — Horizontal Scroll Row
========================================== */}

        <section className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
              <span className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Most Loved
              </span>
              <h2 className="font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[34px] lg:text-[40px]">
                Popular Products
              </h2>
              <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#777777] sm:text-[13px] sm:leading-6">
                Dining, living, and desk areas serve their purposes
                <br className="hidden sm:block" />
                in total harmony of style.
              </p>
            </div>

            <PopularProductsRow
              products={products}
              userType={userType}
              wish={wish}
              router={router}
              handleToggleWishlist={handleToggleWishlist}
              handleAddToCart={handleAddToCart}
              isProductsLoading={isProductsLoading}
              isProductsError={isProductsError}
              refetchProducts={refetchProducts}
              getProductImage={getProductImage}
            />
          </div>
        </section>

        {/* ==========================================
            LIFESTYLE BANNER
        ========================================== */}

        {apiResponse && (
          <LifestyleBanner
            apiResponse={apiResponse}
            router={router}
            parallaxRef={lifestyleParallaxRef}
          />
        )}

        {/* ==========================================
    SHOP REELS — Banner Style (Like New Arrivals)
========================================== */}

        <ShopReelsRow />
        {/* ==========================================
            GROWTH LADDER
        ========================================== */}

        {/* ==========================================
            FOOTER
        ========================================== */}

        <Footer />
      </div>

      {/* ==========================================
          CART SIDEBAR
      ========================================== */}

      {cartSidebarOpen && (
        <div
          className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-sm"
          onClick={handleCloseCart}
        >
          <div
            className="fixed right-0 top-0 z-[999999] h-full w-full max-w-md bg-white shadow-2xl font-sans overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#071a41] tracking-wide">
                Shopping Bag{" "}
                <span className="font-normal text-gray-400">
                  ({cartItems.length})
                </span>
              </h3>
              <button
                type="button"
                onClick={handleCloseCart}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#071a41] transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-[#071a41]/5 flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-[#071a41]/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-2">Your bag is empty</p>
                <p className="text-sm text-gray-400 mb-6">
                  Looks like you haven't added anything yet
                </p>
                <button
                  type="button"
                  onClick={handleCloseCart}
                  className="px-8 py-3 bg-[#071a41] text-white rounded-lg hover:bg-[#0a2450] transition-colors duration-200 shadow-lg shadow-[#071a41]/20 font-medium"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#071a41] truncate">
                          {item.name}
                        </div>
                        <div className="text-base font-semibold text-[#071a41] mt-1">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCart(
                                item.id,
                                item.product_id,
                                "decrement",
                              )
                            }
                            disabled={isUpdatingCart || item.quantity <= 1}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#071a41] hover:bg-[#071a41]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:text-[#071a41]"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-[#071a41]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCart(
                                item.id,
                                item.product_id,
                                "increment",
                              )
                            }
                            disabled={isUpdatingCart}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#071a41] hover:bg-[#071a41]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:text-[#071a41]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 pt-4 pb-6 space-y-3">
                  <div className="flex items-center justify-between text-lg font-semibold text-[#071a41]">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (cartItems.length > 0) {
                        const firstProductId = cartItems[0].product_id;
                        router.push(
                          `/checkout?product_id=${firstProductId}&quantity=1`,
                        );
                      }
                    }}
                    className="w-full py-3.5 bg-[#071a41] text-white rounded-lg hover:bg-[#0a2450] transition-colors duration-200 shadow-lg shadow-[#071a41]/25 font-medium"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="w-full py-3 text-[#071a41] font-medium hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
                  >
                    View Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}