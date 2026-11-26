"use client";

import { X, AlertCircle, Loader2, Truck, RefreshCcw } from "lucide-react";
import OrderJourneyTimeline from "@/features/orders/screens/OrderJourneyTimeline";
import { ModalShell, OrderLineItem, TRACKING_STEPS, TrackingModalProps, formatDate, formatIndiaPostTime, formatStatusLabel, indiaPostEventLabel, normalizeStatus } from "@/features/distributor/routes/order-history/OrderHistory.parts/support";


export const TrackingModal = ({
  isOpen,
  onClose,
  order,
  tracking,
  loading,
  loadFailed,
  loadErrorMessage,
  onRefresh,
}: TrackingModalProps) => {
  if (!isOpen || !order) return null;

  const timeline = order.timeline || ({} as OrderLineItem["timeline"]);
  const shipments = Array.isArray(tracking?.shipments)
    ? tracking.shipments
    : [];
  const returnSteps = TRACKING_STEPS.filter(
    (step) => step.group === "return" && !!timeline[step.key],
  );
  const legacyShippingSteps = TRACKING_STEPS.filter(
    (step) =>
      step.group === "forward" &&
      ["dispatched_at", "shipped_at", "delivered_at"].includes(step.key) &&
      !!timeline[step.key],
  );

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E6E6E4] px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#171717]">
              Track Shipment
            </h3>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {order.product_name} · {order.order_reference}
              {order.line_id ? ` · Item #${order.line_id}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh India Post tracking"
            title="Refresh India Post tracking"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        {/* Same 8-stage component already used by the customer portal. */}
        <OrderJourneyTimeline order={order} tracking={tracking} />

        {loading && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600"
          >
            <Loader2 className="h-4 w-4 animate-spin" /> Fetching the latest
            India Post tracking details...
          </div>
        )}

        {loadFailed && !loading && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900"
          >
            {loadErrorMessage ||
              "Courier tracking is temporarily unavailable. You can try Refresh again."}
            <p className="mt-1">Order history is still available below.</p>
          </div>
        )}

        <section aria-label="India Post shipment updates">
          <h4 className="mb-3 text-[12px] font-bold text-slate-800">
            India Post Shipment Updates
          </h4>

          {!loading && !loadFailed && shipments.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">
              {tracking?.allocated_awb ? (
                <>
                  <p>Tracking number assigned</p>
                  <p className="mt-1 break-all font-mono text-[13px] font-semibold text-slate-900">
                    {tracking.allocated_awb}
                  </p>
                  <p className="mt-1">
                    India Post booking is pending. Scan events appear only after
                    the carrier processes the shipment.
                  </p>
                </>
              ) : tracking && "allocations" in tracking &&
                Array.isArray(tracking.allocations) && tracking.allocations.length > 0 ? (
                <>
                  <p>Tracking numbers assigned</p>
                  {tracking.allocations.map((allocation: { barcode: string }) => (
                    <p key={allocation.barcode} className="mt-1 break-all font-mono text-[13px] font-semibold text-slate-900">
                      {allocation.barcode}
                    </p>
                  ))}
                  <p className="mt-1">Awaiting courier booking confirmation.</p>
                </>
              ) : (
                <p>
                  A tracking number has not been assigned yet. India Post scans
                  will appear here when available.
                </p>
              )}
            </div>
          )}

          {tracking?.warning && !loading && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
              {tracking.warning}
            </div>
          )}

          {shipments.map((shipment) => (
            <div
              key={shipment.barcode}
              className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">India Post AWB</p>
                  <p className="break-all font-mono text-[12px] font-bold text-slate-900">
                    {shipment.barcode}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium capitalize text-slate-700">
                  {normalizeStatus(shipment.status) === "submitted"
                    ? "Awaiting courier confirmation"
                    : formatStatusLabel(shipment.status || "pending")}
                </span>
              </div>
              {shipment.latest_event && (
                <p className="px-3.5 pt-3 text-[11px] font-medium text-slate-700">
                  {indiaPostEventLabel(shipment.latest_event)}
                  {shipment.latest_event_at && (
                    <span className="ml-2 text-[10px] font-normal text-slate-500">
                      {formatIndiaPostTime(shipment.latest_event_at)}
                    </span>
                  )}
                </p>
              )}
              {shipment.events.length > 0 ? (
                <ol className="space-y-3 px-3.5 py-3">
                  {shipment.events.map((event, i) => (
                    <li
                      key={`${shipment.barcode}-${i}-${event.date ?? ""}`}
                      className="flex gap-2.5"
                    >
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? "bg-emerald-600" : "bg-slate-300"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-800">
                          {indiaPostEventLabel(event.event)}
                        </p>
                        {event.office && (
                          <p className="mt-0.5 text-[10px] text-slate-600">
                            {event.office}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {formatIndiaPostTime(event.date)}
                        </p>
                        {event.remarks && (
                          <p className="mt-0.5 text-[10px] leading-4 text-slate-600">
                            {event.remarks}
                          </p>
                        )}
                        {event.rts && (
                          <p className="mt-1 text-[10px] font-semibold text-amber-700">
                            Return-to-sender event
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="px-3.5 py-3 text-[11px] text-slate-500">
                  No courier movement scans have been reported yet.
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Preserve old Laravel order state and return/refund milestones. */}
        {(timeline.cancelled_at ||
          returnSteps.length > 0 ||
          legacyShippingSteps.length > 0) && (
            <section
              className="rounded-xl border border-slate-200 bg-white p-3.5"
              aria-label="IndieKonnect system order history"
            >
              <h4 className="text-[12px] font-bold text-slate-800">
                IndieKonnect Order History
              </h4>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Internal order and return records; may differ from carrier scan
                history.
              </p>
              <div className="mt-3 space-y-3">
                {timeline.cancelled_at && (
                  <div className="flex gap-2 text-[11px] text-red-700">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Order cancelled</p>
                      <p>{formatDate(timeline.cancelled_at)}</p>
                    </div>
                  </div>
                )}
                {[...legacyShippingSteps, ...returnSteps].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.key}
                      className="flex gap-2 text-[11px] text-slate-700"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <div>
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-slate-500">
                          {formatDate(timeline[step.key])}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
      </div>
      <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-3 text-[10px] text-slate-500 sm:px-6">
        All shipment stages depend on verified India Post events. AWB allocation
        does not mean booking or pickup.
      </div>
    </ModalShell>
  );
};
