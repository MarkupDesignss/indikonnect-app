"use client";


import s from "@/features/storefront/components/IndieKonnectHome.module.css";

import { ripple, flyToCart, bumpBadge, heartPop } from "@/features/storefront/components/interactions";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useRouter } from "next/navigation";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/common/Header";

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

import {
  useGetProductsQuery,
  useCheckProductStockMutation,
} from "@/lib/redux/api/productApi";

import { useGetBrandsQuery } from "@/lib/redux/api/brandsApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

import ShopReelsRow from "@/features/storefront/components/ShopReel";
import TestimonialsSection from "@/features/storefront/components/Testimonialssection";
import ReviewCarousel from "@/features/storefront/components/ReviewCarousel";

import WatchesBanner from "@/features/storefront/components/WatchesBanner";

import PurchaseTrustBar from "@/features/storefront/components/PurchaseTrustBar";

import MostFollowedReel from "@/features/storefront/components/MostFollowedReel";
import TrendingProductsSection from "@/features/storefront/components/TrendingProductsSection";
import NewArrivalsSection from "@/features/storefront/components/NewArrivalsSection";
import ShopByCategory from "@/features/storefront/components/ShopByCategory";
import Loding from "@/components/common/Loding";
import { fadeInUp, getPromoPlaceholderImage, isPurchaseAllowedWithoutStock, railGapClass, sectionContainerClass, staggerContainer } from "@/features/storefront/components/Home.parts/support";
import { ProductCard } from "@/features/storefront/components/Home.parts/ProductCard";
import { DealBanner } from "@/features/storefront/components/Home.parts/DealBanner";
import { LifestyleBanner } from "@/features/storefront/components/Home.parts/LifestyleBanner";


export const productCardWidthClass =
  "w-[calc(50%_-_6px)] sm:w-[calc(33.333%_-_10.667px)] md:w-[calc(33.333%_-_13.333px)] lg:w-[calc(16.666%_-_20px)]";

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

  // Look up stock-bypass flags in all product sources displayed on Home.
  // Default to normal stock checks when the field is absent.
  const findHomeProduct = (id: number): any => {
    const sources = [
      ...(Array.isArray(products) ? products : []),
      ...(Array.isArray(bestSellers) ? bestSellers : []),
      ...(Array.isArray(bestOffers) ? bestOffers : []),
      ...(Array.isArray(dealProducts) ? dealProducts : []),
    ];
    return sources
      .map((row: any) => row?.product ?? row)
      .find((row: any) => Number(row?.id) === id);
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
      if (!isPurchaseAllowedWithoutStock(findHomeProduct(id))) {
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
      if (
        action === "increment" &&
        !isPurchaseAllowedWithoutStock(findHomeProduct(Number(productId)))
      ) {
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
        <Loding />
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
    HERO BANNER - FULL WIDTH + FIXED HEIGHT
================================================= */}

      <section
        className="
    relative
    left-1/2
    isolate
    flow-root
    w-screen
    max-w-none
    -translate-x-1/2
    overflow-hidden
    bg-white
  "
      >
        {/* BANNER WRAPPER */}
        <div
          className="
    relative
    w-full
    aspect-[16/7]
    sm:aspect-[1920/550]
    lg:aspect-[1920/650]
  "
        >
          <AnimatePresence initial={false}>
            {heroSlides.map((slide: any, index: number) => {
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
                  className="
              absolute
              inset-0
              h-full
              w-full
              overflow-hidden
            "
                  style={{ zIndex: isActive ? 20 : 10 }}
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
                bg-white
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
                    object-center
                  "
                      />
                    ) : (
                      <img
                        src={slide.image || getPromoPlaceholderImage()}
                        alt={slide.alt || "Promotional banner"}
                        draggable={false}
                        loading={isActive ? "eager" : "lazy"}
                        className="
                    absolute
                    inset-0
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

          {/* PREVIOUS / NEXT BUTTONS */}
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
            left-3
            top-1/2
            z-30
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-[#111827]
            shadow-lg
            transition
            hover:scale-105
            lg:flex
            xl:left-5
          "
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                aria-label="Next banner"
                onClick={() =>
                  setHeroIndex((heroIndex + 1) % heroSlides.length)
                }
                className="
            absolute
            right-3
            top-1/2
            z-30
            hidden
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-[#111827]
            shadow-lg
            transition
            hover:scale-105
            lg:flex
            xl:right-5
          "
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}
        </div>

        {/* SLIDER DOTS */}
        {heroSlides.length > 1 && (
          <div className="flex w-full items-center justify-center gap-1.5 py-2 sm:py-3">
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
            ${index === heroIndex ? "w-7 bg-[#071a41]" : "w-[5px] bg-[#cfd3d7]"}
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
            NEW ARRIVALS / BRANDS
        ================================================= */}

        <NewArrivalsSection
          brandsData={brandsData}
          isBrandsLoading={isBrandsLoading}
        />

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
            OTHER SECTIONS
        ================================================= */}

        <div className="relative isolate flow-root w-full">
          <TestimonialsSection />
        </div>

        <div className="relative isolate flow-root w-full">
          <ReviewCarousel />
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
