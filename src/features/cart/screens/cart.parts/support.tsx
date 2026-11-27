"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Home, ShoppingBag } from "lucide-react";
import CheckoutProgress from "./CheckoutProgress";

export const isPurchaseWithoutStockAllowed = (value: unknown): boolean =>
  value === true ||
  value === 1 ||
  String(value ?? "").trim().toLowerCase() === "1" ||
  String(value ?? "").trim().toLowerCase() === "true";

export const PAGE_BG = "#FFFFFF";

export const PLACEHOLDER_IMAGE = "/indiekonnect-web/images/placeholder.jpg";

export const MAX_CART_QUANTITY = 10;

export interface ProductTaxonomy {
  id?: number;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  category_id?: number;
}

export interface VariantData {
  id: number;
  sku?: string | null;
  attributes?: Record<string, string> | null;
  attribute_string?: string | null;
  retail_price?: string | null;
  distributor_price?: string | null;
  stock_quantity?: number | null;
}

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  product_code: string;
  retail_price?: string | null;
  retail_mrp?: string | null;
  distributor_price?: string | null;
  distributor_mrp?: string | null;
  commission_value?: string | number | null;
  stock_quantity?: number | null;
  available_stock?: number | null;
  allowed_purchsed?: number | boolean | string | null;
  category?: ProductTaxonomy | null;
  subcategory?: ProductTaxonomy | null;
  brand?: ProductTaxonomy | null;
}

export interface CartItemApi {
  id: number;
  product_id: number;
  variant_id?: number | null;
  product: CartProduct;
  variant?: VariantData | null;
  variant_attributes?: Record<string, string> | null;
  quantity: number;
  current_unit_price: string;
  current_unit_price_formatted?: string | null;
  subtotal: number;
  subtotal_formatted?: string | null;
  image_url?: string | null;
  current_price_type?: string | null;
}

export interface CartItemView {
  id: number;
  cartItemId: number;
  productId: number;
  variantId: number | null;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  productCode: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  variantLabel: string;
  variantAttributes: Record<string, string>;
  quantity: number;
  stockQuantity: number | null;
  allowedPurchase: boolean;
  priceType: string;
  commissionPoints: number;
}

export interface TaxCategory {
  category: string;
  rate: string;
  taxable_amount: number;
  tax_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  is_gst: boolean;
  product_name?: string;
  total_shipping_charge?: number;
}

export interface CheckoutSummaryData {
  subtotal: number;
  coupon_discount: number;
  coupon?: {
    code: string;
    title: string;
    type: string;
    value: string;
    discount_amount: number;
  } | null;
  subtotal_after_discount: number;
  total_tax: number;
  shipping_cost?: number;
  service_charge?: number;
  subtotal_after_discount_and_tax: number;
  max_coins_redeemable: number;
  coins_used: number;
  amount_redeemed: number;
  grand_total: number;
  items?: any[];
  total_commission?: string | number | null;
  tax_by_category?: TaxCategory[];
  tax_breakdown?: any[];
  product_tax_breakdown?: Record<string, any>;
}

export interface CouponListItem {
  id?: number;
  code: string;
  title?: string;
  description?: string;
  type?: string;
  value?: string | number;
  is_active?: boolean | number | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return PLACEHOLDER_IMAGE;

  const value = url.trim().replace(/\\\//g, "/");

  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/indiekonnect-web/")) return value;

  return `https://www.markupdesigns.net/indikonnect/${value.replace(/^\/+/, "")}`;
};

export const getRecommendedImage = (product: any): string => {
  const images = Array.isArray(product?.images) ? product.images : [];

  const primary = images.find(
    (image: any) => image?.is_primary === true || image?.is_primary === 1,
  );

  const readImage = (value: any): string => {
    if (typeof value === "string") return value;
    return value?.image_url || value?.url || value?.image || "";
  };

  const url =
    readImage(product?.primary_image_url) ||
    readImage(product?.primary_image) ||
    readImage(product?.image_url) ||
    readImage(product?.image) ||
    readImage(primary) ||
    readImage(images[0]) ||
    readImage(product?.product?.primary_image_url) ||
    readImage(product?.product?.images?.[0]);

  return getImageUrl(url);
};

export const parsePrice = (value?: string | number | null): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatPrice = (value: number): string =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

export const formatPoints = (value: number): string =>
  `${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })} pts`;

export const formatAttributeName = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getTaxonomyName = (value?: ProductTaxonomy | null): string =>
  String(value?.title || value?.name || "").trim();

export const getVariantLabel = (
  variant?: VariantData | null,
  variantAttributes?: Record<string, string> | null,
): string => {
  if (variant?.attribute_string?.trim()) {
    return variant.attribute_string.trim();
  }

  const attributes = variantAttributes || variant?.attributes || {};

  return Object.entries(attributes)
    .map(([key, value]) => `${formatAttributeName(key)}: ${value}`)
    .join(" • ");
};

export const getOriginalPrice = (item: CartItemApi, currentPrice: number) => {
  const isDistributor =
    String(item.current_price_type || "").toLowerCase() === "distributor";

  const variantPrice = isDistributor
    ? parsePrice(item.variant?.distributor_price)
    : parsePrice(item.variant?.retail_price);

  const productPrice = isDistributor
    ? parsePrice(
        item.product?.distributor_mrp ?? item.product?.distributor_price,
      )
    : parsePrice(item.product?.retail_mrp ?? item.product?.retail_price);

  const candidate =
    variantPrice > 0 ? variantPrice : productPrice > 0 ? productPrice : 0;

  return candidate > currentPrice ? candidate : undefined;
};

export const getCouponValueLabel = (coupon: CouponListItem): string => {
  const type = String(coupon.type || "").toLowerCase();
  const value = coupon.value ?? 0;

  if (type.includes("percent") || type === "%") {
    return `${value}% OFF`;
  }

  if (Number(value) > 0) {
    return `${formatPrice(Number(value))} OFF`;
  }

  return "Discount";
};

export const getErrorMessage = (error: any, fallback: string): string =>
  error?.data?.message ||
  error?.error?.data?.message ||
  error?.data?.error ||
  error?.message ||
  fallback;

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb + checkout progress
// ─────────────────────────────────────────────────────────────────────────────

export const Breadcrumb = ({
  currentPage = "Cart",
}: {
  currentPage?: string;
}) => {
  const router = useRouter();

  return (
    <div className="mb-4 flex w-full flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1 text-[11px] font-medium"
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex shrink-0 items-center gap-1 text-[#777] transition hover:text-black"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </button>

        <ChevronRight className="h-3 w-3 shrink-0 text-[#B0B0AD]" />

        <span className="shrink-0 text-[#111]">{currentPage}</span>
      </nav>

      <CheckoutProgress
        currentStep={0}
        className="sm:ml-auto sm:w-[min(100%,420px)] sm:shrink-0"
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty cart
// ─────────────────────────────────────────────────────────────────────────────

export const EmptyCart = () => {
  const router = useRouter();

  return (
    <section className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
        <ShoppingBag className="h-6 w-6 text-[#222]" strokeWidth={1.5} />
      </div>

      <h2 className="mt-5 text-[20px] font-semibold text-[#111]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-[#777]">
        Discover something beautiful from our curated collection.
      </p>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-black px-5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#333]"
      >
        Continue Shopping
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
};
