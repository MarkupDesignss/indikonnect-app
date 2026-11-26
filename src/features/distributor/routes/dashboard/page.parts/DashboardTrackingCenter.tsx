"use client";

import { Loader2, Search, TrendingUp, Trophy, Info } from "lucide-react";
import { useEffect, useState } from "react";
import type { IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";
import { useGetMyAccountsQuery } from "@/lib/redux/api/distributor/userDashboardApi";
import { useLazyGetTrackingCvCounterQuery } from "@/lib/redux/api/distributor/trackingCvCounterApi";
import { BarChart3, RefreshCw, IndianRupee } from "lucide-react";
import { ExtendedIgnite, SectionTitle, TrackAccount, TrackHistory, TrackWeek, formatNumber, trackDate, trackField, trackFmt, trackList, trackObj } from "@/features/distributor/routes/dashboard/page.parts/support";
import { TrackingBaseIdSearch } from "@/features/distributor/routes/dashboard/page.parts/TrackingBaseIdSearch";
import { TrackingSearchSelect } from "@/features/distributor/routes/dashboard/page.parts/TrackingSearchSelect";


export function DashboardTrackingCenter({
  dashboardData,
  ignite,
}: {
  dashboardData: unknown;
  ignite?: IgniteDashboard | null;
}) {
  const accountsQuery = useGetMyAccountsQuery();
  const [loadCv, cvRequest] = useLazyGetTrackingCvCounterQuery();
  const [accountId, setAccountId] = useState("");
  const [baseAccountId, setBaseAccountId] = useState("");
  const [year, setYear] = useState("");
  const [weekNo, setWeekNo] = useState("");
  const [response, setResponse] = useState<unknown>(null);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [requestError, setRequestError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const source = trackObj(accountsQuery.data);
  const container = trackObj(source.data);
  const rawAccounts = [
    source.data,
    container.accounts,
    container.items,
    container.records,
    source.accounts,
    source.records,
    trackObj(container.data).accounts,
  ].find(Array.isArray);
  // Keep the complete account_id for the CV API, and show its label to users.
  // The same TC label can exist under different base IDs, so dedupe by full ID only.
  const accounts: TrackAccount[] = trackList(rawAccounts)
    .flatMap((a) => {
      const baId = String(a.account_id ?? a.ba_id ?? "").trim();
      if (!baId) return [];
      const baseId = String(a.base_id ?? baId.replace(/-\d+$/, "")).trim();
      const sequence = Number(a.sequence ?? baId.match(/-(\d+)$/)?.[1] ?? 0);
      const label = String(
        a.label ??
          a.display_label ??
          (sequence > 0 ? `TC-${String(sequence).padStart(3, "0")}` : baId),
      ).trim();
      return [
        {
          baId,
          baseId,
          label,
          sequence: Number.isFinite(sequence) ? sequence : 0,
          rank: String(a.rank_name ?? a.rank ?? "—"),
          status: String(a.status ?? a.membership_status ?? "—"),
        },
      ];
    })
    .filter((a, i, arr) => arr.findIndex((b) => b.baId === a.baId) === i)
    .sort(
      (a, b) =>
        a.baseId.localeCompare(b.baseId) ||
        a.sequence - b.sequence ||
        a.baId.localeCompare(b.baId),
    );
  const baseIds = [...new Set(accounts.map((a) => a.baseId))];
  const visibleAccounts = accounts.filter((a) => a.baseId === baseAccountId);

  const db = trackObj(dashboardData);
  const calendar = trackObj(db.sales_calendar);
  const weeks: TrackWeek[] = trackList(calendar.all_months)
    .flatMap((month) =>
      trackList(month.weeks).flatMap((w) => {
        const number = Number(w.week_no);
        const wkYear = Number(w.year ?? calendar.year);
        return Number.isFinite(number) && number > 0 && Number.isFinite(wkYear)
          ? [
              {
                year: wkYear,
                weekNo: number,
                start: String(w.start ?? ""),
                end: String(w.end ?? ""),
                isCurrent: w.is_current === true,
                isSettled: w.is_settled === true,
              },
            ]
          : [];
      }),
    )
    .filter(
      (w, i, arr) =>
        arr.findIndex(
          (other) => other.year === w.year && other.weekNo === w.weekNo,
        ) === i,
    )
    .sort((a, b) => a.year - b.year || a.weekNo - b.weekNo);
  const years = [...new Set(weeks.map((w) => w.year))].sort((a, b) => b - a);
  const weeksOfYear = weeks.filter((w) => String(w.year) === year);
  const currentWeek = weeks.find((w) => w.isCurrent);

  useEffect(() => {
    if (!baseIds.length) {
      if (baseAccountId) setBaseAccountId("");
      if (accountId) setAccountId("");
      return;
    }
    if (!baseIds.includes(baseAccountId)) {
      setBaseAccountId(baseIds[0]);
      return;
    }
    if (!visibleAccounts.some((a) => a.baId === accountId)) {
      setAccountId(visibleAccounts[0]?.baId ?? "");
      setResponse(null);
      setHasSearched(false);
      setRequestError("");
    }
  }, [accountsQuery.data, baseAccountId, accountId]);
  useEffect(() => {
    if (years.length && !years.some((y) => String(y) === year))
      setYear(String(currentWeek?.year ?? years[0]));
  }, [dashboardData, year]);
  useEffect(() => {
    if (
      weeksOfYear.length &&
      !weeksOfYear.some((w) => String(w.weekNo) === weekNo)
    ) {
      setWeekNo(
        String(
          weeksOfYear.find((w) => w.isCurrent)?.weekNo ??
            weeksOfYear[weeksOfYear.length - 1].weekNo,
        ),
      );
    }
  }, [year, dashboardData, weekNo]);

  const onChange = () => {
    setResponse(null);
    setHasSearched(false);
    setRequestError("");
  };
  const selectedAccount = accounts.find((a) => a.baId === accountId);
  const chosenWeek = weeksOfYear.find((w) => String(w.weekNo) === weekNo);
  const canSearch =
    Boolean(selectedAccount && chosenWeek) && !cvRequest.isFetching;
  const showCv = async () => {
    if (!selectedAccount || !chosenWeek) return;
    setRequestError("");
    setHasSearched(true);
    setResponse(null);
    setSelectedQuery(`${selectedAccount.baId}|${year}|${weekNo}`);
    try {
      const result = await loadCv(
        {
          ba_id: selectedAccount.baId,
          year: Number(year),
          week_no: Number(weekNo),
        },
        false,
      ).unwrap();
      if (trackObj(result).success === false)
        throw new Error(
          String(trackObj(result).message ?? "CV request failed"),
        );
      setResponse(result);
    } catch (e: unknown) {
      const obj = trackObj(e);
      setRequestError(
        String(
          trackObj(obj.data).message ??
            obj.message ??
            obj.error ??
            "Unable to load CV data.",
        ),
      );
    }
  };
  const activeKey = `${accountId}|${year}|${weekNo}`;
  const validResponse =
    hasSearched && selectedQuery === activeKey && response !== null;
  const cvPayload = trackObj(trackObj(response).data ?? response);
  const cvCurrent = trackObj(cvPayload.current);
  const weekResult = trackObj(cvPayload.week_result);
  const resultPresent =
    validResponse &&
    cvPayload.week_result !== null &&
    Object.keys(weekResult).length > 0;
  const settled = cvPayload.is_settled === true;
  // Display the current rank NAME from the CV Counter API (e.g. Silver),
  // not its numeric rank_no (e.g. 1).
  const currentRankName = String(
    trackField(cvCurrent, "rank_name") ?? "",
  ).trim();
  const currentTotalSteps = trackField(cvCurrent, "total_steps");
  const currentMetrics = [
    { label: "Left CV", value: trackField(cvCurrent, "cv_left") },
    { label: "Right CV", value: trackField(cvCurrent, "cv_right") },
    {
      label: "Floating Left CV",
      value: trackField(cvCurrent, "floating_cv_left"),
    },
    {
      label: "Floating Right CV",
      value: trackField(cvCurrent, "floating_cv_right"),
    },
    { label: "Total Left CV", value: trackField(cvCurrent, "total_cv_left") },
    { label: "Total Right CV", value: trackField(cvCurrent, "total_cv_right") },
  ];
  const extraWeekMetrics = [
    {
      label: "Paired CV",
      value: trackField(weekResult, "paired_cv", "total_paired_cv"),
    },
    {
      label: "Pairing commission",
      value: trackField(
        weekResult,
        "pairing_commission",
        "pairing_commission_usd",
      ),
    },
    {
      label: "Green Coins",
      value: trackField(weekResult, "green_coins", "green_coin"),
    },
    {
      label: "Yellow Coins",
      value: trackField(weekResult, "yellow_coins", "yellow_coin"),
    },
    {
      label: "Blue Coins",
      value: trackField(weekResult, "blue_coins", "blue_coin"),
    },
  ];

  // ---------------------------------------------------------------
  // Commission History Breakdown — API-authoritative counts
  // Uses ignite.commission_breakdown when present; falls back to
  // counting commissions_history by point_type otherwise.
  // ---------------------------------------------------------------
  const history = ((ignite as ExtendedIgnite | null | undefined)
    ?.commissions_history ?? []) as TrackHistory[];
  const apiBreakdown = (ignite as ExtendedIgnite | null | undefined)
    ?.commission_breakdown;

  const toCount = (value: number | string | null | undefined): number => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  const countByPointType = (pointType: string) =>
    history.filter(
      (h) => String((h as any)?.point_type ?? "").toLowerCase() === pointType,
    ).length;

  const cashCount = apiBreakdown
    ? toCount(apiBreakdown.cash_count)
    : countByPointType("cash_bal");
  const yellowCount = apiBreakdown
    ? toCount(apiBreakdown.yellow_count)
    : countByPointType("yellow_bal");
  const greenCount = apiBreakdown
    ? toCount(apiBreakdown.green_count)
    : countByPointType("green_bal");
  const blueCount = apiBreakdown
    ? toCount(apiBreakdown.blue_count)
    : countByPointType("blue_bal");

  const breakdownGroups = [
    {
      category: "cash",
      label: "Cash wallet",
      color: "#5275b5",
      count: cashCount,
    },
    {
      category: "yellow",
      label: "Yellow coins",
      color: "#e5b04c",
      count: yellowCount,
    },
    {
      category: "green",
      label: "Green coins",
      color: "#4cae8a",
      count: greenCount,
    },
    {
      category: "blue",
      label: "Blue coins",
      color: "#91b4ea",
      count: blueCount,
    },
  ];
  const otherBreakdownCount = apiBreakdown
    ? toCount(apiBreakdown.other_count)
    : 0;
  const allGroups = otherBreakdownCount
    ? [
        ...breakdownGroups,
        {
          category: "other",
          label: "Other",
          color: "#9ca3af",
          count: otherBreakdownCount,
        },
      ]
    : breakdownGroups;
  const sumCount = allGroups.reduce((n, g) => n + g.count, 0);
  let donutOffset = 0;
  const donutStops = allGroups
    .filter((g) => g.count > 0)
    .map((g) => {
      const from = donutOffset;
      donutOffset += (100 * g.count) / Math.max(1, sumCount);
      return `${g.color} ${from}% ${donutOffset}%`;
    });

  // Weekly cash chart — still uses raw history for credit/debit aggregation
  const weeklyCash = weeks.map((w) => {
    const wkEntries = history.filter((h) => {
      if (String((h as any)?.point_type ?? "") !== "cash_bal") return false;
      if (!h.date_created) return false;
      // Note: API dates are DD/MM/YYYY; string compare is best-effort only.
      return (
        String(h.date_created).slice(0, 19) >= w.start &&
        String(h.date_created).slice(0, 19) <= w.end
      );
    });
    return {
      ...w,
      credit: wkEntries.reduce(
        (n, h) => n + Math.max(0, Number((h as any).amount_usd) || 0),
        0,
      ),
      debit: wkEntries.reduce(
        (n, h) => n + Math.max(0, -(Number((h as any).amount_usd) || 0)),
        0,
      ),
    };
  });
  const plottedWeeks = weeklyCash.filter((w) => w.credit > 0 || w.debit > 0);
  const maxCash = Math.max(
    1,
    ...plottedWeeks.flatMap((w) => [w.credit, w.debit]),
  );
  const plot = (key: "credit" | "debit") =>
    plottedWeeks
      .map(
        (w, i) =>
          `${40 + (i * 360) / Math.max(1, plottedWeeks.length - 1)},${156 - (w[key] / maxCash) * 124}`,
      )
      .join(" ");
  const formClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-[#D8E2F0] bg-white px-3 text-[13px] font-semibold text-[#293447] outline-none focus:border-[#3768C6] focus:ring-4 focus:ring-[#3768C6]/10 disabled:bg-[#F4F6F9]";
  const panel =
    "min-w-0 rounded-[20px] border border-[#E2E9F3] bg-white p-3 shadow-[0_6px_22px_rgba(36,55,90,.04)] sm:p-3.5";
  return (
    <section
      id="tracking"
      className="mt-3 min-w-0 scroll-mt-3"
      aria-label="Tracking Center"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <SectionTitle large>Tracking Center</SectionTitle>
          <p className="ml-11 mt-1 text-[11px] text-[#8893a5]">
            Choose your TC account and sales week below, then click Show CV to
            view its performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void accountsQuery.refetch();
          }}
          disabled={accountsQuery.isFetching}
          className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#e3e7ed] bg-white px-3 text-[11px] font-semibold text-[#516075] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={accountsQuery.isFetching ? "animate-spin" : ""}
          />
          Refresh accounts
        </button>
      </div>
      <div className={panel}>
        <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(110px,.5fr)_auto]">
          <div className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              Base BA ID
            </span>
            <TrackingBaseIdSearch
              ids={baseIds}
              value={baseAccountId}
              loading={accountsQuery.isLoading}
              onChange={(nextBaseId) => {
                setBaseAccountId(nextBaseId);
                setAccountId(
                  accounts.find((a) => a.baseId === nextBaseId)?.baId ?? "",
                );
                onChange();
              }}
            />
          </div>
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              TC Slot
            </span>
            <TrackingSearchSelect
              options={visibleAccounts.map((a) => ({
                value: a.baId,
                label: a.label,
                detail: `${a.baId} · ${a.rank} · ${a.status}`,
              }))}
              value={
                visibleAccounts.some((a) => a.baId === accountId)
                  ? accountId
                  : ""
              }
              disabled={!visibleAccounts.length}
              placeholder="Select TC slot"
              searchPlaceholder="Search TC label or BA ID..."
              onChange={(nextAccountId) => {
                setAccountId(nextAccountId);
                onChange();
              }}
            />
            {selectedAccount && (
              <span className="mt-1 block text-[10px] text-[#8893a5]">
                {selectedAccount.baId} · {selectedAccount.rank} ·{" "}
                {selectedAccount.status}
              </span>
            )}
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              Sales Week
            </span>
            <TrackingSearchSelect
              options={weeksOfYear.map((w) => ({
                value: String(w.weekNo),
                label: `Week ${w.weekNo} (${trackDate(w.start)} – ${trackDate(w.end)} ${w.year})${w.isCurrent ? " · Current" : ""}`,
              }))}
              value={weekNo}
              disabled={!weeksOfYear.length}
              placeholder="Select week"
              searchPlaceholder="Search week number or date..."
              onChange={(nextWeekNo) => {
                setWeekNo(nextWeekNo);
                onChange();
              }}
            />
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#566174]">
              Year
            </span>
            <TrackingSearchSelect
              options={years.map((y) => ({
                value: String(y),
                label: String(y),
              }))}
              value={year}
              disabled={!years.length}
              placeholder="Select year"
              searchPlaceholder="Search year..."
              onChange={(nextYear) => {
                setYear(nextYear);
                setWeekNo("");
                onChange();
              }}
            />
          </label>
          <div className="min-w-0">
            <span
              aria-hidden="true"
              className="mb-1.5 hidden text-[11px] font-semibold text-transparent select-none lg:block"
            >
              Action
            </span>
            <button
              type="button"
              onClick={() => void showCv()}
              disabled={!canSearch}
              className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#171717] px-3 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#d0d5dd]"
            >
              {cvRequest.isFetching ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}{" "}
              Show CV
            </button>
          </div>
        </div>
        {accountsQuery.isError && (
          <p role="alert" className="mt-2 text-[11px] text-[#b42318]">
            Unable to load My Accounts. Check your session or account API.
          </p>
        )}
        {requestError && (
          <p
            role="alert"
            className="mt-2 rounded-lg bg-[#fff3f2] p-3 text-[11px] text-[#b42318]"
          >
            {requestError}
          </p>
        )}
      </div>
      <div
        className={`mt-2 grid min-w-0 items-start gap-2.5 ${validResponse ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]" : "grid-cols-1"}`}
      >
        <div className="min-w-0 space-y-3">
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-bold text-[#263449]">
                  {validResponse
                    ? String(cvPayload.ba_id ?? accountId)
                    : "CV Overview"}
                </h3>
                <p className="mt-1 text-[11px] text-[#8390a2]">
                  Live CV Counter API result for selected account and sales week
                </p>
              </div>
              {validResponse && (
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#f4f6fa] px-2 py-1 text-[10px] font-bold text-[#61718a]">
                    Week {trackFmt(trackObj(cvPayload.week).week_no)} ·{" "}
                    {trackFmt(trackObj(cvPayload.week).year)}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${settled ? "bg-[#edf8f0] text-[#228657]" : "bg-[#fff7e9] text-[#9a6b25]"}`}
                  >
                    {settled ? "Settled" : "Not settled"}
                  </span>
                </div>
              )}
            </div>
            {validResponse ? (
              <>
                {/* Rank and steps sit above the CV grid for a clear visual hierarchy. */}
                <div className="mt-3 grid min-w-0 gap-2.5 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-[#DCE7FA] bg-[#F2F6FF] p-3 sm:gap-3 sm:p-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#E1EBFF] text-[#3966B0]">
                      <Trophy size={23} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-[#687C9F]">
                        Current Rank
                      </p>
                      <p className="mt-1 break-words text-[24px] font-extrabold leading-tight tracking-tight text-[#1C365D] sm:text-[29px]">
                        {currentRankName || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2.5 rounded-2xl border border-[#E5EAF3] bg-[#FAFBFD] p-3 sm:p-3.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#78869A]">
                        Total Steps
                      </p>
                      <p className="dashboard-number mt-1 text-[26px] font-extrabold leading-tight tracking-tight text-[#26374F] sm:text-[29px]">
                        {trackFmt(currentTotalSteps)}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EAF0F9] text-[#58749C]">
                      <TrendingUp size={21} strokeWidth={1.9} />
                    </span>
                  </div>
                </div>

                <div className="mt-2 grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {currentMetrics.map((m, i) => {
                    const isFloating = i === 2 || i === 3;
                    return (
                      <div
                        key={m.label}
                        className={`flex min-w-0 flex-col justify-between rounded-[14px] border p-2.5 sm:p-3 ${
                          isFloating
                            ? "border-[#DCE7F8] bg-[#F7FAFF]"
                            : "border-[#E7ECF3] bg-white"
                        }`}
                      >
                        <p className="text-[11px] font-semibold leading-4 text-[#77869A]">
                          {m.label}
                        </p>
                        <p
                          className={`dashboard-number mt-2 break-words text-[20px] font-extrabold leading-tight tracking-tight sm:text-[23px] ${
                            isFloating ? "text-[#416CB1]" : "text-[#26374F]"
                          }`}
                        >
                          {trackFmt(m.value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {resultPresent ? (
                  <div className="mt-2 rounded-[15px] border border-[#E7ECF3] bg-[#FAFBFD] p-2.5 sm:p-3">
                    <p className="mb-2 text-[11px] font-bold text-[#4B5C74]">
                      Weekly Settlement
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
                      {extraWeekMetrics.map((m) => (
                        <div
                          key={m.label}
                          className="flex min-w-0 flex-col justify-between rounded-xl border border-[#E8EDF4] bg-white p-3"
                        >
                          <p className="text-[10px] font-semibold leading-4 text-[#8490A0]">
                            {m.label}
                          </p>
                          <p className="dashboard-number mt-2 break-words text-[16px] font-extrabold text-[#283448]">
                            {trackFmt(m.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-start gap-2.5 rounded-[13px] border border-[#F2E4CC] bg-[#FFFBF4] px-3.5 py-2 text-[11px] leading-5 text-[#906B35]">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <p>
                      Weekly settlement is not available yet. Current CV and
                      floating CV are shown above; no commission is assumed.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[48px] flex-wrap items-center justify-center gap-2 text-center">
                <BarChart3 size={23} className="text-[#a6b1c0]" />
                <p className="text-[12px] font-semibold text-[#66758b]">
                  {cvRequest.isFetching
                    ? "Loading CV..."
                    : "Choose an account and click Show CV"}
                </p>
              </div>
            )}
          </div>
          {/* <div className={panel}>
              <h3 className="text-[14px] font-bold text-[#253449]">
                Weekly Cash Activity
              </h3>
              <p className="mt-1 text-[10px] text-[#8993a3]">
                Actual Dashboard commission-history cash credits and debits ·
                USD
              </p>
              <div className="mt-2 flex gap-2 text-[10px]">
                <span className="text-[#5275b5]">● Credits</span>
                <span className="text-[#d59b51]">● Debits</span>
              </div>
              {plottedWeeks.length ? (
                <div className="mt-2 overflow-x-auto">
                  <svg
                    viewBox="0 0 420 205"
                    className="h-auto w-full min-w-[300px]"
                    role="img"
                    aria-label="Weekly cash credits and debits chart"
                  >
                    {[32, 73, 114, 156].map((y) => (
                      <line
                        key={y}
                        x1="38"
                        x2="405"
                        y1={y}
                        y2={y}
                        stroke="#e6eaf0"
                      />
                    ))}
                    <polyline
                      points={plot("credit")}
                      fill="none"
                      stroke="#5275b5"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={plot("debit")}
                      fill="none"
                      stroke="#d59b51"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {plottedWeeks.map((w, i) => {
                      const x =
                        40 + (i * 360) / Math.max(1, plottedWeeks.length - 1);
                      return (
                        <g key={`${w.year}-${w.weekNo}`}>
                          <circle
                            cx={x}
                            cy={156 - (w.credit / maxCash) * 124}
                            r="3.5"
                            fill="#5275b5"
                          >
                          </circle>
                          <circle
                            cx={x}
                            cy={156 - (w.debit / maxCash) * 124}
                            r="3.5"
                            fill="#d59b51"
                          >
                          </circle>
                          <text
                            x={x}
                            y="177"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#68788b"
                          >
                            W{w.weekNo}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <p className="mt-8 rounded-lg border border-dashed border-[#e5e9f0] bg-[#fafbfc] px-3 py-12 text-center text-[11px] text-[#8b96a7]">
                  No weekly cash transactions found in the dashboard history.
                </p>
              )}
            </div> */}
          {/* <div className={panel}>
              <h3 className="text-[14px] font-bold text-[#253449]">
                My Tree{" "}
                <span className="inline-flex items-center align-middle ml-1">
                  <Network size={18} className="text-[#7185a4]" />
                </span>
              </h3>
              <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-[#f7f9fc] p-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-[#8390a1]">Far Left BA</p>
                  <p className="break-all text-[12px] font-bold text-[#2c3950]">
                    {(ignite as ExtendedIgnite | undefined)?.far_left_ba_id ||
                      "—"}
                  </p>
                </div>
              </div>
              <div className="mt-2 rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[10px] text-[#8390a1]">Far Right BA</p>
                <p className="mt-1 break-all text-[12px] font-bold text-[#2c3950]">
                  {(ignite as ExtendedIgnite | undefined)?.far_right_ba_id ||
                    "—"}
                </p>
              </div>
              <p className="mt-2 text-[10px] text-[#8d98a7]">
                Direct/downline counts are not included in the supplied
                Dashboard response.
              </p>
            </div> */}
        </div>
        <div className={panel}>
          <div className="flex items-center gap-2">
            <IndianRupee size={18} className="text-[#6c82a0]" />
            <h3 className="text-[14px] font-bold text-[#253449]">
              Commission History Breakdown
            </h3>
          </div>
          <p className="mt-1 text-[10px] text-[#8993a3]">
            Transaction counts by wallet category
          </p>
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex grow-0 basis-full justify-center sm:basis-auto">
              <div
                className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full sm:h-[152px] sm:w-[152px]"
                role="img"
                aria-label={`${formatNumber(sumCount)} commission history transactions`}
                style={{
                  background: sumCount
                    ? `conic-gradient(${donutStops.join(", ")})`
                    : "#e8edf3",
                }}
              >
                <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white sm:h-[116px] sm:w-[116px]">
                  <span className="dashboard-number max-w-[90%] break-all text-center text-[26px] font-extrabold leading-none tracking-tight text-[#263449]">
                    {formatNumber(sumCount)}
                  </span>
                  <span className="mt-1.5 text-[10px] font-semibold text-[#738197]">
                    Total entries
                  </span>
                </div>
              </div>
            </div>

            <div
              className="grid min-w-0 flex-[1_1_240px] gap-2.5"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 132px), 1fr))",
              }}
            >
              {allGroups.map((g) => (
                <div
                  key={g.category}
                  className="flex min-w-0 items-start gap-2.5 rounded-xl border border-[#E5EBF3] bg-[#F8FAFD] px-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-4 text-[#65748A]">
                      {g.label}
                    </p>
                    <p className="dashboard-number mt-1 break-words text-[23px] font-extrabold leading-tight tracking-tight text-[#253449]">
                      {formatNumber(g.count)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
