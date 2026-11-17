"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Package,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  Filter,
  Star,
  X,
  Check,
  RotateCcw,
  Ban,
  Loader2,
  ShoppingBag,
  MessageCircle,
  AlertTriangle,
  IndianRupee,
  MoreVertical,
  MapPin,
  Coins,
  Undo2,
} from "lucide-react";

import {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useLazyGetInvoiceByOrderIdQuery,
  useAddRatingReviewMutation,
  useWithdrawCancelRequestMutation,
  useCancelReturnMutation,
} from "@/lib/redux/api/order/orderApi";

import OrderJourneyTimeline from "./OrderJourneyTimeline";
import ReviewModal from "./ReviewModal";
import OrderCancelModal, { CancelOrderData } from "./OrderCancelModal";
import { generateInvoicePDF } from "./invoiceGenerator";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { LuReceiptIndianRupee } from "react-icons/lu";
import Loding from "@/components/common/Loding";
import {
  useLazyGetIndiaPostOrderTrackingQuery,
  type IndiaPostOrderTrackingData,
} from "@/lib/redux/api/indiaPostTrackingApi";

/* ============================================================
   STATUS HELPERS
============================================================ */

const normalizeStatus = (status?: string | null) => {
  if (!status) return "";

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

/* ✅ Only these statuses will appear in the filter dropdown.
   Buyback statuses are intentionally excluded. */
const ALLOWED_FILTER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "dispatched",
  "delivered",
  "cancel_pending",
  "cancel_rejected",
  "cancelled",
  "return_initiated",
  "return_pending",
  "return_approved",
  "return_rejected",
  "returned",
  "refunded",
];

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  shipped: Truck,
  dispatched: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  cancel_pending: Clock,
  returned: RotateCcw,
  return_pending: RotateCcw,
  return_approved: RotateCcw,
  refunded: CheckCircle,
};

const statusColors: Record<string, string> = {
  pending: "text-[#8A6D1F] bg-[#FBF6E4] border-[#E9D48B]",
  confirmed: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  processing: "text-[#5B4FA8] bg-[#F3F1FB] border-[#D8D3F2]",
  shipped: "text-[#5B4FA8] bg-[#F3F1FB] border-[#D8D3F2]",
  dispatched: "text-[#3E5AA8] bg-[#EEF1FB] border-[#CBD5F0]",
  delivered: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  cancelled: "text-[#B24C4C] bg-[#FDF2F2] border-[#F0CFCF]",
  cancel_pending: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  returned: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  return_pending: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  return_approved: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  refunded: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
};

