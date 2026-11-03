"use client";

import React, { useMemo, useState } from "react";
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    BookOpenText,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Coins,
    FileClock,
    Info,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    UsersRound,
    Wallet,
    X,
} from "lucide-react";


export interface TCBankAccount {
    id: string | number;
    account_id: string;
    rank: string;
    status: string;
    qualified_cv?: number | string | null;
    created_at?: string | null;
}

export interface TCBankTransaction {
    id: string | number;
    date: string;
    category: string;
    description: string;
    amount: number | string;
    order_id?: string | null;
    related_member?: string | null;
    direction?: "credit" | "debit" | null;
}

export interface TCBankData {
    available_balance: number | string;
    qualified_accounts: number;
    required_qualified_accounts?: number;
    zone_tc_cv_price: number | string;
    accounts: TCBankAccount[];
    transactions: TCBankTransaction[];
}

export interface CreateTCBankAccountInput {
    /** Optional note for the server; adapt to your backend schema. */
    note: string;
}

export interface TCBankPageProps {
    data?: TCBankData | null;
    isLoading?: boolean;
    isFetching?: boolean;
    error?: string | null;
    onRefresh?: () => void | Promise<void>;
    /** Provide your real mutation here. The button is disabled until wired. */
    onCreateAccount?: (input: CreateTCBankAccountInput) => Promise<void> | void;
    /** Supply a route to return to your distributor dashboard. */
    onBack?: () => void;
    className?: string;
}

/** Screenshot sample is for appearance/testing ONLY; not connected to any wallet. */
export const EXAMPLE_TC_BANK_DATA: TCBankData = {
    available_balance: 0,
    qualified_accounts: 0,
    required_qualified_accounts: 3,
    zone_tc_cv_price: 600,
    accounts: [
        { id: 1, account_id: "AIA2938393-001", rank: "Titanium", status: "Activated" },
        { id: 2, account_id: "AIA2938393-002", rank: "Titanium", status: "Activated" },
        { id: 3, account_id: "AIA2938393-003", rank: "Titanium", status: "Activated" },
    ],
    transactions: [],
};

const n = (value: number | string | null | undefined): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const number = (value: number | string | null | undefined): string =>
    n(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const getStatusTone = (status: string) => {
    const normalized = (status || "").toLowerCase();
    if (["activated", "active", "qualified", "completed", "success"].some((s) => normalized.includes(s))) {
        return "border-[#D7EEE2] bg-[#F1FBF5] text-[#237A55]";
    }
    if (["failed", "blocked", "rejected", "cancel"].some((s) => normalized.includes(s))) {
        return "border-[#F0DBDB] bg-[#FFF6F6] text-[#B45353]";
    }
    if (["pending", "process", "review"].some((s) => normalized.includes(s))) {
        return "border-[#F1E5CC] bg-[#FFF9ED] text-[#9F7134]";
    }
    return "border-[#E7E9ED] bg-[#F7F8FA] text-[#697386]";
};

const panel =
    "min-w-0 rounded-[18px] border border-[#E7EAF0] bg-white shadow-[0_3px_18px_rgba(16,24,40,0.035)]";

function SectionHeading({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#E6EAF1] bg-[#F5F7FA] text-[#44546D]">
                <Icon size={17} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
                <h2 className="text-[15px] font-bold tracking-[-.025em] text-[#202734] sm:text-[17px]">{title}</h2>
                <p className="mt-0.5 text-[11px] leading-4 text-[#8690A0]">{subtitle}</p>
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    subtitle,
    shade,
    accent,
}: {
    label: string;
    value: React.ReactNode;
    icon: React.ElementType;
    subtitle: string;
    shade: string;
    accent: string;
}) {
    return (
        <article className={`${panel} group relative flex min-h-[136px] flex-col justify-between overflow-hidden p-4 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(16,24,40,0.07)] sm:p-5`}>
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accent }} aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: shade, color: accent }}>
                    <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="mt-1 rounded-full bg-[#F7F8FA] p-1.5 text-[#B4BBC6]" aria-hidden="true">
                    <ArrowUpRight size={14} />
                </span>
            </div>
            <div className="mt-4">
                <p className="text-[11px] font-semibold text-[#758092] sm:text-[12px]">{label}</p>
                <p className="mt-1 text-[26px] font-bold leading-none tracking-[-.04em] text-[#1F2937] sm:text-[29px]">{value}</p>
                <p className="mt-1.5 text-[10px] leading-4 text-[#98A1AF]">{subtitle}</p>
            </div>
        </article>
    );
}

function PageSizePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <label className="inline-flex items-center gap-2 text-[11px] text-[#758092]">
            <span className="hidden sm:inline">Rows per page</span>
            <span className="relative">
                <select
                    aria-label="Rows per page"
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="h-8 appearance-none rounded-[8px] border border-[#E3E7EE] bg-white pl-2.5 pr-7 text-[11px] font-semibold text-[#445066] outline-none transition focus:border-[#202020]"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2 top-[10px] text-[#8993A3]" />
            </span>
        </label>
    );
}

function Pagination({
    total,
    page,
    size,
    onPageChange,
    onSizeChange,
}: {
    total: number;
    page: number;
    size: number;
    onPageChange: (v: number) => void;
    onSizeChange: (v: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(total / size));
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(page * size, total);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F4] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
                <PageSizePicker value={size} onChange={onSizeChange} />
                <span className="text-[11px] text-[#8B94A3]">Showing {from}–{to} of {total}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
                <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E8ED] text-[#6C7482] hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <ChevronLeft size={15} />
                </button>
                <span className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[#191919] px-2 text-[11px] font-bold text-white">{page}</span>
                <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E8ED] text-[#6C7482] hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}

function EmptyTable({ kind, hasSearch }: { kind: "accounts" | "transactions"; hasSearch: boolean }) {
    return (
        <div className="flex min-h-[154px] flex-col items-center justify-center px-4 py-7 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#F5F7FA] text-[#8E9BAE]">
                {kind === "accounts" ? <UsersRound size={19} /> : <FileClock size={19} />}
            </div>
            <p className="mt-3 text-[12px] font-semibold text-[#424C5C]">{hasSearch ? "No matching records" : kind === "accounts" ? "No accounts found" : "No transactions yet"}</p>
            <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#98A2B3]">
                {hasSearch ? "Try searching by a different account or transaction reference." : kind === "accounts" ? "Your TC Bank accounts will appear here." : "TC Bank activity will appear here once recorded."}
            </p>
        </div>
    );
}

function AccountList({ accounts, search }: { accounts: TCBankAccount[]; search: string }) {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [sortAsc, setSortAsc] = useState(true);
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return [...accounts]
            .filter((account) => !q || [account.account_id, account.rank, account.status].some((v) => String(v ?? "").toLowerCase().includes(q)))
            .sort((a, b) => sortAsc ? a.account_id.localeCompare(b.account_id) : b.account_id.localeCompare(a.account_id));
    }, [accounts, search, sortAsc]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * size, safePage * size);
    const updateSize = (v: number) => { setSize(v); setPage(1); };
    return (
        <div className="overflow-hidden rounded-[13px] border border-[#E8ECF1]">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[510px] border-collapse text-left">
                    <thead className="bg-[#F7F9FB]">
                        <tr className="border-b border-[#E9ECF1] text-[10px] font-bold uppercase tracking-[.075em] text-[#7A8799]">
                            <th className="px-4 py-3.5 sm:px-5">
                                <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-[#191919]" onClick={() => setSortAsc((v) => !v)}>
                                    Account ID <ChevronDown size={12} className={sortAsc ? "rotate-180" : ""} />
                                </button>
                            </th>
                            <th className="px-4 py-3.5">Rank</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-4 py-3.5 text-right sm:px-5">Member</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((account) => (
                            <tr key={account.id} className="border-b border-[#EFF1F5] text-[12px] last:border-b-0 hover:bg-[#FCFCFD]">
                                <td className="px-4 py-3.5 font-bold text-[#243247] sm:px-5"><span className="break-all">{account.account_id}</span></td>
                                <td className="px-4 py-3.5 font-medium text-[#687386]">{account.rank || "—"}</td>
                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusTone(account.status)}`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                        {account.status || "Unknown"}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-right sm:px-5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E9EDF2] bg-[#F6F7F9] text-[10px] font-bold text-[#667386]">{account.account_id.slice(-2)}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {items.length === 0 && <EmptyTable kind="accounts" hasSearch={!!search.trim()} />}
            <Pagination total={filtered.length} page={safePage} size={size} onPageChange={setPage} onSizeChange={updateSize} />
        </div>
    );
}

function TransactionHistory({ transactions }: { transactions: TCBankTransaction[] }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [newestFirst, setNewestFirst] = useState(true);
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const matches = transactions.filter((tx) => !q || [tx.date, tx.category, tx.description, tx.order_id, tx.related_member].some((v) => String(v ?? "").toLowerCase().includes(q)));
        return [...matches].sort((a, b) => newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    }, [transactions, search, newestFirst]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * size, safePage * size);
    const updateSize = (v: number) => { setSize(v); setPage(1); };
    return (
        <section className={`${panel} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <SectionHeading icon={FileClock} title="TC Bank Transaction History" subtitle="All credit, debit and account activity" />
                <div className="relative w-full sm:w-[245px]">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B0]" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search transactions" aria-label="Search transactions" className="h-9 w-full rounded-[9px] border border-[#E5E9EF] bg-[#FAFBFC] pl-9 pr-3 text-[11px] text-[#293343] outline-none placeholder:text-[#9CA5B3] focus:border-[#667386] focus:bg-white" />
                </div>
            </div>
            <div className="mx-4 overflow-hidden rounded-[13px] border border-[#E8ECF1] sm:mx-5">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead className="bg-[#F7F9FB]">
                            <tr className="border-b border-[#E9ECF1] text-[10px] font-bold uppercase tracking-[.075em] text-[#7A8799]">
                                <th className="px-4 py-3.5"><button type="button" className="inline-flex items-center gap-1.5 hover:text-[#191919]" onClick={() => setNewestFirst((v) => !v)}>Date <ChevronDown size={12} className={newestFirst ? "" : "rotate-180"} /></button></th>
                                <th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Description</th><th className="px-4 py-3.5">TC Bank</th><th className="px-4 py-3.5">Order ID</th><th className="px-4 py-3.5">Related member</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((tx) => {
                                const isCredit = tx.direction === "credit" || (!tx.direction && n(tx.amount) >= 0);
                                return (
                                    <tr key={tx.id} className="border-b border-[#EFF1F5] text-[11px] last:border-b-0 hover:bg-[#FCFCFD]">
                                        <td className="whitespace-nowrap px-4 py-3.5 text-[#657184]">{tx.date}</td>
                                        <td className="px-4 py-3.5 font-semibold text-[#3F4C5F]">{tx.category}</td>
                                        <td className="max-w-[290px] px-4 py-3.5 text-[#657184]">{tx.description}</td>
                                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-[#253243]">
                                            <span className={`inline-flex items-center gap-1 ${isCredit ? "text-[#278366]" : "text-[#B96C47]"}`}>{isCredit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}{isCredit ? "+" : "−"}{number(Math.abs(n(tx.amount)))}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-[#657184]">{tx.order_id || "—"}</td>
                                        <td className="px-4 py-3.5 text-[#657184]">{tx.related_member || "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {items.length === 0 && <EmptyTable kind="transactions" hasSearch={!!search.trim()} />}
                <Pagination total={filtered.length} page={safePage} size={size} onPageChange={setPage} onSizeChange={updateSize} />
            </div>
            <div className="h-4" />
        </section>
    );
}

function CreateAccountModal({
    open,
    onClose,
    onCreate,
}: {
    open: boolean;
    onClose: () => void;
    onCreate: (input: CreateTCBankAccountInput) => Promise<void> | void;
}) {
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    if (!open) return null;
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await onCreate({ note: note.trim() });
            setNote("");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Account could not be created. Please try again.");
        } finally {
            setBusy(false);
        }
    };
    return (
        <div role="presentation" className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-[3px]" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="tc-create-title" className="w-full max-w-[440px] overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_24px_85px_rgba(0,0,0,0.24)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#EDF0F3] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#F1F4F8] text-[#3E5068]"><Plus size={21} /></span>
                        <div><h3 id="tc-create-title" className="text-[17px] font-bold text-[#202734]">New TC Bank Account</h3><p className="mt-1 text-[11px] text-[#8790A0]">Submit a request using your linked backend</p></div>
                    </div>
                    <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E8EE] text-[#727C8B] hover:bg-[#F5F6F8] disabled:opacity-50"><X size={16} /></button>
                </div>
                <form onSubmit={submit} className="p-5 sm:p-6">
                    <div className="rounded-[11px] border border-[#E7EAF0] bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#677489]">
                        New account creation is handled by your existing API. Confirm eligibility and any fees with your backend before submitting.
                    </div>
                    <label htmlFor="tc-new-account-note" className="mb-1.5 mt-5 block text-[12px] font-semibold text-[#354154]">Note (optional)</label>
                    <textarea id="tc-new-account-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Additional information for your request" className="w-full resize-none rounded-[11px] border border-[#E1E6ED] p-3 text-[12px] outline-none placeholder:text-[#A6AFBB] focus:border-[#424242]" />
                    {error && <div role="alert" className="mt-3 rounded-lg border border-[#F0D6D6] bg-[#FFF6F6] px-3 py-2 text-[11px] text-[#AD4A4A]">{error}</div>}
                    <div className="mt-5 flex items-center justify-end gap-2.5">
                        <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-[10px] border border-[#E1E4EA] bg-white px-4 text-[12px] font-semibold text-[#586373] hover:bg-[#F8F9FA] disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#343434] disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}{busy ? "Submitting..." : "Create Account"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TCBankPage({
    data,
    isLoading = false,
    isFetching = false,
    error = null,
    onRefresh,
    onCreateAccount,
    onBack,
    className = "",
}: TCBankPageProps) {
    const [accountQuery, setAccountQuery] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [showAllRules, setShowAllRules] = useState(false);
    const isSample = data === undefined;
    const tcData = data === undefined ? EXAMPLE_TC_BANK_DATA : data;
    const required = Math.max(1, tcData?.required_qualified_accounts ?? 3);
    const qualified = Math.max(0, tcData?.qualified_accounts ?? 0);
    const ratio = Math.min(100, (qualified / required) * 100);

    return (
        <main className={`w-full min-w-0  text-[#253044] ${className}`} style={{ fontFamily: "'Inter', 'Lato', system-ui, sans-serif" }}>
            <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        {onBack && <button type="button" onClick={onBack} aria-label="Back to dashboard" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E9EF] bg-white text-[#5F6D80] hover:bg-[#F2F4F7]"><ArrowLeft size={17} /></button>}
                        <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#9AA3B1]">Distributor / My Wallet</p>
                            <h1 className="text-[22px] font-bold leading-tight tracking-[-.04em] text-[#1F2937] sm:text-[26px]">TC Bank</h1>
                            <p className="mt-1 text-[12px] text-[#8691A1]">Manage your TC balance, accounts and transactions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRefresh && <button type="button" disabled={isFetching || isLoading} onClick={() => void onRefresh()} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E2E7EE] bg-white px-3 text-[11px] font-semibold text-[#48576D] hover:bg-[#F4F6F9] disabled:opacity-50"><RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh</button>}
                        <span className="hidden items-center gap-1.5 rounded-full border border-[#E2E9F2] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#6E798B] sm:inline-flex"><ShieldCheck size={13} /> TC Bank Overview</span>
                    </div>
                </div>

                {isSample && (
                    <div className="flex items-start gap-2 rounded-[11px] border border-[#F1E3C5] bg-[#FFF9EB] px-3.5 py-2.5 text-[11px] leading-5 text-[#876B31]">
                        <Info size={15} className="mt-0.5 shrink-0" /><span><strong>Preview data:</strong> Account figures below match your screenshot for design preview. Pass real TC Bank API data using the <code>data</code> prop to display live values.</span>
                    </div>
                )}
                {error && <div role="alert" className="rounded-[11px] border border-[#F1D6D6] bg-[#FFF5F5] px-4 py-3 text-[12px] text-[#A94343]">{error}</div>}
                {isLoading ? (
                    <div className={`${panel} flex min-h-[320px] flex-col items-center justify-center gap-3`}><Loader2 size={25} className="animate-spin text-[#5B6B82]" /><span className="text-[12px] text-[#8791A0]">Loading TC Bank details...</span></div>
                ) : !tcData ? (
                    <div className={`${panel} flex min-h-[250px] flex-col items-center justify-center px-5 text-center`}><CircleHelp size={24} className="text-[#98A2B3]" /><p className="mt-3 text-[13px] font-semibold">TC Bank data is unavailable</p><p className="mt-1 text-[11px] text-[#97A1B0]">Please connect your TC Bank API to display account information.</p></div>
                ) : (
                    <>
                        <section aria-label="TC Bank summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                            <SummaryCard label="Available Balance" value={number(tcData.available_balance)} icon={Wallet} subtitle="TC available in your bank" shade="#EFF4FD" accent="#456CA7" />
                            <SummaryCard label="Qualified Status" value={<>{qualified}<span className="mx-1 text-[20px] font-medium text-[#ACB4C0]">/</span>{required}</>} icon={BadgeCheck} subtitle="Accounts meeting qualification" shade="#FFF7E8" accent="#B88A40" />
                            <SummaryCard label="Zone TC CV Price" value={number(tcData.zone_tc_cv_price)} icon={Coins} subtitle="CV needed for one TC counter" shade="#EDF8F2" accent="#3A8C6B" />
                        </section>

                        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
                            <section className={`${panel} overflow-hidden`}>
                                <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
                                    <SectionHeading icon={UsersRound} title="My Accounts Status" subtitle="Your active and qualified TC Bank accounts" />
                                    <button type="button" onClick={() => setCreateOpen(true)} disabled={!onCreateAccount} title={!onCreateAccount ? "Connect the new account API to enable this action" : undefined} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-[#171717] px-4 text-[11px] font-bold text-white transition hover:bg-[#353535] disabled:cursor-not-allowed disabled:bg-[#ACB2BA] sm:text-[12px]"><Plus size={15} /> New Account</button>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 sm:px-5">
                                    <div className="relative w-full sm:max-w-[260px]"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A9B7]" /><input aria-label="Search accounts" placeholder="Search account ID, rank..." value={accountQuery} onChange={(e) => setAccountQuery(e.target.value)} className="h-9 w-full rounded-[9px] border border-[#E5E9EF] bg-[#FAFBFC] pl-9 pr-3 text-[11px] outline-none placeholder:text-[#A6AFBD] focus:border-[#687589] focus:bg-white" /></div>
                                    <span className="text-[11px] font-semibold text-[#8B95A5]">{tcData.accounts.length} accounts</span>
                                </div>
                                <div className="px-4 pb-4 sm:px-5 sm:pb-5"><AccountList accounts={tcData.accounts} search={accountQuery} /></div>
                            </section>

                            <section className={`${panel} p-4 sm:p-5`}>
                                <SectionHeading icon={BookOpenText} title="How TC Bank Works" subtitle="Qualification, purchase and placement guidelines" />
                                <div className="mt-4 grid grid-cols-1 gap-2.5">
                                    <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#EDF3FC] text-[11px] font-bold text-[#4F6B97]">01</span>
                                        <div><p className="text-[12px] font-semibold text-[#344154]">Account qualification</p><p className="mt-1 text-[11px] leading-[19px] text-[#788496]">First 3 accounts need 300 CV qualification before a TC Counter can be purchased.</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#FFF6E7] text-[11px] font-bold text-[#AA8043]">02</span>
                                        <div><p className="text-[12px] font-semibold text-[#344154]">Counter purchase</p><p className="mt-1 text-[11px] leading-[19px] text-[#788496]">During purchasing, 600 CV can be exchanged for 1 counter in the TC Bank.</p></div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#EEF8F2] text-[11px] font-bold text-[#4A8C6B]">03</span>
                                        <div><p className="text-[12px] font-semibold text-[#344154]">Binary placement rule</p><p className="mt-1 text-[11px] leading-[19px] text-[#788496]">4th account and onwards cannot be placed under 2nd or 3rd account directly in the binary tree.</p></div>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-[11px] border border-[#E8EDF3] bg-[#F6F8FB] p-3.5">
                                    <div className="mb-2 flex items-center justify-between gap-3"><span className="text-[11px] font-semibold text-[#5F6C80]">Qualification progress</span><span className="text-[11px] font-bold text-[#26364C]">{qualified} / {required}</span></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-[#E3E8F0]"><div className="h-full rounded-full bg-[#3F648F] transition-all duration-500" style={{ width: `${ratio}%` }} /></div>
                                    <p className="mt-2 text-[10px] leading-4 text-[#939EAD]">Based on qualified account count received from your API.</p>
                                </div>
                                <button type="button" onClick={() => setShowAllRules((value) => !value)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#526782] hover:text-[#202D42]">{showAllRules ? "Hide" : "View"} important note <ChevronDown size={13} className={showAllRules ? "rotate-180" : ""} /></button>
                                {showAllRules && <div className="mt-2 rounded-[10px] border border-[#E9E3D8] bg-[#FFFAF0] p-3 text-[11px] leading-5 text-[#877151]">These guidelines reproduce the reference screen. Your live backend remains authoritative for eligibility, CV conversion, pricing and account placement.</div>}
                            </section>
                        </div>
                        <TransactionHistory transactions={tcData.transactions} />
                    </>
                )}
            </div>
            {onCreateAccount && <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={onCreateAccount} />}
        </main>
    );
}
