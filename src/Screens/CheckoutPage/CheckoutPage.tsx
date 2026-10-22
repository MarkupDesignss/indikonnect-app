"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  Building2,
  Landmark,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import {
  Loader2,
  Plus,
  Pencil,
  Package,
  MapPin,
  Check,
  ChevronRight,
  Tag,
  Info,
  X,
  ChevronDown,
  BadgePercent,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { showToast } from "@/lib/slices/toastSlice";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";
import {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
} from "@/lib/redux/api/checkoutApi";
import {
  useGetCouponsQuery,
  useLazyGetCartQuery,
  useCheckCartStockMutation,
} from "@/lib/redux/api/cartApi";
import { useCheckProductStockMutation } from "@/lib/redux/api/productApi";

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

/* =========================================================
   CONFIG & HELPERS
========================================================= */

const INK = "#111111";

const HDFC_MERCHANTS = [
  {
    id: "sg",
    display: "IndieKonnect SG",
    legalName: "INDIEKONNECT ENTERPRISES PVT LTD SG",
  },
  {
    id: "india",
    display: "IndieKonnect India",
    legalName: "INDIEKONNECT ENTERPRISES PRIVATE LIMITED",
  },
] as const;

type PaymentChoice =
  { gateway: "razorpay" } | { gateway: "hdfc"; merchantName: string };

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const formatPrice = (value: any): string => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

const getErrorMessage = (error: any, fallback: string): string => {
  return (
    error?.data?.message ||
    error?.error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    fallback
  );
};

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
}) => {
  return (
    item.primary_image ||
    item.images?.find((img) => img.is_primary)?.image_url ||
    item.images?.[0]?.image_url ||
    null
  );
};

