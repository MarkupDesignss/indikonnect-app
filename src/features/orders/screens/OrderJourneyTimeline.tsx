"use client";

import type { ComponentType } from "react";
import {
    Check, Circle, Clock3, Package, BadgeCheck, Barcode, ClipboardCheck,
    Truck, Route, MapPin, House, AlertTriangle,
} from "lucide-react";
import type { IndiaPostOrderTrackingData } from "@/lib/redux/api/indiaPostTrackingApi";

type OrderLike = Record<string, any> | null | undefined;
type Stage = { label: string; description: string; icon: ComponentType<{ className?: string }> };

/**
 * All stages remain visible, but milestones only turn green when backed by order
 * dates or linked carrier state. Never interpret AWB allocation/submission as pickup.
 * India Post returned-to-sender is NOT customer delivery.
 */
const STAGES: Stage[] = [
    { label: "Order Placed", description: "Order received by IndieKonnect", icon: Package },
    { label: "Order Confirmed", description: "Payment verified and order confirmed", icon: BadgeCheck },
    { label: "Tracking Number Assigned", description: "India Post AWB linked to your order", icon: Barcode },
    { label: "Courier Booked", description: "India Post booking confirmed", icon: ClipboardCheck },
    { label: "Picked Up / Dispatched", description: "Parcel physically received by India Post", icon: Truck },
    { label: "In Transit", description: "Parcel is moving through the postal network", icon: Route },
    { label: "Out for Delivery", description: "Delivery agent is taking the parcel to you", icon: MapPin },
    { label: "Delivered", description: "India Post confirmed delivery to the addressee", icon: House },
];

function statusValue(value: unknown): string {
    return String(value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function dateText(raw: unknown): string | null {
    if (!raw || typeof raw !== "string") return null;
    // Laravel MySQL DATETIME is used as local India time, not browser-local time.
    const value = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(raw)
        ? raw.replace(" ", "T") + "+05:30" : raw;
    const dt = new Date(value);
    if (Number.isNaN(dt.valueOf())) return null;
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    }).format(dt);
}

function carrierStage(status: string): number {
    // Statuses are persisted by the protected Node.js adapter after DoP events.
    switch (status) {
        case "delivered": return 7;
        case "out_for_delivery": return 6;
        case "in_transit": return 5;
        case "picked_up": return 4;
        case "booked": return 3;
        // 'submitted' only proves an API submission, not carrier acceptance.
        case "submitted":
        case "pickup_requested":
        case "pickup_cancelled":
        case "on_hold":
        case "event_received":
        case "unknown":
        case "needs_reconciliation":
        case "rejected":
        case "return_in_transit":
        case "returned_to_sender": return 2;
        default: return 2;
    }
}

function carrierMessage(status: string): string {
    const labels: Record<string, string> = {
        submitted: "Booking submitted to India Post; acceptance is pending",
        booked: "Courier booking confirmed; physical pickup is pending",
        pickup_requested: "Pickup requested; no handover confirmed yet",
        picked_up: "Parcel picked up by India Post",
        in_transit: "Parcel is in transit",
        out_for_delivery: "Parcel is out for delivery",
        delivered: "Parcel delivered to the addressee",
        on_hold: "Shipment is on hold — action may be required",
        pickup_cancelled: "Courier pickup was cancelled",
        return_in_transit: "Parcel is returning to the sender",
        returned_to_sender: "Returned to sender — not delivered to customer",
        rejected: "Booking was rejected — contact support",
        unknown: "Booking outcome needs verification",
        needs_reconciliation: "Booking outcome requires reconciliation",
    };
    return labels[status] ?? "Tracking update pending from India Post";
}

