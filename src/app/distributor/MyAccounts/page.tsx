"use client";

import React, { useMemo, useState } from "react";
import {
    ArrowLeft,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Loader2,
    RefreshCw,
    Search,
    ShieldCheck,
    UsersRound,
    X,
} from "lucide-react";

/**
 * IndieKonnect My Accounts
 * -----------------------
 * A complete, responsive screen styled to match the light IndieKonnect
 * distributor dashboard and TC Bank UI. The light background covers
 * the full viewport, even if a parent layout has a dark background. Data comes from props; no API
 * endpoint is invented here.
 *
 * Example integration:
 *
 * <MyAccountsPage
 *   accounts={apiResponse?.data?.accounts ?? []}
 *   loading={isLoading}
 *   fetching={isFetching}
 *   onRefresh={() => refetch()}
 *   onBack={() => router.back()}
 * />
 *
 * Use demoAccounts={EXAMPLE_MY_ACCOUNTS} only for previewing the design.
 */

export interface MyAccountRecord {
    id?: string | number;
    account_id?: string | null;
    ba_id?: string | null;
    rank?: string | number | null;
    rank_name?: string | null;
    status?: string | null;
    membership_status?: string | null;
    created_at?: string | null;
}

export interface MyAccountsPageProps {
    accounts?: MyAccountRecord[] | null;
    loading?: boolean;
    fetching?: boolean;
    error?: string | null;
    onRefresh?: () => void | Promise<unknown>;
    onBack?: () => void;
    /** Optional records for isolated UI preview. Never shown with live accounts. */
    demoAccounts?: MyAccountRecord[];
    className?: string;
}

export const EXAMPLE_MY_ACCOUNTS: MyAccountRecord[] = [
    { id: 1, account_id: "AIA2938393-001", rank: "Titanium", status: "Activated" },
    { id: 2, account_id: "AIA2938393-002", rank: "Titanium", status: "Activated" },
    { id: 3, account_id: "AIA2938393-003", rank: "Titanium", status: "Activated" },
];

const PAGE_SIZES = [5, 10, 20, 50] as const;
const PANEL = "rounded-[18px] border border-[#E7EAF0] bg-white shadow-[0_4px_22px_rgba(16,24,40,0.035)]";

