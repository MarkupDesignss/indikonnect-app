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
// =========================================================    TYPES   =========================================================*
interface ProductImage {
  id?: number;
  image_url?: string;
  url?: string;
  is_primary?: boolean;
  sort_order?: number;
}
export interface Product {
  id: number | string;
  name?: string;
  slug?: string | null;
  brandName?: string;
  brand_name?: string;
  category_name?: string;
  people_viewed_this_month?: number;
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
  variants?: any[];
  variant_products?: Product[];
  color_variants?: Product[];
  [key: string]: any;
}
interface ProductCardProps {
  product: Product;
  hasToken?: boolean;
}
// =========================================================    HELPERS   =========================================================*
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
  let url = String(value).trim().replace(/\\\\/g, "");
  if (url.startsWith("http\://")) url = "https\://" + url.slice(7);
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

const COLOR_HEX: Record<string, string> = {
  black: "#181818",
  white: "#ffffff",
  silver: "#c7ccd1",
  steel: "#9da5ac",
  "rose gold": "#c98e84",
  gold: "#d6ad60",
  golden: "#d6ad60",
  blue: "#446a9b",
  navy: "#263e66",
  green: "#49765b",
  red: "#b84b4e",
  pink: "#e7a2b6",
  brown: "#815b49",
  grey: "#8a8c90",
  gray: "#8a8c90",
  purple: "#84629b",
  beige: "#d5c1a3",
  cream: "#f0e4cf",
  yellow: "#eac953",
  orange: "#e89853",
  titanium: "#7c8389",
};
const detectColor = (value: unknown): string => {
  const text = String(value ?? "").toLowerCase();
  return (
    Object.keys(COLOR_HEX)
      .sort((a, b) => b.length - a.length)
      .find((color) =>
        new RegExp(`\\b${color.replace(/ /g, "\\s+")}\\b`, "i").test(text),
      ) || ""
  );
};
const variantLabel = (v: any): string =>
  String(
    v?.color?.name ??
      v?.color_name ??
      v?.colour ??
      v?.color ??
      v?.attribute_value ??
      v?.value ??
      v?.name ??
      v?.title ??
      "",
  ).trim();
const getVariantImage = (v: any): string =>
  normalizeImageUrl(
    v?.image_url ??
      v?.primary_image_url ??
      v?.image ??
      v?.images?.[0]?.image_url ??
      v?.images?.[0]?.url ??
      "",
  );

