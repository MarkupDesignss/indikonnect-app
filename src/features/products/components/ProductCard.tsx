
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  X,
  Layers3,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { useAddToCartMutation } from "@/lib/redux/api/cartApi";
import { showToast } from "@/lib/slices/toastSlice";
import { useTokenCheck } from "@/hooks/useTokenCheck";

import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import {
  useGetProductsByCategoryQuery,
  useCheckProductStockMutation,
} from "@/lib/redux/api/productApi";

import Fallback from "../../../../public/indiekonnect-web/images/test.jpg";
import { getAppType } from "@/lib/appConfig";

/* -------------------------------------------------------------------------- */
/* DISTRIBUTOR OFFER PRICE                                                    */
/* -------------------------------------------------------------------------- */

const distributorOfferPrice = (item: any, base: number): number => {
  if (!Number.isFinite(base) || base <= 0) return base;

  const finalPrice = [
    item?.distributor_offer_price,
    item?.offer_price_distributor,
    item?.distributor_final_price,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number(value) > 0,
  );

  if (finalPrice !== undefined) return Number(finalPrice);

  const rawPercent = [
    item?.distributor_offer_percentage,
    item?.offer_discount_percentage,
    item?.offer_percentage,
    item?.offer?.discount_percentage,
    item?.offer?.percentage,
  ].find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)),
  );

  const percent = Number(rawPercent ?? 0);

  if (percent <= 0 || percent > 100) return base;

  return Math.round(base * (1 - percent / 100) * 100) / 100;
};

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ProductImage {
  id?: number;
  image_url?: string;
  url?: string;
  is_primary?: boolean;
  sort_order?: number;
}

type ProductCategory =
  | string
  | {
      id?: number;
      name?: string;
      title?: string;
      slug?: string;
    }
  | null;

export interface Product {
  id: number | string;

  is_primary?: number | boolean | string;
  name?: string;
  slug?: string | null;

  brandName?: string;
  brand_name?: string;
  brand?: string | { name?: string };

  category?: ProductCategory;
  category_name?: string;
  category_title?: string;
  category_id?: number;
  categoryId?: number;

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

  allowed_purchsed?: boolean | number | string | null;

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

  subcategory?: {
    id?: number;
    name?: string;
    slug?: string;
  };

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

  variants?: any[];
  variant_products?: Product[];
  color_variants?: Product[];

  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  hasToken?: boolean;
  allProducts?: Product[];
}

/* -------------------------------------------------------------------------- */
/* SHARED LISTING REGISTRY                                                    */
/* -------------------------------------------------------------------------- */

const listedProducts = new Map<string, Product>();
const listingListeners = new Set<() => void>();

