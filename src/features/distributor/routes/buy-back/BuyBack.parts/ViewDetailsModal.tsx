"use client";

import { X, Package, AlertCircle, Eye } from "lucide-react";
import Image from "next/image";
import { AddressBreakdown, BreakdownPill, BreakdownRow, BreakdownSection, OrderLineItem, ViewDetailsModalProps, formatCurrency, formatDate, getMatchingCreditNotes, getMatchingReturn, getRefundDetails, isBuybackEnabled, maybeValue, moneyOrDash, normalizeStatus, numericOrNull, prettyStatus } from "@/features/distributor/routes/buy-back/BuyBack.parts/support";
import { ModalShell } from "@/features/distributor/routes/buy-back/BuyBack.parts/ModalShell";


export const ViewDetailsModal = ({
  isOpen,
  onClose,
  order,
}: ViewDetailsModalProps) => {
  if (!isOpen || !order) return null;

  const status = normalizeStatus(order.delivery_status);
  const matchingReturn = getMatchingReturn(order);
  const matchingItem = matchingReturn?.items?.find(
    (item) => Number(item.order_line_id) === Number(order.line_id),
  );
  const refundDetails = getRefundDetails(order);
  const noteList = Array.isArray(order.credit_notes) ? order.credit_notes : [];
  const matchingNotes = getMatchingCreditNotes(order);
  const tax = order.tax_breakdown;
  const taxLines = tax?.items || [];
  const taxSummary = tax?.summary;
  const returnTotal = numericOrNull(matchingReturn?.total_refund_amount);
  const actualRefund = numericOrNull(order.refunded_amount);
  const isRefundDifference =
    actualRefund !== null &&
    returnTotal !== null &&
    Math.abs(actualRefund - returnTotal) > 0.01;
  const isCreditNoteDifference =
    actualRefund !== null &&
    matchingNotes.some((note) => {
      const amount = numericOrNull(note.amount);
      return amount !== null && Math.abs(amount - actualRefund) > 0.01;
    });
  const itemCalculatedTotal =
    Number(order.line_total || 0) + Number(order.delivery_charges || 0);
  const itemTotalMismatch =
    numericOrNull(order.final_amount) !== null &&
    Math.abs(itemCalculatedTotal - Number(order.final_amount)) > 0.01;

  const timelineEntries: {
    label: string;
    key: keyof OrderLineItem["timeline"];
    negative?: boolean;
  }[] = [
    { label: "Order Placed", key: "order_placed" },
    { label: "Order Confirmed", key: "order_confirmed" },
    { label: "Dispatched", key: "dispatched_at" },
    { label: "Shipped", key: "shipped_at" },
    { label: "Delivered", key: "delivered_at" },
    { label: "Return Requested", key: "return_requested_at" },
    { label: "Return Approved", key: "return_approved_at" },
    { label: "Return Rejected", key: "return_rejected_at", negative: true },
    { label: "Return Completed", key: "return_completed_at" },
    { label: "Buyback Requested", key: "buyback_requested_at" },
    { label: "Buyback Approved", key: "buyback_approved_at" },
    { label: "Buyback Rejected", key: "buyback_rejected_at", negative: true },
    { label: "Buyback Refunded", key: "buyback_refunded_at" },
    { label: "Cancelled", key: "cancelled_at", negative: true },
  ];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-5xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-neutral-100 text-neutral-900">
            <Eye size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[16px] font-extrabold tracking-[-0.025em] text-neutral-950 sm:text-[18px]">
              Complete Order Breakdown
            </h3>
            <p className="break-all text-[10px] text-[#667085]">
              {order.order_reference} • Line #{order.line_id}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close breakdown"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#E0E4EA] text-[#667085] hover:bg-[#F7F8FA]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F7F7F7] p-3.5 sm:p-5">
        {/* The selected product's amount and the whole order's total are different scopes. */}
        <div className="rounded-[12px] border border-[#E6EAF0] bg-white p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[9px] border border-[#E7EAF0] bg-[#F8F9FA]">
              {order.primary_image ? (
                <Image
                  src={order.primary_image}
                  alt={order.product_name}
                  fill
                  sizes="74px"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-6 w-6 text-[#98A2B3]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-5 text-[#101828]">
                {order.product_name}
              </p>
              <p className="mt-1 text-[10.5px] text-[#667085]">
                SKU: {maybeValue(order.product_code)} • Qty: {order.quantity}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <BreakdownPill status={status} />
                <BreakdownPill status={order.return_status} />
                <BreakdownPill status={order.payment_status} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {
                title: "Selected Item Total",
                value: moneyOrDash(order.final_amount),
              },
              {
                title: "Full Order Payable",
                value: moneyOrDash(order.total_payable),
              },
              {
                title: "Full Order Paid",
                value: moneyOrDash(order.amount_paid),
              },
              {
                title: "Actual Line Refund",
                value: moneyOrDash(order.refunded_amount),
              },
            ].map((summary) => (
              <div
                key={summary.title}
                className="rounded-[8px] border border-[#E8ECF2] bg-[#FCFDFE] px-3 py-3"
              >
                <p className="text-[9.5px] font-semibold text-[#8A92A6]">
                  {summary.title}
                </p>
                <p className="mt-1 text-[14px] font-bold text-[#101828] sm:text-[15px]">
                  {summary.value}
                </p>
              </div>
            ))}
          </div>
          {(isRefundDifference ||
            isCreditNoteDifference ||
            itemTotalMismatch) && (
            <div className="mt-3 flex gap-2 rounded-[8px] border border-[#F2D5A5] bg-[#FFFBF2] p-3 text-[11px] leading-5 text-[#875B16]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>
                API amounts need reconciliation:
                {isRefundDifference &&
                  " actual refunded_amount differs from return total_refund_amount;"}
                {isCreditNoteDifference &&
                  " credit note amount differs from refunded_amount;"}
                {itemTotalMismatch &&
                  " item final_amount differs from line_total + delivery_charges;"}{" "}
                Values below are displayed exactly as supplied, not recalculated
                as a refund.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="Order & Item Information"
            subtitle="Order-level details and the selected line's identifiers"
          >
            <BreakdownRow
              label="Order Reference"
              value={order.order_reference}
              strong
            />
            <BreakdownRow label="Order ID" value={maybeValue(order.order_id)} />
            <BreakdownRow
              label="Order Status"
              value={<BreakdownPill status={order.order_status} />}
            />
            <BreakdownRow
              label="Order Type"
              value={prettyStatus(order.order_type)}
            />
            <BreakdownRow
              label="Placed On"
              value={formatDate(order.order_date)}
            />
            <BreakdownRow
              label="Confirmed On"
              value={formatDate(order.confirmed_date)}
            />
            <BreakdownRow label="Line ID" value={order.line_id} />
            <BreakdownRow
              label="Item Reference"
              value={maybeValue(order.item_reference_id)}
            />
            <BreakdownRow label="Product ID" value={order.product_id} />
            <BreakdownRow
              label="Product Code"
              value={maybeValue(order.product_code)}
            />
            <BreakdownRow
              label="Product Slug"
              value={maybeValue(order.product_slug)}
            />
            <BreakdownRow
              label="Delivery Status"
              value={<BreakdownPill status={order.delivery_status} />}
            />
            <BreakdownRow
              label="Return Status"
              value={<BreakdownPill status={order.return_status} />}
            />
          </BreakdownSection>

          <BreakdownSection
            title="Selected Product — Price Breakdown"
            subtitle="Only this product line; shipping is shown separately"
          >
            <BreakdownRow
              label="Unit Price"
              value={moneyOrDash(order.unit_price)}
            />
            <BreakdownRow label="Ordered Quantity" value={order.quantity} />
            <BreakdownRow
              label="Base Value (unit × quantity)"
              value={formatCurrency(
                Number(order.unit_price) * Number(order.quantity),
              )}
            />
            <BreakdownRow
              label={`GST (${maybeValue(order.gst_rate)}%)`}
              value={moneyOrDash(order.gst_amount)}
            />
            <BreakdownRow
              label="Line Total (incl. GST)"
              value={moneyOrDash(order.line_total)}
              strong
            />
            <BreakdownRow
              label="Delivery Charges — This Item"
              value={moneyOrDash(order.delivery_charges)}
            />
            <BreakdownRow
              label="Item Final Amount"
              value={moneyOrDash(order.final_amount)}
              strong
            />
            <BreakdownRow
              label="Tax Amount (API)"
              value={moneyOrDash(order.tax_amount)}
            />
            <BreakdownRow
              label="Commissionable Volume"
              value={moneyOrDash(order.commissionable_volume)}
            />
            <BreakdownRow
              label="Returned Quantity"
              value={order.returned_quantity ?? 0}
            />
            <BreakdownRow
              label="Available for Return / Buyback"
              value={order.available_for_return ?? 0}
            />
            <BreakdownRow
              label="Is Returnable"
              value={maybeValue(order.is_returnable)}
            />
            <BreakdownRow
              label="Cancel Return Allowed"
              value={
                order.is_cancel_return_allowed == null
                  ? "—"
                  : Number(order.is_cancel_return_allowed) === 1
                    ? "Yes"
                    : "No"
              }
            />
            <BreakdownRow
              label="Buyback Enabled"
              value={isBuybackEnabled(order) ? "Yes" : "No"}
            />
            <BreakdownRow
              label="Reviewed"
              value={maybeValue(order.is_reviewed)}
            />
          </BreakdownSection>
        </div>

        <BreakdownSection
          title="Entire Order — All Products"
          subtitle="The API repeats these order totals on each line; displayed once here for clarity"
        >
          {taxLines.length > 0 ? (
            <div className="space-y-2.5">
              {taxLines.map((item, index) => {
                const lineReturn = (order.returns || []).find((r) =>
                  r.items?.some(
                    (ri) => Number(ri.product_id) === Number(item.product_id),
                  ),
                );
                return (
                  <div
                    key={`${item.product_id}-${index}`}
                    className={`rounded-[9px] border p-3.5 ${Number(item.product_id) === Number(order.product_id) ? "border-[#A9B7DA] bg-[#F7F9FF]" : "border-[#E6EAF0] bg-white"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-[#101828]">
                          {item.product_name}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-[#667085]">
                          SKU: {maybeValue(item.product_code)} • Qty:{" "}
                          {item.quantity}
                        </p>
                        {lineReturn && (
                          <p className="mt-1 text-[10.5px] text-[#A9711F]">
                            {prettyStatus(lineReturn.type)}:{" "}
                            {prettyStatus(lineReturn.status)}
                          </p>
                        )}
                        {item.variant_sku && (
                          <p className="text-[10px] text-[#667085]">
                            Variant SKU: {item.variant_sku}
                          </p>
                        )}
                        {item.variant_attributes != null && (
                          <p className="break-all text-[10px] text-[#667085]">
                            Variant:{" "}
                            {typeof item.variant_attributes === "string"
                              ? item.variant_attributes
                              : JSON.stringify(item.variant_attributes)}
                          </p>
                        )}
                      </div>
                      <p className="text-[13px] font-bold text-[#101828]">
                        {moneyOrDash(item.line_total_after_tax)}
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px] text-[#667085] sm:grid-cols-4">
                      <div>
                        Unit:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.unit_price)}
                        </strong>
                      </div>
                      <div>
                        Before discount:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.line_total_before_discount)}
                        </strong>
                      </div>
                      <div>
                        Taxable:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.line_total_after_discount)}
                        </strong>
                      </div>
                      <div>
                        {maybeValue(item.tax_category)} (
                        {maybeValue(item.tax_rate)}%):{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.tax_amount)}
                        </strong>
                      </div>
                      <div>
                        CGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.cgst_amount)}
                        </strong>
                      </div>
                      <div>
                        SGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.sgst_amount)}
                        </strong>
                      </div>
                      <div>
                        IGST:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.igst_amount)}
                        </strong>
                      </div>
                      <div>
                        Shipping:{" "}
                        <strong className="text-[#344054]">
                          {moneyOrDash(item.shipping_charge)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#667085]">
              Full order itemization not provided by the API.
            </p>
          )}
          <div className="mt-4 rounded-[9px] bg-[#FAFBFC] px-3.5 py-2">
            <BreakdownRow
              label="Order Subtotal"
              value={moneyOrDash(taxSummary?.subtotal ?? order.subtotal)}
            />
            {taxSummary?.coupon_discount != null && (
              <BreakdownRow
                label="Coupon Discount"
                value={moneyOrDash(taxSummary.coupon_discount)}
              />
            )}
            {taxSummary?.subtotal_after_discount != null && (
              <BreakdownRow
                label="Subtotal After Discount"
                value={moneyOrDash(taxSummary.subtotal_after_discount)}
              />
            )}
            <BreakdownRow
              label="Total GST / Tax"
              value={moneyOrDash(taxSummary?.total_tax ?? order.total_gst)}
            />
            <BreakdownRow
              label="Total Shipping"
              value={moneyOrDash(
                taxSummary?.shipping_charge ?? order.shipping_charge,
              )}
            />
            <BreakdownRow
              label="Coins Redeemed"
              value={maybeValue(order.coin_redeemed)}
            />
            <BreakdownRow
              label="Coin Value Deducted"
              value={moneyOrDash(order.coin_redeemed_amount)}
            />
            <BreakdownRow
              label="Order Grand Total"
              value={moneyOrDash(
                taxSummary?.grand_total ?? order.total_payable,
              )}
              strong
            />
            <BreakdownRow
              label="Amount Paid"
              value={moneyOrDash(order.amount_paid)}
              strong
              positive={normalizeStatus(order.payment_status) === "paid"}
            />
          </div>
        </BreakdownSection>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="GST / Tax Split"
            subtitle="Tax category and IGST / CGST / SGST as sent by the backend"
          >
            <BreakdownRow
              label="Supplier State"
              value={maybeValue(tax?.supplier_state)}
            />
            <BreakdownRow
              label="Delivery State"
              value={maybeValue(tax?.delivery_state)}
            />
            <BreakdownRow
              label="Total CGST"
              value={moneyOrDash(taxSummary?.total_cgst)}
            />
            <BreakdownRow
              label="Total SGST"
              value={moneyOrDash(taxSummary?.total_sgst)}
            />
            <BreakdownRow
              label="Total IGST"
              value={moneyOrDash(taxSummary?.total_igst)}
            />
            {(tax?.tax_by_category || []).map((category, i) => (
              <div
                key={i}
                className="mt-3 rounded-[8px] border border-[#EDF0F3] bg-[#FAFBFC] p-3"
              >
                <p className="mb-2 text-[11px] font-bold text-[#101828]">
                  {maybeValue(category.tax_category)} @{" "}
                  {maybeValue(category.tax_rate)}%
                </p>
                <BreakdownRow
                  label="Taxable Amount"
                  value={moneyOrDash(category.taxable_amount)}
                />
                <BreakdownRow
                  label="Total Tax"
                  value={moneyOrDash(category.tax_amount)}
                />
                <BreakdownRow
                  label="CGST"
                  value={moneyOrDash(category.cgst_amount)}
                />
                <BreakdownRow
                  label="SGST"
                  value={moneyOrDash(category.sgst_amount)}
                />
                <BreakdownRow
                  label="IGST"
                  value={moneyOrDash(category.igst_amount)}
                />
              </div>
            ))}
            {taxLines.some(
              (line) => Number(line.product_id) === Number(order.product_id),
            ) && (
              <div className="mt-3 rounded-[8px] border border-[#EDF0F3] p-3">
                <p className="mb-2 text-[11px] font-bold">
                  Selected Item&apos;s Tax Rates
                </p>
                {taxLines
                  .filter(
                    (line) =>
                      Number(line.product_id) === Number(order.product_id),
                  )
                  .map((item, i) => (
                    <div key={i}>
                      <BreakdownRow
                        label="GST"
                        value={`${maybeValue(item.tax_rate)}%`}
                      />
                      <BreakdownRow
                        label="CGST"
                        value={`${maybeValue(item.cgst_rate)}% (${moneyOrDash(item.cgst_amount)})`}
                      />
                      <BreakdownRow
                        label="SGST"
                        value={`${maybeValue(item.sgst_rate)}% (${moneyOrDash(item.sgst_amount)})`}
                      />
                      <BreakdownRow
                        label="IGST"
                        value={`${maybeValue(item.igst_rate)}% (${moneyOrDash(item.igst_amount)})`}
                      />
                    </div>
                  ))}
              </div>
            )}
          </BreakdownSection>

          <BreakdownSection
            title="Payment & Invoice"
            subtitle="Gateway, transaction, payment and invoice metadata"
          >
            <BreakdownRow
              label="Payment Gateway"
              value={prettyStatus(order.payment_gateway)}
            />
            <BreakdownRow
              label="Payment Status"
              value={<BreakdownPill status={order.payment_status} />}
            />
            <BreakdownRow
              label="Transaction / Order ID"
              value={maybeValue(order.gateway_transaction_id)}
            />
            <BreakdownRow
              label="Amount Paid — Full Order"
              value={moneyOrDash(order.amount_paid)}
              strong
            />
            <BreakdownRow
              label="Repayment Available"
              value={maybeValue(order.can_repay)}
            />
            <BreakdownRow
              label="Payment Expires At"
              value={formatDate(order.payment_expires_at)}
            />
            <BreakdownRow
              label="Payment Expires In (seconds)"
              value={maybeValue(order.payment_expires_in)}
            />
            <BreakdownRow
              label="Invoice Number"
              value={maybeValue(order.invoice?.invoice_number)}
            />
            <BreakdownRow
              label="Invoice Generated"
              value={formatDate(order.invoice?.generated_at)}
            />
            <BreakdownRow
              label="Shipping Method"
              value={prettyStatus(order.shipping_method)}
            />
            <p className="mt-3 text-[10px] leading-4 text-[#8A92A6]">
              A gateway transaction ID may represent an order ID instead of a
              captured payment ID. The displayed value is unchanged from the
              API.
            </p>
          </BreakdownSection>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection
            title="Return / Buyback & Refund Breakdown"
            subtitle="Amounts from separate API fields are not automatically treated as paid refunds"
          >
            <BreakdownRow
              label="Return Method"
              value={prettyStatus(order.return_method)}
            />
            <BreakdownRow
              label="Return Status (Line)"
              value={<BreakdownPill status={order.return_status} />}
            />
            <BreakdownRow
              label="Delivery Status"
              value={<BreakdownPill status={order.delivery_status} />}
            />
            <BreakdownRow
              label="Return / Buyback Request ID"
              value={maybeValue(matchingReturn?.id)}
            />
            <BreakdownRow
              label="Request Type"
              value={prettyStatus(matchingReturn?.type)}
            />
            <BreakdownRow
              label="Request Status"
              value={<BreakdownPill status={matchingReturn?.status} />}
            />
            <BreakdownRow
              label="Request Item Status"
              value={<BreakdownPill status={matchingItem?.return_status} />}
            />
            <BreakdownRow
              label="Quantity Requested"
              value={maybeValue(matchingItem?.quantity)}
            />
            {matchingItem?.reason && (
              <div className="mt-2 rounded-[8px] bg-[#F8F9FB] p-3">
                <p className="text-[10px] font-bold text-[#667085]">Reason</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[11.5px] leading-5 text-[#344054]">
                  {matchingItem.reason}
                </p>
              </div>
            )}
            <div className="mt-3 rounded-[8px] border border-[#E7EBF0] p-3">
              <p className="mb-2 text-[10.5px] font-bold text-[#344054]">
                Backend Refund Calculation Fields
              </p>
              <BreakdownRow
                label="Return Refund Subtotal"
                value={moneyOrDash(matchingReturn?.refund_subtotal)}
              />
              <BreakdownRow
                label="Return Refund Tax"
                value={moneyOrDash(matchingReturn?.refund_tax)}
              />
              <BreakdownRow
                label="Return Refund Line Total"
                value={moneyOrDash(matchingReturn?.refund_line_total)}
              />
              <BreakdownRow
                label="Return Refund Shipping"
                value={moneyOrDash(matchingReturn?.refund_shipping)}
              />
              <BreakdownRow
                label="Return Total Refund Amount"
                value={moneyOrDash(matchingReturn?.total_refund_amount)}
                strong
              />
              <BreakdownRow
                label="Deducted Shipping Charges"
                value={moneyOrDash(order.deducted_shipping_charges)}
                negative
              />
              <BreakdownRow
                label="Gateway Charges"
                value={moneyOrDash(order.gateway_charges)}
                negative
              />
              <BreakdownRow
                label="Gateway Charges Percent"
                value={
                  order.gateway_charges_percent == null
                    ? "—"
                    : `${order.gateway_charges_percent}%`
                }
              />
              <BreakdownRow
                label="Total Returnable (API)"
                value={moneyOrDash(order.total_returnable_amount)}
                strong
              />
              <BreakdownRow
                label="Actual Refunded Amount"
                value={moneyOrDash(order.refunded_amount)}
                strong
                positive={actualRefund !== null}
              />
              <BreakdownRow
                label="Refund Processing Status"
                value={<BreakdownPill status={matchingReturn?.refund_status} />}
              />
              <BreakdownRow
                label="Refund Processed At"
                value={formatDate(matchingReturn?.refund_processed_at)}
              />
            </div>
            {refundDetails?.amount != null && (
              <div className="mt-3 rounded-[8px] border border-[#CFE8DA] bg-[#F2FAF5] px-3.5 py-3">
                <p className="text-[10px] font-bold text-[#397658]">
                  {actualRefund !== null
                    ? "Refunded Amount Reported by API"
                    : "Processed Refund (Return Record)"}
                </p>
                <p className="mt-0.5 text-[19px] font-bold text-[#18794E]">
                  {formatCurrency(refundDetails.amount)}
                </p>
                {refundDetails.issuedAt && (
                  <p className="text-[10px] text-[#397658]">
                    {formatDate(refundDetails.issuedAt)}
                  </p>
                )}
              </div>
            )}
            {matchingReturn?.rejection_reason && (
              <p className="mt-3 rounded-[8px] bg-[#FEF3F2] p-3 text-[11px] text-[#B42318]">
                Rejection reason: {matchingReturn.rejection_reason}
              </p>
            )}
            {matchingReturn?.admin_notes && (
              <p className="mt-2 rounded-[8px] bg-[#F2F4F7] p-3 text-[11px] text-[#475467]">
                Admin notes: {matchingReturn.admin_notes}
              </p>
            )}
            {!matchingReturn && (order.returns || []).length > 0 && (
              <p className="mt-3 rounded-[8px] bg-[#FFF9E9] p-3 text-[10.5px] leading-4 text-[#875B16]">
                This order has a return record, but it belongs to another item.
                It is not counted as a return or refund of this selected
                product.
              </p>
            )}
          </BreakdownSection>

          <BreakdownSection
            title="Credit Notes"
            subtitle="Credit notes from this line; mismatched references are clearly flagged"
          >
            {noteList.length ? (
              noteList.map((note) => {
                const belongs = matchingNotes.some(
                  (linkedNote) => linkedNote.id === note.id,
                );
                return (
                  <div
                    key={note.id}
                    className="mb-3 rounded-[9px] border border-[#E6EAF0] p-3.5 last:mb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-all text-[12px] font-bold text-[#101828]">
                        {note.credit_note_number}
                      </p>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${belongs ? "bg-[#EAF7EF] text-[#18794E]" : "bg-[#FFF4E5] text-[#A9711F]"}`}
                      >
                        {belongs ? "Reference matches" : "Reference mismatch"}
                      </span>
                    </div>
                    <BreakdownRow label="Credit Note ID" value={note.id} />
                    <BreakdownRow
                      label="Amount"
                      value={moneyOrDash(note.amount)}
                      strong
                    />
                    <BreakdownRow
                      label="Original Invoice Reference"
                      value={note.original_invoice_number}
                    />
                    <BreakdownRow
                      label="Issued At"
                      value={formatDate(note.issued_at)}
                    />
                    <BreakdownRow
                      label="Download Endpoint (API)"
                      value={
                        <span className="break-all text-[10px]">
                          {note.download_url || "—"}
                        </span>
                      }
                    />
                    {!belongs && (
                      <p className="mt-2 text-[10.5px] leading-4 text-[#A9711F]">
                        This note references a different order/invoice. Verify
                        its association in the backend before using it as proof
                        of this line&apos;s refund.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-[11.5px] text-[#667085]">
                No credit note is attached to this product line.
              </p>
            )}
            <p className="mt-2 text-[10px] leading-4 text-[#8A92A6]">
              Download endpoints are displayed as returned by the API. They are
              not transformed into potentially incorrect frontend URLs.
            </p>
          </BreakdownSection>
        </div>

        <BreakdownSection
          title="Order Timeline"
          subtitle="All populated order, delivery, return and buyback milestones"
        >
          <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            {timelineEntries
              .filter((event) => Boolean(order.timeline?.[event.key]))
              .map((event) => (
                <div
                  key={event.key}
                  className="flex gap-2.5 border-b border-dashed border-[#EDF0F3] py-3 last:border-b-0"
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.negative ? "bg-[#D92D20]" : "bg-[#1F9D6B]"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-semibold text-[#344054]">
                      {event.label}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-[#667085]">
                      {formatDate(order.timeline[event.key])}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          {order.timeline?.return_applicable_till && (
            <div className="mt-3 rounded-[8px] border border-[#E3E9F5] bg-[#F5F8FF] px-3 py-2.5 text-[11.5px] text-[#344054]">
              <span className="font-bold">Return Applicable Till:</span>{" "}
              {formatDate(order.timeline.return_applicable_till)}
            </div>
          )}
        </BreakdownSection>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BreakdownSection title="Billing & Delivery Addresses">
            <div className="space-y-3">
              <AddressBreakdown
                title="Billing Address"
                address={order.billing_address}
              />
              <AddressBreakdown
                title="Delivery Address"
                address={order.delivery_address}
              />
            </div>
          </BreakdownSection>
          <BreakdownSection title="Customer / Distributor Information">
            <BreakdownRow label="User ID" value={maybeValue(order.user?.id)} />
            <BreakdownRow label="Name" value={maybeValue(order.user?.name)} />
            <BreakdownRow label="Email" value={maybeValue(order.user?.email)} />
            <BreakdownRow label="Phone" value={maybeValue(order.user?.phone)} />
            <BreakdownRow
              label="Distributor Account"
              value={maybeValue(order.user?.is_distributor)}
            />
            <BreakdownRow
              label="Return Method"
              value={prettyStatus(order.return_method)}
            />
          </BreakdownSection>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-[#E6EAF0] bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[7px] bg-black px-5 py-2.5 text-[11.5px] font-semibold text-white hover:bg-neutral-800"
        >
          Close Details
        </button>
      </div>
    </ModalShell>
  );
};
