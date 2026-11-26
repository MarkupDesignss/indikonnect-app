"use client";

import { Package, Truck, CheckCircle, Clock, XCircle, RotateCcw, IndianRupee } from "lucide-react";


/* ============================================================
   STATUS HELPERS
============================================================ */

export const normalizeStatus = (status?: string | null) => {
  if (!status) return "";

  return status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};


/* Only these statuses will appear in the filter dropdown.
   Buyback statuses are intentionally excluded. */
export const ALLOWED_FILTER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "dispatched",
  "partial_delivered",
  "delivered",
  "cancel_pending",
  "cancel_rejected",
  "cancelled",
  "return_initiated",
  "return_pending",
  "return_approved",
  "return_rejected",
  "returned",
  "refunded",
];


export const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  shipped: Truck,
  dispatched: Truck,
  partial_delivered: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  cancel_pending: Clock,
  returned: RotateCcw,
  return_pending: RotateCcw,
  return_approved: RotateCcw,
  refunded: CheckCircle,
};


export const statusColors: Record<string, string> = {
  pending: "text-[#8A6D1F] bg-[#FBF6E4] border-[#E9D48B]",
  confirmed: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  processing: "text-[#5B4FA8] bg-[#F3F1FB] border-[#D8D3F2]",
  shipped: "text-[#5B4FA8] bg-[#F3F1FB] border-[#D8D3F2]",
  dispatched: "text-[#3E5AA8] bg-[#EEF1FB] border-[#CBD5F0]",
  partial_delivered: "text-[#3E5AA8] bg-[#EEF1FB] border-[#CBD5F0]",
  delivered: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
  cancelled: "text-[#B24C4C] bg-[#FDF2F2] border-[#F0CFCF]",
  cancel_pending: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  returned: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  return_pending: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  return_approved: "text-[#A9711F] bg-[#FBF3E4] border-[#EBD9B4]",
  refunded: "text-[#3F765A] bg-[#F1F7F3] border-[#CFE0D4]",
};


export const toDate = (value: string | null | undefined) => {
  if (!value) return null;

  const normalized =
    value.includes(" ") && !value.includes("T")
      ? value.replace(" ", "T")
      : value;

  const d = new Date(normalized);

  return Number.isNaN(d.getTime()) ? null : d;
};


export const formatDate = (dateString: string | null) => {
  const date = toDate(dateString);

  if (!date) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};


