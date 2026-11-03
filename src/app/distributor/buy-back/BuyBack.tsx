"use client";

import { useGetMyOrdersQuery } from "@/lib/redux/api/order/orderApi";
import { useInitiateBuybackMutation } from "../../../lib/redux/api/distributor/buybackApi";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Package,
  AlertCircle,
  Check,
  Loader2,
  MoreVertical,
  Coins,
  Truck,
  MapPin,
  Eye,
  RotateCcw,
  ShoppingBag,
  Ban,
  CalendarX,
  Home,
  Info,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useRouter } from "next/navigation";

/* ========================================================================== */
/* Return Method type                                                         */
/* ========================================================================== */

type ReturnMethod = "doorstep" | "courier";

interface CreditNote {
  id: number;
  credit_note_number: string;
  original_invoice_number: string;
  amount: number | string;
  issued_at: string;
  download_url: string;
}

interface ReturnItem {
  order_line_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  subtotal: number;
  tax: number;
  line_total: number;
  reason: string;
  image_paths?: string[];
  image_urls?: string[];
  return_status: string;
}

interface ReturnRecord {
  id: number;
  order_id: number;
  user_id: number;
  type: string;
  items: ReturnItem[];
  status: string;
  refund_subtotal?: number | null;
  refund_tax?: number | null;
  refund_line_total?: number | null;
  refund_shipping?: number | null;
  total_refund_amount?: number | null;
  refund_status?: string | null;
  refund_processed_at?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
}

interface TaxItem {
  product_id: number;
  product_name: string;
  product_code?: string;
  variant_id?: number | null;
  variant_sku?: string | null;
  variant_attributes?: unknown;
  quantity: number;
  unit_price: number | string;
  line_total_before_discount?: number;
  line_total_after_discount?: number;
  tax_category?: string;
  tax_rate?: number | string;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  tax_amount?: number;
  line_total_after_tax?: number;
  shipping_charge?: number;
}

interface TaxSummary {
  subtotal?: number;
  coupon_discount?: number;
  subtotal_after_discount?: number;
  total_tax?: number;
  total_cgst?: number;
  total_sgst?: number;
  total_igst?: number;
  shipping_charge?: number;
  coin_redeemed?: number;
  coin_redeemed_amount?: number;
  grand_total?: number;
}

interface TaxCategory {
  tax_category?: string;
  tax_rate?: number | string;
  taxable_amount?: number;
  tax_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
}

interface TaxBreakdown {
  items?: TaxItem[];
  summary?: TaxSummary;
  tax_by_category?: TaxCategory[];
  delivery_state?: string;
  supplier_state?: string;
}

interface OrderAddress {
  id?: number;
  full_name?: string | null;
  phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  type?: string | null;
  postal_code?: string | null;
  country?: string | null;
  full_address?: string | null;
  address?: string | null;
}

interface OrderLineItem {
  order_id: number;
  order_reference: string;
  order_status: string;
  order_type: string;
  order_date: string;
  confirmed_date: string | null;
  line_id: number;
  product_id: number;
  item_reference_id?: string;
  product_name: string;
  product_slug?: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  refunded_amount?: number | string | null;
  final_amount?: number;
  delivery_charges?: number;
  commissionable_volume: number;
  delivery_status: string;
  return_status: string;
  returned_quantity: number;
  available_for_return: number;
  is_returnable: boolean;
  is_cancel_return_allowed?: number | boolean;
  is_buyback_enabled?: string | number | boolean;
  return_method?: string | null;
  deducted_shipping_charges?: number | null;
  gateway_charges?: number | null;
  gateway_charges_percent?: number | null;
  tax_amount?: number | null;
  total_returnable_amount?: number | null;
  timeline: {
    order_placed: string;
    order_confirmed: string | null;
    shipped_at: string | null;
    cancelled_at: string | null;
    dispatched_at: string | null;
    return_applicable_till?: string | null;
    delivered_at: string | null;
    return_requested_at: string | null;
    return_approved_at: string | null;
    return_rejected_at: string | null;
    return_completed_at: string | null;
    buyback_requested_at?: string | null;
    buyback_approved_at?: string | null;
    buyback_rejected_at?: string | null;
    buyback_refunded_at?: string | null;
  };
  is_reviewed: boolean;
  images: Array<{ id: number; image_url: string; is_primary: boolean }>;
  primary_image: string;
  product_reviews: unknown[];
  payment_gateway: string;
  gateway_transaction_id: string | null;
  amount_paid: number;
  payment_status: string;
  subtotal: number;
  total_gst: number;
  shipping_charge: number;
  coin_redeemed: number;
  coin_redeemed_amount: number;
  total_payable: number;
  can_repay?: boolean;
  payment_expires_at?: string | null;
  payment_expires_in?: number | null;
  tax_breakdown?: TaxBreakdown | null;
  shipping_method: string | null;
  billing_address?: OrderAddress | null;
  delivery_address?: OrderAddress | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    is_distributor?: boolean;
  } | null;
  invoice?: { invoice_number?: string; generated_at?: string | null } | null;
  returns: ReturnRecord[];
  credit_notes: CreditNote[];
}

const NAVY = "#111111";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";
const RED = "#DC2626";

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "return_received", label: "Return Received" },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "buyback_pending",
    label: "Buyback Pending",
  },
  {
    value: "buyback_approved",
    label: "Buyback Approved",
  },
  {
    value: "buyback_rejected",
    label: "Buyback Rejected",
  },
  {
    value: "buyback_refunded",
    label: "Buyback Refunded",
  },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  confirmed: { color: INDIGO, bg: "#EEF2FF" },
  pending: { color: "#A9711F", bg: "#FBF3E4" },
  payment_failed: { color: RED, bg: "#FEF2F2" },
  return_received: { color: "#A9711F", bg: "#FBF3E4" },
  delivered: {
    color: EMERALD,
    bg: "#eaf7f0",
  },

  buyback_pending: {
    color: "#A9711F",
    bg: "#FBF3E4",
  },

  buyback_approved: {
    color: INDIGO,
    bg: "#eceffb",
  },

  buyback_rejected: {
    color: RED,
    bg: "#FEF2F2",
  },

  buyback_refunded: {
    color: "#EA580C",
    bg: "#FFF7ED",
  },
};

