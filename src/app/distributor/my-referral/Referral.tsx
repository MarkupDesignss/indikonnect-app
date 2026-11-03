"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ChevronRight,
  CircleHelp,
  GitBranch,
  Inbox,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Users,
  UserRoundPlus,
  Wallet,
  X,
} from "lucide-react";
import { useGetDistributorGenealogyTreeQuery } from "@/lib/redux/api/distributor/distributorGenealogyApi";

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

const formatNumber = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "—";
};

const asNumber = (value: string | number | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

function PositionBadge({ side }: { side: number | null }) {
  const position = side === 1 ? "Left" : side === 2 ? "Right" : "Unassigned";
  const className =
    side === 1
      ? "border-[#CDEBDF] bg-[#EFF9F4] text-[#167853]"
      : side === 2
        ? "border-[#D7E3FA] bg-[#F0F5FE] text-[#315DA9]"
        : "border-[#E8EAEE] bg-[#F7F8FA] text-[#667085]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {side === 1 ? (
        <ArrowDownLeft size={13} />
      ) : side === 2 ? (
        <ArrowDownRight size={13} />
      ) : null}
      {position}
    </span>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof Users;
  tone: "blue" | "teal" | "purple" | "amber";
}) {
  const style = {
    blue: { icon: "bg-[#EFF5FF] text-[#3867B2]", bar: "bg-[#638BE8]" },
    teal: { icon: "bg-[#EAF8F3] text-[#218366]", bar: "bg-[#46AF93]" },
    purple: { icon: "bg-[#F3EFFE] text-[#7657BA]", bar: "bg-[#A08ADB]" },
    amber: { icon: "bg-[#FFF7E7] text-[#A27728]", bar: "bg-[#DDB467]" },
  }[tone];
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#E7EAF0] bg-white p-4 shadow-[0_3px_16px_rgba(20,35,65,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CFD7E5] hover:shadow-[0_12px_30px_rgba(20,35,65,0.065)] sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${style.bar}`} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold leading-5 text-[#687386] sm:text-[13px]">
          {label}
        </span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={19} strokeWidth={1.9} />
        </span>
      </div>
      <p className="mt-3 break-words text-[27px] font-bold leading-none tracking-[-0.045em] text-[#182235] sm:text-[30px]">
        {value}
      </p>
      <p className="mt-2 text-[10.5px] leading-4 text-[#98A1B1] sm:text-[11px]">
        {helper}
      </p>
    </div>
  );
}

