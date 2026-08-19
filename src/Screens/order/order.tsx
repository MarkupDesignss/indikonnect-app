"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import { 
  useGetMyOrdersQuery, 
  useGetOrderStatusesQuery, 
  useCancelOrderMutation, 
  useInitiateReturnMutation,
  useLazyGetInvoiceByOrderIdQuery,
} from "@/lib/redux/api/order/orderApi";
import ReviewModal from "./ReviewModal";
import OrderCancelModal, { CancelOrderData } from "./OrderCancelModal";
import { generateInvoicePDF } from "./invoiceGenerator";

// Status icons mapping
const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  dispatched: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: RotateCcw,
};

// Status color mapping
const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-purple-600 bg-purple-50",
  dispatched: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
  returned: "text-orange-600 bg-orange-50",
};

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// Format price helper
const formatPrice = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const searchParams = useSearchParams();
  const orderReferenceFromUrl = searchParams.get("order") || "";
  const [searchTerm, setSearchTerm] = useState(orderReferenceFromUrl);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // State for cancel/return modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [modalType, setModalType] = useState<"cancel" | "return">("cancel");

  // State for invoice loading per order
  const [invoiceLoadingOrders, setInvoiceLoadingOrders] = useState<Record<string, boolean>>({});

  // Fetch orders and statuses from API
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError, refetch } = useGetMyOrdersQuery({});
  console.log(ordersData)
  const { data: statusesData, isLoading: statusesLoading } = useGetOrderStatusesQuery({});
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [initiateReturn, { isLoading: isReturning }] = useInitiateReturnMutation();
  
  // Lazy query for invoice
  const [getInvoice] = useLazyGetInvoiceByOrderIdQuery();

  // Get statuses list
  const statusList = statusesData?.data || [];

  // Get orders list
  const orders = ordersData?.data || [];

  // Filter orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesFilter = filter === "all" || order.order_status?.toLowerCase() === filter;
    const matchesSearch =
      order.order_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item: any) =>
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    return statusIcons[status?.toLowerCase()] || Package;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return statusColors[status?.toLowerCase()] || "text-gray-600 bg-gray-50";
  };

  // Get status display name
  const getStatusDisplayName = (status: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if order can be cancelled
  const canCancelOrder = (order: any) => {
    const status = order.order_status?.toLowerCase();
    return status === "pending" || status === "confirmed" || status === "processing";
  };

  // Check if order can be returned
  const canReturnOrder = (order: any) => {
    const status = order.order_status?.toLowerCase();
    return status === "delivered" && !order.is_returned && !order.is_reviewed;
  };

  // Handle cancel order from modal
  const handleCancelOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);
    try {
      const response = await cancelOrder({
        orderReference: selectedOrderForAction?.order_reference,
        reason: data.reason
      }).unwrap();

      console.log("Order cancelled successfully:", response);

      setToastMessage("Order cancelled successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowCancelModal(false);
      setSelectedOrderForAction(null);
      
      // Refetch orders to update status
      refetch();

    } catch (error: any) {
      console.error("Error cancelling order:", error);
      setToastMessage(
        error?.data?.message || "Failed to cancel order. Please try again."
      );
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle return order from modal - Updated with API integration
  const handleReturnOrder = async (data: CancelOrderData) => {
    setIsProcessing(true);
    try {
      // Map the order items for return
      const returnItems = selectedOrderForAction?.items?.map((item: any) => ({
        order_line_id: item.order_line_id || item.id,
        quantity: item.quantity || 1,
        reason: data.reason,
        images: data.images || []
      })) || [];

      // Call the initiate return API
      const response = await initiateReturn({
        order_reference: selectedOrderForAction?.order_reference,
        items: returnItems
      }).unwrap();

      console.log("Return submitted successfully:", response);

      setToastMessage("Return request submitted successfully! We will process it within 24-48 hours.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowCancelModal(false);
      setSelectedOrderForAction(null);

      // Refetch orders to update status
      refetch();

      return response;
    } catch (error: any) {
      console.error("Error returning order:", error);
      
      // Handle specific error messages
      let errorMessage = "Failed to submit return request. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.data.errors).flat();
        errorMessage = errorMessages.join(" ");
      }
      
      setToastMessage(errorMessage);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      console.log("Review submitted:", reviewData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const handleInvoiceDownload = async (orderId: number | string) => {
    setInvoiceLoadingOrders(prev => ({
      ...prev,
      [orderId]: true
    }));

    try {
      const result = await getInvoice(orderId).unwrap();
      
      if (result?.data) {
        generateInvoicePDF(result.data);
        setToastMessage("Invoice generated successfully!");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setToastMessage("Invoice not available for this order");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      setToastMessage(error?.data?.message || "Failed to fetch invoice. Please try again.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } finally {
      setInvoiceLoadingOrders(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };

  // Open review modal for delivered order
  const openReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
  };

  // Open cancel modal
  const openCancelModal = (order: any) => {
    setSelectedOrderForAction(order);
    setModalType("cancel");
    setShowCancelModal(true);
  };

  // Open return modal
  const openReturnModal = (order: any) => {
    setSelectedOrderForAction(order);
    setModalType("return");
    setShowCancelModal(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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

  // Loading state
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FDCB00]"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-md flex items-start gap-3"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel/Return Modal - Using the same component */}
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedOrderForReview(null);
        }}
        order={selectedOrderForReview}
        onSubmit={handleReviewSubmit}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Breadcrumb */}
          <motion.nav
            variants={itemVariants}
            className="flex items-center gap-1.5 text-xs text-gray-500"
          >
            <Link href="/" className="hover:text-[#FDCB00] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-800 font-medium">My Orders</span>
          </motion.nav>

          {/* Filters and Search */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filter:</span>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>{filter === "all" ? "All Statuses" : getStatusDisplayName(filter)}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${filter === "all" ? "bg-[#FDCB00]/10 text-[#1a1a2e] font-medium" : "text-gray-700"}`}
                    >
                      All Statuses
                    </button>
                    {statusList.map((status: string) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilter(status);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${filter === status ? "bg-[#FDCB00]/10 text-[#1a1a2e] font-medium" : "text-gray-700"}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusColors[status]?.split(" ")[0]?.replace("text-", "bg-") || "bg-gray-400"}`}></span>
                        {getStatusDisplayName(status)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border text-black border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all"
              />
            </div>
          </motion.div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search or filter."
                  : "You haven't placed any orders yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {filteredOrders.map((order: any) => {
                const StatusIcon = getStatusIcon(order.order_status);
                const statusColor = getStatusColor(order.order_status);
                const isExpanded = expandedOrder === order.order_id?.toString();
                const orderItems = order.items || [];
                const firstItem = orderItems[0] || {};
                const itemCount = orderItems.length;
                const isDelivered = order.order_status?.toLowerCase() === "delivered";
                const isReviewed = order.is_reviewed || false;
                const isCancelled = order.order_status?.toLowerCase() === "cancelled";
                const isReturned = order.order_status?.toLowerCase() === "returned";
                const isInvoiceLoading = invoiceLoadingOrders[order.order_id] || false;

                return (
                  <motion.div
                    key={order.order_id}
                    variants={itemVariants}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isCancelled ? "border-red-200" : isReturned ? "border-orange-200" : "border-gray-100"
                      }`}
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 md:p-5 cursor-pointer"
                      onClick={() => toggleOrder(order.order_id?.toString())}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {firstItem.primary_image ? (
                              <Image
                                src={firstItem.primary_image}
                                alt={firstItem.product_name || "Product"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {order.order_reference || `Order #${order.order_id}`}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.order_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusColor}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {getStatusDisplayName(order.order_status)}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{formatPrice(order.total_payable || 0)}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Details - Expandable */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-4 md:p-5 space-y-4">
                            {/* Order Items */}
                            <div className="space-y-3">
                              <h5 className="font-semibold text-gray-900 text-sm">
                                Order Items ({itemCount})
                              </h5>
                              {orderItems.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                                >
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    {item.primary_image ? (
                                      <Image
                                        src={item.primary_image}
                                        alt={item.product_name || "Product"}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Package className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.product_name || "Unknown Product"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Qty: {item.quantity || 1}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                      ₹{formatPrice(item.unit_price || 0)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500">Order Reference</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {order.order_reference || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Payment Status</p>
                                <p className="text-sm font-medium text-gray-900">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${order.payment_status === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : order.payment_status === "failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {order.payment_status || "N/A"}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Payment Method</p>
                                <p className="text-sm text-gray-700">
                                  {order.payment_gateway || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Transaction ID</p>
                                <p className="text-sm text-gray-700">
                                  {order.gateway_transaction_id || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-sm font-medium text-gray-900">
                                  ₹{formatPrice(order.total_payable || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total GST</p>
                                <p className="text-sm font-medium text-gray-900">
                                  ₹{formatPrice(order.total_gst || 0)}
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500">Shipping Address</p>
                                <p className="text-sm text-gray-700">
                                  {order.delivery_address?.full_address || "N/A"}
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500">Billing Address</p>
                                <p className="text-sm text-gray-700">
                                  {order.billing_address?.full_address || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Timeline */}
                            {order.timeline && (
                              <div className="pt-3 border-t border-gray-100">
                                <h5 className="font-semibold text-gray-900 text-sm mb-2">Order Timeline</h5>
                                <div className="space-y-2">
                                  {order.timeline.order_placed && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      <span className="text-gray-600">Order Placed:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.order_placed)}</span>
                                    </div>
                                  )}
                                  {order.timeline.order_confirmed && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      <span className="text-gray-600">Order Confirmed:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.order_confirmed)}</span>
                                    </div>
                                  )}
                                  {order.timeline.shipped_at && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                      <span className="text-gray-600">Shipped:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.shipped_at)}</span>
                                    </div>
                                  )}
                                  {order.timeline.delivered_at && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      <span className="text-gray-600">Delivered:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.delivered_at)}</span>
                                    </div>
                                  )}
                                  {order.timeline.cancelled_at && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                      <span className="text-gray-600">Cancelled:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.cancelled_at)}</span>
                                    </div>
                                  )}
                                  {order.timeline.returned_at && (
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                      <span className="text-gray-600">Returned:</span>
                                      <span className="text-gray-900">{formatDate(order.timeline.returned_at)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                              {/* Cancel Button - Show for pending/confirmed/processing orders */}
                              {canCancelOrder(order) && (
                                <button
                                  onClick={() => openCancelModal(order)}
                                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                                >
                                  <Ban className="w-4 h-4" />
                                  Cancel Order
                                </button>
                              )}

                              {/* Return Button - Show for delivered orders not returned/reviewed */}
                              {canReturnOrder(order) && (
                                <button
                                  onClick={() => openReturnModal(order)}
                                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Return Order
                                </button>
                              )}

                              {/* Review Button - Show for delivered orders */}
                              {isDelivered && (
                                isReviewed ? (
                                  <button
                                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 cursor-default"
                                    disabled
                                  >
                                    <Check className="w-4 h-4" />
                                    Review Submitted
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openReviewModal(order)}
                                    className="px-4 py-2 bg-[#FDCB00] text-[#1a1a2e] rounded-lg text-sm font-medium hover:bg-[#E5B800] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                                  >
                                    <Star className="w-4 h-4 fill-[#1a1a2e]" />
                                    Write a Review
                                  </button>
                                )
                              )}

                              {/* Cancelled/Returned status badges */}
                              {isCancelled && (
                                <span className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                  <XCircle className="w-4 h-4" />
                                  Order Cancelled
                                </span>
                              )}
                              {isReturned && (
                                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                  <RotateCcw className="w-4 h-4" />
                                  Order Returned
                                </span>
                              )}

                              {/* Invoice Download Button with Loading State */}
                              <button
                                onClick={() => handleInvoiceDownload(order.order_id)}
                                disabled={isInvoiceLoading}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isInvoiceLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-4 h-4" />
                                    Invoice
                                  </>
                                )}
                              </button>
                              
                              {/* Print Button */}
                              <button 
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                              >
                                <Printer className="w-4 h-4" />
                                Print
                              </button>
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
    </div>
  );
}