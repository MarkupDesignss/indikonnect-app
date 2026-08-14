"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Search,
  Download,
  Printer,
  ChevronDown,
  Calendar,
  Filter,
  Star,
  X,
  Upload,
  Camera,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";

import Header from "../../components/common/Header";
import Footer from "@/components/Footer/Footer";
import BannerImage from "../../../public/indiekonnect-web/images/banner.png";
import { useSearchParams } from "next/navigation";
import { useGetMyOrdersQuery, useGetOrderStatusesQuery } from "@/lib/redux/api/order/orderApi";
import ReviewModal from "./ReviewModal";

// Status icons mapping
const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  dispatched: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: Package,
};

// Status color mapping
const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-purple-600 bg-purple-50",
  dispatched: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
  returned: "text-gray-600 bg-gray-50",
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

  // Fetch orders and statuses from API
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useGetMyOrdersQuery({});
  const { data: statusesData, isLoading: statusesLoading } = useGetOrderStatusesQuery({});

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

  // Handle review submission
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      // Here you would call your API endpoint
      // const response = await submitReview(reviewData);
      console.log("Review submitted:", reviewData);
      
      // You can show a success toast/notification here
      // For now, we'll just close the modal
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  // Open review modal for delivered order
  const openReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
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
        <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={8} />
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FDCB00]"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={8} />

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

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden"
      >
        <Image
          src={BannerImage}
          alt="Orders Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="px-6 md:px-12 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Package className="w-8 h-8 text-[#FDCB00]" />
                  <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                    Orders
                  </span>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  My Orders
                </motion.h1>
                <motion.p
                  className="text-white/80 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  View and manage your recent purchases
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#FDCB00] transition-colors group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </motion.button>

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

                return (
                  <motion.div
                    key={order.order_id}
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
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
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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
                              <div>
                                <p className="text-xs text-gray-500">Shipping Address</p>
                                <p className="text-sm text-gray-700">
                                  {order.delivery_address?.full_address || "N/A"}
                                </p>
                              </div>
                              <div>
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
                                </div>
                              </div>
                            )}

                            {/* Invoice */}
                            {order.invoice && (
                              <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">Invoice</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {order.invoice.invoice_number || "N/A"}
                                  </p>
                                  {order.invoice.invoice_url && (
                                    <a
                                      href={order.invoice.invoice_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#FDCB00] hover:text-[#E5B800] text-sm font-medium flex items-center gap-1"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
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

                              {order.invoice?.invoice_url && (
                                <a
                                  href={order.invoice.invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Invoice
                                </a>
                              )}
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
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

      <Footer />
    </div>
  );
}