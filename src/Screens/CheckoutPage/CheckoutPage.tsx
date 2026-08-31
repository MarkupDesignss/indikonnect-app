"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import {
  Loader2,
  Plus,
  Pencil,
  Package,
  Truck,
  Zap,
  MapPin,
  Check,
  ChevronRight,
  Tag,
  Info,
  Home,
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

import { useGetShippingMethodsQuery } from "@/lib/redux/api/shippingApi";

import {
  useGetCheckoutSummaryQuery,
  usePlaceOrderMutation,
} from "@/lib/redux/api/checkoutApi";
import { useGetCouponsQuery } from "@/lib/redux/api/cartApi";
import AddressFormModal from "./AddressFormModal";

import Razorpay from "../../../public/indiekonnect-web/images/rozarpay.jpeg";

/* ============================================================
   TYPES
============================================================ */

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

  billing_recipient_name?: string;
  billing_contact_number?: string;
  billing_address_line_1?: string;
  billing_address_line_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
  billing_country?: string;
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

interface ProductTaxBreakdown {
  product_id?: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  tax_category: string;
  tax_rate: string;
  taxable_value: number;
  tax_amount: number;
  line_total_after_tax: number;
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
  product_tax_breakdown?: Record<string, ProductTaxBreakdown>;
  tax_breakdown?: any[];
  summary?: {
    subtotal: number;
    less_coupon: number;
    net_subtotal: number;
    product_gst_18: number;
    product_other_tax: number;
    additional_gst_on_subtotal?: number;
    total_tax: number;
    plus_shipping: number;
    less_coins: number;
    grand_total: number;
  };
}

interface RazorpayOrderData {
  orderId: number;
  orderReference: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKey: string;
}

/* Loose shape for coupon list items — kept defensive since the
   backend field names for /coupons aren't strictly typed here. */
interface CouponListItem {
  id?: number;
  code: string;
  title?: string;
  description?: string;
  type?: string; // e.g. "percentage" | "fixed" | "flat"
  value?: string | number;
  min_order_amount?: string | number;
  max_discount_amount?: string | number;
  expires_at?: string;
  is_active?: boolean | number | string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* ============================================================
   DESIGN TOKENS
============================================================ */

const INK = "#111111";

/* ============================================================
   HELPERS
============================================================ */

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
  if (!summaryData) {
    return [];
  }

  if (Array.isArray(summaryData.items) && summaryData.items.length > 0) {
    return summaryData.items;
  }

  const breakdown = summaryData.product_tax_breakdown || {};