export const formatTime = (dateString: string | null) => {
  const date = toDate(dateString);

  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


export const formatPrice = (amount: number) => {
  if (!amount) return "₹0";

  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};


export const getInitials = (name?: string) => {
  if (!name) return "U";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] || ""}${
    parts[parts.length - 1]?.[0] || ""
  }`.toUpperCase();
};


export const getStatusDisplayName = (status: string) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .toString()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


export const getStatusColor = (status: string) =>
  statusColors[normalizeStatus(status)] ||
  "text-[#777777] bg-[#F5F5F5] border-[#E0E0E0]";


export const getStatusIcon = (status: string) =>
  statusIcons[normalizeStatus(status)] || Package;


/* ============================================================
   NORMALIZE ORDERS
   API is order-wise: every order has an `items` array.
   We flatten each item into a "line" (order fields + item fields)
   so existing modals/actions keep working, then group lines
   back under their order for the UI.
============================================================ */

export interface OrderGroup {
  key: string;
  order_id: number;
  order_reference: string;
  order_status: string;
  order_date: string;
  total: number;
  quantity: number;
  representative: any;
  lines: any[];
}


export const normalizeOrders = (records: any[]): OrderGroup[] => {
  if (!Array.isArray(records)) {
    return [];
  }

  const rows: any[] = [];

  records.forEach((record: any) => {
    if (Array.isArray(record?.items)) {
      const { items, ...orderFields } = record;

      items.forEach((item: any) => {
        const row: any = {
          ...orderFields,
          ...item,
          order_id: item.order_id ?? orderFields.order_id,
          returns: item.returns ?? orderFields.returns ?? [],
          credit_notes: item.credit_notes ?? orderFields.credit_notes ?? [],
          product_reviews: item.product_reviews ?? [],
          is_reviewed: item.is_reviewed ?? false,
          is_returned: item.is_returned ?? false,
          timeline: item.timeline || orderFields.timeline || {},
          is_cancel_return_allowed: item.is_cancel_return_allowed ?? 0,
          images: Array.isArray(item.images) ? item.images : [],
          primary_image:
            item.primary_image || item.images?.[0]?.image_url || "",
        };

        delete row.item_reference_id;
        delete row.items;

        rows.push(row);
      });
    } else {
      // Legacy flat line response
      rows.push({
        ...record,
        returns: record.returns || [],
        credit_notes: record.credit_notes || [],
        product_reviews: record.product_reviews || [],
        timeline: record.timeline || {},
        images: record.images || [],
        is_cancel_return_allowed: record.is_cancel_return_allowed ?? 0,
      });
    }
  });

  const grouped = new Map<string, any[]>();

  rows.forEach((row) => {
    const key = String(row.order_id ?? row.order_reference);
    const list = grouped.get(key) || [];

    list.push({
      ...row,
      display_id: `${row.order_id}_${row.line_id}`,
      is_line_cancelled: normalizeStatus(row.delivery_status) === "cancelled",
    });

    grouped.set(key, list);
  });

  const result: OrderGroup[] = Array.from(grouped.entries()).map(
    ([key, lines]) => {
      const sortedLines = [...lines].sort(
        (a, b) => Number(a.line_id || 0) - Number(b.line_id || 0),
      );

      const representative = sortedLines[0];

      const fallbackTotal = sortedLines.reduce(
        (sum, l) => sum + (Number(l.final_amount) || 0),
        0,
      );

      const total =
        Number(representative.total_payable) ||
        Number(representative.amount_paid) ||
        fallbackTotal;

      const quantity = sortedLines.reduce(
        (sum, l) => sum + (Number(l.quantity) || 0),
        0,
      );

      return {
        key,
        order_id: representative.order_id,
        order_reference: representative.order_reference,
        order_status: representative.order_status,
        order_date: representative.order_date,
        total,
        quantity,
        representative,
        lines: sortedLines.map((l) => ({
          ...l,
          final_amount: Number(l.final_amount) || 0,
        })),
      };
    },
  );

  return result.sort(
    (a, b) =>
      (toDate(b.order_date)?.getTime() || 0) -
      (toDate(a.order_date)?.getTime() || 0),
  );
};


/* ============================================================
   REFUND BADGE
============================================================ */

export function RefundBadge({ creditNotes }: { creditNotes: any[] }) {
  if (!creditNotes || !Array.isArray(creditNotes) || creditNotes.length === 0) {
    return null;
  }

  const totalRefund = creditNotes.reduce(
    (sum: number, cn: any) => sum + (Number(cn.amount) || 0),
    0,
  );

  if (totalRefund <= 0) {
    return null;
  }

  return (
    <span className="flex items-center gap-1 rounded-full border border-[#CFE0D4] bg-[#F1F7F3] px-2 py-0.5 text-[9px] font-medium text-[#3F765A]">
      <IndianRupee className="h-2.5 w-2.5" />
      {formatPrice(totalRefund)} Refunded
    </span>
  );
}


/* ============================================================
   ACTION MENU (portal, max z-index, mobile bottom sheet)
============================================================ */

export interface MenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}


export const MAX_Z = 2147483647;

export const MENU_ITEM_HEIGHT = 44;

export const MENU_WIDTH = 210;


/* ============================================================
   TRACK MODAL — EXISTING LARAVEL TIMELINE + LIVE INDIA POST
============================================================ */

export const indiaPostEventLabel = (eventName: string) => {
  const key = String(eventName || "")
    .trim()
    .toLowerCase();
  if (key.includes("delivered(returned to sender)"))
    return "Returned to sender";
  if (key.includes("delivered(addressee)")) return "Delivered successfully";
  if (key.includes("returned to sender")) return "Returning to seller";
  if (key.includes("kept on hold")) return "Delivery temporarily on hold";
  if (key.includes("taken out for delivery")) return "Out for delivery";
  if (key.includes("received at destination"))
    return "Reached destination office";
  if (key.includes("item dispatched")) return "In transit";
  if (key.includes("item booked")) return "Shipment booked";
  if (key.includes("item pickedup") || key.includes("item picked up"))
    return "Parcel picked up";
  if (key.includes("pickup assigned")) return "Pickup scheduled";
  return eventName || "Shipment update";
};