const toDate = (value: string | null | undefined) => {
  if (!value) return null;

  const normalized =
    value.includes(" ") && !value.includes("T")
      ? value.replace(" ", "T")
      : value;

  const d = new Date(normalized);

  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (dateString: string | null) => {
  const date = toDate(dateString);

  if (!date) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string | null) => {
  const date = toDate(dateString);

  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (amount: number) => {
  if (!amount) return "₹0";

  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const getInitials = (name?: string) => {
  if (!name) return "U";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] || ""}${
    parts[parts.length - 1]?.[0] || ""
  }`.toUpperCase();
};

const getStatusDisplayName = (status: string) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .toString()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusColor = (status: string) =>
  statusColors[normalizeStatus(status)] ||
  "text-[#777777] bg-[#F5F5F5] border-[#E0E0E0]";

const getStatusIcon = (status: string) =>
  statusIcons[normalizeStatus(status)] || Package;

/* ============================================================
   NORMALIZE ORDERS
   API is order-wise: every order has an `items` array.
   We flatten each item into a "line" (order fields + item fields)
   so existing modals/actions keep working, then group lines
   back under their order for the UI.
============================================================ */

interface OrderGroup {
  key: string;
  order_id: number;
  order_reference: string;
  order_status: string;
  order_date: string;
  total: number;
  quantity: number;
  representative: any;
  lines: any[];
}

const normalizeOrders = (records: any[]): OrderGroup[] => {
  if (!Array.isArray(records)) {
    return [];
  }

  const rows: any[] = [];

  records.forEach((record: any) => {
    if (Array.isArray(record?.items)) {
      const { items, ...orderFields } = record;

      items.forEach((item: any) => {
        const row: any = {
          ...orderFields,
          ...item,
          order_id: item.order_id ?? orderFields.order_id,
          returns: item.returns ?? orderFields.returns ?? [],
          credit_notes: item.credit_notes ?? orderFields.credit_notes ?? [],
          product_reviews: item.product_reviews ?? [],
          is_reviewed: item.is_reviewed ?? false,
          is_returned: item.is_returned ?? false,
          timeline: item.timeline || orderFields.timeline || {},
          is_cancel_return_allowed: item.is_cancel_return_allowed ?? 0,
          images: Array.isArray(item.images) ? item.images : [],
          primary_image:
            item.primary_image || item.images?.[0]?.image_url || "",
        };

        delete row.item_reference_id;
        delete row.items;

        rows.push(row);
      });
    } else {
      // Legacy flat line response
      rows.push({
        ...record,
        returns: record.returns || [],
        credit_notes: record.credit_notes || [],
        product_reviews: record.product_reviews || [],
        timeline: record.timeline || {},
        images: record.images || [],
        is_cancel_return_allowed: record.is_cancel_return_allowed ?? 0,
      });
    }
  });

  const grouped = new Map<string, any[]>();

  rows.forEach((row) => {
    const key = String(row.order_id ?? row.order_reference);
    const list = grouped.get(key) || [];

    list.push({
      ...row,
      display_id: `${row.order_id}_${row.line_id}`,
      is_line_cancelled: normalizeStatus(row.delivery_status) === "cancelled",
    });

    grouped.set(key, list);
  });

  const result: OrderGroup[] = Array.from(grouped.entries()).map(
    ([key, lines]) => {
      const sortedLines = [...lines].sort(
        (a, b) => Number(a.line_id || 0) - Number(b.line_id || 0),
      );

      const representative = sortedLines[0];

      const fallbackTotal = sortedLines.reduce(
        (sum, l) => sum + (Number(l.final_amount) || 0),
        0,
      );

      const total =
        Number(representative.total_payable) ||
        Number(representative.amount_paid) ||
        fallbackTotal;

      const quantity = sortedLines.reduce(
        (sum, l) => sum + (Number(l.quantity) || 0),
        0,
      );

      return {
        key,
        order_id: representative.order_id,
        order_reference: representative.order_reference,
        order_status: representative.order_status,
        order_date: representative.order_date,
        total,
        quantity,
        representative,
        lines: sortedLines.map((l) => ({
          ...l,
          final_amount: Number(l.final_amount) || 0,
        })),
      };
    },
  );

  return result.sort(
    (a, b) =>
      (toDate(b.order_date)?.getTime() || 0) -
      (toDate(a.order_date)?.getTime() || 0),
  );
};

/* ============================================================
   REVIEW DISPLAY
============================================================ */

function ReviewDisplay({ reviews }: { reviews: any[] }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-[10px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                <span className="text-[11px] font-semibold">
                  {getInitials(review.user_name || "User")}
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#171717]">
                  {review.user_name || "Anonymous User"}
                </p>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? "fill-[#171717] text-[#171717]"
                            : "fill-[#E4E4E2] text-[#E4E4E2]"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] text-[#888888]">
                    • {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {review.is_verified && (
              <span className="shrink-0 rounded-full bg-[#F1F7F3] px-2 py-0.5 text-[8px] font-medium text-[#3F765A]">
                Verified
              </span>
            )}
          </div>

          {review.title && (
            <p className="mt-2 text-[12px] font-medium text-[#171717]">
              {review.title}
            </p>
          )}

          {review.review_text && (
            <p className="mt-0.5 text-[11px] leading-5 text-[#555555]">
              {review.review_text}
            </p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {review.images.map((img: any, idx: number) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[5px] border border-[#E4E4E2] bg-white"
                >
                  <img
                    src={img.image_url || img.image_path}
                    alt={`Review image ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   REFUND CREDIT DISPLAY
============================================================ */

function RefundCreditDisplay({ creditNotes }: { creditNotes: any[] }) {
  if (!creditNotes || !Array.isArray(creditNotes) || creditNotes.length === 0) {
    return null;
  }

  const totalRefund = creditNotes.reduce(
    (sum: number, cn: any) => sum + (Number(cn.amount) || 0),
    0,
  );

  if (totalRefund <= 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#CFE0D4] bg-[#F6FBF7]">
      <div className="flex items-center justify-between border-b border-[#DCEAE0] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3F765A]">
            <IndianRupee className="h-2.5 w-2.5 text-white" />
          </div>

          <span className="text-[10px] font-semibold text-[#2E5C44]">
            Refund Credited
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#E5F0E9]">
        {creditNotes.map((cn: any) => (
          <div
            key={cn.id}
            className="flex items-center justify-between px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E4F0E9]">
                <LuReceiptIndianRupee className="h-3 w-3 text-[#3F765A]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-[#2E5C44]">
                  {cn.credit_note_number}
                </p>

                <p className="text-[8px] text-[#7A9A88]">
                  {formatDate(cn.issued_at)} · {formatTime(cn.issued_at)}
                </p>
              </div>
            </div>

            <span className="ml-2 flex-shrink-0 text-[12px] font-bold text-[#2E5C44]">
              +{formatPrice(Number(cn.amount) || 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#DCEAE0] bg-[#EEF7F1] px-3 py-2">
        <span className="text-[10px] font-semibold text-[#2E5C44]">
          Total Credited
        </span>

        <span className="text-[13px] font-bold text-[#2E5C44]">
          {formatPrice(totalRefund)}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   REFUND BADGE
============================================================ */

function RefundBadge({ creditNotes }: { creditNotes: any[] }) {
  if (!creditNotes || !Array.isArray(creditNotes) || creditNotes.length === 0) {
    return null;
  }

  const totalRefund = creditNotes.reduce(
    (sum: number, cn: any) => sum + (Number(cn.amount) || 0),
    0,
  );

  if (totalRefund <= 0) {
    return null;
  }

  return (
    <span className="flex items-center gap-1 rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 text-[9px] font-medium text-[#3F765A]">
      <IndianRupee className="h-2.5 w-2.5" />
      {formatPrice(totalRefund)} Refunded
    </span>
  );
}

/* ============================================================
   ACTION MENU (portal, max z-index, mobile bottom sheet)
============================================================ */

interface MenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

const MAX_Z = 2147483647;
const MENU_ITEM_HEIGHT = 44;
const MENU_WIDTH = 210;

function ActionMenu({
  actions,
  title = "Actions",
}: {
  actions: MenuAction[];
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    openUp: false,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuHeight = Math.max(actions.length, 1) * MENU_ITEM_HEIGHT + 8;

  const updateCoords = () => {
    if (!buttonRef.current) return;

    setIsMobile(window.innerWidth < 640);

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < menuHeight + 16 && spaceAbove > spaceBelow;

    let left = rect.right - MENU_WIDTH;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }
    if (left < 8) left = 8;

    setCoords({
      top: rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      left,
      openUp,
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) updateCoords();
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => updateCoords();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, menuHeight]);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [isOpen]);

  // Lock body scroll while mobile bottom sheet is open
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isMobile]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const renderActions = () =>
    actions.length === 0 ? (
      <div className="px-4 py-3 text-[12px] text-[#98a2b3]">
        No actions available
      </div>
    ) : (
      actions.map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => handleAction(a.onClick)}
          className={`flex w-full items-center gap-3 px-4 text-left text-[13px] font-medium transition-colors ${
            a.danger
              ? "text-[#DC2626] hover:bg-[#FEF2F2]"
              : "text-[#344054] hover:bg-[#F5F7FA]"
          }`}
          style={{ height: MENU_ITEM_HEIGHT }}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {a.icon}
          </span>
          <span className="truncate">{a.label}</span>
        </button>
      ))
    );

  const menu =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0"
            style={{ zIndex: MAX_Z, isolation: "isolate" }}
          >
            {isMobile ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  ref={menuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "tween", duration: 0.22 }}
                  className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[20px] bg-white pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-12px_40px_rgba(16,24,40,0.25)]"
                >
                  <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[#D0D5DD]" />

                  <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                    {title}
                  </p>

                  <div className="py-1">{renderActions()}</div>

                  <div className="px-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="h-11 w-full rounded-xl border border-[#E4E7EC] bg-white text-[13px] font-semibold text-[#475467]"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: "fixed",
                  left: coords.left,
                  width: MENU_WIDTH,
                  ...(coords.openUp
                    ? { bottom: coords.bottom }
                    : { top: coords.top }),
                  transformOrigin: coords.openUp ? "bottom right" : "top right",
                }}
                className="overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white py-1 shadow-[0_16px_40px_rgba(16,24,40,0.22)]"
              >
                {renderActions()}
              </motion.div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex h-9 w-9 items-center justify-center rounded-[9px] border transition-colors ${
          isOpen
            ? "border-[#0E1B3D]/30 bg-[#F2F4F7] text-[#0E1B3D]"
            : "border-[#E4E7EC] bg-white text-[#344054] hover:bg-[#F7F8FA]"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {menu}
    </div>
  );
}

/* ============================================================
   TRACK MODAL — EXISTING LARAVEL TIMELINE + LIVE INDIA POST
============================================================ */

const indiaPostEventLabel = (eventName: string) => {
  const key = String(eventName || "")
    .trim()
    .toLowerCase();
  if (key.includes("delivered(returned to sender)"))
    return "Returned to sender";
  if (key.includes("delivered(addressee)")) return "Delivered successfully";
  if (key.includes("returned to sender")) return "Returning to seller";
  if (key.includes("kept on hold")) return "Delivery temporarily on hold";
  if (key.includes("taken out for delivery")) return "Out for delivery";
  if (key.includes("received at destination"))
    return "Reached destination office";
  if (key.includes("item dispatched")) return "In transit";
  if (key.includes("item booked")) return "Shipment booked";
  if (key.includes("item pickedup") || key.includes("item picked up"))
    return "Parcel picked up";
  if (key.includes("pickup assigned")) return "Pickup scheduled";
  return eventName || "Shipment update";
};

function TrackModal({
  isOpen,
  onClose,
  order,
  tracking,
  loading,
  loadFailed,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  tracking: IndiaPostOrderTrackingData | null;
  loading: boolean;
  loadFailed: boolean;
  onRefresh: () => void;
}) {
  if (!isOpen) return null;

  const shipments = tracking?.shipments ?? [];
  const hasEvents = shipments.some((s) => s.events.length > 0);
  const formatEventDate = (value: string | null | undefined) => {
    if (!value) return "Date unavailable";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Date unavailable";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 font-sans backdrop-blur-[2px] sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[14px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E6E6E4] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-[#111111] text-white">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-[#171717]">
                Order Tracking
              </h3>
              <p className="truncate text-[10px] text-[#888888]">
                Order # {order?.order_reference || order?.order_id || "N/A"}
              </p>
              {order?.product_name && (
                <p className="mt-0.5 max-w-[230px] truncate text-[10px] text-[#555555]">
                  {order.product_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh India Post tracking"
              title="Refresh India Post tracking"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#555555] hover:bg-[#F8F8F8] disabled:opacity-50"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tracking"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] hover:text-[#111111]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="mb-5">
            <OrderJourneyTimeline order={order} tracking={tracking} />
          </div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-[#171717]">
              India Post Shipment Updates
            </h4>
            {loading && (
              <span className="flex items-center gap-1 text-[10px] text-[#888888]">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking...
              </span>
            )}
          </div>

          {loadFailed && !loading && (
            <div className="mb-4 rounded-[7px] border border-[#EFE2C6] bg-[#FFFBF2] p-3 text-[11px] leading-5 text-[#795F25]">
              Live courier tracking is temporarily unavailable. Your order
              updates are still shown below.
            </div>
          )}

          {!loadFailed && !loading && shipments.length === 0 && (
            <div className="mb-4 rounded-[7px] border border-[#ECECE9] bg-[#FAFAF9] px-3 py-3 text-[11px] leading-5 text-[#777777]">
              {tracking?.allocated_awb ? (
                <>
                  <p className="text-[#333333]">
                    India Post tracking number assigned:
                  </p>
                  <p className="mt-1 break-all font-mono text-[12px] font-semibold text-[#171717]">
                    {tracking.allocated_awb}
                  </p>
                  <p className="mt-1">
                    Courier booking pending. Movement updates will appear after
                    India Post accepts the shipment and scans it.
                  </p>
                </>
              ) : (
                "India Post tracking will appear here after a tracking number is allocated."
              )}
            </div>
          )}

          {tracking?.warning && !loading && (
            <div className="mb-3 rounded-[7px] border border-[#EFE2C6] bg-[#FFFBF2] p-3 text-[11px] text-[#795F25]">
              {tracking.warning}
            </div>
          )}

          {shipments.map((shipment) => (
            <div
              key={shipment.barcode}
              className="mb-4 overflow-hidden rounded-[9px] border border-[#E6E6E4]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECECE9] bg-[#FAFAF9] px-3.5 py-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[.06em] text-[#888888]">
                    India Post tracking number
                  </p>
                  <p className="mt-0.5 break-all font-mono text-[12px] font-semibold text-[#171717]">
                    {shipment.barcode}
                  </p>
                </div>
                <p className="text-[10px] font-medium text-[#555555]">
                  {shipment.latest_event || "Tracking updates pending"}
                </p>
              </div>
              {shipment.events.length ? (
                <div className="px-3.5 py-3">
                  {shipment.events.map((event, index) => (
                    <div
                      key={`${shipment.barcode}-${index}-${event.date ?? ""}`}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      {index < shipment.events.length - 1 && (
                        <div className="absolute left-[5px] top-[13px] h-[calc(100%-7px)] w-px bg-[#E6E6E4]" />
                      )}
                      <div
                        className={`relative z-10 mt-1 h-3 w-3 flex-shrink-0 rounded-full ${index === 0 ? "bg-[#3F765A]" : "bg-[#B6B6B6]"} ring-[3px] ring-white`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-[#171717]">
                          {indiaPostEventLabel(event.event)}
                        </p>
                        {event.office && (
                          <p className="mt-0.5 text-[10px] text-[#555555]">
                            {event.office}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-[#888888]">
                          {formatEventDate(event.date)}
                        </p>
                        {event.remarks && (
                          <p className="mt-0.5 text-[10px] text-[#888888]">
                            {event.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3.5 py-3 text-[11px] text-[#888888]">
                  No movement events have been reported for this tracking number
                  yet.
                </p>
              )}
            </div>
          ))}

          {!loading &&
            shipments.length > 0 &&
            !hasEvents &&
            !tracking?.warning && (
              <p className="mb-4 text-[10px] text-[#888888]">
                India Post events become available after the first physical
                scan.
              </p>
            )}
        </div>
        <div className="flex-shrink-0 border-t border-[#ECECE9] bg-[#FAFAF9] px-4 py-3 text-[10px] text-[#888888] sm:px-5">
          Tracking events are supplied by India Post and may take time to
          update.
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   WITHDRAW CONFIRMATION MODAL (cancel + return share one shell)
============================================================ */

function WithdrawConfirmModal({
  isOpen,
  order,
  isLoading,
  title,
  description,
  badgeLabel,
  note,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  order: any;
  isLoading: boolean;
  title: string;
  description: string;
  badgeLabel: string;
  note: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isLoading) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-[#E4E4E2] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.20)]"
          >
            <div className="border-b border-[#ECECE9] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#FBF3E4]">
                    <AlertTriangle className="h-5 w-5 text-[#A9711F]" />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#171717]">
                      {title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-[#777777]">
                      {description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px] border border-[#E0E0DE] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-[9px] border border-[#E7E7E4] bg-[#FAFAF9] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#999999]">
                      Order Reference
                    </p>

                    <p className="mt-1 truncate text-[12px] font-semibold text-[#171717]">
                      {order?.order_reference || "N/A"}
                    </p>
                  </div>

                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#EBD9B4] bg-[#FBF3E4] px-2.5 py-1 text-[9px] font-medium text-[#A9711F]">
                    <Clock className="h-3 w-3" />
                    {badgeLabel}
                  </span>
                </div>

                <div className="mt-3 border-t border-[#E9E9E6] pt-3">
                  <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#999999]">
                    Product
                  </p>

                  <p className="mt-1 truncate text-[12px] font-medium text-[#333333]">
                    {order?.product_name || "Order Item"}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E9E9E6] pt-3">
                  <span className="text-[10px] text-[#888888]">
                    Item Amount
                  </span>

                  <span className="text-[13px] font-semibold text-[#171717]">
                    {formatPrice(
                      Number(order?.final_amount) ||
                        Number(order?.line_total) ||
                        Number(order?.amount_paid) ||
                        0,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-[#EFE2C6] bg-[#FFFBF2] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#795F25]">{note}</p>
              </div>
            </div>

            <div className="border-t border-[#ECECE9] bg-white px-5 py-4">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[7px] border border-[#D9D9D6] bg-white px-4 py-2.5 text-[11px] font-medium text-[#555555] transition hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Request
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#A9711F] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#8F5F18] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      {confirmLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   ORDERS PAGE
============================================================ */

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [filter, setFilter] = useState("all");

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const searchParams = useSearchParams();

  const orderReferenceFromUrl = searchParams.get("order") || "";

  const [searchTerm, setSearchTerm] = useState(orderReferenceFromUrl);

  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<any>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [breakupOrder, setBreakupOrder] = useState<OrderGroup | null>(null);

  const [showTrackModal, setShowTrackModal] = useState(false);

  const [selectedOrderForAction, setSelectedOrderForAction] =
    useState<any>(null);

  const [selectedOrderForTracking, setSelectedOrderForTracking] =
    useState<any>(null);

  const [selectedOrderForWithdraw, setSelectedOrderForWithdraw] =
    useState<any>(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const [selectedOrderForWithdrawReturn, setSelectedOrderForWithdrawReturn] =
    useState<any>(null);

  const [isWithdrawReturnModalOpen, setIsWithdrawReturnModalOpen] =
    useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const [modalType, setModalType] = useState<"cancel" | "return">("cancel");

  const [invoiceLoadingOrders, setInvoiceLoadingOrders] = useState<
    Record<number, boolean>
  >({});

  const filterRef = useRef<HTMLDivElement>(null);

  /* ============================================================
     OUTSIDE CLICK (filter dropdown)
  ============================================================ */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ============================================================
     API
  ============================================================ */

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
  } = useGetMyOrdersQuery();

  const { data: statusesData, isLoading: statusesLoading } =
    useGetOrderStatusesQuery();

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [initiateReturn, { isLoading: isReturning }] =
    useInitiateReturnMutation();

  const [addRatingReview, { isLoading: isSubmittingReview }] =
    useAddRatingReviewMutation();

  const [withdrawCancelRequest, { isLoading: isWithdrawingCancelRequest }] =
    useWithdrawCancelRequestMutation();

  const [withdrawReturnRequest, { isLoading: isWithdrawingReturnRequest }] =
    useCancelReturnMutation();

  const [getInvoice] = useLazyGetInvoiceByOrderIdQuery();

  // DoP credentials stay server-side. Only request tracking when the popup opens.
  const [
    loadIndiaPostTracking,
    {
      data: indiaPostTrackingResponse,
      isFetching: isIndiaPostTracking,
      isError: isIndiaPostTrackingError,
    },
  ] = useLazyGetIndiaPostOrderTrackingQuery();

  /* ============================================================
     STATUS LIST (buyback statuses removed)
  ============================================================ */

  const statusList = useMemo(() => {
    const all = statusesData?.data || [];

    return all.filter((status: string) =>
      ALLOWED_FILTER_STATUSES.includes(normalizeStatus(status)),
    );
  }, [statusesData]);

  /* ============================================================
     ORDER GROUPS
  ============================================================ */

  const orderGroups = useMemo(() => {
    const records = Array.isArray((ordersData as any)?.data)
      ? (ordersData as any).data
      : Array.isArray((ordersData as any)?.data?.data)
        ? (ordersData as any).data.data
        : [];

    return normalizeOrders(records);
  }, [ordersData]);

  /* Auto-expand the order opened via ?order=REF */
  useEffect(() => {
    if (!orderReferenceFromUrl || orderGroups.length === 0) return;

    const match = orderGroups.find(
      (g) => g.order_reference === orderReferenceFromUrl,
    );

    if (match) {
      setExpandedOrder(match.key);
    }
  }, [orderReferenceFromUrl, orderGroups]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredGroups = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    const selectedFilter = normalizeStatus(filter);

    return orderGroups.filter((group) => {
      const matchesFilter =
        filter === "all" ||
        normalizeStatus(group.order_status) === selectedFilter ||
        group.lines.some(
          (line) => normalizeStatus(line.delivery_status) === selectedFilter,
        );

      if (!matchesFilter) return false;
      if (!searchValue) return true;

      return (
        group.order_reference?.toLowerCase().includes(searchValue) ||
        group.lines.some((line) =>
          line.product_name?.toLowerCase().includes(searchValue),
        )
      );
    });
  }, [orderGroups, filter, searchTerm]);

  /* ============================================================
     ELIGIBILITY HELPERS (per product line)
  ============================================================ */

  const isAllowedByApi = (order: any) =>
    Number(order.is_cancel_return_allowed) === 1 ||
    order.is_cancel_return_allowed === true;

  const canCancelOrder = (order: any) => {
    if (!isAllowedByApi(order)) return false;
    if (order.is_line_cancelled) return false;

    const status = normalizeStatus(order.delivery_status);

    return (
      status === "pending" || status === "confirmed" || status === "processing"
    );
  };

  const canWithdrawCancelRequest = (order: any) => {
    if (!order || order.is_line_cancelled) return false;

    return (
      normalizeStatus(order.delivery_status) === "cancel_pending" &&
      !!order.order_reference
    );
  };

  const canWithdrawReturnRequest = (order: any) => {
    if (!order || order.is_returned) return false;

    return (
      normalizeStatus(order.delivery_status) === "return_pending" &&
      !!order.order_reference
    );
  };

  const canReturnOrder = (order: any) => {
    if (!isAllowedByApi(order)) return false;

    const status = normalizeStatus(order.delivery_status);

    const quantity = Number(order.quantity) || 0;
    const returnedQuantity = Number(order.returned_quantity) || 0;
    const availableForReturn = Number(order.available_for_return) || 0;

    const isReturnable =
      Number(order.is_returnable) === 1 || order.is_returnable === true;

    return (
      status === "delivered" &&
      !order.is_returned &&
      isReturnable &&
      availableForReturn > 0 &&
      returnedQuantity < quantity
    );
  };

  const canReviewOrder = (order: any) => {
    const status = normalizeStatus(order.delivery_status);

    const hasExistingReview =
      order.product_reviews && order.product_reviews.length > 0;

    return status === "delivered" && !order.is_reviewed && !hasExistingReview;
  };

  const canShowInvoice = (order: any) => {
    const status = normalizeStatus(order.delivery_status);

    return (
      (status === "delivered" ||
        status === "return_pending" ||
        status === "return_approved" ||
        status === "returned" ||
        status === "refunded") &&
      !!order.invoice
    );
  };

  /* ============================================================
     WITHDRAW HANDLERS
  ============================================================ */

  const openWithdrawModal = (order: any) => {
    if (!canWithdrawCancelRequest(order)) return;

    setSelectedOrderForWithdraw(order);
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    if (isWithdrawingCancelRequest) return;

    setIsWithdrawModalOpen(false);
    setSelectedOrderForWithdraw(null);
  };

  const openWithdrawReturnModal = (order: any) => {
    if (!canWithdrawReturnRequest(order)) return;

    setSelectedOrderForWithdrawReturn(order);
    setIsWithdrawReturnModalOpen(true);
  };

  const closeWithdrawReturnModal = () => {
    if (isWithdrawingReturnRequest) return;

    setIsWithdrawReturnModalOpen(false);
    setSelectedOrderForWithdrawReturn(null);
  };

  const handleWithdrawCancelRequest = async () => {
    const order = selectedOrderForWithdraw;

    if (!canWithdrawCancelRequest(order)) return;

    try {
      await withdrawCancelRequest({
        orderReference: order.order_reference,
      }).unwrap();

      dispatch(
        showToast({
          message: "Cancellation request withdrawn successfully!",
          type: "success",
        }),
      );

      setIsWithdrawModalOpen(false);
      setSelectedOrderForWithdraw(null);

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to withdraw cancellation request. Please try again.",
          type: "error",
        }),
      );
    }
  };

  const handleWithdrawReturnRequest = async () => {
    const order = selectedOrderForWithdrawReturn;

    if (!canWithdrawReturnRequest(order)) return;

    const pendingReturn = order?.returns?.find(
      (r: any) =>
        r.status === "pending" &&
        r.type === "return" &&
        r.items?.some((item: any) => item.order_line_id === order.line_id),
    );

    const returnRequest =
      pendingReturn || order?.returns?.find((r: any) => r.status === "pending");

    if (!returnRequest?.id) {
      dispatch(
        showToast({
          message: "Return request ID not found. Please refresh and try again.",
          type: "error",
        }),
      );
      return;
    }

    try {
      await withdrawReturnRequest({
        returnId: returnRequest.id,
      }).unwrap();

      dispatch(
        showToast({
          message: "Return request withdrawn successfully!",
          type: "success",
        }),
      );

      setIsWithdrawReturnModalOpen(false);
      setSelectedOrderForWithdrawReturn(null);

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to withdraw return request. Please try again.",
          type: "error",
        }),
      );
    }
  };

  /* ============================================================
     CANCEL
  ============================================================ */

  const handleCancelOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);

    try {
      const orderReference = selectedOrderForAction?.order_reference;
      const orderLineId = selectedOrderForAction?.line_id;

      if (!orderReference) {
        throw new Error("Order reference is missing.");
      }

      if (!orderLineId) {
        throw new Error("Order line ID is missing.");
      }

      await cancelOrder({
        orderReference,
        orderLineId,
        reason: data.reason,
      }).unwrap();

      dispatch(
        showToast({
          message: "Order cancellation request submitted successfully!",
          type: "success",
        }),
      );

      setShowCancelModal(false);
      setSelectedOrderForAction(null);

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to cancel order. Please try again.",
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /* ============================================================
     RETURN
  ============================================================ */

  const handleReturnOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);

    try {
      const selectedQuantity =
        Number(data.quantity) ||
        Number(selectedOrderForAction?.available_for_return) ||
        Number(selectedOrderForAction?.quantity) ||
        1;

      const maxQuantity =
        Number(selectedOrderForAction?.available_for_return) ||
        Number(selectedOrderForAction?.quantity) ||
        1;

      if (selectedQuantity < 1) {
        throw new Error("Return quantity must be at least 1.");
      }

      if (selectedQuantity > maxQuantity) {
        throw new Error(`Return quantity cannot be more than ${maxQuantity}.`);
      }

      const returnMethod =
        data.return_method === "courier" ? "courier" : "doorstep";

      const courier =
        returnMethod === "courier" ? (data.courier || "").trim() : undefined;

      if (returnMethod === "courier" && !courier) {
        throw new Error("Please enter the courier name.");
      }

      const returnItems = [
        {
          order_line_id: selectedOrderForAction?.line_id,
          quantity: selectedQuantity,
          reason: data.reason,
          images: data.images || [],
        },
      ];

      const response = await initiateReturn({
        order_reference: selectedOrderForAction?.order_reference,
        return_method: returnMethod,
        courier,
        items: returnItems,
      }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Return request submitted successfully!",
          type: "success",
        }),
      );

      setShowCancelModal(false);
      setSelectedOrderForAction(null);

      await refetch();

      return response;
    } catch (error: any) {
      let errorMessage = "Failed to submit return request. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat();
        errorMessage = errorMessages.join(" ");
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /* ============================================================
     REVIEW
  ============================================================ */

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const files: File[] = Array.isArray(reviewData?.images)
        ? reviewData.images.filter(
            (img: any): img is File => img instanceof File,
          )
        : [];

      const rating = Number(reviewData?.rating);

      const reviewText =
        reviewData?.review_text ??
        reviewData?.reviewText ??
        reviewData?.review ??
        "";

      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Please select a valid rating.");
      }

      if (!reviewText.trim()) {
        throw new Error("Please enter your review.");
      }

      if (!selectedOrderForReview?.line_id) {
        throw new Error("Order line ID is missing.");
      }

      if (!selectedOrderForReview?.product_id) {
        throw new Error("Product ID is missing.");
      }

      const response = await addRatingReview({
        rating,
        review_text: reviewText.trim(),
        order_id: selectedOrderForReview.order_id,
        order_line_id: selectedOrderForReview.line_id,
        product_id: selectedOrderForReview.product_id,
        images: files,
      }).unwrap();

      dispatch(
        showToast({
          message: response?.message || "Review submitted successfully!",
          type: "success",
        }),
      );

      setIsReviewModalOpen(false);
      setSelectedOrderForReview(null);

      await refetch();

      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to submit review. Please try again.",
          type: "error",
        }),
      );

      throw error;
    }
  };

  /* ============================================================
     INVOICE
  ============================================================ */

  const handleInvoiceDownload = async (orderId: number) => {
    setInvoiceLoadingOrders((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      const result = await getInvoice(orderId).unwrap();

      if (result?.data) {
        await generateInvoicePDF(result.data);

        dispatch(
          showToast({
            message: "Invoice generated successfully!",
            type: "success",
          }),
        );
      } else {
        dispatch(
          showToast({
            message: "Invoice not available for this order",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Invoice error:", error);

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to fetch invoice. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setInvoiceLoadingOrders((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  /* ============================================================
     MODAL OPENERS
  ============================================================ */

  const openReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
  };

  const openCancelModal = (order: any) => {
    setSelectedOrderForAction(order);
    setModalType("cancel");
    setShowCancelModal(true);
  };

  const openReturnModal = (order: any) => {
    setSelectedOrderForAction(order);
    setModalType("return");
    setShowCancelModal(true);
  };

  const navigateToProduct = (line: any) => {
    if (!line?.product_slug) {
      dispatch(
        showToast({
          message: "Product link not available.",
          type: "error",
        }),
      );
      return;
    }

    router.push(`/product/${encodeURIComponent(line.product_slug)}`);
  };

  // Reference + internal order ID come from authenticated My Orders data.
  const getTrackingIdentifier = (order: any) => {
    const reference =
      typeof order?.order_reference === "string"
        ? order.order_reference.trim()
        : "";
    const id = Number(order?.order_id);
    const validId = Number.isSafeInteger(id) && id > 0;

    if (reference && validId) {
      return { orderReference: reference, orderId: id };
    }
    if (reference) return reference;
    return validId ? id : null;
  };

  const openTrackModal = (group: OrderGroup) => {
    const trackingOrder = {
      ...group.representative,
      delivery_status: group.order_status,
      order_status: group.order_status,
      product_name:
        group.lines.length > 1
          ? `${group.lines.length} products`
          : group.representative.product_name,
    };

    setSelectedOrderForTracking(trackingOrder);
    setShowTrackModal(true);

    const identifier = getTrackingIdentifier(trackingOrder);
    if (identifier !== null) {
      void loadIndiaPostTracking(identifier, false);
    }
  };

  const refreshIndiaPostTracking = () => {
    const identifier = getTrackingIdentifier(selectedOrderForTracking);
    if (identifier !== null) {
      void loadIndiaPostTracking(identifier, false);
    }
  };

  /* ============================================================
     ANIMATION
  ============================================================ */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  /* ============================================================
     STATS (calculated from loaded orders)
  ============================================================ */

  const stats = useMemo(
    () => [
      {
        label: "Total orders",
        value: orderGroups.length,
        icon: Package,
        color: "text-[#234E9A]",
        bg: "bg-[#EDF3FF]",
      },
      {
        label: "Delivered",
        value: orderGroups.filter(
          (g) => normalizeStatus(g.order_status) === "delivered",
        ).length,
        icon: Check,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
      },
      {
        label: "In transit",
        value: orderGroups.filter((g) =>
          g.lines.some((l) =>
            ["dispatched", "shipped", "out_for_delivery"].includes(
              normalizeStatus(l.delivery_status),
            ),
          ),
        ).length,
        icon: Truck,
        color: "text-violet-700",
        bg: "bg-violet-50",
      },
      {
        label: "Returns / Refunds",
        value: orderGroups.filter((g) =>
          g.lines.some((l) =>
            [
              "return_pending",
              "return_approved",
              "returned",
              "refunded",
            ].includes(normalizeStatus(l.delivery_status)),
          ),
        ).length,
        icon: RotateCcw,
        color: "text-amber-700",
        bg: "bg-amber-50",
      },
    ],
    [orderGroups],
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (ordersLoading || statusesLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-white font-sans">
        <div className="text-center">
          <Loding />
        </div>
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <div
        id="toast-portal"
        className="fixed right-4 top-4 z-[9999] w-auto max-w-md"
      />

      <div className="min-h-screen font-sans">
        {/* REVIEW MODAL */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedOrderForReview(null);
          }}
          order={selectedOrderForReview}
          onSubmit={handleReviewSubmit}
          isLoading={isSubmittingReview}
        />

        {/* CANCEL / RETURN MODAL */}
        <OrderCancelModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrderForAction(null);
          }}
          orderReference={selectedOrderForAction?.order_reference || ""}
          onCancel={
            modalType === "cancel" ? handleCancelOrder : handleReturnOrder
          }
          isLoading={isProcessing || isCancelling || isReturning}
          maxImages={5}
          maxFileSize={5}
          minReasonLength={10}
          modalType={modalType}
          order={selectedOrderForAction}
        />

        {/* WITHDRAW CANCEL */}
        <WithdrawConfirmModal
          isOpen={isWithdrawModalOpen}
          order={selectedOrderForWithdraw}
          isLoading={isWithdrawingCancelRequest}
          title="Withdraw Cancel Request?"
          description="You are about to withdraw your cancellation request for this item."
          badgeLabel="Cancel Pending"
          note="After withdrawing, this item will no longer be in the cancellation-request state. You can place a new cancellation request later only if it is still eligible."
          confirmLabel="Withdraw Request"
          onClose={closeWithdrawModal}
          onConfirm={handleWithdrawCancelRequest}
        />

        {/* WITHDRAW RETURN */}
        <WithdrawConfirmModal
          isOpen={isWithdrawReturnModalOpen}
          order={selectedOrderForWithdrawReturn}
          isLoading={isWithdrawingReturnRequest}
          title="Withdraw Return Request?"
          description="You are about to withdraw your return request for this item."
          badgeLabel="Return Pending"
          note="After withdrawing, this item will no longer be in the return-request state. You can place a new return request later only if it is still eligible."
          confirmLabel="Withdraw Return Request"
          onClose={closeWithdrawReturnModal}
          onConfirm={handleWithdrawReturnRequest}
        />

        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
           
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-stretch justify-between gap-3 rounded-[14px] border border-[#E4EAF4] bg-white p-3.5 sm:p-4 md:flex-row md:items-center"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] font-medium text-[#171717]">
                  Filter:
                </span>

                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() =>
                      setIsFilterDropdownOpen(!isFilterDropdownOpen)
                    }
                    className="flex h-[40px] items-center gap-2 rounded-[10px] border border-[#E3EAF5] bg-[#F8FAFD] px-3.5 text-[12px] font-medium text-[#171717] transition hover:border-[#BDBDBA]"
                  >
                    <Filter className="h-3.5 w-3.5 text-[#888888]" />

                    <span>
                      {filter === "all"
                        ? "All Statuses"
                        : getStatusDisplayName(filter)}
                    </span>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#888888] transition-transform ${
                        isFilterDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 max-h-[320px] w-52 overflow-y-auto rounded-[10px] border border-[#E4E4E2] bg-white py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]">
                      <button
                        onClick={() => {
                          setFilter("all");
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-[12px] transition-colors hover:bg-[#FAFAF9] ${
                          filter === "all"
                            ? "bg-[#FAFAF9] font-medium text-[#171717]"
                            : "text-[#666666]"
                        }`}
                      >
                        All Statuses
                      </button>

                      {statusList.map((status: string) => {
                        const statusKey = normalizeStatus(status);

                        return (
                          <button
                            key={status}
                            onClick={() => {
                              setFilter(statusKey);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] transition-colors hover:bg-[#FAFAF9] ${
                              normalizeStatus(filter) === statusKey
                                ? "bg-[#FAFAF9] font-medium text-[#171717]"
                                : "text-[#666666]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                statusColors[statusKey]
                                  ?.split(" ")[0]
                                  ?.replace("text-", "bg-") || "bg-gray-400"
                              }`}
                            />

                            {getStatusDisplayName(status)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b6c3]" />

                <input
                  type="text"
                  placeholder="Search by order reference or product"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[40px] w-full rounded-[10px] border border-[#E3EAF5] bg-[#F8FAFD] py-2 pl-10 pr-3 text-[12px] text-[#171717] outline-none transition placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white"
                />
              </div>
            </motion.div>

            {/* ==================================================
                ORDERS (GROUPED BY ORDER)
            ================================================== */}

            {filteredGroups.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="rounded-[14px] border border-dashed border-[#DCE4F0] bg-[#FAFCFF] p-10 text-center sm:p-12"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <Package className="h-7 w-7 text-[#999999]" />
                </div>

                <h3 className="mt-4 text-[17px] font-semibold text-[#171717]">
                  No orders found
                </h3>

                <p className="mt-1.5 text-[12px] text-[#888888]">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter."
                    : "You haven't placed any orders yet."}
                </p>

                {(searchTerm || filter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                    className="mt-4 rounded-[8px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} className="space-y-4">
                {filteredGroups.map((group) => {
                  const { key, lines, representative } = group;

                  const isExpanded = expandedOrder === key;

                  const orderStatus = normalizeStatus(group.order_status);

                  const StatusIcon = getStatusIcon(group.order_status);

                  const statusColor = getStatusColor(group.order_status);

                  const isInvoiceLoading =
                    invoiceLoadingOrders[group.order_id] || false;

                  const orderHasInvoice = lines.some(canShowInvoice);

                  /* unique credit notes across all products of this order */
                  const creditNotes = Array.from(
                    new Map(
                      lines
                        .flatMap((l) => l.credit_notes || [])
                        .map((c: any) => [c.id, c]),
                    ).values(),
                  );

                  const linesWithReviews = lines.filter(
                    (l) => l.product_reviews && l.product_reviews.length > 0,
                  );

                  /* order level menu */
                  const orderActions: MenuAction[] = [
                    {
                      key: "track",
                      label: "Track Order",
                      icon: <Truck className="h-4 w-4 text-[#1f9d6b]" />,
                      onClick: () => openTrackModal(group),
                    },
                    {
                      key: "breakup",
                      label: "View Breakup",
                      icon: (
                        <LuReceiptIndianRupee className="h-4 w-4 text-[#3955A6]" />
                      ),
                      onClick: () => setBreakupOrder(group),
                    },
                  ];

                  if (orderHasInvoice) {
                    orderActions.push({
                      key: "invoice",
                      label: "Download Invoice",
                      icon: <FileText className="h-4 w-4 text-[#344054]" />,
                      onClick: () => handleInvoiceDownload(group.order_id),
                    });
                  }

                  const orderMenu = (
                    <ActionMenu actions={orderActions} title="Order actions" />
                  );

                  return (
                    <motion.article
                      key={key}
                      variants={itemVariants}
                      className={`overflow-visible rounded-[16px] border bg-white shadow-[0_5px_22px_rgba(20,35,65,0.045)] ${
                        orderStatus === "cancelled"
                          ? "border-[#F0CFCF]"
                          : orderStatus === "refunded" ||
                              creditNotes.length > 0
                            ? "border-[#CFE0D4]"
                            : "border-[#E4EAF4]"
                      }`}
                    >
                      {/* ORDER HEADER */}
                      <div className="border-b border-[#EDF1F7] p-3.5 sm:p-5">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrder(isExpanded ? null : key)
                            }
                            aria-label={
                              isExpanded
                                ? "Collapse order details"
                                : "Expand order details"
                            }
                            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F2] bg-[#F8FAFD] text-[#36527B] transition hover:bg-[#EEF3FA]"
                          >
                            <ChevronDown
                              size={17}
                              className={`transition-transform duration-300 ease-in-out ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="break-all text-[13px] font-extrabold tracking-[-0.01em] text-[#122449] sm:text-[14px]">
                                Order #{group.order_reference}
                              </h4>

                              <span
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusColor}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {getStatusDisplayName(group.order_status)}
                              </span>

                              {creditNotes.length > 0 && (
                                <RefundBadge creditNotes={creditNotes} />
                              )}
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#8592A7] sm:text-[11px]">
                              <span>Placed {formatDate(group.order_date)}</span>
                              <span>
                                {lines.length}{" "}
                                {lines.length === 1 ? "product" : "products"}
                              </span>
                              <span>
                                {group.quantity}{" "}
                                {group.quantity === 1 ? "item" : "items"}
                              </span>
                              <span className="capitalize">
                                Payment:{" "}
                                {getStatusDisplayName(
                                  representative.payment_status,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Desktop: total + menu */}
                          <div className="hidden shrink-0 items-start gap-4 sm:flex">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8A96A9]">
                                Order total
                              </span>
                              <span className="text-[17px] font-extrabold tabular-nums text-[#172A4D]">
                                {formatPrice(group.total)}
                              </span>
                            </div>
                            {orderMenu}
                          </div>

                          {/* Mobile: menu only */}
                          <div className="shrink-0 sm:hidden">{orderMenu}</div>
                        </div>

                        {/* Mobile: total row */}
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#F6F8FC] px-3.5 py-2.5 sm:hidden">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A96A9]">
                            Order total
                          </span>
                          <span className="text-[16px] font-extrabold tabular-nums text-[#172A4D]">
                            {formatPrice(group.total)}
                          </span>
                        </div>
                      </div>

                      {/* PRODUCTS IN THIS ORDER */}
                      <div className="divide-y divide-[#EEF2F7]">
                        {lines.map((line) => {
                          const lineStatus = normalizeStatus(
                            line.delivery_status,
                          );

                          const LineIcon = getStatusIcon(line.delivery_status);

                          const lineCancelled = line.is_line_cancelled;

                          const hasReviews =
                            line.product_reviews &&
                            line.product_reviews.length > 0;

                          const returnTill = toDate(
                            line.timeline?.return_applicable_till,
                          );

                          const returnOpen =
                            !!returnTill && returnTill.getTime() > Date.now();

                          const lineActions: MenuAction[] = [];

                          if (line.product_slug) {
                            lineActions.push({
                              key: "view-product",
                              label: "View Product",
                              icon: (
                                <ShoppingBag className="h-4 w-4 text-[#3955A6]" />
                              ),
                              onClick: () => navigateToProduct(line),
                            });
                          }

                          if (canReviewOrder(line) && !lineCancelled) {
                            lineActions.push({
                              key: "review",
                              label: "Write Review",
                              icon: (
                                <Star className="h-4 w-4 text-[#B8935A]" />
                              ),
                              onClick: () => openReviewModal(line),
                            });
                          }

                          if (canReturnOrder(line) && !lineCancelled) {
                            lineActions.push({
                              key: "return",
                              label: "Return Item",
                              icon: (
                                <RotateCcw className="h-4 w-4 text-[#EA580C]" />
                              ),
                              onClick: () => openReturnModal(line),
                            });
                          }

                          if (canWithdrawReturnRequest(line)) {
                            lineActions.push({
                              key: "withdraw-return",
                              label: "Withdraw Return Request",
                              icon: <Undo2 className="h-4 w-4" />,
                              onClick: () => openWithdrawReturnModal(line),
                              danger: true,
                            });
                          }

                          if (canCancelOrder(line)) {
                            lineActions.push({
                              key: "cancel",
                              label: "Cancel Item",
                              icon: <Ban className="h-4 w-4" />,
                              onClick: () => openCancelModal(line),
                              danger: true,
                            });
                          }

                          if (canWithdrawCancelRequest(line)) {
                            lineActions.push({
                              key: "withdraw-cancel",
                              label: "Withdraw Cancel Request",
                              icon: <Undo2 className="h-4 w-4" />,
                              onClick: () => openWithdrawModal(line),
                              danger: true,
                            });
                          }

                          return (
                            <div
                              key={line.display_id}
                              className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                            >
                              {/* Image + name */}
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => navigateToProduct(line)}
                                  title={`View ${line.product_name}`}
                                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5EAF1] bg-[#FAFBFD] transition hover:border-[#B8C8DE] sm:h-[76px] sm:w-[76px]"
                                >
                                  {line.primary_image ? (
                                    <Image
                                      src={line.primary_image}
                                      alt={line.product_name || "Product"}
                                      fill
                                      sizes="76px"
                                      className="object-contain p-1.5"
                                    />
                                  ) : (
                                    <span className="flex h-full w-full items-center justify-center">
                                      <Package className="h-6 w-6 text-[#A6B1C0]" />
                                    </span>
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => navigateToProduct(line)}
                                    className="line-clamp-2 max-w-full text-left text-[12.5px] font-bold leading-snug text-[#1B2B45] transition hover:text-[#315B87] sm:text-[13px]"
                                  >
                                    {line.product_name || "Product"}
                                  </button>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-[#8290A5]">
                                    <span>
                                      Qty:{" "}
                                      <strong className="text-[#485A73]">
                                        {line.quantity}
                                      </strong>
                                    </span>

                                    {line.product_code ? (
                                      <span>Code: {line.product_code}</span>
                                    ) : null}

                                    <span
                                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${getStatusColor(
                                        line.delivery_status,
                                      )}`}
                                    >
                                      <LineIcon className="h-3 w-3" />
                                      {getStatusDisplayName(
                                        line.delivery_status,
                                      )}
                                    </span>

                                    {hasReviews && (
                                      <span className="flex items-center gap-1 rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 font-semibold text-[#3F765A]">
                                        <MessageCircle className="h-3 w-3" />
                                        Reviewed
                                      </span>
                                    )}

                                    {line.is_reviewed && !hasReviews && (
                                      <span className="flex items-center gap-1 rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 font-semibold text-[#3F765A]">
                                        <Check className="h-3 w-3" />
                                        Review submitted
                                      </span>
                                    )}
                                  </div>

                                  {lineStatus === "delivered" && returnTill && (
                                    <p
                                      className={`mt-1.5 text-[10px] font-medium ${
                                        returnOpen
                                          ? "text-[#26805E]"
                                          : "text-[#B45B4B]"
                                      }`}
                                    >
                                      {returnOpen
                                        ? "Return window closes on"
                                        : "Return window closed on"}{" "}
                                      {formatDate(
                                        line.timeline.return_applicable_till,
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Price + menu */}
                              <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#EEF2F7] pt-3 sm:min-w-[170px] sm:justify-end sm:border-0 sm:pt-0">
                                <div className="sm:text-right">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#91A0B4]">
                                    Item total
                                  </p>
                                  <p
                                    className={`mt-0.5 text-[14px] font-extrabold tabular-nums ${
                                      lineCancelled
                                        ? "text-[#B24C4C] line-through"
                                        : "text-[#1B2B45]"
                                    }`}
                                  >
                                    {formatPrice(line.final_amount)}
                                  </p>
                                  <p className="mt-0.5 text-[10px] text-[#8B98AA]">
                                    {formatPrice(Number(line.unit_price) || 0)}{" "}
                                    each
                                  </p>
                                </div>

                                <ActionMenu
                                  actions={lineActions}
                                  title="Item actions"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* EXPAND FOOTER */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF1F7] bg-[#FBFCFE] px-4 py-3 sm:px-5">
                        <p className="text-[10.5px] text-[#8996A9]">
                          {lines.length}{" "}
                          {lines.length === 1 ? "product" : "products"} in this
                          order
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrder(isExpanded ? null : key)
                          }
                          aria-expanded={isExpanded}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#DCE5F1] bg-white px-3.5 py-2 text-[10.5px] font-bold text-[#31527B] transition hover:border-[#B8C9E0] hover:bg-[#F6F9FD]"
                        >
                          {isExpanded
                            ? "Hide Order Details"
                            : "View Order Details"}
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ease-in-out ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* EXPANDED DETAILS */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden rounded-b-[16px] border-t border-[#E6E6E4] bg-[#FAFBFC]"
                          >
                            <div className="space-y-4 p-4 sm:p-5">
                              <div className="overflow-hidden rounded-[12px] border border-[#E1E5EB] bg-white">
                                <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Order Reference
                                    </p>
                                    <p className="mt-1 break-all text-[12px] font-medium text-[#171717]">
                                      {group.order_reference || "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Payment Status
                                    </p>
                                    <p className="mt-1">
                                      <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                                          representative.payment_status ===
                                          "paid"
                                            ? "bg-[#F1F7F3] text-[#3F765A]"
                                            : representative.payment_status ===
                                                "failed"
                                              ? "bg-[#FDF2F2] text-[#B24C4C]"
                                              : "bg-[#FBF3E4] text-[#A9711F]"
                                        }`}
                                      >
                                        {representative.payment_status || "N/A"}
                                      </span>
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Payment Method
                                    </p>
                                    <p className="mt-1 text-[12px] uppercase text-[#171717]">
                                      {representative.payment_gateway || "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Transaction ID
                                    </p>
                                    <p className="mt-1 break-all text-[12px] text-[#171717]">
                                      {representative.gateway_transaction_id ||
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Total Payable
                                    </p>
                                    <p className="mt-1 text-[16px] font-bold text-[#101828]">
                                      {formatPrice(group.total)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Coins Redeemed
                                    </p>
                                    <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[#1F7A56]">
                                      <Coins size={13} />
                                      {representative.coin_redeemed || 0}
                                    </p>
                                  </div>
                                </div>

                                {representative.delivery_address && (
                                  <div className="border-t border-[#EDF0F3] px-4 py-4 sm:px-5">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A92A6]">
                                      Shipping Address
                                    </p>
                                    <div className="mt-1.5 flex items-start gap-2 text-[12.5px] leading-5 text-[#344054]">
                                      <MapPin
                                        size={14}
                                        className="mt-0.5 shrink-0 text-[#98a2b3]"
                                      />
                                      <span className="break-words">
                                        {representative.delivery_address
                                          ?.full_address || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* REVIEWS */}
                              {linesWithReviews.length > 0 && (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                    Product Reviews
                                  </p>

                                  {linesWithReviews.map((l) => (
                                    <div key={l.display_id}>
                                      {lines.length > 1 && (
                                        <p className="mb-1.5 text-[11px] font-semibold text-[#344054]">
                                          {l.product_name}
                                        </p>
                                      )}
                                      <ReviewDisplay
                                        reviews={l.product_reviews}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* REFUND / CREDIT NOTES */}
                              {creditNotes.length > 0 && (
                                <RefundCreditDisplay
                                  creditNotes={creditNotes}
                                />
                              )}

                              {/* FOOTER ACTIONS */}
                              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#E6E6E4] pt-4">
                                <button
                                  type="button"
                                  onClick={() => openTrackModal(group)}
                                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#CBD5F0] bg-[#EEF1FB] px-3.5 py-2 text-[11px] font-semibold text-[#3E5AA8] transition hover:bg-[#3E5AA8] hover:text-white"
                                >
                                  <Truck className="h-3.5 w-3.5" />
                                  Track Order
                                </button>

                                <div className="flex flex-wrap items-center gap-2">
                                  {orderHasInvoice && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleInvoiceDownload(group.order_id)
                                      }
                                      disabled={isInvoiceLoading}
                                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D7D7D5] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#171717] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isInvoiceLoading ? (
                                        <>
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          Loading...
                                        </>
                                      ) : (
                                        <>
                                          <FileText className="h-3.5 w-3.5" />
                                          Invoice
                                        </>
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setBreakupOrder(group)}
                                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition hover:bg-[#ECEFFC]"
                                  >
                                    <LuReceiptIndianRupee size={14} />
                                    View Breakup
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ========================================================
            BREAKUP MODAL
        ======================================================== */}

        <AnimatePresence>
          {breakupOrder && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-3 font-sans backdrop-blur-[2px] sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBreakupOrder(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 12 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[16px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-[#171717]">
                      Order Price Breakup
                    </h3>

                    <p className="mt-0.5 break-all text-[10px] text-[#888888]">
                      {breakupOrder.order_reference}
                    </p>
                  </div>

                  <button
                    onClick={() => setBreakupOrder(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                  <div className="space-y-2.5">
                    {breakupOrder.lines.map((item: any) => {
                      const isCancelled =
                        normalizeStatus(item.delivery_status) === "cancelled";

                      return (
                        <div
                          key={item.line_id}
                          className={`flex items-center justify-between gap-3 rounded-[10px] border p-3 sm:p-3.5 ${
                            isCancelled
                              ? "border-[#F0CFCF] bg-[#FDF2F2]"
                              : "border-[#E4E4E2] bg-[#FAFAF9]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white">
                              {item.primary_image ? (
                                <Image
                                  src={item.primary_image}
                                  alt={item.product_name || "Product"}
                                  fill
                                  sizes="48px"
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Package className="h-4 w-4 text-[#999999]" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-medium text-[#171717]">
                                {item.product_name}
                                {isCancelled && (
                                  <span className="ml-2 text-[10px] font-medium text-[#B24C4C]">
                                    (Cancelled)
                                  </span>
                                )}
                              </p>

                              <p className="mt-0.5 text-[10px] text-[#888888]">
                                Qty: {item.quantity} • GST: {item.gst_rate}%
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={`text-[14px] font-semibold ${
                                isCancelled
                                  ? "text-[#B24C4C]"
                                  : "text-[#111111]"
                              }`}
                            >
                              {formatPrice(Number(item.final_amount) || 0)}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#888888]">
                              {formatPrice(Number(item.unit_price) || 0)} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t border-[#E6E6E4] pt-4">
                    <div className="flex justify-between py-1.5 text-[12px]">
                      <span className="text-[#888888]">Subtotal</span>

                      <span className="font-medium text-[#171717]">
                        {formatPrice(
                          Number(breakupOrder.representative.subtotal) || 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 text-[12px]">
                      <span className="text-[#888888]">GST</span>

                      <span className="font-medium text-[#171717]">
                        {formatPrice(
                          Number(breakupOrder.representative.total_gst) || 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 text-[12px]">
                      <span className="text-[#888888]">Shipping</span>

                      <span className="font-medium text-[#171717]">
                        {formatPrice(
                          Number(breakupOrder.representative.shipping_charge) ||
                            0,
                        )}
                      </span>
                    </div>

                    {Number(breakupOrder.representative.coin_redeemed_amount) >
                      0 && (
                      <div className="flex justify-between py-1.5 text-[12px]">
                        <span className="text-[#888888]">Coins Redeemed</span>

                        <span className="font-medium text-[#3F765A]">
                          -
                          {formatPrice(
                            Number(
                              breakupOrder.representative.coin_redeemed_amount,
                            ) || 0,
                          )}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between border-t border-[#E6E6E4] pt-3">
                      <span className="text-[13px] font-semibold text-[#171717]">
                        Final Amount
                      </span>

                      <span className="text-[17px] font-semibold text-[#111111]">
                        {formatPrice(breakupOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            TRACK MODAL
        ======================================================== */}

        <AnimatePresence>
          {showTrackModal && (
            <TrackModal
              isOpen={showTrackModal}
              onClose={() => {
                setShowTrackModal(false);
                setSelectedOrderForTracking(null);
              }}
              order={selectedOrderForTracking}
              tracking={
                indiaPostTrackingResponse?.data &&
                // Never show previous order's cached tracking in a new modal.
                Number(indiaPostTrackingResponse.data.order_id) ===
                  Number(selectedOrderForTracking?.order_id) &&
                // Reference must also match whenever Laravel sends it.
                (!indiaPostTrackingResponse.data.order_reference ||
                  indiaPostTrackingResponse.data.order_reference ===
                    selectedOrderForTracking?.order_reference)
                  ? indiaPostTrackingResponse.data
                  : null
              }
              loading={isIndiaPostTracking}
              loadFailed={isIndiaPostTrackingError}
              onRefresh={refreshIndiaPostTracking}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}