/* -------------------------------------------------------------------------- */
/* Currency Helpers                                                           */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Rs. 0.00";
  }

  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (!Number.isFinite(num)) {
    return "Rs. 0.00";
  }

  return `Rs. ${num.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/* Date Helpers                                                               */
/* -------------------------------------------------------------------------- */

function parseBackendDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) {
    return null;
  }

  try {
    let normalized = String(dateStr).trim();

    if (normalized.includes(" ") && !normalized.includes("T")) {
      normalized = normalized.replace(" ", "T");
    }

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";

  const d = parseBackendDate(dateStr);

  if (!d) {
    return dateStr;
  }

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* -------------------------------------------------------------------------- */
/* Status Helpers                                                             */
/* -------------------------------------------------------------------------- */

function normalizeStatus(status?: string | null) {
  if (!status) return "";

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/* -------------------------------------------------------------------------- */
/* Buyback Eligibility Helpers                                                */
/* -------------------------------------------------------------------------- */

function isBuybackEnabled(order: OrderLineItem): boolean {
  const val = order.is_buyback_enabled;

  if (val === undefined || val === null) {
    return false;
  }

  if (typeof val === "boolean") {
    return val;
  }

  return (
    String(val).trim() === "1" || String(val).trim().toLowerCase() === "true"
  );
}

/* Eligibility is measured from registration completion, not order date. */

const BUYBACK_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function getRegistrationCompletionDate(profile: any): Date | null {
  const user = profile?.user ?? profile?.data?.user ?? profile?.data ?? profile;

  const raw = user?.registration_completed_at;

  if (user?.account_type !== "distributor" || !raw) {
    return null;
  }

  // Backend sends YYYY-MM-DD HH:mm:ss without timezone.
  const parsed = parseBackendDate(raw);

  return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
}

function isWithinRegistrationBuybackWindow(profile: any, now: number): boolean {
  const completed = getRegistrationCompletionDate(profile);

  if (!completed) {
    return false;
  }

  const elapsed = now - completed.getTime();

  return elapsed >= 0 && elapsed < BUYBACK_WINDOW_MS;
}

/* -------------------------------------------------------------------------- */
/* Refund / Credit Note Helpers                                               */
/* -------------------------------------------------------------------------- */

function getMatchingReturn(order: OrderLineItem): ReturnRecord | null {
  if (!Array.isArray(order.returns)) {
    return null;
  }

  const match = order.returns.find(
    (returnRecord) =>
      Array.isArray(returnRecord.items) &&
      returnRecord.items.some(
        (item) => Number(item.order_line_id) === Number(order.line_id),
      ),
  );

  return match || null;
}

/* Actual refunded amount must NOT be replaced with a proposed return amount.
 * A return marked "received" or "rejected" is not a processed refund. */
function numericOrNull(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function moneyOrDash(value: number | string | null | undefined) {
  return numericOrNull(value) === null ? "—" : formatCurrency(value);
}

function prettyStatus(value: string | null | undefined) {
  const normalized = normalizeStatus(value);
  if (!normalized) return "—";
  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function maybeValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function getMatchingCreditNotes(order: OrderLineItem) {
  return (order.credit_notes || []).filter(
    (note) =>
      note.original_invoice_number === order.order_reference ||
      (Boolean(order.invoice?.invoice_number) &&
        note.original_invoice_number === order.invoice?.invoice_number),
  );
}

function getRefundDetails(order: OrderLineItem): {
  amount: number | null;
  creditNoteNumber: string | null;
  issuedAt: string | null;
  downloadUrl: string | null;
} | null {
  const actual = numericOrNull(order.refunded_amount);
  const matchingReturn = getMatchingReturn(order);
  const completed =
    normalizeStatus(matchingReturn?.refund_status) === "processed" ||
    Boolean(matchingReturn?.refund_processed_at);
  if ((actual === null || actual <= 0) && !completed) return null;
  const creditNote = getMatchingCreditNotes(order)[0];
  return {
    amount: actual ?? numericOrNull(matchingReturn?.total_refund_amount),
    creditNoteNumber: creditNote?.credit_note_number || null,
    issuedAt:
      matchingReturn?.refund_processed_at || creditNote?.issued_at || null,
    downloadUrl: creditNote?.download_url || null,
  };
}

/* -------------------------------------------------------------------------- */
/* Shared Modal Shell                                                         */
/* -------------------------------------------------------------------------- */

interface ModalShellProps {
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}

const ModalShell = ({
  onClose,
  maxWidth = "max-w-xl",
  children,
}: ModalShellProps) => (
  <AnimatePresence>
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[4px] sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.98,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.98,
          y: 12,
        }}
        transition={{
          duration: 0.2,
        }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_22px_80px_rgba(0,0,0,0.2)]`}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* -------------------------------------------------------------------------- */
/* Buyback Window Expired Modal                                               */
/* -------------------------------------------------------------------------- */

interface BuybackExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}

const BuybackExpiredModal = ({
  isOpen,
  onClose,
  onContact,
}: BuybackExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FBF3E4]">
              <CalendarX className="h-4 w-4 text-[#A9711F]" />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
                Buyback Window Expired
              </h3>

              <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
                30-day registration window
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-[8px] border border-[#F3E2C7] bg-[#FDF9F1] p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A9711F]" />

            <div>
              <p className="text-[11.5px] leading-5 text-[#6B4E1F]">
                The 30-day buyback window from your registration completion date
                has expired. You can no longer initiate a new buyback request
                from here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717]"
        >
          Close
        </button>

        <button
          type="button"
          onClick={onContact}
          className="flex items-center gap-1.5 rounded-[6px] border border-black bg-black px-4 py-2 text-[11px] font-medium text-white transition hover:bg-neutral-800"
        >
          <Ban className="h-3.5 w-3.5" />
          Contact Admin
        </button>
      </div>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Full API Breakdown - shared, mobile-friendly display primitives            */
/* -------------------------------------------------------------------------- */

const BreakdownSection = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.025)]">
    <div className="border-b border-neutral-100 bg-neutral-50/75 px-4 py-3.5 sm:px-5">
      <h4 className="text-[13px] font-bold tracking-[-0.01em] text-neutral-950 sm:text-[14px]">
        {title}
      </h4>
      {subtitle && (
        <p className="mt-0.5 text-[10.5px] text-[#8A92A6]">{subtitle}</p>
      )}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

const BreakdownRow = ({
  label,
  value,
  strong,
  positive,
  negative,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  positive?: boolean;
  negative?: boolean;
}) => (
  <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#EDF0F3] py-2.5 last:border-b-0">
    <span className="min-w-0 text-[11.5px] leading-5 text-[#667085]">
      {label}
    </span>
    <span
      className={`min-w-0 max-w-[62%] break-words text-right text-[11.5px] leading-5 ${strong ? "font-bold" : "font-medium"} ${negative ? "text-[#B42318]" : positive ? "text-[#18794E]" : "text-neutral-900"}`}
    >
      {value}
    </span>
  </div>
);

const BreakdownPill = ({ status }: { status?: string | null }) => {
  const normalized = normalizeStatus(status);
  const style =
    STATUS_STYLES[normalized] ||
    (normalized === "paid" ||
    normalized === "processed" ||
    normalized === "completed" ||
    normalized === "approved"
      ? { color: "#18794E", bg: "#EAF7EF" }
      : normalized === "rejected" ||
          normalized === "unpaid" ||
          normalized === "failed"
        ? { color: "#B42318", bg: "#FEF3F2" }
        : { color: "#667085", bg: "#F2F4F7" });
  return (
    <span
      className="inline-flex max-w-full items-center rounded-[5px] px-2 py-0.5 text-[10.5px] font-bold"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {prettyStatus(status)}
    </span>
  );
};

