"use client";
import { useHydrated } from "@/lib/hooks/useHydrated";


import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";


import { ArrowLeft, CalendarClock, CalendarDays, Loader2, RefreshCw, AlertCircle } from "lucide-react";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";

import Sidebar from "@/features/distributor/shell/Sidebar";

import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";
import { CvSearchFilters, PairingsResponse, SalesCalendar, buildCvWeekOptions, extractPairingRows, getCalendarYear, getCurrentCalendarWeek, getErrorText } from "@/features/distributor/routes/sales-calendar/page.parts/support";
import { SalesCalendarPoster } from "@/features/distributor/routes/sales-calendar/page.parts/SalesCalendarPoster";
import { CvFilters } from "@/features/distributor/routes/sales-calendar/page.parts/CvFilters";


/** Standalone sales calendar page. Uses the exact Dashboard API sales_calendar.all_months and Pairings API. */

export default function DistributorSalesCalendarPage() {
  const router = useRouter();

  const mounted = useHydrated();

  const [authorized, setAuthorized] = useState(false);

  const redirectOnce = useRef(false);

  const [selectedYear, setSelectedYear] = useState(0);

  const [selectedWeek, setSelectedWeek] = useState(0);

  const [submitted, setSubmitted] = useState<CvSearchFilters | null>(null);

  const [initializedYear, setInitializedYear] = useState<number | null>(null);

  

  useEffect(() => {
    if (!mounted || redirectOnce.current) return;

    const token = localStorage.getItem("distributor_token");

    const authToken = localStorage.getItem("auth_token");

    const userType = (localStorage.getItem("user_type") || "")
      .trim()
      .toLowerCase();

    const loggedIn = localStorage.getItem("is_logged_in");

    if (
      token ||
      (authToken && userType === "distributor") ||
      (userType === "distributor" && loggedIn === "true")
    ) {
      setAuthorized(true);
    } else {
      redirectOnce.current = true;

      router.replace("/auth/distributor/login/");
    }
  }, [mounted, router]);

  const dashboardQuery = useGetUserDashboardQuery(undefined, {
    skip: !mounted || !authorized,
    refetchOnMountOrArgChange: true,
  });

  const data = dashboardQuery.data?.data;

  const calendar = (data as any)?.sales_calendar as SalesCalendar | undefined;

  const calendarYear = getCalendarYear(calendar);

  const currentWeek = getCurrentCalendarWeek(calendar);

  const availableWeeks = useMemo(
    () => buildCvWeekOptions(selectedYear || calendarYear, calendar),
    [selectedYear, calendarYear, calendar],
  );

  useEffect(() => {
    if (!calendar?.all_months?.length) return;

    if (initializedYear !== calendarYear) {
      setSelectedYear(calendarYear);

      setSelectedWeek(currentWeek);

      setInitializedYear(calendarYear);
    }
  }, [calendar, calendarYear, currentWeek, initializedYear]);

  const pairing = useGetPairingsQuery(
    (submitted
      ? { year: submitted.year, week_no: submitted.week_no }
      : undefined) as any,
    {
      skip: !authorized || !submitted,

      refetchOnMountOrArgChange: true,
    },
  ) as unknown as PairingsResponse;

  const rows = useMemo(() => extractPairingRows(pairing.data), [pairing.data]);

  function search() {
    if (!selectedYear || !availableWeeks.some((w) => w.value === selectedWeek))
      return;

    if (
      submitted?.year === selectedYear &&
      submitted.week_no === selectedWeek
    ) {
      void pairing.refetch();
      return;
    }

    setSubmitted({ year: selectedYear, week_no: selectedWeek });
  }

  if (!mounted || !authorized || dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f3f6fb] text-[12px] text-[#667085]">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading Sales
        Calendar...
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: "'Lato',Arial,sans-serif" }}
    >
      <DashboardHeader
        distributorId={String((data as any)?.ignite?.ba_id || "N/A")}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f6fb] px-3 pb-10 pt-4 sm:px-4 lg:px-6">
          <div className="mx-auto w-full max-w-[1390px]">
            <section className="relative mb-5 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#142747] via-[#1e3c69] to-[#245ca7] px-5 py-6 text-white shadow-[0_12px_34px_rgba(22,51,95,.17)] sm:px-7 sm:py-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-20 bottom-[-100px] h-48 w-48 rounded-full bg-[#70a8ff]/10 blur-2xl"
              />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <button
                    type="button"
                    aria-label="Back to dashboard"
                    onClick={() => router.push("/distributor/dashboard/")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-blue-100/80">
                      Distributor / Sales Calendar
                    </p>
                    <h1 className="mt-1.5 text-[25px] font-extrabold tracking-tight sm:text-[31px]">
                      Sales Calendar
                    </h1>
                    <p className="mt-2 max-w-[600px] text-[12px] leading-5 text-blue-100/90 sm:text-[13px]">
                      Track sales weeks, commission payout dates and weekly CV
                      performance in one place.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                        <CalendarDays size={13} /> Sales year {calendarYear}
                      </span>
                      {calendar?.current_week?.week_no && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                          <CalendarClock size={13} /> Current week{" "}
                          {calendar.current_week.week_no}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void dashboardQuery.refetch()}
                  disabled={dashboardQuery.isFetching}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={dashboardQuery.isFetching ? "animate-spin" : ""}
                  />{" "}
                  Refresh calendar
                </button>
              </div>
            </section>

            {dashboardQuery.isError && (
              <div
                role="alert"
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700"
              >
                <AlertCircle size={15} />
                Unable to retrieve Sales Calendar from the dashboard API.
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[14px] border border-[#dce6f3] bg-white px-4 py-3 text-[12px] text-[#52647e] shadow-sm">
              <CalendarClock size={17} className="shrink-0 text-[#245cbd]" />
              <span>
                <strong className="text-[#213a60]">How it works:</strong> Choose
                a year and week, or tap a week in the calendar, then select{" "}
                <strong>Search</strong> to view its CV performance.
              </span>
            </div>
            <SalesCalendarPoster
              calendar={calendar}
              selectedWeek={selectedYear === calendarYear ? selectedWeek : -1}
              onSelectWeek={(weekNo) => {
                setSelectedYear(calendarYear);
                setSelectedWeek(weekNo);
                setSubmitted(null);
              }}
            >
              <CvFilters
                calendar={calendar}
                selectedYear={selectedYear || calendarYear}
                selectedWeek={selectedWeek}
                onYearChange={(year) => {
                  setSelectedYear(year);
                  setSelectedWeek(
                    buildCvWeekOptions(year, calendar)[0]?.value ?? 0,
                  );
                  setSubmitted(null);
                }}
                onWeekChange={(week) => {
                  setSelectedWeek(week);
                  setSubmitted(null);
                }}
                onSearch={search}
                isFetching={pairing.isFetching || pairing.isLoading}
                isError={pairing.isError}
                hasSearched={Boolean(submitted)}
                searchedYear={submitted?.year}
                searchedWeek={submitted?.week_no}
              />
            </SalesCalendarPoster>

            {submitted && (
              <section className="mt-4 rounded-[22px] border border-[#e0e8f3] bg-white p-4 shadow-[0_4px_18px_rgba(24,39,75,.03)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-[14px] font-bold text-[#1E293B]">
                      CV Search Result
                    </h2>
                    <p className="mt-1 text-[11px] text-[#8490A1]">
                      Year {submitted.year} · Week {submitted.week_no}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#E7EAF0] bg-[#f3f6fb] px-2.5 py-1 text-[10px] text-[#657186]">
                    Pairings API
                  </span>
                </div>

                {pairing.isFetching ? (
                  <div className="flex items-center gap-2 py-8 text-[12px] text-[#667085]">
                    <Loader2 className="animate-spin" size={16} /> Loading CV
                    performance...
                  </div>
                ) : pairing.isError ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700"
                  >
                    {getErrorText(pairing.error)}
                  </div>
                ) : rows.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                    {rows.map((row) => (
                      <div
                        key={row.name}
                        className="rounded-[16px] border border-[#e1e9f5] bg-gradient-to-br from-white to-[#f6f9ff] p-3"
                      >
                        <p className="text-[10px] capitalize text-[#7A8597]">
                          {row.name.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 break-all text-[19px] font-bold text-[#27364A]">
                          {Number.isFinite(Number(row.value))
                            ? Number(row.value).toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })
                            : row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-[12px] text-[#7A8597]">
                    No CV metrics returned for this sales week.
                  </p>
                )}

                {pairing.data != null && (
                  <details className="mt-4 rounded-[11px] border border-[#E8ECF2] bg-[#FAFBFC] p-3">
                    <summary className="cursor-pointer text-[11px] font-semibold text-[#475467]">
                      View complete Pairings API response
                    </summary>
                    <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-all text-[10px] text-[#475467]">
                      {JSON.stringify(pairing.data, null, 2)}
                    </pre>
                  </details>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
