"use client";

import { Coins, ShoppingBag, Wallet, TrendingUp } from "lucide-react";
import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { ExtendedIgnite, formatNumber } from "@/features/distributor/routes/dashboard/page.parts/support";


export function QuickStatsCards({ ignite }: { ignite?: IgniteDashboard | null }) {
  const info = ignite as ExtendedIgnite | null | undefined;
  const money = (value: number | string | null | undefined) =>
    value == null || value === "" ? "—" : `₹${formatNumber(value)}`;

  const cards = [
    {
      label: "Cash Wallet",
      value: money(info?.cash_bal_inr),
      icon: Wallet,
      tone: "#0B855A",
      bg: "#E6F8F0",
    },
    {
      label: "Retail Profit",
      value: money(info?.retail_profit_usd),
      icon: ShoppingBag,
      tone: "#2B67C5",
      bg: "#EAF2FF",
    },
    {
      label: "Weekly Pairing",
      value: money(info?.weekly_pairing_usd),
      icon: TrendingUp,
      tone: "#8754BF",
      bg: "#F4EDFF",
    },
    {
      label: "Green Coins",
      value:
        info?.unilevel_green_coin == null || info.unilevel_green_coin === ""
          ? "—"
          : formatNumber(info.unilevel_green_coin),
      icon: Coins,
      tone: "#B77A18",
      bg: "#FFF4DF",
    },
  ];

  return (
    <section
      id="earnings"
      aria-label="Dashboard earnings"
      className="mt-3 scroll-mt-3"
    >
      <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-[#1D2C46] sm:text-[22px]">
        Earnings
      </h2>
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="dashboard-card min-w-0 rounded-[19px] border border-[#E2E9F3] bg-white p-3 shadow-[0_6px_22px_rgba(36,55,90,.045)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 text-[13px] font-bold text-[#526179]">
                  {item.label}
                </p>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px]"
                  style={{ color: item.tone, backgroundColor: item.bg }}
                >
                  <Icon size={21} strokeWidth={2} />
                </span>
              </div>
              <p className="dashboard-number mt-2 min-w-0 break-words text-[23px] font-extrabold leading-tight tracking-tight text-[#192944] sm:text-[27px]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
