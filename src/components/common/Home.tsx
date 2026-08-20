"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import s from "./IndieKonnectHome.module.css";
import { ticker, heroStats, promises } from "./catalog";
import { FaTruck, FaLock, FaUndo, FaHeadset } from 'react-icons/fa';


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
  const [addToCartMutation, { isLoading: isAddToCartLoading }] =
    useAddToCartMutation();
  const [addToWishlistMutation, { isLoading: isAddToWishlistLoading }] =
    useAddToWishlistMutation();
  const [
    removeFromWishlistMutation,
    { isLoading: isRemoveFromWishlistLoading },
  ] = useRemoveFromWishlistMutation();
  const {
    data: topDiscountedData,
    isLoading: isTopDiscountedLoading,
    isError: isTopDiscountedError,
  } = useGetTopDiscountedProductsQuery();

  const topDiscountedProducts = topDiscountedData?.data ?? [];
  const topDiscountedProduct = topDiscountedProducts?.[0]?.product || null;

  const [updateCartItemMutation, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();
  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    {},
  );
  const { data: statsData, isLoading: isStatsLoading } = useGetStatsQuery();
  const { data: growthStepsData, isLoading: isGrowthStepsLoading } =
    useGetGrowthStepsQuery();

  const growthSteps =
    growthStepsData?.data?.steps?.filter((step) => step.is_active) ?? [];

  const growthTitle =
    growthStepsData?.data?.title || "A growth ladder for leaders";

  // Active level index ko safe rakho
  const activeLevel =
    growthSteps.length > 0 ? Math.min(level, growthSteps.length - 1) : 0;

  // Previous level
  const handlePreviousLevel = () => {
    if (growthSteps.length <= 1) return;

    setLevel((current) =>
      current === 0 ? growthSteps.length - 1 : current - 1,
    );
  };

  // Next level
  const handleNextLevel = () => {
    if (growthSteps.length <= 1) return;

    setLevel((current) =>
      current === growthSteps.length - 1 ? 0 : current + 1,
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
    return categories.find((cat: any) => cat.title?.toLowerCase() === "makeup");
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
    },
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


  // Hero Image - API se ya fallback
  const heroImage = useMemo(() => {
    if (bannerBlock?.images?.[0]?.url) {
      return bannerBlock.images[0].url;
    }
    return "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80";
  }, [bannerBlock]);

  // Hero Image Alt
  const heroImageAlt = useMemo(() => {
    if (bannerBlock?.images?.[0]?.alt_text) {
      return bannerBlock.images[0].alt_text;
    }
    return "Hero banner - IndieKonnect";
  }, [bannerBlock]);

  // Hero Heading
  const heroHeading = useMemo(() => {
    if (bannerBlock?.heading) {
      return getTextFromHtml(bannerBlock.heading);
    }
    return "Elevate Your · Summer Style";
  }, [bannerBlock]);

  // Hero Short Description (with HTML support)
  const heroShortDescription = useMemo(() => {
    if (bannerBlock?.short_description) {
      return bannerBlock.short_description;
    }
    return "Beauty, crockery,<br />jewellery and <span style='font-style:italic;color:#C9A96E'>watches</span><br />for the modern home.";
  }, [bannerBlock]);

  // Hero CTA Text
  const heroCtaPrimary = useMemo(() => {
    if (bannerBlock?.cta_primary_text) {
      return bannerBlock.cta_primary_text;
    }
    return "Shop Now";
  }, [bannerBlock]);

  const heroCtaSecondary = useMemo(() => {
    if (bannerBlock?.cta_secondary_text) {
      return bannerBlock.cta_secondary_text;
    }
    return "Explore Collection";
  }, [bannerBlock]);

  // Hero Collection Label
  const heroCollectionLabel = useMemo(() => {
    if (bannerBlock?.collection_label) {
      return bannerBlock.collection_label;
    }
    return "New Season · 2024";
  }, [bannerBlock]);

  // Hero Trust Features (API se ya default)
  const heroTrustFeatures = useMemo(() => {
    if (bannerBlock?.trust_features && Array.isArray(bannerBlock.trust_features)) {
      return bannerBlock.trust_features;
    }
    return [
      { icon: "♧", label: "Free Shipping", subtext: "On orders over $50" },
      { icon: "♢", label: "Secure Payment", subtext: "100% Protected" },
      { icon: "◌", label: "Easy Returns", subtext: "30 Days Return" },
      { icon: "♧", label: "24/7 Support", subtext: "Always Here to Help" },
    ];
  }, [bannerBlock]);

  // Hero Discount Badge
  const heroDiscountBadge = useMemo(() => {
    if (bannerBlock?.discount_badge) {
      return {
        prefix: bannerBlock.discount_badge.prefix || "Up To",
        value: bannerBlock.discount_badge.value || "40",
        suffix: bannerBlock.discount_badge.suffix || "OFF",
      };
    }
    return { prefix: "Up To", value: "40", suffix: "OFF" };
  }, [bannerBlock]);

  // Hero Floating Card
  const heroFloatingCard = useMemo(() => {
    if (bannerBlock?.floating_card) {
      return {
        label: bannerBlock.floating_card.label || "The Edit",
        title: bannerBlock.floating_card.title || "Signature Collection",
        cta: bannerBlock.floating_card.cta || "Explore",
      };
    }
    return { label: "The Edit", title: "Signature Collection", cta: "Explore" };
  }, [bannerBlock]);

  // Custom Toast Messages
  const showCustomToast = (
    type: "success" | "error" | "info",
    message: string,
    productName?: string,
  ) => {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      const container = document.createElement("div");
      container.id = "toast-container";
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

    const toast = document.createElement("div");
    const colors = {
      success: "#4BBF8A",
      error: "#FF4757",
      info: "#C9A96E",
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

    toast.addEventListener("mouseenter", () => {
      toast.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.2), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.8),
                              0 0 40px ${colors[type]}20`;
    });
    toast.addEventListener("mouseleave", () => {
      toast.style.boxShadow = `0 15px 50px rgba(0, 0, 0, 0.15), 
                              inset 0 1px 0 rgba(255, 255, 255, 0.6)`;
    });

    const iconMap = {
      success: "✓",
      error: "✕",
      info: "ℹ",
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
            ${productName || ""}
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

    const container = document.getElementById("toast-container");
    container?.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close-btn");
    closeBtn?.addEventListener("click", () => {
      toast.style.animation =
        "slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
      setTimeout(() => {
        toast.remove();
        if (container?.children.length === 0) {
          container.remove();
        }
      }, 400);
    });

    if (!document.getElementById("toast-styles")) {
      const style = document.createElement("style");
      style.id = "toast-styles";
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
        toast.style.animation =
          "slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
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
    productPrice: number,
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
          const existing = prev.find((item) => item.id === productId);

          if (existing) {
            return prev.map((item) =>
              item.id === productId
                ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
                : item,
            );
          }

          return [...prev, newItem];
        });

        setCartTotal((prev) => prev + productPrice);
        setCartSidebarOpen(true);
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

  const handleToggleWishlist = async (
    productId: string | number,
    productName: string,
  ) => {
    const isWishlisted = wish[productId] || false;

    try {
      if (isWishlisted) {
        const response = await removeFromWishlistMutation({
          product_id: productId,
        }).unwrap();

        console.log("Remove wishlist response:", response);

        if (response?.message || response?.data || response?.success === true) {
          setWish((w) => ({
            ...w,
            [productId]: false,
          }));

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

        console.log("Add wishlist response:", response);

        const responseMessage = response?.message?.toLowerCase?.() || "";

        if (
          response?.already_exists ||
          (responseMessage.includes("already") &&
            responseMessage.includes("wishlist"))
        ) {
          setWish((w) => ({
            ...w,
            [productId]: true,
          }));

          showCustomToast("info", "Already in your wishlist ❤️", productName);

          refetchWishlist();
          return;
        }

        if (response?.message || response?.data || response?.success === true) {
          setWish((w) => ({
            ...w,
            [productId]: true,
          }));

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
        setWish((w) => ({
          ...w,
          [productId]: true,
        }));

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
    action: "increment" | "decrement",
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
          : "Quantity decreased successfully",
      );
    } catch (error: any) {
      console.error("Update cart error:", error);

      showCustomToast(
        "error",
        error?.data?.message || error?.message || "Failed to update cart",
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
        HERO SECTION - DYNAMIC & PREMIUM LUXURY
        ============================================ */}

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="relative overflow-hidden bg-[#f7f5f0]"
      >
        <section className="relative overflow-hidden">
          <div
            className="
        relative
        mx-auto
        max-w-[1600px]
        overflow-hidden
        bg-[#eee7dc]
      "
          >
            {/* ==========================================================
      BACKGROUND IMAGE - DYNAMIC
      ========================================================== */}

            <div className="absolute inset-0 z-0">
              <motion.img
                src={heroImage}
                alt={heroImageAlt}
                className="
            h-full
            w-full
            object-cover
            object-center
          "
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* Soft luxury overlay - REDUCED BLUR - Removed blur completely */}
              <div
                className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#f8f2e9]/[0.85]
            via-[#f8f2e9]/[0.50]
            via-[45%]
            to-transparent
          "
              />

              {/* Bottom soft overlay */}
              <div
                className="
            absolute
            inset-x-0
            bottom-0
            h-[45%]
            bg-gradient-to-t
            from-[#6e5130]/[0.12]
            to-transparent
          "
              />
            </div>

            {/* ==========================================================
      MAIN CONTENT
      ========================================================== */}

            <div
              className="
          relative
          z-10
          grid
          min-h-[560px]
          items-center
          px-6
          pb-12
          pt-10
          sm:px-10
          sm:pb-14
          sm:pt-12
          lg:min-h-[600px]
          lg:grid-cols-[0.95fr_1.05fr]
          lg:px-14
          xl:min-h-[640px]
          xl:px-20
          2xl:px-24
        "
            >
              {/* ========================================================
        LEFT CONTENT
        ======================================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
            relative
            z-20
            max-w-[650px]
          "
              >
                {/* Collection label - DYNAMIC */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15,
                  }}
                  className="
              mb-5
              flex
              items-center
              gap-3
            "
                >
                  <span className="h-px w-9 bg-[#b88942]" />

                  <span
                    className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.35em]
                text-[#a87838]
                sm:text-[10px]
              "
                  >
                    {heroCollectionLabel}
                  </span>
                </motion.div>

                {/* ======================================================
          MAIN HEADING - DYNAMIC
          ====================================================== */}

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
              max-w-[620px]
              font-serif
              text-[34px]
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-[#171717]
              sm:text-[46px]
              md:text-[54px]
              lg:text-[48px]
              xl:text-[62px]
              2xl:text-[70px]
            "
                  dangerouslySetInnerHTML={{
                    __html: heroHeading,
                  }}
                />

                {/* ======================================================
          SHORT DESCRIPTION - DYNAMIC
          ====================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.45,
                  }}
                  className="
              mt-5
              max-w-[650px]
              text-[22px]
              leading-[1.35]
              tracking-[-0.02em]
              text-[#343434]
              sm:text-[26px]
              lg:text-[30px]
            "
                  dangerouslySetInnerHTML={{
                    __html: heroShortDescription,
                  }}
                />

                {/* ======================================================
          DECORATIVE DIVIDER
          ====================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.55,
                  }}
                  className="
              my-6
              flex
              items-center
              gap-3
            "
                >
                  <span className="h-px w-20 bg-[#c9a15e]" />

                  <span className="text-[8px] text-[#c9a15e]">
                    ◆
                  </span>

                  <span className="h-px w-8 bg-[#ded2bd]" />
                </motion.div>

                {/* ======================================================
          CTA BUTTONS - DYNAMIC
          ====================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.75,
                  }}
                  className="
              mt-7
              flex
              flex-col
              gap-3
              sm:flex-row
            "
                >
                  {/* Primary CTA - DYNAMIC */}
                  <motion.button
                    type="button"
                    onClick={() => router.push("/products")}
                    whileHover={{
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="
                group
                inline-flex
                h-[52px]
                items-center
                justify-center
                gap-7
                rounded-xl
                bg-[#b87f2f]
                px-7
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-white
                shadow-[0_12px_30px_rgba(184,127,47,0.22)]
                transition-all
                duration-300
                hover:bg-[#171717]
                sm:min-w-[190px]
              "
                  >
                    <span>{heroCtaPrimary}</span>

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

                  {/* Secondary CTA - DYNAMIC - REMOVED backdrop-blur-sm */}
                  <motion.button
                    type="button"
                    onClick={() => router.push("/products")}
                    whileHover={{
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="
                inline-flex
                h-[52px]
                items-center
                justify-center
                gap-4
                rounded-xl
                border
                border-[#b88942]
                bg-white/50
                px-7
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#282828]
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#a67838]
                sm:min-w-[190px]
              "
                  >
                    {heroCtaSecondary}

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
              mt-8
              grid
              max-w-[820px]
              grid-cols-1
              gap-4
              border-t
              border-[#cfc5b6]
              pt-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
                >
                  {/* Free Shipping - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.8, delay: 0.0, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaTruck className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">Free Shipping</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">On orders over $50</p>
                    </div>
                  </motion.div>

                  {/* Secure Payment - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 1.12, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaLock className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">Secure Payment</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">100% Protected</p>
                    </div>
                  </motion.div>

                  {/* Easy Returns - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 1.24, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaUndo className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">Easy Returns</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">30 Days Return</p>
                    </div>
                  </motion.div>

                  {/* 24/7 Support - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 1.36, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.8, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaHeadset className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">24/7 Support</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">Always Here to Help</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* ========================================================
        RIGHT SIDE
        ======================================================== */}

              <div
                className="
            relative
            hidden
            h-full
            min-h-[500px]
            lg:block
          "
              >
                {/* ======================================================
          DISCOUNT BADGE - DYNAMIC - REMOVED backdrop-blur-sm
          ====================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.7,
                    rotate: -8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
              absolute
              left-[8%]
              top-[15%]
              z-30
              flex
              h-[108px]
              w-[108px]
              flex-col
              items-center
              justify-center
              rounded-full
              border
              border-[#d7b477]
              bg-[#f9f4eb]/90
              shadow-[0_15px_35px_rgba(80,55,25,0.10)]
              xl:h-[120px]
              xl:w-[120px]
            "
                >
                  <span
                    className="
                text-[8px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#9b7440]
              "
                  >
                    {heroDiscountBadge.prefix}
                  </span>

                  <span
                    className="
                mt-0.5
                font-serif
                text-[34px]
                leading-none
                text-[#b47d2f]
                xl:text-[38px]
              "
                  >
                    {heroDiscountBadge.value}%
                  </span>

                  <span
                    className="
                mt-1
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#9b7440]
              "
                  >
                    {heroDiscountBadge.suffix}
                  </span>
                </motion.div>

                {/* ======================================================
          FLOATING COLLECTION CARD - DYNAMIC - REMOVED backdrop-blur-md
          ====================================================== */}

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
              bottom-[15%]
              right-[5%]
              z-30
              bg-white/90
              px-6
              py-4
              shadow-[0_18px_45px_rgba(40,30,20,0.13)]
            "
                >
                  <div
                    className="
                text-[8px]
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#b88942]
              "
                  >
                    {heroFloatingCard.label}
                  </div>

                  <div
                    className="
                mt-1.5
                font-serif
                text-[18px]
                text-[#252525]
              "
                  >
                    {heroFloatingCard.title}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-px w-8 bg-[#c49a5d]" />

                    <span className="text-[8px] uppercase tracking-[0.18em] text-[#888]">
                      {heroFloatingCard.cta}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
  BOTTOM GOLD LINE
  ============================================================ */}

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
    SHOP BY CATEGORY — PREMIUM
    ============================================================ */}

      <motion.section
        className="relative overflow-hidden bg-[#fbfaf7] py-16 sm:py-20 lg:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={staggerContainer}
      >
        {/* ============================================================
      AMBIENT BACKGROUND
    ============================================================ */}

        <motion.div
          className="pointer-events-none absolute -left-[220px] top-[12%] h-[500px] w-[500px] rounded-full bg-[#d5a646]/[0.06] blur-[130px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="pointer-events-none absolute -right-[200px] bottom-[10%] h-[500px] w-[500px] rounded-full bg-[#142747]/[0.035] blur-[130px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-[35%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/60 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-14">

          {/* ============================================================
        HEADER
    ============================================================ */}

          <motion.div
            variants={fadeInUp}
            className="mb-11 flex flex-col items-center text-center sm:mb-14"
          >
            {/* KICKER */}

            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#c89b43]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b8862e]">
                Browse & Discover
              </span>

              <span className="text-[11px] text-[#c89b43]">
                ✦
              </span>

              <span className="h-px w-10 bg-[#c89b43]" />
            </div>

            {/* HEADING */}

            <div className="relative">
              <h2
                className="
              font-serif
              text-[38px]
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-[#101a32]
              sm:text-[48px]
              md:text-[56px]
              lg:text-[64px]
            "
              >
                Shop by{" "}
                <span className="relative inline-block text-[#b98a37]">
                  Category

                  <span
                    className="
                  absolute
                  -bottom-2
                  left-0
                  h-[1px]
                  w-[72%]
                  bg-[#d7b66b]
                "
                  />
                </span>
              </h2>
            </div>

            {/* DECORATION */}

            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#d8c79e]" />

              <span className="text-[10px] text-[#c3922e]">
                ✦
              </span>

              <span className="h-px w-6 bg-[#d8c79e]" />
            </div>

            {/* DESCRIPTION */}

            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#747985] sm:text-[15px]">
              Find exactly what you're looking for from our handpicked
              collections, thoughtfully curated for every style.
            </p>
          </motion.div>


          {/* ============================================================
        CATEGORY LAYOUT
    ============================================================ */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

            {/* ==========================================================
          FEATURED COLLECTION
      ========================================================== */}

            <motion.div
              variants={scaleIn}
              whileHover={{
                y: -8,
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
          group
          relative
          min-h-[520px]
          cursor-pointer
          overflow-hidden
          rounded-[28px]
          border
          border-[#e8dfd0]
          bg-[#eee7dc]
          shadow-[0_20px_60px_rgba(30,30,30,0.08)]
          lg:row-span-2
        "
            >

              {/* IMAGE */}

              <img
                src="https://images.unsplash.com/photo-1612902456551-333ac5afa26e?auto=format&fit=crop&w=900&q=85"
                alt="Summer Collection"
                className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-transform
              duration-[1200ms]
              ease-out
              group-hover:scale-[1.07]
            "
              />

              {/* PREMIUM OVERLAY */}

              <div
                className="
              absolute
              inset-0
              bg-gradient-to-b
              from-white/[0.94]
              via-white/[0.58]
              to-black/[0.18]
            "
              />

              <div
                className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/30
              via-transparent
              to-transparent
            "
              />

              {/* CONTENT */}

              <div className="relative z-10 flex h-full flex-col p-7 sm:p-9">

                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-[#c89b43]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#b7832d]">
                    New Arrivals
                  </span>
                </div>

                <h3
                  className="
                mt-5
                max-w-[240px]
                font-serif
                text-[38px]
                leading-[1]
                tracking-[-0.035em]
                text-[#151515]
                sm:text-[42px]
              "
                >
                  Summer
                  <br />
                  <span className="text-[#b7832d]">
                    Collection
                  </span>
                </h3>

                <p className="mt-5 max-w-[235px] text-sm leading-6 text-[#555b63]">
                  Discover our latest arrivals for the season,
                  carefully selected to elevate your everyday style.
                </p>

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.04,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  className="
                mt-7
                flex
                w-fit
                items-center
                gap-3
                rounded-full
                bg-[#142747]
                px-6
                py-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
                shadow-[0_10px_30px_rgba(20,39,71,0.2)]
                transition-all
                duration-300
                hover:bg-[#b7832d]
              "
                >
                  Explore Now

                  <span className="text-sm">
                    →
                  </span>
                </motion.button>

              </div>

              {/* CORNER BADGE */}

              <div
                className="
              absolute
              bottom-6
              right-6
              z-20
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-white/70
              text-[#b7832d]
              shadow-lg
              backdrop-blur-xl
            "
              >
                ✦
              </div>

              {/* SHINE */}

              <div
                className="
              pointer-events-none
              absolute
              -left-[100%]
              top-0
              z-30
              h-full
              w-[50%]
              rotate-[18deg]
              bg-gradient-to-r
              from-transparent
              via-white/[0.25]
              to-transparent
              transition-all
              duration-[1200ms]
              group-hover:left-[130%]
            "
              />

            </motion.div>


            {/* ==========================================================
          CATEGORY CARDS
      ========================================================== */}

            {[
              {
                name: "Bags & Purses",
                count: 120,
                image:
                  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
              },
              {
                name: "Watches",
                count: 85,
                image:
                  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85",
              },
              {
                name: "Jewelry",
                count: 200,
                image:
                  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=85",
              },
              {
                name: "Sunglasses",
                count: 150,
                image:
                  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85",
              },
              {
                name: "Footwear",
                count: 180,
                image:
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
              },
              {
                name: "Beauty",
                count: 90,
                image:
                  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85",
              },
            
            ].map((category, index) => (

              <motion.div
                key={category.name}
                variants={scaleIn}
                whileHover={{
                  y: -8,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => {
                  router.push(
                    `/products/?category=${encodeURIComponent(
                      category.name
                    )}`
                  );
                }}
                className="
              group
              cursor-pointer
              overflow-hidden
              rounded-[24px]
              border
              border-[#e9e2d7]
              bg-white
              shadow-[0_10px_35px_rgba(30,30,30,0.045)]
              transition-shadow
              duration-500
              hover:shadow-[0_24px_55px_rgba(30,30,30,0.12)]
            "
              >

                {/* IMAGE */}

                <div className="relative aspect-[1.25/1] overflow-hidden">

                  <img
                    src={category.image}
                    alt={category.name}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-[1000ms]
                  ease-out
                  group-hover:scale-[1.08]
                "
                  />

                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/35
                  via-transparent
                  to-transparent
                  opacity-70
                  transition-opacity
                  duration-500
                  group-hover:opacity-90
                "
                  />

                  {/* TOP CATEGORY LABEL */}

                  <div
                    className="
                  absolute
                  left-4
                  top-4
                  rounded-full
                  border
                  border-white/30
                  bg-black/20
                  px-3
                  py-1.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-white
                  backdrop-blur-xl
                "
                  >
                    Collection
                  </div>

                  {/* FLOATING ICON */}

                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    className="
                  absolute
                  bottom-[-20px]
                  left-6
                  z-20
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#eee7dc]
                  bg-white
                  text-[#b7832d]
                  shadow-[0_10px_30px_rgba(30,30,30,0.16)]
                  transition-all
                  duration-300
                  group-hover:border-[#d0a353]
                "
                  >
                    <span className="text-lg">
                      {index === 0 && "✦"}
                      {index === 1 && "◷"}
                      {index === 2 && "◇"}
                      {index === 3 && "◉"}
                      {index === 4 && "⌁"}
                      {index === 5 && "✧"}
                      {index === 6 && "♢"}
                      {index === 7 && "⌂"}
                    </span>
                  </motion.div>

                </div>


                {/* CARD CONTENT */}

                <div className="px-5 pb-5 pt-8 sm:px-6 sm:pb-6">

                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <h3
                        className="
                      truncate
                      font-serif
                      text-[19px]
                      font-semibold
                      tracking-[-0.02em]
                      text-[#151515]
                      transition-colors
                      duration-300
                      group-hover:text-[#b7832d]
                    "
                      >
                        {category.name}
                      </h3>

                      <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8a8a8a]">
                        {category.count}+ Items
                      </p>

                    </div>


                    {/* ARROW */}

                    <motion.div
                      whileHover={{
                        scale: 1.08,
                      }}
                      className="
                    flex
                    h-10
                    w-10
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#e3ddd3]
                    text-[#777]
                    transition-all
                    duration-300
                    group-hover:border-[#b7832d]
                    group-hover:bg-[#b7832d]
                    group-hover:text-white
                  "
                    >
                      <span
                        className="
                      text-base
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                      >
                        →
                      </span>
                    </motion.div>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>


          {/* ============================================================
        BENEFITS BAR
    ============================================================ */}

          <motion.div
            variants={fadeInUp}
            className="
          mt-8
          overflow-hidden
          rounded-[24px]
          border
          border-[#e9e2d7]
          bg-white/80
          shadow-[0_12px_40px_rgba(40,30,20,0.05)]
          backdrop-blur-xl
        "
          >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

              {/* FREE SHIPPING */}

              <div
                className="
              group
              flex
              items-center
              gap-4
              border-b
              border-[#eee7dc]
              px-6
              py-6
              transition-colors
              duration-300
              hover:bg-[#fbfaf7]
              md:px-7
              lg:border-b-0
              lg:border-r
            "
              >

                <div
                  className="
                flex
                h-12
                w-12
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#eadfc9]
                bg-[#fffaf0]
                text-xl
                text-[#b7832d]
                transition-transform
                duration-300
                group-hover:scale-105
              "
                >
                  ♧
                </div>

                <div>
                  <h4 className="font-serif text-[15px] font-semibold text-[#151515]">
                    Free Shipping
                  </h4>

                  <p className="mt-1 text-[11px] text-[#777]">
                    On orders above $50
                  </p>
                </div>

              </div>


              {/* SECURE PAYMENT */}

              <div
                className="
              group
              flex
              items-center
              gap-4
              border-b
              border-[#eee7dc]
              px-6
              py-6
              transition-colors
              duration-300
              hover:bg-[#fbfaf7]
              md:border-r
              lg:border-b-0
            "
              >

                <div
                  className="
                flex
                h-12
                w-12
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#eadfc9]
                bg-[#fffaf0]
                text-xl
                text-[#b7832d]
                transition-transform
                duration-300
                group-hover:scale-105
              "
                >
                  ◇
                </div>

                <div>
                  <h4 className="font-serif text-[15px] font-semibold text-[#151515]">
                    Secure Payment
                  </h4>

                  <p className="mt-1 text-[11px] text-[#777]">
                    100% protected
                  </p>
                </div>

              </div>


              {/* EASY RETURNS */}

              <div
                className="
              group
              flex
              items-center
              gap-4
              border-b
              border-[#eee7dc]
              px-6
              py-6
              transition-colors
              duration-300
              hover:bg-[#fbfaf7]
              lg:border-b-0
              lg:border-r
            "
              >

                <div
                  className="
                flex
                h-12
                w-12
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#eadfc9]
                bg-[#fffaf0]
                text-xl
                text-[#b7832d]
                transition-transform
                duration-300
                group-hover:scale-105
              "
                >
                  ↻
                </div>

                <div>
                  <h4 className="font-serif text-[15px] font-semibold text-[#151515]">
                    Easy Returns
                  </h4>

                  <p className="mt-1 text-[11px] text-[#777]">
                    30 days return policy
                  </p>
                </div>

              </div>


              {/* SUPPORT */}

              <div
                className="
              group
              flex
              items-center
              gap-4
              px-6
              py-6
              transition-colors
              duration-300
              hover:bg-[#fbfaf7]
              md:px-7
            "
              >

                <div
                  className="
                flex
                h-12
                w-12
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#eadfc9]
                bg-[#fffaf0]
                text-xl
                text-[#b7832d]
                transition-transform
                duration-300
                group-hover:scale-105
              "
                >
                  ♧
                </div>

                <div>
                  <h4 className="font-serif text-[15px] font-semibold text-[#151515]">
                    24/7 Support
                  </h4>

                  <p className="mt-1 text-[11px] text-[#777]">
                    Always here to help
                  </p>
                </div>

              </div>

            </div>

          </motion.div>


          {/* ============================================================
        BOTTOM MICRO COPY
    ============================================================ */}

          <motion.div
            variants={fadeInUp}
            className="
          mt-8
          flex
          items-center
          justify-center
          gap-3
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.25em]
          text-[#9a9ba1]
        "
          >
            <span className="h-px w-8 bg-[#ddd4c3]" />

            <span>
              Curated for your style
            </span>

            <span className="text-[#c3922e]">
              ✦
            </span>

            <span className="h-px w-8 bg-[#ddd4c3]" />
          </motion.div>

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
        className="relative w-full overflow-hidden bg-white py-16 sm:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* =====================================================
      SUBTLE BACKGROUND GLOW
    ====================================================== */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#f5c35b]/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-8 xl:px-10">

          {/* =====================================================
        CENTERED HEADER
    ====================================================== */}
          <motion.div
            className="mb-10 flex flex-col items-center text-center"
            variants={fadeInUp}
          >
            {/* Kicker */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#dcae45]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#dcae45] sm:text-xs">
                Most loved
              </span>

              <span className="h-px w-8 bg-[#dcae45]" />
            </div>

            {/* Heading */}
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#071a41] sm:text-5xl lg:text-6xl">
              Trending this{" "}
              <span className="text-[#dcae45]">
                week
              </span>
            </h2>

            {/* Decorative Gold Line */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-[#dcae45] to-[#dcae45]" />

              <span className="text-sm text-[#dcae45]">
                ✦
              </span>

              <span className="h-px w-20 bg-gradient-to-l from-transparent via-[#dcae45] to-transparent" />
            </div>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#7a8294] sm:text-base">
              Discover the pieces everyone is loving right now.
            </p>

            {/* =====================================================
          FILTERS - CENTERED
      ====================================================== */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {/* ALL */}
              <motion.button
                type="button"
                onClick={() => setFilter("All")}
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className={`rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-300 ${filter === "All"
                  ? "border-[#071a41] bg-[#071a41] text-white shadow-[0_8px_20px_rgba(7,26,65,0.18)]"
                  : "border-[#dfe3ea] bg-white text-[#526078] hover:border-[#dcae45] hover:text-[#071a41]"
                  }`}
              >
                All
              </motion.button>

              {/* CATEGORIES */}
              {isCategoriesLoading ? (
                <span className="px-3 text-xs text-[#8992a5]">
                  Loading...
                </span>
              ) : (
                categories.slice(0, 5).map((category: any) => {
                  const categoryId = category.id.toString();
                  const isActive = filter === categoryId;

                  return (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => setFilter(categoryId)}
                      whileHover={{
                        y: -2,
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      className={`rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-300 ${isActive
                        ? "border-[#071a41] bg-[#071a41] text-white shadow-[0_8px_20px_rgba(7,26,65,0.18)]"
                        : "border-[#dfe3ea] bg-white text-[#526078] hover:border-[#dcae45] hover:text-[#071a41]"
                        }`}
                    >
                      {category.title || category.name}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* =====================================================
        LOADING
    ====================================================== */}
          {isTrendingLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[24px] border border-[#e7eaf0] bg-white shadow-[0_8px_30px_rgba(7,26,65,0.05)]"
                >
                  {/* Image Skeleton */}
                  <div className="aspect-[0.92] animate-pulse bg-[#eef1f6]" />

                  {/* Content Skeleton */}
                  <div className="space-y-4 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#eef1f6]" />

                    <div className="h-6 w-3/4 animate-pulse rounded bg-[#eef1f6]" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef1f6]" />

                    <div className="h-6 w-2/3 animate-pulse rounded bg-[#eef1f6]" />

                    <div className="h-12 w-full animate-pulse rounded-xl bg-[#eef1f6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isTrendingError ? (

            /* =====================================================
                ERROR
            ====================================================== */
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-red-100 bg-[#fffafa]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-400">
                !
              </div>

              <p className="mb-5 text-sm text-[#7b3f46]">
                Unable to load trending products.
              </p>

              <button
                onClick={() => refetchTrending()}
                className="rounded-full bg-[#071a41] px-7 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#102d60] hover:shadow-lg"
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
                        product.category_id === Number(filter)
                    );

                return filteredProducts.length === 0 ? (

                  /* =================================================
                      EMPTY STATE
                  ================================================== */
                  <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-[#e7eaf0] bg-[#fafbfc]">
                    <div className="text-center">
                      <div className="mb-3 text-3xl">
                        ✨
                      </div>

                      <p className="text-sm text-[#707b90]">
                        No trending products found in this category.
                      </p>
                    </div>
                  </div>

                ) : (

                  /* =================================================
                      PRODUCT GRID
                  ================================================== */
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {filteredProducts.map((p: any) => {

                      const price = Number(
                        p.retail_price ?? 0
                      );

                      const mrp = Number(
                        p.retail_mrp ?? 0
                      );

                      const discount =
                        mrp > 0 && price < mrp
                          ? Math.round(
                            ((mrp - price) / mrp) * 100
                          )
                          : 0;

                      const image =
                        p.images?.find(
                          (img: any) => img.is_primary
                        )?.image_url ||
                        p.images?.[0]?.image_url ||
                        "/images/product-placeholder.png";

                      const category =
                        categories.find(
                          (cat: any) =>
                            cat.id === p.category_id
                        );

                      const categoryName =
                        category?.title ||
                        category?.name ||
                        "Trending";

                      const isWishlisted =
                        wish[p.id] || false;

                      const isAddingToCart =
                        isAddToCartLoading;

                      return (

                        <motion.div
                          key={p.id}
                          variants={scaleIn}
                          whileHover={{
                            y: -7,
                            transition: {
                              duration: 0.3,
                            },
                          }}
                          className="group relative overflow-hidden rounded-[24px] border border-[#e4e8ef] bg-white shadow-[0_8px_30px_rgba(7,26,65,0.055)] transition-all duration-500 hover:border-[#dcae45]/70 hover:shadow-[0_20px_55px_rgba(7,26,65,0.13)]"
                        >

                          {/* =================================================
                        PRODUCT IMAGE
                    ================================================== */}
                          <div className="relative aspect-[0.92] overflow-hidden bg-[#f6f7f9]">

                            <motion.img
                              src={image}
                              alt={p.name}
                              onClick={() =>
                                router.push(
                                  `/product/${p.slug}/`
                                )
                              }
                              whileHover={{
                                scale: 1.08,
                              }}
                              transition={{
                                duration: 0.65,
                                ease: "easeOut",
                              }}
                              className="h-full w-full cursor-pointer object-cover"
                            />

                            {/* Image Gradient */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071a41]/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            {/* =================================================
                          CATEGORY BADGE
                      ================================================== */}
                            <div className="absolute left-4 top-4">
                              <span className="inline-flex items-center rounded-full border border-[#dcae45]/40 bg-[#071a41] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4c45f] shadow-lg">
                                {categoryName}
                              </span>
                            </div>

                            {/* =================================================
                          WISHLIST
                      ================================================== */}
                            <motion.button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleToggleWishlist(
                                  p.id,
                                  p.name
                                );
                              }}
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.88,
                              }}
                              className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${isWishlisted
                                ? "border-[#c44a6a]/20 bg-[#fff1f4] text-[#c44a6a]"
                                : "border-white/80 bg-white/95 text-[#071a41] shadow-md hover:border-[#dcae45] hover:text-[#dcae45]"
                                }`}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill={
                                  isWishlisted
                                    ? "#C44A6A"
                                    : "none"
                                }
                                stroke={
                                  isWishlisted
                                    ? "#C44A6A"
                                    : "currentColor"
                                }
                                strokeWidth="1.8"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                              </svg>
                            </motion.button>
                          </div>

                          {/* =================================================
                        PRODUCT INFO
                    ================================================== */}
                          <div className="p-5 sm:p-6">

                            {/* Category */}
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dcae45]">
                              {categoryName}
                            </div>

                            {/* Product Name */}
                            <div
                              onClick={() =>
                                router.push(
                                  `/product/${p.slug}/`
                                )
                              }
                              className="cursor-pointer font-serif text-xl font-semibold leading-tight text-[#071a41] transition-colors duration-300 hover:text-[#b98321]"
                            >
                              {p.name}
                            </div>

                            {/* Description */}
                            {p.description && (
                              <div className="mt-2 line-clamp-1 text-sm text-[#788197]">
                                {p.description}
                              </div>
                            )}

                            {/* =================================================
                          PRICE
                      ================================================== */}
                            <div className="mt-5 flex flex-wrap items-center gap-3">

                              <span className="text-lg font-bold text-[#071a41]">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              {mrp > 0 &&
                                mrp > price && (
                                  <span className="text-sm text-[#8b93a4] line-through">
                                    ₹
                                    {mrp.toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                )}

                              {discount > 0 && (
                                <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-[11px] font-semibold text-[#b77c12]">
                                  {discount}% off
                                </span>
                              )}
                            </div>

                            {/* =================================================
                          RATING
                      ================================================== */}
                            <div className="mt-3 flex items-center gap-2">

                              <span className="text-[15px] tracking-[2px] text-[#f1b83b]">
                                ★★★★★
                              </span>

                              <span className="h-4 w-px bg-[#dfe3ea]" />

                              <span className="text-xs text-[#7c8496]">
                                Trending
                              </span>

                            </div>

                            {/* =================================================
                          ADD TO CART
                      ================================================== */}
                            <motion.button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleAddToCart(
                                  p.id,
                                  p.name,
                                  image,
                                  price
                                );
                              }}
                              whileHover={{
                                scale: 1.015,
                              }}
                              whileTap={{
                                scale: 0.97,
                              }}
                              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#071a41] bg-[#071a41] text-sm font-medium text-white shadow-[0_8px_20px_rgba(7,26,65,0.15)] transition-all duration-300 hover:bg-[#102d60] hover:shadow-[0_12px_28px_rgba(7,26,65,0.22)]"
                            >
                              {isAddingToCart ? (

                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                              ) : (

                                <>
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M6 8h12l1 12H5L6 8z" />
                                    <path d="M9 8a3 3 0 016 0" />
                                  </svg>

                                  Add to cart
                                </>

                              )}
                            </motion.button>

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
        className="relative overflow-hidden bg-[#fbfaf7] py-16 sm:py-20 lg:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={staggerContainer}
      >
        {/* =========================================================
      AMBIENT BACKGROUND
    ========================================================== */}

        <motion.div
          className="pointer-events-none absolute -left-[220px] top-[10%] h-[520px] w-[520px] rounded-full bg-[#d5a646]/[0.075] blur-[130px]"
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="pointer-events-none absolute -right-[180px] bottom-[5%] h-[480px] w-[480px] rounded-full bg-[#142747]/[0.045] blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[100px]" />

        <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-14">

          {/* =========================================================
        TRENDING CENTER HEADING
    ========================================================== */}

          <motion.div
            variants={fadeInUp}
            className="relative mb-12 flex flex-col items-center text-center lg:mb-16"
          >
            {/* Small top label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-5 flex items-center justify-center gap-3"
            >
              <span className="h-px w-8 bg-[#c89b43] sm:w-12" />

              <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#b8862e] sm:text-[10px]">
                Shop the reels
              </span>

              <span className="text-[10px] text-[#c3922e]">
                ✦
              </span>

              <span className="h-px w-8 bg-[#c89b43] sm:w-12" />
            </motion.div>

            {/* Main heading */}
            <div className="relative">
              {/* subtle glow behind heading */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d5a646]/10 blur-[55px] sm:w-[500px]" />

              <h2
                className="
              relative
              font-serif
              text-[46px]
              font-medium
              leading-[0.9]
              tracking-[-0.055em]
              text-[#101a32]
              sm:text-[58px]
              md:text-[68px]
              lg:text-[82px]
              xl:text-[94px]
            "
              >
                Shop the{" "}
                <span className="relative inline-block text-[#b98a37]">
                  reels

                  {/* gold underline */}
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="
                  absolute
                  -bottom-2
                  left-1/2
                  h-[2px]
                  -translate-x-1/2
                  rounded-full
                  bg-[#d7b66b]
                  sm:-bottom-3
                "
                  />

                  {/* tiny diamond */}
                  <span className="absolute -right-5 -top-2 text-[9px] text-[#c3922e] sm:-right-6 sm:-top-3">
                    ✦
                  </span>
                </span>
              </h2>
            </div>

            {/* Editorial decoration */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#ded1b5] sm:w-16" />

              <span className="text-[9px] text-[#c3922e]">
                ◆
              </span>

              <span className="h-px w-5 bg-[#ded1b5] sm:w-8" />
            </div>

            {/* Description */}
            <p className="mt-5 max-w-[580px] text-[13px] leading-6 text-[#747985] sm:text-[15px]">
              Discover how creators style their favourite pieces.
              <br className="hidden sm:block" />
              Tap any reel to explore and shop the look.
            </p>

            {/* Trending pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.45,
              }}
              className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-[#e3d6bd]
            bg-white/70
            px-4
            py-2
            shadow-[0_8px_30px_rgba(20,39,71,0.05)]
            backdrop-blur-md
          "
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a33f] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c3922e]" />
              </span>

              <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#8a744d]">
                Trending now
              </span>
            </motion.div>
          </motion.div>

          {/* =========================================================
        CONTROLS
    ========================================================== */}

          <motion.div
            variants={fadeInUp}
            className="mb-7 flex items-center justify-end gap-3 sm:mb-9"
          >
            {/* Previous */}
            <motion.button
              type="button"
              aria-label="Previous reels"
              onClick={() => scrollReel(-1)}
              whileHover={{
                scale: 1.06,
                y: -2,
              }}
              whileTap={{
                scale: 0.92,
              }}
              className="
            group
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-[#ded5c3]
            bg-white/90
            text-[#142747]
            shadow-[0_10px_30px_rgba(20,39,71,0.07)]
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-[#c79a42]
            hover:bg-[#142747]
            hover:text-white
            sm:h-14
            sm:w-14
          "
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            {/* Next */}
            <motion.button
              type="button"
              aria-label="Next reels"
              onClick={() => scrollReel(1)}
              whileHover={{
                scale: 1.06,
                y: -2,
              }}
              whileTap={{
                scale: 0.92,
              }}
              className="
            group
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-[#c79a42]
            bg-[#142747]
            text-white
            shadow-[0_12px_30px_rgba(20,39,71,0.14)]
            transition-all
            duration-300
            hover:bg-[#1b3155]
            sm:h-14
            sm:w-14
          "
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </motion.div>

          {/* =========================================================
        CONTENT
    ========================================================== */}

          {isReelsLoading ? (
            /* =======================================================
               LOADING
            ======================================================== */

            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                h-[470px]
                w-[280px]
                flex-shrink-0
                animate-pulse
                rounded-[28px]
                bg-[#eeeae2]
                sm:h-[530px]
              "
                />
              ))}
            </div>
          ) : reelsError ? (
            /* =======================================================
               ERROR
            ======================================================== */

            <motion.div
              variants={fadeInUp}
              className="
            flex
            min-h-[360px]
            items-center
            justify-center
            rounded-[30px]
            border
            border-[#e9e1d4]
            bg-white/80
            shadow-[0_20px_60px_rgba(20,25,35,0.05)]
            backdrop-blur-xl
          "
            >
              <div className="text-center">
                <div
                  className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-[#e6d6b7]
                bg-[#fffaf0]
                text-xl
                text-[#c3922e]
              "
                >
                  !
                </div>

                <h3 className="mt-5 font-serif text-xl text-[#142747]">
                  Something went wrong
                </h3>

                <p className="mt-2 text-sm text-[#858894]">
                  We couldn't load the reels right now.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* =====================================================
            REELS RAIL
        ====================================================== */}

              <div
                ref={rail}
                className="
              flex
              gap-5
              overflow-x-auto
              overflow-y-hidden
              pb-7
              pt-4
              scrollbar-hide
              snap-x
              snap-mandatory
            "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {(reelsData?.data || []).map(
                  (r: any, index: number) => {
                    const product = r.product;

                    const productSlug = product?.slug;

                    const productName =
                      product?.name || "Featured product";

                    const productImage =
                      getProductImage(product);

                    const productPrice =
                      getProductPrice(product);

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
                        key={
                          r.id ||
                          `${creatorName}-${index}`
                        }
                        variants={scaleIn}
                        className={`
                      group
                      relative
                      flex-shrink-0
                      snap-start
                      overflow-hidden
                      rounded-[30px]
                      bg-[#0c1119]

                      ${index === 2
                            ? `
                            border
                            border-[#d5aa55]
                            shadow-[0_28px_80px_rgba(194,150,55,0.22)]
                          `
                            : `
                            border
                            border-white/20
                            shadow-[0_25px_65px_rgba(15,25,40,0.16)]
                          `
                          }
                    `}
                        style={{
                          width:
                            "clamp(250px, 25vw, 330px)",
                          height:
                            "clamp(455px, 47vw, 570px)",
                        }}
                        whileHover={{
                          y: -12,
                          scale: 1.018,
                        }}
                        transition={{
                          duration: 0.45,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {/* =================================================
                      FEATURED BADGE
                  ================================================== */}

                        {index === 2 && (
                          <motion.div
                            className="
                          absolute
                          left-1/2
                          top-4
                          z-40
                          -translate-x-1/2
                          rounded-full
                          border
                          border-[#f3d68d]/60
                          bg-[#c99b3d]
                          px-4
                          py-1.5
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-[0.2em]
                          text-white
                          shadow-[0_8px_25px_rgba(196,150,55,0.4)]
                        "
                            animate={{
                              y: [0, -3, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            Featured
                          </motion.div>
                        )}

                        {/* =================================================
                      MEDIA
                      VIDEO PLAYS ONLY ON HOVER
                  ================================================== */}

                        <div className="absolute inset-0 overflow-hidden">
                          {videoUrl ? (
                            <video
                              src={videoUrl}
                              poster={thumbnailUrl}
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              controls={false}
                              className="
                            block
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-[1200ms]
                            ease-out
                            group-hover:scale-[1.07]
                          "
                              onMouseEnter={(e) => {
                                const video =
                                  e.currentTarget;

                                video
                                  .play()
                                  .catch(() => { });
                              }}
                              onMouseLeave={(e) => {
                                const video =
                                  e.currentTarget;

                                video.pause();
                              }}
                            />
                          ) : (
                            <img
                              src={thumbnailUrl}
                              alt={
                                r.title ||
                                "Creator reel"
                              }
                              className="
                            block
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-[1200ms]
                            ease-out
                            group-hover:scale-[1.07]
                          "
                            />
                          )}

                          {/* Play icon before hover */}
                          {videoUrl && (
                            <div
                              className="
                            pointer-events-none
                            absolute
                            left-1/2
                            top-1/2
                            z-20
                            flex
                            h-14
                            w-14
                            -translate-x-1/2
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/40
                            bg-black/30
                            text-white
                            opacity-100
                            backdrop-blur-md
                            transition-all
                            duration-500
                            group-hover:scale-75
                            group-hover:opacity-0
                          "
                            >
                              <svg
                                className="ml-1 h-5 w-5 fill-white"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}

                          {/* cinematic overlay */}

                          <div
                            className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-b
                          from-black/50
                          via-black/0
                          to-[#05080d]
                        "
                          />

                          <div
                            className="
                          pointer-events-none
                          absolute
                          inset-x-0
                          bottom-0
                          h-[60%]
                          bg-gradient-to-t
                          from-[#05080d]
                          via-[#05080d]/75
                          to-transparent
                        "
                          />

                          <div
                            className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-[radial-gradient(circle_at_50%_0%,transparent_25%,rgba(0,0,0,.35)_100%)]
                        "
                          />
                        </div>

                        {/* =================================================
                      CREATOR HEADER
                  ================================================== */}

                        <div
                          className="
                        absolute
                        left-4
                        right-4
                        top-4
                        z-30
                        flex
                        items-center
                        justify-between
                      "
                        >
                          {/* creator */}

                          <div
                            className="
                          flex
                          min-w-0
                          items-center
                          gap-2.5
                          rounded-full
                          border
                          border-white/15
                          bg-black/20
                          py-1.5
                          pl-1.5
                          pr-3
                          backdrop-blur-xl
                        "
                          >
                            <div
                              className="
                            flex
                            h-9
                            w-9
                            flex-shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border-2
                            border-[#e3b64f]
                            bg-[#142747]
                            shadow-lg
                          "
                            >
                              <img
                                src={getCreatorAvatar(
                                  creatorName
                                )}
                                alt={creatorName}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="max-w-[130px] truncate text-[10px] font-bold text-white">
                                @{creatorName}
                              </div>

                              <div className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-white/55">
                                Creator
                              </div>
                            </div>
                          </div>

                          {/* views */}

                          <div
                            className="
                          flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-white/10
                          bg-black/25
                          px-3
                          py-2
                          text-[9px]
                          font-semibold
                          text-white/80
                          backdrop-blur-xl
                        "
                          >
                            <span className="text-[#e2b74e]">
                              ▶
                            </span>

                            {formatViews(views)}
                          </div>
                        </div>

                        {/* =================================================
                      REEL CAPTION
                  ================================================== */}

                        <div
                          className="
                        absolute
                        bottom-[132px]
                        left-5
                        right-5
                        z-20
                      "
                        >
                          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#e0b34c]">
                            Featured look
                          </div>

                          <div
                            className="
                          line-clamp-2
                          font-serif
                          text-[18px]
                          font-medium
                          leading-[1.2]
                          text-white
                          drop-shadow-[0_3px_10px_rgba(0,0,0,.5)]
                        "
                          >
                            {r.title ||
                              r.caption ||
                              `${creatorName}'s reel`}
                          </div>
                        </div>

                        {/* =================================================
                      PRODUCT SHOP BAR
                  ================================================== */}

                        <div
                          className="
                        absolute
                        bottom-4
                        left-4
                        right-4
                        z-40
                      "
                        >
                          <div
                            className="
                          flex
                          items-center
                          gap-3
                          rounded-[20px]
                          border
                          border-white/15
                          bg-[#121923]/90
                          p-2.5
                          shadow-[0_15px_40px_rgba(0,0,0,.38)]
                          backdrop-blur-2xl
                        "
                          >
                            {/* product image */}

                            <div
                              className="
                            h-12
                            w-12
                            flex-shrink-0
                            overflow-hidden
                            rounded-[13px]
                            border
                            border-white/10
                            bg-white/10
                          "
                            >
                              <img
                                src={thumbnailUrl}
                                alt={productName}
                                className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-110
                            "
                              />
                            </div>

                            {/* info */}

                            <div className="min-w-0 flex-1">
                              <div
                                className="
                              truncate
                              text-[11px]
                              font-semibold
                              text-white
                            "
                              >
                                {productName}
                              </div>

                              <div className="mt-1 text-[11px] font-bold text-[#e3b74e]">
                                {productPrice}
                              </div>
                            </div>

                            {/* button */}

                            <motion.button
                              type="button"
                              onClick={handleShopClick}
                              whileHover={{
                                scale: 1.05,
                              }}
                              whileTap={{
                                scale: 0.94,
                              }}
                              className="
                            flex
                            h-11
                            min-w-[72px]
                            items-center
                            justify-center
                            rounded-[13px]
                            bg-[#d6a541]
                            px-4
                            text-[9px]
                            font-extrabold
                            uppercase
                            tracking-[0.18em]
                            text-[#101a32]
                            shadow-[0_8px_22px_rgba(214,165,65,.28)]
                            transition-colors
                            duration-300
                            hover:bg-[#e8bd5c]
                          "
                            >
                              Shop
                            </motion.button>
                          </div>
                        </div>

                        {/* =================================================
                      HOVER SHINE
                  ================================================== */}

                        <div
                          className="
                        pointer-events-none
                        absolute
                        -left-[100%]
                        top-0
                        z-50
                        h-full
                        w-[55%]
                        rotate-[18deg]
                        bg-gradient-to-r
                        from-transparent
                        via-white/[0.10]
                        to-transparent
                        transition-all
                        duration-[1000ms]
                        group-hover:left-[130%]
                      "
                        />
                      </motion.div>
                    );
                  }
                )}
              </div>

              {/* =========================================================
            PAGINATION
        ========================================================== */}

              {(reelsData?.data || []).length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="mt-5 flex items-center justify-center gap-2"
                >
                  {(reelsData?.data || [])
                    .slice(0, 6)
                    .map((_: any, index: number) => (
                      <motion.span
                        key={index}
                        animate={
                          index === 0
                            ? {
                              width: 30,
                              opacity: 1,
                            }
                            : {
                              width: 7,
                              opacity: 0.65,
                            }
                        }
                        className="h-[7px] rounded-full bg-[#c89a3e]"
                        transition={{
                          duration: 0.35,
                        }}
                      />
                    ))}
                </motion.div>
              )}

              {/* =========================================================
            BOTTOM MICRO COPY
        ========================================================== */}

              {(reelsData?.data || []).length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="
                mt-8
                flex
                items-center
                justify-center
                gap-3
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#9a9ba1]
              "
                >
                  <span className="h-px w-8 bg-[#ddd4c3]" />

                  <span>
                    Scroll to discover
                  </span>

                  <span className="text-[#c3922e]">
                    ✦
                  </span>

                  <span className="h-px w-8 bg-[#ddd4c3]" />
                </motion.div>
              )}
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
        {/* =========================================================
      PREMIUM AMBIENT BACKGROUND
    ========================================================= */}
        <motion.div
          className={s.offersGlow}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Additional soft glow */}
        <motion.div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            right: "-180px",
            top: "15%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,169,110,.12) 0%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className={s.container}>
          {/* =========================================================
        HEADER
    ========================================================= */}
          <motion.div
            variants={fadeInUp}
            style={{
              textAlign: "center",
              maxWidth: 760,
              margin: "0 auto 48px",
            }}
          >
            {/* Kicker */}
            <div
              className={s.kicker}
              style={{
                justifyContent: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <span className={s.kickerLine} />

              <span>Limited time</span>

              <span
                style={{
                  fontSize: 10,
                  color: "#c9a96e",
                }}
              >
                ✦
              </span>

              <span className={s.kickerLine} />
            </div>

            {/* Heading */}
            <h2
              className={s.sectionTitle}
              style={{
                textAlign: "center",
                margin: 0,
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: 1.02,
                letterSpacing: "-0.035em",
                fontWeight: 500,
              }}
            >
              Flash offers{" "}
              <span
                style={{
                  color: "#b58a45",
                  fontStyle: "italic",
                  fontFamily: "Georgia, serif",
                }}
              >
                you don't
              </span>{" "}
              want to miss
            </h2>

            {/* Decorative divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginTop: 18,
              }}
            >
              <span
                style={{
                  width: 35,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, #c9a96e)",
                }}
              />
              <span
                style={{
                  color: "#c9a96e",
                  fontSize: 9,
                }}
              >
                ✦
              </span>
              <span
                style={{
                  width: 35,
                  height: 1,
                  background:
                    "linear-gradient(90deg, #c9a96e, transparent)",
                }}
              />
            </div>

            <p
              style={{
                margin: "16px auto 0",
                maxWidth: 520,
                color: "#777b83",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Curated deals on pieces worth adding to your collection.
              Shop before the clock runs out.
            </p>
          </motion.div>

          {/* =========================================================
        OFFERS GRID
    ========================================================= */}
          <div className={s.offersGrid}>
            {/* =======================================================
          HERO PRODUCT
      ======================================================= */}
            {isTopDiscountedLoading ? (
              <motion.div
                className={s.offerHero}
                variants={scaleIn}
                style={{
                  minHeight: 500,
                  borderRadius: 28,
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #eeeae2, #e4dfd5)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b8b8b",
                    fontSize: 13,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  Loading offer...
                </div>
              </motion.div>
            ) : topDiscountedProduct ? (
              <motion.div
                className={s.offerHero}
                variants={scaleIn}
                whileHover={{
                  y: -7,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  position: "relative",
                  minHeight: 500,
                  overflow: "hidden",
                  borderRadius: 28,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,.3)",
                  boxShadow:
                    "0 25px 70px rgba(25,31,45,.13)",
                }}
                onClick={() => {
                  if (topDiscountedProduct?.slug) {
                    router.push(
                      `/product/${topDiscountedProduct.slug}/`,
                    );
                  }
                }}
              >
                {/* Product Image */}
                <motion.img
                  src={
                    topDiscountedProduct.primary_image_url ||
                    topDiscountedProduct.images?.[0]?.image_url ||
                    "/images/placeholder.png"
                  }
                  alt={topDiscountedProduct.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 500,
                    objectFit: "cover",
                    display: "block",
                  }}
                  whileHover={{
                    scale: 1.06,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                {/* Cinematic Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(8,14,25,.08) 15%, rgba(8,14,25,.18) 42%, rgba(8,14,25,.88) 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Gold border glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 28,
                    border: "1px solid rgba(218,185,116,.35)",
                    pointerEvents: "none",
                  }}
                />

                {/* TOP BADGE */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 13px",
                    borderRadius: 999,
                    background: "rgba(10,17,29,.58)",
                    border: "1px solid rgba(255,255,255,.15)",
                    backdropFilter: "blur(14px)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".18em",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#e3bd67",
                      boxShadow: "0 0 10px #e3bd67",
                    }}
                  />
                  Flash sale
                </div>

                {/* DISCOUNT */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    zIndex: 5,
                    width: 66,
                    height: 66,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(145deg, #d9b568, #a77a32)",
                    color: "#fff",
                    boxShadow:
                      "0 10px 30px rgba(166,120,46,.3)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      textTransform: "uppercase",
                      letterSpacing: ".12em",
                      opacity: .8,
                    }}
                  >
                    Up to
                  </span>
                  <strong
                    style={{
                      fontSize: 19,
                      lineHeight: 1,
                      marginTop: 3,
                    }}
                  >
                    {topDiscountedData?.data?.[0]?.discounts
                      ?.max_discount ?? 0}
                    %
                  </strong>
                  <span
                    style={{
                      fontSize: 7,
                      textTransform: "uppercase",
                      letterSpacing: ".12em",
                      marginTop: 2,
                    }}
                  >
                    OFF
                  </span>
                </div>

                {/* HERO CONTENT */}
                <div
                  style={{
                    position: "absolute",
                    left: 28,
                    right: 28,
                    bottom: 28,
                    zIndex: 5,
                  }}
                >
                  {/* Timer */}
                  <motion.div
                    animate={{
                      opacity: [0.75, 1, 0.75],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      marginBottom: 14,
                      borderRadius: 999,
                      background: "rgba(255,255,255,.1)",
                      border: "1px solid rgba(255,255,255,.16)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: ".1em",
                    }}
                  >
                    <span>◷</span>
                    ENDS IN {time.h}:{time.m}:{time.s}
                  </motion.div>

                  {/* Product name */}
                  <div
                    style={{
                      color: "#d8b86d",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".22em",
                      marginBottom: 7,
                    }}
                  >
                    Featured offer
                  </div>

                  <div
                    style={{
                      maxWidth: 600,
                      color: "#fff",
                      fontFamily: "Georgia, serif",
                      fontSize: "clamp(25px, 3vw, 38px)",
                      lineHeight: 1.08,
                      letterSpacing: "-.025em",
                    }}
                  >
                    Up to{" "}
                    {topDiscountedData?.data?.[0]?.discounts
                      ?.max_discount ?? 0}
                    % off{" "}
                    {topDiscountedProduct.name}
                  </div>

                  {/* CTA */}
                  <motion.button
                    type="button"
                    whileHover={{
                      x: 5,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (topDiscountedProduct?.slug) {
                        router.push(
                          `/product/${topDiscountedProduct.slug}/`,
                        );
                      }
                    }}
                    style={{
                      marginTop: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".18em",
                    }}
                  >
                    Shop flash sale
                    <span
                      style={{
                        display: "inline-flex",
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "#d3aa5d",
                        color: "#142747",
                        fontSize: 15,
                      }}
                    >
                      →
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            ) : null}

            {/* =======================================================
          CATEGORY CARDS
      ======================================================= */}
            {!isCategoriesLoading &&
              categories.slice(0, 2).map((category: any, index: number) => {
                const categoryName =
                  category.title ||
                  category.name ||
                  "Category";

                const productCount =
                  category.products_count || 0;

                const categoryImage =
                  category.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    categoryName,
                  )}&background=C9A96E&color=fff&size=600&bold=true`;

                return (
                  <motion.div
                    key={category.id}
                    className={s.offerCard}
                    variants={scaleIn}
                    whileHover={{
                      y: -7,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() => {
                      router.push(
                        `/products/?category=${encodeURIComponent(
                          categoryName,
                        )}`,
                      );
                    }}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      borderRadius: 25,
                    }}
                  >
                    {/* Image */}
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                      }}
                    >
                      <motion.img
                        src={categoryImage}
                        alt={categoryName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        whileHover={{
                          scale: 1.08,
                        }}
                        transition={{
                          duration: 1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </motion.div>

                    {/* Dark overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(15,22,35,.04) 20%, rgba(15,22,35,.2) 45%, rgba(10,16,26,.9) 100%)",
                      }}
                    />

                    {/* Gold accent */}
                    <div
                      style={{
                        position: "absolute",
                        top: 18,
                        left: 18,
                        width: 34,
                        height: 2,
                        background: "#d5ae65",
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        padding: 22,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}
                    >
                      {/* Count */}
                      <div
                        style={{
                          color: "#d7b46d",
                          fontSize: 8,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: ".2em",
                          marginBottom: 7,
                        }}
                      >
                        {productCount}{" "}
                        {productCount === 1
                          ? "Product"
                          : "Products"}
                      </div>

                      {/* Title */}
                      <div
                        style={{
                          color: "#fff",
                          fontFamily: "Georgia, serif",
                          fontSize: "clamp(23px, 2.5vw, 30px)",
                          lineHeight: 1.05,
                          letterSpacing: "-.025em",
                        }}
                      >
                        {categoryName}
                      </div>

                      {/* CTA */}
                      <motion.div
                        whileHover={{
                          x: 5,
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          marginTop: 13,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: ".16em",
                        }}
                      >
                        Shop collection
                        <span
                          style={{
                            color: "#d8b568",
                            fontSize: 15,
                          }}
                        >
                          →
                        </span>
                      </motion.div>
                    </div>

                    {/* Hover shine */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "50%",
                        height: "100%",
                        transform: "skewX(-18deg)",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)",
                        transition: "left .9s ease",
                        pointerEvents: "none",
                      }}
                      className="group-hover:left-[130%]"
                    />
                  </motion.div>
                );
              })}
          </div>

          {/* =========================================================
        BOTTOM MICRO TEXT
    ========================================================= */}
          <motion.div
            variants={fadeInUp}
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#999b9f",
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".24em",
            }}
          >
            <span
              style={{
                width: 25,
                height: 1,
                background: "#ddd5c7",
              }}
            />
            Limited quantities available
            <span
              style={{
                color: "#c49a51",
              }}
            >
              ✦
            </span>
            <span
              style={{
                width: 25,
                height: 1,
                background: "#ddd5c7",
              }}
            />
          </motion.div>
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
            <motion.div variants={fadeInUp} className={s.testimonialLoading}>
              Loading testimonials...
            </motion.div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Rating Stars */}
              <motion.div className={s.testimonialStars} variants={fadeInUp}>
                {"★".repeat(
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Math.round(testimonials[testimonialIndex]?.rating || 0),
                    ),
                  ),
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
                          const name =
                            testimonials[testimonialIndex].name || "U";
                          const initials = name
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase())
                            .slice(0, 2)
                            .join("");

                          // Create a canvas to generate fallback image
                          const canvas = document.createElement("canvas");
                          canvas.width = 80;
                          canvas.height = 80;
                          const ctx = canvas.getContext("2d");

                          if (ctx) {
                            // Black background
                            ctx.fillStyle = "#1a1a1a";
                            ctx.beginPath();
                            ctx.arc(40, 40, 40, 0, Math.PI * 2);
                            ctx.fill();

                            // White border
                            ctx.strokeStyle = "rgba(255,255,255,0.2)";
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(40, 40, 38, 0, Math.PI * 2);
                            ctx.stroke();

                            // Text - Bold White
                            ctx.fillStyle = "#FFFFFF";
                            ctx.font = "bold 34px Arial, Helvetica, sans-serif";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(initials, 40, 42);

                            // Convert canvas to data URL
                            target.src = canvas.toDataURL("image/png");
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
                          ?.split(" ")
                          .map((word) => word.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join("") || "U"}
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
            <motion.div variants={fadeInUp} className={s.testimonialLoading}>
              No reviews available.
            </motion.div>
          )}

          {/* Statistics */}
          {!isStatsLoading && statistics && (
            <motion.div className={s.testimonialStats} variants={fadeInUp}>
              {/* Total Reviews */}
              <motion.div
                className={s.testimonialStat}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                }}
              >
                <div className={s.statNumber}>{statistics.total_reviews}</div>
                <div className={s.testimonialStatLabel}>Total Reviews</div>
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
                <div className={s.statNumber}>{statistics.average_rating}</div>
                <div className={s.testimonialStatLabel}>Average Rating</div>
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
                <div className={s.testimonialStatLabel}>Repeat Buyers</div>
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
                <div className={s.statNumber}>{statistics.total_cities}</div>
                <div className={s.testimonialStatLabel}>Cities Reached</div>
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
          <motion.div className={s.sectionHeader} variants={fadeInUp}>
            <div className={s.sectionHeaderLeft}>
              <div className={s.kicker}>
                <span className={s.kickerLine} />
                Opportunity
              </div>
              <h2 className={s.sectionTitle}>{growthTitle}</h2>
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
              <motion.div className={s.levelCard} variants={scaleIn}>
                <p className={s.levelBody}>Loading growth levels...</p>
              </motion.div>
            </motion.div>
          ) : growthSteps.length === 0 ? (
            /* Empty State */
            <motion.div
              className={s.levelsContainer}
              variants={staggerContainer}
            >
              <motion.div className={s.levelCard} variants={scaleIn}>
                <p className={s.levelBody}>No growth levels available.</p>
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
                    <p className={s.levelBody}>{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile / Large Steps Indicator */}
              {growthSteps.length > 4 && (
                <motion.div className={s.levelIndicator} variants={fadeInUp}>
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
        className="relative w-full overflow-hidden mb-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Subtle background glow */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[#f5c35b]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* ================= HEADER ================= */}
          <motion.div
            className="mb-10 flex flex-col items-center text-center"
            variants={fadeInUp}
          >
            {/* Kicker */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#dcae45]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#dcae45] sm:text-xs">
                #IndieKonnectGlow
              </span>
              <span className="h-px w-8 bg-[#dcae45]" />
            </div>

            {/* Title */}
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#071a41] sm:text-5xl lg:text-6xl">
              Feel the <span className="text-[#dcae45]">glow</span> with us
            </h2>

            {/* Decorative line */}
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-[#dcae45] to-[#dcae45]" />
              <span className="text-sm text-[#dcae45]">✦</span>
              <span className="h-px w-20 bg-gradient-to-l from-transparent via-[#dcae45] to-[#dcae45]" />
            </div>

            <p className="mt-4 max-w-xl text-sm text-[#64708a] sm:text-base">
              Handpicked favorites to brighten your everyday.
            </p>
          </motion.div>

          {/* ================= LOADING ================= */}
          {isMakeupLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[24px] border border-[#e8ebf1] bg-white shadow-[0_10px_40px_rgba(7,26,65,0.06)]"
                >
                  {/* Image skeleton */}
                  <div className="aspect-[0.92] animate-pulse bg-[#eef1f6]" />
                  <div className="space-y-4 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#eef1f6]" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-[#eef1f6]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef1f6]" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-[#eef1f6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isMakeupError ? (
            /* ================= ERROR ================= */
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-red-100 bg-[#fffafa]">
              <p className="mb-4 text-sm text-[#7b3f46]">
                Unable to load makeup products.
              </p>
              <button
                onClick={() => refetchMakeupProducts()}
                className="rounded-full bg-[#071a41] px-7 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#102b5e] hover:shadow-lg"
              >
                Retry
              </button>
            </div>
          ) : makeupProducts.length === 0 ? (
            /* ================= EMPTY ================= */
            <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[#e8ebf1] bg-[#fafbfc]">
              <p className="text-sm text-[#64708a]">
                No makeup products available right now. ✨
              </p>
            </div>
          ) : (
            /* ================= PRODUCTS ================= */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {makeupProducts.slice(0, 4).map((p: any) => {
                const price = Number(p.retail_price ?? 0);
                const mrp = Number(p.retail_mrp ?? 0);

                const discount =
                  mrp > 0 && price < mrp
                    ? Math.round(((mrp - price) / mrp) * 100)
                    : 0;

                const image =
                  p.images?.find((img: any) => img.is_primary)?.image_url ||
                  p.images?.[0]?.image_url ||
                  "/images/product-placeholder.png";

                const isWishlisted = wish[p.id] || false;
                const isAddingToCart = isAddToCartLoading;

                return (
                  <motion.div
                    key={p.id}
                    variants={scaleIn}
                    whileHover={{
                      y: -6,
                      transition: {
                        duration: 0.3,
                      },
                    }}
                    className="group relative overflow-hidden rounded-[24px] border border-[#e5e8ee] bg-white shadow-[0_8px_30px_rgba(7,26,65,0.06)] transition-all duration-500 hover:border-[#d8b15a]/70 hover:shadow-[0_20px_55px_rgba(7,26,65,0.13)]"
                  >
                    {/* ================= IMAGE ================= */}
                    <div className="relative aspect-[0.92] overflow-hidden bg-[#f6f7f9]">
                      <motion.img
                        src={image}
                        alt={p.name}
                        onClick={() => router.push(`/product/${p.slug}/`)}
                        whileHover={{
                          scale: 1.07,
                        }}
                        transition={{
                          duration: 0.7,
                          ease: "easeOut",
                        }}
                        className="h-full w-full cursor-pointer object-cover"
                      />

                      {/* Image overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071a41]/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* ================= CATEGORY BADGE ================= */}
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcae45]/40 bg-[#071a41] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4c45f] shadow-lg">
                          <span className="text-xs">💄</span>
                          Makeup
                        </span>
                      </div>

                      {/* ================= WISHLIST ================= */}
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(p.id, p.name);
                        }}
                        whileHover={{
                          scale: 1.08,
                        }}
                        whileTap={{
                          scale: 0.88,
                        }}
                        className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${isWishlisted
                          ? "border-[#c44a6a]/20 bg-[#fff1f4] text-[#c44a6a]"
                          : "border-white/80 bg-white/95 text-[#071a41] shadow-md hover:border-[#dcae45] hover:text-[#dcae45]"
                          }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill={isWishlisted ? "#C44A6A" : "none"}
                          stroke={isWishlisted ? "#C44A6A" : "currentColor"}
                          strokeWidth="1.8"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* ================= PRODUCT INFO ================= */}
                    <div className="p-5 sm:p-6">
                      {/* Category */}
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dcae45]">
                        Makeup
                      </div>

                      {/* Product Name */}
                      <div
                        onClick={() => router.push(`/product/${p.slug}/`)}
                        className="cursor-pointer font-serif text-xl font-semibold leading-tight text-[#071a41] transition-colors duration-300 hover:text-[#c08c25]"
                      >
                        {p.name}
                      </div>

                      {/* Description */}
                      {p.description && (
                        <div className="mt-2 line-clamp-1 text-sm text-[#788197]">
                          {p.description}
                        </div>
                      )}

                      {/* ================= PRICE ================= */}
                      <div className="mt-5 flex items-center gap-3">
                        <span className="text-lg font-bold text-[#071a41]">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {mrp > 0 && mrp > price && (
                          <span className="text-sm text-[#8b93a4] line-through">
                            ₹{mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-[11px] font-semibold text-[#b77c12]">
                            {discount}% off
                          </span>
                        )}
                      </div>

                      {/* ================= META ================= */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[15px] tracking-[2px] text-[#f1b83b]">
                          ★★★★★
                        </span>
                        <span className="h-4 w-px bg-[#dfe3ea]" />
                        <span className="text-xs text-[#7c8496]">New</span>
                      </div>

                      {/* ================= ADD TO CART ================= */}
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p.id, p.name, image, price);
                        }}
                        whileHover={{
                          scale: 1.015,
                        }}
                        whileTap={{
                          scale: 0.97,
                        }}
                        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#071a41] bg-[#071a41] text-sm font-medium text-white shadow-[0_8px_20px_rgba(7,26,65,0.15)] transition-all duration-300 hover:bg-[#102d60] hover:shadow-[0_12px_28px_rgba(7,26,65,0.22)]"
                      >
                        {isAddingToCart ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M6 8h12l1 12H5L6 8z" />
                              <path d="M9 8a3 3 0 016 0" />
                            </svg>
                            Add to cart
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ================= BENEFITS ================= */}
          {!isMakeupLoading && !isMakeupError && makeupProducts.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="mt-8 overflow-hidden rounded-[22px] border border-[#e7eaf0] bg-white shadow-[0_8px_35px_rgba(7,26,65,0.05)]"
            >
              <div className="grid grid-cols-1 divide-y divide-[#e8ebf0] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                {/* Premium Quality */}
                <div className="flex items-center gap-4 px-6 py-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff9eb] text-[#dcae45]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 3l2.5 5 5.5.8-4 3.9.95 5.5L12 15.6 7.05 18.2 8 12.7 4 8.8 9.5 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-serif text-base font-semibold text-[#071a41]">
                      Premium Quality
                    </div>
                    <div className="mt-1 text-xs text-[#7a8294]">
                      Finest selection for you
                    </div>
                  </div>
                </div>

                {/* Secure Shopping */}
                <div className="flex items-center gap-4 px-6 py-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff9eb] text-[#dcae45]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-serif text-base font-semibold text-[#071a41]">
                      Secure Shopping
                    </div>
                    <div className="mt-1 text-xs text-[#7a8294]">
                      100% secure & safe
                    </div>
                  </div>
                </div>

                {/* Fast Delivery */}
                <div className="flex items-center gap-4 px-6 py-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff9eb] text-[#dcae45]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 6h11v11H3z" />
                      <path d="M14 9h4l3 3v5h-7z" />
                      <circle cx="7" cy="19" r="2" />
                      <circle cx="18" cy="19" r="2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-serif text-base font-semibold text-[#071a41]">
                      Fast Delivery
                    </div>
                    <div className="mt-1 text-xs text-[#7a8294]">
                      At your doorstep
                    </div>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="flex items-center gap-4 px-6 py-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff9eb] text-[#dcae45]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M4 13a8 8 0 0116 0v4a2 2 0 01-2 2h-2v-5h4" />
                      <path d="M4 14H2v3a2 2 0 002 2h2v-5z" />
                      <path d="M9 19h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-serif text-base font-semibold text-[#071a41]">
                      Customer Support
                    </div>
                    <div className="mt-1 text-xs text-[#7a8294]">
                      We're here for you
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                        <div className={s.cartItemQuantity}>
                          <button
                            onClick={() =>
                              handleUpdateCart(
                                item.id,
                                item.product_id,
                                "decrement",
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
                                "increment",
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
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={() => router.push("/checkout")}
                    className={s.btnPrimary}
                  >
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