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

  subtitle,
}: {
  label: string;

  value: string | number;

  icon: ReactNode;

  color: string;

  background: string;

  subtitle?: string;
}) {
  return (
    <div className="group relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[20px] border border-[#e5eaf3] bg-white p-5 shadow-[0_5px_25px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd8ea] hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] sm:p-6">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#64748b] sm:text-[13px]">
          {label}
        </p>

        <p
          className="mt-2 break-words text-[25px] font-extrabold leading-tight tracking-[-0.045em] tabular-nums sm:text-[29px]"

          style={{ color }}
        >
          {value}
        </p>

        {subtitle && (
          <p className="mt-1 text-[11px] text-[#94a3b8]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
