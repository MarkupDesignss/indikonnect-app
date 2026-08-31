"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Lock,
  Package,
  Truck,
  Zap,
  MapPin,
  Check,
  ShieldCheck,
  CreditCard,
  ChevronRight,
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

  product_tax_breakdown?: Record<
    string,
    {
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
  >;

  tax_breakdown?: any[];

  summary: {
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* =========================================================
   DESIGN TOKENS — matches ProductCard / Cart page
========================================================= */

const INK = "#111111";
const PAGE_BG = "#F5F5F4";
const LINE = "#ECE9E2";
const MUTED = "#7d827f";
const GREEN = "#4E8067";
const SOFT = "#F4F3EE";

const formatPrice = (value: any) => {
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

  images?: {
    image_url: string;
    is_primary: boolean;
  }[];
}) => {
  return (
    item.primary_image ||
    item.images?.find((img) => img.is_primary)?.image_url ||
    item.images?.[0]?.image_url ||
    null
  );
};

/* ============================================================
   SKELETON LOADER — matches the app's card skeleton pattern
============================================================ */

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-[#ECE9E2] p-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-5 h-5 bg-[#F4F3EE] rounded-full" />

            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#F4F3EE] rounded w-1/4" />
              <div className="h-3 bg-[#F4F3EE] rounded w-1/2" />
              <div className="h-3 bg-[#F4F3EE] rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   SHIMMER BUTTON
============================================================ */

function ShimmerButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg
        bg-[#111111]
        px-5 py-4
        text-[12px]
        font-bold
        uppercase
        tracking-[0.08em]
        text-white
        transition-all duration-300
        hover:bg-black
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>

      <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  number,
  title,
  subtitle,
  icon,
}: {
  number: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#ECE9E2] px-5 py-5 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-bold text-white">
        {number}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon && (
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-[#F4F3EE] sm:flex">
            {icon}
          </div>
        )}

        <div>
          <h2 className="text-[15px] font-bold text-[#111111] sm:text-[16px]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11px] leading-5 text-[#7d827f]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADDRESS CARD
============================================================ */

function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onDefault,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDefault: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        group relative cursor-pointer rounded-2xl border
        p-4 sm:p-5
        transition-all duration-200
        ${selected
          ? "border-[#111111] bg-[#F4F3EE]"
          : "border-[#ECE9E2] bg-white hover:border-[#111111]/40"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1">
          <div
            className={`
              flex h-5 w-5 items-center justify-center rounded-full border-2
              ${selected
                ? "border-[#111111]"
                : "border-[#ccd2dc] group-hover:border-[#111111]/60"
              }
            `}
          >
            {selected && (
              <div className="h-2.5 w-2.5 rounded-full bg-[#111111]" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-bold text-[#111111] sm:text-[15px]">
              {address.recipient_name}
            </h3>

            {address.is_delivery && (
              <span className="rounded-full bg-[#F4F3EE] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#7d827f]">
                Home
              </span>
            )}

            {address.is_default && (
              <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[9px] font-bold text-white">
                Default
              </span>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />

            <p className="text-[12px] leading-5 text-[#7d827f] sm:text-[13px]">
              {address.address_line_1}
              {address.address_line_2 ? `, ${address.address_line_2}` : ""}
              {", "}
              {address.city}, {address.state}, {address.postcode}
            </p>
          </div>

          <p className="mt-2 text-[12px] text-[#7d827f] sm:text-[13px]">
            <span className="font-semibold text-[#111111]">Phone:</span>{" "}
            {address.contact_number}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {!address.is_default && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDefault();
                }}
                className="text-[10px] font-bold uppercase tracking-wide text-[#7d827f] underline underline-offset-4 transition-colors hover:text-[#111111]"
              >
                Set default
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-[10px] font-bold uppercase tracking-wide text-[#111111] transition-colors hover:opacity-60"
            >
              <Pencil className="mr-1 inline h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[10px] font-bold uppercase tracking-wide text-[#d94a4a] transition-colors hover:text-red-700"
            >
              <Trash2 className="mr-1 inline h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SHIPPING CARD
============================================================ */

function ShippingCard({
  method,
  selected,
  onSelect,
}: {
  method: any;
  selected: boolean;
  onSelect: () => void;
}) {
  const code = String(method.code || "").toLowerCase();

  const Icon = code.includes("express")
    ? Zap
    : code.includes("free")
      ? Package
      : Truck;

  const priceValue = Number(method.base_rate || 0);

  const price =
    method.rate_type === "free" || priceValue === 0
      ? "Free"
      : formatPrice(priceValue);

  return (
    <label
      className={`
        flex cursor-pointer items-center gap-4 rounded-2xl border
        p-4 transition-all duration-200
        ${selected
          ? "border-[#111111] bg-[#F4F3EE]"
          : "border-[#ECE9E2] bg-white hover:border-[#111111]/40"
        }
      `}
    >
      <input
        type="radio"
        name="shipping"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <div
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
          ${selected ? "border-[#111111]" : "border-[#ccd2dc]"}
        `}
      >
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-[#111111]" />}
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F3EE]">
        <Icon className="h-5 w-5 text-[#111111]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-bold text-[#111111] sm:text-[14px]">
            {method.name}
          </p>

          <p className="shrink-0 text-[13px] font-bold text-[#111111] sm:text-[14px]">
            {price}
          </p>
        </div>

        <p className="mt-1 text-[11px] leading-5 text-[#7d827f] sm:text-[12px]">
          {method.description ||
            `Arrives in ${method.estimated_days || 4} business days`}
        </p>
      </div>

      {selected && <Check className="hidden h-5 w-5 text-[#111111] sm:block" />}
    </label>
  );
}

/* ============================================================
   PAYMENT METHOD
============================================================ */

function PaymentMethod() {
  return (
    <div className="rounded-2xl border-2 border-[#111111] bg-[#F4F3EE] p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
          <Image
            src={Razorpay}
            alt="Razorpay"
            width={40}
            height={40}
            className="rounded-lg object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[#111111] sm:text-[15px]">
            Razorpay Secure
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[#7d827f] sm:text-[12px]">
            Cards, UPI, Netbanking & Wallets — powered by Razorpay
          </p>
        </div>

        <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[9px] font-bold text-[#4E8067] sm:flex">
          <Lock className="h-3.5 w-3.5" />
          ENCRYPTED
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#4E8067]" />

        <p className="text-[10px] leading-4 text-[#7d827f]">
          Your payment information is securely processed by Razorpay.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PAYMENT SUMMARY
============================================================ */

function PaymentSummary({
  summaryData,
  loading,
  onPay,
  isSubmitting,
  disabled,
}: {
  summaryData?: CheckoutSummaryData;
  loading: boolean;
  onPay: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#ECE9E2] bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-[#F4F3EE] rounded w-1/2" />
          <div className="h-16 bg-[#F4F3EE] rounded-xl" />
          <div className="h-16 bg-[#F4F3EE] rounded-xl" />
          <div className="h-4 bg-[#F4F3EE] rounded w-full" />
          <div className="h-4 bg-[#F4F3EE] rounded w-full" />
          <div className="h-12 bg-[#F4F3EE] rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="rounded-2xl border border-[#ECE9E2] bg-white p-8">
        <p className="text-center text-[13px] text-[#7d827f]">
          Payment summary unavailable
        </p>
      </div>
    );
  }

  const items = normalizeSummaryItems(summaryData);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ECE9E2] bg-white">
      {/* Header */}
      <div className="border-b border-[#ECE9E2] px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111]">
            Payment Summary
          </h2>

          <div className="rounded-full bg-[#F4F3EE] px-3 py-1.5 text-[10px] font-bold text-[#7d827f]">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-h-[330px] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
        {items.length > 0 ? (
          items.map((item, index) => {
            const imageUrl = getItemImage(item);

            return (
              <div
                key={`${item.product_id}-${index}`}
                className="flex items-center gap-4"
              >
                <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl border border-[#ECE9E2] bg-[#F4F3EE]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.product_name}
                      fill
                      sizes="62px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-[#a9a394]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12px] font-bold leading-5 text-[#111111]">
                    {item.product_name}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-[#7d827f]">
                      Qty {item.quantity}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#ccc8bd]" />

                    <span className="text-[10px] text-[#7d827f]">
                      {formatPrice(item.unit_price)}
                    </span>
                  </div>
                </div>

                <p className="shrink-0 text-[12px] font-bold text-[#111111]">
                  {formatPrice(item.line_total)}
                </p>
              </div>
            );
          })
        ) : (
          <p className="py-5 text-center text-[12px] text-[#7d827f]">
            No products in this order
          </p>
        )}
      </div>

      <div className="mx-5 border-t border-[#ECE9E2] sm:mx-6" />

      {/* Price breakdown */}
      <div className="space-y-3 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#7d827f]">Subtotal</span>

          <span className="text-[12px] font-semibold text-[#111111]">
            {formatPrice(summaryData.subtotal)}
          </span>
        </div>

        {Number(summaryData.coupon_discount || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#7d827f]">Coupon discount</span>

            <span className="text-[12px] font-semibold text-[#4E8067]">
              -{formatPrice(summaryData.coupon_discount)}
            </span>
          </div>
        )}

        {Number(summaryData.total_tax || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#7d827f]">Tax</span>

            <span className="text-[12px] font-semibold text-[#111111]">
              {formatPrice(summaryData.total_tax)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#7d827f]">Delivery</span>

          <span className="text-[12px] font-semibold text-[#111111]">
            {Number(summaryData.shipping_cost || 0) === 0
              ? "Free"
              : formatPrice(summaryData.shipping_cost)}
          </span>
        </div>

        {Number(summaryData.amount_redeemed || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#7d827f]">Coins redeemed</span>

            <span className="text-[12px] font-semibold text-[#4E8067]">
              -{formatPrice(summaryData.amount_redeemed)}
            </span>
          </div>
        )}
      </div>

      <div className="mx-5 border-t border-[#111111] sm:mx-6" />

      {/* Grand total */}
      <div className="flex items-end justify-between px-5 py-5 sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7d827f]">
            Total payable
          </p>

          <p className="mt-1 text-[10px] text-[#8991a2]">
            Inclusive of applicable taxes
          </p>
        </div>

        <span className="text-[26px] font-bold leading-none text-[#111111]">
          {formatPrice(summaryData.grand_total)}
        </span>
      </div>

      {/* Pay button */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <ShimmerButton
          onClick={onPay}
          disabled={isSubmitting || disabled}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              PROCESSING PAYMENT...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              PAY {formatPrice(summaryData.grand_total)} WITH RAZORPAY
            </>
          )}
        </ShimmerButton>

        {disabled && !isSubmitting && (
          <p className="mt-3 text-center text-[10px] leading-4 text-[#8b93a3]">
            Select a delivery address and shipping method to continue.
          </p>
        )}
      </div>

      {/* Trust */}
      <div className="border-t border-[#ECE9E2] bg-[#F4F3EE] px-5 py-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <ShieldCheck className="mx-auto h-4 w-4 text-[#111111]" />
            <p className="mt-1 text-[9px] font-semibold text-[#7d827f]">
              Secure
            </p>
          </div>

          <div>
            <Truck className="mx-auto h-4 w-4 text-[#111111]" />
            <p className="mt-1 text-[9px] font-semibold text-[#7d827f]">
              Fast Delivery
            </p>
          </div>

          <div>
            <CreditCard className="mx-auto h-4 w-4 text-[#111111]" />
            <p className="mt-1 text-[9px] font-semibold text-[#7d827f]">
              Safe Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN CHECKOUT
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

  const couponCode = searchParams.get("coupon_code") || null;

  /* ==========================================================
     STATE
  ========================================================== */

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ==========================================================
     ADDRESS API
  ========================================================== */

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();

  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

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
     ADDRESS DATA
  ========================================================== */

  const addresses: Address[] = Array.isArray(addressesData?.data)
    ? addressesData.data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address.is_delivery === true,
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
    .filter((method: any) => method.is_active)
    .sort(
      (a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0),
    );

  const selectedShippingMethod = shippingMethods.find(
    (method: any) => method.code === deliveryMethod,
  );

  /* ==========================================================
     DEFAULT SHIPPING
  ========================================================== */

  useEffect(() => {
    if (!activeShippingMethods.length) {
      return;
    }

    const exists = activeShippingMethods.some(
      (method: any) => method.code === deliveryMethod,
    );

    if (!exists) {
      setDeliveryMethod(activeShippingMethods[0].code);
    }
  }, [activeShippingMethods, deliveryMethod]);

  /* ==========================================================
     DEFAULT ADDRESS
  ========================================================== */

  useEffect(() => {
    if (!addresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    const defaultAddress = addresses.find(
      (address) => address.is_default === true,
    );

    const deliveryAddress = addresses.find(
      (address) => address.is_delivery === true,
    );

    const selected = defaultAddress || deliveryAddress || addresses[0];

    setSelectedDeliveryAddress(selected);
  }, [addresses]);

  /* ==========================================================
     CHECKOUT SUMMARY PARAMS
  ========================================================== */

  const checkoutSummaryParams = useMemo(
    () => ({
      ...(selectedDeliveryAddress?.id
        ? {
          address_id: selectedDeliveryAddress.id,
        }
        : {}),

      ...(selectedShippingMethod?.id
        ? {
          shipping_method_id: selectedShippingMethod.id,
        }
        : {}),

      ...(couponCode
        ? {
          coupon_code: couponCode,
        }
        : {}),

      ...(isDirectCheckout
        ? {
          product_id: productId,
          quantity,
        }
        : {}),
    }),
    [
      selectedDeliveryAddress?.id,
      selectedShippingMethod?.id,
      couponCode,
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

      if (result.status) {
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
    if (!editingAddress) {
      return;
    }

    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data,
      }).unwrap();

      if (result.status) {
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
    const confirmed = window.confirm(
      `Delete address for ${address.recipient_name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteAddress({
        id: address.id,
        data: {
          id: address.id,
        },
      }).unwrap();

      if (result.status) {
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
    try {
      const result = await setDefaultAddress(id).unwrap();

      if (result.status) {
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
    const confirmationUrl =
      `/order-confirmation?order_id=${orderId}` +
      `&order_reference=${encodeURIComponent(orderReference)}`;

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

      theme: {
        color: INK,
      },

      /* ======================================================
         SUCCESS
      ====================================================== */

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

      /* ======================================================
         MODAL DISMISS
      ====================================================== */

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
          response?.error?.description || "Payment failed. Please try again.";

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
    if (!selectedDeliveryAddress) {
      dispatch(
        showToast({
          message: "Please select a delivery address to continue",
          type: "error",
        }),
      );
      return;
    }

    if (!selectedShippingMethod) {
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
          coupon_code: couponCode || null,
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
    <main className="min-h-screen font-sans" style={{ background: PAGE_BG }}>
      {/* ======================================================
          SIMPLE HEADER (banner removed)
      ====================================================== */}

      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-8">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d827f]">
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="cursor-pointer transition-colors hover:text-[#111111]"
          >
            Cart
          </button>

          <ChevronRight className="h-3 w-3 text-[#7d827f]" />

          <span className="text-[#111111]">Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[#111111] mb-6">
          Checkout
        </h1>
      </section>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <section className="mx-auto w-full max-w-[1280px] px-5 pb-10 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-5">
            {/* ADDRESS */}

            <section className="overflow-hidden rounded-2xl border border-[#ECE9E2] bg-white">
              <SectionHeader
                number="1"
                title="Delivery address"
                subtitle="Where should we deliver your order?"
                icon={<MapPin className="h-4 w-4 text-[#111111]" />}
              />

              <div className="p-5 sm:p-6">
                {isLoadingAddresses ? (
                  <ListSkeleton rows={2} />
                ) : availableDeliveryAddresses.length > 0 ? (
                  <div className="space-y-3">
                    {availableDeliveryAddresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        selected={selectedDeliveryAddress?.id === address.id}
                        onSelect={() => setSelectedDeliveryAddress(address)}
                        onEdit={() => {
                          setEditingAddress(address);

                          setIsAddressModalOpen(true);
                        }}
                        onDelete={() => handleDeleteAddress(address)}
                        onDefault={() => handleSetDefaultAddress(address.id)}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d8d3c8] bg-[#FAF9F6] px-4 py-4 text-[12px] font-bold text-[#111111] transition-all hover:border-[#111111] hover:bg-[#F4F3EE]"
                    >
                      <Plus className="h-4 w-4" />
                      Add a new delivery address
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#ECE9E2] bg-[#FAF9F6] p-5">
                    <AddressFormModal
                      isOpen={true}
                      inline={true}
                      onClose={() => { }}
                      onSubmit={handleCreateAddress}
                      initialData={null}
                      isLoading={isCreating}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* SHIPPING */}

            <section className="overflow-hidden rounded-2xl border border-[#ECE9E2] bg-white">
              <SectionHeader
                number="2"
                title="Delivery speed"
                subtitle="Choose the delivery option that works best for you."
                icon={<Truck className="h-4 w-4 text-[#111111]" />}
              />

              <div className="space-y-3 p-5 sm:p-6">
                {isLoadingShippingMethods ? (
                  <ListSkeleton rows={2} />
                ) : activeShippingMethods.length > 0 ? (
                  activeShippingMethods.map((method: any) => (
                    <ShippingCard
                      key={method.id}
                      method={method}
                      selected={deliveryMethod === method.code}
                      onSelect={() => setDeliveryMethod(method.code)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#F4F3EE] py-10 text-center text-[12px] text-[#7d827f]">
                    No delivery methods available.
                  </div>
                )}
              </div>
            </section>

            {/* PAYMENT */}

            <section className="overflow-hidden rounded-2xl border border-[#ECE9E2] bg-white">
              <SectionHeader
                number="3"
                title="Payment method"
                subtitle="Your payment is protected with bank-grade security."
                icon={<CreditCard className="h-4 w-4 text-[#111111]" />}
              />

              <div className="p-5 sm:p-6">
                <PaymentMethod />
              </div>
            </section>

            {/* TRUST */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#ECE9E2] bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F3EE]">
                  <ShieldCheck className="h-5 w-5 text-[#111111]" />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#111111]">
                    Secure checkout
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#7d827f]">
                    256-bit encryption
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#ECE9E2] bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F3EE]">
                  <Truck className="h-5 w-5 text-[#111111]" />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#111111]">
                    Reliable delivery
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#7d827f]">
                    Track your order
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#ECE9E2] bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F3EE]">
                  <Lock className="h-5 w-5 text-[#111111]" />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#111111]">
                    Safe payment
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#7d827f]">
                    Powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <aside>
            <div className="xl:sticky xl:top-6">
              <PaymentSummary
                summaryData={summaryData}
                loading={isLoadingCheckoutSummary || isFetchingCheckoutSummary}
                onPay={handlePayNow}
                isSubmitting={isSubmitting}
                disabled={!selectedDeliveryAddress || !selectedShippingMethod}
              />
            </div>
          </aside>
        </div>
      </section>

      {/* ======================================================
          ADDRESS MODAL
      ====================================================== */}

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