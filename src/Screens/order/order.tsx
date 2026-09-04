
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  ChevronRight,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Printer,
  ChevronDown,
  Calendar,
  Filter,
  Star,
  X,
  Check,
  RotateCcw,
  Ban,
  Loader2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  User,
  CalendarDays,
  Image as ImageIcon,
} from "lucide-react";

import {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useLazyGetInvoiceByOrderIdQuery,
  useAddRatingReviewMutation,
} from "@/lib/redux/api/order/orderApi";

import ReviewModal from "./ReviewModal";
import OrderCancelModal, { CancelOrderData } from "./OrderCancelModal";
import { generateInvoicePDF } from "./invoiceGenerator";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  dispatched: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: RotateCcw,
};

const statusColors: Record<string, string> = {
  pending:
    "text-[#8A6D1F] bg-[#FBF6E4] border-[#E9D48B]",
  confirmed:
    "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  processing:
    "text-[#5B4FA8] bg-[#F3F1FB] border-[#D8D3F2]",
  dispatched:
    "text-[#3E5AA8] bg-[#EEF1FB] border-[#CBD5F0]",
  delivered:
    "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  cancelled:
    "text-[#B24C4C] bg-[#FDF2F2] border-[#F0CFCF]",
  returned:
    "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (amount: number) => {
  if (!amount) return "₹0";

  return `₹${amount.toLocaleString("en-IN", {
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

const transformOrderLines = (orderLines: any[]) => {
  if (!orderLines || !Array.isArray(orderLines)) return [];

  const orderGroups = new Map();

  orderLines.forEach((line: any) => {
    if (!orderGroups.has(line.order_id)) {
      orderGroups.set(line.order_id, {
        order_id: line.order_id,
        order_reference: line.order_reference,
        order_status: line.order_status,
        order_type: line.order_type,
        order_date: line.order_date,
        confirmed_date: line.confirmed_date,
        payment_gateway: line.payment_gateway,
        gateway_transaction_id: line.gateway_transaction_id,
        amount_paid: line.amount_paid,
        payment_status: line.payment_status,
        subtotal: line.subtotal,
        total_gst: line.total_gst,
        shipping_charge: line.shipping_charge,
        coin_redeemed: line.coin_redeemed,
        coin_redeemed_amount: line.coin_redeemed_amount,
        total_payable: line.total_payable,
        tax_breakdown: line.tax_breakdown || [],
        billing_address: line.billing_address,
        delivery_address: line.delivery_address,
        user: line.user,
        invoice: line.invoice,
        timeline: line.timeline,
        is_reviewed: line.is_reviewed ?? false,
        is_returned: line.is_returned ?? false,
        product_reviews: line.product_reviews || [],
        lines: [],
      });
    }

    orderGroups.get(line.order_id).lines.push(line);
  });

  const result: any[] = [];

  orderGroups.forEach((orderGroup) => {
    const orderId = orderGroup.order_id;
    const totalItems = orderGroup.lines.length;

    orderGroup.lines.forEach((line: any, index: number) => {
      const isLineCancelled =
        line.delivery_status?.toLowerCase() === "cancelled";

      const displayStatus = line.delivery_status;

      result.push({
        display_id: `${orderId}_${line.line_id}`,

        order_id: orderId,

        delivery_status: displayStatus,

        return_status: line.return_status,

        returned_quantity: line.returned_quantity,

        available_for_return: line.available_for_return,

        is_returnable: line.is_returnable,

        order_reference: orderGroup.order_reference,

        order_status: orderGroup.order_status,

        order_type: orderGroup.order_type,

        order_date: orderGroup.order_date,

        confirmed_date: orderGroup.confirmed_date,

        payment_gateway: orderGroup.payment_gateway,

        gateway_transaction_id:
          orderGroup.gateway_transaction_id,

        amount_paid: orderGroup.amount_paid,

        payment_status: orderGroup.payment_status,

        subtotal: orderGroup.subtotal,

        total_gst: orderGroup.total_gst,

        shipping_charge: orderGroup.shipping_charge,

        total_payable: orderGroup.total_payable,

        billing_address: orderGroup.billing_address,

        delivery_address: orderGroup.delivery_address,

        user: orderGroup.user,

        invoice: orderGroup.invoice,

        timeline: line.timeline || {},

        is_reviewed:
          line.is_reviewed ??
          orderGroup.is_reviewed ??
          false,

        is_returned:
          line.is_returned ??
          orderGroup.is_returned ??
          false,

        product_reviews:
          line.product_reviews ||
          orderGroup.product_reviews ||
          [],

        line_id: line.line_id,

        product_id: line.product_id,

        product_name: line.product_name,

        product_code: line.product_code,

        quantity: line.quantity,

        unit_price: line.unit_price,

        gst_rate: line.gst_rate,

        gst_amount: line.gst_amount,

        line_total: line.line_total,

        commissionable_volume:
          line.commissionable_volume,

        images: line.images || [],

        primary_image: line.primary_image,

        is_multi_item: totalItems > 1,

        item_count: totalItems,

        item_index: index + 1,

        is_line_cancelled: isLineCancelled,

        original_delivery_status:
          line.delivery_status,
      });
    });
  });

  return result.sort(
    (a, b) =>
      new Date(b.order_date).getTime() -
      new Date(a.order_date).getTime()
  );
};

/* ============================================================
   REVIEW DISPLAY
============================================================ */

function ReviewDisplay({
  reviews,
}: {
  reviews: any[];
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
        Product Reviews
      </p>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-white">
                <span className="text-[11px] font-semibold">
                  {getInitials(
                    review.user_name || "User"
                  )}
                </span>
              </div>

              <div>
                <p className="text-[12px] font-medium text-[#171717]">
                  {review.user_name ||
                    "Anonymous User"}
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
              <span className="rounded-full bg-[#F1F7F3] px-2 py-0.5 text-[8px] font-medium text-[#3F765A]">
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

          {review.images &&
            review.images.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {review.images.map(
                  (img: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[5px] border border-[#E4E4E2] bg-white"
                    >
                      <img
                        src={
                          img.image_url ||
                          img.image_path
                        }
                        alt={`Review image ${
                          idx + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   TRACK MODAL
============================================================ */

function TrackModal({
  isOpen,
  onClose,
  timelineSteps,
  order,
}: {
  isOpen: boolean;
  onClose: () => void;
  timelineSteps: any[];
  order: any;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 font-sans backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
      >
        <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#111111] text-white">
              <Truck className="h-4 w-4" />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#171717]">
                Order Tracking
              </h3>

              <p className="text-[10px] text-[#888888]">
                Order #
                {order?.order_reference ||
                  order?.order_id ||
                  "N/A"}
              </p>

              {order?.product_name && (
                <p className="mt-0.5 max-w-[230px] truncate text-[10px] text-[#555555]">
                  Item: {order.product_name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {timelineSteps.length > 0 ? (
            <div className="relative">
              {timelineSteps.map(
                (step, index) => (
                  <div
                    key={step.key}
                    className="relative flex items-start gap-3 pb-5 last:pb-0"
                  >
                    {index <
                      timelineSteps.length - 1 && (
                      <div className="absolute left-[5px] top-5 h-[calc(100%-6px)] w-px bg-[#E6E6E4]" />
                    )}

                    <div
                      className={`relative z-10 mt-1 h-3 w-3 flex-shrink-0 rounded-full ${step.color} ring-4 ring-white`}
                    />

                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#171717]">
                        {step.label}
                      </p>

                      <p className="text-[10px] text-[#888888]">
                        {formatDate(step.date)}

                        {step.time &&
                          ` at ${step.time}`}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Truck className="mx-auto h-8 w-8 text-[#C2C2C0]" />

              <p className="mt-2 text-[12px] text-[#888888]">
                No tracking information available
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [filter, setFilter] = useState("all");

  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] =
    useState(false);

  const searchParams = useSearchParams();

  const orderReferenceFromUrl =
    searchParams.get("order") || "";

  const [searchTerm, setSearchTerm] = useState(
    orderReferenceFromUrl
  );

  const [
    selectedOrderForReview,
    setSelectedOrderForReview,
  ] = useState<any>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [showBreakup, setShowBreakup] =
    useState(false);

  const [showTrackModal, setShowTrackModal] =
    useState(false);

  const [
    selectedBreakupItems,
    setSelectedBreakupItems,
  ] = useState<any[]>([]);

  const [
    selectedOrderForAction,
    setSelectedOrderForAction,
  ] = useState<any>(null);

  const [
    selectedOrderForTracking,
    setSelectedOrderForTracking,
  ] = useState<any>(null);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [modalType, setModalType] =
    useState<"cancel" | "return">("cancel");

  const [
    invoiceLoadingOrders,
    setInvoiceLoadingOrders,
  ] = useState<Record<number, boolean>>({});

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch,
  } = useGetMyOrdersQuery();

  const {
    data: statusesData,
    isLoading: statusesLoading,
  } = useGetOrderStatusesQuery();

  const [
    cancelOrder,
    { isLoading: isCancelling },
  ] = useCancelOrderMutation();

  const [
    initiateReturn,
    { isLoading: isReturning },
  ] = useInitiateReturnMutation();

  const [
    addRatingReview,
    { isLoading: isSubmittingReview },
  ] = useAddRatingReviewMutation();

  const [getInvoice] =
    useLazyGetInvoiceByOrderIdQuery();

  const statusList = statusesData?.data || [];

  const transformedOrders = useMemo(() => {
    if (
      !ordersData?.data ||
      !Array.isArray(ordersData.data)
    ) {
      return [];
    }

    return transformOrderLines(
      ordersData.data
    );
  }, [ordersData]);

  const filteredOrders = transformedOrders.filter(
    (order: any) => {
      const matchesFilter =
        filter === "all" ||
        order.delivery_status?.toLowerCase() ===
          filter;

      const searchValue =
        searchTerm.toLowerCase();

      const matchesSearch =
        order.order_reference
          ?.toLowerCase()
          .includes(searchValue) ||
        order.product_name
          ?.toLowerCase()
          .includes(searchValue);

      return matchesFilter && matchesSearch;
    }
  );

  const toggleOrder = (id: string) => {
    setExpandedOrder(
      expandedOrder === id ? null : id
    );
  };

  const getStatusIcon = (status: string) =>
    statusIcons[
      status?.toLowerCase()
    ] || Package;

  const getStatusColor = (status: string) =>
    statusColors[
      status?.toLowerCase()
    ] ||
    "text-[#777777] bg-[#F5F5F5] border-[#E0E0E0]";

  const getStatusDisplayName = (
    status: string
  ) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  /* ============================================================
     CANCEL LOGIC
  ============================================================ */

  const canCancelOrder = (order: any) => {
    if (order.is_line_cancelled) {
      return false;
    }

    const status =
      order.delivery_status?.toLowerCase();

    if (
      status === "cancelled" ||
      status === "delivered" ||
      status === "returned"
    ) {
      return false;
    }

    return (
      status === "pending" ||
      status === "confirmed" ||
      status === "processing"
    );
  };

  /* ============================================================
     RETURN LOGIC
     
     IMPORTANT:
     Review status is NOT checked here.
     User can review AND still return the product.
  ============================================================ */

  const canReturnOrder = (order: any) => {
    const status = order.delivery_status?.toLowerCase();
  
    const quantity = Number(order.quantity) || 0;
    const returnedQuantity = Number(order.returned_quantity) || 0;
    const availableForReturn =
      Number(order.available_for_return) || 0;
  
    const isReturnable =
      Number(order.is_returnable) === 1;
  
    return (
      status === "delivered" &&
      !order.is_returned &&
      isReturnable &&
      availableForReturn > 0 &&
      returnedQuantity < quantity
    );
  };

  /* ============================================================
     REVIEW LOGIC
  ============================================================ */

  const canReviewOrder = (order: any) => {
    const status =
      order.delivery_status?.toLowerCase();

    const hasExistingReview =
      order.product_reviews &&
      order.product_reviews.length > 0;

    return (
      status === "delivered" &&
      !order.is_reviewed &&
      !hasExistingReview
    );
  };

  const canShowInvoice = (order: any) => {
    const status =
      order.delivery_status?.toLowerCase();

    return (
      status === "delivered" &&
      order.invoice
    );
  };

  const hasProductReviews = (
    order: any
  ) => {
    return (
      order.product_reviews &&
      order.product_reviews.length > 0
    );
  };

  /* ============================================================
     TIMELINE
  ============================================================ */

  const getTimelineSteps = (
    timeline: any
  ) => {
    if (
      !timeline ||
      typeof timeline !== "object"
    ) {
      return [];
    }

    const timelineEvents = [
      {
        key: "order_placed",
        label: "Order Placed",
        date: timeline.order_placed,
        color: "bg-[#3F765A]",
      },
      {
        key: "order_confirmed",
        label: "Order Confirmed",
        date: timeline.order_confirmed,
        color: "bg-[#3E5AA8]",
      },
      {
        key: "dispatched_at",
        label: "Dispatched",
        date: timeline.dispatched_at,
        color: "bg-[#3E5AA8]",
      },
      {
        key: "shipped_at",
        label: "Shipped",
        date: timeline.shipped_at,
        color: "bg-[#5B4FA8]",
      },
      {
        key: "delivered_at",
        label: "Delivered",
        date: timeline.delivered_at,
        color: "bg-[#3F765A]",
      },
      {
        key: "cancelled_at",
        label: "Cancelled",
        date: timeline.cancelled_at,
        color: "bg-[#B24C4C]",
      },
      {
        key: "return_requested_at",
        label: "Return Requested",
        date: timeline.return_requested_at,
        color: "bg-[#A9711F]",
      },
      {
        key: "return_approved_at",
        label: "Return Approved",
        date: timeline.return_approved_at,
        color: "bg-[#A9711F]",
      },
      {
        key: "return_rejected_at",
        label: "Return Rejected",
        date: timeline.return_rejected_at,
        color: "bg-[#B24C4C]",
      },
      {
        key: "return_completed_at",
        label: "Return Completed",
        date: timeline.return_completed_at,
        color: "bg-[#A9711F]",
      },
    ];

    return timelineEvents
      .filter((step) => !!step.date)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .map((step) => ({
        ...step,
        time: formatTime(step.date),
      }));
  };

  /* ============================================================
     CANCEL ORDER
  ============================================================ */

  const handleCancelOrder = async (
    data: CancelOrderData
  ) => {
    setIsProcessing(true);

    try {
      const orderReference =
        selectedOrderForAction?.order_reference;

      const orderLineId =
        selectedOrderForAction?.line_id;

      if (!orderReference) {
        throw new Error(
          "Order reference is missing."
        );
      }

      if (!orderLineId) {
        throw new Error(
          "Order line ID is missing."
        );
      }

      await cancelOrder({
        orderReference,
        orderLineId,
        reason: data.reason,
      }).unwrap();

      dispatch(
        showToast({
          message:
            "Order cancelled successfully!",
          type: "success",
        })
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
        })
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /* ============================================================
     RETURN ORDER
  ============================================================ */

  const handleReturnOrder = async (
    data: CancelOrderData
  ) => {
    setIsProcessing(true);

    try {
      const selectedQuantity =
        Number(data.quantity) ||
        Number(
          selectedOrderForAction?.available_for_return
        ) ||
        Number(
          selectedOrderForAction?.quantity
        ) ||
        1;

      const maxQuantity =
        Number(
          selectedOrderForAction?.available_for_return
        ) ||
        Number(
          selectedOrderForAction?.quantity
        ) ||
        1;

      if (selectedQuantity < 1) {
        throw new Error(
          "Return quantity must be at least 1."
        );
      }

      if (selectedQuantity > maxQuantity) {
        throw new Error(
          `Return quantity cannot be more than ${maxQuantity}.`
        );
      }

      const returnItems = [
        {
          order_line_id:
            selectedOrderForAction?.line_id,

          quantity: selectedQuantity,

          reason: data.reason,

          images: data.images || [],
        },
      ];

      const response =
        await initiateReturn({
          order_reference:
            selectedOrderForAction?.order_reference,

          items: returnItems,
        }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message ||
            "Return request submitted successfully!",
          type: "success",
        })
      );

      setShowCancelModal(false);

      setSelectedOrderForAction(null);

      await refetch();

      return response;
    } catch (error: any) {
      let errorMessage =
        "Failed to submit return request. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        const errorMessages =
          Object.values(
            error.data.errors
          ).flat();

        errorMessage =
          errorMessages.join(" ");
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch(
        showToast({
          message: errorMessage,
          type: "error",
        })
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /* ============================================================
     REVIEW SUBMIT
  ============================================================ */

  const handleReviewSubmit = async (
    reviewData: any
  ) => {
    try {
      const files: File[] =
        Array.isArray(reviewData?.images)
          ? reviewData.images.filter(
              (img: any): img is File =>
                img instanceof File
            )
          : [];

      const rating = Number(
        reviewData?.rating
      );

      const reviewText =
        reviewData?.review_text ??
        reviewData?.reviewText ??
        reviewData?.review ??
        "";

      if (
        !rating ||
        rating < 1 ||
        rating > 5
      ) {
        throw new Error(
          "Please select a valid rating."
        );
      }

      if (!reviewText.trim()) {
        throw new Error(
          "Please enter your review."
        );
      }

      if (
        !selectedOrderForReview?.line_id
      ) {
        throw new Error(
          "Order line ID is missing."
        );
      }

      if (
        !selectedOrderForReview?.product_id
      ) {
        throw new Error(
          "Product ID is missing."
        );
      }

      const response =
        await addRatingReview({
          rating,
          review_text: reviewText.trim(),

          order_id:
            selectedOrderForReview.order_id,

          order_line_id:
            selectedOrderForReview.line_id,

          product_id:
            selectedOrderForReview.product_id,

          images: files,
        }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message ||
            "Review submitted successfully!",
          type: "success",
        })
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
        })
      );

      throw error;
    }
  };

  /* ============================================================
     INVOICE
  ============================================================ */

  const handleInvoiceDownload = async (
    orderId: number
  ) => {
    setInvoiceLoadingOrders((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      const result =
        await getInvoice(orderId).unwrap();

      if (result?.data) {
        await generateInvoicePDF(
          result.data
        );

        dispatch(
          showToast({
            message:
              "Invoice generated successfully!",
            type: "success",
          })
        );
      } else {
        dispatch(
          showToast({
            message:
              "Invoice not available for this order",
            type: "error",
          })
        );
      }
    } catch (error: any) {
      console.error(
        "Invoice error:",
        error
      );

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to fetch invoice. Please try again.",
          type: "error",
        })
      );
    } finally {
      setInvoiceLoadingOrders((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  const openReviewModal = (
    order: any
  ) => {
    setSelectedOrderForReview(order);

    setIsReviewModalOpen(true);
  };

  const openCancelModal = (
    order: any
  ) => {
    setSelectedOrderForAction(order);

    setModalType("cancel");

    setShowCancelModal(true);
  };

  const openReturnModal = (
    order: any
  ) => {
    setSelectedOrderForAction(order);

    setModalType("return");

    setShowCancelModal(true);
  };

  const openBreakupModal = (
    order: any
  ) => {
    const allLines =
      ordersData?.data?.filter(
        (line: any) =>
          line.order_id ===
          order.order_id
      ) || [];

    setSelectedBreakupItems(
      allLines
    );

    setShowBreakup(true);
  };

  const openTrackModal = (
    order: any
  ) => {
    setSelectedOrderForTracking(
      order
    );

    setShowTrackModal(true);
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 14,
    },

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

  if (
    ordersLoading ||
    statusesLoading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E4E4E2] border-t-[#111111]" />

          <p className="mt-4 text-[12px] text-[#888888]">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        id="toast-portal"
        className="fixed right-4 top-4 z-[9999] w-auto max-w-md"
      />

      <div className="min-h-screen bg-[#F7F7F6] font-sans">
        {/* REVIEW MODAL */}

        <ReviewModal
          isOpen={
            isReviewModalOpen
          }
          onClose={() => {
            setIsReviewModalOpen(false);

            setSelectedOrderForReview(
              null
            );
          }}
          order={
            selectedOrderForReview
          }
          onSubmit={
            handleReviewSubmit
          }
          isLoading={
            isSubmittingReview
          }
        />

        {/* CANCEL / RETURN MODAL */}

        <OrderCancelModal
          isOpen={
            showCancelModal
          }
          onClose={() => {
            setShowCancelModal(false);

            setSelectedOrderForAction(
              null
            );
          }}
          orderReference={
            selectedOrderForAction?.order_reference ||
            ""
          }
          onCancel={
            modalType === "cancel"
              ? handleCancelOrder
              : handleReturnOrder
          }
          isLoading={
            isProcessing ||
            isCancelling ||
            isReturning
          }
          maxImages={5}
          maxFileSize={5}
          minReasonLength={10}
          modalType={modalType}
          order={
            selectedOrderForAction
          }
        />

        <div className="container mx-auto">
          <motion.div
            variants={
              containerVariants
            }
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* HEADER */}

            <motion.div
              variants={
                itemVariants
              }
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[24px]">
                  My Orders
                </h2>

                <p className="mt-0.5 text-[12px] text-[#888888]">
                  {
                    filteredOrders.length
                  }{" "}
                  order
                  {filteredOrders.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-[7px] border border-[#E4E4E2] bg-white px-4 py-2">
                <ShoppingBag className="h-3.5 w-3.5 text-[#111111]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#777777]">
                  Total:{" "}
                  {
                    filteredOrders.length
                  }
                </span>
              </div>
            </motion.div>

            {/* FILTER BAR */}

            <motion.div
              variants={
                itemVariants
              }
              className="flex flex-col items-start justify-between gap-3 rounded-[8px] border border-[#E4E4E2] bg-white p-4 md:flex-row md:items-center"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] font-medium text-[#171717]">
                  Filter:
                </span>

                <div className="relative">
                  <button
                    onClick={() =>
                      setIsFilterDropdownOpen(
                        !isFilterDropdownOpen
                      )
                    }
                    className="flex items-center gap-2 rounded-[6px] border border-[#D7D7D5] bg-white px-3.5 py-2 text-[11px] font-medium text-[#171717] transition hover:border-[#BDBDBA]"
                  >
                    <Filter className="h-3.5 w-3.5 text-[#888888]" />

                    <span>
                      {filter ===
                      "all"
                        ? "All Statuses"
                        : getStatusDisplayName(
                            filter
                          )}
                    </span>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#888888] transition-transform ${
                        isFilterDropdownOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-[7px] border border-[#E4E4E2] bg-white py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]">
                      <button
                        onClick={() => {
                          setFilter(
                            "all"
                          );

                          setIsFilterDropdownOpen(
                            false
                          );
                        }}
                        className={`w-full px-4 py-2 text-left text-[11px] transition-colors hover:bg-[#FAFAF9] ${
                          filter ===
                          "all"
                            ? "bg-[#FAFAF9] font-medium text-[#171717]"
                            : "text-[#666666]"
                        }`}
                      >
                        All Statuses
                      </button>

                      {statusList.map(
                        (
                          status: string
                        ) => (
                          <button
                            key={
                              status
                            }
                            onClick={() => {
                              setFilter(
                                status.toLowerCase()
                              );

                              setIsFilterDropdownOpen(
                                false
                              );
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[11px] transition-colors hover:bg-[#FAFAF9] ${
                              filter ===
                              status.toLowerCase()
                                ? "bg-[#FAFAF9] font-medium text-[#171717]"
                                : "text-[#666666]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                statusColors[
                                  status.toLowerCase()
                                ]
                                  ?.split(
                                    " "
                                  )[0]
                                  ?.replace(
                                    "text-",
                                    "bg-"
                                  ) ||
                                "bg-gray-400"
                              }`}
                            />

                            {getStatusDisplayName(
                              status
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#888888]" />

                <input
                  type="text"
                  placeholder="Search orders..."
                  value={
                    searchTerm
                  }
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="h-[38px] w-full rounded-[6px] border border-[#D7D7D5] bg-white py-2 pl-9 pr-3 text-[12px] text-[#171717] outline-none transition placeholder:text-[#999999] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
                />
              </div>
            </motion.div>

            {/* ORDERS LIST */}

            {filteredOrders.length ===
            0 ? (
              <motion.div
                variants={
                  itemVariants
                }
                className="rounded-[8px] border border-[#E4E4E2] bg-white p-12 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <Package className="h-7 w-7 text-[#999999]" />
                </div>

                <h3 className="mt-4 text-[17px] font-semibold text-[#171717]">
                  No orders found
                </h3>

                <p className="mt-1.5 text-[12px] text-[#888888]">
                  {searchTerm
                    ? "Try adjusting your search or filter."
                    : "You haven't placed any orders yet."}
                </p>

                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm(
                        ""
                      );

                      setFilter(
                        "all"
                      );
                    }}
                    className="mt-4 rounded-[6px] bg-[#111111] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={
                  containerVariants
                }
                className="space-y-3"
              >
                {filteredOrders.map(
                  (order: any) => {
                    const StatusIcon =
                      getStatusIcon(
                        order.delivery_status
                      );

                    const statusColor =
                      getStatusColor(
                        order.delivery_status
                      );

                    const isExpanded =
                      expandedOrder ===
                      order.display_id;

                    const isDelivered =
                      order.delivery_status?.toLowerCase() ===
                      "delivered";

                    const isCancelled =
                      order.is_line_cancelled ||
                      order.delivery_status?.toLowerCase() ===
                        "cancelled";

                    const isReturned =
                      order.delivery_status?.toLowerCase() ===
                      "returned";

                    const isReviewed =
                      order.is_reviewed ||
                      false;

                    const hasReviews =
                      hasProductReviews(
                        order
                      );

                    const isInvoiceLoading =
                      invoiceLoadingOrders[
                        order.order_id
                      ] || false;

                    const timelineSteps =
                      getTimelineSteps(
                        order.timeline
                      );

                    return (
                      <motion.div
                        key={
                          order.display_id
                        }
                        variants={
                          itemVariants
                        }
                        className={`overflow-hidden rounded-[8px] border bg-white transition-all ${
                          isCancelled
                            ? "border-[#F0CFCF]"
                            : isReturned
                            ? "border-[#EBD9B4]"
                            : "border-[#E4E4E2]"
                        }`}
                      >
                        {/* ORDER HEADER */}

                        <div
                          className="cursor-pointer p-4 transition-colors hover:bg-[#FAFAF9] sm:p-5"
                          onClick={() =>
                            toggleOrder(
                              order.display_id
                            )
                          }
                        >
                          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-3.5">
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
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
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-5 w-5 text-[#999999]" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-[13px] font-semibold text-[#171717]">
                                    {order.order_reference ||
                                      `Order #${order.order_id}`}
                                  </h4>

                                  {order.is_multi_item && (
                                    <span className="rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 text-[9px] font-medium text-[#3F765A]">
                                      +
                                      {
                                        order.item_count
                                      }{" "}
                                      items
                                    </span>
                                  )}

                                  {hasReviews && (
                                    <span className="rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 text-[9px] font-medium text-[#3F765A]">
                                      <Star className="inline h-2.5 w-2.5 fill-[#3F765A] text-[#3F765A]" />

                                      Reviewed
                                    </span>
                                  )}

                                  {isCancelled && (
                                    <span className="rounded-full border border-[#F0CFCF] bg-[#FDF2F2] px-2 py-0.5 text-[9px] font-medium text-[#B24C4C]">
                                      Cancelled
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#888888]">
                                  <Calendar className="h-3 w-3" />

                                  {formatDate(
                                    order.order_date
                                  )}
                                </p>

                                <p className="mt-0.5 text-[12px] font-medium text-[#171717]">
                                  {
                                    order.product_name
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusColor}`}
                              >
                                <StatusIcon className="h-3 w-3" />

                                {getStatusDisplayName(
                                  order.delivery_status
                                )}
                              </span>

                              <span className="text-[15px] font-semibold text-[#111111]">
                                {formatPrice(
                                  order.line_total ||
                                    order.unit_price *
                                      order.quantity ||
                                    0
                                )}
                              </span>

                              <ChevronDown
                                className={`h-4 w-4 text-[#888888] transition-transform ${
                                  isExpanded
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* EXPANDED DETAILS */}

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height:
                                  "auto",
                                opacity: 1,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                              }}
                              transition={{
                                duration: 0.25,
                              }}
                              className="border-t border-[#E6E6E4]"
                            >
                              <div className="space-y-4 p-4 sm:p-5">
                                {/* DETAILS GRID */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Order Reference
                                    </p>

                                    <p className="mt-0.5 text-[12px] font-medium text-[#171717]">
                                      {order.order_reference ||
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Payment Status
                                    </p>

                                    <p className="mt-1">
                                      <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                                          order.payment_status ===
                                          "paid"
                                            ? "bg-[#F1F7F3] text-[#3F765A]"
                                            : order.payment_status ===
                                              "failed"
                                            ? "bg-[#FDF2F2] text-[#B24C4C]"
                                            : "bg-[#FBF3E4] text-[#A9711F]"
                                        }`}
                                      >
                                        {order.payment_status ||
                                          "N/A"}
                                      </span>
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Payment Method
                                    </p>

                                    <p className="mt-0.5 text-[12px] text-[#171717]">
                                      {order.payment_gateway ||
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Transaction ID
                                    </p>

                                    <p className="mt-0.5 text-[12px] text-[#171717]">
                                      {order.gateway_transaction_id ||
                                        "N/A"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Order Total
                                    </p>

                                    <p className="mt-0.5 text-[15px] font-semibold text-[#111111]">
                                      {formatPrice(
                                        order.line_total ||
                                          0
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                      Quantity
                                    </p>

                                    <p className="mt-0.5 text-[12px] font-medium text-[#171717]">
                                      {order.quantity ||
                                        0}
                                    </p>
                                  </div>

                                  {order.delivery_address && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                        Shipping Address
                                      </p>

                                      <p className="mt-0.5 text-[12px] text-[#171717]">
                                        {order.delivery_address?.full_address ||
                                          "N/A"}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* REVIEWS */}

                                {hasReviews && (
                                  <ReviewDisplay
                                    reviews={
                                      order.product_reviews
                                    }
                                  />
                                )}

                                {/* ACTION BUTTONS */}

                                <div className="flex flex-wrap items-center gap-2.5 border-t border-[#E6E6E4] pt-4">
                                  {/* CANCEL */}

                                  {canCancelOrder(
                                    order
                                  ) && (
                                    <button
                                      onClick={() =>
                                        openCancelModal(
                                          order
                                        )
                                      }
                                      className="flex items-center gap-1.5 rounded-[6px] border border-[#F0CFCF] bg-[#FDF2F2] px-3.5 py-2 text-[11px] font-medium text-[#B24C4C] transition hover:bg-[#B24C4C] hover:text-white"
                                    >
                                      <Ban className="h-3.5 w-3.5" />

                                      Cancel Order
                                    </button>
                                  )}

                                  {/* RETURN */}

                                  {canReturnOrder(
                                    order
                                  ) &&
                                    !isCancelled && (
                                      <button
                                        onClick={() =>
                                          openReturnModal(
                                            order
                                          )
                                        }
                                        className="flex items-center gap-1.5 rounded-[6px] border border-[#EBD9B4] bg-[#FBF3E4] px-3.5 py-2 text-[11px] font-medium text-[#A9711F] transition hover:bg-[#A9711F] hover:text-white"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />

                                        Return Order
                                      </button>
                                    )}

                                  {/* TRACK */}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      openTrackModal(
                                        order
                                      );
                                    }}
                                    className="flex items-center gap-1.5 rounded-[6px] border border-[#CBD5F0] bg-[#EEF1FB] px-3.5 py-2 text-[11px] font-medium text-[#3E5AA8] transition hover:bg-[#3E5AA8] hover:text-white"
                                  >
                                    <Truck className="h-3.5 w-3.5" />

                                    Track Order
                                  </button>

                                  {/* REVIEW */}

                                  {canReviewOrder(
                                    order
                                  ) &&
                                    !isCancelled && (
                                      <button
                                        onClick={() =>
                                          openReviewModal(
                                            order
                                          )
                                        }
                                        className="flex items-center gap-1.5 rounded-[6px] border border-[#111111] px-3.5 py-2 text-[11px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
                                      >
                                        <Star className="h-3.5 w-3.5" />

                                        Write a Review
                                      </button>
                                    )}

                                  {/* REVIEW SUBMITTED */}

                                  {isDelivered &&
                                    isReviewed &&
                                    !hasReviews &&
                                    !isCancelled && (
                                      <span className="flex items-center gap-1.5 rounded-[6px] border border-[#CFE0D4] bg-[#F1F7F3] px-3.5 py-2 text-[11px] font-medium text-[#3F765A]">
                                        <Check className="h-3.5 w-3.5" />

                                        Review
                                        Submitted
                                      </span>
                                    )}

                                  {/* REVIEW COUNT */}

                                  {isDelivered &&
                                    hasReviews &&
                                    !isCancelled && (
                                      <span className="flex items-center gap-1.5 rounded-[6px] border border-[#CFE0D4] bg-[#F1F7F3] px-3.5 py-2 text-[11px] font-medium text-[#3F765A]">
                                        <MessageCircle className="h-3.5 w-3.5" />

                                        {
                                          order
                                            .product_reviews
                                            .length
                                        }{" "}
                                        Review
                                        {order
                                          .product_reviews
                                          .length >
                                        1
                                          ? "s"
                                          : ""}
                                      </span>
                                    )}

                                  {/* CANCELLED */}

                                  {isCancelled && (
                                    <span className="flex items-center gap-1.5 rounded-[6px] border border-[#F0CFCF] bg-[#FDF2F2] px-3.5 py-2 text-[11px] font-medium text-[#B24C4C]">
                                      <XCircle className="h-3.5 w-3.5" />

                                      Order Cancelled
                                    </span>
                                  )}

                                  {/* RETURNED */}

                                  {isReturned && (
                                    <span className="flex items-center gap-1.5 rounded-[6px] border border-[#EBD9B4] bg-[#FBF3E4] px-3.5 py-2 text-[11px] font-medium text-[#A9711F]">
                                      <RotateCcw className="h-3.5 w-3.5" />

                                      Order Returned
                                    </span>
                                  )}

                                  {/* INVOICE */}

                                  {canShowInvoice(
                                    order
                                  ) &&
                                    !isCancelled && (
                                      <button
                                        onClick={() =>
                                          handleInvoiceDownload(
                                            order.order_id
                                          )
                                        }
                                        disabled={
                                          isInvoiceLoading
                                        }
                                        className="flex items-center gap-1.5 rounded-[6px] border border-[#D7D7D5] bg-white px-3.5 py-2 text-[11px] font-medium text-[#171717] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
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

                                  {/* PRINT */}

                                  <button
                                    onClick={() =>
                                      window.print()
                                    }
                                    className="flex items-center gap-1.5 rounded-[6px] border border-[#D7D7D5] bg-white px-3.5 py-2 text-[11px] font-medium text-[#171717] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9]"
                                  >
                                    <Printer className="h-3.5 w-3.5" />

                                    Print
                                  </button>

                                  {/* BREAKUP */}

                                  {order.is_multi_item &&
                                    order.item_count >
                                      1 &&
                                    order.item_index ===
                                      1 && (
                                      <button
                                        onClick={(
                                          e
                                        ) => {
                                          e.stopPropagation();

                                          openBreakupModal(
                                            order
                                          );
                                        }}
                                        className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-[#CBD5F0] bg-[#EEF1FB] px-3.5 py-2 text-[11px] font-medium text-[#3E5AA8] transition hover:bg-[#3E5AA8] hover:text-white"
                                      >
                                        <FileText className="h-3.5 w-3.5" />

                                        View Breakup
                                      </button>
                                    )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* BREAKUP MODAL */}

        <AnimatePresence>
          {showBreakup && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 font-sans backdrop-blur-[2px]"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setShowBreakup(false)
              }
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
                className="w-full max-w-2xl overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
              >
                <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#171717]">
                      Order Price Breakup
                    </h3>

                    <p className="mt-0.5 text-[10px] text-[#888888]">
                      {selectedBreakupItems[0]
                        ?.order_reference ||
                        "N/A"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowBreakup(
                        false
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-5">
                  <div className="space-y-2.5">
                    {selectedBreakupItems.map(
                      (item: any) => {
                        const isCancelled =
                          item.delivery_status?.toLowerCase() ===
                          "cancelled";

                        return (
                          <div
                            key={
                              item.line_id
                            }
                            className={`flex items-center justify-between rounded-[7px] border p-3.5 ${
                              isCancelled
                                ? "border-[#F0CFCF] bg-[#FDF2F2]"
                                : "border-[#E4E4E2] bg-[#FAFAF9]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                {item.primary_image ? (
                                  <Image
                                    src={
                                      item.primary_image
                                    }
                                    alt={
                                      item.product_name ||
                                      "Product"
                                    }
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Package className="h-4 w-4 text-[#999999]" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="text-[12px] font-medium text-[#171717]">
                                  {
                                    item.product_name
                                  }

                                  {isCancelled && (
                                    <span className="ml-2 text-[10px] font-medium text-[#B24C4C]">
                                      (Cancelled)
                                    </span>
                                  )}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#888888]">
                                  Qty:{" "}
                                  {
                                    item.quantity
                                  }{" "}
                                  • GST:{" "}
                                  {
                                    item.gst_rate
                                  }
                                  %
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-[14px] font-semibold ${
                                  isCancelled
                                    ? "text-[#B24C4C]"
                                    : "text-[#111111]"
                                }`}
                              >
                                {formatPrice(
                                  item.line_total ||
                                    0
                                )}
                              </p>

                              <p className="mt-0.5 text-[10px] text-[#888888]">
                                {formatPrice(
                                  item.unit_price ||
                                    0
                                )}{" "}
                                ×{" "}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {selectedBreakupItems.length >
                    0 && (
                    <div className="mt-4 border-t border-[#E6E6E4] pt-4">
                      <div className="flex justify-between py-1.5 text-[12px]">
                        <span className="text-[#888888]">
                          Subtotal
                        </span>

                        <span className="font-medium text-[#171717]">
                          {formatPrice(
                            selectedBreakupItems[0]
                              ?.subtotal ||
                              0
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 text-[12px]">
                        <span className="text-[#888888]">
                          GST
                        </span>

                        <span className="font-medium text-[#171717]">
                          {formatPrice(
                            selectedBreakupItems[0]
                              ?.total_gst ||
                              0
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 text-[12px]">
                        <span className="text-[#888888]">
                          Shipping
                        </span>

                        <span className="font-medium text-[#171717]">
                          {formatPrice(
                            selectedBreakupItems[0]
                              ?.shipping_charge ||
                              0
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex justify-between border-t border-[#E6E6E4] pt-3">
                        <span className="text-[13px] font-semibold text-[#171717]">
                          Total Payable
                        </span>

                        <span className="text-[17px] font-semibold text-[#111111]">
                          {formatPrice(
                            selectedBreakupItems[0]
                              ?.total_payable ||
                              selectedBreakupItems[0]
                                ?.amount_paid ||
                              0
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRACK MODAL */}

        <AnimatePresence>
          {showTrackModal && (
            <TrackModal
              isOpen={
                showTrackModal
              }
              onClose={() => {
                setShowTrackModal(
                  false
                );

                setSelectedOrderForTracking(
                  null
                );
              }}
              timelineSteps={getTimelineSteps(
                selectedOrderForTracking?.timeline
              )}
              order={
                selectedOrderForTracking
              }
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

