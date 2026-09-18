"use client";

import {
  useGetMyOrdersQuery,
} from "@/lib/redux/api/order/orderApi";
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
  Clock3,
} from "lucide-react";
import {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useRouter } from "next/navigation";

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
  credit_notes: CreditNote[];
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";
const RED = "#DC2626";

const ALLOWED_DELIVERY_STATUSES = [
  "delivered",
  "buyback_pending",
  "buyback_approved",
  "buyback_rejected",
  "buyback_refunded",
];

const STATUS_OPTIONS = [
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

const BUYBACK_WINDOW_DAYS = 30;

const STATUS_STYLES: Record<
  string,
  { color: string; bg: string }
> = {
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

function formatCurrency(
  value: number | string | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
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

function parseBackendDate(
  dateStr: string | null | undefined,
): Date | null {
  if (!dateStr) {
    return null;
  }

  try {
    let normalized = String(dateStr).trim();

    if (
      normalized.includes(" ") &&
      !normalized.includes("T")
    ) {
      normalized = normalized.replace(
        " ",
        "T",
      );
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

function formatDate(
  dateStr: string | null | undefined,
) {
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

function getBuybackDeadline(
  registrationCompletedAt:
    | string
    | null
    | undefined,
): Date | null {
  const start = parseBackendDate(
    registrationCompletedAt,
  );

  if (!start) {
    return null;
  }

  const deadline = new Date(start);

  deadline.setDate(
    deadline.getDate() +
      BUYBACK_WINDOW_DAYS,
  );

  return deadline;
}

function isBuybackWindowOpen(
  registrationCompletedAt:
    | string
    | null
    | undefined,
  now: number = Date.now(),
): boolean {
  const deadline = getBuybackDeadline(
    registrationCompletedAt,
  );

  if (!deadline) {
    return false;
  }

  return deadline.getTime() > now;
}

function formatRemainingTime(
  milliseconds: number,
) {
  if (milliseconds <= 0) {
    return "Expired";
  }

  const totalSeconds =
    Math.floor(milliseconds / 1000);

  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(
    2,
    "0",
  )}h ${String(minutes).padStart(
    2,
    "0",
  )}m ${String(seconds).padStart(
    2,
    "0",
  )}s`;
}

interface BuybackWindowInfo {
  status:
    | "loading"
    | "active"
    | "expired"
    | "unavailable";

  deadline: Date | null;
  remainingMs: number;
  remainingText: string;
}

function getBuybackWindowInfo(
  registrationCompletedAt:
    | string
    | null
    | undefined,
  now: number | null,
): BuybackWindowInfo {
  if (!registrationCompletedAt) {
    return {
      status: "unavailable",
      deadline: null,
      remainingMs: 0,
      remainingText:
        "Buyback window unavailable",
    };
  }

  if (!now) {
    return {
      status: "loading",
      deadline: null,
      remainingMs: 0,
      remainingText: "Checking window...",
    };
  }

  const deadline = getBuybackDeadline(
    registrationCompletedAt,
  );

  if (!deadline) {
    return {
      status: "unavailable",
      deadline: null,
      remainingMs: 0,
      remainingText:
        "Buyback window unavailable",
    };
  }

  const remainingMs =
    deadline.getTime() - now;

  if (remainingMs <= 0) {
    return {
      status: "expired",
      deadline,
      remainingMs: 0,
      remainingText: "Expired",
    };
  }

  return {
    status: "active",
    deadline,
    remainingMs,
    remainingText:
      formatRemainingTime(
        remainingMs,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Refund / Credit Note helpers                                               */
/* -------------------------------------------------------------------------- */

function getMatchingReturn(
  order: OrderLineItem,
): ReturnRecord | null {
  if (!Array.isArray(order.returns)) {
    return null;
  }

  const match =
    order.returns.find(
      (returnRecord) =>
        Array.isArray(
          returnRecord.items,
        ) &&
        returnRecord.items.some(
          (item) =>
            Number(
              item.order_line_id,
            ) ===
            Number(order.line_id),
        ),
    );

  return match || null;
}

function getRefundDetails(
  order: OrderLineItem,
): {
  amount: number | null;
  creditNoteNumber: string | null;
  issuedAt: string | null;
  downloadUrl: string | null;
} | null {
  const normalizedDeliveryStatus =
    normalizeStatus(
      order.delivery_status,
    );

  const normalizedReturnStatus =
    normalizeStatus(
      order.return_status,
    );

  const matchingReturn =
    getMatchingReturn(order);

  const isRefundedLine =
    normalizedDeliveryStatus ===
      "buyback_refunded" ||
    normalizedReturnStatus ===
      "returned";

  if (
    !isRefundedLine ||
    !matchingReturn
  ) {
    return null;
  }

  const creditNote =
    Array.isArray(
      order.credit_notes,
    )
      ? order.credit_notes.find(
          (note) =>
            note &&
            note.amount !== null &&
            note.amount !==
              undefined &&
            note.amount !== "",
        )
      : null;

  if (creditNote) {
    const amount =
      typeof creditNote.amount ===
      "number"
        ? creditNote.amount
        : parseFloat(
            String(
              creditNote.amount,
            ),
          );

    return {
      amount:
        Number.isFinite(amount)
          ? amount
          : null,
      creditNoteNumber:
        creditNote.credit_note_number ||
        null,
      issuedAt:
        creditNote.issued_at ||
        null,
      downloadUrl:
        creditNote.download_url ||
        null,
    };
  }

  const fallbackAmount =
    matchingReturn.total_refund_amount;

  if (
    fallbackAmount !== null &&
    fallbackAmount !==
      undefined
  ) {
    const amount =
      typeof fallbackAmount ===
      "number"
        ? fallbackAmount
        : parseFloat(
            String(fallbackAmount),
          );

    return {
      amount:
        Number.isFinite(amount)
          ? amount
          : null,
      creditNoteNumber: null,
      issuedAt:
        matchingReturn.refund_processed_at ||
        null,
      downloadUrl: null,
    };
  }

  return null;
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
        transition={{
          duration: 0.2,
        }}
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

/* -------------------------------------------------------------------------- */
/* Buyback Window Expired Modal                                               */
/* -------------------------------------------------------------------------- */

interface BuybackExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
  deadline: Date | null;
}

const BuybackExpiredModal = ({
  isOpen,
  onClose,
  onContact,
  deadline,
}: BuybackExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-md"
    >
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
                The 30-day buyback
                window from your
                registration completion
                date has expired.
                You can no longer
                initiate a new buyback
                request from here.
              </p>

              {deadline && (
                <div className="mt-3 rounded-[6px] border border-[#F0DEC1] bg-white/70 px-3 py-2">
                  <p className="text-[9.5px] uppercase tracking-[0.08em] text-[#9A7B4C]">
                    Window expired on
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-[#6B4E1F]">
                    {deadline.toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              )}
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
          className="flex items-center gap-1.5 rounded-[6px] border border-[#0E1B3D] bg-[#0E1B3D] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#16264d]"
        >
          <Ban className="h-3.5 w-3.5" />
          Contact Admin
        </button>
      </div>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* View Details Modal                                                         */
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
  if (!isOpen || !order) {
    return null;
  }

  const normalizedDeliveryStatus =
    normalizeStatus(
      order.delivery_status,
    );

  const statusStyle =
    STATUS_STYLES[
      normalizedDeliveryStatus
    ] ?? {
      color: "#667085",
      bg: "#f2f4f7",
    };

  const refundDetails =
    getRefundDetails(order);

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[6px]"
            style={{
              backgroundColor:
                "#eceffb",
            }}
          >
            <Eye
              className="h-4 w-4"
              style={{
                color: INDIGO,
              }}
            />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Order Details
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
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="mb-5 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
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
            <p className="truncate text-[13px] font-semibold text-[#171717]">
              {order.product_name}
            </p>

            <p className="mt-0.5 text-[10.5px] text-[#888888]">
              Code:{" "}
              {order.product_code || "—"}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-[5px] px-2 py-0.5 text-[10px] font-semibold capitalize"
                style={{
                  color:
                    statusStyle.color,
                  backgroundColor:
                    statusStyle.bg,
                }}
              >
                {normalizedDeliveryStatus.replace(
                  /_/g,
                  " ",
                )}
              </span>

              <span className="rounded-[5px] bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-semibold text-[#475066]">
                {order.payment_gateway ||
                  "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[10px] border border-[#e1e5eb] bg-white p-5 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Order Reference
            </p>

            <p className="mt-1.5 truncate text-[13px] font-semibold text-[#101828]">
              {order.order_reference ||
                `ORD-${order.order_id}`}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Order Date
            </p>

            <p className="mt-1.5 text-[12.5px] text-[#101828]">
              {formatDate(
                order.order_date,
              )}
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
                  normalizeStatus(
                    order.payment_status,
                  ) === "paid"
                    ? EMERALD
                    : BRASS,

                backgroundColor:
                  normalizeStatus(
                    order.payment_status,
                  ) === "paid"
                    ? "#eaf7f0"
                    : "#f8f1e4",
              }}
            >
              {order.payment_status ||
                "—"}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Transaction ID
            </p>

            <p
              className="mt-1.5 truncate text-[12.5px] font-medium text-[#101828]"
              title={
                order.gateway_transaction_id ||
                undefined
              }
            >
              {order.gateway_transaction_id ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Quantity
            </p>

            <p className="mt-1.5 text-[13px] font-medium text-[#101828]">
              {order.quantity || 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Available for Buyback
            </p>

            <p className="mt-1.5 text-[13px] font-semibold text-[#1F7A56]">
              {order.available_for_return ??
                order.quantity ??
                0}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Coins Redeemed
            </p>

            <p className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#1F7A56]">
              <Coins size={13} />
              {order.coin_redeemed || 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Total Payable
            </p>

            <p className="mt-1.5 text-[15px] font-bold text-[#101828]">
              {formatCurrency(
                order.final_amount ??
                  order.total_payable ??
                  order.amount_paid ??
                  0,
              )}
            </p>
          </div>

          {refundDetails?.amount !==
            null &&
            refundDetails?.amount !==
              undefined && (
              <div className="rounded-[7px] border border-[#CFE0D4] bg-[#F1F7F3] p-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#6D8679]">
                  Refund Amount
                </p>

                <p className="mt-1 text-[15px] font-bold text-[#1F7A56]">
                  {formatCurrency(
                    refundDetails.amount,
                  )}
                </p>

                {refundDetails.creditNoteNumber && (
                  <p className="mt-1 truncate text-[9.5px] text-[#6D8679]">
                    Credit Note:{" "}
                    {
                      refundDetails.creditNoteNumber
                    }
                  </p>
                )}
              </div>
            )}
        </div>

        {refundDetails?.amount !==
          null &&
          refundDetails?.amount !==
            undefined && (
            <div className="mb-4 rounded-[10px] border border-[#CFE0D4] bg-[#F6FBF7] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#6D8679]">
                    <Check size={12} />
                    Refund Processed
                  </p>

                  <p className="mt-1.5 text-[20px] font-bold text-[#1F7A56]">
                    {formatCurrency(
                      refundDetails.amount,
                    )}
                  </p>
                </div>

                {refundDetails.issuedAt && (
                  <div className="text-right">
                    <p className="text-[9.5px] uppercase tracking-[0.08em] text-[#8EA095]">
                      Issued At
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-[#345C49]">
                      {formatDate(
                        refundDetails.issuedAt,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        <div className="mb-4 rounded-[10px] border border-[#e1e5eb] bg-white px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
            Shipping Address
          </p>

          <div className="mt-1.5 flex items-start gap-2 text-[12.5px] leading-5 text-[#344054]">
            <MapPin
              size={14}
              className="mt-0.5 flex-shrink-0 text-[#98a2b3]"
            />

            <span>
              {order.delivery_address
                ?.full_address ||
                order.delivery_address
                  ?.address ||
                "—"}
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#e1e5eb] bg-white px-5 py-4">
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
            <Truck size={12} />
            Timeline
          </p>

          <div className="space-y-2.5">
            {order.timeline
              ?.order_placed && (
              <TimelineRow
                label="Order Placed"
                value={
                  order.timeline
                    .order_placed
                }
              />
            )}

            {order.timeline
              ?.order_confirmed && (
              <TimelineRow
                label="Order Confirmed"
                value={
                  order.timeline
                    .order_confirmed
                }
              />
            )}

            {order.timeline
              ?.dispatched_at && (
              <TimelineRow
                label="Dispatched"
                value={
                  order.timeline
                    .dispatched_at
                }
              />
            )}

            {order.timeline
              ?.shipped_at && (
              <TimelineRow
                label="Shipped"
                value={
                  order.timeline
                    .shipped_at
                }
              />
            )}

            {order.timeline
              ?.delivered_at && (
              <TimelineRow
                label="Delivered"
                value={
                  order.timeline
                    .delivered_at
                }
              />
            )}

            {order.timeline
              ?.cancelled_at && (
              <TimelineRow
                label="Cancelled"
                value={
                  order.timeline
                    .cancelled_at
                }
                danger
              />
            )}

            {order.timeline
              ?.return_requested_at && (
              <TimelineRow
                label="Buyback Requested"
                value={
                  order.timeline
                    .return_requested_at
                }
              />
            )}

            {order.timeline
              ?.return_approved_at && (
              <TimelineRow
                label="Buyback Approved"
                value={
                  order.timeline
                    .return_approved_at
                }
              />
            )}

            {order.timeline
              ?.return_completed_at && (
              <TimelineRow
                label="Buyback Completed"
                value={
                  order.timeline
                    .return_completed_at
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const TimelineRow = ({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11.5px] text-[#667085]">
      {label}
    </span>

    <span
      className={`text-right text-[11.5px] font-medium ${
        danger
          ? "text-[#DC2626]"
          : "text-[#101828]"
      }`}
    >
      {formatDate(value)}
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Buy Back Modal                                                             */
/* -------------------------------------------------------------------------- */

interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSuccess?: () => void | Promise<void>;
}

const BuybackModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}: BuybackModalProps) => {
  const dispatch = useAppDispatch();

  const [
    initiateBuyback,
    { isLoading },
  ] = useInitiateBuybackMutation();

  const maxQty =
    order?.available_for_return ||
    order?.quantity ||
    1;

  const [
    quantity,
    setQuantity,
  ] = useState<number>(1);

  const [
    reason,
    setReason,
  ] = useState(
    "Product is no longer required",
  );

  const [
    declaresMarketable,
    setDeclaresMarketable,
  ] = useState(false);

  const [
    declaresUnsold,
    setDeclaresUnsold,
  ] = useState(false);

  const [
    declaresUnused,
    setDeclaresUnused,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSuccess,
    setIsSuccess,
  ] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const initialQty =
        order.available_for_return &&
        order.available_for_return > 0
          ? order.available_for_return
          : order.quantity || 1;

      setQuantity(initialQty);

      setReason(
        "Product is no longer required",
      );

      setDeclaresMarketable(false);
      setDeclaresUnsold(false);
      setDeclaresUnused(false);

      setError("");
      setIsSuccess(false);
    }
  }, [
    isOpen,
    order?.line_id,
  ]);

  if (!isOpen || !order) {
    return null;
  }

  const atLeastOneDeclaration =
    declaresMarketable ||
    declaresUnsold ||
    declaresUnused;

  const handleSubmit =
    async () => {
      setError("");

      if (!order.line_id) {
        setError(
          "Order line ID is missing.",
        );
        return;
      }

      if (
        !quantity ||
        quantity < 1
      ) {
        setError(
          "Quantity must be at least 1.",
        );
        return;
      }

      if (quantity > maxQty) {
        setError(
          `Maximum buyback quantity is ${maxQty}.`,
        );
        return;
      }

      if (
        reason.trim().length < 5
      ) {
        setError(
          "Please provide a valid reason (min 5 characters).",
        );
        return;
      }

      if (
        !atLeastOneDeclaration
      ) {
        setError(
          "Please tick at least one declaration to proceed.",
        );
        return;
      }

      try {
        const payload = {
          items: [
            {
              order_line_id:
                order.line_id,
              quantity,
              reason:
                reason.trim(),
            },
          ],
          return_reason:
            reason.trim(),
          declares_marketable:
            declaresMarketable,
          declares_unsold:
            declaresUnsold,
          declares_unused:
            declaresUnused,
        };

        const response =
          await initiateBuyback(
            payload,
          ).unwrap();

        dispatch(
          showToast({
            message:
              response?.message ||
              "Buyback request submitted successfully!",
            type: "success",
          }),
        );

        /*
         * IMPORTANT:
         * Update parent/list data immediately after successful mutation.
         * This removes the need for a manual page refresh.
         */
        await onSuccess?.();

        setIsSuccess(true);

        setTimeout(
          () => onClose(),
          1800,
        );
      } catch (err: any) {
        let errorMessage =
          "Failed to submit buyback request.";

        if (err?.data?.message) {
          errorMessage =
            err.data.message;
        } else if (
          err?.data?.errors
        ) {
          const msgs =
            Object.values(
              err.data.errors,
            ).flat();

          errorMessage = (
            msgs as string[]
          ).join(" ");
        } else if (err?.message) {
          errorMessage =
            err.message;
        }

        setError(errorMessage);

        dispatch(
          showToast({
            message:
              errorMessage,
            type: "error",
          }),
        );
      }
    };

  const canSubmit =
    !isLoading &&
    quantity >= 1 &&
    quantity <= maxQty &&
    reason.trim().length >= 5 &&
    atLeastOneDeclaration;

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F1F7F3]">
            <RotateCcw className="h-4 w-4 text-[#1F7A56]" />
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
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-[#F1F7F3]">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>

            <h4 className="mt-5 text-[20px] font-semibold text-[#171717]">
              Buyback Requested!
            </h4>

            <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
              Your buyback request
              for{" "}
              {order.product_name}{" "}
              has been submitted.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
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
                  Ordered:{" "}
                  {order.quantity}{" "}
                  • Max Buyback:{" "}
                  <span className="font-semibold text-[#1F7A56]">
                    {maxQty}
                  </span>
                </p>

                {order.product_code && (
                  <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                    Code:{" "}
                    {order.product_code}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Quantity to Buy Back{" "}
                <span className="text-[#B24C4C]">
                  *
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (q) =>
                        Math.max(
                          1,
                          Number(q) -
                            1,
                        ),
                    )
                  }
                  disabled={
                    isLoading ||
                    quantity <= 1
                  }
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
                    const v =
                      Number(
                        e.target.value,
                      );

                    if (
                      !Number.isFinite(
                        v,
                      )
                    ) {
                      return;
                    }

                    setQuantity(
                      Math.min(
                        maxQty,
                        Math.max(
                          1,
                          v,
                        ),
                      ),
                    );
                  }}
                  disabled={isLoading}
                  className="h-9 w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-center text-[13px] font-medium text-[#171717] outline-none focus:border-[#999999]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (q) =>
                        Math.min(
                          maxQty,
                          Number(q) +
                            1,
                        ),
                    )
                  }
                  disabled={
                    isLoading ||
                    quantity >=
                      maxQty
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#D7D7D5] bg-white text-[#555555] transition hover:border-[#BDBDBA] disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="mt-1 text-[10px] text-[#999999]">
                Maximum{" "}
                {maxQty}{" "}
                allowed
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Reason{" "}
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
                placeholder="Why are you requesting this buyback?"
                maxLength={500}
                disabled={isLoading}
                className="min-h-[80px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-[#171717] outline-none focus:border-[#999999]"
              />

              <p className="mt-1 text-right text-[9.5px] text-[#999999]">
                {
                  reason.trim()
                    .length
                }
                /500
              </p>
            </div>

            <div className="mb-2 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
                  Declarations
                </p>

                <span
                  className={`text-[9.5px] font-medium ${
                    atLeastOneDeclaration
                      ? "text-[#1F7A56]"
                      : "text-[#B24C4C]"
                  }`}
                >
                  {atLeastOneDeclaration
                    ? "✓ ready"
                    : "tick at least one"}
                </span>
              </div>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={
                    declaresMarketable
                  }
                  onChange={(e) =>
                    setDeclaresMarketable(
                      e.target.checked,
                    )
                  }
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#1F7A56]"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the
                  product is{" "}
                  <span className="font-semibold">
                    marketable
                  </span>{" "}
                  and in sellable
                  condition.
                </span>
              </label>

              <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={
                    declaresUnsold
                  }
                  onChange={(e) =>
                    setDeclaresUnsold(
                      e.target.checked,
                    )
                  }
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#1F7A56]"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the
                  product is{" "}
                  <span className="font-semibold">
                    unsold
                  </span>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={
                    declaresUnused
                  }
                  onChange={(e) =>
                    setDeclaresUnused(
                      e.target.checked,
                    )
                  }
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#1F7A56]"
                />

                <span className="text-[11.5px] leading-4 text-[#344054]">
                  I declare the
                  product is{" "}
                  <span className="font-semibold">
                    unused
                  </span>
                  .
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

                <p className="text-[10px] leading-4 text-[#B24C4C]">
                  {error}
                </p>
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
              className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium transition ${
                canSubmit
                  ? "border-[#1F7A56] bg-[#1F7A56] text-white hover:bg-[#186149]"
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
  displayStatus?: string;
}

const ActionDropdown = ({
  order,
  onView,
  onBuyback,
  displayStatus,
}: ActionDropdownProps) => {
  const [isOpen, setIsOpen] =
    useState(false);

  const [coords, setCoords] =
    useState<{
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

  const buttonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const MENU_WIDTH = 180;
  const MENU_OFFSET_X = 12;

  const normalizedStatus =
    normalizeStatus(
      displayStatus ??
        order.delivery_status,
    );

  const isDelivered =
    normalizedStatus ===
    "delivered";

  const updateCoords =
    () => {
      if (!buttonRef.current) {
        return;
      }

      const rect =
        buttonRef.current.getBoundingClientRect();

      const menuHeight =
        isDelivered
          ? 100
          : 60;

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

  const handleToggle =
    () => {
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
  }, [
    isOpen,
    isDelivered,
  ]);

  useEffect(() => {
    if (!isOpen) return;

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
                  onView,
                )
              }
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
            >
              <Eye
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{
                  color: INDIGO,
                }}
              />

              <span className="truncate">
                View
              </span>
            </button>

            {isDelivered && (
              <button
                onClick={() =>
                  handleAction(
                    onBuyback,
                  )
                }
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
              >
                <RotateCcw
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{
                    color: EMERALD,
                  }}
                />

                <span className="truncate">
                  Buy Back
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
        className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${
          isOpen
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

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function BuyBack() {
  const dispatch =
    useAppDispatch();

  const router = useRouter();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [perPage] =
    useState(10);

  const [
    viewModalOpen,
    setViewModalOpen,
  ] = useState(false);

  const [
    buybackModalOpen,
    setBuybackModalOpen,
  ] = useState(false);

  const [
    expiredModalOpen,
    setExpiredModalOpen,
  ] = useState(false);

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<OrderLineItem | null>(
      null,
    );

  /*
   * Local status overrides:
   *
   * Used so that the table reflects successful mutations immediately,
   * without waiting for a full page reload.
   *
   * Key = order_id-line_id
   */
  const [
    statusOverrides,
    setStatusOverrides,
  ] = useState<
    Record<string, string>
  >({});

  /* ------------------------------------------------------------------------ */
  /* Profile / Registration                                                   */
  /* ------------------------------------------------------------------------ */

  const {
    data: profileData,
  } =
    useGetUserProfileQuery(
      undefined,
    );

  const registrationCompletedAt =
    profileData?.user
      ?.registration_completed_at ||
    null;

  /* ------------------------------------------------------------------------ */
  /* Live Buyback Window Timer                                                */
  /* ------------------------------------------------------------------------ */

  const [
    currentTime,
    setCurrentTime,
  ] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        Date.now(),
      );
    };

    updateTime();

    const interval = setInterval(
      updateTime,
      1000,
    );

    return () =>
      clearInterval(interval);
  }, []);

  const buybackWindow =
    useMemo(
      () =>
        getBuybackWindowInfo(
          registrationCompletedAt,
          currentTime,
        ),
      [
        registrationCompletedAt,
        currentTime,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* Orders                                                                   */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetMyOrdersQuery(
    {
      page,
      per_page: perPage,
    },
    {
      refetchOnMountOrArgChange:
        true,
    },
  );

  const orders: OrderLineItem[] =
    useMemo(() => {
      if (!data?.data) {
        return [];
      }

      if (
        Array.isArray(
          data.data,
        )
      ) {
        return data.data;
      }

      if (
        data.data.data &&
        Array.isArray(
          data.data.data,
        )
      ) {
        return data.data.data;
      }

      return [];
    }, [data]);

  /*
   * Returns the stable key used for local status updates.
   */
  const getOrderKey = (
    order: OrderLineItem,
  ) =>
    `${order.order_id}-${order.line_id}`;

  /*
   * Returns the currently visible status.
   *
   * Local mutation status gets priority over the backend value.
   */
  const getEffectiveDeliveryStatus = (
    order: OrderLineItem,
  ) => {
    const key = getOrderKey(order);

    return (
      statusOverrides[key] ??
      normalizeStatus(
        order.delivery_status,
      )
    );
  };

  /*
   * When backend catches up with our local optimistic value,
   * remove that override and let the API become the source of truth again.
   */
  useEffect(() => {
    if (
      !orders.length ||
      !Object.keys(
        statusOverrides,
      ).length
    ) {
      return;
    }

    setStatusOverrides(
      (currentOverrides) => {
        let changed = false;

        const nextOverrides = {
          ...currentOverrides,
        };

        orders.forEach((order) => {
          const key =
            getOrderKey(order);

          const localStatus =
            nextOverrides[key];

          if (!localStatus) {
            return;
          }

          const backendStatus =
            normalizeStatus(
              order.delivery_status,
            );

          if (
            backendStatus ===
            localStatus
          ) {
            delete nextOverrides[
              key
            ];
            changed = true;
          }
        });

        return changed
          ? nextOverrides
          : currentOverrides;
      },
    );
  }, [
    orders,
    statusOverrides,
  ]);

  const eligibleOrders =
    useMemo(
      () =>
        orders.filter((o) =>
          ALLOWED_DELIVERY_STATUSES.includes(
            getEffectiveDeliveryStatus(
              o,
            ),
          ),
        ),
      [orders, statusOverrides],
    );

  const filteredOrders =
    useMemo(() => {
      const q =
        searchQuery
          .trim()
          .toLowerCase();

      const normalizedFilter =
        normalizeStatus(
          statusFilter,
        );

      return eligibleOrders.filter(
        (o) => {
          const normalizedDeliveryStatus =
            getEffectiveDeliveryStatus(
              o,
            );

          const matchesSearch =
            !q ||
            o.order_reference
              ?.toLowerCase()
              .includes(q) ||
            o.product_name
              ?.toLowerCase()
              .includes(q) ||
            o.order_status
              ?.toLowerCase()
              .includes(q) ||
            o.item_reference_id
              ?.toLowerCase()
              .includes(q);

          const matchesStatus =
            !normalizedFilter ||
            normalizedDeliveryStatus ===
              normalizedFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      eligibleOrders,
      searchQuery,
      statusFilter,
    ]);

  const totalRecords =
    (data as any)?.meta
      ?.total ||
    (data as any)?.total ||
    eligibleOrders.length;

  const totalPages =
    Math.ceil(
      totalRecords / perPage,
    ) || 1;

  /* ------------------------------------------------------------------------ */
  /* Status Sync Helpers                                                      */
  /* ------------------------------------------------------------------------ */

  /*
   * Update table immediately and then refresh API data.
   */
  const syncOrderStatus = async (
    order: OrderLineItem,
    nextStatus: string,
  ) => {
    const key = getOrderKey(order);

    /*
     * 1. Immediate table update
     */
    setStatusOverrides(
      (prev) => ({
        ...prev,
        [key]: normalizeStatus(
          nextStatus,
        ),
      }),
    );

    /*
     * 2. Update selected order as well,
     *    so View Details immediately shows the same status.
     */
    setSelectedOrder(
      (prev) => {
        if (
          !prev ||
          getOrderKey(prev) !==
            key
        ) {
          return prev;
        }

        return {
          ...prev,
          delivery_status:
            normalizeStatus(
              nextStatus,
            ),
        };
      },
    );

    /*
     * 3. Sync with backend.
     */
    try {
      await refetch();
    } catch {
      /*
       * Keep optimistic status if refetch fails.
       * Next successful fetch will reconcile it.
       */
    }
  };

  /*
   * Called after Buy Back API succeeds.
   */
  const handleBuybackSuccess =
    async () => {
      if (!selectedOrder) {
        await refetch();
        return;
      }

      await syncOrderStatus(
        selectedOrder,
        "buyback_pending",
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Modal handlers                                                           */
  /* ------------------------------------------------------------------------ */

  const openView = (
    order: OrderLineItem,
  ) => {
    const effectiveStatus =
      getEffectiveDeliveryStatus(
        order,
      );

    const orderForModal =
      statusOverrides[
        getOrderKey(order)
      ]
        ? {
            ...order,
            delivery_status:
              effectiveStatus,
          }
        : order;

    setSelectedOrder(
      orderForModal,
    );

    setViewModalOpen(true);
  };

  const openBuyback = (
    order: OrderLineItem,
  ) => {
    const now =
      currentTime ??
      Date.now();

    if (
      !isBuybackWindowOpen(
        registrationCompletedAt,
        now,
      )
    ) {
      setSelectedOrder(order);
      setExpiredModalOpen(true);
      return;
    }

    setSelectedOrder(order);

    setBuybackModalOpen(
      true,
    );
  };

  const handleGoToContact = () => {
    setExpiredModalOpen(false);
    setSelectedOrder(null);

    router.push("/contact");
  };

  const closeAllModals =
    () => {
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
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="h-10 w-64 animate-pulse rounded-[8px] bg-[#f2f4f7]" />

          <div className="h-10 w-[180px] animate-pulse rounded-[8px] bg-[#f2f4f7]" />
        </div>

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
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
        <p className="text-[14px] text-[#667085]">
          Failed to load
          orders. Please try
          again.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-3 rounded-[8px] bg-[#0E1B3D] px-4 py-2 text-[12px] font-semibold text-white"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        {/* ------------------------------------------------------------------ */}
        {/* Buyback Window Information                                         */}
        {/* ------------------------------------------------------------------ */}

        {buybackWindow.status ===
          "active" && (
          <div className="mb-5 overflow-hidden rounded-[10px] border border-[#CFE0D4] bg-[#F6FBF7]">
            <div className="flex flex-col justify-between gap-4 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#E7F5EC]">
                  <Clock3 className="h-4 w-4 text-[#1F7A56]" />
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#173D2C]">
                    Buyback Window Active
                  </p>

                  <p className="mt-0.5 text-[10.5px] text-[#6D8679]">
                    You can initiate buyback
                    requests within 30 days
                    of registration completion.
                  </p>

                  {buybackWindow.deadline && (
                    <p className="mt-1 text-[9.5px] text-[#789084]">
                      Valid until{" "}
                      <span className="font-semibold text-[#4B6959]">
                        {buybackWindow.deadline.toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[8px] border border-[#CFE0D4] bg-white px-4 py-2.5 text-center">
                <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#789084]">
                  Time Remaining
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[14px] font-bold tabular-nums text-[#1F7A56]">
                  {
                    buybackWindow.remainingText
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {buybackWindow.status ===
          "expired" && (
          <div className="mb-5 overflow-hidden rounded-[10px] border border-[#F3E2C7] bg-[#FDF9F1]">
            <div className="flex flex-col justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FBF3E4]">
                  <CalendarX className="h-4 w-4 text-[#A9711F]" />
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#6B4E1F]">
                    Buyback Window Expired
                  </p>

                  <p className="mt-0.5 text-[10.5px] text-[#8C7044]">
                    The 30-day buyback window
                    has ended. Contact admin
                    for further assistance.
                  </p>

                  {buybackWindow.deadline && (
                    <p className="mt-1 text-[9.5px] text-[#9B8056]">
                      Expired on{" "}
                      <span className="font-semibold">
                        {buybackWindow.deadline.toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExpiredModalOpen(
                    true,
                  )
                }
                className="flex items-center justify-center gap-1.5 rounded-[6px] border border-[#A9711F] bg-white px-3.5 py-2 text-[10.5px] font-semibold text-[#8B641F] transition hover:bg-[#FFF9ED]"
              >
                <Ban className="h-3.5 w-3.5" />
                Contact Admin
              </button>
            </div>
          </div>
        )}

        {buybackWindow.status ===
          "unavailable" && (
          <div className="mb-5 rounded-[10px] border border-[#E4E4E2] bg-[#FAFAF9] px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#8A92A6]" />

              <p className="text-[11px] text-[#667085]">
                Buyback timing is currently
                unavailable because the
                registration completion date
                could not be determined.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Search + Status Filter                                             */}
        {/* ------------------------------------------------------------------ */}

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
                setSearchQuery(
                  e.target.value,
                );
                setPage(1);
              }}
              className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            />
          </div>

          <div className="relative w-full sm:w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value,
                );
                setPage(1);
              }}
              className="h-[40px] w-full appearance-none rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-3 pr-9 text-[13px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            >
              <option value="">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {status.label}
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Table                                                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="overflow-x-auto">
          <div className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
            <span>
              Order Reference
            </span>

            <span>Product</span>

            <span>Total</span>

            <span>Method</span>

            <span>Qty</span>

            <span>Coins</span>

            <span>Status</span>

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
                  ? "No eligible orders found matching your filters."
                  : "No eligible orders found."}
              </div>
            ) : (
              filteredOrders.map(
                (order) => {
                  const rowKey = `${order.order_id}-${order.line_id}`;

                  /*
                   * IMPORTANT:
                   * Use local status override first.
                   * This makes status change visible immediately.
                   */
                  const normalizedDeliveryStatus =
                    getEffectiveDeliveryStatus(
                      order,
                    );

                  const statusStyle =
                    STATUS_STYLES[
                      normalizedDeliveryStatus
                    ] ?? {
                      color:
                        "#667085",
                      bg: "#f2f4f7",
                    };

                  const refundDetails =
                    getRefundDetails(
                      order,
                    );

                  return (
                    <div
                      key={
                        rowKey
                      }
                      className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] items-center gap-2 border-b border-dashed border-[#e7e9ee] py-4 text-[13px] text-[#101828] last:border-b-0"
                    >
                      <span className="truncate font-semibold text-[#0E1B3D]">
                        {
                          order.order_reference
                        }
                      </span>

                      <div className="flex min-w-0 items-center gap-2.5">
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
                      </div>

                      <div>
                        <span className="text-[#667085]">
                          {formatCurrency(
                            order.final_amount,
                          )}
                        </span>

                        {refundDetails?.amount !==
                          null &&
                          refundDetails?.amount !==
                            undefined && (
                            <span className="mt-0.5 block text-[10px] font-bold text-[#1F7A56]">
                              Refund:{" "}
                              {formatCurrency(
                                refundDetails.amount,
                              )}
                            </span>
                          )}
                      </div>

                      <span>
                        <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                          {order.payment_gateway ||
                            "N/A"}
                        </span>
                      </span>

                      <span className="text-[#667085]">
                        {
                          order.quantity
                        }
                      </span>

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

                      <span>
                        <span
                          className="rounded-[6px] px-2 py-1 text-[11px] font-semibold capitalize"
                          style={{
                            color:
                              statusStyle.color,
                            backgroundColor:
                              statusStyle.bg,
                          }}
                        >
                          {normalizedDeliveryStatus.replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                      </span>

                      <div className="flex items-center justify-end">
                        <ActionDropdown
                          order={
                            order
                          }
                          displayStatus={
                            normalizedDeliveryStatus
                          }
                          onView={() =>
                            openView(
                              order,
                            )
                          }
                          onBuyback={() =>
                            openBuyback(
                              order,
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Pagination                                                          */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center gap-4 text-[13px] text-[#667085]">
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
              Showing{" "}
              {(page - 1) *
                perPage +
                1}{" "}
              –{" "}
              {Math.min(
                page * perPage,
                totalRecords,
              )}{" "}
              of{" "}
              {totalRecords}{" "}
              records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPage(
                  (p) =>
                    Math.max(
                      1,
                      p - 1,
                    ),
                )
              }
              disabled={
                page === 1
              }
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
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
              (_, i) =>
                i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPage(p)
                }
                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${
                  page === p
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
                setPage(
                  (p) =>
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
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* Modals                                                               */}
      {/* -------------------------------------------------------------------- */}

      <ViewDetailsModal
        isOpen={
          viewModalOpen
        }
        onClose={
          closeAllModals
        }
        order={
          selectedOrder
        }
      />

      <BuybackModal
        isOpen={
          buybackModalOpen
        }
        onClose={
          closeAllModals
        }
        order={
          selectedOrder
        }
        onSuccess={
          handleBuybackSuccess
        }
      />

      <BuybackExpiredModal
        isOpen={
          expiredModalOpen
        }
        onClose={() =>
          closeAllModals()
        }
        onContact={
          handleGoToContact
        }
        deadline={
          buybackWindow.deadline
        }
      />
    </>
  );
}