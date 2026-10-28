"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  AlertTriangle,
  BadgePercent,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { SiAxisbank, SiHdfcbank, SiRazorpay } from "react-icons/si";
import { useDispatch } from "react-redux";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";
import {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
  useInitiateHdfcPaymentMutation,
  type HdfcApiResult,
} from "@/lib/redux/api/checkoutApi";
import {
  useGetCouponsQuery,
  useLazyGetCartQuery,
  useCheckCartStockMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
} from "@/lib/redux/api/cartApi";
import { useCheckProductStockMutation } from "@/lib/redux/api/productApi";
import { useGetPaymentGatewaySettingsQuery } from "@/lib/redux/api/paymentGatewaySettingsApi";
import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import AddressFormModal from "./AddressFormModal";
import { useRetryOrderMutation } from "@/lib/redux/api/order/orderApi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AddressFormData {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
}

interface CheckoutSummaryItem {
  product_id: number;
  cart_item_id?: number | null;
  cartItemId?: number | null;
  cart_item?: { id?: number | null } | null;
  variant_id?: number | null;
  variant?: { id?: number | null; stock_quantity?: number | null } | null;
  product?: {
    stock_quantity?: number | null;
    available_stock?: number | null;
  } | null;
  stock_quantity?: number | null;
  available_stock?: number | null;
  variant_stock_quantity?: number | null;
  max_stock?: number | null;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  tax_category: string;
  tax_rate: string;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  line_total: number;
  primary_image?: string;
  images?: {
    id: number;
    image: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
}

interface CheckoutSummaryData {
  checkout_type?: "cart" | "buy_now";
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
  shipping_cost: number;
  subtotal_after_discount_and_tax: number;
  coin_balance: number;
  max_coins_redeemable: number;
  coins_used: number;
  amount_redeemed: number;
  grand_total: number;
  items: CheckoutSummaryItem[];
  product_tax_breakdown?: Record<string, any>;
  tax_by_category?: {
    category: string;
    rate: string;
    taxable_amount: number;
    tax_amount: number;
    cgst: number;
    sgst: number;
    igst: number;
    is_gst: boolean;
  }[];
  tax_breakdown?: any[];
}

interface RazorpayOrderData {
  orderId: number;
  orderReference: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKey: string;
}

interface CouponListItem {
  id?: number;
  code: string;
  title?: string;
  description?: string;
  type?: string;
  value?: string | number;
  is_active?: boolean | number | string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentGatewayId =
  | "freecharge-axis"
  | "hdfc-ie"
  | "hdfc-sg"
  | "razorpay-axis";

type PaymentGatewayKind = "razorpay" | "hdfc";

interface PaymentGatewayOption {
  id: PaymentGatewayId;
  settingKey: string;
  title: string;
  description: string;
  paymentGateway: "razorpay" | "hdfc_ie" | "hdfc_sg";
  kind: PaymentGatewayKind;
  icon: "axis" | "hdfc" | "razorpay";
  tag?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INK = "#111827";
const MAX_CHECKOUT_QUANTITY = 10;

const PAYMENT_GATEWAY_OPTIONS: PaymentGatewayOption[] = [
  {
    id: "freecharge-axis",
    settingKey: "Freecharge(Axis)",
    title: "Freecharge",
    description: "Pay securely via Freecharge checkout gateway.",
    paymentGateway: "razorpay",
    kind: "razorpay",
    icon: "axis",
    tag: "Axis",
  },
  {
    id: "hdfc-ie",
    settingKey: "HDFC_IE",
    title: "HDFC Bank",
    description: "Pay securely via HDFC SmartGateway (Merchant 1).",
    paymentGateway: "hdfc_ie",
    kind: "hdfc",
    icon: "hdfc",
    tag: "India",
  },
  {
    id: "hdfc-sg",
    settingKey: "HDFC_SG",
    title: "HDFC Bank",
    description: "Pay securely via HDFC SmartGateway (Merchant 2).",
    paymentGateway: "hdfc_sg",
    kind: "hdfc",
    icon: "hdfc",
    tag: "Singapore",
  },
  {
    id: "razorpay-axis",
    settingKey: "Razorpay (Axis)",
    title: "Razorpay",
    description: "Pay securely via Razorpay checkout gateway.",
    paymentGateway: "razorpay",
    kind: "razorpay",
    icon: "razorpay",
    tag: "Axis",
  },
];

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatPrice = (value: any): string => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const getErrorMessage = (error: any, fallback: string): string =>
  error?.data?.message ||
  error?.error?.data?.message ||
  error?.data?.error ||
  error?.message ||
  fallback;

const normalizeSummaryItems = (
  summaryData?: CheckoutSummaryData
): CheckoutSummaryItem[] => {
  if (!summaryData) return [];

  if (Array.isArray(summaryData.items) && summaryData.items.length > 0) {
    return summaryData.items;
  }

  const breakdown = summaryData.product_tax_breakdown || {};

  return Object.values(breakdown).map((product: any) => ({
    product_id: product.product_id ?? 0,
    cart_item_id: product.cart_item_id ?? product.cart_item?.id ?? null,
    cartItemId: product.cartItemId ?? null,
    cart_item: product.cart_item ?? null,
    variant_id: product.variant_id ?? product.variant?.id ?? null,
    variant: product.variant ?? null,
    product: product.product ?? null,
    stock_quantity: product.stock_quantity ?? null,
    available_stock: product.available_stock ?? null,
    variant_stock_quantity: product.variant_stock_quantity ?? null,
    // Important: preserve API max_stock (e.g. 50, 40, 11) for quantity options.
    max_stock: product.max_stock ?? null,
    product_name: product.product_name,
    product_code: product.product_code,
    quantity: product.quantity || 1,
    unit_price: product.unit_price || 0,
    tax_category: product.tax_category,
    tax_rate: product.tax_rate,
    taxable_value: product.taxable_value || 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total_tax: product.tax_amount || 0,
    line_total:
      product.line_total_after_tax ||
      product.unit_price * (product.quantity || 1),
    primary_image: product.primary_image,
    images: product.images || [],
  }));
};

const getItemImage = (item: {
  primary_image?: string;
  images?: { image_url: string; is_primary: boolean }[];
}) =>
  item.primary_image ||
  item.images?.find((img) => img.is_primary)?.image_url ||
  item.images?.[0]?.image_url ||
  null;

const getSummaryItemKey = (
  item: CheckoutSummaryItem,
  index: number
): string =>
  `${item.product_id}-${item.variant_id ?? item.variant?.id ?? "none"}-${index}`;

const getCouponValueLabel = (coupon: CouponListItem): string => {
  const type = String(coupon.type || "").toLowerCase();
  const value = coupon.value ?? 0;
  if (type.includes("percent") || type === "%") return `${value}% OFF`;
  if (Number(value) > 0) return `${formatPrice(value)} OFF`;
  return "Discount";
};

const getInitialGatewayId = (value: unknown): PaymentGatewayId => {
  const code = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (code === "HDFC_IE") return "hdfc-ie";
  if (code === "HDFC_SG" || code === "HDFC") return "hdfc-sg";
  if (code.includes("FREECHARGE")) return "freecharge-axis";
  if (code.includes("RAZORPAY")) return "razorpay-axis";
  if (code.includes("AXIS")) return "razorpay-axis";
  return "freecharge-axis";
};

const getCartLineStock = (cartItem: any): number | null => {
  const value =
    cartItem?.variant?.stock_quantity ??
    cartItem?.product?.available_stock ??
    cartItem?.product?.stock_quantity;
  if (value === null || value === undefined || value === "") return null;
  const stock = Number(value);
  return Number.isFinite(stock) ? Math.max(0, stock) : null;
};

const getSummaryStock = (
  item: CheckoutSummaryItem,
  cartItem?: any
): number | null => {
  const value =
    item.max_stock ??
    item.variant?.stock_quantity ??
    item.variant_stock_quantity ??
    item.available_stock ??
    item.stock_quantity ??
    item.product?.available_stock ??
    item.product?.stock_quantity ??
    getCartLineStock(cartItem);
  if (value === null || value === undefined || value === "") return null;
  const stock = Number(value);
  return Number.isFinite(stock) ? Math.max(0, stock) : null;
};

// FIX: use the stock value sent by the API instead of capping all products at 10.
const getCheckoutMaxQuantity = (stock: number | null): number => {
  if (stock === null) return MAX_CHECKOUT_QUANTITY;
  if (stock <= 0) return 1;
  return Math.floor(stock);
};

const findMatchingCartLine = (
  summaryItem: CheckoutSummaryItem,
  cartItems: any[]
): any | undefined => {
  const productId = Number(summaryItem.product_id);
  const explicitCartItemId = Number(
    summaryItem.cart_item_id ??
      summaryItem.cartItemId ??
      summaryItem.cart_item?.id ??
      0
  );

  if (explicitCartItemId > 0) {
    const exactMatch = cartItems.find(
      (item) =>
        Number(item?.id) === explicitCartItemId &&
        Number(item?.product_id) === productId
    );
    if (exactMatch) return exactMatch;
  }

  let candidates = cartItems.filter(
    (item) => Number(item?.product_id) === productId
  );

  const variantId = Number(
    summaryItem.variant_id ?? summaryItem.variant?.id ?? 0
  );

  if (variantId > 0) {
    candidates = candidates.filter(
      (item) =>
        Number(item?.variant_id ?? item?.variant?.id ?? 0) === variantId
    );
  }

  if (candidates.length === 1) return candidates[0];

  if (candidates.length > 1) {
    const targetName = String(summaryItem.product_name || "")
      .trim()
      .toLowerCase();
    const targetQuantity = Number(summaryItem.quantity || 1);
    const matchingCandidates = candidates.filter((item) => {
      const name = String(item?.product?.name ?? item?.product_name ?? "")
        .trim()
        .toLowerCase();
      return (
        (!targetName || name === targetName) &&
        Number(item?.quantity || 1) === targetQuantity
      );
    });
    if (matchingCandidates.length === 1) return matchingCandidates[0];
  }

  return undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function GatewayBrandIcon({
  icon,
  className = "",
}: {
  icon: PaymentGatewayOption["icon"];
  className?: string;
}) {
  if (icon === "hdfc") {
    return <SiHdfcbank aria-hidden="true" className={className} />;
  }
  if (icon === "razorpay") {
    return <SiRazorpay aria-hidden="true" className={className} />;
  }
  return <SiAxisbank aria-hidden="true" className={className} />;
}

function CheckoutSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-3 w-1/3 rounded bg-[#eeeeec]" />
      <div className="h-3 w-2/3 rounded bg-[#eeeeec]" />
    </div>
  );
}

function PlaceOrderButton({
  onClick,
  isSubmitting,
  gatewayLoading,
  disabled,
  compact = false,
  retryMode = false,
}: {
  onClick: () => void;
  isSubmitting: boolean;
  gatewayLoading: boolean;
  disabled: boolean;
  total?: number;
  compact?: boolean;
  retryMode?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isSubmitting}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#173E2B] via-[#1B5538] to-[#16845B] px-4 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/10 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#16845B]/30 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-[#9DB2A5] disabled:via-[#9DB2A5] disabled:to-[#9DB2A5] disabled:hover:translate-y-0 ${
        compact ? "min-h-[44px] py-2" : "min-h-[46px] py-2.5"
      }`}
    >
      {!disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-sm transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
        />
      )}

      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {retryMode ? "Processing payment..." : "Processing order..."}
          </span>
        </>
      ) : gatewayLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading payment...</span>
        </>
      ) : (
        <>
          <span>{retryMode ? "Retry Payment" : "Place Order"}</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

function CouponListPanel({
  coupons,
  isLoading,
  appliedCode,
  onApply,
}: {
  coupons: CouponListItem[];
  isLoading: boolean;
  appliedCode: string | null;
  onApply: (code: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-[#E2E8E4] bg-white p-3">
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
        <div className="h-14 animate-pulse rounded-lg bg-[#EEEEEC]" />
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 text-center">
        <p className="text-[11px] text-[#888888]">
          No coupons available right now
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border border-[#E2E8E4] bg-white p-2">
      {coupons.map((coupon, index) => {
        const isApplied =
          appliedCode &&
          appliedCode.toUpperCase() === String(coupon.code).toUpperCase();

        return (
          <div
            key={`${coupon.id ?? coupon.code}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-dashed border-[#DDE5DF] p-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EF] text-[#16845B]">
              <BadgePercent className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] font-semibold uppercase text-[#171717]">
                  {coupon.code}
                </p>
                <span className="shrink-0 text-[10px] font-semibold text-[#16845B]">
                  {getCouponValueLabel(coupon)}
                </span>
              </div>
              {(coupon.title || coupon.description) && (
                <p className="mt-0.5 truncate text-[10px] text-[#888888]">
                  {coupon.title || coupon.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onApply(coupon.code)}
              disabled={Boolean(isApplied)}
              className="shrink-0 rounded-lg border border-[#CBD5CE] px-3 py-1.5 text-[10px] font-semibold text-[#1F513B] transition hover:border-[#16845B] hover:bg-[#EAF6EF] disabled:cursor-not-allowed disabled:text-[#AAAAAA]"
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function QuantitySelect({
  value,
  options,
  disabled,
  isLoading,
  onChange,
  ariaLabel,
}: {
  value: number;
  options: number[];
  disabled: boolean;
  isLoading: boolean;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (qty: number) => {
    if (disabled || isLoading) return;
    setOpen(false);
    onChange(qty);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-7 min-w-[56px] items-center justify-between gap-1.5 rounded-md border border-[#DDE7DF] bg-[#F8FBF8] px-2 text-[11px] font-semibold text-[#173E2B] transition hover:border-[#B9CFC1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="tabular-nums">{value}</span>
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-[#16845B]" />
        ) : (
          <ChevronDown
            className={`h-3 w-3 text-[#748078] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+4px)] z-[100] max-h-[180px] w-[85px] overflow-y-auto overscroll-contain rounded-lg border border-[#DDE7DF] bg-white py-1 shadow-[0_10px_28px_-14px_rgba(15,45,30,0.4)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C7D6CC] [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {options.map((qty) => {
            const isSelected = qty === value;
            return (
              <button
                key={qty}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(qty)}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[11px] font-semibold transition ${
                  isSelected
                    ? "bg-[#EAF6EF] text-[#16845B]"
                    : "text-[#37473C] hover:bg-[#F4F8F5]"
                }`}
              >
                <span className="tabular-nums">{qty}</span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaxBreakdownPopup({
  summaryData,
}: {
  summaryData: CheckoutSummaryData;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const categories =
    Array.isArray(summaryData.tax_by_category) &&
    summaryData.tax_by_category.length > 0
      ? summaryData.tax_by_category
      : [];

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="View tax breakdown"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#89928B] transition hover:text-[#16845B]"
      >
        <Info className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-12 z-[9999] w-[calc(100vw-32px)] max-w-[280px] -translate-x-1/2 rounded-xl border border-[#E1EAE3] bg-white p-3 shadow-[0_16px_40px_-20px_rgba(15,45,30,0.45)] sm:left-auto sm:right-0 sm:translate-x-0 sm:w-[260px]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#1B2C20]">
              Tax breakdown
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close tax breakdown"
              className="flex h-5 w-5 items-center justify-center rounded-full text-[#89928B] transition hover:bg-[#F1F6F2] hover:text-[#16845B]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((tax, index) => (
                <div
                  key={`${tax.category}-${tax.rate}-${index}`}
                  className="rounded-lg border border-[#EDF1EE] bg-[#FAFCFA] p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-[#26332A]">
                      {tax.category} @ {Number(tax.rate || 0).toFixed(2)}%
                    </span>
                    <span className="text-[10.5px] font-semibold text-[#173E2B]">
                      {formatPrice(tax.tax_amount)}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[9.5px] text-[#748078]">
                    <div className="flex items-center justify-between">
                      <span>Taxable value</span>
                      <span>{formatPrice(tax.taxable_amount)}</span>
                    </div>
                    {Number(tax.igst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>IGST</span>
                        <span>{formatPrice(tax.igst)}</span>
                      </div>
                    )}
                    {Number(tax.cgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>CGST</span>
                        <span>{formatPrice(tax.cgst)}</span>
                      </div>
                    )}
                    {Number(tax.sgst || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>SGST</span>
                        <span>{formatPrice(tax.sgst)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#EDF1EE] pt-2 text-[10.5px] font-semibold text-[#1B2C20]">
                <span>Total tax</span>
                <span>{formatPrice(summaryData.total_tax)}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10.5px] text-[#888888]">
              Tax breakdown unavailable
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CartSummary({
  summaryData,
  loading,
  onPlaceOrder,
  isSubmitting,
  disabled,
  couponInput,
  setCouponInput,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon,
  coupons,
  isLoadingCoupons,
  showCouponList,
  setShowCouponList,
  unavailableProductIds,
  checkoutType,
  selectedGateway,
  gatewayLoading,
  retryMode = false,
  retryOrderReference = "",
  onExitPayment,
  onRemoveCartItem,
  removingSummaryItemKey,
  cartLines,
  quantityUpdatingKey,
  onUpdateQuantity,
}: {
  summaryData?: CheckoutSummaryData;
  loading: boolean;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  couponInput: string;
  setCouponInput: (value: string) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (codeOverride?: string) => void;
  onRemoveCoupon: () => void;
  isApplyingCoupon: boolean;
  coupons: CouponListItem[];
  isLoadingCoupons: boolean;
  showCouponList: boolean;
  setShowCouponList: (value: boolean) => void;
  unavailableProductIds: Set<number>;
  checkoutType: "cart" | "buy_now";
  selectedGateway: PaymentGatewayOption;
  gatewayLoading: boolean;
  retryMode?: boolean;
  retryOrderReference?: string;
  onExitPayment: () => void;
  onRemoveCartItem: (item: CheckoutSummaryItem, index: number) => void;
  removingSummaryItemKey: string | null;
  cartLines: any[];
  quantityUpdatingKey: string | null;
  onUpdateQuantity: (
    item: CheckoutSummaryItem,
    index: number,
    quantity: number
  ) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E6ECE8] bg-white p-4 shadow-[0_14px_40px_-32px_rgba(15,45,30,0.25)]">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/2 rounded bg-[#EEEEEC]" />
          <div className="h-16 rounded-xl bg-[#EEEEEC]" />
          <div className="h-16 rounded-xl bg-[#EEEEEC]" />
          <div className="h-10 rounded-xl bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-12 rounded-xl bg-[#EEEEEC]" />
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="rounded-2xl border border-[#E6ECE8] bg-white p-8">
        <p className="text-center text-[13px] text-[#777777]">
          Order summary unavailable
        </p>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData);
  const hasCoupon =
    !!summaryData.coupon || Number(summaryData.coupon_discount || 0) > 0;
  const hasUnavailable = !retryMode && unavailableProductIds.size > 0;

  const buttonDisabled = retryMode
    ? isSubmitting || gatewayLoading || !retryOrderReference
    : isSubmitting || disabled || hasUnavailable || gatewayLoading;

  return (
    <div className="rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_16px_45px_-32px_rgba(15,45,30,0.28)]">
      {/* Retry mode banner */}
      {retryMode && (
        <div className="rounded-t-2xl border-b border-[#F2D9B8] bg-gradient-to-r from-[#FFF8ED] to-white px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#A65A11]">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#392B1C]">
                Payment pending
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-[#806B55]">
                Your previous payment was cancelled or not completed. Retry
                payment for this order without placing a new order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className={`${
          retryMode ? "" : "rounded-t-2xl"
        } border-b border-[#EDF1EE] bg-gradient-to-r from-[#F6FBF7] to-white px-4 py-2.5 sm:px-5`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#16241B]">
              Order Summary
            </h2>
            <p className="mt-0.5 text-[11px] text-[#7B877F]">
              {retryMode
                ? "Review your items before retrying payment"
                : "Review your items before placing the order"}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#16845B] shadow-sm ring-1 ring-[#E4EBE6]">
            <Package className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Items list */}
      <div
        className={`space-y-3 px-4 py-2.5 sm:px-5 ${
          items.length > 5
            ? "max-h-[320px] overflow-y-auto overscroll-contain pr-2"
            : ""
        }`}
      >
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);
            const isUnavailable =
              !retryMode && unavailableProductIds.has(item.product_id);
            const itemKey = getSummaryItemKey(item, index);
            const matchingCartItem =
              checkoutType === "cart"
                ? findMatchingCartLine(item, cartLines)
                : undefined;
            const stock = getSummaryStock(item, matchingCartItem);
            const maxQuantity = getCheckoutMaxQuantity(stock);
            // FIX: options run from 1 through the API stock (max_stock), without a hard cap of 10.
            const quantityOptions = Array.from(
              { length: Math.max(1, maxQuantity) },
              (_, optionIndex) => optionIndex + 1
            );
            const isUpdatingThisQuantity = quantityUpdatingKey === itemKey;
            const quantityDisabled =
              retryMode ||
              isSubmitting ||
              gatewayLoading ||
              Boolean(removingSummaryItemKey) ||
              isUpdatingThisQuantity ||
              (checkoutType === "cart" && !matchingCartItem);

            return (
              <div
                key={`${item.product_id}-${item.variant_id ?? "none"}-${index}`}
                className={`flex items-start gap-3 ${
                  isUnavailable ? "opacity-70" : ""
                }`}
              >
                {/* Product image + qty badge */}
                <div className="relative h-[42px] w-[42px] shrink-0 mt-0.5">
                  <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#E9EEEA] bg-[#F8FAF8]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name || "Product"}
                        fill
                        sizes="42px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-[#999999]" />
                      </div>
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded bg-white px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B64339]">
                          OOS
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -right-[5px] -top-[6px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#173E2B] px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                    {item.quantity}
                  </span>
                </div>

                {/* Product info + qty selector */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-medium leading-[16px] text-[#222922]">
                    {item.product_name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {!isUnavailable && (
                      <p className="text-[10px] text-[#89928B]">
                        {item.tax_category || "Product"}
                      </p>
                    )}
                    {!retryMode && (
                      <label className="inline-flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-[#748078]">
                          Qty:
                        </span>
                        <QuantitySelect
                          value={item.quantity}
                          options={quantityOptions}
                          disabled={quantityDisabled}
                          isLoading={isUpdatingThisQuantity}
                          ariaLabel={`Quantity for ${item.product_name}`}
                          onChange={(qty) => onUpdateQuantity(item, index, qty)}
                        />
                      </label>
                    )}
                  </div>
                  {isUnavailable && (
                    <p className="mt-1 text-[10px] font-semibold text-[#B64339]">
                      {checkoutType === "buy_now"
                        ? "Out of stock — choose an available quantity"
                        : "Out of stock — update your cart"}
                    </p>
                  )}
                  {checkoutType === "cart" &&
                    !matchingCartItem &&
                    !retryMode && (
                      <p className="mt-1 text-[10px] text-[#B64339]">
                        Refresh checkout to update quantity.
                      </p>
                    )}
                </div>

                {/* Price + remove */}
                <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                  {!retryMode && checkoutType === "cart" && (
                    <button
                      type="button"
                      aria-label={`Remove ${
                        item.product_name || "product"
                      } from cart`}
                      title="Remove from cart"
                      onClick={() => onRemoveCartItem(item, index)}
                      disabled={
                        Boolean(removingSummaryItemKey) ||
                        Boolean(quantityUpdatingKey) ||
                        isSubmitting ||
                        gatewayLoading
                      }
                      className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[#7A877E] transition hover:bg-[#FFF0EF] hover:text-[#B64339] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {removingSummaryItemKey === itemKey ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </button>
                  )}
                  <p className="shrink-0 text-[13px] font-semibold text-[#1D2921]">
                    {formatPrice(item.line_total)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-3 text-center text-[12px] text-[#777777]">
            No products in your cart
          </p>
        )}
      </div>

      {/* Coupon section */}
      <div className="border-t border-[#EDF1EE] px-4 py-2.5 sm:px-5">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold text-[#303B33]">
            Discount code
          </p>
          <button
            type="button"
            onClick={() => setShowCouponList(!showCouponList)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-semibold text-[#16845B] transition hover:text-[#0E6242]"
          >
            {showCouponList ? "Hide coupons" : "View coupons"}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                showCouponList ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showCouponList && (
          <div className="mb-2">
            <CouponListPanel
              coupons={coupons}
              isLoading={isLoadingCoupons}
              appliedCode={appliedCoupon}
              onApply={(code) => {
                onApplyCoupon(code);
                setShowCouponList(false);
              }}
            />
          </div>
        )}

        {!hasCoupon ? (
          <div className="flex h-[38px] w-full items-center rounded-xl border border-[#DFE7E1] bg-white px-3 transition focus-within:border-[#16845B] focus-within:ring-2 focus-within:ring-[#16845B]/10">
            <Tag className="mr-2 h-[14px] w-[14px] shrink-0 text-[#839087]" />
            <input
              type="text"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isApplyingCoupon)
                  onApplyCoupon();
              }}
              placeholder="Enter discount code"
              disabled={isApplyingCoupon}
              className="min-w-0 flex-1 bg-transparent text-[12px] uppercase text-[#333333] outline-none placeholder:normal-case placeholder:text-[#999999]"
            />
            <button
              type="button"
              onClick={() => onApplyCoupon()}
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="ml-2 flex h-[26px] min-w-[56px] shrink-0 items-center justify-center rounded-lg bg-[#173E2B] px-3 text-[11px] font-semibold text-white transition hover:bg-[#20543A] disabled:cursor-not-allowed disabled:bg-[#D5D5D3]"
            >
              {isApplyingCoupon ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        ) : (
          <div className="flex min-h-[38px] items-center justify-between rounded-xl border border-[#CDE4D5] bg-[#F1FAF4] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D9F0E1]">
                <Check className="h-3.5 w-3.5 text-[#16845B]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase text-[#263C2D]">
                  {summaryData.coupon?.code || appliedCoupon}
                </p>
                <p className="text-[10px] text-[#64816D]">
                  Coupon applied successfully
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#777777] transition hover:bg-white hover:text-[#111111]"
              aria-label="Remove coupon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-1 border-t border-[#E8EEE9] px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Subtotal</span>
          <span className="text-[12px] font-medium text-[#263329]">
            {formatPrice(summaryData.subtotal)}
          </span>
        </div>

        {Number(summaryData.coupon_discount || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#667168]">
              Discount
              {summaryData.coupon?.code
                ? ` (${summaryData.coupon.code})`
                : ""}
            </span>
            <span className="text-[12px] font-semibold text-[#16845B]">
              - {formatPrice(summaryData.coupon_discount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Shipping</span>
          <span className="text-[12px] font-medium text-[#263329]">
            {Number(summaryData.shipping_cost || 0) === 0
              ? "₹0"
              : formatPrice(summaryData.shipping_cost)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] text-[#667168]">
            Estimated taxes
            <TaxBreakdownPopup summaryData={summaryData} />
          </span>
          <span className="text-[12px] font-medium text-[#263329]">
            {formatPrice(summaryData.total_tax)}
          </span>
        </div>

        {Number(summaryData.amount_redeemed || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#667168]">Coins</span>
            <span className="text-[12px] font-semibold text-[#16845B]">
              - {formatPrice(summaryData.amount_redeemed)}
            </span>
          </div>
        )}
      </div>

      {/* Total + CTA */}
      <div className="rounded-b-2xl border-t border-[#DEE7E0] bg-gradient-to-b from-white to-[#F8FBF8] px-4 pb-3 pt-2.5 sm:px-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[14px] font-semibold text-[#263329]">
              Total payable
            </span>
            <span className="block text-[10px] text-[#89928B]">
              Including taxes and shipping
            </span>
          </div>
          <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B]">
            {formatPrice(summaryData.grand_total)}
          </span>
        </div>

        {hasUnavailable && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#F1C8C4] bg-[#FFF2F1] p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />
            <div>
              <p className="text-[12px] font-semibold text-[#B64339]">
                {checkoutType === "buy_now"
                  ? "This product is unavailable"
                  : "Some items are out of stock"}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#8A4A44]">
                {checkoutType === "buy_now"
                  ? "This product is out of stock or the requested quantity is unavailable. Return to the product and select an available quantity."
                  : "Please return to your cart and remove unavailable items to continue."}
              </p>
            </div>
          </div>
        )}

        <div className="hidden lg:block">
          <PlaceOrderButton
            onClick={onPlaceOrder}
            isSubmitting={isSubmitting}
            gatewayLoading={gatewayLoading}
            disabled={buttonDisabled}
            total={summaryData.grand_total}
            retryMode={retryMode}
          />
        </div>

        {retryMode && (
          <button
            type="button"
            onClick={onExitPayment}
            disabled={isSubmitting}
            className="mt-2 hidden min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[#D8E1DB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#405247] transition hover:border-[#AEBDB3] hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
          >
            <X className="h-4 w-4" />
            Exit Payment
          </button>
        )}

        {disabled && !retryMode && !isSubmitting && (
          <p className="mt-2 text-center text-[10px] leading-4 text-[#888888]">
            Select a delivery address and finish coupon updates to continue.
          </p>
        )}

        <div className="mt-2.5 rounded-lg border border-[#E5ECE7] bg-white px-2.5 py-1.5">
          <div className="flex items-center justify-center gap-2">
            <GatewayBrandIcon
              icon={selectedGateway.icon}
              className={`h-3.5 w-3.5 shrink-0 ${
                selectedGateway.icon === "hdfc"
                  ? "text-[#B51F2B]"
                  : selectedGateway.icon === "razorpay"
                  ? "text-[#2457A7]"
                  : "text-[#2F65B8]"
              }`}
            />
            <p className="text-center text-[11px] text-[#748078]">
              Selected:{" "}
              <span className="font-semibold text-[#34443A]">
                {selectedGateway.title}
              </span>
              {selectedGateway.tag ? ` · ${selectedGateway.tag}` : ""}
            </p>
          </div>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-[#748078]">
            <ShieldCheck className="h-3 w-3 text-[#16845B]" />
            Secure checkout · Encrypted payment
          </p>
        </div>
      </div>
    </div>
  );
}

function AddressSelectorModal({
  isOpen,
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onAddNew,
  onClose,
}: {
  isOpen: boolean;
  addresses: Address[];
  selectedId?: number;
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Delivery Address
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose where you want your order delivered
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Address list */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {addresses.map((address) => {
            const isSelected = selectedId === address.id;
            return (
              <div
                key={address.id}
                onClick={() => onSelect(address)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-[#16845B] bg-[#F5FBF6] shadow-sm ring-1 ring-[#16845B]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[#16845B] bg-[#16845B]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {address.recipient_name}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                        {address.type || "Home"}
                      </span>
                      {address.is_default && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                      , {address.city}, {address.state} - {address.postcode}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Phone: {address.contact_number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(address);
                    }}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-[#16845B]"
                    title="Edit Address"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 text-sm font-semibold text-[#16845B] hover:text-[#0E6242]"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const productId = Number(searchParams.get("product_id") || 0);
  const quantity = Number(searchParams.get("quantity") || 0);
  const variantId = Number(searchParams.get("variant_id") || 0);
  const requestedCheckoutType = searchParams.get("checkout_type");
  const isDirectCheckout =
    requestedCheckoutType === "buy_now" ||
    (requestedCheckoutType !== "cart" && productId > 0 && quantity > 0);
  const checkoutType: "cart" | "buy_now" = isDirectCheckout
    ? "buy_now"
    : "cart";
  const urlCouponCode = searchParams.get("coupon_code") || "";

  const retryOrderReference = String(
    searchParams.get("order_reference") || ""
  ).trim();
  const retryGatewayParam = String(searchParams.get("gateway") || "")
    .trim()
    .toLowerCase();
  const retryPaymentStatus = String(
    searchParams.get("payment_status") || ""
  )
    .trim()
    .toLowerCase();
  const isRetryPaymentFlow =
    searchParams.get("cancelled") === "true" &&
    searchParams.get("show_repay") === "true" &&
    Boolean(retryOrderReference) &&
    ["pending", "failed", "cancelled", "unpaid"].includes(retryPaymentStatus);

  // ── State ──────────────────────────────────────────────────────────────────

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingSummaryItemKey, setRemovingSummaryItemKey] = useState<
    string | null
  >(null);
  const [quantityUpdatingKey, setQuantityUpdatingKey] = useState<string | null>(
    null
  );
  const [cartLines, setCartLines] = useState<any[]>([]);
  const [unavailableProductIds, setUnavailableProductIds] = useState<
    Set<number>
  >(new Set());
  const [couponInput, setCouponInput] = useState(urlCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    urlCouponCode || null
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);
  const [selectedGatewayId, setSelectedGatewayId] =
    useState<PaymentGatewayId>("freecharge-axis");
  const [hasManuallySelectedGateway, setHasManuallySelectedGateway] =
    useState(false);
  const paymentActionInProgress = useRef(false);

  // ── API hooks ──────────────────────────────────────────────────────────────

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();
  const [createAddress, { isLoading: isCreating }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] =
    useUpdateAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [placeOrder] = usePlaceOrderMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [initiateHdfcPayment] = useInitiateHdfcPaymentMutation();
  const [retryOrder] = useRetryOrderMutation();
  const { data: couponsData, isLoading: isLoadingCoupons } =
    useGetCouponsQuery();
  const {
    data: paymentGatewaySettings,
    isLoading: isLoadingGatewaySettings,
  } = useGetPaymentGatewaySettingsQuery();
  const [triggerGetCart] = useLazyGetCartQuery();
  const [checkCartStock] = useCheckCartStockMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  // ── Derived values ─────────────────────────────────────────────────────────

  const selectedGateway = useMemo(
    () =>
      PAYMENT_GATEWAY_OPTIONS.find(
        (option) => option.id === selectedGatewayId
      ) || PAYMENT_GATEWAY_OPTIONS[0],
    [selectedGatewayId]
  );

  // Gateway auto-selection
  useEffect(() => {
    if (isLoadingGatewaySettings || hasManuallySelectedGateway) return;

    const configuredGateway = (paymentGatewaySettings as any)?.active_gateway;
    const configuredGatewayId = getInitialGatewayId(configuredGateway);

    if (isRetryPaymentFlow && retryGatewayParam) {
      if (retryGatewayParam.includes("hdfc")) {
        setSelectedGatewayId(
          configuredGatewayId === "hdfc-ie" ||
            configuredGatewayId === "hdfc-sg"
            ? configuredGatewayId
            : getInitialGatewayId(retryGatewayParam)
        );
        return;
      }
      if (
        retryGatewayParam.includes("razorpay") ||
        retryGatewayParam.includes("axis")
      ) {
        setSelectedGatewayId(getInitialGatewayId(retryGatewayParam));
        return;
      }
    }

    setSelectedGatewayId(configuredGatewayId);
  }, [
    paymentGatewaySettings,
    isLoadingGatewaySettings,
    hasManuallySelectedGateway,
    isRetryPaymentFlow,
    retryGatewayParam,
  ]);

  const coupons: CouponListItem[] = useMemo(() => {
    const list = (couponsData as any)?.data?.data;
    if (!Array.isArray(list)) return [];
    return list.filter((coupon: CouponListItem) => {
      if (coupon?.is_active === undefined) return true;
      return (
        coupon.is_active === true ||
        coupon.is_active === 1 ||
        coupon.is_active === "1"
      );
    });
  }, [couponsData]);

  const addresses: Address[] = Array.isArray((addressesData as any)?.data)
    ? (addressesData as any).data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true
  );
  const availableDeliveryAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  // Auto-select default delivery address
  useEffect(() => {
    if (!availableDeliveryAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableDeliveryAddresses.find(
          (address) => address?.id === current.id
        );
        if (stillExists) return stillExists;
      }

      const defaultAddress = availableDeliveryAddresses.find(
        (address) => address?.is_default === true
      );
      if (defaultAddress) return defaultAddress;

      const deliveryAddress = availableDeliveryAddresses.find(
        (address) => address?.is_delivery === true
      );
      if (deliveryAddress) return deliveryAddress;

      return availableDeliveryAddresses[0] || null;
    });
  }, [availableDeliveryAddresses]);

  const checkoutSummaryParams = useMemo(
    () => ({
      ...(selectedDeliveryAddress?.id
        ? { address_id: selectedDeliveryAddress.id }
        : {}),
      ...(appliedCoupon ? { coupon_code: appliedCoupon.trim() } : {}),
      ...(isDirectCheckout
        ? {
            product_id: productId,
            quantity,
            ...(variantId > 0 ? { variant_id: variantId } : {}),
          }
        : {}),
    }),
    [
      selectedDeliveryAddress?.id,
      appliedCoupon,
      isDirectCheckout,
      productId,
      quantity,
      variantId,
    ]
  );

  const {
    data: checkoutSummaryResponse,
    error: checkoutSummaryError,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams);

  const summaryData: CheckoutSummaryData | undefined = (
    checkoutSummaryResponse as any
  )?.data;

  const displayCheckoutType: "cart" | "buy_now" =
    summaryData?.checkout_type === "buy_now" ||
    summaryData?.checkout_type === "cart"
      ? summaryData.checkout_type
      : checkoutType;

  const getCheckoutTypeFromSummary = (response: any): "cart" | "buy_now" => {
    const apiType = response?.data?.checkout_type ?? response?.checkout_type;
    return apiType === "buy_now" || apiType === "cart" ? apiType : checkoutType;
  };

  // Refresh checkout summary on window focus
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFocus = () => {
      void refetchCheckoutSummary();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetchCheckoutSummary]);

  // Fetch cart lines + check stock
  useEffect(() => {
    const fetchAndCheckCartStock = async () => {
      if (checkoutType !== "cart") {
        setCartLines([]);
        return;
      }
      try {
        const cartResp = await triggerGetCart().unwrap();
        const items: any[] = Array.isArray((cartResp as any)?.data?.items)
          ? (cartResp as any).data.items
          : [];
        setCartLines(items);

        const cartId = Number((cartResp as any)?.data?.id);
        if (cartId) {
          const stockRes = await checkCartStock({ cartId }).unwrap();
          const unavailable = new Set<number>();
          (stockRes?.data?.items || []).forEach((item: any) => {
            if (!item.available) unavailable.add(Number(item.product_id));
          });
          setUnavailableProductIds(unavailable);
        }
      } catch (error) {
        console.error("Failed to check cart stock", error);
      }
    };
    void fetchAndCheckCartStock();
  }, [checkoutType, triggerGetCart, checkCartStock]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUpdateSummaryQuantity = async (
    summaryItem: CheckoutSummaryItem,
    index: number,
    requestedQuantity: number
  ) => {
    const key = getSummaryItemKey(summaryItem, index);
    if (quantityUpdatingKey || removingSummaryItemKey || isSubmitting) return;

    if (isRetryPaymentFlow) {
      dispatch(
        showToast({
          message:
            "Quantity cannot be changed while retrying an existing payment.",
          type: "info",
        })
      );
      return;
    }

    const requested = Number(requestedQuantity);
    if (!Number.isInteger(requested) || requested < 1) return;

    if (displayCheckoutType === "buy_now") {
      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        dispatch(
          showToast({
            message: "Invalid Buy Now product or quantity.",
            type: "error",
          })
        );
        return;
      }

      const stock = getSummaryStock(summaryItem);
      const maxQuantity = getCheckoutMaxQuantity(stock);
      const newQuantity = Math.max(
        1,
        Math.min(requested, Math.max(1, maxQuantity))
      );
      if (newQuantity === quantity) return;

      setQuantityUpdatingKey(key);
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set("quantity", String(newQuantity));
        router.replace(`/checkout?${params.toString()}`);
      } finally {
        setQuantityUpdatingKey(null);
      }
      return;
    }

    setQuantityUpdatingKey(key);
    try {
      const cartResponse = await triggerGetCart().unwrap();
      const currentCartItems: any[] = Array.isArray(
        (cartResponse as any)?.data?.items
      )
        ? (cartResponse as any).data.items
        : [];
      setCartLines(currentCartItems);

      const cartItem = findMatchingCartLine(summaryItem, currentCartItems);
      if (!cartItem?.id)
        throw new Error(
          "Could not identify this cart item. Please refresh checkout and try again."
        );

      const currentQuantity = Math.max(
        1,
        Number(cartItem.quantity || summaryItem.quantity || 1)
      );
      if (requested === currentQuantity) return;

      const stock = getSummaryStock(summaryItem, cartItem);
      const maxQuantity = getCheckoutMaxQuantity(stock);
      const newQuantity = Math.max(
        1,
        Math.min(requested, Math.max(1, maxQuantity))
      );
      if (newQuantity === currentQuantity) return;

      await updateCartItem({
        itemId: Number(cartItem.id),
        data: { quantity: newQuantity, action: "set" },
      }).unwrap();

      const refreshedCart = await triggerGetCart().unwrap();
      const refreshedItems: any[] = Array.isArray(
        (refreshedCart as any)?.data?.items
      )
        ? (refreshedCart as any).data.items
        : [];
      setCartLines(refreshedItems);
      window.dispatchEvent(new CustomEvent("cart:refresh"));

      const refreshedSummary = await refetchCheckoutSummary();
      if (refreshedSummary.error)
        throw new Error(
          "Quantity updated, but checkout totals could not be refreshed. Please refresh checkout."
        );

      dispatch(
        showToast({ message: "Quantity updated successfully", type: "success" })
      );
    } catch (error: any) {
      console.error("Checkout quantity update error:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Unable to update quantity"),
          type: "error",
        })
      );
    } finally {
      setQuantityUpdatingKey(null);
    }
  };

  const handleRemoveSummaryItem = async (
    summaryItem: CheckoutSummaryItem,
    index: number
  ) => {
    const key = getSummaryItemKey(summaryItem, index);
    if (removingSummaryItemKey || quantityUpdatingKey || isSubmitting) return;

    if (isRetryPaymentFlow || displayCheckoutType !== "cart") {
      dispatch(
        showToast({
          message:
            "Items cannot be removed during payment retry or Buy Now checkout.",
          type: "info",
        })
      );
      return;
    }

    setRemovingSummaryItemKey(key);
    try {
      const cartResponse = await triggerGetCart().unwrap();
      const cartItems: any[] = Array.isArray(
        (cartResponse as any)?.data?.items
      )
        ? (cartResponse as any).data.items
        : [];
      const cartItem = findMatchingCartLine(summaryItem, cartItems);

      if (
        !cartItem?.id ||
        Number(cartItem?.product_id) !== Number(summaryItem.product_id)
      )
        throw new Error(
          "Could not identify this exact cart item. Please open your cart and remove it there."
        );

      await removeFromCart(Number(cartItem.id)).unwrap();

      setUnavailableProductIds((previous) => {
        if (!previous.has(Number(summaryItem.product_id))) return previous;
        const next = new Set(previous);
        next.delete(Number(summaryItem.product_id));
        return next;
      });

      window.dispatchEvent(new CustomEvent("cart:refresh"));
      dispatch(
        showToast({ message: "Item removed from cart", type: "success" })
      );

      try {
        const refreshedCart = await triggerGetCart().unwrap();
        const refreshedItems: any[] = Array.isArray(
          (refreshedCart as any)?.data?.items
        )
          ? (refreshedCart as any).data.items
          : [];
        setCartLines(refreshedItems);
        if (refreshedItems.length === 0) {
          router.replace("/cart");
          return;
        }
      } catch (refreshError) {
        console.error(
          "Cart refreshed after removal, but its latest response was unavailable:",
          refreshError
        );
      }

      await refetchCheckoutSummary();
    } catch (error: any) {
      console.error("Remove checkout item error:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Unable to remove item from cart"),
          type: "error",
        })
      );
    } finally {
      setRemovingSummaryItemKey(null);
    }
  };

  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!code || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponInput(code);
    setPendingCoupon(code);
    setAppliedCoupon(code);
  };

  // Coupon apply result watcher
  useEffect(() => {
    if (!pendingCoupon || isFetchingCheckoutSummary) return;

    const responseData = checkoutSummaryResponse as any;
    const responseError = checkoutSummaryError as any;
    const currentResponse = responseError?.data ?? responseData;
    if (!currentResponse) return;

    if (currentResponse?.success === false) {
      const backendMessage = currentResponse?.message;
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      if (backendMessage)
        dispatch(showToast({ message: backendMessage, type: "error" }));
      return;
    }

    if (currentResponse?.success === true) {
      const responseCouponCode = String(responseData?.data?.coupon?.code || "")
        .trim()
        .toUpperCase();
      if (responseCouponCode && responseCouponCode !== pendingCoupon) return;
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      return;
    }

    if (responseError) {
      const backendMessage =
        responseError?.data?.message ||
        responseError?.error?.data?.message ||
        "";
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      if (backendMessage)
        dispatch(showToast({ message: backendMessage, type: "error" }));
    }
  }, [
    pendingCoupon,
    isFetchingCheckoutSummary,
    checkoutSummaryResponse,
    checkoutSummaryError,
    dispatch,
  ]);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setPendingCoupon(null);
    setIsApplyingCoupon(false);
    dispatch(showToast({ message: "Coupon removed", type: "success" }));
  };

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
        type: data.type || "Home",
        is_delivery: 1,
        is_billing: 1,
      };
      const result = await createAddress(payload).unwrap();
      if ((result as any)?.status) {
        dispatch(
          showToast({ message: "Address added successfully!", type: "success" })
        );
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to add address"),
          type: "error",
        })
      );
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) return;
    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data: { ...data, type: data.type || "Home" },
      }).unwrap();
      if ((result as any)?.status) {
        dispatch(
          showToast({
            message: "Address updated successfully!",
            type: "success",
          })
        );
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to update address"),
          type: "error",
        })
      );
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;
    try {
      const result = await setDefaultAddress(id).unwrap();
      if ((result as any)?.status) {
        dispatch(
          showToast({
            message: "Default address updated!",
            type: "success",
          })
        );
        await refetchAddresses();
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to set default address"),
          type: "error",
        })
      );
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const goToOrderConfirmation = (orderId: number, orderReference: string) => {
    const params = new URLSearchParams();
    if (orderReference) params.set("order_reference", orderReference);
    if (orderId) params.set("order_id", String(orderId));
    router.replace(`/order-confirmation?${params.toString()}`);
  };

  // Razorpay helpers
  const openRazorpay = (nextOrderData: RazorpayOrderData) =>
    new Promise<any>((resolve, reject) => {
      const launch = () => initRazorpay(nextOrderData, resolve, reject);
      if (typeof window === "undefined") {
        reject(new Error("Razorpay not available"));
        return;
      }
      if (window.Razorpay) {
        launch();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = launch;
      script.onerror = () =>
        reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

  const initRazorpay = (
    nextOrderData: RazorpayOrderData,
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(new Error("Razorpay SDK unavailable"));
      return;
    }

    const options: any = {
      key: nextOrderData.razorpayKey,
      amount: Math.round(Number(nextOrderData.amount) * 100),
      currency: "INR",
      name: process.env.NEXT_PUBLIC_STORE_NAME || "Indiekonnect",
      description: `Order #${nextOrderData.orderReference}`,
      order_id: nextOrderData.razorpayOrderId,
      prefill: {
        name: selectedDeliveryAddress?.recipient_name || "",
        contact: selectedDeliveryAddress?.contact_number || "",
      },
      notes: {
        order_id: String(nextOrderData.orderId),
        order_reference: nextOrderData.orderReference,
      },
      theme: { color: INK },
      handler: function (response: any) {
        console.log("Razorpay success:", response);
        dispatch(
          showToast({ message: "Payment successful!", type: "success" })
        );
        goToOrderConfirmation(
          nextOrderData.orderId,
          nextOrderData.orderReference
        );
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
          dispatch(
            showToast({ message: "Payment cancelled", type: "error" })
          );
          reject(new Error("Payment cancelled"));
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response);
        setIsSubmitting(false);
        const errorMessage =
          response?.error?.description ||
          "Payment failed. Please try again.";
        dispatch(showToast({ message: errorMessage, type: "error" }));
        reject(new Error(errorMessage));
      });
      razorpay.open();
    } catch (error) {
      setIsSubmitting(false);
      reject(error);
    }
  };

  const validateCheckoutStock = async (activeType: "cart" | "buy_now") => {
    if (activeType === "buy_now") {
      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      )
        throw new Error("Invalid Buy Now product or quantity.");

      const result = await checkProductStock({
        product_id: productId,
        quantity,
      }).unwrap();
      if (
        !result?.data ||
        !result.data.available ||
        Number(result.data.stock_quantity ?? 0) < quantity
      ) {
        setUnavailableProductIds(new Set([productId]));
        throw new Error("Product is out of stock or insufficient quantity.");
      }
      setUnavailableProductIds(new Set());
      return;
    }

    const cartResponse = await triggerGetCart().unwrap();
    const cartItems: any[] = Array.isArray((cartResponse as any)?.data?.items)
      ? (cartResponse as any).data.items
      : [];
    setCartLines(cartItems);

    const cartId = Number((cartResponse as any)?.data?.id);
    if (!Number.isInteger(cartId) || cartId <= 0)
      throw new Error("Unable to verify your cart. Please reload the page.");

    const stockResponse = await checkCartStock({ cartId }).unwrap();
    if (
      !stockResponse?.data ||
      !Array.isArray(stockResponse.data.items)
    )
      throw new Error("Unable to verify cart stock. Please try again.");

    const unavailable = new Set<number>();
    stockResponse.data.items.forEach((item: any) => {
      if (!item.available) unavailable.add(Number(item.product_id));
    });
    setUnavailableProductIds(unavailable);

    if (!stockResponse.data.all_available || unavailable.size > 0)
      throw new Error(
        "Some items in your cart are out of stock. Please update your cart."
      );
  };

  const refreshAndValidateTotal = async (previousTotal: number) => {
    const latestResponse = await refetchCheckoutSummary();
    if (latestResponse.error || !latestResponse.data?.data)
      throw new Error(
        "Could not refresh checkout pricing. Please try again."
      );

    const latest = latestResponse.data.data as CheckoutSummaryData;
    const latestTotal = Number(latest.grand_total);
    if (!Number.isFinite(latestTotal) || latestTotal <= 0)
      throw new Error("Invalid updated checkout total.");

    if (Math.round(latestTotal * 100) !== Math.round(previousTotal * 100))
      throw new Error(
        "Your order total has changed. Please review the updated total and click Place Order again."
      );

    return latest;
  };

  const handleRetryPayment = async () => {
    if (paymentActionInProgress.current) return;

    if (!isRetryPaymentFlow || !retryOrderReference) {
      dispatch(
        showToast({
          message:
            "Order reference is missing. Please reopen the payment retry link.",
          type: "error",
        })
      );
      return;
    }

    if (isLoadingGatewaySettings) {
      dispatch(
        showToast({
          message: "Please wait while payment settings load",
          type: "info",
        })
      );
      return;
    }

    if (!selectedGateway) {
      dispatch(
        showToast({ message: "Please choose a payment method", type: "error" })
      );
      return;
    }

    paymentActionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await retryOrder({
        orderReference: retryOrderReference,
        payment_gateway: selectedGateway.paymentGateway,
      }).unwrap();

      if (!response?.success || !response?.data)
        throw new Error(
          response?.message || "Unable to retry payment. Please try again."
        );

      const data = response.data;
      const returnedGateway = data.gateway || selectedGateway.paymentGateway;

      if (returnedGateway !== selectedGateway.paymentGateway)
        throw new Error(
          `The server returned ${returnedGateway} instead of the selected ${selectedGateway.paymentGateway} gateway. Please select the correct payment method and retry.`
        );

      const returnedOrderReference = String(
        data.order_reference || retryOrderReference
      ).trim();
      const databaseOrderId = Number(data.order_id || 0);
      const amount = Number(data.total_amount || 0);

      if (selectedGateway.paymentGateway === "razorpay") {
        if (!Number.isSafeInteger(databaseOrderId) || databaseOrderId <= 0)
          throw new Error(
            "A valid order ID was not returned by the retry API."
          );

        const razorpayOrderId = String(
          data.razorpay_order_id || ""
        ).trim();
        const razorpayKey = String(data.razorpay_key || "").trim();

        if (!razorpayOrderId || !razorpayKey)
          throw new Error(
            "Razorpay retry details were not returned by the server."
          );

        if (!Number.isFinite(amount) || amount <= 0)
          throw new Error(
            "Invalid payment amount returned by the server."
          );

        dispatch(
          showToast({
            message: "Opening secure payment checkout...",
            type: "info",
          })
        );

        await openRazorpay({
          orderId: databaseOrderId,
          orderReference: returnedOrderReference,
          amount,
          razorpayOrderId,
          razorpayKey,
        });
        return;
      }

      if (
        selectedGateway.paymentGateway === "hdfc_sg" ||
        selectedGateway.paymentGateway === "hdfc_ie"
      ) {
        const paymentLink = String(data.hdfc_payment_link || "").trim();

        if (paymentLink) {
          dispatch(
            showToast({
              message: "Redirecting to secure HDFC payment...",
              type: "info",
            })
          );
          window.location.assign(getSafeHdfcUrl(paymentLink));
          return;
        }

        if (data.hdfc_sdk_payload)
          throw new Error(
            "HDFC retry details were returned without a payment link. Please check the HDFC retry SDK response handling."
          );

        throw new Error(
          "HDFC payment link was not returned by the retry API. Please try again or contact support."
        );
      }

      throw new Error(
        "The selected payment gateway is not supported for retry."
      );
    } catch (error: any) {
      console.error("Retry payment error:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to retry payment"),
          type: "error",
        })
      );
    } finally {
      paymentActionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentActionInProgress.current) return;

    if (!selectedDeliveryAddress?.id) {
      dispatch(
        showToast({
          message: "Please select a delivery address",
          type: "error",
        })
      );
      return;
    }

    if (!summaryData || Number(summaryData.grand_total) <= 0) {
      dispatch(
        showToast({
          message: "Checkout summary is not ready yet",
          type: "error",
        })
      );
      return;
    }

    if (isLoadingGatewaySettings) {
      dispatch(
        showToast({
          message: "Please wait while payment settings load",
          type: "info",
        })
      );
      return;
    }

    if (!selectedGateway) {
      dispatch(
        showToast({
          message: "Please choose a payment gateway",
          type: "error",
        })
      );
      return;
    }

    paymentActionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const latestSummary = await refreshAndValidateTotal(
        Number(summaryData.grand_total)
      );
      const verifiedType = getCheckoutTypeFromSummary({
        data: latestSummary,
      });
      await validateCheckoutStock(verifiedType);

      if (getCheckoutTypeFromSummary({ data: latestSummary }) !== verifiedType)
        throw new Error("Checkout mode changed. Please review your order again.");

      const grandTotal = Number(latestSummary.grand_total);
      const buyNowItems =
        verifiedType === "buy_now"
          ? normalizeSummaryItems(latestSummary)
          : [];

      const orderPayload: any = {
        checkout_type: verifiedType,
        address_id: selectedDeliveryAddress.id,
        grand_total: grandTotal,
        payment_gateway: selectedGateway.paymentGateway,
        summary_data: {
          subtotal: latestSummary.subtotal,
          coupon_discount: latestSummary.coupon_discount || 0,
          coupon_code: appliedCoupon || null,
          shipping_charge: latestSummary.shipping_cost || 0,
          total_tax: latestSummary.total_tax,
          net_subtotal: latestSummary.subtotal_after_discount,
          tax_breakdown: latestSummary.tax_breakdown || [],
          ...(verifiedType === "buy_now" ? { items: buyNowItems } : {}),
        },
      };

      if (verifiedType === "buy_now") {
        orderPayload.product_id = productId;
        orderPayload.quantity = quantity;
        if (variantId > 0) orderPayload.variant_id = variantId;
      }

      const response = await placeOrder(orderPayload).unwrap();
      void triggerGetCart();
      window.dispatchEvent(new CustomEvent("cart:refresh"));

      const rawResponse = response as any;
      const responseData =
        "data" in rawResponse && rawResponse.data
          ? rawResponse.data
          : rawResponse;
      const responseSuccess =
        "success" in rawResponse ? rawResponse.success : true;

      if (responseSuccess === false)
        throw new Error(rawResponse.message || "Unable to place order");

      const anyData = responseData as any;
      const orderReferences = Array.isArray(anyData?.order_references)
        ? anyData.order_references
        : [];
      const orderIds = Array.isArray(anyData?.order_ids)
        ? anyData.order_ids
        : [];
      const orders = Array.isArray(anyData?.orders) ? anyData.orders : [];
      const firstOrder = orders[0];

      const orderId = Number(
        firstOrder?.order_id ?? anyData?.order_id ?? orderIds[0] ?? 0
      );
      const orderReference = String(
        firstOrder?.order_reference ??
          anyData?.order_reference ??
          orderReferences[0] ??
          ""
      ).trim();
      const razorpayOrderId = String(
        anyData?.razorpay_order_id || ""
      ).trim();
      const razorpayKey = String(anyData?.razorpay_key || "").trim();
      const amount = Number(
        anyData?.total_amount ?? firstOrder?.total_payable ?? grandTotal
      );

      if (selectedGateway.kind === "hdfc") {
        const uniqueIds = [
          ...new Set(
            [
              ...orderIds.map(Number),
              ...orders.map((order: any) => Number(order.order_id)),
            ].filter((id) => Number.isSafeInteger(id) && id > 0)
          ),
        ];

        if (uniqueIds.length > 1)
          throw new Error(
            "This checkout created multiple seller orders. The HDFC API accepts only one order ID, so combined payment needs a backend group-payment endpoint. No payment was initiated. Check your orders before retrying."
          );

        if (!Number.isSafeInteger(orderId) || orderId <= 0)
          throw new Error(
            "Place Order did not return a valid database order_id."
          );

        const initiation = unwrapHdfc(
          await initiateHdfcPayment(orderId).unwrap()
        );

        if (!initiation.success)
          throw new Error(
            initiation.message || "HDFC initiation failed"
          );

        window.location.assign(getSafeHdfcUrl(initiation.payment_url));
        return;
      }

      if (!orderReference)
        throw new Error("Order reference was not returned by the server.");

      if (!razorpayOrderId || !razorpayKey)
        throw new Error(
          "Razorpay order details were not returned by the server."
        );

      if (!amount || amount <= 0)
        throw new Error("Invalid payment amount returned by the server.");

      await openRazorpay({
        orderId,
        orderReference,
        amount,
        razorpayOrderId,
        razorpayKey,
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to place order"),
          type: "error",
        })
      );
    } finally {
      paymentActionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const hasUnavailable = unavailableProductIds.size > 0;

  const placeOrderDisabled = isRetryPaymentFlow
    ? isSubmitting || isLoadingGatewaySettings || !retryOrderReference
    : isSubmitting ||
      !selectedDeliveryAddress?.id ||
      isApplyingCoupon ||
      Boolean(pendingCoupon) ||
      Boolean(quantityUpdatingKey) ||
      Boolean(removingSummaryItemKey) ||
      hasUnavailable ||
      isLoadingGatewaySettings;

  const handleExitPayment = () => {
    router.replace("/checkout");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main
        className={`${poppins.className} min-h-screen bg-[#F7FAF8] px-4 pb-4 pt-2 text-[#17231A] sm:px-6 sm:pt-3 lg:pb-12`}
      >
        <div className="mx-auto w-full max-w-[1160px]">
          {/* Breadcrumb */}
          <nav className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-[#87918A]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="transition hover:text-[#173E2B]"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button
              type="button"
              onClick={() =>
                displayCheckoutType === "buy_now" && productId > 0
                  ? router.back()
                  : router.push("/products")
              }
              className="transition hover:text-[#173E2B]"
            >
              Products
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-[#173E2B]">Checkout</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
            <div className="space-y-4">
              {/* Address section */}
              {!isRetryPaymentFlow &&
                (isLoadingAddresses ? (
                  <div className="rounded-xl border border-[#E4EAE6] bg-[#F5FBF6] px-4 py-3">
                    <CheckoutSkeleton />
                  </div>
                ) : availableDeliveryAddresses.length > 0 ? (
                  <div>
                    <div className="flex flex-col gap-3 rounded-xl border border-[#D5E6DB] bg-[#F1FAF4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-[#526258]">
                          Deliver to:{" "}
                          <span className="font-semibold text-[#1B2C20]">
                            {selectedDeliveryAddress?.recipient_name},{" "}
                            {selectedDeliveryAddress?.postcode}
                          </span>
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] text-[#718077] sm:truncate">
                          {selectedDeliveryAddress?.address_line_1}
                          {selectedDeliveryAddress?.address_line_2
                            ? `, ${selectedDeliveryAddress.address_line_2}`
                            : ""}
                          , {selectedDeliveryAddress?.city},{" "}
                          {selectedDeliveryAddress?.state}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSelectorModalOpen(true)}
                        className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg border border-[#16845B] bg-white px-4 text-[11px] font-semibold uppercase tracking-wide text-[#16845B] transition hover:bg-[#E6F4EA] sm:w-auto"
                      >
                        Change Address
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={openAddAddress}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#16845B] transition hover:text-[#0E6242]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add new address
                      </button>
                      {selectedDeliveryAddress &&
                        !selectedDeliveryAddress.is_default && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefaultAddress(
                                selectedDeliveryAddress.id
                              )
                            }
                            className="text-[12px] font-medium text-[#718077] underline underline-offset-4 transition hover:text-[#173E2B]"
                          >
                            Set as default
                          </button>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#CFE0D5] bg-[#F5FBF6] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#16845B] ring-1 ring-[#E4EBE6]">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-[#24352A]">
                          No delivery address yet
                        </p>
                        <p className="text-[10.5px] text-[#78847C]">
                          Add an address to complete your order.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openAddAddress}
                      className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#173E2B] px-3 text-[10.5px] font-semibold text-white transition hover:bg-[#20543A] sm:w-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add address
                    </button>
                  </div>
                ))}

              {/* Payment method section */}
              <section className="overflow-hidden rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_14px_40px_-32px_rgba(15,45,30,0.25)]">
                <div className="flex items-center gap-3 border-b border-[#ECF1ED] px-5 py-3 sm:px-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1557AD]">
                    <CreditCard className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1B2C20]">
                      Choose Payment Method
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#87918A]">
                      Choose how you would like to pay
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 p-3.5 sm:p-4">
                  {PAYMENT_GATEWAY_OPTIONS.map((option) => {
                    const isSelected = selectedGatewayId === option.id;
                    const iconColor =
                      option.icon === "hdfc"
                        ? "text-[#B51F2B]"
                        : option.icon === "razorpay"
                        ? "text-[#2457A7]"
                        : "text-[#2F65B8]";

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedGatewayId(option.id);
                          setHasManuallySelectedGateway(true);
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 sm:gap-4 sm:px-4 ${
                          isSelected
                            ? "border-[#7CA2E8] bg-[#F8FBFF] shadow-[0_0_0_2px_rgba(59,112,207,0.10),0_6px_18px_-15px_rgba(20,76,160,0.45)]"
                            : "border-[#E5ECF6] bg-white hover:border-[#B9CDED] hover:bg-[#FBFDFF]"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8EEF8] bg-[#F0F5FD] sm:h-10 sm:w-10">
                          <GatewayBrandIcon
                            icon={option.icon}
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold leading-tight tracking-[-0.02em] text-[#182A40] sm:text-[14px]">
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-[16px] text-[#64758B] sm:text-[11.5px]">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors sm:h-[24px] sm:w-[24px] ${
                            isSelected
                              ? "border-[#1557AD] bg-[#1557AD] text-white"
                              : "border-[#D6E0EF] bg-white text-transparent group-hover:border-[#9CB7E1]"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="h-3 w-3 stroke-[3] sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-transparent" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Cart summary sidebar */}
            <aside className="lg:sticky lg:top-4">
              <CartSummary
                summaryData={summaryData}
                loading={isLoadingCheckoutSummary && !summaryData}
                onPlaceOrder={
                  isRetryPaymentFlow ? handleRetryPayment : handlePlaceOrder
                }
                isSubmitting={isSubmitting}
                disabled={
                  !selectedDeliveryAddress?.id ||
                  isApplyingCoupon ||
                  Boolean(pendingCoupon) ||
                  Boolean(quantityUpdatingKey) ||
                  Boolean(removingSummaryItemKey)
                }
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                isApplyingCoupon={isApplyingCoupon}
                coupons={coupons}
                isLoadingCoupons={isLoadingCoupons}
                showCouponList={showCouponList}
                setShowCouponList={setShowCouponList}
                unavailableProductIds={unavailableProductIds}
                checkoutType={displayCheckoutType}
                selectedGateway={selectedGateway}
                gatewayLoading={isLoadingGatewaySettings}
                retryMode={isRetryPaymentFlow}
                retryOrderReference={retryOrderReference}
                onExitPayment={handleExitPayment}
                onRemoveCartItem={handleRemoveSummaryItem}
                removingSummaryItemKey={removingSummaryItemKey}
                cartLines={cartLines}
                quantityUpdatingKey={quantityUpdatingKey}
                onUpdateQuantity={handleUpdateSummaryQuantity}
              />
            </aside>
          </div>

          {/* Bottom info banner */}
          <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E4EBE6] bg-gradient-to-r from-white via-white to-[#F0F8F2] px-4 py-3 shadow-[0_10px_35px_-30px_rgba(15,45,30,0.22)] sm:px-6">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EF] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#16845B]">
                <ShieldCheck className="h-3 w-3" />
                Safe &amp; secure checkout
              </div>
              <h1 className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B] sm:text-[22px]">
                {isRetryPaymentFlow ? "Complete Your Payment" : "Checkout"}
              </h1>
              <p className="mt-0.5 hidden text-[11px] leading-5 text-[#78847C] sm:block">
                {isRetryPaymentFlow
                  ? "Retry your previous payment without creating a new order."
                  : "Confirm your delivery address and review your order before placing it."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#E1EAE3] bg-white/80 px-3 py-2 text-[10px] font-medium text-[#526258]">
              <LockKeyhole className="h-4 w-4 text-[#16845B]" />
              Encrypted payment
            </div>
          </div>
        </div>

        {/* Sticky mobile bottom bar */}
        {(summaryData || isRetryPaymentFlow) && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4EBE6] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(15,45,30,0.35)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-[520px] items-center gap-3">
              <div className="shrink-0">
                <span className="block text-[9px] uppercase tracking-wide text-[#89928B]">
                  {isRetryPaymentFlow ? "Payment" : "Total"}
                </span>
                <span className="block text-[15px] font-bold leading-tight tracking-[-0.03em] text-[#17251B]">
                  {summaryData
                    ? formatPrice(summaryData.grand_total)
                    : "Pending"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <PlaceOrderButton
                  onClick={
                    isRetryPaymentFlow ? handleRetryPayment : handlePlaceOrder
                  }
                  isSubmitting={isSubmitting}
                  gatewayLoading={isLoadingGatewaySettings}
                  disabled={placeOrderDisabled}
                  total={summaryData?.grand_total}
                  compact
                  retryMode={isRetryPaymentFlow}
                />
              </div>
            </div>
            {isRetryPaymentFlow && (
              <button
                type="button"
                onClick={handleExitPayment}
                disabled={isSubmitting}
                className="mx-auto mt-2 flex min-h-[34px] w-full max-w-[520px] items-center justify-center gap-2 rounded-lg border border-[#D8E1DB] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#526258] transition hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-3.5 w-3.5" />
                Exit Payment
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        <AddressFormModal
          isOpen={isAddressModalOpen}
          inline={false}
          onClose={() => {
            if (!isCreating && !isUpdating) {
              setIsAddressModalOpen(false);
              setEditingAddress(null);
            }
          }}
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          initialData={editingAddress}
          isLoading={isCreating || isUpdating}
        />

        <AddressSelectorModal
          isOpen={isSelectorModalOpen}
          addresses={availableDeliveryAddresses}
          selectedId={selectedDeliveryAddress?.id}
          onSelect={(address) => {
            setSelectedDeliveryAddress(address);
            setIsSelectorModalOpen(false);
          }}
          onEdit={(address) => {
            setIsSelectorModalOpen(false);
            setEditingAddress(address);
            setIsAddressModalOpen(true);
          }}
          onAddNew={() => {
            setIsSelectorModalOpen(false);
            setEditingAddress(null);
            setIsAddressModalOpen(true);
          }}
          onClose={() => setIsSelectorModalOpen(false)}
        />
      </main>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (used in main component)
// ─────────────────────────────────────────────────────────────────────────────

function getSafeHdfcUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(
      "HDFC payment URL is unavailable. Please try again."
    );
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "smartgateway.hdfc.bank.in"
  )
    throw new Error("Unexpected HDFC payment destination.");
  return url.href;
}

function unwrapHdfc(result: HdfcApiResult): HdfcApiResult {
  return result.data && typeof result.data === "object"
    ? result.data
    : result;
}