"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check, Package, Truck, CreditCard, Home, ShoppingBag, Copy,
  MapPin, Mail, Phone, ChevronRight, ShieldCheck, ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import { useGetConfirmedOrderQuery } from "@/lib/redux/api/checkoutApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";

// ---------- helpers ----------
const toNumber = (v: number | string | null | undefined) => Number(v ?? 0);

const formatPrice = (v: number | string | null | undefined) =>
  `₹${toNumber(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const parseDate = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (s?: string | null) => {
  const d = parseDate(s);
  if (!d) return "—";
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
};

const getStatusLabel = (s?: string | null) =>
  !s ? "Unknown" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ---------- small pieces ----------
const ease = [0.22, 1, 0.36, 1] as const;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white ring-1 ring-stone-200/80 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.12)] ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h2 className="text-[15px] font-semibold text-stone-900">{children}</h2>
    </div>
  );
}

function Line({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "green" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`tabular-nums ${tone === "green" ? "font-medium text-emerald-600" : "text-stone-800"}`}>{value}</span>
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  );
}

function CheckBadge() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
      <motion.span
        className="absolute inset-0 rounded-full bg-emerald-400/25"
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.6, ease: "easeOut", repeat: 2 }}
      />
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_12px_30px_-8px_rgba(16,185,129,0.6)] sm:h-20 sm:w-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }} />
        </svg>
      </motion.div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-4">{children}</div>
      <Footer />
    </>
  );
}

// ---------- page ----------
export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const orderGroupId = searchParams.get("order_reference");

  const { data: orderResponse, isLoading, isFetching, isError } = useGetConfirmedOrderQuery(
    orderGroupId as string,
    { skip: !orderGroupId }
  );
  const { data: profileResponse } = useGetUserProfileQuery();

  useEffect(() => setIsMounted(true), []);

  const confirmationData: any = (orderResponse as any)?.data;
  const orders: any[] = confirmationData?.orders?.length
    ? confirmationData.orders
    : confirmationData?.order
      ? [confirmationData.order]
      : [];
  const agg = confirmationData?.aggregated_summary ?? confirmationData?.summary ?? {};

  const allItems = useMemo(
    () => orders.flatMap((o: any) => (o.items || []).map((i: any) => ({ ...i, parentOrderReference: o.order_reference }))),
    [orders]
  );

  const primaryOrder: any = orders[0];
  const isDistributor = profileResponse?.user?.account_type?.toLowerCase?.() === "distributor";

  const goToOrders = () =>
    router.push(isDistributor ? "/distributor/order-history/" : "/profile/?tab=orders");

  const delivery = primaryOrder?.delivery_address;
  const billing = primaryOrder?.billing_address;

  // ✅ Removed "Customer" fallback — only real names from API
  const customerName =
    delivery?.full_name ||
    delivery?.name ||
    primaryOrder?.user?.name ||
    "";

  const customerEmail = primaryOrder?.user?.email || "";
  const customerPhone = delivery?.phone || primaryOrder?.user?.phone || "";

  // First name for greeting (only if name exists)
  const firstName = customerName ? customerName.split(" ")[0] : "";

  const copyId = async () => {
    if (!orderGroupId) return;
    try {
      await navigator.clipboard.writeText(orderGroupId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  // ----- states -----
  if (!orderGroupId)
    return (
      <Shell>
        <Card className="max-w-sm p-8 text-center sm:p-10">
          <Package className="mx-auto mb-4 h-12 w-12 text-stone-300" />
          <h2 className="mb-2 text-lg font-semibold text-stone-900 sm:text-xl">Order reference missing</h2>
          <p className="mb-6 text-sm text-stone-500">We couldn't find an order reference in the link.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700">
            <Home className="h-4 w-4" /> Go to home
          </Link>
        </Card>
      </Shell>
    );

  if (isLoading || isFetching)
    return (
      <Shell>
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="mt-5 text-sm text-stone-500">Loading your order…</p>
        </div>
      </Shell>
    );

  if (isError || !confirmationData || orders.length === 0)
    return (
      <Shell>
        <Card className="max-w-sm p-8 text-center sm:p-10">
          <Package className="mx-auto mb-4 h-12 w-12 text-stone-300" />
          <h2 className="mb-2 text-lg font-semibold text-stone-900 sm:text-xl">We can't find that order</h2>
          <p className="mb-6 text-sm text-stone-500">Check the order reference in the link and try again.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700">
              <Home className="h-4 w-4" /> Go to home
            </Link>
            <Link href="/profile/?tab=orders" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-stone-900 ring-1 ring-stone-300 hover:ring-stone-900">
              My orders
            </Link>
          </div>
        </Card>
      </Shell>
    );

  // ----- totals -----
  const sum = (key: string) => orders.reduce((s: number, o: any) => s + toNumber(o[key]), 0);
  const totalOrders = agg?.total_orders ?? orders.length;
  const totalItems = agg?.total_items ?? allItems.reduce((s: number, i: any) => s + toNumber(i.quantity), 0);
  const totalSubtotal = agg?.subtotal ?? sum("subtotal");
  const totalGST = agg?.total_gst ?? sum("total_gst");
  const totalShipping = agg?.shipping_charge ?? sum("shipping_charge");
  const totalCoins = agg?.coin_redeemed ?? sum("coin_redeemed");
  const totalCoinAmount = agg?.coin_redeemed_amount ?? sum("coin_redeemed_amount");
  const totalCoupon = agg?.coupon_discount ?? sum("coupon_discount");
  const totalPayable = agg?.total_payable ?? sum("total_payable");
  const totalPaid = agg?.amount_paid ?? sum("amount_paid");
  const txnOrder = orders.find((o: any) => o.gateway_transaction_id);

  return (
    <>
      <Header />

      <main className="relative overflow-hidden bg-stone-50 pb-12 sm:pb-16">
        {/* soft glow behind hero */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(16,185,129,0.14),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-8 sm:pt-10 md:pt-14">
          {/* HERO */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-8 flex flex-col items-center text-center sm:mb-10"
          >
            {isMounted && <CheckBadge />}

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl md:text-5xl">
              {firstName ? `Thanks, ${firstName}. Your order is in.` : "Your order is in."}
            </h1>

            <p className="mt-3 max-w-md px-2 text-sm leading-relaxed text-stone-500 sm:text-[15px]">
              We've received your payment and started getting your {totalItems} {totalItems === 1 ? "item" : "items"} ready.
              {totalOrders > 1 && ` Your purchase was split into ${totalOrders} orders.`}
            </p>

            {/* Order ref pill — stacks nicely on mobile */}
            <button
              type="button"
              onClick={copyId}
              className="group mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 ring-1 ring-stone-200 transition hover:ring-stone-400 sm:gap-3 sm:pl-5 sm:pr-2"
              aria-label="Copy order reference"
            >
              <span className="text-xs text-stone-500">Ref</span>
              <span className="min-w-0 max-w-[40vw] truncate font-mono text-xs font-semibold text-stone-900 sm:max-w-none sm:text-sm">
                {orderGroupId}
              </span>
              <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-stone-900 px-2.5 text-xs font-medium text-white sm:h-8 sm:px-3">
                {copied ? <><Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Copied</> : <><Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Copy</>}
              </span>
            </button>
          </motion.section>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            {/* LEFT: ORDERS */}
            <div className="space-y-5 sm:space-y-6">
              {orders.map((o: any, idx: number) => (
                <motion.div
                  key={o.order_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08, duration: 0.5, ease }}
                >
                  <Card className="overflow-hidden">
                    {/* Order header — stacks on mobile */}
                    <div className="flex flex-col gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                      <div className="min-w-0">
                        <p className="text-xs text-stone-500">
                          {orders.length > 1 ? `Order ${idx + 1} of ${orders.length}` : "Order number"}
                        </p>
                        <p className="truncate font-mono text-sm font-semibold text-stone-900 sm:text-[15px]">
                          {o.order_reference}
                        </p>
                      </div>
                      <div className="self-start sm:self-auto">
                        <StatusPill>{getStatusLabel(o.status || o.order_status || "confirmed")}</StatusPill>
                      </div>
                    </div>

                    {/* Meta grid — 2 cols mobile, 4 cols desktop */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-4 py-4 text-sm sm:grid-cols-4 sm:gap-x-6 sm:px-6 sm:py-5">
                      {[
                        ["Payment", getStatusLabel(o.payment_status || "Paid")],
                        ["Placed", formatDateTime(o.order_date || o.created_at)],
                        ["Confirmed", formatDateTime(o.confirmed_at || o.confirmed_date)],
                        ["Paid via", o.payment_gateway ? getStatusLabel(o.payment_gateway) : "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="min-w-0">
                          <dt className="text-xs text-stone-500">{k}</dt>
                          <dd className="mt-0.5 truncate text-[13px] font-medium text-stone-900 sm:text-sm">{v}</dd>
                        </div>
                      ))}
                    </dl>

                    {/* Items list */}
                    <ul className="divide-y divide-stone-100 border-t border-stone-100">
                      {(o.items || []).map((item: any) => {
                        const image =
                          item.product_image || item.primary_image ||
                          item.images?.find((im: any) => im.is_primary)?.image_url ||
                          item.images?.[0]?.image_url;
                        const attrs = item.variant_attributes ? Object.entries(item.variant_attributes) : [];
                        return (
                          <li key={item.id} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                            {/* Image — smaller on mobile */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200/70 sm:h-20 sm:w-20">
                              {image ? (
                                <img src={image} alt={item.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-stone-300 sm:h-6 sm:w-6" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Product name + price row */}
                              <div className="flex items-start justify-between gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-[14px] font-medium text-stone-900 sm:text-[15px]">
                                    {item.product_name}
                                  </h3>
                                  {item.product_code && (
                                    <p className="mt-0.5 truncate font-mono text-[11px] text-stone-400 sm:text-xs">
                                      {item.product_code}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[14px] font-semibold tabular-nums text-stone-900 sm:text-base">
                                    {formatPrice(item.line_total ?? item.total_price)}
                                  </p>
                                  {item.gst_amount && (
                                    <p className="mt-0.5 text-[10px] text-stone-400 sm:text-xs">
                                      incl. {formatPrice(item.gst_amount)} GST
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Attributes + qty */}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {attrs.map(([k, v]: any) => (
                                  <span key={k} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 sm:px-2.5 sm:text-xs">
                                    {getStatusLabel(k)}: {String(v)}
                                  </span>
                                ))}
                                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white sm:px-2.5 sm:text-xs">
                                  Qty {item.quantity}
                                </span>
                                {item.unit_price && (
                                  <span className="text-[10px] text-stone-500 sm:text-xs">
                                    {formatPrice(item.unit_price)} each
                                  </span>
                                )}
                                {item.gst_rate && (
                                  <span className="text-[10px] text-stone-500 sm:text-xs">
                                    · GST {item.gst_rate}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Per-order totals */}
                    <div className="border-t border-stone-100 bg-stone-50/70 px-4 py-4 sm:px-6 sm:py-5">
                      <div className="ml-auto max-w-xs">
                        <Line label="Subtotal" value={formatPrice(o.subtotal)} />
                        <Line label="GST" value={formatPrice(o.total_gst)} />
                        <Line
                          label="Shipping"
                          value={toNumber(o.shipping_charge) > 0 ? formatPrice(o.shipping_charge) : "Free"}
                          tone={toNumber(o.shipping_charge) > 0 ? undefined : "green"}
                        />
                        {toNumber(o.coin_redeemed_amount) > 0 && (
                          <Line label="Coins redeemed" value={`−${formatPrice(o.coin_redeemed_amount)}`} tone="green" />
                        )}
                        <div className="mt-2 flex items-baseline justify-between border-t border-stone-200 pt-3">
                          <span className="text-sm font-semibold text-stone-900 sm:text-base">Order total</span>
                          <span className="text-base font-semibold tabular-nums text-stone-900 sm:text-lg">
                            {formatPrice(o.total_payable)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* RIGHT: RECEIPT + ADDRESS */}
            <aside className="space-y-5 sm:space-y-6 lg:sticky lg:top-6">
              {/* Payment summary card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
                <Card className="overflow-hidden">
                  <div className="bg-stone-900 px-5 py-5 text-white sm:px-6">
                    <div className="flex items-center gap-2 text-sm text-stone-300">
                      <ReceiptText className="h-4 w-4" /> Payment summary
                    </div>
                    <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                      {formatPrice(totalPayable)}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">Total paid, including all taxes</p>
                  </div>

                  {/* perforated edge */}
                  <div className="relative -mt-px h-3 bg-stone-900">
                    <div className="absolute inset-x-0 bottom-0 h-3 bg-[radial-gradient(circle_at_6px_0,transparent_6px,white_6.5px)] [background-size:16px_12px]" />
                  </div>

                  <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                    <Line label="Subtotal" value={formatPrice(totalSubtotal)} />
                    <Line label="GST / tax" value={formatPrice(totalGST)} />
                    <Line
                      label="Shipping"
                      value={totalShipping > 0 ? formatPrice(totalShipping) : "Free"}
                      tone={totalShipping > 0 ? undefined : "green"}
                    />
                    {toNumber(totalCoins) > 0 && (
                      <Line label={`Coins redeemed (${totalCoins})`} value={`−${formatPrice(totalCoinAmount)}`} tone="green" />
                    )}
                    {toNumber(totalCoupon) > 0 && (
                      <Line label="Coupon discount" value={`−${formatPrice(totalCoupon)}`} tone="green" />
                    )}

                    {toNumber(totalPaid) > 0 && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 ring-1 ring-emerald-100 sm:text-sm">
                        <ShieldCheck className="h-4 w-4 shrink-0" /> Payment received
                      </div>
                    )}

                    {txnOrder && (
                      <div className="mt-4 border-t border-stone-100 pt-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                          <CreditCard className="h-4 w-4 text-stone-400" /> Transaction
                        </div>
                        <p className="text-xs text-stone-500">
                          Paid via {getStatusLabel(txnOrder.payment_gateway)}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-stone-800">
                          {txnOrder.gateway_transaction_id}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Address card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, ease }}>
                <Card className="p-5 sm:p-6">
                  <CardTitle icon={Truck}>Delivering to</CardTitle>
                  {delivery ? (
                    <div className="space-y-1 text-sm leading-relaxed text-stone-600">
                      {/* ✅ Only show name if it exists — no "Customer" fallback */}
                      {customerName && (
                        <p className="font-semibold text-stone-900">{customerName}</p>
                      )}
                      <p>
                        {delivery.address_line_1 || delivery.full_address || "—"}
                        {delivery.address_line_2 && `, ${delivery.address_line_2}`}
                      </p>
                      {(delivery.city || delivery.state) && (
                        <p>{[delivery.city, delivery.state].filter(Boolean).join(", ")}</p>
                      )}
                      {(delivery.postal_code || delivery.pincode) && (
                        <p>PIN {delivery.postal_code || delivery.pincode}</p>
                      )}
                      {delivery.country && <p className="text-stone-400">{delivery.country}</p>}

                      {(customerPhone || customerEmail) && (
                        <div className="!mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-stone-500">
                          {customerPhone && (
                            <p className="flex items-center gap-2 break-all">
                              <Phone className="h-3.5 w-3.5 shrink-0" /> {customerPhone}
                            </p>
                          )}
                          {customerEmail && (
                            <p className="flex items-center gap-2 break-all">
                              <Mail className="h-3.5 w-3.5 shrink-0" /> {customerEmail}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400">Address unavailable</p>
                  )}

                  {/* Billing address */}
                  {billing && billing.id !== delivery?.id && (
                    <div className="mt-5 border-t border-stone-100 pt-5">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                        <MapPin className="h-4 w-4 text-stone-400" /> Billing address
                      </div>
                      <div className="space-y-0.5 text-sm text-stone-600">
                        <p>{billing.address_line_1 || "—"}</p>
                        {billing.address_line_2 && <p>{billing.address_line_2}</p>}
                        {(billing.city || billing.state) && (
                          <p>{[billing.city, billing.state].filter(Boolean).join(", ")}</p>
                        )}
                        {billing.pincode && <p>PIN {billing.pincode}</p>}
                        {billing.country && <p className="text-stone-400">{billing.country}</p>}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            </aside>
          </div>

          {/* ACTIONS */}
          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <ShoppingBag className="h-4 w-4" /> Continue shopping
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={goToOrders}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-stone-900 ring-1 ring-stone-300 transition hover:ring-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <Package className="h-4 w-4" /> View all orders
            </button>
          </div>

          <p className="mt-6 px-4 text-center text-xs text-stone-500">
            A confirmation email is on its way to your registered email address.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}