export default function OrderJourneyTimeline({
    order,
    tracking,
}: {
    order: OrderLike;
    tracking: IndiaPostOrderTrackingData | null;
}) {
    const timeline = order?.timeline ?? {};
    const orderStatus = statusValue(order?.order_status ?? order?.delivery_status);
    const canceled = ["cancelled", "refunded", "returned"].includes(orderStatus);
    const placedDate = timeline.order_placed || order?.order_date;
    const confirmedDate = timeline.order_confirmed || order?.confirmed_date;
    const confirmed = Boolean(confirmedDate) || [
        "confirmed", "dispatched", "shipped", "delivered",
    ].includes(orderStatus);

    const shipments = Array.isArray(tracking?.shipments) ? tracking!.shipments : [];
    const validAwb = (v: unknown) => typeof v === "string" && /^[A-Z]{2}\d{9}IN$/.test(v.toUpperCase());
    const assignedAwb = validAwb(tracking?.allocated_awb)
        ? String(tracking?.allocated_awb).toUpperCase()
        : shipments.find((s) => validAwb(s.barcode))?.barcode ?? null;
    // This integration is one package per order; still avoid claiming entire
    // multi-parcel order delivered if even one returned, delayed, or unverified.
    const stages = shipments.map((s) => carrierStage(statusValue(s.status)));
    const courierStage = stages.length ? Math.min(...stages) : assignedAwb ? 2 : -1;
    const furthest = canceled ? Math.min(confirmed ? 1 : 0, 1)
        : courierStage >= 0 ? Math.max(confirmed ? 1 : 0, courierStage)
            : confirmed ? 1 : 0;
    const activeStage = Math.max(0, Math.min(7, furthest));

    const hasException = shipments.some((s) => [
        "on_hold", "pickup_cancelled", "return_in_transit", "returned_to_sender",
        "rejected", "unknown", "needs_reconciliation",
    ].includes(statusValue(s.status)));

    const latest = shipments[0];
    const latestStatus = statusValue(latest?.status);
    const currentLabel = canceled
        ? "Order cancelled / returned"
        : hasException ? carrierMessage(latestStatus)
            : shipments.length && latestStatus === "submitted"
                ? "India Post booking submitted — awaiting confirmation"
                : shipments.length ? carrierMessage(latestStatus)
                    : assignedAwb ? "Tracking number assigned — India Post booking pending"
                        : confirmed ? "Confirmed — preparing for dispatch"
                            : "Order received — confirmation pending";

    const dates: (unknown | null)[] = [
        placedDate, confirmedDate, null, null,
        null,
        null,
        null,
        // Do NOT use Laravel master 'delivered_at' as courier confirmation; it may
        // be manually set or unsynced. India Post linked status is authoritative.
        null,
    ];

    const shipDateFor = (stage: number) => {
        if (!shipments.length) return null;
        // A latest_event_at timestamp belongs only to the currently reported
        // carrier milestone; do not fabricate dates for earlier scans.
        if (carrierStage(latestStatus) === stage) return latest?.latest_event_at;
        return null;
    };

    return (
        <section className="space-y-4" aria-label="Complete order to delivery journey">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-slate-900">Order to Delivery Journey</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                        {Math.max(0, activeStage + 1)} / {STAGES.length} milestones
                    </span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-slate-600">{currentLabel}</p>
                {order?.payment_status && (
                    <p className="mt-1 text-[10px] text-slate-500">
                        Payment: <span className="font-semibold capitalize">{String(order.payment_status)}</span>
                    </p>
                )}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${((activeStage + 1) / STAGES.length) * 100}%` }} />
                </div>
            </div>

            {(hasException || canceled) && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{canceled ? "Order is cancelled or returned. The normal delivery route will not continue." :
                        `${currentLabel}. Please contact support if this status is unexpected.`}</span>
                </div>
            )}

            <ol className="space-y-0">
                {STAGES.map((step, index) => {
                    const reached = !canceled && index <= activeStage;
                    const actualFirst = index === 0 && Boolean(placedDate || order?.order_id);
                    const actualSecond = index === 1 && confirmed;
                    const done = canceled ? (index === 0 ? actualFirst : index === 1 && actualSecond)
                        : index === 0 ? actualFirst : index === 1 ? actualSecond : reached;
                    const current = !canceled && index === activeStage;
                    const Icon = step.icon;
                    const stamp = index >= 4 ? shipDateFor(index) : dates[index];
                    const formattedStamp = dateText(stamp);
                    return (
                        <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                            {index < STAGES.length - 1 && (
                                <span className={`absolute left-[15px] top-8 h-[calc(100%-22px)] w-0.5 ${done && index < activeStage ? "bg-emerald-300" : "bg-slate-200"}`} />
                            )}
                            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-emerald-600 bg-emerald-600 text-white" :
                                    current ? "border-indigo-600 bg-indigo-50 text-indigo-700" :
                                        "border-slate-200 bg-white text-slate-400"
                                }`}>
                                {done ? <Check className="h-4 w-4" /> : current ? <Icon className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                            </span>
                            <div className={`min-w-0 flex-1 rounded-lg px-1.5 py-1 ${current && !done ? "bg-indigo-50" : ""}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-[12px] font-semibold ${done ? "text-slate-900" : "text-slate-500"}`}>{step.label}</p>
                                    {current && !canceled && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-700">Latest milestone</span>}
                                    {!done && !current && <span className="text-[10px] text-slate-400">Pending</span>}
                                </div>
                                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{step.description}</p>
                                {formattedStamp && done && <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                                    <Clock3 className="h-3 w-3" />{formattedStamp}
                                </p>}
                                {index === 2 && assignedAwb && (
                                    <>
                                        <p className="mt-1 break-all font-mono text-[11px] font-semibold text-slate-800">AWB: {assignedAwb}</p>
                                        {!shipments.length && (
                                            <p className="mt-0.5 text-[10px] text-amber-700">Allocated — India Post booking pending</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            <p className="rounded-lg border border-slate-200 bg-white p-3 text-[10px] leading-5 text-slate-500">
                Future stages are shown as pending, not completed. Booking submission does not mean courier pickup.
                Delivery is shown only when the linked India Post shipment reports <b>delivered to the addressee</b>.
                The detailed carrier scan history, office and timestamps appear below.
            </p>
        </section>
    );
}