function normalize(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    return String(value).replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getAccountId(item: MyAccountRecord): string {
    return String(item.account_id || item.ba_id || item.id || "—");
}
function getRank(item: MyAccountRecord): string {
    return normalize(item.rank_name ?? item.rank);
}
function getStatus(item: MyAccountRecord): string {
    return normalize(item.status ?? item.membership_status);
}
function statusColors(status: string): string {
    const s = status.toLowerCase();
    if (["activated", "active", "qualified", "approved"].some((v) => s.includes(v)))
        return "border-[#D8EBDF] bg-[#EFF8F2] text-[#287A50]";
    if (["rejected", "blocked", "inactive", "suspended"].some((v) => s.includes(v)))
        return "border-[#F2DBDB] bg-[#FFF4F4] text-[#B44F4F]";
    if (["pending", "processing"].some((v) => s.includes(v)))
        return "border-[#F0E4D0] bg-[#FFF9EE] text-[#9D752D]";
    return "border-[#E7EAF0] bg-[#F7F8FA] text-[#667085]";
}

export default function MyAccountsPage({
    accounts,
    loading = false,
    fetching = false,
    error = null,
    onRefresh,
    onBack,
    demoAccounts,
    className = "",
}: MyAccountsPageProps) {
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [page, setPage] = useState(1);
    const [sortAscending, setSortAscending] = useState(true);

    // Real records must be supplied via accounts. Demo records are opt-in only.
    const source = accounts ?? demoAccounts ?? [];
    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return source
            .filter((item) =>
                !q || [getAccountId(item), getRank(item), getStatus(item), item.created_at || ""]
                    .some((value) => value.toLowerCase().includes(q)),
            )
            .sort((a, b) => getAccountId(a).localeCompare(getAccountId(b), undefined, { numeric: true }) * (sortAscending ? 1 : -1));
    }, [source, search, sortAscending]);

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstIndex = (currentPage - 1) * pageSize;
    const visibleRows = rows.slice(firstIndex, firstIndex + pageSize);
    const start = rows.length ? firstIndex + 1 : 0;
    const end = Math.min(firstIndex + pageSize, rows.length);
    const handleSearch = (value: string) => { setSearch(value); setPage(1); };

    return (
        <main
            className={`min-h-[100dvh] flex-1 w-full min-w-0 bg-[#F8FAFC] p-3 text-[#1D2939] sm:p-5 lg:p-7 ${className}`}
            style={{ fontFamily: "'Lato', Arial, sans-serif" }}
        >
            <div className="mx-auto max-w-[1500px] space-y-5">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                aria-label="Go back"
                                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E8EE] bg-white text-[#354052] transition hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344054]/30"
                            ><ArrowLeft size={16} /></button>
                        )}
                        <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-[#8792A2]">
                                <span>Distributor</span><span className="text-[#BBC2CE]">/</span><span>My Accounts</span>
                            </div>
                            <h1 className="text-[22px] font-bold tracking-[-0.035em] text-[#17212F] sm:text-[26px]">My Accounts</h1>
                            <p className="mt-1 text-[12px] leading-5 text-[#758195]">View and manage your distributor account records.</p>
                        </div>
                    </div>
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={() => void onRefresh()}
                            disabled={loading || fetching}
                            className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#DCE1E8] bg-white px-3.5 text-[11px] font-semibold text-[#344054] transition hover:border-[#BFC7D2] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} /> Refresh
                        </button>
                    )}
                </header>

                <section aria-label="My Accounts" className={`${PANEL} overflow-hidden`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] p-4 sm:px-5 sm:py-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#EFF3F8] text-[#61758D]"><UsersRound size={17} /></span>
                            <div>
                                <h2 className="text-[14px] font-bold text-[#202B3A] sm:text-[15px]">Account Directory</h2>
                                <p className="mt-0.5 text-[10.5px] text-[#8A95A5]">Account ID, rank and activation status</p>
                            </div>
                        </div>
                        <span className="rounded-full border border-[#E7EAF0] bg-[#FAFBFC] px-3 py-1 text-[10.5px] font-semibold text-[#68768A]">
                            {source.length} {source.length === 1 ? "account" : "accounts"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                        <div className="relative w-full max-w-[360px]">
                            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                            <input
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                type="search"
                                aria-label="Quick search accounts"
                                placeholder="Search account ID, rank, status..."
                                className="h-10 w-full rounded-[10px] border border-[#E1E5EC] bg-[#F9FAFC] py-2 pl-10 pr-9 text-[12px] text-[#253143] outline-none transition placeholder:text-[#A6AFBC] focus:border-[#9BA6B5] focus:bg-white focus:ring-2 focus:ring-[#98A2B3]/15"
                            />
                            {search && <button type="button" aria-label="Clear search" onClick={() => handleSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#818B9A] hover:text-black"><X size={14} /></button>}
                        </div>
                        <span className="text-[11px] text-[#919BAB]">{rows.length} matching records</span>
                    </div>

                    {error && (
                        <div role="alert" className="mx-4 mb-4 flex items-center gap-2 rounded-[10px] border border-[#F0D6D6] bg-[#FFF6F6] px-3.5 py-3 text-[12px] text-[#A94343] sm:mx-5">
                            <CircleHelp size={16} className="shrink-0" />{error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-[12px] text-[#7F8B9C]">
                            <Loader2 size={26} className="animate-spin text-[#53657C]" />Loading accounts...
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center px-4 pb-6 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F2F4F7] text-[#9AA5B4]"><Search size={21} /></span>
                            <p className="mt-3 text-[13px] font-semibold text-[#344054]">{search ? "No matching accounts" : "No accounts available"}</p>
                            <p className="mt-1 max-w-[300px] text-[11px] leading-5 text-[#8B95A5]">{search ? "Try another account ID, rank or status." : "Your accounts will appear here once provided by your backend."}</p>
                            {search && <button type="button" onClick={() => handleSearch("")} className="mt-3 rounded-[9px] bg-[#171717] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#363636]">Clear search</button>}
                        </div>
                    ) : (
                        <>
                            {/* Desktop & tablet table */}
                            <div className="hidden overflow-x-auto sm:block">
                                <table className="w-full table-fixed border-collapse text-left">
                                    <thead>
                                        <tr className="border-y border-[#ECEFF3] bg-[#F8F9FB] text-[10px] font-bold uppercase tracking-[0.065em] text-[#7D899A]">
                                            <th className="w-[46%] px-5 py-3.5">
                                                <button type="button" onClick={() => { setSortAscending((v) => !v); setPage(1); }} className="inline-flex items-center gap-1.5 transition hover:text-[#17212F]" aria-label="Sort by account ID">
                                                    Account ID <ChevronDown size={12} className={`transition-transform ${sortAscending ? "rotate-180" : ""}`} />
                                                </button>
                                            </th>
                                            <th className="w-[25%] px-5 py-3.5">Rank</th>
                                            <th className="w-[29%] px-5 py-3.5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleRows.map((item, i) => {
                                            const status = getStatus(item);
                                            return (
                                                <tr key={`${getAccountId(item)}-${item.id ?? i}`} className="border-b border-[#F0F2F5] transition-colors last:border-b-0 hover:bg-[#FAFBFC]">
                                                    <td className="break-all px-5 py-4 text-[12px] font-bold text-[#293448]">{getAccountId(item)}</td>
                                                    <td className="px-5 py-4 text-[12px] font-medium text-[#566276]">{getRank(item)}</td>
                                                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${statusColors(status)}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{status}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile account cards */}
                            <div className="space-y-2 px-4 pb-3 sm:hidden">
                                {visibleRows.map((item, i) => {
                                    const status = getStatus(item);
                                    return (
                                        <div key={`${getAccountId(item)}-${item.id ?? i}`} className="rounded-[12px] border border-[#E9ECF1] bg-[#FCFCFD] p-3.5">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="min-w-0"><p className="text-[10px] text-[#919BA9]">Account ID</p><p className="mt-1 break-all text-[12px] font-bold text-[#263143]">{getAccountId(item)}</p></div>
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusColors(status)}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{status}</span>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 border-t border-[#E9ECF1] pt-3"><ShieldCheck size={14} className="text-[#8793A4]" /><span className="text-[10.5px] text-[#8793A4]">Rank</span><span className="ml-auto text-[11.5px] font-semibold text-[#405066]">{getRank(item)}</span></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-[#EDF0F3] px-4 py-3.5 sm:px-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                    aria-label="Records per page"
                                    className="h-9 appearance-none rounded-[9px] border border-[#E5E8ED] bg-[#FAFAFB] py-1 pl-3 pr-8 text-[11px] font-semibold text-[#536175] outline-none focus:border-[#98A2B3]"
                                >
                                    {PAGE_SIZES.map((size) => <option value={size} key={size}>{size}</option>)}
                                </select>
                                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F8C9D]" />
                            </div>
                            <span className="text-[11px] text-[#8A95A5]">Showing <strong className="font-semibold text-[#405066]">{start}–{end}</strong> of <strong className="font-semibold text-[#405066]">{rows.length}</strong> records</span>
                        </div>
                        <nav aria-label="Account pagination" className="flex items-center gap-1.5">
                            <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E7EAF0] bg-white text-[#596579] transition hover:bg-[#F5F6F8] disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={15} /></button>
                            <span className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[#171717] px-2 text-[11px] font-bold text-white">{currentPage}</span>
                            <span className="px-1 text-[11px] text-[#A0A8B5]">/ {totalPages}</span>
                            <button type="button" aria-label="Next page" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E7EAF0] bg-white text-[#596579] transition hover:bg-[#F5F6F8] disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={15} /></button>
                        </nav>
                    </footer>
                </section>
            </div>
        </main>
    );
}
