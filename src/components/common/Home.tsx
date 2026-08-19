"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import s from "./IndieKonnectHome.module.css";
import {
  ticker,
  heroStats,
  promises,
} from "./catalog";

import Header from "./Header";
import {
  useGetContentsQuery,
  useGetDealOfTheDayProductsQuery,
  useGetGrowthStepsQuery,
  useGetReelsQuery,
  useGetStatsQuery,
  useGetTopDiscountedProductsQuery,
  useGetTrendingProductsQuery,
} from "@/lib/redux/api/Home/contentApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useAddToCartMutation, useUpdateCartItemMutation } from "@/lib/redux/api/cartApi";
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { Craft } from "../home/components/sections/Craft";
import { Nation } from "../home/components/sections/Nation";


const fadeInUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const floatAnimation = {
  y: [0, -14, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

export default function IndieKonnectHome() {
  const router = useRouter();
  const [cart, setCart] = useState(2);
  const [wish, setWish] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("All");
  const [level, setLevel] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const rail = useRef<HTMLDivElement>(null);

  const { data: apiResponse, isLoading, error } = useGetContentsQuery({});
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery({});

  const { data: dealProductsResponse, isLoading: isDealProductsLoading } =
    useGetDealOfTheDayProductsQuery();

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

  // API hooks for cart and wishlist
  const [addToCartMutation, { isLoading: isAddToCartLoading }] = useAddToCartMutation();
  const [addToWishlistMutation, { isLoading: isAddToWishlistLoading }] = useAddToWishlistMutation();
  const [removeFromWishlistMutation, { isLoading: isRemoveFromWishlistLoading }] = useRemoveFromWishlistMutation();
  const {
    data: topDiscountedData,
    isLoading: isTopDiscountedLoading,
    isError: isTopDiscountedError,
  } = useGetTopDiscountedProductsQuery();

  const topDiscountedProducts = topDiscountedData?.data ?? [];
  const topDiscountedProduct = topDiscountedProducts?.[0]?.product || null;

  const [updateCartItemMutation, { isLoading: isUpdatingCart }] = useUpdateCartItemMutation();
  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery({});
  const { data: statsData, isLoading: isStatsLoading } = useGetStatsQuery();
  const {
    data: growthStepsData,
    isLoading: isGrowthStepsLoading,
  } = useGetGrowthStepsQuery();

  const growthSteps =
    growthStepsData?.data?.steps?.filter((step) => step.is_active) ?? [];

  const growthTitle =
    growthStepsData?.data?.title || "A growth ladder for leaders";

  // Active level index ko safe rakho
  const activeLevel =
    growthSteps.length > 0
      ? Math.min(level, growthSteps.length - 1)
      : 0;

  // Previous level
  const handlePreviousLevel = () => {
    if (growthSteps.length <= 1) return;

    setLevel((current) =>
      current === 0 ? growthSteps.length - 1 : current - 1
    );
  };

  // Next level
  const handleNextLevel = () => {
    if (growthSteps.length <= 1) return;

    setLevel((current) =>
      current === growthSteps.length - 1 ? 0 : current + 1
    );
  };
  const statistics = statsData?.data?.statistics;
  const reviews = statsData?.data?.reviews ?? [];

  // API reviews ko testimonial format me convert kar rahe hain
  const testimonials = reviews.map((review: any) => ({
    quote: review.review_text,
    name: review.user.full_name,
    loc: review.user.state,
    img: review.user.profile_picture,
    rating: review.rating,
  }));

  const trendingProducts = trendingResponse?.data ?? [];
  const dealProduct = dealProductsResponse?.data?.[0];
  const isDistributor = false;

  // Transform categories data
  const categories = useMemo(() => {
    if (!categoriesData) return [];

    const rawData = categoriesData.data || categoriesData;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (rawData?.data && Array.isArray(rawData.data)) {
      return rawData.data;
    }

    if (rawData?.categories && Array.isArray(rawData.categories)) {
      return rawData.categories;
    }

    if (rawData?.items && Array.isArray(rawData.items)) {
      return rawData.items;
    }

    return [];
  }, [categoriesData]);

  // Makeup category ka ID find karo
  const makeupCategory = useMemo(() => {
    return categories.find(
      (cat: any) => cat.title?.toLowerCase() === "makeup"
    );
  }, [categories]);

  // Makeup products fetch karo
  const {
    data: makeupProductsResponse,
    isLoading: isMakeupLoading,
    isError: isMakeupError,
    refetch: refetchMakeupProducts,
  } = useGetProductsQuery(
    {
      category_ids: makeupCategory?.id ? [makeupCategory.id] : [],
      is_published: 1,
      per_page: 12,
      page: 1,
    },
    {
      skip: !makeupCategory?.id,
    }
  );

  const makeupProducts = makeupProductsResponse?.data ?? [];

  useEffect(() => {
    if (wishlistData?.data) {
      const wishlistItems = wishlistData.data;
      const wishState: Record<string, boolean> = {};
      wishlistItems.forEach((item: any) => {
        if (item.product_id) {
          wishState[item.product_id] = true;
        }
      });
      setWish(wishState);
    }
  }, [wishlistData]);

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / maxScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dealPricing = useMemo(() => {
    if (!dealProduct) return { mrp: 0, price: 0, discount: 0 };
    const mrp = isDistributor
      ? Number(dealProduct.distributor_mrp ?? 0)
      : Number(dealProduct.retail_mrp ?? 0);
    const price = isDistributor
      ? Number(dealProduct.distributor_price ?? 0)
      : Number(dealProduct.retail_price ?? 0);
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    return { mrp, price, discount };
  }, [dealProduct, isDistributor]);

  const formatViews = (count: number) => {
    if (!count) return "0";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  const getProductImage = (product: any) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img.thumbnail_url);
      return (
        primary?.image_url ||
        product.images[0]?.image_url ||
        "/images/placeholder.png"
      );
    }
    return "/images/placeholder.png";
  };

  const getProductPrice = (product: any) => {
    if (!product) return "₹0";
    const price = Number(product.retail_price || 0);
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getCreatorAvatar = (creatorHandle: string) => {
    if (!creatorHandle) {
      return "https://ui-avatars.com/api/?name=Creator&background=C9A96E&color=fff&size=60&bold=true";
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorHandle)}&background=C9A96E&color=fff&size=60&bold=true`;
  };

  const calculateTimeLeft = () => {
    if (!dealProduct?.deal_of_the_day_ends_at) {
      return { h: "00", m: "00", s: "00" };
    }
    const difference =
      new Date(dealProduct.deal_of_the_day_ends_at).getTime() -
      new Date().getTime();
    if (difference <= 0) {
      return { h: "00", m: "00", s: "00" };
    }
    return {
      h: String(Math.floor(difference / (1000 * 60 * 60))).padStart(2, "0"),
      m: String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0"),
      s: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
    };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [dealProduct]);

  useEffect(() => {
    const t = setInterval(
      () => setTestimonialIndex((i) => (i + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(t);
  }, [testimonials.length]);

  const handleDealClick = () => {
    if (!dealProduct?.slug) return;
    router.push(`/product/${dealProduct.slug}/`);
  };

  const homeContent = apiResponse?.data?.find(
    (item: any) => item.slug === "home" || item.title === "Home",
  );
  const bannerBlock = homeContent?.blocks?.[0] || null;

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
    const stripped = stripHtml(html);
    return stripped || "";
  };

  // Custom Toast Messages
  const showCustomToast = (type: 'success' | 'error' | 'info', message: string, productName?: string) => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
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
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
      success: '#4BBF8A',
      error: '#FF4757',
      info: '#C9A96E'
    };

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

    toast.addEventListener('mouseenter', () => {
      toast.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.2), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.8),
                              0 0 40px ${colors[type]}20`;
    });
    toast.addEventListener('mouseleave', () => {
      toast.style.boxShadow = `0 15px 50px rgba(0, 0, 0, 0.15), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.6)`;
    });

    const iconMap = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };

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
            ${productName || ''}
          </div>
          <div style="font-size:13.5px;color:#4a4a4a;line-height:1.4;font-weight:400;">
            ${message}
          </div>
        </div>
        <button style="
          background: none;
          border: none;
          color: #999;
          font-size: 18px;
          cursor: pointer;
          padding: 0 0 0 8px;
          transition: color 0.2s;
          line-height: 1;
        " class="toast-close-btn">
          ×
        </button>
      </div>
    `;

    const container = document.getElementById('toast-container');
    container?.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn?.addEventListener('click', () => {
      toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => {
        toast.remove();
        if (container?.children.length === 0) {
          container.remove();
        }
      }, 400);
    });

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
          toast.remove();
          if (container?.children.length === 0) {
            container.remove();
          }
        }, 400);
      }
    }, 4000);
  };

  // Add to Cart Handler with Sidebar
  const handleAddToCart = async (
    productId: string | number,
    productName: string,
    productImage: string,
    productPrice: number
  ) => {
    try {
      const response = await addToCartMutation({
        product_id: productId,
        quantity: 1,
      }).unwrap();
      if (
        response?.message === "Item added to cart successfully" ||
        response?.data?.items
      ) {
        setCart((c) => c + 1);

        const newItem = {
          id: productId,
          name: productName,
          image: productImage,
          price: productPrice,
          quantity: 1,
        };

        setCartItems((prev) => {
          const existing = prev.find(
            (item) => item.id === productId
          );

          if (existing) {
            return prev.map((item) =>
              item.id === productId
                ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
                : item
            );
          }

          return [...prev, newItem];
        });

        setCartTotal((prev) => prev + productPrice);
        setCartSidebarOpen(true);
      } else {
        throw new Error(
          response?.message || "Failed to add item to cart"
        );
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);

      showCustomToast(
        "error",
        error?.data?.message ||
        error?.message ||
        "Failed to add item to cart",
        productName
      );
    }
  };

  const handleToggleWishlist = async (
    productId: string | number,
    productName: string
  ) => {
    const isWishlisted = wish[productId] || false;

    try {
      if (isWishlisted) {
        const response = await removeFromWishlistMutation({
          product_id: productId,
        }).unwrap();

        console.log("Remove wishlist response:", response);

        if (
          response?.message ||
          response?.data ||
          response?.success === true
        ) {
          setWish((w) => ({
            ...w,
            [productId]: false,
          }));

          showCustomToast(
            "success",
            "Removed from your wishlist ❤️",
            productName
          );

          refetchWishlist();
        } else {
          throw new Error(
            response?.message || "Failed to remove from wishlist"
          );
        }
      } else {
        const response = await addToWishlistMutation({
          product_id: productId,
        }).unwrap();

        console.log("Add wishlist response:", response);

        const responseMessage =
          response?.message?.toLowerCase?.() || "";

        if (
          response?.already_exists ||
          responseMessage.includes("already") &&
          responseMessage.includes("wishlist")
        ) {
          setWish((w) => ({
            ...w,
            [productId]: true,
          }));

          showCustomToast(
            "info",
            "Already in your wishlist ❤️",
            productName
          );

          refetchWishlist();
          return;
        }

        if (
          response?.message ||
          response?.data ||
          response?.success === true
        ) {
          setWish((w) => ({
            ...w,
            [productId]: true,
          }));

          showCustomToast(
            "success",
            "Added to wishlist! ❤️",
            productName
          );

          refetchWishlist();
        } else {
          throw new Error(
            response?.message || "Failed to add to wishlist"
          );
        }
      }
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "";

      const lowerErrorMessage =
        errorMessage.toLowerCase();

      if (
        lowerErrorMessage.includes("already") &&
        lowerErrorMessage.includes("wishlist")
        || error?.data?.already_exists
      ) {
        setWish((w) => ({
          ...w,
          [productId]: true,
        }));

        showCustomToast(
          "info",
          "Already in your wishlist ❤️",
          productName
        );

        refetchWishlist();
        return;
      }

      showCustomToast(
        "error",
        errorMessage || "Failed to update wishlist",
        productName
      );
    }
  };


  const scrollReel = (dir: number) =>
    rail.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

  // View Cart Handler
  const handleViewCart = () => {
    setCartSidebarOpen(true);
  };

  // Close Cart Sidebar
  const handleCloseCart = () => {
    setCartSidebarOpen(false);
  };

  const handleUpdateCart = async (
    itemId: number,
    productId: number,
    action: "increment" | "decrement"
  ) => {
    try {
      const response = await updateCartItemMutation({
        itemId: itemId,
        data: {
          product_id: productId,
          quantity: 1,
          action: action,
        },
      }).unwrap();

      console.log("Update cart response:", response);

      showCustomToast(
        "success",
        action === "increment"
          ? "Quantity increased successfully"
          : "Quantity decreased successfully"
      );

    } catch (error: any) {
      console.error("Update cart error:", error);

      showCustomToast(
        "error",
        error?.data?.message ||
        error?.message ||
        "Failed to update cart"
      );
    }
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

  const getBannerImage = () => {
    if (bannerBlock?.images?.[0]?.url) {
      return bannerBlock.images[0].url;
    }
    return "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80";
  };

  const getBannerAlt = () => {
    if (bannerBlock?.images?.[0]?.alt_text) {
      return bannerBlock.images[0].alt_text;
    }
    return "Hero banner";
  };

  const getHeading = () => {
    if (bannerBlock?.heading) {
      return getTextFromHtml(bannerBlock.heading);
    }
    return "✦ New Season · Autumn Edit ✦";
  };

  const getShortDescription = () => {
    if (bannerBlock?.short_description) {
      return bannerBlock.short_description;
    }
    return "Beauty, crockery,<br />jewellery and <span style='font-style:italic;color:#C9A96E'>watches</span><br />for the modern home.";
  };

  const getDescription = () => {
    if (bannerBlock?.description) {
      return stripHtml(bannerBlock.description);
    }
    return "Four thousand products, one network. Discover the edit our partners across 240 cities recommend most this month.";
  };

  return (
    <div className={s.page}>
      {/* Premium Scroll Progress Bar */}
      {/* <motion.div
        className={s.scrollProgress}
        style={{ width: `${scrollProgress}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      /> */}

      {/* Marquee Ticker */}
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

      {/* Header with sticky inline CSS */}
      <div className={s.stickyHeaderWrapper}>
        <Header />
      </div>



      {/* ============================================
   HERO SECTION - PREMIUM LUXURY
   ============================================ */}


      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="relative overflow-hidden bg-[#f8f7f4]"
      >
        {/* =========================================================
      BACKGROUND
  ========================================================= */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-180px] top-[-160px] h-[500px] w-[500px] rounded-full bg-[#d5b06d]/[0.07] blur-[120px]" />

          <div className="absolute bottom-[-200px] right-[-160px] h-[500px] w-[500px] rounded-full bg-[#d5b06d]/[0.06] blur-[120px]" />

          <div className="absolute left-0 right-0 top-1/2 h-px bg-[#ded9d0]/50" />
        </div>

        {/* =========================================================
      MAIN
  ========================================================= */}

        <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-16">

          <div
            className="
        grid
        min-h-[720px]
        items-center
        gap-12
        py-12
        lg:grid-cols-[0.88fr_1.12fr]
        lg:gap-10
        lg:py-16
        xl:min-h-[790px]
        xl:gap-16
        xl:py-20
      "
          >

            {/* =======================================================
          LEFT CONTENT
      ======================================================= */}

            <motion.div
              variants={fadeInUp}
              className="
          relative
          z-10
          max-w-[650px]
          lg:pr-4
          xl:pr-8
        "
            >

              {/* TOP LABEL */}

              <motion.div
                variants={fadeIn}
                className="mb-7 flex items-center gap-3"
              >
                <span className="h-px w-9 bg-[#bd914b]" />

                <span
                  className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.35em]
              text-[#a77a39]
            "
                >
                  {getHeading()}
                </span>

                <span className="h-1 w-1 rounded-full bg-[#bd914b]" />
              </motion.div>


              {/* =====================================================
            HEADING
        ===================================================== */}

              <motion.h1
                variants={fadeInUp}
                className="
            max-w-[700px]
            font-serif
            text-[44px]
            font-medium
            leading-[0.98]
            tracking-[-0.045em]
            text-[#111827]
            sm:text-[55px]
            md:text-[62px]
            lg:text-[56px]
            xl:text-[68px]
            2xl:text-[76px]
          "
                dangerouslySetInnerHTML={{
                  __html: getShortDescription().replace(
                    /<span[^>]*>([^<]*)<\/span>/g,
                    '<span class="text-[#b88942]">$1</span>'
                  ),
                }}
              />


              {/* =====================================================
            GOLD LINE
        ===================================================== */}

              <motion.div
                variants={fadeInUp}
                className="my-8 flex items-center gap-3"
              >
                <span className="h-px w-20 bg-[#c9a15e]" />

                <span className="text-[9px] text-[#c9a15e]">
                  ◆
                </span>

                <span className="h-px w-8 bg-[#e1d5c0]" />
              </motion.div>


              {/* =====================================================
            DESCRIPTION
        ===================================================== */}

              <motion.p
                variants={fadeInUp}
                className="
            max-w-[560px]
            text-[15px]
            leading-[1.9]
            text-[#70727a]
            sm:text-[16px]
          "
                dangerouslySetInnerHTML={{
                  __html: getDescription().replace(
                    /(crockery|jewellery|watches|beauty)/gi,
                    '<span class="font-medium text-[#9d7137]">$1</span>'
                  ),
                }}
              />


              {/* =====================================================
            CTA
        ===================================================== */}

              <motion.div
                variants={fadeInUp}
                className="
            mt-9
            flex
            flex-col
            gap-3
            sm:flex-row
          "
              >

                {/* SHOP */}

                <motion.button
                  type="button"
                  onClick={() => router.push("/products")}
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="
              group
              inline-flex
              h-[54px]
              items-center
              justify-center
              gap-8
              bg-[#15181f]
              px-7
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-white
              shadow-[0_12px_30px_rgba(20,24,32,0.12)]
              transition-all
              duration-300
              hover:bg-[#222733]
              sm:min-w-[205px]
            "
                >
                  <span>Shop the edit</span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </motion.button>


                {/* PARTNER */}

                <motion.button
                  type="button"
                  onClick={() =>
                    router.push("/auth/distributor/login/")
                  }
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="
              h-[54px]
              border
              border-[#d9d4cb]
              bg-transparent
              px-7
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#282c35]
              transition-all
              duration-300
              hover:border-[#bd914b]
              hover:text-[#a6793b]
              sm:min-w-[205px]
            "
                >
                  Become a partner
                </motion.button>

              </motion.div>


              {/* =====================================================
            STATS
        ===================================================== */}

              <motion.div
                variants={fadeInUp}
                className="
            mt-11
            flex
            max-w-[550px]
            border-t
            border-[#ddd8d0]
            pt-7
          "
              >

                {heroStats.map((st: any, index: number) => (
                  <motion.div
                    key={st.k}
                    whileHover={{
                      y: -3,
                    }}
                    className={`
                min-w-[110px]
                flex-1
                ${index !== 0
                        ? "border-l border-[#ddd8d0] pl-5"
                        : ""
                      }
              `}
                  >

                    <div
                      className="
                  font-serif
                  text-[27px]
                  font-medium
                  tracking-[-0.04em]
                  text-[#172033]
                  sm:text-[32px]
                "
                    >
                      {st.v}
                      <span className="text-[#b88942]">
                        +
                      </span>
                    </div>

                    <div
                      className="
                  mt-1
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#96979b]
                "
                    >
                      {st.k}
                    </div>

                  </motion.div>
                ))}

              </motion.div>

            </motion.div>


            {/* =======================================================
          RIGHT IMAGE
      ======================================================= */}

            <motion.div
              variants={fadeIn}
              className="
          relative
          h-[520px]
          sm:h-[620px]
          lg:h-[650px]
          xl:h-[730px]
        "
            >

              {/* IMAGE SHADOW */}

              <div
                className="
            absolute
            inset-5
            rounded-[4px]
            bg-[#b99765]/10
            blur-[35px]
          "
              />


              {/* IMAGE */}

              <motion.div
                whileHover={{
                  y: -4,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
            relative
            h-full
            w-full
            overflow-hidden
            bg-[#e8e4dd]
            shadow-[0_25px_70px_rgba(20,20,20,0.13)]
          "
              >

                <motion.img
                  src={getBannerImage()}
                  alt={getBannerAlt()}
                  loading="eager"
                  decoding="async"
                  whileHover={{
                    scale: 1.035,
                  }}
                  transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
              h-full
              w-full
              object-cover
              object-center
            "
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                />

                {/* IMAGE OVERLAY */}

                <div
                  className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/[0.14]
              via-transparent
              to-transparent
            "
                />


                {/* IMAGE NUMBER */}

                <div
                  className="
              absolute
              bottom-6
              left-6
              text-[9px]
              font-medium
              uppercase
              tracking-[0.3em]
              text-white/80
            "
                >
                  01 / THE EDIT
                </div>

              </motion.div>


              {/* =====================================================
            BESTSELLER BADGE
        ===================================================== */}

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
            absolute
            right-[-12px]
            top-[12%]
            z-20
            hidden
            items-center
            gap-3
            bg-white/95
            px-5
            py-4
            shadow-[0_15px_40px_rgba(20,20,20,0.13)]
            backdrop-blur-md
            sm:flex
            xl:right-[-30px]
          "
              >

                <div
                  className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-[#e2d1b2]
              bg-[#fbf7ef]
              text-[#bb8b45]
            "
                >
                  ✦
                </div>

                <div>

                  <div
                    className="
                text-[8px]
                uppercase
                tracking-[0.25em]
                text-[#b88942]
              "
                  >
                    Bestseller
                  </div>

                  <div
                    className="
                mt-1
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[#242832]
              "
                  >
                    Radiance Serum
                  </div>

                </div>

              </motion.div>


              {/* =====================================================
            REVIEWS
        ===================================================== */}

              <motion.div
                animate={{
                  y: [0, -9, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="
            absolute
            bottom-[15%]
            left-[-12px]
            z-20
            hidden
            bg-white/95
            px-5
            py-4
            text-center
            shadow-[0_15px_40px_rgba(20,20,20,0.13)]
            backdrop-blur-md
            sm:block
            xl:left-[-28px]
          "
              >

                <div
                  className="
              text-[15px]
              tracking-[0.12em]
              text-[#c0944d]
            "
                >
                  ★★★★★
                </div>

                <div
                  className="
              mt-1
              text-[9px]
              uppercase
              tracking-[0.15em]
              text-[#8c8e93]
            "
                >
                  18,400 reviews
                </div>

              </motion.div>


              {/* =====================================================
            LIVE VIEWERS
        ===================================================== */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="
            absolute
            bottom-[28%]
            right-[-12px]
            z-20
            hidden
            items-center
            gap-2
            rounded-full
            bg-white/95
            px-5
            py-3
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-[#3c4049]
            shadow-[0_15px_40px_rgba(20,20,20,0.12)]
            backdrop-blur-md
            sm:flex
            xl:right-[-28px]
          "
              >

                <span className="relative flex h-2 w-2">

                  <span
                    className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-50
              "
                  />

                  <span
                    className="
                relative
                h-2
                w-2
                rounded-full
                bg-emerald-500
              "
                  />

                </span>

                Live · 2.4k watching

              </motion.div>

            </motion.div>

          </div>

        </div>


        {/* =========================================================
      BOTTOM BORDER
  ========================================================= */}

        <div
          className="
      absolute
      bottom-0
      left-0
      right-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-[#d8c39e]
      to-transparent
    "
        />

      </motion.section>


      {/* ============================================================
    SHOP BY CATEGORY
============================================================ */}

      <motion.section
        className="relative overflow-hidden bg-[#faf9f7] py-14 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-14">

          {/* ==========================================================
        HEADER
    ========================================================== */}

          <motion.div
            variants={fadeInUp}
            className="mb-10 flex flex-col gap-7 md:mb-12 md:flex-row md:items-end md:justify-between"
          >
            {/* LEFT */}
            <div>

              {/* Browse */}
              <div className="mb-4 flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#c9963e]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c9963e]">
                  Browse
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-[38px] font-medium leading-[1.05] tracking-[-0.035em] text-[#111a32] sm:text-[46px] md:text-[52px] lg:text-[58px]">
                Shop by category
              </h2>

              {/* Subtitle */}
              <p className="mt-4 text-sm leading-6 text-[#777b87] sm:text-base">
                Handpicked collections, just for you.
              </p>

            </div>

            {/* VIEW ALL */}
            <motion.button
              type="button"
              onClick={() => router.push("/products")}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="
          group
          flex
          w-fit
          items-center
          gap-5
          rounded-full
          border
          border-[#d19a3f]
          bg-white
          px-7
          py-4
          text-[11px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-[#bd8933]
          transition-all
          duration-300
          hover:bg-[#fffaf1]
          hover:shadow-[0_8px_25px_rgba(190,140,55,0.12)]
        "
            >
              <span>View all categories</span>

              <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </motion.button>
          </motion.div>


          {/* ==========================================================
        LOADING
    ========================================================== */}

          {isCategoriesLoading ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
              overflow-hidden
              rounded-[22px]
              border
              border-[#eee7dc]
              bg-white
              p-4
              shadow-[0_8px_30px_rgba(30,30,30,0.04)]
            "
                >
                  {/* Image skeleton */}
                  <div className="aspect-square animate-pulse rounded-full bg-[#eeeae4]" />

                  {/* Title skeleton */}
                  <div className="mx-auto mt-7 h-6 w-32 animate-pulse rounded bg-[#eeeae4]" />

                  {/* Count skeleton */}
                  <div className="mx-auto mt-3 h-4 w-20 animate-pulse rounded bg-[#f0ede8]" />

                  {/* Line */}
                  <div className="mx-auto mt-5 h-[2px] w-11 animate-pulse bg-[#eeeae4]" />

                  {/* Arrow */}
                  <div className="mx-auto mt-5 h-10 w-10 animate-pulse rounded-full bg-[#eeeae4]" />
                </div>
              ))}

            </div>

          ) : categoriesError ? (

            /* ==========================================================
                ERROR
            ========================================================== */

            <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[#eee5d9] bg-white">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4e5]">
                  <span className="text-xl text-[#c9963e]">
                    !
                  </span>
                </div>

                <p className="mt-4 text-sm text-[#737784]">
                  Failed to load categories
                </p>

                <button
                  type="button"
                  onClick={() => refetchCategories()}
                  className="
              mt-5
              rounded-full
              border
              border-[#c9963e]
              px-6
              py-3
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-[#b7832d]
              transition
              hover:bg-[#fff9ef]
            "
                >
                  Retry
                </button>

              </div>

            </div>

          ) : categories && categories.length > 0 ? (

            <>
              {/* ========================================================
            CATEGORY GRID
        ======================================================== */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                {categories.map((category: any, index: number) => {

                  /* ----------------------------------------------------
                     API DATA
                  ---------------------------------------------------- */

                  const categoryName =
                    category?.title || "Category";

                  const categoryImage =
                    category?.image || "";

                  const productCount =
                    Number(category?.products_count ?? 0);

                  /* ----------------------------------------------------
                     FALLBACK IMAGE
                  ---------------------------------------------------- */

                  const fallbackImage =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      categoryName
                    )}&background=C9A96E&color=fff&size=600&bold=true`;

                  /* ----------------------------------------------------
                     CARD BACKGROUND
                  ---------------------------------------------------- */

                  const cardStyles = [
                    "border-[#f2d9d2] bg-[#fdf0ec]",
                    "border-[#eadcc6] bg-[#faf3e7]",
                    "border-[#dfe3db] bg-[#f1f3ef]",
                    "border-[#dfe2e9] bg-[#f1f3f7]",
                  ];

                  return (

                    <motion.div
                      key={
                        category?.id ??
                        category?.category_id ??
                        index
                      }
                      variants={scaleIn}
                      whileHover={{
                        y: -8,
                        scale: 1.015,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => {
                        router.push(
                          `/products/?category=${encodeURIComponent(
                            categoryName
                          )}`
                        );
                      }}
                      className={`
                  group
                  relative
                  cursor-pointer
                  overflow-hidden
                  rounded-[22px]
                  border
                  ${cardStyles[index % cardStyles.length]}
                  px-4
                  pb-6
                  pt-4
                  shadow-[0_8px_30px_rgba(30,30,30,0.035)]
                  transition-all
                  duration-500
                  hover:shadow-[0_20px_45px_rgba(30,30,30,0.10)]
                `}
                    >

                      {/* =================================================
                    IMAGE SECTION
                ================================================= */}

                      <div className="relative mx-auto aspect-square w-full max-w-[330px]">

                        {/* Soft Glow */}

                        <div
                          className="
                      absolute
                      inset-[5%]
                      rounded-full
                      bg-white/60
                      blur-2xl
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                        />


                        {/* =================================================
                      CIRCLE IMAGE
                  ================================================= */}

                        <motion.div
                          className="
                      absolute
                      inset-[2%]
                      overflow-hidden
                      rounded-full
                      border-[6px]
                      border-white
                      bg-white
                      shadow-[0_6px_22px_rgba(30,30,30,0.10)]
                    "
                          whileHover={{
                            scale: 1.035,
                          }}
                          transition={{
                            duration: 0.55,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >

                          <img
                            src={
                              categoryImage ||
                              fallbackImage
                            }
                            alt={categoryName}
                            loading={
                              index < 4
                                ? "eager"
                                : "lazy"
                            }
                            decoding="async"
                            className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-110
                      "
                            onError={(event) => {
                              const image =
                                event.currentTarget;

                              if (
                                image.src !==
                                fallbackImage
                              ) {
                                image.src =
                                  fallbackImage;
                              }
                            }}
                          />

                          {/* Image Overlay */}

                          <div
                            className="
                        absolute
                        inset-0
                        bg-black/0
                        transition-all
                        duration-500
                        group-hover:bg-black/[0.04]
                      "
                          />

                        </motion.div>


                        {/* =================================================
                      FLOATING ICON
                  ================================================= */}

                        <motion.div
                          className="
                      absolute
                      bottom-[1%]
                      left-1/2
                      z-10
                      flex
                      h-[58px]
                      w-[58px]
                      -translate-x-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#eee8df]
                      bg-white
                      shadow-[0_8px_25px_rgba(30,30,30,0.13)]
                    "
                          whileHover={{
                            scale: 1.08,
                            rotate: 5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 18,
                          }}
                        >

                          {/* Different icon based on index */}

                          <span className="text-[25px] text-[#c99235]">

                            {index === 0
                              ? "✦"
                              : index === 1
                                ? "♧"
                                : index === 2
                                  ? "♢"
                                  : "◷"}

                          </span>

                        </motion.div>

                      </div>


                      {/* =================================================
                    CATEGORY INFORMATION
                ================================================= */}

                      <div className="mt-7 text-center">

                        {/* Category Title */}

                        <h3
                          className="
                      line-clamp-1
                      font-serif
                      text-[24px]
                      font-semibold
                      leading-tight
                      tracking-[-0.02em]
                      text-[#111a32]
                      transition-colors
                      duration-300
                      group-hover:text-[#bd8730]
                      sm:text-[26px]
                    "
                        >
                          {categoryName}
                        </h3>


                        {/* Product Count */}

                        <p
                          className="
                      mt-3
                      text-sm
                      font-medium
                      tracking-wide
                      text-[#777b86]
                    "
                        >
                          {productCount}{" "}
                          {productCount === 1
                            ? "product"
                            : "products"}
                        </p>


                        {/* Gold Divider */}

                        <div
                          className="
                      mx-auto
                      mt-5
                      h-[2px]
                      w-11
                      bg-[#d19a3d]
                      transition-all
                      duration-300
                      group-hover:w-16
                    "
                        />


                        {/* Arrow */}

                        <motion.div
                          className="
                      mx-auto
                      mt-5
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#dedbd5]
                      bg-white/70
                      text-[#777b86]
                      transition-all
                      duration-300
                      group-hover:border-[#d19a3d]
                      group-hover:bg-white
                      group-hover:text-[#bd8730]
                    "
                          whileHover={{
                            scale: 1.1,
                          }}
                        >
                          <span className="text-lg leading-none">
                            →
                          </span>
                        </motion.div>

                      </div>

                    </motion.div>
                  );
                })}

              </div>


              {/* ========================================================
            BENEFITS STRIP
        ======================================================== */}

              <motion.div
                variants={fadeInUp}
                className="
            mt-9
            overflow-hidden
            rounded-[22px]
            border
            border-[#eee7dc]
            bg-white/90
            shadow-[0_8px_35px_rgba(40,30,20,0.05)]
          "
              >

                <div className="
            grid
            grid-cols-1
            divide-y
            divide-[#eee8df]
            md:grid-cols-2
            md:divide-x
            md:divide-y-0
            lg:grid-cols-4
          ">

                  {/* ====================================================
                PREMIUM QUALITY
            ==================================================== */}

                  <div className="flex items-center gap-5 px-7 py-6">

                    <div className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                text-[#c99235]
              ">
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="h-11 w-11"
                      >
                        <path
                          d="M24 4l5 5 7-1 1 7 6 4-4 6 1 7-7 1-5 6-5-6-7-1 1-7-4-6 6-4 1-7 7 1 5-5z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <path
                          d="M17 24l5 5 10-11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div>

                      <h4 className="
                  font-serif
                  text-[16px]
                  font-semibold
                  text-[#151b2d]
                ">
                        Premium Quality
                      </h4>

                      <p className="
                  mt-1
                  text-sm
                  text-[#7b7d86]
                ">
                        Handpicked with care
                      </p>

                    </div>

                  </div>


                  {/* ====================================================
                FAST DELIVERY
            ==================================================== */}

                  <div className="flex items-center gap-5 px-7 py-6">

                    <div className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                text-[#c99235]
              ">

                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="h-11 w-11"
                      >
                        <path
                          d="M4 11h25v23H4z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <path
                          d="M29 18h8l7 8v8H29z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <circle
                          cx="13"
                          cy="37"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <circle
                          cx="37"
                          cy="37"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>

                    </div>

                    <div>

                      <h4 className="
                  font-serif
                  text-[16px]
                  font-semibold
                  text-[#151b2d]
                ">
                        Fast Delivery
                      </h4>

                      <p className="
                  mt-1
                  text-sm
                  text-[#7b7d86]
                ">
                        At your doorstep
                      </p>

                    </div>

                  </div>


                  {/* ====================================================
                SECURE PAYMENT
            ==================================================== */}

                  <div className="flex items-center gap-5 px-7 py-6">

                    <div className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                text-[#c99235]
              ">

                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="h-11 w-11"
                      >
                        <path
                          d="M24 4l17 7v12c0 10-7 17-17 21C14 40 7 33 7 23V11l17-7z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <rect
                          x="18"
                          y="21"
                          width="12"
                          height="10"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <path
                          d="M21 21v-3a3 3 0 016 0v3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>

                    </div>

                    <div>

                      <h4 className="
                  font-serif
                  text-[16px]
                  font-semibold
                  text-[#151b2d]
                ">
                        Secure Payment
                      </h4>

                      <p className="
                  mt-1
                  text-sm
                  text-[#7b7d86]
                ">
                        100% protected
                      </p>

                    </div>

                  </div>


                  {/* ====================================================
                24/7 SUPPORT
            ==================================================== */}

                  <div className="flex items-center gap-5 px-7 py-6">

                    <div className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                text-[#c99235]
              ">

                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="h-11 w-11"
                      >
                        <path
                          d="M8 25a16 16 0 0132 0"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <rect
                          x="4"
                          y="23"
                          width="8"
                          height="14"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <rect
                          x="36"
                          y="23"
                          width="8"
                          height="14"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <path
                          d="M36 36c0 4-4 6-9 6h-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>

                    </div>

                    <div>

                      <h4 className="
                  font-serif
                  text-[16px]
                  font-semibold
                  text-[#151b2d]
                ">
                        24/7 Support
                      </h4>

                      <p className="
                  mt-1
                  text-sm
                  text-[#7b7d86]
                ">
                        We're here for you
                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>

            </>

          ) : (

            /* ==========================================================
                EMPTY
            ========================================================== */

            <div className="
        flex
        min-h-[300px]
        items-center
        justify-center
        rounded-[24px]
        border
        border-[#eee5d9]
        bg-white
      ">

              <div className="text-center">

                <div className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#fff4e5]
          ">
                  <span className="text-xl text-[#c9963e]">
                    ✦
                  </span>
                </div>

                <p className="
            mt-4
            text-sm
            text-[#737784]
          ">
                  No categories available at the moment.
                </p>

                <button
                  type="button"
                  onClick={() => refetchCategories()}
                  className="
              mt-5
              rounded-full
              border
              border-[#c9963e]
              px-6
              py-3
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-[#b7832d]
              transition
              hover:bg-[#fff9ef]
            "
                >
                  Refresh
                </button>

              </div>

            </div>
          )}

        </div>
      </motion.section>

      <motion.section>
        <Nation />
      </motion.section>

      {/* DEAL OF THE DAY */}
      <motion.section
        className="relative overflow-hidden bg-[#fcfbf8] py-16 md:py-20 lg:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Soft luxury background glow */}
        <motion.div
          className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#d4a84f]/10 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.div
          className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#d4a84f]/10 blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
          {/* Limited Deal */}
          <motion.div
            className="mb-7 flex justify-end pr-2 md:mb-9 md:pr-8"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b88727]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c89b3c] shadow-[0_0_12px_rgba(200,155,60,0.5)]" />
              Limited Deal
            </div>
          </motion.div>

          {isDealProductsLoading ? (
            <div className="flex min-h-[500px] items-center justify-center text-sm font-medium tracking-wide text-[#777]">
              Loading deal of the day...
            </div>
          ) : dealProduct ? (
            <div className="grid items-stretch gap-7 lg:grid-cols-[1.45fr_1fr] xl:gap-9">

              {/* =====================================
            LEFT — PRODUCT IMAGE
        ====================================== */}
              <motion.div
                className="relative min-h-[500px] overflow-hidden rounded-[28px] border border-[#e7e0d3] bg-white shadow-[0_25px_80px_rgba(40,35,25,0.10)] md:min-h-[650px]"
                variants={fadeIn}
              >
                {/* Image background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#fff] via-[#faf9f6] to-[#f2eee6]" />

                {/* Decorative glow */}
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4a84f]/10 blur-[80px]" />

                <motion.div
                  className="absolute inset-0 flex items-center justify-center p-5 md:p-10"
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src={
                      dealProduct.primary_image_url ||
                      dealProduct.images?.[0]?.image_url ||
                      "/images/product-placeholder.png"
                    }
                    alt={dealProduct.name}
                    className="h-full w-full object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.12)]"
                  />
                </motion.div>

                {/* Deal Badge */}
                <motion.div
                  className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-[#d5a94d] bg-white/95 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17294b] shadow-[0_10px_35px_rgba(200,155,60,0.18)] backdrop-blur-md md:left-8 md:top-8"
                  animate={{
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      "0 10px 35px rgba(200,155,60,0.12)",
                      "0 12px 45px rgba(200,155,60,0.25)",
                      "0 10px 35px rgba(200,155,60,0.12)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <span className="text-base">🔥</span>
                  Deal of the day
                </motion.div>

                {/* Bottom gold accent */}
                <div className="absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r from-transparent via-[#c89b3c] to-transparent opacity-70" />
              </motion.div>

              {/* =====================================
            RIGHT — DEAL CONTENT
        ====================================== */}
              <motion.div
                className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-[#e9e4da] bg-white px-7 py-9 shadow-[0_25px_80px_rgba(40,35,25,0.07)] md:px-10 md:py-12 lg:px-11"
                variants={fadeInUp}
              >
                {/* Inner luxury glow */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#d4a84f]/[0.06] blur-[90px]" />

                <div className="relative z-10">

                  {/* Category */}
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#c39535]">
                    {dealProduct.category?.name || "Chandra Horology"}
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-5xl font-medium leading-[1.05] tracking-[-0.03em] text-[#101a32] md:text-6xl">
                    {dealProduct.name}
                  </h2>

                  {/* Description */}
                  {dealProduct.description && (
                    <p className="mt-5 max-w-lg text-sm leading-7 text-[#777b84]">
                      {dealProduct.description}
                    </p>
                  )}

                  {/* =====================================
                PRICE
            ====================================== */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <motion.span
                      className="font-serif text-4xl font-semibold tracking-tight text-[#c3922e] md:text-5xl"
                      animate={{
                        scale: [1, 1.015, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ₹{dealPricing.price.toLocaleString("en-IN")}
                    </motion.span>

                    {dealPricing.mrp > 0 && (
                      <span className="text-lg text-[#8d8d92] line-through">
                        ₹{dealPricing.mrp.toLocaleString("en-IN")}
                      </span>
                    )}

                    {dealPricing.discount > 0 && (
                      <motion.span
                        className="rounded-full border border-[#cda453] bg-[#fffaf0] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#a97920]"
                        animate={{
                          scale: [1, 1.03, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {dealPricing.discount}% OFF
                      </motion.span>
                    )}
                  </div>

                  {/* =====================================
                COUNTDOWN
            ====================================== */}
                  <div className="mt-9 grid grid-cols-4 gap-2.5 sm:gap-3">
                    {[
                      { v: time.h, k: "Hours" },
                      { v: time.m, k: "Mins" },
                      { v: time.s, k: "Secs" },
                    ].map((c) => (
                      <motion.div
                        key={c.k}
                        className="flex min-h-[105px] flex-col items-center justify-center rounded-2xl border border-[#e8e4dc] bg-[#fffefa] shadow-[0_8px_25px_rgba(20,20,20,0.035)]"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 15px 35px rgba(20,20,20,0.08)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                        }}
                      >
                        <motion.div
                          className="font-serif text-3xl font-semibold text-[#121b32] md:text-4xl"
                          animate={{
                            scale: [1, 1.04, 1],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {String(c.v).padStart(2, "0")}
                        </motion.div>

                        <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c39535]">
                          {c.k}
                        </div>
                      </motion.div>
                    ))}

                    {/* Stock */}
                    <motion.div
                      className="flex min-h-[105px] flex-col items-center justify-center rounded-2xl border border-[#e8e4dc] bg-[#fffefa] shadow-[0_8px_25px_rgba(20,20,20,0.035)]"
                      whileHover={{
                        y: -5,
                        boxShadow: "0 15px 35px rgba(20,20,20,0.08)",
                      }}
                    >
                      <div className="font-serif text-3xl font-semibold text-[#121b32] md:text-4xl">
                        {Math.max(
                          0,
                          Number(dealProduct.stock_quantity || 0)
                        )}
                      </div>

                      <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c39535]">
                        Left
                      </div>
                    </motion.div>
                  </div>

                  {/* =====================================
                STOCK
            ====================================== */}
                  <div className="mt-7">
                    {(() => {
                      const stock = Number(
                        dealProduct.stock_quantity || 0
                      );

                      const threshold = Number(
                        dealProduct.low_stock_threshold || 10
                      );

                      const totalStock = stock + 40;

                      const claimedPercentage =
                        totalStock > 0
                          ? Math.min(
                            100,
                            Math.round(
                              ((totalStock - stock) / totalStock) * 100
                            )
                          )
                          : 0;

                      return (
                        <>
                          {/* Progress */}
                          <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#e9e7e2]">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#c29132] to-[#e1bd69]"
                              initial={{ width: "0%" }}
                              animate={{
                                width: `${claimedPercentage}%`,
                              }}
                              transition={{
                                duration: 1.5,
                                ease: "easeOut",
                              }}
                            />
                          </div>

                          <div className="mt-3 text-xs font-medium text-[#777b84]">
                            {stock <= threshold
                              ? `Only ${stock} left in stock`
                              : `${stock} items available`}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* =====================================
                CTA
            ====================================== */}
                  <motion.button
                    onClick={handleDealClick}
                    className="group relative mt-8 flex w-full items-center justify-center gap-5 overflow-hidden rounded-2xl bg-[#142747] px-8 py-5 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_15px_35px_rgba(20,39,71,0.20)] transition-all duration-300 hover:bg-[#1b345d] hover:shadow-[0_18px_45px_rgba(20,39,71,0.30)] sm:w-[360px]"
                    whileHover={{
                      scale: 1.02,
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                    }}
                  >
                    {/* Gold shine */}
                    <span className="absolute inset-y-0 -left-20 w-16 rotate-[20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[120%]" />

                    <span className="relative z-10">
                      Grab this deal
                    </span>

                    <svg
                      className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-[#777]">
              No deal available today.
            </div>
          )}
        </div>
      </motion.section>

      {/* Products Section - Trending */}
      <motion.section
        className="relative overflow-hidden bg-[#fcfbf8] py-16 md:py-20 lg:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Luxury background glow */}
        <div className="pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-[#d6a64b]/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#142747]/[0.035] blur-[120px]" />

        <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">

          {/* =====================================================
        HEADER
    ====================================================== */}
          <motion.div
            className="mb-10 flex flex-col gap-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between"
            variants={fadeInUp}
          >
            {/* Heading */}
            <div className="max-w-xl">

              {/* Kicker */}
              <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c3922e]">
                <span className="h-px w-10 bg-[#c3922e]" />
                Most loved
              </div>

              <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-[#101a32] sm:text-5xl md:text-6xl">
                Trending this week
              </h2>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-20 bg-[#ded8cc]" />
                <span className="text-sm text-[#c3922e]">✦</span>
                <span className="h-px w-20 bg-[#ded8cc]" />
              </div>

              <p className="mt-4 text-sm leading-6 text-[#777b84]">
                Handpicked favourites customers are loving right now
              </p>
            </div>

            {/* =====================================================
          FILTERS
      ====================================================== */}
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2 scrollbar-hide lg:justify-end">
              <motion.button
                onClick={() => setFilter("All")}
                className={`flex-shrink-0 rounded-full border px-7 py-3 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${filter === "All"
                  ? "border-[#142747] bg-[#142747] text-white shadow-[0_8px_20px_rgba(20,39,71,0.16)]"
                  : "border-[#e6e2da] bg-white text-[#626674] hover:border-[#cda453] hover:text-[#142747]"
                  }`}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                All
              </motion.button>

              {isCategoriesLoading ? (
                <span className="flex items-center px-5 text-xs text-[#999]">
                  Loading...
                </span>
              ) : (
                categories.slice(0, 5).map((category: any) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setFilter(category.id.toString())}
                    className={`flex-shrink-0 rounded-full border px-6 py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${filter === category.id.toString()
                      ? "border-[#142747] bg-[#142747] text-white shadow-[0_8px_20px_rgba(20,39,71,0.16)]"
                      : "border-[#e6e2da] bg-white text-[#626674] hover:border-[#cda453] hover:text-[#142747]"
                      }`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.title || category.name}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* =====================================================
        LOADING
    ====================================================== */}
          {isTrendingLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[24px] border border-[#ebe7df] bg-white shadow-[0_15px_50px_rgba(20,25,35,0.05)]"
                >
                  <div className="aspect-[0.88] animate-pulse bg-[#f0ede7]" />

                  <div className="space-y-4 p-6">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-[#eeeae2]" />
                    <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#eeeae2]" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#eeeae2]" />
                    <div className="h-5 w-2/3 animate-pulse rounded-full bg-[#eeeae2]" />
                  </div>
                </div>
              ))}
            </div>

          ) : isTrendingError ? (

            /* =====================================================
                ERROR
            ====================================================== */
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[24px] border border-[#ebe5da] bg-white px-6 text-center shadow-[0_15px_50px_rgba(20,25,35,0.04)]">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f8f2e5] text-xl text-[#c3922e]">
                !
              </div>

              <p className="text-sm text-[#777b84]">
                Unable to load trending products.
              </p>

              <button
                onClick={() => refetchTrending()}
                className="mt-5 rounded-full bg-[#142747] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#1d3963]"
              >
                Retry
              </button>
            </div>

          ) : (

            <>
              {(() => {
                const filteredProducts =
                  filter === "All"
                    ? trendingProducts
                    : trendingProducts.filter(
                      (product: any) =>
                        product.category_id === Number(filter),
                    );

                return filteredProducts.length === 0 ? (

                  /* =================================================
                      EMPTY
                  ================================================= */
                  <div className="flex min-h-[350px] items-center justify-center rounded-[24px] border border-[#ebe5da] bg-white text-sm text-[#777b84]">
                    No trending products found in this category.
                  </div>

                ) : (

                  /* =================================================
                      PRODUCT GRID
                  ================================================= */
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {filteredProducts.map((p: any, index: number) => {

                      const price = Number(p.retail_price ?? 0);
                      const mrp = Number(p.retail_mrp ?? 0);

                      const discount =
                        mrp > 0 && price < mrp
                          ? Math.round(((mrp - price) / mrp) * 100)
                          : 0;

                      const image =
                        p.images?.find(
                          (img: any) => img.is_primary
                        )?.image_url ||
                        p.images?.[0]?.image_url ||
                        "/images/product-placeholder.png";

                      const category = categories.find(
                        (cat: any) => cat.id === p.category_id,
                      );

                      const isWishlisted = wish[p.id] || false;
                      const isAddingToCart = isAddToCartLoading;

                      return (
                        <motion.div
                          key={p.id}
                          className={`group relative overflow-hidden rounded-[24px] border bg-white shadow-[0_15px_50px_rgba(20,25,35,0.05)] transition-all duration-500 ${index === 1
                            ? "border-[#d6a64b] shadow-[0_20px_60px_rgba(196,150,55,0.10)]"
                            : "border-[#ebe7df] hover:border-[#d8bd7d]"
                            }`}
                          variants={scaleIn}
                          whileHover="hover"
                          transition={{ duration: 0.4 }}
                        >

                          {/* =================================================
                        IMAGE
                    ================================================= */}
                          <div
                            className="relative aspect-[0.88] cursor-pointer overflow-hidden bg-[#f2efea]"
                            onClick={() =>
                              router.push(`/product/${p.slug}/`)
                            }
                          >

                            {/* Image */}
                            <motion.img
                              src={image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              whileHover={{ scale: 1.07 }}
                              transition={{ duration: 0.65 }}
                            />

                            {/* Soft image overlay */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            {/* Category Badge */}
                            <span className="absolute left-5 top-5 rounded-full border border-[#d9b45e]/50 bg-[#f5d789] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#17233d] shadow-[0_5px_15px_rgba(0,0,0,0.06)]">
                              {category?.title ||
                                category?.name ||
                                "Trending"}
                            </span>

                            {/* =================================================
                          WISHLIST
                      ================================================= */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(p.id, p.name);
                              }}
                              className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border bg-white/95 shadow-[0_8px_20px_rgba(20,25,35,0.08)] backdrop-blur-md transition-colors ${isWishlisted
                                ? "border-[#c3922e]"
                                : "border-white"
                                }`}
                              whileHover={{
                                scale: 1.12,
                                y: -2,
                              }}
                              whileTap={{ scale: 0.85 }}
                            >
                              <svg
                                className={`h-5 w-5 ${isWishlisted
                                  ? "text-[#c3922e]"
                                  : "text-[#17233d]"
                                  }`}
                                viewBox="0 0 24 24"
                                fill={
                                  isWishlisted
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                              </svg>
                            </motion.button>

                            {/* =================================================
                          ADD TO BAG
                      ================================================= */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(
                                  p.id,
                                  p.name,
                                  image,
                                  price
                                );
                              }}
                              className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-xl bg-[#142747] py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white opacity-0 shadow-[0_12px_30px_rgba(20,39,71,0.25)] transition-all duration-300 group-hover:opacity-100 hover:bg-[#1d3963]"
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.96,
                              }}
                            >
                              {isAddingToCart ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              ) : (
                                <>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M6 8h12l1 12H5L6 8z" />
                                    <path d="M9 8a3 3 0 016 0" />
                                  </svg>

                                  Add to bag
                                </>
                              )}
                            </motion.button>
                          </div>

                          {/* =================================================
                        PRODUCT INFO
                    ================================================= */}
                          <div className="p-5 md:p-6">

                            {/* Category */}
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c3922e]">
                              {category?.title ||
                                category?.name ||
                                "Trending"}
                            </div>

                            {/* Product Name */}
                            <div
                              className="cursor-pointer font-serif text-xl font-medium tracking-[-0.02em] text-[#101a32] transition-colors hover:text-[#c3922e]"
                              onClick={() =>
                                router.push(`/product/${p.slug}/`)
                              }
                            >
                              {p.name}
                            </div>

                            {/* Description */}
                            {p.description && (
                              <div className="mt-2 line-clamp-1 text-sm text-[#7b7e87]">
                                {p.description}
                              </div>
                            )}

                            {/* =================================================
                          PRICE
                      ================================================= */}
                            <div className="mt-5 flex flex-wrap items-center gap-3">

                              <span className="text-lg font-bold text-[#101a32]">
                                ₹{price.toLocaleString("en-IN")}
                              </span>

                              {mrp > 0 && mrp > price && (
                                <span className="text-sm text-[#858791] line-through">
                                  ₹{mrp.toLocaleString("en-IN")}
                                </span>
                              )}

                              {discount > 0 && (
                                <span className="text-xs font-semibold text-[#369566]">
                                  {discount}% off
                                </span>
                              )}
                            </div>

                            {/* =================================================
                          META
                      ================================================= */}
                            <div className="mt-5 flex items-center justify-between">

                              <div className="flex items-center gap-2">
                                <span className="text-[15px] tracking-[1px] text-[#d49d2e]">
                                  ★★★★★
                                </span>

                                <span className="text-xs text-[#777b84]">
                                  Trending
                                </span>
                              </div>

                              {/* Small bag button */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(
                                    p.id,
                                    p.name,
                                    image,
                                    price
                                  );
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b45e] bg-white text-[#b98523] transition-all hover:bg-[#142747] hover:text-white"
                                whileHover={{
                                  scale: 1.08,
                                }}
                                whileTap={{
                                  scale: 0.9,
                                }}
                              >
                                {isAddingToCart ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b98523]/30 border-t-[#b98523]" />
                                ) : (
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M6 8h12l1 12H5L6 8z" />
                                    <path d="M9 8a3 3 0 016 0" />
                                  </svg>
                                )}
                              </motion.button>

                            </div>
                          </div>

                          {/* Featured gold accent */}
                          {index === 1 && (
                            <div className="absolute bottom-0 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-full bg-[#d6a64b]" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </motion.section>

      {/* Reels Section */}
      
      <motion.section
        className="relative overflow-hidden bg-[#fcfbf8] py-16 md:py-20 lg:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Luxury ambient glow */}
        <motion.div
          className="pointer-events-none absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#d6a64b]/[0.06] blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="pointer-events-none absolute -right-40 bottom-10 h-[400px] w-[400px] rounded-full bg-[#142747]/[0.035] blur-[110px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 9, repeat: Infinity }}
        />

        <div className="relative mx-auto max-w-[1500px] overflow-hidden px-5 sm:px-8 lg:px-10">

          {/* =====================================================
        HEADER
    ====================================================== */}
          <motion.div
            className="mb-10 flex flex-col gap-7 md:mb-12 lg:flex-row lg:items-end lg:justify-between"
            variants={fadeInUp}
          >
            <div className="max-w-2xl">

              {/* Kicker */}
              <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c3922e]">
                <span className="text-base leading-none text-[#c3922e]">
                  ✦
                </span>

                <span>Shop the reels</span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-4xl font-medium leading-[1] tracking-[-0.035em] text-[#101a32] sm:text-5xl md:text-6xl lg:text-[64px]">
                Shop the reels
              </h2>

              {/* Decorative line */}
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-20 bg-[#d8bd7d]" />
                <span className="text-xs text-[#c3922e]">✦</span>
                <span className="h-px w-20 bg-[#d8bd7d]" />
              </div>

              {/* Description */}
              <p className="mt-5 max-w-xl text-sm leading-6 text-[#737784] md:text-[15px]">
                Partner creators showing the products in real homes.
                <br className="hidden sm:block" />
                Tap any reel to shop the look.
              </p>
            </div>

            {/* =====================================================
          ARROWS
      ====================================================== */}
            <div className="flex gap-3 self-start lg:self-end">

              <motion.button
                onClick={() => scrollReel(-1)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e3d8c2] bg-white text-[#142747] shadow-[0_8px_25px_rgba(20,39,71,0.05)] transition-all duration-300 hover:border-[#c3922e] hover:bg-[#142747] hover:text-white"
                whileHover={{
                  scale: 1.06,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => scrollReel(1)}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e3d8c2] bg-white text-[#142747] shadow-[0_8px_25px_rgba(20,39,71,0.05)] transition-all duration-300 hover:border-[#c3922e] hover:bg-[#142747] hover:text-white"
                whileHover={{
                  scale: 1.06,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.button>

            </div>
          </motion.div>

          {/* =====================================================
        LOADING
    ====================================================== */}
          {isReelsLoading ? (
            <div className="flex min-h-[520px] items-center justify-center">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border border-[#e5dcc9]" />

                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#c3922e]" />
              </div>
            </div>

          ) : reelsError ? (

            <div className="flex min-h-[400px] items-center justify-center rounded-[28px] border border-[#ebe5da] bg-white text-sm text-[#777b84] shadow-[0_20px_60px_rgba(20,25,35,0.04)]">
              Failed to load reels
            </div>

          ) : (

            <>

              {/* =====================================================
            REELS RAIL
        ====================================================== */}
              <div
                ref={rail}
                className="flex gap-5 overflow-x-auto overflow-y-hidden pb-6 pt-2 scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >

                {(reelsData?.data || []).map((r: any, index: number) => {

                  const product = r.product;
                  const productSlug = product?.slug;
                  const productName = product?.name || "Product";
                  const productImage = getProductImage(product);
                  const productPrice = getProductPrice(product);

                  const creatorName =
                    r.creator_handle ||
                    r.title ||
                    "Creator";

                  const views =
                    r.followers_count || 0;

                  const videoUrl =
                    r.video_full_path ||
                    r.video_full_url ||
                    r.video_url ||
                    r.video_path;

                  const thumbnailUrl =
                    r.thumbnail_url ||
                    productImage;

                  const handleShopClick = (
                    e: React.MouseEvent
                  ) => {
                    e.stopPropagation();

                    if (productSlug) {
                      router.push(
                        `/product/${productSlug}/`
                      );
                    }
                  };

                  return (
                    <motion.div
                      key={r.id || r.creator_handle}
                      className={`group relative flex-shrink-0 overflow-hidden rounded-[26px] bg-[#10151e] shadow-[0_20px_50px_rgba(15,25,40,0.16)] ${index === 2
                          ? "border border-[#d6a64b] shadow-[0_20px_60px_rgba(196,150,55,0.18)]"
                          : "border border-[#d9dce0]/60"
                        }`}
                      style={{
                        width:
                          "clamp(245px, 24vw, 320px)",
                        height:
                          "clamp(450px, 46vw, 550px)",
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.015,
                      }}
                      transition={{
                        duration: 0.4,
                      }}
                    >

                      {/* Gold featured glow */}
                      {index === 2 && (
                        <div className="pointer-events-none absolute -top-5 left-1/2 z-30 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#d6a64b] text-white shadow-[0_5px_20px_rgba(196,150,55,0.4)]">
                          ✦
                        </div>
                      )}

                      {/* =================================================
                    VIDEO / IMAGE
                ================================================= */}
                      <div className="absolute inset-0">

                        {videoUrl ? (
                          <video
                            src={videoUrl}
                            poster={thumbnailUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="auto"
                            controls={false}
                            className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            onLoadedData={(e) => {
                              const video =
                                e.currentTarget;

                              video
                                .play()
                                .catch(() => {
                                  // Browser autoplay restriction
                                });
                            }}
                          />
                        ) : (
                          <img
                            src={thumbnailUrl}
                            alt={r.title || "Reel"}
                            className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        )}

                      </div>

                      {/* =================================================
                    DARK LUXURY OVERLAY
                ================================================= */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent via-45% to-black/90" />

                      {/* Extra bottom gradient */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#070b12]/95 via-[#070b12]/40 to-transparent" />

                      {/* =================================================
                    CREATOR HEADER
                ================================================= */}
                      <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">

                        <div className="flex min-w-0 items-center gap-2.5">

                          {/* Avatar */}
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e0b94f] bg-[#142747] shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                            <img
                              src={getCreatorAvatar(
                                creatorName
                              )}
                              alt={creatorName}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Creator */}
                          <span className="max-w-[145px] truncate text-xs font-semibold text-white drop-shadow-md">
                            @{creatorName}
                          </span>
                        </div>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/80">
                          <span>▶</span>
                          <span>
                            {formatViews(views)}
                          </span>
                        </div>

                      </div>

                      {/* =================================================
                    CAPTION
                ================================================= */}
                      <div className="absolute bottom-[118px] left-5 right-5 z-20">

                        <div className="line-clamp-2 text-sm font-medium leading-5 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]">
                          {r.title ||
                            r.caption ||
                            `${creatorName}'s reel`}
                        </div>

                      </div>

                      {/* =================================================
                    PRODUCT SHOP BAR
                ================================================= */}
                      <div className="absolute bottom-4 left-4 right-4 z-30">

                        <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#151b24]/90 p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">

                          {/* Product image */}
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
                            <img
                              src={thumbnailUrl}
                              alt={productName}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Product info */}
                          <div className="min-w-0 flex-1">

                            <div className="truncate text-xs font-semibold text-white">
                              {productName}
                            </div>

                            <div className="mt-1 text-xs font-semibold text-[#e0b34c]">
                              {productPrice}
                            </div>

                          </div>

                          {/* Shop */}
                          <motion.button
                            onClick={handleShopClick}
                            className="flex h-11 min-w-[76px] items-center justify-center rounded-xl bg-[#d9a83f] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#101a32] shadow-[0_6px_20px_rgba(217,168,63,0.25)] transition-all hover:bg-[#e8bd5c]"
                            whileHover={{
                              scale: 1.05,
                            }}
                            whileTap={{
                              scale: 0.95,
                            }}
                          >
                            Shop
                          </motion.button>

                        </div>

                      </div>

                    </motion.div>
                  );
                })}
              </div>

              {/* =====================================================
            PAGINATION
        ====================================================== */}
              <div className="mt-5 flex justify-center gap-2">
                {(reelsData?.data || [])
                  .slice(0, 5)
                  .map((_: any, index: number) => (
                    <span
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${index === 0
                          ? "w-7 bg-[#d6a64b]"
                          : "w-2 bg-[#e7dfd0]"
                        }`}
                    />
                  ))}
              </div>

            </>
          )}
        </div>
      </motion.section>

      {/* Promises Section */}
      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <div className={s.promisesGrid}>
            {promises.map((p) => (
              <motion.div
                key={p.title}
                className={s.promiseItem}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className={s.promiseIcon}
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {p.icon}
                </motion.div>
                <div>
                  <div className={s.promiseTitle}>{p.title}</div>
                  <div className={s.promiseBody}>{p.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section>
        <Craft />
      </motion.section>


      {/* Flash Offers */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.div
          className={s.offersGlow}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className={s.container}>
          <motion.div
            className={s.offersHeader}
            variants={fadeInUp}
          >
            <div
              className={s.kicker}
              style={{ justifyContent: "center" }}
            >
              <span className={s.kickerLine} />
              Limited time
            </div>

            <h2
              className={s.sectionTitle}
              style={{ textAlign: "center" }}
            >
              Flash offers you don&apos;t want to miss
            </h2>
          </motion.div>

          <div className={s.offersGrid}>
            {/* HERO PRODUCT */}
            {isTopDiscountedLoading ? (
              <motion.div
                className={s.offerHero}
                variants={scaleIn}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Loading...
                </div>
              </motion.div>
            ) : topDiscountedProduct ? (
              <motion.div
                className={s.offerHero}
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={topDiscountedProduct.primary_image_url || topDiscountedProduct.images?.[0]?.image_url || "/images/placeholder.png"}
                  alt={topDiscountedProduct.name}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />

                <div className={s.offerHeroOverlay} />

                <div className={s.offerHeroContent}>
                  <motion.span
                    className={s.offerHeroTimer}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    ⏱ Ends in {time.h}:{time.m}:{time.s}
                  </motion.span>

                  <div className={s.offerHeroTitle}>
                    Up to{" "}
                    {topDiscountedData?.data?.[0]?.discounts
                      ?.max_discount ?? 0}
                    % off {topDiscountedProduct.name}
                  </div>

                  <motion.span
                    className={s.offerHeroCta}
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (topDiscountedProduct?.slug) {
                        router.push(`/product/${topDiscountedProduct.slug}/`);
                      }
                    }}
                  >
                    Shop flash sale →
                  </motion.span>
                </div>
              </motion.div>
            ) : null}

            {/* CATEGORY CARDS */}
            {!isCategoriesLoading &&
              categories.slice(0, 2).map((category: any) => {
                const categoryName = category.title || category.name || "Category";
                return (
                  <motion.div
                    key={category.id}
                    className={s.offerCard}
                    variants={scaleIn}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      router.push(
                        `/products/?category=${encodeURIComponent(categoryName)}`,
                      );
                    }}
                  >
                    <div className={s.offerCardContent}>
                      <div className={s.offerCardKicker}>
                        {category.products_count || 0}{" "}
                        {(category.products_count || 0) === 1
                          ? "Product"
                          : "Products"}
                      </div>

                      <div className={s.offerCardTitle}>
                        {categoryName}
                      </div>
                    </div>

                    <div>
                      <motion.div
                        className={s.offerCardImage}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}
                      >
                        <img
                          src={category.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=C9A96E&color=fff&size=300&bold=true`}
                          alt={categoryName}
                        />
                      </motion.div>

                      <motion.span
                        className={s.offerCardCta}
                        whileHover={{ x: 6 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                        }}
                      >
                        Shop {categoryName} →
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div
          className={s.testimonialGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className={s.testimonialContainer}>
          {/* Loading State */}
          {isStatsLoading ? (
            <motion.div
              variants={fadeInUp}
              className={s.testimonialLoading}
            >
              Loading testimonials...
            </motion.div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Rating Stars */}
              <motion.div
                className={s.testimonialStars}
                variants={fadeInUp}
              >
                {"★".repeat(
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Math.round(
                        testimonials[testimonialIndex]?.rating || 0
                      )
                    )
                  )
                )}
              </motion.div>

              {/* Testimonial */}
              <motion.div variants={fadeInUp}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={testimonialIndex}
                    className={s.testimonialQuote}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    “{testimonials[testimonialIndex].quote}”
                  </motion.p>
                </AnimatePresence>

                {/* Author */}
                <motion.div
                  className={s.testimonialAuthor}
                  key={`author-${testimonialIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                >
                  <div className={s.testimonialAvatar}>
                    {testimonials[testimonialIndex].img ? (
                      <img
                        src={testimonials[testimonialIndex].img}
                        alt={testimonials[testimonialIndex].name}
                        onError={(e) => {
                          // If image fails, show initials instead
                          const target = e.currentTarget;
                          const name = testimonials[testimonialIndex].name || 'U';
                          const initials = name
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase())
                            .slice(0, 2)
                            .join('');

                          // Create a canvas to generate fallback image
                          const canvas = document.createElement('canvas');
                          canvas.width = 80;
                          canvas.height = 80;
                          const ctx = canvas.getContext('2d');

                          if (ctx) {
                            // Black background
                            ctx.fillStyle = '#1a1a1a';
                            ctx.beginPath();
                            ctx.arc(40, 40, 40, 0, Math.PI * 2);
                            ctx.fill();

                            // White border
                            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(40, 40, 38, 0, Math.PI * 2);
                            ctx.stroke();

                            // Text - Bold White
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = 'bold 34px Arial, Helvetica, sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(initials, 40, 42);

                            // Convert canvas to data URL
                            target.src = canvas.toDataURL('image/png');
                          } else {
                            // Ultimate fallback - use UI Avatars API with dark background
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff&size=80&bold=true&font-size=0.5`;
                          }
                        }}
                      />
                    ) : (
                      // If no image URL, show initials immediately with black background and white bold text
                      <div className={s.initialsAvatar}>
                        {testimonials[testimonialIndex].name
                          ?.split(' ')
                          .map(word => word.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('') || 'U'}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className={s.testimonialName}>
                      {testimonials[testimonialIndex].name}
                    </div>

                    <div className={s.testimonialLoc}>
                      {testimonials[testimonialIndex].loc}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Testimonial Dots */}
              {testimonials.length > 1 && (
                <div className={s.testimonialDots}>
                  {testimonials.map((_, i) => (
                    <motion.span
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      className={`${s.testimonialDot} ${i === testimonialIndex ? s.active : ""
                        }`}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <motion.div
              variants={fadeInUp}
              className={s.testimonialLoading}
            >
              No reviews available.
            </motion.div>
          )}

          {/* Statistics */}
          {!isStatsLoading && statistics && (
            <motion.div
              className={s.testimonialStats}
              variants={fadeInUp}
            >
              {/* Total Reviews */}
              <motion.div
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className={s.statNumber}>
                  {statistics.total_reviews}
                </div>

                <div className={s.testimonialStatLabel}>
                  Total Reviews
                </div>
              </motion.div>

              {/* Average Rating */}
              <motion.div
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className={s.statNumber}>
                  {statistics.average_rating}
                </div>

                <div className={s.testimonialStatLabel}>
                  Average Rating
                </div>
              </motion.div>

              {/* Repeat Buyers */}
              <motion.div
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className={s.statNumber}>
                  {statistics.repeat_buyers_percentage}%
                </div>

                <div className={s.testimonialStatLabel}>
                  Repeat Buyers
                </div>
              </motion.div>

              {/* Total Cities */}
              <motion.div
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className={s.statNumber}>
                  {statistics.total_cities}
                </div>

                <div className={s.testimonialStatLabel}>
                  Cities Reached
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.section>
      {/* Growth Ladder */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          {/* Section Header */}
          <motion.div
            className={s.sectionHeader}
            variants={fadeInUp}
          >
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Opportunity
              </div>

              <h2 className={s.sectionTitle}>
                {growthTitle}
              </h2>
            </div>

            {/* Navigation Buttons */}
            {growthSteps.length > 1 && (
              <div className={s.levelControls}>
                <motion.button
                  type="button"
                  onClick={handlePreviousLevel}
                  className={s.arrowBtn}
                  aria-label="Previous growth level"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleNextLevel}
                  className={s.arrowBtn}
                  aria-label="Next growth level"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Loading */}
          {isGrowthStepsLoading ? (
            <motion.div
              className={s.levelsContainer}
              variants={staggerContainer}
            >
              <motion.div
                className={s.levelCard}
                variants={scaleIn}
              >
                <p className={s.levelBody}>
                  Loading growth levels...
                </p>
              </motion.div>
            </motion.div>
          ) : growthSteps.length === 0 ? (
            /* Empty State */
            <motion.div
              className={s.levelsContainer}
              variants={staggerContainer}
            >
              <motion.div
                className={s.levelCard}
                variants={scaleIn}
              >
                <p className={s.levelBody}>
                  No growth levels available.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Growth Cards */}
              <motion.div
                className={s.levelsContainer}
                variants={staggerContainer}
              >
                {growthSteps.map((step, i) => (
                  <motion.div
                    key={`${step.order}-${step.number}`}
                    onClick={() => setLevel(i)}
                    className={`${s.levelCard} ${activeLevel === i ? s.active : ""
                      }`}
                    variants={scaleIn}
                    whileHover={{ y: -4 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                    }}
                  >
                    <motion.div
                      className={s.levelNum}
                      animate={
                        activeLevel === i
                          ? {
                            scale: [1, 1.08, 1],
                          }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {step.number}
                    </motion.div>

                    <div
                      className={`${s.levelTitle} ${activeLevel === i ? s.active : ""
                        }`}
                    >
                      {step.subtitle}
                    </div>

                    <p className={s.levelBody}>
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile / Large Steps Indicator */}
              {growthSteps.length > 4 && (
                <motion.div
                  className={s.levelIndicator}
                  variants={fadeInUp}
                >
                  {growthSteps.map((step, i) => (
                    <motion.button
                      key={step.order}
                      type="button"
                      onClick={() => setLevel(i)}
                      className={`${s.levelIndicatorDot} ${activeLevel === i ? s.active : ""
                        }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      aria-label={`Go to ${step.subtitle}`}
                    />
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.section>
      {/* Makeup Products Section - Gallery ki jagah */}
      <motion.section
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        style={{
          marginBottom: '80px',
          paddingBottom: 0,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        <motion.div
          className={s.galleryGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div
          className={s.container}
          style={{
            paddingBottom: 0,
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <motion.div className={s.galleryHeader} variants={fadeInUp}>
            <div className={s.kicker} style={{ justifyContent: "center" }}>
              <span className={s.kickerLine} />
              #IndieKonnectGlow
            </div>
            <h2 className={s.sectionTitle} style={{ textAlign: "center" }}>
              Feel the glow with us
            </h2>
          </motion.div>

          {isMakeupLoading ? (
            <div className={s.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonText} />
                  <div className={s.skeletonPrice} />
                </div>
              ))}
            </div>
          ) : isMakeupError ? (
            <div className={s.errorState}>
              <p>Unable to load makeup products.</p>
              <button onClick={() => refetchMakeupProducts()} className={s.retryBtn}>
                Retry
              </button>
            </div>
          ) : makeupProducts.length === 0 ? (
            <div className={s.emptyState}>
              <p>No makeup products available right now. ✨</p>
            </div>
          ) : (
            <div className={s.productGrid}>
              {makeupProducts.slice(0, 4).map((p: any) => {
                const price = Number(p.retail_price ?? 0);
                const mrp = Number(p.retail_mrp ?? 0);
                const discount =
                  mrp > 0 && price < mrp
                    ? Math.round(((mrp - price) / mrp) * 100)
                    : 0;
                const image =
                  p.images?.find((img: any) => img.is_primary)
                    ?.image_url ||
                  p.images?.[0]?.image_url ||
                  "/images/product-placeholder.png";

                const isWishlisted = wish[p.id] || false;
                const isAddingToCart = isAddToCartLoading;

                return (
                  <motion.div
                    key={p.id}
                    className={s.productCard}
                    variants={scaleIn}
                    whileHover="hover"
                    transition={{ duration: 0.4 }}
                  >
                    <div className={s.productImageWrapper}>
                      <motion.div
                        className={s.productImage}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        onClick={() => router.push(`/product/${p.slug}/`)}
                      >
                        <img src={image} alt={p.name} />
                      </motion.div>
                      <span className={s.productTag}>💄 Makeup</span>

                      {/* Wishlist Button */}
                      <motion.div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(p.id, p.name);
                        }}
                        className={`${s.productWish} ${isWishlisted ? s.active : ""}`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        style={{ cursor: 'pointer' }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isWishlisted ? "#C44A6A" : "none"}
                          stroke={isWishlisted ? "#C44A6A" : "currentColor"}
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </motion.div>

                      {/* Add to Cart Button */}
                      <motion.div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p.id, p.name, image, price);
                        }}
                        className={s.productQuickAdd}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ cursor: 'pointer' }}
                      >
                        {isAddingToCart ? (
                          <div className={s.spinnerSmall} />
                        ) : (
                          "Add to bag"
                        )}
                      </motion.div>
                    </div>
                    <div className={s.productInfo}>
                      <div className={s.productCategory}>Makeup</div>
                      <div
                        className={s.productName}
                        onClick={() => router.push(`/product/${p.slug}/`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {p.name}
                      </div>
                      {p.description && (
                        <div className={s.productDescription}>
                          {p.description}
                        </div>
                      )}
                      <div className={s.productPrice}>
                        <span className={s.productPriceCurrent}>
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {mrp > 0 && mrp > price && (
                          <span className={s.productPriceMrp}>
                            ₹{mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className={s.productDiscount}>
                            {discount}% off
                          </span>
                        )}
                      </div>
                      <div className={s.productMeta}>
                        <span className={s.productStars}>★★★★★</span>
                        <span>New</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Cart Sidebar */}
      {cartSidebarOpen && (
        <div className={s.cartSidebarOverlay} onClick={handleCloseCart}>
          <div className={s.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={s.cartSidebarHeader}>
              <h3>Shopping Bag ({cartItems.length})</h3>
              <button onClick={handleCloseCart} className={s.cartCloseBtn}>
                ✕
              </button>
            </div>
            {cartItems.length === 0 ? (
              <div className={s.cartEmpty}>
                <p>Your bag is empty</p>
                <button onClick={handleCloseCart}>Start Shopping</button>
              </div>
            ) : (
              <>
                <div className={s.cartItemsList}>
                  {cartItems.map((item) => (
                    <div key={item.id} className={s.cartItem}>
                      <img src={item.image} alt={item.name} />
                      <div className={s.cartItemDetails}>
                        <div className={s.cartItemName}>{item.name}</div>
                        <div className={s.cartItemPrice}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className={s.cartItemQuantity}>
                          <button
                            onClick={() =>
                              handleUpdateCart(
                                item.id,
                                item.product_id,
                                "decrement"
                              )
                            }
                            disabled={isUpdatingCart || item.quantity <= 1}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              handleUpdateCart(
                                item.id,
                                item.product_id,
                                "increment"
                              )
                            }
                            disabled={isUpdatingCart}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={s.cartSidebarFooter}>
                  <div className={s.cartTotal}>
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => router.push('/checkout')} className={s.btnPrimary}>
                    Proceed to Checkout
                  </button>
                  <button onClick={handleViewCart} className={s.btnSecondary}>
                    View Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}