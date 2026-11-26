"use client";

import { motion } from "framer-motion";
import { Truck, X, RotateCcw, Loader2 } from "lucide-react";
import OrderJourneyTimeline from "@/features/orders/screens/OrderJourneyTimeline";
import { type IndiaPostOrderTrackingData } from "@/lib/redux/api/indiaPostTrackingApi";
import { indiaPostEventLabel } from "@/features/orders/screens/order.parts/support";


export function TrackModal({
  isOpen,
  onClose,
  order,
  tracking,
  loading,
  loadFailed,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  tracking: IndiaPostOrderTrackingData | null;
  loading: boolean;
  loadFailed: boolean;
  onRefresh: () => void;
}) {
  if (!isOpen) return null;

  const shipments = tracking?.shipments ?? [];
  const hasEvents = shipments.some((s) => s.events.length > 0);
  const formatEventDate = (value: string | null | undefined) => {
    if (!value) return "Date unavailable";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Date unavailable";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 font-sans backdrop-blur-[2px] sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[14px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E6E6E4] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-[#111111] text-white">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-[#171717]">
                Order Tracking
              </h3>
              <p className="truncate text-[10px] text-[#888888]">
                Order # {order?.order_reference || order?.order_id || "N/A"}
              </p>
              {order?.product_name && (
                <p className="mt-0.5 max-w-[230px] truncate text-[10px] text-[#555555]">
                  {order.product_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh India Post tracking"
              title="Refresh India Post tracking"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#555555] hover:bg-[#F8F8F8] disabled:opacity-50"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tracking"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] hover:text-[#111111]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="mb-5">
            <OrderJourneyTimeline order={order} tracking={tracking} />
          </div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-[#171717]">
              India Post Shipment Updates
            </h4>
            {loading && (
              <span className="flex items-center gap-1 text-[10px] text-[#888888]">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking...
              </span>
            )}
          </div>

          {loadFailed && !loading && (
            <div className="mb-4 rounded-[7px] border border-[#EFE2C6] bg-[#FFFBF2] p-3 text-[11px] leading-5 text-[#795F25]">
              Live courier tracking is temporarily unavailable. Your order
              updates are still shown below.
            </div>
          )}

          {!loadFailed && !loading && shipments.length === 0 && (
            <div className="mb-4 rounded-[7px] border border-[#ECECE9] bg-[#FAFAF9] px-3 py-3 text-[11px] leading-5 text-[#777777]">
              {tracking?.allocated_awb ? (
                <>
                  <p className="text-[#333333]">
                    India Post tracking number assigned:
                  </p>
                  <p className="mt-1 break-all font-mono text-[12px] font-semibold text-[#171717]">
                    {tracking.allocated_awb}
                  </p>
                  <p className="mt-1">
                    Courier booking pending. Movement updates will appear after
                    India Post accepts the shipment and scans it.
                  </p>
                </>
              ) : (
                "India Post tracking will appear here after a tracking number is allocated."
              )}
            </div>
          )}

          {tracking?.warning && !loading && (
            <div className="mb-3 rounded-[7px] border border-[#EFE2C6] bg-[#FFFBF2] p-3 text-[11px] text-[#795F25]">
              {tracking.warning}
            </div>
          )}

          {shipments.map((shipment) => (
            <div
              key={shipment.barcode}
              className="mb-4 overflow-hidden rounded-[9px] border border-[#E6E6E4]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECECE9] bg-[#FAFAF9] px-3.5 py-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[.06em] text-[#888888]">
                    India Post tracking number
                  </p>
                  <p className="mt-0.5 break-all font-mono text-[12px] font-semibold text-[#171717]">
                    {shipment.barcode}
                  </p>
                </div>
                <p className="text-[10px] font-medium text-[#555555]">
                  {shipment.latest_event || "Tracking updates pending"}
                </p>
              </div>
              {shipment.events.length ? (
                <div className="px-3.5 py-3">
                  {shipment.events.map((event, index) => (
                    <div
                      key={`${shipment.barcode}-${index}-${event.date ?? ""}`}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      {index < shipment.events.length - 1 && (
                        <div className="absolute left-[5px] top-[13px] h-[calc(100%-7px)] w-px bg-[#E6E6E4]" />
                      )}
                      <div
                        className={`relative z-10 mt-1 h-3 w-3 flex-shrink-0 rounded-full ${index === 0 ? "bg-[#3F765A]" : "bg-[#B6B6B6]"} ring-[3px] ring-white`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-[#171717]">
                          {indiaPostEventLabel(event.event)}
                        </p>
                        {event.office && (
                          <p className="mt-0.5 text-[10px] text-[#555555]">
                            {event.office}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-[#888888]">
                          {formatEventDate(event.date)}
                        </p>
                        {event.remarks && (
                          <p className="mt-0.5 text-[10px] text-[#888888]">
                            {event.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3.5 py-3 text-[11px] text-[#888888]">
                  No movement events have been reported for this tracking number
                  yet.
                </p>
              )}
            </div>
          ))}

          {!loading &&
            shipments.length > 0 &&
            !hasEvents &&
            !tracking?.warning && (
              <p className="mb-4 text-[10px] text-[#888888]">
                India Post events become available after the first physical
                scan.
              </p>
            )}
        </div>
        <div className="flex-shrink-0 border-t border-[#ECECE9] bg-[#FAFAF9] px-4 py-3 text-[10px] text-[#888888] sm:px-5">
          Tracking events are supplied by India Post and may take time to
          update.
        </div>
      </motion.div>
    </motion.div>
  );
}
