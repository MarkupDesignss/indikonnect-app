"use client";

import { Package, AlertCircle, Check, Loader2, Truck, Undo2, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { type IndiaPostOrderTrackingData } from "@/lib/redux/api/indiaPostTrackingApi";


export type ReturnMethod = "doorstep" | "courier";


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
  reason?: string;
  image_paths?: string[];
  image_urls?: string[];
  return_status?: string;
}


export interface ReturnRecord {
  id: number;
  order_id: number;
  user_id: number;
  type: string;
  items: ReturnItem[];
  status: string;
  refund_subtotal?: number;
  refund_tax?: number;
  refund_line_total?: number;
  refund_shipping?: number;
  total_refund_amount?: number;
  refund_status?: string;
  refund_processed_at?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
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
  product_code: string;
  product_slug?: string;

  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  refunded_amount?: number | string | null;
  deducted_shipping_charges?: number | string | null;
  gateway_charges?: number | string | null;
  gateway_charges_percent?: number | string | null;
  total_returnable_amount?: number | string | null;
  tax_amount?: number | string | null;
  return_method?: string | null;
  is_buyback_enabled?: string | boolean | number | null;
  final_amount?: number;
  delivery_charges?: number;

  commissionable_volume: number;

  delivery_status: string;
  return_status: string;
  returned_quantity: number;
  available_for_return: number;
  is_returnable: boolean;

  // API flag controlling cancel + return eligibility
  is_cancel_return_allowed?: number | string | boolean;

  // API flag controlling invoice button visibility (per line)
  invoice_available?: number | string | boolean | null;

  timeline: {
    order_placed: string;
    order_confirmed: string | null;
    shipped_at: string | null;
    cancelled_at: string | null;
    dispatched_at: string | null;
    delivered_at: string | null;
    return_requested_at: string | null;
    return_approved_at: string | null;
    return_rejected_at: string | null;
    return_completed_at: string | null;
    return_applicable_till?: string | null;
  };

  is_reviewed: boolean;

  images: Array<{
    id: number;
    image_url: string;
    is_primary: boolean;
  }>;

  primary_image: string;

  product_reviews: any[];

  payment_gateway: string;
  can_repay?: boolean;
  payment_expires_at?: string | null;
  gateway_transaction_id: string | null;
  amount_paid: number;
  payment_status: string;

  subtotal: number;
  total_gst: number;
  shipping_charge: number;

  coin_redeemed: number;
  coin_redeemed_amount: number;

  total_payable: number;

  tax_breakdown: any;
  shipping_method: string | null;
  billing_address: any;
  delivery_address: any;
  user: any;
  invoice: any;

  returns: ReturnRecord[];
  credit_notes: any[];
}


// ✅ One parent order + all of its product lines
export interface OrderGroup {
  orderId: number;
  reference: string;
  lines: OrderLineItem[];
}


// /my-orders returns parent orders with items[]. Preserve parent-level payment
// and totals, but use the real item identity, amount, status and timeline.
export function flattenOrderItems(rows: unknown[]): OrderLineItem[] {
  const positiveId = (value: unknown): number | null => {
    if (typeof value !== "number" &&
      !(typeof value === "string" && /^\d+$/.test(value.trim()))) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  };
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  return rows.flatMap((row): OrderLineItem[] => {
    if (!isRecord(row)) return [];
    const orderId = positiveId(row.order_id);
    const reference = typeof row.order_reference === "string" ? row.order_reference.trim() : "";
    if (!orderId || !reference) return [];
    const { items, ...parent } = row;
    const nested = Array.isArray(items);
    const candidates = nested ? items : [row];
    return candidates.flatMap((item): OrderLineItem[] => {
      if (!isRecord(item)) return [];
      const lineId = positiveId(item.line_id ?? item.order_line_id);
      if (!lineId || (item.line_id != null && positiveId(item.line_id) !== lineId) ||
        (item.order_line_id != null && positiveId(item.order_line_id) !== lineId) ||
        (item.order_id != null && positiveId(item.order_id) !== orderId) ||
        (item.order_reference != null && item.order_reference !== reference)) return [];
      // Keep order-wide fields available for order-level breakup and payment.
      // Item flags, credit notes and shipping history must override parent defaults.
      // A parent invoice must not be copied to every product in a partial shipment.
      const parentInvoice = isRecord(parent.invoice) ? parent.invoice : null;
      const lineInvoice = Object.prototype.hasOwnProperty.call(item, "invoice")
        ? item.invoice
        : parentInvoice && positiveId(parentInvoice.order_line_id) === lineId
          ? parentInvoice
          : null;
      return [{
        ...parent, ...item, order_id: orderId, order_reference: reference,
        line_id: lineId, order_line_id: lineId, invoice: lineInvoice,
      } as unknown as OrderLineItem];
    });
  });
}


