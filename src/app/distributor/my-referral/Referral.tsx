"use client";

import { useMemo, useState } from "react";
import { useGetDistributorGenealogyTreeQuery } from "@/lib/redux/api/distributor/distributorGenealogyApi";
import {
    Users,
    UserPlus,
    Network,
    Wallet,
    Search,
    Inbox,
    RefreshCw,
    Loader2,
    AlertCircle,
} from "lucide-react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

interface GenealogyRow {
    member_id: number;
    ba_id: string;
    unilevel_parent_id: number | null;
    unilevel_parent_ba_id: string | null;
    binary_parent_id: number | null;
    binary_parent_ba_id: string | null;
    binary_side: number | null;
    cv_left: string;
    cv_right: string;
    floating_cv_left: string;
    floating_cv_right: string;
    total_cv_left: string;
    total_cv_right: string;
    level: number;
}

interface GenealogyPayload {
    root?: GenealogyRow | null;
    rows: GenealogyRow[];
    depth?: number;
    total_nodes?: number;
    left_volume?: string;
    right_volume?: string;
    cv_floating_left?: string;
    cv_floating_right?: string;
}

const formatNumber = (value: string | number | null | undefined) => {
    const number = Number(value ?? 0);

    return Number.isFinite(number)
        ? number.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
          })
        : "0";
};

const getFloatingCV = (member: GenealogyRow) => {
    return (
        Number(member.floating_cv_left || 0) +
        Number(member.floating_cv_right || 0)
    );
};

