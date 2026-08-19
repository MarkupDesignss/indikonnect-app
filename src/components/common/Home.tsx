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
      <motion.div
        className={s.scrollProgress}
        style={{ width: `${scrollProgress}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

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
        className={s.heroPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Ambient Glows */}
        <motion.div
          className={s.heroPremiumGlow1}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={s.heroPremiumGlow2}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className={s.heroPremiumGlow3}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Decorative Lines */}
        <div className={`${s.heroPremiumLine} ${s.heroPremiumLine1}`} />
        <div className={`${s.heroPremiumLine} ${s.heroPremiumLine2}`} />

        <div className={s.heroPremiumContainer}>
          {/* LEFT CONTENT */}
          <motion.div
            className={s.heroPremiumContent}
            variants={fadeInUp}
          >
            <motion.div className={s.heroPremiumKicker} variants={fadeIn}>
              <span className={s.heroPremiumKickerLine} />
              <span>{getHeading()}</span>
              <span className={s.heroPremiumKickerDot} />
            </motion.div>

            <motion.h1
              className={s.heroPremiumHeading}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{
                __html: getShortDescription().replace(
                  /<span[^>]*>([^<]*)<\/span>/g,
                  '<span class="gold">$1</span>'
                )
              }}
            />

            <motion.div
              className={s.heroPremiumDivider}
              variants={fadeInUp}
            >
              <span className={s.heroPremiumDividerLine} />
              <span className={s.heroPremiumDividerDiamond}>◆</span>
              <span className={s.heroPremiumDividerLine} />
            </motion.div>

            <motion.p
              className={s.heroPremiumDescription}
              variants={fadeInUp}
              dangerouslySetInnerHTML={{
                __html: getDescription().replace(
                  /(crockery|jewellery|watches|beauty)/gi,
                  '<span class="highlight">$1</span>'
                )
              }}
            />

            <motion.div
              className={s.heroPremiumButtons}
              variants={fadeInUp}
            >
              <motion.button
                onClick={() => router.push("/products")}
                className={s.btnPremiumPrimary}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Shop the edit</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => router.push("/auth/distributor/login/")}
                className={s.btnPremiumSecondary}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span>Become a partner</span>
              </motion.button>
            </motion.div>

            <motion.div
              className={s.heroPremiumStats}
              variants={fadeInUp}
            >
              {heroStats.map((st) => (
                <motion.div
                  key={st.k}
                  className={s.heroPremiumStat}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={s.heroPremiumStatNumber}>
                    {st.v}
                    <span className={s.plus}>+</span>
                  </div>
                  <div className={s.heroPremiumStatLabel}>{st.k}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            className={s.heroPremiumImageWrapper}
            variants={fadeIn}
          >
            <div className={s.heroPremiumImageFrame}>
              <div className={s.heroPremiumCorner} />
              <div className={s.heroPremiumImageContainer}>
                <motion.img
                  src={getBannerImage()}
                  alt={getBannerAlt()}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.7 }}
                  loading="eager"
                />
              </div>
            </div>

            {/* Floating Badge 1 - Bestseller */}
            <motion.div
              className={`${s.heroPremiumBadge} ${s.heroPremiumBadge1}`}
              animate={{
                y: [0, -16, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className={s.heroPremiumBadgeIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className={s.heroPremiumBadgeLabel}>Bestseller</div>
                <div className={s.heroPremiumBadgeTitle}>Radiance Serum</div>
              </div>
            </motion.div>

            {/* Floating Badge 2 - Reviews */}
            <motion.div
              className={`${s.heroPremiumBadge} ${s.heroPremiumBadge2}`}
              animate={{
                y: [0, -14, 0],
                transition: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                },
              }}
            >
              <div className={s.heroPremiumBadgeStars}>★★★★★</div>
              <div className={s.heroPremiumBadgeReviews}>18,400 reviews</div>
            </motion.div>

            {/* Floating Badge 3 - Live */}
            <motion.div
              className={`${s.heroPremiumBadge} ${s.heroPremiumBadge3}`}
              animate={{
                y: [0, -12, 0],
                transition: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                },
              }}
            >
              <span className={s.heroPremiumBadgeDot} />
              <span>Live · 2.4k watching</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className={s.sectionDark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Browse
              </div>
              <h2 className={s.sectionTitle}>Shop by category</h2>
            </div>
            <motion.span
              className={s.viewAll}
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => router.push("/products")}
            >
              View all →
            </motion.span>
          </motion.div>

          {isCategoriesLoading ? (
            <div className={s.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonText} />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className={s.errorState}>
              <p>Failed to load categories</p>
              <button
                onClick={() => refetchCategories()}
                className={s.retryBtn}
              >
                Retry
              </button>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className={s.categoryGrid}>
              {categories.map((c: any, idx: number) => {
                const categoryName = c.title || c.name || c.category_name || "Category";
                const categoryImage = c.image ||
                  c.img ||
                  c.image_url ||
                  c.category_image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=C9A96E&color=fff&size=300&bold=true`;
                const productCount = c.products_count || c.count || c.product_count || 0;

                return (
                  <motion.div
                    key={c.id || c.category_id || idx}
                    className={s.categoryCard}
                    variants={scaleIn}
                    whileHover={{ y: -12, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() =>
                      router.push(
                        `/products/?category=${encodeURIComponent(categoryName)}`,
                      )
                    }
                  >
                    <div className={s.categoryImageWrapper}>
                      <motion.div
                        className={s.categoryImage}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6 }}
                      >
                        <img
                          src={categoryImage}
                          alt={categoryName}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=C9A96E&color=fff&size=300&bold=true`;
                          }}
                        />
                      </motion.div>
                      <motion.div
                        className={s.categoryOverlay}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span>Explore</span>
                      </motion.div>
                    </div>
                    <div className={s.categoryInfo}>
                      <div className={s.categoryName}>{categoryName}</div>
                      <div className={s.categoryCount}>
                        {productCount}{" "}
                        {productCount === 1 ? "product" : "products"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={s.emptyState}>
              <p>No categories available at the moment.</p>
              <button
                onClick={() => refetchCategories()}
                className={s.retryBtn}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section>
        <Nation />
      </motion.section>

      {/* DEAL OF THE DAY */}
      <motion.section
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.div
          className={s.dealGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className={s.container}>
          <motion.div className={s.dealKickerWrapper} variants={fadeInUp}>
            <div className={s.dealKicker}>
              <span className={s.dealDot} />
              Limited Deal
            </div>
          </motion.div>

          {isDealProductsLoading ? (
            <div className={s.dealLoading}>Loading deal of the day...</div>
          ) : dealProduct ? (
            <div className={s.dealGrid}>
              <motion.div className={s.dealImageWrapper} variants={fadeIn}>
                <div className={s.dealImageContainer}>
                  <motion.img
                    src={
                      dealProduct.primary_image_url ||
                      dealProduct.images?.[0]?.image_url ||
                      "/images/product-placeholder.png"
                    }
                    alt={dealProduct.name}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    className={s.dealBadge}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 8px 30px rgba(196,74,106,0.3)",
                        "0 8px 50px rgba(196,74,106,0.5)",
                        "0 8px 30px rgba(196,74,106,0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔥 Deal of the day
                  </motion.span>
                </div>
              </motion.div>

              <motion.div className={s.dealContent} variants={fadeInUp}>
                <div className={s.dealCategory}>
                  {dealProduct.category?.name || "Chandra Horology"}
                </div>

                <h2 className={s.dealTitle}>{dealProduct.name}</h2>

                {dealProduct.description && (
                  <p className={s.dealDescription}>{dealProduct.description}</p>
                )}

                <div className={s.dealPrice}>
                  <motion.span
                    className={s.dealPriceCurrent}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ₹{dealPricing.price.toLocaleString("en-IN")}
                  </motion.span>
                  {dealPricing.mrp > 0 && (
                    <span className={s.dealPriceMrp}>
                      ₹{dealPricing.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {dealPricing.discount > 0 && (
                    <motion.span
                      className={s.dealDiscount}
                      animate={{
                        backgroundColor: ["#4BBF8A", "#5CCF9A", "#4BBF8A"],
                        padding: ["2px 10px", "2px 14px", "2px 10px"],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {dealPricing.discount}% off
                    </motion.span>
                  )}
                </div>

                <div className={s.dealCountdown}>
                  {[
                    { v: time.h, k: "Hours" },
                    { v: time.m, k: "Mins" },
                    { v: time.s, k: "Secs" },
                  ].map((c) => (
                    <motion.div
                      key={c.k}
                      className={s.dealDigit}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        className={s.dealDigitValue}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {c.v}
                      </motion.div>
                      <div className={s.dealDigitLabel}>{c.k}</div>
                    </motion.div>
                  ))}
                  <motion.div
                    className={s.dealDigit}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className={s.dealDigitValue}>
                      {Math.max(0, Number(dealProduct.stock_quantity || 0))}
                    </div>
                    <div className={s.dealDigitLabel}>Left</div>
                  </motion.div>
                </div>

                <div className={s.dealStock}>
                  {(() => {
                    const stock = Number(dealProduct.stock_quantity || 0);
                    const threshold = Number(
                      dealProduct.low_stock_threshold || 10,
                    );
                    const totalStock = stock + 40;
                    const claimedPercentage =
                      totalStock > 0
                        ? Math.min(
                          100,
                          Math.round(
                            ((totalStock - stock) / totalStock) * 100,
                          ),
                        )
                        : 0;
                    return (
                      <>
                        <div className={s.dealStockBar}>
                          <motion.div
                            className={s.dealStockFill}
                            initial={{ width: "0%" }}
                            animate={{ width: `${claimedPercentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                        <div className={s.dealStockLabel}>
                          {stock <= threshold
                            ? `Only ${stock} left in stock`
                            : `${stock} items available`}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <motion.button
                  onClick={handleDealClick}
                  className={s.btnPrimary}
                  style={{ marginTop: 28 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span>Grab this deal</span>
                  <svg
                    className={s.btnArrow}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className={s.dealEmpty}>No deal available today.</div>
          )}
        </div>
      </motion.section>

      {/* Products Section - Trending */}
      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Most loved
              </div>
              <h2 className={s.sectionTitle}>Trending this week</h2>
            </div>
            <div className={s.filterGroup}>
              <motion.span
                onClick={() => setFilter("All")}
                className={`${s.filterChip} ${filter === "All" ? s.active : ""}`}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                All
              </motion.span>
              {isCategoriesLoading ? (
                <span className={s.filterLoading}>Loading...</span>
              ) : (
                categories.slice(0, 5).map((category: any) => (
                  <motion.span
                    key={category.id}
                    onClick={() => setFilter(category.id.toString())}
                    className={`${s.filterChip} ${filter === category.id.toString() ? s.active : ""}`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.title || category.name}
                  </motion.span>
                ))
              )}
            </div>
          </motion.div>

          {isTrendingLoading ? (
            <div className={s.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonText} />
                  <div className={s.skeletonPrice} />
                </div>
              ))}
            </div>
          ) : isTrendingError ? (
            <div className={s.errorState}>
              Unable to load trending products.
              <button onClick={() => refetchTrending()} className={s.retryBtn}>
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
                  <div className={s.emptyState}>
                    No trending products found in this category.
                  </div>
                ) : (
                  <div className={s.productGrid}>
                    {filteredProducts.map((p: any) => {
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
                      const category = categories.find(
                        (cat: any) => cat.id === p.category_id,
                      );

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
                            <span className={s.productTag}>
                              {category?.title || category?.name || "Trending"}
                            </span>

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
                            <div className={s.productCategory}>
                              {category?.title || category?.name || "Trending"}
                            </div>
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
                              <span>Trending</span>
                            </div>
                          </div>
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
        className={s.sectionLuxury}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          className={s.reelsGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className={s.container} style={{ overflow: 'hidden' }}>
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <motion.span
                  className={s.pulseDot}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Live now
              </div>
              <h2 className={s.sectionTitle}>Shop the reels</h2>
              <p className={s.sectionSubtitle}>
                Partner creators showing the products in real homes. Tap any
                reel to shop the look.
              </p>
            </div>
            <div className={s.reelControls}>
              <motion.button
                onClick={() => scrollReel(-1)}
                className={s.arrowBtn}
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
                onClick={() => scrollReel(1)}
                className={s.arrowBtn}
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
          </motion.div>

          {isReelsLoading ? (
            <div className={s.reelsLoading}>
              <div className={s.loaderRing} />
            </div>
          ) : reelsError ? (
            <div className={s.errorState}>Failed to load reels</div>
          ) : (
            <div
              ref={rail}
              className={s.reelRail}
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {(reelsData?.data || []).map((r: any) => {
                const product = r.product;
                const productSlug = product?.slug;
                const productName = product?.name || "Product";
                const productImage = getProductImage(product);
                const productPrice = getProductPrice(product);

                const creatorName =
                  r.creator_handle || r.title || "Creator";

                const views = r.followers_count || 0;

                const videoUrl =
                  r.video_full_path ||
                  r.video_full_url ||
                  r.video_url ||
                  r.video_path;

                const thumbnailUrl =
                  r.thumbnail_url || productImage;

                const handleShopClick = (e: React.MouseEvent) => {
                  e.stopPropagation();

                  if (productSlug) {
                    router.push(`/product/${productSlug}/`);
                  }
                };

                return (
                  <motion.div
                    key={r.id || r.creator_handle}
                    className={s.reelCard}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Reel Media */}
                    <div className={s.reelMedia}>
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
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onLoadedData={(e) => {
                            const video = e.currentTarget;

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
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      )}
                    </div>

                    {/* Overlay */}
                    <div className={s.reelOverlay} />

                    {/* Creator */}
                    <div className={s.reelHeader}>
                      <div className={s.reelAvatar}>
                        <img
                          src={getCreatorAvatar(creatorName)}
                          alt={creatorName}
                        />
                      </div>

                      <span className={s.reelCreator}>
                        @{creatorName}
                      </span>
                    </div>

                    {/* Views */}
                    <div className={s.reelViews}>
                      ▶ {formatViews(views)}
                    </div>

                    {/* Footer */}
                    <div className={s.reelFooter}>
                      <div className={s.reelCaption}>
                        {r.title ||
                          r.caption ||
                          `${creatorName}'s reel`}
                      </div>

                      {/* Product */}
                      <div className={s.reelProduct}>
                        <div className={s.reelProductImage}>
                          <img
                            src={thumbnailUrl}
                            alt={productName}
                          />
                        </div>

                        <div className={s.reelProductInfo}>
                          <div className={s.reelProductName}>
                            {productName}
                          </div>

                          <div className={s.reelProductPrice}>
                            {productPrice}
                          </div>
                        </div>

                        <motion.span
                          className={s.reelShopBtn}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShopClick}
                        >
                          Shop
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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