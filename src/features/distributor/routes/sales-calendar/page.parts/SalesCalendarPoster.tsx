"use client";

import React from "react";
import { CalendarClock } from "lucide-react";
import { SalesCalendar, getActiveCalendarWeek, getCalendarYear } from "@/features/distributor/routes/sales-calendar/page.parts/support";
import { PosterCalendarTable } from "@/features/distributor/routes/sales-calendar/page.parts/PosterCalendarTable";


export function SalesCalendarPoster({
  calendar,

  selectedWeek,

  onSelectWeek,

  children,
}: {
  calendar?: SalesCalendar;

  selectedWeek: number;

  onSelectWeek: (weekNo: number) => void;

  children?: React.ReactNode;
}) {
  const year = getCalendarYear(calendar);

  const months = [...(calendar?.all_months ?? [])].sort(
    (a, b) => a.month_no - b.month_no,
  );

  const half = Math.ceil(months.length / 2);

  const activeWeek = getActiveCalendarWeek(calendar);

  if (!months.length) {
    return (
      <section className="mt-5 rounded-[18px] border border-[#e3e8f0] bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarClock size={20} className="text-[#67758b]" />

          <div>
            <h3 className="text-[15px] font-bold text-[#1d2939]">
              Sales Month Calendar
            </h3>

            <p className="mt-0.5 text-[12px] text-[#667085]">
              Calendar data is not available from the dashboard API.
            </p>
          </div>
        </div>

        {children && (
          <div className="mt-4 border-t border-[#e3e8f0] pt-3">{children}</div>
        )}
      </section>
    );
  }

  return (
    <section className="relative isolate mt-3 overflow-hidden rounded-[24px] border border-[#dce5f1] bg-gradient-to-br from-[#eaf1fb] via-[#f5f8fc] to-white p-3 shadow-[0_10px_32px_rgba(20,50,100,.06)] sm:p-5 lg:p-6">
      <div
        aria-hidden="true"

        className="pointer-events-none absolute inset-0 opacity-30"

        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(54,95,157,.035),transparent)",
        }}
      />

      <div
        aria-hidden="true"

        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[12px] border-[#d5e4f8]/20"
      />

      <div
        aria-hidden="true"

        className="pointer-events-none absolute -left-10 top-20 h-36 w-36 rounded-full bg-[#c7e1ff]/15 blur-2xl"
      />

      <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
        {activeWeek && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e2ee] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#34547f]">
            <span className="h-2 w-2 rounded-full bg-[#d09e36]" />
            Current week {activeWeek.week_no}
          </span>
        )}
      </div>

      {/* Find CV appears ABOVE the sales calendar, within the same card. */}

      {children && (
        <div className="relative mb-4 rounded-[12px] border border-[#dce5ef] bg-white/90 p-3 sm:p-4">
          {children}
        </div>
      )}

      <div className="relative mb-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-[20px] font-extrabold leading-tight tracking-[-.025em] text-[#1c3d71] sm:text-[23px] lg:text-[26px]">
            Sales Month Calendar
          </h2>

          <span className="rounded-md border border-[#e3d098] bg-[#fff0c3] px-2 py-0.5 text-[13px] font-extrabold text-[#234b85] sm:text-[14px]">
            {year}
          </span>
        </div>

        <p className="mt-1 text-[10px] leading-4 text-[#65758b]">
          Click a week number to select it for CV performance search
        </p>
      </div>

      <div className="relative grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2">
        <PosterCalendarTable
          months={months.slice(0, half)}

          year={year}

          selectedWeek={selectedWeek}

          onSelectWeek={onSelectWeek}
        />

        <PosterCalendarTable
          months={months.slice(half)}

          year={year}

          selectedWeek={selectedWeek}

          onSelectWeek={onSelectWeek}
        />
      </div>

      <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e8f1] bg-white/80 px-2.5 py-2 text-[9px] leading-4 text-[#66758b] sm:text-[10px]">
        <span>
          Week dates and payout dates: dashboard API • Rank basis: supplied 2026
          reference poster
        </span>

        <span className="font-bold text-[#284e85]">www.indiekonnect.com</span>
      </div>
    </section>
  );
}
