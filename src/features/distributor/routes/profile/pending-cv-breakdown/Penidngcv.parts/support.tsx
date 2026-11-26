"use client";

import { RefreshCw, AlertCircle, GitBranch } from "lucide-react";
import type { ReactNode } from "react";
import type { IgniteFloatingCVTransaction } from "@/lib/redux/api/distributor/igniteFloatingCvTxsApi";
import Loding from "@/components/common/Loding";


// ==================================================

// DESIGN TOKENS

// ==================================================

export const NAVY = "#172B50";


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

    /* Hide default date input calendar icon so custom icon stays clean */

    input[type="date"]::-webkit-calendar-picker-indicator {

      opacity: 0;

      position: absolute;

      right: 0;

      top: 0;

      bottom: 0;

      width: 100%;

      height: 100%;

      cursor: pointer;

    }

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


export function formatCV(value: number | string | null | undefined): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}


export function formatDate(value?: string | null): string {
  if (!value) return "—";

  const [datePart, timePart] = value.split(" ");

  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  return timePart
    ? `${day}/${month}/${year} ${timePart.slice(0, 8)}`
    : `${day}/${month}/${year}`;
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


export function getSideLabel(side: number): string {
  if (side === 1) return "Left";

  if (side === 2) return "Right";

  return "Unknown";
}


export function getSideColor(side: number): string {
  if (side === 1) return EMERALD;

  if (side === 2) return INDIGO;

  return NAVY;
}


export function formatWeek(week?: { year: number; week_no: number } | null): string {
  if (!week) return "—";

  return `Week ${String(week.week_no).padStart(2, "0")}`;
}


export function getWeekKey(week?: { year: number; week_no: number } | null): string {
  if (!week) return "";

  return `${week.year}-W${String(week.week_no).padStart(2, "0")}`;
}


export function getBuyer(transaction: IgniteFloatingCVTransaction): string {
  return (
    transaction.buyer_ba_id ||
    (transaction.buyer_member_id
      ? `Member #${transaction.buyer_member_id}`
      : "—")
  );
}


// ==================================================

// REUSABLE FILTER FIELD WRAPPER

// ==================================================

export function FilterField({
  label,

  children,
}: {
  label: string;

  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label className="text-[12px] font-semibold tracking-[-0.01em] text-[#475569]">
        {label}
      </label>

      {children}
    </div>
  );
}


// ==================================================

// LOADING STATE

// ==================================================

export function PendingCVLoader() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
      <Loding />
    </div>
  );
}


// ==================================================

// ERROR STATE

// ==================================================

export function PendingCVError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={32} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load pending CV
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        Floating CV transactions could not be retrieved. Please try again.
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

// SIDE BADGE

// ==================================================

export function SideBadge({ side }: { side: number }) {
  const color = getSideColor(side);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"

      style={{
        backgroundColor: `${color}14`,

        color,
      }}
    >
      <GitBranch size={11} />
      {getSideLabel(side)} leg
    </span>
  );
}


// ==================================================

// CV AMOUNT

// ==================================================

export function CVAmount({
  value,

  color = NAVY,
}: {
  value: string | number;

  color?: string;
}) {
  return (
    <span
      className="whitespace-nowrap text-[12px] font-bold"

      style={{ color }}
    >
      {formatCV(value)}
    </span>
  );
}
