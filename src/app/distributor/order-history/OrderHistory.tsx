"use client";

import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useAddRatingReviewMutation,
  useWithdrawCancelRequestMutation,
  useCancelReturnMutation,
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
  CreditCard,
  Coins,
  Truck,
  Receipt,
  User,
  MapPin,
  FileText,
  Clock,
  BadgeCheck,
  Undo2,
  Camera,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { LuReceiptIndianRupee } from "react-icons/lu";

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
  images: Array<{ id: number; image_url: string; is_primary: boolean }>;
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
  returns: any[];
  credit_notes: any[];
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";
const RED = "#DC2626";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  confirmed: { color: INDIGO, bg: "#eceffb" },
  delivered: { color: EMERALD, bg: "#eaf7f0" },
  pending: { color: BRASS, bg: "#f8f1e4" },
  shipped: { color: "#7c3aed", bg: "#f3e8ff" },
  cancelled: { color: "#dc2626", bg: "#fef2f2" },
  returned: { color: "#ea580c", bg: "#fff7ed" },
  partial_returned: { color: "#ea580c", bg: "#fff7ed" },
  refunded: { color: "#ea580c", bg: "#fff7ed" },
  cancel_pending: { color: "#A9711F", bg: "#FBF3E4" },
  New: { color: INDIGO, bg: "#eceffb" },
  Completed: { color: EMERALD, bg: "#eaf7f0" },
  Pending: { color: BRASS, bg: "#f8f1e4" },
};

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "Rs. 0.00";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(num)) return "Rs. 0.00";
  return `Rs. ${num.toFixed(2)}`;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function normalizeStatus(status?: string | null) {
  if (!status) return "";
  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

// ==================== RETURN HELPERS ====================
const CANCELLABLE_RETURN_STATUSES = [
  "requested",
  "pending",
  "approved",
  "initiated",
];

function isReturnCompleted(order: OrderLineItem): boolean {
  const orderStatus = normalizeStatus(order.order_status);
  const deliveryStatus = normalizeStatus(order.delivery_status);
  const returnStatus = normalizeStatus(order.return_status);

  if (
    orderStatus === "returned" ||
    orderStatus === "partial_returned" ||
    deliveryStatus === "refunded" ||
    deliveryStatus === "returned" ||
    returnStatus === "returned" ||
    returnStatus === "completed"
  ) {
    return true;
  }

  return (order.returns || []).some((ret: any) => {
    const status = normalizeStatus(ret.status);
    const refundStatus = normalizeStatus(ret.refund_status);
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
  });
}

function isReturnWindowOpen(
  returnApplicableTill: string | null | undefined,
): boolean {
  if (!returnApplicableTill) return false;
  const deadline = new Date(returnApplicableTill);
  if (isNaN(deadline.getTime())) return false;
  return deadline.getTime() > Date.now();
}

function canInitiateReturn(order: OrderLineItem): boolean {
  if (!order.is_returnable) return false;
  if ((order.available_for_return || 0) <= 0) return false;
  if (isReturnCompleted(order)) return false;

  if (!isReturnWindowOpen(order.timeline?.return_applicable_till)) return false;

  const hasActiveReturn = (order.returns || []).some((ret: any) => {
    const status = normalizeStatus(ret.status);
    if (!CANCELLABLE_RETURN_STATUSES.includes(status)) return false;
    return (ret.items || []).some(
      (it: any) => Number(it.order_line_id) === Number(order.line_id),
    );
  });
  if (hasActiveReturn) return false;

  return true;
}

function findCancellableReturn(
  order: OrderLineItem,
): { returnId: number } | null {
  const till = order.timeline?.return_applicable_till;
  if (!isReturnWindowOpen(till)) return null;
  if (isReturnCompleted(order)) return null;

  const activeReturn = (order.returns || []).find((ret: any) => {
    const status = normalizeStatus(ret.status);
    if (!CANCELLABLE_RETURN_STATUSES.includes(status)) return false;

    return (ret.items || []).some((it: any) => {
      if (Number(it.order_line_id) !== Number(order.line_id)) return false;
      const itemStatus = normalizeStatus(it.return_status);
      return CANCELLABLE_RETURN_STATUSES.includes(itemStatus);
    });
  });

  if (!activeReturn) return null;
  return { returnId: activeReturn.id };
}

// ==================== SHARED MODAL SHELL ====================
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
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]`}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ==================== ORDER IMAGE GALLERY ====================
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen, order?.order_id, order?.line_id]);

  if (!isOpen || !order) return null;

  const images = (order.images || [])
    .filter((image) => !!image?.image_url)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  if (images.length === 0 && order.primary_image) {
    images.push({
      id: -1,
      image_url: order.primary_image,
      is_primary: true,
    });
  }

  if (images.length === 0) {
    return (
      <ModalShell onClose={onClose} maxWidth="max-w-md">
        <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F7F7F6]">
              <Package className="h-4 w-4 text-[#777777]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#171717]">
              Product Images
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] hover:text-[#111111]"
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

  const activeImage = images[activeIndex] || images[0];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-[#171717]">
            {order.product_name}
          </h3>
          <p className="mt-0.5 text-[10px] text-[#888888]">
            {order.order_reference} • {images.length} image
            {images.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
          aria-label="Close product images"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 px-5 py-4">
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-[#F8F8F7] sm:min-h-[430px]">
          <Image
            src={activeImage.image_url}
            alt={order.product_name || "Product image"}
            fill
            sizes="(max-width: 640px) 90vw, 620px"
            className="object-contain p-4 sm:p-6"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#555555] shadow-sm transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.id || `${image.image_url}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[7px] border bg-white transition ${
                  activeIndex === index
                    ? "border-[#0E1B3D] ring-2 ring-[#0E1B3D]/10"
                    : "border-[#E4E4E2] hover:border-[#BDBDBA]"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.image_url}
                  alt={`${order.product_name} ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
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

// ==================== TRACKING MODAL ====================
interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

type TimelineKey = keyof OrderLineItem["timeline"];

const TRACKING_STEPS: Array<{
  key: TimelineKey;
  label: string;
  icon: any;
  group: "forward" | "return";
}> = [
  {
    key: "order_placed",
    label: "Order Placed",
    icon: BadgeCheck,
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
    label: "Refund Credit",
    icon: Package,
    group: "return",
  },
];

const TrackingModal = ({ isOpen, onClose, order }: TrackingModalProps) => {
  if (!isOpen || !order) return null;

  const timeline = order.timeline || ({} as OrderLineItem["timeline"]);
  const isCancelled = !!timeline.cancelled_at;

  const steps = TRACKING_STEPS.filter((s) => !!timeline[s.key]);
  const lastStep = steps[steps.length - 1];

  const till = timeline.return_applicable_till;
  const windowOpen = isReturnWindowOpen(till);
  const returnCompleted = isReturnCompleted(order);

  const showReturnWindow = !!till && !returnCompleted;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[6px]"
            style={{ backgroundColor: "#eaf7f0" }}
          >
            <Truck className="h-4 w-4" style={{ color: EMERALD }} />
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
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {showReturnWindow && (
          <div
            className={`mb-5 flex items-center gap-1.5 rounded-[7px] border px-3 py-2.5 text-[11px] font-medium ${
              windowOpen
                ? "border-[#CFE0D4] bg-[#F1F7F3] text-[#3F765A]"
                : "border-[#F0CFCF] bg-[#FDF2F2] text-[#B24C4C]"
            }`}
          >
            <Clock size={13} />
            <span>
              Return window:{" "}
              <span className="font-semibold">{formatDate(till)}</span>
            </span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                windowOpen
                  ? "bg-[#dff0e3] text-[#1f9d6b]"
                  : "bg-[#fadcdc] text-[#DC2626]"
              }`}
            >
              {windowOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
        )}

        {returnCompleted && (
          <div className="mb-5 flex items-start gap-2 rounded-[7px] border border-[#FED7AA] bg-[#FFF7ED] p-3">
            <RotateCcw className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#EA580C]" />
            <div className="text-[11px] leading-4 text-[#C2410C]">
              <p className="font-semibold">Return Completed</p>
              <p className="mt-0.5 text-[#C2410C]/90">
                This item has been fully returned and refunded.
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mb-5 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
            <div className="text-[11px] leading-4 text-[#B24C4C]">
              <p className="font-semibold">Order Cancelled</p>
              <p className="mt-0.5 text-[#B24C4C]/90">
                {formatDate(timeline.cancelled_at)}
              </p>
            </div>
          </div>
        )}

        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="h-8 w-8 text-[#CCCCCC]" />
            <p className="mt-3 text-[12px] text-[#999999]">
              Tracking details will appear here once your order is processed.
            </p>
          </div>
        ) : (
          <div>
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              const isReturnRejected = step.key === "return_rejected_at";
              const dotColor = isReturnRejected
                ? RED
                : step.group === "return"
                  ? BRASS
                  : EMERALD;
              const dotBg = isReturnRejected
                ? "#FEF2F2"
                : step.group === "return"
                  ? "#F8F1E4"
                  : "#eaf7f0";
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className={`relative pl-11 ${isLast ? "" : "pb-7"}`}
                >
                  {!isLast && (
                    <div
                      className="absolute left-[15px] top-8 w-[2px] rounded-full"
                      style={{
                        height: "calc(100% - 1.75rem)",
                        backgroundColor: "#E4E4E2",
                      }}
                    />
                  )}
                  <div
                    className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                    style={{ backgroundColor: dotBg }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: dotColor }} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[12.5px] font-semibold text-[#171717]">
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      {formatDate(timeline[step.key])}
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
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ==================== ORDER BREAKUP MODAL (FIXED) ====================
interface BreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

const OrderBreakupModal = ({ isOpen, onClose, order }: BreakupModalProps) => {
  if (!isOpen || !order) return null;

  const summary = order.tax_breakdown?.summary || {};

  const subtotal = Number(order.line_total ?? order.line_total ?? 0,);
  const shipping = Number(order.delivery_charges ?? order.delivery_charges ??  0 );

  const coinRedeemed = Number(order.coin_redeemed ?? 0);
  const coinRedeemedAmount = Number(order.coin_redeemed_amount ?? 0);
  const grandTotal = Number(
    summary.final_amount ??
      order.final_amount ??
      order.total_payable ??
      order.amount_paid ??
      0,
  );

  const rows: Array<{ label: string; value: string; muted?: boolean }> = [
    {
      label: "Subtotal",
      value: formatCurrency(subtotal),
    },

    {
      label: "Shipping",
      value: formatCurrency(shipping),
    },
    {
      label: "Coin Redeemed",
      value: `${coinRedeemed} coins (${formatCurrency(coinRedeemedAmount)})`,
      muted: true,
    },
  ];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[6px]"
            style={{ backgroundColor: "#f8f1e4" }}
          >
            <LuReceiptIndianRupee
              className="h-4 w-4"
              style={{ color: BRASS }}
            />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
              Price Breakup
            </h3>
            <p className="mt-0.5 text-[10px] text-[#888888] sm:text-[11px]">
              {order.order_reference}
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
        <div className="rounded-[10px] border border-dashed border-[#DADADA] bg-[#FAFAF9] p-4">
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span
                  className={`text-[12px] ${row.muted ? "text-[#999999]" : "text-[#555555]"}`}
                >
                  {row.label}
                </span>
                <span
                  className={`text-[12.5px] font-medium ${row.muted ? "text-[#999999]" : "text-[#171717]"}`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="my-4 border-t border-dashed border-[#DADADA]" />

          <div
            className="flex items-center justify-between rounded-[8px] px-3 py-2.5"
            style={{ backgroundColor: NAVY }}
          >
            <span className="text-[12.5px] font-semibold text-white">
              Grand Total
            </span>
            <span className="text-[15px] font-bold text-white">
              {formatCurrency(grandTotal)}
            </span>
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

// ==================== REVIEW MODAL ====================
interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (reviewData: any) => Promise<void>;
  isLoading?: boolean;
}

const ReviewModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isLoading,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
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
    if (isOpen && textareaRef.current) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");
    if (!files.length) return;
    if (files.length + images.length > 5) {
      setError("You can upload maximum 5 images.");
      return;
    }
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setError("Some files exceed the 5MB limit.");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalid = files.filter((f) => !validTypes.includes(f.type));
    if (invalid.length > 0) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");
      return;
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];
    if (preview) URL.revokeObjectURL(preview);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) return setError("Please select a rating.");
    if (reviewText.trim().length < 10)
      return setError("Review must be at least 10 characters.");
    if (!order?.line_id) return setError("Order line ID is missing.");
    if (!order?.product_id) return setError("Product ID is missing.");
    if (!order?.order_id) return setError("Order ID is missing.");

    setIsSubmitting(true);
    try {
      await onSubmit({
        order_id: order.order_id,
        order_line_id: order.line_id,
        product_id: order.product_id,
        rating,
        review_text: reviewText.trim(),
        review: reviewText.trim(),
        images,
        order_reference: order.order_reference,
        product_name: order.product_name,
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to submit review.");
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (v: number) =>
    ({ 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent!" })[v] ||
    "";

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
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
            Order: {order?.order_reference || `#${order?.order_id}`}
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
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex min-h-[360px] flex-col items-center justify-center py-10"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-[#F1F7F3]">
              <Check className="h-10 w-10 text-[#3F765A]" />
            </div>
            <h4 className="mt-5 text-[22px] font-semibold text-[#171717]">
              Thank You!
            </h4>
            <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
              Your review for {order?.product_name} has been submitted
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
                  {order.quantity && (
                    <p className="mt-0.5 text-[10px] text-[#888888]">
                      Qty: {order.quantity}
                    </p>
                  )}
                  {order.product_code && (
                    <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                      Product Code: {order.product_code}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Rating <span className="text-[#B24C4C]">*</span>
              </label>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      disabled={isSubmitting}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-[5px] p-1 transition-transform hover:scale-105 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-9 sm:w-9 ${
                          star <= (hoverRating || rating)
                            ? "fill-[#171717] text-[#171717]"
                            : "fill-[#F1F1F0] text-[#D7D7D5]"
                        } transition-colors duration-150`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="min-h-[18px] text-[11px] font-medium text-[#171717] sm:text-[12px]">
                  {rating > 0 ? (
                    getRatingLabel(rating)
                  ) : (
                    <span className="text-[#999999]">Select a rating</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                Your Review <span className="text-[#B24C4C]">*</span>
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  maxLength={500}
                  disabled={isSubmitting}
                  className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 pr-16 text-[12px] text-[#171717] outline-none transition-all placeholder:text-[#999999] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-[#999999]">
                  {reviewText.length}/500
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
              {imagePreviews.length > 0 && (
                <div className="mb-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                  <AnimatePresence>
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={`${preview}-${index}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="group relative"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                          <img
                            src={preview}
                            alt={`Review ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting}
                            className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {imagePreviews.length < 5 && (
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] transition-colors hover:border-[#999999]">
                      <div className="text-center">
                        <span className="text-[18px] text-[#888888]">+</span>
                        <span className="block text-[10px] text-[#777777]">
                          Add
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
              {imagePreviews.length === 0 && (
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-4 py-5 transition-colors hover:border-[#999999]">
                  <span className="text-[24px] text-[#888888] group-hover:text-[#171717]">
                    📷
                  </span>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-[#171717]">
                      Click to upload photos
                    </p>
                    <p className="mt-1 text-[9px] text-[#999999]">
                      Max 5 images • 5MB each
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
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
              disabled={isSubmitting || isLoading}
              className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
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
                reviewText.trim().length < 10
              }
              className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium transition ${
                isSubmitting ||
                isLoading ||
                rating === 0 ||
                reviewText.trim().length < 10
                  ? "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
                  : "border-[#111111] bg-[#111111] text-white hover:bg-[#292929]"
              }`}
            >
              {isSubmitting || isLoading ? (
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

// ==================== VIEW REVIEW MODAL ====================
interface ViewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
}

const ViewReviewModal = ({ isOpen, onClose, order }: ViewReviewModalProps) => {
  if (!isOpen || !order) return null;

  const existingReview = order.product_reviews?.find(
    (r: any) =>
      r.order_line_id === order.line_id ||
      r.order_id === order.order_id ||
      r.product_id === order.product_id,
  );

  const rating = existingReview?.rating || 0;
  const reviewText =
    existingReview?.review_text ||
    existingReview?.review ||
    "No review text provided.";
  const reviewImages: string[] =
    existingReview?.image_urls ||
    existingReview?.images?.map?.((img: any) => img.image_url || img.url) ||
    [];

  const getRatingLabel = (v: number) =>
    ({ 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent!" })[v] ||
    "";

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
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
            Order: {order.order_reference}
            {order.line_id && (
              <span className="ml-1 text-[#AAAAAA]">
                • Item #{order.line_id}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
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
            {order.quantity && (
              <p className="mt-0.5 text-[10px] text-[#888888]">
                Qty: {order.quantity}
              </p>
            )}
            {order.product_code && (
              <p className="mt-0.5 text-[9px] text-[#AAAAAA]">
                Product Code: {order.product_code}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Rating
          </label>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 sm:h-9 sm:w-9 ${
                    star <= rating
                      ? "fill-[#B8935A] text-[#B8935A]"
                      : "fill-[#F1F1F0] text-[#D7D7D5]"
                  }`}
                />
              ))}
            </div>
            <p className="min-h-[18px] text-[11px] font-medium text-[#171717] sm:text-[12px]">
              {rating > 0 ? (
                getRatingLabel(rating)
              ) : (
                <span className="text-[#999999]">No rating</span>
              )}
            </p>
          </div>
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

        {reviewImages.length > 0 && (
          <div className="mb-2">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
              Photos
            </label>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
              {reviewImages.map((url: string, i: number) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]"
                >
                  <img
                    src={url}
                    alt={`Review ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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

// ==================== RETURN MODAL ====================
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
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setReason("");
      setImages([]);
      setImagePreviews([]);
      setError("");
      setIsSubmitting(false);
    } else {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");

    if (!files.length) return;

    if (files.length + images.length > 5) {
      setError("You can upload maximum 5 images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const oversized = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setError("Some files exceed the 5MB limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const invalid = files.filter((file) => !validTypes.includes(file.type));
    if (invalid.length > 0) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const preview = imagePreviews[index];
    if (preview) URL.revokeObjectURL(preview);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    if (!order) {
      setError("Order information is missing.");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (quantity > (order.available_for_return || 1)) {
      setError(`Maximum returnable quantity is ${order.available_for_return}.`);
      return;
    }

    if (reason.trim().length < 10) {
      setError("Please provide a valid reason (min 10 characters).");
      return;
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

  if (!isOpen) return null;

  const maxReturn = order?.available_for_return || order?.quantity || 1;
  const till = order?.timeline?.return_applicable_till;
  const reasonLength = reason.trim().length;
  const canSubmit =
    !isSubmitting && !isUploading && reasonLength >= 10 && !!order;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
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
              Provide the details below to request a return.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close return request"
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
                  src={order.primary_image}
                  alt={order.product_name || "Product"}
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
                Ordered: {order.quantity} • Returnable: {maxReturn}
              </p>
            </div>
          </div>
        )}

        {till && (
          <div className="mb-3 flex items-center gap-1.5 rounded-[6px] border border-[#CFE0D4] bg-[#F1F7F3] px-3 py-2 text-[10px] font-medium text-[#3F765A]">
            <Clock size={12} />
            <span className="min-w-0 truncate">
              Return window closes on{" "}
              <span className="font-semibold">{formatDate(till)}</span>
            </span>
          </div>
        )}

        <div className="mb-3">
          <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Quantity to Return <span className="text-[#B24C4C]">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={maxReturn}
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!Number.isFinite(value)) return;
              setQuantity(Math.min(maxReturn, Math.max(1, value)));
            }}
            disabled={isSubmitting || isUploading}
            className="h-[38px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[13px] text-[#171717] outline-none transition focus:border-[#999999] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#888888]">
              Reason for Return <span className="text-[#B24C4C]">*</span>
            </label>
            <span
              className={`shrink-0 text-[9px] font-medium ${
                reasonLength >= 10 ? "text-[#3F765A]" : "text-[#999999]"
              }`}
            >
              {reasonLength}/10 min
            </span>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please describe why you want to return this item..."
            maxLength={500}
            disabled={isSubmitting || isUploading}
            className="h-[82px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 py-2.5 text-[12px] leading-5 text-[#171717] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#999999] disabled:cursor-not-allowed disabled:opacity-60"
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
              {images.length}/5
            </span>
          </div>

          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              <AnimatePresence initial={false}>
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={`${preview}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                      <img
                        src={preview}
                        alt={`Return image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting || isUploading}
                        className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {imagePreviews.length < 5 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] transition hover:border-[#999999] hover:bg-white">
                  <Camera className="h-5 w-5 text-[#777777]" />
                  <span className="mt-1 text-[9px] font-medium text-[#777777]">
                    Add
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSubmitting || isUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="group flex cursor-pointer items-center gap-3 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-2.5 transition hover:border-[#999999] hover:bg-white">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FFF7ED]">
                <Camera className="h-5 w-5 text-[#EA580C] transition-transform duration-200 group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#171717]">
                  Click to upload photos
                </p>
                <p className="mt-0.5 text-[9px] text-[#999999]">
                  JPG, PNG, GIF or WEBP • Max 5MB each • Up to 5 images
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={isSubmitting || isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] px-3 py-2"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B24C4C]" />
            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </motion.div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium transition ${
              canSubmit
                ? "border-[#EA580C] bg-[#EA580C] text-white hover:bg-[#C2410C]"
                : "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
            }`}
          >
            {isSubmitting || isUploading ? (
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

// ==================== CANCEL MODAL ====================
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: (reason: string) => Promise<void>;
  isUploading?: boolean;
}

const CancelModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isUploading,
}: CancelModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");
    if (reason.trim().length < 10)
      return setError("Please provide a valid reason (min 10 characters).");
    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Failed to cancel order.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
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
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
          <p className="text-[11px] leading-4 text-[#B24C4C]">
            <strong>Warning:</strong> This action cannot be undone. The order
            will be cancelled immediately.
          </p>
        </div>

        {order && (
          <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={order.primary_image}
                  alt={order.product_name}
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
                Order #{order.order_reference}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
            Reason for Cancellation <span className="text-[#B24C4C]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please tell us why you want to cancel..."
            maxLength={500}
            disabled={isSubmitting}
            className="min-h-[100px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 text-[12px] text-[#171717] outline-none focus:border-[#999999]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
          >
            {isSubmitting || isUploading ? (
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

// ==================== WITHDRAW RETURN MODAL ====================
interface WithdrawReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLineItem | null;
  onSubmit: () => Promise<void>;
  isUploading?: boolean;
}

const WithdrawReturnModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  isUploading,
}: WithdrawReturnModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
          "Failed to withdraw return request.",
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
            <RotateCcw className="h-4 w-4 text-[#EA580C]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#171717]">
            Withdraw Return Request
          </h3>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <p className="text-[11px] leading-4 text-[#B45309]">
            <strong>Note:</strong> Are you sure you want to withdraw your return
            request for this item?
          </p>
        </div>

        {order && (
          <div className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={order.primary_image}
                  alt={order.product_name}
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
                Order #{order.order_reference}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#EA580C] bg-[#EA580C] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#C2410C] disabled:opacity-50"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Withdraw Request
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ==================== CANCEL RETURN MODAL ====================
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");
    if (!returnId) {
      setError("Return ID is missing.");
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

  if (!isOpen) return null;

  const till = order?.timeline?.return_applicable_till;

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
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
          disabled={isSubmitting || isUploading}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
          <p className="text-[11px] leading-4 text-[#B24C4C]">
            <strong>Warning:</strong> This will permanently cancel your return
            request for this item. You will not be able to reopen it.
          </p>
        </div>

        {order && (
          <div className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
              {order.primary_image ? (
                <Image
                  src={order.primary_image}
                  alt={order.product_name}
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
                Order #{order.order_reference}
                {returnId && (
                  <span className="ml-1 text-[#AAAAAA]">
                    • Return #{returnId}
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
              <span className="font-semibold">{formatDate(till)}</span>
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
            <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                Confirm Cancel Return
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// ==================== ACTION DROPDOWN (3-dot icon) ====================
interface ActionDropdownProps {
  order: OrderLineItem;
  onReview: () => void;
  onViewReview: () => void;
  onReturn: () => void;
  onCancel: () => void;
  onWithdrawReturn: () => void;
  onTrack: () => void;
  onCancelReturn: (returnId: number) => void;
}

const ActionDropdown = ({
  order,
  onReview,
  onViewReview,
  onReturn,
  onCancel,
  onWithdrawReturn,
  onTrack,
  onCancelReturn,
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

  const MENU_WIDTH = 170;
  const MENU_OFFSET_X = 12;

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 20;

    let left = rect.right + MENU_OFFSET_X - MENU_WIDTH;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }
    if (left < 8) left = 8;

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: MENU_WIDTH,
      openUp,
    });
  };

  const handleToggle = () => {
    if (!isOpen) updateCoords();
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateCoords();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const orderStatus = normalizeStatus(order.order_status);
  const deliveryStatus = normalizeStatus(order.delivery_status);

  const hasReview = !!order.is_reviewed;

  const canReview =
    deliveryStatus === "delivered" || orderStatus === "delivered";

  const canReturn = canInitiateReturn(order);

  const canCancel =
    ["pending", "confirmed", "processing"].includes(deliveryStatus) &&
    deliveryStatus !== "delivered";

  const canWithdrawReturn =
    normalizeStatus(order.return_status) === "requested";

  const cancellableReturn = findCancellableReturn(order);
  const canCancelReturn = !!cancellableReturn;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menu = isOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              transform: coords.openUp ? "translateY(-100%)" : "translateY(0)",
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-[8px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.15)]"
          >
            <button
              onClick={() => handleAction(onTrack)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
            >
              <Truck
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: EMERALD }}
              />
              <span className="truncate">Track Order</span>
            </button>
            {canReview && (
              <button
                onClick={() =>
                  handleAction(hasReview ? onViewReview : onReview)
                }
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
              >
                <Star
                  className={`h-3.5 w-3.5 flex-shrink-0 ${
                    hasReview
                      ? "fill-[#B8935A] text-[#B8935A]"
                      : "text-[#B8935A]"
                  }`}
                />
                <span className="truncate">
                  {hasReview ? "View Review" : "Write Review"}
                </span>
              </button>
            )}
            {canReturn && (
              <button
                onClick={() => handleAction(onReturn)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
              >
                <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#EA580C]" />
                <span className="truncate">Return Item</span>
              </button>
            )}
            {canWithdrawReturn && (
              <button
                onClick={() => handleAction(onWithdrawReturn)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
              >
                <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#B8935A]" />
                <span className="truncate">Withdraw Return</span>
              </button>
            )}
            {canCancelReturn && cancellableReturn && (
              <button
                onClick={() =>
                  handleAction(() => onCancelReturn(cancellableReturn.returnId))
                }
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
              >
                <X className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Cancel Return</span>
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => handleAction(onCancel)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
              >
                <X className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Cancel Order</span>
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

// ==================== ORDER DETAILS EXPAND PANEL ====================
interface OrderDetailsProps {
  order: OrderLineItem;
  onTrack: () => void;
  onViewBreakup: () => void;
  onCancelReturn: (returnId: number) => void;
}

const OrderDetails = ({
  order,
  onTrack,
  onViewBreakup,
  onCancelReturn,
}: OrderDetailsProps) => {
  const creditNotes = order.credit_notes || [];
  const timeline = order.timeline || ({} as OrderLineItem["timeline"]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden border-b border-[#e7e9ee] bg-[#fafbfc]"
    >
      <div className="px-6 py-5">
        <div className="mb-5 overflow-hidden rounded-[11px] border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="grid gap-x-8 gap-y-5 px-5 py-5 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Order Reference
              </p>
              <p className="mt-1.5 truncate text-[13px] font-semibold text-[#101828]">
                {order.order_reference || `ORD-${order.order_id}`}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Payment Status
              </p>
              <span
                className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize"
                style={{
                  color: order.payment_status === "paid" ? EMERALD : BRASS,
                  backgroundColor:
                    order.payment_status === "paid" ? "#eaf7f0" : "#f8f1e4",
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
              <p
                className="mt-1.5 truncate text-[12.5px] font-medium text-[#101828]"
                title={order.gateway_transaction_id || undefined}
              >
                {order.gateway_transaction_id || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
                Total Payable
              </p>
              <p className="mt-1.5 text-[16px] font-bold text-[#101828]">
                {formatCurrency(
                  order.final_amount ?? order.total_payable ?? order.amount_paid ?? 0,
                )}
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
          </div>

          <div className="border-t border-[#edf0f3] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a92a6]">
              Shipping Address
            </p>
            <div className="mt-1.5 flex items-start gap-2 text-[12.5px] leading-5 text-[#344054]">
              <MapPin
                size={14}
                className="mt-0.5 flex-shrink-0 text-[#98a2b3]"
              />
              <span>
                {order.delivery_address?.full_address ||
                  order.delivery_address?.address ||
                  "—"}
              </span>
            </div>
          </div>

          {creditNotes.length > 0 && (
            <div className="border-t border-[#edf0f3] px-5 py-4">
              <div className="rounded-[10px] border border-[#e7e9ee] bg-white p-4">
                <h4 className="mb-3 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#667085]">
                  <CreditCard size={14} /> Refund Credit
                </h4>
                <div className="space-y-2">
                  {creditNotes.map((cn: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-[8px] border border-[#CFE0D4] bg-[#F1F7F3] p-2.5 text-[11.5px]"
                    >
                      <div className="flex justify-between font-medium text-[#101828]">
                        <span>{cn.credit_note_number || `CN-${i + 1}`}</span>
                        <span className="text-[#1F7A56]">
                          {formatCurrency(cn.amount || 0)}
                        </span>
                      </div>
                      <div className="mt-1 text-[10.5px] text-[#667085]">
                        {cn.issued_at
                          ? formatDate(cn.issued_at)
                          : cn.created_at
                            ? formatDate(cn.created_at)
                            : ""}
                        {cn.status ? ` • ${cn.status}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#edf0f3] px-5 py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onTrack}
                className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition hover:border-[#AABCF0] hover:bg-[#ECEFFC]"
              >
                <Truck size={14} />
                Track Order
              </button>
            </div>

            <button
              type="button"
              onClick={onViewBreakup}
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition hover:border-[#AABCF0] hover:bg-[#ECEFFC]"
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

// ==================== MAIN COMPONENT ====================
export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [breakupModalOpen, setBreakupModalOpen] = useState(false);
  const [cancelReturnModalOpen, setCancelReturnModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(
    null,
  );
  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
    { page, per_page: perPage },
    { refetchOnMountOrArgChange: true },
  );

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [initiateReturn, { isLoading: isReturning }] =
    useInitiateReturnMutation();
  const [addRatingReview, { isLoading: isSubmittingReview }] =
    useAddRatingReviewMutation();
  const [withdrawReturn, { isLoading: isWithdrawing }] =
    useWithdrawCancelRequestMutation();
  const [cancelReturn, { isLoading: isCancellingReturn }] =
    useCancelReturnMutation();

  const orders: OrderLineItem[] = useMemo(() => {
    if (!data?.data) return [];
    if (Array.isArray(data.data)) return data.data;
    if (data.data.data && Array.isArray(data.data.data)) return data.data.data;
    return [];
  }, [data]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_reference?.toLowerCase().includes(q) ||
        o.product_name?.toLowerCase().includes(q) ||
        o.order_status?.toLowerCase().includes(q),
    );
  }, [orders, searchQuery]);

  const totalRecords =
    (data as any)?.meta?.total || (data as any)?.total || orders.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const toggleRow = (rowKey: string) => {
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

  const handleReviewSubmit = async (reviewData: any) => {
    setIsUploading(true);
    try {
      const files: File[] = Array.isArray(reviewData?.images)
        ? reviewData.images.filter((img: any): img is File => img instanceof File)
        : [];

      const rating = Number(reviewData?.rating);
      const reviewText = reviewData?.review_text || reviewData?.review || "";

      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Please select a valid rating.");
      }
      if (!reviewText.trim()) {
        throw new Error("Please enter your review.");
      }
      if (!reviewData.order_line_id) {
        throw new Error("Order line ID is missing.");
      }
      if (!reviewData.product_id) {
        throw new Error("Product ID is missing.");
      }

      const response = await addRatingReview({
        rating,
        review_text: reviewText.trim(),
        order_id: reviewData.order_id,
        order_line_id: reviewData.order_line_id,
        product_id: reviewData.product_id,
        images: files,
      }).unwrap();

      dispatch(
        showToast({
          message: response?.message || "Review submitted successfully!",
          type: "success",
        }),
      );

      await refetch();
      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
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

  const handleReturnSubmit = async (data: {
    quantity: number;
    reason: string;
    images: File[];
  }) => {
    if (!selectedOrder) return;
    setIsUploading(true);
    try {
      if (!isReturnWindowOpen(selectedOrder.timeline?.return_applicable_till)) {
        throw new Error("Return window has expired for this item.");
      }
      if (isReturnCompleted(selectedOrder)) {
        throw new Error("This item has already been returned.");
      }

      const maxQuantity =
        Number(selectedOrder.available_for_return) ||
        Number(selectedOrder.quantity) ||
        1;
      const selectedQuantity = Number(data.quantity) || maxQuantity;

      if (selectedQuantity < 1) {
        throw new Error("Return quantity must be at least 1.");
      }
      if (selectedQuantity > maxQuantity) {
        throw new Error(`Return quantity cannot be more than ${maxQuantity}.`);
      }

      const returnItems = [
        {
          order_line_id: selectedOrder.line_id,
          quantity: selectedQuantity,
          reason: data.reason,
          images: data.images || [],
        },
      ];

      const response = await initiateReturn({
        order_reference: selectedOrder.order_reference,
        items: returnItems,
      }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Return request submitted successfully!",
          type: "success",
        }),
      );

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
      setIsUploading(false);
    }
  };

  const handleCancelSubmit = async (reason: string) => {
    if (!selectedOrder) return;
    setIsUploading(true);
    try {
      const orderReference = selectedOrder.order_reference;
      const orderLineId = selectedOrder.line_id;

      if (!orderReference) {
        throw new Error("Order reference is missing.");
      }
      if (!orderLineId) {
        throw new Error("Order line ID is missing.");
      }

      const response = await cancelOrder({
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
            error?.data?.message || error?.message || "Failed to cancel order.",
          type: "error",
        }),
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleWithdrawReturn = async () => {
    if (!selectedOrder) return;
    setIsUploading(true);
    try {
      const response = await withdrawReturn({
        order_line_id: selectedOrder.line_id,
        order_reference: selectedOrder.order_reference,
      }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Return request withdrawn successfully!",
          type: "success",
        }),
      );

      await refetch();
      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to withdraw return request.",
          type: "error",
        }),
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelReturnSubmit = async () => {
    if (!selectedReturnId) {
      dispatch(
        showToast({
          message: "Return ID is missing.",
          type: "error",
        }),
      );
      throw new Error("Return ID is missing.");
    }

    setIsUploading(true);
    try {
      const response = await cancelReturn({
        returnId: selectedReturnId,
      }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Return request cancelled successfully!",
          type: "success",
        }),
      );

      await refetch();
      setSelectedReturnId(null);
      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
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

  const openImageGallery = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setImageGalleryOpen(true);
  };

  const openReview = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };
  const openViewReview = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setViewReviewModalOpen(true);
  };
  const openReturn = (order: OrderLineItem) => {
    if (!isReturnWindowOpen(order.timeline?.return_applicable_till)) {
      dispatch(
        showToast({
          message: "Return window has expired for this item.",
          type: "error",
        }),
      );
      return;
    }
    if (isReturnCompleted(order)) {
      dispatch(
        showToast({
          message: "This item has already been returned.",
          type: "error",
        }),
      );
      return;
    }
    setSelectedOrder(order);
    setReturnModalOpen(true);
  };
  const openCancel = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };
  const openWithdraw = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setWithdrawModalOpen(true);
  };
  const openTracking = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setTrackingModalOpen(true);
  };
  const openBreakup = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setBreakupModalOpen(true);
  };
  const openCancelReturn = (order: OrderLineItem, returnId: number) => {
    if (!isReturnWindowOpen(order.timeline?.return_applicable_till)) {
      dispatch(
        showToast({
          message: "Return window has closed — cannot cancel return.",
          type: "error",
        }),
      );
      return;
    }
    setSelectedOrder(order);
    setSelectedReturnId(returnId);
    setCancelReturnModalOpen(true);
  };

  const closeAllModals = () => {
    setImageGalleryOpen(false);
    setReviewModalOpen(false);
    setViewReviewModalOpen(false);
    setReturnModalOpen(false);
    setCancelModalOpen(false);
    setWithdrawModalOpen(false);
    setTrackingModalOpen(false);
    setBreakupModalOpen(false);
    setCancelReturnModalOpen(false);
    setSelectedReturnId(null);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="mb-5 h-10 w-64 animate-pulse rounded-[8px] bg-[#f2f4f7]" />
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

  if (isError) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
        <p className="text-[14px] text-[#667085]">
          Failed to load orders. Please try again.
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
        <div className="relative mb-5 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
          />
          <input
            type="text"
            placeholder="Search order"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
          />
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[1060px] grid-cols-[40px_1.5fr_1.4fr_0.8fr_0.9fr_0.6fr_0.95fr_0.9fr_40px_0.6fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
            <span />
            <span>Order Reference</span>
            <span>Product</span>
            <span>Total</span>
            <span>Method</span>
            <span>Qty</span>
            <span>Coins</span>
            <span>Status</span>
            <span />
            <span className="text-right">Actions</span>
          </div>

          <div>
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                {searchQuery
                  ? "No orders found matching your search."
                  : "No orders found."}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const rowKey = `${order.order_id}-${order.line_id}`;
                const isExpanded = expandedRows.has(rowKey);
                const statusStyle = STATUS_STYLES[order.delivery_status] ?? {
                  color: "#667085",
                  bg: "#f2f4f7",
                };
                return (
                  <div
                    key={rowKey}
                    className="border-b border-dashed border-[#e7e9ee] last:border-b-0"
                  >
                    <div className="grid min-w-[1060px] grid-cols-[40px_1.5fr_1.4fr_0.8fr_0.9fr_0.6fr_0.95fr_0.9fr_40px_0.6fr] items-center gap-2 py-4 text-[13px] text-[#101828]">
                      <button
                        onClick={() => toggleRow(rowKey)}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#e5e9ef] bg-white text-[#667085] transition hover:bg-[#f7f8fa]"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <span className="truncate font-semibold text-[#0E1B3D]">
                        {order.order_reference}
                      </span>
                      <button
                        type="button"
                        onClick={() => openImageGallery(order)}
                        className="flex min-w-0 items-center gap-2.5 text-left"
                        title="View product images"
                      >
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                          {order.primary_image ? (
                            <Image
                              src={order.primary_image}
                              alt={order.product_name || "Product"}
                              fill
                              sizes="40px"
                              className="object-cover transition-transform duration-200 hover:scale-105"
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
                      </button>
                      <span className="text-[#667085]">
                        {formatCurrency(order.final_amount)}
                      </span>
                      <span>
                        <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                          {order.payment_gateway || "N/A"}
                        </span>
                      </span>
                      <span className="text-[#667085]">{order.quantity}</span>
                      <div
                        className="flex items-center gap-1.5"
                        title={`Coins redeemed: ${order.coin_redeemed || 0} • CV: ${order.commissionable_volume || 0}`}
                      >
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
                          {order.delivery_status?.replace(/_/g, " ")}
                        </span>
                      </span>
                      <div className="flex items-center justify-center"></div>
                      <div className="flex items-center justify-end">
                        <ActionDropdown
                          order={order}
                          onReview={() => openReview(order)}
                          onViewReview={() => openViewReview(order)}
                          onReturn={() => openReturn(order)}
                          onCancel={() => openCancel(order)}
                          onWithdrawReturn={() => openWithdraw(order)}
                          onTrack={() => openTracking(order)}
                          onCancelReturn={(returnId) =>
                            openCancelReturn(order, returnId)
                          }
                        />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <OrderDetails
                          order={order}
                          onTrack={() => openTracking(order)}
                          onViewBreakup={() => openBreakup(order)}
                          onCancelReturn={(returnId) =>
                            openCancelReturn(order, returnId)
                          }
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center gap-4 text-[13px] text-[#667085]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#101828]">{perPage}</span>
              <ChevronDown size={14} className="text-[#8a92a6]" />
            </div>
            <span className="font-medium">
              Showing {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, totalRecords)} of {totalRecords} records
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${
                  page === p
                    ? "text-white"
                    : "text-[#667085] hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
                }`}
                style={page === p ? { backgroundColor: NAVY } : undefined}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== MODALS ==================== */}

      <OrderImageGallery
        isOpen={imageGalleryOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <TrackingModal
        isOpen={trackingModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <OrderBreakupModal
        isOpen={breakupModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSubmit={handleReviewSubmit}
        isLoading={isSubmittingReview || isUploading}
      />

      <ViewReviewModal
        isOpen={viewReviewModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSubmit={handleReturnSubmit}
        isUploading={isReturning || isUploading}
      />

      <CancelModal
        isOpen={cancelModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSubmit={handleCancelSubmit}
        isUploading={isCancelling || isUploading}
      />

      <WithdrawReturnModal
        isOpen={withdrawModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSubmit={handleWithdrawReturn}
        isUploading={isWithdrawing || isUploading}
      />

      <CancelReturnModal
        isOpen={cancelReturnModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        returnId={selectedReturnId}
        onSubmit={handleCancelReturnSubmit}
        isUploading={isCancellingReturn || isUploading}
      />
    </>
  );
}