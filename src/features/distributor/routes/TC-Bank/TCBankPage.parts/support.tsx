"use client";

import React from "react";
import { ChevronDown, FileClock, UsersRound } from "lucide-react";

//  ===================================================== |  HELPERS |  =====================================================
export const n = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};


export const number = (value: number | string | null | undefined): string =>
  n(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });


export const getStatusTone = (status: string) => {
  const normalized = (status || "").toLowerCase();

  if (
    ["activated", "active", "qualified", "completed", "success"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "border-[#D7EEE2] bg-[#F1FBF5] text-[#237A55]";
  }

  if (
    ["failed", "blocked", "rejected", "cancel"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "border-[#F0DBDB] bg-[#FFF6F6] text-[#B45353]";
  }

  if (["pending", "process", "review"].some((s) => normalized.includes(s))) {
    return "border-[#F1E5CC] bg-[#FFF9ED] text-[#9F7134]";
  }

  return "border-[#E7E9ED] bg-[#F7F8FA] text-[#697386]";
};


export const getTypeBadge = (type?: string) => {
  const normalized = (type || "").toLowerCase();

  if (normalized === "base") {
    return "border-[#DDE6F4] bg-[#EFF4FD] text-[#456CA7]";
  }

  if (normalized === "extra_tc") {
    return "border-[#E8E3F5] bg-[#F5F2FB] text-[#7A5AC7]";
  }

  return "border-[#E7E9ED] bg-[#F7F8FA] text-[#697386]";
};


export const formatType = (type?: string) => {
  if (!type) return "—";

  return type === "extra_tc"
    ? "Extra TC"
    : type.charAt(0).toUpperCase() + type.slice(1);
};


export const panel =
  "min-w-0 rounded-2xl border border-[#E4EAF4] bg-white shadow-[0_8px_32px_-22px_rgba(14,27,61,0.25)]";

//  ===================================================== |  SMALL UI COMPONENTS |  =====================================================
export function SectionHeading({
  icon: Icon,

  title,

  subtitle,
}: {
  icon: React.ElementType;

  title: string;

  subtitle: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#E6EAF1] bg-[#F5F7FA] text-[#44546D]">
        <Icon size={17} strokeWidth={1.9} />
      </span>

      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-[-.025em] text-[#202734] sm:text-[17px]">
          {title}
        </h2>

        <p className="mt-0.5 text-[11px] leading-4 text-[#8690A0]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}


export function PageSizePicker({
  value,

  onChange,
}: {
  value: number;

  onChange: (v: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[11px] text-[#758092]">
      <span className="hidden sm:inline">Rows per page</span>

      <span className="relative">
        <select
          aria-label="Rows per page"

          value={value}

          onChange={(event) => onChange(Number(event.target.value))}

          className="h-8 appearance-none rounded-[8px] border border-[#E3E7EE] bg-white pl-2.5 pr-7 text-[11px] font-semibold text-[#445066] outline-none transition focus:border-[#202020]"
        >
          <option value={5}>5</option>

          <option value={10}>10</option>

          <option value={20}>20</option>

          <option value={50}>50</option>
        </select>

        <ChevronDown
          size={13}

          className="pointer-events-none absolute right-2 top-[10px] text-[#8993A3]"
        />
      </span>
    </label>
  );
}


export function EmptyTable({
  kind,

  hasSearch,
}: {
  kind: "accounts" | "transactions";

  hasSearch: boolean;
}) {
  return (
    <div className="flex min-h-[154px] flex-col items-center justify-center px-4 py-7 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#F5F7FA] text-[#8E9BAE]">
        {kind === "accounts" ? (
          <UsersRound size={19} />
        ) : (
          <FileClock size={19} />
        )}
      </div>

      <p className="mt-3 text-[12px] font-semibold text-[#424C5C]">
        {hasSearch
          ? "No matching records"
          : kind === "accounts"
            ? "No accounts found"
            : "No transactions yet"}
      </p>

      <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#98A2B3]">
        {hasSearch
          ? "Try searching by a different account or transaction reference."
          : kind === "accounts"
            ? "Your TC Bank accounts will appear here."
            : "TC Bank activity will appear here once recorded."}
      </p>
    </div>
  );
}


// Searchable Base BA ID dropdown — only API-returned unique base IDs are shown.
// Display the API member name alongside the ID, while keeping the selected value as the real base_id.
export type BaseBAOption = { value: string; label: string };
