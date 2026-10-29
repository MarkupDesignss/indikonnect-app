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

import Fallback from "../../../public/indiekonnect-web/images/test.jpg";

import { getAppType } from "@/lib/appConfig";

// =========================================================    TYPES   =========================================================

interface ProductImage {
  id?: number;

  image_url?: string;

  url?: string;

  is_primary?: boolean;

  sort_order?: number;
}

export interface Product {
  id: number | string;

  is_primary?: number | boolean | string;

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

  allProducts?: Product[]; // Optional: full API data if listing strips nested variants
}

// Shared listing registry: sibling cards can discover variants even when

// their own API `variants` array is empty and `allProducts` is not passed.

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

  if (changed) listingListeners.forEach((notify) => notify());
}

// =========================================================    HELPERS   =========================================================

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

  let url = String(value)
    .trim()
    .replace(/\\\\\\\\/g, "");

  if (url.startsWith("http\\://")) url = "https\\://" + url.slice(7);

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

// =========================================================    PRODUCT CARD   =========================================================

function ProductCardInner({
  product,

  hasToken: hasTokenProp,

  allProducts,
}: ProductCardProps) {
  const router = useRouter();

  const dispatch = useDispatch();

  const { hasToken: hasTokenHook, appType } = useTokenCheck();

  const hasToken = hasTokenProp ?? hasTokenHook;

  // =======================================================    APP TYPE   =======================================================

  const currentAppType = useMemo(() => {
    if (typeof window !== "undefined") return getAppType();

    return appType;
  }, [appType]);

  const isDistributor = currentAppType === "distributor";

  const placeholder = Fallback;

  // =======================================================    STATE   =======================================================

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

  // =======================================================    DRAG STATE   =======================================================

  const [dragX, setDragX] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const hasMoved = useRef(false);

  const dragStartX = useRef(0);

  const dragStartY = useRef(0);

  const dragLatestX = useRef(0);

  const dragActiveRef = useRef(false);

  const suppressClickUntil = useRef(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =======================================================    API   =======================================================

  const [addToCart] = useAddToCartMutation();
  const [checkProductStock] = useCheckProductStockMutation();

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
    skip:
      !categoryId ||
      (!showSimilarDrawer &&
        Number(categoryId) !== 6 &&
        !(Array.isArray(product?.variants) && product.variants.length > 0) &&
        !(
          Array.isArray(product?.variant_products) &&
          product.variant_products.length > 0
        )),
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

  // =======================================================    WISHLIST SYNC   =======================================================

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

  // =======================================================    RESET IMAGE ON PRODUCT CHANGE   =======================================================

  useEffect(() => {
    setImageIndex(0);

    setImageLoaded(false);

    setDragX(0);
  }, [product?.id]);

  // =======================================================    LOCK PAGE SCROLL WHILE DRAWER IS OPEN   =======================================================

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

  // =======================================================    ESC KEY CLOSE DRAWER   =======================================================

  useEffect(() => {
    if (!showSimilarDrawer) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSimilarDrawer(false);
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [showSimilarDrawer]);

  // =======================================================    BASIC DATA   =======================================================

  const brandName =
    product?.brand_name?.trim() ||
    product?.brandName?.trim() ||
    product?.brand?.trim() ||
    "";

  // The API returns category.name. Some listing pages flatten or omit it.

  // Recover known category IDs from the supplied API when the nested object is missing.

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

  // =======================================================    PRICE   =======================================================

  // Use the correct retail/distributor price fields. A zero distributor value
  // means unavailable pricing data, not a free product.
  const retailPrice = num(
    product?.retail_price ?? product?.effective_price ?? product?.price,
  );
  const distributorPrice = num(product?.distributor_price);
  const price =
    isDistributor && distributorPrice > 0 ? distributorPrice : retailPrice;

  const retailMrp = num(
    product?.retail_mrp ?? product?.effective_mrp ?? product?.originalPrice,
  );
  const distributorMrp = num(product?.distributor_mrp);
  const mrp = isDistributor && distributorMrp > 0 ? distributorMrp : retailMrp;

  // Only a real difference between MRP and selling price counts as a discount.
  const discount =
    mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // =======================================================    STOCK   =======================================================

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

  // =======================================================    RATING   =======================================================

  const rating =
    num(product?.reviews_summary?.average_rating) || num(product?.rating);

  const reviewCount =
    num(product?.reviews_summary?.total_reviews) || num(product?.reviews);

  // =======================================================    IMAGES   =======================================================

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

  const [listingVersion, setListingVersion] = useState(0);

  useEffect(() => {
    const notify = () => setListingVersion((version) => version + 1);

    listingListeners.add(notify);

    registerListedProducts([
      product,

      ...(Array.isArray(allProducts) ? allProducts : []),
    ]);

    return () => {
      listingListeners.delete(notify);
    };
  }, [product, allProducts]);

  // API contract: parent product 21 contains variants [{ product_id: 22 }, { product_id: 23 }].

  // Child products 22/23 have variants: []. Pass allProducts={apiResponse.data}

  // from the listing page so every sibling can resolve the same family.

  const variantOptions = useMemo(() => {
    const pool = new Map<string, Product>();

    for (const item of listedProducts.values()) pool.set(String(item.id), item);

    for (const item of allProducts ?? []) {
      if (item?.id != null) pool.set(String(item.id), item);
    }

    // Category response contains parent links even when listing cards only receive child records.

    for (const item of similarApiList) {
      if (item?.id != null) pool.set(String(item.id), item);
    }

    pool.set(String(product.id), product);

    const currentId = String(product.id);

    const candidates = [...pool.values()];

    const isLinkedTo = (candidate: Product, id: string) =>
      Array.isArray(candidate.variants) &&
      candidate.variants.some(
        (v: any) => String(v?.product_id ?? v?.id) === id,
      );

    // The API exposes sibling links on every product (e.g. 21 -> 22,23;
    // 22 -> 21,23). Traverse only explicit product_id links, not the category.
    // Also support reverse links so non-primary cards can discover their family.
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
        if (Array.isArray(owner?.[field])) rows.push(...owner[field]);
      }
      return rows;
    };

    // Link records contain correct variant names/images even when the listing
    // omits the full (non-primary) sibling product.
    for (let pass = 0; pass < 8; pass++) {
      let changed = false;
      for (const owner of candidates) {
        if (!owner?.id) continue;
        const ownerId = String(owner.id);
        const rows = getLinks(owner);
        const explicitlyRelated = rows.some((row) =>
          familyIds.has(String(row?.product_id ?? row?.id ?? "")),
        );
        const parentRelated =
          owner.parent_product_id != null &&
          familyIds.has(String(owner.parent_product_id));

        if (!familyIds.has(ownerId) && !explicitlyRelated && !parentRelated)
          continue;
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

    // The original API response can contain an explicit link solely in the
    // current card (even if none of its siblings have full records).
    for (const row of getLinks(product)) {
      const linkedId = row?.product_id ?? row?.id;
      if (linkedId == null) continue;
      familyIds.add(String(linkedId));
      linkRows.push(row);
    }

    const byId = new Map<string, any>();

    // Lightweight variant links supply hax_color / image; full product supplies price / stock.

    for (const row of linkRows) {
      const id = row?.product_id ?? row?.id;

      if (id != null) byId.set(String(id), row);
    }

    for (const id of familyIds) {
      const full = pool.get(id);

      if (full)
        byId.set(id, {
          ...byId.get(id),

          ...full,

          hax_color: byId.get(id)?.hax_color ?? full.hax_color,

          product_variant_id:
            byId.get(id)?.product_variant_id ?? full.product_variant_id,
        });
    }

    if (!byId.has(currentId)) byId.set(currentId, product);

    return [...byId.entries()].map(([key, v]) => {
      const label = variantLabel(v) || `Option ${key}`;

      const color = detectColor(label);

      const apiHex = String(
        v?.hax_color ??
        v?.hex_color ??
        v?.hex_code ??
        v?.color_hex ??
        v?.hex ??
        "",
      ).trim();

      // API color code is authoritative; use a name-based fallback only if absent.

      const hex = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(apiHex)
        ? apiHex
        : (color && COLOR_HEX[color]) || "";

      const image = getVariantImage(v) || (key === currentId ? images[0] : "");

      return {
        key,

        name: String(v?.name ?? v?.product?.name ?? label),

        label: color || label,

        color,

        hex,

        image,

        images: Array.isArray(v?.images) ? v.images : [],

        slug: v?.slug,

        productId: Number(key),

        variantId: v?.product_variant_id ?? v?.variant_id,

        isCurrent: key === currentId,

        stock: v?.stock_quantity,

        price: v?.effective_price ?? v?.retail_price ?? v?.price,

        mrp: v?.effective_mrp ?? v?.retail_mrp ?? v?.originalPrice,
      };
    });
  }, [product, images, allProducts, similarApiList, listingVersion]);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSelectedVariantKey(null);
  }, [product.id]);

  useEffect(() => {
    setImageIndex(0);

    setImageLoaded(false);
  }, [selectedVariantKey]);

  const selectedVariant =
    variantOptions.find((v) => v.key === selectedVariantKey) ??
    variantOptions.find((v) => v.isCurrent) ??
    variantOptions[0];

  // Switching a swatch updates this card in place, including its image gallery.

  const selectedImages = useMemo(() => {
    if (!selectedVariant || selectedVariant.isCurrent) return images;

    // Lightweight variant links usually contain only one thumbnail.
    // Resolve the FULL sibling product so its entire image gallery is draggable.
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

    const fullGallery = fullSibling?.images ?? selectedVariant.images ?? [];
    const gallery = (Array.isArray(fullGallery) ? fullGallery : [])
      .map((item: any) => ({
        url: normalizeImageUrl(
          typeof item === "string" ? item : (item?.image_url ?? item?.url),
        ),
        order: typeof item === "string" ? 0 : num(item?.sort_order),
        primary: typeof item === "string" ? false : Boolean(item?.is_primary),
      }))
      .filter((item) => item.url)
      .sort(
        (a, b) => Number(b.primary) - Number(a.primary) || a.order - b.order,
      )
      .map((item) => item.url);

    const thumbnail = normalizeImageUrl(selectedVariant.image);
    // Gallery images take priority. Do not replace them with the parent gallery.
    const result = [...new Set([...gallery, thumbnail].filter(Boolean))];
    return result.length > 0 ? result : images;
  }, [selectedVariant, images, allProducts, similarApiList, listingVersion]);

  const displayedImage =
    selectedImages[imageIndex] ?? selectedImages[0] ?? images[0];

  const displayedProductName = selectedVariant?.name || productName;

  const displayedProductUrl = selectedVariant?.slug
    ? `/product/${encodeURIComponent(selectedVariant.slug)}`
    : productUrl;

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

  const cartPayload = {
    product_id: selectedProductId,

    quantity: 1,
  };

  const totalImages = selectedImages.length;

  // =======================================================    SIMILAR PRODUCTS   =======================================================

  // Show only explicitly linked variants of this product family, never random category items.
  const similarProducts = useMemo(() => {
    const activeId = String(selectedVariant?.productId ?? product.id);
    const pool = new Map<string, any>();
    for (const candidate of [
      ...(Array.isArray(allProducts) ? allProducts : []),
      ...similarApiList,
      ...Array.from(listedProducts.values()),
      product,
    ]) {
      if (candidate?.id != null) pool.set(String(candidate.id), candidate);
    }

    return variantOptions
      .filter((variant) => variant.key !== activeId)
      .filter(
        (variant, index, all) =>
          all.findIndex((entry) => entry.key === variant.key) === index,
      )
      .map((variant) => {
        const full = pool.get(String(variant.productId));
        const retail = num(full?.retail_price ?? variant.price ?? 0);
        const distributor = num(full?.distributor_price);
        const price = isDistributor && distributor > 0 ? distributor : retail;
        const retailMrp = num(full?.retail_mrp ?? variant.mrp);
        const distributorMrp = num(full?.distributor_mrp);
        const originalPrice =
          isDistributor && distributorMrp > 0 ? distributorMrp : retailMrp;
        const galleryImage = Array.isArray(full?.images)
          ? full.images
            .map((entry: any) =>
              normalizeImageUrl(
                typeof entry === "string"
                  ? entry
                  : (entry?.image_url ?? entry?.url),
              ),
            )
            .find(Boolean)
          : "";
        const image =
          normalizeImageUrl(variant.image) ||
          galleryImage ||
          normalizeImageUrl(full?.primary_image_url) ||
          PLACEHOLDER;
        const status = String(full?.stock_status ?? "").toLowerCase();
        const stock =
          full?.stock_quantity != null
            ? num(full.stock_quantity) > 0 && status !== "out_of_stock"
            : true;
        const rawBrand =
          full?.brand_name ??
          full?.brand?.name ??
          product.brand_name ??
          product.brandName ??
          "";
        return {
          id: variant.productId,
          name: String(full?.name ?? variant.name ?? "Variant"),
          slug: String(full?.slug ?? variant.slug ?? variant.productId),
          brand: typeof rawBrand === "string" ? rawBrand : "",
          category: String(
            full?.category?.name ?? full?.category_name ?? categoryName ?? "",
          ),
          label: variant.label,
          hex: variant.hex,
          image,
          price,
          originalPrice,
          discount:
            originalPrice > price && price > 0
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
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

  // =======================================================    AUTO IMAGE CHANGE ON HOVER   =======================================================

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

  // Do not reset imageIndex when hover ends: a completed swipe must stay visible.

  // =======================================================    BADGE / PEOPLE BOUGHT   =======================================================

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

  // =======================================================    LOGIN   =======================================================

  const requireLogin = (): boolean => {
    if (hasToken !== true) {
      const loginPath = `/auth/${isDistributor ? "distributor" : "customer"
        }/login`;

      router.push(loginPath);

      return false;
    }

    return true;
  };

  // =======================================================    CARD CLICK   =======================================================

  const handleCardClick = () => {
    if (hasMoved.current || Date.now() < suppressClickUntil.current) {
      hasMoved.current = false;

      return;
    }

    if (!productSlug) {
      router.push(`/products`);

      return;
    }

    router.push(displayedProductUrl);
  };

  // =======================================================    DRAG HANDLERS   =======================================================

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

    dragLatestX.current = x;

    dragActiveRef.current = true;

    setIsDragging(true);

    hasMoved.current = false;

    setDragX(0);
  };

  const handleDragMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!dragActiveRef.current || totalImages <= 1) return;

    const { x, y } = getClientXY(e);

    dragLatestX.current = x;

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

  const handleDragEnd = (
    e?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!dragActiveRef.current) return;

    dragActiveRef.current = false;

    // Touch end has no touches[0]; use changedTouches for the final position.

    const finalX =
      e && "changedTouches" in e
        ? (e.changedTouches[0]?.clientX ?? dragLatestX.current)
        : e && "clientX" in e
          ? e.clientX
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

      setImageIndex((prev) =>
        dx < 0
          ? (prev + 1) % totalImages
          : (prev - 1 + totalImages) % totalImages,
      );
    }

    setDragX(0);

    setIsDragging(false);
  };

  // =======================================================    FRESH STOCK VALIDATION   =======================================================

  // NOTE: `checkProductStock` already declares `invalidatesTags: ["Products"]`,
  // so every subscribed product query (listing, category, slug detail, by-id,
  // search) auto-refetches after each call. No manual dispatch is required.

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

    // Reusable RTK Query endpoint: HTTP GET with `cache: no-store`.
    // Uses the selected sibling PRODUCT id; no variant_id is passed.
    let result;
    try {
      result = await checkProductStock({ product_id: id, quantity }).unwrap();
    } catch (error: any) {
      throw new Error(
        error?.data?.message || "Unable to verify live stock. Please retry.",
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
      throw new Error("Invalid stock API response. Please retry.");
    }
    // NOTE: No manual dispatch(productApi.util.invalidateTags(["Products"]))
    // here — the mutation's own `invalidatesTags: ["Products"]` already
    // refetches all subscribed listing/category queries, including when
    // stock is now zero.
    if (!stock.available || stock.stock_quantity < quantity) {
      throw new Error(
        "This product is currently out of stock or the requested quantity is unavailable.",
      );
    }
    return true;
  };

  const alertStockError = (error: unknown) => {
    const e = error as any;
    dispatch(
      showToast({
        message:
          e?.message || e?.data?.message || "Unable to check stock right now.",
        type: "error",
      }),
    );
  };

  // =======================================================    ADD TO CART   =======================================================

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin() || actionLockRef.current) return;
    actionLockRef.current = true;
    setAdding(true);

    try {
      await checkFreshStock();
      // Backend add-to-cart must ALSO enforce current stock.
      await addToCart(cartPayload as Parameters<typeof addToCart>[0]).unwrap();
      // NOTE: No manual invalidateTags here — the checkProductStock mutation
      // above already triggered the auto-refetch via `invalidatesTags`.
      dispatch(
        showToast({
          message: `${displayedProductName} added to cart successfully! 🛒`,
          type: "success",
        }),
      );
      // Add to Cart retains the existing behavior: no checkout redirect.
    } catch (error) {
      alertStockError(error);
    } finally {
      actionLockRef.current = false;
      setAdding(false);
    }
  };

  // =======================================================    BUY NOW   =======================================================

  const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!requireLogin() || actionLockRef.current) return;
    actionLockRef.current = true;
    setBuying(true);

    try {
      await checkFreshStock();
      // Do not add to shopping cart. Only navigate AFTER successful verification.
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

  // =======================================================    WISHLIST   =======================================================

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

  // =======================================================    OPEN/CLOSE SIMILAR DRAWER   =======================================================

  const handleViewSimilar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setShowSimilarDrawer(true);
  };

  const handleCloseSimilar = () => {
    setShowSimilarDrawer(false);
  };

  // =======================================================    RENDER SIMILAR CARD   =======================================================

  const renderSimilarCard = (item: any, index: number) => (
    <motion.article
      key={item.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.035 }}
      className="group/sim flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ebe8e2] bg-white shadow-[0_3px_15px_rgba(20,20,20,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d5cec1] hover:shadow-[0_14px_30px_rgba(20,20,20,0.10)]"
    >
      <Link
        href={`/product/${encodeURIComponent(item.slug)}`}
        onClick={() => setShowSimilarDrawer(false)}
        className="block min-w-0"
      >
        <div className="relative aspect-[0.9] overflow-hidden bg-[#f8f7f4]">
          <Image
            src={item.image || PLACEHOLDER}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 46vw, 245px"
            className="object-contain p-3 transition-transform duration-500 group-hover/sim:scale-[1.06]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
          {item.discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-[#e5f5e9] px-2 py-1 text-[10px] font-bold text-[#167a3b]">
              {item.discount}% OFF
            </span>
          )}
          {!item.inStock && (
            <span className="absolute bottom-2 left-2 rounded-full bg-[#222] px-2 py-1 text-[10px] text-white">
              Out of stock
            </span>
          )}
        </div>
        <div className="space-y-1.5 px-3 pt-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.10em] text-[#70685d]">
            {item.brand || "Product"}
            {item.category ? `  |  ${item.category}` : ""}
          </p>
          <h3 className="line-clamp-2 min-h-[34px] text-[12px] font-semibold leading-[1.4] text-[#1a1a1a]">
            {item.name}
          </h3>
          <div className="flex items-center gap-1.5">
            {item.hex && (
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-sm"
                style={{ backgroundColor: item.hex }}
              />
            )}
            <span className="truncate text-[10px] capitalize text-[#797979]">
              {item.label}
            </span>
          </div>
          {item.reviews > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[#6a6a6a]">
              <Star className="h-3 w-3 fill-[#e2b558] text-[#e2b558]" />{" "}
              {item.rating.toFixed(1)} ({item.reviews})
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pb-1">
            <span className="text-[14px] font-bold text-[#171717]">
              {item.price > 0
                ? `₹${item.price.toLocaleString("en-IN")}`
                : "View price"}
            </span>
            {item.originalPrice > item.price && item.price > 0 && (
              <span className="text-[10px] text-[#999] line-through">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>
      <Link
        href={`/product/${encodeURIComponent(item.slug)}`}
        onClick={() => setShowSimilarDrawer(false)}
        className="mx-3 mb-3 mt-auto flex h-9 items-center justify-center rounded-lg bg-[#191919] text-[11px] font-semibold text-white transition-colors hover:bg-[#3b3125]"
      >
        View Variant <span className="ml-1.5">→</span>
      </Link>
    </motion.article>
  );

  // =======================================================    UI   =======================================================

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

              alt={displayedProductName}

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

            {/* Recommendations CTA remains visible on desktop and touch devices. */}

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
                    aria-label="View Similar"
                    title="View Similar"
                  >
                    <span
                      className="relative flex h-[14px] w-[16px] shrink-0 items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="absolute left-0 top-[3px] h-[9px] w-[7px] -rotate-12 rounded-[2px] border border-[#171717]" />
                      <span className="absolute right-0 top-[3px] h-[9px] w-[7px] rotate-12 rounded-[2px] border border-[#171717]" />
                      <span className="relative h-[11px] w-[8px] rounded-[2px] border border-[#171717] bg-white" />
                    </span>
                    View Similar
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

                  className={`block h-[5px] shrink-0 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isActive
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
            {rating > 0 && (
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
            )}
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

            title={displayedProductName}
          >
            {displayedProductName}
          </p>

          {/* Compact one-line variants: no oversized circle, no card height jump. */}

          {variantOptions.length > 1 && (
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
            <span className="text-[14px] font-bold leading-[20px] tracking-[-0.01em] text-[#141414]">
              ₹{money(displayedPrice)}
            </span>

            {displayedMrp > displayedPrice && displayedPrice > 0 && (
              <span className="text-[11px] leading-[16px] text-[#999999] line-through decoration-[#999999]">
                ₹{money(displayedMrp)}
              </span>
            )}

            {displayedDiscount > 0 && (
              <span className="rounded-[4px] bg-[#EFF9F1] px-[5px] py-[2px] text-[10px] font-bold leading-[16px] text-[#16803A]">
                {displayedDiscount}% OFF
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
            <span className="inline-flex w-fit max-w-max self-start items-center rounded-md bg-[#FFF1E8] px-2.5 py-1 mt-2 text-[10px] font-medium leading-none text-[#F36B36]">
              Best Seller
            </span>
          )}

          {/* ACTION BUTTONS
              - In stock: Buy Now + Add to Cart
              - Out of stock: Sold Out (disabled, single full-width) */}

          {displayedStock ? (
            <div className="mt-[9px] flex w-full items-center gap-[6px]">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buying || adding}
                className={`
                  flex h-[34px] min-w-0 flex-1 items-center justify-center rounded-[8px]
                  text-[10px] font-semibold transition
                  ${!buying && !adding
                    ? "bg-[#111] text-white hover:bg-black"
                    : "cursor-not-allowed bg-[#e7e5e1] text-[#888]"
                  }
                `}
              >
                {buying ? (
                  <span className="h-[11px] w-[11px] animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Buy Now"
                )}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || buying}
                aria-label="Add to cart"
                className={`
                  flex h-[34px] min-w-[96px] flex-1 items-center justify-center gap-1 px-[5px]
                  rounded-[8px] border
                  ${!adding && !buying
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
                    <span className="text-[10px] font-semibold">
                      Add to Cart
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-[9px] flex w-full items-center">
              <button
                type="button"
                disabled
                aria-label="Sold out"
                className="flex h-[34px] w-full cursor-not-allowed items-center justify-center rounded-[8px] border border-[#e3e1dc] bg-[#f6f5f1] text-[10px] font-semibold uppercase tracking-wide text-[#999]"
              >
                Sold Out
              </button>
            </div>
          )}
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
                        More colours & variations
                      </p>

                      <h2
                        id="similar-products-title"

                        className="mt-1 text-[19px] font-semibold leading-tight text-[#111] sm:text-[21px]"
                      >
                        Other variants
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

                    {false && (
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

                    {similarProducts.length === 0 && (
                      <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                        <div className="text-4xl">🛍️</div>

                        <p className="mt-4 text-[14px] font-medium text-[#555]">
                          No other variants available
                        </p>

                        <p className="mt-1.5 text-[11px] leading-5 text-[#999]">
                          No other linked variants are available for this
                          product.
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