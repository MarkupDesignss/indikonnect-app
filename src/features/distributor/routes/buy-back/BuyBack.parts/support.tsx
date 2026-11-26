"use client";

import { MapPin } from "lucide-react";


/* ========================================================================== */
/* Return Method type                                                         */
/* ========================================================================== */

export type ReturnMethod = "doorstep" | "courier";


export interface CreditNote {
  id: number;
  credit_note_number: string;
  original_invoice_number: string;
  amount: number | string;
  issued_at: string;
  download_url: string;
}


export interface ReturnItem {
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


export interface ReturnRecord {
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


export interface TaxItem {
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


export interface TaxSummary {
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


export interface TaxCategory {
  tax_category?: string;
  tax_rate?: number | string;
  taxable_amount?: number;
  tax_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
}


export interface TaxBreakdown {
  items?: TaxItem[];
  summary?: TaxSummary;
  tax_by_category?: TaxCategory[];
  delivery_state?: string;
  supplier_state?: string;
}


export interface OrderAddress {
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


export interface OrderLineItem {
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


export const NAVY = "#111111";

export const BRASS = "#B8935A";

export const EMERALD = "#1f9d6b";

export const INDIGO = "#3955A6";

export const RED = "#DC2626";


export const STATUS_OPTIONS = [
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


export const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
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

export function formatCurrency(value: number | string | null | undefined) {
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

export function parseBackendDate(dateStr: string | null | undefined): Date | null {
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


export function formatDate(dateStr: string | null | undefined) {
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

export function normalizeStatus(status?: string | null) {
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

export function isBuybackEnabled(order: OrderLineItem): boolean {
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


export function getRegistrationCompletionDate(profile: any): Date | null {
  const user = profile?.user ?? profile?.data?.user ?? profile?.data ?? profile;

  const raw = user?.registration_completed_at;

  if (user?.account_type !== "distributor" || !raw) {
    return null;
  }

  // Backend sends YYYY-MM-DD HH:mm:ss without timezone.
  const parsed = parseBackendDate(raw);

  return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
}


/* -------------------------------------------------------------------------- */
/* Refund / Credit Note Helpers                                               */
/* -------------------------------------------------------------------------- */

export function getMatchingReturn(order: OrderLineItem): ReturnRecord | null {
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
export function numericOrNull(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}


export function moneyOrDash(value: number | string | null | undefined) {
  return numericOrNull(value) === null ? "—" : formatCurrency(value);
}


export function prettyStatus(value: string | null | undefined) {
  const normalized = normalizeStatus(value);
  if (!normalized) return "—";
  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}


export function maybeValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}


export function getMatchingCreditNotes(order: OrderLineItem) {
  return (order.credit_notes || []).filter(
    (note) =>
      note.original_invoice_number === order.order_reference ||
      (Boolean(order.invoice?.invoice_number) &&
        note.original_invoice_number === order.invoice?.invoice_number),
  );
}


export function getRefundDetails(order: OrderLineItem): {
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

export interface ModalShellProps {
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}


/* -------------------------------------------------------------------------- */
/* Buyback Window Expired Modal                                               */
/* -------------------------------------------------------------------------- */

export interface BuybackExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}


/* -------------------------------------------------------------------------- */
/* Full API Breakdown - shared, mobile-friendly display primitives            */
/* -------------------------------------------------------------------------- */

export const BreakdownSection = ({
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


export const BreakdownRow = ({
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


export const BreakdownPill = ({ status }: { status?: string | null }) => {
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


export const AddressBreakdown = ({
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

export interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}


/* -------------------------------------------------------------------------- */
/* Buy Back Modal                                                             */
/* -------------------------------------------------------------------------- */

export interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSuccess?: () => void | Promise<void>;
  canBuyback: () => boolean;
}


/* -------------------------------------------------------------------------- */
/* Actions Dropdown                                                           */
/* -------------------------------------------------------------------------- */

export interface ActionDropdownProps {
  order: OrderLineItem;
  onView: () => void;
  onBuyback: () => void;
  registrationBuybackEligible: boolean;
  displayStatus?: string;
}
