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
} from "@/lib/redux/api/cartApi";
import { useCheckProductStockMutation } from "@/lib/redux/api/productApi";
import { useGetPaymentGatewaySettingsQuery } from "@/lib/redux/api/paymentGatewaySettingsApi";
import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import AddressFormModal from "./AddressFormModal";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   CONFIG & HELPERS
========================================================= */

const INK = "#111827";

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
    description: "Pay securely via HDFC SmartGateway.",
    paymentGateway: "hdfc_ie",
    kind: "hdfc",
    icon: "hdfc",
    tag: "India",
  },
  {
    id: "hdfc-sg",
    settingKey: "HDFC_SG",
    title: "HDFC Bank",
    description: "Pay securely via HDFC SmartGateway.",
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
  summaryData?: CheckoutSummaryData,
): CheckoutSummaryItem[] => {
  if (!summaryData) return [];
  if (Array.isArray(summaryData.items) && summaryData.items.length > 0) {
    return summaryData.items;
  }

  const breakdown = summaryData.product_tax_breakdown || {};
  return Object.values(breakdown).map((product: any) => ({
    product_id: product.product_id ?? 0,
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
  if (code === "HDFC_SG") return "hdfc-sg";
  if (code.includes("FREECHARGE")) return "freecharge-axis";
  if (code.includes("RAZORPAY")) return "razorpay-axis";
  if (code.includes("AXIS")) return "razorpay-axis";
  return "freecharge-axis";
};

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

/** Reusable Place Order button used in the summary and mobile sticky bar. */
function PlaceOrderButton({
  onClick,
  isSubmitting,
  gatewayLoading,
  disabled,
  compact = false,
}: {
  onClick: () => void;
  isSubmitting: boolean;
  gatewayLoading: boolean;
  disabled: boolean;
  total: number;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isSubmitting}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#173E2B] via-[#1B5538] to-[#16845B] px-4 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/10 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#16845B]/30 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-[#9DB2A5] disabled:via-[#9DB2A5] disabled:to-[#9DB2A5] disabled:hover:translate-y-0 ${compact ? "min-h-[44px] py-2" : "min-h-[46px] py-2.5"
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
          <span>Processing order...</span>
        </>
      ) : gatewayLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading payment...</span>
        </>
      ) : (
        <>
          <span>Place Order</span>
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
        <p className="text-[11px] text-[#888888]">No coupons available right now</p>
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
        <p className="text-center text-[13px] text-[#777777]">Order summary unavailable</p>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData);
  const hasCoupon =
    !!summaryData.coupon || Number(summaryData.coupon_discount || 0) > 0;
  const hasUnavailable = unavailableProductIds.size > 0;
  const buttonDisabled =
    isSubmitting || disabled || hasUnavailable || gatewayLoading;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_16px_45px_-32px_rgba(15,45,30,0.28)]">
      <div className="border-b border-[#EDF1EE] bg-gradient-to-r from-[#F6FBF7] to-white px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#16241B]">Order Summary</h2>
            <p className="mt-0.5 text-[11px] text-[#7B877F]">Review your items before placing the order</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#16845B] shadow-sm ring-1 ring-[#E4EBE6]">
            <Package className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="max-h-[140px] space-y-3 overflow-y-auto px-4 py-2.5 sm:px-5 [scrollbar-width:thin]">
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);
            const isUnavailable = unavailableProductIds.has(item.product_id);

            return (
              <div
                key={`${item.product_id}-${index}`}
                className={`flex items-center gap-3 ${isUnavailable ? "opacity-70" : ""}`}
              >
                <div className="relative h-[42px] w-[42px] shrink-0">
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
                        <span className="rounded bg-white px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B64339]">OOS</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -right-[5px] -top-[6px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#173E2B] px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-medium leading-[16px] text-[#222922]">{item.product_name}</p>
                  {isUnavailable ? (
                    <p className="mt-0.5 text-[10px] font-semibold text-[#B64339]">
                      {checkoutType === "buy_now"
                        ? "Out of stock — choose an available quantity"
                        : "Out of stock — update your cart"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-[#89928B]">{item.tax_category || "Product"}</p>
                  )}
                </div>

                <p className="shrink-0 text-[13px] font-semibold text-[#1D2921]">{formatPrice(item.line_total)}</p>
              </div>
            );
          })
        ) : (
          <p className="py-3 text-center text-[12px] text-[#777777]">No products in your cart</p>
        )}
      </div>

      <div className="border-t border-[#EDF1EE] px-4 py-2.5 sm:px-5">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold text-[#303B33]">Discount code</p>
          <button
            type="button"
            onClick={() => setShowCouponList(!showCouponList)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-semibold text-[#16845B] transition hover:text-[#0E6242]"
          >
            {showCouponList ? "Hide coupons" : "View coupons"}
            <ChevronDown className={`h-3 w-3 transition-transform ${showCouponList ? "rotate-180" : ""}`} />
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
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isApplyingCoupon) onApplyCoupon();
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
              {isApplyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
            </button>
          </div>
        ) : (
          <div className="flex min-h-[38px] items-center justify-between rounded-xl border border-[#CDE4D5] bg-[#F1FAF4] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D9F0E1]">
                <Check className="h-3.5 w-3.5 text-[#16845B]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase text-[#263C2D]">{summaryData.coupon?.code || appliedCoupon}</p>
                <p className="text-[10px] text-[#64816D]">Coupon applied successfully</p>
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

      <div className="space-y-1 border-t border-[#E8EEE9] px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Subtotal</span>
          <span className="text-[12px] font-medium text-[#263329]">{formatPrice(summaryData.subtotal)}</span>
        </div>
        {Number(summaryData.coupon_discount || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#667168]">Discount{summaryData.coupon?.code ? ` (${summaryData.coupon.code})` : ""}</span>
            <span className="text-[12px] font-semibold text-[#16845B]">- {formatPrice(summaryData.coupon_discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#667168]">Shipping</span>
          <span className="text-[12px] font-medium text-[#263329]">{Number(summaryData.shipping_cost || 0) === 0 ? "₹0" : formatPrice(summaryData.shipping_cost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[12px] text-[#667168]">
            Estimated taxes <Info className="h-3 w-3 text-[#89928B]" />
          </span>
          <span className="text-[12px] font-medium text-[#263329]">{formatPrice(summaryData.total_tax)}</span>
        </div>
        {Number(summaryData.amount_redeemed || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#667168]">Coins</span>
            <span className="text-[12px] font-semibold text-[#16845B]">- {formatPrice(summaryData.amount_redeemed)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-[#DEE7E0] bg-gradient-to-b from-white to-[#F8FBF8] px-4 pb-3 pt-2.5 sm:px-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[14px] font-semibold text-[#263329]">Total payable</span>
            <span className="block text-[10px] text-[#89928B]">Including taxes and shipping</span>
          </div>
          <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B]">{formatPrice(summaryData.grand_total)}</span>
        </div>

        {hasUnavailable && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#F1C8C4] bg-[#FFF2F1] p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />
            <div>
              <p className="text-[12px] font-semibold text-[#B64339]">{checkoutType === "buy_now" ? "This product is unavailable" : "Some items are out of stock"}</p>
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
          />
        </div>
        {disabled && !isSubmitting && (
          <p className="mt-2 text-center text-[10px] leading-4 text-[#888888]">Select a delivery address and finish coupon updates to continue.</p>
        )}
        <div className="mt-2.5 rounded-lg border border-[#E5ECE7] bg-white px-2.5 py-1.5">
          <div className="flex items-center justify-center gap-2">
            <GatewayBrandIcon
              icon={selectedGateway.icon}
              className={`h-3.5 w-3.5 shrink-0 ${selectedGateway.icon === "hdfc" ? "text-[#B51F2B]" : selectedGateway.icon === "razorpay" ? "text-[#2457A7]" : "text-[#2F65B8]"}`}
            />
            <p className="text-center text-[11px] text-[#748078]">
              Selected: <span className="font-semibold text-[#34443A]">{selectedGateway.title}</span>
              {selectedGateway.tag ? ` · ${selectedGateway.tag}` : ""}
            </p>
          </div>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-[#748078]">
            <ShieldCheck className="h-3 w-3 text-[#16845B]" /> Secure checkout · Encrypted payment
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADDRESS SELECTOR MODAL
========================================================= */
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
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select Delivery Address</h2>
            <p className="text-sm text-gray-500 mt-1">Choose where you want your order delivered</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {addresses.map((address) => {
            const isSelected = selectedId === address.id;
            return (
              <div
                key={address.id}
                onClick={() => onSelect(address)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${isSelected
                    ? "border-[#16845B] bg-[#F5FBF6] shadow-sm ring-1 ring-[#16845B]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#16845B] bg-[#16845B]" : "border-gray-300"}`}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{address.recipient_name}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 uppercase">{address.type || 'Home'}</span>
                      {address.is_default && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {address.address_line_1}
                      {address.address_line_2 ? `, ${address.address_line_2}` : ''}, {address.city}, {address.state} - {address.postcode}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Phone: {address.contact_number}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="p-2 text-gray-400 hover:text-[#16845B] hover:bg-green-50 rounded-lg transition"
                    title="Edit Address"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 text-sm font-semibold text-[#16845B] hover:text-[#0E6242]"
          >
            <Plus className="h-4 w-4" /> Add New Address
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   MAIN CHECKOUT PAGE
========================================================= */

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
  const checkoutType: "cart" | "buy_now" = isDirectCheckout ? "buy_now" : "cart";
  const urlCouponCode = searchParams.get("coupon_code") || "";

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // For Form
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false); // For List
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<number>>(new Set());

  const [couponInput, setCouponInput] = useState(urlCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(urlCouponCode || null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);

  const [selectedGatewayId, setSelectedGatewayId] = useState<PaymentGatewayId>("freecharge-axis");
  const [hasManuallySelectedGateway, setHasManuallySelectedGateway] = useState(false);

  const paymentActionInProgress = useRef(false);

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [placeOrder] = usePlaceOrderMutation();
  const [initiateHdfcPayment] = useInitiateHdfcPaymentMutation();

  const { data: couponsData, isLoading: isLoadingCoupons } = useGetCouponsQuery();
  const {
    data: paymentGatewaySettings,
    isLoading: isLoadingGatewaySettings,
  } = useGetPaymentGatewaySettingsQuery();
  const [triggerGetCart] = useLazyGetCartQuery();
  const [checkCartStock] = useCheckCartStockMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  const selectedGateway = useMemo(
    () => PAYMENT_GATEWAY_OPTIONS.find((option) => option.id === selectedGatewayId) || PAYMENT_GATEWAY_OPTIONS[0],
    [selectedGatewayId],
  );

  useEffect(() => {
    if (isLoadingGatewaySettings || hasManuallySelectedGateway) return;
    const configuredGateway = (paymentGatewaySettings as any)?.active_gateway;
    setSelectedGatewayId(getInitialGatewayId(configuredGateway));
  }, [paymentGatewaySettings, isLoadingGatewaySettings, hasManuallySelectedGateway]);

  const coupons: CouponListItem[] = useMemo(() => {
    const list = (couponsData as any)?.data?.data;
    if (!Array.isArray(list)) return [];
    return list.filter((coupon: CouponListItem) => {
      if (coupon?.is_active === undefined) return true;
      return coupon.is_active === true || coupon.is_active === 1 || coupon.is_active === "1";
    });
  }, [couponsData]);

  const addresses: Address[] = Array.isArray((addressesData as any)?.data)
    ? (addressesData as any).data
    : [];
  const deliveryAddresses = addresses.filter((address) => address?.is_delivery === true);
  const availableDeliveryAddresses = deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  useEffect(() => {
    if (!availableDeliveryAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableDeliveryAddresses.find((address) => address?.id === current.id);
        if (stillExists) return stillExists;
      }
      const defaultAddress = availableDeliveryAddresses.find((address) => address?.is_default === true);
      if (defaultAddress) return defaultAddress;
      const deliveryAddress = availableDeliveryAddresses.find((address) => address?.is_delivery === true);
      if (deliveryAddress) return deliveryAddress;
      return availableDeliveryAddresses[0] || null;
    });
  }, [availableDeliveryAddresses]);

  const checkoutSummaryParams = useMemo(
    () => ({
      ...(selectedDeliveryAddress?.id ? { address_id: selectedDeliveryAddress.id } : {}),
      ...(appliedCoupon ? { coupon_code: appliedCoupon.trim() } : {}),
      ...(isDirectCheckout
        ? {
          product_id: productId,
          quantity,
          ...(variantId > 0 ? { variant_id: variantId } : {}),
        }
        : {}),
    }),
    [selectedDeliveryAddress?.id, appliedCoupon, isDirectCheckout, productId, quantity, variantId],
  );

  const {
    data: checkoutSummaryResponse,
    error: checkoutSummaryError,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams);

  const summaryData: CheckoutSummaryData | undefined = (checkoutSummaryResponse as any)?.data;
  const displayCheckoutType: "cart" | "buy_now" =
    summaryData?.checkout_type === "buy_now" || summaryData?.checkout_type === "cart"
      ? summaryData.checkout_type
      : checkoutType;

  const getCheckoutTypeFromSummary = (response: any): "cart" | "buy_now" => {
    const apiType = response?.data?.checkout_type ?? response?.checkout_type;
    return apiType === "buy_now" || apiType === "cart" ? apiType : checkoutType;
  };

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

  useEffect(() => {
    const fetchAndCheckCartStock = async () => {
      if (checkoutType !== "cart") return;
      try {
        const cartResp = await triggerGetCart().unwrap();
        const cartId = Number((cartResp as any)?.data?.id);
        if (cartId) {
          const stockRes = await checkCartStock({ cartId }).unwrap();
          const unavailable = new Set<number>();
          (stockRes?.data?.items || []).forEach((item: any) => {
            if (!item.available) unavailable.add(Number(item.product_id));
          });
          setUnavailableProductIds(unavailable);
        }
      } catch (err) {
        console.error("Failed to check cart stock", err);
      }
    };

    void fetchAndCheckCartStock();
  }, [checkoutType, triggerGetCart, checkCartStock]);

  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!code || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponInput(code);
    setPendingCoupon(code);
    setAppliedCoupon(code);
  };

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
      if (backendMessage) dispatch(showToast({ message: backendMessage, type: "error" }));
      return;
    }

    if (currentResponse?.success === true) {
      const responseCouponCode = String(responseData?.data?.coupon?.code || "").trim().toUpperCase();
      if (responseCouponCode && responseCouponCode !== pendingCoupon) return;
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      return;
    }

    if (responseError) {
      const backendMessage = responseError?.data?.message || responseError?.error?.data?.message || "";
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      if (backendMessage) dispatch(showToast({ message: backendMessage, type: "error" }));
    }
  }, [pendingCoupon, isFetchingCheckoutSummary, checkoutSummaryResponse, checkoutSummaryError, dispatch]);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setPendingCoupon(null);
    setIsApplyingCoupon(false);
    dispatch(showToast({ message: "Coupon removed", type: "success" }));
  };

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = { ...data, type: data.type || "Home", is_delivery: 1, is_billing: 1 };
      const result = await createAddress(payload).unwrap();
      if ((result as any)?.status) {
        dispatch(showToast({ message: "Address added successfully!", type: "success" }));
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(showToast({ message: getErrorMessage(error, "Failed to add address"), type: "error" }));
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) return;
    try {
      const result = await updateAddress({ id: editingAddress.id, data: { ...data, type: data.type || "Home" } }).unwrap();
      if ((result as any)?.status) {
        dispatch(showToast({ message: "Address updated successfully!", type: "success" }));
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(showToast({ message: getErrorMessage(error, "Failed to update address"), type: "error" }));
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;
    try {
      const result = await setDefaultAddress(id).unwrap();
      if ((result as any)?.status) {
        dispatch(showToast({ message: "Default address updated!", type: "success" }));
        await refetchAddresses();
        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(showToast({ message: getErrorMessage(error, "Failed to set default address"), type: "error" }));
    }
  };

  const goToOrderConfirmation = (orderId: number, orderReference: string) => {
    const params = new URLSearchParams();
    if (orderReference) params.set("order_reference", orderReference);
    if (orderId) params.set("order_id", String(orderId));
    router.replace(`/order-confirmation?${params.toString()}`);
  };

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
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

  const initRazorpay = (
    nextOrderData: RazorpayOrderData,
    resolve: (value: any) => void,
    reject: (reason: any) => void,
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
        dispatch(showToast({ message: "Payment successful!", type: "success" }));
        goToOrderConfirmation(nextOrderData.orderId, nextOrderData.orderReference);
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
          dispatch(showToast({ message: "Payment cancelled", type: "error" }));
          reject(new Error("Payment cancelled"));
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response);
        setIsSubmitting(false);
        const errorMessage = response?.error?.description || "Payment failed. Please try again.";
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
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid Buy Now product or quantity.");
      }

      const result = await checkProductStock({ product_id: productId, quantity }).unwrap();
      if (!result?.data || !result.data.available || Number(result.data.stock_quantity ?? 0) < quantity) {
        setUnavailableProductIds(new Set([productId]));
        throw new Error("Product is out of stock or insufficient quantity.");
      }
      setUnavailableProductIds(new Set());
      return;
    }

    const cartResponse = await triggerGetCart().unwrap();
    const cartId = Number((cartResponse as any)?.data?.id);
    if (!Number.isInteger(cartId) || cartId <= 0) {
      throw new Error("Unable to verify your cart. Please reload the page.");
    }

    const stockResponse = await checkCartStock({ cartId }).unwrap();
    if (!stockResponse?.data || !Array.isArray(stockResponse.data.items)) {
      throw new Error("Unable to verify cart stock. Please try again.");
    }

    const unavailable = new Set<number>();
    stockResponse.data.items.forEach((item: any) => {
      if (!item.available) unavailable.add(Number(item.product_id));
    });
    setUnavailableProductIds(unavailable);

    if (!stockResponse.data.all_available || unavailable.size > 0) {
      throw new Error("Some items in your cart are out of stock. Please update your cart.");
    }
  };

  const refreshAndValidateTotal = async (previousTotal: number) => {
    const latestResponse = await refetchCheckoutSummary();
    if (latestResponse.error || !latestResponse.data?.data) {
      throw new Error("Could not refresh checkout pricing. Please try again.");
    }

    const latest = latestResponse.data.data as CheckoutSummaryData;
    const latestTotal = Number(latest.grand_total);
    if (!Number.isFinite(latestTotal) || latestTotal <= 0) {
      throw new Error("Invalid updated checkout total.");
    }
    if (Math.round(latestTotal * 100) !== Math.round(previousTotal * 100)) {
      throw new Error("Your order total has changed. Please review the updated total and click Place Order again.");
    }
    return latest;
  };

  const handlePlaceOrder = async () => {
    if (paymentActionInProgress.current) return;

    if (!selectedDeliveryAddress?.id) {
      dispatch(showToast({ message: "Please select a delivery address", type: "error" }));
      return;
    }
    if (!summaryData || Number(summaryData.grand_total) <= 0) {
      dispatch(showToast({ message: "Checkout summary is not ready yet", type: "error" }));
      return;
    }
    if (isLoadingGatewaySettings) {
      dispatch(showToast({ message: "Please wait while payment settings load", type: "info" }));
      return;
    }
    if (!selectedGateway) {
      dispatch(showToast({ message: "Please choose a payment gateway", type: "error" }));
      return;
    }

    paymentActionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const latestSummary = await refreshAndValidateTotal(Number(summaryData.grand_total));
      const verifiedType = getCheckoutTypeFromSummary({ data: latestSummary });
      await validateCheckoutStock(verifiedType);

      if (getCheckoutTypeFromSummary({ data: latestSummary }) !== verifiedType) {
        throw new Error("Checkout mode changed. Please review your order again.");
      }

      const grandTotal = Number(latestSummary.grand_total);
      const buyNowItems = verifiedType === "buy_now" ? normalizeSummaryItems(latestSummary) : [];
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
      const responseData = "data" in rawResponse && rawResponse.data ? rawResponse.data : rawResponse;
      const responseSuccess = "success" in rawResponse ? rawResponse.success : true;
      if (responseSuccess === false) throw new Error(rawResponse.message || "Unable to place order");

      const anyData = responseData as any;
      const orderReferences = Array.isArray(anyData?.order_references) ? anyData.order_references : [];
      const orderIds = Array.isArray(anyData?.order_ids) ? anyData.order_ids : [];
      const orders = Array.isArray(anyData?.orders) ? anyData.orders : [];
      const firstOrder = orders[0];
      const orderId = Number(firstOrder?.order_id ?? anyData?.order_id ?? orderIds[0] ?? 0);
      const orderReference = String(firstOrder?.order_reference ?? anyData?.order_reference ?? orderReferences[0] ?? "").trim();
      const razorpayOrderId = String(anyData?.razorpay_order_id || "").trim();
      const razorpayKey = String(anyData?.razorpay_key || "").trim();
      const amount = Number(anyData?.total_amount ?? firstOrder?.total_payable ?? grandTotal);

      if (selectedGateway.kind === "hdfc") {
        const uniqueIds = [
          ...new Set(
            [...orderIds.map(Number), ...orders.map((order: any) => Number(order.order_id))]
              .filter((id) => Number.isSafeInteger(id) && id > 0),
          ),
        ];

        if (uniqueIds.length > 1) {
          throw new Error("This checkout created multiple seller orders. The HDFC API accepts only one order ID, so combined payment needs a backend group-payment endpoint. No payment was initiated. Check your orders before retrying.");
        }
        if (!Number.isSafeInteger(orderId) || orderId <= 0) {
          throw new Error("Place Order did not return a valid database order_id.");
        }

        const initiation = unwrapHdfc(await initiateHdfcPayment(orderId).unwrap());
        if (!initiation.success) throw new Error(initiation.message || "HDFC initiation failed");
        const url = getSafeHdfcUrl(initiation.payment_url);
        window.location.assign(url);
        return;
      }

      if (!orderReference) throw new Error("Order reference was not returned by the server.");
      if (!razorpayOrderId || !razorpayKey) throw new Error("Razorpay order details were not returned by the server.");
      if (!amount || amount <= 0) throw new Error("Invalid payment amount returned by the server.");

      await openRazorpay({ orderId, orderReference, amount, razorpayOrderId, razorpayKey });
    } catch (error: any) {
      console.error("Checkout error:", error);
      dispatch(showToast({ message: getErrorMessage(error, "Failed to place order"), type: "error" }));
    } finally {
      paymentActionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const hasUnavailable = unavailableProductIds.size > 0;
  const placeOrderDisabled =
    isSubmitting ||
    !selectedDeliveryAddress?.id ||
    isApplyingCoupon ||
    Boolean(pendingCoupon) ||
    hasUnavailable ||
    isLoadingGatewaySettings;

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  return (
    <>
      <Header />
      <main className={`${poppins.className} min-h-screen bg-[#F7FAF8] px-4 pb-28 pt-2 text-[#17231A] sm:px-6 sm:pt-3 lg:pb-12`}>
        <div className="mx-auto w-full max-w-[1160px]">
          <nav className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-[#87918A]">
            <button type="button" onClick={() => router.push("/")} className="transition hover:text-[#173E2B]">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button
              type="button"
              onClick={() => (displayCheckoutType === "buy_now" && productId > 0 ? router.back() : router.push("/cart"))}
              className="transition hover:text-[#173E2B]"
            >
              Cart
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-[#173E2B]">Checkout</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">

              {/* DELIVER TO — compact bar only (no section header) */}
              {isLoadingAddresses ? (
                <div className="rounded-xl border border-[#E4EAE6] bg-[#F5FBF6] px-4 py-3">
                  <CheckoutSkeleton />
                </div>
              ) : availableDeliveryAddresses.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#D5E6DB] bg-[#F1FAF4] px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] text-[#526258]">
                        Deliver to:{" "}
                        <span className="font-semibold text-[#1B2C20]">
                          {selectedDeliveryAddress?.recipient_name}, {selectedDeliveryAddress?.postcode}
                        </span>
                      </p>
                      <p className="mt-1 truncate text-[12px] text-[#718077]">
                        {selectedDeliveryAddress?.address_line_1}
                        {selectedDeliveryAddress?.address_line_2 ? `, ${selectedDeliveryAddress.address_line_2}` : ""}, {selectedDeliveryAddress?.city}, {selectedDeliveryAddress?.state}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSelectorModalOpen(true)}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-[#16845B] bg-white px-4 text-[11px] font-semibold uppercase tracking-wide text-[#16845B] transition hover:bg-[#E6F4EA]"
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
                      <Plus className="h-3.5 w-3.5" /> Add new address
                    </button>
                    {selectedDeliveryAddress && !selectedDeliveryAddress.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(selectedDeliveryAddress.id)}
                        className="text-[12px] font-medium text-[#718077] underline underline-offset-4 transition hover:text-[#173E2B]"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#CFE0D5] bg-[#F5FBF6] px-3.5 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#16845B] ring-1 ring-[#E4EBE6]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#24352A]">No delivery address yet</p>
                      <p className="text-[10.5px] text-[#78847C]">Add an address to complete your order.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#173E2B] px-3 text-[10.5px] font-semibold text-white transition hover:bg-[#20543A]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add address
                  </button>
                </div>
              )}

              {/* PAYMENT METHODS - ALWAYS VISIBLE */}
              <section className="overflow-hidden rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_14px_40px_-32px_rgba(15,45,30,0.25)]">
                <div className="flex items-center gap-3 border-b border-[#ECF1ED] px-5 py-3 sm:px-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1557AD]">
                    <CreditCard className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1B2C20]">Choose Payment Method</h2>
                    <p className="mt-0.5 text-[11px] text-[#87918A]">Choose how you would like to pay</p>
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
                        className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${isSelected
                            ? "border-[#7CA2E8] bg-[#F8FBFF] shadow-[0_0_0_2px_rgba(59,112,207,0.10),0_6px_18px_-15px_rgba(20,76,160,0.45)]"
                            : "border-[#E5ECF6] bg-white hover:border-[#B9CDED] hover:bg-[#FBFDFF]"
                          }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E8EEF8] bg-[#F0F5FD]">
                          <GatewayBrandIcon icon={option.icon} className={`h-5 w-5 ${iconColor}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold leading-tight tracking-[-0.02em] text-[#182A40]">
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-[16px] text-[#64758B]">
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected
                              ? "border-[#1557AD] bg-[#1557AD] text-white"
                              : "border-[#D6E0EF] bg-white text-transparent group-hover:border-[#9CB7E1]"
                            }`}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN – Order Summary */}
            <aside className="lg:sticky lg:top-4">
              <CartSummary
                summaryData={summaryData}
                loading={isLoadingCheckoutSummary && !summaryData}
                onPlaceOrder={handlePlaceOrder}
                isSubmitting={isSubmitting}
                disabled={!selectedDeliveryAddress?.id || isApplyingCoupon || Boolean(pendingCoupon)}
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
              />
            </aside>
          </div>

          <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E4EBE6] bg-gradient-to-r from-white via-white to-[#F0F8F2] px-4 py-3 shadow-[0_10px_35px_-30px_rgba(15,45,30,0.22)] sm:px-6">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EF] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#16845B]">
                <ShieldCheck className="h-3 w-3" /> Safe & secure checkout
              </div>
              <h1 className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B] sm:text-[22px]">Checkout</h1>
              <p className="mt-0.5 hidden text-[11px] leading-5 text-[#78847C] sm:block">Confirm your delivery address and review your order before placing it.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#E1EAE3] bg-white/80 px-3 py-2 text-[10px] font-medium text-[#526258]">
              <LockKeyhole className="h-4 w-4 text-[#16845B]" /> Encrypted payment
            </div>
          </div>
        </div>

        {/* Mobile sticky Place Order bar */}
        {summaryData && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4EBE6] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(15,45,30,0.35)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-[520px] items-center gap-3">
              <div className="shrink-0">
                <span className="block text-[9px] uppercase tracking-wide text-[#89928B]">Total</span>
                <span className="block text-[17px] font-bold leading-tight tracking-[-0.03em] text-[#17251B]">
                  {formatPrice(summaryData.grand_total)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <PlaceOrderButton
                  onClick={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                  gatewayLoading={isLoadingGatewaySettings}
                  disabled={placeOrderDisabled}
                  total={summaryData.grand_total}
                  compact
                />
              </div>
            </div>
          </div>
        )}

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

function getSafeHdfcUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("HDFC payment URL is unavailable. Please try again.");
  }
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "smartgateway.hdfc.bank.in") {
    throw new Error("Unexpected HDFC payment destination.");
  }
  return url.href;
}

function unwrapHdfc(result: HdfcApiResult): HdfcApiResult {
  return result.data && typeof result.data === "object" ? result.data : result;
}