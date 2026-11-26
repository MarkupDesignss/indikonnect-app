"use client";

import { Coins, ShoppingBag, Trophy, Star, Heart, LayoutGrid } from "lucide-react";
import type { DashboardStats } from "@/lib/redux/api/distributor/userDashboardApi";


// --------------------------------------------------
// Dashboard overview
// --------------------------------------------------

export function DashboardOverview({ stats }: { stats?: DashboardStats }) {
  const cards = [
    {
      label: "Total orders",
      value: stats?.total_orders,
      icon: ShoppingBag,
      tone: "#4C75D4",
      bg: "#EFF4FF",
    },
    {
      label: "Wishlist",
      value: stats?.wishlist,
      icon: Heart,
      tone: "#9D7890",
      bg: "#F7F3F6",
    },
    {
      label: "Points earned",
      value: stats?.points_earned,
      icon: Coins,
      tone: "#B58E4E",
      bg: "#FAF7EF",
    },
    {
      label: "Reviews",
      value: stats?.reviews,
      icon: Star,
      tone: "#7F78A8",
      bg: "#F6F4FA",
    },
    {
      label: "Cart items",
      value: stats?.cart_items,
      icon: LayoutGrid,
      tone: "#488D83",
      bg: "#F1F7F5",
    },
    {
      label: "Average rating",
      value: stats?.average_rating,
      icon: Trophy,
      tone: "#B18A6B",
      bg: "#FAF6F2",
    },
  ];
  return (
    <section className="mt-5 sm:mt-6">
      {/* <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionTitle>Business overview</SectionTitle>
          <p className="ml-11 mt-1 text-[11px] leading-5 text-[#8591A8]">
            Your latest account activity and shopping metrics
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#A3ADC0]">
          Overview / 06 metrics
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 sm:gap-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="group flex min-h-[112px] min-w-0 flex-col justify-between rounded-[14px] border border-[#E8EDF5] bg-white p-3 shadow-[0_3px_12px_rgba(52,72,120,.03)] transition-all sm:p-4"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                  style={{ background: item.bg, color: item.tone }}
                >
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.tone }}
                />
              </div>
              <div className="pt-4">
                <p className="dashboard-number break-words text-[20px] font-bold leading-none tracking-[-.045em] text-[#25334F] sm:text-[23px]">
                  {item.value == null ? "—" : formatNumber(item.value)}
                </p>
                <p className="mt-2 text-[11px] font-medium leading-4 text-[#78859D] sm:text-[12px]">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div> */}
    </section>
  );
}
