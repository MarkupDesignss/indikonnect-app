"use client";

import { useMemo, useState } from "react";
import {
    Activity, AlertCircle, ArrowDownLeft, ArrowUpRight, CalendarDays,
    CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Coins,
    Filter, History, Inbox, Loader2, RefreshCw, Search, Wallet, X,
} from "lucide-react";
import { useGetCommissionsHistoryQuery } from "@/lib/redux/api/distributor/commissionsHistoryApi";
import type { CommissionHistoryItem } from "@/lib/redux/api/distributor/commissionsHistoryApi";

// =====================================================
// COMMISSION CARDS
// API history has no authoritative retail/pairing/strong-leg totals.
// Never display hardcoded ₹0.00 as an actual earned balance.
// =====================================================
const CARD = "rounded-2xl border border-[#E7ECF3] bg-white shadow-[0_5px_24px_rgba(15,35,70,0.035)]";
const PAGE_SIZES = [10, 20, 50];

// =====================================================
// FILTER OPTIONS
// =====================================================
const FILTER_OPTIONS = [
    { label: "All types", value: "all" },
    { label: "Cash balance", value: "cash_bal" },
    { label: "Green balance", value: "green_bal" },
    { label: "Yellow balance", value: "yellow_bal" },
    { label: "Blue balance", value: "blue_bal" },
    { label: "Credit", value: "cr" },
    { label: "Withdrawal", value: "wd" },
    { label: "Adjustment", value: "adj" },
];

// =====================================================
// CATEGORY LABEL
// =====================================================
const humanize = (raw: unknown): string =>
    String(raw ?? "")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase()) || "Not specified";

const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
        cash_bal: "Cash Balance", green_bal: "Green Coin",
        yellow_bal: "Yellow Coin", blue_bal: "Blue Coin",
    };
    return categories[category] || humanize(category);
};

// =====================================================
// TRANSACTION DESCRIPTION
// =====================================================
const getDescriptionLabel = (description: string) => {
    const descriptions: Record<string, string> = {
        adj_add: "Adjustment Added", adj_remove: "Adjustment Removed",
        wd_partner_payout: "Partner Payout", cr_out: "Credit Transfer Out",
        cr_in: "Credit Transfer In",
    };
    return descriptions[description] || humanize(description);
};

// =====================================================
// FORMAT DATE
// API timestamps might be timezone-less. Preserve date/time components.
// =====================================================
const formatDate = (raw: string | null | undefined) => {
    if (!raw) return "Not available";
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!match) return raw;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[Number(match[2]) - 1] ?? match[2];
    return `${match[3]} ${month} ${match[1]}${match[4] ? ` · ${match[4]}:${match[5]}` : ""}`;
};

// =====================================================
// FORMAT AMOUNT
// The API item has no explicit currency/unit for every category.
// Avoid adding ₹ or $ to coin transactions or unverified cash amounts.
// =====================================================
const formatAmount = (amount: string | number | null | undefined) => {
    if (amount == null || amount === "") return "Not available";
    const num = Number(amount);
    return Number.isFinite(num)
        ? num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 4 })
        : String(amount);
};

const getAmountColor = (amount: string | number) =>
    Number(amount) > 0 ? "text-[#16845B]" : Number(amount) < 0 ? "text-[#C45353]" : "text-[#6D7889]";

// =====================================================
// RELATED MEMBER
// =====================================================
const getRelatedMember = (member: CommissionHistoryItem["related_member"]): string => {
    if (member == null || member === "") return "Not available";
    if (typeof member === "string" || typeof member === "number") return String(member);
    if (typeof member === "object") {
        const data = member as Record<string, unknown>;
        const value = data.account_id ?? data.ba_id ?? data.member_id ?? data.name;
        return value == null ? "Not available" : String(value);
    }
    return "Not available";
};

// =====================================================
// ERROR MESSAGE
// =====================================================
const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object") {
        const apiError = error as { data?: { message?: string }; error?: string; message?: string };
        return apiError.data?.message || apiError.error || apiError.message || "Unable to load commissions history.";
    }
    return "Unable to load commissions history. Please try again.";
};

const getReleasedDate = (item: CommissionHistoryItem): string | null => {
    // Respect optional backend release fields only if actually returned.
    const record = item as CommissionHistoryItem & { date_released?: string | null; released_at?: string | null };
    return record.date_released ?? record.released_at ?? null;
};

