"use client";

import { AlertCircle, Clock3, RefreshCw, ShieldAlert } from "lucide-react";
import type { PendingPlacement } from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";
import Loding from "@/components/common/Loding";


// ==================================================

// DESIGN TOKENS

// ==================================================

export const NAVY = "#0E1B3D";


export const INDIGO = "#3955A6";


export const EMERALD = "#1f9d6b";


export const BRASS = "#B8935A";


export const RED = "#c0392b";


// ==================================================

// HELPERS

// ==================================================

export function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}


// API date strings are formatted without converting their timezone.

export function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const [datePart, timePart] = value.split(" ");

  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  const date = `${day}/${month}/${year}`;

  return timePart ? `${date} ${timePart.slice(0, 5)}` : date;
}


export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}


// ==================================================

// FONT

// ==================================================

export function FontImport() {
  return (
    <style>{`

      @import url('https\://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

    `}</style>
  );
}


// ==================================================

// LOADING / ERROR

// ==================================================

export function PendingPlacementsLoader() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
      <Loding />
    </div>
  );
}


export function PendingPlacementsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={34} className="text-[#c0392b]" />

      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load pending placements
      </h2>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        The pending placement data could not be retrieved. Please try again.
      </p>

      <button
        type="button"

        onClick={onRetry}

        className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12px] font-semibold text-white"

        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}


// ==================================================

// STATUS BADGE

// ==================================================

export function PlacementStatus({ member }: { member: PendingPlacement }) {
  if (member.is_overdue) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0ef] px-2.5 py-1.5 text-[10px] font-bold text-[#b42318]">
        <ShieldAlert size={12} /> Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4e5] px-2.5 py-1.5 text-[10px] font-bold text-[#a15c07]">
      <Clock3 size={12} /> Pending placement
    </span>
  );
}
