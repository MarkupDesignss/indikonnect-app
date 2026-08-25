"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
  pending: "text-[#C9A227] bg-[#FBF6EC] border-[#FDCB00]/30",
  confirmed: "text-[#24887C] bg-[#F4F8F5] border-[#24887C]/20",
  processing: "text-[#7C3AED] bg-[#F5F3FF] border-[#7C3AED]/20",
  dispatched: "text-[#4F46E5] bg-[#EEF2FF] border-[#4F46E5]/20",
  delivered: "text-[#24887C] bg-[#F0FDF4] border-[#24887C]/20",
  cancelled: "text-[#B85F59] bg-[#FFF5F5] border-[#B85F59]/20",
  returned: "text-[#D97706] bg-[#FFFBEB] border-[#D97706]/20",
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
  if (!amount) return "0";
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase();
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
      result.push({
        display_id: `${orderId}_${line.line_id}`,
        order_id: orderId,
        delivery_status: line.delivery_status,
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
        gateway_transaction_id: orderGroup.gateway_transaction_id,
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
        timeline: orderGroup.timeline,
        is_reviewed: line.is_reviewed ?? orderGroup.is_reviewed ?? false,
        is_returned: line.is_returned ?? orderGroup.is_returned ?? false,
        line_id: line.line_id,
        product_id: line.product_id,
        product_name: line.product_name,
        product_code: line.product_code,
        quantity: line.quantity,
        unit_price: line.unit_price,
        gst_rate: line.gst_rate,
        gst_amount: line.gst_amount,
        line_total: line.line_total,
        commissionable_volume: line.commissionable_volume,
        images: line.images || [],
        primary_image: line.primary_image,
        is_multi_item: totalItems > 1,
        item_count: totalItems,
        item_index: index + 1,
      });
    });
  });

  return result.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
};

