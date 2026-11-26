"use client";




export const LOGO_SRC = "/indiekonnect-web/images/logo.png";

export const PLACEHOLDER_IMAGE = "/indiekonnect-web/images/test.jpg";


export const PRODUCTS_PER_PAGE = 12;

export const MAX_PRICE_LIMIT = 200000;

export const SKELETON_COUNT = 8;

export const SECTION_AFTER_ROWS = 2;


export type SortOption = "recommended" | "price-low" | "price-high" | "newest";

export type RecommendationSection = "best_sellers" | "best_offers";


export interface FilterState {
  brands: string[];
  categories: string[];
  subCategories: string[];
  colors: string[];
  priceRange: [number, number];
  availability: {
    inStock: boolean;
    outOfStock: boolean;
    lowStock: boolean;
  };
}


export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  status: boolean;
  products_count: number;
}


export interface Category {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  subcategories?: SubCategory[];
  brands?: any[];
}


export const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Best Sellers",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest First",
};


/* -------------------------------------------------------------------------- */
/* Price helpers                                                              */
/* -------------------------------------------------------------------------- */

export const getProductPrice = (product: any, accountType?: string): number => {
  if (!product) return 0;

  const type = String(accountType || "").trim().toLowerCase();

  if (type === "distributor") {
    return Number(
      product.distributor_price ??
        product.distributor?.price ??
        product.retail_price ??
        0,
    );
  }

  return Number(product.retail_price ?? product.retail?.price ?? product.price ?? 0);
};


export const getProductMrp = (product: any, accountType?: string): number => {
  if (!product) return 0;

  const type = String(accountType || "").trim().toLowerCase();

  if (type === "distributor") {
    return Number(
      product.distributor_mrp ??
        product.distributor?.mrp ??
        product.retail_mrp ??
        0,
    );
  }

  return Number(product.retail_mrp ?? product.retail?.mrp ?? product.mrp ?? 0);
};


export const getDiscountPercentage = (product: any, accountType?: string): number => {
  const mrp = getProductMrp(product, accountType);
  const price = getProductPrice(product, accountType);

  if (mrp > price && price > 0) {
    return Math.round(((mrp - price) / mrp) * 100);
  }

  return 0;
};


/** Only products explicitly marked as primary belong in the main listing. */
export const isPrimaryProduct = (product: any): boolean => {
  const flag = product?.is_primary ?? product?.isPrimary;
  return (
    flag === true ||
    flag === 1 ||
    (typeof flag === "string" && ["1", "true"].includes(flag.trim().toLowerCase()))
  );
};


export const getAccountType = (profile: any): string => {
  const accountType =
    profile?.user?.account_type ??
    profile?.data?.user?.account_type ??
    profile?.data?.account_type ??
    profile?.account_type ??
    "retail";

  return String(accountType).trim().toLowerCase() === "distributor"
    ? "distributor"
    : "retail";
};


/* -------------------------------------------------------------------------- */
/* Image helper                                                               */
/* -------------------------------------------------------------------------- */

export const extractImageUrl = (value: unknown): string => {
  if (!value) return "";

  let raw = "";

  if (typeof value === "string") {
    raw = value;
  } else if (typeof value === "object") {
    const image = value as any;
    raw =
      image?.image_url ||
      image?.url ||
      image?.src ||
      image?.path ||
      image?.image ||
      "";
  }

  if (!raw) return "";

  let url = String(raw).trim();

  if (!url) return "";

  url = url.replace(/\\\\/g, "");

  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  return url;
};


/* -------------------------------------------------------------------------- */
/* Availability helper (shared)                                               */
/* -------------------------------------------------------------------------- */

export const readAvailabilityFromParams = (params: URLSearchParams) => {
  const rawArray = params.getAll("stock_status[]");
  const rawCsv = params.get("stock_status") || "";

  const selected = rawArray.length
    ? rawArray
    : rawCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  if (selected.length) {
    return {
      inStock: selected.includes("in_stock"),
      outOfStock: selected.includes("out_of_stock"),
      lowStock: selected.includes("low_stock"),
    };
  }

  // Backward-compat legacy single flags
  return {
    inStock: params.get("in_stock") === "true",
    outOfStock: params.get("out_of_stock") === "true",
    lowStock: params.get("low_stock") === "true",
  };
};