// ✅ Group flattened lines back into parent orders (keeps API order)
export function groupByOrder(lines: OrderLineItem[]): OrderGroup[] {
  const map = new Map<number, OrderGroup>();
  lines.forEach((line) => {
    const existing = map.get(line.order_id);
    if (existing) {
      existing.lines.push(line);
    } else {
      map.set(line.order_id, {
        orderId: line.order_id,
        reference: line.order_reference,
        lines: [line],
      });
    }
  });
  return Array.from(map.values());
}


export interface ApiStatusOption {
  value: string;
  label: string;
}


/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

export const NAVY = "#0E1B3D";

export const BRASS = "#B8935A";

export const EMERALD = "#1f9d6b";

export const INDIGO = "#3955A6";

export const RED = "#DC2626";


export const STATUS_STYLES: Record<
  string,
  {
    color: string;
    bg: string;
  }
> = {
  confirmed: { color: INDIGO, bg: "#eceffb" },
  delivered: { color: EMERALD, bg: "#eaf7f0" },
  pending: { color: BRASS, bg: "#f8f1e4" },
  failed: { color: RED, bg: "#fef2f2" },
  payment_failed: { color: RED, bg: "#fef2f2" },
  processing: { color: "#2563EB", bg: "#EFF6FF" },
  shipped: { color: "#7c3aed", bg: "#f3e8ff" },
  dispatched: { color: "#7c3aed", bg: "#f3e8ff" },
  cancelled: { color: RED, bg: "#fef2f2" },
  returned: { color: "#ea580c", bg: "#fff7ed" },
  partial_returned: { color: "#ea580c", bg: "#fff7ed" },
  refunded: { color: "#ea580c", bg: "#fff7ed" },
  cancel_pending: { color: "#A9711F", bg: "#FBF3E4" },
  return_pending: { color: "#EA580C", bg: "#FFF7ED" },
  return_approved: { color: INDIGO, bg: "#eceffb" },
  return_rejected: { color: RED, bg: "#FEF2F2" },
  partial_delivered: { color: "#3955A6", bg: "#eceffb" },
  buyback_pending: { color: "#A9711F", bg: "#FBF3E4" },
  buyback_approved: { color: INDIGO, bg: "#eceffb" },
  buyback_rejected: { color: RED, bg: "#FEF2F2" },
  buyback_refunded: { color: "#EA580C", bg: "#FFF7ED" },
};


/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

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


export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  try {
    let normalized = String(dateStr).trim();

    if (normalized.includes(" ") && !normalized.includes("T")) {
      normalized = normalized.replace(" ", "T");
    }

    const d = new Date(normalized);

    if (Number.isNaN(d.getTime())) {
      return null;
    }

    return d;
  } catch {
    return null;
  }
}


export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) {
    return "—";
  }

  const d = parseDate(dateStr);

  if (!d) {
    return String(dateStr);
  }

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


export function normalizeStatus(status?: string | null) {
  if (!status) return "";

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}