  return Object.values(breakdown).map((product) => ({
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

  if (type.includes("percent") || type === "%") {
    return `${value}% OFF`;
  }

  if (Number(value) > 0) {
    return `${formatPrice(value)} OFF`;
  }

  return "Discount";
};

/* ============================================================
   LOADING SKELETON
============================================================ */

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

/* ============================================================
   FORM FIELD
============================================================ */

function Field({
  label,
  value,
  placeholder,
  className = "",
}: {
  label: string;
  value?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-medium text-[#555555]">
        {label}
      </label>
      <input
        value={value || ""}
        placeholder={placeholder}
        readOnly
        className="h-[35px] w-full rounded-[6px] border border-[#DCDCDC] bg-white px-3 text-[12px] text-[#555555] outline-none transition"
      />
    </div>
  );
}

/* ============================================================
   SHIPPING OPTION
============================================================ */

function ShippingOption({
  method,
  selected,
  onSelect,
}: {
  method: any;
  selected: boolean;
  onSelect: () => void;
}) {
  const code = String(method?.code || "").toLowerCase();

  const Icon = code.includes("express")
    ? Zap
    : code.includes("free")
      ? Package
      : Truck;

  const priceValue = Number(method?.base_rate || 0);

  const price =
    method?.rate_type === "free" || priceValue === 0
      ? "Free"
      : formatPrice(priceValue);

  return (
    <label
      className={`group relative flex min-h-[72px] w-full cursor-pointer items-center gap-3 px-3 py-3 transition-all duration-200 ${selected ? "bg-[#F8F8F7]" : "bg-white hover:bg-[#FAFAF9]"
        }`}
    >
      <input
        type="radio"
        name="shipping-method"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      {/* RADIO */}
      <div
        className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition-all ${selected
            ? "border-[#111111]"
            : "border-[#BDBDBB] group-hover:border-[#888888]"
          }`}
      >
        {selected && (
          <div className="h-[9px] w-[9px] rounded-full bg-[#111111]" />
        )}
      </div>

      {/* ICON */}
      <div
        className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[7px] transition-all ${selected
            ? "bg-[#111111] text-white"
            : "bg-[#F1F1F0] text-[#555555]"
          }`}
      >
        <Icon className="h-[17px] w-[17px]" />
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[12px] font-semibold text-[#171717]">
            {method?.name || "Shipping"}
          </p>
          <p className="shrink-0 text-[12px] font-semibold text-[#111111]">
            {price}
          </p>
        </div>

        <p className="mt-1 text-[10px] leading-4 text-[#888888]">
          {method?.description || `${method?.estimated_days || 4} business days`}
        </p>
      </div>

      {/* SELECTED BADGE */}
      {selected && (
        <div className="shrink-0 rounded-full bg-[#111111] px-2.5 py-1">
          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-white">
            Selected
          </span>
        </div>
      )}
    </label>
  );
}

/* ============================================================
   COUPON LIST PANEL
============================================================ */

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

/* ============================================================
   CART SUMMARY
============================================================ */

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
          Cart summary unavailable
        </p>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData);

  const hasCoupon =
    !!summaryData.coupon || Number(summaryData.coupon_discount || 0) > 0;

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white">
      {/* HEADER */}
      <div className="px-4 pb-3 pt-4">
        <h2 className="text-[18px] font-semibold text-[#171717]">
          Your Cart
        </h2>
      </div>

      {/* PRODUCTS */}
      <div className="space-y-3 px-4 pb-4">
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);

            return (
              <div
                key={`${item.product_id}-${index}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-[48px] w-[48px] shrink-0">
                  <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#EDEBE5]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name || "Product"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-[#999999]" />
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
                  <p className="mt-0.5 text-[10px] text-[#888888]">
                    {item.tax_category || "Product"}
                  </p>
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

      {/* COUPON */}
      <div className="px-4 pb-4">
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
              className={`h-3 w-3 transition-transform ${showCouponList ? "rotate-180" : ""
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
          <div className="flex h-[42px] w-full items-center rounded-[7px] border border-[#D7D7D5] bg-white px-3 transition focus-within:border-[#999999] focus-within:ring-1 focus-within:ring-black/5">
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
              className="ml-2 flex h-[28px] min-w-[58px] shrink-0 items-center justify-center rounded-[5px] bg-[#111111] px-3 text-[10px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#D5D5D3]"
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

      <div className="mx-4 border-t border-[#E5E5E3]" />

      {/* PRICE BREAKDOWN */}
      <div className="space-y-2.5 px-4 py-4">
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
              ? "Free"
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

      <div className="mx-4 border-t border-[#DCDCD9]" />

      {/* TOTAL */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-[16px] font-medium text-[#222222]">Total</span>
        <span className="text-[17px] font-semibold text-[#111111]">
          {formatPrice(summaryData.grand_total)}
        </span>
      </div>

      {/* PAY BUTTON */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onPay}
          disabled={isSubmitting || disabled}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[6px] bg-black px-4 text-[12px] font-semibold text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span>Pay with</span>
              <span className="font-bold">Razorpay</span>
              <span>•</span>
              <span>{formatPrice(summaryData.grand_total)}</span>
            </>
          )}
        </button>

        {disabled && !isSubmitting && (
          <p className="mt-2 text-center text-[9px] leading-4 text-[#888888]">
            Select an address and shipping method to continue.
          </p>
        )}
      </div>

      {/* RAZORPAY */}
      <div className="border-t border-[#EEEEEC] px-4 py-2.5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[9px] text-[#777777]">
            Secure payment powered by
          </span>
          <div className="relative h-5 w-16 overflow-hidden">
            <Image src={Razorpay} alt="Razorpay" fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN CHECKOUT PAGE
============================================================ */

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  /* ==========================================================
     URL PARAMS
  ========================================================== */

  const productId = Number(searchParams.get("product_id") || 0);
  const quantity = Number(searchParams.get("quantity") || 0);
  const isDirectCheckout = productId > 0 && quantity > 0;
  const urlCouponCode = searchParams.get("coupon_code") || "";

  /* ==========================================================
     STATE
  ========================================================== */

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState(urlCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    urlCouponCode || null,
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);

  /* ==========================================================
     ADDRESS API
  ========================================================== */

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] =
    useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  /* ==========================================================
     SHIPPING API
  ========================================================== */

  const { data: shippingMethodsData, isLoading: isLoadingShippingMethods } =
    useGetShippingMethodsQuery();

  /* ==========================================================
     ORDER API
  ========================================================== */

  const [placeOrder] = usePlaceOrderMutation();

  /* ==========================================================
     COUPONS API
  ========================================================== */

  const { data: couponsData, isLoading: isLoadingCoupons } =
    useGetCouponsQuery();

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

  /* ==========================================================
     ADDRESS DATA
  ========================================================== */

  const addresses: Address[] = Array.isArray(addressesData?.data)
    ? addressesData.data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true,
  );

  const availableDeliveryAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  /* ==========================================================
     SHIPPING DATA
  ========================================================== */

  const shippingMethods = Array.isArray(shippingMethodsData?.data)
    ? shippingMethodsData.data
    : [];

  const activeShippingMethods = shippingMethods
    .filter(
      (method: any) =>
        method?.is_active === true ||
        method?.is_active === 1 ||
        method?.is_active === "1",
    )
    .sort(
      (a: any, b: any) =>
        Number(a?.sort_order || 0) - Number(b?.sort_order || 0),
    );

  const selectedShippingMethod = shippingMethods.find(
    (method: any) => method?.code === deliveryMethod,
  );

  /* ==========================================================
     DEFAULT SHIPPING
  ========================================================== */

  useEffect(() => {
    if (!activeShippingMethods.length) {
      return;
    }

    const exists = activeShippingMethods.some(
      (method: any) => method?.code === deliveryMethod,
    );

    if (!exists) {
      setDeliveryMethod(activeShippingMethods[0]?.code || "");
    }
  }, [activeShippingMethods, deliveryMethod]);

  /* ==========================================================
     DEFAULT ADDRESS
  ========================================================== */

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
        if (stillExists) {
          return stillExists;
        }
      }

      const defaultAddress = availableDeliveryAddresses.find(
        (address) => address?.is_default === true,
      );
      if (defaultAddress) {
        return defaultAddress;
      }

      const deliveryAddress = availableDeliveryAddresses.find(
        (address) => address?.is_delivery === true,
      );
      if (deliveryAddress) {
        return deliveryAddress;
      }

      return availableDeliveryAddresses[0] || null;
    });
  }, [availableDeliveryAddresses]);

  /* ==========================================================
     CHECKOUT SUMMARY PARAMS
  ========================================================== */

  const checkoutSummaryParams = useMemo(
    () => ({
      ...(selectedDeliveryAddress?.id
        ? { address_id: selectedDeliveryAddress.id }
        : {}),
      ...(selectedShippingMethod?.id
        ? { shipping_method_id: selectedShippingMethod.id }
        : {}),
      ...(appliedCoupon ? { coupon_code: appliedCoupon.trim() } : {}),
      ...(isDirectCheckout ? { product_id: productId, quantity } : {}),
    }),
    [
      selectedDeliveryAddress?.id,
      selectedShippingMethod?.id,
      appliedCoupon,
      isDirectCheckout,
      productId,
      quantity,
    ],
  );

  /* ==========================================================
     CHECKOUT SUMMARY API
  ========================================================== */

  const {
    data: checkoutSummaryResponse,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams);

  const summaryData: CheckoutSummaryData | undefined =
    checkoutSummaryResponse?.data;

  /* ==========================================================
     APPLY COUPON
  ========================================================== */

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();

    if (!code) {
      dispatch(
        showToast({
          message: "Please enter a discount code",
          type: "error",
        }),
      );
      return;
    }

    try {
      setIsApplyingCoupon(true);
      setCouponInput(code);

      /*
       * Current checkout API uses coupon_code inside the
       * checkout-summary request. We set the coupon first, then
       * explicitly refetch so the API validates/recalculates
       * the checkout summary.
       */
      setAppliedCoupon(code);

      const result = await refetchCheckoutSummary();
      const returnedData = result?.data?.data;
      const returnedCoupon = returnedData?.coupon;
      const returnedDiscount = Number(returnedData?.coupon_discount || 0);

      dispatch(
        showToast({
          message:
            returnedCoupon || returnedDiscount > 0
              ? "Coupon applied successfully!"
              : "Coupon applied. Checking discount...",
          type: "success",
        }),
      );
    } catch (error: any) {
      setAppliedCoupon(null);
      dispatch(
        showToast({
          message: getErrorMessage(error, "Unable to apply coupon"),
          type: "error",
        }),
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  /* ==========================================================
     REMOVE COUPON
  ========================================================== */

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponInput("");

    dispatch(
      showToast({
        message: "Coupon removed",
        type: "success",
      }),
    );
  };

  /* ==========================================================
     CREATE ADDRESS
  ========================================================== */

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
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

        setTimeout(() => {
          refetchCheckoutSummary();
        }, 100);
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

  /* ==========================================================
     UPDATE ADDRESS
  ========================================================== */

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) {
      return;
    }

    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data,
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

        setTimeout(() => {
          refetchCheckoutSummary();
        }, 100);
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

  /* ==========================================================
     DELETE ADDRESS
  ========================================================== */

  const handleDeleteAddress = async (address: Address) => {
    if (!address?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete address for ${address.recipient_name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteAddress({
        id: address.id,
        data: { id: address.id },
      }).unwrap();

      if (result?.status) {
        dispatch(
          showToast({
            message: "Address deleted successfully!",
            type: "success",
          }),
        );

        await refetchAddresses();

        if (selectedDeliveryAddress?.id === address.id) {
          setSelectedDeliveryAddress(null);
        }

        setTimeout(() => {
          refetchCheckoutSummary();
        }, 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to delete address"),
          type: "error",
        }),
      );
    }
  };

  /* ==========================================================
     SET DEFAULT ADDRESS
  ========================================================== */

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) {
      return;
    }

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

        setTimeout(() => {
          refetchCheckoutSummary();
        }, 100);
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

  /* ==========================================================
     ORDER CONFIRMATION
  ========================================================== */

  const goToOrderConfirmation = (orderId: number, orderReference: string) => {
    const confirmationUrl = `/order-confirmation?order_id=${orderId}&order_reference=${encodeURIComponent(
      orderReference,
    )}`;

    router.replace(confirmationUrl);
  };

  /* ==========================================================
     RAZORPAY
  ========================================================== */

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
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = launch;
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
      };

      document.body.appendChild(script);
    });
  };

  /* ==========================================================
     RAZORPAY INIT
  ========================================================== */

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
          showToast({
            message: "Payment successful!",
            type: "success",
          }),
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

          dispatch(
            showToast({
              message: "Payment cancelled",
              type: "error",
            }),
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

        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          }),
        );

        reject(new Error(errorMessage));
      });

      razorpay.open();
    } catch (error) {
      setIsSubmitting(false);
      reject(error);
    }
  };

  /* ==========================================================
     PAY NOW
  ========================================================== */

  const handlePayNow = async () => {
    if (!selectedDeliveryAddress?.id) {
      dispatch(
        showToast({
          message: "Please select a delivery address to continue",
          type: "error",
        }),
      );
      return;
    }

    if (!selectedShippingMethod?.id) {
      dispatch(
        showToast({
          message: "Please select a delivery method",
          type: "error",
        }),
      );
      return;
    }

    if (!summaryData) {
      dispatch(
        showToast({
          message: "Checkout summary is not available",
          type: "error",
        }),
      );
      return;
    }

    const grandTotal = Number(summaryData.grand_total || 0);

    if (!grandTotal || grandTotal <= 0) {
      dispatch(
        showToast({
          message: "Invalid order amount",
          type: "error",
        }),
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload: any = {
        address_id: selectedDeliveryAddress.id,
        shipping_method_id: selectedShippingMethod.id,
        grand_total: grandTotal,
        payment_gateway: "razorpay",

        summary_data: {
          subtotal: summaryData.subtotal,
          coupon_discount: summaryData.coupon_discount || 0,
          coupon_code: appliedCoupon || null,
          shipping_charge: summaryData.shipping_cost || 0,
          shipping_method_id: selectedShippingMethod.id,
          total_tax: summaryData.total_tax,
          net_subtotal: summaryData.subtotal_after_discount,
          tax_breakdown: summaryData.tax_breakdown || [],
        },
      };

      if (isDirectCheckout) {
        orderPayload.product_id = productId;
        orderPayload.quantity = quantity;
      }

      const response = await placeOrder(orderPayload).unwrap();

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Unable to place order");
      }

      await openRazorpay({
        orderId: response.data.order_id,
        orderReference: response.data.order_reference,
        amount: Number(response.data.amount),
        razorpayOrderId: response.data.razorpay_order_id,
        razorpayKey: response.data.razorpay_key,
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
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#F7F7F6] px-4 py-6 font-sans sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[980px]">
        {/* PAGE HEADING + BREADCRUMB */}
        <div className="mb-5 px-1 sm:mb-6 sm:px-0">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[28px]">
            Checkout
          </h1>

          <nav
            aria-label="Breadcrumb"
            className="mt-2 flex items-center gap-1.5 text-[11px] font-medium"
          >
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-1 text-[#777777] transition hover:text-[#111111]"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>

            <ChevronRight className="h-3 w-3 text-[#B0B0AD]" />

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="text-[#777777] transition hover:text-[#111111]"
            >
              Cart
            </button>

            <ChevronRight className="h-3 w-3 text-[#B0B0AD]" />

            <span className="text-[#111111]">Checkout</span>
          </nav>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_372px] lg:items-start">
          {/* LEFT COLUMN */}
          <section className="overflow-hidden rounded-[8px] border border-[#E6E6E4] bg-white">
            {/* SHIPPING ADDRESS HEADER */}
            <div className="px-4 pb-4 pt-6 sm:px-[18px]">
              <h1 className="text-[16px] font-medium text-[#171717]">
                Shipping Address
              </h1>
            </div>

            {/* ADDRESS CONTENT */}
            <div className="px-4 pb-5 sm:px-[18px]">
              {isLoadingAddresses ? (
                <CheckoutSkeleton />
              ) : availableDeliveryAddresses.length > 0 ? (
                <>
                  {/* SELECTED ADDRESS */}
                  {selectedDeliveryAddress && (
                    <div className="mb-5 rounded-[7px] border border-[#111111] bg-[#FAFAF9] p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#777777]">
                              Delivering to
                            </p>

                            <p className="text-[13px] font-semibold text-[#111111]">
                              {selectedDeliveryAddress.recipient_name}
                            </p>

                            <p className="mt-0.5 text-[11px] leading-4 text-[#555555]">
                              {selectedDeliveryAddress.address_line_1}
                              {selectedDeliveryAddress.address_line_2
                                ? `, ${selectedDeliveryAddress.address_line_2}`
                                : ""}
                              {selectedDeliveryAddress.city
                                ? `, ${selectedDeliveryAddress.city}`
                                : ""}
                              {selectedDeliveryAddress.state
                                ? `, ${selectedDeliveryAddress.state}`
                                : ""}
                              {selectedDeliveryAddress.postcode
                                ? `, ${selectedDeliveryAddress.postcode}`
                                : ""}
                            </p>

                            <p className="mt-1 text-[10px] text-[#777777]">
                              📞 {selectedDeliveryAddress.contact_number}
                            </p>

                            {selectedDeliveryAddress.is_default && (
                              <span className="mt-1 inline-block rounded-full bg-[#111111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#111111] px-3 py-1 text-[9px] font-bold text-white">
                          Selected
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FIELDS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="First Name*"
                      value={
                        selectedDeliveryAddress?.recipient_name
                          ?.split(" ")
                          .slice(0, -1)
                          .join(" ") ||
                        selectedDeliveryAddress?.recipient_name
                      }
                    />

                    <Field
                      label="Last Name*"
                      value={selectedDeliveryAddress?.recipient_name
                        ?.split(" ")
                        .slice(-1)
                        .join(" ")}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Email*" placeholder="Email address" />
                    <Field
                      label="Phone number*"
                      value={selectedDeliveryAddress?.contact_number}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_1fr]">
                    <Field label="City*" value={selectedDeliveryAddress?.city} />
                    <Field
                      label="State*"
                      value={selectedDeliveryAddress?.state}
                    />
                    <Field
                      label="Zip Code*"
                      value={selectedDeliveryAddress?.postcode}
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mt-4">
                    <label className="mb-1.5 block text-[11px] font-medium text-[#555555]">
                      Description*
                    </label>

                    <textarea
                      placeholder="Enter a description..."
                      className="h-[92px] w-full resize-none rounded-[6px] border border-[#DCDCDC] bg-white px-3 py-2.5 text-[12px] text-[#555555] outline-none placeholder:text-[#999999]"
                    />
                  </div>

                  {/* ADDRESS ACTIONS */}
                  {selectedDeliveryAddress && (
                    <div className="mt-3 flex items-center justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(selectedDeliveryAddress);
                          setIsAddressModalOpen(true);
                        }}
                        className="flex items-center gap-1 text-[10px] font-medium text-[#555555] transition hover:text-[#111111]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit address
                      </button>

                      {!selectedDeliveryAddress.is_default && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDefaultAddress(selectedDeliveryAddress.id)
                          }
                          className="text-[10px] font-medium text-[#555555] underline underline-offset-2 transition hover:text-[#111111]"
                        >
                          Set default
                        </button>
                      )}
                    </div>
                  )}

                  {/* SAVED ADDRESSES */}
                  {availableDeliveryAddresses.length > 1 && (
                    <div className="mt-3 border-t border-[#EEEEEC] pt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-medium text-[#555555]">
                          Saved addresses
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(null);
                            setIsAddressModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] font-medium text-[#222222]"
                        >
                          <Plus className="h-3 w-3" />
                          Add new
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableDeliveryAddresses
                          .filter(
                            (address) =>
                              address.id !== selectedDeliveryAddress?.id,
                          )
                          .map((address) => (
                            <button
                              key={address.id}
                              type="button"
                              onClick={() =>
                                setSelectedDeliveryAddress(address)
                              }
                              className="rounded-[5px] border border-[#DDDDDD] bg-white px-2.5 py-1.5 text-[9px] text-[#555555] transition hover:border-[#999999]"
                            >
                              {address.recipient_name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-[7px] border border-[#E2E2E0] bg-[#FAFAF9] p-4">
                  <p className="mb-3 text-[11px] text-[#777777]">
                    No delivery address found.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-[5px] bg-black px-4 py-2 text-[10px] font-medium text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* SHIPPING METHOD */}
            <div className="border-t border-[#E9E9E7] px-4 pb-5 pt-5 sm:px-[18px]">
              <div className="mb-3">
                <h2 className="text-[16px] font-medium text-[#171717]">
                  Shipping Method
                </h2>
                <p className="mt-1 text-[10px] text-[#999999]">
                  Choose your preferred delivery option
                </p>
              </div>

              {isLoadingShippingMethods ? (
                <div className="overflow-hidden rounded-[7px] border border-[#E2E2E0]">
                  <div className="h-[72px] animate-pulse bg-[#EEEEEC]" />
                  <div className="border-t border-[#E2E2E0]" />
                  <div className="h-[72px] animate-pulse bg-[#EEEEEC]" />
                </div>
              ) : activeShippingMethods.length > 0 ? (
                <div className="overflow-hidden rounded-[7px] border border-[#E2E2E0] bg-white">
                  {activeShippingMethods.map((method: any) => (
                    <div
                      key={method.id}
                      className="border-b border-[#E5E5E3] last:border-b-0"
                    >
                      <ShippingOption
                        method={method}
                        selected={deliveryMethod === method.code}
                        onSelect={() => setDeliveryMethod(method.code)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[7px] border border-[#E2E2E0] bg-[#FAFAF9] p-5 text-center">
                  <p className="text-[11px] text-[#777777]">
                    No shipping methods available.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <aside>
            <div className="lg:sticky lg:top-5">
              <CartSummary
                summaryData={summaryData}
                loading={
                  isLoadingCheckoutSummary || isFetchingCheckoutSummary
                }
                onPay={handlePayNow}
                isSubmitting={isSubmitting}
                disabled={
                  !selectedDeliveryAddress?.id || !selectedShippingMethod?.id
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
              />
            </div>
          </aside>
        </div>
      </div>

      {/* ADDRESS MODAL */}
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
  );
}