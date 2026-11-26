"use client";

import { Package, Check, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { OrderItemRowProps, formatCurrency, formatDate, getOrderStatusBadge, getRefundDetails, getReturnStatusBadge, getReturnWindowInfo } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";
import { ActionDropdown } from "@/features/distributor/routes/order-history/OrderHistory.parts/ActionDropdown";


export const OrderItemRow = ({
  order,
  onProductClick,
  onTrack,
  onReview,
  onViewReview,
  onInvoiceDownload,
  isInvoiceLoading = false,
}: OrderItemRowProps) => {
  const statusBadge = getOrderStatusBadge(order);
  const returnBadge = getReturnStatusBadge(order);
  const returnWindow = getReturnWindowInfo(order);
  const refund = getRefundDetails(order);

  return (
    <div className="border-b border-dashed border-[#e7e9ee] px-3 py-4 last:border-b-0 sm:px-5">
      <div className="flex items-start gap-3">
        {/* Product image → product page */}
        <button
          type="button"
          onClick={onProductClick}
          className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white transition-opacity hover:opacity-80 sm:h-[72px] sm:w-[72px]"
          title={`View ${order.product_name}`}
        >
          {order.primary_image ? (
            <Image
              src={order.primary_image}
              alt={order.product_name || "Product"}
              fill
              sizes="72px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-[#999999]" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Product name → product page */}
              <p
                onClick={onProductClick}
                className="cursor-pointer truncate text-[13px] font-semibold text-[#101828] transition-colors hover:text-[#0E1B3D] hover:underline"
                title={`View ${order.product_name}`}
              >
                {order.product_name}
              </p>

              <p className="mt-0.5 truncate text-[10.5px] text-[#98a2b3]">
                {order.item_reference_id || `Line #${order.line_id}`}
                {order.product_code ? ` • ${order.product_code}` : ""}
              </p>
            </div>

            {/* ✅ Item ⋮ menu: Track, Invoice, Review only */}
            <ActionDropdown
              order={order}
              onReview={onReview}
              onViewReview={onViewReview}
              onTrack={onTrack}
              onInvoiceDownload={onInvoiceDownload}
              isInvoiceLoading={isInvoiceLoading}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-[6px] px-2 py-1 text-[10px] font-semibold capitalize"
              style={{
                color: statusBadge.color,
                backgroundColor: statusBadge.bg,
              }}
            >
              {statusBadge.label}
            </span>

            {returnBadge && (
              <span
                className="rounded-[6px] px-2 py-1 text-[10px] font-semibold capitalize"
                style={{
                  color: returnBadge.color,
                  backgroundColor: returnBadge.bg,
                }}
              >
                {returnBadge.label}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            <div>
              <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                Unit Price
              </p>
              <p className="mt-0.5 font-semibold text-[#101828]">
                {formatCurrency(order.unit_price)}
              </p>
            </div>

            <div>
              <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                Qty
              </p>
              <p className="mt-0.5 font-semibold text-[#101828]">
                {order.quantity}
              </p>
            </div>

            <div>
              <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                Shipping
              </p>
              <p className="mt-0.5 font-semibold text-[#101828]">
                {formatCurrency(order.delivery_charges ?? 0)}
              </p>
            </div>

            <div>
              <p className="text-[9.5px] uppercase tracking-wide text-[#98a2b3]">
                Item Total
              </p>
              <p className="mt-0.5 font-bold text-[#101828]">
                {formatCurrency(order.final_amount ?? order.line_total)}
              </p>
            </div>
          </div>

          {returnWindow?.state === "completed" && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-[6px] border border-[#CFE0D4] bg-[#F1F7F3] px-2.5 py-2 text-[9.5px] font-medium text-[#3F765A]">
              <RefreshCcw size={11} />
              <span>Return completed</span>
            </div>
          )}

          {refund?.amount !== null && refund?.amount !== undefined && (
            <div className="mt-2.5 rounded-[6px] border border-[#CFE0D4] bg-[#F6FBF7] px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[9.5px] font-semibold text-[#4C6E5E]">
                  <Check size={11} />
                  Refund Processed
                </span>

                <span className="text-[11px] font-bold text-[#1F7A56]">
                  {formatCurrency(refund.amount)}
                </span>
              </div>

              {refund.issuedAt && (
                <p className="mt-1 text-[9.5px] text-[#789084]">
                  Processed on{" "}
                  <span className="font-semibold">
                    {formatDate(refund.issuedAt)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