export function formatStatusLabel(status?: string | null) {
  if (!status) {
    return "—";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


/* Retry window: five minutes from server order_date, interpreted in IST. */
export function orderDateMs(value?: string | null): number {
  if (!value) return NaN;
  const raw = value.trim();
  const iso = raw.replace(" ", "T");
  const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}+05:30`;
  return Date.parse(withZone);
}


export function isPaymentFailed(order: OrderLineItem): boolean {
  const statuses = [
    order.order_status,
    order.delivery_status,
    order.payment_status,
  ].map(normalizeStatus);
  return statuses.includes("failed") || statuses.includes("payment_failed");
}


export function retryRemainingMs(order: OrderLineItem, now: number): number {
  if (
    !isPaymentFailed(order) ||
    normalizeStatus(order.payment_status) === "paid"
  )
    return 0;
  // Backend eligibility is authoritative; do not allow expired/blocked payment retries.
  if (order.can_repay === false) return 0;
  const created = orderDateMs(order.order_date);
  if (!Number.isFinite(created)) return 0;
  const localDeadline = created + 5 * 60 * 1000;
  const backendDeadline = order.payment_expires_at
    ? orderDateMs(order.payment_expires_at)
    : Number.POSITIVE_INFINITY;
  return Math.max(0, Math.min(localDeadline, backendDeadline) - now);
}


export function formatRetryTime(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}


export async function loadRazorpayCheckout(): Promise<void> {
  if ((window as any).Razorpay) return;
  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-retry-razorpay="true"]',
  );
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Razorpay failed to load")),
        { once: true },
      );
    });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.retryRazorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(script);
  });
}


export function RetryPaymentButton({
  order,
  now,
  busy,
  onRetry,
}: {
  order: OrderLineItem;
  now: number;
  busy: boolean;
  onRetry: (order: OrderLineItem) => void;
}) {
  if (!isPaymentFailed(order)) return null;
  const remaining = retryRemainingMs(order, now);
  const active = remaining > 0;
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={!active || busy}
        onClick={() => onRetry(order)}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0E1B3D] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
      >
        {busy ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <RefreshCcw size={13} />
        )}
        {busy ? "Preparing..." : active ? "Retry Payment" : "Retry Expired"}
      </button>
      {active && (
        <span className="text-[10px] text-[#DC2626]">
          Available for {formatRetryTime(remaining)}
        </span>
      )}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* is_cancel_return_allowed parser                                            */
/* -------------------------------------------------------------------------- */

export function isCancelReturnAllowed(order: OrderLineItem): boolean {
  const raw = order?.is_cancel_return_allowed;

  // If API doesn't send it at all, don't break existing behavior.
  if (raw === null || raw === undefined || raw === "") {
    return true;
  }

  if (typeof raw === "boolean") {
    return raw;
  }

  if (typeof raw === "number") {
    return raw === 1;
  }

  const normalized = String(raw).trim().toLowerCase();

  if (["1", "true", "yes", "y", "allowed"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "n", "blocked", "disabled"].includes(normalized)) {
    return false;
  }

  // Unknown value → treat as NOT allowed (safer default when explicitly set).
  return false;
}


/* -------------------------------------------------------------------------- */
/* API STATUS EXTRACTION                                                      */
/* -------------------------------------------------------------------------- */

export function normalizeApiStatusOption(item: any): ApiStatusOption | null {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    const value = normalizeStatus(item);

    if (!value) {
      return null;
    }

    return {
      value,
      label: formatStatusLabel(value),
    };
  }

  if (typeof item === "object") {
    const rawValue =
      item.value ?? item.status ?? item.key ?? item.code ?? item.name;

    const rawLabel = item.label ?? item.title ?? item.name ?? rawValue;

    if (!rawValue) {
      return null;
    }

    const value = normalizeStatus(String(rawValue));

    if (!value) {
      return null;
    }

    return {
      value,
      label:
        rawLabel && String(rawLabel).trim()
          ? String(rawLabel)
          : formatStatusLabel(value),
    };
  }

  return null;
}


export function extractStatusOptionsFromApi(apiData: any): ApiStatusOption[] {
  const candidates = [
    apiData?.status_options,
    apiData?.statuses,
    apiData?.status,
    apiData?.data?.status_options,
    apiData?.data?.statuses,
    apiData?.data?.status,
    apiData?.data?.filters?.statuses,
    apiData?.data?.filters?.status,
    apiData?.filters?.statuses,
    apiData?.filters?.status,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    const normalized = candidate
      .map(normalizeApiStatusOption)
      .filter((item): item is ApiStatusOption => !!item);

    if (normalized.length > 0) {
      const unique = new Map<string, ApiStatusOption>();

      normalized.forEach((item) => {
        unique.set(item.value, item);
      });

      return Array.from(unique.values());
    }
  }

  return [];
}


/**
 * Status priority order for badge display:
 * 1. Cancelled / Cancel Pending
 * 2. Refunded / Returned / Buyback Refunded
 * 3. Return Pending / Return Approved / Return Rejected
 * 4. Delivered / Partial Delivered
 * 5. Shipped / Dispatched
 * 6. Confirmed / Processing / Pending
 */
export function getOrderStatusValue(order: OrderLineItem) {
  const deliveryStatus = normalizeStatus(order.delivery_status);
  const orderStatus = normalizeStatus(order.order_status);
  const returnStatus = normalizeStatus(order.return_status);

  if (deliveryStatus === "cancelled" || orderStatus === "cancelled") {
    return "cancelled";
  }

  if (deliveryStatus === "cancel_pending" || orderStatus === "cancel_pending") {
    return "cancel_pending";
  }

  if (deliveryStatus === "refunded" || returnStatus === "refunded") {
    return "refunded";
  }

  if (deliveryStatus === "returned" || returnStatus === "returned") {
    return "returned";
  }

  if (deliveryStatus === "partial_returned") {
    return "partial_returned";
  }

  if (deliveryStatus === "buyback_refunded") {
    return "buyback_refunded";
  }

  if (deliveryStatus === "buyback_rejected") {
    return "buyback_rejected";
  }

  if (deliveryStatus === "buyback_approved") {
    return "buyback_approved";
  }

  if (deliveryStatus === "buyback_pending") {
    return "buyback_pending";
  }

  if (deliveryStatus === "return_pending") {
    return "return_pending";
  }

  if (deliveryStatus === "return_approved") {
    return "return_approved";
  }

  if (deliveryStatus === "return_rejected") {
    return "return_rejected";
  }

  if (deliveryStatus === "delivered") {
    return "delivered";
  }

  if (deliveryStatus === "partial_delivered") {
    return "partial_delivered";
  }

  if (deliveryStatus === "shipped") {
    return "shipped";
  }

  if (deliveryStatus === "dispatched") {
    return "dispatched";
  }

  // Payment failure must override a generic pending state.
  if (isPaymentFailed(order)) return "payment_failed";

  if (orderStatus === "confirmed") {
    return "confirmed";
  }

  if (orderStatus === "processing") {
    return "processing";
  }

  if (orderStatus === "pending") {
    return "pending";
  }

  if (isPaymentFailed(order)) return "payment_failed";

  return deliveryStatus || orderStatus || "";
}


export function getOrderStatusBadge(order: OrderLineItem) {
  const status = getOrderStatusValue(order);

  const fallback = STATUS_STYLES[status] ?? {
    color: "#667085",
    bg: "#f2f4f7",
  };

  return {
    value: status,
    label:
      status === "payment_failed"
        ? "Payment Failed"
        : status
          ? formatStatusLabel(status)
          : "—",
    color: fallback.color,
    bg: fallback.bg,
  };
}


// ✅ badge for the whole (parent) order — uses parent order_status
export function getGroupStatusBadge(group: OrderGroup) {
  const first = group.lines[0];

  let status = isPaymentFailed(first)
    ? "payment_failed"
    : normalizeStatus(first.order_status);

  if (!status) {
    status = getOrderStatusValue(first);
  }

  const style = STATUS_STYLES[status] ?? {
    color: "#667085",
    bg: "#f2f4f7",
  };

  return {
    value: status,
    label:
      status === "payment_failed"
        ? "Payment Failed"
        : status
          ? formatStatusLabel(status)
          : "—",
    color: style.color,
    bg: style.bg,
  };
}


/* -------------------------------------------------------------------------- */
/* INVOICE ELIGIBILITY                                                        */
/* -------------------------------------------------------------------------- */

export function canShowInvoice(order: OrderLineItem): boolean {
  const raw = order?.invoice_available;

  // API flag present → it is the single source of truth
  if (raw !== null && raw !== undefined && raw !== "") {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "number") return raw === 1;

    const normalized = String(raw).trim().toLowerCase();

    if (["1", "true", "yes", "y", "available"].includes(normalized)) {
      return true;
    }

    return false;
  }

  // Fallback: legacy logic when API doesn't send invoice_available
  const status = normalizeStatus(order.delivery_status);

  const INVOICE_ELIGIBLE_STATUSES = [
    "dispatched",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "partial_delivered",
    "return_pending",
    "return_approved",
    "return_rejected",
    "returned",
    "partial_returned",
    "refunded",
    "buyback_pending",
    "buyback_approved",
    "buyback_rejected",
    "buyback_refunded",
  ];

  if (!INVOICE_ELIGIBLE_STATUSES.includes(status)) {
    return false;
  }

  return !!order.invoice?.invoice_number;
}


/* -------------------------------------------------------------------------- */
/* ACTIVE (NON-TERMINAL) RETURN STATUSES                                      */
/* -------------------------------------------------------------------------- */

export const ACTIVE_RETURN_STATUSES = [
  "requested",
  "pending",
  "approved",
  "initiated",
];


export const TERMINAL_RETURN_STATUSES = [
  "cancelled",
  "rejected",
  "completed",
  "refunded",
  "returned",
  "closed",
];


/* -------------------------------------------------------------------------- */
/* RETURN HELPERS                                                             */
/* -------------------------------------------------------------------------- */

export function findReturnForLine(order: OrderLineItem) {
  const returns = order.returns || [];

  const matches: Array<{
    returnObj: ReturnRecord;
    item: ReturnItem;
  }> = [];

  for (const ret of returns) {
    const items = ret?.items || [];

    const match = items.find(
      (it) => Number(it.order_line_id) === Number(order.line_id),
    );

    if (match) {
      matches.push({
        returnObj: ret,
        item: match,
      });
    }
  }

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => Number(b.returnObj.id) - Number(a.returnObj.id));

  return matches[0];
}


export function findActiveReturnForLine(order: OrderLineItem) {
  const returns = order.returns || [];

  const matches: Array<{
    returnObj: ReturnRecord;
    item: ReturnItem;
  }> = [];

  for (const ret of returns) {
    const retStatus = normalizeStatus(ret.status);

    if (!ACTIVE_RETURN_STATUSES.includes(retStatus)) {
      continue;
    }

    const items = ret?.items || [];

    const match = items.find(
      (it) => Number(it.order_line_id) === Number(order.line_id),
    );

    if (match) {
      matches.push({
        returnObj: ret,
        item: match,
      });
    }
  }

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => Number(b.returnObj.id) - Number(a.returnObj.id));

  return matches[0];
}


export function getReturnType(order: OrderLineItem) {
  const found = findReturnForLine(order);

  if (!found) {
    return null;
  }

  const type = normalizeStatus(found.returnObj?.type);

  return type || null;
}


export function getReturnStatus(order: OrderLineItem) {
  const found = findReturnForLine(order);

  if (!found) {
    return null;
  }

  const returnStatus = normalizeStatus(found.returnObj?.status);

  if (TERMINAL_RETURN_STATUSES.includes(returnStatus)) {
    return returnStatus;
  }

  const itemStatus = normalizeStatus(found.item?.return_status);

  return itemStatus || returnStatus || null;
}


export function isReturnCompleted(order: OrderLineItem): boolean {
  const deliveryStatus = normalizeStatus(order.delivery_status);
  const returnStatus = normalizeStatus(order.return_status);

  if (
    deliveryStatus === "refunded" ||
    deliveryStatus === "returned" ||
    deliveryStatus === "buyback_refunded" ||
    returnStatus === "returned" ||
    returnStatus === "completed"
  ) {
    return true;
  }

  const found = findReturnForLine(order);

  if (!found) {
    return false;
  }

  const status = normalizeStatus(found.returnObj?.status);
  const refundStatus = normalizeStatus(found.returnObj?.refund_status);

  if (
    status === "completed" ||
    status === "refunded" ||
    status === "returned" ||
    status === "closed"
  ) {
    return true;
  }

  if (refundStatus === "completed" || refundStatus === "processed") {
    return true;
  }

  return false;
}


export function getDeliveryStatusBadge(order: OrderLineItem) {
  const deliveryStatus = normalizeStatus(order.delivery_status);

  const fallback = STATUS_STYLES[deliveryStatus] ?? {
    color: "#667085",
    bg: "#f2f4f7",
  };

  return {
    label: deliveryStatus ? formatStatusLabel(deliveryStatus) : "—",
    color: fallback.color,
    bg: fallback.bg,
  };
}


export function getReturnStatusBadge(order: OrderLineItem) {
  const returnType = getReturnType(order);
  const returnStatus = getReturnStatus(order);

  if (!returnType || !returnStatus) {
    return null;
  }

  const typeLabel =
    returnType === "buyback"
      ? "Buyback"
      : returnType === "cooling_off"
        ? "Cooling Off"
        : "Return";

  let color = INDIGO;
  let bg = "#eceffb";

  if (returnType === "buyback") {
    color = BRASS;
    bg = "#FBF3E4";
  }

  if (returnType === "cooling_off") {
    color = INDIGO;
    bg = "#eceffb";
  }

  if (returnType === "return") {
    color = "#EA580C";
    bg = "#FFF7ED";
  }

  if (returnStatus === "completed" || returnStatus === "refunded") {
    color = EMERALD;
    bg = "#eaf7f0";
  }

  if (returnStatus === "rejected" || returnStatus === "cancelled") {
    color = RED;
    bg = "#FEF2F2";
  }

  if (
    returnStatus === "pending" ||
    returnStatus === "requested" ||
    returnStatus === "approved" ||
    returnStatus === "initiated"
  ) {
    color = returnType === "buyback" ? "#B8935A" : "#A9711F";
    bg = returnType === "buyback" ? "#FBF3E4" : "#f8f1e4";
  }

  return {
    label: `${typeLabel} • ${returnStatus.replace(/_/g, " ")}`,
    color,
    bg,
  };
}


export function isReturnWindowOpen(returnApplicableTill: string | null | undefined) {
  if (!returnApplicableTill) {
    return false;
  }

  const deadline = parseDate(returnApplicableTill);

  if (!deadline) {
    return false;
  }

  return deadline.getTime() > Date.now();
}


export function getReturnWindowInfo(order: OrderLineItem) {
  const till = order.timeline?.return_applicable_till;

  if (!till) {
    return null;
  }

  const deadline = parseDate(till);

  if (!deadline) {
    return null;
  }

  const completed = isReturnCompleted(order);

  if (completed) {
    return {
      state: "completed" as const,
      deadline,
      label: "Return Completed",
    };
  }

  const open = deadline.getTime() > Date.now();

  if (open) {
    return {
      state: "open" as const,
      deadline,
      label: "Return window closes on",
    };
  }

  return {
    state: "closed" as const,
    deadline,
    label: "Return window closed on",
  };
}


export function canInitiateReturn(order: OrderLineItem): boolean {
  // HARD GATE: API flag must allow cancel/return
  if (!isCancelReturnAllowed(order)) {
    return false;
  }

  const deliveryStatus = normalizeStatus(order.delivery_status);

  if (deliveryStatus !== "delivered") {
    return false;
  }

  if (
    deliveryStatus === "return_pending" ||
    deliveryStatus === "return_rejected" ||
    deliveryStatus === "refunded" ||
    deliveryStatus === "returned" ||
    deliveryStatus === "buyback_refunded" ||
    deliveryStatus === "cancelled" ||
    deliveryStatus === "cancel_pending"
  ) {
    return false;
  }

  const lineReturnStatus = normalizeStatus(order.return_status);

  if (lineReturnStatus === "returned" || lineReturnStatus === "completed") {
    return false;
  }

  if (isReturnCompleted(order)) {
    return false;
  }

  const activeReturn = findActiveReturnForLine(order);

  if (activeReturn) {
    return false;
  }

  if (order.is_returnable === false) {
    return false;
  }

  if (
    order.available_for_return !== undefined &&
    order.available_for_return !== null &&
    Number(order.available_for_return) <= 0
  ) {
    return false;
  }

  const till = order.timeline?.return_applicable_till;

  if (till) {
    const deadline = parseDate(till);

    if (deadline && deadline.getTime() <= Date.now()) {
      return false;
    }
  }

  return true;
}


export function findCancellableReturn(order: OrderLineItem) {
  const till = order.timeline?.return_applicable_till;

  if (!isReturnWindowOpen(till)) {
    return null;
  }

  if (isReturnCompleted(order)) {
    return null;
  }

  const activeReturn = findActiveReturnForLine(order);

  if (!activeReturn) {
    return null;
  }

  return {
    returnId: activeReturn.returnObj.id,
  };
}


export function canCancelOrder(order: OrderLineItem) {
  // HARD GATE: API flag must allow cancel/return
  if (!isCancelReturnAllowed(order)) {
    return false;
  }

  const deliveryStatus = normalizeStatus(order.delivery_status);

  if (
    deliveryStatus === "cancel_pending" ||
    deliveryStatus === "delivered" ||
    deliveryStatus === "cancelled" ||
    deliveryStatus === "return_pending" ||
    deliveryStatus === "return_rejected" ||
    deliveryStatus === "refunded" ||
    deliveryStatus === "buyback_refunded" ||
    deliveryStatus === "returned"
  ) {
    return false;
  }

  return ["pending", "confirmed", "processing"].includes(deliveryStatus);
}


export function canWithdrawCancelOrder(order: OrderLineItem): boolean {
  const deliveryStatus = normalizeStatus(order.delivery_status);

  return deliveryStatus === "cancel_pending";
}


export function canWithdrawReturnRequest(order: OrderLineItem): boolean {
  const activeReturn = findActiveReturnForLine(order);

  return !!activeReturn;
}


/* -------------------------------------------------------------------------- */
/* ORDER-LEVEL (whole order) HELPERS                                          */
/* -------------------------------------------------------------------------- */

export const getReturnableLines = (lines: OrderLineItem[]) =>
  lines.filter(canInitiateReturn);


export const getCancellableLines = (lines: OrderLineItem[]) =>
  lines.filter(canCancelOrder);


export const getWithdrawCancelLines = (lines: OrderLineItem[]) =>
  lines.filter(canWithdrawCancelOrder);


export const getActiveReturnIds = (lines: OrderLineItem[]): number[] =>
  Array.from(
    new Set(
      lines
        .map((l) => findCancellableReturn(l)?.returnId)
        .filter((id): id is number => typeof id === "number"),
    ),
  );


/**
 * Prefers `refunded_amount` from the order line itself.
 * Falls back to credit notes and return record totals.
 */
export function getRefundDetails(order: OrderLineItem) {
  const found = findReturnForLine(order);

  const deliveryStatus = normalizeStatus(order.delivery_status);

  const isRefunded =
    deliveryStatus === "refunded" ||
    deliveryStatus === "returned" ||
    deliveryStatus === "buyback_refunded" ||
    isReturnCompleted(order);

  if (!isRefunded) {
    return null;
  }

  // PRIORITY 1: refunded_amount directly on the order line (most accurate)
  if (
    order.refunded_amount !== null &&
    order.refunded_amount !== undefined &&
    order.refunded_amount !== ""
  ) {
    const amount =
      typeof order.refunded_amount === "number"
        ? order.refunded_amount
        : parseFloat(String(order.refunded_amount));

    if (Number.isFinite(amount) && amount > 0) {
      return {
        amount,
        creditNoteNumber: null,
        issuedAt: found?.returnObj?.refund_processed_at ?? null,
        status: found?.returnObj?.refund_status || "processed",
      };
    }
  }

  // PRIORITY 2: credit notes
  const creditNotes = order.credit_notes || [];

  const matchingCreditNote = creditNotes.find(
    (note) =>
      note &&
      note.amount !== null &&
      note.amount !== undefined &&
      note.amount !== "",
  );

  if (matchingCreditNote) {
    const amount =
      typeof matchingCreditNote.amount === "number"
        ? matchingCreditNote.amount
        : parseFloat(String(matchingCreditNote.amount));

    return {
      amount: Number.isFinite(amount) ? amount : null,
      creditNoteNumber: matchingCreditNote.credit_note_number || null,
      issuedAt: matchingCreditNote.issued_at || null,
      status: matchingCreditNote.status || "processed",
    };
  }

  // PRIORITY 3: fallback to return record total_refund_amount
  const fallbackAmount = found?.returnObj?.total_refund_amount;

  if (fallbackAmount !== null && fallbackAmount !== undefined) {
    const amount =
      typeof fallbackAmount === "number"
        ? fallbackAmount
        : parseFloat(String(fallbackAmount));

    return {
      amount: Number.isFinite(amount) ? amount : null,
      creditNoteNumber: null,
      issuedAt: found?.returnObj?.refund_processed_at || null,
      status: found?.returnObj?.refund_status || "processed",
    };
  }

  return null;
}


/* ========================================================================== */
/* MODAL SHELL                                                                */
/* ========================================================================== */

export interface ModalShellProps {
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}


export const ModalShell = ({
  onClose,
  maxWidth = "max-w-xl",
  children,
}: ModalShellProps) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[18px] border border-[#E4E9F0] bg-white shadow-[0_24px_75px_rgba(18,30,50,0.17)]`}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);


