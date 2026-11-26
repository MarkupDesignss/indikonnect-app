"use client";

import { RefreshCw, AlertCircle } from "lucide-react";
import type { IgnitePointTransaction, IgnitePointType } from "@/lib/redux/api/distributor/ignitePointTransactionsApi";
import Loding from "@/components/common/Loding";


// ==================================================

// DESIGN TOKENS

// ==================================================

export const NAVY = "#0E1B3D";


export const BRASS = "#B8935A";


export const EMERALD = "#1f9d6b";


export const INDIGO = "#3955A6";


export const RED = "#c0392b";


// ==================================================

// FONT

// ==================================================

export const FontImport = () => (
  <style>{`

    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

  `}</style>
);


// ==================================================

// HELPERS

// ==================================================

export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}


export function formatAmount(value: number | string | null | undefined): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}


export function formatSignedAmount(value: number | string | null | undefined): string {
  const amount = toNumber(value);

  const formatted = formatAmount(amount);

  if (amount > 0) return `+${formatted}`;

  return formatted;
}


// API datetime: "2026-10-09 19:49:18.506"

// Format without converting timezone.

export function formatDate(value?: string | null): string {
  if (!value) return "—";

  const [datePart, timePart] = value.split(" ");

  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  const date = `${day}/${month}/${year}`;

  const time = timePart ? timePart.slice(0, 8) : "";

  return time ? `${date} ${time}` : date;
}


export function getDatePart(value?: string | null): string {
  return value?.split(" ")[0] ?? "";
}


export function humanize(value?: string | null): string {
  if (!value) return "—";

  return value

    .replace(/[_-]+/g, " ")

    .replace(/\s+/g, " ")

    .trim()

    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


export function getDescription(transaction: IgnitePointTransaction): string {
  const descriptions: Record<string, string> = {
    adj_add: "Balance adjustment added",

    adj_sub: "Balance adjustment deducted",

    wd_partner_payout: "Partner payout withdrawal",

    cr_out: "Balance debited",

    cr_in: "Balance credited",
  };

  return (
    descriptions[transaction.description] ?? humanize(transaction.description)
  );
}


export function getCategory(type: string): string {
  const categories: Record<string, string> = {
    adj: "Adjustment",

    wd: "Withdrawal",

    cr: "Credit / debit",
  };

  return categories[type?.toLowerCase()] ?? humanize(type);
}


export function getPointTypeLabel(type: IgnitePointType): string {
  const labels: Record<string, string> = {
    cash_bal: "Wallet",

    green_bal: "Green coin",

    yellow_bal: "Yellow coin",

    blue_bal: "Blue coin",
  };

  return labels[type] ?? humanize(type);
}


export function getCategoryColor(type: string): string {
  switch (type?.toLowerCase()) {
    case "adj":
      return "bg-[#eceffb] text-[#3955A6]";

    case "wd":
      return "bg-[#fff4e5] text-[#a15c07]";

    case "cr":
      return "bg-[#eaf7f0] text-[#18794e]";

    default:
      return "bg-[#f2f4f7] text-[#667085]";
  }
}


export function getAmountColor(value: string | number): string {
  const amount = toNumber(value);

  if (amount > 0) return "text-[#1f9d6b]";

  if (amount < 0) return "text-[#c0392b]";

  return "text-[#667085]";
}


export function getRelatedMember(transaction: IgnitePointTransaction): string {
  if (transaction.rel_ba_id) {
    return transaction.rel_ba_id;
  }

  if (transaction.rel_member_id !== null) {
    return `Member #${transaction.rel_member_id}`;
  }

  return "—";
}


export function getOrderNumber(transaction: IgnitePointTransaction): string {
  if (
    transaction.order_no === null ||
    transaction.order_no === undefined ||
    transaction.order_no === ""
  ) {
    return "—";
  }

  const order = String(transaction.order_no);

  return order.startsWith("#") ? order : `#${order}`;
}


// ==================================================

// FONT AND LOADER

// ==================================================

export function TransactionsLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
      <Loding />
    </div>
  );
}


// ==================================================

// ERROR STATE

// ==================================================

export function TransactionsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={32} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load transactions
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        Transaction history could not be retrieved. Please try again.
      </p>

      <button
        type="button"

        onClick={onRetry}

        className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12px] font-semibold text-white"

        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}


// ==================================================

// AMOUNT CELL

// A transaction is displayed only in its matching

// wallet/coin column. Other columns display a dash.

// ==================================================

export function AmountCell({
  transaction,

  pointType,
}: {
  transaction: IgnitePointTransaction;

  pointType: IgnitePointType;
}) {
  if (transaction.point_type !== pointType) {
    return <span className="text-[12px] text-[#b0b6c3]">—</span>;
  }

  return (
    <span
      className={`whitespace-nowrap text-[12px] font-bold ${getAmountColor(
        transaction.amount,
      )}`}
    >
      {formatSignedAmount(transaction.amount)}
    </span>
  );
}