const AddressBreakdown = ({
  title,
  address,
}: {
  title: string;
  address?: OrderAddress | null;
}) => (
  <div className="rounded-[9px] border border-[#E9EDF2] bg-[#FCFDFE] p-3.5">
    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#101828]">
      <MapPin size={13} className="text-[#667085]" /> {title}
    </p>
    <p className="whitespace-pre-wrap break-words text-[11.5px] leading-5 text-[#344054]">
      {address?.full_address ||
        [
          address?.address_line_1,
          address?.address_line_2,
          address?.city,
          address?.state,
          address?.postal_code,
          address?.country,
        ]
          .filter(Boolean)
          .join(", ") ||
        "—"}
    </p>
    {(address?.full_name ||
      address?.phone ||
      address?.type ||
      address?.postal_code) && (
      <div className="mt-2 space-y-0.5 text-[10.5px] text-[#667085]">
        {address?.full_name && <p>Contact: {address.full_name}</p>}
        {address?.phone && <p>Phone: {address.phone}</p>}
        {address?.type && <p>Type: {address.type}</p>}
        {address?.postal_code && <p>PIN: {address.postal_code}</p>}
      </div>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/* View Details Modal - complete line + order-level breakdown                  */
/* -------------------------------------------------------------------------- */

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

const ViewDetailsModal = ({
  isOpen,
  onClose,
  order,
}: ViewDetailsModalProps) => {
  if (!isOpen || !order) return null;

  const status = normalizeStatus(order.delivery_status);
  const matchingReturn = getMatchingReturn(order);
  const matchingItem = matchingReturn?.items?.find(
    (item) => Number(item.order_line_id) === Number(order.line_id),
  );
  const refundDetails = getRefundDetails(order);
  const noteList = Array.isArray(order.credit_notes) ? order.credit_notes : [];
  const matchingNotes = getMatchingCreditNotes(order);
  const tax = order.tax_breakdown;
  const taxLines = tax?.items || [];
  const taxSummary = tax?.summary;
  const returnTotal = numericOrNull(matchingReturn?.total_refund_amount);
  const actualRefund = numericOrNull(order.refunded_amount);
  const isRefundDifference =
    actualRefund !== null &&
    returnTotal !== null &&
    Math.abs(actualRefund - returnTotal) > 0.01;
  const isCreditNoteDifference =
    actualRefund !== null &&
    matchingNotes.some((note) => {
      const amount = numericOrNull(note.amount);
      return amount !== null && Math.abs(amount - actualRefund) > 0.01;
    });
  const itemCalculatedTotal =
    Number(order.line_total || 0) + Number(order.delivery_charges || 0);
  const itemTotalMismatch =
    numericOrNull(order.final_amount) !== null &&
    Math.abs(itemCalculatedTotal - Number(order.final_amount)) > 0.01;

  const timelineEntries: {
    label: string;
    key: keyof OrderLineItem["timeline"];
    negative?: boolean;
  }[] = [
    { label: "Order Placed", key: "order_placed" },
    { label: "Order Confirmed", key: "order_confirmed" },
    { label: "Dispatched", key: "dispatched_at" },
    { label: "Shipped", key: "shipped_at" },
    { label: "Delivered", key: "delivered_at" },
    { label: "Return Requested", key: "return_requested_at" },
    { label: "Return Approved", key: "return_approved_at" },
    { label: "Return Rejected", key: "return_rejected_at", negative: true },
    { label: "Return Completed", key: "return_completed_at" },
    { label: "Buyback Requested", key: "buyback_requested_at" },
    { label: "Buyback Approved", key: "buyback_approved_at" },
    { label: "Buyback Rejected", key: "buyback_rejected_at", negative: true },
    { label: "Buyback Refunded", key: "buyback_refunded_at" },
    { label: "Cancelled", key: "cancelled_at", negative: true },
  ];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-5xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-neutral-100 text-neutral-900">
            <Eye size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[16px] font-extrabold tracking-[-0.025em] text-neutral-950 sm:text-[18px]">
              Complete Order Breakdown
            </h3>
            <p className="break-all text-[10px] text-[#667085]">
              {order.order_reference} • Line #{order.line_id}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close breakdown"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#E0E4EA] text-[#667085] hover:bg-[#F7F8FA]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F7F7F7] p-3.5 sm:p-5">
        {/* The selected product's amount and the whole order's total are different scopes. */}
        <div className="rounded-[12px] border border-[#E6EAF0] bg-white p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[9px] border border-[#E7EAF0] bg-[#F8F9FA]">
              {order.primary_image ? (
                <Image
                  src={order.primary_image}
                  alt={order.product_name}
                  fill
                  sizes="74px"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-6 w-6 text-[#98A2B3]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-5 text-[#101828]">
                {order.product_name}
              </p>
              <p className="mt-1 text-[10.5px] text-[#667085]">
                SKU: {maybeValue(order.product_code)} • Qty: {order.quantity}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <BreakdownPill status={status} />
                <BreakdownPill status={order.return_status} />
                <BreakdownPill status={order.payment_status} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {
                title: "Selected Item Total",
                value: moneyOrDash(order.final_amount),
              },
              {
                title: "Full Order Payable",
                value: moneyOrDash(order.total_payable),
              },
              {
                title: "Full Order Paid",
                value: moneyOrDash(order.amount_paid),
              },
              {
                title: "Actual Line Refund",
                value: moneyOrDash(order.refunded_amount),
              },
            ].map((summary) => (
              <div
                key={summary.title}
                className="rounded-[8px] border border-[#E8ECF2] bg-[#FCFDFE] px-3 py-3"
              >
                <p className="text-[9.5px] font-semibold text-[#8A92A6]">
                  {summary.title}
                </p>
                <p className="mt-1 text-[14px] font-bold text-[#101828] sm:text-[15px]">
                  {summary.value}
                </p>
              </div>
            ))}
          </div>
          {(isRefundDifference ||
            isCreditNoteDifference ||
            itemTotalMismatch) && (
            <div className="mt-3 flex gap-2 rounded-[8px] border border-[#F2D5A5] bg-[#FFFBF2] p-3 text-[11px] leading-5 text-[#875B16]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>
                API amounts need reconciliation:
                {isRefundDifference &&
                  " actual refunded_amount differs from return total_refund_amount;"}
                {isCreditNoteDifference &&
                  " credit note amount differs from refunded_amount;"}
                {itemTotalMismatch &&
                  " item final_amount differs from line_total + delivery_charges;"}{" "}
                Values below are displayed exactly as supplied, not recalculated
                as a refund.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="Order & Item Information"
            subtitle="Order-level details and the selected line's identifiers"
          >
            <BreakdownRow
              label="Order Reference"
              value={order.order_reference}
              strong
            />
            <BreakdownRow label="Order ID" value={maybeValue(order.order_id)} />
            <BreakdownRow
              label="Order Status"
              value={<BreakdownPill status={order.order_status} />}
            />
            <BreakdownRow
              label="Order Type"
              value={prettyStatus(order.order_type)}
            />
            <BreakdownRow
              label="Placed On"
              value={formatDate(order.order_date)}
            />
            <BreakdownRow
              label="Confirmed On"
              value={formatDate(order.confirmed_date)}
            />
            <BreakdownRow label="Line ID" value={order.line_id} />
            <BreakdownRow
              label="Item Reference"
              value={maybeValue(order.item_reference_id)}
            />
            <BreakdownRow label="Product ID" value={order.product_id} />
            <BreakdownRow
              label="Product Code"
              value={maybeValue(order.product_code)}
            />
            <BreakdownRow
              label="Product Slug"
              value={maybeValue(order.product_slug)}
            />
            <BreakdownRow
              label="Delivery Status"
              value={<BreakdownPill status={order.delivery_status} />}
            />
            <BreakdownRow
              label="Return Status"
              value={<BreakdownPill status={order.return_status} />}
            />
          </BreakdownSection>

          <BreakdownSection
            title="Selected Product — Price Breakdown"
            subtitle="Only this product line; shipping is shown separately"
          >
            <BreakdownRow
              label="Unit Price"
              value={moneyOrDash(order.unit_price)}
            />
            <BreakdownRow label="Ordered Quantity" value={order.quantity} />
            <BreakdownRow
              label="Base Value (unit × quantity)"
              value={formatCurrency(
                Number(order.unit_price) * Number(order.quantity),
              )}
            />
            <BreakdownRow
              label={`GST (${maybeValue(order.gst_rate)}%)`}
              value={moneyOrDash(order.gst_amount)}
            />
            <BreakdownRow
              label="Line Total (incl. GST)"
              value={moneyOrDash(order.line_total)}
              strong
            />
            <BreakdownRow
              label="Delivery Charges — This Item"
              value={moneyOrDash(order.delivery_charges)}
            />
            <BreakdownRow
              label="Item Final Amount"
              value={moneyOrDash(order.final_amount)}
              strong
            />
            <BreakdownRow
              label="Tax Amount (API)"
              value={moneyOrDash(order.tax_amount)}
            />
            <BreakdownRow
              label="Commissionable Volume"
              value={moneyOrDash(order.commissionable_volume)}
            />
            <BreakdownRow
              label="Returned Quantity"
              value={order.returned_quantity ?? 0}
            />
            <BreakdownRow
              label="Available for Return / Buyback"
              value={order.available_for_return ?? 0}
            />
            <BreakdownRow
              label="Is Returnable"
              value={maybeValue(order.is_returnable)}
            />
            <BreakdownRow
              label="Cancel Return Allowed"
              value={
                order.is_cancel_return_allowed == null
                  ? "—"
                  : Number(order.is_cancel_return_allowed) === 1
                    ? "Yes"
                    : "No"
              }
            />
            <BreakdownRow
              label="Buyback Enabled"
              value={isBuybackEnabled(order) ? "Yes" : "No"}
            />
            <BreakdownRow
              label="Reviewed"
              value={maybeValue(order.is_reviewed)}
            />
          </BreakdownSection>
        </div>

        <BreakdownSection
          title="Entire Order — All Products"
          subtitle="The API repeats these order totals on each line; displayed once here for clarity"
        >
          {taxLines.length > 0 ? (
            <div className="space-y-2.5">
              {taxLines.map((item, index) => {
                const lineReturn = (order.returns || []).find((r) =>
                  r.items?.some(
                    (ri) => Number(ri.product_id) === Number(item.product_id),
                  ),
                );
                return (
                  <div
                    key={`${item.product_id}-${index}`}
                    className={`rounded-[9px] border p-3.5 ${Number(item.product_id) === Number(order.product_id) ? "border-[#A9B7DA] bg-[#F7F9FF]" : "border-[#E6EAF0] bg-white"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-[#101828]">
                          {item.product_name}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-[#667085]">
                          SKU: {maybeValue(item.product_code)} • Qty:{" "}
                          {item.quantity}
                        </p>
                        {lineReturn && (
                          <p className="mt-1 text-[10.5px] text-[#A9711F]">
                            {prettyStatus(lineReturn.type)}:{" "}
                            {prettyStatus(lineReturn.status)}
                          </p>
                        )}
                        {item.variant_sku && (
                          <p className="text-[10px] text-[#667085]">
                            Variant SKU: {item.variant_sku}
                          </p>
                        )}
                        {item.variant_attributes != null && (
                          <p className="break-all text-[10px] text-[#667085]">
                            Variant:{" "}
                            {typeof item.variant_attributes === "string"
                              ? item.variant_attributes
                              : JSON.stringify(item.variant_attributes)}
                          </p>
                        )}
                      </div>
                      <p className="text-[13px] font-bold text-[#101828]">
                        {moneyOrDash(item.line_total_after_tax)}
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px] text-[#667085] sm:grid-cols-4">
                      <div>
                        Unit:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.unit_price)}
                        </strong>
                      </div>
                      <div>
                        Before discount:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.line_total_before_discount)}
                        </strong>
                      </div>
                      <div>
                        Taxable:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.line_total_after_discount)}
                        </strong>
                      </div>
                      <div>
                        {maybeValue(item.tax_category)} (
                        {maybeValue(item.tax_rate)}%):{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.tax_amount)}
                        </strong>
                      </div>
                      <div>
                        CGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.cgst_amount)}
                        </strong>
                      </div>
                      <div>
                        SGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.sgst_amount)}
                        </strong>
                      </div>
                      <div>
                        IGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.igst_amount)}
                        </strong>
                      </div>
                      <div>
                        Shipping:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.shipping_charge)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#667085]">
              Full order itemization not provided by the API.
            </p>
          )}
          <div className="mt-4 rounded-[9px] bg-[#FAFBFC] px-3.5 py-2">
            <BreakdownRow
              label="Order Subtotal"
              value={moneyOrDash(taxSummary?.subtotal ?? order.subtotal)}
            />
            {taxSummary?.coupon_discount != null && (
              <BreakdownRow
                label="Coupon Discount"
                value={moneyOrDash(taxSummary.coupon_discount)}
              />
            )}
            {taxSummary?.subtotal_after_discount != null && (
              <BreakdownRow
                label="Subtotal After Discount"
                value={moneyOrDash(taxSummary.subtotal_after_discount)}
              />
            )}
            <BreakdownRow
              label="Total GST / Tax"
              value={moneyOrDash(taxSummary?.total_tax ?? order.total_gst)}
            />
            <BreakdownRow
              label="Total Shipping"
              value={moneyOrDash(
                taxSummary?.shipping_charge ?? order.shipping_charge,
              )}
            />
            <BreakdownRow
              label="Coins Redeemed"
              value={maybeValue(order.coin_redeemed)}
            />
            <BreakdownRow
              label="Coin Value Deducted"
              value={moneyOrDash(order.coin_redeemed_amount)}
            />
            <BreakdownRow
              label="Order Grand Total"
              value={moneyOrDash(
                taxSummary?.grand_total ?? order.total_payable,
              )}
              strong
            />
            <BreakdownRow
              label="Amount Paid"
              value={moneyOrDash(order.amount_paid)}
              strong
              positive={normalizeStatus(order.payment_status) === "paid"}
            />
          </div>
        </BreakdownSection>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="GST / Tax Split"
            subtitle="Tax category and IGST / CGST / SGST as sent by the backend"
          >
            <BreakdownRow
              label="Supplier State"
              value={maybeValue(tax?.supplier_state)}
            />
            <BreakdownRow
              label="Delivery State"
              value={maybeValue(tax?.delivery_state)}
            />
            <BreakdownRow
              label="Total CGST"
              value={moneyOrDash(taxSummary?.total_cgst)}
            />
            <BreakdownRow
              label="Total SGST"
              value={moneyOrDash(taxSummary?.total_sgst)}
            />
            <BreakdownRow
              label="Total IGST"
              value={moneyOrDash(taxSummary?.total_igst)}
            />
            {(tax?.tax_by_category || []).map((category, i) => (
              <div
                key={i}
                className="mt-3 rounded-[8px] border border-[#EDF0F3] bg-[#FAFBFC] p-3"
              >
                <p className="mb-2 text-[11px] font-bold text-[#101828]">
                  {maybeValue(category.tax_category)} @{" "}
                  {maybeValue(category.tax_rate)}%
                </p>
                <BreakdownRow
                  label="Taxable Amount"
                  value={moneyOrDash(category.taxable_amount)}
                />
                <BreakdownRow
                  label="Total Tax"
                  value={moneyOrDash(category.tax_amount)}
                />
                <BreakdownRow
                  label="CGST"
                  value={moneyOrDash(category.cgst_amount)}
                />
                <BreakdownRow
                  label="SGST"
                  value={moneyOrDash(category.sgst_amount)}
                />
                <BreakdownRow
                  label="IGST"
                  value={moneyOrDash(category.igst_amount)}
                />
              </div>
            ))}
            {taxLines.some(
              (line) => Number(line.product_id) === Number(order.product_id),
            ) && (
              <div className="mt-3 rounded-[8px] border border-[#EDF0F3] p-3">
                <p className="mb-2 text-[11px] font-bold">
                  Selected Item's Tax Rates
                </p>
                {taxLines
                  .filter(
                    (line) =>
                      Number(line.product_id) === Number(order.product_id),
                  )
                  .map((item, i) => (
                    <div key={i}>
                      <BreakdownRow
                        label="GST"
                        value={`${maybeValue(item.tax_rate)}%`}
                      />
                      <BreakdownRow
                        label="CGST"
                        value={`${maybeValue(item.cgst_rate)}% (${moneyOrDash(item.cgst_amount)})`}
                      />
                      <BreakdownRow
                        label="SGST"
                        value={`${maybeValue(item.sgst_rate)}% (${moneyOrDash(item.sgst_amount)})`}
                      />
                      <BreakdownRow
                        label="IGST"
                        value={`${maybeValue(item.igst_rate)}% (${moneyOrDash(item.igst_amount)})`}
                      />
                    </div>
                  ))}
              </div>
            )}
          </BreakdownSection>

          <BreakdownSection
            title="Payment & Invoice"
            subtitle="Gateway, transaction, payment and invoice metadata"
          >
            <BreakdownRow
              label="Payment Gateway"
              value={prettyStatus(order.payment_gateway)}
            />
            <BreakdownRow
              label="Payment Status"
              value={<BreakdownPill status={order.payment_status} />}
            />
            <BreakdownRow
              label="Transaction / Order ID"
              value={maybeValue(order.gateway_transaction_id)}
            />
            <BreakdownRow
              label="Amount Paid — Full Order"
              value={moneyOrDash(order.amount_paid)}
              strong
            />
            <BreakdownRow
              label="Repayment Available"
              value={maybeValue(order.can_repay)}
            />
            <BreakdownRow
              label="Payment Expires At"
              value={formatDate(order.payment_expires_at)}
            />
            <BreakdownRow
              label="Payment Expires In (seconds)"
              value={maybeValue(order.payment_expires_in)}
            />
            <BreakdownRow
              label="Invoice Number"
              value={maybeValue(order.invoice?.invoice_number)}
            />
            <BreakdownRow
              label="Invoice Generated"
              value={formatDate(order.invoice?.generated_at)}
            />
            <BreakdownRow
              label="Shipping Method"
              value={prettyStatus(order.shipping_method)}
            />
            <p className="mt-3 text-[10px] leading-4 text-[#8A92A6]">
              A gateway transaction ID may represent an order ID instead of a
              captured payment ID. The displayed value is unchanged from the
              API.
            </p>
          </BreakdownSection>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="Return / Buyback & Refund Breakdown"
            subtitle="Amounts from separate API fields are not automatically treated as paid refunds"
          >
            <BreakdownRow
              label="Return Method"
              value={prettyStatus(order.return_method)}
            />
            <BreakdownRow
              label="Return Status (Line)"
              value={<BreakdownPill status={order.return_status} />}
            />
            <BreakdownRow
              label="Delivery Status"
              value={<BreakdownPill status={order.delivery_status} />}
            />
            <BreakdownRow
              label="Return / Buyback Request ID"
              value={maybeValue(matchingReturn?.id)}
            />
            <BreakdownRow
              label="Request Type"
              value={prettyStatus(matchingReturn?.type)}
            />
            <BreakdownRow
              label="Request Status"
              value={<BreakdownPill status={matchingReturn?.status} />}
            />
            <BreakdownRow
              label="Request Item Status"
              value={<BreakdownPill status={matchingItem?.return_status} />}
            />
            <BreakdownRow
              label="Quantity Requested"
              value={maybeValue(matchingItem?.quantity)}
            />
            {matchingItem?.reason && (
              <div className="mt-2 rounded-[8px] bg-[#F8F9FB] p-3">
                <p className="text-[10px] font-bold text-[#667085]">Reason</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[11.5px] leading-5 text-[#344054]">
                  {matchingItem.reason}
                </p>
              </div>
            )}
            <div className="mt-3 rounded-[8px] border border-[#E7EBF0] p-3">
              <p className="mb-2 text-[10.5px] font-bold text-[#344054]">
                Backend Refund Calculation Fields
              </p>
              <BreakdownRow
                label="Return Refund Subtotal"
                value={moneyOrDash(matchingReturn?.refund_subtotal)}
              />
              <BreakdownRow
                label="Return Refund Tax"
                value={moneyOrDash(matchingReturn?.refund_tax)}
              />
              <BreakdownRow
                label="Return Refund Line Total"
                value={moneyOrDash(matchingReturn?.refund_line_total)}
              />
              <BreakdownRow
                label="Return Refund Shipping"
                value={moneyOrDash(matchingReturn?.refund_shipping)}
              />
              <BreakdownRow
                label="Return Total Refund Amount"
                value={moneyOrDash(matchingReturn?.total_refund_amount)}
                strong
              />
              <BreakdownRow
                label="Deducted Shipping Charges"
                value={moneyOrDash(order.deducted_shipping_charges)}
                negative
              />
              <BreakdownRow
                label="Gateway Charges"
                value={moneyOrDash(order.gateway_charges)}
                negative
              />
              <BreakdownRow
                label="Gateway Charges Percent"
                value={
                  order.gateway_charges_percent == null
                    ? "—"
                    : `${order.gateway_charges_percent}%`
                }
              />
              <BreakdownRow
                label="Total Returnable (API)"
                value={moneyOrDash(order.total_returnable_amount)}
                strong
              />
              <BreakdownRow
                label="Actual Refunded Amount"
                value={moneyOrDash(order.refunded_amount)}
                strong
                positive={actualRefund !== null}
              />
              <BreakdownRow
                label="Refund Processing Status"
                value={<BreakdownPill status={matchingReturn?.refund_status} />}
              />
              <BreakdownRow
                label="Refund Processed At"
                value={formatDate(matchingReturn?.refund_processed_at)}
              />
            </div>
            {refundDetails?.amount != null && (
              <div className="mt-3 rounded-[8px] border border-[#CFE8DA] bg-[#F2FAF5] px-3.5 py-3">
                <p className="text-[10px] font-bold text-[#397658]">
                  {actualRefund !== null
                    ? "Refunded Amount Reported by API"
                    : "Processed Refund (Return Record)"}
                </p>
                <p className="mt-0.5 text-[19px] font-bold text-[#18794E]">
                  {formatCurrency(refundDetails.amount)}
                </p>
                {refundDetails.issuedAt && (
                  <p className="text-[10px] text-[#397658]">
                    {formatDate(refundDetails.issuedAt)}
                  </p>
                )}
              </div>
            )}
            {matchingReturn?.rejection_reason && (
              <p className="mt-3 rounded-[8px] bg-[#FEF3F2] p-3 text-[11px] text-[#B42318]">
                Rejection reason: {matchingReturn.rejection_reason}
              </p>
            )}
            {matchingReturn?.admin_notes && (
              <p className="mt-2 rounded-[8px] bg-[#F2F4F7] p-3 text-[11px] text-[#475467]">
                Admin notes: {matchingReturn.admin_notes}
              </p>
            )}
            {!matchingReturn && (order.returns || []).length > 0 && (
              <p className="mt-3 rounded-[8px] bg-[#FFF9E9] p-3 text-[10.5px] leading-4 text-[#875B16]">
                This order has a return record, but it belongs to another item.
                It is not counted as a return or refund of this selected
                product.
              </p>
            )}
          </BreakdownSection>

          <BreakdownSection
            title="Credit Notes"
            subtitle="Credit notes from this line; mismatched references are clearly flagged"
          >
            {noteList.length ? (
              noteList.map((note) => {
                const belongs = matchingNotes.some(
                  (linkedNote) => linkedNote.id === note.id,
                );
                return (
                  <div
                    key={note.id}
                    className="mb-3 rounded-[9px] border border-[#E6EAF0] p-3.5 last:mb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-all text-[12px] font-bold text-[#101828]">
                        {note.credit_note_number}
                      </p>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${belongs ? "bg-[#EAF7EF] text-[#18794E]" : "bg-[#FFF4E5] text-[#A9711F]"}`}
                      >
                        {belongs ? "Reference matches" : "Reference mismatch"}
                      </span>
                    </div>
                    <BreakdownRow label="Credit Note ID" value={note.id} />
                    <BreakdownRow
                      label="Amount"
                      value={moneyOrDash(note.amount)}
                      strong
                    />
                    <BreakdownRow
                      label="Original Invoice Reference"
                      value={note.original_invoice_number}
                    />
                    <BreakdownRow
                      label="Issued At"
                      value={formatDate(note.issued_at)}
                    />
                    <BreakdownRow
                      label="Download Endpoint (API)"
                      value={
                        <span className="break-all text-[10px]">
                          {note.download_url || "—"}
                        </span>
                      }
                    />
                    {!belongs && (
                      <p className="mt-2 text-[10.5px] leading-4 text-[#A9711F]">
                        This note references a different order/invoice. Verify
                        its association in the backend before using it as proof
                        of this line's refund.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-[11.5px] text-[#667085]">
                No credit note is attached to this product line.
              </p>
            )}
            <p className="mt-2 text-[10px] leading-4 text-[#8A92A6]">
              Download endpoints are displayed as returned by the API. They are
              not transformed into potentially incorrect frontend URLs.
            </p>
          </BreakdownSection>
        </div>

        <BreakdownSection
          title="Order Timeline"
          subtitle="All populated order, delivery, return and buyback milestones"
        >
          <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            {timelineEntries
              .filter((event) => Boolean(order.timeline?.[event.key]))
              .map((event) => (
                <div
                  key={event.key}
                  className="flex gap-2.5 border-b border-dashed border-[#EDF0F3] py-3 last:border-b-0"
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.negative ? "bg-[#D92D20]" : "bg-[#1F9D6B]"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-semibold text-[#344054]">
                      {event.label}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-[#667085]">
                      {formatDate(order.timeline[event.key])}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          {order.timeline?.return_applicable_till && (
            <div className="mt-3 rounded-[8px] border border-[#E3E9F5] bg-[#F5F8FF] px-3 py-2.5 text-[11.5px] text-[#344054]">
              <span className="font-bold">Return Applicable Till:</span>{" "}
              {formatDate(order.timeline.return_applicable_till)}
            </div>
          )}
        </BreakdownSection>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection title="Billing & Delivery Addresses">
            <div className="space-y-3">
              <AddressBreakdown
                title="Billing Address"
                address={order.billing_address}
              />
              <AddressBreakdown
                title="Delivery Address"
                address={order.delivery_address}
              />
            </div>
          </BreakdownSection>
          <BreakdownSection title="Customer / Distributor Information">
            <BreakdownRow label="User ID" value={maybeValue(order.user?.id)} />
            <BreakdownRow label="Name" value={maybeValue(order.user?.name)} />
            <BreakdownRow label="Email" value={maybeValue(order.user?.email)} />
            <BreakdownRow label="Phone" value={maybeValue(order.user?.phone)} />
            <BreakdownRow
              label="Distributor Account"
              value={maybeValue(order.user?.is_distributor)}
            />
            <BreakdownRow
              label="Return Method"
              value={prettyStatus(order.return_method)}
            />
          </BreakdownSection>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-[#E6EAF0] bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[7px] bg-black px-5 py-2.5 text-[11.5px] font-semibold text-white hover:bg-neutral-800"
        >
          Close Details
        </button>
      </div>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Buy Back Modal                                                             */
/* -------------------------------------------------------------------------- */

interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSuccess?: () => void | Promise<void>;
  canBuyback: () => boolean;
}

const BuybackModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
  canBuyback,
}: BuybackModalProps) => {
  const dispatch = useAppDispatch();

  const [initiateBuyback, { isLoading }] = useInitiateBuybackMutation();

  const maxQty = order?.available_for_return || order?.quantity || 1;

  const [quantity, setQuantity] = useState<number>(1);

  const [reason, setReason] = useState("Product is no longer required");

  const [declaresMarketable, setDeclaresMarketable] = useState(false);

  const [declaresUnsold, setDeclaresUnsold] = useState(false);

  const [declaresUnused, setDeclaresUnused] = useState(false);

  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("doorstep");

  const [courierName, setCourierName] = useState("");

  /* ✅ NEW: Tracking ID state */
  const [trackingId, setTrackingId] = useState("");

  const [error, setError] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const initialQty =
        order.available_for_return && order.available_for_return > 0
          ? order.available_for_return
          : order.quantity || 1;

      setQuantity(initialQty);

      setReason("Product is no longer required");

      setDeclaresMarketable(false);
      setDeclaresUnsold(false);
      setDeclaresUnused(false);

      setReturnMethod("doorstep");
      setCourierName("");
      /* ✅ Reset tracking ID on open */
      setTrackingId("");

      setError("");
      setIsSuccess(false);
    }
  }, [isOpen, order?.line_id]);

  if (!isOpen || !order) {
    return null;
  }

  const atLeastOneDeclaration =
    declaresMarketable || declaresUnsold || declaresUnused;

  const handleSubmit = async () => {
    setError("");

    if (!canBuyback()) {
      setError(
        "The 30-day registration buyback window has expired or the order is not eligible.",
      );
      return;
    }

    if (!order.line_id) {
      setError("Order line ID is missing.");
      return;
    }

    if (!quantity || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (quantity > maxQty) {
      setError(`Maximum buyback quantity is ${maxQty}.`);
      return;
    }

    if (reason.trim().length < 5) {
      setError("Please provide a valid reason (min 5 characters).");
      return;
    }

    if (!atLeastOneDeclaration) {
      setError("Please tick at least one declaration to proceed.");
      return;
    }

    /* ✅ Courier validation: BOTH courier name + tracking ID required */
    if (returnMethod === "courier" && !courierName.trim()) {
      setError("Please enter the courier name.");
      return;
    }

    if (returnMethod === "courier" && !trackingId.trim()) {
      setError("Please enter the tracking ID.");
      return;
    }

    // Recheck immediately before making the mutation.
    if (!canBuyback()) {
      setError("Buyback is no longer available for this order.");
      return;
    }

    try {
      const payload = {
        items: [
          {
            order_line_id: order.line_id,
            quantity,
            reason: reason.trim(),
          },
        ],
        return_reason: reason.trim(),
        declares_marketable: declaresMarketable,
        declares_unsold: declaresUnsold,
        declares_unused: declaresUnused,

        return_method: returnMethod,

        courier: returnMethod === "courier" ? courierName.trim() : undefined,

        /* ✅ NEW: tracking_id sent only for courier */
        tracking_id: returnMethod === "courier" ? trackingId.trim() : undefined,
      };

      const response = await initiateBuyback(payload).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Buyback request submitted successfully!",
          type: "success",
        }),
      );

      await onSuccess?.();

      setIsSuccess(true);

      setTimeout(() => onClose(), 1800);
    } catch (err: any) {
      let errorMessage = "Failed to submit buyback request.";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors) {
        const msgs = Object.values(err.data.errors).flat();

        errorMessage = (msgs as string[]).join(" ");
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        }),
      );
    }
  };

  /* ✅ Submit enabled only when courier name + tracking ID both filled (courier mode) */
  const canSubmit =
    !isLoading &&
    canBuyback() &&
    quantity >= 1 &&
    quantity <= maxQty &&
    reason.trim().length >= 5 &&
    atLeastOneDeclaration &&
    (returnMethod !== "courier" ||
      (courierName.trim().length > 0 && trackingId.trim().length > 0));

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-neutral-100">
            <RotateCcw className="h-4 w-4 text-neutral-900" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Initiate Buy Back
            </h3>

            <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
              {order.order_reference}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {isSuccess ? (
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="flex min-h-[300px] flex-col items-center justify-center py-10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-neutral-100">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>

            <h4 className="mt-5 text-[20px] font-semibold text-[#171717]">
              Buyback Requested!
            </h4>

            <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
              Your buyback request for {order.product_name} has been submitted.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                {order.primary_image ? (
                  <Image
                    src={order.primary_image}
                    alt={order.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-[#999999]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-[#171717]">
                  {order.product_name}
                </p>

                <p className="mt-0.5 text-[10px] text-[#888888]">
                  Ordered: {order.quantity} • Max Buyback:{" "}
                  <span className="font-semibold text-neutral-900">
                    {maxQty}
                  </span>
                </p>

                {order.product_code && (
                  <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                    Code: {order.product_code}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Quantity to Buy Back <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                  disabled={isLoading || quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#D7D7D5] bg-white text-[#555555] transition hover:border-[#BDBDBA] disabled:opacity-40"
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const v = Number(e.target.value);

                    if (!Number.isFinite(v)) {
                      return;
                    }

                    setQuantity(Math.min(maxQty, Math.max(1, v)));
                  }}
                  disabled={isLoading}
                  className="h-9 w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-center text-[13px] font-medium text-[#171717] outline-none focus:border-[#999999]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQty, Number(q) + 1))
                  }
                  disabled={isLoading || quantity >= maxQty}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#D7D7D5] bg-white text-[#555555] transition hover:border-[#BDBDBA] disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="mt-1 text-[10px] text-[#999999]">
                Maximum {maxQty} allowed
              </p>
            </div>

            {/* Return Method Selection */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Return Method <span className="text-[#B24C4C]">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Doorstep */}
                <button
                  type="button"
                  onClick={() => setReturnMethod("doorstep")}
                  disabled={isLoading}
                  className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${
                    returnMethod === "doorstep"
                      ? "border-black bg-neutral-50"
                      : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Home
                      className={`h-4 w-4 ${
                        returnMethod === "doorstep"
                          ? "text-black"
                          : "text-[#999999]"
                      }`}
                    />

                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        returnMethod === "doorstep"
                          ? "border-black bg-black"
                          : "border-[#D7D7D5]"
                      }`}
                    >
                      {returnMethod === "doorstep" && (
                        <div className="m-auto mt-[2px] h-1 w-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] font-semibold ${
                        returnMethod === "doorstep"
                          ? "text-[#186149]"
                          : "text-[#171717]"
                      }`}
                    >
                      Doorstep
                    </p>

                    <p className="mt-0.5 text-[9.5px] leading-tight text-[#888888]">
                      Pickup from your address
                    </p>
                  </div>
                </button>

                {/* Courier */}
                <button
                  type="button"
                  onClick={() => setReturnMethod("courier")}
                  disabled={isLoading}
                  className={`flex flex-col items-start gap-1.5 rounded-[8px] border-2 p-2.5 text-left transition-all ${
                    returnMethod === "courier"
                      ? "border-black bg-neutral-50"
                      : "border-[#E4E4E2] bg-white hover:border-[#D7D7D5]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Truck
                      className={`h-4 w-4 ${
                        returnMethod === "courier"
                          ? "text-black"
                          : "text-[#999999]"
                      }`}
                    />

                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        returnMethod === "courier"
                          ? "border-black bg-black"
                          : "border-[#D7D7D5]"
                      }`}
                    >
                      {returnMethod === "courier" && (
                        <div className="m-auto mt-[2px] h-1 w-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] font-semibold ${
                        returnMethod === "courier"
                          ? "text-[#186149]"
                          : "text-[#171717]"
                      }`}
                    >
                      Courier
                    </p>

                    <p className="mt-0.5 text-[9.5px] leading-tight text-[#888888]">
                      Ship it yourself
                    </p>
                  </div>
                </button>
              </div>

              {/* ✅ Courier Name + Tracking ID (both fields shown for courier) */}
              {returnMethod === "courier" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="mt-2.5 space-y-2.5"
                >
                  {/* Courier Name */}
                  <div>
                    <label
                      htmlFor="courierName"
                      className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]"
                    >
                      Courier Name <span className="text-[#B24C4C]">*</span>
                    </label>

                    <input
                      id="courierName"
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Delhivery, BlueDart, DTDC..."
                      disabled={isLoading}
                      className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-neutral-900"
                    />
                  </div>

                  {/* ✅ Tracking ID */}
                  <div>
                    <label
                      htmlFor="trackingId"
                      className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]"
                    >
                      Tracking ID <span className="text-[#B24C4C]">*</span>
                    </label>

                    <input
                      id="trackingId"
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. 1234567890"
                      disabled={isLoading}
                      className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[12px] text-[#171717] outline-none placeholder:text-[#AAAAAA] disabled:opacity-60 focus:border-neutral-900"
                    />
                  </div>
                </motion.div>
              )}

              {/* Shipping Charge Warning */}
              <div className="mt-2.5 flex items-start gap-2 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B45309]" />

                <p className="text-[10px] leading-4 text-[#92400E]">
                  <span className="font-semibold">Doorstep return:</span> 2×
                  shipping charge deducted
                  <br />
                  <span className="font-semibold">Courier return:</span> 1×
                  shipping charge deducted
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Reason <span className="text-[#B24C4C]">*</span>
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you requesting this buyback?"
                maxLength={500}
                disabled={isLoading}
                className="min-h-[80px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-[#171717] outline-none focus:border-[#999999]"
              />

              <p className="mt-1 text-right text-[9.5px] text-[#999999]">
                {reason.trim().length}/500
              </p>
            </div>

            {/* Declarations */}
            <div className="mb-2 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
                  Declarations
                </p>

                <span
                  className={`text-[9.5px] font-medium ${
                    atLeastOneDeclaration ? "text-black" : "text-[#B24C4C]"
                  }`}
                >
                  {atLeastOneDeclaration ? "✓ ready" : "tick at least one"}
                </span>
              </div>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresMarketable}
                  onChange={(e) => setDeclaresMarketable(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">marketable</span> and in
                  sellable condition.
                </span>
              </label>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresUnsold}
                  onChange={(e) => setDeclaresUnsold(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">unsold</span>.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declaresUnused}
                  onChange={(e) => setDeclaresUnused(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-black"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the product is{" "}
                  <span className="font-semibold">unused</span>.
                </span>
              </label>
            </div>

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B24C4C]" />

                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {!isSuccess && (
        <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-[10px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-150 active:scale-[0.99] ${
                canSubmit
                  ? "border-black bg-black text-white shadow-sm hover:bg-neutral-800"
                  : "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Submit Buy Back
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Actions Dropdown                                                           */
/* -------------------------------------------------------------------------- */

interface ActionDropdownProps {
  order: OrderLineItem;
  onView: () => void;
  onBuyback: () => void;
  registrationBuybackEligible: boolean;
  displayStatus?: string;
}

const ActionDropdown = ({
  order,
  onView,
  onBuyback,
  registrationBuybackEligible,
  displayStatus,
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 180;
  const MENU_OFFSET_X = 12;

  const normalizedStatus = normalizeStatus(
    displayStatus ?? order.delivery_status,
  );

  const isDelivered = normalizedStatus === "delivered";

  const buybackEnabled = isBuybackEnabled(order);

  const showBuybackOption =
    isDelivered && buybackEnabled && registrationBuybackEligible;

  const updateCoords = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();

    const menuHeight = showBuybackOption ? 100 : 60;

    const spaceBelow = window.innerHeight - rect.bottom;

    const openUp = spaceBelow < menuHeight + 20;

    let left = rect.right + MENU_OFFSET_X - MENU_WIDTH;

    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    if (left < 8) {
      left = 8;
    }

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: MENU_WIDTH,
      openUp,
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }

    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handler = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handler, true);

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler, true);

      window.removeEventListener("resize", handler);
    };
  }, [isOpen, showBuybackOption]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menu = isOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{
              opacity: 0,
              y: coords.openUp ? 6 : -6,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: coords.openUp ? 6 : -6,
              scale: 0.98,
            }}
            transition={{
              duration: 0.15,
            }}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              transform: coords.openUp ? "translateY(-100%)" : "translateY(0)",
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_14px_40px_rgba(0,0,0,0.12)]"
          >
            <button
              onClick={() => handleAction(onView)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              <Eye
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{
                  color: INDIGO,
                }}
              />

              <span className="truncate">View</span>
            </button>

            {showBuybackOption && (
              <button
                onClick={() => handleAction(onBuyback)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
              >
                <RotateCcw
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{
                    color: EMERALD,
                  }}
                />

                <span className="truncate">Buy Back</span>
              </button>
            )}
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Actions"
        className={`flex h-9 w-9 items-center justify-center rounded-[9px] border transition-all duration-150 ${
          isOpen
            ? "border-neutral-900/25 bg-[#f7f8fa] text-neutral-950"
            : "border-[#e5e9ef] bg-white text-[#344054] hover:bg-[#f7f8fa]"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function BuyBack() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const { data: profileData } = useGetUserProfileQuery({});

  const [eligibilityNow, setEligibilityNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(
      () => setEligibilityNow(Date.now()),
      30_000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const registrationBuybackEligible = isWithinRegistrationBuybackWindow(
    profileData,
    eligibilityNow,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const [perPage] = useState(10);

  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [buybackModalOpen, setBuybackModalOpen] = useState(false);

  const [expiredModalOpen, setExpiredModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(
    null,
  );

  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, string>
  >({});

  /* ------------------------------------------------------------------------ */
  /* Orders                                                                   */
  /* ------------------------------------------------------------------------ */

  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
    {
      page,
      per_page: perPage,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const orders: OrderLineItem[] = useMemo(() => {
    if (!data?.data) {
      return [];
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }

    return [];
  }, [data]);

  const getOrderKey = (order: OrderLineItem) =>
    `${order.order_id}-${order.line_id}`;

  const getEffectiveDeliveryStatus = (order: OrderLineItem) => {
    const key = getOrderKey(order);

    return statusOverrides[key] ?? normalizeStatus(order.delivery_status);
  };

  useEffect(() => {
    if (!orders.length || !Object.keys(statusOverrides).length) {
      return;
    }

    setStatusOverrides((currentOverrides) => {
      let changed = false;

      const nextOverrides = {
        ...currentOverrides,
      };

      orders.forEach((order) => {
        const key = getOrderKey(order);

        const localStatus = nextOverrides[key];

        if (!localStatus) {
          return;
        }

        const backendStatus = normalizeStatus(order.delivery_status);

        if (backendStatus === localStatus) {
          delete nextOverrides[key];
          changed = true;
        }
      });

      return changed ? nextOverrides : currentOverrides;
    });
  }, [orders, statusOverrides]);

  // Show all order lines. Buyback remains separately restricted to eligible lines.
  const eligibleOrders = orders;

  const getVisibleStatus = (order: OrderLineItem) =>
    normalizeStatus(order.order_status) === "payment_failed"
      ? "payment_failed"
      : getEffectiveDeliveryStatus(order);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const normalizedFilter = normalizeStatus(statusFilter);

    return eligibleOrders.filter((o) => {
      const normalizedDeliveryStatus = getVisibleStatus(o);

      const matchesSearch =
        !q ||
        o.order_reference?.toLowerCase().includes(q) ||
        o.product_name?.toLowerCase().includes(q) ||
        o.order_status?.toLowerCase().includes(q) ||
        o.item_reference_id?.toLowerCase().includes(q);

      const matchesStatus =
        !normalizedFilter || normalizedDeliveryStatus === normalizedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [eligibleOrders, searchQuery, statusFilter, statusOverrides]);

  const totalRecords =
    (data as any)?.meta?.total || (data as any)?.total || eligibleOrders.length;

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  /* ------------------------------------------------------------------------ */
  /* Status Sync Helpers                                                      */
  /* ------------------------------------------------------------------------ */

  const syncOrderStatus = async (order: OrderLineItem, nextStatus: string) => {
    const key = getOrderKey(order);

    setStatusOverrides((prev) => ({
      ...prev,
      [key]: normalizeStatus(nextStatus),
    }));

    setSelectedOrder((prev) => {
      if (!prev || getOrderKey(prev) !== key) {
        return prev;
      }

      return {
        ...prev,
        delivery_status: normalizeStatus(nextStatus),
      };
    });

    try {
      await refetch();
    } catch {
      // Keep optimistic status.
    }
  };

  const handleBuybackSuccess = async () => {
    if (!selectedOrder) {
      await refetch();
      return;
    }

    await syncOrderStatus(selectedOrder, "buyback_pending");
  };

  /* ------------------------------------------------------------------------ */
  /* Modal Handlers                                                           */
  /* ------------------------------------------------------------------------ */

  const openView = (order: OrderLineItem) => {
    const effectiveStatus = getEffectiveDeliveryStatus(order);

    const orderForModal = statusOverrides[getOrderKey(order)]
      ? {
          ...order,
          delivery_status: effectiveStatus,
        }
      : order;

    setSelectedOrder(orderForModal);

    setViewModalOpen(true);
  };

  const canBuybackOrder = (order: OrderLineItem | null): boolean =>
    Boolean(
      order &&
      normalizeStatus(getEffectiveDeliveryStatus(order)) === "delivered" &&
      isBuybackEnabled(order) &&
      isWithinRegistrationBuybackWindow(profileData, Date.now()),
    );

  const openBuyback = (order: OrderLineItem) => {
    if (!canBuybackOrder(order)) {
      return;
    }

    setSelectedOrder(order);
    setBuybackModalOpen(true);
  };

  useEffect(() => {
    if (buybackModalOpen && !registrationBuybackEligible) {
      setBuybackModalOpen(false);
    }
  }, [buybackModalOpen, registrationBuybackEligible]);

  const handleGoToContact = () => {
    setExpiredModalOpen(false);
    setSelectedOrder(null);

    router.push("/contact");
  };

  const closeAllModals = () => {
    setViewModalOpen(false);
    setBuybackModalOpen(false);
    setExpiredModalOpen(false);
    setSelectedOrder(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <section className="rounded-[18px] border border-neutral-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="h-10 w-64 animate-pulse rounded-[8px] bg-[#f2f4f7]" />

          <div className="h-10 w-[180px] animate-pulse rounded-[8px] bg-[#f2f4f7]" />
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[8px] bg-[#f7f8fa]"
            />
          ))}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
        <p className="text-[14px] text-[#667085]">
          Failed to load orders. Please try again.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-3 min-h-10 rounded-xl bg-black px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-[18px] border border-neutral-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        {/* Search + Status Filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />

            <input
              type="text"
              placeholder="Search order or item"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>

          <div className="relative w-full sm:w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 pl-3 pr-9 text-[13px] text-[#101828] outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
            <span>Order Reference</span>
            <span>Product</span>
            <span>Total</span>
            <span>Method</span>
            <span>Qty</span>
            <span>Coins</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div>
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                {searchQuery || statusFilter
                  ? "No orders found matching your filters."
                  : "No orders found."}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const rowKey = `${order.order_id}-${order.line_id}`;

                const normalizedDeliveryStatus = getVisibleStatus(order);

                const statusStyle = STATUS_STYLES[normalizedDeliveryStatus] ?? {
                  color: "#667085",
                  bg: "#f2f4f7",
                };

                const refundDetails = getRefundDetails(order);

                return (
                  <div
                    key={rowKey}
                    className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] items-center gap-2 border-b border-neutral-100 py-4 text-[13px] text-neutral-900 transition-colors hover:bg-neutral-50/80 last:border-b-0"
                  >
                    <span className="truncate font-semibold text-neutral-950">
                      {order.order_reference}
                    </span>

                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                        {order.primary_image ? (
                          <Image
                            src={order.primary_image}
                            alt={order.product_name || "Product"}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-[#999999]" />
                          </span>
                        )}
                      </span>

                      <span
                        className="truncate font-semibold text-[#101828]"
                        title={order.product_name}
                      >
                        {order.product_name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#667085]">
                        {formatCurrency(order.final_amount)}
                      </span>

                      {refundDetails?.amount !== null &&
                        refundDetails?.amount !== undefined && (
                          <span className="mt-0.5 block text-[10px] font-bold text-[#1F7A56]">
                            Refund: {formatCurrency(refundDetails.amount)}
                          </span>
                        )}
                    </div>

                    <span>
                      <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                        {order.payment_gateway || "N/A"}
                      </span>
                    </span>

                    <span className="text-[#667085]">{order.quantity}</span>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-6 min-w-7 items-center justify-center gap-1 rounded-[5px] border border-[#CFE0D4] bg-[#F1F7F3] px-1.5 text-[10px] font-bold text-[#1F7A56]">
                        <Coins size={11} />
                        {order.coin_redeemed || 0}
                      </span>
                    </div>

                    <span>
                      <span
                        className="rounded-[6px] px-2 py-1 text-[11px] font-semibold capitalize"
                        style={{
                          color: statusStyle.color,
                          backgroundColor: statusStyle.bg,
                        }}
                      >
                        {normalizedDeliveryStatus.replace(/_/g, " ")}
                      </span>
                    </span>

                    <div className="flex items-center justify-end">
                      <ActionDropdown
                        order={order}
                        displayStatus={normalizedDeliveryStatus}
                        onView={() => openView(order)}
                        registrationBuybackEligible={
                          registrationBuybackEligible
                        }
                        onBuyback={() => openBuyback(order)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center gap-4 text-[13px] text-[#667085]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#101828]">{perPage}</span>

              <ChevronDown size={14} className="text-[#8a92a6]" />
            </div>

            <span className="font-medium">
              Showing {(page - 1) * perPage + 1} –{" "}
              {Math.min(page * perPage, totalRecords)} of {totalRecords} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from(
              {
                length: Math.min(totalPages, 5),
              },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${
                  page === p
                    ? "text-white"
                    : "text-[#667085] hover:bg-[#f2f4f7] hover:text-neutral-950"
                }`}
                style={
                  page === p
                    ? {
                        backgroundColor: NAVY,
                      }
                    : undefined
                }
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ViewDetailsModal
        isOpen={viewModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <BuybackModal
        isOpen={buybackModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSuccess={handleBuybackSuccess}
        canBuyback={() => canBuybackOrder(selectedOrder)}
      />

      <BuybackExpiredModal
        isOpen={expiredModalOpen}
        onClose={closeAllModals}
        onContact={handleGoToContact}
      />
    </>
  );
}