// Track Modal Component
function TrackModal({ isOpen, onClose, timelineSteps, order }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#EFE6D3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#F4F8F5] p-2.5">
              <Truck className="h-5 w-5 text-[#24887C]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2B2420]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "22px" }}>
                Order Tracking
              </h3>
              <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                Order #{order?.order_reference || order?.order_id || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#8a7f6e] transition-colors hover:bg-[#FBF6EC] hover:text-[#2B2420]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {timelineSteps.length > 0 ? (
            <div className="relative">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className="relative flex items-start gap-3 pb-6 last:pb-0">
                  {index < timelineSteps.length - 1 && (
                    <div className="absolute left-[5px] top-6 h-[calc(100%-8px)] w-0.5 bg-[#EFE6D3]" />
                  )}
                  <div className={`relative z-10 mt-1 h-3 w-3 flex-shrink-0 rounded-full ${step.color} ring-4 ring-white`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                      {formatDate(step.date)}
                      {step.time && ` at ${step.time}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Truck className="mx-auto h-12 w-12 text-[#C2BCB0]" />
              <p className="mt-2 text-sm text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const searchParams = useSearchParams();
  const orderReferenceFromUrl = searchParams.get("order") || "";

  const [searchTerm, setSearchTerm] = useState(orderReferenceFromUrl);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBreakup, setShowBreakup] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedBreakupItems, setSelectedBreakupItems] = useState<any[]>([]);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<any>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalType, setModalType] = useState<"cancel" | "return">("cancel");
  const [invoiceLoadingOrders, setInvoiceLoadingOrders] = useState<Record<number, boolean>>({});

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

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [initiateReturn, { isLoading: isReturning }] = useInitiateReturnMutation();
  const [addRatingReview, { isLoading: isSubmittingReview }] = useAddRatingReviewMutation();
  const [getInvoice] = useLazyGetInvoiceByOrderIdQuery();

  const statusList = statusesData?.data || [];
  const transformedOrders = useMemo(() => {
    if (!ordersData?.data || !Array.isArray(ordersData.data)) return [];
    return transformOrderLines(ordersData.data);
  }, [ordersData]);

  const filteredOrders = transformedOrders.filter((order: any) => {
    const matchesFilter = filter === "all" ||
      order.order_status?.toLowerCase() === filter ||
      order.delivery_status?.toLowerCase() === filter;

    const searchValue = searchTerm.toLowerCase();
    const matchesSearch = order.order_reference?.toLowerCase().includes(searchValue) ||
      order.product_name?.toLowerCase().includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusIcon = (status: string) => statusIcons[status?.toLowerCase()] || Package;
  const getStatusColor = (status: string) => statusColors[status?.toLowerCase()] || "text-[#6E706C] bg-[#F5F5F5] border-[#E0E0E0]";
  const getStatusDisplayName = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const canCancelOrder = (order: any) => {
    const status = order.order_status?.toLowerCase();
    return status === "pending" || status === "confirmed" || status === "processing";
  };

  const canReturnOrder = (order: any) => {
    const status = order.order_status?.toLowerCase();
    return status === "delivered" && !order.is_returned && !order.is_reviewed;
  };

  const handleCancelOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);
    try {
      await cancelOrder({
        orderReference: selectedOrderForAction?.order_reference,
        reason: data.reason,
      }).unwrap();

      dispatch(showToast({
        message: "Order cancelled successfully!",
        type: "success",
      }));

      setShowCancelModal(false);
      setSelectedOrderForAction(null);
      refetch();
    } catch (error: any) {
      dispatch(showToast({
        message: error?.data?.message || "Failed to cancel order. Please try again.",
        type: "error",
      }));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);
    try {
      const selectedQuantity = Number(data.quantity) || Number(selectedOrderForAction?.quantity) || 1;
      const maxQuantity = Number(selectedOrderForAction?.quantity) || 1;

      if (selectedQuantity < 1) throw new Error("Return quantity must be at least 1.");
      if (selectedQuantity > maxQuantity) throw new Error(`Return quantity cannot be more than ${maxQuantity}.`);

      const returnItems = [{
        order_line_id: selectedOrderForAction?.line_id,
        quantity: selectedQuantity,
        reason: data.reason,
        images: data.images || [],
      }];

      const response = await initiateReturn({
        order_reference: selectedOrderForAction?.order_reference,
        items: returnItems,
      }).unwrap();

      dispatch(showToast({
        message: response?.message || "Return request submitted successfully!",
        type: "success",
      }));

      setShowCancelModal(false);
      setSelectedOrderForAction(null);
      refetch();
      return response;
    } catch (error: any) {
      let errorMessage = "Failed to submit return request. Please try again.";
      if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat();
        errorMessage = errorMessages.join(" ");
      } else if (error?.message) errorMessage = error.message;

      dispatch(showToast({ message: errorMessage, type: "error" }));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const files: File[] = Array.isArray(reviewData?.images) ? reviewData.images.filter((img: any): img is File => img instanceof File) : [];
      const rating = Number(reviewData?.rating);
      const reviewText = reviewData?.review_text ?? reviewData?.reviewText ?? reviewData?.review ?? "";

      if (!rating || rating < 1 || rating > 5) throw new Error("Please select a valid rating.");
      if (!reviewText.trim()) throw new Error("Please enter your review.");
      if (!selectedOrderForReview?.order_id) throw new Error("Order ID is missing.");
      if (!selectedOrderForReview?.product_id) throw new Error("Product ID is missing.");

      const response = await addRatingReview({
        rating,
        review_text: reviewText.trim(),
        order_id: selectedOrderForReview.order_id,
        product_id: selectedOrderForReview.product_id,
        images: files,
      }).unwrap();

      dispatch(showToast({
        message: response?.message || "Review submitted successfully!",
        type: "success",
      }));

      setIsReviewModalOpen(false);
      setSelectedOrderForReview(null);
      await refetch();
      return response;
    } catch (error: any) {
      dispatch(showToast({
        message: error?.data?.message || error?.message || "Failed to submit review. Please try again.",
        type: "error",
      }));
      throw error;
    }
  };

  const handleInvoiceDownload = async (orderId: number) => {
    setInvoiceLoadingOrders((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await getInvoice(orderId).unwrap();
      if (result?.data) {
        generateInvoicePDF(result.data);
        dispatch(showToast({ message: "Invoice generated successfully!", type: "success" }));
      } else {
        dispatch(showToast({ message: "Invoice not available for this order", type: "error" }));
      }
    } catch (error: any) {
      dispatch(showToast({
        message: error?.data?.message || "Failed to fetch invoice. Please try again.",
        type: "error",
      }));
    } finally {
      setInvoiceLoadingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

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

  const openBreakupModal = (order: any) => {
    const allLines = ordersData?.data?.filter((line: any) => line.order_id === order.order_id) || [];
    setSelectedBreakupItems(allLines);
    setShowBreakup(true);
  };

  const openTrackModal = (order: any) => {
    setSelectedOrderForTracking(order);
    setShowTrackModal(true);
  };

  const getTimelineSteps = (timeline: any) => {
    const steps = [];
    if (timeline?.order_placed) steps.push({ key: 'order_placed', label: 'Order Placed', date: timeline.order_placed, time: formatTime(timeline.order_placed), color: 'bg-[#24887C]' });
    if (timeline?.order_confirmed) steps.push({ key: 'order_confirmed', label: 'Order Confirmed', date: timeline.order_confirmed, time: formatTime(timeline.order_confirmed), color: 'bg-[#4F46E5]' });
    if (timeline?.shipped_at) steps.push({ key: 'shipped_at', label: 'Shipped', date: timeline.shipped_at, time: formatTime(timeline.shipped_at), color: 'bg-[#7C3AED]' });
    if (timeline?.delivered_at) steps.push({ key: 'delivered_at', label: 'Delivered', date: timeline.delivered_at, time: formatTime(timeline.delivered_at), color: 'bg-[#24887C]' });
    if (timeline?.cancelled_at) steps.push({ key: 'cancelled_at', label: 'Cancelled', date: timeline.cancelled_at, time: formatTime(timeline.cancelled_at), color: 'bg-[#B85F59]' });
    if (timeline?.returned_at) steps.push({ key: 'returned_at', label: 'Returned', date: timeline.returned_at, time: formatTime(timeline.returned_at), color: 'bg-[#D97706]' });
    return steps;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
  };

  if (ordersLoading || statusesLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EFE6D3] border-t-[#24887C]" />
          <p className="mt-4 text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <OrderCancelModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOrderForAction(null);
        }}
        orderReference={selectedOrderForAction?.order_reference || ""}
        onCancel={modalType === "cancel" ? handleCancelOrder : handleReturnOrder}
        isLoading={isProcessing || isCancelling || isReturning}
        maxImages={5}
        maxFileSize={5}
        minReasonLength={10}
        modalType={modalType}
        order={selectedOrderForAction}
      />

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

      <div className="container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div>
              <h2
                className="text-[32px] font-semibold text-[#2B2420]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                My Orders
              </h2>
              <p
                className="text-sm text-[#8a7f6e]"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div
              className="flex items-center gap-2 rounded-full border border-[#E7DBC0] bg-white px-5 py-2.5 shadow-[0_2px_8px_rgba(43,36,32,0.04)]"
            >
              <ShoppingBag className="h-4 w-4 text-[#24887C]" />
              <span
                className="text-[10px] uppercase tracking-[0.35em] text-[#8a7f6e]"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                Total Orders: {filteredOrders.length}
              </span>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-start justify-between gap-4 rounded-[20px] border border-[#E7DBC0]/70 bg-white p-4 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] md:flex-row md:items-center"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-sm font-medium text-[#2B2420]"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                Filter:
              </span>

              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#E7DBC0] bg-white px-4 py-2 text-sm font-medium text-[#2B2420] transition-all hover:border-[#C9A227] hover:shadow-sm"
                  style={{ fontFamily: "Jost, sans-serif" }}
                >
                  <Filter className="h-4 w-4 text-[#8a7f6e]" />
                  <span>
                    {filter === "all" ? "All Statuses" : getStatusDisplayName(filter)}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#8a7f6e] transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-[16px] border border-[#E7DBC0] bg-white py-2 shadow-[0_12px_40px_-12px_rgba(43,36,32,0.15)]">
                    <button
                      onClick={() => { setFilter("all"); setIsFilterDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#FBF6EC] ${filter === "all" ? "bg-[#FBF6EC] font-medium text-[#2B2420]" : "text-[#6E706C]"}`}
                      style={{ fontFamily: "Jost, sans-serif" }}
                    >
                      All Statuses
                    </button>
                    {statusList.map((status: string) => (
                      <button
                        key={status}
                        onClick={() => { setFilter(status.toLowerCase()); setIsFilterDropdownOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#FBF6EC] ${filter === status.toLowerCase() ? "bg-[#FBF6EC] font-medium text-[#2B2420]" : "text-[#6E706C]"}`}
                        style={{ fontFamily: "Jost, sans-serif" }}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusColors[status.toLowerCase()]?.split(" ")[0]?.replace("text-", "bg-") || "bg-gray-400"}`} />
                        {getStatusDisplayName(status)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f6e]" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-[#E7DBC0] bg-white py-2 pl-9 pr-4 text-sm text-[#2B2420] transition-all placeholder:text-[#8a7f6e] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                style={{ fontFamily: "Jost, sans-serif" }}
              />
            </div>
          </motion.div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="rounded-[20px] border border-[#E7DBC0]/70 bg-white p-12 text-center shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)]"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FBF6EC]">
                <Package className="h-10 w-10 text-[#C2BCB0]" />
              </div>
              <h3
                className="mt-4 text-2xl font-semibold text-[#2B2420]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                No orders found
              </h3>
              <p
                className="mt-2 text-sm text-[#8a7f6e]"
                style={{ fontFamily: "Jost, sans-serif" }}
              >
                {searchTerm ? "Try adjusting your search or filter." : "You haven't placed any orders yet."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setFilter("all"); }}
                  className="mt-4 rounded-full bg-[#2B2420] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#92403F]"
                  style={{ fontFamily: "Jost, sans-serif" }}
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {filteredOrders.map((order: any) => {
                const StatusIcon = getStatusIcon(order.delivery_status);
                const statusColor = getStatusColor(order.delivery_status);
                const isExpanded = expandedOrder === order.display_id;
                const isDelivered = order.order_status?.toLowerCase() === "delivered";
                const isReviewed = order.is_reviewed || false;
                const isCancelled = order.order_status?.toLowerCase() === "cancelled";
                const isReturned = order.order_status?.toLowerCase() === "returned";
                const isInvoiceLoading = invoiceLoadingOrders[order.order_id] || false;
                const timelineSteps = getTimelineSteps(order.timeline);

                return (
                  <motion.div
                    key={order.display_id}
                    variants={itemVariants}
                    className={`overflow-hidden rounded-[20px] border bg-white shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] transition-all hover:shadow-[0_12px_40px_-12px_rgba(43,36,32,0.12)] ${
                      isCancelled ? "border-[#B85F59]/30" :
                      isReturned ? "border-[#D97706]/30" :
                      "border-[#E7DBC0]/70"
                    }`}
                  >
                    {/* Order Header */}
                    <div
                      className="cursor-pointer p-5 transition-colors hover:bg-[#FBF8F2]/50"
                      onClick={() => toggleOrder(order.display_id)}
                    >
                      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] bg-[#F0EEE8] border border-[#E7DBC0]/50">
                            {order.primary_image ? (
                              <Image
                                src={order.primary_image}
                                alt={order.product_name || "Product"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-[#C2BCB0]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className="font-semibold text-[#2B2420]"
                                style={{ fontFamily: "Jost, sans-serif", fontSize: "14px" }}
                              >
                                {order.order_reference || `Order #${order.order_id}`}
                              </h4>
                              {order.is_multi_item && (
                                <span className="rounded-full bg-[#F4F8F5] px-2 py-0.5 text-[8px] font-medium text-[#24887C] border border-[#24887C]/20">
                                  +{order.item_count} items
                                </span>
                              )}
                            </div>

                            <p
                              className="flex items-center gap-1.5 text-xs text-[#8a7f6e]"
                              style={{ fontFamily: "Jost, sans-serif" }}
                            >
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.order_date)}
                            </p>

                            <p
                              className="text-sm font-medium text-[#2B2420]"
                              style={{ fontFamily: "Jost, sans-serif" }}
                            >
                              {order.product_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {getStatusDisplayName(order.delivery_status)}
                          </span>

                          <span
                            className="text-lg font-semibold text-[#2B2420]"
                            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                          >
                            {formatPrice(order.line_total || order.unit_price * order.quantity || 0)}
                          </span>

                          <ChevronDown
                            className={`h-5 w-5 text-[#8a7f6e] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-[#EFE6D3]"
                        >
                          <div className="space-y-4 p-5">
                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Order Reference
                                </p>
                                <p
                                  className="text-sm font-medium text-[#2B2420]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  {order.order_reference || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Payment Status
                                </p>
                                <p
                                  className="text-sm font-medium text-[#2B2420]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs ${
                                      order.payment_status === "paid" ? "bg-[#F0FDF4] text-[#24887C]" :
                                      order.payment_status === "failed" ? "bg-[#FFF5F5] text-[#B85F59]" :
                                      "bg-[#FFFBEB] text-[#D97706]"
                                    }`}
                                  >
                                    {order.payment_status || "N/A"}
                                  </span>
                                </p>
                              </div>

                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Payment Method
                                </p>
                                <p
                                  className="text-sm text-[#2B2420]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  {order.payment_gateway || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Transaction ID
                                </p>
                                <p
                                  className="text-sm text-[#2B2420]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  {order.gateway_transaction_id || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Order Total
                                </p>
                                <p
                                  className="text-lg font-semibold text-[#24887C]"
                                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                                >
                                  {formatPrice(order.line_total || 0)}
                                </p>
                              </div>

                              <div>
                                <p
                                  className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  Quantity
                                </p>
                                <p
                                  className="text-sm font-medium text-[#2B2420]"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  {order.quantity || 0}
                                </p>
                              </div>

                              {order.delivery_address && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                  <p
                                    className="text-xs uppercase tracking-[0.15em] text-[#8a7f6e]"
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  >
                                    Shipping Address
                                  </p>
                                  <p
                                    className="text-sm text-[#2B2420]"
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  >
                                    {order.delivery_address?.full_address || "N/A"}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 border-t border-[#EFE6D3] pt-4">
                              {canCancelOrder(order) && (
                                <button
                                  onClick={() => openCancelModal(order)}
                                  className="flex items-center gap-2 rounded-full border border-[#B85F59]/30 bg-[#FFF5F5] px-4 py-2 text-sm font-medium text-[#B85F59] transition-all hover:bg-[#B85F59] hover:text-white hover:shadow-md"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  <Ban className="h-4 w-4" />
                                  Cancel Order
                                </button>
                              )}

                              {canReturnOrder(order) && (
                                <button
                                  onClick={() => openReturnModal(order)}
                                  className="flex items-center gap-2 rounded-full border border-[#D97706]/30 bg-[#FFFBEB] px-4 py-2 text-sm font-medium text-[#D97706] transition-all hover:bg-[#D97706] hover:text-white hover:shadow-md"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Return Order
                                </button>
                              )}

                              <button
                                onClick={(e) => { e.stopPropagation(); openTrackModal(order); }}
                                className="flex items-center gap-2 rounded-full border border-[#4F46E5]/30 bg-[#EEF2FF] px-4 py-2 text-sm font-medium text-[#4F46E5] transition-all hover:bg-[#4F46E5] hover:text-white hover:shadow-md"
                                style={{ fontFamily: "Jost, sans-serif" }}
                              >
                                <Truck className="h-4 w-4" />
                                Track Order
                              </button>

                              {isDelivered && (
                                isReviewed ? (
                                  <span className="flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-sm font-medium text-[#24887C] border border-[#24887C]/20">
                                    <Check className="h-4 w-4" />
                                    Review Submitted
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => openReviewModal(order)}
                                    className="flex items-center gap-2 rounded-full bg-[#FDCB00] px-4 py-2 text-sm font-medium text-[#1A1A2E] transition-all hover:bg-[#E5B800] hover:shadow-md"
                                    style={{ fontFamily: "Jost, sans-serif" }}
                                  >
                                    <Star className="h-4 w-4 fill-[#1A1A2E]" />
                                    Write a Review
                                  </button>
                                )
                              )}

                              {isCancelled && (
                                <span className="flex items-center gap-2 rounded-full bg-[#FFF5F5] px-4 py-2 text-sm font-medium text-[#B85F59] border border-[#B85F59]/20">
                                  <XCircle className="h-4 w-4" />
                                  Order Cancelled
                                </span>
                              )}

                              {isReturned && (
                                <span className="flex items-center gap-2 rounded-full bg-[#FFFBEB] px-4 py-2 text-sm font-medium text-[#D97706] border border-[#D97706]/20">
                                  <RotateCcw className="h-4 w-4" />
                                  Order Returned
                                </span>
                              )}

                              {order.invoice && (
                                <button
                                  onClick={() => handleInvoiceDownload(order.order_id)}
                                  disabled={isInvoiceLoading}
                                  className="flex items-center gap-2 rounded-full border border-[#E7DBC0] bg-white px-4 py-2 text-sm font-medium text-[#2B2420] transition-all hover:bg-[#FBF6EC] hover:border-[#C9A227] disabled:cursor-not-allowed disabled:opacity-50"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  {isInvoiceLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4" />
                                      Invoice
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 rounded-full border border-[#E7DBC0] bg-white px-4 py-2 text-sm font-medium text-[#2B2420] transition-all hover:bg-[#FBF6EC] hover:border-[#C9A227]"
                                style={{ fontFamily: "Jost, sans-serif" }}
                              >
                                <Printer className="h-4 w-4" />
                                Print
                              </button>

                              {order.is_multi_item && order.item_count > 1 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openBreakupModal(order); }}
                                  className="ml-auto flex items-center gap-2 rounded-full border border-[#4F46E5]/30 bg-[#EEF2FF] px-4 py-2 text-sm font-medium text-[#4F46E5] transition-all hover:bg-[#4F46E5] hover:text-white hover:shadow-md"
                                  style={{ fontFamily: "Jost, sans-serif" }}
                                >
                                  <FileText className="h-4 w-4" />
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
              })}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Breakup Modal */}
      <AnimatePresence>
        {showBreakup && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBreakup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EFE6D3] px-6 py-4">
                <div>
                  <h3
                    className="text-2xl font-semibold text-[#2B2420]"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    Order Price Breakup
                  </h3>
                  <p
                    className="text-xs text-[#8a7f6e]"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    {selectedBreakupItems[0]?.order_reference || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowBreakup(false)}
                  className="rounded-full p-2 text-[#8a7f6e] transition-colors hover:bg-[#FBF6EC] hover:text-[#2B2420]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-3">
                  {selectedBreakupItems.map((item: any) => (
                    <div
                      key={item.line_id}
                      className="flex items-center justify-between rounded-[14px] border border-[#E7DBC0]/50 bg-[#FBF8F2] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] border border-[#E7DBC0]/50 bg-white">
                          {item.primary_image ? (
                            <Image src={item.primary_image} alt={item.product_name || "Product"} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-5 w-5 text-[#C2BCB0]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p
                            className="font-medium text-[#2B2420]"
                            style={{ fontFamily: "Jost, sans-serif", fontSize: "14px" }}
                          >
                            {item.product_name}
                          </p>
                          <p
                            className="text-xs text-[#8a7f6e]"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            Qty: {item.quantity} • GST: {item.gst_rate}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold text-[#2B2420]"
                          style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "18px" }}
                        >
                          {formatPrice(item.line_total || 0)}
                        </p>
                        <p
                          className="text-xs text-[#8a7f6e]"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          {formatPrice(item.unit_price || 0)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedBreakupItems.length > 0 && (
                  <div className="mt-5 border-t border-[#EFE6D3] pt-4">
                    <div className="flex justify-between py-1.5 text-sm">
                      <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>Subtotal</span>
                      <span className="font-medium text-[#2B2420]">{formatPrice(selectedBreakupItems[0]?.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-sm">
                      <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>GST</span>
                      <span className="font-medium text-[#2B2420]">{formatPrice(selectedBreakupItems[0]?.total_gst || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-sm">
                      <span className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>Shipping</span>
                      <span className="font-medium text-[#2B2420]">{formatPrice(selectedBreakupItems[0]?.shipping_charge || 0)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-[#EFE6D3] pt-3">
                      <span
                        className="font-semibold text-[#2B2420]"
                        style={{ fontFamily: "Jost, sans-serif" }}
                      >
                        Total Payable
                      </span>
                      <span
                        className="text-xl font-bold text-[#24887C]"
                        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                      >
                        {formatPrice(selectedBreakupItems[0]?.total_payable || selectedBreakupItems[0]?.amount_paid || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Modal */}
      <AnimatePresence>
        {showTrackModal && (
          <TrackModal
            isOpen={showTrackModal}
            onClose={() => {
              setShowTrackModal(false);
              setSelectedOrderForTracking(null);
            }}
            timelineSteps={getTimelineSteps(selectedOrderForTracking?.timeline)}
            order={selectedOrderForTracking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}