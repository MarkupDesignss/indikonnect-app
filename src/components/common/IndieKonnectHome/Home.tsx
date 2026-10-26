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

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  Check,
  Loader2,
} from "lucide-react";

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

import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";

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

import {
  useGetProductsQuery,
  useCheckProductStockMutation,
} from "@/lib/redux/api/productApi";

import { useGetBrandsQuery } from "@/lib/redux/api/brandsApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import ShopReelsRow from "./ShopReel";
import TestimonialsSection from "./Testimonialssection";
import ReviewCarousel from "./ReviewCarousel";
import StyleTestimonials from "./StyleTestimonials";
import WatchesBanner from "./WatchesBanner";
import HeroBannerCarousel from "./HeroBannerCarousel";
import PurchaseTrustBar from "./PurchaseTrustBar";
import SignupBenefitsBanner from "./SignupBenefitsBanner";
import MostFollowedReel from "./MostFollowedReel";
import TrendingProductsSection from "./TrendingProductsSection";
import NewArrivalsSection from "./NewArrivalsSection";
import ShopByCategory from "./ShopByCategory";
/* =========================================================
   DISTRIBUTOR / WEB BASE PATH
========================================================= */

/**
 * Distributor route:  /indiekonnect-distributor/home/
 * Web route:         /indiekonnect-web/home/
 *
 * We detect distributor by the current pathname.
 * All fallback images and asset paths are resolved from this base.
 */
const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return "/indiekonnect-web";
  }

  const path = window.location.pathname || "";

  if (path.startsWith("/indiekonnect-distributor")) {
    return "/indiekonnect-distributor";
  }

  return "/indiekonnect-web";
};

const getPlaceholderImage = (): string =>
  `${getBasePath()}/images/placeholder.png`;

const getPromoPlaceholderImage = (): string =>
  `${getBasePath()}/images/prod.png`;

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
   COMMON CONTAINER
========================================================= */

