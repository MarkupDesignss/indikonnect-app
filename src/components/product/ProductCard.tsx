"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { showToast } from "../../lib/slices/toastSlice";
import { useTokenCheck } from "@/hooks/useTokenCheck";

import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import { useGetProductsByCategoryQuery } from "@/lib/redux/api/productApi";

import Fallback from "../../../public/indiekonnect-web/images/test.jpg";
import { getAppType } from "@/lib/appConfig";

/* =========================================================
   TYPES
========================================================= */

interface ProductImage {
  id?: number;
  image_url?: string;
  url?: string;
  is_primary?: boolean;
  sort_order?: number;
}

interface Product {
  id: number | string;
  name?: string;
  slug?: string | null;
  brandName?: string;
  brand_name?: string;
  brand_logo?: string;
  retail_mrp?: string | number | null;
  retail_price?: string | number | null;
  distributor_mrp?: string | number | null;
  distributor_price?: string | number | null;
  effective_price?: string | number | null;
  effective_mrp?: string | number | null;
  retail_discount_percentage?: string | number | null;
  stock_quantity?: string | number | null;
  stockQuantity?: string | number | null;
  low_stock_threshold?: string | number | null;
  lowStockThreshold?: string | number | null;
  stock_status?: string | null;
  stockStatus?: string | null;
  is_wishlisted?: boolean;
  isWishlisted?: boolean;
  is_trending?: boolean;
  is_deal_of_the_day?: boolean;
  is_active_deal?: boolean;
  sale_type?: string;
  description?: string | null;
  short_description?: string | null;
  reviews_summary?: {
    average_rating?: string | number | null;
    total_reviews?: string | number | null;
  };
  images?: ProductImage[] | string[];
  primary_image_url?: string | null;
  category?: { id?: number; name?: string; slug?: string };
  subcategory?: { id?: number; name?: string; slug?: string };
  brand?: string;
  price?: string | number | null;
  originalPrice?: string | number | null;
  discount?: string | number | null;
  image?: string;
  rating?: string | number | null;
  reviews?: string | number | null;
  inStock?: boolean;
  badge?: string;
  peopleBoughtThisWeek?: number;
  people_bought_this_week?: number;
  category_id?: number;
  categoryId?: number;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  hasToken?: boolean;
}

/* =========================================================
   HELPERS
========================================================= */

const PLACEHOLDER = "/indiekonnect-web/images/placeholder.jpg";

const num = (value: unknown): number => {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value: unknown): string => {
  return num(value).toLocaleString("en-IN");
};

const normalizeImageUrl = (value?: string | null): string => {
  if (!value) return "";
  let url = String(value).trim();
  if (!url) return "";
  url = url.replace(/\\/g, "");
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }
  return url;
};

