"use client";
import { useHydrated } from "@/lib/hooks/useHydrated";


import { Coins, Loader2, Wallet } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "react-hot-toast";

import DashboardHeader from "@/features/distributor/shell/DashboardHeader";
import Sidebar from "@/features/distributor/shell/Sidebar";

import type { DashboardActivity, DashboardUser, IgniteDashboard } from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetUserDashboardQuery, usePlaceBankedTcMutation } from "@/lib/redux/api/distributor/userDashboardApi";

import { useGetPairingsQuery } from "@/lib/redux/api/distributor/pairingsApi";

import { BarChart3, ChevronRight } from "lucide-react";


import { BankedTcSide, CvSearchFilters, DashboardLoader, ExtendedIgnite, FontImport, PairingsQueryResult, SalesCalendar, getCalendarYear, getCurrentCalendarWeek, getDashboardGstValue, getPairingsMetrics, toNumber } from "@/features/distributor/routes/dashboard/page.parts/support";
import { WelcomeHero } from "@/features/distributor/routes/dashboard/page.parts/WelcomeHero";
import { QuickStatsCards } from "@/features/distributor/routes/dashboard/page.parts/QuickStatsCards";
import { DashboardTrackingCenter } from "@/features/distributor/routes/dashboard/page.parts/DashboardTrackingCenter";
import { CoinsAndAccountStatusOverview } from "@/features/distributor/routes/dashboard/page.parts/CoinsAndAccountStatusOverview";
import { LatestOrderSection } from "@/features/distributor/routes/dashboard/page.parts/LatestOrderSection";
import { RecentActivity } from "@/features/distributor/routes/dashboard/page.parts/RecentActivity";
import { AccountSummary } from "@/features/distributor/routes/dashboard/page.parts/AccountSummary";
import { AccountTable } from "@/features/distributor/routes/dashboard/page.parts/AccountTable";
import { EarnedCoinsAndNetwork } from "@/features/distributor/routes/dashboard/page.parts/EarnedCoinsAndNetwork";
import { LedgerHistory } from "@/features/distributor/routes/dashboard/page.parts/LedgerHistory";
import { BankedTcModal } from "@/features/distributor/routes/dashboard/page.parts/BankedTcModal";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";



// --------------------------------------------------
// Main dashboard
// --------------------------------------------------

