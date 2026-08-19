"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Package,
  Truck,
  CreditCard,
  Home,
  ShoppingBag,
  Coins,
  Sparkles,
  Gift,
  MapPin,
  Clock,
  Shield,
  Award,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import { useGetConfirmedOrderQuery } from "@/lib/redux/api/checkoutApi";

// Dynamically import Lottie with proper typing
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#2F6844] border-b-transparent rounded-full animate-spin animate-reverse" />
          </div>
        </div>
      </div>
    ),
  },
);

function Row({
  label,
  value,
  align = "right",
}: {
  label: string;
  value: React.ReactNode;
  align?: "right" | "top";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${
        align === "top" ? "items-start" : "items-center"
      } justify-between gap-6 py-2.5 hover:bg-[#FBF6EC]/50 rounded-lg px-2 transition-colors`}
    >
      <span className="text-[11px] uppercase tracking-[0.12em] text-[#9C8F7A] shrink-0 flex items-center gap-2">
        {label}
      </span>

      <span className="text-[13.5px] text-[#241F1A] text-right leading-relaxed font-medium">
        {value}
      </span>
    </motion.div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#B8860B]/10 to-[#B8860B]/5">
        <Icon className="w-4 h-4 text-[#B8860B]" strokeWidth={1.75} />
      </div>

      <h2
        className="text-[14px] font-semibold text-[#241F1A] tracking-wide"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  const orderReference = searchParams.get("order_reference");

  const {
    data: orderResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetConfirmedOrderQuery(orderReference as string, {
    skip: !orderReference,
  });

  const order = orderResponse?.data;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatPrice = (value: number | string | null | undefined) => {
    const amount = Number(value ?? 0);
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status?: string | null) => {
    if (!status) return "Unknown";
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (!orderReference) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
          >
            <Package className="w-16 h-16 text-[#D9CFBA] mx-auto mb-4" />
            <h2 className="text-2xl text-[#241F1A] mb-2 font-serif">
              Order reference missing
            </h2>
            <p className="text-[#8A7F6E] text-sm mb-6">
              We could not find an order reference in the URL.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#241F1A] text-white text-sm rounded-full hover:bg-[#3a332a] transition-all hover:scale-105"
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading || isFetching) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-[#B8860B] border-t-transparent rounded-full mx-auto"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-12 h-12 border-3 border-[#2F6844] border-b-transparent rounded-full mx-auto"
              />
            </div>
            <p className="mt-6 text-[#8A7F6E] text-sm font-medium">
              Fetching your order…
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
          >
            <Package className="w-16 h-16 text-[#D9CFBA] mx-auto mb-4" />
            <h2 className="text-2xl text-[#241F1A] mb-2 font-serif">
              We can't find that order
            </h2>
            <p className="text-[#8A7F6E] text-sm mb-6">
              We couldn't load the order details. Please check your order
              reference and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#241F1A] text-white text-sm rounded-full hover:bg-[#3a332a] transition-all hover:scale-105"
              >
                <Home className="w-4 h-4" />
                Return home
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#241F1A]/20 text-[#241F1A] text-sm rounded-full hover:border-[#241F1A] transition-all hover:scale-105"
              >
                <Package className="w-4 h-4" />
                My orders
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  const deliveryAddress = order.delivery_address;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] via-[#F8F2E8] to-[#F5EFE3] py-8 md:py-12 relative overflow-hidden">
        {/* Premium Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 w-96 h-96 bg-[#B8860B]/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-[#2F6844]/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E4D6B0]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 max-w-[880px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(43,36,26,0.3)] rounded-4xl px-6 md:px-12 pb-8 border border-white/60 relative overflow-hidden">
              {/* Premium Header with Lottie */}
              <div className="relative -mx-6 md:-mx-12 px-6 md:px-12 pt-8 pb-6 bg-gradient-to-br from-[#EAF5EC] via-[#F4FAF1] to-transparent rounded-t-4xl overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2F6844]/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#B8860B]/5 to-transparent rounded-full blur-2xl" />

                {/* Animated particles */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 left-10 text-[#B8860B]/20 text-4xl"
                >
                  ✦
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-10 right-10 text-[#2F6844]/20 text-3xl"
                >
                  ✧
                </motion.div>

                <div className="flex flex-col items-center text-center relative">
                  {/* Lottie Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="w-32 h-32 md:w-40 md:h-40 -mt-4 relative"
                  >
                    {isMounted && (
                      <Lottie
                        animationData={require("@/public/success-animation.json")}
                        loop={false}
                        autoplay={true}
                        style={{ width: "100%", height: "100%" }}
                        className="drop-shadow-2xl"
                      />
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2"
                  >
                    <motion.span
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#DCEEE0] to-[#EAF5EC] text-[#2F6844] text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
                      {getStatusLabel(order.payment_status)}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
                    </motion.span>

                    <h1
                      className="text-[28px] md:text-[36px] text-[#1F4A31] leading-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      Order Confirmed!
                      <motion.span
                        animate={{
                          rotate: [0, 15, -15, 0],
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="inline-block ml-3"
                      >
                        🎉
                      </motion.span>
                    </h1>

                    <p
                      className="text-[14px] text-[#5E7A65] mt-1 max-w-[40ch] mx-auto"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Thank you for your order — we're preparing it with care.
                    </p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-white/80"
                    >
                      <span className="text-[11px] text-[#8A7F6E] font-medium uppercase tracking-wider">
                        Order ID
                      </span>
                      <span className="text-[13px] tracking-wide text-[#241F1A] font-mono">
                        {order.order_reference}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-[#B8860B] hover:text-[#8A6F0B] transition-colors"
                        onClick={() =>
                          navigator.clipboard.writeText(order.order_reference)
                        }
                      >
                        <span className="text-xs">📋</span>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-12 h-0.5 bg-gradient-to-r from-transparent via-[#E4D6B0] to-transparent" />
              </div>

              {/* Status + Shipping Grid with unique styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-5 border border-[#E4D6B0]/30 shadow-sm"
                >
                  <SectionLabel icon={Package}>Order Status</SectionLabel>
                  <div className="space-y-1">
                    <Row
                      label="Order"
                      value={
                        <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
                          {getStatusLabel(order.order_status)}
                        </span>
                      }
                    />
                    <Row
                      label="Payment"
                      value={
                        <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />
                          {getStatusLabel(order.payment_status)}
                        </span>
                      }
                    />
                    <Row
                      label="Placed"
                      value={
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#9C8F7A]" />
                          {formatDate(order.order_date)} ·{" "}
                          {formatTime(order.order_date)}
                        </div>
                      }
                    />
                    <Row
                      label="Confirmed"
                      value={
                        order.confirmed_date ? (
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#2F6844]" />
                            {formatDate(order.confirmed_date)} ·{" "}
                            {formatTime(order.confirmed_date)}
                          </div>
                        ) : (
                          "—"
                        )
                      }
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-5 border border-[#E4D6B0]/30 shadow-sm"
                >
                  <SectionLabel icon={Truck}>Shipping Details</SectionLabel>
                  <div className="space-y-1">
                    <Row
                      label="Method"
                      value={
                        order.shipping_charge > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3 h-3 text-[#B8860B]" />
                            Standard Shipping
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#2F6844] font-medium">
                            <Gift className="w-3 h-3" />
                            Free Shipping
                          </span>
                        )
                      }
                    />
                    <Row
                      label="Cost"
                      value={
                        order.shipping_charge > 0 ? (
                          formatPrice(order.shipping_charge)
                        ) : (
                          <span className="text-[#2F6844] font-medium">
                            FREE
                          </span>
                        )
                      }
                    />
                    <Row
                      align="top"
                      label="Address"
                      value={
                        <div className="text-left space-y-0.5">
                          <div className="font-semibold text-[#241F1A]">
                            {deliveryAddress.full_name || "Customer"}
                          </div>
                          <div className="text-[#5E7A65] text-xs">
                            {deliveryAddress.address_line_1}
                            {deliveryAddress.address_line_2 &&
                              `, ${deliveryAddress.address_line_2}`}
                            <br />
                            {deliveryAddress.city}, {deliveryAddress.state}
                            {deliveryAddress.postal_code &&
                              ` ${deliveryAddress.postal_code}`}
                            <br />
                            {deliveryAddress.country}
                            {deliveryAddress.phone && (
                              <span className="block text-[#9C8F7A] text-xs mt-0.5">
                                📞 {deliveryAddress.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </div>
                </motion.div>
              </div>

              <div className="relative my-2">
                <div className="absolute left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#E4D6B0] to-transparent" />
              </div>

              {/* Payment Summary with unique styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-2"
              >
                <SectionLabel icon={CreditCard}>Payment Summary</SectionLabel>

                <div className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-5 border border-[#E4D6B0]/30 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                        <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                          Subtotal
                        </span>
                        <span className="text-[#241F1A] font-mono font-medium">
                          {formatPrice(order.subtotal)}
                        </span>
                      </div>
                      {!!order.coin_redeemed && order.coin_redeemed > 0 && (
                        <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                          <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                            <Coins className="w-3 h-3 text-[#B8860B]" />
                            {order.coin_redeemed} coins redeemed
                          </span>
                          <span className="text-[#2F6844] font-mono font-medium">
                            −{formatPrice(order.coin_redeemed_amount)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                        <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                          GST / Tax
                        </span>
                        <span className="text-[#241F1A] font-mono font-medium">
                          {formatPrice(order.total_gst)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                        <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                          Shipping
                        </span>
                        <span className="text-[#2F6844] font-mono font-medium">
                          {order.shipping_charge > 0
                            ? formatPrice(order.shipping_charge)
                            : "FREE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-[#241F1A]/10">
                    <div className="flex items-end justify-between">
                      <div>
                        <span
                          className="text-[13px] text-[#241F1A] font-medium"
                          style={{ fontFamily: "'Fraunces', serif" }}
                        >
                          Total Paid
                        </span>
                        <div className="text-xs text-[#8A7F6E] mt-0.5">
                          Including all taxes
                        </div>
                      </div>
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="text-[28px] text-[#1F4A31] leading-none font-bold bg-gradient-to-r from-[#1F4A31] to-[#2F6844] bg-clip-text text-transparent"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {formatPrice(order.total_payable)}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Transaction with unique styling */}
              {order.gateway_transaction_id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 pt-4 border-t border-dashed border-[#E4D6B0]"
                >
                  <SectionLabel icon={Shield}>Payment Details</SectionLabel>
                  <div className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-4 border border-[#E4D6B0]/30 shadow-sm">
                    <Row
                      label="Transaction ID"
                      value={
                        <span className="text-[12px] bg-white px-3 py-1 rounded-lg border border-[#E4D6B0]/30 font-mono text-[#241F1A]">
                          {order.gateway_transaction_id}
                        </span>
                      }
                    />
                    <Row
                      label="Gateway"
                      value={
                        <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-medium">
                          <Award className="w-3 h-3" />
                          {order.payment_gateway
                            ? getStatusLabel(order.payment_gateway)
                            : "—"}
                        </span>
                      }
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Actions with unique styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8"
          >
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-[#241F1A] text-white text-sm rounded-full transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#3a332a] to-[#241F1A] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm"
                >
                  →
                </motion.span>
              </span>
            </Link>

            <Link
              href="/profile/?tab=orders"
              className="w-full sm:w-auto flex-1 group flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#241F1A]/20 text-[#241F1A] text-sm rounded-full hover:border-[#241F1A] transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white/50 backdrop-blur-sm"
            >
              <Package className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              View All Orders
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
              <span
                className="text-[11px] text-[#8A7F6E] font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                A confirmation email has been sent to your registered email
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}