// =========================================================    PRODUCT CARD   =========================================================*
export default function ProductCard({
  product,
  hasToken: hasTokenProp,
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { hasToken: hasTokenHook, appType } = useTokenCheck();
  const hasToken = hasTokenProp ?? hasTokenHook;
  // =======================================================    APP TYPE   =======================================================*
  const currentAppType = useMemo(() => {
    if (typeof window !== "undefined") return getAppType();
    return appType;
  }, [appType]);
  const isDistributor = currentAppType === "distributor";
  const placeholder = Fallback;
  // =======================================================    STATE   =======================================================*
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
  // =======================================================    DRAG STATE   =======================================================*
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const hasMoved = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // =======================================================    API   =======================================================*
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
  // =======================================================    WISHLIST SYNC   =======================================================*
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
  // =======================================================    RESET IMAGE ON PRODUCT CHANGE   =======================================================*
  useEffect(() => {
    setImageIndex(0);
    setImageLoaded(false);
    setDragX(0);
  }, [product?.id]);
  // =======================================================    LOCK PAGE SCROLL WHILE DRAWER IS OPEN   =======================================================*
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
  // =======================================================    ESC KEY CLOSE DRAWER   =======================================================*
  useEffect(() => {
    if (!showSimilarDrawer) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSimilarDrawer(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSimilarDrawer]);
  // =======================================================    BASIC DATA   =======================================================*
  const brandName =
    product?.brand_name?.trim() ||
    product?.brandName?.trim() ||
    product?.brand?.trim() ||
    "";
  // The API returns category.name. Some listing pages flatten or omit it.*
  // Recover known category IDs from the supplied API when the nested object is missing.*
  const apiCategoryNames: Record<number, string> = {
    3: "Premium Jewelry",
    6: "All Watches",
    19: "Electronics",
    20: "Collection",
  };
  const categoryName = String(
    product?.category?.name ||
      product?.category_name ||
      (product?.category_id != null
        ? apiCategoryNames[Number(product.category_id)]
        : "") ||
      (product?.categoryId != null
        ? apiCategoryNames[Number(product.categoryId)]
        : "") ||
      "",
  ).trim();
  const productName = String(product?.name ?? "").trim() || "Product";
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
  // =======================================================    PRICE   =======================================================*
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
  // =======================================================    STOCK   =======================================================*
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
  // =======================================================    RATING   =======================================================*
  const rating =
    num(product?.reviews_summary?.average_rating) || num(product?.rating);
  const reviewCount =
    num(product?.reviews_summary?.total_reviews) || num(product?.reviews);
  // =======================================================    IMAGES   =======================================================*
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
  // Variants may be nested or supplied as explicitly linked sibling products.
  // Never treat all category products as variants.
  const variantOptions = useMemo(() => {
    const raw = [
      ...(Array.isArray(product?.variants) ? product.variants : []),
      ...(Array.isArray(product?.variant_products)
        ? product.variant_products
        : []),
      ...(Array.isArray(product?.color_variants) ? product.color_variants : []),
    ];
    const ownColor = String(
      product?.color_name ?? product?.color ?? detectColor(product?.name),
    ).trim();
    const self = ownColor
      ? [
          {
            id: product.id,
            product_id: product.id,
            name: ownColor,
            color: ownColor,
            image_url: images[0],
            slug: product.slug,
            isCurrent: true,
          },
        ]
      : [];
    const all = [...self, ...raw].map((v: any, index) => {
      const label =
        variantLabel(v) || detectColor(v?.name) || `Option ${index + 1}`;
      const color = detectColor(label) || detectColor(v?.name);
      return {
        key: String(v?.product_id ?? v?.id ?? index),
        label,
        color,
        hex:
          v?.hex_code ??
          v?.color_hex ??
          v?.hex ??
          (color ? COLOR_HEX[color] : ""),
        image: getVariantImage(v),
        slug: v?.slug,
        productId: v?.product_id ?? (v?.isCurrent ? product.id : undefined),
        isCurrent: Boolean(
          v?.isCurrent ||
          v?.is_selected ||
          v?.is_default ||
          (v?.product_id != null &&
            String(v.product_id) === String(product.id)),
        ),
        stock: v?.stock_quantity,
        price: v?.effective_price ?? v?.retail_price ?? v?.price,
        mrp: v?.effective_mrp ?? v?.retail_mrp ?? v?.originalPrice,
      };
    });
    return all.filter(
      (v, i) =>
        all.findIndex(
          (x) => x.label.toLowerCase() === v.label.toLowerCase(),
        ) === i,
    );
  }, [product, images]);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(
    null,
  );
  useEffect(() => {
    setSelectedVariantKey(null);
  }, [product.id]);
  const selectedVariant =
    variantOptions.find((v) => v.key === selectedVariantKey) ??
    variantOptions.find((v) => v.isCurrent) ??
    variantOptions[0];
  const variantImage = selectedVariant?.image || "";
  const displayedImage =
    imageIndex === 0 && variantImage ? variantImage : images[imageIndex];
  const displayedPrice =
    selectedVariant?.price != null ? num(selectedVariant.price) : price;
  const displayedMrp =
    selectedVariant?.mrp != null && num(selectedVariant.mrp) > 0
      ? num(selectedVariant.mrp)
      : mrp;
  const displayedDiscount =
    displayedMrp > displayedPrice && displayedPrice > 0
      ? Math.round(((displayedMrp - displayedPrice) / displayedMrp) * 100)
      : 0;
  const displayedStock =
    selectedVariant?.stock != null ? num(selectedVariant.stock) > 0 : inStock;
  const selectedProductId = selectedVariant?.productId ?? product.id;
  const totalImages = images.length;
  // =======================================================    SIMILAR PRODUCTS   =======================================================*
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
  // =======================================================    AUTO IMAGE CHANGE ON HOVER   =======================================================*
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
  // =======================================================    BADGE / PEOPLE BOUGHT   =======================================================*
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
  // =======================================================    LOGIN   =======================================================*
  const requireLogin = (): boolean => {
    if (hasToken !== true) {
      const loginPath = `/auth/${
        isDistributor ? "distributor" : "customer"
      }/login`;
      router.push(loginPath);
      return false;
    }
    return true;
  };
  // =======================================================    CARD CLICK   =======================================================*
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
  // =======================================================    DRAG HANDLERS   =======================================================*
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
  // =======================================================    ADD TO CART   =======================================================*
  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    if (!displayedStock || adding) return;
    setAdding(true);
    try {
      await addToCart({ product_id: selectedProductId, quantity: 1 }).unwrap();
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
  // =======================================================    BUY NOW   =======================================================*
  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    if (!displayedStock || buying) return;
    setBuying(true);
    try {
      await addToCart({ product_id: selectedProductId, quantity: 1 }).unwrap();
      const params = new URLSearchParams({
        product_id: String(selectedProductId),
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
  // =======================================================    WISHLIST   =======================================================*
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
  // =======================================================    OPEN/CLOSE SIMILAR DRAWER   =======================================================*
  const handleViewSimilar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowSimilarDrawer(true);
  };
  const handleCloseSimilar = () => {
    setShowSimilarDrawer(false);
  };
  // =======================================================    RENDER SIMILAR CARD   =======================================================*
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
  // =======================================================    UI   =======================================================*
  return (
    <>
      <motion.article
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative flex h-full w-full min-w-0 flex-col cursor-pointer overflow-hidden rounded-[12px] border border-[#eaeaea] bg-white transition-all duration-200 hover:border-[#d8d8d8] hover:shadow-[0_10px_26px_rgba(15,23,42,0.10)]"
      >
        {/* IMAGE WRAPPER */}
        <div className="relative w-full">
          {/* ============================================** * * IMAGE CONTAINER — FULL WIDTH, FIXED HEIGHT* * * (Card height same rahegi — sirf image* * * poora area cover karegi object-cover se)* * * ============================================ */}
          <div
            ref={containerRef}
            className="relative aspect-square w-full select-none overflow-hidden rounded-t-[11px] bg-[#faf9f7]"
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
              <div className="absolute inset-0 animate-pulse bg-white" />
            )}
            {/* IMAGE — FULL WIDTH & HEIGHT (object-cover, no padding) */}
            <motion.img
              key={`${product.id}-${imageIndex}-${selectedVariant?.key ?? ""}`}
              src={displayedImage || placeholder.src}
              alt={productName}
              loading="lazy"
              referrerPolicy="no-referrer"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={{ x: dragX }}
              animate={{
                x: dragX,
                scale: hovered && !isDragging ? 1.015 : 1,
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
            {/* Premium VIEW SIMILAR: safely centered inside its own layout row. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleViewSimilar}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="pointer-events-auto inline-flex min-h-[34px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/80 bg-white/95 px-4 py-2 text-[10px] font-semibold tracking-[0.06em] text-[#171717] shadow-[0_6px_22px_rgba(0,0,0,0.14)] backdrop-blur-md transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    aria-label="View Similar Products"
                    title="View Similar Products"
                  >
                    <span
                      className="relative flex h-[14px] w-[16px] shrink-0 items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="absolute left-0 top-[3px] h-[9px] w-[7px] -rotate-12 rounded-[2px] border border-[#171717]" />
                      <span className="absolute right-0 top-[3px] h-[9px] w-[7px] rotate-12 rounded-[2px] border border-[#171717]" />
                      <span className="relative h-[11px] w-[8px] rounded-[2px] border border-[#171717] bg-white" />
                    </span>
                    VIEW SIMILAR
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Carousel dots below the image — do not overlap View Similar. */}
        {totalImages > 1 && (
          <div
            className="flex h-[20px] w-full items-center justify-center gap-[5px] bg-white"
            aria-label={`Product image ${imageIndex + 1} of ${totalImages}`}
            onClick={(e) => e.stopPropagation()}
          >
            {Array.from({ length: Math.min(totalImages, 5) }, (_, position) => {
              const visibleCount = Math.min(totalImages, 5);
              const start = Math.max(
                0,
                Math.min(
                  imageIndex - Math.floor(visibleCount / 2),
                  totalImages - visibleCount,
                ),
              );
              const actualIndex = start + position;
              const isActive = actualIndex === imageIndex;
              return (
                <button
                  key={actualIndex}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setImageLoaded(false);
                    setImageIndex(actualIndex);
                  }}
                  onMouseDown={(event) => event.stopPropagation()}
                  onTouchStart={(event) => event.stopPropagation()}
                  aria-label={`View product image ${actualIndex + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`block h-[5px] shrink-0 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    isActive
                      ? "w-[17px] bg-[#171717]"
                      : "w-[5px] bg-[#c7c7c7] hover:bg-[#777]"
                  }`}
                />
              );
            })}
          </div>
        )}
        {/* PRODUCT INFO */}
        <div className="flex min-w-0 flex-1 flex-col px-[9px] pb-[10px] pt-[7px]">
          {/* RATING PILL BADGE */}
          <div className="mb-[5px] flex min-h-[15px] items-center">
            <span className="inline-flex items-center gap-[4px] rounded-full bg-[#f4f4f4] px-[6px] py-[3px]">
              <span className="text-[10px] font-semibold leading-none text-[#111]">
                {rating.toFixed(1)}
              </span>
              <Star className="h-[10px] w-[10px] fill-[#238b43] text-[#238b43]" />
              <span className="text-[10px] leading-none text-[#666]">|</span>
              <span className="text-[10px] leading-none text-[#666]">
                {reviewCount}
              </span>
            </span>
          </div>
          {/* API row one: brand_name | category.name (NEVER brand alone if category exists) */}
          <div
            className="flex min-w-0 w-full items-baseline gap-[4px] text-[12px] leading-[17px]"
            title={`${brandName} | ${categoryName}`}
          >
            <span className="min-w-0 max-w-[60%] truncate font-semibold text-[#191919]">
              {brandName || "Brand"}
            </span>
            {categoryName && (
              <span className="min-w-0 flex-1 truncate font-normal text-[#424b5a]">
                | {categoryName}
              </span>
            )}
          </div>
          {/* API row two: product.name, exactly one compact line, title available on hover */}
          <p
            className="mt-[3px] block w-full min-w-0 truncate text-[11px] leading-[16px] text-[#657080]"
            title={productName}
          >
            {productName}
          </p>
          {/* Compact one-line variants: no oversized circle, no card height jump. */}
          {variantOptions.length > 0 && (
            <div
              className="mt-[7px] flex h-[23px] min-w-0 items-center gap-[7px]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.08em] text-[#757575]">
                {variantOptions.some((v) => v.color) ? "Color" : "Option"}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-[7px] overflow-x-auto py-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {variantOptions.map((v) => {
                  const active = selectedVariant?.key === v.key;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      title={v.label}
                      aria-label={`Select ${v.label}`}
                      aria-pressed={active}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          v.slug &&
                          v.productId != null &&
                          String(v.productId) !== String(product.id)
                        ) {
                          router.push(`/product/${encodeURIComponent(v.slug)}`);
                          return;
                        }
                        setSelectedVariantKey(v.key);
                        setImageIndex(0);
                        setImageLoaded(false);
                      }}
                      className={`flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border bg-white p-[2px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${active ? "border-[#171717]" : "border-[#dadada] hover:border-[#777]"}`}
                    >
                      {v.hex ? (
                        <span
                          className="h-[13px] w-[13px] rounded-full border border-black/10"
                          style={{ backgroundColor: v.hex }}
                        />
                      ) : v.image ? (
                        <img
                          src={v.image}
                          alt=""
                          className="h-[13px] w-[13px] rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[7px] font-semibold text-[#444]">
                          {v.label.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <span
                className="max-w-[60px] shrink-0 truncate text-right text-[9px] text-[#666]"
                title={selectedVariant?.label}
              >
                {selectedVariant?.label}
              </span>
            </div>
          )}
          {/* Sale price, original MRP and REAL percentage discount together. */}
          <div className="mt-[7px] flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]">
            <span className="text-[12px] font-bold leading-[17px] tracking-[-0.01em] text-[#141414]">
              ₹{money(displayedPrice)}
            </span>
            {displayedMrp > displayedPrice && displayedPrice > 0 && (
              <span className="text-[10px] leading-[15px] text-[#929292] line-through">
                ₹{money(displayedMrp)}
              </span>
            )}
            {displayedDiscount > 0 && (
              <span className="text-[10px] font-semibold text-[#16813a]">
                {displayedDiscount}% off
              </span>
            )}
          </div>
          {peopleBought > 0 && (
            <p className="mt-[5px] truncate text-[10px] font-normal leading-[14px] text-[#222]">
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
            <span className="mt-[5px] inline-flex rounded-[4px] bg-[#fff5ed] px-[7px] py-[4px] text-[10px] font-medium leading-none text-[#e76c30]">
              Best Seller
            </span>
          )}
          <div className="mt-[9px] flex w-full items-center gap-[6px]">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!displayedStock || buying}
              className={`
                flex h-[34px] min-w-0 flex-1 items-center justify-center rounded-[8px]
                text-[10px] font-semibold transition
                ${
                  displayedStock && !buying
                    ? "bg-[#111] text-white hover:bg-black"
                    : "cursor-not-allowed bg-[#e7e5e1] text-[#888]"
                }
              `}
            >
              {buying ? (
                <span className="h-[11px] w-[11px] animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : displayedStock ? (
                "Buy Now"
              ) : (
                "Sold Out"
              )}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!displayedStock || adding}
              aria-label="Add to cart"
              className={`
                flex h-[34px] min-w-[96px] flex-1 items-center justify-center gap-1 px-[5px]
                rounded-[8px] border
                ${
                  displayedStock && !adding
                    ? "border-[#dedbd4] bg-white text-[#222] hover:border-[#111] hover:bg-[#111] hover:text-white"
                    : "cursor-not-allowed border-[#e3e1dc] bg-[#f6f5f1] text-[#999]"
                }
              `}
            >
              {adding ? (
                <span className="h-[12px] w-[12px] animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <ShoppingCart
                    className="h-[14px] w-[14px]"
                    strokeWidth={1.7}
                  />
                  <span className="text-[10px] font-semibold">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.article>
      {/* STABLE RIGHT-SIDE SIMILAR PRODUCTS DRAWER */}
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