/* Compact product list shown inside Return / Cancel / Withdraw modals */
export const OrderLinesPreview = ({ lines }: { lines: OrderLineItem[] }) => (
  <div className="mb-4 max-h-44 space-y-2 overflow-y-auto">
    {lines.map((line) => (
      <div
        key={line.line_id}
        className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-2.5"
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
          {line.primary_image ? (
            <Image
              src={line.primary_image}
              alt={line.product_name || "Product"}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-4 w-4 text-[#999999]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-[#171717]">
            {line.product_name}
          </p>
          <p className="mt-0.5 text-[10px] text-black">Qty: {line.quantity}</p>
        </div>
      </div>
    ))}
  </div>
);


/* ========================================================================== */
/* IMAGE GALLERY                                                              */
/* ========================================================================== */

export interface OrderImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}


/* ========================================================================== */
/* TRACKING MODAL                                                             */
/* ========================================================================== */

export interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  tracking: IndiaPostOrderTrackingData | null;
  loading: boolean;
  loadFailed: boolean;
  loadErrorMessage?: string | null;
  onRefresh: () => void;
}


export type TimelineKey = keyof OrderLineItem["timeline"];


export const TRACKING_STEPS: Array<{
  key: TimelineKey;
  label: string;
  icon: any;
  group: "forward" | "return";
}> = [
    { key: "order_placed", label: "Order Placed", icon: Check, group: "forward" },
    {
      key: "order_confirmed",
      label: "Order Confirmed",
      icon: Check,
      group: "forward",
    },
    {
      key: "dispatched_at",
      label: "Dispatched",
      icon: Package,
      group: "forward",
    },
    { key: "shipped_at", label: "Shipped", icon: Truck, group: "forward" },
    { key: "delivered_at", label: "Delivered", icon: Package, group: "forward" },
    {
      key: "return_requested_at",
      label: "Return Requested",
      icon: Undo2,
      group: "return",
    },
    {
      key: "return_approved_at",
      label: "Return Approved",
      icon: Check,
      group: "return",
    },
    {
      key: "return_rejected_at",
      label: "Return Rejected",
      icon: AlertCircle,
      group: "return",
    },
    {
      key: "return_completed_at",
      label: "Refund Processed",
      icon: RefreshCcw,
      group: "return",
    },
  ];


export const indiaPostEventLabel = (raw: string) => {
  const name = String(raw || "").toLowerCase();
  if (
    name.includes("delivered(returned to sender)") ||
    name.includes("returned to sender")
  )
    return "Returned to sender";
  if (name.includes("delivered(addressee)")) return "Delivered successfully";
  if (name.includes("taken out for delivery")) return "Out for delivery";
  if (name.includes("item dispatched")) return "In transit";
  if (name.includes("item booked")) return "Shipment booked";
  if (name.includes("picked up") || name.includes("pickedup"))
    return "Picked up by India Post";
  if (name.includes("kept on hold")) return "Shipment on hold";
  return raw || "Shipment update";
};


export const formatIndiaPostTime = (value: string | null | undefined) => {
  if (!value) return "Time not available";
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(" ", "T") + "+05:30"
    : value;
  const time = new Date(iso);
  if (Number.isNaN(time.getTime())) return value;
  return time.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


/* ========================================================================== */
/* COMPLETE ORDER PRICE, TAX, PAYMENT & REFUND BREAKDOWN                     */
/* ========================================================================== */

export interface BreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  allOrders?: OrderLineItem[];
}


export const moneyValue = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const hasAmount = (v: unknown) => v !== undefined && v !== null && v !== "";

export const showMoney = (v: unknown) =>
  hasAmount(v) ? formatCurrency(moneyValue(v)) : "—";


export function BreakupRow({
  label,
  value,
  emphasized = false,
  negative = false,
}: {
  label: string;
  value: React.ReactNode;
  emphasized?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-start justify-between gap-4 py-2.5 ${emphasized ? "border-t border-[#E5E9EF] pt-3.5" : ""}`}
    >
      <span
        className={`text-[12px] leading-5 ${emphasized ? "font-semibold text-[#151D2E]" : "text-[#697386]"}`}
      >
        {label}
      </span>
      <span
        className={`min-w-0 break-all text-right text-[12px] leading-5 tabular-nums ${emphasized ? "font-bold text-[#151D2E]" : negative ? "font-semibold text-[#A35436]" : "font-semibold text-[#263247]"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function BreakupPanel({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E9F0] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div className="border-b border-[#EDF0F4] px-4 py-3.5 sm:px-5">
        <h4 className="text-[13px] font-bold tracking-[-0.01em] text-[#192235]">
          {title}
        </h4>
        {description && (
          <p className="mt-0.5 text-[10.5px] leading-4 text-[#8992A2]">
            {description}
          </p>
        )}
      </div>
      <div className="px-4 py-1 sm:px-5">{children}</div>
    </section>
  );
}


/* ========================================================================== */
/* REVIEW MODAL                                                               */
/* ========================================================================== */

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (reviewData: any) => Promise<void>;
  isLoading?: boolean;
}


/* ========================================================================== */
/* VIEW REVIEW MODAL                                                          */
/* ========================================================================== */

export interface ViewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}


/* ========================================================================== */
/* RETURN MODAL (whole order)                                                 */
/* ========================================================================== */

export interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: OrderLineItem[];
  reference: string;
  onSubmit: (data: {
    reason: string;
    images: File[];
    return_method: ReturnMethod;
    courier?: string;
    tracking_id?: string;
  }) => Promise<void>;
  isUploading?: boolean;
}


