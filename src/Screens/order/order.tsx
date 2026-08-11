"use client";

import { useState } from "react";
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
  Filter,
  Search,
  Download,
  Printer,
  ChevronDown,
  Calendar,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";

// Components
import Header from "../../components/common/Header";
import Footer from "@/components/Footer/Footer";
import BannerImage from "../../../public/indiekonnect-web/images/banner.png";

// Import product images
import Dinner from "../../../public/indiekonnect-web/images/Dinner.jpeg";

// Mock order data with correct image imports
const ordersData = [
  {
    id: "#ORD-2024-901",
    date: "Aug 08, 2026",
    status: "Shipped",
    statusColor: "text-blue-600 bg-blue-50",
    total: 192465,
    items: [
      {
        name: "Kintsugi Royal Opulence",
        variant: "Gold Plated",
        price: 192465,
        quantity: 1,
        image: Dinner,
      },
    ],
    tracking: "Tracking #: TRK-9087-2345",
    estimatedDelivery: "Aug 15, 2026",
    shippingAddress: "123 Luxury Lane, Beverly Hills, CA 90210",
    paymentMethod: "Credit Card •••• 4582",
  },
  {
    id: "#ORD-2024-902",
    date: "Jul 25, 2026",
    status: "Delivered",
    statusColor: "text-green-600 bg-green-50",
    total: 89450,
    items: [
      {
        name: "Fabius Resolute Black",
        variant: "Rose Gold",
        price: 89450,
        quantity: 1,
        image: Dinner,
      },
    ],
    tracking: "Tracking #: TRK-9087-2346",
    estimatedDelivery: "Jul 28, 2026",
    shippingAddress: "123 Luxury Lane, Beverly Hills, CA 90210",
    paymentMethod: "Credit Card •••• 4582",
  },
  {
    id: "#ORD-2024-903",
    date: "Jun 15, 2026",
    status: "Processing",
    statusColor: "text-yellow-600 bg-yellow-50",
    total: 456780,
    items: [
      {
        name: "Luxury Gold-Trim Dinnerware",
        variant: "24K Gold",
        price: 456780,
        quantity: 1,
        image: Dinner,
      },
      {
        name: "Premium Porcelain Set",
        variant: "Classic White",
        price: 28990,
        quantity: 2,
        image: Dinner,
      },
    ],
    tracking: "Tracking #: TRK-9087-2347",
    estimatedDelivery: "Jun 22, 2026",
    shippingAddress: "123 Luxury Lane, Beverly Hills, CA 90210",
    paymentMethod: "Credit Card •••• 4582",
  },
];

// Status icons mapping
const statusIcons = {
  Shipped: Truck,
  Delivered: CheckCircle,
  Processing: Clock,
  Cancelled: XCircle,
};

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = ordersData.filter((order) => {
    const matchesFilter =
      filter === "all" || order.status.toLowerCase() === filter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesFilter && matchesSearch;
  });

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
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

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={8} />

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
                  className="text-white/80 text-sm md:text-black"
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
              {["all", "processing", "shipped", "delivered"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === status
                    ? "bg-[#FDCB00] text-[#1a1a2e]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all"
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
              {filteredOrders.map((order) => {
                const StatusIcon =
                  statusIcons[order.status as keyof typeof statusIcons] ||
                  Package;
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 md:p-5 cursor-pointer"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image
                              src={order.items[0].image}
                              alt={order.items[0].name}
                              fill
                              className="object-cover"
                            />
                            {order.items.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-[#1a1a2e] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                +{order.items.length - 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {order.id}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${order.statusColor}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{order.total.toLocaleString()}
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
                                Order Items
                              </h5>
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                                >
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item.variant}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                      ₹{item.price.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Tracking
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {order.tracking}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Estimated Delivery
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {order.estimatedDelivery}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Shipping Address
                                </p>
                                <p className="text-sm text-gray-700">
                                  {order.shippingAddress}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Payment Method
                                </p>
                                <p className="text-sm text-gray-700">
                                  {order.paymentMethod}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                              <button className="px-4 py-2 bg-[#FDCB00] text-[#1a1a2e] rounded-lg text-sm font-semibold hover:bg-[#E5B800] transition-colors flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Invoice
                              </button>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download
                              </button>
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