const getCouponValueLabel = (coupon: CouponListItem): string => {
  const type = String(coupon.type || "").toLowerCase();
  const value = coupon.value ?? 0;
  if (type.includes("percent") || type === "%") return `${value}% OFF`;
  if (Number(value) > 0) return `${formatPrice(value)} OFF`;
  return "Discount";
};

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function CheckoutSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-1/3 rounded bg-[#eeeeec]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-10 rounded-lg bg-[#eeeeec]" />
        <div className="h-10 rounded-lg bg-[#eeeeec]" />
        <div className="h-10 rounded-lg bg-[#eeeeec]" />
        <div className="h-10 rounded-lg bg-[#eeeeec]" />
      </div>
      <div className="h-10 rounded-lg bg-[#eeeeec]" />
      <div className="h-20 rounded-lg bg-[#eeeeec]" />
    </div>
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
      <div className="space-y-2 rounded-[7px] border border-[#E2E2E0] bg-white p-3">
        <div className="h-14 animate-pulse rounded-md bg-[#EEEEEC]" />
        <div className="h-14 animate-pulse rounded-md bg-[#EEEEEC]" />
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="rounded-[7px] border border-[#E2E2E0] bg-white p-4 text-center">
        <p className="text-[11px] text-[#888888]">
          No coupons available right now
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[260px] space-y-2 overflow-y-auto rounded-[7px] border border-[#E2E2E0] bg-white p-2">
      {coupons.map((coupon, index) => {
        const isApplied =
          appliedCode &&
          appliedCode.toUpperCase() === String(coupon.code).toUpperCase();

        return (
          <div
            key={`${coupon.id ?? coupon.code}-${index}`}
            className="flex items-center gap-3 rounded-[6px] border border-dashed border-[#DDDDDD] p-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F1F0] text-[#555555]">
              <BadgePercent className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] font-semibold uppercase text-[#171717]">
                  {coupon.code}
                </p>
                <span className="shrink-0 text-[10px] font-medium text-[#3F765A]">
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
              className="shrink-0 rounded-[5px] border border-[#111111] px-2.5 py-1 text-[10px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#CFCFCC] disabled:text-[#AAAAAA] disabled:hover:bg-transparent"
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// 🔥 CART SUMMARY COMPONENT
function CartSummary({
  summaryData,
  loading,
  onPay,
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
}: {
  summaryData?: CheckoutSummaryData;
  loading: boolean;
  onPay: () => void;
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
}) {
  if (loading) {
    return (
      <div className="rounded-[8px] border border-[#E4E4E2] bg-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/2 rounded bg-[#EEEEEC]" />
          <div className="h-16 rounded-lg bg-[#EEEEEC]" />
          <div className="h-16 rounded-lg bg-[#EEEEEC]" />
          <div className="h-10 rounded-lg bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-4 rounded bg-[#EEEEEC]" />
          <div className="h-12 rounded-lg bg-[#EEEEEC]" />
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="rounded-[8px] border border-[#E4E4E2] bg-white p-8">
        <p className="text-center text-[12px] text-[#777777]">
          Order summary unavailable
        </p>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData);
  const hasCoupon =
    !!summaryData.coupon || Number(summaryData.coupon_discount || 0) > 0;
  const hasUnavailable = unavailableProductIds.size > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_10px_40px_-30px_rgba(0,0,0,0.15)]">
      <div className="px-6 pb-4 pt-6">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#171717]">
          Order Summary
        </h2>
      </div>

      {/* PRODUCT LIST */}
      <div className="space-y-4 px-6 pb-5">
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);
            const isUnavailable = unavailableProductIds.has(item.product_id);

            return (
              <div
                key={`${item.product_id}-${index}`}
                className={`flex items-center gap-3 ${
                  isUnavailable ? "opacity-70" : ""
                }`}
              >
                <div className="relative h-[62px] w-[62px] shrink-0">
                  <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#EFEFEF] bg-[#F8F8F8]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name || "Product"}
                        fill
                        sizes="62px"
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-[#999999]" />
                      </div>
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded bg-white px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#B64339]">
                          OOS
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -right-[5px] -top-[7px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#111111] px-1 text-[9px] font-semibold text-white">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] font-medium leading-[15px] text-[#222222]">
                    {item.product_name}
                  </p>
                  {isUnavailable ? (
                    <p className="mt-0.5 text-[9px] font-semibold text-[#B64339]">
                      {checkoutType === "buy_now"
                        ? "Out of stock — please change quantity or product"
                        : "Out of stock — please update your cart"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-[#888888]">
                      {item.tax_category || "Product"}
                    </p>
                  )}
                </div>

                <p className="shrink-0 text-[12px] font-medium text-[#111111]">
                  {formatPrice(item.line_total)}
                </p>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-[11px] text-[#777777]">
            No products in your cart
          </p>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#444444]">
              Discount Code
            </p>
            <p className="mt-0.5 text-[9px] text-[#999999]">
              Have a promo code? Apply it here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCouponList(!showCouponList)}
            className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#111111] underline underline-offset-2"
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
          <div className="mb-3">
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
          <div className="flex h-[42px] w-full items-center rounded-xl border border-[#E1E1E1] bg-white px-3 transition focus-within:border-[#999999] focus-within:ring-1 focus-within:ring-black/5">
            <Tag className="mr-2.5 h-[15px] w-[15px] shrink-0 text-[#999999]" />
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isApplyingCoupon) {
                  onApplyCoupon();
                }
              }}
              placeholder="Enter discount code"
              disabled={isApplyingCoupon}
              className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-[#333333] outline-none placeholder:normal-case placeholder:text-[#999999]"
            />
            <button
              type="button"
              onClick={() => onApplyCoupon()}
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="ml-2 flex h-[28px] min-w-[58px] shrink-0 items-center justify-center rounded-lg bg-[#111111] px-3 text-[10px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#D5D5D3]"
            >
              {isApplyingCoupon ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        ) : (
          <div className="flex min-h-[42px] items-center justify-between rounded-[7px] border border-[#CFE0D4] bg-[#F5F9F6] px-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCEBE0]">
                <Check className="h-3.5 w-3.5 text-[#3F765A]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase text-[#333333]">
                  {summaryData.coupon?.code || appliedCoupon}
                </p>
                <p className="text-[9px] text-[#6F7B72]">
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

        {summaryData.coupon && (
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-[#777777]">
              {summaryData.coupon.title || `${summaryData.coupon.code} applied`}
            </span>
            <span className="font-semibold text-[#3F765A]">
              - {formatPrice(summaryData.coupon.discount_amount)}
            </span>
          </div>
        )}
      </div>

      <div className="mx-6 border-t border-[#E5E5E3]" />

      <div className="space-y-3 px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#555555]">Subtotal</span>
          <span className="text-[11px] font-medium text-[#222222]">
            {formatPrice(summaryData.subtotal)}
          </span>
        </div>
        {Number(summaryData.coupon_discount || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">Discount</span>
            <span className="text-[11px] font-medium text-[#3F765A]">
              - {formatPrice(summaryData.coupon_discount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#555555]">Shipping</span>
          <span className="text-[11px] font-medium text-[#222222]">
            {Number(summaryData.shipping_cost || 0) === 0
              ? "₹0"
              : formatPrice(summaryData.shipping_cost)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-[#555555]">
            Estimated taxes
            <Info className="h-3 w-3 text-[#777777]" />
          </span>
          <span className="text-[11px] font-medium text-[#222222]">
            {formatPrice(summaryData.total_tax)}
          </span>
        </div>
        {Number(summaryData.amount_redeemed || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#555555]">Coins</span>
            <span className="text-[11px] font-medium text-[#3F765A]">
              - {formatPrice(summaryData.amount_redeemed)}
            </span>
          </div>
        )}
      </div>

      <div className="mx-6 border-t border-[#DCDCD9]" />

      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-[15px] font-semibold text-[#222222]">Total</span>
        <span className="text-[24px] font-semibold tracking-[-0.035em] text-[#111111]">
          {formatPrice(summaryData.grand_total)}
        </span>
      </div>

      <div className="px-6 pb-6">
        {hasUnavailable && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#F1C8C4] bg-[#FFF2F1] p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B64339]" />
            <div>
              <p className="text-[11px] font-semibold text-[#B64339]">
                {checkoutType === "buy_now"
                  ? "This product is unavailable"
                  : "Some items are out of stock"}
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-[#8A4A44]">
                {checkoutType === "buy_now"
                  ? "This product is out of stock or the requested quantity is unavailable. Please return to the product and select an available quantity."
                  : "Please go back to the cart and remove unavailable items to continue."}
              </p>
            </div>
          </div>
        )}

        {/* 🔥 FIXED BUTTON */}
        <button
          type="button"
          onClick={onPay}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 text-[12px] font-semibold text-white shadow-[0_8px_20px_-12px_rgba(0,0,0,0.5)] transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting || disabled || hasUnavailable}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking Stock...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Choose payment method</span>
              <span className="opacity-60">·</span>
              <span>{formatPrice(summaryData.grand_total)}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>

        {disabled && !isSubmitting && (
          <p className="mt-2 text-center text-[9px] leading-4 text-[#888888]">
            Select an address to continue.
          </p>
        )}
      </div>

      <div className="border-t border-[#F0F0F0] bg-[#FAFAFA] px-6 py-4">
        <div className="flex items-center justify-center gap-2 text-[10px] text-[#737373]">
          <LockKeyhole className="h-3.5 w-3.5" />
          Secure checkout · Choose Razorpay or HDFC Bank
        </div>
      </div>
    </div>
  );
}

function PaymentMethodModal({
  open,
  amount,
  busy,
  verificationStatus,
  verificationError,
  onRetryVerification,
  onClose,
  onConfirm,
}: {
  open: boolean;
  amount: number;
  busy: boolean;
  verificationStatus: "checking" | "ready" | "error";
  verificationError: string;
  onRetryVerification: () => void;
  onClose: () => void;
  onConfirm: (choice: PaymentChoice) => void;
}) {
  const [gateway, setGateway] = useState<"razorpay" | "hdfc">("razorpay");
  const [merchantName, setMerchantName] = useState<string>(
    HDFC_MERCHANTS[0].legalName,
  );

  // Define before useEffect: dependencies are evaluated during render.
  const isChecking = verificationStatus === "checking";
  const canPay = verificationStatus === "ready" && !busy;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && !isChecking) onClose();
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, busy, isChecking, onClose]);

  if (!open) return null;

  const optionClass = (selected: boolean) =>
    `group relative w-full rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
      selected
        ? "border-[#191919] bg-[#F9F9F8] shadow-[0_0_0_1px_#191919]"
        : "border-[#E7E7E5] bg-white hover:border-[#999] hover:bg-[#FCFCFC]"
    }`;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-[5px] sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy && !isChecking)
          onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-choice-title"
        className="my-auto w-full max-w-[540px] overflow-hidden rounded-[24px] bg-white shadow-[0_35px_110px_rgba(0,0,0,.3)]"
      >
        <div className="relative overflow-hidden bg-[#151515] px-6 pb-7 pt-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-44 w-44 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <button
              type="button"
              aria-label="Close payment options"
              onClick={onClose}
              disabled={busy || isChecking}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            IndieKonnect · Secure checkout
          </p>
          <h2
            id="payment-choice-title"
            className="relative mt-2 text-[24px] font-semibold tracking-tight sm:text-[27px]"
          >
            How would you like to pay?
          </h2>
          <p className="relative mt-2 text-[12px] leading-5 text-white/65">
            Choose your preferred payment partner to continue.
          </p>
          <div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-3">
            <span className="text-[11px] text-white/70">Order total</span>
            <strong className="text-[21px] font-semibold tracking-tight">
              {formatPrice(amount)}
            </strong>
          </div>
        </div>

        <div className="px-5 pt-5 sm:px-8" aria-live="polite">
          {isChecking && (
            <div className="flex items-start gap-3 rounded-xl border border-[#DFE6F2] bg-[#F5F8FD] p-4">
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[#37558B]" />
              <div>
                <p className="text-[12px] font-semibold text-[#243A63]">
                  Verifying your order…
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#5B6B84]">
                  Checking latest product availability and total. Payment
                  options will be ready automatically.
                </p>
              </div>
            </div>
          )}
          {verificationStatus === "error" && (
            <div className="rounded-xl border border-[#F0C8C5] bg-[#FFF6F5] p-4">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[#A7372E]">
                <AlertTriangle className="h-4 w-4" /> Unable to continue
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#924840]">
                {verificationError}
              </p>
              <button
                type="button"
                onClick={onRetryVerification}
                className="mt-3 rounded-lg bg-[#171717] px-4 py-2 text-[11px] font-semibold text-white"
              >
                Try again
              </button>
            </div>
          )}
          {verificationStatus === "ready" && (
            <p className="flex items-center gap-2 text-[11px] font-medium text-[#347454]">
              <Check className="h-4 w-4" /> Order verified. Select your payment
              method.
            </p>
          )}
        </div>
        <div className="max-h-[58vh] space-y-3 overflow-y-auto px-5 py-6 sm:px-8">
          <button
            type="button"
            disabled={!canPay}
            onClick={() => setGateway("razorpay")}
            aria-pressed={gateway === "razorpay"}
            className={optionClass(gateway === "razorpay")}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F0F0] text-[#242424]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#202020]">
                  Razorpay
                </p>
                <p className="mt-1 text-[10px] text-[#777]">
                  Continue through Razorpay secure checkout
                </p>
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  gateway === "razorpay"
                    ? "border-black bg-black text-white"
                    : "border-[#C8C8C8]"
                }`}
              >
                {gateway === "razorpay" && <Check className="h-3 w-3" />}
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={!canPay}
            onClick={() => setGateway("hdfc")}
            aria-pressed={gateway === "hdfc"}
            className={optionClass(gateway === "hdfc")}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F2F4] text-[#222]">
                <Landmark className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#202020]">
                  HDFC Bank
                </p>
                <p className="mt-1 text-[10px] text-[#777]">
                  Choose one of the two IndieKonnect merchant accounts
                </p>
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  gateway === "hdfc"
                    ? "border-black bg-black text-white"
                    : "border-[#C8C8C8]"
                }`}
              >
                {gateway === "hdfc" && <Check className="h-3 w-3" />}
              </span>
            </div>
          </button>

          {gateway === "hdfc" && (
            <div className="rounded-2xl border border-[#E9E9E9] bg-[#FAFAFA] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#555]" />
                <h3 className="text-[12px] font-semibold text-[#333]">
                  Select IndieKonnect account
                </h3>
              </div>
              <div className="space-y-2">
                {HDFC_MERCHANTS.map((merchant) => {
                  const selected = merchantName === merchant.legalName;
                  return (
                    <button
                      key={merchant.id}
                      type="button"
                      disabled={!canPay}
                      onClick={() => setMerchantName(merchant.legalName)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[#191919] bg-white shadow-sm"
                          : "border-[#E5E5E5] bg-white/70 hover:border-[#AAAAAA]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2F2F2] text-[#424242]">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-[#202020]">
                          {merchant.display}
                        </span>
                        <span className="mt-1 block break-words text-[9px] leading-4 text-[#888]">
                          {merchant.legalName}
                        </span>
                      </span>
                      <span
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-[#C8C8C8]"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-[#ECECEC] bg-white px-5 pb-6 pt-5 sm:px-8">
          <button
            type="button"
            disabled={!canPay}
            onClick={() =>
              onConfirm(
                gateway === "razorpay"
                  ? { gateway }
                  : { gateway, merchantName },
              )
            }
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#191919] px-5 text-[12px] font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying order...
              </>
            ) : busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Continue to{" "}
                {gateway === "hdfc" ? "HDFC Bank" : "Razorpay"}{" "}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-[#888]">
            <LockKeyhole className="h-3 w-3" /> Payment processing is handled by
            your selected gateway
          </p>
        </div>
      </section>
    </div>
  );
}

type PendingHdfcOrder = {
  orderId: number;
  orderReference: string;
  gatewayOrderId: string;
  paymentUrl: string;
  amount: number;
  createdAt: number;
};

const PENDING_HDFC_ORDER_KEY = "indiekonnect_pending_hdfc_order";

/* =========================================================
   MAIN CHECKOUT PAGE COMPONENT
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
  const checkoutType: "cart" | "buy_now" = isDirectCheckout
    ? "buy_now"
    : "cart";

  const urlCouponCode = searchParams.get("coupon_code") || "";

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "checking" | "ready" | "error"
  >("checking");
  const [verificationError, setVerificationError] = useState("");
  const verifiedCheckoutTypeRef = useRef<"cart" | "buy_now" | null>(null);
  const verificationRequestRef = useRef(0);
  const [pendingHdfcOrder, setPendingHdfcOrder] =
    useState<PendingHdfcOrder | null>(null);

  /* =========================================================
     STOCK STATE (Highlights unavailable items)
  ========================================================= */
  const [unavailableProductIds, setUnavailableProductIds] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PENDING_HDFC_ORDER_KEY);
      if (stored) {
        const pending = JSON.parse(stored) as PendingHdfcOrder;
        if (pending?.orderReference && pending?.createdAt) {
          setPendingHdfcOrder(pending);
        }
      }
    } catch {
      sessionStorage.removeItem(PENDING_HDFC_ORDER_KEY);
    }
  }, []);

  const [couponInput, setCouponInput] = useState(urlCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    urlCouponCode || null,
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);
  const previousSummaryResponseRef = useRef<any>(null);

  /* =========================================================
     RTK QUERIES & MUTATIONS
  ========================================================= */
  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [placeOrder] = usePlaceOrderMutation();

  const { data: couponsData, isLoading: isLoadingCoupons } =
    useGetCouponsQuery();

  const [triggerGetCart] = useLazyGetCartQuery();

  // Stock mutations
  const [checkCartStock] = useCheckCartStockMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  const coupons: CouponListItem[] = useMemo(() => {
    const list = couponsData?.data?.data;
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

  const addresses: Address[] = Array.isArray(addressesData?.data)
    ? addressesData.data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true,
  );

  const availableDeliveryAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  useEffect(() => {
    if (!availableDeliveryAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableDeliveryAddresses.find(
          (address) => address?.id === current.id,
        );
        if (stillExists) return stillExists;
      }
      const defaultAddress = availableDeliveryAddresses.find(
        (address) => address?.is_default === true,
      );
      if (defaultAddress) return defaultAddress;

      const deliveryAddress = availableDeliveryAddresses.find(
        (address) => address?.is_delivery === true,
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
    ],
  );

  const {
    data: checkoutSummaryResponse,
    error: checkoutSummaryError,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams);

  const summaryData: CheckoutSummaryData | undefined =
    checkoutSummaryResponse?.data;

  // UI follows the checkout type returned by the summary API.
  const displayCheckoutType: "cart" | "buy_now" =
    summaryData?.checkout_type === "buy_now" ||
    summaryData?.checkout_type === "cart"
      ? summaryData.checkout_type
      : checkoutType;

  // Summary can be authoritative, but URL remains fallback for older API responses.
  const getCheckoutTypeFromSummary = (response: any): "cart" | "buy_now" => {
    const apiType = response?.data?.checkout_type ?? response?.checkout_type;
    return apiType === "buy_now" || apiType === "cart" ? apiType : checkoutType;
  };

  /* =========================================================
     AUTO-REFETCH SUMMARY (Product Detail List)
  ========================================================= */

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFocus = () => refetchCheckoutSummary();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetchCheckoutSummary]);

  /* =========================================================
     LIVE STOCK CHECK (Run once on checkout mount if CART type)
  ========================================================= */
  useEffect(() => {
    const fetchAndCheckCartStock = async () => {
      if (checkoutType !== "cart") return; // Only for cart, not buy now
      try {
        // Fetch cart to get latest ID
        const cartResp = await triggerGetCart().unwrap();
        const cartId = Number((cartResp as any)?.data?.id);

        if (cartId) {
          const stockRes = await checkCartStock({ cartId }).unwrap();
          const unavailable = new Set<number>();

          stockRes.data.items.forEach((item: any) => {
            if (!item.available) {
              unavailable.add(Number(item.product_id));
            }
          });

          setUnavailableProductIds(unavailable);
        }
      } catch (err) {
        console.error("Failed to check cart stock", err);
      }
    };

    fetchAndCheckCartStock();
  }, [checkoutType, triggerGetCart, checkCartStock]);

  /* =========================================================
     COUPON LOGIC
  ========================================================= */
  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!code || isApplyingCoupon) return;

    previousSummaryResponseRef.current = checkoutSummaryResponse;
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
      if (backendMessage) {
        dispatch(showToast({ message: backendMessage, type: "error" }));
      }
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
      if (backendMessage) {
        dispatch(showToast({ message: backendMessage, type: "error" }));
      }
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

  /* =========================================================
     ADDRESS HANDLERS
  ========================================================= */
  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
        type: data.type || "Home",
        is_delivery: 1,
        is_billing: 1,
      };
      const result = await createAddress(payload).unwrap();
      if (result?.status) {
        dispatch(
          showToast({
            message: "Address added successfully!",
            type: "success",
          }),
        );
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to add address"),
          type: "error",
        }),
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
      if (result?.status) {
        dispatch(
          showToast({
            message: "Address updated successfully!",
            type: "success",
          }),
        );
        await refetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
        setTimeout(() => refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to update address"),
          type: "error",
        }),
      );
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;
    try {
      const result = await setDefaultAddress(id).unwrap();
      if (result?.status) {
        dispatch(
          showToast({
            message: "Default address updated!",
            type: "success",
          }),
        );
        await refetchAddresses();
        setTimeout(() => refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to set default address"),
          type: "error",
        }),
      );
    }
  };

  /* =========================================================
     PAYMENT / RAZORPAY HANDLERS
  ========================================================= */
  const goToOrderConfirmation = (orderId: number, orderReference: string) => {
    const params = new URLSearchParams();
    if (orderReference) params.set("order_reference", orderReference);
    if (orderId) params.set("order_id", String(orderId));
    router.replace(`/order-confirmation?${params.toString()}`);
  };

  const openRazorpay = (nextOrderData: RazorpayOrderData) => {
    return new Promise<any>((resolve, reject) => {
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
      script.src = "https\://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = launch;
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  };

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
        dispatch(
          showToast({ message: "Payment successful!", type: "success" }),
        );
        goToOrderConfirmation(
          nextOrderData.orderId,
          nextOrderData.orderReference,
        );
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
        const errorMessage =
          response?.error?.description || "Payment failed. Please try again.";
        dispatch(showToast({ message: errorMessage, type: "error" }));
        reject(new Error(errorMessage));
      });
      razorpay.open();
    } catch (error) {
      setIsSubmitting(false);
      reject(error);
    }
  };

  /* =========================================================
     LIVE STOCK VALIDATION — shared by both payment steps
     buy_now -> individual product; cart -> complete cart
  ========================================================= */
  const validateCheckoutStock = async (activeType: "cart" | "buy_now") => {
    if (activeType === "buy_now") {
      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error("Invalid Buy Now product or quantity.");
      }

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

    // Force a new cart request, not cached data.
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
      throw new Error(
        "Some items in your cart are out of stock. Please update your cart.",
      );
    }
  };

  // Prevent double click while React's pending state is being scheduled.
  const paymentActionInProgress = useRef(false);

  // Never open a payment gateway using an outdated displayed order total.
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
    // Compare in paise to avoid floating point rounding issues.
    if (Math.round(latestTotal * 100) !== Math.round(previousTotal * 100)) {
      throw new Error(
        "Your order total has changed. Please review the new total and choose payment again.",
      );
    }
    return latest;
  };

  /* =========================================================
     STEP 1: MODAL OPENS INSTANTLY; SUMMARY -> STOCK VERIFY
     No invisible waiting on the first click.
  ========================================================= */
  const verifyPaymentSelection = async () => {
    if (paymentActionInProgress.current) return;
    const requestId = ++verificationRequestRef.current;
    paymentActionInProgress.current = true;
    setVerificationStatus("checking");
    setVerificationError("");
    verifiedCheckoutTypeRef.current = null;

    try {
      // Summary FIRST, giving an authoritative checkout type when available.
      const verifiedSummary = await refreshAndValidateTotal(
        Number(summaryData?.grand_total || 0),
      );
      const resolvedType = getCheckoutTypeFromSummary({
        data: verifiedSummary,
      });
      await validateCheckoutStock(resolvedType);
      if (requestId !== verificationRequestRef.current) return;
      verifiedCheckoutTypeRef.current = resolvedType;
      setVerificationStatus("ready");
    } catch (error: any) {
      if (requestId !== verificationRequestRef.current) return;
      setVerificationStatus("error");
      setVerificationError(
        getErrorMessage(error, "Could not verify stock. Please try again."),
      );
    } finally {
      paymentActionInProgress.current = false;
    }
  };

  const handleOpenPayment = () => {
    if (paymentActionInProgress.current || isPaymentModalOpen) return;
    if (!selectedDeliveryAddress?.id) {
      dispatch(
        showToast({
          message: "Please select a delivery address",
          type: "error",
        }),
      );
      return;
    }
    if (!summaryData || Number(summaryData.grand_total) <= 0) {
      dispatch(
        showToast({
          message: "Checkout summary is not ready yet",
          type: "error",
        }),
      );
      return;
    }
    // Immediate UI feedback, without waiting for API requests.
    setIsPaymentModalOpen(true);
    void verifyPaymentSelection();
  };

  /* =========================================================
     HANDLE PAY NOW (Place Order)
  ========================================================= */
  const handlePayNow = async (paymentChoice: PaymentChoice) => {
    if (paymentActionInProgress.current) return;
    if (
      !summaryData ||
      !selectedDeliveryAddress?.id ||
      verificationStatus !== "ready"
    )
      return;
    const verifiedType = verifiedCheckoutTypeRef.current;
    if (!verifiedType) return;

    paymentActionInProgress.current = true;
    setIsSubmitting(true);

    let latestSummary: CheckoutSummaryData;
    try {
      // STEP 2: Recheck stock immediately before placeOrder.
      await validateCheckoutStock(verifiedType);
      latestSummary = await refreshAndValidateTotal(
        Number(summaryData.grand_total),
      );

      if (
        getCheckoutTypeFromSummary({ data: latestSummary }) !== verifiedType
      ) {
        setVerificationStatus("error");
        setVerificationError("Checkout mode changed. Verify your order again.");
        throw new Error(
          "Checkout mode changed. Please verify your order again.",
        );
      }
      const grandTotal = Number(latestSummary.grand_total);
      const buyNowItems =
        verifiedType === "buy_now" ? normalizeSummaryItems(latestSummary) : [];

      const orderPayload: any = {
        checkout_type: verifiedType,
        address_id: selectedDeliveryAddress.id,
        grand_total: grandTotal,
        payment_gateway:
          paymentChoice.gateway === "razorpay"
            ? "razorpay"
            : paymentChoice.merchantName ===
                "INDIEKONNECT ENTERPRISES PVT LTD SG"
              ? "hdfc_sg"
              : "hdfc_ie",
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
      triggerGetCart();
      window.dispatchEvent(new CustomEvent("cart:refresh"));

      const rawResponse = response as any;
      const responseData =
        "data" in rawResponse && rawResponse.data
          ? rawResponse.data
          : rawResponse;
      const responseSuccess =
        "success" in rawResponse ? rawResponse.success : true;

      if (responseSuccess === false) {
        throw new Error(rawResponse.message || "Unable to place order");
      }

      const anyData = responseData as any;
      const orderReferences = Array.isArray(anyData?.order_references)
        ? anyData.order_references
        : [];
      const orderIds = Array.isArray(anyData?.order_ids)
        ? anyData.order_ids
        : [];
      const orders = Array.isArray(anyData?.orders) ? anyData.orders : [];
      const firstOrder = orders?.[0];
      const orderId = Number(
        firstOrder?.order_id ?? anyData?.order_id ?? orderIds?.[0] ?? 0,
      );
      const orderReference = String(
        firstOrder?.order_reference ??
          anyData?.order_reference ??
          orderReferences?.[0] ??
          "",
      ).trim();
      const razorpayOrderId = String(anyData?.razorpay_order_id || "").trim();
      const razorpayKey = String(anyData?.razorpay_key || "").trim();
      const amount = Number(
        anyData?.total_amount ?? firstOrder?.total_payable ?? grandTotal,
      );

      if (paymentChoice.gateway === "hdfc") {
        const hdfcUrl = anyData?.hdfc_payment_link;
        if (typeof hdfcUrl !== "string" || !hdfcUrl.trim()) {
          throw new Error("HDFC payment link was not returned by the server.");
        }
        let verifiedPaymentUrl: URL;
        try {
          verifiedPaymentUrl = new URL(hdfcUrl);
        } catch {
          throw new Error("HDFC payment URL is invalid.");
        }
        if (
          verifiedPaymentUrl.protocol !== "https:" ||
          verifiedPaymentUrl.hostname !== "smartgateway.hdfc.bank.in"
        ) {
          throw new Error("Unexpected HDFC payment destination.");
        }

        const pending: PendingHdfcOrder = {
          orderId,
          orderReference:
            orderReference || String(anyData?.hdfc_order_id || ""),
          gatewayOrderId: String(anyData?.hdfc_order_id || ""),
          paymentUrl: verifiedPaymentUrl.href,
          amount,
          createdAt: Date.now(),
        };
        sessionStorage.setItem(PENDING_HDFC_ORDER_KEY, JSON.stringify(pending));
        setPendingHdfcOrder(pending);
        setIsPaymentModalOpen(false);
        window.location.assign(verifiedPaymentUrl.href);
        return;
      }

      if (!orderReference)
        throw new Error("Order reference was not returned by the server.");
      if (!razorpayOrderId || !razorpayKey)
        throw new Error(
          "Razorpay order details were not returned by the server.",
        );
      if (!amount || amount <= 0)
        throw new Error("Invalid payment amount returned by the server.");

      setIsPaymentModalOpen(false);
      await openRazorpay({
        orderId,
        orderReference,
        amount,
        razorpayOrderId,
        razorpayKey,
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to place order"),
          type: "error",
        }),
      );
    } finally {
      paymentActionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
      <PaymentMethodModal
        open={isPaymentModalOpen}
        amount={Number(summaryData?.grand_total || 0)}
        busy={isSubmitting}
        verificationStatus={verificationStatus}
        verificationError={verificationError}
        onRetryVerification={() => {
          void verifyPaymentSelection();
        }}
        onClose={() => {
          if (!isSubmitting) {
            verificationRequestRef.current++;
            setIsPaymentModalOpen(false);
          }
        }}
        onConfirm={handlePayNow}
      />
      <Header />
      <main
        className={`${poppins.className} min-h-screen bg-[#FAFAFA] px-4 pb-20 pt-8 text-[#171717] sm:px-6 sm:pt-11`}
      >
        {pendingHdfcOrder && (
          <div className="mx-auto mb-6 max-w-[1160px] rounded-xl border border-[#dedede] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#171717]">
                  HDFC payment awaiting verification
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666]">
                  Order {pendingHdfcOrder.orderReference} ·{" "}
                  {formatPrice(pendingHdfcOrder.amount)}. Returning to checkout
                  is not confirmation of payment. Check your order status with
                  the merchant before placing another order.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const url = new URL(pendingHdfcOrder.paymentUrl);
                      if (
                        url.protocol !== "https:" ||
                        url.hostname !== "smartgateway.hdfc.bank.in"
                      )
                        throw new Error("Untrusted bank URL");
                      window.location.assign(url.href);
                    } catch {
                      dispatch(
                        showToast({
                          message: "Invalid stored payment link",
                          type: "error",
                        }),
                      );
                    }
                  }}
                  className="rounded-lg bg-[#171717] px-4 py-2 text-xs font-semibold text-white"
                >
                  Resume HDFC checkout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem(PENDING_HDFC_ORDER_KEY);
                    setPendingHdfcOrder(null);
                  }}
                  className="rounded-lg border border-[#ddd] px-3 py-2 text-xs font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1160px]">
          <nav className="mb-6 flex items-center gap-2 text-[11px] font-medium text-[#858585]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="transition hover:text-[#171717]"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button
              type="button"
              onClick={() =>
                displayCheckoutType === "buy_now" && productId > 0
                  ? router.back()
                  : router.push("/cart")
              }
              className="transition hover:text-[#171717]"
            >
              Cart
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#171717]">Checkout</span>
          </nav>

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#EBEBEB] pb-7 sm:mb-10">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#858585]">
                Almost yours
              </p>
              <h1 className="text-[28px] font-semibold tracking-[-0.045em] sm:text-[36px]">
                Secure checkout
              </h1>
              <p className="mt-2 text-[12px] leading-6 text-[#777777]">
                Confirm your address and review your order before payment.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#666666]">
              <ShieldCheck className="h-4 w-4 text-[#333333]" /> Secure payment
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-9">
            <section className="overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_10px_40px_-30px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#F0F0F0] px-5 py-6 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F6F6]">
                    <MapPin className="h-[18px] w-[18px] text-[#222222]" />
                  </span>
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
                      Delivery address
                    </h2>
                    <p className="mt-1 text-[11px] text-[#888888]">
                      Choose where you would like your order delivered
                    </p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-[#ECECEC] px-3 py-1.5 text-[10px] font-medium text-[#777777] sm:inline-flex">
                  Step 01
                </span>
              </div>

              <div className="px-5 py-6 sm:px-7 sm:py-7">
                {isLoadingAddresses ? (
                  <CheckoutSkeleton />
                ) : availableDeliveryAddresses.length > 0 ? (
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {availableDeliveryAddresses.map((address) => {
                        const selected =
                          selectedDeliveryAddress?.id === address.id;
                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => setSelectedDeliveryAddress(address)}
                            aria-pressed={selected}
                            className={`relative min-h-[178px] rounded-xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                              selected
                                ? "border-[#191919] bg-[#FCFCFC] shadow-[0_0_0_1px_#191919]"
                                : "border-[#E8E8E8] bg-white hover:border-[#B9B9B9]"
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#727272]">
                                <MapPin className="h-3.5 w-3.5" />{" "}
                                {address.type || "Address"}
                              </span>
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#171717] bg-[#171717] text-white"
                                    : "border-[#CFCFCF]"
                                }`}
                              >
                                {selected && <Check className="h-3 w-3" />}
                              </span>
                            </div>
                            <div className="text-[13px] font-semibold text-[#202020]">
                              {address.recipient_name}
                            </div>
                            <p className="mt-2 line-clamp-3 text-[11px] leading-[19px] text-[#6F6F6F]">
                              {address.address_line_1}
                              {address.address_line_2
                                ? `, ${address.address_line_2}`
                                : ""}
                              , {address.city}, {address.state}{" "}
                              {address.postcode}
                            </p>
                            <p className="mt-2 text-[11px] text-[#6F6F6F]">
                              {address.contact_number}
                            </p>
                            {address.is_default && (
                              <span className="mt-3 inline-flex rounded-full bg-[#EFEFEF] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#555555]">
                                Default
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setIsAddressModalOpen(true);
                        }}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCDCDC] bg-white px-4 text-[11px] font-semibold text-[#222222] transition hover:border-[#171717] hover:bg-[#FAFAFA]"
                      >
                        <Plus className="h-4 w-4" /> Add new address
                      </button>
                      {selectedDeliveryAddress && (
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(selectedDeliveryAddress);
                              setIsAddressModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#666666] hover:text-black"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit selected
                          </button>
                          {!selectedDeliveryAddress.is_default && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSetDefaultAddress(
                                  selectedDeliveryAddress.id,
                                )
                              }
                              className="text-[11px] font-medium text-[#666666] underline underline-offset-4 hover:text-black"
                            >
                              Set default
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-[#DDDDDD] bg-[#FBFBFB] px-5 py-12 text-center">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                      <MapPin className="h-5 w-5 text-[#666666]" />
                    </span>
                    <h3 className="text-[14px] font-semibold">
                      No delivery address yet
                    </h3>
                    <p className="mt-2 text-[11px] text-[#777777]">
                      Add an address to complete your order.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#171717] px-5 text-[11px] font-semibold text-white transition hover:bg-[#353535]"
                    >
                      <Plus className="h-4 w-4" /> Add delivery address
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-[#F0F0F0] bg-[#FCFCFC] px-5 py-4 text-[10px] leading-5 text-[#777777] sm:px-7">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" /> Your delivery
                details are used to fulfil this order.
              </div>
            </section>

            <aside className="lg:sticky lg:top-7">
              <CartSummary
                summaryData={summaryData}
                loading={isLoadingCheckoutSummary && !summaryData}
                onPay={handleOpenPayment} // <-- Yahan handleOpenPayment pass kiya
                isSubmitting={isSubmitting}
                disabled={
                  !selectedDeliveryAddress?.id ||
                  isApplyingCoupon ||
                  Boolean(pendingCoupon)
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
              />
            </aside>
          </div>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="mt-8 inline-flex items-center gap-2 text-[11px] font-medium text-[#777777] transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />{" "}
            {displayCheckoutType === "buy_now"
              ? "Back to product"
              : "Back to cart"}
          </button>
        </div>
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
      </main>
      <Footer />
    </>
  );
}
