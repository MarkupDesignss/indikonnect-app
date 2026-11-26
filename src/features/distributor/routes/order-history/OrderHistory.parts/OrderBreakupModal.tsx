"use client";

import { X, Package } from "lucide-react";
import { useMemo } from "react";
import Image from "next/image";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { BreakupModalProps, BreakupPanel, BreakupRow, ModalShell, OrderLineItem, ReturnRecord, formatCurrency, formatDate, formatStatusLabel, hasAmount, isPaymentFailed, moneyValue, normalizeStatus, showMoney } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const OrderBreakupModal = ({
  isOpen,
  onClose,
  order,
  allOrders = [],
}: BreakupModalProps) => {
  const orderLines = useMemo(() => {
    if (!order) return [];
    const matches = allOrders.filter(
      (line) => Number(line.order_id) === Number(order.order_id),
    );
    return (matches.length ? matches : [order])
      .slice()
      .sort((a, b) => Number(a.line_id) - Number(b.line_id));
  }, [allOrders, order]);

  if (!isOpen || !order) return null;

  const summary = orderLines[0] || order;
  const taxSummary = summary.tax_breakdown?.summary;
  const taxableSubtotal = hasAmount(taxSummary?.subtotal_after_discount)
    ? moneyValue(taxSummary.subtotal_after_discount)
    : hasAmount(summary.subtotal)
      ? moneyValue(summary.subtotal)
      : orderLines.reduce(
        (acc, line) =>
          acc + moneyValue(line.unit_price) * moneyValue(line.quantity),
        0,
      );
  const gstTotal = hasAmount(taxSummary?.total_tax)
    ? moneyValue(taxSummary.total_tax)
    : hasAmount(summary.total_gst)
      ? moneyValue(summary.total_gst)
      : orderLines.reduce((acc, line) => acc + moneyValue(line.gst_amount), 0);
  const shippingTotal = hasAmount(taxSummary?.shipping_charge)
    ? moneyValue(taxSummary.shipping_charge)
    : hasAmount(summary.shipping_charge)
      ? moneyValue(summary.shipping_charge)
      : orderLines.reduce(
        (acc, line) => acc + moneyValue(line.delivery_charges),
        0,
      );
  const discount = moneyValue(taxSummary?.coupon_discount);
  const coinAmount = moneyValue(summary.coin_redeemed_amount);
  const grandTotal = hasAmount(taxSummary?.grand_total)
    ? moneyValue(taxSummary.grand_total)
    : hasAmount(summary.total_payable)
      ? moneyValue(summary.total_payable)
      : taxableSubtotal + gstTotal + shippingTotal - coinAmount;
  const taxCategories = Array.isArray(summary.tax_breakdown?.tax_by_category)
    ? summary.tax_breakdown.tax_by_category
    : [];
  const uniqueReturns = Array.from(
    new Map(
      orderLines
        .flatMap((l) => l.returns || [])
        .map((r: ReturnRecord) => [r.id, r]),
    ).values(),
  );
  const creditNotes = Array.from(
    new Map(
      orderLines
        .flatMap((l) => l.credit_notes || [])
        .map((c: any) => [c.id, c]),
    ).values(),
  );
  const paymentCompleted = normalizeStatus(summary.payment_status) === "paid";
  const paymentFailed = isPaymentFailed(summary);
  const actualRefunds = orderLines.filter((l) => hasAmount(l.refunded_amount));
  const totalActualRefund = actualRefunds.reduce(
    (sum, l) => sum + moneyValue(l.refunded_amount),
    0,
  );
  const rowTax = (line: OrderLineItem) => {
    const item = Array.isArray(line.tax_breakdown?.items)
      ? line.tax_breakdown.items.find(
        (v: any) => Number(v.product_id) === Number(line.product_id),
      )
      : null;
    return item;
  };
  const timelineLabels: Array<[string, string]> = [
    ["order_placed", "Order placed"],
    ["order_confirmed", "Order confirmed"],
    ["dispatched_at", "Dispatched"],
    ["shipped_at", "Shipped"],
    ["delivered_at", "Delivered"],
    ["cancelled_at", "Cancelled"],
    ["return_requested_at", "Return requested"],
    ["return_approved_at", "Return approved"],
    ["return_rejected_at", "Return rejected"],
    ["return_completed_at", "Return completed"],
    ["buyback_requested_at", "Buyback requested"],
    ["buyback_approved_at", "Buyback approved"],
    ["buyback_rejected_at", "Buyback rejected"],
    ["buyback_refunded_at", "Buyback refunded"],
  ];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E8EBF0] bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DDE7F4] bg-[#F1F6FC] text-[#315B87]">
            <LuReceiptIndianRupee size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#161E2E] sm:text-[18px]">
              Order details & price breakdown
            </h3>
            <p className="mt-0.5 break-all text-[10.5px] text-[#858FA0]">
              {order.order_reference} · {orderLines.length} product
              {orderLines.length === 1 ? "" : "s"} ·{" "}
              {formatDate(order.order_date)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close order details"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E4E8EF] bg-white text-[#677286] transition hover:bg-[#F5F7FA]"
        >
          <X size={17} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F7F9FC] p-3.5 sm:p-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {[
            { label: "Order total", value: formatCurrency(grandTotal) },
            {
              label: "Amount paid",
              value: formatCurrency(summary.amount_paid),
              tone: paymentCompleted ? "green" : "normal",
            },
            {
              label: "Items",
              value: String(
                orderLines.reduce((n, l) => n + moneyValue(l.quantity), 0),
              ),
            },
            {
              label: "Payment status",
              value: formatStatusLabel(summary.payment_status),
              tone: paymentCompleted
                ? "green"
                : paymentFailed
                  ? "red"
                  : "normal",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-xl border border-[#E5EAF0] bg-white p-3.5"
            >
              <p className="text-[10px] font-medium text-[#8992A2]">
                {item.label}
              </p>
              <p
                className={`mt-2 break-words text-[15px] font-bold tracking-[-0.02em] sm:text-[17px] ${item.tone === "green" ? "text-[#23775A]" : item.tone === "red" ? "text-[#BE4A4A]" : "text-[#182137]"}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <BreakupPanel
          title="Product-wise price breakdown"
          description="Unit price, taxable value, GST and delivery charges for every product"
        >
          <div className="divide-y divide-[#EEF1F4]">
            {orderLines.map((line) => {
              const tax = rowTax(line);
              const taxable =
                moneyValue(line.unit_price) * moneyValue(line.quantity);
              const gst = moneyValue(line.gst_amount);
              const delivery = moneyValue(
                line.delivery_charges ?? tax?.shipping_charge,
              );
              const itemTotal = hasAmount(line.final_amount)
                ? moneyValue(line.final_amount)
                : moneyValue(line.line_total) + delivery;
              return (
                <div key={line.line_id} className="py-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E9ECF2] bg-[#FAFBFC]">
                      {line.primary_image ? (
                        <Image
                          src={line.primary_image}
                          alt={line.product_name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={18} className="text-[#A7B0BD]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[12.5px] font-semibold leading-5 text-[#202B3E]">
                        {line.product_name}
                      </h5>
                      <p className="mt-0.5 break-all text-[10px] text-[#939CAC]">
                        {line.product_code} ·{" "}
                        {line.item_reference_id ?? `Line #${line.line_id}`}
                      </p>
                      <span className="mt-1.5 inline-flex rounded-md bg-[#F0F4FA] px-2 py-0.5 text-[10px] font-semibold text-[#45627E]">
                        {formatStatusLabel(line.delivery_status)}
                      </span>
                    </div>
                    <span className="shrink-0 text-right text-[13px] font-bold text-[#1B2C42]">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2 rounded-xl bg-[#F9FAFC] p-3 sm:grid-cols-4">
                    {[
                      ["Unit price", formatCurrency(line.unit_price)],
                      ["Quantity", String(line.quantity)],
                      ["Taxable amount", formatCurrency(taxable)],
                      ["GST rate", `${line.gst_rate ?? 0}%`],
                      ["GST amount", formatCurrency(gst)],
                      ["After GST", formatCurrency(line.line_total)],
                      ["Shipping", formatCurrency(delivery)],
                      ["Item payable", formatCurrency(itemTotal)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[10px] text-[#8B94A4]">{label}</p>
                        <p className="mt-0.5 break-words text-[11.5px] font-semibold tabular-nums text-[#27364C]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {tax && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#748094]">
                      <span>CGST: {formatCurrency(tax.cgst_amount)}</span>
                      <span>SGST: {formatCurrency(tax.sgst_amount)}</span>
                      <span>IGST: {formatCurrency(tax.igst_amount)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </BreakupPanel>

        <div className="grid gap-4 md:grid-cols-2">
          <BreakupPanel
            title="Order amount summary"
            description="Full order totals (not repeated per product)"
          >
            <BreakupRow
              label="Product subtotal (before GST)"
              value={formatCurrency(taxableSubtotal + discount)}
            />
            {discount > 0 && (
              <BreakupRow
                label="Coupon discount"
                value={`− ${formatCurrency(discount)}`}
                negative
              />
            )}
            <BreakupRow
              label="Taxable subtotal"
              value={formatCurrency(taxableSubtotal)}
            />
            <BreakupRow label="GST / tax" value={formatCurrency(gstTotal)} />
            <BreakupRow
              label="Delivery / shipping"
              value={formatCurrency(shippingTotal)}
            />
            <BreakupRow
              label={`Coins redeemed (${summary.coin_redeemed ?? 0})`}
              value={
                coinAmount > 0
                  ? `− ${formatCurrency(coinAmount)}`
                  : formatCurrency(0)
              }
            />
            <BreakupRow
              label="Total payable"
              value={formatCurrency(grandTotal)}
              emphasized
            />
            <BreakupRow
              label="Amount paid"
              value={formatCurrency(summary.amount_paid)}
            />
          </BreakupPanel>
          <BreakupPanel
            title="Tax breakdown"
            description="GST category, interstate/intrastate split and location"
          >
            {taxCategories.length > 0 ? (
              taxCategories.map((tax: any, index: number) => (
                <div
                  key={index}
                  className="border-b border-[#F0F2F5] py-1 last:border-0"
                >
                  <BreakupRow
                    label={`${tax.tax_category || "GST"} (${tax.tax_rate ?? 0}%) taxable`}
                    value={formatCurrency(tax.taxable_amount)}
                  />
                  <BreakupRow
                    label="CGST"
                    value={formatCurrency(tax.cgst_amount)}
                  />
                  <BreakupRow
                    label="SGST"
                    value={formatCurrency(tax.sgst_amount)}
                  />
                  <BreakupRow
                    label="IGST"
                    value={formatCurrency(tax.igst_amount)}
                  />
                  <BreakupRow
                    label="Tax total"
                    value={formatCurrency(tax.tax_amount)}
                    emphasized
                  />
                </div>
              ))
            ) : (
              <BreakupRow label="Total GST" value={formatCurrency(gstTotal)} />
            )}
            <BreakupRow
              label="Supplier state"
              value={summary.tax_breakdown?.supplier_state || "—"}
            />
            <BreakupRow
              label="Delivery state"
              value={summary.tax_breakdown?.delivery_state || "—"}
            />
          </BreakupPanel>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <BreakupPanel title="Payment & invoice information">
            <BreakupRow
              label="Payment gateway"
              value={formatStatusLabel(summary.payment_gateway)}
            />
            <BreakupRow
              label="Payment status"
              value={formatStatusLabel(summary.payment_status)}
            />
            <BreakupRow
              label="Transaction ID"
              value={summary.gateway_transaction_id || "—"}
            />
            <BreakupRow
              label="Invoice number"
              value={summary.invoice?.invoice_number || "Not generated"}
            />
            {summary.invoice?.generated_at && (
              <BreakupRow
                label="Invoice generated"
                value={formatDate(summary.invoice.generated_at)}
              />
            )}
            <BreakupRow
              label="Order status"
              value={formatStatusLabel(summary.order_status)}
            />
            <BreakupRow
              label="Order type"
              value={formatStatusLabel(summary.order_type)}
            />
          </BreakupPanel>
          <BreakupPanel title="Addresses & delivery">
            <div className="py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#8C96A5]">
                Delivery address
              </p>
              <p className="mt-1 text-[11.5px] leading-5 text-[#263247]">
                {summary.delivery_address?.full_address || "Not available"}
              </p>
            </div>
            <div className="border-t border-[#F0F2F5] py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#8C96A5]">
                Billing address
              </p>
              <p className="mt-1 text-[11.5px] leading-5 text-[#263247]">
                {summary.billing_address?.full_address || "Not available"}
              </p>
            </div>
            <BreakupRow
              label="Shipping method"
              value={summary.shipping_method || "Not specified"}
            />
            <BreakupRow
              label="Return method"
              value={summary.return_method || "Not specified"}
            />
          </BreakupPanel>
        </div>

        {creditNotes.length > 0 && (
          <BreakupPanel title="Credit notes">
            {creditNotes.map((n: any) => (
              <div
                key={n.id}
                className="border-b border-[#F0F2F5] py-3 last:border-0"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#293850]">
                    {n.credit_note_number}
                  </span>
                  <span className="text-[12px] font-bold text-[#263247]">
                    {showMoney(n.amount)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#8A94A5]">
                  Original ref: {n.original_invoice_number || "—"} · Issued:{" "}
                  {formatDate(n.issued_at)}
                </p>
                {n.original_invoice_number &&
                  ![
                    summary.order_reference,
                    summary.invoice?.invoice_number,
                  ].includes(n.original_invoice_number) && (
                    <p className="mt-2 text-[10px] text-[#A46938]">
                      This credit note references a different order/invoice.
                      Please verify with support.
                    </p>
                  )}
              </div>
            ))}
          </BreakupPanel>
        )}

      </div>

    </ModalShell>
  );
};