export default function Referral() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorGenealogyTreeQuery();

  const payload = useMemo<GenealogyPayload | undefined>(() => {
    const apiResponse = response as any;
    const result = apiResponse?.data?.data ?? apiResponse?.data ?? apiResponse;
    return result && Array.isArray(result.rows)
      ? (result as GenealogyPayload)
      : undefined;
  }, [response]);

  const allRows = payload?.rows ?? [];
  const root = payload?.root;

  // Direct referrals are based on unilevel sponsorship, not binary placement.
  const directReferrals = useMemo(() => {
    if (!root) return [];
    return allRows.filter(
      (member) =>
        member.member_id !== root.member_id &&
        (member.unilevel_parent_id === root.member_id ||
          (member.unilevel_parent_id == null &&
            member.unilevel_parent_ba_id === root.ba_id)),
    );
  }, [allRows, root]);

  const downlineCounts = useMemo(() => {
    const byMemberId = new Map<number, number>();
    const byBaId = new Map<string, number>();
    for (const member of allRows) {
      if (
        member.unilevel_parent_id !== null &&
        member.unilevel_parent_id !== undefined
      ) {
        byMemberId.set(
          member.unilevel_parent_id,
          (byMemberId.get(member.unilevel_parent_id) ?? 0) + 1,
        );
      } else if (member.unilevel_parent_ba_id) {
        byBaId.set(
          member.unilevel_parent_ba_id,
          (byBaId.get(member.unilevel_parent_ba_id) ?? 0) + 1,
        );
      }
    }
    return { byMemberId, byBaId };
  }, [allRows]);

  const getDownlineCount = (member: GenealogyRow) =>
    (downlineCounts.byMemberId.get(member.member_id) ?? 0) +
    (downlineCounts.byBaId.get(member.ba_id) ?? 0);

  const filteredReferrals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return directReferrals;
    return directReferrals.filter(
      (member) =>
        String(member.ba_id ?? "")
          .toLowerCase()
          .includes(query) ||
        String(member.unilevel_parent_ba_id ?? "")
          .toLowerCase()
          .includes(query) ||
        String(member.member_id).includes(query),
    );
  }, [directReferrals, searchQuery]);

  const floatingLeft = payload?.cv_floating_left ?? root?.floating_cv_left;
  const floatingRight = payload?.cv_floating_right ?? root?.floating_cv_right;
  const floatingTotal =
    floatingLeft == null && floatingRight == null
      ? "—"
      : formatNumber(asNumber(floatingLeft) + asNumber(floatingRight));

  const stats = [
    {
      label: "Direct referrals",
      value: root ? formatNumber(directReferrals.length) : "—",
      helper: "Members personally sponsored",
      icon: UserRoundPlus,
      tone: "blue" as const,
    },
    {
      label: "Network members",
      value: payload
        ? formatNumber(
            allRows.filter((member) => member.member_id !== root?.member_id)
              .length,
          )
        : "—",
      helper: "Members in available genealogy",
      icon: Users,
      tone: "teal" as const,
    },
    {
      label: "Network depth",
      value: payload?.depth == null ? "—" : formatNumber(payload.depth),
      helper: "Levels in your network",
      icon: Network,
      tone: "purple" as const,
    },
    {
      label: "Floating CV",
      value: floatingTotal,
      helper: "Combined left and right volume",
      icon: Wallet,
      tone: "amber" as const,
    },
  ];

  const showLoading = isLoading && !payload;
  const showError = isError && !payload;
  const empty = !showLoading && !showError && filteredReferrals.length === 0;

  return (
    <section
      className="min-w-0 w-full text-[#182235]"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="relative isolate overflow-hidden rounded-[22px] border border-[#DCE6F4] bg-gradient-to-r from-[#F2F7FF] via-[#F9FAFF] to-[#F6FBFA] px-4 py-5 sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[25px] border-[#D8E7FF]/45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-110px] right-[22%] h-52 w-52 rounded-full bg-[#E0F1ED]/40 blur-3xl"
        />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE6F6] bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#5075A6]">
              <GitBranch size={12} /> Network overview
            </div>
            <h1 className="text-[24px] font-bold leading-tight tracking-[-0.045em] text-[#192A44] sm:text-[30px]">
              My referrals
            </h1>
            <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#738094] sm:text-[13px]">
              Explore your direct referral network, review placement details and
              track team volume from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#D6DFED] bg-white px-4 text-[12px] font-bold text-[#344866] shadow-[0_3px_10px_rgba(36,61,93,0.045)] transition-colors hover:border-[#AFC3DE] hover:bg-[#F9FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#638BE8]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            {isFetching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {isFetching ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-[#E5EAF0] bg-white shadow-[0_5px_24px_rgba(24,43,70,0.035)] sm:mt-6">
        <div className="flex flex-col gap-4 border-b border-[#EDF0F5] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#EDF4FF] text-[#4471B7]">
                <Users size={18} />
              </span>
              <h2 className="text-[16px] font-bold tracking-[-0.02em] text-[#1C2940] sm:text-[18px]">
                Direct referral directory
              </h2>
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-[#8B96A7] sm:ml-[46px] sm:text-[12px]">
              Your directly sponsored members and their current network details.
            </p>
          </div>
          <span className="inline-flex self-start rounded-full border border-[#E0E7F0] bg-[#F7F9FD] px-3 py-1.5 text-[11px] font-semibold text-[#596D88] sm:self-auto">
            {showLoading
              ? "Loading members"
              : `${filteredReferrals.length} of ${directReferrals.length} members`}
          </span>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#EDF0F5] bg-[#FCFDFE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="relative w-full min-w-0 sm:max-w-[420px]">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9DA8B7]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by BA ID, parent ID or member ID"
              aria-label="Search direct referrals"
              className="h-11 w-full rounded-xl border border-[#DFE5EE] bg-white pl-10 pr-10 text-[12px] font-medium text-[#243247] outline-none placeholder:text-[#A0AABA] focus:border-[#8DA9D6] focus:ring-4 focus:ring-[#7299D8]/10 sm:text-[13px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#8290A3] hover:bg-[#F1F4F8]"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8591A2]">
            <CircleHelp size={14} className="text-[#8EA2BC]" /> Referrals follow
            unilevel sponsorship
          </div>
        </div>

        {showLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-5 text-center">
            <Loader2 size={26} className="animate-spin text-[#5279B5]" />
            <p className="text-[13px] font-semibold text-[#66758B]">
              Loading your referral network...
            </p>
          </div>
        ) : showError ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1F0] text-[#C34B49]">
              <AlertCircle size={22} />
            </span>
            <h3 className="text-[15px] font-bold text-[#26364B]">
              Unable to load referrals
            </h3>
            <p className="max-w-sm text-[12px] leading-5 text-[#8893A3]">
              We couldn't retrieve your referral data. Please try again.
            </p>
            <button
              onClick={() => void refetch()}
              className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-[#263B57] px-4 text-[12px] font-semibold text-white hover:bg-[#17263B]"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : empty ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F5F9] text-[#94A2B3]">
              <Inbox size={23} />
            </span>
            <h3 className="text-[15px] font-bold text-[#26364B]">
              {searchQuery.trim()
                ? "No matching referrals"
                : "No direct referrals yet"}
            </h3>
            <p className="max-w-sm text-[12px] leading-5 text-[#8893A3]">
              {searchQuery.trim()
                ? "Try another BA ID or clear your search to see all members."
                : "New direct referrals will appear here when they join your network."}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-1 rounded-lg border border-[#DBE2ED] bg-white px-4 py-2 text-[12px] font-semibold text-[#3C5F8F] hover:bg-[#F7FAFF]"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile: full data in vertically stacked cards instead of a clipped table. */}
            <div className="divide-y divide-[#EDF0F5] md:hidden">
              {filteredReferrals.map((member) => (
                <article
                  key={member.member_id}
                  className="px-4 py-4 transition-colors hover:bg-[#FBFCFE]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF4FF] text-[#4774B7]">
                        <Users size={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="break-all text-[13px] font-bold text-[#253752]">
                          {member.ba_id || "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#96A0AE]">
                          Member ID: {member.member_id}
                        </p>
                      </div>
                    </div>
                    <PositionBadge side={member.binary_side} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-[#F7F9FC] p-3">
                      <p className="text-[10px] text-[#919BAA]">Level</p>
                      <p className="mt-1 text-[13px] font-bold text-[#29374B]">
                        {formatNumber(member.level)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F7F9FC] p-3">
                      <p className="text-[10px] text-[#919BAA]">
                        Direct downline
                      </p>
                      <p className="mt-1 text-[13px] font-bold text-[#29374B]">
                        {formatNumber(getDownlineCount(member))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F2FAF6] p-3">
                      <p className="text-[10px] text-[#6F9984]">Floating CV</p>
                      <p className="mt-1 text-[13px] font-bold text-[#1B8060]">
                        {formatNumber(
                          asNumber(member.floating_cv_left) +
                            asNumber(member.floating_cv_right),
                        )}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F7F9FC] p-3">
                      <p className="text-[10px] text-[#919BAA]">Parent BA ID</p>
                      <p className="mt-1 break-all text-[12px] font-semibold text-[#29374B]">
                        {member.unilevel_parent_ba_id || "—"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop: easy-to-scan table with complete existing columns. */}
            <div className="hidden w-full overflow-x-auto md:block">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E6EBF1] bg-[#F7F9FC] text-[10px] font-bold uppercase tracking-[0.08em] text-[#8391A4]">
                    <th scope="col" className="px-5 py-3.5">
                      BA ID / Member
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Level
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Position
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Parent BA ID
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Floating CV
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Downline
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFF2F6]">
                  {filteredReferrals.map((member) => (
                    <tr
                      key={member.member_id}
                      className="group transition-colors hover:bg-[#FAFCFF]"
                    >
                      <td className="px-5 py-4">
                        <p className="break-all text-[12px] font-bold text-[#263852]">
                          {member.ba_id || "—"}
                        </p>
                        <p className="mt-1 text-[10px] text-[#9AA5B3]">
                          Member #{member.member_id}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-[12px] font-semibold text-[#49576C]">
                        {formatNumber(member.level)}
                      </td>
                      <td className="px-4 py-4">
                        <PositionBadge side={member.binary_side} />
                      </td>
                      <td className="max-w-[210px] break-all px-4 py-4 text-[12px] font-medium text-[#6E7C90]">
                        {member.unilevel_parent_ba_id || "—"}
                      </td>
                      <td className="px-4 py-4 text-right text-[12px] font-bold tabular-nums text-[#1B8060]">
                        {formatNumber(
                          asNumber(member.floating_cv_left) +
                            asNumber(member.floating_cv_right),
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex min-w-8 justify-center rounded-lg bg-[#F1F5FA] px-2.5 py-1.5 text-[12px] font-bold tabular-nums text-[#405A7A]">
                          {formatNumber(getDownlineCount(member))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF0F5] bg-[#FCFDFE] px-4 py-3.5 text-[11px] text-[#8793A3] sm:px-6">
          <span>
            Showing {filteredReferrals.length} of {directReferrals.length}{" "}
            direct referrals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitBranch size={13} /> IndieKonnect network
          </span>
        </div>
      </div>
    </section>
  );
}
