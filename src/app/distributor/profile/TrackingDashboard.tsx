"use client";

import {
    ShoppingBag,
    TrendingUp,
    Layers,
    IndianRupee,
    Coins,
    Award,
    BadgeCheck,
    CheckCircle2,
    Clock3,
    Loader2,
    AlertCircle,
    RefreshCw,
    UserRound,
    CalendarDays,
    Mail,
    Phone,
} from "lucide-react";

import { useMemo } from "react";

import { useGetDistributorStatsQuery } from "../../../lib/redux/api/distributor/distributorStatsApi";

import type {
    DistributorRank,
    DistributorStatsData,
    RankCondition,
    RankProgress,
} from "../../../lib/redux/api/distributor/distributorStatsApi";
import Loding from "@/components/common/Loding";

interface TrackingDashboardProps {
    variant?: "cv" | "commission";
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const FontImport = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
  `}</style>
);

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === "") {
        return 0;
    }
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

function formatNumber(value: number | string | null | undefined): string {
    return toNumber(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
}

function formatCurrency(value: number | string | null | undefined): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(toNumber(value));
}

function formatStatus(value?: string | null): string {
    if (!value) return "N/A";
    return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getRankName(
    rankNo: number | undefined | null,
    ranks: DistributorRank[],
): string {
    if (!rankNo || rankNo <= 0) {
        return "Not ranked";
    }
    const rank = ranks.find((item) => item.rank_no === rankNo);
    return rank?.name ?? `Rank ${rankNo}`;
}

// --------------------------------------------------
// LOADER & ERROR
// --------------------------------------------------

function DashboardLoader() {
    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="flex min-h-[350px] w-full items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white"
        >
            <FontImport />
            <div className="flex flex-col items-center gap-3">
                <Loding />
            </div>
        </div>
    );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
            <AlertCircle size={34} className="text-[#c0392b]" />
            <h2 className="mt-3 text-[17px] font-bold text-[#101828]">
                Unable to load dashboard
            </h2>
            <p className="mt-1 max-w-md text-[13px] text-[#667085]">
                Distributor statistics could not be retrieved. Check your connection and try again.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[13px] font-semibold text-white"
                style={{ backgroundColor: NAVY }}
            >
                <RefreshCw size={15} />
                Retry
            </button>
        </div>
    );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    background,
}: {
    label: string;
    value: string | number;
    icon: typeof ShoppingBag;
    color: string;
    background: string;
}) {
    return (
        <div className="flex min-h-[88px] min-w-0 items-center gap-3 rounded-[14px] border border-[#e7e9ee] bg-white p-3 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)] sm:gap-4 sm:p-4">
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: background }}
            >
                <Icon size={20} style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold leading-4 text-[#667085] sm:text-[12px]">
                    {label}
                </p>
                <p
                    title={String(value)}
                    className="mt-1 break-words text-[15px] font-black leading-6 text-[#101828] sm:text-[16px]"
                    style={{ overflowWrap: "anywhere" }}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

// --------------------------------------------------
// DONUT CHART
// --------------------------------------------------

interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

function DonutChart({
    segments,
    total,
}: {
    segments: DonutSegment[];
    total: number;
}) {
    const size = 190;
    const stroke = 25;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    let offsetAcc = 0;

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-[190px] w-[190px]">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="-rotate-90"
                >
                    <defs>
                        {segments.map((segment, index) => (
                            <linearGradient
                                key={segment.label}
                                id={`rankSegmentGradient${index}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={segment.color} stopOpacity="0.72" />
                            </linearGradient>
                        ))}
                    </defs>

                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#eef0f4"
                        strokeWidth={stroke}
                    />

                    {segments.map((segment, index) => {
                        const dash = total > 0 ? (segment.value / total) * circumference : 0;
                        const dashOffset = -offsetAcc;
                        offsetAcc += dash;

                        if (dash <= 0) return null;

                        return (
                            <circle
                                key={segment.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={`url(#rankSegmentGradient${index})`}
                                strokeWidth={stroke}
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[30px] font-black text-[#101828]">{total}</p>
                    <p className="text-[11.5px] font-semibold text-[#8a92a6]">Total ranks</p>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// DISTRIBUTOR PROFILE
// --------------------------------------------------

function DistributorProfile({ data }: { data: DistributorStatsData }) {
    const accountDetails = [
        { label: "Total CV", value: formatNumber(data.total_cv), color: INDIGO },
        { label: "Total MRP", value: formatCurrency(data.total_amount_mrp), color: NAVY },
        { label: "Total savings", value: formatCurrency(data.total_savings), color: EMERALD },
        { label: "Coins redeemed", value: formatNumber(data.total_coins_redeemed), color: BRASS },
    ];

    return (
        <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eceffb]">
                        <UserRound size={24} className="text-[#3955A6]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="break-words text-[17px] font-bold text-[#101828]">
                            {data.full_name}
                        </h3>
                        <p className="mt-1 break-all text-[12px] font-medium text-[#667085]">
                            {data.distributor_id}
                        </p>
                    </div>
                </div>
                <span className="rounded-full bg-[#eaf7f0] px-3 py-1.5 text-[11px] font-bold text-[#1f9d6b]">
                    {formatStatus(data.account_type)}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 border-b border-[#e7e9ee] pb-5 sm:grid-cols-2">
                <div className="flex min-w-0 items-start gap-2">
                    <Mail size={15} className="mt-0.5 shrink-0 text-[#8a92a6]" />
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">Email</p>
                        <p className="mt-1 break-all text-[12px] font-semibold text-[#344054]">{data.email || "N/A"}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-start gap-2">
                    <Phone size={15} className="mt-0.5 shrink-0 text-[#8a92a6]" />
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">Phone</p>
                        <p className="mt-1 break-all text-[12px] font-semibold text-[#344054]">{data.phone || "N/A"}</p>
                    </div>
                </div>
                <div className="flex min-w-0 items-start gap-2 sm:col-span-2">
                    <CalendarDays size={15} className="mt-0.5 shrink-0 text-[#8a92a6]" />
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">Joined at</p>
                        <p className="mt-1 text-[12px] font-semibold text-[#344054]">{data.joined_at || "N/A"}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {accountDetails.map((item) => (
                    <div key={item.label} className="min-w-0 rounded-[11px] border border-[#edf0f3] bg-[#fafcff] p-3">
                        <p className="text-[11px] font-semibold text-[#667085]">{item.label}</p>
                        <p
                            className="mt-2 break-words text-[16px] font-black sm:text-[18px]"
                            style={{ color: item.color, overflowWrap: "anywhere" }}
                        >
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// --------------------------------------------------
// NEXT RANK PROGRESS
// --------------------------------------------------

function getConditionLabel(key: string): string {
    const labels: Record<string, string> = {
        steps: "Steps",
        direct_cv: "Direct CV",
        downlines_one_below: "Downlines one rank below",
        downlines_two_below: "Downlines two ranks below",
        tenure: "Tenure",
    };
    return labels[key] ?? formatStatus(key);
}

function formatConditionValue(key: string, condition: RankCondition): string {
    const current = formatNumber(condition.current);
    const required = formatNumber(condition.required);

    if (key === "downlines_one_below" || key === "downlines_two_below") {
        return `${current} / ${required}`;
    }
    if (key === "direct_cv") {
        return `${current} / ${required} CV`;
    }
    if (key === "tenure") {
        return `${current} / ${required} tenure`;
    }
    return `${current} / ${required}`;
}

function NextRankProgress({ rankProgress }: { rankProgress: RankProgress }) {
    const { ranks = [], current } = rankProgress;
    const nextRank =
        ranks.find((rank) => rank.rank_no > (current?.rank_no ?? 0) && !rank.met) ??
        ranks.find((rank) => !rank.met);

    if (!nextRank) {
        return (
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5">
                <div className="flex items-center gap-2">
                    <Award size={19} style={{ color: BRASS }} />
                    <h3 className="text-[16px] font-bold text-[#101828]">Next rank progress</h3>
                </div>
                <div className="mt-5 rounded-[12px] bg-[#eaf7f0] p-4">
                    <p className="text-[14px] font-bold text-[#1f9d6b]">
                        All available rank requirements are met.
                    </p>
                </div>
            </section>
        );
    }

    const conditionItems = Object.entries(
        nextRank.conditions ?? {},
    ) as [keyof typeof nextRank.conditions, RankCondition][];

    const completedConditions = conditionItems.filter(([, condition]) => condition?.met).length;
    const progress =
        conditionItems.length > 0
            ? Math.round((completedConditions / conditionItems.length) * 100)
            : 0;

    return (
        <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={19} style={{ color: INDIGO }} />
                    <h3 className="text-[16px] font-bold text-[#101828]">Next rank progress</h3>
                </div>
                <span className="rounded-full bg-[#f8f1e4] px-3 py-1 text-[11px] font-bold text-[#92713f]">
                    {nextRank.name}
                </span>
            </div>

            <div className="mt-4">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[12px] font-semibold text-[#667085]">Conditions met</p>
                        <p className="mt-1 text-[22px] font-black text-[#101828]">
                            {completedConditions} / {conditionItems.length}
                        </p>
                    </div>
                    <p className="text-[16px] font-bold text-[#3955A6]">{progress}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef0f4]">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: INDIGO }}
                    />
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {conditionItems.map(([key, condition]) => (
                    <div
                        key={key}
                        className="flex items-start justify-between gap-3 border-b border-[#f0f2f5] pb-3 last:border-b-0 last:pb-0"
                    >
                        <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-[#344054]">
                                {getConditionLabel(key)}
                            </p>
                            <p className="mt-1 break-words text-[11px] text-[#8a92a6]">
                                {formatConditionValue(key, condition)}
                            </p>
                            {(key === "downlines_one_below" || key === "downlines_two_below") &&
                                condition.rank_no !== undefined && (
                                    <p className="mt-1 text-[10px] text-[#8a92a6]">
                                        Required downline rank: {getRankName(condition.rank_no, ranks)}
                                    </p>
                                )}
                        </div>
                        <span
                            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                                condition.met ? "bg-[#eaf7f0] text-[#1f9d6b]" : "bg-[#fff4e0] text-[#b7791f]"
                            }`}
                        >
                            {condition.met ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                            {condition.met ? "Met" : "Pending"}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

// --------------------------------------------------
// RANK LADDER (Connected timeline with colors)
// --------------------------------------------------

function RankLadder({ rankProgress }: { rankProgress: RankProgress }) {
    const { ranks = [], current } = rankProgress;

    const getPrerequisiteText = (rankNo: number) => {
        if (rankNo === 1) return "Starting rank";
        const prevRankName = getRankName(rankNo - 1, ranks);
        return `Must have achieved the ${prevRankName} rank`;
    };

    const getDownlineRequirementText = (rank: DistributorRank) => {
        const dl1 = rank.conditions?.downlines_one_below;
        const dl2 = rank.conditions?.downlines_two_below;

        const parts = [];
        if (dl1 && dl1.required > 0) {
            parts.push(`${dl1.required} downline(s) at ${getRankName(dl1.rank_no, ranks)}`);
        }
        if (dl2 && dl2.required > 0) {
            parts.push(`${dl2.required} downline(s) at ${getRankName(dl2.rank_no, ranks)}`);
        }

        return parts.length > 0 ? parts.join(" & ") : "No downline requirement";
    };

    const getRankColor = (rank: DistributorRank, isCurrent: boolean, isAchieved: boolean) => {
        if (isCurrent) return INDIGO;
        if (isAchieved) return EMERALD;
        return "#cbd5e1";
    };

    return (
        <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e7e9ee] pb-4">
                <h3 className="text-[18px] font-bold text-[#101828]">Ranks chart</h3>
                <span className="rounded-full bg-[#f2f4f7] px-3 py-1.5 text-[11px] font-bold text-[#344054]">
                    Current Rank: {getRankName(current?.rank_no, ranks)}
                </span>
            </div>

            {ranks.length === 0 ? (
                <p className="mt-5 text-[13px] text-[#667085]">No rank definitions are available.</p>
            ) : (
                <div className="relative mt-6">
                    {ranks.map((rank, index) => {
                        const isCurrent = rank.rank_no === current?.rank_no;
                        const isAchieved = rank.met;
                        const isNext = index > 0 && ranks[index - 1].met && !rank.met;
                        const isLast = index === ranks.length - 1;
                        const nodeColor = getRankColor(rank, isCurrent, isAchieved);
                        const lineColor = isAchieved || isCurrent ? EMERALD : "#e5e9ef";

                        return (
                            <div key={rank.rank_no} className="relative flex gap-4 pb-6 last:pb-0">
                                {/* Connector column */}
                                <div className="relative flex w-6 shrink-0 flex-col items-center">
                                    {/* Top connector (not for first) */}
                                    {index > 0 && (
                                        <div
                                            className="absolute top-0 h-3 w-[2px]"
                                            style={{ backgroundColor: lineColor }}
                                        />
                                    )}
                                    {/* Node */}
                                    <div
                                        className="relative z-10 mt-3 flex h-4 w-4 items-center justify-center rounded-full border-2"
                                        style={{
                                            borderColor: nodeColor,
                                            backgroundColor: isCurrent || isAchieved ? nodeColor : "#fff",
                                        }}
                                    >
                                        {(isCurrent || isAchieved) && (
                                            <CheckCircle2 size={9} className="text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                    {/* Bottom connector (not for last) */}
                                    {!isLast && (
                                        <div
                                            className="absolute top-7 bottom-0 w-[2px]"
                                            style={{ backgroundColor: lineColor }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[16px] font-bold text-[#101828]">
                                            {rank.name}
                                        </p>
                                        {isAchieved ? (
                                            <span className="flex items-center gap-1 rounded-full bg-[#eaf7f0] px-2 py-0.5 text-[10px] font-bold text-[#1f9d6b]">
                                                <CheckCircle2 size={10} /> Achieved
                                            </span>
                                        ) : isCurrent ? (
                                            <span className="flex items-center gap-1 rounded-full bg-[#eceffb] px-2 py-0.5 text-[10px] font-bold text-[#3955A6]">
                                                <Award size={10} /> Current
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold text-[#667085]">
                                                <Clock3 size={10} /> Pending
                                            </span>
                                        )}
                                        {isNext && (
                                            <span className="rounded-full bg-[#f8f1e4] px-2 py-0.5 text-[10px] font-bold text-[#92713f]">
                                                Next
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-[11px] text-[#8a92a6]">
                                        {getPrerequisiteText(rank.rank_no)}
                                    </p>

                                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <div className="rounded-[9px] border border-[#edf0f3] bg-[#fafcff] p-2.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">
                                                Steps
                                            </p>
                                            <p className="mt-1 text-[12px] font-bold text-[#344054]">
                                                {formatNumber(rank.conditions?.steps?.current)} /{" "}
                                                {formatNumber(rank.conditions?.steps?.required)}
                                            </p>
                                        </div>
                                        <div className="rounded-[9px] border border-[#edf0f3] bg-[#fafcff] p-2.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">
                                                Direct CV
                                            </p>
                                            <p className="mt-1 text-[12px] font-bold text-[#344054]">
                                                {formatNumber(rank.conditions?.direct_cv?.current)} /{" "}
                                                {formatNumber(rank.conditions?.direct_cv?.required)}
                                            </p>
                                        </div>
                                        <div className="rounded-[9px] border border-[#edf0f3] bg-[#fafcff] p-2.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a92a6]">
                                                Downline requirement
                                            </p>
                                            <p className="mt-1 break-words text-[12px] font-bold text-[#344054]">
                                                {getDownlineRequirementText(rank)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

// --------------------------------------------------
// RANK QUALIFICATION
// --------------------------------------------------

function RankQualification({ rankProgress }: { rankProgress: RankProgress }) {
    const ranks = rankProgress.ranks ?? [];
    const achieved = ranks.filter((rank) => rank.met).length;
    const remaining = Math.max(0, ranks.length - achieved);

    const segments = [
        { label: "Qualified ranks", value: achieved, color: EMERALD },
        { label: "Remaining ranks", value: remaining, color: BRASS },
    ];

    return (
        <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-5 sm:p-6">
            <h3 className="text-[17px] font-bold text-[#101828]">Rank qualification</h3>
            <p className="mt-1 text-[12px] text-[#667085]">
                Qualification summary from the distributor stats API
            </p>

            <div className="mt-4 flex justify-center">
                <DonutChart segments={segments} total={ranks.length} />
            </div>

            <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {segments.map((segment) => (
                    <span key={segment.label} className="flex items-center gap-1.5 text-[11px] font-medium text-[#667085]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                    </span>
                ))}
            </div>

            <div className="mt-6 border-t border-[#e7e9ee] pt-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#f0f2f5] pb-3">
                    <span className="text-[12px] font-medium text-[#667085]">Qualified ranks</span>
                    <span className="text-[14px] font-black text-[#1f9d6b]">{achieved}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[#f0f2f5] py-3">
                    <span className="text-[12px] font-medium text-[#667085]">Remaining ranks</span>
                    <span className="text-[14px] font-black text-[#b7791f]">{remaining}</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3">
                    <span className="text-[12px] font-medium text-[#667085]">Current rank</span>
                    <span className="text-[13px] font-bold text-[#3955A6]">
                        {getRankName(rankProgress.current?.rank_no, ranks)}
                    </span>
                </div>
                <div className="mt-4 rounded-[10px] px-4 py-3" style={{ backgroundColor: NAVY }}>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold text-white">Eligible rank</span>
                        <span className="text-[13px] font-bold text-white">
                            {getRankName(rankProgress.current?.eligible_rank_no, ranks)}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

const TrackingDashboard = ({ variant = "cv" }: TrackingDashboardProps) => {
    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetDistributorStatsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const data = response?.data;
    const rankProgress = data?.rank_progress ?? null;
    const ranks = rankProgress?.ranks ?? [];

    const statCards = useMemo(() => {
        if (!data) return [];
        const current = rankProgress?.current;

        return [
            { label: "Total orders", value: formatNumber(data.total_orders), icon: ShoppingBag, color: INDIGO, bg: "#eceffb" },
            { label: "Total MRP", value: formatCurrency(data.total_amount_mrp), icon: IndianRupee, color: NAVY, bg: "#eceefb" },
            { label: "Total savings", value: formatCurrency(data.total_savings), icon: TrendingUp, color: EMERALD, bg: "#eaf7f0" },
            { label: "Total CV", value: formatNumber(data.total_cv), icon: Layers, color: BRASS, bg: "#f8f1e4" },
            { label: "Coins redeemed", value: formatNumber(data.total_coins_redeemed), icon: Coins, color: INDIGO, bg: "#eceffb" },
            { label: "Current rank", value: getRankName(current?.rank_no, ranks), icon: Award, color: BRASS, bg: "#f8f1e4" },
            { label: "Eligible rank", value: getRankName(current?.eligible_rank_no, ranks), icon: BadgeCheck, color: EMERALD, bg: "#eaf7f0" },
        ];
    }, [data, rankProgress, ranks]);

    if (isLoading) return <DashboardLoader />;
    if (isError || response?.success === false) return <DashboardError onRetry={() => void refetch()} />;
    if (!data || !rankProgress) return <DashboardError onRetry={() => void refetch()} />;

    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="w-full min-w-0 space-y-6">
            <FontImport />

            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828]">
                        {variant === "cv" ? "Rank Tracking Dashboard" : "Commission & Rank Dashboard"}
                    </h1>
                    <p className="text-[12px] text-[#667085] sm:text-[13px]">
                        Distributor performance and rank qualification
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="hidden h-10 items-center gap-2 rounded-[10px] border border-[#e5e9ef] bg-white px-4 text-[12px] font-semibold text-[#1a2332] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                >
                    <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                    {isFetching ? "Refreshing..." : "Refresh stats"}
                </button>
            </div>

            {/* TOP STATS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {statCards.map((item) => (
                    <StatCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={item.color}
                        background={item.bg}
                    />
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* LEFT COLUMN */}
                <div className="min-w-0 space-y-6">
                    <DistributorProfile data={data} />
                    <RankLadder rankProgress={rankProgress} />
                </div>

                {/* RIGHT COLUMN */}
                <div className="min-w-0 space-y-6">
                    <RankQualification rankProgress={rankProgress} />
                    <NextRankProgress rankProgress={rankProgress} />
                </div>
            </div>

            {/* REFRESH INDICATOR */}
            {isFetching && (
                <div className="flex items-center justify-end gap-2 text-[11px] font-semibold text-[#667085]">
                    <Loader2 size={13} className="animate-spin" />
                    Updating distributor statistics...
                </div>
            )}
        </div>
    );
};

export default TrackingDashboard;