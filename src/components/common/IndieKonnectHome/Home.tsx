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
import GrowthLadderScroll from "./GrowthLadderScroll";

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
  useGetTopDiscountedProductsQuery,
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

// ============================================
// ANIMATION VARIANTS
// ============================================

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

  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 50,
    seconds: 59,
  });

  const timeParts = [
    { label: "HRS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(timer);
          return prev;
        }

        return {
          hours,
          minutes,
          seconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

        {/* Countdown */}
        <motion.div
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
            delay: 0.4 + index * 0.08,
            duration: 0.5,
          }}
          className="mt-2 flex items-center gap-1.5 sm:gap-2"
        >
          {timeParts.map((part, i) => (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <span className="min-w-[32px] rounded-[8px] bg-white/20 px-2 py-1 text-center font-mono text-[20px] font-bold leading-none text-white backdrop-blur-sm sm:min-w-[44px] sm:px-3 sm:py-1.5 sm:text-[28px] lg:text-[32px]">
                  {String(part.value).padStart(2, "0")}
                </span>

                <span className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-white/70 sm:text-[10px]">
                  {part.label}
                </span>
              </div>

              {i < timeParts.length - 1 && (
                <span className="text-[18px] font-bold text-white/60 sm:text-[24px] lg:text-[28px]">
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

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

// 2. REEL CARD with 3D Tilt + Hover Autoplay
function ReelCard({
  reel,
  router,
  getProductImage,
  getProductPrice,
  userType,
}: any) {
  const card = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);
  const t = useRef<any>(null);

  const product = reel?.product;
  const productSlug = product?.slug;
  const productName = product?.name || "Featured product";
  const productImage = getProductImage(product);
  const productPrice = getProductPrice(product, userType);

  const videoUrl =
    reel?.video_full_path ||
    reel?.video_full_url ||
    reel?.video_url ||
    reel?.video_path;
  const thumbnailUrl = reel?.thumbnail_url || productImage;

  const onEnter = () => {
    let p = 0;
    t.current = setInterval(() => {
      p = (p + 2) % 102;
      setProg(p);
    }, 60);
  };

  const onMove = (e: React.MouseEvent) => {
    const el = card.current!;
    const b = el.getBoundingClientRect();
    const rx = ((e.clientY - b.top) / b.height - 0.5) * -12;
    const ry = ((e.clientX - b.left) / b.width - 0.5) * 14;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.03)`;
  };

  const onLeave = () => {
    clearInterval(t.current);
    setProg(0);
    if (card.current) {
      card.current.style.transform = "";
    }
  };

  const handleShopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    ripple(e);
    if (productSlug) {
      router.push(`/product/${productSlug}/`);
    }
  };

  return (
    <div
      ref={card}
      data-card
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex-shrink-0 snap-start overflow-hidden rounded-[16px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#f0ebe4] transition-[transform,box-shadow] duration-500"
      style={{
        width: "clamp(210px, 20vw, 280px)",
        height: "clamp(380px, 40vw, 480px)",
      }}
    >
      <div className="absolute inset-x-3 top-3 z-20 h-[2.5px] overflow-hidden rounded bg-white/30">
        <div
          className="h-full bg-white transition-[width] duration-200 ease-linear"
          style={{ width: prog + "%" }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              poster={thumbnailUrl}
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              className="block h-full w-full object-cover"
              onMouseEnter={(e) => {
                e.currentTarget.play().catch(() => { });
              }}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
              }}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-300">
              <svg className="ml-1 h-5 w-5 fill-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </>
        ) : (
          <img
            src={thumbnailUrl}
            alt={reel?.title || "Creator reel"}
            className="block h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="absolute bottom-[88px] left-4 right-4 z-20">
        <div className="line-clamp-2 font-serif text-[16px] font-medium leading-[1.2] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,.5)]">
          {reel?.title || reel?.caption || "Featured look"}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-40">
        <div className="flex items-center gap-2.5 rounded-[14px] bg-white/95 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/20">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] bg-gray-100">
            <img
              src={thumbnailUrl}
              alt={productName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold text-[#1a1a1a]">
              {productName}
            </div>
            <div className="mt-0.5 text-[12px] font-bold text-[#d6a541]">
              {productPrice}
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleShopClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className={`${m.glass} flex h-9 min-w-[64px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[#142747] px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#142746]`}
          >
            Shop
          </motion.button>
        </div>
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
  const [activeTab, setActiveTab] = useState("Best Seller");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdownExpired, setCountdownExpired] = useState(false);

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
  const { data: topDiscountedData } = useGetTopDiscountedProductsQuery();
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

  const topDiscountedProducts = useMemo(() => {
    if (Array.isArray(topDiscountedData)) return topDiscountedData;
    if (Array.isArray(topDiscountedData?.data)) return topDiscountedData.data;
    return [];
  }, [topDiscountedData]);

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
  // COUNTDOWN
  // ============================================

  useEffect(() => {
    const firstItem = topDiscountedProducts[0];
    const product = firstItem?.product || firstItem;
    const endDate = product?.deal_of_the_day_ends_at;

    if (!endDate) {
      setCountdownExpired(false);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const endTime = new Date(endDate).getTime();
    if (Number.isNaN(endTime)) {
      setCountdownExpired(true);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const difference = endTime - now;
      if (difference <= 0) {
        setCountdownExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdownExpired(false);
      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [topDiscountedProducts]);

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

  const formatTime = (value: number) => String(value).padStart(2, "0");

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
          // ADD THIS LINE - navigation URL from CMS
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
        navigationUrl: string; // ADD THIS TYPE
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
        navigationUrl: "/products", // ADD THIS LINE
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

  // ============================================
  // SCROLL REEL
  // ============================================

  const scrollReel = (direction: number) => {
    rail.current?.scrollBy({ left: direction * 640, behavior: "smooth" });
  };

  // ============================================
  // HANDLE CLOSE CART
  // ============================================

  const handleCloseCart = () => {
    setCartSidebarOpen(false);
  };

  // ============================================
  // LOADING
  // ============================================

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
          Screenshot-style:
          - white page background
          - centered banner
          - previous / next banners peek from both sides
          - rounded corners
          - clean image-only artwork
          - mobile friendly
      ============================================================ */}

      <section className="relative w-full overflow-hidden bg-white py-1 sm:py-2 lg:py-3">
        <div className="relative h-[185px] w-full sm:h-[275px] md:h-[355px] lg:h-[430px] xl:h-[600px]">
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
                    x: `${diff > 0 ? 5 : -5}%`,
                    scale: 0.985,
                  }}
                  animate={{
                    opacity: 1,
                    x: diff === 0 ? "0%" : diff > 0 ? "84vw" : "-84vw",
                    scale: isActive ? 1 : 0.985,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.68,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute left-1/2 top-0 h-full -translate-x-1/2"
                  style={{
                    width: "calc(100vw - 16.5vw)",
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

                      // UPDATED: Navigate to the specific URL from the slide data
                      if (slide?.navigationUrl) {
                        router.push(slide.navigationUrl);
                      } else if (slide?.ctaPrimary || slide?.ctaSecondary) {
                        router.push("/products");
                      }
                    }}
                    className="group relative block h-full w-full overflow-hidden rounded-[5px] border border-black/[0.045] bg-[#edf1ee] shadow-[0_5px_18px_rgba(0,0,0,0.075)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#071a41]/40"
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

                    {/* Keep the artwork clean — only a very subtle edge layer. */}
                    {!isActive && (
                      <span className="pointer-events-none absolute inset-0 bg-black/[0.025]" />
                    )}

                    {isActive && (
                      <span className="pointer-events-none absolute inset-0 rounded-[5px] ring-1 ring-black/[0.035]" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ========================================================
              DESKTOP ARROWS
          ======================================================== */}

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

        {/* ========================================================
            DOTS
        ======================================================== */}

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
          {/* ============================================================
      FULL WIDTH SECTION
  ============================================================ */}
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            {/* ==========================================================
        HEADING
    ========================================================== */}
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-7"
            >
              <h2
                className="
          font-serif
          text-[28px]
          font-medium
          leading-[1.05]
          tracking-[-0.035em]
          text-[#101827]
          sm:text-[32px]
        "
              >
                Shop by Category
              </h2>

              <p
                className="
          mt-2
          text-[11px]
          leading-5
          text-[#686868]
          sm:text-[12px]
        "
              >
                Explore our curated collection.
              </p>
            </motion.div>

            {/* ==========================================================
        CATEGORY AREA
    ========================================================== */}
            <div className="relative w-full">
              {/* ========================================================
          LEFT FADE
      ======================================================== */}
              <div
                className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-r
          from-white
          via-white/80
          to-transparent
          sm:w-12
          lg:w-14
        "
              />

              {/* ========================================================
          RIGHT FADE
      ======================================================== */}
              <div
                className="
          pointer-events-none
          absolute
          right-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-l
          from-white
          via-white/80
          to-transparent
          sm:w-12
          lg:w-14
        "
              />

              {/* ========================================================
          LEFT ARROW
      ======================================================== */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("category-scroll");

                  container?.scrollBy({
                    left: -320,
                    behavior: "smooth",
                  });
                }}
                aria-label="Previous categories"
                className="
          absolute
          left-0
          top-1/2
          z-30
          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full

          border
          border-[#e8e8e8]

          bg-white
          text-[#20252d]

          shadow-[0_6px_25px_rgba(0,0,0,0.10)]

          transition-all
          duration-300

          hover:scale-105
          hover:border-[#071A41]
          hover:bg-[#071A41]
          hover:text-white

          active:scale-95

          sm:h-10
          sm:w-10
        "
              >
                <ChevronLeft size={19} strokeWidth={1.7} />
              </button>

              {/* ========================================================
          RIGHT ARROW
      ======================================================== */}
              <button
                type="button"
                onClick={() => {
                  const container = document.getElementById("category-scroll");

                  container?.scrollBy({
                    left: 320,
                    behavior: "smooth",
                  });
                }}
                aria-label="Next categories"
                className="
          absolute
          right-0
          top-1/2
          z-30
          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full

          border
          border-[#e8e8e8]

          bg-white
          text-[#20252d]

          shadow-[0_6px_25px_rgba(0,0,0,0.10)]

          transition-all
          duration-300

          hover:scale-105
          hover:border-[#071A41]
          hover:bg-[#071A41]
          hover:text-white

          active:scale-95

          sm:h-10
          sm:w-10
        "
              >
                <ChevronRight size={19} strokeWidth={1.7} />
              </button>

              {/* ========================================================
          CATEGORY SCROLL
      ======================================================== */}
              <div
                id="category-scroll"
                className="
          flex
          w-full
          items-start
          justify-center
          gap-3
          overflow-x-auto
          scroll-smooth
          px-9
          pb-3
          pt-1

          scrollbar-hide

          sm:gap-4
          sm:px-11

          md:gap-5
          md:px-12

          lg:gap-6
          lg:px-14
        "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {categories.map((category: any, index: number) => (
                  <motion.div
                    key={category.id || `${category.title}-${index}`}
                    variants={scaleIn}
                    whileHover={{
                      y: -3,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() =>
                      router.push(
                        `/products/?category=${encodeURIComponent(
                          category.title,
                        )}`,
                      )
                    }
                    className="
              group
              shrink-0
              cursor-pointer
              text-center

              /* ==================================================
                 MOBILE
                 2 CARDS PER SCREEN
              ================================================== */
              w-[calc((100vw-84px)/2)]
              max-w-[150px]

              /* ==================================================
                 SMALL
              ================================================== */
              sm:w-[135px]
              sm:max-w-none

              /* ==================================================
                 TABLET
              ================================================== */
              md:w-[145px]

              /* ==================================================
                 DESKTOP
              ================================================== */
              lg:w-[155px]

              /* ==================================================
                 LARGE
              ================================================== */
              xl:w-[165px]
            "
                  >
                    {/* ==================================================
                IMAGE
            ================================================== */}
                    <div
                      className="
                relative
                aspect-square
                w-full
                overflow-hidden
                rounded-[7px]

                bg-[#f3f3f3]

                shadow-[0_1px_3px_rgba(0,0,0,0.04)]

                ring-1
                ring-black/[0.04]

                transition-all
                duration-300

                group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.10)]
              "
                    >
                      <img
                        src={
                          category.image ||
                          "https://via.placeholder.com/300x300"
                        }
                        alt={category.title}
                        loading={index < 5 ? "eager" : "lazy"}
                        className="
                  h-full
                  w-full
                  object-cover

                  transition-transform
                  duration-700
                  ease-out

                  group-hover:scale-[1.06]
                "
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x300";
                        }}
                      />

                      {/* Hover Overlay */}
                      <div
                        className="
                  pointer-events-none
                  absolute
                  inset-0

                  bg-gradient-to-t
                  from-black/[0.08]
                  via-transparent
                  to-transparent

                  opacity-0

                  transition-opacity
                  duration-300

                  group-hover:opacity-100
                "
                      />
                    </div>

                    {/* ==================================================
                TITLE
            ================================================== */}
                    <h3
                      className="
                mt-2
                truncate
                text-center

                text-[11px]
                font-medium
                leading-5
                tracking-[-0.01em]

                text-[#202020]

                transition-colors
                duration-300

                group-hover:text-[#071A41]

                sm:text-[12px]
                md:text-[13px]
              "
                    >
                      {category.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ==========================================
            FEATURE PRODUCTS
        ========================================== */}

        <motion.section
          className="relative w-full overflow-hidden bg-white py-7 sm:py-10 lg:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            {/* ============================================================
        HEADING
    ============================================================ */}

            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-8"
            >
              <span
                className="
          mb-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#888888]
          sm:text-[10px]
        "
              >
                Curated For You
              </span>

              <h2
                className="
          font-serif
          text-[27px]
          font-medium
          leading-[1.05]
          tracking-[-0.035em]
          text-[#111111]
          sm:text-[34px]
          lg:text-[40px]
        "
              >
                Feature Products
              </h2>

              <p
                className="
          mt-2
          max-w-[520px]
          text-[11px]
          leading-5
          text-[#777777]
          sm:text-[13px]
          sm:leading-6
        "
              >
                Dining, living, and desk areas serve their purposes
                <br className="hidden sm:block" />
                in total harmony of style.
              </p>
            </motion.div>

            {/* ============================================================
        LOADING
    ============================================================ */}

            {isTrendingLoading ? (
              <div
                className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-2
          sm:gap-4
          lg:grid-cols-4
          lg:gap-5
          xl:gap-6
        "
              >
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="
              overflow-hidden
              rounded-[10px]
              border
              border-[#e8e6e1]
              bg-white
            "
                  >
                    {/* IMAGE */}
                    <div
                      className="
                aspect-[4/3.6]
                animate-pulse
                bg-[#f4f3ee]
              "
                    />

                    {/* CONTENT */}
                    <div className="p-3 sm:p-4">
                      <div className="h-2 w-14 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-2 h-4 w-[78%] animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-3 h-3 w-20 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-4 h-5 w-16 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-3 h-9 w-full animate-pulse rounded-[7px] bg-[#e8e6e1]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isTrendingError ? (
              /* ============================================================
                 ERROR
              ============================================================ */

              <div className="flex min-h-[180px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => refetchTrending()}
                  className="
            rounded-full
            bg-[#111111]
            px-6
            py-2.5
            text-[12px]
            font-medium
            text-white
            shadow-[0_5px_15px_rgba(0,0,0,0.12)]
            transition-all
            duration-300
            hover:bg-[#292929]
            hover:shadow-[0_8px_20px_rgba(0,0,0,0.16)]
            active:scale-[0.98]
          "
                >
                  Retry
                </button>
              </div>
            ) : (
              /* ============================================================
                 PRODUCTS
              ============================================================ */

              <div
                className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-2
          sm:gap-4
          lg:grid-cols-4
          lg:gap-5
          xl:gap-6
        "
              >
                {trendingProducts.slice(0, 4).map((p: any, index: number) => {
                  /* ======================================================
                       PRICE
                    ====================================================== */

                  const price =
                    userType === "distributor"
                      ? Number(p.distributor_price || p.retail_price || 0)
                      : Number(p.retail_price || 0);

                  const mrp =
                    userType === "distributor"
                      ? Number(p.distributor_mrp || p.retail_mrp || 0)
                      : Number(p.retail_mrp || 0);

                  /* ======================================================
                       DISCOUNT
                    ====================================================== */

                  const discount =
                    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                  /* ======================================================
                       IMAGE
                    ====================================================== */

                  const image =
                    p.images?.find((img: any) => img.is_primary)?.image_url ||
                    p.images?.[0]?.image_url ||
                    "/images/product-placeholder.png";

                  /* ======================================================
                       BRAND
                    ====================================================== */

                  const brand =
                    p.brand?.name || p.brand_name || p.brand || "Brand";

                  /* ======================================================
                       RATING
                    ====================================================== */

                  const rating =
                    p.reviews?.average_rating ??
                    p.rating ??
                    p.average_rating ??
                    0;

                  const reviews =
                    p.reviews?.total_reviews ??
                    p.review_count ??
                    p.reviews_count ??
                    0;

                  /* ======================================================
                       WISHLIST
                    ====================================================== */

                  const isWishlisted = wish[p.id] || false;

                  return (
                    <motion.div
                      key={p.id}
                      variants={scaleIn}
                      whileHover={{
                        y: -4,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="
                  group
                  relative
                  flex
                  min-w-0
                  flex-col
                  overflow-hidden
                  rounded-[10px]
                  border
                  border-[#e8e6e1]
                  bg-white
                  transition-all
                  duration-300
                  hover:border-[#d8d5ce]
                  hover:shadow-[0_16px_38px_rgba(0,0,0,0.09)]
                "
                    >
                      {/* ==================================================
                    PRODUCT IMAGE
                ================================================== */}

                      <div
                        className="
                    relative
                    aspect-[4/3.6]
                    shrink-0
                    overflow-hidden
                    bg-[#f4f3ee]
                  "
                      >
                        {/* IMAGE */}

                        <img
                          src={image}
                          alt={p.name}
                          onClick={() => router.push(`/product/${p.slug}/`)}
                          className="
                      h-full
                      w-full
                      cursor-pointer
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.045]
                    "
                          onError={(e) => {
                            e.currentTarget.src =
                              "/images/product-placeholder.png";
                          }}
                        />

                        {/* ==================================================
                      IMAGE SOFT OVERLAY
                  ================================================== */}

                        <div
                          className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/[0.08]
                      via-transparent
                      to-transparent
                      opacity-60
                    "
                        />

                        {/* ==================================================
                      TOP LEFT BADGE
                  ================================================== */}

                        <div
                          className="
                      absolute
                      left-2.5
                      top-2.5
                      sm:left-3
                      sm:top-3
                    "
                        >
                          <span
                            className="
                        inline-flex
                        items-center
                        rounded-full
                        bg-white
                        px-2
                        py-1
                        text-[7px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#111111]
                        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                        sm:px-2.5
                        sm:text-[8px]
                      "
                          >
                            {index === 0
                              ? "Promotion"
                              : index === 1
                                ? "New"
                                : index === 2
                                  ? "Favorite"
                                  : "Featured"}
                          </span>
                        </div>

                        {/* ==================================================
                      DISCOUNT
                  ================================================== */}

                        {discount > 0 && (
                          <div
                            className="
                        absolute
                        bottom-2.5
                        left-2.5
                        sm:bottom-3
                        sm:left-3
                      "
                          >
                            <span
                              className="
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-white
                          px-2
                          py-1
                          text-[8px]
                          font-semibold
                          text-[#111111]
                          shadow-[0_3px_10px_rgba(0,0,0,0.1)]
                          sm:px-2.5
                          sm:text-[9px]
                        "
                            >
                              <span className="text-[#111111]">%</span>
                              {discount}% OFF
                            </span>
                          </div>
                        )}

                        {/* ==================================================
                      WISHLIST
                  ================================================== */}

                        <button
                          type="button"
                          aria-label={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          onClick={(e) => handleToggleWishlist(p.id, p.name, e)}
                          className="
                      absolute
                      right-2.5
                      top-2.5
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#111111]
                      shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                      transition-all
                      duration-300
                      hover:bg-[#111111]
                      hover:text-white
                      active:scale-90
                      sm:right-3
                      sm:top-3
                    "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={isWishlisted ? "#111111" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                          </svg>
                        </button>

                        {/* ==================================================
                      QUICK VIEW ARROW
                  ================================================== */}

                        <button
                          type="button"
                          aria-label="View product"
                          onClick={() => router.push(`/product/${p.slug}/`)}
                          className="
                      absolute
                      bottom-2.5
                      right-2.5
                      flex
                      h-8
                      w-8
                      translate-y-2
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#111111]
                      opacity-0
                      shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:opacity-100
                      sm:bottom-3
                      sm:right-3
                    "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                          </svg>
                        </button>
                      </div>

                      {/* ==================================================
                    PRODUCT CONTENT
                ================================================== */}

                      <div
                        className="
                    flex
                    flex-1
                    flex-col
                    px-3
                    pb-3
                    pt-3
                    sm:px-4
                    sm:pb-4
                    sm:pt-3.5
                  "
                      >
                        {/* ==================================================
                      BRAND
                  ================================================== */}

                        <p
                          className="
                      min-h-[13px]
                      truncate
                      text-[8px]
                      font-semibold
                      uppercase
                      leading-[13px]
                      tracking-[0.12em]
                      text-[#888888]
                      sm:text-[9px]
                    "
                        >
                          {brand}
                        </p>

                        {/* ==================================================
                      PRODUCT NAME
                  ================================================== */}

                        <h3
                          onClick={() => router.push(`/product/${p.slug}/`)}
                          className="
                      mt-1
                      w-full
                      cursor-pointer
                      truncate
                      text-[13px]
                      font-semibold
                      leading-[1.35]
                      tracking-[-0.01em]
                      text-[#111111]
                      transition-colors
                      duration-300
                      group-hover:text-[#444444]
                      sm:text-[14px]
                    "
                        >
                          {p.name}
                        </h3>

                        {/* ==================================================
                      RATING
                  ================================================== */}

                        <div
                          className="
                      mt-2
                      flex
                      min-h-[15px]
                      items-center
                      gap-1
                    "
                        >
                          <span
                            className="
                        text-[11px]
                        leading-none
                        text-[#111111]
                      "
                          >
                            ★
                          </span>

                          <span
                            className="
                        text-[9px]
                        font-medium
                        leading-none
                        text-[#444444]
                        sm:text-[10px]
                      "
                          >
                            {Number(rating).toFixed(1)}
                          </span>

                          <span
                            className="
                        text-[9px]
                        leading-none
                        text-[#999999]
                        sm:text-[10px]
                      "
                          >
                            ({reviews})
                          </span>
                        </div>

                        {/* ==================================================
                      PRICE
                  ================================================== */}

                        <div className="mt-3 flex items-center">
                          <span
                            className="
                        text-[15px]
                        font-bold
                        leading-none
                        tracking-[-0.02em]
                        text-[#111111]
                        sm:text-[17px]
                      "
                          >
                            ₹{price.toLocaleString("en-IN")}
                          </span>

                          {mrp > price && (
                            <span
                              className="
                          ml-1.5
                          text-[9px]
                          leading-none
                          text-[#999999]
                          line-through
                          sm:text-[10px]
                        "
                            >
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* ==================================================
                      CTA
                  ================================================== */}

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAddToCart(p.id, p.name, image, price, e);
                            }}
                            className="
                        flex
                        h-9
                        w-full
                        items-center
                        justify-center
                        gap-1.5
                        rounded-[7px]
                        bg-[#111111]
                        px-3
                        text-[10px]
                        font-semibold
                        tracking-[0.01em]
                        text-white
                        shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                        transition-all
                        duration-300
                        hover:bg-[#292929]
                        hover:shadow-[0_7px_18px_rgba(0,0,0,0.15)]
                        active:scale-[0.98]
                        sm:h-10
                        sm:text-[11px]
                      "
                          >
                            <span
                              className="
                          text-[14px]
                          font-light
                          leading-none
                        "
                            >
                              +
                            </span>

                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ============================================================
        MOBILE MORE PRODUCTS
    ============================================================ */}

            <div className="mt-6 flex justify-center sm:hidden">
              <button
                type="button"
                onClick={() => router.push("/products/")}
                className="
          group
          flex
          items-center
          gap-2
          border-b
          border-[#111111]
          pb-1
          text-[11px]
          font-medium
          text-[#111111]
        "
              >
                <span>More products</span>

                <span
                  className="
            text-[16px]
            leading-none
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
        </motion.section>

        {/* ==========================================
            BANNER BEST DEAL
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
            POPULAR PRODUCTS
        ========================================== */}

        <section className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">

            {/* ============================================================
        HEADING
    ============================================================ */}

            <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
              <span
                className="
          mb-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#888888]
          sm:text-[10px]
        "
              >
                Most Loved
              </span>

              <h2
                className="
          font-serif
          text-[28px]
          font-medium
          leading-[1.05]
          tracking-[-0.035em]
          text-[#111111]
          sm:text-[34px]
          lg:text-[40px]
        "
              >
                Popular Products
              </h2>

              <p
                className="
          mx-auto
          mt-2
          max-w-[520px]
          text-[11px]
          leading-5
          text-[#777777]
          sm:text-[13px]
          sm:leading-6
        "
              >
                Dining, living, and desk areas serve their purposes
                <br className="hidden sm:block" />
                in total harmony of style.
              </p>
            </div>

            {/* ============================================================
        LOADING
    ============================================================ */}

            {isProductsLoading ? (
              <div
                className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          sm:gap-4
          lg:grid-cols-4
          xl:grid-cols-5
        "
              >
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="
              overflow-hidden
              rounded-[10px]
              border
              border-[#e8e6e1]
              bg-white
            "
                  >
                    <div
                      className="
                aspect-[4/3.6]
                animate-pulse
                bg-[#f4f3ee]
              "
                    />

                    <div className="p-3 sm:p-4">
                      <div className="h-2 w-14 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-2 h-4 w-[80%] animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-3 h-3 w-20 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-4 h-5 w-16 animate-pulse rounded bg-[#e8e6e1]" />

                      <div className="mt-3 h-9 w-full animate-pulse rounded-[7px] bg-[#e8e6e1]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isProductsError ? (
              /* ============================================================
                 ERROR
              ============================================================ */

              <div className="flex min-h-[180px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => refetchProducts()}
                  className="
            rounded-full
            bg-[#111111]
            px-6
            py-2.5
            text-[12px]
            font-medium
            text-white
            shadow-[0_5px_15px_rgba(0,0,0,0.12)]
            transition-all
            duration-300
            hover:bg-[#292929]
            active:scale-[0.98]
          "
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              /* ============================================================
                 EMPTY
              ============================================================ */

              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-[13px] text-[#777777]">
                  No products available
                </p>
              </div>
            ) : (
              <>
                {/* ==========================================================
            PRODUCTS HORIZONTAL SCROLLER
        ========================================================== */}

                <div
                  ref={scrollContainerRef}
                  className="
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            pb-3
            scrollbar-hide
            sm:gap-4
            lg:gap-5
          "
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {products.map((product: any, index: number) => {

                    /* ======================================================
                       PRICE
                    ====================================================== */

                    const price =
                      userType === "distributor"
                        ? Number(
                          product.distributor_price ||
                          product.retail_price ||
                          0
                        )
                        : Number(
                          product.retail_price || 0
                        );

                    /* ======================================================
                       MRP
                    ====================================================== */

                    const mrp =
                      userType === "distributor"
                        ? Number(
                          product.distributor_mrp ||
                          product.retail_mrp ||
                          0
                        )
                        : Number(
                          product.retail_mrp || 0
                        );

                    /* ======================================================
                       DISCOUNT
                    ====================================================== */

                    const discount =
                      mrp > price
                        ? Math.round(
                          ((mrp - price) / mrp) * 100
                        )
                        : 0;

                    /* ======================================================
                       IMAGE
                    ====================================================== */

                    const image =
                      getProductImage(product);

                    /* ======================================================
                       WISHLIST
                    ====================================================== */

                    const isWishlisted =
                      wish[product.id] || false;

                    return (
                      <div
                        key={product.id || index}
                        data-card
                        className="
                  group
                  relative
                  flex
                  min-w-[190px]
                  max-w-[205px]
                  flex-[0_0_190px]
                  snap-start
                  flex-col
                  overflow-hidden
                  rounded-[10px]
                  border
                  border-[#e8e6e1]
                  bg-white
                  transition-all
                  duration-300
                  hover:border-[#d8d5ce]
                  hover:shadow-[0_16px_38px_rgba(0,0,0,0.09)]
                  sm:min-w-[215px]
                  sm:max-w-[225px]
                  sm:flex-basis-[215px]
                  lg:min-w-[235px]
                  lg:max-w-[245px]
                  lg:flex-basis-[235px]
                "
                      >

                        {/* ==================================================
                    IMAGE
                ================================================== */}

                        <div
                          className="
                    relative
                    aspect-[4/3.6]
                    shrink-0
                    overflow-hidden
                    bg-[#f4f3ee]
                  "
                        >
                          <img
                            src={image}
                            alt={product.name}
                            className="
                      h-full
                      w-full
                      cursor-pointer
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.045]
                    "
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/placeholder.png";
                            }}
                            onClick={() =>
                              router.push(
                                `/product/${product.slug}/`
                              )
                            }
                          />

                          {/* SOFT IMAGE OVERLAY */}

                          <div
                            className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/[0.06]
                      via-transparent
                      to-transparent
                    "
                          />

                          {/* ==================================================
                      BADGE
                  ================================================== */}

                          <div className="absolute left-2.5 top-2.5">
                            <span
                              className="
                        inline-flex
                        rounded-full
                        bg-white
                        px-2
                        py-1
                        text-[7px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#111111]
                        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                        sm:px-2.5
                        sm:text-[8px]
                      "
                            >
                              {index === 0
                                ? "Popular"
                                : index === 1
                                  ? "New"
                                  : "Featured"}
                            </span>
                          </div>

                          {/* ==================================================
                      DISCOUNT
                  ================================================== */}

                          {discount > 0 && (
                            <div
                              className="
                        absolute
                        bottom-2.5
                        left-2.5
                      "
                            >
                              <span
                                className="
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-white
                          px-2
                          py-1
                          text-[8px]
                          font-semibold
                          text-[#111111]
                          shadow-[0_3px_10px_rgba(0,0,0,0.10)]
                        "
                              >
                                <span className="font-bold">
                                  %
                                </span>

                                {discount}% OFF
                              </span>
                            </div>
                          )}

                          {/* ==================================================
                      WISHLIST
                  ================================================== */}

                          <button
                            type="button"
                            aria-label={
                              isWishlisted
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                            onClick={(e) =>
                              handleToggleWishlist(
                                product.id,
                                product.name,
                                e
                              )
                            }
                            className="
                      absolute
                      right-2.5
                      top-2.5
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#111111]
                      shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                      transition-all
                      duration-300
                      hover:bg-[#111111]
                      hover:text-white
                      active:scale-90
                    "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill={
                                isWishlisted
                                  ? "#111111"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                            </svg>
                          </button>

                          {/* ==================================================
                      QUICK VIEW
                  ================================================== */}

                          <button
                            type="button"
                            aria-label="View product"
                            onClick={() =>
                              router.push(
                                `/product/${product.slug}/`
                              )
                            }
                            className="
                      absolute
                      bottom-2.5
                      right-2.5
                      flex
                      h-8
                      w-8
                      translate-y-2
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#111111]
                      opacity-0
                      shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:opacity-100
                    "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m13 6 6 6-6 6" />
                            </svg>
                          </button>
                        </div>

                        {/* ==================================================
                    CONTENT
                ================================================== */}

                        <div
                          className="
                    flex
                    flex-1
                    flex-col
                    px-3
                    pb-3
                    pt-3
                    sm:px-3.5
                    sm:pb-3.5
                  "
                        >

                          {/* PRODUCT NAME */}

                          <h3
                            onClick={() =>
                              router.push(
                                `/product/${product.slug}/`
                              )
                            }
                            className="
                      min-h-[36px]
                      cursor-pointer
                      line-clamp-2
                      text-[12px]
                      font-semibold
                      leading-[1.45]
                      tracking-[-0.01em]
                      text-[#111111]
                      transition-colors
                      duration-300
                      group-hover:text-[#444444]
                      sm:text-[13px]
                    "
                          >
                            {product.name}
                          </h3>

                          {/* MARKETPLACE */}

                          <div className="mt-2 flex items-center gap-1.5">
                            <span
                              className="
                        flex
                        h-[15px]
                        w-[15px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#111111]
                        text-[7px]
                        font-bold
                        text-white
                      "
                            >
                              M
                            </span>

                            <span
                              className="
                        truncate
                        text-[9px]
                        text-[#777777]
                        sm:text-[10px]
                      "
                            >
                              Marketplace
                            </span>
                          </div>

                          {/* RATING */}

                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-[11px] leading-none text-[#111111]">
                              ★
                            </span>

                            <span className="text-[9px] font-medium text-[#444444]">
                              {Number(
                                product.reviews?.average_rating ??
                                product.rating ??
                                product.average_rating ??
                                0
                              ).toFixed(1)}
                            </span>

                            <span className="text-[9px] text-[#999999]">
                              (
                              {product.reviews?.total_reviews ??
                                product.review_count ??
                                product.reviews_count ??
                                0}
                              )
                            </span>
                          </div>

                          {/* PRICE */}

                          <div className="mt-3 flex items-center gap-1.5">
                            <span
                              className="
                        text-[14px]
                        font-bold
                        leading-none
                        tracking-[-0.02em]
                        text-[#111111]
                        sm:text-[15px]
                      "
                            >
                              ₹{price.toLocaleString("en-IN")}
                            </span>

                            {mrp > price && (
                              <span
                                className="
                          text-[9px]
                          leading-none
                          text-[#999999]
                          line-through
                          sm:text-[10px]
                        "
                              >
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* ==================================================
                      CTA
                  ================================================== */}

                          <button
                            type="button"
                            onClick={(e) =>
                              handleAddToCart(
                                product.id,
                                product.name,
                                image,
                                price,
                                e
                              )
                            }
                            className="
                      mt-3
                      flex
                      h-9
                      w-full
                      items-center
                      justify-center
                      gap-1.5
                      rounded-[7px]
                      bg-[#111111]
                      px-3
                      text-[10px]
                      font-semibold
                      text-white
                      shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                      transition-all
                      duration-300
                      hover:bg-[#292929]
                      hover:shadow-[0_7px_18px_rgba(0,0,0,0.15)]
                      active:scale-[0.98]
                      sm:h-9.5
                      sm:text-[11px]
                    "
                          >
                            <span className="text-[14px] font-light leading-none">
                              +
                            </span>

                            <span>
                              Add to Cart
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ============================================================
            SLIDER DOTS
        ============================================================ */}

                <div className="mt-5 flex justify-center gap-1.5">
                  {products.slice(0, 10).map(
                    (_: any, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setCurrentIndex(index)
                        }
                        className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${currentIndex === index
                            ? "w-7 bg-[#111111]"
                            : "w-1.5 bg-[#d8d8d8] hover:bg-[#999999]"
                          }
                `}
                        aria-label={`Go to product ${index + 1}`}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ==========================================
            SHOP BY CATEGORY — TABS
        ========================================== */}

        <section className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12">
          <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-8 xl:px-10">

            {/* ============================================================
        TABS
    ============================================================ */}

            <div className="mb-7 flex items-center justify-center gap-5 sm:mb-8 sm:gap-8 lg:gap-10">
              {["New Arrivals", "Best Seller", "Best Offers"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`
            relative
            pb-2
            text-[13px]
            font-semibold
            tracking-[-0.01em]
            transition-colors
            duration-200
            sm:text-[16px]
            lg:text-[18px]
            ${activeTab === tab
                      ? "text-[#111111]"
                      : "text-[#777777] hover:text-[#111111]"
                    }
          `}
                >
                  {tab}

                  {activeTab === tab && (
                    <span
                      className="
                absolute
                bottom-0
                left-0
                h-[2px]
                w-full
                rounded-full
                bg-[#111111]
              "
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ============================================================
        MAIN CONTENT
    ============================================================ */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr] xl:grid-cols-[390px_1fr]">

              {/* ==========================================================
          PROMO BANNER
      ========================================================== */}

              {topDiscountedProducts.length > 0 ? (
                (() => {
                  const item = topDiscountedProducts[0];
                  const product = item?.product || item;
                  const discounts = item?.discounts;

                  const price =
                    userType === "distributor"
                      ? Number(
                        discounts?.distributor?.price ||
                        product?.distributor_price ||
                        product?.retail_price ||
                        0
                      )
                      : Number(
                        discounts?.retail?.price ||
                        product?.retail_price ||
                        0
                      );

                  const mrp =
                    userType === "distributor"
                      ? Number(
                        discounts?.distributor?.mrp ||
                        product?.distributor_mrp ||
                        product?.retail_mrp ||
                        0
                      )
                      : Number(
                        discounts?.retail?.mrp ||
                        product?.retail_mrp ||
                        0
                      );

                  const discountPercentage =
                    userType === "distributor"
                      ? discounts?.distributor?.discount_percentage ||
                      getDiscountPercentage(product, userType)
                      : discounts?.retail?.discount_percentage ||
                      getDiscountPercentage(product, userType);

                  const image =
                    product?.primary_image_url ||
                    product?.images?.find(
                      (img: any) => img?.is_primary
                    )?.image_url ||
                    product?.images?.[0]?.image_url ||
                    "/images/placeholder.png";

                  return (
                    <div
                      className="
                relative
                min-h-[440px]
                overflow-hidden
                rounded-[10px]
                bg-[#111111]
                sm:min-h-[500px]
                lg:min-h-[560px]
              "
                    >
                      {/* BACKGROUND IMAGE */}

                      <img
                        src={image}
                        alt={
                          product?.name ||
                          "Top Discounted Product"
                        }
                        className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  opacity-75
                  transition-transform
                  duration-700
                  hover:scale-[1.04]
                "
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/placeholder.png";
                        }}
                      />

                      {/* DARK GRADIENT */}

                      <div
                        className="
                  absolute
                  inset-0
                  bg-gradient-to-b
                  from-black/10
                  via-black/35
                  to-black/90
                "
                      />

                      {/* CONTENT */}

                      <div
                        className="
                  relative
                  z-10
                  flex
                  min-h-[440px]
                  h-full
                  flex-col
                  items-center
                  justify-between
                  px-5
                  py-7
                  text-center
                  sm:min-h-[500px]
                  sm:px-7
                  sm:py-8
                  lg:min-h-[560px]
                  lg:px-8
                "
                      >
                        {/* TOP */}

                        <div>
                          <p
                            className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-white/85
                      sm:text-[10px]
                    "
                          >
                            Limited Time Offer
                          </p>

                          {/* COUNTDOWN */}

                          {countdownExpired ? (
                            <div
                              className="
                        mt-3
                        inline-flex
                        items-center
                        rounded-full
                        bg-white
                        px-4
                        py-2
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-[#111111]
                        shadow-lg
                      "
                            >
                              Deal Ended
                            </div>
                          ) : (
                            <div
                              className="
                        mt-3
                        inline-flex
                        items-center
                        gap-1
                        rounded-[7px]
                        bg-white
                        px-3.5
                        py-2
                        font-mono
                        text-[14px]
                        font-bold
                        tracking-[0.06em]
                        text-[#111111]
                        shadow-lg
                        sm:text-[16px]
                      "
                            >
                              <span>
                                {formatTime(timeLeft.days)}
                              </span>

                              <span>:</span>

                              <span>
                                {formatTime(timeLeft.hours)}
                              </span>

                              <span>:</span>

                              <span>
                                {formatTime(timeLeft.minutes)}
                              </span>

                              <span>:</span>

                              <span>
                                {formatTime(timeLeft.seconds)}
                              </span>
                            </div>
                          )}

                          {!countdownExpired && (
                            <div
                              className="
                        mt-1
                        flex
                        justify-center
                        gap-[11px]
                        text-[7px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-white/65
                      "
                            >
                              <span>Days</span>
                              <span>Hours</span>
                              <span>Min</span>
                              <span>Sec</span>
                            </div>
                          )}

                          {/* DISCOUNT */}

                          {discountPercentage > 0 && (
                            <div
                              className="
                        mt-3
                        inline-flex
                        items-center
                        rounded-full
                        bg-white
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-[#111111]
                        shadow-md
                      "
                            >
                              Up to {discountPercentage}% Off
                            </div>
                          )}
                        </div>

                        {/* BOTTOM */}

                        <div className="w-full max-w-[310px] pb-1">

                          <h3
                            className="
                      text-[24px]
                      font-bold
                      leading-[1.12]
                      tracking-[-0.025em]
                      text-white
                      sm:text-[28px]
                    "
                          >
                            {product?.name}
                          </h3>

                          {product?.description && (
                            <p
                              className="
                        mt-2
                        line-clamp-2
                        text-[11px]
                        leading-5
                        text-white/80
                        sm:text-[12px]
                      "
                            >
                              {product.description}
                            </p>
                          )}

                          {/* PRICE */}

                          <div className="mt-3 flex items-center justify-center gap-2.5">
                            {mrp > price && (
                              <span
                                className="
                          text-[12px]
                          font-medium
                          text-white/55
                          line-through
                        "
                              >
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                            )}

                            <span
                              className="
                        text-[19px]
                        font-bold
                        text-white
                        sm:text-[21px]
                      "
                            >
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          {product?.category?.name && (
                            <p className="mt-1.5 text-[9px] text-white/60">
                              {product.category.name}
                            </p>
                          )}

                          {/* SHOP NOW */}

                          <button
                            type="button"
                            disabled={!product?.slug}
                            onClick={() => {
                              if (product?.slug) {
                                router.push(
                                  `/product/${product.slug}/`
                                );
                              }
                            }}
                            className="
                      mt-4
                      rounded-[7px]
                      bg-white
                      px-6
                      py-2.5
                      text-[11px]
                      font-semibold
                      text-[#111111]
                      shadow-lg
                      transition-all
                      duration-300
                      hover:bg-[#111111]
                      hover:text-white
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                          >
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div
                  className="
            flex
            min-h-[440px]
            items-center
            justify-center
            rounded-[10px]
            bg-[#f4f3ee]
            sm:min-h-[500px]
            lg:min-h-[560px]
          "
                >
                  <p className="text-[12px] font-medium text-[#777777]">
                    No offer available
                  </p>
                </div>
              )}

              {/* ==========================================================
          PRODUCT GRID
      ========================================================== */}

              <div
                className="
          grid
          grid-cols-2
          items-start
          gap-3
          sm:gap-4
          md:grid-cols-4
        "
              >
                {(() => {
                  let activeProducts: any[] = [];
                  let badgeText = "NEW";

                  if (activeTab === "New Arrivals") {
                    activeProducts = newArrivals;
                    badgeText = "NEW";
                  } else if (activeTab === "Best Seller") {
                    activeProducts = bestSellers;
                    badgeText = "BESTSELLER";
                  } else {
                    activeProducts = bestOffers;
                    badgeText = "OFFER";
                  }

                  {/* ======================================================
              LOADING
          ====================================================== */}

                  if (isFetching) {
                    return (
                      <div
                        className="
                  col-span-2
                  grid
                  grid-cols-2
                  gap-3
                  md:col-span-4
                  md:grid-cols-4
                "
                      >
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="
                      overflow-hidden
                      rounded-[10px]
                      border
                      border-[#e8e6e1]
                      bg-white
                    "
                          >
                            <div
                              className="
                        aspect-[4/3.6]
                        animate-pulse
                        bg-[#f4f3ee]
                      "
                            />

                            <div className="p-3">
                              <div className="h-2 w-14 animate-pulse rounded bg-[#e8e6e1]" />

                              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#e8e6e1]" />

                              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-[#e8e6e1]" />

                              <div className="mt-3 h-5 w-16 animate-pulse rounded bg-[#e8e6e1]" />

                              <div className="mt-3 h-9 w-full animate-pulse rounded-[7px] bg-[#e8e6e1]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  {/* ======================================================
              ERROR
          ====================================================== */}

                  if (isError) {
                    return (
                      <div
                        className="
                  col-span-2
                  flex
                  min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  md:col-span-4
                "
                      >
                        <p className="text-[13px] font-semibold text-[#555555]">
                          Failed to load products
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            window.location.reload()
                          }
                          className="
                    mt-4
                    rounded-full
                    bg-[#111111]
                    px-5
                    py-2
                    text-[11px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#292929]
                  "
                        >
                          Retry
                        </button>
                      </div>
                    );
                  }

                  {/* ======================================================
              EMPTY
          ====================================================== */}

                  if (activeProducts.length === 0) {
                    return (
                      <div
                        className="
                  col-span-2
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                  md:col-span-4
                "
                      >
                        <p className="text-[13px] font-medium text-[#777777]">
                          No products available
                        </p>
                      </div>
                    );
                  }

                  {/* ======================================================
              PRODUCTS
          ====================================================== */}

                  return activeProducts.map(
                    (product: any, index: number) => {

                      const price =
                        userType === "distributor"
                          ? Number(
                            product.distributor_price ||
                            product.current_price ||
                            product.retail_price ||
                            0
                          )
                          : Number(
                            product.current_price ||
                            product.retail_price ||
                            0
                          );

                      const mrp =
                        userType === "distributor"
                          ? Number(
                            product.distributor_mrp ||
                            product.original_price ||
                            product.retail_mrp ||
                            0
                          )
                          : Number(
                            product.original_price ||
                            product.retail_mrp ||
                            0
                          );

                      const discount =
                        mrp > price
                          ? Math.round(
                            ((mrp - price) / mrp) * 100
                          )
                          : 0;

                      const image =
                        product.primary_image_url ||
                        product.images?.find(
                          (img: any) => img?.is_primary
                        )?.image_url ||
                        product.images?.[0]?.image_url ||
                        "/images/placeholder.png";

                      const rating =
                        product.reviews_summary
                          ?.average_rating ?? 0;

                      const reviews =
                        product.reviews_summary
                          ?.total_reviews ?? 0;

                      const isWishlisted =
                        wish[product.id] || false;

                      return (
                        <div
                          key={`${product.id}-${index}`}
                          className="
                    group
                    relative
                    flex
                    min-w-0
                    w-full
                    flex-col
                    self-start
                    overflow-hidden
                    rounded-[10px]
                    border
                    border-[#e8e6e1]
                    bg-white
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#d8d5ce]
                    hover:shadow-[0_16px_38px_rgba(0,0,0,0.09)]
                  "
                        >

                          {/* ==================================================
                      IMAGE
                  ================================================== */}

                          <div
                            className="
                      relative
                      aspect-[4/3.6]
                      shrink-0
                      overflow-hidden
                      bg-[#f4f3ee]
                    "
                          >
                            <img
                              src={image}
                              alt={product.name}
                              loading={
                                index < 4
                                  ? "eager"
                                  : "lazy"
                              }
                              className="
                        h-full
                        w-full
                        cursor-pointer
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-[1.045]
                      "
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/placeholder.png";
                              }}
                              onClick={() => {
                                if (product?.slug) {
                                  router.push(
                                    `/product/${product.slug}/`
                                  );
                                }
                              }}
                            />

                            {/* SOFT OVERLAY */}

                            <div
                              className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/[0.06]
                        via-transparent
                        to-transparent
                      "
                            />

                            {/* ==================================================
                        BADGE
                    ================================================== */}

                            <span
                              className="
                        absolute
                        left-2.5
                        top-2.5
                        rounded-full
                        bg-white
                        px-2
                        py-1
                        text-[7px]
                        font-semibold
                        uppercase
                        tracking-[0.1em]
                        text-[#111111]
                        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                        sm:text-[8px]
                      "
                            >
                              {badgeText}
                            </span>

                            {/* ==================================================
                        DISCOUNT
                    ================================================== */}

                            {discount > 0 && (
                              <span
                                className="
                          absolute
                          bottom-2.5
                          left-2.5
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
                                {discount}% OFF
                              </span>
                            )}

                            {/* ==================================================
                        WISHLIST
                    ================================================== */}

                            <button
                              type="button"
                              aria-label={`Add ${product.name} to wishlist`}
                              onClick={(e) =>
                                handleToggleWishlist(
                                  product.id,
                                  product.name,
                                  e
                                )
                              }
                              className="
                        absolute
                        right-2.5
                        top-2.5
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-[#111111]
                        shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                        transition-all
                        duration-300
                        hover:bg-[#111111]
                        hover:text-white
                        active:scale-90
                      "
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-[15px] w-[15px]"
                                fill={
                                  isWishlisted
                                    ? "#111111"
                                    : "none"
                                }
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

                            {/* QUICK VIEW */}

                            <button
                              type="button"
                              onClick={() => {
                                if (product?.slug) {
                                  router.push(
                                    `/product/${product.slug}/`
                                  );
                                }
                              }}
                              className="
                        absolute
                        bottom-2.5
                        right-2.5
                        flex
                        h-8
                        w-8
                        translate-y-2
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-[#111111]
                        opacity-0
                        shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                        transition-all
                        duration-300
                        group-hover:translate-y-0
                        group-hover:opacity-100
                      "
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 12h14" />
                                <path d="m13 6 6 6-6 6" />
                              </svg>
                            </button>
                          </div>

                          {/* ==================================================
                      CONTENT
                  ================================================== */}

                          <div
                            className="
                      flex
                      flex-1
                      flex-col
                      px-3
                      pb-3
                      pt-3
                      sm:px-3.5
                      sm:pb-3.5
                    "
                          >
                            {/* NAME */}

                            <h3
                              onClick={() => {
                                if (product?.slug) {
                                  router.push(
                                    `/product/${product.slug}/`
                                  );
                                }
                              }}
                              className="
                        min-h-[36px]
                        cursor-pointer
                        line-clamp-2
                        text-[12px]
                        font-semibold
                        leading-[1.45]
                        tracking-[-0.01em]
                        text-[#111111]
                        transition-colors
                        duration-300
                        group-hover:text-[#444444]
                        sm:text-[13px]
                      "
                            >
                              {product.name}
                            </h3>

                            {/* MARKETPLACE */}

                            <div className="mt-2 flex items-center gap-1.5">
                              <span
                                className="
                          flex
                          h-[15px]
                          w-[15px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-[#111111]
                          text-[7px]
                          font-bold
                          text-white
                        "
                              >
                                M
                              </span>

                              <span
                                className="
                          truncate
                          text-[9px]
                          text-[#777777]
                          sm:text-[10px]
                        "
                              >
                                Marketplace
                              </span>
                            </div>

                            {/* RATING */}

                            <div className="mt-2 flex items-center gap-1">
                              <span className="text-[11px] leading-none text-[#111111]">
                                ★
                              </span>

                              <span className="text-[9px] font-medium text-[#444444]">
                                {Number(rating).toFixed(1)}
                              </span>

                              <span className="text-[9px] text-[#999999]">
                                ({reviews})
                              </span>
                            </div>

                            {/* PRICE */}

                            <div className="mt-3 flex items-center gap-1.5">
                              <span
                                className="
                          text-[14px]
                          font-bold
                          leading-none
                          tracking-[-0.02em]
                          text-[#111111]
                          sm:text-[15px]
                        "
                              >
                                ₹{price.toLocaleString("en-IN")}
                              </span>

                              {mrp > price && (
                                <span
                                  className="
                            text-[9px]
                            leading-none
                            text-[#999999]
                            line-through
                            sm:text-[10px]
                          "
                                >
                                  ₹{mrp.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            {/* CTA */}

                            <button
                              type="button"
                              onClick={(e) =>
                                handleAddToCart(
                                  product.id,
                                  product.name,
                                  image,
                                  price,
                                  e
                                )
                              }
                              className="
                        mt-3
                        flex
                        h-9
                        w-full
                        items-center
                        justify-center
                        gap-1.5
                        rounded-[7px]
                        bg-[#111111]
                        px-3
                        text-[10px]
                        font-semibold
                        text-white
                        shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                        transition-all
                        duration-300
                        hover:bg-[#292929]
                        hover:shadow-[0_7px_18px_rgba(0,0,0,0.15)]
                        active:scale-[0.98]
                        sm:text-[11px]
                      "
                            >
                              <span className="text-[14px] font-light leading-none">
                                +
                              </span>

                              <span>
                                Add to Cart
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    }
                  );
                })()}
              </div>
            </div>
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
            REELS
        ========================================== */}

        ```tsx
        <motion.section
          className="relative w-full overflow-hidden bg-white py-8 sm:py-10 lg:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">

            {/* ============================================================
        HEADING
    ============================================================ */}

            <motion.div
              variants={fadeInUp}
              className="mb-6 flex flex-col items-center text-center sm:mb-8"
            >
              <span
                className="
          mb-2
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-[#888888]
          sm:text-[10px]
        "
              >
                Most Loved
              </span>

              <h2
                className="
          font-serif
          text-[28px]
          font-medium
          leading-[1.05]
          tracking-[-0.035em]
          text-[#111111]
          sm:text-[34px]
          lg:text-[40px]
        "
              >
                Shop the Reels
              </h2>

              <p
                className="
          mt-2
          max-w-[520px]
          text-[11px]
          leading-5
          text-[#777777]
          sm:text-[13px]
          sm:leading-6
        "
              >
                Discover how creators style their favourite pieces.
                <br className="hidden sm:block" />
                Tap any reel to explore and shop the look.
              </p>
            </motion.div>

            {/* ============================================================
        LOADING
    ============================================================ */}

            {isReelsLoading ? (
              <div className="flex gap-4 overflow-hidden pb-3 lg:gap-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="
              h-[400px]
              w-[240px]
              flex-shrink-0
              animate-pulse
              rounded-[20px]
              bg-[#f4f3ee]
              sm:h-[460px]
              sm:w-[260px]
            "
                  />
                ))}
              </div>

            ) : reelsError ? (

              /* ============================================================
                  ERROR
              ============================================================ */

              <motion.div
                variants={fadeInUp}
                className="
          flex
          min-h-[220px]
          items-center
          justify-center
          border
          border-[#e8e6e1]
          bg-white
        "
              >
                <div className="px-5 text-center">

                  <div
                    className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-[#dedbd5]
              bg-[#f7f7f5]
              text-base
              font-semibold
              text-[#111111]
            "
                  >
                    !
                  </div>

                  <h3
                    className="
              mt-4
              font-serif
              text-lg
              font-medium
              text-[#111111]
            "
                  >
                    Something went wrong
                  </h3>

                  <p className="mt-1.5 text-[11px] text-[#777777] sm:text-[12px]">
                    We couldn't load the reels right now.
                  </p>

                </div>
              </motion.div>

            ) : (

              <>
                {/* ============================================================
            REELS RAIL
            CARD DESIGN IS NOT CHANGED
        ============================================================ */}

                <div
                  ref={rail}
                  className="
            flex
            justify-center
            gap-4
            overflow-x-auto
            overflow-y-hidden
            pb-5
            pt-2
            snap-x
            snap-mandatory
            scrollbar-hide
            sm:gap-4
            lg:gap-5
          "
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {(reelsData?.data || []).map(
                    (r: any, index: number) => (
                      <ReelCard
                        key={r?.id || `reel-${index}`}
                        reel={r}
                        router={router}
                        getProductImage={getProductImage}
                        getProductPrice={getProductPrice}
                        userType={userType}
                      />
                    )
                  )}
                </div>

                {/* ============================================================
            EMPTY STATE
        ============================================================ */}

                {(reelsData?.data || []).length === 0 && (
                  <motion.div
                    variants={fadeInUp}
                    className="
              flex
              min-h-[180px]
              items-center
              justify-center
              border
              border-[#e8e6e1]
              bg-white
            "
                  >
                    <div className="text-center">

                      <div
                        className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f7f7f5]
                  text-[#111111]
                "
                      >
                        ✦
                      </div>

                      <h3
                        className="
                  mt-4
                  font-serif
                  text-lg
                  font-medium
                  text-[#111111]
                "
                      >
                        No reels available
                      </h3>

                      <p className="mt-1.5 text-[11px] text-[#777777] sm:text-[12px]">
                        New creator looks are coming soon.
                      </p>

                    </div>
                  </motion.div>
                )}

                {/* ============================================================
            CONTROLS
        ============================================================ */}

                {(reelsData?.data || []).length > 0 && (
                  <div className="mt-3 flex items-center justify-between">

                    {/* LEFT SPACE */}

                    <div className="flex-1" />

                    {/* ========================================================
                DOTS
            ======================================================== */}

                    <div className="flex items-center justify-center gap-1.5">

                      {(reelsData?.data || [])
                        .slice(0, 6)
                        .map((_: any, index: number) => (
                          <motion.span
                            key={index}
                            animate={
                              index === 0
                                ? {
                                  width: 24,
                                  opacity: 1,
                                }
                                : {
                                  width: 6,
                                  opacity: 0.35,
                                }
                            }
                            transition={{
                              duration: 0.35,
                            }}
                            className="h-[6px] rounded-full bg-[#111111]"
                          />
                        ))}

                    </div>

                    {/* ========================================================
                ARROWS
            ======================================================== */}

                    <div className="flex flex-1 justify-end">

                      {/* PREVIOUS */}

                      <motion.button
                        type="button"
                        aria-label="Previous reels"
                        onClick={() => scrollReel(-1)}
                        whileHover={{
                          scale: 1.06,
                        }}
                        whileTap={{
                          scale: 0.92,
                        }}
                        className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#dedbd5]
                  bg-white
                  text-[#111111]
                  shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                  transition-all
                  duration-300
                  hover:border-[#111111]
                  hover:bg-[#111111]
                  hover:text-white
                "
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </motion.button>

                      {/* NEXT */}

                      <motion.button
                        type="button"
                        aria-label="Next reels"
                        onClick={() => scrollReel(1)}
                        whileHover={{
                          scale: 1.06,
                        }}
                        whileTap={{
                          scale: 0.92,
                        }}
                        className="
                  ml-2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#111111]
                  bg-[#111111]
                  text-white
                  shadow-[0_5px_15px_rgba(0,0,0,0.10)]
                  transition-all
                  duration-300
                  hover:bg-[#292929]
                "
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </motion.button>

                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.section>
        ```


        {/* ==========================================
            GROWTH LADDER
        ========================================== */}

        <GrowthLadderScroll title={growthTitle} steps={growthSteps} />

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
