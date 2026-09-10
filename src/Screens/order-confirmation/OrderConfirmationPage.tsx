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
  Gift,
  Clock,
  Shield,
  Award,
  MapPin,
  Copy,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import {
  useGetConfirmedOrderQuery,
} from "@/lib/redux/api/checkoutApi";

// =========================================================
// SUCCESS ANIMATION
// =========================================================

function SuccessAnimation() {
  return (
    <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-2xl"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#2F6844"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="opacity-20"
        />

        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#2F6844"
          strokeWidth="6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <motion.path
          d="M30 50 L45 65 L70 35"
          fill="none"
          stroke="#2F6844"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: "easeInOut",
          }}
        />

        <motion.circle
          cx="25"
          cy="25"
          r="3"
          fill="#B8860B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
        />

        <motion.circle
          cx="75"
          cy="25"
          r="2.5"
          fill="#B8860B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 }}
        />

        <motion.circle
          cx="50"
          cy="15"
          r="2"
          fill="#B8860B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
        />

        <motion.circle
          cx="20"
          cy="60"
          r="2"
          fill="#B8860B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1 }}
        />

        <motion.circle
          cx="80"
          cy="60"
          r="2"
          fill="#B8860B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#2F6844]/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#B8860B]/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
    </div>
  );
}

// =========================================================
// ROW
// =========================================================

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

// =========================================================
// SECTION LABEL
// =========================================================

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
        <Icon
          className="w-4 h-4 text-[#B8860B]"
          strokeWidth={1.75}
        />
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

// =========================================================
// HELPERS
// =========================================================

const toNumber = (
  value: number | string | null | undefined
) => Number(value ?? 0);

const formatPrice = (
  value: number | string | null | undefined
) => {
  const amount = toNumber(value);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateString?: string | null) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

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