const sectionContainerClass = `
  mx-auto
  w-full
  max-w-[min(100%,1400px)]
  px-3
  sm:px-4
  md:px-5
  lg:px-6
`;

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
  if (!product) {
    return getPlaceholderImage();
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const primary = product.images.find((img: any) => img?.is_primary);

    return (
      primary?.image_url ||
      product.images[0]?.image_url ||
      product.primary_image_url ||
      getPlaceholderImage()
    );
  }

  return product?.primary_image_url || product?.image || getPlaceholderImage();
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
      {/* IMAGE SIDE */}

      <div className="absolute inset-y-0 right-0 w-[47%] overflow-hidden sm:w-[48%] md:w-[50%]">
        <div
          ref={parallaxRef}
          className={`${m.pxFrame} absolute -inset-y-[4%] left-0 right-[-5%] h-[108%]`}
        >
          <img
            src={productImage}
            alt={product?.name || "Product"}
            className="
              h-full
              w-full
              object-cover
              object-center
              transition-transform
              duration-700
              group-hover:scale-[1.035]
            "
            onError={(e) => {
              e.currentTarget.src = getPromoPlaceholderImage();
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f4] via-[#eef2f4]/15 to-transparent" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/95 to-transparent opacity-[0.04]" />

      {/* CONTENT */}

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
          initial={{
            opacity: 0,
            y: 7,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
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


export const productCardWidthClass =
  "w-[calc(50%_-_6px)] sm:w-[calc(33.333%_-_10.667px)] md:w-[calc(33.333%_-_13.333px)] lg:w-[calc(16.666%_-_20px)]";

const railGapClass =
  "gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-8 md:gap-x-5 lg:gap-x-6";

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
  showCartButtons = true,
}: any) {
  const [imageIndices, setImageIndices] = useState<
    Record<string | number, number>
  >({});

  const handleDotClick = (
    productId: string | number,
    index: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setImageIndices((prev) => ({ ...prev, [productId]: index }));
  };

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return (
      <div
        className={`mx-auto flex w-full max-w-[min(100%,1400px)] flex-wrap items-stretch justify-start ${railGapClass}`}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`${productCardWidthClass} animate-pulse`}>
            <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-[#eceae4] to-[#e1dfd8]" />
            <div className="mt-3 h-3 w-1/2 rounded-full bg-[#e8e6e1]" />
            <div className="mt-2 h-3 w-full rounded-full bg-[#e8e6e1]" />
            <div className="mt-2 h-4 w-2/5 rounded-full bg-[#e8e6e1]" />
            <div className="mt-3 h-9 w-full rounded-full bg-[#e8e6e1]" />
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (isError) {
    return (
      <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3">
        <p className="text-[13px] text-[#777]">
          Couldn’t load products. Please try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-[#111111] px-6 py-2.5 text-[12px] font-medium text-white transition hover:bg-[#2a2a2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ---------------- EMPTY ---------------- */

  if (!products?.length) {
    return (
      <div className="flex min-h-[180px] w-full items-center justify-center">
        <p className="text-center text-[12px] font-medium text-[#777777] sm:text-[13px]">
          {emptyText}
        </p>
      </div>
    );
  }

  /* ---------------- ONLY FIRST 6 ---------------- */

  const visibleProducts = products.slice(0, 6);
  const isFewProducts = visibleProducts.length <= 2;

  return (
    <div
      className={`mx-auto flex w-full max-w-[min(100%,1400px)] flex-wrap items-stretch ${railGapClass} ${
        isFewProducts ? "justify-center" : "justify-start"
      }`}
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
          <div key={product?.id || index} className={productCardWidthClass}>
            <ProductCard
              product={product}
              index={index}
              router={router}
              userType={userType}
              wish={wish}
              handleToggleWishlist={handleToggleWishlist}
              images={imagesEnabled ? images : []}
              imageIndex={imageIndex}
              onDotClick={handleDotClick}
              label={label}
              showCartButtons={showCartButtons}
            />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index = 0,
  router: routerProp,
  userType,
  wish,
  handleToggleWishlist,
  imageIndex = 0,
  images = [],
  onDotClick,
  label,
  showCartButtons = true,
}: any) {
  const routerFromHook = useRouter();
  const router = routerProp || routerFromHook;
  const dispatch = useAppDispatch();

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [checkProductStock] = useCheckProductStockMutation();
  const purchaseLockRef = useRef(false);
  const [stockUnavailable, setStockUnavailable] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const price = getProductPrice(product, userType);
  const mrp = getProductMrp(product, userType);
  const discount =
    mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const rating =
    product?.reviews?.average_rating ??
    product?.reviews_summary?.average_rating ??
    product?.rating ??
    4.4;

  // Product listing API exposes brand_name directly (not necessarily brand.name).
  const brandName = String(
    product?.brand_name ?? product?.brand?.name ?? "",
  ).trim();

  const categoryName = product?.category?.name || "All Watches";
  const fullTitle = product?.name || "Premium watch";

  const currentImage =
    images.length > 0
      ? images[imageIndex]?.image_url || images[0]?.image_url
      : getProductImage(product);

  const isWishlisted = wish?.[product?.id] || false;

  const inStock =
    !stockUnavailable &&
    product?.in_stock !== false &&
    !["out_of_stock", "inactive", "disabled"].includes(
      String(product?.stock_status ?? "").toLowerCase(),
    ) &&
    (product?.stock_quantity == null || Number(product.stock_quantity) > 0);

  const stockQty = Number(product?.stock_quantity);
  const lowStock =
    inStock && Number.isFinite(stockQty) && stockQty > 0 && stockQty <= 5;

  useEffect(() => {
    setStockUnavailable(false);
  }, [product?.id]);

  const verifyLiveStock = async () => {
    const id = Number(product?.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid product. Please refresh and try again.");
    }

    const response = await checkProductStock({
      product_id: id,
      quantity: 1,
    }).unwrap();
    const stock = response?.data;
    const quantity = Number(stock?.stock_quantity);

    if (
      response?.success !== true ||
      Number(stock?.product_id) !== id ||
      typeof stock?.available !== "boolean" ||
      !Number.isFinite(quantity)
    ) {
      throw new Error("Unable to verify live stock. Please try again.");
    }

    if (!stock.available || quantity < 1) {
      setStockUnavailable(true);
      throw new Error("This product is currently out of stock.");
    }
    setStockUnavailable(false);
  };

  const openProduct = () => {
    if (!product?.slug) return;
    router.push(`/product/${product.slug}/`);
  };

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [justAdded]);

  /* ---------------- ADD TO CART ---------------- */

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || !inStock || purchaseLockRef.current) return;

    purchaseLockRef.current = true;
    try {
      await verifyLiveStock();
      await addToCart({ product_id: Number(product.id), quantity: 1 }).unwrap();
      setJustAdded(true);
      dispatch(
        showToast({
          message: `${product.name} added to cart 🛒`,
          type: "success",
        }),
      );
    } catch (err: any) {
      dispatch(
        showToast({
          message:
            err?.data?.message || err?.message || "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      purchaseLockRef.current = false;
    }
  };

  /* ---------------- BUY NOW (stock verified, no cart mutation) ---------------- */

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || !inStock || purchaseLockRef.current) return;

    purchaseLockRef.current = true;
    setIsBuyingNow(true);
    try {
      await verifyLiveStock();
      const params = new URLSearchParams({
        checkout_type: "buy_now",
        product_id: String(product.id),
        quantity: "1",
      });
      router.push(`/checkout?${params.toString()}`);
    } catch (err: any) {
      dispatch(
        showToast({
          message:
            err?.data?.message || err?.message || "Unable to verify stock",
          type: "error",
        }),
      );
    } finally {
      purchaseLockRef.current = false;
      setIsBuyingNow(false);
    }
  };

  return (
    <motion.article 
      className="group/card flex h-full w-full min-w-0 flex-col"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* =================== IMAGE =================== */}
      <div
        className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl bg-[#f4f3ef] ring-1 ring-black/5 transition-shadow duration-500 group-hover/card:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.45)]"
      >
        <img
          src={currentImage || getPlaceholderImage()}
          alt={product?.name || "Product"}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          onClick={openProduct}
          onError={(e) => {
            // placeholder bhi fail ho to infinite loop na bane
            if (e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = getPlaceholderImage();
          }}
          className={`absolute inset-0 h-full w-full cursor-pointer object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 ${
            inStock ? "" : "opacity-60 grayscale"
          }`}
        />

        {/* soft bottom fade so rating/dots stay readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent" />

        {/* LABEL + DISCOUNT (top-left) */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {label && (
            <span className="rounded-full bg-white/90 px-2 py-[3px] text-[10px] font-medium leading-none text-[#171717] shadow-sm backdrop-blur-sm sm:text-[11px]">
              {label}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-[#1a8a3f] px-2 py-[3px] text-[10px] font-semibold leading-none text-white shadow-sm sm:text-[11px]">
              {discount}% off
            </span>
          )}
        </div>

        {/* WISHLIST (top-right) */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? `Remove ${product?.name || "product"} from wishlist`
              : `Add ${product?.name || "product"} to wishlist`
          }
          aria-pressed={isWishlisted}
          onClick={(e) => handleToggleWishlist(product?.id, product?.name, e)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#171717] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-9 sm:w-9"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[15px] w-[15px]"
            fill={isWishlisted ? "#e0455f" : "none"}
            stroke={isWishlisted ? "#e0455f" : "currentColor"}
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>

        {/* RATING (bottom-left) */}
        {Number(rating) > 0 && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
            <span className="text-[11px] font-semibold leading-none text-[#111111]">
              {Number(rating).toFixed(1)}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-[10px] w-[10px] text-[#1a8a3f]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 6.34 6.95.63-5.24 4.66 1.56 6.87L12 17.3l-6.13 3.7 1.56-6.87-5.24-4.66 6.95-.63L12 2.5z" />
            </svg>
          </div>
        )}

        {/* IMAGE DOTS (bottom-right) – mobile par tap se image badlo */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center rounded-full bg-black/25 px-1 backdrop-blur-sm">
            {images.slice(0, 5).map((_: any, i: number) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={(e) => onDotClick?.(product?.id, i, e)}
                className="flex h-5 w-4 items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === imageIndex
                      ? "h-1.5 w-3 bg-white"
                      : "h-1.5 w-1.5 bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* OUT OF STOCK overlay */}
        {!inStock && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/30">
            <span className="rounded-full bg-[#111111]/85 px-3 py-1.5 text-[11px] font-medium text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* =================== INFO =================== */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* BRAND | CATEGORY */}
        <p
          onClick={openProduct}
          className="mt-3 min-h-[18px] cursor-pointer truncate text-[12.5px] leading-tight text-[#151515] sm:text-[13px]"
        >
          {brandName && <span className="font-semibold">{brandName}</span>}
          {brandName && categoryName && (
            <span className="text-gray-400"> | </span>
          )}
          {categoryName && (
            <span className="font-normal text-gray-600">{categoryName}</span>
          )}
        </p>

        {/* TITLE */}
        <p
          onClick={openProduct}
          title={fullTitle}
          className="mt-1 min-h-[32px] cursor-pointer text-[11.5px] leading-[16px] text-gray-500 line-clamp-2 sm:text-xs"
        >
          {fullTitle}
        </p>

        {/* PRICE */}
        <div className="flex min-h-[22px] flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-bold tracking-tight text-[#111111] sm:text-base">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {mrp > price && (
            <span className="text-[11px] text-gray-400 line-through sm:text-xs">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* LOW STOCK hint */}
        <p className="mt-0.5 min-h-[14px] text-[11px] font-medium text-[#c2410c]">
          {lowStock ? `Only ${stockQty} left` : ""}
        </p>

        {/* ACTIONS */}
        {showCartButtons && (
          <div className="mt-auto flex items-center gap-1.5 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart || isBuyingNow}
              aria-label="Add to cart"
              title={inStock ? "Add to cart" : "Out of stock"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-10 sm:w-10 ${
                !inStock
                  ? "cursor-not-allowed border-[#eeeeee] bg-[#f7f7f7] text-[#cccccc]"
                  : justAdded
                    ? "border-[#1a8a3f] bg-[#eafaf0] text-[#1a8a3f]"
                    : "border-[#d9d9d9] bg-white text-[#111111] hover:border-[#111111]"
              }`}
            >
              {isAddingToCart ? (
                <Loader2 className="h-[15px] w-[15px] animate-spin" />
              ) : justAdded ? (
                <Check className="h-[15px] w-[15px]" />
              ) : (
                <ShoppingBag className="h-[15px] w-[15px]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock || isBuyingNow || isAddingToCart}
              aria-label="Buy now"
              className={`flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium tracking-tight transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] sm:h-10 sm:text-xs ${
                !inStock
                  ? "cursor-not-allowed bg-[#f0f0f0] text-[#bbbbbb]"
                  : isBuyingNow
                    ? "cursor-wait bg-[#252525] text-white"
                    : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              {isBuyingNow ? (
                <>
                  <Loader2 className="h-[13px] w-[13px] animate-spin" />
                  <span>Processing…</span>
                </>
              ) : inStock ? (
                "Buy now"
              ) : (
                "Out of stock"
              )}
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function LifestyleBanner({ apiResponse, router, parallaxRef }: any) {
  // Get banner data from API
  const content = apiResponse?.data?.find(
    (item: any) => item.slug === "home-page-second-banner",
  );

  const block = content?.blocks?.[0];

  const primaryImage = block?.images?.find(
    (item: any) => item?.is_primary,
  );

  const image =
    primaryImage?.url ||
    block?.images?.[0]?.url ||
    getPromoPlaceholderImage();

  return (
    <section
      className="
        relative left-1/2 isolate
        w-screen max-w-none
        -translate-x-1/2
        overflow-hidden
        bg-[#11101f]
      "
    >
      {/* BANNER */}
      <div
        className="
          relative
          h-[220px]
          w-full
          overflow-hidden
          bg-[#11101f]
          sm:h-[280px]
          md:h-[320px]
          lg:h-[360px]
          xl:h-[400px]
        "
      >
        {/* BACKGROUND IMAGE */}
        <div
          ref={parallaxRef}
          className={`
            ${m.pxFrame}
            absolute inset-0
            h-full w-full
          `}
        >
          <img
            src={image}
            alt={
              primaryImage?.alt_text ||
              content?.title ||
              "Premium Lifestyle"
            }
            className="
              block
              h-full
              w-full
              object-cover
              object-center
            "
            onError={(e) => {
              const fallback = getPromoPlaceholderImage();

              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>

        {/* GRADIENT OVERLAY */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-r
            from-[#11101f]/85
            via-[#11101f]/45
            to-transparent
          "
        />

        {/* BANNER CONTENT */}
        <div
          className="
            relative z-10
            flex h-full
            items-center
          "
        >
          <div
            className="
              w-full
              px-5
              sm:px-8
              md:px-12
              lg:px-16
              xl:px-24
            "
          >
            {/* SMALL HEADING */}
            {block?.heading && (
              <div
                className="
                  mb-2
                  max-w-[90%]
                  text-[10px]
                  font-medium
                  tracking-wide
                  text-white/85
                  sm:mb-3
                  sm:text-xs
                "
                dangerouslySetInnerHTML={{
                  __html: block.heading,
                }}
              />
            )}

            {/* MAIN HEADING / DESCRIPTION */}
            {block?.short_description && (
              <div
                className="
                  max-w-[530px]
                  text-white
                  [&>h1]:m-0
                  [&>h2]:m-0
                  [&>h3]:m-0
                  [&>p]:m-0
                  [&_h1]:m-0
                  [&_h2]:m-0
                  [&_h3]:m-0
                  [&_p]:m-0
                  [&>h1]:text-[22px]
                  [&>h2]:text-[22px]
                  [&>h3]:text-[22px]
                  [&>p]:text-[22px]
                  [&_h1]:text-[22px]
                  [&_h2]:text-[22px]
                  [&_h3]:text-[22px]
                  [&_p]:text-[22px]
                  [&>h1]:font-semibold
                  [&>h2]:font-semibold
                  [&>h3]:font-semibold
                  [&>p]:font-semibold
                  [&_h1]:font-semibold
                  [&_h2]:font-semibold
                  [&_h3]:font-semibold
                  [&_p]:font-semibold
                  [&>h1]:leading-tight
                  [&>h2]:leading-tight
                  [&>h3]:leading-tight
                  [&>p]:leading-tight
                  [&_h1]:leading-tight
                  [&_h2]:leading-tight
                  [&_h3]:leading-tight
                  [&_p]:leading-tight
                  sm:[&>h1]:text-[28px]
                  sm:[&>h2]:text-[28px]
                  sm:[&>h3]:text-[28px]
                  sm:[&>p]:text-[28px]
                  sm:[&_h1]:text-[28px]
                  sm:[&_h2]:text-[28px]
                  sm:[&_h3]:text-[28px]
                  sm:[&_p]:text-[28px]
                  md:[&>h1]:text-[34px]
                  md:[&>h2]:text-[34px]
                  md:[&>h3]:text-[34px]
                  md:[&>p]:text-[34px]
                  md:[&_h1]:text-[34px]
                  md:[&_h2]:text-[34px]
                  md:[&_h3]:text-[34px]
                  md:[&_p]:text-[34px]
                  lg:[&>h1]:text-[40px]
                  lg:[&>h2]:text-[40px]
                  lg:[&>h3]:text-[40px]
                  lg:[&>p]:text-[40px]
                  lg:[&_h1]:text-[40px]
                  lg:[&_h2]:text-[40px]
                  lg:[&_h3]:text-[40px]
                  lg:[&_p]:text-[40px]
                  xl:[&>h1]:text-[46px]
                  xl:[&>h2]:text-[46px]
                  xl:[&>h3]:text-[46px]
                  xl:[&>p]:text-[46px]
                  xl:[&_h1]:text-[46px]
                  xl:[&_h2]:text-[46px]
                  xl:[&_h3]:text-[46px]
                  xl:[&_p]:text-[46px]
                "
                dangerouslySetInnerHTML={{
                  __html: block.short_description,
                }}
              />
            )}

            {/* EXPLORE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                ripple(e);
                router.push("/products");
              }}
              className="
                group
                mt-4
                inline-flex
                h-[36px]
                items-center
                gap-2
                rounded-lg
                bg-white
                px-4
                text-[11px]
                font-semibold
                text-[#171717]
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#f2f2f2]
                sm:mt-5
                sm:h-[42px]
                sm:px-5
                sm:text-xs
              "
            >
              Explore All Products

              <span
                className="
                  text-sm
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </button>
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
  const [checkParentProductStock] = useCheckProductStockMutation();
  const parentCartLockRef = useRef(false);

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

  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    const childWidth =
      (el.firstElementChild as HTMLElement | null)?.clientWidth || 1;

    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;

    const index = Math.round(el.scrollLeft / (childWidth + gap));

    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;

    if (!el) return;

    const child = el.children[index] as HTMLElement;

    if (child) {
      el.scrollTo({
        left: child.offsetLeft - el.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    setActiveIndex(0);

    scrollRef.current?.scrollTo({
      left: 0,
    });
  }, [dealProducts?.length]);

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
     PARALLAX DEAL
  ======================================================= */

  useEffect(() => {
    if (!dealProducts?.length) {
      return;
    }

    const cleanups: Array<() => void> = [];

    dealParallaxRefs.current.forEach((el, index) => {
      if (!el) return;

      const amount = index === 0 ? 26 : 38;

      const handleWindowScroll = () => {
        const rect = el.getBoundingClientRect();

        const progress = 1 - rect.top / window.innerHeight;

        const offset = Math.max(0, Math.min(progress, 1)) * amount;

        el.style.transform = `translateY(${offset}px)`;
      };

      requestAnimationFrame(handleWindowScroll);

      window.addEventListener("scroll", handleWindowScroll, {
        passive: true,
      });

      cleanups.push(() =>
        window.removeEventListener("scroll", handleWindowScroll),
      );
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [dealProducts]);

  /* =======================================================
     PARALLAX LIFESTYLE
  ======================================================= */

  useEffect(() => {
    const el = lifestyleParallaxRef.current;

    if (!el || !apiResponse) {
      return;
    }

    const handleWindowScroll = () => {
      const rect = el.getBoundingClientRect();

      const progress = 1 - rect.top / window.innerHeight;

      const offset = Math.max(0, Math.min(progress, 1)) * 46;

      el.style.transform = `translateY(${offset}px)`;
    };

    requestAnimationFrame(handleWindowScroll);

    window.addEventListener("scroll", handleWindowScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleWindowScroll);
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
    if (parentCartLockRef.current) return;
    parentCartLockRef.current = true;

    try {
      const id = Number(productId);
      const requiredQuantity =
        (cartItems.find((item) => Number(item.product_id) === id)?.quantity ??
          0) + 1;
      const stockResponse = await checkParentProductStock({
        product_id: id,
        quantity: requiredQuantity,
      }).unwrap();
      if (
        stockResponse?.success !== true ||
        Number(stockResponse?.data?.product_id) !== id ||
        stockResponse?.data?.available !== true ||
        Number(stockResponse?.data?.stock_quantity) < requiredQuantity
      ) {
        throw new Error("Insufficient stock for the requested quantity.");
      }
      const response = await addToCartMutation({
        product_id: productId,
        quantity: 1,
      }).unwrap();

      if (
        response?.message === "Item added to cart successfully" ||
        response?.data?.items
      ) {
        if (e) {
          ripple(e);
          flyToCart(e);
        }
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
    } finally {
      parentCartLockRef.current = false;
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
      if (action === "increment") {
        const requiredQuantity = Number(currentItem.quantity) + 1;
        const stockResponse = await checkParentProductStock({
          product_id: Number(productId),
          quantity: requiredQuantity,
        }).unwrap();
        if (
          stockResponse?.success !== true ||
          Number(stockResponse?.data?.product_id) !== Number(productId) ||
          stockResponse?.data?.available !== true ||
          Number(stockResponse?.data?.stock_quantity) < requiredQuantity
        ) {
          throw new Error("Insufficient stock for the requested quantity.");
        }
      }
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
      .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      .map((block, idx) => {
        // ✅ Image nikaalo
        const img =
          block?.images?.find((image) => image?.is_primary) ||
          block?.images?.[0];

        // ✅ Aapke API mein `videos` array hai — usse video URL nikaalo
        const videoObj =
          Array.isArray(block?.videos) && block.videos.length > 0
            ? block.videos.find((v: any) => v?.url) || block.videos[0]
            : null;

        const videoUrl = videoObj?.url || null;

        // Agar na image hai na video, skip
        if (!img?.url && !videoUrl) return null;

        // 🎯 Video hai toh video priority, warna image
        const mediaType = videoUrl ? "video" : "image";

        return {
          id: block?.id ?? idx,
          image: img?.url || null,
          video: videoUrl,
          mediaType,
          alt: img?.alt_text || "IndieKonnect banner",
          heading: block?.heading ? stripHtml(block.heading) : "",
          navigationUrl: block?.navigation_url || block?.cta_url || "/products",
        };
      })
      .filter(Boolean);

    if (slides.length) return slides;

    return [
      {
        id: "fallback",
        image: FALLBACK_HERO_IMAGE,
        video: null,
        mediaType: "image",
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

  /* =======================================================
     LOADING
     -------------------------------------------------------
     IMPORTANT: Do not wrap <Header /> in any sticky wrapper.
     Header is `position: fixed` and renders its own spacer,
     so it must live directly inside the page shell in BOTH
     loading and success states — otherwise the loader will
     overlap the header on first paint.
  ======================================================= */

  if (isLoading) {
    return (
      <div
        className={`${s.page} isolate relative flex w-full min-w-0 flex-col overflow-x-hidden bg-white`}
      >
        <Header />

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
    <div
      className={`${s.page} isolate relative flex w-full min-w-0 flex-col overflow-x-hidden bg-white`}
    >
      <Header />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative isolate flow-root w-full overflow-hidden bg-white">
        <div
          className="
    relative
    w-full
    h-[320px]
    sm:h-[400px]
    md:h-[480px]
    lg:h-[560px]
    xl:h-[640px]
    2xl:h-[700px]
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
                    {slide.mediaType === "video" && slide.video ? (
                      <video
                        key={slide.id}
                        src={slide.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload={isActive ? "auto" : "metadata"}
                        poster={slide.image || undefined}
                        className="
    absolute
    inset-0
    block
    h-full
    w-full
    object-cover
    object-top
  "
                      />
                    ) : (
                      <img
                        src={slide.image || getPromoPlaceholderImage()}
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
    "
                        onError={(e) => {
                          e.currentTarget.src = getPromoPlaceholderImage();
                        }}
                      />
                    )}
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

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="relative isolate flex w-full min-w-0 flex-col overflow-hidden bg-white">
        {/* =================================================
            CATEGORY
        ================================================= */}

        <ShopByCategory
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
          isCategoriesError={isCategoriesError}
          getCategoryHref={(category) =>
            `/category/${category.slug || category.id}`
          }
        />

        {/* SIGNUP */}

        <div className="relative isolate flow-root w-full">
          <SignupBenefitsBanner />
        </div>

        {/* HERO BANNER */}

        <div className="relative isolate flow-root w-full">
          <HeroBannerCarousel />
        </div>

        {/* REELS */}

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
            TRENDING PRODUCTS
        ================================================= */}

        <TrendingProductsSection
          products={products}
          ProductRail={ProductRail}
          userType={userType}
          wish={wish}
          router={router}
          handleToggleWishlist={handleToggleWishlist}
          isProductsLoading={isProductsLoading}
          isProductsError={isProductsError}
          refetchProducts={refetchProducts}
          sectionContainerClass={sectionContainerClass}
        />

        {/* =================================================
            WATCH BANNER
        ================================================= */}

        <div
          className="relative isolate flow-root w-full"
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
          <div className={sectionContainerClass}>
            <motion.div
              variants={fadeInUp}
              className={`
                mb-5
                flex
                w-full
                flex-col
                ${
                  bestOffers?.length <= 2
                    ? "items-center text-center"
                    : "items-start text-left"
                }
              `}
            >
              <h2
                className="
                  font-serif
                  text-[15px]
                  font-medium
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-[#111111]
                  sm:text-[25px]
                  lg:text-[20px]
                "
              >
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

        <section className="relative isolate mb-10 mt-16 flow-root w-full overflow-hidden bg-white sm:mb-14 lg:mb-18">
          <div className={sectionContainerClass}>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="
                flex
                w-full
                min-w-0
                snap-x
                snap-mandatory
                gap-4
                overflow-x-auto
                scroll-smooth
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:gap-5
                md:grid
                md:grid-cols-2
                md:gap-5
                md:overflow-visible
                xl:gap-6
              "
            >
              {dealProducts?.length > 0 ? (
                dealProducts.map((rawProduct: any, index: number) => (
                  <div
                    key={rawProduct?.product?.id || rawProduct?.id || index}
                    className="
                        w-full
                        shrink-0
                        snap-center
                        md:w-auto
                        md:shrink
                      "
                  >
                    <DealBanner
                      rawProduct={rawProduct}
                      index={index}
                      router={router}
                      userType={userType}
                      parallaxRef={(el: HTMLDivElement | null) => {
                        dealParallaxRefs.current[index] = el;
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex h-[220px] w-full items-center justify-center rounded-[18px] bg-[#eef2f4] sm:h-[235px] md:h-[255px] lg:h-[275px]">
                  <p className="text-sm text-gray-500">No deal available</p>
                </div>
              )}
            </div>

            {dealProducts?.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2 md:hidden">
                {dealProducts.map((_: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => scrollToIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index
                        ? "w-6 bg-gray-800"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
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
            NEW ARRIVALS / BRANDS
        ================================================= */}

        <NewArrivalsSection
          brandsData={brandsData}
          isBrandsLoading={isBrandsLoading}
        />

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
          <div className={sectionContainerClass}>
            <motion.div
              variants={fadeInUp}
              className={`
                mb-5
                flex
                w-full
                flex-col
                ${
                  bestSellers?.length <= 2
                    ? "items-center text-center"
                    : "items-start text-left"
                }
              `}
            >
              <h2
                className="
                  font-serif
                  text-[15px]
                  font-medium
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-[#111111]
                  sm:text-[25px]
                  lg:text-[20px]
                "
              >
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

        <MostFollowedReel
          reelsData={reelsData}
          isLoading={isReelsLoading}
          enabled={!isReelModalOpen}
        />
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