function registerListedProducts(items: Product[]) {
  let changed = false;

  for (const item of items) {
    if (!item || item.id == null) continue;

    const key = String(item.id);

    if (listedProducts.get(key) !== item) {
      listedProducts.set(key, item);
      changed = true;
    }
  }

  if (changed) {
    listingListeners.forEach((notify) => notify());
  }
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER = "/indiekonnect-web/images/placeholder.jpg";

const num = (value: unknown): number => {
  if (value === undefined || value === null || value === "") return 0;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const isPurchaseAllowedWithoutStock = (item: any): boolean => {
  const value =
    item?.allowed_purchsed ?? item?.product?.allowed_purchsed;

  return (
    value === true ||
    value === 1 ||
    (typeof value === "string" &&
      ["1", "true"].includes(value.trim().toLowerCase()))
  );
};

const money = (value: unknown): string => {
  return num(value).toLocaleString("en-IN");
};

const normalizeImageUrl = (value?: string | null): string => {
  if (!value) return "";

  return String(value)
    .trim()
    .replace(/\\\//g, "/")
    .replace(/\\/g, "");
};

const getProductSlug = (product: Product): string => {
  const validSlug = (value: unknown): string => {
    if (typeof value !== "string") return "";

    const slug = value.trim();

    if (
      !slug ||
      slug === "[object Object]" ||
      slug === "undefined" ||
      slug === "null"
    ) {
      return "";
    }

    return slug;
  };

  const directSlug = validSlug(product?.slug);

  if (directSlug) return directSlug;

  const possibleNestedSlugs = [
    product?.product?.slug,
    product?.data?.slug,
    product?.product_data?.slug,
    product?.product_details?.slug,
  ];

  for (const value of possibleNestedSlugs) {
    const slug = validSlug(value);

    if (slug) return slug;
  }

  return product?.id != null ? String(product.id).trim() : "";
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
  const valueText = String(value ?? "").toLowerCase();

  return (
    Object.keys(COLOR_HEX)
      .sort((a, b) => b.length - a.length)
      .find((color) => valueText.includes(color)) || ""
  );
};

const variantLabel = (v: any): string =>
  String(
    v?.color?.name ??
      v?.variant_attributes?.color ??
      v?.attributes?.color ??
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
      v?.variant_image_url ??
      v?.primary_image_url ??
      v?.image ??
      v?.images?.[0]?.image_url ??
      v?.images?.[0]?.url ??
      "",
  );

/* -------------------------------------------------------------------------- */
/* RETAIL MRP HELPER                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Distributor cards must always show the actual retail price as the
 * crossed-out reference price.
 *
 * Priority:
 * 1. retail_mrp
 * 2. retail_price
 * 3. originalPrice
 *
 * effective_mrp is intentionally not used here because it can contain
 * a distributor-specific effective price.
 */
const getRetailMrp = (
  item: any,
  fallback: number = 0,
): number => {
  const candidates = [
    item?.retail_mrp,
    item?.retail_price,
    item?.originalPrice,
  ];

  for (const candidate of candidates) {
    const value = num(candidate);

    if (value > 0) return value;
  }

  return fallback;
};

/* -------------------------------------------------------------------------- */
/* BRAND / CATEGORY HELPERS                                                   */
/* -------------------------------------------------------------------------- */

const getBrandName = (product: Product): string => {
  const rawBrand =
    product?.brand_name ??
    product?.brandName ??
    product?.brand;

  return String(
    typeof rawBrand === "string"
      ? rawBrand
      : rawBrand?.name ?? "",
  ).trim();
};

const getCategoryName = (product: Product): string => {
  const rawCategory = product?.category;

  const categoryValue =
    typeof rawCategory === "string"
      ? rawCategory
      : rawCategory?.name ??
        rawCategory?.title ??
        "";

  return String(
    categoryValue ||
      product?.category_name ||
      product?.category_title ||
      "",
  ).trim();
};

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD                                                               */
/* -------------------------------------------------------------------------- */

function ProductCardInner({
  product,
  hasToken: hasTokenProp,
  allProducts,
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { hasToken: hasTokenHook, appType } = useTokenCheck();

  const hasToken = hasTokenProp ?? hasTokenHook;

  /* -------------------------------- APP TYPE ----------------------------- */

  const currentAppType = useMemo(() => {
    if (typeof window !== "undefined") return getAppType();

    return appType;
  }, [appType]);

  const isDistributor = currentAppType === "distributor";
  const placeholder = Fallback;

  /* -------------------------------- STATE -------------------------------- */

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

  /* -------------------------------- DRAG --------------------------------- */

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const hasMoved = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragLatestX = useRef(0);
  const dragActiveRef = useRef(false);
  const suppressClickUntil = useRef(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const hoverIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  /* -------------------------------- API ---------------------------------- */

  const [addToCart] = useAddToCartMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const {
    data: wishlistData,
    refetch: refetchWishlist,
  } = useGetWishlistQuery(undefined, {
    skip: hasToken !== true,
  });

  /* ------------------------------ CATEGORY ID ---------------------------- */

  const categoryId = useMemo(() => {
    const value =
      product?.category_id ??
      product?.categoryId ??
      (typeof product?.category === "object"
        ? product?.category?.id
        : null);

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : null;
  }, [
    product?.category_id,
    product?.categoryId,
    product?.category,
  ]);

  /* -------------------------- SIMILAR CATEGORY API ----------------------- */

  const {
    data: categoryProductsData,
    isLoading: isSimilarLoading,
    isFetching: isSimilarFetching,
  } = useGetProductsByCategoryQuery(categoryId as number, {
    skip:
      !categoryId ||
      (!showSimilarDrawer &&
        Number(categoryId) !== 6 &&
        !(Array.isArray(product?.variants) &&
          product.variants.length > 0) &&
        !(Array.isArray(product?.variant_products) &&
          product.variant_products.length > 0)),
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

  /* ------------------------------ WISHLIST SYNC -------------------------- */

  useEffect(() => {
    if (hasToken !== true) {
      setWishlisted(
        Boolean(product?.is_wishlisted ?? product?.isWishlisted),
      );

      return;
    }

    if (wishlistData?.data) {
      const exists = wishlistData.data.some(
        (item: any) =>
          Number(item?.product_id) === Number(product?.id),
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

  /* ---------------------------- RESET PRODUCT IMAGE ---------------------- */

  useEffect(() => {
    setImageIndex(0);
    setImageLoaded(false);
    setDragX(0);
  }, [product?.id]);

  /* ------------------------------ DRAWER SCROLL -------------------------- */

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

  /* -------------------------------- ESC KEY ------------------------------ */

  useEffect(() => {
    if (!showSimilarDrawer) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSimilarDrawer(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [showSimilarDrawer]);

  /* ------------------------------- BASIC DATA ---------------------------- */

  const brandName = useMemo(
    () => getBrandName(product),
    [product],
  );

  const categoryName = useMemo(
    () => getCategoryName(product),
    [product],
  );

  const productName =
    String(product?.name ?? "").trim() || "Product";

  const productSlug = useMemo(
    () => getProductSlug(product),
    [product],
  );

  const productUrl = useMemo(() => {
    if (!productSlug) return "/products";

    return `/product/${encodeURIComponent(productSlug)}`;
  }, [productSlug]);

  /* ---------------------------------------------------------------------- */
  /* MAIN PRODUCT PRICE                                                      */
  /* ---------------------------------------------------------------------- */

  const retailPrice = num(
    product?.retail_price ??
      product?.effective_price ??
      product?.price,
  );

  const distributorPrice = num(product?.distributor_price);

  // Selling price: distributor uses distributor_price.
  const price =
    isDistributor && distributorPrice > 0
      ? distributorOfferPrice(product, distributorPrice)
      : retailPrice;

  /**
   * IMPORTANT:
   * For distributors, crossed-out MRP must come from RETAIL price fields.
   * Never use distributor_mrp for this display.
   */
  const retailMrp = getRetailMrp(product, retailPrice);

  const mrp = retailMrp > 0 ? retailMrp : retailPrice;

  /* -------------------------------- STOCK -------------------------------- */

  const stockQuantity = num(
    product?.stock_quantity ?? product?.stockQuantity,
  );

  const lowStockThreshold = num(
    product?.low_stock_threshold ?? product?.lowStockThreshold,
  );

  const rawStatus = String(
    product?.stock_status ?? product?.stockStatus ?? "",
  ).toLowerCase();

  const hasStockQuantity =
    product?.stock_quantity != null ||
    product?.stockQuantity != null;

  let inStock = true;

  if (typeof product?.inStock === "boolean") {
    inStock = product.inStock;
  } else if (
    ["out_of_stock", "sold_out", "inactive"].includes(rawStatus)
  ) {
    inStock = false;
  } else if (hasStockQuantity) {
    inStock = stockQuantity > 0;
  }

  const lowStock =
    !isPurchaseAllowedWithoutStock(product) &&
    inStock &&
    stockQuantity > 0 &&
    (rawStatus === "low_stock" ||
      (lowStockThreshold > 0 &&
        stockQuantity <= lowStockThreshold));

  /* -------------------------------- RATING ------------------------------- */

  const rating = num(
    product?.reviews_summary?.average_rating ??
      product?.rating,
  );

  const reviewCount = num(
    product?.reviews_summary?.total_reviews ??
      product?.reviews,
  );

  const hasRating =
    rating > 0 &&
    rating <= 5 &&
    reviewCount > 0;

  /* -------------------------------- IMAGES ------------------------------- */

  const images = useMemo(() => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0 &&
      typeof product.images[0] === "string"
    ) {
      const cleaned = (product.images as string[])
        .map((url) => normalizeImageUrl(url))
        .filter(Boolean);

      if (cleaned.length > 0) {
        return [...new Set(cleaned)];
      }
    }

    const list = Array.isArray(product?.images)
      ? product.images
      : [];

    const extracted = list
      .map((item: any) => {
        if (typeof item === "string") {
          return {
            url: normalizeImageUrl(item),
            primary: false,
            sortOrder: 0,
          };
        }

        return {
          url: normalizeImageUrl(
            item?.image_url || item?.url,
          ),
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

    if (extracted.length) {
      return [...new Set(extracted)];
    }

    const primary = normalizeImageUrl(
      product?.primary_image_url,
    );

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

  /* --------------------------- REGISTER PRODUCTS ------------------------- */

  const [listingVersion, setListingVersion] = useState(0);

  useEffect(() => {
    const notify = () => {
      setListingVersion((version) => version + 1);
    };

    listingListeners.add(notify);

    registerListedProducts([
      product,
      ...(Array.isArray(allProducts) ? allProducts : []),
    ]);

    return () => {
      listingListeners.delete(notify);
    };
  }, [product, allProducts]);

  /* ------------------------------ VARIANT OPTIONS ------------------------ */

  const variantOptions = useMemo(() => {
    const pool = new Map<string, Product>();

    for (const item of listedProducts.values()) {
      pool.set(String(item.id), item);
    }

    for (const item of allProducts ?? []) {
      if (item?.id != null) {
        pool.set(String(item.id), item);
      }
    }

    for (const item of similarApiList) {
      if (item?.id != null) {
        pool.set(String(item.id), item);
      }
    }

    pool.set(String(product.id), product);

    const currentId = String(product.id);
    const candidates = [...pool.values()];

    const familyIds = new Set<string>([currentId]);
    const linkRows: any[] = [];
    const seenRows = new Set<string>();

    const getLinks = (owner: Product): any[] => {
      const rows: any[] = [];

      for (const field of [
        "variants",
        "variant_products",
        "color_variants",
      ] as const) {
        if (Array.isArray(owner?.[field])) {
          rows.push(...owner[field]);
        }
      }

      return rows;
    };

    for (let pass = 0; pass < 8; pass++) {
      let changed = false;

      for (const owner of candidates) {
        if (!owner?.id) continue;

        const ownerId = String(owner.id);
        const rows = getLinks(owner);

        const explicitlyRelated = rows.some((row) =>
          familyIds.has(
            String(row?.product_id ?? row?.id ?? ""),
          ),
        );

        const parentRelated =
          owner.parent_product_id != null &&
          familyIds.has(String(owner.parent_product_id));

        if (
          !familyIds.has(ownerId) &&
          !explicitlyRelated &&
          !parentRelated
        ) {
          continue;
        }

        if (!familyIds.has(ownerId)) {
          familyIds.add(ownerId);
          changed = true;
        }

        for (const row of rows) {
          const linkedId = row?.product_id ?? row?.id;

          if (linkedId == null) continue;

          const id = String(linkedId);

          if (!familyIds.has(id)) {
            familyIds.add(id);
            changed = true;
          }

          const signature = `${ownerId}:${id}`;

          if (!seenRows.has(signature)) {
            linkRows.push(row);
            seenRows.add(signature);
          }
        }
      }

      if (!changed) break;
    }

    for (const row of getLinks(product)) {
      const linkedId = row?.product_id ?? row?.id;

      if (linkedId == null) continue;

      familyIds.add(String(linkedId));
      linkRows.push(row);
    }

    const byId = new Map<string, any>();

    for (const row of linkRows) {
      const id = row?.product_id ?? row?.id;

      if (id != null) {
        byId.set(String(id), row);
      }
    }

    for (const id of familyIds) {
      const full = pool.get(id);

      if (full) {
        byId.set(id, {
          ...byId.get(id),
          ...full,
          hax_color:
            byId.get(id)?.hax_color ?? full.hax_color,
          product_variant_id:
            byId.get(id)?.product_variant_id ??
            full.product_variant_id,
        });
      }
    }

    if (!byId.has(currentId)) {
      byId.set(currentId, product);
    }

    return [...byId.entries()].map(([key, value]) => {
      const label =
        variantLabel(value) || `Option ${key}`;

      const color = detectColor(label);

      const apiHex = String(
        value?.hax_color ??
          value?.hex_color ??
          value?.hex_code ??
          value?.color_hex ??
          value?.hex ??
          "",
      ).trim();

      const hex = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(
        apiHex,
      )
        ? apiHex
        : (color && COLOR_HEX[color]) || "";

      const image =
        getVariantImage(value) ||
        (key === currentId ? images[0] : "");

      return {
        key,
        name: String(
          value?.name ??
            value?.product?.name ??
            label,
        ),
        label: color || label,
        color,
        hex,
        image,
        images: Array.isArray(value?.images)
          ? value.images
          : [],
        slug: value?.slug,
        productId: Number(key),
        variantId:
          value?.product_variant_id ?? value?.variant_id,
        isCurrent: key === currentId,
        stock: value?.stock_quantity,
        price:
          value?.retail_price ??
          value?.effective_price ??
          value?.price,

        // Retail MRP for the variant.
        // distributor_mrp intentionally excluded.
        mrp: getRetailMrp(value, 0),

        distributorPrice: value?.distributor_price,
        distributorMrp: value?.distributor_mrp,
        offerSource: value,
        allowed_purchsed: value?.allowed_purchsed,
        stockStatus:
          value?.stock_status ?? value?.stockStatus,
      };
    });
  }, [
    product,
    images,
    allProducts,
    similarApiList,
    listingVersion,
  ]);

  /* ---------------------------- SELECTED VARIANT ------------------------- */

  const [selectedVariantKey, setSelectedVariantKey] =
    useState<string | null>(null);

  useEffect(() => {
    setSelectedVariantKey(null);
  }, [product.id]);

  useEffect(() => {
    setImageIndex(0);
    setImageLoaded(false);
  }, [selectedVariantKey]);

  const selectedVariant =
    variantOptions.find(
      (variant) => variant.key === selectedVariantKey,
    ) ??
    variantOptions.find((variant) => variant.isCurrent) ??
    variantOptions[0];

  /* ---------------------------- SELECTED IMAGES -------------------------- */

  const selectedImages = useMemo(() => {
    if (!selectedVariant || selectedVariant.isCurrent) {
      return images;
    }

    const selectedId = String(selectedVariant.productId);

    const fullSibling = [
      ...(Array.isArray(allProducts) ? allProducts : []),
      ...similarApiList,
      ...Array.from(listedProducts.values()),
    ].find(
      (item: any) =>
        String(item?.id) === selectedId &&
        Array.isArray(item?.images) &&
        item.images.length > 0,
    );

    const fullGallery =
      fullSibling?.images ??
      selectedVariant.images ??
      [];

    const gallery = (
      Array.isArray(fullGallery) ? fullGallery : []
    )
      .map((item: any) => ({
        url: normalizeImageUrl(
          typeof item === "string"
            ? item
            : item?.image_url ?? item?.url,
        ),
        order:
          typeof item === "string"
            ? 0
            : num(item?.sort_order),
        primary:
          typeof item === "string"
            ? false
            : Boolean(item?.is_primary),
      }))
      .filter((item) => item.url)
      .sort(
        (a, b) =>
          Number(b.primary) - Number(a.primary) ||
          a.order - b.order,
      )
      .map((item) => item.url);

    const thumbnail = normalizeImageUrl(
      selectedVariant.image,
    );

    const result = [
      ...new Set([...gallery, thumbnail].filter(Boolean)),
    ];

    return result.length > 0 ? result : images;
  }, [
    selectedVariant,
    images,
    allProducts,
    similarApiList,
    listingVersion,
  ]);

  const displayedImage =
    selectedImages[imageIndex] ??
    selectedImages[0] ??
    images[0];

  const displayedProductName =
    selectedVariant?.name || productName;

  const displayedProductUrl = selectedVariant?.slug
    ? `/product/${encodeURIComponent(selectedVariant.slug)}`
    : productUrl;

  /* ---------------------------------------------------------------------- */
  /* SELECTED VARIANT PRICE                                                  */
  /* ---------------------------------------------------------------------- */

  const selectedRetailPrice = num(selectedVariant?.price);

  const selectedDistributorPrice = num(
    selectedVariant?.distributorPrice,
  );

  const selectedRetailMrp = num(selectedVariant?.mrp);

  const displayedPrice =
    selectedVariant && !selectedVariant.isCurrent
      ? isDistributor && selectedDistributorPrice > 0
        ? distributorOfferPrice(
            selectedVariant?.offerSource,
            selectedDistributorPrice,
          )
        : selectedRetailPrice
      : price;

  /**
   * Always show the retail MRP as the crossed price.
   * Never show distributor_mrp here.
   */
  const displayedMrp =
    selectedVariant && !selectedVariant.isCurrent
      ? getRetailMrp(
          selectedVariant?.offerSource,
          selectedRetailMrp > 0
            ? selectedRetailMrp
            : selectedRetailPrice,
        )
      : mrp;

  const displayedDiscount =
    displayedPrice > 0 && displayedMrp > displayedPrice
      ? Math.round(
          ((displayedMrp - displayedPrice) / displayedMrp) *
            100,
        )
      : 0;

  /* ---------------------------- SELECTED PRODUCT STOCK ------------------- */

  const selectedPurchaseSource =
    selectedVariant && !selectedVariant.isCurrent
      ? [
          ...(Array.isArray(allProducts) ? allProducts : []),
          ...similarApiList,
          ...Array.from(listedProducts.values()),
        ].find(
          (entry: any) =>
            String(entry?.id) ===
            String(selectedVariant.productId),
        ) ?? selectedVariant.offerSource
      : product;

  const purchaseWithoutStock =
    isPurchaseAllowedWithoutStock(selectedPurchaseSource);

  const selectedStockStatus = String(
    selectedVariant?.stockStatus ?? "",
  ).toLowerCase();

  const displayedStock = purchaseWithoutStock
    ? true
    : selectedVariant && !selectedVariant.isCurrent
      ? selectedStockStatus === "out_of_stock" ||
        selectedStockStatus === "inactive"
        ? false
        : selectedVariant.stock != null
          ? num(selectedVariant.stock) > 0
          : true
      : inStock;

  const selectedProductId =
    selectedVariant?.productId ?? product.id;

  const cartPayload = {
    product_id: selectedProductId,
    quantity: 1,
  };

  const totalImages = selectedImages.length;

  /* ------------------------------ SIMILAR PRODUCTS ----------------------- */

  const similarProducts = useMemo(() => {
    const activeId = String(
      selectedVariant?.productId ?? product.id,
    );

    const pool = new Map<string, any>();

    for (const candidate of [
      ...(Array.isArray(allProducts) ? allProducts : []),
      ...similarApiList,
      ...Array.from(listedProducts.values()),
      product,
    ]) {
      if (candidate?.id != null) {
        pool.set(String(candidate.id), candidate);
      }
    }

    return variantOptions
      .filter((variant) => variant.key !== activeId)
      .filter(
        (variant, index, all) =>
          all.findIndex(
            (entry) => entry.key === variant.key,
          ) === index,
      )
      .map((variant) => {
        const full = pool.get(String(variant.productId));

        const retail = num(
          full?.retail_price ?? variant.price ?? 0,
        );

        const distributor = num(full?.distributor_price);

        const sellingPrice =
          isDistributor && distributor > 0
            ? distributorOfferPrice(full ?? variant, distributor)
            : retail;

        // FIX: Crossed-out price is always retail MRP.
        const originalPrice = getRetailMrp(
          full ?? variant,
          num(variant.mrp) > 0
            ? num(variant.mrp)
            : retail,
        );

        const galleryImage = Array.isArray(full?.images)
          ? full.images
              .map((entry: any) =>
                normalizeImageUrl(
                  typeof entry === "string"
                    ? entry
                    : entry?.image_url ?? entry?.url,
                ),
              )
              .find(Boolean)
          : "";

        const image =
          normalizeImageUrl(variant.image) ||
          galleryImage ||
          normalizeImageUrl(full?.primary_image_url) ||
          PLACEHOLDER;

        const status = String(
          full?.stock_status ?? "",
        ).toLowerCase();

        const stock = isPurchaseAllowedWithoutStock(
          full ?? variant.offerSource,
        )
          ? true
          : full?.stock_quantity != null
            ? num(full.stock_quantity) > 0 &&
              status !== "out_of_stock"
            : true;

        const rawBrand =
          full?.brand_name ??
          full?.brand?.name ??
          product.brand_name ??
          product.brandName ??
          "";

        return {
          id: variant.productId,
          name: String(
            full?.name ?? variant.name ?? "Variant",
          ),
          slug: String(
            full?.slug ?? variant.slug ?? variant.productId,
          ),
          brand:
            typeof rawBrand === "string" ? rawBrand : "",
          category: String(
            typeof full?.category === "string"
              ? full.category
              : full?.category?.name ??
                  full?.category_name ??
                  categoryName ??
                  "",
          ),
          label: variant.label,
          hex: variant.hex,
          image,
          price: sellingPrice,
          originalPrice,
          discount:
            originalPrice > sellingPrice && sellingPrice > 0
              ? Math.round(
                  ((originalPrice - sellingPrice) /
                    originalPrice) *
                    100,
                )
              : 0,
          rating: num(
            full?.reviews_summary?.average_rating ??
              full?.reviews?.summary?.average_rating ??
              full?.rating,
          ),
          reviews: num(
            full?.reviews_summary?.total_reviews ??
              full?.reviews?.summary?.total_reviews ??
              full?.reviews,
          ),
          inStock: stock,
        };
      });
  }, [
    variantOptions,
    selectedVariant?.productId,
    product,
    allProducts,
    similarApiList,
    isDistributor,
    categoryName,
    listingVersion,
  ]);

  /* ---------------------------- CATEGORY SIMILAR ------------------------- */

  const categorySimilarProducts = useMemo(() => {
    if (!categoryId) return [];

    const excludedIds = new Set([
      String(product.id),
      ...variantOptions.map((variant) =>
        String(variant.productId),
      ),
    ]);

    const byId = new Map<string, Product>();

    for (const candidate of similarApiList as Product[]) {
      if (!candidate || candidate.id == null) continue;

      const candidateCategory =
        candidate.category_id ??
        candidate.categoryId ??
        (typeof candidate.category === "object"
          ? candidate.category?.id
          : null);

      if (
        candidateCategory != null &&
        Number(candidateCategory) !== categoryId
      ) {
        continue;
      }

      byId.set(String(candidate.id), candidate);
    }

    for (const candidate of allProducts ?? []) {
      if (!candidate || candidate.id == null) continue;

      const candidateCategory =
        candidate.category_id ??
        candidate.categoryId ??
        (typeof candidate.category === "object"
          ? candidate.category?.id
          : null);

      if (Number(candidateCategory) !== categoryId) continue;

      if (!byId.has(String(candidate.id))) {
        byId.set(String(candidate.id), candidate);
      }
    }

    return [...byId.values()]
      .filter(
        (candidate) =>
          !excludedIds.has(String(candidate.id)),
      )
      .slice(0, 18)
      .map((candidate) => {
        const retail = num(
          candidate.retail_price ??
            candidate.effective_price ??
            candidate.price,
        );

        const distributor = num(
          candidate.distributor_price,
        );

        const sellingPrice =
          isDistributor && distributor > 0
            ? distributorOfferPrice(candidate, distributor)
            : retail;

        // FIX: Retail MRP, not distributor_mrp/effective_mrp.
        const originalPrice = getRetailMrp(
          candidate,
          retail,
        );

        const rawBrand =
          candidate.brand_name ??
          candidate.brandName ??
          candidate.brand;

        const galleryImage = Array.isArray(candidate.images)
          ? candidate.images
              .map((image: any) =>
                normalizeImageUrl(
                  typeof image === "string"
                    ? image
                    : image?.image_url ?? image?.url,
                ),
              )
              .find(Boolean)
          : "";

        const stockStatus = String(
          candidate.stock_status ??
            candidate.stockStatus ??
            "",
        ).toLowerCase();

        const quantity =
          candidate.stock_quantity ??
          candidate.stockQuantity;

        const candidateInStock = isPurchaseAllowedWithoutStock(
          candidate,
        )
          ? true
          : typeof candidate.inStock === "boolean"
            ? candidate.inStock
            : ["out_of_stock", "sold_out", "inactive"].includes(
                  stockStatus,
                )
              ? false
              : quantity == null || num(quantity) > 0;

        const candidateCategoryName =
          typeof candidate.category === "string"
            ? candidate.category
            : candidate.category?.name ??
              candidate.category?.title ??
              candidate.category_name ??
              categoryName;

        return {
          id: candidate.id,
          name: String(candidate.name ?? "Product"),
          slug: String(
            candidate.slug || candidate.id,
          ),
          brand:
            typeof rawBrand === "string"
              ? rawBrand
              : rawBrand?.name ?? "",
          category: String(candidateCategoryName ?? ""),
          label: "",
          hex: "",
          image:
            galleryImage ||
            normalizeImageUrl(candidate.primary_image_url) ||
            normalizeImageUrl(candidate.image) ||
            PLACEHOLDER,
          price: sellingPrice,
          originalPrice,
          discount:
            sellingPrice > 0 &&
            originalPrice > sellingPrice
              ? Math.round(
                  ((originalPrice - sellingPrice) /
                    originalPrice) *
                    100,
                )
              : 0,
          rating: num(
            candidate.reviews_summary?.average_rating ??
              candidate.rating,
          ),
          reviews: num(
            candidate.reviews_summary?.total_reviews ??
              candidate.reviews,
          ),
          inStock: candidateInStock,
        };
      });
  }, [
    categoryId,
    product.id,
    variantOptions,
    similarApiList,
    allProducts,
    isDistributor,
    categoryName,
  ]);

  const isShowingVariants = similarProducts.length > 0;

  const drawerProducts = isShowingVariants
    ? similarProducts
    : categorySimilarProducts;

  const canShowSimilar = Boolean(
    categoryId ||
      isShowingVariants ||
      categorySimilarProducts.length,
  );

  /* --------------------------- AUTO IMAGE CHANGE ------------------------- */

  useEffect(() => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }

    if (hovered && totalImages > 1 && !isDragging) {
      hoverIntervalRef.current = setInterval(() => {
        setImageLoaded(false);

        setImageIndex(
          (previous) => (previous + 1) % totalImages,
        );
      }, 2700);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
        hoverIntervalRef.current = null;
      }
    };
  }, [hovered, totalImages, isDragging]);

  /* --------------------------- BADGE / PEOPLE BOUGHT --------------------- */

  const badge =
    product?.badge?.trim() ||
    (product?.is_deal_of_the_day
      ? "Deal of the Day"
      : product?.sale_type === "today_best"
        ? "Best Seller"
        : "");

  const peopleBought = num(
    product?.peopleBoughtThisWeek ??
      product?.people_bought_this_week,
  );

  /* -------------------------------- LOGIN -------------------------------- */

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

  /* ------------------------------ CARD CLICK ----------------------------- */

  const handleCardClick = () => {
    if (
      hasMoved.current ||
      Date.now() < suppressClickUntil.current
    ) {
      hasMoved.current = false;
      return;
    }

    if (!productSlug) {
      router.push("/products");
      return;
    }

    router.push(displayedProductUrl);
  };

  /* ------------------------------ DRAG HANDLERS -------------------------- */

  const getClientXY = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
  ): { x: number; y: number } => {
    if ("touches" in event) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }

    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleDragStart = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (totalImages <= 1) return;

    const { x, y } = getClientXY(event);

    dragStartX.current = x;
    dragStartY.current = y;
    dragLatestX.current = x;

    dragActiveRef.current = true;

    setIsDragging(true);
    hasMoved.current = false;
    setDragX(0);
  };

  const handleDragMove = (
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!dragActiveRef.current || totalImages <= 1) {
      return;
    }

    const { x, y } = getClientXY(event);

    dragLatestX.current = x;

    const dx = x - dragStartX.current;
    const dy = y - dragStartY.current;

    if (Math.abs(dx) > 5) {
      hasMoved.current = true;
    }

    if (Math.abs(dy) > Math.abs(dx)) return;

    const containerWidth =
      containerRef.current?.offsetWidth || 1;

    const maxDrag = containerWidth * 0.8;

    const clampedDx =
      Math.abs(dx) > maxDrag
        ? dx > 0
          ? maxDrag
          : -maxDrag
        : dx;

    setDragX(clampedDx);
  };

  const handleDragEnd = (
    event?:
      | React.MouseEvent<HTMLDivElement>
      | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!dragActiveRef.current) return;

    dragActiveRef.current = false;

    const finalX =
      event && "changedTouches" in event
        ? event.changedTouches[0]?.clientX ??
          dragLatestX.current
        : event && "clientX" in event
          ? event.clientX
          : dragLatestX.current;

    const dx = finalX - dragStartX.current;

    const threshold = Math.min(
      60,
      (containerRef.current?.offsetWidth || 300) * 0.18,
    );

    if (Math.abs(dx) >= threshold && totalImages > 1) {
      hasMoved.current = true;
      suppressClickUntil.current = Date.now() + 450;

      setImageLoaded(false);

      setImageIndex((previous) =>
        dx < 0
          ? (previous + 1) % totalImages
          : (previous - 1 + totalImages) % totalImages,
      );
    }

    setDragX(0);
    setIsDragging(false);
  };

  /* --------------------------- FRESH STOCK VALIDATION -------------------- */

  const actionLockRef = useRef(false);

  const checkFreshStock = async (): Promise<boolean> => {
    const id = Number(selectedProductId);
    const quantity = Number(cartPayload.quantity);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "Invalid product or quantity. Please refresh and try again.",
      );
    }

    if (purchaseWithoutStock) return true;

    let result;

    try {
      result = await checkProductStock({
        product_id: id,
        quantity,
      }).unwrap();
    } catch (error: any) {
      throw new Error(
        error?.data?.message ||
          "Unable to verify live stock. Please retry.",
      );
    }

    const stock = result?.data;

    if (
      result?.success !== true ||
      Number(stock?.product_id) !== id ||
      typeof stock?.available !== "boolean" ||
      !Number.isFinite(stock?.stock_quantity) ||
      stock.stock_quantity < 0
    ) {
      throw new Error(
        "Invalid stock API response. Please retry.",
      );
    }

    if (
      !stock.available ||
      stock.stock_quantity < quantity
    ) {
      throw new Error(
        "This product is currently out of stock or the requested quantity is unavailable.",
      );
    }

    return true;
  };

  const alertStockError = (error: unknown) => {
    const value = error as any;

    dispatch(
      showToast({
        message:
          value?.message ||
          value?.data?.message ||
          "Unable to check stock right now.",
        type: "error",
      }),
    );
  };

  /* -------------------------------- ADD TO CART -------------------------- */

  const handleAddToCart = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (!requireLogin() || actionLockRef.current) return;

    actionLockRef.current = true;
    setAdding(true);

    try {
      await checkFreshStock();

      await addToCart(
        cartPayload as Parameters<typeof addToCart>[0],
      ).unwrap();

      dispatch(
        showToast({
          message: `${displayedProductName} added to cart successfully! 🛒`,
          type: "success",
        }),
      );
    } catch (error) {
      alertStockError(error);
    } finally {
      actionLockRef.current = false;
      setAdding(false);
    }
  };

  /* -------------------------------- BUY NOW ------------------------------ */

  const handleBuyNow = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (!requireLogin() || actionLockRef.current) return;

    actionLockRef.current = true;
    setBuying(true);

    try {
      await checkFreshStock();

      const params = new URLSearchParams({
        checkout_type: "buy_now",
        product_id: String(selectedProductId),
        quantity: "1",
      });

      router.push(`/checkout?${params.toString()}`);
    } catch (error) {
      alertStockError(error);

      actionLockRef.current = false;
      setBuying(false);
    }
  };

  /* -------------------------------- WISHLIST ----------------------------- */

  const handleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (!requireLogin()) return;
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      if (wishlisted) {
        await removeFromWishlist({
          product_id: product.id,
        }).unwrap();

        setWishlisted(false);
      } else {
        await addToWishlist({
          product_id: product.id,
        }).unwrap();

        setWishlisted(true);
      }

      await refetchWishlist();
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            "Failed to update wishlist",
          type: "error",
        }),
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  /* ------------------------------ SIMILAR DRAWER ------------------------- */

  const handleViewSimilar = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setShowSimilarDrawer(true);
  };

  const handleCloseSimilar = () => {
    setShowSimilarDrawer(false);
  };

  /* ------------------------------ SIMILAR CARD --------------------------- */

  const renderSimilarCard = (item: any, index: number) => {
    const hasReviews =
      item.rating > 0 &&
      item.rating <= 5 &&
      item.reviews > 0;

    const hasMeta = Boolean(item.brand || item.category);

    const hasColor = Boolean(
      item.hex ||
        (item.label && !/^Option \d+$/i.test(item.label)),
    );

    const url = `/product/${encodeURIComponent(item.slug)}`;

    return (
      <motion.article
        key={item.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.22,
          delay: Math.min(index, 8) * 0.035,
        }}
        className="group/sim min-w-0 self-start overflow-hidden rounded-2xl border border-[#eae7e2] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cfc8bd] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)]"
      >
        <Link
          href={url}
          onClick={handleCloseSimilar}
          className="block"
        >
          <div className="relative aspect-square overflow-hidden bg-[#f8f7f5]">
            <img
              src={item.image || PLACEHOLDER}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/sim:scale-[1.045]"
              onError={(event) => {
                const img = event.currentTarget;

                if (!img.src.endsWith(PLACEHOLDER)) {
                  img.src = PLACEHOLDER;
                }
              }}
            />

            {item.discount > 0 && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#1a7543] shadow-sm">
                {item.discount}% OFF
              </span>
            )}

            {!item.inStock && (
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#191919]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                Sold out
              </span>
            )}
          </div>

          <div className="space-y-1.5 px-3 pb-2 pt-3">
            {hasMeta && (
              <div className="flex w-full min-w-0 items-baseline gap-1 text-[12px] leading-[17px]">
                {item.brand && (
                  <span className="max-w-[58%] shrink-0 truncate font-semibold text-[#191919]">
                    {item.brand}
                  </span>
                )}

                {item.category && (
                  <span className="min-w-0 flex-1 truncate font-normal text-[#424b5a]">
                    {item.brand
                      ? `| ${item.category}`
                      : item.category}
                  </span>
                )}
              </div>
            )}

            <h3
              className="truncate text-[11px] font-normal leading-[16px] text-[#657080]"
              title={item.name}
            >
              {item.name}
            </h3>

            {hasColor && (
              <div className="flex items-center gap-1.5">
                {item.hex && (
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                    style={{ backgroundColor: item.hex }}
                  />
                )}

                {item.label &&
                  !/^Option \d+$/i.test(item.label) && (
                    <span className="truncate text-[10px] capitalize text-[#766f65]">
                      {item.label}
                    </span>
                  )}
              </div>
            )}

            {hasReviews && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#4b4944]">
                <Star className="h-3 w-3 fill-[#e1ac39] text-[#e1ac39]" />

                {Number(item.rating).toFixed(1)}

                <span className="text-[#98938c]">
                  ({item.reviews})
                </span>
              </div>
            )}

            {/* SIMILAR PRODUCT PRICE */}

            {isDistributor ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px]">
                <span>
                  BA Price{" "}
                  <strong>₹{money(item.price)}</strong>
                </span>

                {item.originalPrice > 0 && (
                  <span className="text-[#767D85]">
                    Retail Price{" "}
                    <strong className="font-medium line-through decoration-[#9AA1A9] decoration-[1.5px]">
                      ₹{money(item.originalPrice)}
                    </strong>
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
                <strong className="text-[14px] font-bold leading-[20px] tracking-[-0.01em] text-[#141414]">
                  {item.price > 0
                    ? `₹${money(item.price)}`
                    : "View price"}
                </strong>

                {item.price > 0 &&
                  item.originalPrice > item.price && (
                    <span className="text-[10px] text-[#9d9994] line-through">
                      ₹{money(item.originalPrice)}
                    </span>
                  )}
              </div>
            )}
          </div>
        </Link>

        <Link
          href={url}
          onClick={handleCloseSimilar}
          className="mx-3 mb-3 mt-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#1e1d1b] text-[11px] font-semibold text-white transition-colors hover:bg-[#4a3b2c]"
        >
          {isShowingVariants ? "View Variant" : "View Product"}

          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </motion.article>
    );
  };

  /* -------------------------------- UI ----------------------------------- */

  return (
    <>
      <motion.article
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        transition={{ duration: 0.22 }}
        className="group relative flex h-auto w-full min-w-0 cursor-pointer flex-col self-start overflow-hidden rounded-[12px] border border-[#eaeaea] bg-white shadow-none transition-[border-color,box-shadow] duration-200 hover:border-[#e4e4e4] hover:shadow-[0_2px_5px_rgba(15,23,42,0.04)]"
      >
        {/* PRODUCT IMAGE */}

        <div
          ref={containerRef}
          className="relative aspect-square w-full select-none overflow-hidden bg-[#faf9f7]"
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
            touchAction:
              totalImages > 1 ? "pan-y" : "auto",
          }}
        >
          {!imageLoaded && (
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-[#f0eeea]" />
          )}

          <motion.img
            key={`${product.id}-${selectedVariant?.key ?? ""}-${imageIndex}`}
            src={displayedImage || placeholder.src}
            alt={displayedProductName}
            loading="lazy"
            draggable={false}
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ x: dragX }}
            animate={{
              x: dragX,
              scale: hovered && !isDragging ? 1.035 : 1,
            }}
            transition={
              isDragging
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 320,
                    damping: 32,
                  }
            }
            onLoad={() => setImageLoaded(true)}
            onError={(event) => {
              const img = event.currentTarget;

              if (!img.src.endsWith(PLACEHOLDER)) {
                img.src = PLACEHOLDER;
              }

              setImageLoaded(true);
            }}
          />

          {!displayedStock && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/45 backdrop-blur-[1px]">
              <span className="rounded-lg bg-[#252422] px-3.5 py-2 text-[11px] font-semibold text-white shadow-md">
                Sold out
              </span>
            </div>
          )}

          {/* WISHLIST */}

          <button
            type="button"
            onClick={handleWishlist}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            disabled={wishlistLoading}
            aria-label={
              wishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={wishlisted}
            className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#262420] shadow-[0_3px_12px_rgba(0,0,0,0.09)] backdrop-blur-sm transition-all hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252422] sm:right-3 sm:top-3 ${
              wishlisted
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            }`}
          >
            {wishlistLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#262420] border-t-transparent" />
            ) : (
              <Heart
                className={`h-[17px] w-[17px] ${
                  wishlisted
                    ? "fill-[#d64359] text-[#d64359]"
                    : "text-[#262420]"
                }`}
                strokeWidth={1.8}
              />
            )}
          </button>

          {/* IMAGE DOTS */}

          {totalImages > 1 && (
            <div
              className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-[5px] rounded-full bg-white/90 px-[9px] py-[7px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-opacity duration-150 md:left-1/2 md:-translate-x-1/2 md:group-hover:opacity-0"
              onClick={(event) => event.stopPropagation()}
              aria-label={`Product image ${imageIndex + 1} of ${totalImages}`}
            >
              {Array.from(
                { length: Math.min(totalImages, 5) },
                (_, position) => {
                  const count = Math.min(totalImages, 5);

                  const first = Math.max(
                    0,
                    Math.min(
                      imageIndex - Math.floor(count / 2),
                      totalImages - count,
                    ),
                  );

                  const actualIndex = first + position;
                  const active = actualIndex === imageIndex;

                  return (
                    <button
                      key={actualIndex}
                      type="button"
                      aria-label={`View image ${actualIndex + 1}`}
                      aria-current={
                        active ? "true" : undefined
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        setImageIndex(actualIndex);
                        setImageLoaded(false);
                      }}
                      onMouseDown={(event) =>
                        event.stopPropagation()
                      }
                      onTouchStart={(event) =>
                        event.stopPropagation()
                      }
                      className={`h-[5px] shrink-0 rounded-full transition-all duration-200 ${
                        active
                          ? "w-[16px] bg-[#171717]"
                          : "w-[5px] bg-[#c7c7c7] hover:bg-[#777]"
                      }`}
                    />
                  );
                },
              )}
            </div>
          )}

          {/* VIEW SIMILAR */}

          {canShowSimilar && (
            <button
              type="button"
              onClick={handleViewSimilar}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onTouchStart={(event) =>
                event.stopPropagation()
              }
              aria-label="View Similar"
              title="View Similar"
              className={`absolute ${
                totalImages > 1
                  ? "bottom-[38px]"
                  : "bottom-2"
              } right-2 z-30 inline-flex h-[30px] items-center justify-center gap-[5px] whitespace-nowrap rounded-full border border-white/85 bg-white/95 px-[10px] text-[10px] font-semibold text-[#171717] shadow-[0_5px_16px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:bottom-3 md:left-1/2 md:right-auto md:h-[34px] md:-translate-x-1/2 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100`}
            >
              <Layers3
                className="h-[13px] w-[13px]"
                strokeWidth={1.9}
              />

              View Similar
            </button>
          )}
        </div>

        {/* PRODUCT DETAILS */}

        <div className="flex min-w-0 flex-col px-[9px] pb-[10px] pt-[7px]">

          {/* RATING */}

          {hasRating && (
            <span className="mb-[5px] inline-flex w-fit items-center gap-[4px] rounded-full bg-[#f4f4f4] px-[6px] py-[3px] text-[10px] leading-none text-[#111]">
              <span className="font-semibold">
                {rating.toFixed(1)}
              </span>

              <Star className="h-[10px] w-[10px] fill-[#238b43] text-[#238b43]" />

              <span className="text-[#777]">
                | {reviewCount}
              </span>
            </span>
          )}

          {/* BRAND | CATEGORY */}

          {(brandName || categoryName) && (
            <div
              className="flex w-full min-w-0 items-baseline gap-[5px] text-[12px] leading-[17px]"
              title={[brandName, categoryName]
                .filter(Boolean)
                .join(" | ")}
            >
              {brandName && (
                <span className="max-w-[55%] shrink-0 truncate font-semibold text-[#050505]">
                  {brandName}
                </span>
              )}

              {brandName && categoryName && (
                <span className="shrink-0 text-[#050505]">
                  |
                </span>
              )}

              {categoryName && (
                <span className="min-w-0 flex-1 truncate font-normal text-[#374151]">
                  {categoryName}
                </span>
              )}
            </div>
          )}

          {/* PRODUCT NAME */}

          <p
            className="mt-[3px] block w-full min-w-0 truncate text-[12px] font-normal leading-[17px] text-[#5e6673]"
            title={displayedProductName}
          >
            {displayedProductName}
          </p>

          {/* VARIANTS */}

          {variantOptions.length > 1 && (
            <div
              className="mt-[7px] flex min-w-0 items-center gap-[7px]"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.08em] text-[#757575]">
                {variantOptions.some(
                  (option) => option.color,
                )
                  ? "Color"
                  : "Option"}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-[7px] overflow-x-auto py-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {variantOptions.map((option) => {
                  const active =
                    selectedVariant?.key === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      title={option.label}
                      aria-label={`Select ${option.label}`}
                      aria-pressed={active}
                      onClick={(event) => {
                        event.stopPropagation();

                        setSelectedVariantKey(option.key);
                        setImageIndex(0);
                        setImageLoaded(false);
                      }}
                      className={`flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border bg-white p-[2px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                        active
                          ? "border-[#171717]"
                          : "border-[#dadada] hover:border-[#777]"
                      }`}
                    >
                      {option.hex ? (
                        <span
                          className="h-[13px] w-[13px] rounded-full border border-black/10"
                          style={{
                            backgroundColor: option.hex,
                          }}
                        />
                      ) : option.image ? (
                        <img
                          src={option.image}
                          alt=""
                          className="h-[13px] w-[13px] rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[7px] font-semibold text-[#444]">
                          {option.label
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRICE */}

          {isDistributor ? (
            <div className="mt-[7px] flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {displayedPrice > 0 ? (
                <span className="text-[12px] text-[#555]">
                  BA Price{" "}
                  <strong className="text-[14px] text-[#141414]">
                    ₹{money(displayedPrice)}
                  </strong>
                </span>
              ) : (
                <span className="text-[11px] text-[#555]">
                  View price
                </span>
              )}

              {displayedMrp > 0 && (
                <span className="text-[12px] text-[#7B838B]">
                  Retail Price{" "}
                  <strong className="text-[13px] font-medium text-[#7B838B] line-through decoration-[#9AA1A9] decoration-[1.5px]">
                    ₹{money(displayedMrp)}
                  </strong>
                </span>
              )}
            </div>
          ) : (
            <div className="mt-[7px] flex min-w-0 flex-wrap items-baseline gap-x-[6px] gap-y-[2px]">
              {displayedPrice > 0 ? (
                <span className="text-[14px] font-bold leading-[20px] tracking-[-0.01em] text-[#141414]">
                  ₹{money(displayedPrice)}
                </span>
              ) : (
                <span className="text-[11px] font-semibold leading-[20px] text-[#555]">
                  View price
                </span>
              )}

              {displayedPrice > 0 &&
                displayedMrp > displayedPrice && (
                  <span className="text-[11px] leading-[16px] text-[#999] line-through">
                    ₹{money(displayedMrp)}
                  </span>
                )}

              {displayedDiscount > 0 && (
                <span className="rounded-[4px] bg-[#EFF9F1] px-[5px] py-[2px] text-[10px] font-bold leading-[16px] text-[#16803A]">
                  {displayedDiscount}% OFF
                </span>
              )}
            </div>
          )}

          {/* PEOPLE BOUGHT */}

          {peopleBought > 0 && (
            <p className="mt-[5px] truncate text-[10px] font-normal leading-[14px] text-[#444]">
              {peopleBought} people bought this week
            </p>
          )}

          {/* LOW STOCK */}

          {lowStock &&
            !purchaseWithoutStock &&
            displayedStock &&
            selectedVariant?.isCurrent !== false && (
              <p className="mt-[5px] text-[11px] font-semibold leading-[14px] text-[#B84460]">
                Only {stockQuantity} Left In Stock!
              </p>
            )}

          {/* BADGE */}

          {badge && displayedStock && (
            <span className="mt-[7px] inline-flex w-fit items-center rounded-md bg-[#FFF1E8] px-[10px] py-[5px] text-[10px] font-medium leading-none text-[#F36B36]">
              {badge}
            </span>
          )}

          {/* ACTION BUTTONS */}

          {!displayedStock ? (
            <button
              type="button"
              disabled
              className="mt-[9px] flex h-[34px] w-full cursor-not-allowed items-center justify-center rounded-[8px] bg-[#efefef] text-[10px] font-semibold text-[#777]"
            >
              Sold Out
            </button>
          ) : displayedPrice <= 0 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push(displayedProductUrl);
              }}
              className="mt-[9px] inline-flex h-[34px] w-full items-center justify-center gap-1 rounded-[8px] bg-[#111] text-[10px] font-semibold text-white hover:bg-black"
            >
              View Details

              <ArrowUpRight className="h-[13px] w-[13px]" />
            </button>
          ) : (
            <div className="mt-[9px] flex w-full items-center gap-[6px]">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buying || adding}
                className="flex h-[34px] min-w-0 flex-1 items-center justify-center rounded-[8px] bg-[#111] px-1 text-[10px] font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
              >
                {buying ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Buy Now"
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || buying}
                aria-label="Add to cart"
                className="flex h-[34px] min-w-0 flex-[1.1] items-center justify-center gap-1 rounded-[8px] border border-[#dedbd4] bg-white px-[5px] text-[10px] font-semibold text-[#222] transition hover:border-[#111] hover:bg-[#111] hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {adding ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <ShoppingCart
                      className="h-[14px] w-[14px] shrink-0"
                      strokeWidth={1.7}
                    />

                    <span className="truncate">
                      Add to Cart
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.article>

      {/* SIMILAR PRODUCTS DRAWER */}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {showSimilarDrawer && (
              <>
                <motion.div
                  key="similar-backdrop"
                  className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[1.5px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  onClick={handleCloseSimilar}
                  aria-hidden="true"
                />

                <motion.aside
                  key="similar-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="similar-products-title"
                  className="fixed right-0 top-0 z-[9999] flex h-[100dvh] w-[min(520px,92vw)] flex-col overflow-hidden bg-white shadow-[-18px_0_50px_rgba(0,0,0,0.14)]"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    duration: 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {/* DRAWER HEADER */}

                  <div className="flex shrink-0 items-center justify-between border-b border-[#ECECEC] bg-white px-4 py-4 sm:px-5">
                    <div className="min-w-0 pr-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                        {isShowingVariants
                          ? "More colours & variations"
                          : "Explore the same collection"}
                      </p>

                      <h2
                        id="similar-products-title"
                        className="mt-1 text-[19px] font-semibold leading-tight text-[#111] sm:text-[21px]"
                      >
                        {isShowingVariants
                          ? "Other variants"
                          : "Similar products"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseSimilar}
                      aria-label="Close similar products"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-[#111] transition hover:bg-[#E8E8E8] active:scale-95"
                    >
                      <X
                        className="h-[18px] w-[18px]"
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* DRAWER CONTENT */}

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-7 pt-4 sm:px-5 sm:pt-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D5D5D5] [&::-webkit-scrollbar-track]:bg-transparent">
                    {!isShowingVariants &&
                      drawerProducts.length === 0 &&
                      (isSimilarFetching || isSimilarLoading) && (
                        <div
                          className="grid grid-cols-2 gap-3"
                          aria-label="Loading similar products"
                        >
                          {[0, 1, 2, 3].map((index) => (
                            <div
                              key={index}
                              className="animate-pulse overflow-hidden rounded-xl border border-[#eee]"
                            >
                              <div className="aspect-square bg-[#f2f2f2]" />

                              <div className="space-y-2 p-3">
                                <div className="h-3 w-4/5 rounded bg-[#f2f2f2]" />
                                <div className="h-3 w-3/5 rounded bg-[#f2f2f2]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* EMPTY STATE */}

                    {drawerProducts.length === 0 &&
                      !isSimilarFetching &&
                      !isSimilarLoading && (
                        <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                          <div className="text-4xl">
                            🛍️
                          </div>

                          <p className="mt-4 text-[14px] font-medium text-[#555]">
                            No similar products available
                          </p>

                          <p className="mt-1.5 text-[11px] leading-5 text-[#999]">
                            Related products will appear here when available.
                          </p>
                        </div>
                      )}

                    {/* PRODUCTS GRID */}

                    {drawerProducts.length > 0 && (
                      <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                        {drawerProducts.map((item, index) =>
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

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD EXPORT                                                        */
/* -------------------------------------------------------------------------- */

export default function ProductCard(props: ProductCardProps) {
  const item = props?.product;

  if (
    !item ||
    typeof item !== "object" ||
    item.id === null ||
    item.id === undefined
  ) {
    return null;
  }

  return <ProductCardInner {...props} product={item} />;
}
