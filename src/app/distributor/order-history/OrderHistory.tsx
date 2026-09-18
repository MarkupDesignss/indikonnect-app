"use client";

import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useAddRatingReviewMutation,
  useCancelReturnMutation,
  useWithdrawCancelOrderMutation,
  useWithdrawCancelRequestMutation,
} from "@/lib/redux/api/order/orderApi";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Star,
  Package,
  RotateCcw,
  AlertCircle,
  Check,
  Loader2,
  MoreVertical,
  Coins,
  Truck,
  MapPin,
  Clock,
  Undo2,
  Camera,
  RefreshCcw,
} from "lucide-react";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";

import { createPortal } from "react-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Image from "next/image";

import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { LuReceiptIndianRupee } from "react-icons/lu";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

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
  reason?: string;
  image_paths?: string[];
  image_urls?: string[];
  return_status?: string;
}

interface ReturnRecord {
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
  product_code: string;

  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  final_amount?: number;
  delivery_charges?: number;

  commissionable_volume: number;

  delivery_status: string;
  return_status: string;
  returned_quantity: number;
  available_for_return: number;
  is_returnable: boolean;

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
  gateway_transaction_id: string;
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

interface ApiStatusOption {
  value: string;
  label: string;
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";
const RED = "#DC2626";

const STATUS_STYLES: Record<
  string,
  {
    color: string;
    bg: string;
  }
> = {
  confirmed: {
    color: INDIGO,
    bg: "#eceffb",
  },
  delivered: {
    color: EMERALD,
    bg: "#eaf7f0",
  },
  pending: {
    color: BRASS,
    bg: "#f8f1e4",
  },
  processing: {
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  shipped: {
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  dispatched: {
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  cancelled: {
    color: RED,
    bg: "#fef2f2",
  },
  returned: {
    color: "#ea580c",
    bg: "#fff7ed",
  },
  partial_returned: {
    color: "#ea580c",
    bg: "#fff7ed",
  },
  refunded: {
    color: "#ea580c",
    bg: "#fff7ed",
  },
  cancel_pending: {
    color: "#A9711F",
    bg: "#FBF3E4",
  },
  return_pending: {
    color: "#EA580C",
    bg: "#FFF7ED",
  },
  return_rejected: {
    color: RED,
    bg: "#FEF2F2",
  },
  partial_delivered: {
    color: "#3955A6",
    bg: "#eceffb",
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

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function formatCurrency(
  value: number | string | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "Rs. 0.00";
  }

  const num =
    typeof value === "number"
      ? value
      : parseFloat(String(value));

  if (!Number.isFinite(num)) {
    return "Rs. 0.00";
  }

  return `Rs. ${num.toFixed(2)}`;
}

function parseDate(
  dateStr: string | null | undefined,
): Date | null {
  if (!dateStr) return null;

  try {
    let normalized = String(dateStr).trim();

    if (
      normalized.includes(" ") &&
      !normalized.includes("T")
    ) {
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

function formatDate(
  dateStr: string | null | undefined,
) {
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

function normalizeStatus(
  status?: string | null,
) {
  if (!status) return "";

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatStatusLabel(
  status?: string | null,
) {
  if (!status) {
    return "—";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

/* -------------------------------------------------------------------------- */
/* API STATUS EXTRACTION                                                      */
/* -------------------------------------------------------------------------- */

function normalizeApiStatusOption(
  item: any,
): ApiStatusOption | null {
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
      item.value ??
      item.status ??
      item.key ??
      item.code ??
      item.name;

    const rawLabel =
      item.label ??
      item.title ??
      item.name ??
      rawValue;

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

function extractStatusOptionsFromApi(
  apiData: any,
): ApiStatusOption[] {
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
      .filter(
        (item): item is ApiStatusOption =>
          !!item,
      );

    if (normalized.length > 0) {
      const unique = new Map<
        string,
        ApiStatusOption
      >();

      normalized.forEach((item) => {
        unique.set(item.value, item);
      });

      return Array.from(unique.values());
    }
  }

  return [];
}

function getOrderStatusValue(
  order: OrderLineItem,
) {
  const deliveryStatus =
    normalizeStatus(order.delivery_status);

  const orderStatus =
    normalizeStatus(order.order_status);

  return (
    deliveryStatus ||
    orderStatus ||
    ""
  );
}

function getOrderStatusBadge(
  order: OrderLineItem,
) {
  const status = getOrderStatusValue(order);

  const fallback =
    STATUS_STYLES[status] ?? {
      color: "#667085",
      bg: "#f2f4f7",
    };

  return {
    value: status,
    label: status
      ? formatStatusLabel(status)
      : "—",
    color: fallback.color,
    bg: fallback.bg,
  };
}

/* -------------------------------------------------------------------------- */
/* ACTIVE (NON-TERMINAL) RETURN STATUSES                                      */
/* -------------------------------------------------------------------------- */

const ACTIVE_RETURN_STATUSES = [
  "requested",
  "pending",
  "approved",
  "initiated",
];

const TERMINAL_RETURN_STATUSES = [
  "cancelled",
  "rejected",
  "completed",
  "refunded",
  "returned",
  "closed",
];

/* -------------------------------------------------------------------------- */
/* RETURN HELPERS                                                              */
/* -------------------------------------------------------------------------- */

function findReturnForLine(
  order: OrderLineItem,
) {
  const returns = order.returns || [];

  // Prefer the most recent return for this line (highest id)
  const matches: Array<{
    returnObj: ReturnRecord;
    item: ReturnItem;
  }> = [];

  for (const ret of returns) {
    const items = ret?.items || [];

    const match = items.find(
      (it) =>
        Number(it.order_line_id) ===
        Number(order.line_id),
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

  matches.sort(
    (a, b) =>
      Number(b.returnObj.id) -
      Number(a.returnObj.id),
  );

  return matches[0];
}

/**
 * Find an ACTIVE return for this line (pending/requested/approved/initiated).
 * Cancelled/rejected/completed returns are ignored.
 */
function findActiveReturnForLine(
  order: OrderLineItem,
) {
  const returns = order.returns || [];

  const matches: Array<{
    returnObj: ReturnRecord;
    item: ReturnItem;
  }> = [];

  for (const ret of returns) {
    const retStatus = normalizeStatus(ret.status);

    if (
      !ACTIVE_RETURN_STATUSES.includes(retStatus)
    ) {
      continue;
    }

    const items = ret?.items || [];

    const match = items.find(
      (it) =>
        Number(it.order_line_id) ===
        Number(order.line_id),
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

  matches.sort(
    (a, b) =>
      Number(b.returnObj.id) -
      Number(a.returnObj.id),
  );

  return matches[0];
}

function getReturnType(
  order: OrderLineItem,
) {
  const found = findReturnForLine(order);

  if (!found) {
    return null;
  }

  const type = normalizeStatus(
    found.returnObj?.type,
  );

  return type || null;
}

/**
 * Get the return status to display. Prefers return-level status when it's
 * terminal; otherwise falls back to item status.
 */
function getReturnStatus(
  order: OrderLineItem,
) {
  const found = findReturnForLine(order);

  if (!found) {
    return null;
  }

  const returnStatus = normalizeStatus(
    found.returnObj?.status,
  );

  if (
    TERMINAL_RETURN_STATUSES.includes(returnStatus)
  ) {
    return returnStatus;
  }

  const itemStatus = normalizeStatus(
    found.item?.return_status,
  );

  return itemStatus || returnStatus || null;
}

/**
 * Only returns true if THIS specific order line has a completed/refunded
 * return attached to it.
 */
function isReturnCompleted(
  order: OrderLineItem,
): boolean {
  const deliveryStatus = normalizeStatus(
    order.delivery_status,
  );

  const returnStatus = normalizeStatus(
    order.return_status,
  );

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

  const status = normalizeStatus(
    found.returnObj?.status,
  );

  const refundStatus = normalizeStatus(
    found.returnObj?.refund_status,
  );

  if (
    status === "completed" ||
    status === "refunded" ||
    status === "returned" ||
    status === "closed"
  ) {
    return true;
  }

  if (
    refundStatus === "completed" ||
    refundStatus === "processed"
  ) {
    return true;
  }

  return false;
}

function getDeliveryStatusBadge(
  order: OrderLineItem,
) {
  const deliveryStatus =
    normalizeStatus(order.delivery_status);

  const fallback =
    STATUS_STYLES[deliveryStatus] ?? {
      color: "#667085",
      bg: "#f2f4f7",
    };

  return {
    label: deliveryStatus
      ? formatStatusLabel(
        deliveryStatus,
      )
      : "—",
    color: fallback.color,
    bg: fallback.bg,
  };
}

function getReturnStatusBadge(
  order: OrderLineItem,
) {
  const returnType =
    getReturnType(order);

  const returnStatus =
    getReturnStatus(order);

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

  if (
    returnStatus === "completed" ||
    returnStatus === "refunded"
  ) {
    color = EMERALD;
    bg = "#eaf7f0";
  }

  if (
    returnStatus === "rejected" ||
    returnStatus === "cancelled"
  ) {
    color = RED;
    bg = "#FEF2F2";
  }

  if (
    returnStatus === "pending" ||
    returnStatus === "requested" ||
    returnStatus === "approved" ||
    returnStatus === "initiated"
  ) {
    color =
      returnType === "buyback"
        ? "#B8935A"
        : "#A9711F";

    bg =
      returnType === "buyback"
        ? "#FBF3E4"
        : "#f8f1e4";
  }

  return {
    label: `${typeLabel} • ${returnStatus.replace(
      /_/g,
      " ",
    )}`,
    color,
    bg,
  };
}

function isReturnWindowOpen(
  returnApplicableTill:
    | string
    | null
    | undefined,
) {
  if (!returnApplicableTill) {
    return false;
  }

  const deadline =
    parseDate(returnApplicableTill);

  if (!deadline) {
    return false;
  }

  return deadline.getTime() > Date.now();
}

function getReturnWindowInfo(
  order: OrderLineItem,
) {
  const till =
    order.timeline?.return_applicable_till;

  if (!till) {
    return null;
  }

  const deadline = parseDate(till);

  if (!deadline) {
    return null;
  }

  const completed =
    isReturnCompleted(order);

  if (completed) {
    return {
      state: "completed" as const,
      deadline,
      label: "Return Completed",
    };
  }

  const open =
    deadline.getTime() > Date.now();

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

/**
 * FIXED: Return button should show when:
 *   - delivery_status === "delivered"
 *   - No ACTIVE return exists for this line
 *   - Not already completed/refunded
 *   - Return window is open (or no window set)
 *   - is_returnable !== false and available_for_return > 0
 *
 * Stale item-level "pending" status inside a cancelled return is IGNORED.
 */
function canInitiateReturn(
  order: OrderLineItem,
): boolean {
  const deliveryStatus =
    normalizeStatus(order.delivery_status);

  // Must be delivered at the line level
  if (deliveryStatus !== "delivered") {
    return false;
  }

  // Blocked line-level delivery statuses
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

  // If line-level return_status indicates a terminal state, block
  const lineReturnStatus = normalizeStatus(
    order.return_status,
  );

  if (
    lineReturnStatus === "returned" ||
    lineReturnStatus === "completed"
  ) {
    return false;
  }

  // If return is already completed for this line, block
  if (isReturnCompleted(order)) {
    return false;
  }

  // If there's an ACTIVE (pending/requested/approved/initiated) return
  // for this line, block new returns
  const activeReturn =
    findActiveReturnForLine(order);

  if (activeReturn) {
    return false;
  }

  // Explicitly non-returnable
  if (order.is_returnable === false) {
    return false;
  }

  // No quantity left to return
  if (
    order.available_for_return !== undefined &&
    order.available_for_return !== null &&
    Number(order.available_for_return) <= 0
  ) {
    return false;
  }

  // Return window expired
  const till =
    order.timeline?.return_applicable_till;

  if (till) {
    const deadline = parseDate(till);

    if (
      deadline &&
      deadline.getTime() <= Date.now()
    ) {
      return false;
    }
  }

  return true;
}

function findCancellableReturn(
  order: OrderLineItem,
) {
  const till =
    order.timeline?.return_applicable_till;

  if (!isReturnWindowOpen(till)) {
    return null;
  }

  if (isReturnCompleted(order)) {
    return null;
  }

  const activeReturn =
    findActiveReturnForLine(order);

  if (!activeReturn) {
    return null;
  }

  return {
    returnId: activeReturn.returnObj.id,
  };
}

function canCancelOrder(
  order: OrderLineItem,
) {
  const deliveryStatus =
    normalizeStatus(order.delivery_status);

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

  return [
    "pending",
    "confirmed",
    "processing",
  ].includes(deliveryStatus);
}

/* -------------------------------------------------------------------------- */
/* FIXED: Withdraw Cancel Order                                                */
/* Only when delivery_status is explicitly "cancel_pending"                    */
/* -------------------------------------------------------------------------- */

function canWithdrawCancelOrder(
  order: OrderLineItem,
): boolean {
  const deliveryStatus =
    normalizeStatus(order.delivery_status);

  return deliveryStatus === "cancel_pending";
}

/* -------------------------------------------------------------------------- */
/* FIXED: Withdraw Return Request                                              */
/* Shows when there's an ACTIVE return (pending/requested/approved/initiated)  */
/* for this line. Cancelled returns are ignored.                                */
/* -------------------------------------------------------------------------- */

function canWithdrawReturnRequest(
  order: OrderLineItem,
): boolean {
  const activeReturn =
    findActiveReturnForLine(order);

  return !!activeReturn;
}

function getRefundDetails(
  order: OrderLineItem,
) {
  const found =
    findReturnForLine(order);

  const deliveryStatus =
    normalizeStatus(order.delivery_status);

  const isRefunded =
    deliveryStatus === "refunded" ||
    deliveryStatus === "returned" ||
    deliveryStatus ===
    "buyback_refunded" ||
    isReturnCompleted(order);

  if (!found || !isRefunded) {
    return null;
  }

  const creditNotes =
    order.credit_notes || [];

  const matchingCreditNote =
    creditNotes.find(
      (note) =>
        note &&
        note.amount !== null &&
        note.amount !== undefined &&
        note.amount !== "",
    );

  if (matchingCreditNote) {
    const amount =
      typeof matchingCreditNote.amount ===
        "number"
        ? matchingCreditNote.amount
        : parseFloat(
          String(
            matchingCreditNote.amount,
          ),
        );

    return {
      amount: Number.isFinite(amount)
        ? amount
        : null,
      creditNoteNumber:
        matchingCreditNote.credit_note_number ||
        null,
      issuedAt:
        matchingCreditNote.issued_at ||
        null,
      status:
        matchingCreditNote.status ||
        "processed",
    };
  }

  const fallbackAmount =
    found.returnObj?.total_refund_amount;

  if (
    fallbackAmount !== null &&
    fallbackAmount !== undefined
  ) {
    const amount =
      typeof fallbackAmount ===
        "number"
        ? fallbackAmount
        : parseFloat(
          String(fallbackAmount),
        );

    return {
      amount: Number.isFinite(amount)
        ? amount
        : null,
      creditNoteNumber: null,
      issuedAt:
        found.returnObj
          ?.refund_processed_at || null,
      status:
        found.returnObj
          ?.refund_status || "processed",
    };
  }

  return null;
}

/* ========================================================================== */
/* MODAL SHELL                                                                */
/* ========================================================================== */

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
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
        transition={{ duration: 0.2 }}
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]`}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ========================================================================== */
/* IMAGE GALLERY                                                              */
/* ========================================================================== */

interface OrderImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

const OrderImageGallery = ({
  isOpen,
  onClose,
  order,
}: OrderImageGalleryProps) => {
  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [
    isOpen,
    order?.order_id,
    order?.line_id,
  ]);

  if (!isOpen || !order) {
    return null;
  }

  const images = (order.images || [])
    .filter(
      (image) => !!image?.image_url,
    )
    .sort(
      (a, b) =>
        Number(b.is_primary) -
        Number(a.is_primary),
    );

  if (
    images.length === 0 &&
    order.primary_image
  ) {
    images.push({
      id: -1,
      image_url: order.primary_image,
      is_primary: true,
    });
  }

  if (images.length === 0) {
    return (
      <ModalShell
        onClose={onClose}
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
          <h3 className="text-[15px] font-semibold text-[#171717]">
            Product Images
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-[220px] items-center justify-center px-5 py-8 text-center">
          <p className="text-[12px] text-[#999999]">
            No product images available.
          </p>
        </div>
      </ModalShell>
    );
  }

  const activeImage =
    images[activeIndex] ||
    images[0];

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-[#171717]">
            {order.product_name}
          </h3>

          <p className="mt-0.5 text-[10px] text-[#888888]">
            {order.order_reference}
            {" • "}
            {images.length} image
            {images.length > 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 px-5 py-4">
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-[#F8F8F7] sm:min-h-[430px]">
          <Image
            src={activeImage.image_url}
            alt={
              order.product_name ||
              "Product image"
            }
            fill
            sizes="(max-width: 640px) 90vw, 620px"
            className="object-contain p-4 sm:p-6"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    (prev) =>
                      prev === 0
                        ? images.length - 1
                        : prev - 1,
                  )
                }
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex(
                    (prev) =>
                      prev ===
                        images.length - 1
                        ? 0
                        : prev + 1,
                  )
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map(
              (image, index) => (
                <button
                  type="button"
                  key={
                    image.id ||
                    `${image.image_url}-${index}`
                  }
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[7px] border bg-white transition ${activeIndex === index
                    ? "border-[#0E1B3D] ring-2 ring-[#0E1B3D]/10"
                    : "border-[#E4E4E2] hover:border-[#BDBDBA]"
                    }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`${order.product_name} ${index + 1
                      }`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* TRACKING MODAL                                                             */
/* ========================================================================== */

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

type TimelineKey =
  keyof OrderLineItem["timeline"];

const TRACKING_STEPS: Array<{
  key: TimelineKey;
  label: string;
  icon: any;
  group: "forward" | "return";
}> = [
    {
      key: "order_placed",
      label: "Order Placed",
      icon: Check,
      group: "forward",
    },
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
    {
      key: "shipped_at",
      label: "Shipped",
      icon: Truck,
      group: "forward",
    },
    {
      key: "delivered_at",
      label: "Delivered",
      icon: Package,
      group: "forward",
    },
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

const TrackingModal = ({
  isOpen,
  onClose,
  order,
}: TrackingModalProps) => {
  if (!isOpen || !order) {
    return null;
  }

  const timeline =
    order.timeline ||
    ({} as OrderLineItem["timeline"]);

  const steps =
    TRACKING_STEPS.filter(
      (step) =>
        !!timeline[step.key],
    );

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#eaf7f0]">
            <Truck
              className="h-4 w-4"
              style={{ color: EMERALD }}
            />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Track Order
            </h3>

            <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
              {order.order_reference}

              {order.line_id && (
                <span className="ml-1 text-[#AAAAAA]">
                  • Item #{order.line_id}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {timeline.cancelled_at && (
          <div className="mb-5 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

            <div className="text-[11px] leading-4 text-[#B24C4C]">
              <p className="font-semibold">
                Order Cancelled
              </p>

              <p className="mt-0.5">
                {formatDate(
                  timeline.cancelled_at,
                )}
              </p>
            </div>
          </div>
        )}

        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="h-8 w-8 text-[#CCCCCC]" />

            <p className="mt-3 text-[12px] text-[#999999]">
              Tracking details will
              appear here once your
              order is processed.
            </p>
          </div>
        ) : (
          <div>
            {steps.map((step, i) => {
              const isLast =
                i === steps.length - 1;

              const isRejected =
                step.key ===
                "return_rejected_at";

              const dotColor =
                isRejected
                  ? RED
                  : step.group ===
                    "return"
                    ? BRASS
                    : EMERALD;

              const dotBg =
                isRejected
                  ? "#FEF2F2"
                  : step.group ===
                    "return"
                    ? "#F8F1E4"
                    : "#eaf7f0";

              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`relative pl-11 ${isLast
                    ? ""
                    : "pb-7"
                    }`}
                >
                  {!isLast && (
                    <div
                      className="absolute left-[15px] top-8 w-[2px] rounded-full"
                      style={{
                        height:
                          "calc(100% - 1.75rem)",
                        backgroundColor:
                          "#E4E4E2",
                      }}
                    />
                  )}

                  <div
                    className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                    style={{
                      backgroundColor:
                        dotBg,
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{
                        color: dotColor,
                      }}
                    />
                  </div>

                  <div className="pt-0.5">
                    <p className="text-[12.5px] font-semibold text-[#171717]">
                      {step.label}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      {formatDate(
                        timeline[
                        step.key
                        ],
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};


interface BreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  allOrders?: OrderLineItem[];
}

const OrderBreakupModal = ({
  isOpen,
  onClose,
  order,
  allOrders = [],
}: BreakupModalProps) => {
  const orderLines = useMemo(() => {
    if (!order) {
      return [];
    }

    const lines = allOrders.filter(
      (item) =>
        Number(item.order_id) ===
        Number(order.order_id),
    );

    const fallback =
      lines.length > 0 ? lines : [order];

    return [...fallback].sort(
      (a, b) =>
        Number(a.line_id) - Number(b.line_id),
    );
  }, [allOrders, order]);

  if (!isOpen || !order) {
    return null;
  }

  const orderSummary = orderLines[0] || order;

  /**
   * SUBTOTAL = sum of every line's `line_total`
   * (line_total already includes GST + any per-line charges the API sends).
   */
  const subtotal = orderLines.reduce(
    (sum, line) =>
      sum + (Number(line.line_total) || 0),
    0,
  );

  const shipping = Number(
    orderSummary.shipping_charge ??
      orderLines.reduce(
        (sum, line) =>
          sum +
          (Number(line.delivery_charges) || 0),
        0,
      ),
  );

  const totalPayable = Number(
    orderSummary.total_payable ??
      orderSummary.final_amount ??
      orderSummary.amount_paid ??
      orderLines.reduce(
        (sum, line) =>
          sum +
          (Number(
            line.final_amount ?? line.line_total,
          ) || 0),
        0,
      ),
  );

  const coinRedeemed = Number(
    orderSummary.coin_redeemed ?? 0,
  );

  const coinRedeemedAmount = Number(
    orderSummary.coin_redeemed_amount ?? 0,
  );

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#f8f1e4]">
            <LuReceiptIndianRupee
              className="h-4 w-4"
              style={{ color: BRASS }}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-[#171717] sm:text-[15px]">
              Price Breakup
            </h3>

            <p className="mt-0.5 truncate text-[10px] text-[#888888]">
              {order.order_reference}
              {" • "}
              {orderLines.length} item
              {orderLines.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] hover:bg-[#f7f8fa]"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* BODY */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafbfc] px-4 py-4 sm:px-5">
        {/* ITEMS SUMMARY */}
        <div className="mb-3 overflow-hidden rounded-[10px] border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="border-b border-[#edf0f3] px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a92a6]">
              Items
            </p>
          </div>

          <div className="divide-y divide-[#f0f2f5]">
            {orderLines.map((line) => (
              <div
                key={`${line.order_id}-${line.line_id}`}
                className="flex items-center gap-3 px-3.5 py-3"
              >
                {/* Image */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[7px] border border-[#E4E4E2] bg-white">
                  {line.primary_image ? (
                    <Image
                      src={line.primary_image}
                      alt={line.product_name || "Product"}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Package className="h-4 w-4 text-[#999999]" />
                    </span>
                  )}
                </div>

                {/* Name + Qty */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#101828]">
                    {line.product_name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-[#98a2b3]">
                    Qty: {line.quantity}
                    {line.item_reference_id && (
                      <>
                        {" • "}
                        {line.item_reference_id}
                      </>
                    )}
                  </p>
                </div>

                {/* Line Total */}
                <div className="shrink-0 text-right">
                  <p className="text-[12.5px] font-bold text-[#0E1B3D]">
                    {formatCurrency(
                      line.line_total,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="overflow-hidden rounded-[10px] border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="border-b border-[#edf0f3] px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a92a6]">
              Payment Summary
            </p>
          </div>

          <div className="px-3.5 py-1">
            {/* Subtotal = sum of all line_totals */}
            <div className="flex items-center justify-between border-b border-[#f0f2f5] py-2.5">
              <span className="text-[11.5px] text-[#667085]">
                Subtotal
              </span>
              <span className="text-[12.5px] font-semibold text-[#101828]">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between border-b border-[#f0f2f5] py-2.5">
              <span className="text-[11.5px] text-[#667085]">
                Shipping
              </span>
              <span className="text-[12.5px] font-semibold text-[#101828]">
                {formatCurrency(shipping)}
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center justify-between border-b border-[#f0f2f5] py-2.5">
              <div className="flex items-center gap-1.5">
                <Coins size={12} className="text-[#1F7A56]" />
                <span className="text-[11.5px] text-[#667085]">
                  Coins Redeemed
                </span>
              </div>

              <span className="text-[12px] font-semibold text-[#1F7A56]">
                {coinRedeemed} coins
                {coinRedeemedAmount > 0 && (
                  <span className="ml-1 text-[10.5px] font-normal text-[#98a2b3]">
                    ({formatCurrency(coinRedeemedAmount)})
                  </span>
                )}
              </span>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between rounded-[8px] bg-[#f6fbf7] px-3 py-3 my-2">
              <span className="text-[12px] font-bold text-[#1F7A56]">
                Total Payable
              </span>
              <span className="text-[16px] font-extrabold text-[#1F7A56]">
                {formatCurrency(totalPayable)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
/* ========================================================================== */
/* REVIEW MODAL                                                               */
/* ========================================================================== */

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (
    reviewData: any,
  ) => Promise<void>;
  isLoading?: boolean;
}

const ReviewModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isLoading,
}: ReviewModalProps) => {
  const [rating, setRating] =
    useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [images, setImages] = useState<
    File[]
  >([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) {
      imagePreviews.forEach((url) =>
        URL.revokeObjectURL(url),
      );

      setRating(0);
      setHoverRating(0);
      setReviewText("");
      setImages([]);
      setImagePreviews([]);
      setError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      textareaRef.current
    ) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      e.target.files || [],
    );

    setError("");

    if (!files.length) {
      return;
    }

    if (
      files.length + images.length >
      5
    ) {
      setError(
        "You can upload maximum 5 images.",
      );
      return;
    }

    const oversized = files.filter(
      (file) =>
        file.size > 5 * 1024 * 1024,
    );

    if (oversized.length > 0) {
      setError(
        "Some files exceed the 5MB limit.",
      );
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const invalid = files.filter(
      (file) =>
        !validTypes.includes(
          file.type,
        ),
    );

    if (invalid.length > 0) {
      setError(
        "Only JPG, PNG, GIF, and WEBP formats are allowed.",
      );
      return;
    }

    const previews = files.map(
      (file) =>
        URL.createObjectURL(file),
    );

    setImages((prev) => [
      ...prev,
      ...files,
    ]);

    setImagePreviews((prev) => [
      ...prev,
      ...previews,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const removeImage = (
    index: number,
  ) => {
    const preview =
      imagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImages((prev) =>
      prev.filter(
        (_, i) => i !== index,
      ),
    );

    setImagePreviews((prev) =>
      prev.filter(
        (_, i) => i !== index,
      ),
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (rating === 0) {
      return setError(
        "Please select a rating.",
      );
    }

    if (
      reviewText.trim().length < 10
    ) {
      return setError(
        "Review must be at least 10 characters.",
      );
    }

    if (!order?.line_id) {
      return setError(
        "Order line ID is missing.",
      );
    }

    if (!order?.product_id) {
      return setError(
        "Product ID is missing.",
      );
    }

    if (!order?.order_id) {
      return setError(
        "Order ID is missing.",
      );
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        order_id: order.order_id,
        order_line_id: order.line_id,
        product_id: order.product_id,
        rating,
        review_text:
          reviewText.trim(),
        review:
          reviewText.trim(),
        images,
        order_reference:
          order.order_reference,
        product_name:
          order.product_name,
      });

      setIsSuccess(true);

      setTimeout(
        () => onClose(),
        2000,
      );
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to submit review.",
      );

      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (
    value: number,
  ) =>
  ({
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent!",
  }[value] || "");

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F7F7F6]">
              <Star className="h-4 w-4 fill-[#111111] text-[#111111]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Write a Review
            </h3>
          </div>

          <p className="mt-1 text-[10px] text-[#888888] sm:text-[11px]">
            Order:{" "}
            {order?.order_reference ||
              `#${order?.order_id}`}

            {order?.line_id && (
              <span className="ml-1 text-[#AAAAAA]">
                • Item #{order.line_id}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] disabled:opacity-50"
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
            className="flex min-h-[360px] flex-col items-center justify-center py-10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-[#F1F7F3]">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>

            <h4 className="mt-5 text-[22px] font-semibold text-[#171717]">
              Thank You!
            </h4>

            <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
              Your review for{" "}
              {order?.product_name}
              has been submitted
              successfully.
            </p>
          </motion.div>
        ) : (
          <>
            {order && (
              <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                  {order.primary_image ? (
                    <Image
                      src={
                        order.primary_image
                      }
                      alt={
                        order.product_name
                      }
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
                    Qty:{" "}
                    {order.quantity}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Rating{" "}
                <span className="text-[#B24C4C]">
                  *
                </span>
              </label>

              <div className="flex gap-1">
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onMouseEnter={() =>
                      setHoverRating(
                        star,
                      )
                    }
                    onMouseLeave={() =>
                      setHoverRating(
                        0,
                      )
                    }
                    onClick={() =>
                      setRating(
                        star,
                      )
                    }
                    whileTap={{
                      scale: 0.9,
                    }}
                    className="rounded-[5px] p-1"
                  >
                    <Star
                      className={`h-8 w-8 sm:h-9 sm:w-9 ${star <=
                        (hoverRating ||
                          rating)
                        ? "fill-[#171717] text-[#171717]"
                        : "fill-[#F1F1F0] text-[#D7D7D5]"
                        }`}
                    />
                  </motion.button>
                ))}
              </div>

              <p className="mt-1 text-[11px] font-medium text-[#171717]">
                {rating > 0 ? (
                  getRatingLabel(
                    rating,
                  )
                ) : (
                  <span className="text-[#999999]">
                    Select a rating
                  </span>
                )}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Your Review{" "}
                <span className="text-[#B24C4C]">
                  *
                </span>
              </label>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(
                      e.target.value,
                    )
                  }
                  placeholder="Share your experience with this product..."
                  maxLength={500}
                  disabled={isSubmitting}
                  className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 pr-16 text-[12px] text-[#171717] outline-none placeholder:text-[#999999] focus:border-[#999999]"
                />

                <div className="absolute bottom-3 right-3 text-[10px] text-[#999999]">
                  {reviewText.length}
                  /500
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Add Photos{" "}
                <span className="text-[10px] font-normal normal-case text-[#999999]">
                  (Optional)
                </span>
              </label>

              {imagePreviews.length >
                0 ? (
                <div className="mb-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                  <AnimatePresence>
                    {imagePreviews.map(
                      (
                        preview,
                        index,
                      ) => (
                        <motion.div
                          key={`${preview}-${index}`}
                          initial={{
                            scale: 0.8,
                            opacity: 0,
                          }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                          }}
                          exit={{
                            scale: 0.8,
                            opacity: 0,
                          }}
                          className="group relative"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                            <img
                              src={
                                preview
                              }
                              alt={`Review ${index +
                                1
                                }`}
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index,
                                )
                              }
                              disabled={
                                isSubmitting
                              }
                              className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1.5 text-white opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      ),
                    )}
                  </AnimatePresence>

                  {imagePreviews.length <
                    5 && (
                      <label className="flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9]">
                        <span className="text-[18px] text-[#888888]">
                          +
                        </span>

                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          multiple
                          onChange={
                            handleImageUpload
                          }
                          disabled={
                            isSubmitting
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                </div>
              ) : (
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-4 py-5">
                  <span className="text-[24px] text-[#888888]">
                    📷
                  </span>

                  <p className="text-[11px] font-medium text-[#171717]">
                    Click to upload photos
                  </p>

                  <p className="text-[9px] text-[#999999]">
                    Max 5 images •
                    5MB each
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={
                      handleImageUpload
                    }
                    disabled={
                      isSubmitting
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

                <p className="text-[10px] leading-4 text-[#B24C4C]">
                  {error}
                </p>
              </div>
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
              disabled={
                isSubmitting ||
                isLoading
              }
              className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isLoading ||
                rating === 0 ||
                reviewText.trim()
                  .length < 10
              }
              className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium ${isSubmitting ||
                isLoading ||
                rating === 0 ||
                reviewText.trim()
                  .length < 10
                ? "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
                : "border-[#111111] bg-[#111111] text-white hover:bg-[#292929]"
                }`}
            >
              {isSubmitting ||
                isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* ========================================================================== */
/* VIEW REVIEW MODAL                                                          */
/* ========================================================================== */

interface ViewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

const ViewReviewModal = ({
  isOpen,
  onClose,
  order,
}: ViewReviewModalProps) => {
  if (!isOpen || !order) {
    return null;
  }

  const existingReview =
    order.product_reviews?.find(
      (review: any) =>
        review.order_line_id ===
        order.line_id ||
        review.order_id ===
        order.order_id ||
        review.product_id ===
        order.product_id,
    );

  const rating =
    existingReview?.rating || 0;

  const reviewText =
    existingReview?.review_text ||
    existingReview?.review ||
    "No review text provided.";

  const reviewImages: string[] =
    existingReview?.image_urls ||
    existingReview?.images?.map?.(
      (img: any) =>
        img.image_url || img.url,
    ) ||
    [];

  const getRatingLabel = (
    value: number,
  ) =>
  ({
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent!",
  }[value] || "");

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F8F1E4]">
              <Star className="h-4 w-4 fill-[#B8935A] text-[#B8935A]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Your Review
            </h3>
          </div>

          <p className="mt-1 text-[10px] text-[#888888] sm:text-[11px]">
            Order:{" "}
            {order.order_reference}

            {order.line_id && (
              <span className="ml-1 text-[#AAAAAA]">
                • Item #{order.line_id}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
            {order.primary_image ? (
              <Image
                src={
                  order.primary_image
                }
                alt={
                  order.product_name
                }
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
              Qty:{" "}
              {order.quantity}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Rating
          </label>

          <div className="flex gap-1">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 sm:h-9 sm:w-9 ${star <= rating
                  ? "fill-[#B8935A] text-[#B8935A]"
                  : "fill-[#F1F1F0] text-[#D7D7D5]"
                  }`}
              />
            ))}
          </div>

          <p className="mt-1 text-[11px] font-medium text-[#171717]">
            {rating > 0
              ? getRatingLabel(
                rating,
              )
              : "No rating"}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Your Review
          </label>

          <div className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
            <p className="whitespace-pre-wrap text-[12px] leading-5 text-[#171717]">
              {reviewText}
            </p>
          </div>
        </div>

        {reviewImages.length >
          0 && (
            <div className="mb-2">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Photos
              </label>

              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                {reviewImages.map(
                  (url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]"
                    >
                      <img
                        src={url}
                        alt={`Review ${index +
                          1
                          }`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* RETURN MODAL                                                               */
/* ========================================================================== */

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (data: {
    quantity: number;
    reason: string;
    images: File[];
  }) => Promise<void>;
  isUploading?: boolean;
}

const ReturnModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isUploading,
}: ReturnModalProps) => {
  const [quantity, setQuantity] =
    useState(1);

  const [reason, setReason] =
    useState("");

  const [images, setImages] = useState<
    File[]
  >([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setReason("");
      setImages([]);
      setImagePreviews([]);
      setError("");
      setIsSubmitting(false);
    } else {
      imagePreviews.forEach((url) =>
        URL.revokeObjectURL(url),
      );

      setImagePreviews([]);
      setImages([]);
    }
  }, [isOpen]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      e.target.files || [],
    );

    setError("");

    if (!files.length) {
      return;
    }

    if (
      files.length + images.length >
      5
    ) {
      setError(
        "You can upload maximum 5 images.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    const oversized = files.filter(
      (file) =>
        file.size > 5 * 1024 * 1024,
    );

    if (oversized.length > 0) {
      setError(
        "Some files exceed the 5MB limit.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const invalid = files.filter(
      (file) =>
        !validTypes.includes(
          file.type,
        ),
    );

    if (invalid.length > 0) {
      setError(
        "Only JPG, PNG, GIF, and WEBP formats are allowed.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    const newPreviews = files.map(
      (file) =>
        URL.createObjectURL(file),
    );

    setImages((prev) => [
      ...prev,
      ...files,
    ]);

    setImagePreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const removeImage = (
    index: number,
  ) => {
    const preview =
      imagePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImages((prev) =>
      prev.filter(
        (_, i) => i !== index,
      ),
    );

    setImagePreviews((prev) =>
      prev.filter(
        (_, i) => i !== index,
      ),
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!order) {
      return setError(
        "Order information is missing.",
      );
    }

    if (quantity < 1) {
      return setError(
        "Quantity must be at least 1.",
      );
    }

    if (
      quantity >
      (order.available_for_return ||
        1)
    ) {
      setError(
        `Maximum returnable quantity is ${order.available_for_return}.`,
      );
      return;
    }

    if (
      reason.trim().length < 10
    ) {
      return setError(
        "Please provide a valid reason (min 10 characters).",
      );
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        quantity,
        reason: reason.trim(),
        images,
      });

      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to submit return request.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const maxReturn =
    order?.available_for_return ||
    order?.quantity ||
    1;

  const till =
    order?.timeline
      ?.return_applicable_till;

  const windowInfo = order
    ? getReturnWindowInfo(order)
    : null;

  const reasonLength =
    reason.trim().length;

  const canSubmit =
    !isSubmitting &&
    !isUploading &&
    reasonLength >= 10 &&
    !!order;

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
            <RotateCcw className="h-4 w-4 text-[#EA580C]" />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717]">
              Return Request
            </h3>

            <p className="mt-0.5 text-[9.5px] text-[#999999]">
              Provide the details below
              to request a return.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={
            isSubmitting ||
            isUploading
          }
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-3.5">
        {order && (
          <div className="mb-3 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={
                    order.primary_image
                  }
                  alt={
                    order.product_name ||
                    "Product"
                  }
                  fill
                  sizes="48px"
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
                {order.product_name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#888888]">
                Ordered:{" "}
                {order.quantity}
                {" • "}
                Returnable:{" "}
                {maxReturn}
              </p>
            </div>
          </div>
        )}

        {till &&
          windowInfo && (
            <div
              className={`mb-3 flex items-center gap-1.5 rounded-[6px] border px-3 py-2 text-[10px] font-medium ${windowInfo.state ===
                "open"
                ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                : "border-[#F0CFCF] bg-[#FDF2F2] text-[#B24C4C]"
                }`}
            >
              <Clock size={12} />

              <span>
                {windowInfo.state ===
                  "open"
                  ? "Return window closes on"
                  : "Return window closed on"}{" "}
                <span className="font-semibold">
                  {formatDate(
                    till,
                  )}
                </span>
              </span>
            </div>
          )}

        <div className="mb-3">
          <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Quantity to Return{" "}
            <span className="text-[#B24C4C]">
              *
            </span>
          </label>

          <input
            type="number"
            min={1}
            max={maxReturn}
            value={quantity}
            onChange={(e) => {
              const value =
                Number(
                  e.target.value,
                );

              if (
                !Number.isFinite(
                  value,
                )
              ) {
                return;
              }

              setQuantity(
                Math.min(
                  maxReturn,
                  Math.max(
                    1,
                    value,
                  ),
                ),
              );
            }}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[13px] text-[#171717] outline-none disabled:opacity-60"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]">
              Reason for Return{" "}
              <span className="text-[#B24C4C]">
                *
              </span>
            </label>

            <span
              className={`shrink-0 text-[9px] font-medium ${reasonLength >= 10
                ? "text-[#3F765A]"
                : "text-[#999999]"
                }`}
            >
              {reasonLength}
              /10 min
            </span>
          </div>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value,
              )
            }
            placeholder="Please describe why you want to return this item..."
            maxLength={500}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="h-[82px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-black outline-none placeholder:text-[#AAAAAA] disabled:opacity-60"
          />
        </div>

        <div className="mb-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]">
              Attach Images{" "}
              <span className="text-[10px] font-normal normal-case text-[#999999]">
                (Optional)
              </span>
            </label>

            <span className="text-[9px] text-[#999999]">
              {images.length}
              /5
            </span>
          </div>

          {imagePreviews.length >
            0 ? (
            <div className="grid grid-cols-5 gap-2">
              <AnimatePresence initial={false}>
                {imagePreviews.map(
                  (
                    preview,
                    index,
                  ) => (
                    <motion.div
                      key={`${preview}-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      className="group relative"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                        <img
                          src={
                            preview
                          }
                          alt={`Return image ${index +
                            1
                            }`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index,
                            )
                          }
                          disabled={
                            isSubmitting ||
                            isUploading
                          }
                          className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1 text-white opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>

              {imagePreviews.length <
                5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9]">
                    <Camera className="h-5 w-5 text-[#777777]" />

                    <span className="mt-1 text-[9px] font-medium text-[#777777]">
                      Add
                    </span>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        isSubmitting ||
                        isUploading
                      }
                      className="hidden"
                    />
                  </label>
                )}
            </div>
          ) : (
            <label className="group flex cursor-pointer items-center gap-3 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FFF7ED]">
                <Camera className="h-5 w-5 text-[#EA580C]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#171717]">
                  Click to upload photos
                </p>

                <p className="mt-0.5 text-[9px] text-[#999999]">
                  JPG, PNG, GIF or
                  WEBP • Max 5MB
                  each • Up to 5
                  images
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={
                  handleImageUpload
                }
                disabled={
                  isSubmitting ||
                  isUploading
                }
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-2 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] px-3 py-2"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">
              {error}
            </p>
          </motion.div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium ${canSubmit
              ? "border-[#EA580C] bg-[#EA580C] text-white hover:bg-[#C2410C]"
              : "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
              }`}
          >
            {isSubmitting ||
              isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Submit Return
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* CANCEL MODAL                                                               */
/* ========================================================================== */

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (
    reason: string,
  ) => Promise<void>;
  isUploading?: boolean;
}

const CancelModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isUploading,
}: CancelModalProps) => {
  const [reason, setReason] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (
      reason.trim().length < 10
    ) {
      return setError(
        "Please provide a valid reason (min 10 characters).",
      );
    }

    setIsSubmitting(true);

    try {
      await onSubmit(
        reason.trim(),
      );

      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to cancel order.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FEF2F2]">
            <X className="h-4 w-4 text-[#DC2626]" />
          </div>

          <h3 className="text-[15px] font-semibold text-[#171717]">
            Cancel Order
          </h3>
        </div>

        <button
          onClick={onClose}
          disabled={
            isSubmitting ||
            isUploading
          }
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
          <p className="text-[11px] leading-4 text-[#B24C4C]">
            <strong>Warning:</strong>{" "}
            This action cannot be
            undone. The order will
            be cancelled immediately.
          </p>
        </div>

        {order && (
          <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={
                    order.primary_image
                  }
                  alt={
                    order.product_name
                  }
                  fill
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
                {order.product_name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#888888]">
                Order #
                {
                  order.order_reference
                }
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Reason for Cancellation{" "}
            <span className="text-[#B24C4C]">
              *
            </span>
          </label>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value,
              )
            }
            placeholder="Please tell us why you want to cancel..."
            maxLength={500}
            disabled={isSubmitting}
            className="min-h-[100px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 text-[12px] text-black outline-none focus:border-[#999999]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ||
              isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                Cancel request
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* CANCEL RETURN MODAL                                                        */
/* ========================================================================== */

interface CancelReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  returnId: number | null;
  onSubmit: () => Promise<void>;
  isUploading?: boolean;
}

const CancelReturnModal = ({
  isOpen,
  onClose,
  order,
  returnId,
  onSubmit,
  isUploading,
}: CancelReturnModalProps) => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (!returnId) {
      setError(
        "Return ID is missing.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to cancel return request.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const till =
    order?.timeline
      ?.return_applicable_till;

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FEF2F2]">
            <X className="h-4 w-4 text-[#DC2626]" />
          </div>

          <h3 className="text-[15px] font-semibold text-[#171717]">
            Cancel Return Request
          </h3>
        </div>

        <button
          onClick={onClose}
          disabled={
            isSubmitting ||
            isUploading
          }
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
          <p className="text-[11px] leading-4 text-[#B24C4C]">
            <strong>Warning:</strong>{" "}
            This will permanently
            cancel your return request
            for this item.
          </p>
        </div>

        {order && (
          <div className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={
                    order.primary_image
                  }
                  alt={
                    order.product_name
                  }
                  fill
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
                {order.product_name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#888888]">
                Order #
                {
                  order.order_reference
                }

                {returnId && (
                  <span className="ml-1 text-[#AAAAAA]">
                    • Return #
                    {returnId}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {till && (
          <div className="mt-3 flex items-center gap-1.5 rounded-[6px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[10.5px] font-medium text-[#B45309]">
            <Clock size={12} />

            <span>
              Return window closes on{" "}
              <span className="font-semibold">
                {formatDate(till)}
              </span>
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Keep Request
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ||
              isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                Confirm Cancel
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* WITHDRAW MODAL                                                             */
/* ========================================================================== */

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  title: string;
  message: string;
  onSubmit: () => Promise<void>;
  isUploading?: boolean;
}

const WithdrawModal = ({
  isOpen,
  onClose,
  order,
  title,
  message,
  onSubmit,
  isUploading,
}: WithdrawModalProps) => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to withdraw request.",
      );

      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFFBEB]">
            <Undo2 className="h-4 w-4 text-[#B45309]" />
          </div>

          <h3 className="text-[15px] font-semibold text-[#171717]">
            {title}
          </h3>
        </div>

        <button
          onClick={onClose}
          disabled={
            isSubmitting ||
            isUploading
          }
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <p className="text-[11px] leading-4 text-[#B45309]">
            <strong>Note:</strong>{" "}
            {message}
          </p>
        </div>

        {order && (
          <div className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={
                    order.primary_image
                  }
                  alt={
                    order.product_name
                  }
                  fill
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
                {order.product_name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#888888]">
                Order #
                {
                  order.order_reference
                }
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />

            <p className="text-[10px] leading-4 text-[#B24C4C]">
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] disabled:opacity-50"
          >
            Keep Request
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isUploading
            }
            className="flex items-center gap-1.5 rounded-[6px] border border-[#B45309] bg-[#B45309] px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ||
              isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Undo2 className="h-3.5 w-3.5" />
                Confirm Withdraw
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ========================================================================== */
/* ACTION DROPDOWN                                                            */
/* ========================================================================== */

interface ActionDropdownProps {
  order: OrderLineItem;
  onReview: () => void;
  onViewReview: () => void;
  onReturn: () => void;
  onCancel: () => void;
  onTrack: () => void;
  onCancelReturn: (
    returnId: number,
  ) => void;
  onWithdrawCancel: () => void;
  onWithdrawReturn: () => void;
}

const ActionDropdown = ({
  order,
  onReview,
  onViewReview,
  onReturn,
  onCancel,
  onTrack,
  onCancelReturn,
  onWithdrawCancel,
  onWithdrawReturn,
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] =
    useState(false);

  const [coords, setCoords] =
    useState({
      top: 0,
      left: 0,
      width: 0,
      openUp: false,
    });

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 180;
  const MENU_OFFSET_X = 12;

  const updateCoords = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect =
      buttonRef.current.getBoundingClientRect();

    const menuHeight = 360;

    const spaceBelow =
      window.innerHeight -
      rect.bottom;

    const openUp =
      spaceBelow <
      menuHeight + 20;

    let left =
      rect.right +
      MENU_OFFSET_X -
      MENU_WIDTH;

    if (
      left + MENU_WIDTH >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        MENU_WIDTH -
        8;
    }

    if (left < 8) {
      left = 8;
    }

    setCoords({
      top: openUp
        ? rect.top - 6
        : rect.bottom + 6,
      left,
      width: MENU_WIDTH,
      openUp,
    });
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }

    setIsOpen((value) => !value);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = () =>
      updateCoords();

    window.addEventListener(
      "scroll",
      handler,
      true,
    );

    window.addEventListener(
      "resize",
      handler,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handler,
        true,
      );

      window.removeEventListener(
        "resize",
        handler,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (
      e: MouseEvent,
    ) => {
      if (
        buttonRef.current?.contains(
          e.target as Node,
        ) ||
        menuRef.current?.contains(
          e.target as Node,
        )
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener(
      "mousedown",
      handler,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler,
      );
  }, [isOpen]);

  const deliveryStatus =
    normalizeStatus(
      order.delivery_status,
    );

  const orderStatus =
    normalizeStatus(
      order.order_status,
    );

  const hasReview =
    !!order.is_reviewed;

  const canReview =
    deliveryStatus ===
    "delivered" ||
    orderStatus === "delivered";

  const canReturn =
    canInitiateReturn(order);

  const canCancel =
    canCancelOrder(order);

  const canWithdrawCancel =
    canWithdrawCancelOrder(order);

  const canWithdrawReturn =
    canWithdrawReturnRequest(order);

  const cancellableReturn =
    findCancellableReturn(order);

  const canCancelReturn =
    !!cancellableReturn;

  const handleAction = (
    action: () => void,
  ) => {
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
            y: coords.openUp
              ? 6
              : -6,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: coords.openUp
              ? 6
              : -6,
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
            transform:
              coords.openUp
                ? "translateY(-100%)"
                : "translateY(0)",
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-[8px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.15)]"
        >
          <button
            onClick={() =>
              handleAction(
                onTrack,
              )
            }
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa]"
          >
            <Truck
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{
                color: EMERALD,
              }}
            />

            <span>
              Track Order
            </span>
          </button>

          {canReview && (
            <button
              onClick={() =>
                handleAction(
                  hasReview
                    ? onViewReview
                    : onReview,
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa]"
            >
              <Star
                className={`h-3.5 w-3.5 flex-shrink-0 ${hasReview
                  ? "fill-[#B8935A] text-[#B8935A]"
                  : "text-[#B8935A]"
                  }`}
              />

              <span>
                {hasReview
                  ? "View Review"
                  : "Write Review"}
              </span>
            </button>
          )}

          {canReturn && (
            <button
              onClick={() =>
                handleAction(
                  onReturn,
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] hover:bg-[#f7f8fa]"
            >
              <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#EA580C]" />

              <span>
                Return Item
              </span>
            </button>
          )}

          {canCancelReturn &&
            cancellableReturn && (
              <button
                onClick={() =>
                  handleAction(
                    () =>
                      onCancelReturn(
                        cancellableReturn.returnId,
                      ),
                  )
                }
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <X className="h-3.5 w-3.5 flex-shrink-0" />

                <span>
                  Withdraw Return Request
                </span>
              </button>
            )}

          {canCancel && (
            <button
              onClick={() =>
                handleAction(
                  onCancel,
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              <X className="h-3.5 w-3.5 flex-shrink-0" />

              <span>
                Cancel Order
              </span>
            </button>
          )}

          {canWithdrawCancel && (
            <button
              onClick={() =>
                handleAction(
                  onWithdrawCancel,
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] hover:bg-[#FFFBEB]"
            >
              <Undo2 className="h-3.5 w-3.5 flex-shrink-0" />

              <span>
                Withdraw Cancel Request
              </span>
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
        className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${isOpen
          ? "border-[#0E1B3D]/30 bg-[#f7f8fa] text-[#0E1B3D]"
          : "border-[#e5e9ef] bg-white text-[#344054] hover:bg-[#f7f8fa]"
          }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
};

/* ========================================================================== */
/* ORDER DETAILS                                                              */
/* ========================================================================== */

interface OrderDetailsProps {
  order: OrderLineItem;
  allOrders: OrderLineItem[];
  onTrack: () => void;
  onViewBreakup: () => void;
  onReturn: (order: OrderLineItem) => void;
}

const OrderDetails = ({
  order,
  allOrders,
  onTrack,
  onViewBreakup,
  onReturn,
}: OrderDetailsProps) => {
  const orderLines = useMemo(() => {
    const lines = allOrders.filter(
      (item) =>
        Number(item.order_id) ===
        Number(order.order_id),
    );

    const fallback = lines.length > 0
      ? lines
      : [order];

    return [...fallback].sort(
      (a, b) => Number(a.line_id) - Number(b.line_id),
    );
  }, [allOrders, order]);

  const orderSummary = orderLines[0] || order;

  const refundDetails = orderLines
    .map((line) => getRefundDetails(line))
    .find(
      (refund) =>
        refund?.amount !== null &&
        refund?.amount !== undefined,
    );

  return (
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
        duration: 0.25,
        ease: "easeInOut",
      }}
      className="overflow-hidden border-b border-[#e7e9ee] bg-[#fafbfc]"
    >
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {/* ORDER DETAILS */}
        <div className="mb-5 overflow-hidden rounded-[11px] border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Item Reference
              </p>
              <p className="mt-1.5 truncate text-[13px] font-semibold text-[#101828]">
                {order.item_reference_id || `#${order.line_id}`}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Payment Status
              </p>
              <span
                className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize"
                style={{
                  color:
                    normalizeStatus(order.payment_status) === "paid"
                      ? EMERALD
                      : BRASS,
                  backgroundColor:
                    normalizeStatus(order.payment_status) === "paid"
                      ? "#eaf7f0"
                      : "#f8f1e4",
                }}
              >
                {order.payment_status || "—"}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Payment Method
              </p>
              <p className="mt-1.5 text-[13px] font-medium capitalize text-[#101828]">
                {order.payment_gateway || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Transaction ID
              </p>
              <p className="mt-1.5 truncate text-[12.5px] font-medium text-[#101828]">
                {order.gateway_transaction_id || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Total Payable
              </p>
              <p className="mt-1.5 text-[16px] font-bold text-[#101828]">
                {formatCurrency(
                  order.final_amount ??
                  order.total_payable ??
                  order.amount_paid ??
                  0
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Coins
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#1F7A56]">
                <Coins size={13} />
                {order.coin_redeemed || 0}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-[#edf0f3] px-4 py-4 sm:px-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Shipping Address
            </p>
            <div className="mt-1.5 flex items-start gap-2 text-[12.5px] leading-5 text-[#344054]">
              <MapPin
                size={14}
                className="mt-0.5 flex-shrink-0 text-[#98a2b3]"
              />
              <span className="break-words">
                {order.delivery_address?.full_address ||
                  order.delivery_address?.address ||
                  "—"}
              </span>
            </div>
          </div>

          {/* Refund Details */}
          {refundDetails?.amount !== null &&
            refundDetails?.amount !== undefined && (
              <div className="border-t border-[#edf0f3] px-4 py-4 sm:px-5">
                <div className="rounded-[9px] border border-[#CFE0D4] bg-[#F6FBF7] p-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#6D8679]">
                        <Check size={12} />
                        Refund Processed
                      </p>
                      <p className="mt-1 text-[20px] font-bold text-[#1F7A56]">
                        {formatCurrency(refundDetails.amount)}
                      </p>
                    </div>
                  </div>

                  {refundDetails.issuedAt && (
                    <p className="mt-2 text-[9.5px] text-[#789084]">
                      Processed on{" "}
                      <span className="font-semibold">
                        {formatDate(refundDetails.issuedAt)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#edf0f3] px-4 py-4 sm:px-5">
            <button
              type="button"
              onClick={onTrack}
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition-colors hover:bg-[#ECEFFC]"
            >
              <Truck size={14} />
              Track Order
            </button>

            <button
              type="button"
              onClick={onViewBreakup}
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition-colors hover:bg-[#ECEFFC]"
            >
              <LuReceiptIndianRupee size={14} />
              View Breakup
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ========================================================================== */
/* MOBILE ORDER CARD                                                          */
/* ========================================================================== */

interface MobileOrderCardProps {
  order: OrderLineItem;
  allOrders: OrderLineItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onImageClick: () => void;
  onTrack: () => void;
  onViewBreakup: () => void;
  onReview: () => void;
  onViewReview: () => void;
  onReturn: (order: OrderLineItem) => void;
  onCancel: () => void;
  onCancelReturn: (
    returnId: number,
  ) => void;
  onWithdrawCancel: () => void;
  onWithdrawReturn: () => void;
}

const MobileOrderCard = ({
  order,
  allOrders,
  isExpanded,
  onToggle,
  onImageClick,
  onTrack,
  onViewBreakup,
  onReview,
  onViewReview,
  onReturn,
  onCancel,
  onCancelReturn,
  onWithdrawCancel,
  onWithdrawReturn,
}: MobileOrderCardProps) => {
  const deliveryBadge =
    getDeliveryStatusBadge(order);

  const returnWindow =
    getReturnWindowInfo(order);

  const apiStatus =
    getOrderStatusBadge(order);

  return (
    <div className="border-b border-dashed border-[#e7e9ee] last:border-b-0">
      <div className="px-3 py-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onImageClick}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white"
            title="View product images"
          >
            {order.primary_image ? (
              <Image
                src={
                  order.primary_image
                }
                alt={
                  order.product_name ||
                  "Product"
                }
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-[#999999]" />
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-[#101828]">
                  {order.product_name}
                </p>

                <p className="mt-0.5 truncate text-[10.5px] text-[#98a2b3]">
                  {order.order_reference}
                  {" • "}
                  {order.item_reference_id ||
                    `#${order.line_id}`}
                </p>
              </div>

              <ActionDropdown
                order={order}
                onReview={onReview}
                onViewReview={
                  onViewReview
                }
                onReturn={() => onReturn(order)}
                onCancel={onCancel}
                onTrack={onTrack}
                onCancelReturn={
                  onCancelReturn
                }
                onWithdrawCancel={
                  onWithdrawCancel
                }
                onWithdrawReturn={
                  onWithdrawReturn
                }
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-[6px] px-2 py-1 text-[10px] font-semibold capitalize"
                style={{
                  color:
                    deliveryBadge.color,
                  backgroundColor:
                    deliveryBadge.bg,
                }}
              >
                Delivery:{" "}
                {
                  deliveryBadge.label
                }
              </span>

              <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[10px] font-semibold text-[#475066]">
                {order.payment_gateway ||
                  "N/A"}
              </span>

              <span className="inline-flex h-6 min-w-7 items-center justify-center gap-1 rounded-[5px] border border-[#CFE0D4] bg-[#F1F7F3] px-1.5 text-[10px] font-bold text-[#1F7A56]">
                <Coins size={11} />
                {order.coin_redeemed ||
                  0}
              </span>

              <span
                className="rounded-[6px] px-2 py-1 text-[10px] font-semibold capitalize"
                style={{
                  color: apiStatus.color,
                  backgroundColor:
                    apiStatus.bg,
                }}
              >
                Status:{" "}
                {apiStatus.label}
              </span>
            </div>

            {returnWindow &&
              returnWindow.state !==
              "completed" && (
                <div
                  className={`mt-2.5 flex items-center gap-1.5 rounded-[6px] border px-2.5 py-2 text-[9.5px] font-medium ${returnWindow.state ===
                    "open"
                    ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                    : "border-[#F0CFCF] bg-[#FDF2F2] text-[#B24C4C]"
                    }`}
                >
                  <Clock size={11} />

                  <span className="truncate">
                    {returnWindow.state ===
                      "open"
                      ? "Return window closes"
                      : "Return window closed"}{" "}
                    on{" "}
                    <span className="font-semibold">
                      {formatDate(
                        returnWindow.deadline.toISOString(),
                      )}
                    </span>
                  </span>
                </div>
              )}

            {returnWindow?.state ===
              "completed" && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-[6px] border border-[#CFE0D4] bg-[#F1F7F3] px-2.5 py-2 text-[9.5px] font-medium text-[#3F765A]">
                  <RefreshCcw size={11} />
                  <span>
                    Return completed
                  </span>
                </div>
              )}

            {(() => {
              const refund =
                getRefundDetails(
                  order,
                );

              if (
                refund?.amount ===
                null ||
                refund?.amount ===
                undefined
              ) {
                return null;
              }

              return (
                <div className="mt-2.5 rounded-[6px] border border-[#CFE0D4] bg-[#F6FBF7] px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px] font-semibold text-[#4C6E5E]">
                      Refund Processed
                    </span>

                    <span className="text-[11px] font-bold text-[#1F7A56]">
                      {formatCurrency(
                        refund.amount,
                      )}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                  Total
                </p>

                <p className="mt-0.5 font-semibold text-[#101828]">
                  {formatCurrency(
                    order.final_amount,
                  )}
                </p>
              </div>

              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                  Qty
                </p>

                <p className="mt-0.5 font-semibold text-[#101828]">
                  {order.quantity}
                </p>
              </div>

              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                  Date
                </p>

                <p className="mt-0.5 truncate font-medium text-[#667085]">
                  {order.order_date
                    ? formatDate(
                      order.order_date,
                    ).split(",")[0]
                    : "—"}
                </p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="mt-3 inline-flex items-center gap-1 rounded-[6px] border border-[#e5e9ef] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-[#475066] hover:bg-[#f7f8fa]"
            >
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isExpanded
                  ? "rotate-180"
                  : ""
                  }`}
              />

              {isExpanded
                ? "Hide Details"
                : "View Details"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <OrderDetails
            order={order}
            allOrders={allOrders}
            onTrack={onTrack}
            onViewBreakup={
              onViewBreakup
            }
            onReturn={onReturn}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ========================================================================== */
/* MAIN COMPONENT                                                             */
/* ========================================================================== */

export default function OrderHistory() {
  const dispatch =
    useAppDispatch();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [perPage] =
    useState(10);

  const [expandedRows, setExpandedRows] =
    useState<Set<string>>(
      new Set(),
    );

  const [
    reviewModalOpen,
    setReviewModalOpen,
  ] = useState(false);

  const [
    viewReviewModalOpen,
    setViewReviewModalOpen,
  ] = useState(false);

  const [
    returnModalOpen,
    setReturnModalOpen,
  ] = useState(false);

  const [
    cancelModalOpen,
    setCancelModalOpen,
  ] = useState(false);

  const [
    trackingModalOpen,
    setTrackingModalOpen,
  ] = useState(false);

  const [
    breakupModalOpen,
    setBreakupModalOpen,
  ] = useState(false);

  const [
    cancelReturnModalOpen,
    setCancelReturnModalOpen,
  ] = useState(false);

  const [
    withdrawModalOpen,
    setWithdrawModalOpen,
  ] = useState(false);

  const [
    withdrawType,
    setWithdrawType,
  ] = useState<"cancel" | "return" | null>(null);

  const [
    imageGalleryOpen,
    setImageGalleryOpen,
  ] = useState(false);

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<OrderLineItem | null>(
    null,
  );

  const [
    selectedReturnId,
    setSelectedReturnId,
  ] = useState<number | null>(
    null,
  );

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* ORDERS API                                                               */
  /* ------------------------------------------------------------------------ */

  const orderQueryArgs = {
    page,
    per_page: perPage,
    ...(statusFilter
      ? {
        status: statusFilter,
      }
      : {}),
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } =
    useGetMyOrdersQuery(
      orderQueryArgs as any,
      {
        refetchOnMountOrArgChange: true,
      },
    );

  const [
    cancelOrder,
    { isLoading: isCancelling },
  ] =
    useCancelOrderMutation();

  const [
    initiateReturn,
    { isLoading: isReturning },
  ] =
    useInitiateReturnMutation();

  const [
    addRatingReview,
    { isLoading: isSubmittingReview },
  ] =
    useAddRatingReviewMutation();

  const [
    cancelReturn,
    { isLoading: isCancellingReturn },
  ] =
    useCancelReturnMutation();

  const [
    withdrawCancelOrder,
    { isLoading: isWithdrawingCancelOrder },
  ] =
    useWithdrawCancelOrderMutation();

  const [
    withdrawCancelRequest,
    { isLoading: isWithdrawingCancelRequest },
  ] =
    useWithdrawCancelRequestMutation();

  /* ------------------------------------------------------------------------ */
  /* ORDERS NORMALIZATION                                                     */
  /* ------------------------------------------------------------------------ */

  const orders: OrderLineItem[] =
    useMemo(() => {
      if (!data?.data) {
        return [];
      }

      if (Array.isArray(data.data)) {
        return data.data;
      }

      if (
        data.data.data &&
        Array.isArray(data.data.data)
      ) {
        return data.data.data;
      }

      return [];
    }, [data]);

  /* ------------------------------------------------------------------------ */
  /* API STATUS OPTIONS                                                       */
  /* ------------------------------------------------------------------------ */

  const apiStatusOptions =
    useMemo(() => {
      return extractStatusOptionsFromApi(
        data,
      );
    }, [data]);

  const statusOptions =
    useMemo(() => {
      const map = new Map<
        string,
        ApiStatusOption
      >();

      apiStatusOptions.forEach(
        (status) => {
          if (status.value) {
            map.set(
              status.value,
              status,
            );
          }
        },
      );

      orders.forEach((order) => {
        const orderStatus =
          normalizeStatus(
            order.order_status,
          );

        const deliveryStatus =
          normalizeStatus(
            order.delivery_status,
          );

        if (
          orderStatus &&
          !map.has(orderStatus)
        ) {
          map.set(orderStatus, {
            value: orderStatus,
            label:
              formatStatusLabel(
                orderStatus,
              ),
          });
        }

        if (
          deliveryStatus &&
          !map.has(deliveryStatus)
        ) {
          map.set(
            deliveryStatus,
            {
              value:
                deliveryStatus,
              label:
                formatStatusLabel(
                  deliveryStatus,
                ),
            },
          );
        }
      });

      Object.keys(
        STATUS_STYLES,
      ).forEach((status) => {
        if (!map.has(status)) {
          map.set(status, {
            value: status,
            label:
              formatStatusLabel(
                status,
              ),
          });
        }
      });

      return Array.from(
        map.values(),
      ).sort((a, b) =>
        a.label.localeCompare(
          b.label,
        ),
      );
    }, [
      apiStatusOptions,
      orders,
    ]);

  /* ------------------------------------------------------------------------ */
  /* FILTERED ORDERS                                                          */
  /* ------------------------------------------------------------------------ */

  const filteredOrders =
    useMemo(() => {
      let result = orders;

      if (statusFilter) {
        const selectedStatus =
          normalizeStatus(
            statusFilter,
          );

        result =
          result.filter(
            (order) => {
              const deliveryStatus =
                normalizeStatus(
                  order.delivery_status,
                );

              const orderStatus =
                normalizeStatus(
                  order.order_status,
                );

              const returnStatus =
                normalizeStatus(
                  order.return_status,
                );

              return (
                deliveryStatus ===
                selectedStatus ||
                orderStatus ===
                selectedStatus ||
                returnStatus ===
                selectedStatus
              );
            },
          );
      }

      if (
        !searchQuery.trim()
      ) {
        return result;
      }

      const q =
        searchQuery.toLowerCase();

      return result.filter(
        (order) =>
          order.order_reference
            ?.toLowerCase()
            .includes(q) ||
          order.product_name
            ?.toLowerCase()
            .includes(q) ||
          order.order_status
            ?.toLowerCase()
            .includes(q) ||
          order.item_reference_id
            ?.toLowerCase()
            .includes(q) ||
          order.delivery_status
            ?.toLowerCase()
            .includes(q) ||
          order.return_status
            ?.toLowerCase()
            .includes(q),
      );
    }, [
      orders,
      searchQuery,
      statusFilter,
    ]);

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                               */
  /* ------------------------------------------------------------------------ */

  const totalRecords =
    (data as any)?.meta?.total ||
    (data as any)?.data?.total ||
    (data as any)?.total ||
    orders.length;

  const totalPages =
    Math.ceil(
      totalRecords / perPage,
    ) || 1;

  /* ------------------------------------------------------------------------ */
  /* ROW TOGGLE                                                               */
  /* ------------------------------------------------------------------------ */

  const toggleRow = (
    rowKey: string,
  ) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);

      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }

      return next;
    });
  };

  /* ------------------------------------------------------------------------ */
  /* REVIEW SUBMIT                                                            */
  /* ------------------------------------------------------------------------ */

  const handleReviewSubmit =
    async (
      reviewData: any,
    ) => {
      setIsUploading(true);

      try {
        const files: File[] =
          Array.isArray(
            reviewData?.images,
          )
            ? reviewData.images.filter(
              (
                img: any,
              ): img is File =>
                img instanceof File,
            )
            : [];

        const rating = Number(
          reviewData?.rating,
        );

        const reviewText =
          reviewData?.review_text ||
          reviewData?.review ||
          "";

        if (
          !rating ||
          rating < 1 ||
          rating > 5
        ) {
          throw new Error(
            "Please select a valid rating.",
          );
        }

        if (
          !reviewText.trim()
        ) {
          throw new Error(
            "Please enter your review.",
          );
        }

        const response =
          await addRatingReview(
            {
              rating,
              review_text:
                reviewText.trim(),
              order_id:
                reviewData.order_id,
              order_line_id:
                reviewData.order_line_id,
              product_id:
                reviewData.product_id,
              images: files,
            },
          ).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Review submitted successfully!",
            type: "success",
          }),
        );

        await refetch();

        return response;
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              error?.message ||
              "Failed to submit review.",
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* RETURN SUBMIT                                                            */
  /* ------------------------------------------------------------------------ */

  const handleReturnSubmit =
    async (returnData: {
      quantity: number;
      reason: string;
      images: File[];
    }) => {
      if (!selectedOrder) {
        return;
      }

      setIsUploading(true);

      try {
        const till =
          selectedOrder.timeline
            ?.return_applicable_till;

        if (till) {
          const deadline =
            parseDate(till);

          if (
            deadline &&
            deadline.getTime() <=
            Date.now()
          ) {
            throw new Error(
              "Return window has expired for this item.",
            );
          }
        }

        if (
          isReturnCompleted(
            selectedOrder,
          )
        ) {
          throw new Error(
            "This item has already been returned.",
          );
        }

        const maxQuantity =
          Number(
            selectedOrder.available_for_return,
          ) ||
          Number(
            selectedOrder.quantity,
          ) ||
          1;

        const selectedQuantity =
          Number(
            returnData.quantity,
          ) || maxQuantity;

        if (
          selectedQuantity < 1
        ) {
          throw new Error(
            "Return quantity must be at least 1.",
          );
        }

        if (
          selectedQuantity >
          maxQuantity
        ) {
          throw new Error(
            `Return quantity cannot be more than ${maxQuantity}.`,
          );
        }

        const response =
          await initiateReturn(
            {
              order_reference:
                selectedOrder.order_reference,
              items: [
                {
                  order_line_id:
                    selectedOrder.line_id,
                  quantity:
                    selectedQuantity,
                  reason:
                    returnData.reason,
                  images:
                    returnData.images ||
                    [],
                },
              ],
            },
          ).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Return request submitted successfully!",
            type: "success",
          }),
        );

        await refetch();

        return response;
      } catch (error: any) {
        let errorMessage =
          "Failed to submit return request. Please try again.";

        if (
          error?.data?.message
        ) {
          errorMessage =
            error.data.message;
        } else if (
          error?.data?.errors
        ) {
          const errorMessages =
            Object.values(
              error.data.errors,
            ).flat();

          errorMessage =
            (
              errorMessages as string[]
            ).join(" ");
        } else if (
          error?.message
        ) {
          errorMessage =
            error.message;
        }

        dispatch(
          showToast({
            message:
              errorMessage,
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* CANCEL ORDER                                                             */
  /* ------------------------------------------------------------------------ */

  const handleCancelSubmit =
    async (reason: string) => {
      if (!selectedOrder) {
        return;
      }

      setIsUploading(true);

      try {
        const orderReference =
          selectedOrder.order_reference;

        const orderLineId =
          selectedOrder.line_id;

        if (!orderReference) {
          throw new Error(
            "Order reference is missing.",
          );
        }

        if (!orderLineId) {
          throw new Error(
            "Order line ID is missing.",
          );
        }

        const response =
          await cancelOrder({
            orderReference,
            orderLineId,
            reason,
          }).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Order cancellation request submitted successfully!",
            type: "success",
          }),
        );

        await refetch();

        return response;
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              error?.message ||
              "Failed to cancel order.",
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* CANCEL RETURN                                                             */
  /* ------------------------------------------------------------------------ */

  const handleCancelReturnSubmit =
    async () => {
      if (!selectedReturnId) {
        dispatch(
          showToast({
            message:
              "Return ID is missing.",
            type: "error",
          }),
        );

        throw new Error(
          "Return ID is missing.",
        );
      }

      setIsUploading(true);

      try {
        const response =
          await cancelReturn(
            {
              returnId:
                selectedReturnId,
            },
          ).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Return request cancelled successfully!",
            type: "success",
          }),
        );

        await refetch();

        setSelectedReturnId(
          null,
        );

        return response;
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              error?.message ||
              "Failed to cancel return request.",
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* WITHDRAW CANCEL ORDER                                                    */
  /* ------------------------------------------------------------------------ */

  const handleWithdrawCancelOrder =
    async () => {
      if (!selectedOrder) {
        return;
      }

      setIsUploading(true);

      try {
        const response =
          await withdrawCancelOrder({
            orderReference:
              selectedOrder.order_reference,
            orderLineId:
              selectedOrder.line_id,
          }).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Cancel request withdrawn successfully!",
            type: "success",
          }),
        );

        await refetch();

        return response;
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              error?.message ||
              "Failed to withdraw cancel request.",
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* WITHDRAW CANCEL REQUEST (RETURN WITHDRAW)                                */
  /* ------------------------------------------------------------------------ */

  const handleWithdrawCancelRequest =
    async () => {
      if (!selectedOrder) {
        return;
      }

      setIsUploading(true);

      try {
        const response =
          await withdrawCancelRequest({
            orderReference:
              selectedOrder.order_reference,
            orderLineId:
              selectedOrder.line_id,
          }).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Withdraw request submitted successfully!",
            type: "success",
          }),
        );

        await refetch();

        return response;
      } catch (error: any) {
        dispatch(
          showToast({
            message:
              error?.data
                ?.message ||
              error?.message ||
              "Failed to withdraw request.",
            type: "error",
          }),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* OPEN MODALS                                                              */
  /* ------------------------------------------------------------------------ */

  const openImageGallery = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setImageGalleryOpen(true);
  };

  const openReview = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };

  const openViewReview = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setViewReviewModalOpen(true);
  };

  const openReturn = (
    order: OrderLineItem,
  ) => {
    const till =
      order.timeline
        ?.return_applicable_till;

    if (till) {
      const deadline = parseDate(till);

      if (
        deadline &&
        deadline.getTime() <=
        Date.now()
      ) {
        dispatch(
          showToast({
            message:
              "Return window has expired for this item.",
            type: "error",
          }),
        );
        return;
      }
    }

    if (isReturnCompleted(order)) {
      dispatch(
        showToast({
          message:
            "This item has already been returned.",
          type: "error",
        }),
      );
      return;
    }

    if (!canInitiateReturn(order)) {
      dispatch(
        showToast({
          message:
            "This item is not eligible for return.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedOrder(order);
    setReturnModalOpen(true);
  };

  const openCancel = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  const openTracking = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setTrackingModalOpen(true);
  };

  const openBreakup = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setBreakupModalOpen(true);
  };

  const openCancelReturn = (
    order: OrderLineItem,
    returnId: number,
  ) => {
    if (
      !isReturnWindowOpen(
        order.timeline
          ?.return_applicable_till,
      )
    ) {
      dispatch(
        showToast({
          message:
            "Return window has closed — cannot cancel return.",
          type: "error",
        }),
      );

      return;
    }

    setSelectedOrder(order);
    setSelectedReturnId(
      returnId,
    );
    setCancelReturnModalOpen(
      true,
    );
  };

  const openWithdrawCancel = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setWithdrawType("cancel");
    setWithdrawModalOpen(true);
  };

  const openWithdrawReturn = (
    order: OrderLineItem,
  ) => {
    setSelectedOrder(order);
    setWithdrawType("return");
    setWithdrawModalOpen(true);
  };

  const closeAllModals = () => {
    setImageGalleryOpen(false);
    setReviewModalOpen(false);
    setViewReviewModalOpen(false);
    setReturnModalOpen(false);
    setCancelModalOpen(false);
    setTrackingModalOpen(false);
    setBreakupModalOpen(false);
    setCancelReturnModalOpen(
      false,
    );
    setWithdrawModalOpen(false);

    setSelectedReturnId(null);
    setSelectedOrder(null);
    setWithdrawType(null);
  };

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6">
        <div className="mb-5 h-10 w-full max-w-xs animate-pulse rounded-[8px] bg-[#f2f4f7]" />

        <div className="space-y-3">
          {[...Array(5)].map(
            (_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-[8px] bg-[#f7f8fa]"
              />
            ),
          )}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                    */
  /* ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
        <p className="text-[14px] text-[#667085]">
          Failed to load orders.
          Please try again.
        </p>

        <button
          onClick={() =>
            refetch()
          }
          className="mt-3 rounded-[8px] bg-[#0E1B3D] px-4 py-2 text-[12px] font-semibold text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6">
        {/* FILTER BAR */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* SEARCH */}
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />

            <input
              type="text"
              placeholder="Search order or item"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative w-full sm:w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;

                setStatusFilter(value);
                setPage(1);
                setExpandedRows(new Set());
              }}
              className="h-[40px] w-full appearance-none rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-3 pr-9 text-[13px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white"
            >
              <option value="">All Statuses</option>

              {statusOptions.map((status) => (
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
        {/* ================= MOBILE ================= */}

        <div className="md:hidden">
          {filteredOrders.length ===
            0 ? (
            <div className="py-12 text-center text-[13px] text-[#98a2b3]">
              {searchQuery ||
                statusFilter
                ? "No orders found matching your filters."
                : "No orders found."}
            </div>
          ) : (
            filteredOrders.map(
              (order) => {
                const rowKey = `${order.order_id}-${order.line_id}`;

                const isExpanded =
                  expandedRows.has(
                    rowKey,
                  );

                return (
                  <MobileOrderCard
                    key={rowKey}
                    order={order}
                    allOrders={orders}
                    isExpanded={
                      isExpanded
                    }
                    onToggle={() =>
                      toggleRow(
                        rowKey,
                      )
                    }
                    onImageClick={() =>
                      openImageGallery(
                        order,
                      )
                    }
                    onTrack={() =>
                      openTracking(
                        order,
                      )
                    }
                    onViewBreakup={() =>
                      openBreakup(
                        order,
                      )
                    }
                    onReview={() =>
                      openReview(
                        order,
                      )
                    }
                    onViewReview={() =>
                      openViewReview(
                        order,
                      )
                    }
                    onReturn={openReturn}
                    onCancel={() =>
                      openCancel(
                        order,
                      )
                    }
                    onCancelReturn={(
                      returnId,
                    ) =>
                      openCancelReturn(
                        order,
                        returnId,
                      )
                    }
                    onWithdrawCancel={() =>
                      openWithdrawCancel(
                        order,
                      )
                    }
                    onWithdrawReturn={() =>
                      openWithdrawReturn(
                        order,
                      )
                    }
                  />
                );
              },
            )
          )}
        </div>

        {/* ================= DESKTOP ================= */}

        <div className="hidden md:block">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* HEADER */}

              <div className="grid grid-cols-[40px_minmax(140px,1.35fr)_minmax(160px,1.6fr)_minmax(85px,0.8fr)_minmax(80px,0.8fr)_50px_minmax(70px,0.85fr)_minmax(120px,1.15fr)_60px] items-center gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                <span />

                <span>
                  Order Reference
                </span>

                <span>
                  Product
                </span>

                <span>
                  Total
                </span>

                <span>
                  Method
                </span>

                <span>
                  Qty
                </span>

                <span>
                  Coins
                </span>

                <span>
                  Status
                </span>

                <span className="text-right">
                  Actions
                </span>
              </div>

              <div>
                {filteredOrders.length ===
                  0 ? (
                  <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                    {searchQuery ||
                      statusFilter
                      ? "No orders found matching your filters."
                      : "No orders found."}
                  </div>
                ) : (
                  filteredOrders.map(
                    (order) => {
                      const rowKey = `${order.order_id}-${order.line_id}`;

                      const isExpanded =
                        expandedRows.has(
                          rowKey,
                        );

                      const returnWindow =
                        getReturnWindowInfo(
                          order,
                        );

                      const refundDetails =
                        getRefundDetails(
                          order,
                        );

                      const statusBadge =
                        getOrderStatusBadge(
                          order,
                        );

                      return (
                        <div
                          key={
                            rowKey
                          }
                          className="border-b border-dashed border-[#e7e9ee] last:border-b-0"
                        >
                          {/* ROW */}

                          <div className="grid grid-cols-[40px_minmax(140px,1.35fr)_minmax(160px,1.6fr)_minmax(85px,0.8fr)_minmax(80px,0.8fr)_50px_minmax(70px,0.85fr)_minmax(120px,1.15fr)_60px] items-center gap-2 py-4 text-[13px] text-[#101828]">
                            {/* EXPAND */}

                            <button
                              onClick={() =>
                                toggleRow(
                                  rowKey,
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#e5e9ef] bg-white text-[#667085] hover:bg-[#f7f8fa]"
                              aria-label={
                                isExpanded
                                  ? "Collapse"
                                  : "Expand"
                              }
                            >
                              <ChevronDown
                                size={
                                  15
                                }
                                className={`transition-transform duration-200 ${isExpanded
                                  ? "rotate-180"
                                  : ""
                                  }`}
                              />
                            </button>

                            {/* ORDER REFERENCE */}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#0E1B3D]">
                                {
                                  order.order_reference
                                }
                              </p>

                              <p className="mt-0.5 truncate text-[10.5px] text-[#98a2b3]">
                                {order.item_reference_id ||
                                  `Line #${order.line_id}`}
                              </p>
                            </div>

                            {/* PRODUCT */}

                            <button
                              type="button"
                              onClick={() =>
                                openImageGallery(
                                  order,
                                )
                              }
                              className="flex min-w-0 items-center gap-2.5 text-left"
                              title="View product images"
                            >
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                {order.primary_image ? (
                                  <Image
                                    src={
                                      order.primary_image
                                    }
                                    alt={
                                      order.product_name ||
                                      "Product"
                                    }
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
                                title={
                                  order.product_name
                                }
                              >
                                {
                                  order.product_name
                                }
                              </span>
                            </button>

                            {/* TOTAL */}

                            <div className="min-w-0">
                              <span className="text-[#667085]">
                                {formatCurrency(
                                  order.final_amount,
                                )}
                              </span>

                              {refundDetails?.amount !==
                                null &&
                                refundDetails?.amount !==
                                undefined && (
                                  <span className="mt-0.5 block truncate text-[9.5px] font-bold text-[#1F7A56]">
                                    Refund{" "}
                                    {formatCurrency(
                                      refundDetails.amount,
                                    )}
                                  </span>
                                )}
                            </div>

                            {/* METHOD */}

                            <span>
                              <span className="inline-block rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                                {order.payment_gateway ||
                                  "N/A"}
                              </span>
                            </span>

                            {/* QTY */}

                            <span className="text-[#667085]">
                              {
                                order.quantity
                              }
                            </span>

                            {/* COINS */}

                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex h-6 min-w-7 items-center justify-center gap-1 rounded-[5px] border border-[#CFE0D4] bg-[#F1F7F3] px-1.5 text-[10px] font-bold text-[#1F7A56]">
                                <Coins
                                  size={
                                    11
                                  }
                                />

                                {order.coin_redeemed ||
                                  0}
                              </span>
                            </div>

                            {/* STATUS */}

                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <span
                                  className="inline-block max-w-full truncate rounded-[6px] px-2.5 py-1 text-[11px] font-semibold capitalize"
                                  style={{
                                    color:
                                      statusBadge.color,
                                    backgroundColor:
                                      statusBadge.bg,
                                  }}
                                  title={
                                    statusBadge.label
                                  }
                                >
                                  {
                                    statusBadge.label
                                  }
                                </span>
                              </div>

                              {returnWindow &&
  returnWindow.state !== "completed" &&
  normalizeStatus(order.delivery_status) === "delivered" && ( // Check if the delivery status is "delivered"
    <p
      className={`mt-1 truncate text-[8.5px] font-medium ${
        returnWindow.state === "open"
          ? "text-[#4F7563]"
          : "text-[#B24C4C]"
      }`}
      title={`${returnWindow.label} ${formatDate(
        returnWindow.deadline.toISOString(),
      )}`}
    >
      <Clock size={10} className="mr-0.5 inline" />
      {returnWindow.state === "open"
        ? "Return Closes"
        : "Closed"}{" "}
      {formatDate(returnWindow.deadline.toISOString())}
    </p>
  )}

                              {refundDetails?.amount !==
                                null &&
                                refundDetails?.amount !==
                                undefined && (
                                  <p className="mt-1 truncate text-[8.5px] font-semibold text-[#1F7A56]">
                                    <Check
                                      size={
                                        10
                                      }
                                      className="mr-0.5 inline"
                                    />
                                    Refund
                                    Processed
                                  </p>
                                )}
                            </div>

                            {/* ACTIONS */}

                            <div className="flex items-center justify-end">
                              <ActionDropdown
                                order={
                                  order
                                }
                                onReview={() =>
                                  openReview(
                                    order,
                                  )
                                }
                                onViewReview={() =>
                                  openViewReview(
                                    order,
                                  )
                                }
                                onReturn={() =>
                                  openReturn(
                                    order,
                                  )
                                }
                                onCancel={() =>
                                  openCancel(
                                    order,
                                  )
                                }
                                onTrack={() =>
                                  openTracking(
                                    order,
                                  )
                                }
                                onCancelReturn={(
                                  returnId,
                                ) =>
                                  openCancelReturn(
                                    order,
                                    returnId,
                                  )
                                }
                                onWithdrawCancel={() =>
                                  openWithdrawCancel(
                                    order,
                                  )
                                }
                                onWithdrawReturn={() =>
                                  openWithdrawReturn(
                                    order,
                                  )
                                }
                              />
                            </div>
                          </div>

                          {/* DETAILS */}

                          <AnimatePresence
                            initial={
                              false
                            }
                          >
                            {isExpanded && (
                              <OrderDetails
                                order={
                                  order
                                }
                                allOrders={
                                  orders
                                }
                                onTrack={() =>
                                  openTracking(
                                    order,
                                  )
                                }
                                onViewBreakup={() =>
                                  openBreakup(
                                    order,
                                  )
                                }
                                onReturn={
                                  openReturn
                                }
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    },
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PAGINATION */}

        <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f2f5] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#667085] sm:text-[13px]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#101828]">
                {perPage}
              </span>

              <ChevronDown
                size={14}
                className="text-[#8a92a6]"
              />
            </div>

            <span className="font-medium">
              {totalRecords > 0
                ? `Showing ${(page - 1) *
                perPage +
                1
                }–${Math.min(
                  page *
                  perPage,
                  totalRecords,
                )} of ${totalRecords} records`
                : "Showing 0 records"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPage((p) =>
                  Math.max(
                    1,
                    p - 1,
                  ),
                )
              }
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] hover:bg-[#f2f4f7] disabled:opacity-40"
            >
              <ChevronLeft
                size={16}
              />
            </button>

            {Array.from(
              {
                length:
                  Math.min(
                    totalPages,
                    5,
                  ),
              },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPage(p)
                }
                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold ${page === p
                  ? "text-white"
                  : "text-[#667085] hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
                  }`}
                style={
                  page === p
                    ? {
                      backgroundColor:
                        NAVY,
                    }
                    : undefined
                }
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1,
                  ),
                )
              }
              disabled={
                page ===
                totalPages
              }
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] hover:bg-[#f2f4f7] disabled:opacity-40"
            >
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ================= MODALS ================= */}

      <OrderImageGallery
        isOpen={
          imageGalleryOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
      />

      <TrackingModal
        isOpen={
          trackingModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
      />

      <OrderBreakupModal
        isOpen={
          breakupModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        allOrders={orders}
      />

      <ReviewModal
        isOpen={
          reviewModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        onSubmit={
          handleReviewSubmit
        }
        isLoading={
          isSubmittingReview ||
          isUploading
        }
      />

      <ViewReviewModal
        isOpen={
          viewReviewModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
      />

      <ReturnModal
        isOpen={
          returnModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        onSubmit={
          handleReturnSubmit
        }
        isUploading={
          isReturning ||
          isUploading
        }
      />

      <CancelModal
        isOpen={
          cancelModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        onSubmit={
          handleCancelSubmit
        }
        isUploading={
          isCancelling ||
          isUploading
        }
      />

      <CancelReturnModal
        isOpen={
          cancelReturnModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        returnId={
          selectedReturnId
        }
        onSubmit={
          handleCancelReturnSubmit
        }
        isUploading={
          isCancellingReturn ||
          isUploading
        }
      />

      <WithdrawModal
        isOpen={
          withdrawModalOpen
        }
        onClose={
          closeAllModals
        }
        order={selectedOrder}
        title={
          withdrawType === "cancel"
            ? "Withdraw Cancel Request"
            : "Withdraw Return Request"
        }
        message={
          withdrawType === "cancel"
            ? "Your cancel request will be withdrawn and the order will continue processing normally."
            : "Your return request will be withdrawn and the order will continue processing normally."
        }
        onSubmit={
          withdrawType === "cancel"
            ? handleWithdrawCancelOrder
            : handleWithdrawCancelRequest
        }
        isUploading={
          isWithdrawingCancelOrder ||
          isWithdrawingCancelRequest ||
          isUploading
        }
      />
    </>
  );
}