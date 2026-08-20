"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, Heart, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import s from "./IndieKonnectHome.module.css";
import { ticker, heroStats, promises } from "./catalog";
import { FaTruck, FaLock, FaUndo, FaHeadset } from "react-icons/fa";
import { promoCards } from "./data";
import Header from "./Header";
import { products } from "./data";
import Prod from '../../../public/indiekonnect-web/images/prod.png'
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
import WatchTestimonialSection from "./WatchTestimonialSection";

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
  const [activeTab, setActiveTab] = useState("Best Seller");
  const [timeLeft, setTimeLeft] = useState(20 * 60 * 60 + 45 * 60 + 9);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (value: number) => String(value).padStart(2, "0");
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
    return "New Season · 2026";
  }, [bannerBlock]);

  // Hero Trust Features (API se ya default)
  const heroTrustFeatures = useMemo(() => {
    if (
      bannerBlock?.trust_features &&
      Array.isArray(bannerBlock.trust_features)
    ) {
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
       w-full
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
            via-[#f8f2e9]/[0.45]
            via-[10%]
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

                  <span className="text-[8px] text-[#c9a15e]">◆</span>

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
                bg-[#26221F]
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
                    transition={{
                      duration: 0.65,
                      delay: 1.0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 2.8,
                        delay: 0.0,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaTruck className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">
                        Free Shipping
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">
                        On orders over $50
                      </p>
                    </div>
                  </motion.div>

                  {/* Secure Payment - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: 1.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 2.8,
                        delay: 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaLock className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">
                        Secure Payment
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">
                        100% Protected
                      </p>
                    </div>
                  </motion.div>

                  {/* Easy Returns - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: 1.24,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 2.8,
                        delay: 0.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaUndo className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">
                        Easy Returns
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">
                        30 Days Return
                      </p>
                    </div>
                  </motion.div>

                  {/* 24/7 Support - REMOVED backdrop-blur-xl */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.65,
                      delay: 1.36,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 2.8,
                        delay: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/40 shadow-[0_8px_32px_rgba(80,55,25,0.08)] border border-white/50 text-[#353535] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                    >
                      <FaHeadset className="h-3.5 w-3.5" />
                    </motion.div>
                    <div className="min-w-0 flex-1 whitespace-nowrap">
                      <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">
                        24/7 Support
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">
                        Always Here to Help
                      </p>
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

      <motion.section
        className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* ============================================================
        HEADER
    ============================================================ */}

          <motion.div
            variants={fadeInUp}
            className="mb-10 flex flex-col items-center text-center sm:mb-12"
          >
            <h2
              className="
          font-sans
          text-[30px]
          font-bold
          leading-tight
          tracking-[-0.025em]
          text-[#101827]
          sm:text-[36px]
          lg:text-[40px]
        "
            >
              Shop Deals by Category
            </h2>

            <p
              className="
          mt-4
          max-w-[560px]
          text-[14px]
          leading-6
          text-[#555b63]
          sm:text-[15px]
        "
            >
              Dining, living, and desk areas serve their purposes
              <br className="hidden sm:block" />
              in total harmony of style.
            </p>
          </motion.div>

          {/* ============================================================
        CATEGORY CARDS
    ============================================================ */}

          <div
            className="
        flex
        gap-5
        overflow-x-auto
        pb-4
        scrollbar-hide
        lg:grid
        lg:grid-cols-6
        lg:overflow-visible
      "
          >
            {[
              {
                name: "Jewelry",
                image:
                  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=85",
              },
              {
                name: "Beauty & Health",
                image:
                  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=85",
              },
              {
                name: "Music & Sounds",
                image:
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=85",
              },
              {
                name: "Beauty & Health",
                image:
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=85",
              },
              {
                name: "Home Appliance",
                image:
                  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=85",
              },
              {
                name: "Sports",
                image:
                  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=85",
              },
            ].map((category, index) => (
              <motion.div
                key={`${category.name}-${index}`}
                variants={scaleIn}
                whileHover={{
                  y: -4,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => {
                  router.push(
                    `/products/?category=${encodeURIComponent(category.name)}`,
                  );
                }}
                className="
            group
            relative
            min-w-[245px]
            cursor-pointer
            rounded-[6px]
            border
            border-[#e8e8e8]
            bg-white
            px-5
            pb-5
            pt-6
            shadow-[0_2px_12px_rgba(0,0,0,0.025)]
            transition-all
            duration-300
            hover:border-[#dedede]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)]
            lg:min-w-0
          "
              >
                {/* ======================================================
              IMAGE
          ====================================================== */}

                <div className="flex justify-center">
                  <div
                    className="
                relative
                h-[150px]
                w-[150px]
                overflow-hidden
                rounded-full
                bg-[#f5f5f5]
                sm:h-[160px]
                sm:w-[160px]
              "
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      loading={index < 4 ? "eager" : "lazy"}
                      className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-105
                "
                    />
                  </div>
                </div>

                {/* ======================================================
              CATEGORY NAME
          ====================================================== */}

                <h3
                  className="
              mt-5
              text-center
              text-[18px]
              font-semibold
              tracking-[-0.02em]
              text-[#20252d]
              transition-colors
              duration-300
              group-hover:text-['#071A41]
            "
                >
                  {category.name}
                </h3>

                {/* ======================================================
              SEE MORE
          ====================================================== */}

                <div className="mt-3 flex justify-center">
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`
                inline-flex
                items-center
                gap-1.5
                text-[14px]
                font-medium
                transition-all
                duration-300
                ${index === 2
                        ? "rounded-full bg-[#071A41] px-5 py-2 text-white shadow-[0_6px_18px_rgba(20,123,117,0.18)]"
                        : "text-[#626870] group-hover:text-[#071A41]"
                      }
              `}
                  >
                    <span>{index === 5 ? "Products" : "See More"}</span>

                    <span
                      className={`
                  text-[16px]
                  leading-none
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                `}
                    >
                      ↗
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trending */}
      <motion.div
        variants={fadeInUp}
        className="mb-10 flex flex-col items-center text-center sm:mb-12"
      >
        <h2
          className="
          font-sans
          text-[30px]
          font-bold
          leading-tight
          tracking-[-0.025em]
          text-[#101827]
          sm:text-[36px]
          lg:text-[40px]
        "
        >
          Feature Products
        </h2>

        <p
          className="
          mt-4
          max-w-[560px]
          text-[14px]
          leading-6
          text-[#555b63]
          sm:text-[15px]
        "
        >
          Dining, living, and desk areas serve their purposes
          <br className="hidden sm:block" />
          in total harmony of style.
        </p>

        <motion.section
          className="
    relative
    w-full
    overflow-hidden
    bg-white
    py-4
    sm:py-10
    lg:py-12
  "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div
            className="
      mx-auto
      w-full
      max-w-[1900px]
      px-5
      sm:px-8
      lg:px-12
      xl:px-16
    "
          >
            {/* ==========================================================
        HEADER
    =========================================================== */}

            <motion.div
              variants={fadeInUp}
              className="
        mb-4
        flex
        flex-col
        items-center
        text-center
        sm:mb-6
      "
            />

            {/* ==========================================================
        LOADING
    =========================================================== */}

            {isTrendingLoading ? (
              <div
                className="
          -mt-1
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
              >
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="
              flex
              h-full
              flex-col
              overflow-hidden
              rounded-[8px]
              border
              border-[#e7e5df]
              bg-[#faf9f5]
            "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                aspect-[1.15]
                shrink-0
                animate-pulse
                bg-[#e5e3dc]
              "
                    />

                    {/* CONTENT */}

                    <div
                      className="
                flex
                flex-1
                flex-col
                p-4
                pt-3
                sm:p-5
                sm:pt-3
              "
                    >
                      {/* BRAND */}

                      <div
                        className="
                  h-3
                  w-16
                  animate-pulse
                  rounded
                  bg-[#e5e3dc]
                "
                      />

                      {/* NAME */}

                      <div
                        className="
                  mt-1
                  h-10
                  w-4/5
                  animate-pulse
                  rounded
                  bg-[#e5e3dc]
                "
                      />

                      {/* RATING */}

                      <div
                        className="
                  mt-2
                  h-4
                  w-24
                  animate-pulse
                  rounded
                  bg-[#e5e3dc]
                "
                      />

                      {/* PRICE */}

                      <div
                        className="
                  mt-auto
                  pt-3
                "
                      >
                        <div
                          className="
                    h-5
                    w-20
                    animate-pulse
                    rounded
                    bg-[#e5e3dc]
                  "
                        />

                        {/* BUTTON */}

                        <div
                          className="
                    mt-3
                    h-10
                    w-full
                    animate-pulse
                    rounded-full
                    bg-[#e5e3dc]
                  "
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isTrendingError ? (
              /* ==========================================================
                  ERROR
              =========================================================== */

              <div
                className="
          flex
          min-h-[180px]
          items-center
          justify-center
        "
              >
                <button
                  type="button"
                  onClick={() => refetchTrending()}
                  className="
            rounded-full
            bg-[#071a41]
            px-6
            py-3
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#102d60]
          "
                >
                  Retry
                </button>
              </div>
            ) : (
              /* ==========================================================
                  PRODUCT GRID
              =========================================================== */

              <div
                className="
          -mt-2
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
              >
                {trendingProducts.slice(0, 4).map((p: any, index: number) => {
                  /* ====================================================
                      PRODUCT DATA
                  ==================================================== */

                  const price = Number(p.retail_price ?? 0);

                  const mrp = Number(p.retail_mrp ?? 0);

                  const image =
                    p.images?.find((img: any) => img.is_primary)?.image_url ||
                    p.images?.[0]?.image_url ||
                    "/images/product-placeholder.png";

                  /* BRAND */

                  const brand =
                    p.brand?.name || p.brand_name || p.brand || "Brand";

                  /* RATING */

                  const rating = p.rating ?? p.average_rating ?? 4.8;

                  /* REVIEWS */

                  const reviews = p.review_count ?? p.reviews_count ?? 124;

                  return (
                    <motion.div
                      key={p.id}
                      variants={scaleIn}
                      whileHover={{
                        y: -5,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="
                group
                flex
                h-full
                min-w-0
                flex-col
                overflow-hidden
                rounded-[8px]
                border
                border-[#e7e5df]
                bg-[#faf9f5]
                transition-all
                duration-300
                hover:shadow-[0_15px_35px_rgba(7,26,65,0.10)]
              "
                    >
                      {/* ==================================================
                  IMAGE
              =================================================== */}

                      <div
                        className="
                  relative
                  aspect-[1.15]
                  shrink-0
                  overflow-hidden
                  bg-[#e5e3dc]
                "
                      >
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
                    group-hover:scale-[1.04]
                  "
                        />

                        {/* BADGE */}

                        <div
                          className="
                    absolute
                    left-3
                    top-3
                    sm:left-4
                    sm:top-4
                  "
                        >
                          <span
                            className="
                      inline-flex
                      rounded-full
                      border
                      border-white/80
                      bg-black/10
                      px-3
                      py-1
                      font-serif
                      text-[11px]
                      italic
                      text-white
                      backdrop-blur-sm
                    "
                          >
                            {index === 0
                              ? "Promotion"
                              : index === 2
                                ? "Customer favorite"
                                : "New"}
                          </span>
                        </div>
                      </div>

                      {/* ==================================================
                  PRODUCT INFORMATION
              =================================================== */}

                      <div
                        className="
                  flex
                  flex-1
                  flex-col
                  px-4
                  pb-4
                  pt-3
                  sm:px-5
                  sm:pb-5
                  sm:pt-3
                "
                      >
                        {/* =================================================
                    BRAND
                ================================================== */}

                        <p
                          className="
                    mb-0
                    min-h-[16px]
                    text-[10px]
                    font-medium
                    uppercase
                    leading-[16px]
                    tracking-[0.08em]
                    text-[#7d827f]
                    sm:text-[11px]
                  "
                        >
                          {brand}
                        </p>

                        {/* =================================================
                    PRODUCT NAME
                ================================================== */}

                        <h3
                          onClick={() => router.push(`/product/${p.slug}/`)}
                          className="
                    flex
                    h-[44px]
                    cursor-pointer
                    items-start
                    overflow-hidden
                    text-[16px]
                    font-semibold
                    leading-[1.35]
                    tracking-[-0.01em]
                    text-[#171d1c]
                    transition-colors
                    duration-300
                    group-hover:text-[#071a41]
                    sm:h-[46px]
                    sm:text-[17px]
                  "
                        >
                          {p.name}
                        </h3>

                        {/* =================================================
                    RATING
                ================================================== */}

                        <div
                          className="
                    mt-1
                    flex
                    min-h-[19px]
                    items-center
                    gap-1
                  "
                        >
                          <span
                            className="
                      text-[13px]
                      leading-none
                      text-[#F5A623]
                    "
                          >
                            ★
                          </span>

                          <span
                            className="
                      text-[12px]
                      font-medium
                      leading-none
                      text-[#555b63]
                      sm:text-[13px]
                    "
                          >
                            {rating}
                          </span>

                          <span
                            className="
                      text-[12px]
                      leading-none
                      text-[#8b918f]
                      sm:text-[13px]
                    "
                          >
                            ({reviews})
                          </span>
                        </div>

                        {/* =================================================
                    PRICE + BUTTON
                ================================================== */}

                        <div
                          className="
                    mt-auto
                    pt-3
                  "
                        >
                          {/* PRICE */}

                          <div
                            className="
                      flex
                      min-h-[27px]
                      items-center
                    "
                          >
                            <span
                              className="
                        text-[18px]
                        font-bold
                        leading-none
                        text-[#17201f]
                        sm:text-[20px]
                      "
                            >
                              ₹{price.toLocaleString("en-IN")}
                            </span>

                            {mrp > price && (
                              <span
                                className="
                          ml-2
                          text-[12px]
                          leading-none
                          text-[#8b918f]
                          line-through
                        "
                              >
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* =================================================
                      ADD TO CART
                  ================================================== */}

                          <motion.button
                            type="button"
                            whileHover={{
                              scale: 1.02,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAddToCart(p.id, p.name, image, price);
                            }}
                            className="
                      mt-3
                      flex
                      h-10
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[#071a41]
                      px-4
                      text-[13px]
                      font-medium
                      text-white
                      shadow-[0_5px_15px_rgba(7,26,65,0.15)]
                      transition-all
                      duration-300
                      hover:bg-[#102d60]
                      sm:h-11
                    "
                          >
                            <span
                              className="
                        text-[17px]
                        leading-none
                      "
                            >
                              +
                            </span>

                            <span>Add to Cart</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ==========================================================
        MOBILE MORE PRODUCTS
    =========================================================== */}

            <div
              className="
        mt-5
        flex
        justify-center
        sm:hidden
      "
            >
              <button
                type="button"
                onClick={() => router.push("/products/")}
                className="
          flex
          items-center
          gap-2
          border-b
          border-[#101827]
          pb-1
          text-[13px]
          font-medium
          text-[#101827]
        "
              >
                More products
                <span className="text-[18px]">→</span>
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Banner Best Deal */}

      <section
        className="
        relative
        w-full
        overflow-hidden
        bg-white
        py-5
        sm:py-8
        lg:py-10
      "
      >
        <div
          className="
          mx-auto
          w-full
          max-w-[1900px]
          px-4
          sm:px-6
          lg:px-10
          xl:px-14
        "
        >
          {/* =========================================================
            PROMOTIONAL CARDS
        ========================================================== */}

          <div
            className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
            lg:gap-5
            xl:gap-6
          "
          >
            {promoCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{
                  opacity: 0,
                  y: 25,
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
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -4,
                }}
                className="
                group
                relative
                h-[300px]
                overflow-hidden
                rounded-[20px]
                bg-[#dfe8f0]
                shadow-[0_8px_30px_rgba(7,26,65,0.08)]
                sm:h-[360px]
                lg:h-[390px]
                xl:h-[420px]
              "
              >
                {/* =================================================
                  IMAGE
              ================================================== */}

                <img
                  src={card.image}
                  alt={card.title.replace("\n", " ")}
                  className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-1000
                  ease-out
                  group-hover:scale-[1.045]
                "
                />

                {/* =================================================
                  LEFT DARK/WHITE CONTENT OVERLAY
              ================================================== */}

                <div
                  className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-black/20
                  via-black/5
                  to-transparent
                "
                />

                {/* =================================================
                  SUBTLE BOTTOM OVERLAY
              ================================================== */}

                <div
                  className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-[45%]
                  bg-gradient-to-t
                  from-black/15
                  to-transparent
                  opacity-70
                "
                />

                {/* =================================================
                  CONTENT
              ================================================== */}

                <div
                  className="
                  relative
                  z-10
                  flex
                  h-full
                  w-full
                  flex-col
                  items-start
                  px-7
                  py-8
                  sm:px-9
                  sm:py-10
                  lg:px-10
                  lg:py-11
                  xl:px-12
                  xl:py-12
                "
                >
                  {/* EYEBROW */}

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
                      delay: 0.2 + index * 0.12,
                      duration: 0.5,
                    }}
                    className="
                    text-[13px]
                    font-medium
                    tracking-[-0.01em]
                    text-white/90
                    drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]
                    sm:text-[15px]
                  "
                  >
                    {card.eyebrow}
                  </motion.p>

                  {/* TITLE */}

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
                      delay: 0.28 + index * 0.12,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="
                    mt-3
                    max-w-[300px]
                    whitespace-pre-line
                    text-[32px]
                    font-semibold
                    leading-[1.03]
                    tracking-[-0.045em]
                    text-white
                    drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)]
                    sm:text-[40px]
                    lg:text-[43px]
                    xl:text-[48px]
                  "
                  >
                    {card.title}
                  </motion.h2>

                  {/* OFFER */}

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
                      delay: 0.36 + index * 0.12,
                      duration: 0.5,
                    }}
                    className="
                    mt-2
                    text-[18px]
                    font-medium
                    tracking-[-0.02em]
                    text-white
                    drop-shadow-[0_1px_5px_rgba(0,0,0,0.2)]
                    sm:text-[22px]
                    lg:text-[24px]
                  "
                  >
                    {card.offer}
                  </motion.p>

                  {/* =================================================
                    SHOP BUTTON
                ================================================== */}

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
                      delay: 0.45 + index * 0.12,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{
                      scale: 1.035,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() => router.push(card.href)}
                    className="
                    mt-auto
                    flex
                    h-[52px]
                    items-center
                    justify-center
                    gap-3
                    rounded-[13px]
                    bg-white
                    px-7
                    text-[14px]
                    font-semibold
                    tracking-[-0.01em]
                    text-[#111827]
                    shadow-[0_8px_25px_rgba(0,0,0,0.14)]
                    transition-all
                    duration-300
                    hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)]
                    sm:h-[56px]
                    sm:px-8
                    sm:text-[15px]
                  "
                  >
                    <span>Shop now</span>

                    <ArrowRight
                      size={19}
                      strokeWidth={2}
                      className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ============================================================
    SHOP BY CATEGORY — PREMIUM
    ============================================================ */}
      <section className="relative bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">

          {/* =========================
        HEADER
    ========================= */}
          <div className="mb-10 text-center sm:mb-12">
            <h2
              className="
          text-[30px]
          font-bold
          leading-tight
          tracking-[-0.02em]
          text-[#172033]
          sm:text-[36px]
          md:text-[40px]
        "
            >
              Popular Products
            </h2>

            <p
              className="
          mx-auto
          mt-3
          max-w-[430px]
          text-[14px]
          leading-6
          text-[#5f636b]
          sm:text-[15px]
        "
            >
              Dining, living, and desk areas serve their purposes
              <br className="hidden sm:block" />
              in total harmony of style.
            </p>
          </div>

          {/* =========================
        PRODUCTS GRID
    ========================= */}
          <div
            className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        md:gap-4
        lg:grid-cols-4
        xl:grid-cols-5
      "
          >
            {products.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="
            group
            relative
            overflow-hidden
            rounded-[8px]
            border
            border-[#e8e8e8]
            bg-white
            transition-shadow
            duration-300
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
          "
              >
                {/* =========================
              IMAGE
          ========================= */}
                <div
                  className="
              relative
              flex
              h-[220px]
              items-center
              justify-center
              overflow-hidden
              bg-white
              sm:h-[235px]
              lg:h-[245px]
            "
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="
                h-full
                w-full
                object-contain
                p-5
                transition-transform
                duration-500
                group-hover:scale-[1.04]
              "
                  />

                  {/* =========================
                ACTION ICONS
            ========================= */}
                  <div
                    className="
                absolute
                right-3
                top-3
                flex
                items-center
                gap-2
                opacity-0
                transition-opacity
                duration-200
                group-hover:opacity-100
              "
                  >
                    {/* Wishlist */}
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#68707a]
                  shadow-[0_2px_10px_rgba(0,0,0,0.10)]
                  transition-colors
                  hover:text-[#071A41]
                "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                        />
                      </svg>
                    </button>

                    {/* Compare */}
                    <button
                      type="button"
                      aria-label="Compare product"
                      className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#68707a]
                  shadow-[0_2px_10px_rgba(0,0,0,0.10)]
                  transition-colors
                  hover:text-[#071A41]
                "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M16 3l4 4-4 4" />
                        <path d="M20 7H4" />
                        <path d="M8 21l-4-4 4-4" />
                        <path d="M4 17h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* =========================
              PRODUCT DETAILS
          ========================= */}
                <div className="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4">

                  {/* Product name */}
                  <h3
                    className="
                min-h-[40px]
                text-[13px]
                font-medium
                leading-[19px]
                text-[#252b34]
                sm:text-[14px]
              "
                  >
                    {product.name}
                  </h3>

                  {/* Seller */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span
                      className="
                  flex
                  h-[15px]
                  w-[15px]
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-[#9c1f91]
                  via-[#db249c]
                  to-[#6824a8]
                  text-[7px]
                  font-bold
                  text-white
                "
                    >
                      M
                    </span>

                    <span className="text-[11px] text-[#59606a]">
                      {product.seller}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#161b22] sm:text-[14px]">
                      {product.price}
                    </span>

                    <span className="text-[11px] text-[#85898f] line-through sm:text-[12px]">
                      {product.oldPrice}
                    </span>
                  </div>

                  {/* Add to cart */}
                  <button
                    type="button"
                    className="
                mt-3
                w-full
                rounded-full
                bg-[#071A41]
                px-4
                py-2.5
                text-[12px]
                font-semibold
                text-white
                opacity-0
                transition-all
                duration-200
                group-hover:opacity-100
                hover:bg-[#071A41]
              "
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* =========================
        LOAD MORE
    ========================= */}
          <div className="mt-9 flex justify-center">
            <button
              type="button"
              className="
          rounded-full
          border
          border-[#0c625d]
          bg-white
          px-9
          py-2.5
          text-[12px]
          font-semibold
          text-[#252b34]
          transition-all
          duration-200
          hover:bg-[#0c625d]
          hover:text-white
        "
            >
              Load More
            </button>
          </div>
        </div>
      </section>


      {/* ============================================================
    SHOP BY CATEGORY — PREMIUM
    ============================================================ */}
      <section className="w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
          {/* ============================================================
        TABS
    ============================================================ */}
          <div className="mb-8 flex items-center justify-center gap-6 sm:gap-9">
            {["New Arrivals", "Best Seller", "Best Offers"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`
            relative
            pb-2
            text-[18px]
            font-semibold
            tracking-[-0.02em]
            transition-colors
            duration-200
            sm:text-[22px]
            lg:text-[24px]
            ${activeTab === tab
                    ? "text-[#075f5b]"
                    : "text-[#374151] hover:text-[#075f5b]"
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
                bg-[#075f5b]
              "
                  />
                )}
              </button>
            ))}
          </div>

          {/* ============================================================
        MAIN CONTENT
    ============================================================ */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[405px_1fr]">
            {/* ==========================================================
          PROMO BANNER
      ========================================================== */}
            <div
              className="
          relative
          min-h-[500px]
          overflow-hidden
          rounded-[10px]
          bg-black
          sm:min-h-[560px]
          lg:min-h-[590px]
        "
            >
              {/* Background */}
              <img
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=90"
                alt="Limited Time Offer"
                className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-80
            transition-transform
            duration-700
            hover:scale-105
          "
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

              {/* Content */}
              <div
                className="
            relative
            z-10
            flex
            h-full
            flex-col
            items-center
            justify-between
            px-6
            py-8
            text-center
            sm:px-8
            sm:py-9
          "
              >
                {/* Top */}
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-white/90">
                    Limited time only
                  </p>

                  {/* Countdown */}
                  <div
                    className="
                mt-4
                inline-flex
                items-center
                rounded-[8px]
                bg-white
                px-4
                py-2
                font-mono
                text-[17px]
                font-bold
                tracking-[0.1em]
                text-[#075f5b]
                shadow-lg
                sm:text-[18px]
              "
                  >
                    {formatTime(hours)} : {formatTime(minutes)} :{" "}
                    {formatTime(seconds)}
                  </div>
                </div>

                {/* Bottom */}
                <div className="max-w-[320px] pb-3">
                  <h3
                    className="
                text-[28px]
                font-bold
                leading-[1.1]
                tracking-[-0.02em]
                text-white
                sm:text-[32px]
              "
                  >
                    Sneaker Fest 2024
                  </h3>

                  <p className="mt-3 text-[14px] leading-5 text-white/90">
                    Up to 40% off Women Sneakers
                  </p>

                  <button
                    type="button"
                    className="
                mt-5
                rounded-full
                bg-white
                px-6
                py-2.5
                text-[13px]
                font-semibold
                text-[#075f5b]
                transition-all
                duration-200
                hover:bg-[#075f5b]
                hover:text-white
              "
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* ==========================================================
          PRODUCT GRID
      ========================================================== */}
            <div
              className="
          grid
          grid-cols-2
          gap-3
          sm:gap-4
          md:grid-cols-4
        "
            >
              {products.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="
              group
              relative
              overflow-hidden
              rounded-[10px]
              border
              border-[#e8e8e8]
              bg-white
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
            "
                >
                  {/* =====================================================
                IMAGE
            ===================================================== */}
                  <div
                    className="
                relative
                flex
                h-[190px]
                items-center
                justify-center
                overflow-hidden
                bg-[#fafafa]
                px-4
                pt-4
                sm:h-[210px]
                md:h-[190px]
              "
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading={index < 4 ? "eager" : "lazy"}
                      className="
                  h-full
                  w-full
                  object-contain
                  transition-transform
                  duration-500
                  group-hover:scale-[1.06]
                "
                    />

                    {/* Badge */}
                    <span
                      className="
                  absolute
                  left-3
                  top-3
                  rounded-full
                  bg-[#075f5b]
                  px-2.5
                  py-1
                  text-[9px]
                  font-semibold
                  text-white
                "
                    >
                      {activeTab === "Best Seller"
                        ? "BESTSELLER"
                        : activeTab === "Best Offers"
                          ? "OFFER"
                          : "NEW"}
                    </span>

                    {/* Wishlist */}
                    <button
                      type="button"
                      aria-label={`Add ${product.name} to wishlist`}
                      className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-[#075f5b]
                  hover:text-white
                "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-[16px] w-[16px]"
                        fill="none"
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

                  {/* =====================================================
                DETAILS
            ===================================================== */}
                  <div className="px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
                    {/* Product */}
                    <h3
                      className="
                  min-h-[38px]
                  line-clamp-2
                  text-[12px]
                  font-medium
                  leading-[17px]
                  text-[#30353d]
                  sm:text-[13px]
                "
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex items-center gap-[1px]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-[11px] w-[11px] fill-[#f4c542]"
                          >
                            <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-.94 6.49-.94L12 2.5z" />
                          </svg>
                        ))}
                      </div>

                      <span className="text-[10px] text-[#777c83]">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className="
                    text-[14px]
                    font-bold
                    text-[#171b20]
                    sm:text-[15px]
                  "
                      >
                        {product.price}
                      </span>

                      <span
                        className="
                    text-[10px]
                    text-[#85888c]
                    line-through
                    sm:text-[11px]
                  "
                      >
                        {product.oldPrice}
                      </span>
                    </div>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      className="
    mt-3
    w-full
    rounded-[6px]
    bg-[#142747]
    px-3
    py-2.5
    text-[11px]
    font-semibold
    text-white
    transition-all
    duration-200
    hover:bg-[#0f1f38]
    active:scale-[0.98]
    sm:text-[12px]
  "
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#11101f]">
        <div className="relative mx-auto min-h-[520px] w-full max-w-[1900px] overflow-hidden">
          {/* Background Image */}
          <img
            src="/indiekonnect-web/images/prod.png"
            alt="Premium Lifestyle"
            className="
        absolute
        inset-0
        h-full
        w-full
        object-cover
      "
          />

          {/* Dark Overlay */}
          <div
            className="
        absolute
        inset-0
        bg-gradient-to-r
        from-[#11101f]/95
        via-[#11101f]/70
        to-transparent
      "
          />

          {/* Content */}
          <div
            className="
        relative
        z-10
        flex
        min-h-[620px]
        items-center
      "
          >
            <div
              className="
          w-full
          max-w-[620px]
          px-7
          py-16
          sm:px-12
          md:px-16
          lg:ml-[5%]
          lg:px-0
        "
            >
              {/* Eyebrow */}
              <p
                className="
            mb-5
            text-[14px]
            font-medium
            tracking-wide
            text-white/85
            sm:text-[16px]
          "
              >
                A new breed of Lumixio
              </p>

              {/* Heading */}
              <h1
                className="
            max-w-[650px]
            text-[42px]
            font-semibold
            leading-[1.08]
            tracking-[-0.035em]
            text-white
            sm:text-[52px]
            md:text-[60px]
            lg:text-[68px]
            xl:text-[72px]
          "
              >
                Elevate your
                <br />
                lifestyle with premium
                <br />
                essentials.
              </h1>

              {/* CTA */}
              <button
                type="button"
                className="
            mt-9
            inline-flex
            items-center
            gap-3
            rounded-[10px]
            bg-white
            px-7
            py-4
            text-[14px]
            font-semibold
            text-[#171717]
            shadow-[0_8px_25px_rgba(0,0,0,0.18)]
            transition-all
            duration-200
            hover:bg-[#f2f2f2]
            hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
            active:scale-[0.98]
            sm:px-8
            sm:py-4
            sm:text-[15px]
          "
              >
                Explore All Products
                <span className="text-[20px] leading-none">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>












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

              <span className="text-[10px] text-[#c3922e]">✦</span>

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

              <span className="text-[9px] text-[#c3922e]">◆</span>

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
                {(reelsData?.data || []).map((r: any, index: number) => {
                  const product = r.product;

                  const productSlug = product?.slug;

                  const productName = product?.name || "Featured product";

                  const productImage = getProductImage(product);

                  const productPrice = getProductPrice(product);

                  const creatorName = r.creator_handle || r.title || "Creator";

                  const views = r.followers_count || 0;

                  const videoUrl =
                    r.video_full_path ||
                    r.video_full_url ||
                    r.video_url ||
                    r.video_path;

                  const thumbnailUrl = r.thumbnail_url || productImage;

                  const handleShopClick = (e: React.MouseEvent) => {
                    e.stopPropagation();

                    if (productSlug) {
                      router.push(`/product/${productSlug}/`);
                    }
                  };

                  return (
                    <motion.div
                      key={r.id || `${creatorName}-${index}`}
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
                        width: "clamp(250px, 25vw, 330px)",
                        height: "clamp(455px, 47vw, 570px)",
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
                              const video = e.currentTarget;

                              video.play().catch(() => { });
                            }}
                            onMouseLeave={(e) => {
                              const video = e.currentTarget;

                              video.pause();
                            }}
                          />
                        ) : (
                          <img
                            src={thumbnailUrl}
                            alt={r.title || "Creator reel"}
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
                              src={getCreatorAvatar(creatorName)}
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
                          <span className="text-[#e2b74e]">▶</span>

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
                          {r.title || r.caption || `${creatorName}'s reel`}
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
                })}
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

                  <span>Scroll to discover</span>

                  <span className="text-[#c3922e]">✦</span>

                  <span className="h-px w-8 bg-[#ddd4c3]" />
                </motion.div>
              )}
            </>
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
