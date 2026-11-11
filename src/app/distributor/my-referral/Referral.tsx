"use client";

import { useMemo, useState } from "react";
import { useGetDistributorMyReferralsQuery } from "@/lib/redux/api/distributor/distributorGenealogyApi";
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
  Copy,
  Check,
  X,
  ChevronDown,
  SlidersHorizontal,
  UserRound,
  Info,
} from "lucide-react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const formatNumber = (value: string | number | null | undefined) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "0";
};

const getFloatingCV = (member: {
  floating_cv_left: string;
  floating_cv_right: string;
}) =>
  Number(member.floating_cv_left || 0) + Number(member.floating_cv_right || 0);

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const cardStyle =
  "rounded-[20px] border border-[#E5EAF2] bg-white shadow-[0_5px_25px_rgba(15,33,69,0.035)]";
const smallButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE3ED] bg-white px-3.5 text-[12px] font-bold text-[#344563] transition hover:border-[#A8B8CF] hover:bg-[#F4F7FB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#315B9E]/15 disabled:cursor-not-allowed disabled:opacity-50";

function PositionPill({ side }: { side: number | null }) {
  const left = side === 1;
  const right = side === 2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${left ? "bg-[#E9F7F0] text-[#13734B]" : right ? "bg-[#ECF0FC] text-[#3859A5]" : "bg-[#F2F4F7] text-[#667085]"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${left ? "bg-[#20A16B]" : right ? "bg-[#4B6CC1]" : "bg-[#98A2B3]"}`}
      />
      {left ? "Left leg" : right ? "Right leg" : "Unassigned"}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permissions may be unavailable in some browsers.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      title="Copy BA ID"
      aria-label={`Copy ${value || "BA ID"}`}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#E8EEF7] hover:text-[#244B83] focus-visible:ring-2 focus-visible:ring-[#315B9E]"
    >
      {copied ? (
        <Check size={15} className="text-[#14845B]" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );
}

// --------------------------------------------------
// Component
// --------------------------------------------------
const Referral = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<"all" | "1" | "2">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // --------------------------------------------------
  // My Referrals API
  // --------------------------------------------------
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorMyReferralsQuery();

  // API response:
  // {
  //   success: true,
  //   data: [...referrals],
  //   total: 2
  // }
  const referrals = response?.data ?? [];
  const totalReferrals = response?.total ?? referrals.length;

  // --------------------------------------------------
  // Search / Filter
  // --------------------------------------------------
  const filteredReferrals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return referrals
      .filter((member) => {
        const matchesText =
          !query ||
          (member.ba_id ?? "").toLowerCase().includes(query) ||
          (member.name ?? "").toLowerCase().includes(query) ||
          String(member.member_id).includes(query) ||
          (member.binary_parent_ba_id ?? "").toLowerCase().includes(query);
        return (
          matchesText &&
          (sideFilter === "all" || String(member.binary_side) === sideFilter)
        );
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === "name")
          return String(a.name ?? "").localeCompare(String(b.name ?? ""));
        const aTime = a.joined_at ? new Date(a.joined_at).getTime() || 0 : 0;
        const bTime = b.joined_at ? new Date(b.joined_at).getTime() || 0 : 0;
        return sortBy === "newest" ? bTime - aTime : aTime - bTime;
      });
  }, [referrals, searchQuery, sideFilter, sortBy]);

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------
  const leftPositionCount = referrals.filter(
    (member) => member.binary_side === 1,
  ).length;
  const rightPositionCount = referrals.filter(
    (member) => member.binary_side === 2,
  ).length;
  const totalFloatingCV = referrals.reduce(
    (total, member) => total + getFloatingCV(member),
    0,
  );
  const stats = [
    {
      label: "Direct Referrals",
      value: formatNumber(totalReferrals),
      color: NAVY,
      bg: "#EFF3FA",
      icon: Users,
      helper: "Members referred by you",
    },
    {
      label: "Left Position",
      value: formatNumber(leftPositionCount),
      color: EMERALD,
      bg: "#EAF8F1",
      icon: UserPlus,
      helper: "Placed on left leg",
    },
    {
      label: "Right Position",
      value: formatNumber(rightPositionCount),
      color: INDIGO,
      bg: "#EDF1FD",
      icon: Network,
      helper: "Placed on right leg",
    },
    {
      label: "Floating CV",
      value: formatNumber(totalFloatingCV),
      color: BRASS,
      bg: "#FBF4E8",
      icon: Wallet,
      helper: "Across listed referrals",
    },
  ];

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const hasFilters = !!searchQuery.trim() || sideFilter !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setSideFilter("all");
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div
      className="min-w-0 space-y-5 pb-6"
      style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;900&display=swap');
      .referral-scrollbar::-webkit-scrollbar{height:7px}.referral-scrollbar::-webkit-scrollbar-track{background:#f5f7fa;border-radius:10px}.referral-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}`}</style>

      {/* Header */}
      <header className="relative isolate overflow-hidden rounded-[24px] bg-gradient-to-br from-[#102951] via-[#132F60] to-[#204E83] px-5 py-6 text-white shadow-[0_14px_38px_rgba(20,52,99,0.15)] sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[35px] border-white/[0.045]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-130px] right-[27%] h-60 w-60 rounded-full bg-[#81AEFF]/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Users size={23} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B6CCF2]">
                Your network
              </p>
              <h1 className="mt-1 text-[24px] font-black tracking-[-0.04em] sm:text-[29px]">
                My Referrals
              </h1>
              <p className="mt-2 max-w-xl text-[12px] leading-6 text-[#D8E4F7] sm:text-[13px]">
                Find the people you referred, check where they are placed, and
                review their network details in one place.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/25 bg-white/10 px-4 text-[12px] font-bold text-white transition hover:bg-white/20 disabled:opacity-50 sm:self-center"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />{" "}
            Refresh data
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, color, bg, icon: Icon, helper }) => (
          <div key={label} className={`${cardStyle} min-w-0 p-3.5 sm:p-5`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#697991] sm:text-[12px]">
                  {label}
                </p>
                <p className="mt-2 break-all text-[23px] font-black leading-none tracking-[-0.045em] text-[#15233B] sm:text-[29px]">
                  {isLoading ? "···" : value}
                </p>
              </div>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                style={{ color, backgroundColor: bg }}
              >
                <Icon size={19} />
              </span>
            </div>
            <p className="mt-3 text-[10px] leading-4 text-[#8995A8] sm:text-[11px]">
              {helper}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <section className={`${cardStyle} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-black tracking-tight text-[#192B46]">
              Find a referral
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-[#75839A]">
              Search by member name, BA ID, member ID or parent BA ID.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={smallButton}
          >
            <SlidersHorizontal size={15} /> More filters{" "}
            <ChevronDown
              size={14}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#788AA4]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, BA ID or parent BA ID..."
              aria-label="Search referrals"
              className="h-12 w-full rounded-xl border border-[#DAE2ED] bg-[#FAFCFF] pl-11 pr-11 text-[13px] font-medium text-[#1C2C45] outline-none transition focus:border-[#4A73B5] focus:bg-white focus:ring-4 focus:ring-[#4A73B5]/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#7C8BA1] hover:bg-[#E8EFF8]"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by binary position"
          >
            {(
              [
                ["all", "All members"],
                ["1", "Left leg"],
                ["2", "Right leg"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setSideFilter(value)}
                aria-pressed={sideFilter === value}
                className={`min-h-11 rounded-xl px-3.5 text-[12px] font-bold transition focus-visible:ring-4 focus-visible:ring-[#315B9E]/20 ${sideFilter === value ? "bg-[#183763] text-white shadow-[0_5px_12px_rgba(24,55,99,0.17)]" : "border border-[#E0E6EF] bg-white text-[#61718A] hover:bg-[#F5F8FC]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#E7ECF4] bg-[#F8FAFE] p-3.5">
            <label className="min-w-[180px] text-[11px] font-bold text-[#61718A]">
              Sort referrals
              <span className="relative mt-1.5 block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#DCE3ED] bg-white px-3 pr-9 text-[12px] font-semibold text-[#1C2C45] outline-none focus:ring-2 focus:ring-[#4A73B5]/20"
                >
                  <option value="newest">Newest joined first</option>
                  <option value="oldest">Oldest joined first</option>
                  <option value="name">Name A to Z</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-3 text-[#73839B]"
                />
              </span>
            </label>
            <p className="flex max-w-sm items-start gap-2 text-[11px] leading-5 text-[#7F8DA2]">
              <Info size={15} className="mt-0.5 shrink-0" /> Filters search the
              referrals returned by your account API.
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF0F6] pt-4">
          <p role="status" className="text-[12px] text-[#6F7F96]">
            Showing{" "}
            <strong className="text-[#183763]">
              {isLoading ? "…" : filteredReferrals.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#183763]">
              {isLoading ? "…" : totalReferrals}
            </strong>{" "}
            direct referrals
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#325C98] hover:underline"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Referral List */}
      <section className={`${cardStyle} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBEFF5] px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-[16px] font-black text-[#192B46]">
              Referral directory
            </h2>
            <p className="mt-1 text-[11px] text-[#8592A5]">
              Member information and binary placement
            </p>
          </div>
          <span className="rounded-full bg-[#F0F4FA] px-3 py-1.5 text-[11px] font-bold text-[#45628B]">
            {filteredReferrals.length} members
          </span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-6">
            <Loader2 size={28} className="animate-spin text-[#375E99]" />
            <p className="text-[13px] text-[#78879B]">
              Loading your referrals...
            </p>
          </div>
        ) : /* Error */
        isError ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="rounded-2xl bg-[#FFF1EE] p-3 text-[#C1493D]">
              <AlertCircle size={25} />
            </span>
            <h3 className="font-bold text-[#263550]">
              Unable to load referrals
            </h3>
            <p className="text-[12px] text-[#7B889C]">
              Please check your connection and try again.
            </p>
            <button onClick={() => void refetch()} className={smallButton}>
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : /* Empty / No Results */
        filteredReferrals.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="rounded-2xl bg-[#F0F4FA] p-4 text-[#6C82A3]">
              <Inbox size={29} />
            </span>
            <h3 className="text-[16px] font-bold text-[#263550]">
              {hasFilters ? "No matching referrals" : "No referrals yet"}
            </h3>
            <p className="max-w-sm text-[12px] leading-5 text-[#7B889C]">
              {hasFilters
                ? "Try another name, BA ID or leg filter."
                : "Your direct referrals will appear here when they become available."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className={smallButton}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Referral Cards */}
            <div className="grid gap-3 bg-[#F8FAFE] p-3 md:hidden">
              {filteredReferrals.map((member) => (
                <article
                  key={member.member_id}
                  className="min-w-0 rounded-2xl border border-[#E2E8F1] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F9] text-[#375B8B]">
                      <UserRound size={21} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[14px] font-black text-[#172A47]">
                        {member.name || "Member"}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="break-all text-[11px] font-bold text-[#4566A2]">
                          {member.ba_id || "—"}
                        </span>
                        <CopyButton value={member.ba_id || ""} />
                      </div>
                    </div>
                    <PositionPill side={member.binary_side} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#F7F9FD] p-3">
                    <div>
                      <p className="text-[10px] text-[#8793A7]">Floating CV</p>
                      <p className="mt-1 text-[17px] font-black text-[#1E8860]">
                        {formatNumber(getFloatingCV(member))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8793A7]">Level</p>
                      <p className="mt-1 text-[17px] font-black text-[#203657]">
                        {member.level ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-[11px]">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#8693A6]">Parent BA ID</span>
                      <span className="break-all text-right font-semibold text-[#3E4F69]">
                        {member.binary_parent_ba_id || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#8693A6]">Joined</span>
                      <span className="font-semibold text-[#3E4F69]">
                        {formatDate(member.joined_at)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {/* Desktop Referral Rows */}
            <div className="referral-scrollbar hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] border-collapse text-left">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#F7F9FD] text-[10px] font-black uppercase tracking-[0.08em] text-[#75839B]">
           
                    <th className="px-4 py-4">BA ID</th>
                    <th className="px-4 py-4">Position</th>
                    <th className="px-4 py-4">Level</th>
                    <th className="px-4 py-4">Parent BA ID</th>
                    <th className="px-4 py-4">Floating CV</th>
                    <th className="px-4 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Referral Rows */}
                  {filteredReferrals.map((member) => (
                    <tr
                      key={member.member_id}
                      className="border-t border-[#EDF0F5] text-[12px] transition hover:bg-[#FAFCFF]"
                    >
                      {/* Name */}
                  
                      {/* BA ID */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-0.5">
                          <span className="max-w-[160px] break-all font-bold text-[#375B98]">
                            {member.ba_id || "—"}
                          </span>
                          <CopyButton value={member.ba_id || ""} />
                        </div>
                      </td>
                      {/* Position */}
                      <td className="px-4 py-4">
                        <PositionPill side={member.binary_side} />
                      </td>
                      {/* Level */}
                      <td className="px-4 py-4 font-bold text-[#384B69]">
                        {member.level ?? "—"}
                      </td>
                      {/* Parent BA ID */}
                      <td className="max-w-[170px] break-all px-4 py-4 font-medium text-[#63738C]">
                        {member.binary_parent_ba_id || "—"}
                      </td>
                      {/* Floating CV */}
                      <td className="px-4 py-4 text-[13px] font-black tabular-nums text-[#19825B]">
                        {formatNumber(getFloatingCV(member))}
                      </td>
                      {/* Joined At */}
                      <td className="whitespace-nowrap px-4 py-4 text-[#63738C]">
                        {formatDate(member.joined_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      {isFetching && !isLoading && (
        <p
          role="status"
          className="flex items-center justify-end gap-2 text-[11px] text-[#7E8BA1]"
        >
          <Loader2 size={13} className="animate-spin" /> Updating referral
          data...
        </p>
      )}
    </div>
  );
};

export default Referral;
