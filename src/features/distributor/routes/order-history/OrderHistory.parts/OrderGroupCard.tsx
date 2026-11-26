"use client";

import { ChevronDown, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { BRASS, EMERALD, OrderGroupCardProps, RetryPaymentButton, formatCurrency, formatDate, getGroupStatusBadge, normalizeStatus } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";
import { OrderActionDropdown } from "@/features/distributor/routes/order-history/OrderHistory.parts/OrderActionDropdown";
import { OrderItemRow } from "@/features/distributor/routes/order-history/OrderHistory.parts/OrderItemRow";


export const OrderGroupCard = ({
  group,
  isOpen,
  onToggle,
  onProductClick,
  onTrack,
  onViewBreakup,
  onReview,
  onViewReview,
  onReturnOrder,
  onCancelOrder,
  onWithdrawReturnOrder,
  onWithdrawCancelOrder,
  onInvoiceDownload,
  invoiceLoadingLines,
  now,
  retryingReference,
  onRetry,
}: OrderGroupCardProps) => {
  const first = group.lines[0];
  const statusBadge = getGroupStatusBadge(group);
  const paid = normalizeStatus(first.payment_status) === "paid";
  const totalQty = group.lines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0),
    0,
  );
  const totalPayable = first.total_payable ?? first.amount_paid ?? 0;

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E1E7F1] bg-white shadow-[0_2px_10px_rgba(20,35,65,0.04)]">
      {/* ORDER HEADER (click to expand / collapse) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        className="flex cursor-pointer flex-col gap-3 bg-[#F6F8FC] px-3.5 py-4 transition-colors hover:bg-[#F0F4FB] sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#e5e9ef] bg-white text-[#667085]">
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[13.5px] font-bold text-[#0E1B3D]">
                {group.reference}
              </p>

              <span
                className="rounded-[6px] px-2 py-0.5 text-[10px] font-semibold capitalize"
                style={{
                  color: statusBadge.color,
                  backgroundColor: statusBadge.bg,
                }}
              >
                {statusBadge.label}
              </span>
            </div>

            <p className="mt-1 text-[10.5px] text-[#8090A7]">
              Placed on {first.order_date ? formatDate(first.order_date) : "—"}
              {" • "}
              {group.lines.length} product
              {group.lines.length === 1 ? "" : "s"}
              {" • "}
              {totalQty} qty
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-11 sm:pl-0">
          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
              Total
            </p>
            <p className="mt-0.5 text-[13px] font-bold text-[#101828]">
              {formatCurrency(totalPayable)}
            </p>
          </div>

          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
              Payment
            </p>
            <span
              className="mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
              style={{
                color: paid ? EMERALD : BRASS,
                backgroundColor: paid ? "#eaf7f0" : "#f8f1e4",
              }}
            >
              {first.payment_status || "—"}
            </span>
          </div>

          <span className="inline-flex h-6 min-w-7 items-center justify-center gap-1 rounded-[5px] border border-[#CFE0D4] bg-[#F1F7F3] px-1.5 text-[10px] font-bold text-[#1F7A56]">
            <Coins size={11} />
            {first.coin_redeemed || 0}
          </span>

          {/* ORDER-LEVEL three-dot menu: Return / Cancel */}
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <OrderActionDropdown
              group={group}
              onReturn={() => onReturnOrder(group)}
              onCancel={() => onCancelOrder(group)}
              onWithdrawReturn={() => onWithdrawReturnOrder(group)}
              onWithdrawCancel={() => onWithdrawCancelOrder(group)}
            />
          </div>
        </div>
      </div>

      {/* PAYMENT FAILED + RETRY */}
      {statusBadge.value === "payment_failed" && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t border-red-100 bg-red-50/60 px-3.5 py-3 sm:px-5"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] font-semibold text-red-700">
            Payment Failed
          </p>

          <RetryPaymentButton
            order={first}
            now={now}
            busy={retryingReference === first.order_reference}
            onRetry={onRetry}
          />
        </div>
      )}

      {/* EXPANDED: ALL PRODUCTS + ORDER SUMMARY */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#E7EDF6]">
              <div className="bg-white">
                <p className="px-3.5 pb-1 pt-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a92a6] sm:px-5">
                  Products in this order
                </p>

                {group.lines.map((line) => (
                  <OrderItemRow
                    key={line.line_id}
                    order={line}
                    onProductClick={() => onProductClick(line)}
                    onTrack={() => onTrack(line)}
                    onReview={() => onReview(line)}
                    onViewReview={() => onViewReview(line)}
                    onInvoiceDownload={() => onInvoiceDownload(line)}
                    isInvoiceLoading={!!invoiceLoadingLines[line.line_id]}
                  />
                ))}
              </div>

              {/* ORDER-LEVEL SUMMARY */}
              <div className="border-t border-[#edf0f3] bg-[#fafbfc] px-3.5 py-4 sm:px-5">
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onViewBreakup(first)}
                    className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#C9D5F7] bg-[#F4F6FC] px-3.5 py-2 text-[11px] font-semibold text-[#3955A6] transition-colors hover:bg-[#ECEFFC]"
                  >
                    <LuReceiptIndianRupee size={14} />
                    Full Breakdown
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
