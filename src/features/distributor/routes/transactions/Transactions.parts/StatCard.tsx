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
}: {
  label: string;

  value: string | number;

  icon: ReactNode;

  color: string;

  background: string;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_2px_12px_rgba(14,27,61,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(14,27,61,0.08)] sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-1 break-words text-[24px] font-black tracking-tight"

          style={{ color }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