// =========================================================
// PAGE
// =========================================================

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // IMPORTANT:
  // API expects GROUP ID:
  // ?order_group_id=GRP-XXXXXXXX
  const orderGroupId =
    searchParams.get("order_group_id");

  const {
    data: orderResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetConfirmedOrderQuery(
    orderGroupId as string,
    {
      skip: !orderGroupId,
    }
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // =======================================================
  // RESPONSE DATA
  // =======================================================

  const confirmationData = orderResponse?.data;

  const orders = confirmationData?.orders ?? [];

  const aggregatedSummary =
    confirmationData?.aggregated_summary;

  // =======================================================
  // ALL ITEMS FROM MULTIPLE ORDERS
  // =======================================================

  const allItems = useMemo(() => {
    return orders.flatMap((currentOrder) =>
      currentOrder.items.map((item) => ({
        ...item,
        parentOrderReference:
          currentOrder.order_reference,
        parentOrderId: currentOrder.order_id,
      }))
    );
  }, [orders]);

  // =======================================================
  // ADDRESS
  // =======================================================

  const primaryOrder = orders[0];

  const deliveryAddress =
    primaryOrder?.delivery_address;

  // =======================================================
  // CUSTOMER NAME
  // =======================================================

  const customerName =
    deliveryAddress?.full_name ||
    deliveryAddress?.name ||
    primaryOrder?.user?.name ||
    "Customer";

  // =======================================================
  // COPY GROUP ID
  // =======================================================

  const handleCopyGroupId = async () => {
    if (!orderGroupId) return;

    try {
      await navigator.clipboard.writeText(
        orderGroupId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (!orderGroupId) {
    return (
      <>
        <Header />

        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="text-center max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
          >
            <Package className="w-16 h-16 text-[#D9CFBA] mx-auto mb-4" />

            <h2 className="text-2xl text-[#241F1A] mb-2 font-serif">
              Order reference missing
            </h2>

            <p className="text-[#8A7F6E] text-sm mb-6">
              We could not find an order group reference
              in the URL.
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

  // =======================================================
  // LOADING
  // =======================================================

  if (isLoading || isFetching) {
    return (
      <>
        <Header />

        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-12 h-12 border-3 border-[#B8860B] border-t-transparent rounded-full mx-auto"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
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

  // =======================================================
  // ERROR
  // =======================================================

  if (
    isError ||
    !confirmationData ||
    orders.length === 0
  ) {
    return (
      <>
        <Header />

        <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] to-[#F5EFE3] flex items-center justify-center">
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="text-center max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
          >
            <Package className="w-16 h-16 text-[#D9CFBA] mx-auto mb-4" />

            <h2 className="text-2xl text-[#241F1A] mb-2 font-serif">
              We can't find that order
            </h2>

            <p className="text-[#8A7F6E] text-sm mb-6">
              We couldn't load the order details.
              Please check your order group reference
              and try again.
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
                href="/profile/?tab=orders"
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

  // =======================================================
  // SAFE AGGREGATED VALUES
  // =======================================================

  const totalOrders =
    aggregatedSummary?.total_orders ??
    orders.length;

  const totalItems =
    aggregatedSummary?.total_items ??
    allItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  const totalSubtotal =
    aggregatedSummary?.subtotal ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.subtotal),
      0
    );

  const totalGST =
    aggregatedSummary?.total_gst ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.total_gst),
      0
    );

  const totalShipping =
    aggregatedSummary?.shipping_charge ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.shipping_charge),
      0
    );

  const totalCoinsRedeemed =
    aggregatedSummary?.coin_redeemed ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.coin_redeemed),
      0
    );

  const totalCoinAmount =
    aggregatedSummary?.coin_redeemed_amount ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.coin_redeemed_amount),
      0
    );

  const totalPayable =
    aggregatedSummary?.total_payable ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.total_payable),
      0
    );

  const totalAmountPaid =
    aggregatedSummary?.amount_paid ??
    orders.reduce(
      (sum, item) =>
        sum + toNumber(item.amount_paid),
      0
    );

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-[#FBF6EC] via-[#F8F2E8] to-[#F5EFE3] py-8 md:py-12 relative overflow-hidden">

        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 right-20 w-96 h-96 bg-[#B8860B]/5 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-[#2F6844]/5 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E4D6B0]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 max-w-[880px] relative z-10">

          {/* MAIN CARD */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(43,36,26,0.3)] rounded-4xl px-6 md:px-12 pb-8 border border-white/60 relative overflow-hidden">

              {/* ================================================= */}
              {/* HEADER */}
              {/* ================================================= */}

              <div className="relative -mx-6 md:-mx-12 px-6 md:px-12 pt-8 pb-6 bg-gradient-to-br from-[#EAF5EC] via-[#F4FAF1] to-transparent rounded-t-4xl overflow-hidden">

                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2F6844]/5 to-transparent rounded-full blur-2xl" />

                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#B8860B]/5 to-transparent rounded-full blur-2xl" />

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute top-10 left-10 text-[#B8860B]/20 text-4xl"
                >
                  ✦
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className="absolute bottom-10 right-10 text-[#2F6844]/20 text-3xl"
                >
                  ✧
                </motion.div>

                <div className="flex flex-col items-center text-center relative">

                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -10,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="-mt-4 relative"
                  >
                    {isMounted && (
                      <SuccessAnimation />
                    )}
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3,
                    }}
                    className="mt-2"
                  >
                    <motion.span
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#DCEEE0] to-[#EAF5EC] text-[#2F6844] text-[11px] font-semibold uppercase tracking-[0.12em] mb-3 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />

                      {getStatusLabel(
                        primaryOrder?.status ||
                          primaryOrder?.order_status ||
                          "confirmed"
                      )}

                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />
                    </motion.span>

                    <h1
                      className="text-[28px] md:text-[36px] text-[#1F4A31] leading-tight"
                      style={{
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      Order Confirmed!

                      <motion.span
                        animate={{
                          rotate: [0, 15, -15, 0],
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.5,
                        }}
                        className="inline-block ml-3"
                      >
                        🎉
                      </motion.span>
                    </h1>

                    <p
                      className="text-[14px] text-[#5E7A65] mt-1 max-w-[40ch] mx-auto"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Thank you for your order — we're
                      preparing it with care.
                    </p>

                  

                    {/* MULTIPLE ORDERS INFO */}
                    {totalOrders > 1 && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8860B]/10 text-[#8A6C1F] text-xs font-medium">
                        <Layers3 className="w-3.5 h-3.5" />
                        {totalOrders} orders created
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-12 h-0.5 bg-gradient-to-r from-transparent via-[#E4D6B0] to-transparent" />
              </div>

              {/* ================================================= */}
              {/* ORDERS */}
              {/* ================================================= */}

              <div className="py-6">

                <SectionLabel icon={Package}>
                  {totalOrders > 1
                    ? "Order Details"
                    : "Order Details"}
                </SectionLabel>

                <div className="space-y-4">

                  {orders.map(
                    (currentOrder, orderIndex) => (
                      <motion.div
                        key={currentOrder.order_id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            0.15 +
                            orderIndex * 0.08,
                        }}
                        className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl border border-[#E4D6B0]/30 shadow-sm overflow-hidden"
                      >

                        {/* ORDER HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-white/70 border-b border-[#E4D6B0]/20">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[#9C8F7A]">
                              Order {orderIndex + 1}
                            </p>

                            <p className="text-[14px] font-mono font-semibold text-[#241F1A] mt-1">
                              {
                                currentOrder.order_reference
                              }
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#DCEEE0] text-[#2F6844] text-[11px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />
                            {getStatusLabel(
                              currentOrder.status ||
                                currentOrder.order_status
                            )}
                          </span>
                        </div>

                        {/* ORDER META */}
                        <div className="p-4">
                        

                          <Row
                            label="Payment"
                            value={
                              <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />

                                {getStatusLabel(
                                  currentOrder.payment_status ||
                                    "Paid"
                                )}
                              </span>
                            }
                          />

                        
                          <Row
                            label="Placed"
                            value={
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-[#9C8F7A]" />

                                {formatDate(
                                  currentOrder.order_date ||
                                    currentOrder.created_at
                                )}

                                {currentOrder.order_date ||
                                currentOrder.created_at
                                  ? ` · ${formatTime(
                                      currentOrder.order_date ||
                                        currentOrder.created_at
                                    )}`
                                  : ""}
                              </div>
                            }
                          />

                          <Row
                            label="Confirmed"
                            value={
                              currentOrder.confirmed_date ||
                              currentOrder.confirmed_at ? (
                                <div className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-[#2F6844]" />

                                  {formatDate(
                                    currentOrder.confirmed_date ||
                                      currentOrder.confirmed_at
                                  )}

                                  {" · "}

                                  {formatTime(
                                    currentOrder.confirmed_date ||
                                      currentOrder.confirmed_at
                                  )}
                                </div>
                              ) : (
                                "—"
                              )
                            }
                          />
                        </div>

                        {/* ORDER ITEMS */}
                        <div className="px-5 pb-5">

                          <div className="mt-2 mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-[#B8860B]" />

                            <span className="text-[11px] uppercase tracking-[0.12em] text-[#8A7F6E] font-semibold">
                              {currentOrder.items.length}{" "}
                              {currentOrder.items.length ===
                              1
                                ? "Item"
                                : "Items"}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {currentOrder.items.map(
                              (item) => {
                                const image =
                                  item.product_image ||
                                  item.primary_image ||
                                  item.images?.find(
                                    (img) =>
                                      img.is_primary
                                  )?.image_url ||
                                  item.images?.[0]
                                    ?.image_url;

                                return (
                                  <div
                                    key={item.id}
                                    className="flex gap-3 p-3 rounded-xl bg-white border border-[#E4D6B0]/30"
                                  >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F5EFE3] shrink-0">
                                      {image ? (
                                        <img
                                          src={image}
                                          alt={
                                            item.product_name
                                          }
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-6 h-6 text-[#C9BFAE]" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div>
                                          <h3 className="text-[13px] font-semibold text-[#241F1A]">
                                            {
                                              item.product_name
                                            }
                                          </h3>

                                        

                                          {item.variant_attributes &&
                                            Object.keys(
                                              item.variant_attributes
                                            ).length >
                                              0 && (
                                              <div className="flex flex-wrap gap-1.5 mt-2">
                                                {Object.entries(
                                                  item.variant_attributes
                                                ).map(
                                                  ([
                                                    key,
                                                    value,
                                                  ]) => (
                                                    <span
                                                      key={
                                                        key
                                                      }
                                                      className="px-2 py-1 rounded-md bg-[#FBF6EC] text-[#6E6355] text-[10px]"
                                                    >
                                                      {getStatusLabel(
                                                        key
                                                      )}{" "}
                                                      :{" "}
                                                      {String(
                                                        value
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>

                                        <div className="text-left sm:text-right shrink-0">
                                          <div className="text-[14px] font-semibold text-[#1F4A31]">
                                            {formatPrice(
                                              item.line_total
                                            )}
                                          </div>

                                          <div className="text-[10px] text-[#9C8F7A] mt-0.5">
                                            Qty:{" "}
                                            {
                                              item.quantity
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>

              <div className="relative my-2">
                <div className="absolute left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#E4D6B0] to-transparent" />
              </div>

              {/* ================================================= */}
              {/* SHIPPING + PAYMENT SUMMARY (SIDE BY SIDE) */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">

                {/* SHIPPING DETAILS */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                  className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-5 border border-[#E4D6B0]/30 shadow-sm flex flex-col"
                >
                  <SectionLabel icon={Truck}>
                    Shipping Details
                  </SectionLabel>

                  <div className="space-y-1 flex-1">
                    <Row
                      label="Method"
                      value={
                        totalShipping > 0 ? (
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
                        totalShipping > 0 ? (
                          formatPrice(totalShipping)
                        ) : (
                          <span className="text-[#2F6844] font-medium">
                            FREE
                          </span>
                        )
                      }
                    />

                    <Row
                      label="Total Items"
                      value={totalItems}
                    />

                    <Row
                      align="top"
                      label="Address"
                      value={
                        deliveryAddress ? (
                          <div className="text-left space-y-0.5 max-w-[240px]">
                            <div className="font-semibold text-[#241F1A]">
                              {customerName}
                            </div>

                            <div className="text-[#5E7A65] text-xs">
                              {deliveryAddress.address_line_1 ||
                                deliveryAddress.full_address ||
                                "—"}

                              {deliveryAddress.address_line_2 &&
                                `, ${deliveryAddress.address_line_2}`}

                              {(deliveryAddress.city ||
                                deliveryAddress.state) && (
                                <>
                                  <br />

                                  {deliveryAddress.city
                                    ? `${deliveryAddress.city}`
                                    : ""}

                                  {deliveryAddress.city &&
                                  deliveryAddress.state
                                    ? ", "
                                    : ""}

                                  {deliveryAddress.state ||
                                    ""}
                                </>
                              )}

                              {(
                                deliveryAddress.postal_code ||
                                deliveryAddress.pincode
                              ) && (
                                <>
                                  {" "}
                                  {deliveryAddress.postal_code ||
                                    deliveryAddress.pincode}
                                </>
                              )}

                              {deliveryAddress.country && (
                                <>
                                  <br />
                                  {
                                    deliveryAddress.country
                                  }
                                </>
                              )}

                              {deliveryAddress.phone && (
                                <span className="block text-[#9C8F7A] text-xs mt-1">
                                  📞{" "}
                                  {deliveryAddress.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#9C8F7A]">
                            Address unavailable
                          </span>
                        )
                      }
                    />
                  </div>
                </motion.div>

                {/* PAYMENT SUMMARY */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.4,
                  }}
                  className="bg-gradient-to-br from-[#FAF8F4] to-white rounded-2xl p-5 border border-[#E4D6B0]/30 shadow-sm flex flex-col"
                >
                  <SectionLabel icon={CreditCard}>
                    Payment Summary
                  </SectionLabel>

                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                      <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                        Subtotal
                      </span>

                      <span className="text-[#241F1A] font-mono font-medium">
                        {formatPrice(
                          totalSubtotal
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                      <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                        GST / Tax
                      </span>

                      <span className="text-[#241F1A] font-mono font-medium">
                        {formatPrice(
                          totalGST
                        )}
                      </span>
                    </div>

                    {toNumber(totalCoinsRedeemed) >
                      0 && (
                      <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                        <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                          <Coins className="w-3 h-3 text-[#B8860B]" />

                          {totalCoinsRedeemed}{" "}
                          coins redeemed
                        </span>

                        <span className="text-[#2F6844] font-mono font-medium">
                          −
                          {formatPrice(
                            totalCoinAmount
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                      <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                        Shipping
                      </span>

                      <span className="text-[#2F6844] font-mono font-medium">
                        {totalShipping > 0
                          ? formatPrice(
                              totalShipping
                            )
                          : "FREE"}
                      </span>
                    </div>

                    {aggregatedSummary?.coupon_discount !==
                      undefined &&
                      toNumber(
                        aggregatedSummary.coupon_discount
                      ) > 0 && (
                        <div className="flex justify-between py-2 border-b border-[#E4D6B0]/20">
                          <span className="text-[#8A7F6E] text-xs uppercase tracking-wider font-medium">
                            Coupon
                          </span>

                          <span className="text-[#2F6844] font-mono font-medium">
                            −
                            {formatPrice(
                              aggregatedSummary.coupon_discount
                            )}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* TOTAL */}
                  <div className="mt-4 pt-4 border-t-2 border-[#241F1A]/10">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <span
                          className="text-[13px] text-[#241F1A] font-medium"
                          style={{
                            fontFamily:
                              "'Fraunces', serif",
                          }}
                        >
                          Total Paid
                        </span>

                        <div className="text-xs text-[#8A7F6E] mt-0.5">
                          Including all taxes
                        </div>

                        {toNumber(
                          totalAmountPaid
                        ) > 0 && (
                          <div className="text-[10px] text-[#2F6844] mt-1 font-medium">
                            Payment received successfully
                          </div>
                        )}
                      </div>

                      <motion.span
                        initial={{
                          scale: 0.8,
                        }}
                        animate={{
                          scale: 1,
                        }}
                        transition={{
                          delay: 0.6,
                          type: "spring",
                        }}
                        className="text-[18px] text-[#1F4A31] leading-none font-medium bg-gradient-to-r from-[#1F4A31] to-[#2F6844] bg-clip-text text-transparent"
                        style={{
                          fontFamily:
                            "'Fraunces', serif",
                        }}
                      >
                        {formatPrice(
                          totalPayable
                        )}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ================================================= */}
              {/* PAYMENT TRANSACTION */}
              {/* ================================================= */}

              {orders.some(
                (currentOrder) =>
                  currentOrder.gateway_transaction_id
              ) && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.5,
                  }}
                  className="mt-5 pt-4 border-t border-dashed border-[#E4D6B0]"
                >
                  
                </motion.div>
              )}

            </div>
          </motion.div>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.6,
            }}
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
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
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

          {/* ================================================= */}
          {/* FOOTER MESSAGE */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.7,
            }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844] animate-pulse" />

              <span
                className="text-[11px] text-[#8A7F6E] font-medium"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                A confirmation email has been sent to
                your registered email
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