export default function DistributorDashboardPage() {
  const router = useRouter();
  const redirectLock = useRef(false);

  const [authStatus, setAuthStatus] = useState<
    "checking" | "authorized" | "redirecting"
  >("checking");

  const mounted = useHydrated();

  const [selectedCvYear, setSelectedCvYear] = useState<number>(
    new Date().getFullYear(),
  );

  const [selectedCvWeek, setSelectedCvWeek] = useState<number>(1);

  const [submittedCvFilters, setSubmittedCvFilters] =
    useState<CvSearchFilters | null>(null);

  const [isBankedTcModalOpen, setIsBankedTcModalOpen] = useState(false);

  const [pendingBankedTcSide, setPendingBankedTcSide] =
    useState<BankedTcSide | null>(null);

  const [placeBankedTc, { isLoading: isPlacingBankedTc }] =
    usePlaceBankedTcMutation();

  

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (redirectLock.current) return;

    redirectLock.current = true;

    const distributorToken = localStorage.getItem("distributor_token");
    const authToken = localStorage.getItem("auth_token");
    const rawUserType = localStorage.getItem("user_type") || "";
    const isLoggedIn = localStorage.getItem("is_logged_in");
    const userType = rawUserType.trim().toLowerCase();

    const hasDistributorSession =
      Boolean(distributorToken) ||
      (Boolean(authToken) && userType === "distributor") ||
      (userType === "distributor" && isLoggedIn === "true");

    if (hasDistributorSession) {
      setAuthStatus("authorized");
      return;
    }

    setAuthStatus("redirecting");
    router.replace("/auth/distributor/login/");
  }, [router, mounted]);

  const {
    data: dashboardResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetUserDashboardQuery(undefined, {
    skip: !mounted || authStatus !== "authorized",
    refetchOnMountOrArgChange: true,
  });

  const dashboard = dashboardResponse?.data;

  const user: DashboardUser | undefined = dashboard?.user;
  const stats = dashboard?.stats;
  const ignite: IgniteDashboard | null | undefined = dashboard?.ignite;
  const activity: DashboardActivity[] = dashboard?.recent_activity ?? [];
  const salesCalendar = (dashboard as any)?.sales_calendar as
    SalesCalendar | undefined;

  const calendarYear = getCalendarYear(salesCalendar);
  const calendarWeek = getCurrentCalendarWeek(salesCalendar);
  const calendarWeekStart = salesCalendar?.current_week?.start ?? "";
  const hasSalesCalendar = Boolean(salesCalendar);

  useEffect(() => {
    if (!hasSalesCalendar) return;

    setSelectedCvYear(calendarYear);
    setSelectedCvWeek(calendarWeek);
  }, [calendarYear, calendarWeek, calendarWeekStart, hasSalesCalendar]);

  const pairingsQuery = useGetPairingsQuery(
    (submittedCvFilters
      ? {
          year: submittedCvFilters.year,
          week_no: submittedCvFilters.week_no,
        }
      : undefined) as any,
    {
      skip: !submittedCvFilters,
      refetchOnMountOrArgChange: true,
    },
  ) as unknown as PairingsQueryResult;

  const handleCvSearch = () => {
    const nextFilters: CvSearchFilters = {
      year: selectedCvYear,
      week_no: selectedCvWeek,
    };

    if (
      submittedCvFilters?.year === nextFilters.year &&
      submittedCvFilters?.week_no === nextFilters.week_no
    ) {
      void pairingsQuery.refetch?.();
      return;
    }

    setSubmittedCvFilters(nextFilters);
  };

  const periodIgniteMetrics = getPairingsMetrics(pairingsQuery.data);

  const cvCounterIgnite = periodIgniteMetrics
    ? ({
        ...(ignite ?? {}),
        ...periodIgniteMetrics,
      } as IgniteDashboard)
    : ignite;

  const handleBankedTcPlacement = async (side: BankedTcSide) => {
    if (isPlacingBankedTc) return;

    if (!ignite?.ba_id) {
      toast.error("Distributor ID is not available.");
      return;
    }

    if (toNumber(ignite.tc_bank_available) <= 0) {
      toast.error("No Banked TC available.");
      setIsBankedTcModalOpen(false);
      return;
    }

    try {
      setPendingBankedTcSide(side);

      const response = await placeBankedTc({
        ba_id: ignite.ba_id,
        side,
      }).unwrap();

      if (response.success === false || response.status === false) {
        toast.error(response.message || "Unable to place Banked TC.");
        return;
      }

      toast.success(
        response.message ||
          `Banked TC placed on ${side === 1 ? "Left" : "Right"} Side successfully.`,
      );

      setIsBankedTcModalOpen(false);

      await refetch();
    } catch (error: unknown) {
      toast.error(
        readCaughtMessage(error, "data", "message") ||
          readCaughtMessage(error, "message") ||
          "Failed to place Banked TC. Please try again.",
      );
    } finally {
      setPendingBankedTcSide(null);
    }
  };

  if (!mounted || authStatus !== "authorized" || isLoading) {
    return <DashboardLoader />;
  }

  return (
    <div
      suppressHydrationWarning
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="distributor-dashboard flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#F5F7FC]"
    >
      <FontImport />

      <DashboardHeader distributorId={ignite?.ba_id || "N/A"} />

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#F5F7FC] px-2.5 py-3 sm:px-3 lg:px-4">
          <div className="w-full min-w-0">
            <WelcomeHero
              user={user}
              distributorId={ignite?.ba_id || "N/A"}
              gstValue={getDashboardGstValue(ignite)}
            />

            {isError && (
              <div
                role="alert"
                className="mt-3 flex min-w-0 flex-col items-start gap-2 rounded-[12px] border border-[#f2c6c3] bg-[#fff4f3] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                <p className="break-words text-[12px] font-semibold leading-5 text-[#b42318] sm:text-[13px]">
                  Unable to load the dashboard data. Please try again.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="shrink-0 rounded-[9px] bg-[#171717] px-4 py-2 text-[12px] font-semibold text-white transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <nav
              aria-label="Quick dashboard navigation"
              className="mt-3 rounded-[20px] border border-[#E2E9F3] bg-white p-3 shadow-[0_5px_18px_rgba(36,55,90,.035)] sm:p-3.5"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-extrabold text-[#1D2C46]">
                    What would you like to do?
                  </h2>
                  <p className="mt-1 text-[11px] text-[#718097]">
                    Choose an option to jump straight to the right section.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#8693A8]">
                  Quick actions
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    href: "#earnings",
                    label: "Check earnings",
                    note: "Wallet & profit",
                    icon: Wallet,
                    tone: "text-[#20825E]",
                    bg: "bg-[#E9F8F0]",
                  },
                  {
                    href: "#tracking",
                    label: "Track my CV",
                    note: "TC & weekly CV",
                    icon: BarChart3,
                    tone: "text-[#3268BE]",
                    bg: "bg-[#EAF1FF]",
                  },
                  {
                    href: "#accounts",
                    label: "Coin wallet",
                    note: "Redeem coins",
                    icon: Coins,
                    tone: "text-[#A36D15]",
                    bg: "bg-[#FFF3DD]",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      onClick={
                        action.href.startsWith("/")
                          ? (event) => {
                              event.preventDefault();
                              router.push(action.href);
                            }
                          : undefined
                      }
                      className="group flex min-w-0 items-center gap-2 rounded-[12px] border border-[#E7ECF4] bg-[#FCFDFF] p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3972CB] sm:p-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.tone} ${action.bg}`}
                      >
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-extrabold leading-5 text-[#263751]">
                          {action.label}
                        </span>
                        <span className="block text-[10px] leading-4 text-[#7A889C]">
                          {action.note}
                        </span>
                      </span>
                      <ChevronRight
                        size={15}
                        className="hidden shrink-0 text-[#92A4BE] sm:block"
                      />
                    </a>
                  );
                })}
              </div>
            </nav>

            <QuickStatsCards ignite={ignite} />

            <DashboardTrackingCenter
              dashboardData={dashboard}
              ignite={ignite}
            />

            <CoinsAndAccountStatusOverview
              ignite={ignite}
              onRedeemSuccess={() => {
                void refetch();
              }}
            />

            <LatestOrderSection order={dashboard?.latest_order ?? null} />
            <RecentActivity activity={activity} />
            <AccountSummary ignite={ignite} />
            <AccountTable
              ignite={ignite}
              onOpenBankedTc={() => setIsBankedTcModalOpen(true)}
            />

            <EarnedCoinsAndNetwork
              ignite={ignite as ExtendedIgnite | null | undefined}
            />
            <LedgerHistory
              entries={
                (ignite as ExtendedIgnite | null | undefined)
                  ?.commissions_history
              }
            />

            {isFetching && !isLoading && (
              <div className="mt-2 flex items-center justify-end gap-2 text-[11px] font-semibold text-[#777777]">
                <Loader2 size={13} className="animate-spin" />

                <span>Updating dashboard...</span>
              </div>
            )}
          </div>
        </main>
      </div>

      <BankedTcModal
        isOpen={isBankedTcModalOpen}
        availableCount={toNumber(ignite?.tc_bank_available)}
        isLoading={isPlacingBankedTc}
        pendingSide={pendingBankedTcSide}
        onClose={() => setIsBankedTcModalOpen(false)}
        onSelectSide={handleBankedTcPlacement}
      />
    </div>
  );
}
