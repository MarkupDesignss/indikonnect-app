"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import s from "./IndieKonnectHome.module.css";
import { ticker } from "./catalog";
import {
  FaTruck,
  FaLock,
  FaUndo,
  FaHeadset,
} from "react-icons/fa";
import Header from "./Header";

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

export default function IndieKonnectHome() {
  const router = useRouter();

  const [wish, setWish] = useState<Record<string | number, boolean>>({});
  const [level, setLevel] = useState(0);

  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [activeTab, setActiveTab] =
    useState("Best Seller");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [countdownExpired, setCountdownExpired] =
    useState(false);

  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const autoScrollInterval =
    useRef<NodeJS.Timeout | null>(null);

  const rail = useRef<HTMLDivElement>(null);

  /* ============================================================
      HOME CONTENT
  ============================================================ */

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetContentsQuery({});

  console.log(apiResponse)

  /* ============================================================
      CATEGORIES
  ============================================================ */

  const {
    data: categoriesData,
  } = useGetCategoriesQuery({});

  /* ============================================================
      DEAL OF THE DAY
  ============================================================ */

  const {
    data: dealProductResponse,
  } = useGetDealOfTheDayProductsQuery();

  /* ============================================================
      REELS
  ============================================================ */

  const {
    data: reelsData,
    isLoading: isReelsLoading,
    error: reelsError,
  } = useGetReelsQuery({});

  /* ============================================================
      TRENDING
  ============================================================ */

  const {
    data: trendingResponse,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    refetch: refetchTrending,
  } = useGetTrendingProductsQuery();

  /* ============================================================
      PRODUCT SECTIONS
  ============================================================ */

  const {
    data: productSections,
    isFetching,
    isError,
  } = useGetProductSectionsQuery();

  /* ============================================================
      CART
  ============================================================ */

  const [
    addToCartMutation,
  ] = useAddToCartMutation();

  const [
    updateCartItemMutation,
    { isLoading: isUpdatingCart },
  ] = useUpdateCartItemMutation();

  /* ============================================================
      WISHLIST
  ============================================================ */

  const [
    addToWishlistMutation,
  ] = useAddToWishlistMutation();

  const [
    removeFromWishlistMutation,
  ] = useRemoveFromWishlistMutation();

  const {
    data: wishlistData,
    refetch: refetchWishlist,
  } = useGetWishlistQuery({});

  /* ============================================================
      TOP DISCOUNTED PRODUCTS
  ============================================================ */

  const {
    data: topDiscountedData,
  } = useGetTopDiscountedProductsQuery();

  /* ============================================================
      PRODUCTS
  ============================================================ */

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

  /* ============================================================
      NORMALIZE API RESPONSES
  ============================================================ */

  const dealProducts = useMemo(() => {
    if (Array.isArray(dealProductResponse)) {
      return dealProductResponse;
    }

    if (
      Array.isArray(dealProductResponse?.data)
    ) {
      return dealProductResponse.data;
    }

    return [];
  }, [dealProductResponse]);

  const topDiscountedProducts = useMemo(() => {
    if (Array.isArray(topDiscountedData)) {
      return topDiscountedData;
    }

    if (Array.isArray(topDiscountedData?.data)) {
      return topDiscountedData.data;
    }

    return [];
  }, [topDiscountedData]);

  const products =
    productsResponse?.data ?? [];

  const trendingProducts =
    trendingResponse?.data ?? [];

  const newArrivals =
    productSections?.data?.new_arrivals
      ?.products || [];

  const bestSellers =
    productSections?.data?.best_sellers
      ?.products || [];

  const bestOffers =
    productSections?.data?.best_offers
      ?.products || [];

  /* ============================================================
      CATEGORIES NORMALIZE
  ============================================================ */

  const categories = useMemo(() => {
    if (!categoriesData) {
      return [];
    }

    const rawData =
      categoriesData.data || categoriesData;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (
      rawData?.data &&
      Array.isArray(rawData.data)
    ) {
      return rawData.data;
    }

    if (
      rawData?.categories &&
      Array.isArray(rawData.categories)
    ) {
      return rawData.categories;
    }

    if (
      rawData?.items &&
      Array.isArray(rawData.items)
    ) {
      return rawData.items;
    }

    return [];
  }, [categoriesData]);

  /* ============================================================
      GROWTH STEPS
  ============================================================ */

  const {
    data: growthStepsData,
    isLoading: isGrowthStepsLoading,
  } = useGetGrowthStepsQuery();

  const growthSteps =
    growthStepsData?.data?.steps?.filter(
      (step: any) => step.is_active,
    ) ?? [];

  const growthTitle =
    growthStepsData?.data?.title ||
    "A growth ladder for leaders";

  const activeLevel =
    growthSteps.length > 0
      ? Math.min(
        level,
        growthSteps.length - 1,
      )
      : 0;

  /* ============================================================
      WISHLIST SYNC
  ============================================================ */

  useEffect(() => {
    if (!wishlistData?.data) {
      return;
    }

    const wishState: Record<
      string | number,
      boolean
    > = {};

    wishlistData.data.forEach((item: any) => {
      if (item.product_id) {
        wishState[item.product_id] = true;
      }
    });

    setWish(wishState);
  }, [wishlistData]);

  /* ============================================================
      TOP DISCOUNTED COUNTDOWN
      Uses:
      product.deal_of_the_day_ends_at
  ============================================================ */

  useEffect(() => {
    const firstItem =
      topDiscountedProducts[0];

    const product =
      firstItem?.product || firstItem;

    const endDate =
      product?.deal_of_the_day_ends_at;

    if (!endDate) {
      setCountdownExpired(false);

      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      return;
    }

    const endTime =
      new Date(endDate).getTime();

    if (Number.isNaN(endTime)) {
      setCountdownExpired(true);

      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      return;
    }

    const updateCountdown = () => {
      const now = Date.now();

      const difference =
        endTime - now;

      if (difference <= 0) {
        setCountdownExpired(true);

        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setCountdownExpired(false);

      const totalSeconds =
        Math.floor(
          difference / 1000,
        );

      const days =
        Math.floor(
          totalSeconds / 86400,
        );

      const hours =
        Math.floor(
          (totalSeconds % 86400) /
          3600,
        );

      const minutes =
        Math.floor(
          (totalSeconds % 3600) /
          60,
        );

      const seconds =
        totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    updateCountdown();

    const timer = setInterval(
      updateCountdown,
      1000,
    );

    return () =>
      clearInterval(timer);
  }, [topDiscountedProducts]);

  /* ============================================================
      AUTO SCROLL POPULAR PRODUCTS
  ============================================================ */

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    if (autoScrollInterval.current) {
      clearInterval(
        autoScrollInterval.current,
      );
    }

    autoScrollInterval.current =
      setInterval(() => {
        setCurrentIndex(
          (prevIndex) => {
            const nextIndex =
              prevIndex + 1;

            if (
              nextIndex >=
              products.length
            ) {
              return 0;
            }

            return nextIndex;
          },
        );
      }, 3000);

    return () => {
      if (
        autoScrollInterval.current
      ) {
        clearInterval(
          autoScrollInterval.current,
        );
      }
    };
  }, [products.length]);

  useEffect(() => {
    if (
      !scrollContainerRef.current ||
      products.length === 0
    ) {
      return;
    }

    const container =
      scrollContainerRef.current;

    const card =
      container.children[0] as
      | HTMLElement
      | undefined;

    const cardWidth =
      card?.clientWidth || 0;

    const gap = 16;

    const scrollPosition =
      currentIndex *
      (cardWidth + gap);

    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  }, [
    currentIndex,
    products.length,
  ]);

  /* ============================================================
      GROWTH CONTROLS
  ============================================================ */

  const handlePreviousLevel =
    () => {
      if (growthSteps.length <= 1) {
        return;
      }

      setLevel((current) =>
        current === 0
          ? growthSteps.length - 1
          : current - 1,
      );
    };

  const handleNextLevel = () => {
    if (growthSteps.length <= 1) {
      return;
    }

    setLevel((current) =>
      current ===
        growthSteps.length - 1
        ? 0
        : current + 1,
    );
  };

  /* ============================================================
      HELPERS
  ============================================================ */

  const formatTime = (
    value: number,
  ) =>
    String(value).padStart(2, "0");

  const formatViews = (
    count: number,
  ) => {
    if (!count) {
      return "0";
    }

    if (count >= 1000) {
      return (
        (count / 1000).toFixed(1) +
        "k"
      );
    }

    return count.toString();
  };

  const getProductImage = (
    product: any,
  ) => {
    if (
      product?.images?.length > 0
    ) {
      const primary =
        product.images.find(
          (img: any) =>
            img?.is_primary,
        );

      return (
        primary?.image_url ||
        product.images[0]
          ?.image_url ||
        "/images/placeholder.png"
      );
    }

    return (
      product?.primary_image_url ||
      "/images/placeholder.png"
    );
  };

  const getProductPrice = (
    product: any,
  ) => {
    if (!product) {
      return "₹0";
    }

    const price = Number(
      product.retail_price || 0,
    );

    return `₹${price.toLocaleString(
      "en-IN",
    )}`;
  };

  const getCreatorAvatar = (
    creatorHandle: string,
  ) => {
    if (!creatorHandle) {
      return "https://ui-avatars.com/api/?name=Creator&background=C9A96E&color=fff&size=60&bold=true";
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      creatorHandle,
    )}&background=C9A96E&color=fff&size=60&bold=true`;
  };

  /* ============================================================
      HERO CONTENT
  ============================================================ */

  const homeContent =
    apiResponse?.data?.find(
      (item: any) =>
        item.slug === "home" ||
        item.title === "Home",
    );

  const bannerBlock =
    homeContent?.blocks?.[0] ||
    null;

  const stripHtml = (
    html: string,
  ) => {
    if (!html) {
      return "";
    }

    if (
      typeof window ===
      "undefined"
    ) {
      return html
        .replace(
          /<[^>]*>/g,
          "",
        )
        .trim();
    }

    const tmp =
      document.createElement(
        "div",
      );

    tmp.innerHTML = html;

    return (
      tmp.textContent ||
      tmp.innerText ||
      ""
    );
  };

  const getTextFromHtml = (
    html: string,
  ) => {
    if (!html) {
      return "";
    }

    return stripHtml(html);
  };

  const heroImage = useMemo(() => {
    if (
      bannerBlock?.images?.[0]
        ?.url
    ) {
      return bannerBlock.images[0]
        .url;
    }

    return "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80";
  }, [bannerBlock]);

  const heroImageAlt =
    useMemo(() => {
      if (
        bannerBlock?.images?.[0]
          ?.alt_text
      ) {
        return bannerBlock.images[0]
          .alt_text;
      }

      return "Hero banner - IndieKonnect";
    }, [bannerBlock]);

  const heroHeading =
    useMemo(() => {
      if (bannerBlock?.heading) {
        return getTextFromHtml(
          bannerBlock.heading,
        );
      }

      return "Elevate Your · Summer Style";
    }, [bannerBlock]);

  const heroShortDescription =
    useMemo(() => {
      if (
        bannerBlock?.short_description
      ) {
        return bannerBlock.short_description;
      }

      return "Beauty, crockery,<br />jewellery and <span style='font-style:italic;color:#C9A96E'>watches</span><br />for the modern home.";
    }, [bannerBlock]);

  const heroCtaPrimary =
    useMemo(() => {
      return (
        bannerBlock?.cta_primary_text ||
        "Shop Now"
      );
    }, [bannerBlock]);

  const heroCtaSecondary =
    useMemo(() => {
      return (
        bannerBlock?.cta_secondary_text ||
        "Explore Collection"
      );
    }, [bannerBlock]);

  const heroCollectionLabel =
    useMemo(() => {
      return (
        bannerBlock?.collection_label ||
        "New Season · 2026"
      );
    }, [bannerBlock]);

  const heroDiscountBadge =
    useMemo(() => {
      if (
        bannerBlock?.discount_badge
      ) {
        return {
          prefix:
            bannerBlock.discount_badge
              .prefix || "Up To",
          value:
            bannerBlock.discount_badge
              .value || "40",
          suffix:
            bannerBlock.discount_badge
              .suffix || "OFF",
        };
      }

      return {
        prefix: "Up To",
        value: "40",
        suffix: "OFF",
      };
    }, [bannerBlock]);

  const heroFloatingCard =
    useMemo(() => {
      if (
        bannerBlock?.floating_card
      ) {
        return {
          label:
            bannerBlock.floating_card
              .label ||
            "The Edit",
          title:
            bannerBlock.floating_card
              .title ||
            "Signature Collection",
          cta:
            bannerBlock.floating_card
              .cta ||
            "Explore",
        };
      }

      return {
        label: "The Edit",
        title:
          "Signature Collection",
        cta: "Explore",
      };
    }, [bannerBlock]);

  /* ============================================================
      TOAST
  ============================================================ */

  const showCustomToast = (
    type:
      | "success"
      | "error"
      | "info",
    message: string,
    productName?: string,
  ) => {
    let toastContainer =
      document.getElementById(
        "toast-container",
      );

    if (!toastContainer) {
      toastContainer =
        document.createElement(
          "div",
        );

      toastContainer.id =
        "toast-container";

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

      document.body.appendChild(
        toastContainer,
      );
    }

    const toast =
      document.createElement(
        "div",
      );

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
          <div style="
            font-size:15px;
            font-weight:600;
            color:#1a1a1a;
            letter-spacing:-0.2px;
            margin-bottom:2px;
          ">
            ${productName || ""}
          </div>

          <div style="
            font-size:13.5px;
            color:#4a4a4a;
            line-height:1.4;
            font-weight:400;
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
            padding:0 0 0 8px;
            line-height:1;
          "
        >
          ×
        </button>
      </div>
    `;

    toastContainer.appendChild(
      toast,
    );

    const removeToast = () => {
      toast.style.animation =
        "slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";

      setTimeout(() => {
        toast.remove();

        if (
          toastContainer &&
          toastContainer.children.length ===
          0
        ) {
          toastContainer.remove();
        }
      }, 400);
    };

    toast
      .querySelector(
        ".toast-close-btn",
      )
      ?.addEventListener(
        "click",
        removeToast,
      );

    if (
      !document.getElementById(
        "toast-styles",
      )
    ) {
      const style =
        document.createElement(
          "style",
        );

      style.id =
        "toast-styles";

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

      document.head.appendChild(
        style,
      );
    }

    setTimeout(() => {
      if (toast.parentNode) {
        removeToast();
      }
    }, 4000);
  };

  /* ============================================================
      ADD TO CART
  ============================================================ */

  const handleAddToCart = async (
    productId:
      | string
      | number,
    productName: string,
    productImage: string,
    productPrice: number,
  ) => {
    try {
      const response =
        await addToCartMutation({
          product_id: productId,
          quantity: 1,
        }).unwrap();

      if (
        response?.message ===
        "Item added to cart successfully" ||
        response?.data?.items
      ) {
        const serverItemId =
          response?.data?.item?.id ??
          response?.data?.id ??
          productId;

        setCartItems((prev) => {
          const existing =
            prev.find(
              (item) =>
                item.product_id ===
                productId,
            );

          if (existing) {
            return prev.map(
              (item) =>
                item.product_id ===
                  productId
                  ? {
                    ...item,
                    quantity:
                      item.quantity +
                      1,
                  }
                  : item,
            );
          }

          return [
            ...prev,
            {
              id: serverItemId,
              product_id:
                productId,
              name: productName,
              image: productImage,
              price: productPrice,
              quantity: 1,
            },
          ];
        });

        setCartTotal(
          (prev) =>
            prev + productPrice,
        );

        setCartSidebarOpen(true);
      } else {
        throw new Error(
          response?.message ||
          "Failed to add item to cart",
        );
      }
    } catch (error: any) {
      console.error(
        "Add to cart error:",
        error,
      );

      showCustomToast(
        "error",
        error?.data?.message ||
        error?.message ||
        "Failed to add item to cart",
        productName,
      );
    }
  };

  /* ============================================================
      WISHLIST
  ============================================================ */

  const handleToggleWishlist =
    async (
      productId:
        | string
        | number,
      productName: string,
    ) => {
      const isWishlisted =
        wish[productId] ||
        false;

      try {
        if (isWishlisted) {
          const response =
            await removeFromWishlistMutation(
              {
                product_id:
                  productId,
              },
            ).unwrap();

          if (
            response?.message ||
            response?.data ||
            response?.success === true
          ) {
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
          } else {
            throw new Error(
              response?.message ||
              "Failed to remove from wishlist",
            );
          }
        } else {
          const response =
            await addToWishlistMutation(
              {
                product_id:
                  productId,
              },
            ).unwrap();

          const responseMessage =
            response?.message
              ?.toLowerCase?.() ||
            "";

          if (
            response?.already_exists ||
            (responseMessage.includes(
              "already",
            ) &&
              responseMessage.includes(
                "wishlist",
              ))
          ) {
            setWish((current) => ({
              ...current,
              [productId]: true,
            }));

            showCustomToast(
              "info",
              "Already in your wishlist ❤️",
              productName,
            );

            refetchWishlist();

            return;
          }

          if (
            response?.message ||
            response?.data ||
            response?.success === true
          ) {
            setWish((current) => ({
              ...current,
              [productId]: true,
            }));

            showCustomToast(
              "success",
              "Added to wishlist! ❤️",
              productName,
            );

            refetchWishlist();
          } else {
            throw new Error(
              response?.message ||
              "Failed to add to wishlist",
            );
          }
        }
      } catch (error: any) {
        console.error(
          "Wishlist toggle error:",
          error,
        );

        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "";

        const lowerErrorMessage =
          errorMessage.toLowerCase();

        if (
          (lowerErrorMessage.includes(
            "already",
          ) &&
            lowerErrorMessage.includes(
              "wishlist",
            )) ||
          error?.data?.already_exists
        ) {
          setWish((current) => ({
            ...current,
            [productId]: true,
          }));

          showCustomToast(
            "info",
            "Already in your wishlist ❤️",
            productName,
          );

          refetchWishlist();

          return;
        }

        showCustomToast(
          "error",
          errorMessage ||
          "Failed to update wishlist",
          productName,
        );
      }
    };

  /* ============================================================
      REELS SCROLL
  ============================================================ */

  const scrollReel = (
    direction: number,
  ) => {
    rail.current?.scrollBy({
      left: direction * 640,
      behavior: "smooth",
    });
  };

  /* ============================================================
      CART SIDEBAR
  ============================================================ */



  const handleCloseCart = () => {
    setCartSidebarOpen(false);
  };

  /* ============================================================
      CART UPDATE
  ============================================================ */

  const handleUpdateCart = async (
    itemId: number,
    productId: number,
    action:
      | "increment"
      | "decrement",
  ) => {
    const currentItem =
      cartItems.find(
        (item) =>
          item.product_id ===
          productId,
      );

    if (!currentItem) {
      return;
    }

    if (
      action === "decrement" &&
      currentItem.quantity <= 1
    ) {
      return;
    }

    try {
      const response =
        await updateCartItemMutation({
          itemId,
          data: {
            product_id:
              productId,
            quantity: 1,
            action,
          },
        }).unwrap();

      console.log(
        "Update cart response:",
        response,
      );

      const quantityChange =
        action === "increment"
          ? 1
          : -1;

      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id ===
            productId
            ? {
              ...item,
              quantity:
                item.quantity +
                quantityChange,
            }
            : item,
        ),
      );

      setCartTotal((prev) =>
        Math.max(
          0,
          prev +
          currentItem.price *
          quantityChange,
        ),
      );

      showCustomToast(
        "success",
        action ===
          "increment"
          ? "Quantity increased successfully"
          : "Quantity decreased successfully",
      );
    } catch (error: any) {
      console.error(
        "Update cart error:",
        error,
      );

      showCustomToast(
        "error",
        error?.data?.message ||
        error?.message ||
        "Failed to update cart",
      );
    }
  };

  /* ============================================================
      LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <div className={s.page}>
        <div
          className={
            s.stickyHeaderWrapper
          }
        >
          <Header />
        </div>

        <div
          className={
            s.loadingContainer
          }
        >
          <div
            className={
              s.loaderRing
            }
          >
            <div
              className={
                s.loaderRingInner
              }
            />
          </div>

          <p
            className={
              s.loadingText
            }
          >
            Loading experience...
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (error) {
    console.error(
      "API Error:",
      error,
    );
  }

  return (
    <div className={s.page}>
      {/* ============================================================
          MARQUEE
      ============================================================ */}

      <div
        className={
          s.marqueeWrapper
        }
      >
        <div className={s.marquee}>
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className={
                s.marqueeItem
              }
            >
              {ticker.map((t) => (
                <span key={t}>
                  {t.includes("•") ? (
                    <span
                      className={
                        s.gold
                      }
                    >
                      {t}
                    </span>
                  ) : (
                    t
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div
        className={
          s.stickyHeaderWrapper
        }
      >
        <Header />
      </div>

      {/* ============================================================
          HERO
      ============================================================ */}

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.08,
        }}
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
            <div className="absolute inset-0 z-0">
              <motion.img
                src={heroImage}
                alt={heroImageAlt}
                className="h-full w-full object-cover object-center"
                initial={{
                  scale: 1.04,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  duration: 1.8,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
              />

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
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}
                className="relative z-20 max-w-[650px]"
              >
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
                  className="mb-5 flex items-center gap-3"
                >
                  <span className="h-px w-9 bg-[#b88942]" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#a87838] sm:text-[10px]">
                    {
                      heroCollectionLabel
                    }
                  </span>
                </motion.div>

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
                  style={{
                    width: "100%",
                    maxWidth: "520px",
                    display: "block",
                    whiteSpace: "normal",
                  }}
                  className="font-serif text-[34px] font-medium leading-[0.98] tracking-[-0.045em] text-[#171717] sm:text-[36px] md:text-[44px] lg:text-[40px] xl:text-[52px] 2xl:text-[60px]"
                  dangerouslySetInnerHTML={{
                    __html: heroHeading,
                  }}
                />

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
                  className="mt-5 max-w-[650px] text-[22px] leading-[1.35] tracking-[-0.02em] text-[#343434] sm:text-[26px] lg:text-[30px]"
                  dangerouslySetInnerHTML={{
                    __html:
                      heroShortDescription,
                  }}
                />

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
                  className="my-6 flex items-center gap-3"
                >
                  <span className="h-px w-20 bg-[#c9a15e]" />
                  <span className="text-[8px] text-[#c9a15e]">
                    ◆
                  </span>
                  <span className="h-px w-8 bg-[#ded2bd]" />
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
                    delay: 0.75,
                  }}
                  className="mt-7 flex flex-col gap-3 sm:flex-row"
                >
                  <motion.button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/products",
                      )
                    }
                    whileHover={{
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="font-serif group inline-flex h-[52px] items-center justify-center gap-7 rounded-xl bg-[#071a41] px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(184,127,47,0.22)] transition-all duration-300 hover:bg-[#071a40] sm:min-w-[190px]"
                  >
                    <span>
                      {heroCtaPrimary}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/products",
                      )
                    }
                    whileHover={{
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="inline-flex font-serif h-[52px] items-center justify-center gap-4 rounded-xl border border-[#b88942] bg-white/50 px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#282828] transition-all duration-300 hover:bg-white hover:text-[#a67838] sm:min-w-[190px]"
                  >
                    {
                      heroCtaSecondary
                    }

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
                  }}
                  className="mt-8 grid max-w-[820px] grid-cols-1 gap-4 border-t border-[#cfc5b6] pt-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {[
                    {
                      icon: (
                        <FaTruck className="h-3.5 w-3.5" />
                      ),
                      title:
                        "Free Shipping",
                      text:
                        "On orders over $50",
                    },
                    {
                      icon: (
                        <FaLock className="h-3.5 w-3.5" />
                      ),
                      title:
                        "Secure Payment",
                      text:
                        "100% Protected",
                    },
                    {
                      icon: (
                        <FaUndo className="h-3.5 w-3.5" />
                      ),
                      title:
                        "Easy Returns",
                      text:
                        "30 Days Return",
                    },
                    {
                      icon: (
                        <FaHeadset className="h-3.5 w-3.5" />
                      ),
                      title:
                        "24/7 Support",
                      text:
                        "Always Here to Help",
                    },
                  ].map(
                    (
                      feature,
                      index,
                    ) => (
                      <motion.div
                        key={
                          feature.title
                        }
                        initial={{
                          opacity: 0,
                          y: 18,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration:
                            0.65,
                          delay:
                            1 +
                            index *
                            0.12,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        }}
                        whileHover={{
                          y: -4,
                        }}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300"
                      >
                        <motion.div
                          animate={{
                            y: [
                              0,
                              -3,
                              0,
                            ],
                          }}
                          transition={{
                            duration:
                              2.8,
                            delay:
                              index *
                              0.2,
                            repeat:
                              Infinity,
                            ease: "easeInOut",
                          }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-[#353535] shadow-[0_8px_32px_rgba(80,55,25,0.08)] transition-all duration-300 group-hover:border-[#c9a15e]/60 group-hover:bg-white/60 group-hover:shadow-[0_12px_40px_rgba(201,161,94,0.15)]"
                        >
                          {feature.icon}
                        </motion.div>

                        <div className="min-w-0 flex-1 whitespace-nowrap">
                          <p className="text-[12px] font-semibold leading-tight tracking-[-0.01em] text-[#282828] sm:text-[13px] lg:text-[14px]">
                            {
                              feature.title
                            }
                          </p>

                          <p className="mt-0.5 text-[10px] leading-tight text-[#777]/80 sm:text-[10px] lg:text-[11px]">
                            {
                              feature.text
                            }
                          </p>
                        </div>
                      </motion.div>
                    ),
                  )}
                </motion.div>
              </motion.div>

              <div className="relative hidden h-full min-h-[500px] lg:block">
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
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1,
                    ],
                  }}
                  className="absolute left-[8%] top-[15%] z-30 flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full border border-[#d7b477] bg-[#f9f4eb]/90 shadow-[0_15px_35px_rgba(80,55,25,0.10)] xl:h-[120px] xl:w-[120px]"
                >
                  <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#9b7440]">
                    {
                      heroDiscountBadge.prefix
                    }
                  </span>

                  <span className="mt-0.5 font-serif text-[34px] leading-none text-[#b47d2f] xl:text-[38px]">
                    {
                      heroDiscountBadge.value
                    }
                    %
                  </span>

                  <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.25em] text-[#9b7440]">
                    {
                      heroDiscountBadge.suffix
                    }
                  </span>
                </motion.div>

                <motion.div
                  animate={{
                    y: [
                      0,
                      -10,
                      0,
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat:
                      Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-[15%] right-[5%] z-30 bg-white/90 px-6 py-4 shadow-[0_18px_45px_rgba(40,30,20,0.13)]"
                >
                  <div className="text-[8px] font-medium uppercase tracking-[0.25em] text-[#b88942]">
                    {
                      heroFloatingCard.label
                    }
                  </div>

                  <div className="mt-1.5 font-serif text-[18px] text-[#252525]">
                    {
                      heroFloatingCard.title
                    }
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-px w-8 bg-[#c49a5d]" />

                    <span className="text-[8px] uppercase tracking-[0.18em] text-[#888]">
                      {
                        heroFloatingCard.cta
                      }
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

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
          SHOP DEALS BY CATEGORY
      ============================================================ */}

      <motion.section
        className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.1,
        }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <motion.div
            variants={fadeInUp}
            className="mb-10 flex flex-col items-center text-center sm:mb-12"
          >
            <h2 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-[#101827] sm:text-[40px] lg:text-[48px]">
              Shop Deals by Category
            </h2>

            <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#555b63] sm:text-[15px]">
              Dining, living, and desk
              areas serve their
              purposes
              <br className="hidden sm:block" />
              in total harmony of
              style.
            </p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-6 lg:overflow-visible">
            {categories.map(
              (
                category: any,
                index: number,
              ) => (
                <motion.div
                  key={
                    category.id ||
                    `${category.title}-${index}`
                  }
                  variants={scaleIn}
                  whileHover={{
                    y: -4,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1,
                    ],
                  }}
                  onClick={() => {
                    router.push(
                      `/products/?category=${encodeURIComponent(
                        category.title,
                      )}`,
                    );
                  }}
                  className="group relative min-w-[245px] cursor-pointer rounded-[6px] border border-[#e8e8e8] bg-white px-5 pb-5 pt-6 shadow-[0_2px_12px_rgba(0,0,0,0.025)] transition-all duration-300 hover:border-[#dedede] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] lg:min-w-0"
                >
                  <div className="flex justify-center">
                    <div className="relative h-[150px] w-[150px] overflow-hidden rounded-full bg-[#f5f5f5] sm:h-[160px] sm:w-[160px]">
                      <img
                        src={
                          category.image ||
                          "https://via.placeholder.com/160x160"
                        }
                        alt={
                          category.title
                        }
                        loading={
                          index < 4
                            ? "eager"
                            : "lazy"
                        }
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/160x160";
                        }}
                      />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center text-[18px] font-semibold tracking-[-0.02em] text-[#20252d] transition-colors duration-300 group-hover:text-[#071A41]">
                    {
                      category.title
                    }
                  </h3>

                  <div className="mt-3 flex justify-center">
                    <motion.div
                      whileHover={{
                        x: 2,
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[14px] font-medium text-[#626870] transition-all duration-300 group-hover:bg-[#071A41] group-hover:text-white group-hover:shadow-[0_6px_18px_rgba(7,26,65,0.18)]"
                    >
                      <span>
                        {index === 5 ? "Products" : "See More"}
                      </span>

                      <span className="text-[16px] leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </motion.section>

      {/* ============================================================
          FEATURE PRODUCTS
      ============================================================ */}

      <motion.section
        className="relative w-full overflow-hidden bg-white py-4 sm:py-10 lg:py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.1,
        }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <motion.div
            variants={fadeInUp}
            className="mb-4 flex flex-col items-center text-center sm:mb-6"
          >
            <h2 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-[#101827] sm:text-[40px] lg:text-[48px]">
              Feature Products
            </h2>

            <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#555b63] sm:text-[15px]">
              Dining, living, and desk
              areas serve their
              purposes
              <br className="hidden sm:block" />
              in total harmony of
              style.
            </p>
          </motion.div>

          {isTrendingLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[#e7e5df] bg-[#faf9f5]"
                  >
                    <div className="aspect-[1.15] shrink-0 animate-pulse bg-[#e5e3dc]" />

                    <div className="flex flex-1 flex-col p-4 pt-3 sm:p-5 sm:pt-3">
                      <div className="h-3 w-16 animate-pulse rounded bg-[#e5e3dc]" />
                      <div className="mt-1 h-10 w-4/5 animate-pulse rounded bg-[#e5e3dc]" />
                      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e5e3dc]" />

                      <div className="mt-auto pt-3">
                        <div className="h-5 w-20 animate-pulse rounded bg-[#e5e3dc]" />

                        <div className="mt-3 h-10 w-full animate-pulse rounded-full bg-[#e5e3dc]" />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : isTrendingError ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  refetchTrending()
                }
                className="rounded-full bg-[#071a41] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#102d60]"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trendingProducts
                .slice(0, 4)
                .map(
                  (
                    p: any,
                    index: number,
                  ) => {
                    const price =
                      Number(
                        p.retail_price ??
                        0,
                      );

                    const mrp =
                      Number(
                        p.retail_mrp ??
                        0,
                      );

                    const image =
                      p.images?.find(
                        (img: any) =>
                          img.is_primary,
                      )
                        ?.image_url ||
                      p.images?.[0]
                        ?.image_url ||
                      "/images/product-placeholder.png";

                    const brand =
                      p.brand?.name ||
                      p.brand_name ||
                      p.brand ||
                      "Brand";

                    const rating =
                      p.reviews
                        ?.average_rating ??
                      p.rating ??
                      p.average_rating ??
                      0;

                    const reviews =
                      p.reviews
                        ?.total_reviews ??
                      p.review_count ??
                      p.reviews_count ??
                      0;

                    return (
                      <motion.div
                        key={p.id}
                        variants={
                          scaleIn
                        }
                        whileHover={{
                          y: -5,
                        }}
                        transition={{
                          duration:
                            0.3,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        }}
                        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#e7e5df] bg-[#faf9f5] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(7,26,65,0.10)]"
                      >
                        <div className="relative aspect-[1.15] shrink-0 overflow-hidden bg-[#e5e3dc]">
                          <img
                            src={image}
                            alt={p.name}
                            onClick={() =>
                              router.push(
                                `/product/${p.slug}/`,
                              )
                            }
                            className="h-full w-full cursor-pointer object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/product-placeholder.png";
                            }}
                          />

                          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                            <span className="inline-flex rounded-full border border-white/80 bg-black/10 px-3 py-1 font-serif text-[11px] italic text-white backdrop-blur-sm">
                              {index ===
                                0
                                ? "Promotion"
                                : index ===
                                  2
                                  ? "Customer favorite"
                                  : "New"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3">
                          <p className="mb-0 min-h-[16px] text-[10px] font-medium uppercase leading-[16px] tracking-[0.08em] text-[#7d827f] sm:text-[11px]">
                            {brand}
                          </p>

                          <h3
                            onClick={() =>
                              router.push(
                                `/product/${p.slug}/`,
                              )
                            }
                            className="w-full cursor-pointer truncate text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#171d1c] transition-colors duration-300 group-hover:text-[#071a41] sm:text-[17px]"
                          >
                            {p.name}
                          </h3>

                          <div className="mt-4 flex min-h-[19px] items-center gap-1">
                            <span className="text-[13px] leading-none text-[#F5A623]">
                              ★
                            </span>

                            <span className="text-[12px] font-medium leading-none text-[#555b63] sm:text-[13px]">
                              {Number(
                                rating,
                              ).toFixed(
                                1,
                              )}
                            </span>

                            <span className="text-[12px] leading-none text-[#8b918f] sm:text-[13px]">
                              ({reviews})
                            </span>
                          </div>

                          <div className="mt-auto pt-3">
                            <div className="flex min-h-[27px] items-center">
                              <span className="text-[18px] font-bold leading-none text-[#17201f] sm:text-[20px]">
                                ₹
                                {price.toLocaleString(
                                  "en-IN",
                                )}
                              </span>

                              {mrp >
                                price && (
                                  <span className="ml-2 text-[12px] leading-none text-[#8b918f] line-through">
                                    ₹
                                    {mrp.toLocaleString(
                                      "en-IN",
                                    )}
                                  </span>
                                )}
                            </div>

                            <motion.button
                              type="button"
                              whileHover={{
                                scale: 1.02,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              onClick={(
                                e,
                              ) => {
                                e.stopPropagation();

                                handleAddToCart(
                                  p.id,
                                  p.name,
                                  image,
                                  price,
                                );
                              }}
                              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#071a41] px-4 text-[13px] font-medium text-white shadow-[0_5px_15px_rgba(7,26,65,0.15)] transition-all duration-300 hover:bg-[#102d60] sm:h-11"
                            >
                              <span className="text-[17px] leading-none">
                                +
                              </span>

                              <span>
                                Add to Cart
                              </span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  },
                )}
            </div>
          )}

          <div className="mt-5 flex justify-center sm:hidden">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/products/",
                )
              }
              className="flex items-center gap-2 border-b border-[#101827] pb-1 text-[13px] font-medium text-[#101827]"
            >
              More products
              <span className="text-[18px]">
                →
              </span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* ============================================================
          BANNER BEST DEAL
      ============================================================ */}

      <section className="relative w-full overflow-hidden bg-white py-5 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5 xl:gap-6">
            {dealProducts.length >
              0 ? (
              dealProducts.map(
                (
                  rawProduct: any,
                  index: number,
                ) => {
                  const product =
                    rawProduct?.product ||
                    rawProduct;

                  const discountPercent =
                    rawProduct
                      ?.discounts
                      ?.retail
                      ?.discount_percentage ??
                    product?.retail_discount_percentage ??
                    product?.retail_discount_value ??
                    0;

                  const productImage =
                    product?.primary_image_url ||
                    product?.images?.find(
                      (img: any) =>
                        img?.is_primary,
                    )?.image_url ||
                    product?.images?.[0]
                      ?.image_url ||
                    "/images/placeholder-promo.jpg";

                  return (
                    <motion.div
                      key={
                        product?.id ||
                        index
                      }
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
                        delay:
                          0.12 +
                          index *
                          0.08,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
                      whileHover={{
                        y: -4,
                      }}
                      className="group relative h-[300px] overflow-hidden rounded-[20px] bg-[#dfe8f0] shadow-[0_8px_30px_rgba(7,26,65,0.08)] sm:h-[360px] lg:h-[390px] xl:h-[420px]"
                    >
                      <img
                        src={productImage}
                        alt={
                          product?.name ||
                          "Product"
                        }
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045]"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/placeholder-promo.jpg";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/25 to-transparent opacity-80" />

                      <div className="relative z-10 flex h-full w-full flex-col items-start px-7 py-8 sm:px-9 sm:py-10 lg:px-10 lg:py-11 xl:px-12 xl:py-12">
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
                            delay:
                              0.2 +
                              index *
                              0.08,
                            duration: 0.5,
                          }}
                          className="text-[13px] font-medium tracking-[-0.01em] text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:text-[15px]"
                        >
                          Today's Best
                          Deal
                        </motion.p>

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
                            delay:
                              0.28 +
                              index *
                              0.08,
                            duration: 0.55,
                            ease: [
                              0.16,
                              1,
                              0.3,
                              1,
                            ],
                          }}
                          className="mt-3 max-w-[430px] whitespace-pre-line text-[30px] font-semibold leading-[1.03] tracking-[-0.045em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)] sm:text-[38px] lg:text-[42px] xl:text-[46px]"
                        >
                          {
                            product?.category
                              ?.name
                          }
                        </motion.h2>

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
                            delay:
                              0.36 +
                              index *
                              0.08,
                            duration: 0.5,
                          }}
                          className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.2)] sm:text-[22px] lg:text-[24px]"
                        >
                          {Number(
                            discountPercent,
                          ) > 0
                            ? `Up to ${discountPercent}% Off!`
                            : "Special Offer"}
                        </motion.p>

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
                            delay:
                              0.45 +
                              index *
                              0.08,
                            duration: 0.55,
                            ease: [
                              0.16,
                              1,
                              0.3,
                              1,
                            ],
                          }}
                          whileHover={{
                            scale: 1.035,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() => {
                            if (
                              product?.slug
                            ) {
                              router.push(
                                `/product/${product.slug}/`,
                              );
                            }
                          }}
                          className="mt-auto flex h-[52px] items-center justify-center gap-3 rounded-[13px] bg-white px-7 text-[14px] font-semibold tracking-[-0.01em] text-[#111827] shadow-[0_8px_25px_rgba(0,0,0,0.14)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.20)] sm:h-[56px] sm:px-8 sm:text-[15px]"
                        >
                          <span>
                            Shop now
                          </span>

                          <ArrowRight
                            size={19}
                            strokeWidth={
                              2
                            }
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                },
              )
            ) : (
              <div className="col-span-full flex h-[300px] items-center justify-center rounded-[20px] bg-[#dfe8f0] shadow-[0_8px_30px_rgba(7,26,65,0.08)] sm:h-[360px] lg:h-[390px] xl:h-[420px]">
                <p className="font-medium text-gray-500">
                  No deal available
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR PRODUCTS
      ============================================================ */}

      <section className="relative bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-[#101827] sm:text-[40px] lg:text-[48px]">
              Popular Products
            </h2>

            <p className="mx-auto mt-3 max-w-[430px] text-[14px] leading-6 text-[#5f636b] sm:text-[15px]">
              Dining, living, and desk
              areas serve their
              purposes
              <br className="hidden sm:block" />
              in total harmony of
              style.
            </p>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-[8px] border border-[#e8e8e8] bg-white"
                  >
                    <div className="h-[220px] bg-gray-200 sm:h-[235px] lg:h-[245px]" />

                    <div className="p-4">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                      <div className="mt-2 h-5 w-1/3 rounded bg-gray-200" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : isProductsError ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  refetchProducts()
                }
                className="rounded-full bg-[#071a41] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#102d60]"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-gray-500">
                No products
                available
              </p>
            </div>
          ) : (
            <>
              <div
                ref={
                  scrollContainerRef
                }
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth:
                    "none",
                  msOverflowStyle:
                    "none",
                }}
              >
                {products.map(
                  (
                    product: any,
                    index: number,
                  ) => {
                    const price =
                      Number(
                        product.retail_price ??
                        0,
                      );

                    const mrp =
                      Number(
                        product.retail_mrp ??
                        0,
                      );

                    const image =
                      getProductImage(
                        product,
                      );

                    const isWishlisted =
                      wish[
                      product.id
                      ] || false;

                    return (
                      <div
                        key={
                          product.id ||
                          index
                        }
                        className="group relative min-w-[200px] max-w-[220px] flex-1 snap-start overflow-hidden rounded-[8px] border border-[#e8e8e8] bg-white transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:min-w-[220px] lg:min-w-[240px]"
                      >
                        <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden bg-[#fafafa] sm:h-[220px] lg:h-[240px]">
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover p-1 transition-transform duration-500 group-hover:scale-[1.05] cursor-pointer"
                            onError={(e) => {
                              e.currentTarget.src = "/images/placeholder.png";
                            }}
                            onClick={() => router.push(`/product/${product.slug}/`)}
                          />

                          <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button
                              type="button"
                              aria-label="Add to wishlist"
                              onClick={() =>
                                handleToggleWishlist(
                                  product.id,
                                  product.name,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#68707a] shadow-[0_2px_10px_rgba(0,0,0,0.10)] transition-colors hover:text-[#071A41]"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill={
                                  isWishlisted
                                    ? "#071A41"
                                    : "none"
                                }
                                stroke="currentColor"
                                strokeWidth={
                                  1.8
                                }
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                              </svg>
                            </button>

                          </div>

                          {mrp >
                            price && (
                              <div className="absolute left-3 top-3 rounded-full bg-[#ffc72c] px-2 py-1 text-[10px] font-bold text-black shadow-lg">
                                {Math.round(
                                  ((mrp -
                                    price) /
                                    mrp) *
                                  100,
                                )}
                                % OFF
                              </div>
                            )}
                        </div>

                        <div className="px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
                          <h3 className="min-h-[40px] text-[13px] font-medium leading-[19px] text-[#252b34] sm:text-[14px] line-clamp-2">
                            {
                              product.name
                            }
                          </h3>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-gradient-to-br from-[#9c1f91] via-[#db249c] to-[#6824a8] text-[7px] font-bold text-white">
                              M
                            </span>

                            <span className="text-[11px] text-[#59606a]">
                              Marketplace
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[#161b22] sm:text-[14px]">
                              ₹
                              {price.toLocaleString(
                                "en-IN",
                              )}
                            </span>

                            {mrp >
                              price && (
                                <span className="text-[11px] text-[#85898f] line-through sm:text-[12px]">
                                  ₹
                                  {mrp.toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToCart(
                                product.id,
                                product.name,
                                image,
                                price,
                              )
                            }
                            className="mt-3 w-full rounded-full bg-[#071A41] px-4 py-2.5 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#071A41]"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mt-6 flex justify-center gap-2">
                {products
                  .slice(0, 10)
                  .map(
                    (
                      _: any,
                      index: number,
                    ) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setCurrentIndex(
                            index,
                          )
                        }
                        className={`h-2 rounded-full transition-all duration-300 ${currentIndex ===
                          index
                          ? "w-8 bg-[#071A41]"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                          }`}
                        aria-label={`Go to product ${index + 1
                          }`}
                      />
                    ),
                  )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============================================================
          SHOP BY CATEGORY — TABS
      ============================================================ */}

      <section className="w-full bg-white py-10 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-center gap-6 sm:gap-9">
            {[
              "New Arrivals",
              "Best Seller",
              "Best Offers",
            ].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab,
                    )
                  }
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
                    ${activeTab ===
                      tab
                      ? "text-[#075f5b]"
                      : "text-[#374151] hover:text-[#075f5b]"
                    }
                  `}
                >
                  {tab}

                  {activeTab ===
                    tab && (
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
              ),
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[405px_1fr]">
            {/* ========================================================
                PROMO BANNER
            ======================================================== */}

            {topDiscountedProducts.length >
              0 ? (
              (() => {
                const item =
                  topDiscountedProducts[0];

                const product =
                  item?.product ||
                  item;

                const discounts =
                  item?.discounts;

                const price =
                  Number(
                    discounts?.retail
                      ?.price ||
                    product?.retail_price ||
                    0,
                  );

                const mrp =
                  Number(
                    discounts?.retail
                      ?.mrp ||
                    product?.retail_mrp ||
                    0,
                  );

                const discountPercentage =
                  discounts?.max_discount ??
                  product?.retail_discount_percentage ??
                  product?.retail_discount_value ??
                  0;

                const image =
                  product?.primary_image_url ||
                  product?.images?.find(
                    (img: any) =>
                      img?.is_primary,
                  )?.image_url ||
                  product?.images?.[0]
                    ?.image_url ||
                  "/images/placeholder.png";

                return (
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
                        opacity-80
                        transition-transform
                        duration-700
                        hover:scale-105
                      "
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/placeholder.png";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/80" />

                    <div
                      className="
                        relative
                        z-10
                        flex
                        min-h-[500px]
                        h-full
                        flex-col
                        items-center
                        justify-between
                        px-6
                        py-8
                        text-center
                        sm:min-h-[560px]
                        sm:px-8
                        sm:py-9
                        lg:min-h-[590px]
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[12px]
                            font-medium
                            uppercase
                            tracking-[0.16em]
                            text-white/90
                            sm:text-[13px]
                          "
                        >
                          Limited
                          Time Offer
                        </p>

                        {countdownExpired ? (
                          <div
                            className="
                              mt-4
                              inline-flex
                              items-center
                              rounded-[8px]
                              bg-white
                              px-4
                              py-2
                              text-[14px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-red-600
                              shadow-lg
                            "
                          >
                            Deal Ended
                          </div>
                        ) : (
                          <div
                            className="
                              mt-4
                              inline-flex
                              items-center
                              gap-1
                              rounded-[8px]
                              bg-white
                              px-4
                              py-2
                              font-mono
                              text-[16px]
                              font-bold
                              tracking-[0.08em]
                              text-[#075f5b]
                              shadow-lg
                              sm:text-[18px]
                            "
                          >
                            <span>
                              {formatTime(
                                timeLeft.days,
                              )}
                            </span>

                            <span>
                              :
                            </span>

                            <span>
                              {formatTime(
                                timeLeft.hours,
                              )}
                            </span>

                            <span>
                              :
                            </span>

                            <span>
                              {formatTime(
                                timeLeft.minutes,
                              )}
                            </span>

                            <span>
                              :
                            </span>

                            <span>
                              {formatTime(
                                timeLeft.seconds,
                              )}
                            </span>
                          </div>
                        )}

                        {!countdownExpired && (
                          <div
                            className="
                              mt-1
                              flex
                              justify-center
                              gap-[13px]
                              text-[8px]
                              font-medium
                              uppercase
                              tracking-wide
                              text-white/70
                            "
                          >
                            <span>
                              Days
                            </span>

                            <span>
                              Hours
                            </span>

                            <span>
                              Min
                            </span>

                            <span>
                              Sec
                            </span>
                          </div>
                        )}

                        {discountPercentage >
                          0 && (
                            <div
                              className="
                              mt-4
                              inline-flex
                              items-center
                              rounded-full
                              bg-white
                              px-4
                              py-1.5
                              text-[11px]
                              font-bold
                              uppercase
                              tracking-[0.08em]
                              text-[#075f5b]
                              shadow-md
                            "
                            >
                              Up to{" "}
                              {
                                discountPercentage
                              }
                              % Off
                            </div>
                          )}
                      </div>

                      <div className="w-full max-w-[350px] pb-2">
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
                          {
                            product?.name
                          }
                        </h3>

                        {product?.description && (
                          <p
                            className="
                              mt-3
                              line-clamp-2
                              text-[13px]
                              leading-5
                              text-white/90
                              sm:text-[14px]
                            "
                          >
                            {
                              product.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-center gap-3">
                          {mrp >
                            price && (
                              <span className="text-[14px] font-medium text-white/60 line-through">
                                ₹
                                {mrp.toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            )}

                          <span className="text-[21px] font-bold text-white sm:text-[23px]">
                            ₹
                            {price.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>

                        {product?.category
                          ?.name && (
                            <p className="mt-2 text-[11px] text-white/70">
                              {
                                product
                                  .category
                                  .name
                              }
                            </p>
                          )}

                        <button
                          type="button"
                          disabled={
                            !product?.slug
                          }
                          onClick={() => {
                            if (
                              product?.slug
                            ) {
                              router.push(
                                `/product/${product.slug}/`,
                              );
                            }
                          }}
                          className="
                            mt-5
                            rounded-full
                            bg-white
                            px-7
                            py-2.5
                            text-[13px]
                            font-semibold
                            text-[#071a41]
                            shadow-lg
                            transition-all
                            duration-200
                            hover:bg-[#071a41]
                            hover:text-white
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
                  min-h-[500px]
                  items-center
                  justify-center
                  rounded-[10px]
                  bg-[#f7f7f7]
                  sm:min-h-[560px]
                  lg:min-h-[590px]
                "
              >
                <p className="text-sm font-medium text-[#075f5b]">
                  No offer
                  available
                </p>
              </div>
            )}

            {/* ========================================================
                PRODUCT GRID
            ======================================================== */}

            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-4">
              {(() => {
                let activeProducts: any[] =
                  [];

                let badgeText =
                  "NEW";

                if (
                  activeTab ===
                  "New Arrivals"
                ) {
                  activeProducts =
                    newArrivals;
                  badgeText =
                    "NEW";
                } else if (
                  activeTab ===
                  "Best Seller"
                ) {
                  activeProducts =
                    bestSellers;
                  badgeText =
                    "BESTSELLER";
                } else {
                  activeProducts =
                    bestOffers;
                  badgeText =
                    "OFFER";
                }

                if (isFetching) {
                  return (
                    <div
                      className="
                        col-span-2
                        flex
                        min-h-[400px]
                        items-center
                        justify-center
                        md:col-span-4
                      "
                    >
                      <p className="text-lg font-semibold text-[#075f5b]">
                        Loading
                        products...
                      </p>
                    </div>
                  );
                }

                if (isError) {
                  return (
                    <div
                      className="
                        col-span-2
                        flex
                        min-h-[400px]
                        flex-col
                        items-center
                        justify-center
                        md:col-span-4
                      "
                    >
                      <p className="text-lg font-semibold text-red-500">
                        Failed to load
                        products
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          window.location.reload()
                        }
                        className="mt-4 rounded-full bg-[#075f5b] px-6 py-2 text-white"
                      >
                        Retry
                      </button>
                    </div>
                  );
                }

                if (
                  activeProducts.length ===
                  0
                ) {
                  return (
                    <div
                      className="
                        col-span-2
                        flex
                        min-h-[400px]
                        items-center
                        justify-center
                        md:col-span-4
                      "
                    >
                      <p className="text-lg font-semibold text-[#555b63]">
                        No products
                        available
                      </p>
                    </div>
                  );
                }

                return activeProducts.map(
                  (
                    product: any,
                    index: number,
                  ) => {
                    const price =
                      Number(
                        product.current_price ??
                        product.retail_price ??
                        0,
                      );

                    const mrp =
                      Number(
                        product.original_price ??
                        product.retail_mrp ??
                        0,
                      );

                    const image =
                      product.primary_image_url ||
                      product.images?.[0]
                        ?.image_url ||
                      "/images/placeholder.png";

                    const rating =
                      product
                        .reviews_summary
                        ?.average_rating ??
                      0;

                    const reviews =
                      product
                        .reviews_summary
                        ?.total_reviews ??
                      0;

                    const isWishlisted =
                      wish[
                      product.id
                      ] || false;

                    return (
                      <div
                        key={`${product.id}-${index}`}
                        className="
                          group
                          relative
                          min-w-0
                          w-full
                          self-start
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
                        <div
                          className="
                            relative
                            flex
                            h-[190px]
                            w-full
                            items-center
                            justify-center
                            overflow-hidden
                            bg-[#fafafa]
                            px-1
                            pt-1
                            sm:h-[210px]
                            md:h-[190px]
                          "
                        >
                          <img
                            src={image}
                            alt={product.name}
                            loading={index < 4 ? "eager" : "lazy"}
                            className="
    h-full
    w-full
    rounded-xl
    object-cover
    transition-transform
    duration-500
    group-hover:scale-[1.06]
    cursor-pointer
  "
                            onError={(e) => {
                              e.currentTarget.src = "/images/placeholder.png";
                            }}
                            onClick={() => {
                              if (product?.slug) {
                                router.push(`/product/${product.slug}/`);
                              }
                            }}
                          />

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
                            {
                              badgeText
                            }
                          </span>

                          <button
                            type="button"
                            aria-label={`Add ${product.name} to wishlist`}
                            onClick={() =>
                              handleToggleWishlist(
                                product.id,
                                product.name,
                              )
                            }
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
                              fill={
                                isWishlisted
                                  ? "#075f5b"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth={
                                1.8
                              }
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div
                          className="
                            px-3.5
                            pb-3.5
                            pt-3
                            sm:px-4
                            sm:pb-4
                          "
                        >
                          <h3
                            className="
                              min-h-[38px]
                              overflow-hidden
                              text-[12px]
                              font-medium
                              leading-[17px]
                              text-[#30353d]
                              line-clamp-2
                              sm:text-[13px]
                            "
                          >
                            {
                              product.name
                            }
                          </h3>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-[1px]">
                              {[
                                1,
                                2,
                                3,
                                4,
                                5,
                              ].map(
                                (
                                  star,
                                ) => (
                                  <svg
                                    key={
                                      star
                                    }
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="h-[11px] w-[11px] fill-[#f4c542]"
                                  >
                                    <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-.94 6.49-.94L12 2.5z" />
                                  </svg>
                                ),
                              )}
                            </div>

                            <span className="text-[10px] text-[#777c83]">
                              {Number(
                                rating,
                              ).toFixed(
                                1,
                              )}{" "}
                              (
                              {
                                reviews
                              }
                              )
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[14px] font-bold text-[#171b20] sm:text-[15px]">
                              ₹
                              {price.toLocaleString(
                                "en-IN",
                              )}
                            </span>

                            {mrp >
                              price && (
                                <span className="text-[10px] text-[#85888c] line-through sm:text-[11px]">
                                  ₹
                                  {mrp.toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddToCart(
                                product.id,
                                product.name,
                                image,
                                price,
                              )
                            }
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
                            Add to
                            Cart
                          </button>
                        </div>
                      </div>
                    );
                  },
                );
              })()}
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          LIFESTYLE BANNER
      ============================================================ */}
      <section className="w-full bg-[#11101f]">
        {/* ============================================================
    HOME SECOND BANNER — API CONTENT
============================================================ */}

        {(() => {
          const secondBannerContent = apiResponse?.data?.find(
            (item: any) =>
              item.slug === "home-page-second-banner"
          );

          const secondBannerBlock =
            secondBannerContent?.blocks?.[0];

          const secondBannerImage =
            secondBannerBlock?.images?.find(
              (image: any) => image?.is_primary
            )?.url ||
            secondBannerBlock?.images?.[0]?.url ||
            "/indiekonnect-web/images/prod.png";

          return (
            <section className="w-full bg-[#11101f]">
              <div className="relative mx-auto min-h-[520px] w-full max-w-[1900px] overflow-hidden">

                {/* Background Image */}
                <img
                  src={secondBannerImage}
                  alt={
                    secondBannerBlock?.images?.find(
                      (image: any) => image?.is_primary
                    )?.alt_text ||
                    secondBannerContent?.title ||
                    "Premium Lifestyle"
                  }
                  className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
                  onError={(e) => {
                    e.currentTarget.src =
                      "/indiekonnect-web/images/prod.png";
                  }}
                />

                {/* Overlay */}
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
                <div className="relative z-10 flex min-h-[620px] items-center">
                  <div className="w-full max-w-[620px] px-7 py-16 sm:px-12 md:px-16 lg:ml-[5%] lg:px-0">

                    {/* Heading */}
                    {secondBannerBlock?.heading && (
                      <div
                        className="
                  mb-5
                  text-[14px]
                  font-medium
                  tracking-wide
                  text-white/85
                  sm:text-[16px]

                  [&>h1]:m-0
                  [&>h2]:m-0
                  [&>h3]:m-0
                  [&>p]:m-0

                  [&>h1]:font-medium
                  [&>h2]:font-medium
                  [&>h3]:font-medium
                  [&>p]:font-medium

                  [&>h1]:text-[14px]
                  [&>h2]:text-[14px]
                  [&>h3]:text-[14px]
                  [&>p]:text-[14px]

                  sm:[&>h1]:text-[16px]
                  sm:[&>h2]:text-[16px]
                  sm:[&>h3]:text-[16px]
                  sm:[&>p]:text-[16px]
                "
                        dangerouslySetInnerHTML={{
                          __html:
                            secondBannerBlock.heading,
                        }}
                      />
                    )}

                    {/* Main Description */}
                    {secondBannerBlock?.short_description && (
                      <div
                        className="
                  max-w-[650px]
                  text-white

                  [&>h1]:m-0
                  [&>h2]:m-0
                  [&>h3]:m-0
                  [&>p]:m-0

                  [&>h1]:text-[42px]
                  [&>h1]:font-semibold
                  [&>h1]:leading-[1.08]
                  [&>h1]:tracking-[-0.035em]

                  [&>h2]:text-[42px]
                  [&>h2]:font-semibold
                  [&>h2]:leading-[1.08]
                  [&>h2]:tracking-[-0.035em]

                  [&>h3]:text-[42px]
                  [&>h3]:font-semibold
                  [&>h3]:leading-[1.08]
                  [&>h3]:tracking-[-0.035em]

                  [&>p]:text-[42px]
                  [&>p]:font-semibold
                  [&>p]:leading-[1.08]
                  [&>p]:tracking-[-0.035em]

                  sm:[&>h1]:text-[52px]
                  sm:[&>h2]:text-[52px]
                  sm:[&>h3]:text-[52px]
                  sm:[&>p]:text-[52px]

                  md:[&>h1]:text-[60px]
                  md:[&>h2]:text-[60px]
                  md:[&>h3]:text-[60px]
                  md:[&>p]:text-[60px]

                  lg:[&>h1]:text-[68px]
                  lg:[&>h2]:text-[68px]
                  lg:[&>h3]:text-[68px]
                  lg:[&>p]:text-[68px]

                  xl:[&>h1]:text-[72px]
                  xl:[&>h2]:text-[72px]
                  xl:[&>h3]:text-[72px]
                  xl:[&>p]:text-[72px]
                "
                        dangerouslySetInnerHTML={{
                          __html:
                            secondBannerBlock.short_description,
                        }}
                      />
                    )}

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/products")
                      }
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

                      <span className="text-[20px] leading-none">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
      </section>

      {/* ============================================================
          REELS
      ============================================================ */}
      <motion.section
        className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.08,
        }}
        variants={staggerContainer}
      >
        {/* ============================================================
      CONTAINER
  ============================================================ */}

        <div className="relative mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-12 xl:px-14">

          <motion.div
            variants={fadeInUp}
            className="mb-8 flex flex-col items-center text-center sm:mb-10 lg:mb-12"
          >
            <h2 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-[#101827] sm:text-[40px] lg:text-[48px]">
              Shop the Reels
            </h2>

            <p className="mt-4 max-w-[620px] text-[14px] leading-6 text-[#62656b] sm:text-[15px]">
              Discover how creators style their favourite pieces.
              <br className="hidden sm:block" />
              Tap any reel to explore and shop the look.
            </p>
          </motion.div>

          {isReelsLoading ? (
            <div className="flex gap-5 overflow-hidden pb-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[400px] w-[240px] flex-shrink-0 animate-pulse rounded-[20px] sm:h-[460px] sm:w-[260px]"
                />
              ))}
            </div>
          ) : reelsError ? (
            /* ============================================================
                ERROR STATE
            ============================================================ */

            <motion.div
              variants={fadeInUp}
              className="flex min-h-[360px] items-center justify-center rounded-[30px] border border-[#e9e1d4] bg-white/80"
            >
              <div className="px-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#e6d6b7] bg-[#fffaf0] text-xl font-semibold text-[#c3922e]">
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
              {/* ============================================================
            REELS RAIL - CENTERED
        ============================================================ */}

              <div
                ref={rail}
                className="flex justify-center gap-4 overflow-x-auto overflow-y-hidden pb-7 pt-4 snap-x snap-mandatory scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {(reelsData?.data || []).map(
                  (r: any, index: number) => {
                    /* ----------------------------------------------------
                       PRODUCT DATA
                    ---------------------------------------------------- */

                    const product = r?.product;

                    const productSlug = product?.slug;

                    const productName =
                      product?.name || "Featured product";

                    const productImage =
                      getProductImage(product);

                    const productPrice =
                      getProductPrice(product);

                    /* ----------------------------------------------------
                       VIDEO DATA
                    ---------------------------------------------------- */

                    const videoUrl =
                      r?.video_full_path ||
                      r?.video_full_url ||
                      r?.video_url ||
                      r?.video_path;

                    const thumbnailUrl =
                      r?.thumbnail_url ||
                      productImage;

                    /* ----------------------------------------------------
                       SHOP HANDLER
                    ---------------------------------------------------- */

                    const handleShopClick = (
                      e: React.MouseEvent<HTMLButtonElement>,
                    ) => {
                      e.stopPropagation();

                      if (productSlug) {
                        router.push(
                          `/product/${productSlug}/`,
                        );
                      }
                    };

                    return (
                      <motion.div
                        key={
                          r?.id ||
                          `${productName}-${index}`
                        }
                        variants={scaleIn}
                        className={`
                    group
                    relative
                    flex-shrink-0
                    snap-start
                    overflow-hidden
                    rounded-[16px]
                    bg-white
                    shadow-[0_8px_40px_rgba(0,0,0,0.08)]
                    border border-[#f0ebe4]
                  `}
                        style={{
                          width:
                            "clamp(210px, 20vw, 280px)",
                          height:
                            "clamp(380px, 40vw, 480px)",
                        }}
                        whileHover={{
                          y: -6,
                          scale: 1.015,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        }}
                      >
                        {/* ==================================================
                      IMAGE / VIDEO
                  ================================================== */}

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
                                  e.currentTarget
                                    .play()
                                    .catch(() => { });
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.pause();
                                }}
                                onPlay={(e) => {
                                  // Hide play button when video plays
                                  const playBtn = e.currentTarget.parentElement?.querySelector('.play-button');
                                  if (playBtn) {
                                    playBtn.classList.add('opacity-0', 'scale-75');
                                  }
                                }}
                                onPause={(e) => {
                                  // Show play button when video pauses
                                  const playBtn = e.currentTarget.parentElement?.querySelector('.play-button');
                                  if (playBtn) {
                                    playBtn.classList.remove('opacity-0', 'scale-75');
                                  }
                                }}
                              />

                              {/* PLAY BUTTON - hides when video plays */}
                              <div className="play-button pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-300">
                                <svg
                                  className="ml-1 h-5 w-5 fill-white"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <img
                              src={thumbnailUrl}
                              alt={
                                r?.title ||
                                "Creator reel"
                              }
                              className="block h-full w-full object-cover"
                            />
                          )}

                          {/* BOTTOM OVERLAY */}

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* ==================================================
                      REEL TITLE
                  ================================================== */}

                        <div className="absolute bottom-[88px] left-4 right-4 z-20">
                          <div className="line-clamp-2 font-serif text-[16px] font-medium leading-[1.2] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,.5)]">
                            {r?.title ||
                              r?.caption ||
                              "Featured look"}
                          </div>
                        </div>

                        {/* ==================================================
                      PRODUCT CARD - WHITE
                  ================================================== */}

                        <div className="absolute bottom-3 left-3 right-3 z-40">
                          <div className="flex items-center gap-2.5 rounded-[14px] bg-white/95 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/20">
                            {/* PRODUCT IMAGE */}

                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] bg-gray-100">
                              <img
                                src={thumbnailUrl}
                                alt={productName}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* PRODUCT INFO */}

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-semibold text-[#1a1a1a]">
                                {productName}
                              </div>

                              <div className="mt-0.5 text-[12px] font-bold text-[#d6a541]">
                                {productPrice}
                              </div>
                            </div>

                            {/* SHOP BUTTON */}

                            <motion.button
                              type="button"
                              onClick={handleShopClick}
                              whileHover={{
                                scale: 1.05,
                              }}
                              whileTap={{
                                scale: 0.94,
                              }}
                              className="flex h-9 min-w-[64px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[#142747] px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#142746]"
                            >
                              Shop
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  },
                )}
              </div>

              {/* ============================================================
            EMPTY STATE
        ============================================================ */}

              {(reelsData?.data || []).length === 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex min-h-[300px] items-center justify-center rounded-[30px] border border-[#e9e1d4] bg-white/70"
                >
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff8e9] text-[#c3922e]">
                      ✦
                    </div>

                    <h3 className="mt-4 font-serif text-xl text-[#142747]">
                      No reels available
                    </h3>

                    <p className="mt-2 text-sm text-[#858894]">
                      New creator looks are coming soon.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ============================================================
            DOTS & NAVIGATION BUTTONS - MOVED UP
        ============================================================ */}

              {(reelsData?.data || []).length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  {/* DOTS - Centered */}
                  <div className="flex-1"></div>

                  <div className="flex items-center justify-center gap-2">
                    {(reelsData?.data || [])
                      .slice(0, 6)
                      .map(
                        (_: any, index: number) => (
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
                                  opacity: 0.4,
                                }
                            }
                            transition={{
                              duration: 0.35,
                            }}
                            className="h-[6px] rounded-full bg-[#071a41]"
                          />
                        ),
                      )}
                  </div>

                  <div className="flex-1 flex justify-end">
                    {/* PREVIOUS BUTTON - Smaller */}
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
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c4] bg-white text-[#142747] shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#c79a42] hover:bg-[#142747] hover:text-white"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M15 18l-6-6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>

                    {/* NEXT BUTTON - Smaller */}
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
                      className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#c79a42] bg-[#142747] text-white shadow-[0_4px_15px_rgba(20,39,71,0.12)] transition-all duration-300 hover:bg-[#1b3155]"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M9 18l6-6-6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.section>
      {/* ============================================================
          GROWTH LADDER
      ============================================================ */}

      <motion.section
        className={s.sectionPremium}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.1,
        }}
        variants={staggerContainer}
      >
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            variants={fadeInUp}
          >
            <div
              className={
                s.sectionHeaderLeft
              }
            >
              <div
                className={`${s.kicker} font-serif`}
              >
                <span
                  className={
                    s.kickerLine
                  }
                />
                Opportunity
              </div>

              <h2
                className={`${s.sectionTitle} font-serif`}
              >
                {growthTitle}
              </h2>
            </div>

            {growthSteps.length >
              1 && (
                <div
                  className={
                    s.levelControls
                  }
                >
                  <motion.button
                    type="button"
                    onClick={
                      handlePreviousLevel
                    }
                    className={
                      s.arrowBtn
                    }
                    aria-label="Previous growth level"
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
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
                    onClick={
                      handleNextLevel
                    }
                    className={
                      s.arrowBtn
                    }
                    aria-label="Next growth level"
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
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

          {isGrowthStepsLoading ? (
            <motion.div
              className={
                s.levelsContainer
              }
              variants={
                staggerContainer
              }
            >
              <motion.div
                className={
                  s.levelCard
                }
                variants={
                  scaleIn
                }
              >
                <p
                  className={`${s.levelBody} font-serif`}
                >
                  Loading growth
                  levels...
                </p>
              </motion.div>
            </motion.div>
          ) : growthSteps.length ===
            0 ? (
            <motion.div
              className={
                s.levelsContainer
              }
              variants={
                staggerContainer
              }
            >
              <motion.div
                className={
                  s.levelCard
                }
                variants={
                  scaleIn
                }
              >
                <p
                  className={`${s.levelBody} font-serif`}
                >
                  No growth
                  levels
                  available.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <motion.div
                className={
                  s.levelsContainer
                }
                variants={
                  staggerContainer
                }
              >
                {growthSteps.map(
                  (
                    step: any,
                    i: number,
                  ) => (
                    <motion.div
                      key={`${step.order}-${step.number}`}
                      onClick={() =>
                        setLevel(
                          i,
                        )
                      }
                      className={`${s.levelCard} ${activeLevel ===
                        i
                        ? s.active
                        : ""
                        }`}
                      variants={
                        scaleIn
                      }
                      whileHover={{
                        y: -4,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                      }}
                    >
                      <motion.div
                        className={`${s.levelNum} font-serif`}
                        animate={
                          activeLevel ===
                            i
                            ? {
                              scale: [
                                1,
                                1.08,
                                1,
                              ],
                            }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat:
                            Infinity,
                        }}
                      >
                        {
                          step.number
                        }
                      </motion.div>

                      <div
                        className={`${s.levelTitle} font-serif ${activeLevel ===
                          i
                          ? s.active
                          : ""
                          }`}
                      >
                        {
                          step.subtitle
                        }
                      </div>

                      <p
                        className={`${s.levelBody} font-serif`}
                      >
                        {
                          step.description
                        }
                      </p>
                    </motion.div>
                  ),
                )}
              </motion.div>

              {growthSteps.length >
                4 && (
                  <motion.div
                    className={
                      s.levelIndicator
                    }
                    variants={
                      fadeInUp
                    }
                  >
                    {growthSteps.map(
                      (
                        step: any,
                        i: number,
                      ) => (
                        <motion.button
                          key={
                            step.order
                          }
                          type="button"
                          onClick={() =>
                            setLevel(
                              i,
                            )
                          }
                          className={`${s.levelIndicatorDot} ${activeLevel ===
                            i
                            ? s.active
                            : ""
                            }`}
                          whileHover={{
                            scale: 1.2,
                          }}
                          whileTap={{
                            scale: 0.8,
                          }}
                          aria-label={`Go to ${step.subtitle}`}
                        />
                      ),
                    )}
                  </motion.div>
                )}
            </>
          )}
        </div>
      </motion.section>
      {/* ============================================================
          CART SIDEBAR
      ============================================================ */}

      {cartSidebarOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={handleCloseCart}
        >
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl font-serif overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#071a41] tracking-wide">
                Shopping Bag <span className="font-normal text-gray-400">({cartItems.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseCart}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#071a41] transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* Empty State */}
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-[#071a41]/5 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-[#071a41]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 mb-2">Your bag is empty</p>
                <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet</p>
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
                {/* Items List */}
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
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCart(item.id, item.product_id, "decrement")
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
                              handleUpdateCart(item.id, item.product_id, "increment")
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

                {/* Footer */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 pt-4 pb-6 space-y-3">
                  <div className="flex items-center justify-between text-lg font-semibold text-[#071a41]">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/checkout")}
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

      {/* ============================================================
          FOOTER
      ============================================================ */}

      <Footer />
    </div>
  );
}