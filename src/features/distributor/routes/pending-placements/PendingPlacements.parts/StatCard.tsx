"use client";

import type { ReactNode } from "react";


// ==================================================

// STAT CARD

// ==================================================

export function StatCard({
  label,

  value,

  icon,

  color,

  background,

  note,
}: {
  label: string;

  value: string | number;

  icon: ReactNode;

  color: string;

  background: string;

  note?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[17px] border border-[#e5eaf2] bg-white p-4 shadow-[0_4px_20px_rgba(14,27,61,0.035)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(14,27,61,0.08)] sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-1 break-words text-[25px] font-black tracking-tight"
          style={{ color }}
        >
          {value}
        </p>

        {note && <p className="mt-0.5 text-[10px] text-[#98a2b3]">{note}</p>}
      </div>
    </div>
  );
}