const generateSlugFromName = (name: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getProductSlug = (product: Product): string => {
  const rawSlug = product?.slug;
  if (typeof rawSlug === "string") {
    const slug = rawSlug.trim();
    if (
      slug &&
      slug !== "[object Object]" &&
      slug !== "undefined" &&
      slug !== "null"
    ) {
      return slug;
    }
  }
  const possibleNestedSlugs = [
    product?.product?.slug,
    product?.data?.slug,
    product?.product_data?.slug,
    product?.product_details?.slug,
  ];
  for (const value of possibleNestedSlugs) {
    if (typeof value === "string") {
      const slug = value.trim();
      if (
        slug &&
        slug !== "[object Object]" &&
        slug !== "undefined" &&
        slug !== "null"
      ) {
        return slug;
      }
    }
  }
  if (
    product?.id !== undefined &&
    product?.id !== null &&
    String(product.id).trim()
  ) {
    return String(product.id).trim();
  }
  return "";
};

/* =========================================================
   PRODUCT CARD
========================================================= */

export default function ProductCard({
  product,
  hasToken: hasTokenProp,
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { hasToken: hasTokenHook, appType } = useTokenCheck();

  const hasToken = hasTokenProp ?? hasTokenHook;

  /* =======================================================
     APP TYPE
  ======================================================= */

  const currentAppType = useMemo(() => {
    if (typeof window !== "undefined") return getAppType();
    return appType;
  }, [appType]);

  const isDistributor = currentAppType === "distributor";
  const placeholder = Fallback;

  /* =======================================================
     STATE
  ======================================================= */

  const [imageIndex, setImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(
    Boolean(product?.is_wishlisted ?? product?.isWishlisted),
  );

  const [showSimilarDrawer, setShowSimilarDrawer] = useState(false);

  /* =======================================================
     DRAG STATE
  ======================================================= */

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const hasMoved = useRef(false);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* =======================================================
     API
  ======================================================= */

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData, refetch: refetchWishlist } = useGetWishlistQuery(
    undefined,
    { skip: hasToken !== true },
  );

  const categoryId = useMemo(() => {
    const value =
      product?.category_id ??
      product?.categoryId ??
      (typeof product?.category === "object" ? product?.category?.id : null);

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [product?.category_id, product?.categoryId, product?.category]);

  const {
    data: categoryProductsData,
    isLoading: isSimilarLoading,
    isFetching: isSimilarFetching,
    refetch: refetchSimilarProducts,
  } = useGetProductsByCategoryQuery(categoryId as number, {
    skip: !categoryId || !showSimilarDrawer,
  });

  const similarApiList = useMemo(() => {
    const raw = categoryProductsData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.products)) return raw.products;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data?.products)) return raw.data.products;
    if (Array.isArray(raw?.data?.items)) return raw.data.items;
    return [];
  }, [categoryProductsData]);

  /* =======================================================
     WISHLIST SYNC
  ======================================================= */

  useEffect(() => {
    if (hasToken !== true) {
      setWishlisted(Boolean(product?.is_wishlisted ?? product?.isWishlisted));
      return;
    }
    if (wishlistData?.data) {
      const exists = wishlistData.data.some(
        (item: any) => Number(item?.product_id) === Number(product?.id),
      );
      setWishlisted(exists);
    }
  }, [
    wishlistData,
    product?.id,
    product?.is_wishlisted,
    product?.isWishlisted,
    hasToken,
  ]);

  /* =======================================================
     RESET IMAGE ON PRODUCT CHANGE
  ======================================================= */

  useEffect(() => {
    setImageIndex(0);
    setImageLoaded(false);
    setDragX(0);
  }, [product?.id]);

  /* =======================================================
     LOCK PAGE SCROLL WHILE DRAWER IS OPEN
  ======================================================= */

  useEffect(() => {
    if (!showSimilarDrawer || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [showSimilarDrawer]);

  /* =======================================================
     ESC KEY CLOSE DRAWER
  ======================================================= */

  useEffect(() => {
    if (!showSimilarDrawer) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSimilarDrawer(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSimilarDrawer]);

  /* =======================================================
     BASIC DATA
  ======================================================= */

  const brandName =
    product?.brandName?.trim() ||
    product?.brand_name?.trim() ||
    product?.brand?.trim() ||
    "";

  const productName = product?.name?.trim() || "Product";

  const productSlug = useMemo(() => getProductSlug(product), [product]);

  const productUrl = useMemo(() => {
    if (!productSlug) return `/products`;
    return `/product/${encodeURIComponent(productSlug)}`;
  }, [productSlug]);

  const shortDescription = useMemo(() => {
    const desc =
      product?.description?.trim() || product?.short_description?.trim() || "";
    if (!desc) return "";
    return desc.replace(/<[^>]*>/g, "").trim();
  }, [product?.description, product?.short_description]);

  /* =======================================================
     PRICE
  ======================================================= */

  const price = isDistributor
    ? num(
      product?.distributor_price ??
      product?.effective_price ??
      product?.retail_price ??
      product?.price,
    )
    : num(product?.retail_price ?? product?.effective_price ?? product?.price);

  const mrp = isDistributor
    ? num(
      product?.distributor_mrp ??
      product?.effective_mrp ??
      product?.retail_mrp ??
      product?.originalPrice,
    )
    : num(
      product?.retail_mrp ?? product?.effective_mrp ?? product?.originalPrice,
    );

  const discountFromApi = num(product?.retail_discount_percentage);
  const calculatedDiscount =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const discount = discountFromApi > 0 ? discountFromApi : calculatedDiscount;

  /* =======================================================
     STOCK
  ======================================================= */

  const stockQuantity = num(product?.stock_quantity ?? product?.stockQuantity);
  const lowStockThreshold = num(
    product?.low_stock_threshold ?? product?.lowStockThreshold,
  );
  const rawStatus = String(
    product?.stock_status ?? product?.stockStatus ?? "",
  ).toLowerCase();

  let inStock = true;
  if (typeof product?.inStock === "boolean") {
    inStock = product.inStock;
  } else if (rawStatus) {
    inStock =
      (rawStatus === "active" || rawStatus === "low_stock") &&
      stockQuantity > 0;
  } else if (stockQuantity > 0) {
    inStock = true;
  } else if (product?.stock_quantity !== undefined) {
    inStock = stockQuantity > 0;
  }

  const isOutOfStock = !inStock;

  const lowStock =
    inStock &&
    stockQuantity > 0 &&
    (rawStatus === "low_stock" ||
      (lowStockThreshold > 0 && stockQuantity <= lowStockThreshold));

  /* =======================================================
     RATING
  ======================================================= */

  const rating =
    num(product?.reviews_summary?.average_rating) || num(product?.rating);
  const reviewCount =
    num(product?.reviews_summary?.total_reviews) || num(product?.reviews);

  /* =======================================================
     IMAGES
  ======================================================= */

  const images = useMemo(() => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0 &&
      typeof product.images[0] === "string"
    ) {
      const cleaned = (product.images as string[])
        .map((url) => normalizeImageUrl(url))
        .filter((url) => url.length > 0);
      if (cleaned.length > 0) return cleaned;
    }

    const list = Array.isArray(product?.images) ? product.images : [];

    const extracted = list
      .map((item: any) => {
        if (typeof item === "string") {
          return { url: normalizeImageUrl(item), primary: false, sortOrder: 0 };
        }
        return {
          url: normalizeImageUrl(item?.image_url || item?.url),
          primary: Boolean(item?.is_primary),
          sortOrder: num(item?.sort_order),
        };
      })
      .filter((item) => item.url.length > 0)
      .sort((a, b) => {
        if (a.primary && !b.primary) return -1;
        if (!a.primary && b.primary) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .map((item) => item.url);

    if (extracted.length) return extracted;

    const primary = normalizeImageUrl(product?.primary_image_url);
    if (primary) return [primary];

    const oldImage = normalizeImageUrl(product?.image);
    if (oldImage) return [oldImage];

    return [placeholder.src];
  }, [
    product?.images,
    product?.primary_image_url,
    product?.image,
    placeholder.src,
  ]);

  const totalImages = images.length;

  /* =======================================================
     SIMILAR PRODUCTS
  ======================================================= */

  const similarProducts = useMemo(() => {
    if (similarApiList.length === 0) return [];

    const distributor = isDistributor;

    return similarApiList
      .filter((p: any) => String(p.id) !== String(product?.id))
      .slice(0, 30)
      .map((p: any) => {
        const pPrice = distributor
          ? num(p?.distributor_price ?? p?.retail_price ?? 0)
          : num(p?.retail_price ?? 0);

        const pMrp = distributor
          ? num(p?.distributor_mrp ?? p?.retail_mrp ?? 0)
          : num(p?.retail_mrp ?? 0);

        const primaryImg =
          p?.images?.find((img: any) => img?.is_primary)?.image_url ||
          p?.primary_image_url ||
          p?.images?.[0]?.image_url ||
          p?.image ||
          PLACEHOLDER;

        return {
          id: p.id,
          name: p?.name || "Product",
          slug: p?.slug || generateSlugFromName(p?.name || ""),
          category: p?.category?.name || "Uncategorized",
          price: pPrice,
          originalPrice: pMrp,
          discount:
            pMrp > pPrice && pPrice > 0
              ? Math.round(((pMrp - pPrice) / pMrp) * 100)
              : null,
          image: normalizeImageUrl(primaryImg) || PLACEHOLDER,
          rating: num(
            p?.reviews?.summary?.average_rating ??
            p?.reviews_summary?.average_rating ??
            p?.rating ??
            0,
          ),
          reviews: num(
            p?.reviews?.summary?.total_reviews ??
            p?.reviews_summary?.total_reviews ??
            p?.reviews ??
            0,
          ),
          inStock: num(p?.stock_quantity) > 0,
          createdAt: p?.created_at || p?.createdAt || null,
        };
      });
  }, [similarApiList, product?.id, isDistributor]);

  /* =======================================================
     AUTO IMAGE CHANGE ON HOVER
  ======================================================= */

  useEffect(() => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }

    if (hovered && totalImages > 1 && !isDragging) {
      hoverIntervalRef.current = setInterval(() => {
        setImageLoaded(false);
        setImageIndex((prev) => (prev + 1) % totalImages);
      }, 1500);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
        hoverIntervalRef.current = null;
      }
    };
  }, [hovered, totalImages, isDragging]);

  useEffect(() => {
    if (!hovered) {
      setImageIndex(0);
      setDragX(0);
    }
  }, [hovered]);

  /* =======================================================
     BADGE / PEOPLE BOUGHT
  ======================================================= */

  const badge =
    product?.badge?.trim() ||
    (product?.is_deal_of_the_day
      ? "Deal of the Day"
      : product?.sale_type === "today_best"
        ? "Best Seller"
        : "");

  const peopleBought = num(
    product?.peopleBoughtThisWeek ?? product?.people_bought_this_week,
  );

  /* =======================================================
     LOGIN
  ======================================================= */

  const requireLogin = (): boolean => {
    if (hasToken !== true) {
      const loginPath = `/auth/${isDistributor ? "distributor" : "customer"
        }/login`;
      router.push(loginPath);
      return false;
    }
    return true;
  };

  /* =======================================================
     CARD CLICK
  ======================================================= */

  const handleCardClick = () => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    if (!productSlug) {
      router.push(`/products`);
      return;
    }
    router.push(productUrl);
  };

  /* =======================================================
     DRAG HANDLERS
  ======================================================= */

  const getClientXY = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ): { x: number; y: number } => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (totalImages <= 1) return;
    const { x, y } = getClientXY(e);
    dragStartX.current = x;
    dragStartY.current = y;
    setIsDragging(true);
    hasMoved.current = false;
    setDragX(0);
  };

  const handleDragMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!isDragging || totalImages <= 1) return;

    const { x, y } = getClientXY(e);
    const dx = x - dragStartX.current;
    const dy = y - dragStartY.current;

    if (Math.abs(dx) > 5) hasMoved.current = true;
    if (Math.abs(dy) > Math.abs(dx)) return;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const maxDrag = containerWidth * 0.8;

    let clampedDx = dx;
    if (Math.abs(dx) > maxDrag) {
      clampedDx = dx > 0 ? maxDrag : -maxDrag;
    }

    setDragX(clampedDx);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const dx = dragX;
    const SWIPE_THRESHOLD = 60;

    if (dx < -SWIPE_THRESHOLD && imageIndex < totalImages - 1) {
      setImageLoaded(false);
      setImageIndex((prev) => prev + 1);
    } else if (dx < -SWIPE_THRESHOLD && imageIndex === totalImages - 1) {
      setImageLoaded(false);
      setImageIndex(0);
    } else if (dx > SWIPE_THRESHOLD && imageIndex > 0) {
      setImageLoaded(false);
      setImageIndex((prev) => prev - 1);
    } else if (dx > SWIPE_THRESHOLD && imageIndex === 0) {
      setImageLoaded(false);
      setImageIndex(totalImages - 1);
    }

    setDragX(0);
    setIsDragging(false);

    setTimeout(() => {
      hasMoved.current = false;
    }, 50);
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    if (!inStock || adding) return;

    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      dispatch(
        showToast({
          message: `${productName} added to cart successfully! 🛒`,
          type: "success",
        }),
      );
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to add item to cart",
          type: "error",
        }),
      );
    } finally {
      setAdding(false);
    }
  };

  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    if (!inStock || buying) return;

    setBuying(true);
    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      const params = new URLSearchParams({
        product_id: String(product.id),
        quantity: "1",
      });
      router.push(`/checkout?${params.toString()}`);
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to process your order",
          type: "error",
        }),
      );
      setBuying(false);
    }
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist({ product_id: product.id }).unwrap();
        setWishlisted(false);
      } else {
        await addToWishlist({ product_id: product.id }).unwrap();
        setWishlisted(true);
      }
      await refetchWishlist();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.data?.message || "Failed to update wishlist",
          type: "error",
        }),
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  /* =======================================================
     OPEN/CLOSE SIMILAR DRAWER
  ======================================================= */

  const handleViewSimilar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowSimilarDrawer(true);
  };

  const handleCloseSimilar = () => {
    setShowSimilarDrawer(false);
  };

  /* =======================================================
     RENDER SIMILAR CARD
  ======================================================= */

  const renderSimilarCard = (item: any, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: (index % 8) * 0.03,
      }}
    >
      <Link
        href={`/product/${encodeURIComponent(
          item.slug || generateSlugFromName(item.name) || item.id,
        )}`}
        className="group/sim block"
        onClick={() => setShowSimilarDrawer(false)}
      >
        <div className="relative aspect-[0.8] overflow-hidden rounded-[8px] bg-[#F3F3F3]">
          <Image
            src={item.image || PLACEHOLDER}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-300 group-hover/sim:scale-[1.02]"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = PLACEHOLDER;
            }}
          />

          {item.discount && item.discount > 0 && (
            <span className="absolute left-2 top-2 rounded-[3px] bg-[#111] px-[6px] py-[3px] text-[8px] font-semibold uppercase tracking-wide text-white">
              {item.discount}% OFF
            </span>
          )}
        </div>

        <div className="pt-2.5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#999]">
            {item.category}
          </p>

          <h3 className="mt-0.5 truncate text-[12px] font-medium text-[#222]">
            {item.name}
          </h3>

          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#F6BE16] text-[#F6BE16]" />
            <span className="text-[9px] text-[#888]">
              {Number(item.rating || 0).toFixed(1)} ({item.reviews})
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-[#111]">
              ₹{Number(item.price || 0).toLocaleString("en-IN")}
            </span>

            {item.originalPrice > item.price && (
              <span className="text-[9px] text-[#AAA] line-through">
                ₹{Number(item.originalPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <motion.article
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative w-full min-w-0 cursor-pointer bg-transparent"
      >
        {/* IMAGE WRAPPER */}
        <div className="relative">
          {/* IMAGE CONTAINER */}
          <div
            ref={containerRef}
            className="relative aspect-square w-full select-none overflow-hidden rounded-[7px] bg-[#f3f1eb]"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{
              cursor:
                totalImages > 1
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "pointer",
              touchAction: totalImages > 1 ? "pan-y" : "auto",
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-[#ebe9e3]" />
            )}

            <motion.img
              key={`${product.id}-${imageIndex}`}
              src={images[imageIndex] || placeholder.src}
              alt={productName}
              loading="lazy"
              referrerPolicy="no-referrer"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={{ x: dragX }}
              animate={{
                x: dragX,
                scale: hovered && !isDragging ? 1.02 : 1,
              }}
              transition={
                isDragging
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 300, damping: 30 }
              }
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src !== placeholder.src) {
                  img.src = placeholder.src;
                }
                setImageLoaded(true);
              }}
            />

            {/* OUT OF STOCK OVERLAY */}
            {isOutOfStock && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <span className="rounded-[4px] bg-[#111] px-[14px] py-[6px] text-[10px] font-semibold uppercase tracking-wide text-white">
                  Out of Stock
                </span>
              </div>
            )}

            {/* WISHLIST ICON */}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleWishlist}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={wishlistLoading}
                  className="absolute right-[8px] top-[8px] z-20 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.10)] backdrop-blur-sm transition hover:scale-105"
                  aria-label="Wishlist"
                >
                  {wishlistLoading ? (
                    <span className="h-[12px] w-[12px] animate-spin rounded-full border-2 border-[#111] border-t-transparent" />
                  ) : (
                    <Heart
                      className="h-[15px] w-[15px]"
                      fill={wishlisted ? "#e0432b" : "none"}
                      stroke={wishlisted ? "#e0432b" : "#111"}
                      strokeWidth={1.8}
                    />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* ============================================
                VIEW SIMILAR BUTTON
                — Matches "Only X Left In Stock!" color
                  (#B84460 pinkish-red)
            ============================================ */}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={handleViewSimilar}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute bottom-[10px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-[6px] rounded-full border bg-white/95 px-[12px] py-[7px] shadow-[0_4px_14px_rgba(184,68,96,0.18)] backdrop-blur-md transition hover:scale-[1.03] hover:bg-[#FFF5F7]"
                  style={{ borderColor: "#B84460" }}
                  aria-label="View Similar Products"
                  title="View Similar Products"
                >
                  <span className="relative flex h-[13px] w-[15px] flex-shrink-0 items-center justify-center">
                    <span
                      className="absolute left-0 top-1/2 h-[8px] w-[5px] -translate-y-1/2 -rotate-[18deg] rounded-[1.5px] border-[1.5px]"
                      style={{ borderColor: "#B84460" }}
                    />
                    <span
                      className="absolute right-0 top-1/2 h-[8px] w-[5px] -translate-y-1/2 rotate-[18deg] rounded-[1.5px] border-[1.5px]"
                      style={{ borderColor: "#B84460" }}
                    />
                    <span
                      className="relative z-10 h-[11px] w-[7px] rounded-[1.5px] border-[1.5px] bg-white"
                      style={{ borderColor: "#B84460" }}
                    />
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-[0.04em]"
                    style={{ color: "#B84460" }}
                  >
                    Similar
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ============================================
              CAROUSEL DOTS STRIP
              — Fixed-height row BELOW image
              — Dots appear only on hover
              — Rating row never shifts
          ============================================ */}
          {totalImages > 1 && (
            <div className="relative mt-[4px] h-[6px] w-full">
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center gap-[4px]"
                  >
                    {images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index === imageIndex) return;
                          setImageLoaded(false);
                          setImageIndex(index);
                        }}
                        className={`
                          h-[5px] rounded-full transition-all duration-200
                          ${index === imageIndex
                            ? "w-[14px] bg-[#111]"
                            : "w-[5px] bg-[#c4c2bd] hover:bg-[#888]"
                          }
                        `}
                        style={{ flexShrink: 0 }}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="px-[7px] pb-[8px] pt-[7px]">
          {/* ============================================
              RATING PILL BADGE
              — Rounded pill with light gray background
              — Matches the screenshot style
          ============================================ */}
          <div className="mb-[6px] flex items-center">
            <span className="inline-flex items-center gap-[3px] rounded-full bg-[#F3F3F3] px-[7px] py-[3px]">
              <span className="text-[10px] font-semibold leading-none text-[#111]">
                {rating.toFixed(1)}
              </span>
              <Star className="h-[10px] w-[10px] fill-[#16813a] text-[#16813a]" />
              <span className="text-[10px] leading-none text-[#666]">|</span>
              <span className="text-[10px] leading-none text-[#666]">
                {reviewCount}
              </span>
            </span>
          </div>

          <div
            className="truncate text-[11px] leading-[15px] text-[#3c3e3d]"
            title={brandName ? `${brandName} | ${productName}` : productName}
          >
            {brandName && (
              <span className="font-semibold text-[#111]">
                {brandName}
                <span className="mx-[4px] font-normal text-[#999]">|</span>
              </span>
            )}
            <span className="font-normal text-[#676b69]">{productName}</span>
          </div>

          {shortDescription && (
            <div
              className="mt-[1px] truncate text-[11px] font-normal leading-[16px] text-[#676b69]"
              title={shortDescription}
            >
              {shortDescription}
            </div>
          )}

          <div className="mt-[6px] flex items-center gap-[6px]">
            <span className="text-[15px] font-bold leading-none text-[#111]">
              ₹ {money(price)}
            </span>
            {mrp > price && (
              <span className="text-[9px] leading-none text-[#999] line-through">
                ₹{money(mrp)}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-[3px] bg-[#edf7ef] px-[4px] py-[2px] text-[8px] font-semibold text-[#24813a]">
                {discount}% OFF
              </span>
            )}
          </div>

          {peopleBought > 0 && (
            <p className="mt-[5px] text-[10px] font-normal leading-[14px] text-[#303332]">
              {peopleBought} people bought this week
            </p>
          )}

          {lowStock && !isOutOfStock && (
            <p className="mt-[5px] text-[11px] font-semibold leading-[14px] text-[#B84460]">
              Only {stockQuantity} Left In Stock!
            </p>
          )}

          {isOutOfStock && (
            <p className="mt-[5px] text-[11px] font-semibold leading-[14px] text-[#B84460]">
              Currently Unavailable
            </p>
          )}

          {badge === "Best Seller" && !isOutOfStock && (
            <span className="mt-[5px] inline-flex rounded-[4px] bg-[#fff3e9] px-[6px] py-[3px] text-[8px] font-semibold leading-none text-[#e76c30]">
              Best Seller
            </span>
          )}

          <div className="mt-[9px] flex w-full items-center gap-[6px]">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock || buying}
              className={`
                flex h-[35px] flex-1 items-center justify-center rounded-[5px]
                text-[9px] font-semibold uppercase tracking-[0.03em] transition
                ${inStock && !buying
                  ? "bg-[#111] text-white hover:bg-black"
                  : "cursor-not-allowed bg-[#e7e5e1] text-[#888]"
                }
              `}
            >
              {buying ? (
                <span className="h-[11px] w-[11px] animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : inStock ? (
                "Buy Now"
              ) : (
                "Sold Out"
              )}
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              aria-label="Add to cart"
              className={`
                flex h-[35px] w-[38px] shrink-0 items-center justify-center
                rounded-[5px] border
                ${inStock && !adding
                  ? "border-[#dedbd4] bg-white text-[#222] hover:border-[#111] hover:bg-[#111] hover:text-white"
                  : "cursor-not-allowed border-[#e3e1dc] bg-[#f6f5f1] text-[#999]"
                }
              `}
            >
              {adding ? (
                <span className="h-[12px] w-[12px] animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ShoppingCart className="h-[15px] w-[15px]" strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>
      </motion.article>

      {/* ===================================================== */}
      {/* STABLE RIGHT-SIDE SIMILAR PRODUCTS DRAWER           */}
      {/* ===================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {showSimilarDrawer && (
              <>
                {/* BACKDROP */}
                <motion.div
                  key="similar-backdrop"
                  className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[1.5px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={handleCloseSimilar}
                  aria-hidden="true"
                />

                {/* DRAWER */}
                <motion.aside
                  key="similar-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="similar-products-title"
                  className="fixed right-0 top-0 z-[9999] flex h-[100dvh] w-[min(520px,92vw)] flex-col overflow-hidden bg-white shadow-[-18px_0_50px_rgba(0,0,0,0.14)]"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* HEADER */}
                  <div className="flex shrink-0 items-center justify-between border-b border-[#ECECEC] bg-white px-4 py-4 sm:px-5">
                    <div className="min-w-0 pr-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                        You may also like
                      </p>
                      <h2
                        id="similar-products-title"
                        className="mt-1 text-[19px] font-semibold leading-tight text-[#111] sm:text-[21px]"
                      >
                        Similar Products
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseSimilar}
                      aria-label="Close similar products"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-[#111] transition hover:bg-[#E8E8E8] active:scale-95"
                    >
                      <X className="h-[18px] w-[18px]" strokeWidth={2} />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-7 pt-4 sm:px-5 sm:pt-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D5D5D5] [&::-webkit-scrollbar-track]:bg-transparent">
                    {/* INITIAL LOAD */}
                    {(isSimilarLoading || isSimilarFetching) &&
                      similarProducts.length === 0 && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-[0.82] w-full rounded-[8px] bg-[#F1F1F1]" />
                              <div className="mt-2.5 h-2 w-2/5 rounded bg-[#F1F1F1]" />
                              <div className="mt-1.5 h-3 w-4/5 rounded bg-[#F1F1F1]" />
                              <div className="mt-2 h-3 w-1/2 rounded bg-[#F1F1F1]" />
                            </div>
                          ))}
                        </div>
                      )}

                    {/* EMPTY */}
                    {!isSimilarLoading &&
                      !isSimilarFetching &&
                      similarProducts.length === 0 && (
                        <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                          <div className="text-4xl">🛍️</div>
                          <p className="mt-4 text-[14px] font-medium text-[#555]">
                            No similar products found
                          </p>
                          <p className="mt-1.5 text-[11px] leading-5 text-[#999]">
                            We could not find other products in this category.
                          </p>
                        </div>
                      )}

                    {/* PRODUCT GRID */}
                    {similarProducts.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-7">
                        {similarProducts.map((item, index) =>
                          renderSimilarCard(item, index),
                        )}
                      </div>
                    )}
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}