/* ========================================================================== */
/* CANCEL MODAL (whole order)                                                 */
/* ========================================================================== */

export interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: OrderLineItem[];
  reference: string;
  onSubmit: (reason: string) => Promise<void>;
  isUploading?: boolean;
}


/* ========================================================================== */
/* CANCEL RETURN MODAL (whole order)                                          */
/* ========================================================================== */

export interface CancelReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: OrderLineItem[];
  reference: string;
  onSubmit: () => Promise<void>;
  isUploading?: boolean;
}


/* ========================================================================== */
/* WITHDRAW CANCEL MODAL (whole order)                                        */
/* ========================================================================== */

export interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: OrderLineItem[];
  reference: string;
  title: string;
  message: string;
  onSubmit: () => Promise<void>;
  isUploading?: boolean;
}


/* ========================================================================== */
/* ACTION DROPDOWN (three-dot menu, per product): Track / Invoice / Review    */
/* ========================================================================== */

export interface ActionDropdownProps {
  order: OrderLineItem;
  onReview: () => void;
  onViewReview: () => void;
  onTrack: () => void;
  onInvoiceDownload: () => void;
  isInvoiceLoading?: boolean;
}


/* ========================================================================== */
/* ORDER ACTION DROPDOWN (three-dot menu on ORDER header)                     */
/* ========================================================================== */

