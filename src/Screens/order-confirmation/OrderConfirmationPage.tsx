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
} from "lucide-react";
import Link from "next/link";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import { useGetConfirmedOrderQuery } from "@/lib/redux/api/checkoutApi";

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
    <div
      className={`flex ${
        align === "top" ? "items-start" : "items-center"
      } justify-between gap-6 py-2`}
    >
      <span className="text-[11px] uppercase tracking-[0.12em] text-[#9C8F7A] shrink-0">
        {label}
      </span>

      <span className="text-[13.5px] text-[#241F1A] text-right leading-relaxed">
        {value}
      </span>
    </div>
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
    <div className="flex items-center gap-2 mb-1">
      <Icon
        className="w-3.5 h-3.5 text-[#B8860B]"
        strokeWidth={1.75}
      />

      <h2
        className="text-[13px] font-semibold text-[#241F1A] tracking-wide"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();

  const orderReference = searchParams.get("order_reference");

  /*
   * API:
   * GET /orders/confirmed/{order_reference}
   */
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

    const date = new Date(dateString.replace(" ", "T"));

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

  const fontImport = (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap");
    `}</style>
  );

  // Missing order reference
  if (!orderReference) {
    return (
      <>
        {fontImport}

        <Header />

        <div className="min-h-screen bg-[#FBF6EC] flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto p-8">
            <Package
              className="w-12 h-12 text-[#D9CFBA] mx-auto mb-4"
              strokeWidth={1.5}
            />

            <h2
              className="text-2xl text-[#241F1A] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Order reference missing
            </h2>

            <p
              className="text-[#8A7F6E] text-sm mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              We could not find an order reference in the URL.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#241F1A] text-white text-sm rounded-full hover:bg-[#3a332a] transition-colors"
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // API loading
  if (isLoading || isFetching) {
    return (
      <>
        {fontImport}

        <Header />

        <div className="min-h-screen bg-[#FBF6EC] flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-9 h-9 border-2 border-[#B8860B] border-t-transparent rounded-full mx-auto"
            />

            <p
              className="mt-4 text-[#8A7F6E] text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Fetching your order…
            </p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // API error / order not found
  if (isError || !order) {
    console.error("Confirmed order API error:", error);

    return (
      <>
        {fontImport}

        <Header />

        <div className="min-h-screen bg-[#FBF6EC] flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto p-8">
            <Package
              className="w-12 h-12 text-[#D9CFBA] mx-auto mb-4"
              strokeWidth={1.5}
            />

            <h2
              className="text-2xl text-[#241F1A] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              We can't find that order
            </h2>

            <p
              className="text-[#8A7F6E] text-sm mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              We couldn't load the order details. Please check your order
              reference and try again.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#241F1A] text-white text-sm rounded-full hover:bg-[#3a332a] transition-colors"
              >
                <Home className="w-4 h-4" />
                Return home
              </Link>

              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#241F1A]/20 text-[#241F1A] text-sm rounded-full hover:border-[#241F1A] transition-colors"
              >
                <Package className="w-4 h-4" />
                My orders
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  const deliveryAddress = order.delivery_address;
  
  return (
    <>
      {fontImport}

      <Header />

      <div className="min-h-screen bg-[#FBF6EC] py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-[820px]">
          {/* Receipt */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div className="bg-[#FFFDF8] shadow-[0_20px_50px_-20px_rgba(43,36,26,0.25)] rounded-2xl px-6 md:px-10 pb-7">
              {/* Success Header */}
              <div className="flex flex-col items-center text-center pt-6 pb-5 -mx-6 md:-mx-10 px-6 md:px-10 rounded-t-2xl bg-gradient-to-b from-[#EAF5EC] via-[#F4FAF1] to-transparent">
                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -12,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.15,
                  }}
                  className="w-14 h-14 rounded-full border-[1.5px] border-[#2F6844] flex items-center justify-center mb-3 bg-[#E4F2E7] shadow-[0_0_0_6px_rgba(47,104,68,0.08)]"
                >
                  <Check
                    className="w-6 h-6 text-[#2F6844]"
                    strokeWidth={2.5}
                  />
                </motion.div>

                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCEEE0] text-[#2F6844] text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />

                  {getStatusLabel(order.payment_status)}
                </span>

                <h1
                  className="text-[24px] md:text-[28px] text-[#1F4A31] leading-tight"
                  style={{
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  Order confirmed
                </h1>

                <p
                  className="text-[13px] text-[#5E7A65] mt-1 max-w-[36ch]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Thank you — we've got it and we're getting it ready.
                </p>

                <p
                  className="mt-2 text-[13px] tracking-wide text-[#241F1A]"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {order.order_reference}
                </p>
              </div>

              <div className="border-t border-dashed border-[#E4D6B0]" />

              {/* Status + Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 divide-y md:divide-y-0 md:divide-x divide-dashed divide-[#E4D6B0]">
                {/* Status */}
                <div className="py-4 md:pr-8">
                  <SectionLabel icon={Package}>
                    Status
                  </SectionLabel>

                  <Row
                    label="Order"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />

                        {getStatusLabel(order.order_status)}
                      </span>
                    }
                  />

                  <Row
                    label="Payment"
                    value={
                      <span className="inline-flex items-center gap-1.5 text-[#2F6844] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6844]" />

                        {getStatusLabel(order.payment_status)}
                      </span>
                    }
                  />

                  <Row
                    label="Placed on"
                    value={
                      <>
                        {formatDate(order.order_date)}
                        {" · "}
                        {formatTime(order.order_date)}
                      </>
                    }
                  />

                  <Row
                    label="Confirmed on"
                    value={
                      order.confirmed_date ? (
                        <>
                          {formatDate(order.confirmed_date)}
                          {" · "}
                          {formatTime(order.confirmed_date)}
                        </>
                      ) : (
                        "—"
                      )
                    }
                  />

                  <Row
                    label="Payment gateway"
                    value={
                      order.payment_gateway
                        ? getStatusLabel(order.payment_gateway)
                        : "—"
                    }
                  />
                </div>

                {/* Shipping */}
                <div className="py-4 md:pl-8">
                  <SectionLabel icon={Truck}>
                    Shipping
                  </SectionLabel>

                  <Row
                    label="Method"
                    value={
                      order.shipping_charge > 0
                        ? "Shipping"
                        : "Free Shipping"
                    }
                  />

                  <Row
                    label="Shipping"
                    value={
                      order.shipping_charge > 0
                        ? formatPrice(order.shipping_charge)
                        : "Free"
                    }
                  />

                  <Row
                    align="top"
                    label="Deliver to"
                    value={
                      <span className="block leading-relaxed">
                        {deliveryAddress.full_name || "Customer"}

                        <br />

                        {deliveryAddress.address_line_1}

                        {deliveryAddress.address_line_2 && (
                          <>
                            , {deliveryAddress.address_line_2}
                          </>
                        )}

                        <br />

                        {deliveryAddress.city},{" "}
                        {deliveryAddress.state}

                        {deliveryAddress.postal_code && (
                          <>
                            {" "}
                            {deliveryAddress.postal_code}
                          </>
                        )}

                        <br />

                        {deliveryAddress.country}

                        {deliveryAddress.phone && (
                          <span className="text-[#8A7F6E]">
                            <br />
                            {deliveryAddress.phone}
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>
              </div>

              <div className="border-t border-dashed border-[#E4D6B0]" />

              {/* Payment Summary */}
              <div className="pt-4">
                <SectionLabel icon={CreditCard}>
                  Payment summary
                </SectionLabel>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0.5">
                  {/* Left */}
                  <div
                    className="space-y-0.5 text-[13.5px]"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#8A7F6E] font-sans text-[11px] uppercase tracking-[0.12em] self-center">
                        Subtotal
                      </span>

                      <span className="text-[#241F1A]">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    {!!order.coin_redeemed &&
                      order.coin_redeemed > 0 && (
                        <div className="flex justify-between py-1.5">
                          <span className="text-[#8A7F6E] font-sans text-[11px] uppercase tracking-[0.12em] self-center inline-flex items-center gap-1">
                            <Coins className="w-3 h-3" />

                            {order.coin_redeemed} coins redeemed
                          </span>

                          <span className="text-[#2F6844]">
                            −
                            {formatPrice(
                              order.coin_redeemed_amount
                            )}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Right */}
                  <div
                    className="space-y-0.5 text-[13.5px]"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#8A7F6E] font-sans text-[11px] uppercase tracking-[0.12em] self-center">
                        GST / Tax
                      </span>

                      <span className="text-[#241F1A]">
                        {formatPrice(order.total_gst)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-[#8A7F6E] font-sans text-[11px] uppercase tracking-[0.12em] self-center">
                        Shipping
                      </span>

                      <span className="text-[#2F6844]">
                        {order.shipping_charge > 0
                          ? formatPrice(order.shipping_charge)
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#241F1A]">
                  <span
                    className="text-[13px] text-[#241F1A]"
                    style={{
                      fontFamily: "'Fraunces', serif",
                    }}
                  >
                    Total paid
                  </span>

                  <span
                    className="text-[22px] text-[#241F1A] leading-none"
                    style={{
                      fontFamily: "'Fraunces', serif",
                    }}
                  >
                    {formatPrice(order.total_payable)}
                  </span>
                </div>
              </div>

              {/* Payment Transaction */}
              {order.gateway_transaction_id && (
                <>
                  <div className="border-t border-dashed border-[#E4D6B0] mt-5 pt-4">
                    <SectionLabel icon={CreditCard}>
                      Payment details
                    </SectionLabel>

                    <Row
                      label="Transaction ID"
                      value={
                        <span
                          className="text-[12px]"
                          style={{
                            fontFamily:
                              "'IBM Plex Mono', monospace",
                          }}
                        >
                          {order.gateway_transaction_id}
                        </span>
                      }
                    />

                    <Row
                      label="Gateway"
                      value={
                        order.payment_gateway
                          ? getStatusLabel(order.payment_gateway)
                          : "—"
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.4,
            }}
            className="flex flex-col sm:flex-row items-center gap-3 mt-7"
          >
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#241F1A] text-white text-sm rounded-full hover:bg-[#3a332a] transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue shopping
            </Link>

            <Link
              href="/orders"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[#241F1A]/20 text-[#241F1A] text-sm rounded-full hover:border-[#241F1A] transition-colors"
            >
              <Package className="w-4 h-4" />
              View all orders
            </Link>
          </motion.div>

          <p
            className="text-center text-[11px] text-[#B0A48C] mt-5"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            A copy of this confirmation has been sent to your email.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}