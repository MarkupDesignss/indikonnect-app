"use client";

import m from "./motion.module.css";
import s from "./IndieKonnectHome.module.css";

import {
  ripple,
  flyToCart,
  bumpBadge,
  heartPop,
  bannerMove,
  bannerLeave,
} from "./interactions";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";

import { useRouter } from "next/navigation";

import Footer from "../../Footer/Footer";
import Header from "../Header";

import {
  useGetContentsQuery,
  useGetDealOfTheDayProductsQuery,
  useGetProductSectionsQuery,
  useGetReelsQuery,
  useGetGrowthStepsQuery,
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

import { useGetBrandsQuery } from "@/lib/redux/api/brandsApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import ShopReelsRow from "./ShopReel";
import TestimonialsSection from "./Testimonialssection";
import ReviewCarousel from "./ReviewCarousel";
import StyleTestimonials from "./StyleTestimonials";
import WatchesBanner from "./WatchesBanner";
import HeroBannerCarousel from "./HeroBannerCarousel";
import PurchaseTrustBar from "./PurchaseTrustBar";

/* =========================================================
   ANIMATIONS
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

const getProductPrice = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(
      product.distributor_price ||
        product.current_price ||
        product.retail_price ||
        0,
    );
  }

  return Number(product.current_price || product.retail_price || 0);
};

const getProductMrp = (product: any, userType?: string) => {
  if (!product) return 0;

  if (userType === "distributor") {
    return Number(
      product.distributor_mrp ||
        product.original_price ||
        product.retail_mrp ||
        0,
    );
  }

  return Number(product.original_price || product.retail_mrp || 0);
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

const getProductImage = (product: any) => {
  if (!product) return "/images/placeholder.png";

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const primary = product.images.find((img: any) => img?.is_primary);

    return (
      primary?.image_url ||
      product.images[0]?.image_url ||
      product.primary_image_url ||
      "/images/placeholder.png"
    );
  }

  return (
    product?.primary_image_url || product?.image || "/images/placeholder.png"
  );
};

/* =========================================================
   DEAL BANNER
========================================================= */

function DealBanner({ rawProduct, index, router, parallaxRef, userType }: any) {
  const product = rawProduct?.product || rawProduct;

  const productImage = getProductImage(product);

  const discountPercent = getDiscountPercentage(product, userType);

  const handleShopNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);

    const categoryName = product?.category?.name;

    if (!categoryName) return;

    router.push(`/products/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <motion.article
      onMouseMove={bannerMove}
      onMouseLeave={bannerLeave}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.65,
        delay: 0.08 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        group
        relative
        flex
        min-w-0
        h-[220px]
        w-full
        overflow-hidden
        rounded-[18px]
        border
        border-black/[0.06]
        bg-[#eef2f4]
        shadow-[0_10px_35px_rgba(7,26,65,0.08)]
        transition-shadow
        duration-500
        hover:shadow-[0_18px_45px_rgba(7,26,65,0.14)]
        sm:h-[235px]
        md:h-[255px]
        lg:h-[275px]
        xl:h-[295px]
        [transform-style:preserve-3d]
      "
    >
      {/* Image side: keeps the banner card horizontal instead of full-bleed. */}
      <div className="absolute inset-y-0 right-0 w-[47%] overflow-hidden sm:w-[48%] md:w-[50%]">
        <div
          ref={parallaxRef}
          className={`${m.pxFrame} absolute -inset-y-[4%] left-0 right-[-5%] h-[108%]`}
        >
          <img
            src={productImage}
            alt={product?.name || "Product"}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder-promo.jpg";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f4] via-[#eef2f4]/15 to-transparent" />
      </div>

      {/* Content side */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/95 to-transparent opacity-[0.04]" />

      <div
        className="
          relative
          z-10
          flex
          h-full
          w-[58%]
          min-w-0
          flex-col
          justify-center
          px-4
          py-5
          sm:w-[56%]
          sm:px-5
          sm:py-6
          md:w-[54%]
          md:px-6
          lg:px-7
          xl:px-8
        "
      >
        <motion.p
          initial={{ opacity: 0, y: 7 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.16 + index * 0.07,
            duration: 0.45,
          }}
          className="
            font-serif
            text-[9px]
            font-medium
            italic
            tracking-[0.08em]
            text-[#6d7378]
            sm:text-[10px]
            md:text-[11px]
          "
        >
          Today's Best Deal
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.24 + index * 0.07,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-1.5
            max-w-full
            break-words
            font-serif
            text-[20px]
            font-medium
            leading-[1.08]
            tracking-[-0.025em]
            text-[#111827]
            sm:text-[23px]
            md:text-[26px]
            lg:text-[29px]
            xl:text-[32px]
          "
        >
          {product?.category?.name || product?.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.31 + index * 0.07,
            duration: 0.45,
          }}
          className="
            mt-1.5
            font-serif
            text-[12px]
            font-medium
            text-[#4b5563]
            sm:text-[13px]
            md:text-[14px]
            lg:text-[15px]
          "
        >
          {discountPercent > 0
            ? `Up to ${discountPercent}% Off!`
            : "Special Offer"}
        </motion.p>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.42 + index * 0.07,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={handleShopNow}
          className="
            mt-4
            inline-flex
            h-9
            w-fit
            items-center
            justify-center
            gap-1.5
            rounded-full
            bg-[#111827]
            px-4
            text-[10px]
            font-semibold
            text-white
            shadow-[0_8px_22px_rgba(17,24,39,0.16)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-[#071A41]
            sm:mt-5
            sm:h-10
            sm:px-4
            sm:text-[11px]
            md:h-11
            md:px-5
            md:text-[12px]
          "
        >
          <span>Shop now</span>
          <ArrowRight size={15} strokeWidth={2} />
        </motion.button>
      </div>

      <div
        data-spot
        className={index === 0 ? m.spot : `${m.spot} ${m.spotGold}`}
      />
    </motion.article>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({ category, index, router }: any) {
  const categoryTitle = category?.title || category?.name || "Category";

  const categoryImage =
    category?.image ||
    category?.image_url ||
    category?.banner ||
    "/images/placeholder.png";

  return (
    <motion.div
      key={category.id || `${categoryTitle}-${index}`}
      initial={{
        opacity: 0,
        y: 34,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: false,
        amount: 0.16,
      }}
      whileHover={{
        y: -6,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={{
        duration: 0.65,
        delay: Math.min(index * 0.07, 0.56),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() =>
        router.push(`/products/?category=${encodeURIComponent(categoryTitle)}`)
      }
      className="
        group
        w-[clamp(94px,24vw,150px)]
        shrink-0
        cursor-pointer
        text-center
        sm:w-[145px]
        md:w-[165px]
        lg:w-[185px]
        xl:w-[205px]
      "
    >
      <div
        className="
          relative
          aspect-[4/5]
          w-full
          overflow-hidden
          rounded-[14px]
          bg-[#f3f3f3]
          shadow-[0_1px_3px_rgba(0,0,0,0.04)]
          ring-1
          ring-black/[0.045]
          transition-all
          duration-500
          group-hover:shadow-[0_16px_34px_rgba(0,0,0,0.12)]
        "
      >
        <motion.img
          src={categoryImage}
          alt={categoryTitle}
          loading={index < 5 ? "eager" : "lazy"}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
          "
          whileHover={{
            scale: 1.075,
          }}
          transition={{
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileHover={{
            opacity: 1,
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-[#071A41]/35
            via-transparent
            to-white/5
          "
        />

        <motion.div
          initial={{
            x: "-130%",
            opacity: 0,
          }}
          whileHover={{
            x: "130%",
            opacity: 1,
          }}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            w-1/3
            -skew-x-12
            bg-gradient-to-r
            from-transparent
            via-white/25
            to-transparent
          "
        />

        <motion.div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-[2px]
            -translate-x-1/2
            bg-white
          "
          initial={{
            width: 0,
            opacity: 0,
          }}
          whileHover={{
            width: "34%",
            opacity: 1,
          }}
        />
      </div>

      <motion.h3
        className="
          mt-2
          truncate
          text-center
          text-[11px]
          font-semibold
          leading-5
          tracking-[-0.01em]
          text-[#202020]
          sm:mt-3
          sm:text-[13px]
          md:text-[14px]
          lg:text-[15px]
        "
      >
        {categoryTitle}
      </motion.h3>
    </motion.div>
  );
}

/* =========================================================
   BRAND CARD
========================================================= */

function BrandCard({ brand, router }: any) {
  const image = brand?.banner || brand?.logo || "/images/placeholder.png";

  const brandName = brand?.title || "Brand";
  const discount = Number(brand?.discount_percentage || 0);

  const handleBrandClick = () => {
    if (!brand?.id) return;
    router.push(`/products/?brand_ids=${encodeURIComponent(brand.id)}`);
  };

  return (
    <div
      onClick={handleBrandClick}
      className="
        group
        relative
        h-[260px]
        w-[170px]
        shrink-0
        cursor-pointer
        snap-start
        overflow-hidden
        rounded-[10px]
        bg-[#111111]
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        ring-1
        ring-black/[0.045]
        transition-all
        duration-500
        hover:shadow-[0_16px_34px_rgba(0,0,0,0.12)]
        sm:h-[320px]
        sm:w-[215px]
        md:h-[360px]
        md:w-[240px]
        lg:h-[400px]
        lg:w-[265px]
        xl:h-[430px]
        xl:w-[285px]
      "
    >
      <img
        src={image}
        alt={brandName}
        loading="lazy"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-transform
          duration-700
          ease-out
          group-hover:scale-[1.06]
        "
        onError={(e) => {
          e.currentTarget.src = "/images/placeholder.png";
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {discount > 0 && (
        <div
          className="
            absolute
            right-3
            top-3
            z-20
            rounded-full
            bg-white/95
            px-2.5
            py-1
            text-[9px]
            font-bold
            text-[#111111]
            shadow-lg
            sm:right-4
            sm:top-4
            sm:px-3
            sm:py-1.5
            sm:text-[11px]
          "
        >
          {discount}% OFF
        </div>
      )}

      <div
        className="
          relative
          z-10
          flex
          h-full
          flex-col
          items-center
          px-4
          pt-6
          sm:px-5
          sm:pt-8
        "
      >
        <h3
          className="
            text-lg
            font-semibold
            text-white
            drop-shadow-lg
            sm:text-xl
            md:text-2xl
          "
        >
          {brandName}
        </h3>

        {brand?.product_count && (
          <p className="mt-1 text-[10px] text-white/70 sm:text-sm">
            {brand.product_count} Products
          </p>
        )}
      </div>

      <div
        className="
          absolute
          bottom-5
          left-0
          right-0
          z-20
          flex
          justify-center
          px-4
          sm:bottom-8
          sm:px-5
        "
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrandClick();
          }}
          className="
            w-full
            max-w-[175px]
            rounded-[8px]
            bg-white
            px-5
            py-2.5
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-[#111111]
            shadow-lg
            transition-all
            duration-300
            hover:bg-[#111111]
            hover:text-white
            hover:shadow-xl
            sm:py-3
            sm:text-[12px]
          "
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}
/* =========================================================
   RESPONSIVE PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index = 0,
  router,
  userType,
  wish,
  handleToggleWishlist,
  imageIndex = 0,
  images = [],
  onMouseEnter,
  onMouseLeave,
  onDotClick,
  label,
  labelClassName,
}: any) {
  const price = getProductPrice(product, userType);

  const mrp = getProductMrp(product, userType);

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const rating =
    product?.reviews?.average_rating ??
    product?.reviews_summary?.average_rating ??
    product?.rating ??
    0;

  const reviews =
    product?.reviews?.total_reviews ??
    product?.reviews_summary?.total_reviews ??
    product?.review_count ??
    0;

  const brand = product?.brand?.name || "Brand";

  const currentImage =
    images.length > 0
      ? images[imageIndex]?.image_url || images[0]?.image_url
      : getProductImage(product);

  const isWishlisted = wish?.[product?.id] || false;

  const openProduct = () => {
    if (!product?.slug) return;

    router.push(`/product/${product.slug}/`);
  };

  return (
    <div
      className="
        flex
        h-[315px]
        w-[160px]
        shrink-0
        snap-start
        flex-col
        sm:h-[340px]
        sm:w-[180px]
        md:h-[360px]
        md:w-[195px]
        lg:h-[370px]
        lg:w-[205px]
        xl:w-[210px]
      "
    >
      <div
        onMouseEnter={
          images.length > 1
            ? () => onMouseEnter?.(product?.id, images.length)
            : undefined
        }
        onMouseLeave={
          images.length > 1 ? () => onMouseLeave?.(product?.id) : undefined
        }
        className="
          relative
          h-[175px]
          shrink-0
          overflow-hidden
          rounded-[8px]
          bg-[#f4f3ee]
          sm:h-[205px]
          md:h-[225px]
          lg:h-[240px]
          xl:h-[250px]
        "
      >
        <img
          src={currentImage || "/images/placeholder.png"}
          alt={product?.name || "Product"}
          loading={index < 4 ? "eager" : "lazy"}
          className="
            h-full
            w-full
            cursor-pointer
            object-cover
            p-1
            transition-transform
            duration-500
            hover:scale-105
          "
          onClick={openProduct}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />

        {label && (
          <div className="absolute left-2 top-2 z-10">
            <span
              className={`
                inline-flex
                rounded-full
                px-2
                py-1
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.12em]
                shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                sm:px-2.5
                sm:text-[8px]
                ${labelClassName || "bg-white text-[#111111]"}
              `}
            >
              {label}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-white
                px-2
                py-1
                text-[7px]
                font-semibold
                text-[#111111]
                shadow-[0_3px_10px_rgba(0,0,0,0.10)]
                sm:text-[8px]
              "
            >
              <span className="font-bold">%</span>
              {discount}% OFF
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={`Add ${product?.name || "product"} to wishlist`}
          onClick={(e) => handleToggleWishlist(product?.id, product?.name, e)}
          className="
            absolute
            right-2
            top-2
            z-20
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#111111]
            shadow-[0_2px_8px_rgba(0,0,0,0.12)]
            transition
            hover:bg-[#111111]
            hover:text-white
          "
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

        {images.length > 1 && (
          <div
            className="
              absolute
              bottom-2
              left-1/2
              z-20
              flex
              -translate-x-1/2
              gap-1.5
            "
          >
            {images.map((_: any, dotIndex: number) => (
              <button
                key={dotIndex}
                type="button"
                onClick={(e) => onDotClick?.(product?.id, dotIndex, e)}
                aria-label={`View image ${dotIndex + 1}`}
                className={`
                    h-1.5
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      imageIndex === dotIndex
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/60"
                    }
                  `}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-1.5">
        <div className="flex h-[18px] items-center gap-1">
          <span className="text-[10px] font-semibold text-[#111111] sm:text-[11px]">
            {Number(rating).toFixed(1)}
          </span>

          <span className="text-[10px] text-[#111111] sm:text-[11px]">★</span>

          <span className="text-[9px] text-[#999999] sm:text-[10px]">
            |{reviews}
          </span>
        </div>

        <p
          onClick={openProduct}
          className="
            line-clamp-2
            cursor-pointer
            text-[11px]
            font-semibold
            leading-[1.3]
            text-[#111111]
            sm:text-[12px]
            md:text-[13px]
          "
        >
          {brand} | {product?.category?.name || product?.name || "Product"}
        </p>

        <p className="mt-[1px] line-clamp-1 text-[10px] text-[#777777] sm:text-[11px]">
          {product?.name || "Product"}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#111111] sm:text-[12px] md:text-[13px]">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {mrp > price && (
            <span className="text-[9px] text-[#999999] line-through sm:text-[10px]">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span className="text-[9px] font-medium text-[#1a8a3f] sm:text-[10px]">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT RAIL
========================================================= */

function ProductRail({
  products = [],
  userType,
  wish,
  router,
  handleToggleWishlist,
  isLoading,
  isError,
  emptyText = "No products available",
  retry,
  labelMode = "trending",
  imagesEnabled = false,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [imageIndices, setImageIndices] = useState<
    Record<string | number, number>
  >({});

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;

    if (!el) return;

    const amount = direction === "left" ? -300 : 300;

    el.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  const handleDotClick = (
    productId: string | number,
    index: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    setImageIndices((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  const handleMouseEnter = (
    productId: string | number,
    imageLength: number,
  ) => {
    if (!imagesEnabled) return;

    if (imageLength <= 1) return;

    setImageIndices((prev) => {
      const current = prev[productId] || 0;

      return {
        ...prev,
        [productId]: (current + 1) % imageLength,
      };
    });
  };

  const handleMouseLeave = (productId: string | number) => {
    if (!imagesEnabled) return;

    setImageIndices((prev) => ({
      ...prev,
      [productId]: 0,
    }));
  };

  if (isLoading) {
    return (
      <div
        className="
          flex
          gap-3
          overflow-x-auto
          pb-3
          sm:gap-4
          md:gap-5
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-[315px]
              w-[160px]
              shrink-0
              animate-pulse
              rounded-[8px]
              bg-[#e8e6e1]
              sm:h-[340px]
              sm:w-[180px]
              md:h-[360px]
              md:w-[195px]
              lg:h-[370px]
              lg:w-[205px]
              xl:w-[210px]
            "
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <button
          type="button"
          onClick={retry}
          className="
            rounded-full
            bg-[#111111]
            px-6
            py-2.5
            text-[11px]
            font-medium
            text-white
            transition
            hover:bg-[#292929]
            sm:text-[12px]
          "
        >
          Retry
        </button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <p className="text-center text-[12px] font-medium text-[#777777] sm:text-[13px]">
          {emptyText}
        </p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, 12);

  return (
    <div className="relative isolate flow-root w-full">
      {visibleProducts.length > 3 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scroll("left")}
            className="
              absolute
              left-0
              top-[95px]
              z-20
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-[#e8e8e8]
              bg-white
              text-[#111111]
              shadow-[0_6px_20px_rgba(0,0,0,0.10)]
              transition
              hover:scale-105
              hover:bg-[#111111]
              hover:text-white
              lg:flex
            "
          >
            <ChevronLeft size={19} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            aria-label="Next"
            onClick={() => scroll("right")}
            className="
              absolute
              right-0
              top-[95px]
              z-20
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-[#e8e8e8]
              bg-white
              text-[#111111]
              shadow-[0_6px_20px_rgba(0,0,0,0.10)]
              transition
              hover:scale-105
              hover:bg-[#111111]
              hover:text-white
              lg:flex
            "
          >
            <ChevronRight size={19} strokeWidth={1.7} />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="
          flex
          items-stretch
          gap-3
          overflow-x-auto
          scroll-smooth
          px-1
          pb-3
          sm:gap-4
          sm:px-8
          md:gap-5
          md:px-10
          lg:px-12
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {visibleProducts.map((product: any, index: number) => {
          const images = Array.isArray(product?.images) ? product.images : [];

          const imageIndex = imageIndices[product?.id] || 0;

          let label = "Featured";

          if (labelMode === "trending") {
            label = index === 0 ? "Popular" : index === 1 ? "New" : "Featured";
          }

          if (labelMode === "offers") {
            label = index === 0 ? "Best Offer" : "Special Deal";
          }

          if (labelMode === "best-seller") {
            label = "Best Seller";
          }

          return (
            <ProductCard
              key={product?.id || index}
              product={product}
              index={index}
              router={router}
              userType={userType}
              wish={wish}
              handleToggleWishlist={handleToggleWishlist}
              images={imagesEnabled ? images : []}
              imageIndex={imageIndex}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onDotClick={handleDotClick}
              label={label}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   LIFESTYLE BANNER
========================================================= */

function LifestyleBanner({ apiResponse, router, parallaxRef }: any) {
  const content = apiResponse?.data?.find(
    (item: any) => item.slug === "home-page-second-banner",
  );

  const block = content?.blocks?.[0];

  const image =
    block?.images?.find((item: any) => item?.is_primary)?.url ||
    block?.images?.[0]?.url ||
    "/indiekonnect-web/images/prod.png";

  return (
    <section className="relative isolate flow-root w-full overflow-hidden bg-[#11101f]">
      {/* =====================================================
          BANNER FRAME
          Wrapped in the same max-width container used by
          every other homepage section so the inner text and
          CTA line up with the rest of the page.
      ===================================================== */}
      <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-5 md:px-7 lg:px-8 xl:px-10">
        <div
          className="
            relative
            h-[320px]
            w-full
            overflow-hidden
            rounded-[10px]
            sm:h-[360px]
            md:h-[390px]
            lg:h-[410px]
            xl:h-[420px]
          "
        >
          <div
            ref={parallaxRef}
            className={`${m.pxFrame} absolute inset-0 h-full w-full`}
          >
            <img
              src={image}
              alt={
                block?.images?.find((item: any) => item?.is_primary)
                  ?.alt_text ||
                content?.title ||
                "Premium Lifestyle"
              }
              className="
                h-full
                w-full
                object-cover
                object-center
              "
              onError={(e) => {
                e.currentTarget.src = "/indiekonnect-web/images/prod.png";
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#11101f]/95 via-[#11101f]/70 to-transparent" />

          <div className="relative z-10 flex h-full items-center">
            <div
              className="
                w-full
                px-5
                sm:px-8
                md:px-10
                lg:px-12
              "
            >
              {block?.heading && (
                <div
                  className="
                    mb-3
                    max-w-[90%]
                    text-[10px]
                    font-medium
                    tracking-wide
                    text-white/85
                    sm:text-[12px]
                  "
                  dangerouslySetInnerHTML={{
                    __html: block.heading,
                  }}
                />
              )}

              {block?.short_description && (
                <div
                  className="
                    max-w-[530px]
                    text-white
                    [&>h1]:m-0
                    [&>h2]:m-0
                    [&>h3]:m-0
                    [&>p]:m-0

                    [&>h1]:text-[24px]
                    [&>h2]:text-[24px]
                    [&>h3]:text-[24px]
                    [&>p]:text-[24px]

                    [&>h1]:font-semibold
                    [&>h2]:font-semibold
                    [&>h3]:font-semibold
                    [&>p]:font-semibold

                    [&>h1]:leading-[1.08]
                    [&>h2]:leading-[1.08]
                    [&>h3]:leading-[1.08]
                    [&>p]:leading-[1.08]

                    sm:[&>h1]:text-[30px]
                    sm:[&>h2]:text-[30px]
                    sm:[&>h3]:text-[30px]
                    sm:[&>p]:text-[30px]

                    md:[&>h1]:text-[36px]
                    md:[&>h2]:text-[36px]
                    md:[&>h3]:text-[36px]
                    md:[&>p]:text-[36px]

                    lg:[&>h1]:text-[44px]
                    lg:[&>h2]:text-[44px]
                    lg:[&>h3]:text-[44px]
                    lg:[&>p]:text-[44px]

                    xl:[&>h1]:text-[50px]
                    xl:[&>h2]:text-[50px]
                    xl:[&>h3]:text-[50px]
                    xl:[&>p]:text-[50px]
                  "
                  dangerouslySetInnerHTML={{
                    __html: block.short_description,
                  }}
                />
              )}

              <button
                type="button"
                onClick={(e) => {
                  ripple(e);
                  router.push("/products");
                }}
                className="
                  mt-5
                  inline-flex
                  h-[42px]
                  items-center
                  gap-2
                  rounded-[9px]
                  bg-white
                  px-5
                  text-[11px]
                  font-semibold
                  text-[#171717]
                  shadow-[0_8px_25px_rgba(0,0,0,0.18)]
                  transition
                  hover:bg-[#f2f2f2]
                  sm:mt-6
                  sm:h-[46px]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                Explore All Products
                <span className="text-[16px]">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN HOME
========================================================= */

export default function IndieKonnectHome() {
  const router = useRouter();

  const { data: userProfile } = useGetUserProfileQuery({});

  const userType = userProfile?.user?.account_type || "customer";

  const [wish, setWish] = useState<Record<string | number, boolean>>({});

  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

  const [cartItems, setCartItems] = useState<any[]>([]);

  const [cartTotal, setCartTotal] = useState(0);

  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const dealParallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  const lifestyleParallaxRef = useRef<HTMLDivElement | null>(null);

  const { data: apiResponse, isLoading, error } = useGetContentsQuery({});

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategoriesQuery({});

  const { data: dealProductResponse } = useGetDealOfTheDayProductsQuery();

  const {
    data: reelsData,
    isLoading: isReelsLoading,
    error: reelsError,
  } = useGetReelsQuery({});

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

  const { data: brandsData, isLoading: isBrandsLoading } = useGetBrandsQuery(
    {},
  );

  const { data: growthStepsData } = useGetGrowthStepsQuery();

  const [addToCartMutation] = useAddToCartMutation();

  const [updateCartItemMutation, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();

  const [addToWishlistMutation] = useAddToWishlistMutation();

  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();

  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    {},
  );

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const dealProducts = useMemo(() => {
    if (Array.isArray(dealProductResponse)) {
      return dealProductResponse;
    }

    if (Array.isArray(dealProductResponse?.data)) {
      return dealProductResponse.data;
    }

    return [];
  }, [dealProductResponse]);

  const products = productsResponse?.data || [];

  const bestSellers = productSections?.data?.best_sellers?.products || [];

  const bestOffers = productSections?.data?.best_offers?.products || [];

  const categories = useMemo(() => {
    if (!categoriesData) return [];

    const rawData = categoriesData.data || categoriesData;

    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.filter((category: any) => category?.status === "active");
  }, [categoriesData]);

  /* =======================================================
     REEL MODAL
  ======================================================= */

  const handleReelModalOpen = useCallback(() => {
    setIsReelModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const handleReelModalClose = useCallback(() => {
    setIsReelModalOpen(false);
    document.body.style.overflow = "";
  }, []);

  /* =======================================================
     PARALLAX
  ======================================================= */

  useEffect(() => {
    if (!dealProducts?.length) {
      return;
    }

    const cleanups: Array<() => void> = [];

    dealParallaxRefs.current.forEach((el, index) => {
      if (!el) return;

      const amount = index === 0 ? 26 : 38;

      const handleScroll = () => {
        const rect = el.getBoundingClientRect();

        const progress = 1 - rect.top / window.innerHeight;

        const offset = Math.max(0, Math.min(progress, 1)) * amount;

        el.style.transform = `translateY(${offset}px)`;
      };

      requestAnimationFrame(handleScroll);

      window.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      cleanups.push(() => window.removeEventListener("scroll", handleScroll));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [dealProducts]);

  useEffect(() => {
    const el = lifestyleParallaxRef.current;

    if (!el || !apiResponse) {
      return;
    }

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();

      const progress = 1 - rect.top / window.innerHeight;

      const offset = Math.max(0, Math.min(progress, 1)) * 46;

      el.style.transform = `translateY(${offset}px)`;
    };

    requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [apiResponse]);

  /* =======================================================
     WISHLIST SYNC
  ======================================================= */

  useEffect(() => {
    if (!wishlistData?.data) {
      return;
    }

    const state: Record<string | number, boolean> = {};

    wishlistData.data.forEach((item: any) => {
      if (item?.product_id) {
        state[item.product_id] = true;
      }
    });

    setWish(state);
  }, [wishlistData]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showCustomToast = (
    type: "success" | "error" | "info",
    message: string,
    productName?: string,
  ) => {
    let container = document.getElementById("toast-container");

    if (!container) {
      container = document.createElement("div");

      container.id = "toast-container";

      container.style.cssText = `
        position:fixed;
        top:20px;
        right:16px;
        z-index:99999;
        display:flex;
        flex-direction:column;
        gap:10px;
        max-width:420px;
        width:calc(100% - 32px);
        pointer-events:none;
      `;

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    const colors = {
      success: "#4BBF8A",
      error: "#FF4757",
      info: "#C9A96E",
    };

    const icons = {
      success: "✓",
      error: "✕",
      info: "ℹ",
    };

    toast.style.cssText = `
      background:rgba(255,255,255,.95);
      backdrop-filter:blur(20px);
      color:#1a1a1a;
      padding:14px 16px;
      border-radius:14px;
      border-left:4px solid ${colors[type]};
      box-shadow:0 15px 50px rgba(0,0,0,.15);
      animation:slideInRight .45s cubic-bezier(.16,1,.3,1) forwards;
      pointer-events:auto;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    `;

    toast.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div style="
          width:30px;
          height:30px;
          border-radius:50%;
          background:${colors[type]}15;
          display:flex;
          align-items:center;
          justify-content:center;
          color:${colors[type]};
          font-size:15px;
          font-weight:bold;
          flex-shrink:0;
        ">
          ${icons[type]}
        </div>

        <div style="flex:1;min-width:0;">
          ${
            productName
              ? `
              <div style="
                font-size:13px;
                font-weight:600;
                margin-bottom:2px;
              ">
                ${productName}
              </div>
            `
              : ""
          }

          <div style="
            font-size:12px;
            color:#4a4a4a;
            line-height:1.4;
          ">
            ${message}
          </div>
        </div>

        <button
          class="toast-close-btn"
          style="
            background:none;
            border:none;
            color:#999;
            font-size:18px;
            cursor:pointer;
          "
        >
          ×
        </button>
      </div>
    `;

    container.appendChild(toast);

    const removeToast = () => {
      toast.style.animation =
        "slideOutRight .35s cubic-bezier(.16,1,.3,1) forwards";

      setTimeout(() => {
        toast.remove();

        if (container && !container.children.length) {
          container.remove();
        }
      }, 350);
    };

    toast
      .querySelector(".toast-close-btn")
      ?.addEventListener("click", removeToast);

    if (!document.getElementById("toast-styles")) {
      const style = document.createElement("style");

      style.id = "toast-styles";

      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity:0;
            transform:translateX(100%);
          }
          to {
            opacity:1;
            transform:translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity:1;
            transform:translateX(0);
          }
          to {
            opacity:0;
            transform:translateX(100%);
          }
        }
      `;

      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (toast.parentNode) {
        removeToast();
      }
    }, 4000);
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

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
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
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
      }
    } catch (error: any) {
      showCustomToast(
        "error",
        error?.data?.message || error?.message || "Failed to add item to cart",
        productName,
      );
    }
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

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
          setWish((current) => ({
            ...current,
            [productId]: false,
          }));

          showCustomToast(
            "success",
            "Removed from your wishlist ❤️",
            productName,
          );

          refetchWishlist();
        }

        return;
      }

      const response = await addToWishlistMutation({
        product_id: productId,
      }).unwrap();

      const message = response?.message?.toLowerCase?.() || "";

      if (
        response?.already_exists ||
        (message.includes("already") && message.includes("wishlist"))
      ) {
        setWish((current) => ({
          ...current,
          [productId]: true,
        }));

        showCustomToast("info", "Already in your wishlist ❤️", productName);

        refetchWishlist();

        return;
      }

      if (response?.message || response?.data || response?.success === true) {
        setWish((current) => ({
          ...current,
          [productId]: true,
        }));

        showCustomToast("success", "Added to wishlist! ❤️", productName);

        refetchWishlist();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "";

      showCustomToast(
        "error",
        errorMessage || "Failed to update wishlist",
        productName,
      );
    }
  };

  /* =======================================================
     CART UPDATE
  ======================================================= */

  const handleUpdateCart = async (
    itemId: number,
    productId: number,
    action: "increment" | "decrement",
  ) => {
    const currentItem = cartItems.find((item) => item.product_id === productId);

    if (!currentItem) return;

    if (action === "decrement" && currentItem.quantity <= 1) {
      return;
    }

    try {
      await updateCartItemMutation({
        itemId,
        data: {
          product_id: productId,
          quantity: 1,
          action,
        },
      }).unwrap();

      const change = action === "increment" ? 1 : -1;

      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item,
        ),
      );

      setCartTotal((prev) => Math.max(0, prev + currentItem.price * change));
    } catch (error: any) {
      showCustomToast(
        "error",
        error?.data?.message || error?.message || "Failed to update cart",
      );
    }
  };

  /* =======================================================
     HERO
  ======================================================= */

  const homeContent = apiResponse?.data?.find(
    (item: any) => item?.slug === "home" || item?.title === "Home",
  );

  const stripHtml = (html: string) =>
    html ? html.replace(/<[^>]*>/g, "").trim() : "";

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

        if (!img?.url) {
          return null;
        }

        return {
          id: block?.id ?? idx,
          image: img.url,
          alt: img.alt_text || homeContent?.title || "IndieKonnect banner",
          heading: block?.heading ? stripHtml(block.heading) : "",
          navigationUrl: block?.navigation_url || block?.cta_url || "/products",
        };
      })
      .filter(Boolean);

    if (slides.length) {
      return slides;
    }

    return [
      {
        id: "fallback",
        image: FALLBACK_HERO_IMAGE,
        alt: "IndieKonnect",
        heading: "Elevate Your Style",
        navigationUrl: "/products",
      },
    ];
  }, [homeContent]);

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (heroIndex >= heroSlides.length) {
      setHeroIndex(0);
    }
  }, [heroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[heroIndex] || heroSlides[0];

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    // Root: forced to a single column flow so nothing can sit
    // side-by-side by mistake, and isolate + flow-root so any
    // stray position:absolute/float from a child component can
    // never escape upward and shift the whole page sideways.
    <div
      className={`${s.page} isolate relative flex w-full min-w-0 flex-col overflow-x-hidden bg-white`}
    >
      <Header />

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative isolate flow-root w-full overflow-hidden bg-white">
        <div
          className="
            relative
            h-[180px]
            w-full
            sm:h-[260px]
            md:h-[340px]
            lg:h-[430px]
            xl:h-[600px]
          "
        >
          <AnimatePresence initial={false}>
            {heroSlides.map((slide: any, index: number) => {
              const total = heroSlides.length;

              let diff = index - heroIndex;

              if (diff > total / 2) {
                diff -= total;
              }

              if (diff < -total / 2) {
                diff += total;
              }

              const isActive = diff === 0;

              const isNearby = Math.abs(diff) <= 1;

              if (!isNearby) {
                return null;
              }

              return (
                <motion.div
                  key={slide.id}
                  initial={{
                    opacity: 0,
                    x: diff > 0 ? "100%" : "-100%",
                  }}
                  animate={{
                    opacity: 1,
                    x: "0%",
                  }}
                  exit={{
                    opacity: 0,
                    x: diff > 0 ? "-100%" : "100%",
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
                        setHeroIndex((heroIndex - 1 + total) % total);
                        return;
                      }

                      if (diff === 1) {
                        setHeroIndex((heroIndex + 1) % total);
                        return;
                      }

                      router.push(slide.navigationUrl || "/products");
                    }}
                    className="
                        group
                        relative
                        block
                        h-full
                        w-full
                        overflow-hidden
                        bg-[#edf1ee]
                        focus:outline-none
                      "
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      draggable={false}
                      loading={isActive ? "eager" : "lazy"}
                      className="
                          block
                          h-full
                          w-full
                          select-none
                          object-cover
                          object-center
                          transition-transform
                          duration-700
                          group-hover:scale-[1.008]
                        "
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder-promo.jpg";
                      }}
                    />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() =>
                  setHeroIndex(
                    (heroIndex - 1 + heroSlides.length) % heroSlides.length,
                  )
                }
                className="
                  absolute
                  left-2
                  top-1/2
                  z-30
                  hidden
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/95
                  text-[#111827]
                  shadow
                  lg:flex
                  xl:left-5
                "
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                aria-label="Next banner"
                onClick={() =>
                  setHeroIndex((heroIndex + 1) % heroSlides.length)
                }
                className="
                  absolute
                  right-2
                  top-1/2
                  z-30
                  hidden
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/95
                  text-[#111827]
                  shadow
                  lg:flex
                  xl:right-5
                "
              >
                <ChevronRight size={17} />
              </button>
            </>
          )}
        </div>

        {heroSlides.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2 sm:py-3">
            {heroSlides.map((slide: any, index: number) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setHeroIndex(index)}
                className={`
                    h-[5px]
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index === heroIndex
                        ? "w-7 bg-[#071a41]"
                        : "w-[5px] bg-[#cfd3d7]"
                    }
                  `}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===================================================
          MAIN
          Every direct child below is wrapped in its own
          relative + isolate + flow-root container. This makes
          each section its own independent containing block,
          so nothing from HeroBannerCarousel / ShopReelsRow /
          WatchesBanner / ReviewCarousel / etc. can be
          absolutely positioned against a distant ancestor and
          appear shifted to the right of the page.
      =================================================== */}

      <div className="relative isolate flex w-full min-w-0 flex-col overflow-hidden bg-white">
        {/* =================================================
            CATEGORY
        ================================================= */}

        <motion.section
          className="
            relative
            isolate
            flow-root
            w-full
            bg-white
            py-8
            sm:py-10
            md:py-12
            lg:py-14
          "
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: false,
            amount: 0.12,
          }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="
                mb-6
                flex
                flex-col
                items-center
                text-center
                sm:mb-8
              "
            >
              <motion.h2
                variants={fadeInUp}
                className="
                  font-serif
                  text-[25px]
                  font-medium
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-[#101827]
                  sm:text-[30px]
                  md:text-[32px]
                "
              >
                Shop by Category
              </motion.h2>

              <motion.div
                variants={fadeIn}
                className="mt-3 h-px w-10 bg-[#071A41]/20"
              />
            </motion.div>

            <div className="relative w-full">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("category-scroll")?.scrollBy({
                    left: -280,
                    behavior: "smooth",
                  })
                }
                className="
                  absolute
                  left-1
                  top-1/2
                  z-30
                  hidden
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#e8e8e8]
                  bg-white
                  shadow-lg
                  sm:flex
                "
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() =>
                  document.getElementById("category-scroll")?.scrollBy({
                    left: 280,
                    behavior: "smooth",
                  })
                }
                className="
                  absolute
                  right-1
                  top-1/2
                  z-30
                  hidden
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#e8e8e8]
                  bg-white
                  shadow-lg
                  sm:flex
                "
              >
                <ChevronRight size={17} />
              </button>

              <div
                id="category-scroll"
                className="
                  flex
                  w-full
                  overflow-x-auto
                  scroll-smooth
                  px-0
                  pb-3
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div
                  className="
                    flex
                    w-max
                    min-w-full
                    items-start
                    justify-start
                    gap-2.5
                    sm:justify-center
                    sm:gap-4
                    md:gap-5
                    lg:gap-5
                  "
                >
                  {isCategoriesLoading &&
                    [1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="
                            w-[120px]
                            shrink-0
                            sm:w-[145px]
                            md:w-[165px]
                            lg:w-[190px]
                            xl:w-[220px]
                          "
                      >
                        <div className="aspect-[4/5] w-full animate-pulse rounded-[14px] bg-[#e8e6e1]" />
                        <div className="mx-auto mt-3 h-4 w-3/4 animate-pulse rounded-full bg-[#e8e6e1]" />
                      </div>
                    ))}

                  {!isCategoriesLoading && isCategoriesError && (
                    <div className="flex min-h-[180px] min-w-full items-center justify-center">
                      <p className="text-[12px] text-[#777777]">
                        Unable to load categories.
                      </p>
                    </div>
                  )}

                  {!isCategoriesLoading &&
                    !isCategoriesError &&
                    categories.length === 0 && (
                      <div className="flex min-h-[180px] min-w-full items-center justify-center">
                        <p className="text-[12px] text-[#777777]">
                          No categories available
                        </p>
                      </div>
                    )}

                  {!isCategoriesLoading &&
                    categories.length > 0 &&
                    categories.map((category: any, index: number) => (
                      <CategoryCard
                        key={category.id || index}
                        category={category}
                        index={index}
                        router={router}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* HERO BANNER COMPONENT
            Wrapped so that if this component internally uses
            position:absolute, it stays contained here instead
            of escaping to the right of the page. */}
        <div className="relative isolate flow-root w-full">
          <HeroBannerCarousel />
        </div>

        {/* =================================================
            REELS
        ================================================= */}

        <div className="relative isolate flow-root w-full">
          <ShopReelsRow
            reels={reelsData?.data || []}
            isLoading={isReelsLoading}
            error={reelsError}
            openReel={() => setIsReelModalOpen(true)}
            onModalOpen={handleReelModalOpen}
            onModalClose={handleReelModalClose}
          />
        </div>

        {/* =================================================
            TRENDING
        ================================================= */}

        <section className="relative isolate flow-root w-full overflow-hidden bg-white py-8 sm:py-10 md:py-12">
          <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <div className="mb-5 flex flex-col items-center text-center sm:mb-7">
              <span className="mb-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Most Loved
              </span>

              <h2 className="font-serif text-[25px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[32px] lg:text-[40px]">
                Trending Products
              </h2>
            </div>

            <ProductRail
              products={products}
              userType={userType}
              wish={wish}
              router={router}
              handleToggleWishlist={handleToggleWishlist}
              isLoading={isProductsLoading}
              isError={isProductsError}
              retry={refetchProducts}
              emptyText="No products available"
              labelMode="trending"
              imagesEnabled={true}
            />
          </div>
        </section>

        {/* =================================================
            WATCH BANNER
        ================================================= */}

        <div className="relative isolate flow-root w-full">
          <WatchesBanner />
        </div>

        {/* =================================================
            BEST OFFERS
        ================================================= */}

        <motion.section
          className="
            relative
            isolate
            flow-root
            w-full
            overflow-hidden
            bg-white
            py-8
            sm:py-10
            lg:py-12
          "
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-5 flex flex-col items-center text-center sm:mb-7"
            >
              <span className="mb-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Special Deals
              </span>

              <h2 className="font-serif text-[25px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[32px] lg:text-[40px]">
                Best Offers
              </h2>
            </motion.div>

            <ProductRail
              products={bestOffers}
              userType={userType}
              wish={wish}
              router={router}
              handleToggleWishlist={handleToggleWishlist}
              isLoading={isFetching}
              isError={isError}
              emptyText="No offers available"
              labelMode="offers"
              imagesEnabled={true}
            />
          </div>
        </motion.section>

        {/* =================================================
            DEAL BANNERS
        ================================================= */}

        <section className="relative isolate flow-root mb-10 w-full overflow-hidden bg-white sm:mb-14 lg:mb-18">
          <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-5 xl:gap-6">
              {dealProducts?.length > 0 ? (
                dealProducts.map((rawProduct: any, index: number) => (
                  <DealBanner
                    key={rawProduct?.product?.id || rawProduct?.id || index}
                    rawProduct={rawProduct}
                    index={index}
                    router={router}
                    userType={userType}
                    parallaxRef={(el: HTMLDivElement | null) => {
                      dealParallaxRefs.current[index] = el;
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full flex h-[220px] items-center justify-center rounded-[18px] bg-[#eef2f4] sm:h-[235px] md:h-[255px] lg:h-[275px]">
                  <p className="text-sm text-gray-500">No deal available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            LIFESTYLE
        ================================================= */}

        {apiResponse && (
          <div className="relative isolate flow-root w-full">
            <LifestyleBanner
              apiResponse={apiResponse}
              router={router}
              parallaxRef={lifestyleParallaxRef}
            />
          </div>
        )}

        {/* =================================================
            BRANDS / NEW ARRIVALS
        ================================================= */}

        <motion.section
          className="
    relative
    isolate
    flow-root
    w-full
    overflow-hidden
    bg-white
    py-8
    sm:py-10
    lg:py-12
  "
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-5 flex flex-col items-center text-center sm:mb-7"
            >
              <span className="mb-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Fresh Finds
              </span>

              <h2 className="font-serif text-[25px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[32px] lg:text-[40px]">
                New Arrivals
              </h2>
            </motion.div>

            {isBrandsLoading ? (
              <div className="flex w-full justify-center gap-3 overflow-x-auto px-1 pb-3 sm:gap-4 sm:px-8 md:px-10 lg:px-12">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="
              h-[260px]
              w-[170px]
              shrink-0
              animate-pulse
              rounded-[10px]
              bg-[#f4f3ee]
              sm:h-[320px]
              sm:w-[215px]
              md:h-[360px]
              md:w-[240px]
              lg:h-[400px]
              lg:w-[265px]
              xl:h-[430px]
              xl:w-[285px]
            "
                  />
                ))}
              </div>
            ) : !brandsData?.data?.length ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-[12px] text-[#777777]">
                  No brands available
                </p>
              </div>
            ) : (
              <div className="relative isolate flow-root w-full">
                <button
                  type="button"
                  aria-label="Previous brands"
                  onClick={() =>
                    document.getElementById("brands-scroll")?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  className="
            absolute
            left-0
            top-1/2
            z-20
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-[#e8e8e8]
            bg-white
            text-[#111111]
            shadow-[0_6px_20px_rgba(0,0,0,0.10)]
            transition
            hover:scale-105
            hover:bg-[#111111]
            hover:text-white
            lg:flex
          "
                >
                  <ChevronLeft size={19} strokeWidth={1.7} />
                </button>

                <button
                  type="button"
                  aria-label="Next brands"
                  onClick={() =>
                    document.getElementById("brands-scroll")?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  className="
            absolute
            right-0
            top-1/2
            z-20
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-[#e8e8e8]
            bg-white
            text-[#111111]
            shadow-[0_6px_20px_rgba(0,0,0,0.10)]
            transition
            hover:scale-105
            hover:bg-[#111111]
            hover:text-white
            lg:flex
          "
                >
                  <ChevronRight size={19} strokeWidth={1.7} />
                </button>

                <div
                  id="brands-scroll"
                  className="
            flex
            w-full
            items-stretch
            justify-center
            gap-3
            overflow-x-auto
            scroll-smooth
            px-1
            pb-3
            sm:gap-4
            sm:px-8
            md:gap-5
            md:px-10
            lg:px-12
          "
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {brandsData.data.map((brand: any, index: number) => (
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

        {/* =================================================
            BEST SELLERS
        ================================================= */}

        <motion.section
          className="
            relative
            isolate
            flow-root
            w-full
            overflow-hidden
            bg-[#fafaf8]
            py-8
            sm:py-10
            lg:py-12
          "
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full max-w-[1900px] px-3 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <motion.div
              variants={fadeInUp}
              className="mb-5 flex flex-col items-center text-center sm:mb-7"
            >
              <span className="mb-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#888888] sm:text-[10px]">
                Customer Favorites
              </span>

              <h2 className="font-serif text-[25px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-[32px] lg:text-[40px]">
                Best Sellers
              </h2>
            </motion.div>

            <ProductRail
              products={bestSellers}
              userType={userType}
              wish={wish}
              router={router}
              handleToggleWishlist={handleToggleWishlist}
              isLoading={isFetching}
              isError={false}
              emptyText="No best sellers available"
              labelMode="best-seller"
              imagesEnabled={true}
            />
          </div>
        </motion.section>

        {/* =================================================
            OTHER SECTIONS
            Each also gets its own containing block wrapper.
        ================================================= */}

        <div className="relative isolate flow-root w-full">
          <TestimonialsSection />
        </div>

        <div className="relative isolate flow-root w-full">
          <ReviewCarousel />
        </div>

        <div className="relative isolate flow-root w-full">
          <StyleTestimonials />
        </div>

        <div className="relative isolate flow-root w-full">
          <PurchaseTrustBar />
        </div>

        <Footer />
      </div>

      {/* ===================================================
          CART SIDEBAR
      =================================================== */}

      <AnimatePresence>
        {cartSidebarOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[999999]
              bg-black/50
              backdrop-blur-sm
            "
            onClick={() => setCartSidebarOpen(false)}
          >
            <motion.div
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                fixed
                right-0
                top-0
                h-full
                w-full
                max-w-md
                overflow-y-auto
                bg-white
                shadow-2xl
              "
            >
              <div
                className="
                  sticky
                  top-0
                  z-20
                  flex
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  bg-white/95
                  px-4
                  py-4
                  backdrop-blur-sm
                  sm:px-6
                "
              >
                <h3 className="text-lg font-semibold text-[#071a41] sm:text-xl">
                  Shopping Bag{" "}
                  <span className="font-normal text-gray-400">
                    ({cartItems.length})
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={() => setCartSidebarOpen(false)}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    text-gray-500
                    transition
                    hover:bg-gray-100
                    hover:text-[#071a41]
                  "
                >
                  <X size={18} />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#071a41]/5 sm:h-24 sm:w-24">
                    <svg
                      className="h-9 w-9 text-[#071a41]/40"
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

                  <p className="mb-2 text-base text-gray-600 sm:text-lg">
                    Your bag is empty
                  </p>

                  <p className="mb-6 text-xs text-gray-400 sm:text-sm">
                    Looks like you haven't added anything yet
                  </p>

                  <button
                    type="button"
                    onClick={() => setCartSidebarOpen(false)}
                    className="
                      rounded-lg
                      bg-[#071a41]
                      px-7
                      py-3
                      text-sm
                      font-medium
                      text-white
                      shadow-lg
                    "
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 px-3 py-4 sm:px-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="
                            flex
                            gap-3
                            rounded-xl
                            bg-gray-50/60
                            p-3
                          "
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="
                              h-[72px]
                              w-[72px]
                              shrink-0
                              rounded-lg
                              object-cover
                              sm:h-20
                              sm:w-20
                            "
                        />

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-[#071a41] sm:text-sm">
                            {item.name}
                          </div>

                          <div className="mt-1 text-sm font-semibold text-[#071a41] sm:text-base">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2">
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
                              className="
                                  flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-gray-300
                                  text-gray-600
                                  disabled:opacity-40
                                "
                            >
                              −
                            </button>

                            <span className="w-6 text-center text-xs font-medium text-[#071a41]">
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
                              className="
                                  flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-gray-300
                                  text-gray-600
                                  disabled:opacity-40
                                "
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="
                      sticky
                      bottom-0
                      border-t
                      border-gray-100
                      bg-white/95
                      px-4
                      py-4
                      backdrop-blur-sm
                      sm:px-6
                      sm:py-6
                    "
                  >
                    <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#071a41] sm:text-lg">
                      <span>Total</span>

                      <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (cartItems.length > 0) {
                          router.push(
                            `/checkout?product_id=${cartItems[0].product_id}&quantity=1`,
                          );
                        }
                      }}
                      className="
                        w-full
                        rounded-lg
                        bg-[#071a41]
                        py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-lg
                      "
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/cart")}
                      className="
                        mt-2
                        w-full
                        rounded-lg
                        border
                        border-gray-200
                        py-3
                        text-sm
                        font-medium
                        text-[#071a41]
                      "
                    >
                      View Cart
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
