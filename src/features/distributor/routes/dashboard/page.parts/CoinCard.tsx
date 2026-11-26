"use client";

import { Coins } from "lucide-react";
import { formatNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


// --------------------------------------------------
// Coin card
// --------------------------------------------------

export function CoinCard({
  color,
  value,
  label,
}: {
  color: "yellow" | "green" | "blue";
  value: string | number;
  label: string;
}) {
  const theme = {
    yellow: {
      solid: "#A66A0A",
      bg: "#FFF5DB",
      border: "#F6E4B5",
      name: "Yellow",
    },
    green: {
      solid: "#16855A",
      bg: "#E7F8ED",
      border: "#CDEDD9",
      name: "Green",
    },
    blue: { solid: "#2864BF", bg: "#E9F1FF", border: "#CFE0FC", name: "Blue" },
  }[color];
  return (
    <div
      className="flex min-w-0 items-center gap-2.5 rounded-[14px] border p-3"
      style={{ borderColor: theme.border, backgroundColor: theme.bg }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
        style={{ color: theme.solid }}
      >
        <Coins size={21} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="dashboard-number break-words text-[23px] font-extrabold leading-none tracking-tight text-[#1B2A44] sm:text-[26px]">
          {value == null ? "—" : formatNumber(value)}
        </p>
        <p className="mt-1 text-[12px] font-bold leading-5 text-[#41516B] sm:text-[13px]">
          {label}
        </p>
        <p className="mt-0.5 text-[10px] leading-4 text-[#66758D]">
          Available balance
        </p>
      </div>
    </div>
  );
}
