
"use client";

import { useGetDistributorStatsQuery } from "@/lib/redux/api/distributor/distributorStatsApi";

import {
  TrendingUp,
  Database,
  CalendarDays,
  Link2,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* =========================================================
   COLORS
========================================================= */

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const INDIGO = "#3955A6";
const PLUM = "#6B4C9A";

const RANK_COLORS = [
  NAVY,
  INDIGO,
  BRASS,
  "#6B4C9A",
  "#0D9488",
  "#C05621",
  "#39815B",
  "#98a2b3",
];

/* =========================================================
   TYPES
========================================================= */

type RankCondition = {
  rank_no?: number;
  current?: number | string;
  required?: number | string;
  met?: boolean;
};

type RankRecord = {
  rank_no: number;
  name: string;
  step_comm?: number | string;
  max_weekly_steps?: number;
  met?: boolean;
  conditions?: {
    steps?: RankCondition;
    direct_cv?: RankCondition;
    downlines_one_below?: RankCondition;
    downlines_two_below?: RankCondition;
    tenure?: RankCondition;
  };
};

type DistributorStats = {
  distributor_id?: string;
  full_name?: string;
  total_cv?: number | string;
  rank_progress?: {
    current?: {
      rank_no?: number;
      base_rank_no?: number;
      eligible_rank_no?: number;
    };
    closing?: {
      rank_no?: number;
      met_rank_no?: number;
      eligible_rank_no?: number;
    };
    sales_month?: {
      year?: number;
      month_no?: number;
      label?: string;
      start_date?: string;
      end_date?: string;
    };
    ranks?: RankRecord[];
  };
};

type ApiResponse = {
  success?: boolean;
  data?: DistributorStats;
  message?: string;
};

/* =========================================================
   FONT
========================================================= */

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
  `}</style>
);

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (
  value: number | string | undefined | null
): string => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
};

const formatCurrency = (
  value: number | string | undefined
): string => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDate = (date?: string): string => {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRankColor = (rankNo: number): string => {
  return RANK_COLORS[(rankNo - 1) % RANK_COLORS.length] || NAVY;
};

/* =========================================================
   DOWNLINE REQUIREMENT
========================================================= */

const getDownlineRequirement = (
  rank: RankRecord,
  allRanks: RankRecord[]
): string => {
  const conditions = rank.conditions;

  const downlineConditions = [
    conditions?.downlines_one_below,
    conditions?.downlines_two_below,
  ];

  const requirements = downlineConditions
    .map((condition) => {
      const required = Number(condition?.required ?? 0);

      if (!required) return null;

      const requiredRankNo = Number(condition?.rank_no ?? 0);

      const requiredRank = allRanks.find(
        (item) => item.rank_no === requiredRankNo
      );

      const rankName = requiredRank?.name || `Rank ${requiredRankNo}`;

      return `${formatNumber(required)} downlines with ${rankName} rank or above`;
    })
    .filter(Boolean);

  return requirements.length
    ? requirements.join(" and ")
    : "No downline requirement";
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const RankInformationSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 rounded-lg bg-gray-200" />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-[84px] rounded-[14px] border border-gray-100 bg-gray-100"
        />
      ))}
    </div>

    <div className="h-20 w-64 rounded-[14px] bg-gray-100" />

    <div className="space-y-8 rounded-[16px] border border-gray-100 bg-white p-6 sm:p-8">
      <div className="h-7 w-40 rounded bg-gray-200" />

      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-20 rounded-lg bg-gray-100" />
      ))}
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const RankInformation = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetDistributorStatsQuery();

  /*
    Supports both:
    1. { success: true, data: {...} }
    2. Direct transformed response: {...}
  */

  const response = data as unknown as
    | ApiResponse
    | DistributorStats
    | undefined;

  const stats = (
    response && "data" in response && response.data
      ? response.data
      : response
  ) as DistributorStats | undefined;

  /* =======================================================
     API DATA
  ======================================================= */

  const rankProgress = stats?.rank_progress;

  const ranks = [...(rankProgress?.ranks || [])].sort(
    (a, b) => a.rank_no - b.rank_no
  );

  const currentRankNo = Number(
    rankProgress?.current?.rank_no ?? 0
  );

  const currentRank = ranks.find(
    (rank) => rank.rank_no === currentRankNo
  );

  const salesMonth = rankProgress?.sales_month;

  /* =======================================================
     STATS CARDS
  ======================================================= */

  const STAT_CARDS = [
    {
      label: "Direct CV",
      value: formatNumber(
        currentRank?.conditions?.direct_cv?.current
      ),
      icon: TrendingUp,
      color: INDIGO,
      bg: "#eceffb",
    },
    {
      label: "Steps",
      value: formatNumber(
        currentRank?.conditions?.steps?.current
      ),
      icon: Database,
      color: BRASS,
      bg: "#f8f1e4",
    },
    {
      label: "Rank period ends",
      value: formatDate(salesMonth?.end_date),
      icon: CalendarDays,
      color: NAVY,
      bg: "#eceefb",
    },
    {
      label: "Step commission",
      value: formatCurrency(currentRank?.step_comm),
      icon: Link2,
      color: PLUM,
      bg: "#f1ebf7",
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div style={{ fontFamily: "'Lato', sans-serif" }}>
        <FontImport />
        <RankInformationSkeleton />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <p className="text-sm font-semibold text-red-600">
          Unable to load distributor rank information.
        </p>

        <p className="mt-1 text-xs text-red-500">
          Please try again later.
        </p>
      </div>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!stats) {
    return (
      <div
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="rounded-xl border border-[#e7e9ee] bg-white p-8 text-center"
      >
        <p className="text-sm font-semibold text-[#475066]">
          No distributor information available.
        </p>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="space-y-6"
    >
      <FontImport />

      {/* ================= HEADING ================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">
            Rank Information
          </h1>

          {salesMonth?.label && (
            <p className="mt-1 text-[12px] font-medium text-[#98a2b3]">
              Sales Month: {salesMonth.label}
            </p>
          )}
        </div>

        {isFetching && !isLoading && (
          <span className="text-xs font-semibold text-[#98a2b3]">
            Updating...
          </span>
        )}
      </div>

      {/* ================= TOP STATS CARDS ================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(
          ({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex h-[84px] min-w-0 items-center gap-4 rounded-[14px] border border-[#e7e9ee] bg-white p-4 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: bg }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color }}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-[#667085]">
                  {label}
                </p>

                <p
                  className="mt-1 truncate text-[19px] font-black"
                  style={{
                    color:
                      label === "Rank period ends"
                        ? color
                        : "#101828",
                  }}
                >
                  {value}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ================= DISTRIBUTOR INFO CARD ================= */}

      <div className="flex w-fit min-w-[240px] max-w-full items-center gap-3 rounded-[14px] border border-[#e7e9ee] bg-white p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "#eceefb" }}
        >
          <User className="h-5 w-5" style={{ color: NAVY }} />
        </div>

        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-[#667085]">
            Distributor ID
          </p>

          <p
            className="break-all text-[16px] font-bold"
            style={{ color: NAVY }}
          >
            {stats.distributor_id || "—"}
          </p>
        </div>
      </div>

      {/* ================= RANKS CHART ================= */}

      <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[18px] font-bold text-[#101828]">
            Ranks chart
          </h3>

          {currentRank && (
            <div
              className="rounded-full px-3 py-1.5 text-[11px] font-bold"
              style={{
                color: getRankColor(currentRank.rank_no),
                backgroundColor: `${getRankColor(currentRank.rank_no)}14`,
              }}
            >
              Current Rank: {currentRank.name}
            </div>
          )}
        </div>

        {/* Column headers */}

        <div className="mt-6 hidden grid-cols-[1.2fr_1.4fr_0.8fr_1fr_1.6fr] gap-6 border-b border-[#e7e9ee] pb-3 pl-10 text-[11px] font-bold tracking-wide text-[#8a92a6] lg:grid">
          {[
            "Rank",
            "Prerequisite",
            "Steps",
            "Direct CV",
            "Downline requirement",
          ].map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>

        {/* ================= RANK TIMELINE ================= */}

        {ranks.length > 0 ? (
          <div className="mt-6 space-y-8">
            {ranks.map((rank, idx) => {
              const rankColor = getRankColor(rank.rank_no);

              const previousRank = ranks.find(
                (item) => item.rank_no === rank.rank_no - 1
              );

              const prerequisite = previousRank
                ? `Must have achieved the ${previousRank.name} rank`
                : "Starting rank";

              const stepsCurrent =
                rank.conditions?.steps?.current ?? 0;

              const stepsRequired =
                rank.conditions?.steps?.required ?? 0;

              const cvCurrent =
                rank.conditions?.direct_cv?.current ?? 0;

              const cvRequired =
                rank.conditions?.direct_cv?.required ?? 0;

              const downlineRequirement =
                getDownlineRequirement(rank, ranks);

              return (
                <div
                  key={rank.rank_no}
                  className="flex gap-4"
                >
                  {/* Marker column */}

                  <div className="flex w-4 shrink-0 flex-col items-center self-stretch">
                    <span
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                      style={{ backgroundColor: rankColor }}
                    >
                      {rank.met && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>

                    {idx !== ranks.length - 1 && (
                      <span
                        className="mt-1 w-[2px] flex-1 rounded-full"
                        style={{ backgroundColor: "#e7e9ee" }}
                      />
                    )}
                  </div>

                  {/* Rank details */}

                  <div className="min-w-0 flex-1 pb-2 lg:grid lg:grid-cols-[1.2fr_1.4fr_0.8fr_1fr_1.6fr] lg:gap-6">

                    {/* RANK */}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className="text-[19px] font-black"
                          style={{ color: rankColor }}
                        >
                          {rank.name}
                        </h4>

                        {rank.met ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f8ef] px-2 py-1 text-[10px] font-bold text-[#16834b]">
                            <CheckCircle2 className="h-3 w-3" />
                            Achieved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f4f7] px-2 py-1 text-[10px] font-bold text-[#667085]">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[11px] font-semibold text-[#98a2b3]">
                        {rank.rank_no === currentRankNo
                          ? "Current rank"
                          : rank.rank_no < currentRankNo
                            ? "Previous rank"
                            : "Next rank"}
                      </p>
                    </div>

                    {/* PREREQUISITE */}

                    <div className="mt-4 lg:mt-0">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#98a2b3] lg:hidden">
                        Prerequisite
                      </p>

                      <p className="text-[13px] leading-relaxed text-[#475066]">
                        {prerequisite}
                      </p>
                    </div>

                    {/* STEPS */}

                    <div className="mt-3 lg:mt-0">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#98a2b3] lg:hidden">
                        Steps
                      </p>

                      <p className="text-[13px] text-[#475066]">
                        {formatNumber(stepsCurrent)} /{" "}
                        {formatNumber(stepsRequired)} steps
                      </p>
                    </div>

                    {/* DIRECT CV */}

                    <div className="mt-3 lg:mt-0">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#98a2b3] lg:hidden">
                        Direct CV
                      </p>

                      <p className="text-[13px] text-[#475066]">
                        {formatNumber(cvCurrent)} /{" "}
                        {formatNumber(cvRequired)} CV
                      </p>
                    </div>

                    {/* DOWNLINE REQUIREMENT */}

                    <div className="mt-3 lg:mt-0">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#98a2b3] lg:hidden">
                        Downline requirement
                      </p>

                      <p className="text-[13px] leading-relaxed text-[#475066]">
                        {downlineRequirement}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-[#667085]">
              No rank information available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankInformation;
