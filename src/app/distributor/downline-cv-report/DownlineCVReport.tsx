"use client";

import {
  Search,
  Inbox,
  Users,
  GitBranch,
  Network,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useGetDistributorDownlineQuery,
} from "../../../lib/redux/api/distributor/distributorDownlineApi"

import type {
  DistributorDownlineMember,
} from "../../../lib/redux/api/distributor/distributorDownlineApi"

// --------------------------------------------------
// DESIGN TOKENS
// --------------------------------------------------

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";
const PURPLE = "#a855f7";

// Expand / collapse speed (slow & smooth)
const EXPAND_MS = 700;
const EXPAND_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// --------------------------------------------------
// FONT
// --------------------------------------------------

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
  `}</style>
);

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function toNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCV(
  value: number | string | null | undefined,
): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

function getBinarySide(side: number | null): string {
  if (side === 1) return "Left";
  if (side === 2) return "Right";

  return "Not assigned";
}

function getMemberLabel(member: DistributorDownlineMember): string {
  return member.level === 0 ? "Root level" : `Level ${member.level}`;
}

function getRowKey(member: DistributorDownlineMember): string {
  return `${member.member_id}-${member.ba_id}`;
}

// --------------------------------------------------
// FONT & LOADING STATE
// --------------------------------------------------

function DownlineLoader() {
  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="flex min-h-[350px] w-full flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white"
    >
      <Loader2 size={30} className="animate-spin text-[#3955A6]" />

      <p className="mt-3 text-[13px] font-semibold text-[#667085]">
        Loading downline report...
      </p>
    </div>
  );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[13px] border border-[#e7e9ee] bg-white p-4 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: background,
          color,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-1 break-words text-[18px] font-black text-[#101828]"
          style={{ color }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// CV VALUE BOX (used inside expanded row)
// --------------------------------------------------

function CVValue({
  label,
  value,
  color = NAVY,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#edf0f3] bg-white p-3">
      <p className="text-[10px] font-semibold leading-4 text-[#8a92a6] sm:text-[11px]">
        {label}
      </p>

      <p
        className="mt-1 break-words text-[15px] font-black sm:text-[17px]"
        style={{ color, overflowWrap: "anywhere" }}
      >
        {formatCV(value)}
      </p>
    </div>
  );
}

// --------------------------------------------------
// SIDE BADGE
// --------------------------------------------------

function SideBadge({ member }: { member: DistributorDownlineMember }) {
  const isRoot = member.level === 0;
  const side = member.binary_side;

  const color = isRoot
    ? INDIGO
    : side === 1
      ? EMERALD
      : side === 2
        ? BRASS
        : INDIGO;

  const background = isRoot
    ? "#eceffb"
    : side === 1
      ? "#eaf7f0"
      : side === 2
        ? "#f8f1e4"
        : "#f2f4f7";

  return (
    <span
      className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{ color, backgroundColor: background }}
    >
      {isRoot ? "ROOT" : getBinarySide(side)}
    </span>
  );
}

// --------------------------------------------------
// TABLE ROW (main row + animated expandable row)
// --------------------------------------------------

function DownlineTableRow({
  member,
  isOpen,
  onToggle,
}: {
  member: DistributorDownlineMember;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isRoot = member.level === 0;

  return (
    <>
      {/* ---------- Main row ---------- */}
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-t border-[#eef0f4] transition-colors duration-300 ${
          isOpen ? "bg-[#f6f8fe]" : "hover:bg-[#fafbfd]"
        }`}
      >
        {/* Member */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]"
              style={{
                backgroundColor: isRoot ? "#eceffb" : "#edf3ff",
                color: isRoot ? INDIGO : NAVY,
              }}
            >
              {isRoot ? <Network size={19} /> : <Users size={19} />}
            </div>

            <div className="min-w-0">
              <p className="whitespace-nowrap text-[13px] font-black text-[#101828]">
                {member.ba_id}
              </p>

            
            </div>
          </div>
        </td>

        {/* Level */}
        <td className="px-4 py-3.5">
          <span className="whitespace-nowrap rounded-[7px] bg-[#f2f4f7] px-2.5 py-1 text-[11px] font-bold text-[#344054]">
            {getMemberLabel(member)}
          </span>
        </td>

        {/* Side */}
        <td className="px-4 py-3.5">
          <SideBadge member={member} />
        </td>

        {/* Unilevel parent */}
        <td className="px-4 py-3.5">
          <p className="whitespace-nowrap text-[12px] font-bold text-[#344054]">
            {formatNullable(member.unilevel_parent_ba_id)}
          </p>
        </td>

        {/* Binary parent */}
        <td className="px-4 py-3.5">
          <p className="whitespace-nowrap text-[12px] font-bold text-[#344054]">
            {formatNullable(member.binary_parent_ba_id)}
          </p>
        </td>

        {/* Total left CV */}
        <td className="px-4 py-3.5 text-center">
          <p
            className="whitespace-nowrap text-[13px] font-black"
            style={{ color: BRASS }}
          >
            {formatCV(member.total_cv_left)}
          </p>
        </td>

        {/* Total right CV */}
        <td className="px-4 py-3.5 text-center">
          <p
            className="whitespace-nowrap text-[13px] font-black"
            style={{ color: BRASS }}
          >
            {formatCV(member.total_cv_right)}
          </p>
        </td>

        {/* Expand icon */}
        <td className="px-4 py-3.5 text-center">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse details" : "Expand details"}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-500"
            style={{
              borderColor: isOpen ? INDIGO : "#e5e9ef",
              backgroundColor: isOpen ? INDIGO : "#ffffff",
              color: isOpen ? "#ffffff" : "#344054",
            }}
          >
            <ChevronDown
              size={17}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: `transform ${EXPAND_MS}ms ${EXPAND_EASE}`,
              }}
            />
          </button>
        </td>
      </tr>

      {/* ---------- Expandable details row (slow animation) ---------- */}
      <tr>
        <td colSpan={8} className="p-0">
          <div
            style={{
              display: "grid",
              gridTemplateRows: isOpen ? "1fr" : "0fr",
              opacity: isOpen ? 1 : 0,
              transition: `grid-template-rows ${EXPAND_MS}ms ${EXPAND_EASE}, opacity ${EXPAND_MS}ms ${EXPAND_EASE}`,
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="border-t border-dashed border-[#dfe5f5] bg-[#f6f8fe] px-4 py-5 sm:px-6">
                {/* CV breakdown */}
                <div className="mb-2 flex items-center gap-2">
                  <GitBranch size={15} className="text-[#3955A6]" />

                  <h4 className="text-[12px] font-bold text-[#344054]">
                    CV breakdown
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <CVValue label="Left CV" value={member.cv_left} color={INDIGO} />
                  <CVValue label="Right CV" value={member.cv_right} color={INDIGO} />
                  <CVValue
                    label="Floating left CV"
                    value={member.floating_cv_left}
                    color={EMERALD}
                  />
                  <CVValue
                    label="Floating right CV"
                    value={member.floating_cv_right}
                    color={EMERALD}
                  />
                  <CVValue
                    label="Total left CV"
                    value={member.total_cv_left}
                    color={BRASS}
                  />
                  <CVValue
                    label="Total right CV"
                    value={member.total_cv_right}
                    color={BRASS}
                  />
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function EmptyState({
  searched,
}: {
  searched: boolean;
}) {
  return (
    <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[14px] bg-[#f7f8fa] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Inbox className="h-6 w-6 text-[#98a2b3]" />
      </div>

      <div className="text-center">
        <p className="text-[14px] font-semibold text-[#344054]">
          {searched
            ? "No matching members found"
            : "No downline data available"}
        </p>

        <p className="mt-1 text-[12px] text-[#8a92a6]">
          {searched
            ? "Try another member ID or distributor ID."
            : "The API did not return any members for this report."}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// ERROR STATE
// --------------------------------------------------

function ErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[14px] bg-[#f7f8fa] p-6 text-center">
      <AlertCircle size={34} className="text-[#c0392b]" />

      <p className="mt-3 text-[15px] font-bold text-[#101828]">
        Unable to load downline data
      </p>

      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        The distributor genealogy API returned an error. Please try
        again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 flex h-10 items-center gap-2 rounded-[9px] px-4 text-[12px] font-semibold text-white"
        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

const TABLE_HEADERS: { label: string; align: "left" | "right" | "center" }[] = [
  { label: "Member", align: "left" },
  { label: "Level", align: "left" },
  { label: "Side", align: "left" },
  { label: "Unilevel parent", align: "left" },
  { label: "Binary parent", align: "left" },
  { label: "Total left CV", align: "right" },
  { label: "Total right CV", align: "right" },
  { label: "Details", align: "center" },
];

const DownlineCVReport = () => {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorDownlineQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Local member search
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Expanded rows
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const members = response?.data ?? [];

  // --------------------------------------------------
  // Search by member ID, BA ID, parent IDs or level
  // --------------------------------------------------

  const filteredMembers = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const searchableValues = [
        member.member_id,
        member.ba_id,
        member.unilevel_parent_id,
        member.unilevel_parent_ba_id,
        member.binary_parent_id,
        member.binary_parent_ba_id,
        member.level,
        getBinarySide(member.binary_side),
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [members, appliedSearch]);

  // --------------------------------------------------
  // Expand helpers
  // --------------------------------------------------

  const toggleRow = (key: string) => {
    setOpenRows((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const allOpen =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => openRows.has(getRowKey(member)));

  const toggleAll = () => {
    setOpenRows(
      allOpen
        ? new Set()
        : new Set(filteredMembers.map((member) => getRowKey(member))),
    );
  };

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const rootMember = useMemo(
    () =>
      members.find((member) => member.level === 0) ??
      members[0] ??
      null,
    [members],
  );

  const downlineCount = members.filter(
    (member) => member.level > 0,
  ).length;

  const totalLevels = new Set(
    members.map((member) => member.level),
  ).size;

  const maximumLevel = members.length
    ? Math.max(...members.map((member) => member.level))
    : 0;

  const totalMembers = response?.total ?? members.length;

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return <DownlineLoader />;
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (isError || response?.success === false) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="min-w-0 rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6 lg:p-8"
    >
      <FontImport />

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[16px] font-black tracking-[-0.01em] text-[#101828] sm:text-[18px]">
            Downline CV report
          </h1>

          <p className=" text-[12px] leading-5 text-[#667085] sm:text-[13.5px]">
            View your downline members, genealogy structure and CV
            breakdown.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-[#e5e9ef] bg-white px-4 text-[12px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""}
          />

          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total records"
          value={formatCV(totalMembers)}
          icon={<Users size={21} />}
          color={INDIGO}
          background="#eceffb"
        />

        <StatCard
          label="Downline members"
          value={formatCV(downlineCount)}
          icon={<GitBranch size={21} />}
          color={EMERALD}
          background="#eaf7f0"
        />

        <StatCard
          label="Levels covered"
          value={formatCV(totalLevels)}
          icon={<Network size={21} />}
          color={PURPLE}
          background="#f3e8ff"
        />

        <StatCard
          label="Maximum depth"
          value={formatCV(maximumLevel)}
          icon={<GitBranch size={21} />}
          color={BRASS}
          background="#f8f1e4"
        />
      </div>

    

      {/* ================= SEARCH ================= */}
      <div className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-[#101828]">
              Downline members
            </h2>

            <p className="text-[10px] text-[#667085]">
              Search by member ID, Binary parent ID or Unilevel parent ID.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[#667085]">
              Showing {filteredMembers.length} of {members.length}
            </span>

            {filteredMembers.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]"
              >
                {allOpen ? (
                  <ChevronsDownUp size={14} />
                ) : (
                  <ChevronsUpDown size={14} />
                )}

                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>
        </div>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(searchValue);
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              placeholder="Search member ID, distributor ID or parent..."
              className="h-[44px] w-full rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-colors placeholder:text-[#98a2b3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            />
          </div>

          <button
            type="submit"
            className="h-[44px] rounded-[10px] px-7 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: NAVY }}
          >
            Search
          </button>

          {appliedSearch && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setAppliedSearch("");
              }}
              className="h-[44px] rounded-[10px] border border-[#e5e9ef] bg-white px-4 text-[12px] font-semibold text-[#344054] hover:bg-[#f7f8fa]"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ================= MEMBER TABLE ================= */}

      {filteredMembers.length > 0 ? (
        <div className="mt-5 min-w-0 overflow-hidden rounded-[14px] border border-[#e7e9ee]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f7f8fa]">
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header.label}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#667085]"
                      style={{ textAlign: header.align }}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => {
                  const key = getRowKey(member);

                  return (
                    <DownlineTableRow
                      key={key}
                      member={member}
                      isOpen={openRows.has(key)}
                      onToggle={() => toggleRow(key)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState searched={Boolean(appliedSearch)} />
      )}

      {/* ================= FOOTER ================= */}

      {members.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e9ee] pt-4">
          <p className="text-[11px] text-[#8a92a6]">
            Data loaded from distributor genealogy downline API.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#3955A6] hover:underline disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin" : ""}
            />

            Update report
          </button>
        </div>
      )}
    </div>
  );
};

export default DownlineCVReport;