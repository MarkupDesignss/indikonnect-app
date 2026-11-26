"use client";

import { useGetMyOrdersQuery } from "@/lib/redux/api/order/orderApi";

import { ChevronDown, ChevronLeft, ChevronRight, Search, Package, Coins } from "lucide-react";
import { useState, useMemo, useEffect } from "react";


import Image from "next/image";

import { useAppDispatch } from "@/lib/redux/hooks";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useRouter } from "next/navigation";
import { NAVY, OrderLineItem, STATUS_OPTIONS, STATUS_STYLES, formatCurrency, getRefundDetails, getRegistrationCompletionDate, isBuybackEnabled, normalizeStatus } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";
import { ActionDropdown } from "@/features/distributor/routes/buy-back/BuyBack.parts/ActionDropdown";
import { ViewDetailsModal } from "@/features/distributor/routes/buy-back/BuyBack.parts/ViewDetailsModal";
import { BuybackModal } from "@/features/distributor/routes/buy-back/BuyBack.parts/BuybackModal";
import { BuybackExpiredModal } from "@/features/distributor/routes/buy-back/BuyBack.parts/BuybackExpiredModal";


/* Eligibility is measured from registration completion, not order date. */

const BUYBACK_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isWithinRegistrationBuybackWindow(profile: any, now: number): boolean {
  const completed = getRegistrationCompletionDate(profile);

  if (!completed) {
    return false;
  }

  const elapsed = now - completed.getTime();

  return elapsed >= 0 && elapsed < BUYBACK_WINDOW_MS;
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function BuyBack() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const { data: profileData } = useGetUserProfileQuery({});

  const [eligibilityNow, setEligibilityNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(
      () => setEligibilityNow(Date.now()),
      30_000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const registrationBuybackEligible = isWithinRegistrationBuybackWindow(
    profileData,
    eligibilityNow,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const [perPage] = useState(10);

  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [buybackModalOpen, setBuybackModalOpen] = useState(false);

  const [expiredModalOpen, setExpiredModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(
    null,
  );

  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, string>
  >({});

  /* ------------------------------------------------------------------------ */
  /* Orders                                                                   */
  /* ------------------------------------------------------------------------ */

  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
    {
      page,
      per_page: perPage,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const orders: OrderLineItem[] = useMemo(() => {
    if (!data?.data) {
      return [];
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }

    return [];
  }, [data]);

  const getOrderKey = (order: OrderLineItem) =>
    `${order.order_id}-${order.line_id}`;

  const getEffectiveDeliveryStatus = (order: OrderLineItem) => {
    const key = getOrderKey(order);

    return statusOverrides[key] ?? normalizeStatus(order.delivery_status);
  };

  useEffect(() => {
    if (!orders.length || !Object.keys(statusOverrides).length) {
      return;
    }

    setStatusOverrides((currentOverrides) => {
      let changed = false;

      const nextOverrides = {
        ...currentOverrides,
      };

      orders.forEach((order) => {
        const key = getOrderKey(order);

        const localStatus = nextOverrides[key];

        if (!localStatus) {
          return;
        }

        const backendStatus = normalizeStatus(order.delivery_status);

        if (backendStatus === localStatus) {
          delete nextOverrides[key];
          changed = true;
        }
      });

      return changed ? nextOverrides : currentOverrides;
    });
  }, [orders, statusOverrides]);

  // Show all order lines. Buyback remains separately restricted to eligible lines.
  const eligibleOrders = orders;

  const getVisibleStatus = (order: OrderLineItem) =>
    normalizeStatus(order.order_status) === "payment_failed"
      ? "payment_failed"
      : getEffectiveDeliveryStatus(order);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const normalizedFilter = normalizeStatus(statusFilter);

    return eligibleOrders.filter((o) => {
      const normalizedDeliveryStatus = getVisibleStatus(o);

      const matchesSearch =
        !q ||
        o.order_reference?.toLowerCase().includes(q) ||
        o.product_name?.toLowerCase().includes(q) ||
        o.order_status?.toLowerCase().includes(q) ||
        o.item_reference_id?.toLowerCase().includes(q);

      const matchesStatus =
        !normalizedFilter || normalizedDeliveryStatus === normalizedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [eligibleOrders, searchQuery, statusFilter, statusOverrides]);

  const totalRecords =
    (data as any)?.meta?.total || (data as any)?.total || eligibleOrders.length;

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  /* ------------------------------------------------------------------------ */
  /* Status Sync Helpers                                                      */
  /* ------------------------------------------------------------------------ */

  const syncOrderStatus = async (order: OrderLineItem, nextStatus: string) => {
    const key = getOrderKey(order);

    setStatusOverrides((prev) => ({
      ...prev,
      [key]: normalizeStatus(nextStatus),
    }));

    setSelectedOrder((prev) => {
      if (!prev || getOrderKey(prev) !== key) {
        return prev;
      }

      return {
        ...prev,
        delivery_status: normalizeStatus(nextStatus),
      };
    });

    try {
      await refetch();
    } catch {
      // Keep optimistic status.
    }
  };

  const handleBuybackSuccess = async () => {
    if (!selectedOrder) {
      await refetch();
      return;
    }

    await syncOrderStatus(selectedOrder, "buyback_pending");
  };

  /* ------------------------------------------------------------------------ */
  /* Modal Handlers                                                           */
  /* ------------------------------------------------------------------------ */

  const openView = (order: OrderLineItem) => {
    const effectiveStatus = getEffectiveDeliveryStatus(order);

    const orderForModal = statusOverrides[getOrderKey(order)]
      ? {
          ...order,
          delivery_status: effectiveStatus,
        }
      : order;

    setSelectedOrder(orderForModal);

    setViewModalOpen(true);
  };

  const canBuybackOrder = (order: OrderLineItem | null): boolean =>
    Boolean(
      order &&
      normalizeStatus(getEffectiveDeliveryStatus(order)) === "delivered" &&
      isBuybackEnabled(order) &&
      isWithinRegistrationBuybackWindow(profileData, Date.now()),
    );

  const openBuyback = (order: OrderLineItem) => {
    if (!canBuybackOrder(order)) {
      return;
    }

    setSelectedOrder(order);
    setBuybackModalOpen(true);
  };

  useEffect(() => {
    if (buybackModalOpen && !registrationBuybackEligible) {
      setBuybackModalOpen(false);
    }
  }, [buybackModalOpen, registrationBuybackEligible]);

  const handleGoToContact = () => {
    setExpiredModalOpen(false);
    setSelectedOrder(null);

    router.push("/contact");
  };

  const closeAllModals = () => {
    setViewModalOpen(false);
    setBuybackModalOpen(false);
    setExpiredModalOpen(false);
    setSelectedOrder(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <section className="rounded-[18px] border border-neutral-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="h-10 w-64 animate-pulse rounded-[8px] bg-[#f2f4f7]" />

          <div className="h-10 w-[180px] animate-pulse rounded-[8px] bg-[#f2f4f7]" />
        </div>

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

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
        <p className="text-[14px] text-[#667085]">
          Failed to load orders. Please try again.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-3 min-h-10 rounded-xl bg-black px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-[18px] border border-neutral-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        {/* Search + Status Filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />

            <input
              type="text"
              placeholder="Search order or item"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>

          <div className="relative w-full sm:w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 pl-3 pr-9 text-[13px] text-[#101828] outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
            <span>Order Reference</span>
            <span>Product</span>
            <span>Total</span>
            <span>Method</span>
            <span>Qty</span>
            <span>Coins</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div>
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                {searchQuery || statusFilter
                  ? "No orders found matching your filters."
                  : "No orders found."}
              </div>
            ) : (
              filteredOrders.map((order) => {
                const rowKey = `${order.order_id}-${order.line_id}`;

                const normalizedDeliveryStatus = getVisibleStatus(order);

                const statusStyle = STATUS_STYLES[normalizedDeliveryStatus] ?? {
                  color: "#667085",
                  bg: "#f2f4f7",
                };

                const refundDetails = getRefundDetails(order);

                return (
                  <div
                    key={rowKey}
                    className="grid min-w-[1000px] grid-cols-[1.5fr_1.6fr_0.9fr_0.9fr_0.6fr_0.9fr_0.9fr_0.6fr] items-center gap-2 border-b border-neutral-100 py-4 text-[13px] text-neutral-900 transition-colors hover:bg-neutral-50/80 last:border-b-0"
                  >
                    <span className="truncate font-semibold text-neutral-950">
                      {order.order_reference}
                    </span>

                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                        {order.primary_image ? (
                          <Image
                            src={order.primary_image}
                            alt={order.product_name || "Product"}
                            fill
                            sizes="40px"
                            className="object-cover"
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
                    </div>

                    <div>
                      <span className="text-[#667085]">
                        {formatCurrency(order.final_amount)}
                      </span>

                      {refundDetails?.amount !== null &&
                        refundDetails?.amount !== undefined && (
                          <span className="mt-0.5 block text-[10px] font-bold text-[#1F7A56]">
                            Refund: {formatCurrency(refundDetails.amount)}
                          </span>
                        )}
                    </div>

                    <span>
                      <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                        {order.payment_gateway || "N/A"}
                      </span>
                    </span>

                    <span className="text-[#667085]">{order.quantity}</span>

                    <div className="flex items-center gap-1.5">
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
                        {normalizedDeliveryStatus.replace(/_/g, " ")}
                      </span>
                    </span>

                    <div className="flex items-center justify-end">
                      <ActionDropdown
                        order={order}
                        displayStatus={normalizedDeliveryStatus}
                        onView={() => openView(order)}
                        registrationBuybackEligible={
                          registrationBuybackEligible
                        }
                        onBuyback={() => openBuyback(order)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center gap-4 text-[13px] text-[#667085]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#101828]">{perPage}</span>

              <ChevronDown size={14} className="text-[#8a92a6]" />
            </div>

            <span className="font-medium">
              Showing {(page - 1) * perPage + 1} –{" "}
              {Math.min(page * perPage, totalRecords)} of {totalRecords} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from(
              {
                length: Math.min(totalPages, 5),
              },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${
                  page === p
                    ? "text-white"
                    : "text-[#667085] hover:bg-[#f2f4f7] hover:text-neutral-950"
                }`}
                style={
                  page === p
                    ? {
                        backgroundColor: NAVY,
                      }
                    : undefined
                }
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ViewDetailsModal
        isOpen={viewModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
      />

      <BuybackModal
        isOpen={buybackModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSuccess={handleBuybackSuccess}
        canBuyback={() => canBuybackOrder(selectedOrder)}
      />

      <BuybackExpiredModal
        isOpen={expiredModalOpen}
        onClose={closeAllModals}
        onContact={handleGoToContact}
      />
    </>
  );
}
