"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  BookOpenText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileClock,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import {
  useGetTcBankDashboardQuery,
  usePlaceBankedTcMutation,
} from "@/lib/redux/api/distributor/userDashboardApi";

// =====================================================
// TYPES
// =====================================================

export interface TCBankAccount {
  id: string | number;
  account_id: string;
  rank: string;
  status: string;
  type?: string;
  member_id?: number;
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
  transactions: TCBankTransaction[];
}

export interface CreateTCBankAccountInput {
  note: string;
}

export interface TCBankAllocationOption {
  value: string;
  label: string;
  leftAvailable?: boolean;
  rightAvailable?: boolean;
}

export interface TCBankPageProps {
  data?: TCBankData | null;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null;
  onRefresh?: () => void | Promise<void>;
  onCreateAccount?: (input: CreateTCBankAccountInput) => Promise<void> | void;
  onBack?: () => void;
  className?: string;
}

export const EXAMPLE_TC_BANK_DATA: TCBankData = {
  available_balance: 0,
  qualified_accounts: 0,
  required_qualified_accounts: 3,
  zone_tc_cv_price: 600,
  transactions: [],
};

// =====================================================
// HELPERS
// =====================================================

const n = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const number = (value: number | string | null | undefined): string =>
  n(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const getStatusTone = (status: string) => {
  const normalized = (status || "").toLowerCase();
  if (
    ["activated", "active", "qualified", "completed", "success"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "border-[#D7EEE2] bg-[#F1FBF5] text-[#237A55]";
  }
  if (
    ["failed", "blocked", "rejected", "cancel"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "border-[#F0DBDB] bg-[#FFF6F6] text-[#B45353]";
  }
  if (["pending", "process", "review"].some((s) => normalized.includes(s))) {
    return "border-[#F1E5CC] bg-[#FFF9ED] text-[#9F7134]";
  }
  return "border-[#E7E9ED] bg-[#F7F8FA] text-[#697386]";
};

const getTypeBadge = (type?: string) => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "base") {
    return "border-[#DDE6F4] bg-[#EFF4FD] text-[#456CA7]";
  }
  if (normalized === "extra_tc") {
    return "border-[#E8E3F5] bg-[#F5F2FB] text-[#7A5AC7]";
  }
  return "border-[#E7E9ED] bg-[#F7F8FA] text-[#697386]";
};

const formatType = (type?: string) => {
  if (!type) return "—";
  return type === "extra_tc"
    ? "Extra TC"
    : type.charAt(0).toUpperCase() + type.slice(1);
};

const panel =
  "min-w-0 rounded-[18px] border border-[#E7EAF0] bg-white shadow-[0_3px_18px_rgba(16,24,40,0.035)]";

// =====================================================
// SMALL UI COMPONENTS
// =====================================================

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
        <h2 className="text-[15px] font-bold tracking-[-.025em] text-[#202734] sm:text-[17px]">
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] leading-4 text-[#8690A0]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function PageSizePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
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
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2 top-[10px] text-[#8993A3]"
        />
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
        <span className="text-[11px] text-[#8B94A3]">
          Showing {from}–{to} of {total}
        </span>
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
        <span className="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[#191919] px-2 text-[11px] font-bold text-white">
          {page}
        </span>
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

function EmptyTable({
  kind,
  hasSearch,
}: {
  kind: "accounts" | "transactions";
  hasSearch: boolean;
}) {
  return (
    <div className="flex min-h-[154px] flex-col items-center justify-center px-4 py-7 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#F5F7FA] text-[#8E9BAE]">
        {kind === "accounts" ? (
          <UsersRound size={19} />
        ) : (
          <FileClock size={19} />
        )}
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#424C5C]">
        {hasSearch
          ? "No matching records"
          : kind === "accounts"
            ? "No accounts found"
            : "No transactions yet"}
      </p>
      <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#98A2B3]">
        {hasSearch
          ? "Try searching by a different account or transaction reference."
          : kind === "accounts"
            ? "Your TC Bank accounts will appear here."
            : "TC Bank activity will appear here once recorded."}
      </p>
    </div>
  );
}

// =====================================================
// ACCOUNT LIST (Member column removed)
// =====================================================

function AccountList({
  accounts,
  search,
  isLoading,
  isError,
  onRetry,
}: {
  accounts: TCBankAccount[];
  search: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...accounts]
      .filter(
        (account) =>
          !q ||
          [
            account.account_id,
            account.rank,
            account.status,
            account.type,
          ].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(q),
          ),
      )
      .sort((a, b) =>
        sortAsc
          ? a.account_id.localeCompare(b.account_id)
          : b.account_id.localeCompare(a.account_id),
      );
  }, [accounts, search, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * size, safePage * size);
  const updateSize = (v: number) => {
    setSize(v);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[13px] border border-[#E8ECF1]">
        <Loader2 size={22} className="animate-spin text-[#5B6B82]" />
        <span className="text-[11px] text-[#8791A0]">
          Loading accounts…
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[13px] border border-[#F1D6D6] bg-[#FFF7F7] px-4 text-center">
        <AlertCircle size={22} className="text-[#B45353]" />
        <p className="text-[12px] font-semibold text-[#8E3A3A]">
          Failed to load accounts
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 rounded-[8px] border border-[#E3C8C8] bg-white px-3 py-1 text-[11px] font-semibold text-[#8E3A3A] hover:bg-[#FFF0F0]"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[13px] border border-[#E8ECF1]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead className="bg-[#F7F9FB]">
            <tr className="border-b border-[#E9ECF1] text-[10px] font-bold uppercase tracking-[.075em] text-[#7A8799]">
              <th className="px-4 py-3.5 sm:px-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#191919]"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Account ID{" "}
                  <ChevronDown
                    size={12}
                    className={sortAsc ? "rotate-180" : ""}
                  />
                </button>
              </th>
              <th className="px-4 py-3.5">Rank</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((account) => (
              <tr
                key={account.id}
                className="border-b border-[#EFF1F5] text-[12px] last:border-b-0 hover:bg-[#FCFCFD]"
              >
                <td className="px-4 py-3.5 font-bold text-[#243247] sm:px-5">
                  <span className="break-all">{account.account_id}</span>
                </td>
                <td className="px-4 py-3.5 font-medium text-[#687386]">
                  {account.rank || "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTypeBadge(account.type)}`}
                  >
                    {formatType(account.type)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusTone(account.status)}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {account.status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <EmptyTable kind="accounts" hasSearch={!!search.trim()} />
      )}
      <Pagination
        total={filtered.length}
        page={safePage}
        size={size}
        onPageChange={setPage}
        onSizeChange={updateSize}
      />
    </div>
  );
}

function TransactionHistory({
  transactions,
}: {
  transactions: TCBankTransaction[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [newestFirst, setNewestFirst] = useState(true);
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const matches = transactions.filter(
      (tx) =>
        !q ||
        [
          tx.date,
          tx.category,
          tx.description,
          tx.order_id,
          tx.related_member,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q),
        ),
    );
    return [...matches].sort((a, b) =>
      newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }, [transactions, search, newestFirst]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * size, safePage * size);
  const updateSize = (v: number) => {
    setSize(v);
    setPage(1);
  };

  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <SectionHeading
          icon={FileClock}
          title="TC Bank Transaction History"
          subtitle="All credit, debit and account activity"
        />
        <div className="relative w-full sm:w-[245px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B0]"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-9 w-full rounded-[9px] border border-[#E5E9EF] bg-[#FAFBFC] pl-9 pr-3 text-[11px] text-[#293343] outline-none placeholder:text-[#9CA5B3] focus:border-[#667386] focus:bg-white"
          />
        </div>
      </div>
      <div className="mx-4 overflow-hidden rounded-[13px] border border-[#E8ECF1] sm:mx-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="bg-[#F7F9FB]">
              <tr className="border-b border-[#E9ECF1] text-[10px] font-bold uppercase tracking-[.075em] text-[#7A8799]">
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 hover:text-[#191919]"
                    onClick={() => setNewestFirst((v) => !v)}
                  >
                    Date{" "}
                    <ChevronDown
                      size={12}
                      className={newestFirst ? "" : "rotate-180"}
                    />
                  </button>
                </th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">TC Bank</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Related member</th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => {
                const isCredit =
                  tx.direction === "credit" ||
                  (!tx.direction && n(tx.amount) >= 0);
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#EFF1F5] text-[11px] last:border-b-0 hover:bg-[#FCFCFD]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#657184]">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#3F4C5F]">
                      {tx.category}
                    </td>
                    <td className="max-w-[290px] px-4 py-3.5 text-[#657184]">
                      {tx.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-bold text-[#253243]">
                      <span
                        className={`inline-flex items-center gap-1 ${isCredit ? "text-[#278366]" : "text-[#B96C47]"}`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft size={13} />
                        ) : (
                          <ArrowUpRight size={13} />
                        )}
                        {isCredit ? "+" : "−"}
                        {number(Math.abs(n(tx.amount)))}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#657184]">
                      {tx.order_id || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[#657184]">
                      {tx.related_member || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <EmptyTable kind="transactions" hasSearch={!!search.trim()} />
        )}
        <Pagination
          total={filtered.length}
          page={safePage}
          size={size}
          onPageChange={setPage}
          onSizeChange={updateSize}
        />
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
      setError(
        err instanceof Error
          ? err.message
          : "Account could not be created. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tc-create-title"
        className="w-full max-w-[440px] overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_24px_85px_rgba(0,0,0,0.24)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#EDF0F3] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#F1F4F8] text-[#3E5068]">
              <Plus size={21} />
            </span>
            <div>
              <h3
                id="tc-create-title"
                className="text-[17px] font-bold text-[#202734]"
              >
                New TC Bank Account
              </h3>
              <p className="mt-1 text-[11px] text-[#8790A0]">
                Submit a request using your linked backend
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E8EE] text-[#727C8B] hover:bg-[#F5F6F8] disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 sm:p-6">
          <div className="rounded-[11px] border border-[#E7EAF0] bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#677489]">
            New account creation is handled by your existing API. Confirm
            eligibility and any fees with your backend before submitting.
          </div>
          <label
            htmlFor="tc-new-account-note"
            className="mb-1.5 mt-5 block text-[12px] font-semibold text-[#354154]"
          >
            Note (optional)
          </label>
          <textarea
            id="tc-new-account-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            placeholder="Additional information for your request"
            className="w-full resize-none rounded-[11px] border border-[#E1E6ED] p-3 text-[12px] outline-none placeholder:text-[#A6AFBB] focus:border-[#424242]"
          />
          {error && (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-[#F0D6D6] bg-[#FFF6F6] px-3 py-2 text-[11px] text-[#AD4A4A]"
            >
              {error}
            </div>
          )}
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-10 rounded-[10px] border border-[#E1E4EA] bg-white px-4 text-[12px] font-semibold text-[#586373] hover:bg-[#F8F9FA] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#343434] disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {busy ? "Submitting..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// TC ALLOCATION
// =====================================================

function TCAllocation({
  baId,
  placements,
  placementsLoading,
  placementsError,
  availableBalance,
  onRefreshPlacements,
  onAllocated,
}: {
  baId: string;
  placements: TCBankAllocationOption[];
  placementsLoading: boolean;
  placementsError: boolean;
  availableBalance: number;
  onRefreshPlacements: () => void;
  onAllocated?: () => void | Promise<void>;
}) {
  const [placementBaId, setPlacementBaId] = useState("");
  const [side, setSide] = useState<"left" | "right" | "">("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [placeBankedTc, { isLoading: submitting }] =
    usePlaceBankedTcMutation();

  const selectedPlacement = useMemo(
    () => placements.find((p) => p.value === placementBaId),
    [placements, placementBaId],
  );

  React.useEffect(() => {
    if (!selectedPlacement || !side) return;
    if (side === "left" && selectedPlacement.leftAvailable === false) {
      setSide("");
    }
    if (side === "right" && selectedPlacement.rightAvailable === false) {
      setSide("");
    }
  }, [selectedPlacement, side]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!baId || !placementBaId || !side || submitting) return;
    if (availableBalance <= 0) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await placeBankedTc({
        ba_id: baId,
        placement_ba_id: placementBaId,
        side: side === "left" ? 1 : 2,
      }).unwrap();

      if (res?.success === false || res?.status === false) {
        throw new Error(res?.message || "TC placement failed");
      }

      setSuccess("TC placed successfully.");
      setPlacementBaId("");
      setSide("");
      await onAllocated?.();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error
          ? cause.message
          : typeof cause === "object" && cause !== null && "data" in cause
            ? ((cause as { data?: { message?: string } }).data?.message ??
              "TC placement failed. Please try again.")
            : "TC placement failed. Please try again.";
      setError(message);
    }
  };

  const selectClass =
    "h-[44px] w-full appearance-none rounded-[10px] border border-[#E2E7EE] bg-white px-3.5 pr-9 text-[12px] font-medium text-[#293447] outline-none focus:border-[#78899C] focus:ring-2 focus:ring-[#78899C]/15 disabled:bg-[#F6F7F9] disabled:text-[#9AA3B0]";

  const hasBalance = availableBalance > 0;
  const canSubmit =
    hasBalance &&
    !!baId &&
    !!placementBaId &&
    !!side &&
    !submitting &&
    !!placements.length;

  return (
    <section className={`${panel} overflow-hidden`} aria-label="TC Allocation">
      <div className="border-b border-[#EDF0F4] px-4 py-4 sm:px-5">
        <SectionHeading
          icon={GitBranch}
          title="TC Allocation"
          subtitle="Select the BA ID, choose a TC and select the binary side"
        />
      </div>
      <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
        {!hasBalance && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-[9px] border border-[#F1E5CC] bg-[#FFF9ED] px-3 py-2 text-[11px] font-medium text-[#9F7134]"
          >
            <AlertCircle size={14} />
            No TC available in your bank balance. Available balance is{" "}
            {number(availableBalance)} — you cannot place a TC until you have a
            positive balance.
          </div>
        )}

        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,380px)_minmax(0,175px)_auto] sm:justify-start">
          <label className="min-w-0">
            <span className="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[#485263]">
              <span>Placement BA ID</span>
              {placementsLoading && (
                <Loader2 size={12} className="animate-spin text-[#8893A2]" />
              )}
            </span>
            <span className="relative block">
              <select
                aria-label="Placement BA ID"
                className={selectClass}
                value={placementBaId}
                disabled={
                  submitting ||
                  placementsLoading ||
                  !placements.length ||
                  !hasBalance
                }
                onChange={(e) => {
                  setPlacementBaId(e.target.value);
                  setSuccess(null);
                  setError(null);
                }}
              >
                <option value="">
                  {placementsLoading
                    ? "Loading available BA IDs..."
                    : placements.length === 0
                      ? "No placements available"
                      : "Select placement BA ID"}
                </option>
                {placements.map((option) => {
                  const sides: string[] = [];
                  if (option.leftAvailable) sides.push("L");
                  if (option.rightAvailable) sides.push("R");
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label} — {sides.join("/") || "full"}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-3.5 text-[#5E718B]"
              />
            </span>
            {placementsError && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-[#B45353]">
                <AlertCircle size={11} /> Failed to load placements.{" "}
                <button
                  type="button"
                  onClick={onRefreshPlacements}
                  className="underline hover:text-[#7A3535]"
                >
                  Retry
                </button>
              </p>
            )}
          </label>

          <label className="min-w-0">
            <span className="mb-1.5 block text-[12px] font-semibold text-[#485263]">
              Left/Right
            </span>
            <span className="relative block">
              <select
                aria-label="Placement side"
                value={side}
                disabled={submitting || !placementBaId || !hasBalance}
                onChange={(event) => {
                  setSide(event.target.value as "left" | "right" | "");
                  setSuccess(null);
                }}
                className={selectClass}
              >
                <option value="">Select side</option>
                <option
                  value="left"
                  disabled={selectedPlacement?.leftAvailable === false}
                >
                  Left
                  {selectedPlacement?.leftAvailable === false
                    ? " (unavailable)"
                    : ""}
                </option>
                <option
                  value="right"
                  disabled={selectedPlacement?.rightAvailable === false}
                >
                  Right
                  {selectedPlacement?.rightAvailable === false
                    ? " (unavailable)"
                    : ""}
                </option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-3.5 text-[#5E718B]"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            title={
              !hasBalance
                ? "Available TC balance is 0 — cannot place"
                : undefined
            }
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#171717] px-6 text-[12px] font-bold text-white hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#CFD4DC] disabled:text-[#778292]"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {baId && (
          <p className="flex items-center gap-1.5 text-[10px] text-[#8B96A6]">
            <Info size={12} /> Placing from:{" "}
            <strong className="font-semibold text-[#5F6C80]">{baId}</strong>
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[9px] border border-[#F0D8D8] bg-[#FFF7F7] px-3 py-2 text-[11px] font-medium text-[#B24E4E]"
          >
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-[9px] border border-[#D9EBDD] bg-[#F5FBF7] px-3 py-2 text-[11px] font-medium text-[#287A56]"
          >
            <CheckCircle2 size={14} />
            {success}
          </p>
        )}
      </form>
    </section>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

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

  const { data: profileData } = useGetUserProfileQuery();
  const distributorBaId = profileData?.user?.distributor_id ?? "";

  const {
    data: tcBankRes,
    isLoading: tcBankLoading,
    isFetching: tcBankFetching,
    isError: tcBankError,
    refetch: refetchTcBank,
  } = useGetTcBankDashboardQuery();

  const placementOptions: TCBankAllocationOption[] = useMemo(() => {
    const list = tcBankRes?.data?.available_slots ?? [];
    return list.map((p) => ({
      value: p.ba_id,
      label: p.display_label || p.ba_id,
      leftAvailable: p.left_available,
      rightAvailable: p.right_available,
    }));
  }, [tcBankRes]);

  const accountRows: TCBankAccount[] = useMemo(() => {
    const list = tcBankRes?.data?.my_accounts ?? [];
    return list.map((a) => ({
      id: a.account_id,
      account_id: a.account_id,
      rank: a.rank_no ? `Rank ${a.rank_no}` : "—",
      status: a.status,
      type: a.type,
      member_id: a.member_id,
    }));
  }, [tcBankRes]);

  const balances = tcBankRes?.data?.balances;
  const availableBalance = n(balances?.available_balance);
  const qualifiedStatus = balances?.qualified_status ?? "0 / 0";
  const zoneTcCvPrice = balances?.zone_tc_cv_price ?? 600;

  const [qualifiedCount, requiredCount] = useMemo(() => {
    const parts = String(qualifiedStatus)
      .split("/")
      .map((p) => Number(p.trim()));
    return [parts[0] || 0, parts[1] || 0];
  }, [qualifiedStatus]);

  const tcData = data === undefined ? EXAMPLE_TC_BANK_DATA : data;

  const combinedError =
    error ||
    (tcBankError
      ? "Failed to load TC Bank dashboard. Please try again."
      : null);

  const pageLoading = isLoading || tcBankLoading;
  const pageFetching = isFetching || tcBankFetching;

  return (
    <main
      className={`w-full min-w-0  text-[#253044] ${className}`}
      style={{ fontFamily: "'Inter', 'Lato', system-ui, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-5">
        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to dashboard"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E9EF] bg-white text-[#5F6D80] hover:bg-[#F2F4F7]"
              >
                <ArrowLeft size={17} />
              </button>
            )}
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#9AA3B1]">
                Distributor / TC Bank
              </p>
              <h1 className="text-[22px] font-bold leading-tight tracking-[-.04em] text-[#1F2937] sm:text-[26px]">
                TC Bank
              </h1>
              <p className="mt-1 text-[12px] text-[#8691A1]">
                Manage your TC balance, accounts and transactions
                {distributorBaId && (
                  <>
                    {" "}
                    ·{" "}
                    <strong className="font-semibold text-[#5F6C80]">
                      {distributorBaId}
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageFetching || pageLoading}
              onClick={() => {
                void refetchTcBank();
                if (onRefresh) void onRefresh();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E2E7EE] bg-white px-3 text-[11px] font-semibold text-[#48576D] hover:bg-[#F4F6F9] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={pageFetching ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
            <span className="hidden items-center gap-1.5 rounded-full border border-[#E2E9F2] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#6E798B] sm:inline-flex">
              <ShieldCheck size={13} /> TC Bank Overview
            </span>
          </div>
        </div>

        {combinedError && (
          <div
            role="alert"
            className="rounded-[11px] border border-[#F1D6D6] bg-[#FFF5F5] px-4 py-3 text-[12px] text-[#A94343]"
          >
            {combinedError}
          </div>
        )}

        {pageLoading ? (
          <div
            className={`${panel} flex min-h-[320px] flex-col items-center justify-center gap-3`}
          >
            <Loader2 size={25} className="animate-spin text-[#5B6B82]" />
            <span className="text-[12px] text-[#8791A0]">
              Loading TC Bank details...
            </span>
          </div>
        ) : !tcData ? (
          <div
            className={`${panel} flex min-h-[250px] flex-col items-center justify-center px-5 text-center`}
          >
            <CircleHelp size={24} className="text-[#98A2B3]" />
            <p className="mt-3 text-[13px] font-semibold">
              TC Bank data is unavailable
            </p>
            <p className="mt-1 text-[11px] text-[#97A1B0]">
              Please connect your TC Bank API to display account information.
            </p>
          </div>
        ) : (
          <>
            {/* BALANCE SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={`${panel} p-4 sm:p-5`}>
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9AA3B1]">
                  Available Balance
                </p>
                <p className="mt-2 text-[24px] font-bold tracking-[-.03em] text-[#1F2937]">
                  {number(availableBalance)}{" "}
                  <span className="text-[12px] font-semibold text-[#8691A1]">
                    TC
                  </span>
                </p>
              </div>
              <div className={`${panel} p-4 sm:p-5`}>
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9AA3B1]">
                  Qualified Accounts
                </p>
                <p className="mt-2 text-[24px] font-bold tracking-[-.03em] text-[#1F2937]">
                  {qualifiedCount}{" "}
                  <span className="text-[12px] font-semibold text-[#8691A1]">
                    / {requiredCount}
                  </span>
                </p>
              </div>
              <div className={`${panel} p-4 sm:p-5`}>
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9AA3B1]">
                  Zone TC CV Price
                </p>
                <p className="mt-2 text-[24px] font-bold tracking-[-.03em] text-[#1F2937]">
                  {number(zoneTcCvPrice)}{" "}
                  <span className="text-[12px] font-semibold text-[#8691A1]">
                    CV
                  </span>
                </p>
              </div>
            </div>

            {/* =====================================================
                ACCOUNTS + HOW TC BANK WORKS — SIDE BY SIDE, EQUAL HEIGHT
               ===================================================== */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
              {/* ACCOUNTS */}
              <section className={`${panel} flex h-full flex-col overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
                  <SectionHeading
                    icon={UsersRound}
                    title="My Accounts Status"
                    subtitle="Your active and qualified TC Bank accounts"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 sm:px-5">
                  <div className="relative w-full sm:max-w-[260px]">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A9B7]"
                    />
                    <input
                      aria-label="Search accounts"
                      placeholder="Search account ID, rank..."
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      className="h-9 w-full rounded-[9px] border border-[#E5E9EF] bg-[#FAFBFC] pl-9 pr-3 text-[11px] outline-none placeholder:text-[#A6AFBD] focus:border-[#687589] focus:bg-white"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#8B95A5]">
                    {tcBankLoading
                      ? "Loading…"
                      : `${accountRows.length} accounts`}
                  </span>
                </div>
                <div className="flex-1 px-4 pb-4 sm:px-5 sm:pb-5">
                  <AccountList
                    accounts={accountRows}
                    search={accountQuery}
                    isLoading={tcBankLoading}
                    isError={tcBankError}
                    onRetry={() => void refetchTcBank()}
                  />
                </div>
              </section>

              {/* HOW TC BANK WORKS */}
              <section className={`${panel} flex h-full flex-col p-4 sm:p-5`}>
                <SectionHeading
                  icon={BookOpenText}
                  title="How TC Bank Works"
                  subtitle="Qualification, purchase and placement guidelines"
                />
                <div className="mt-4 flex-1 grid grid-cols-1 gap-2.5">
                  <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#EDF3FC] text-[11px] font-bold text-[#4F6B97]">
                      01
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#344154]">
                        Account qualification
                      </p>
                      <p className="mt-1 text-[11px] leading-[19px] text-[#788496]">
                        First 3 accounts need 300 CV qualification before a TC
                        Counter can be purchased.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#FFF6E7] text-[11px] font-bold text-[#AA8043]">
                      02
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#344154]">
                        Counter purchase
                      </p>
                      <p className="mt-1 text-[11px] leading-[19px] text-[#788496]">
                        During purchasing, 600 CV can be exchanged for 1 counter
                        in the TC Bank.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-[12px] border border-[#EEF0F4] bg-[#FBFCFD] p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#EEF8F2] text-[11px] font-bold text-[#4A8C6B]">
                      03
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#344154]">
                        Binary placement rule
                      </p>
                      <p className="mt-1 text-[11px] leading-[19px] text-[#788496]">
                        4th account and onwards cannot be placed under 2nd or
                        3rd account directly in the binary tree.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllRules((value) => !value)}
                  className="mt-3 inline-flex items-center gap-1.5 self-start text-[11px] font-semibold text-[#526782] hover:text-[#202D42]"
                >
                  {showAllRules ? "Hide" : "View"} important note{" "}
                  <ChevronDown
                    size={13}
                    className={showAllRules ? "rotate-180" : ""}
                  />
                </button>
                {showAllRules && (
                  <div className="mt-2 rounded-[10px] border border-[#E9E3D8] bg-[#FFFAF0] p-3 text-[11px] leading-5 text-[#877151]">
                    These guidelines reproduce the reference screen. Your live
                    backend remains authoritative for eligibility, CV
                    conversion, pricing and account placement.
                  </div>
                )}
              </section>
            </div>

            {/* TC ALLOCATION */}
            <TCAllocation
              baId={distributorBaId}
              placements={placementOptions}
              placementsLoading={tcBankLoading}
              placementsError={tcBankError}
              availableBalance={availableBalance}
              onRefreshPlacements={() => void refetchTcBank()}
              onAllocated={() => {
                void refetchTcBank();
                if (onRefresh) void onRefresh();
              }}
            />

            {/* TRANSACTIONS */}
            <TransactionHistory transactions={tcData.transactions} />
          </>
        )}
      </div>

      {onCreateAccount && (
        <CreateAccountModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={onCreateAccount}
        />
      )}
    </main>
  );
}