const getCategoryTone = (category: string) => {
    const key = category.toLowerCase();
    if (key.includes("green")) return "bg-[#E8F7EF] text-[#178257] border-[#D5EBDF]";
    if (key.includes("yellow")) return "bg-[#FFF7E4] text-[#A8751C] border-[#F7E8C4]";
    if (key.includes("blue")) return "bg-[#EDF3FF] text-[#416CBD] border-[#DCE6FC]";
    return "bg-[#F2F5FA] text-[#4E607B] border-[#E4E9F1]";
};

type StatProps = {
    label: string;
    value: number | string;
    note: string;
    icon: typeof Wallet;
    tone: string;
    bg: string;
};

function StatCard({ label, value, note, icon: Icon, tone, bg }: StatProps) {
    return (
        <div className={`${CARD} flex min-w-0 items-start justify-between gap-3 p-4 sm:p-5`}>
            <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#77869B]">{label}</p>
                <p className="mt-2 break-words text-[27px] font-extrabold tracking-tight text-[#162847]">{value}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#96A0AF]">{note}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]" style={{ backgroundColor: bg, color: tone }}>
                <Icon size={20} strokeWidth={1.8} />
            </div>
        </div>
    );
}

function StatusTag({ category }: { category: string }) {
    return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${getCategoryTone(category)}`}>{getCategoryLabel(category)}</span>;
}

// =====================================================
// COMPONENT
// =====================================================
export default function Commissions() {
    // =================================================
    // STATES
    // =================================================
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortNewest, setSortNewest] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // =================================================
    // COMMISSIONS HISTORY API
    // =================================================
    const { data: commissionsResponse, isLoading, isFetching, isError, error, refetch } = useGetCommissionsHistoryQuery();

    // =================================================
    // API DATA
    // =================================================
    const commissionsHistory: CommissionHistoryItem[] = commissionsResponse?.data ?? [];
    const hasMore = commissionsResponse?.has_more ?? false;

    // =================================================
    // FILTER RECORDS
    // =================================================
    const filteredRecords = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return [...commissionsHistory]
            .filter((item) => {
                const matchesType = filterType === "all" || item.category === filterType || item.tx_type === filterType;
                const matchesText = !q || [
                    item.id, item.category, item.tx_type, item.description,
                    getDescriptionLabel(item.description), item.date_created,
                    getReleasedDate(item), item.amount, item.order_id,
                    getRelatedMember(item.related_member),
                ].some((entry) => String(entry ?? "").toLowerCase().includes(q));
                return matchesType && matchesText;
            })
            .sort((a, b) => {
                const compare = String(a.date_created ?? "").localeCompare(String(b.date_created ?? ""));
                return sortNewest ? -compare : compare;
            });
    }, [commissionsHistory, filterType, searchQuery, sortNewest]);

    // =================================================
    // PAGINATION
    // =================================================
    const totalRecords = filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleRecords = filteredRecords.slice(startIndex, startIndex + pageSize);
    const startRecord = totalRecords ? startIndex + 1 : 0;
    const endRecord = Math.min(startIndex + pageSize, totalRecords);

    const totalPositive = commissionsHistory.filter((item) => Number(item.amount) > 0).length;
    const totalNegative = commissionsHistory.filter((item) => Number(item.amount) < 0).length;
    const categoriesUsed = new Set(commissionsHistory.map((item) => item.category).filter(Boolean)).size;
    const stats: StatProps[] = [
        { label: "History records", value: commissionsHistory.length, note: "Records returned by API", icon: History, tone: "#426CC0", bg: "#EDF3FF" },
        { label: "Positive entries", value: totalPositive, note: "Loaded records with positive amounts", icon: ArrowDownLeft, tone: "#16865E", bg: "#E8F7EF" },
        { label: "Negative entries", value: totalNegative, note: "Loaded records with negative amounts", icon: ArrowUpRight, tone: "#CB665A", bg: "#FFF0EB" },
        { label: "Balance categories", value: categoriesUsed, note: "Distinct categories in loaded history", icon: Coins, tone: "#B17B2D", bg: "#FFF6E7" },
    ];

    // =================================================
    // FILTER HANDLER
    // =================================================
    const handleFilterChange = (value: string) => { setFilterType(value); setPage(1); };

    // =================================================
    // PAGE SIZE HANDLER
    // =================================================
    const handlePageSizeChange = (value: number) => { setPageSize(value); setPage(1); };

    // =================================================
    // REFRESH HANDLER
    // =================================================
    const handleRefresh = () => { void refetch(); };
    const clearFilters = () => { setFilterType("all"); setSearchQuery(""); setPage(1); };
    const hasFilters = filterType !== "all" || !!searchQuery.trim();

    // =================================================
    // UI
    // =================================================
    return (
        <main className="min-w-0 space-y-5 bg-[#F8FAFD] p-3 text-[#26354C] sm:p-5" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
            {/* ========================================= HEADING ========================================= */}
            <header className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0D1D3B] via-[#173663] to-[#254E84] p-5 text-white shadow-[0_12px_35px_rgba(15,37,77,.13)] sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[40px] border-white/[.04]" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><Wallet size={23} /></div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#BFCFE5]">Distributor / Earnings</p>
                            <h1 className="mt-1 text-[23px] font-extrabold tracking-tight sm:text-[28px]">My Commissions</h1>
                            <p className="mt-1 text-[12px] leading-5 text-[#D5E0EF]">Explore your commission activity and related member transactions.</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleRefresh} disabled={isFetching} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-[12px] font-bold text-white transition hover:bg-white/20 disabled:opacity-50">
                        <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> {isFetching ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            {/* ========================================= COMMISSION CARDS ========================================= */}
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {stats.map((stat) => <StatCard key={stat.label} {...stat} value={isLoading ? "—" : stat.value} />)}
            </section>
            <p className="px-1 text-[11px] leading-5 text-[#8290A5]">These figures summarize the records returned by the commissions history API, not your total earned commission or wallet balance.</p>

            {/* ========================================= COMMISSIONS HISTORY ========================================= */}
            <section className={`${CARD} overflow-hidden`}>
                {/* ===================================== TABLE HEADER + FILTER ===================================== */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EDF0F5] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF3FF] text-[#4169B7]"><Activity size={19} /></span>
                        <div>
                            <h2 className="text-[16px] font-extrabold text-[#1A2944]">Commissions History</h2>
                            <p className="mt-1 text-[11px] text-[#8A96A8]">Detailed records from the connected API</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-[#F0F4FA] px-3 py-1.5 text-[11px] font-bold text-[#526783]">{commissionsHistory.length} loaded</span>
                </div>

                <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[minmax(200px,1fr)_190px_auto] sm:px-6">
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BA7B6]" />
                        <input type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }} placeholder="Search description, member or order..." aria-label="Search commission records" className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#FAFBFD] pl-10 pr-3 text-[12px] outline-none placeholder:text-[#9AA5B4] focus:border-[#7DA1DD] focus:bg-white focus:ring-2 focus:ring-[#DFEAFE]" />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8695AA]" />
                        <select aria-label="Filter commission history" value={filterType} onChange={(event) => handleFilterChange(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-[#FAFBFD] pl-9 pr-9 text-[12px] font-semibold text-[#475A76] outline-none focus:border-[#7DA1DD]">
                            {FILTER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8F9BAA]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setSortNewest((value) => !value)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 text-[11px] font-bold text-[#53667F] hover:bg-[#F7FAFD]"><CalendarDays size={14} /> {sortNewest ? "Newest first" : "Oldest first"}</button>
                        {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 text-[11px] font-bold text-[#596A83] hover:bg-[#F7FAFD]"><X size={14} /> Clear</button>}
                    </div>
                </div>

                {/* ===================================== ERROR STATE ===================================== */}
                {isError && <div role="alert" className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F4D2D2] bg-[#FFF6F6] p-3 text-[12px] text-[#A83F3F] sm:mx-6"><span className="inline-flex items-center gap-2"><AlertCircle size={17} />{getErrorMessage(error)}</span><button type="button" onClick={handleRefresh} className="font-bold underline">Retry</button></div>}

                {/* ===================================== TABLE ===================================== */}
                {isLoading ? <div className="flex min-h-[260px] items-center justify-center gap-2 text-[12px] text-[#738198]"><Loader2 size={19} className="animate-spin" /> Loading commissions history...</div>
                    : !totalRecords ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F5F9] text-[#9AA7B8]"><Inbox size={23} /></span>
                            <p className="mt-3 text-[13px] font-bold text-[#394A64]">{hasFilters ? "No matching commissions" : "No commission records yet"}</p>
                            <p className="mt-1 text-[11px] text-[#8D9AAD]">{hasFilters ? "Change your search or filters to try again." : "Your commission activity will appear here when records are available."}</p>
                            {hasFilters && <button type="button" onClick={clearFilters} className="mt-3 text-[12px] font-bold text-[#416DB5]">Clear filters</button>}
                        </div>
                    ) : <>
                        {/* Desktop: compact, readable table */}
                        <div className="hidden overflow-x-auto px-4 pb-3 md:block sm:px-6">
                            <table className="w-full min-w-[990px] border-collapse text-left">
                                <thead><tr className="border-b border-[#E8EDF4] bg-[#F8FAFD] text-[10px] font-bold uppercase tracking-[.06em] text-[#8794A6]">
                                    <th className="px-3 py-3">Category</th><th className="px-3 py-3">Created</th><th className="px-3 py-3">Released</th><th className="px-3 py-3">Description</th><th className="px-3 py-3 text-right">Amount</th><th className="px-3 py-3">Order ID</th><th className="px-3 py-3">Related member</th>
                                </tr></thead>
                                <tbody>{visibleRecords.map((item) => <tr key={item.id} className="border-b border-[#EFF2F6] text-[11px] last:border-b-0 hover:bg-[#FBFCFE]">
                                    <td className="px-3 py-4"><StatusTag category={item.category} /></td>
                                    <td className="whitespace-nowrap px-3 py-4 text-[#69798F]">{formatDate(item.date_created)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-[#69798F]">{formatDate(getReleasedDate(item))}</td>
                                    <td className="max-w-[240px] px-3 py-4 font-semibold text-[#34435A]" title={item.description}>{getDescriptionLabel(item.description)}</td>
                                    <td className={`whitespace-nowrap px-3 py-4 text-right font-extrabold ${getAmountColor(item.amount)}`}>{formatAmount(item.amount)}</td>
                                    <td className="break-all px-3 py-4 text-[#66768C]">{item.order_id ?? "—"}</td>
                                    <td className="break-all px-3 py-4 text-[#66768C]">{getRelatedMember(item.related_member)}</td>
                                </tr>)}</tbody>
                            </table>
                        </div>

                        {/* Mobile: cards instead of squeezed horizontal columns */}
                        <div className="space-y-3 px-4 pb-4 md:hidden">{visibleRecords.map((item) => <article key={item.id} className="rounded-2xl border border-[#E6EBF2] bg-[#FCFDFE] p-3.5">
                            <div className="flex items-start justify-between gap-2"><StatusTag category={item.category} /><strong className={`text-[17px] ${getAmountColor(item.amount)}`}>{formatAmount(item.amount)}</strong></div>
                            <p className="mt-3 text-[12px] font-bold text-[#283A55]">{getDescriptionLabel(item.description)}</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                                <div><p className="text-[#95A0B0]">Created</p><p className="mt-0.5 font-semibold text-[#52637C]">{formatDate(item.date_created)}</p></div>
                                <div><p className="text-[#95A0B0]">Released</p><p className="mt-0.5 font-semibold text-[#52637C]">{formatDate(getReleasedDate(item))}</p></div>
                                {item.order_id != null && <div><p className="text-[#95A0B0]">Order ID</p><p className="mt-0.5 break-all font-semibold text-[#52637C]">{item.order_id}</p></div>}
                                {item.related_member != null && <div><p className="text-[#95A0B0]">Related member</p><p className="mt-0.5 break-all font-semibold text-[#52637C]">{getRelatedMember(item.related_member)}</p></div>}
                            </div>
                        </article>)}</div>
                    </>}

                {/* ===================================== PAGINATION ===================================== */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ECF0F5] px-4 py-3.5 sm:px-6">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7B8A9E]">
                        <label className="flex items-center gap-2">Rows <select value={pageSize} aria-label="Records per page" onChange={(event) => handlePageSizeChange(Number(event.target.value))} className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 font-semibold text-[#3F516B]">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
                        <span>Showing {startRecord}–{endRecord} of {totalRecords}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((previous) => Math.max(1, previous - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#5D708A] hover:bg-[#F7FAFE] disabled:opacity-30"><ChevronLeft size={16} /></button>
                        <span className="rounded-lg bg-[#163764] px-3 py-1.5 text-[11px] font-bold text-white">{currentPage}</span>
                        <span className="text-[11px] text-[#8A95A5]">/ {totalPages}</span>
                        <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#5D708A] hover:bg-[#F7FAFE] disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                </div>
                {hasMore && <p className="border-t border-[#EEF1F5] px-4 py-3 text-[11px] leading-5 text-[#91703C] sm:px-6">The API reports additional records. Pagination here covers only the records returned by this request; no load-more endpoint is provided in this component.</p>}
                {isFetching && !isLoading && <p className="flex items-center justify-end gap-2 px-4 pb-3 text-[11px] text-[#8190A3] sm:px-6"><Loader2 size={13} className="animate-spin" /> Updating records...</p>}
            </section>
        </main>
    );
}