export interface OrderActionDropdownProps {
  group: OrderGroup;
  onReturn: () => void;
  onCancel: () => void;
  onWithdrawReturn: () => void;
  onWithdrawCancel: () => void;
}


/* ========================================================================== */
/* ORDER ITEM ROW (one product inside an order)                               */
/* ========================================================================== */

export interface OrderItemRowProps {
  order: OrderLineItem;
  onProductClick: () => void;
  onTrack: () => void;
  onReview: () => void;
  onViewReview: () => void;
  onInvoiceDownload: () => void;
  isInvoiceLoading?: boolean;
}


/* ========================================================================== */
/* ORDER GROUP CARD (one order → all of its products inside)                  */
/* ========================================================================== */

export interface OrderGroupCardProps {
  group: OrderGroup;
  isOpen: boolean;
  onToggle: () => void;
  onProductClick: (order: OrderLineItem) => void;
  onTrack: (order: OrderLineItem) => void;
  onViewBreakup: (order: OrderLineItem) => void;
  onReview: (order: OrderLineItem) => void;
  onViewReview: (order: OrderLineItem) => void;
  onReturnOrder: (group: OrderGroup) => void;
  onCancelOrder: (group: OrderGroup) => void;
  onWithdrawReturnOrder: (group: OrderGroup) => void;
  onWithdrawCancelOrder: (group: OrderGroup) => void;
  onInvoiceDownload: (order: OrderLineItem) => void;
  invoiceLoadingLines: Record<number, boolean>;
  now: number;
  retryingReference: string | null;
  onRetry: (order: OrderLineItem) => void;
}
