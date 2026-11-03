"use client";

import { useMemo, useState } from "react";
import { useGetCommissionsHistoryQuery } from "@/lib/redux/api/distributor/commissionsHistoryApi";

import {
    BarChart3,
    BookOpen,
    Coins,
    Award,
    Sparkles,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Inbox,
    Loader2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import type { CommissionHistoryItem } from "@/lib/redux/api/distributor/commissionsHistoryApi";

// =====================================================
// COMMISSION CARDS
// =====================================================

const CARDS = [
    {
        label: "Retail profit",
        value: "₹0.00",
        color: "#3955A6",
        bg: "#eceffb",
        icon: BarChart3,
    },
    {
        label: "Weekly pairing",
        value: "₹0.00",
        color: "#B8935A",
        bg: "#f8f1e4",
        icon: BookOpen,
    },
    {
        label: "Unilevel green coin",
        value: "0",
        color: "#1f9d6b",
        bg: "#eaf7f0",
        icon: Coins,
    },
    {
        label: "Strong leg",
        value: "₹0.00",
        color: "#6B4C9A",
        bg: "#f1ebf7",
        icon: Award,
    },
    {
        label: "Floating (pending release)",
        value: "₹0.00",
        color: "#3955A6",
        bg: "#eceffb",
        icon: Sparkles,
    },
    {
        label: "Released",
        value: "₹0.00",
        color: "#1f9d6b",
        bg: "#eaf7f0",
        icon: CheckCircle2,
    },
];

// =====================================================
// TABLE COLUMNS
// =====================================================

const TABLE_COLUMNS = [
    "Category",
    "Date created",
    "Date released",
    "Description",
    "Amount",
    "Related order ID",
    "Related member",
];

const GRID_TEMPLATE = "1.2fr 1.2fr 1.2fr 1.5fr 1fr 1.2fr 1.2fr";

// =====================================================
// FILTER OPTIONS
// =====================================================

const FILTER_OPTIONS = [
    { label: "All types", value: "all" },
    { label: "Cash balance", value: "cash_bal" },
    { label: "Green balance", value: "green_bal" },
    { label: "Yellow balance", value: "yellow_bal" },
    { label: "Credit", value: "cr" },
    { label: "Withdrawal", value: "wd" },
    { label: "Adjustment", value: "adj" },
];

// =====================================================
// PAGINATION
// =====================================================

const PAGE_SIZES = [10, 20, 50];

// =====================================================
// CATEGORY LABEL
// =====================================================

const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
        cash_bal: "Cash Balance",
        green_bal: "Green Balance",
        yellow_bal: "Yellow Balance",
        blue_bal: "Blue Balance",
    };

    return (
        categories[category] ||
        category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
};

// =====================================================
// TRANSACTION DESCRIPTION
// =====================================================

const getDescriptionLabel = (description: string) => {
    const descriptions: Record<string, string> = {
        adj_add: "Adjustment Added",
        adj_remove: "Adjustment Removed",
        wd_partner_payout: "Partner Payout",
        cr_out: "Credit Transfer Out",
        cr_in: "Credit Transfer In",
    };

    return (
        descriptions[description] ||
        description.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";

    const parsedDate = new Date(date.replace(" ", "T"));

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(parsedDate);
};

// =====================================================
// FORMAT AMOUNT
// =====================================================

const formatAmount = (amount: string | number) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return String(amount);
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(value);
};

// =====================================================
// AMOUNT COLOR
// =====================================================

const getAmountColor = (amount: string) => {
    const value = Number(amount);

    if (value > 0) {
        return "text-[#1F9D6B]";
    }

    if (value < 0) {
        return "text-[#D14C4C]";
    }

    return "text-[#667085]";
};

// =====================================================
// RELATED MEMBER
// =====================================================

const getRelatedMember = (
    member: CommissionHistoryItem["related_member"]
): string => {
    if (member === null || member === undefined || member === "") {
        return "—";
    }

    if (
        typeof member === "string" ||
        typeof member === "number"
    ) {
        return String(member);
    }

    if (typeof member === "object") {
        const data = member as Record<string, unknown>;

        const value =
            data.account_id ??
            data.ba_id ??
            data.member_id ??
            data.name;

        return value !== undefined && value !== null
            ? String(value)
            : "—";
    }

    return "—";
};

// =====================================================
// ERROR MESSAGE
// =====================================================

const getErrorMessage = (error: unknown): string => {
    if (!error || typeof error !== "object") {
        return "Unable to load commissions history. Please try again.";
    }

    const apiError = error as {
        data?: { message?: string };
        error?: string;
        message?: string;
    };

    return (
        apiError.data?.message ||
        apiError.error ||
        apiError.message ||
        "Unable to load commissions history. Please try again."
    );
};

// =====================================================
// COMPONENT
// =====================================================