const Referral = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetDistributorGenealogyTreeQuery();

    /*
     * Handles both common response formats:
     * { success: true, data: { root, rows } }
     * { root, rows }
     */
    const payload = useMemo<GenealogyPayload | undefined>(() => {
        const apiResponse = response as any;

        const result =
            apiResponse?.data?.data ??
            apiResponse?.data ??
            apiResponse;

        if (!result || !Array.isArray(result.rows)) {
            return undefined;
        }

        return result as GenealogyPayload;
    }, [response]);

    const allRows = payload?.rows ?? [];
    const root = payload?.root;

    /*
     * Direct referrals are identified by unilevel parent.
     * The logged-in member/root itself is excluded.
     */
    const directReferrals = useMemo(() => {
        if (!root) return [];

        return allRows.filter(
            (member) =>
                member.member_id !== root.member_id &&
                (
                    member.unilevel_parent_id === root.member_id ||
                    (
                        member.unilevel_parent_id == null &&
                        member.unilevel_parent_ba_id === root.ba_id
                    )
                )
        );
    }, [allRows, root]);

    /*
     * Search now matches BA ID (primary) and parent BA ID.
     * Member ID search is also kept as a fallback.
     */
    const filteredReferrals = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return directReferrals;

        return directReferrals.filter((member) => {
            return (
                member.ba_id.toLowerCase().includes(query) ||
                String(member.unilevel_parent_ba_id ?? "")
                    .toLowerCase()
                    .includes(query) ||
                String(member.member_id).toLowerCase().includes(query)
            );
        });
    }, [directReferrals, searchQuery]);

    const stats = [
        {
            label: "Direct Referrals",
            value: directReferrals.length,
            color: NAVY,
            bg: "#eceefb",
            icon: Users,
        },
        {
            label: "Network Members",
            value: allRows.filter(
                (member) => member.member_id !== root?.member_id
            ).length,
            color: BRASS,
            bg: "#f8f1e4",
            icon: UserPlus,
        },
        {
            label: "Network Depth",
            value: payload?.depth ?? 0,
            color: INDIGO,
            bg: "#eceffb",
            icon: Network,
        },
        {
            label: "Floating CV",
            value: formatNumber(
                Number(
                    payload?.cv_floating_left ??
                        root?.floating_cv_left ??
                        0
                ) +
                    Number(
                        payload?.cv_floating_right ??
                            root?.floating_cv_right ??
                            0
                    )
            ),
            color: EMERALD,
            bg: "#eaf7f0",
            icon: Wallet,
        },
    ];

    const getDownlineCount = (member: GenealogyRow) => {
        return allRows.filter(
            (item) =>
                item.unilevel_parent_id === member.member_id ||
                (
                    item.unilevel_parent_id == null &&
                    item.unilevel_parent_ba_id === member.ba_id
                )
        ).length;
    };

    const getPosition = (side: number | null) => {
        if (side === 1) return "Left";
        if (side === 2) return "Right";
        return "—";
    };

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

                .referral-scrollbar::-webkit-scrollbar {
                    height: 5px;
                }

                .referral-scrollbar::-webkit-scrollbar-track {
                    background: #f7f8fa;
                    border-radius: 10px;
                }

                .referral-scrollbar::-webkit-scrollbar-thumb {
                    background: #d5dae3;
                    border-radius: 10px;
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-[17px] font-bold text-[#101828]">
                        My referrals
                    </h1>

                    <p className="mt-1 text-[12px] text-[#8a92a6]">
                        View your direct referrals and their network details.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] border border-[#e5e9ef] bg-white px-3 text-[12px] font-semibold text-[#344054] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={14}
                        className={isFetching ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(
                    ({ label, value, color, bg, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex min-h-[88px] items-center justify-between rounded-[14px] border border-[#e7e9ee] bg-white px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-[#667085]">
                                    {label}
                                </p>

                                <p
                                    className="mt-1 break-words text-[22px] font-black"
                                    style={{ color }}
                                >
                                    {value}
                                </p>
                            </div>

                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: bg }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color }}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Search */}
            <div className="mt-6">
                <div className="relative w-full sm:max-w-[420px]">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
                    />

                    <input
                        type="text"
                        placeholder="Search by BA ID"
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(event.target.value)
                        }
                        className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] text-[#667085]">
                        Showing{" "}
                        <span className="font-bold text-[#101828]">
                            {filteredReferrals.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-[#101828]">
                            {directReferrals.length}
                        </span>{" "}
                        direct referrals
                    </p>
                </div>
            </div>

            {/* Referral List */}
            <div className="referral-scrollbar mt-4 overflow-x-auto rounded-[10px] border border-[#e7e9ee]">
                <div className="min-w-[900px]">
                    {/* Table Header — BA ID is now the primary column */}
                    <div className="grid grid-cols-[1.6fr_0.55fr_0.7fr_1.6fr_1fr_0.65fr] gap-3 border-b border-[#e7e9ee] bg-[#f9fafb] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#8a92a6]">
                        <span>BA ID</span>
                        <span>Level</span>
                        <span>Position</span>
                        <span>Parent BA ID</span>
                        <span>Floating CV</span>
                        <span>Downline</span>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                            <Loader2
                                size={27}
                                className="animate-spin"
                                style={{ color: NAVY }}
                            />

                            <p className="text-[13px] text-[#667085]">
                                Loading referrals...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && isError && (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fef3f2]">
                                <AlertCircle
                                    size={21}
                                    className="text-[#d92d20]"
                                />
                            </div>

                            <p className="text-[13px] font-semibold text-[#344054]">
                                Unable to load referrals
                            </p>

                            <p className="text-center text-[12px] text-[#8a92a6]">
                                Please try again to load your referral data.
                            </p>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-1 rounded-[7px] px-4 py-2 text-[12px] font-semibold text-white"
                                style={{ backgroundColor: NAVY }}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty / No Results */}
                    {!isLoading &&
                        !isError &&
                        filteredReferrals.length === 0 && (
                            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f4f7]">
                                    <Inbox className="h-5 w-5 text-[#98a2b3]" />
                                </div>

                                <div className="text-center">
                                    <p className="text-[13.5px] font-semibold text-[#344054]">
                                        {searchQuery.trim()
                                            ? "No matching referrals"
                                            : "No referrals yet"}
                                    </p>

                                    <p className="mt-1 text-[12.5px] text-[#8a92a6]">
                                        {searchQuery.trim()
                                            ? "Try searching with another BA ID."
                                            : "Your direct referrals will appear here once available."}
                                    </p>
                                </div>
                            </div>
                        )}

                    {/* Referral Rows — BA ID shown as primary */}
                    {!isLoading &&
                        !isError &&
                        filteredReferrals.map((member) => (
                            <div
                                key={member.member_id}
                                className="grid grid-cols-[1.6fr_0.55fr_0.7fr_1.6fr_1fr_0.65fr] items-center gap-3 border-b border-[#f0f1f4] px-4 py-4 text-[12px] last:border-b-0 hover:bg-[#fafbfc]"
                            >
                                <span
                                    className="break-all font-bold text-[#101828]"
                                    title={member.ba_id}
                                >
                                    {member.ba_id || "—"}
                                </span>

                                <span className="text-[#475467]">
                                    {member.level ?? "—"}
                                </span>

                                <span>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            member.binary_side === 1
                                                ? "bg-[#eaf7f0] text-[#1f9d6b]"
                                                : member.binary_side === 2
                                                  ? "bg-[#eceffb] text-[#3955A6]"
                                                  : "bg-[#f2f4f7] text-[#667085]"
                                        }`}
                                    >
                                        {getPosition(member.binary_side)}
                                    </span>
                                </span>

                                <span
                                    className="break-all text-[#475467]"
                                    title={member.unilevel_parent_ba_id ?? ""}
                                >
                                    {member.unilevel_parent_ba_id || "—"}
                                </span>

                                <span className="font-bold text-[#1f9d6b]">
                                    {formatNumber(getFloatingCV(member))}
                                </span>

                                <span className="font-semibold text-[#344054]">
                                    {getDownlineCount(member)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Referral;