const Commissions = () => {

    // =================================================
    // STATES
    // =================================================

    const [filterType, setFilterType] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // =================================================
    // COMMISSIONS HISTORY API
    // =================================================

    const {
        data: commissionsResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetCommissionsHistoryQuery();

    // =================================================
    // API DATA
    // =================================================

    const commissionsHistory: CommissionHistoryItem[] =
        commissionsResponse?.data ?? [];

    const hasMore = commissionsResponse?.has_more ?? false;

    // =================================================
    // FILTER RECORDS
    // =================================================

    const filteredRecords = useMemo(() => {
        if (filterType === "all") {
            return commissionsHistory;
        }

        return commissionsHistory.filter(
            (item) =>
                item.category === filterType ||
                item.tx_type === filterType
        );
    }, [commissionsHistory, filterType]);

    // =================================================
    // PAGINATION
    // =================================================

    const totalRecords = filteredRecords.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * pageSize;

    const visibleRecords = filteredRecords.slice(
        startIndex,
        startIndex + pageSize
    );

    const startRecord = totalRecords > 0
        ? startIndex + 1
        : 0;

    const endRecord = Math.min(
        startIndex + pageSize,
        totalRecords
    );

    // =================================================
    // FILTER HANDLER
    // =================================================

    const handleFilterChange = (value: string) => {
        setFilterType(value);
        setPage(1);
    };

    // =================================================
    // PAGE SIZE HANDLER
    // =================================================

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setPage(1);
    };

    // =================================================
    // REFRESH HANDLER
    // =================================================

    const handleRefresh = () => {
        void refetch();
    };

    // =================================================
    // UI
    // =================================================

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
        >

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
            `}</style>

            {/* =========================================
                HEADING
            ========================================= */}

            <h1 className="text-[17px] font-bold text-[#101828]">
                My commissions
            </h1>

            {/* =========================================
                COMMISSION CARDS
            ========================================= */}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                {CARDS.map(({ label, value, color, bg, icon: Icon }) => (

                    <div
                        key={label}
                        className="flex min-h-[78px] items-center justify-between rounded-[14px] border border-[#e7e9ee] bg-white px-4 py-3 sm:h-[84px] sm:py-0"
                    >

                        <div className="min-w-0 pr-2">

                            <p className="text-[12px] font-semibold leading-snug text-[#667085]">
                                {label}
                            </p>

                            <p
                                className="mt-1 text-[18px] font-black sm:text-[19px]"
                                style={{ color }}
                            >
                                {value}
                            </p>

                        </div>

                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                            style={{ backgroundColor: bg }}
                        >
                            <Icon
                                className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                                style={{ color }}
                            />
                        </div>

                    </div>

                ))}

            </div>

            {/* =========================================
                COMMISSIONS HISTORY
            ========================================= */}

            <div className="mt-8">

                {/* =====================================
                    TABLE HEADER + FILTER
                ===================================== */}

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <h3 className="text-[15px] font-bold text-[#101828]">
                            Commissions history
                        </h3>

                        <span className="rounded-full border border-[#E7EAF0] bg-[#F8F9FB] px-2.5 py-1 text-[10px] font-semibold text-[#667085]">
                            {commissionsResponse?.data?.length ?? 0}
                        </span>

                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto">

                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            aria-label="Refresh commissions history"
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] text-[#667085] transition hover:bg-[#edf0f4] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={isFetching ? "animate-spin" : ""}
                            />
                        </button>

                        {/* FILTER */}

                        <select
                            value={filterType}
                            onChange={(e) =>
                                handleFilterChange(e.target.value)
                            }
                            className="h-[38px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[13px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10 sm:w-[180px]"
                        >

                            {FILTER_OPTIONS.map((option) => (

                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>

                            ))}

                        </select>

                    </div>

                </div>

                {/* =====================================
                    ERROR STATE
                ===================================== */}

                {isError && (

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#F0D6D6] bg-[#FFF6F6] px-4 py-3">

                        <div className="flex items-center gap-2 text-[12px] text-[#B54747]">

                            <AlertCircle size={16} className="shrink-0" />

                            <span>
                                {getErrorMessage(error)}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            className="rounded-[7px] bg-[#B54747] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#983B3B] disabled:opacity-50"
                        >
                            Retry
                        </button>

                    </div>

                )}

                {/* =====================================
                    TABLE
                ===================================== */}

                <div className="overflow-x-auto">

                    <div className="min-w-[760px]">

                        {/* =================================
                            TABLE HEADER
                        ================================= */}

                        <div
                            className="grid gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]"
                            style={{
                                gridTemplateColumns: GRID_TEMPLATE,
                            }}
                        >

                            {TABLE_COLUMNS.map((col) => (

                                <span key={col}>
                                    {col}
                                </span>

                            ))}

                        </div>

                        {/* =================================
                            LOADING STATE
                        ================================= */}

                        {isLoading ? (

                            <div className="flex flex-col items-center justify-center gap-3 py-14">

                                <Loader2
                                    className="h-7 w-7 animate-spin text-[#0E1B3D]"
                                />

                                <p className="text-[12.5px] font-medium text-[#8a92a6]">
                                    Loading commissions history...
                                </p>

                            </div>

                        ) : filteredRecords.length === 0 ? (

                            /* =================================
                               EMPTY STATE
                            ================================= */

                            <div className="flex flex-col items-center justify-center gap-3 py-12 sm:py-14">

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f4f7]">
                                    <Inbox className="h-5 w-5 text-[#98a2b3]" />
                                </div>

                                <div className="px-4 text-center">

                                    <p className="text-[13.5px] font-semibold text-[#344054]">
                                        {filterType !== "all"
                                            ? "No matching transactions"
                                            : "No commissions yet"}
                                    </p>

                                    <p className="mt-1 text-[12.5px] text-[#8a92a6]">
                                        {filterType !== "all"
                                            ? "Try selecting another transaction type."
                                            : "Commissions will show up here once they're earned."}
                                    </p>

                                </div>

                            </div>

                        ) : (

                            /* =================================
                               TABLE BODY
                            ================================= */

                            <div>

                                {visibleRecords.map((item) => (

                                    <div
                                        key={item.id}
                                        className="grid items-center gap-2 border-b border-[#f0f2f5] py-4 text-[11.5px] text-[#475467] transition-colors last:border-b-0 hover:bg-[#fafbfc]"
                                        style={{
                                            gridTemplateColumns: GRID_TEMPLATE,
                                        }}
                                    >

                                        {/* CATEGORY */}

                                        <div className="min-w-0">

                                            <span className="inline-flex max-w-full items-center rounded-[7px] border border-[#E7EAF0] bg-[#F8F9FB] px-2 py-1 text-[10px] font-semibold leading-4 text-[#475467]">
                                                {getCategoryLabel(item.category)}
                                            </span>

                                        </div>

                                        {/* DATE CREATED */}

                                        <span className="min-w-0 text-[11px] leading-5 text-[#667085]">
                                            {formatDate(item.date_created)}
                                        </span>

                                        {/* DATE RELEASED */}

                                        <span className="text-[11px] text-[#98A2B3]">
                                            —
                                        </span>

                                        {/* DESCRIPTION */}

                                        <span
                                            className="min-w-0 break-words text-[11.5px] font-medium text-[#344054]"
                                            title={item.description}
                                        >
                                            {getDescriptionLabel(item.description)}
                                        </span>

                                        {/* AMOUNT */}

                                        <span
                                            className={`whitespace-nowrap text-[11.5px] font-bold ${getAmountColor(item.amount)}`}
                                        >
                                            {formatAmount(item.amount)}
                                        </span>

                                        {/* ORDER ID */}

                                        <span className="break-all text-[11px] text-[#667085]">
                                            {item.order_id ?? "—"}
                                        </span>

                                        {/* RELATED MEMBER */}

                                        <span className="break-all text-[11px] text-[#667085]">
                                            {getRelatedMember(item.related_member)}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

                {/* =====================================
                    PAGINATION
                ===================================== */}

                <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f2f5] pt-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* RECORDS PER PAGE */}

                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#667085]">

                        <div className="relative">

                            <select
                                value={pageSize}
                                onChange={(e) =>
                                    handlePageSizeChange(Number(e.target.value))
                                }
                                aria-label="Records per page"
                                className="h-8 appearance-none rounded-[7px] border border-[#e5e9ef] bg-white py-1 pl-2.5 pr-7 text-[12px] font-semibold text-[#344054] outline-none focus:border-[#0E1B3D]"
                            >

                                {PAGE_SIZES.map((size) => (

                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size}
                                    </option>

                                ))}

                            </select>

                            <ChevronDown
                                size={13}
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8a92a6]"
                            />

                        </div>

                        <span className="text-[12px] font-medium text-[#667085]">

                            {totalRecords > 0 ? (
                                <>
                                    Showing{" "}
                                    <strong className="text-[#101828]">
                                        {startRecord}–{endRecord}
                                    </strong>
                                    {" "}of{" "}
                                    <strong className="text-[#101828]">
                                        {totalRecords}
                                    </strong>
                                    {" "}records
                                </>
                            ) : (
                                "No records to show"
                            )}

                        </span>

                    </div>

                    {/* PAGINATION BUTTONS */}

                    <div className="flex items-center gap-2 self-end sm:self-auto">

                        <button
                            type="button"
                            aria-label="Previous page"
                            disabled={currentPage <= 1 || isLoading}
                            onClick={() =>
                                setPage((prev) => Math.max(1, prev - 1))
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#667085] transition-colors hover:bg-[#f2f4f7] disabled:cursor-not-allowed disabled:text-[#d0d5dd]"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <button
                            type="button"
                            className="flex h-7 min-w-7 items-center justify-center rounded-[6px] bg-[#0E1B3D] px-2 text-[12px] font-semibold text-white"
                        >
                            {currentPage}
                        </button>

                        <span className="text-[12px] text-[#8a92a6]">
                            / {totalPages}
                        </span>

                        <button
                            type="button"
                            aria-label="Next page"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#667085] transition-colors hover:bg-[#f2f4f7] disabled:cursor-not-allowed disabled:text-[#d0d5dd]"
                        >
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

                {/* =====================================
                    API FETCHING INDICATOR
                ===================================== */}

                {isFetching && !isLoading && (
                    <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-[#98A2B3]">
                        <Loader2 size={12} className="animate-spin" />
                        Updating records...
                    </div>
                )}

            </div>

        </div>
    );
};

export default Commissions;