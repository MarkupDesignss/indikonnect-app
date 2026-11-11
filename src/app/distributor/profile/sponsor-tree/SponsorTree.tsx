"use client";

import {
  Maximize2,
  Minimize2,
  Scan,
  Users,
  UserRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Search,
  X,
  RefreshCw,
  Network,
  ChevronDown,
  Copy,
  Check,
  Info,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from "react";
import { useGetDistributorDownlineQuery } from "@/lib/redux/api/distributor/distributorDownlineApi";

/* =========================================================
 *   FONT
 * ========================================================= */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700;800;900&display=swap');
    .sponsor-tree-ui, .sponsor-tree-ui * { box-sizing: border-box; }
    .sponsor-tree-ui { font-family: 'Lato', sans-serif; }
    .sponsor-tree-ui button { -webkit-tap-highlight-color: transparent; }
    @media (prefers-reduced-motion: reduce) {
      .sponsor-tree-ui *, .sponsor-tree-ui *::before, .sponsor-tree-ui *::after {
        animation-duration: .01ms !important; transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `}</style>
);

/* =========================================================
 *   TYPES
 * ========================================================= */
type ToolbarButtonProps = {
  icon: ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

type DownlineMember = {
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
};

type LegFilter = "all" | "left" | "right";

/* =========================================================
 *   HELPERS
 * ========================================================= */
const formatNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return "0";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    number,
  );
};
const numeric = (value?: string | number | null) => {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
};
const SIDE_NAME = (side: number | null) =>
  side === 1 ? "Left leg" : side === 2 ? "Right leg" : "Not assigned";

/* =========================================================
 *   TOOLBAR BUTTON
 * ========================================================= */
const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-pressed={active}
    className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border px-3.5 text-[12px] font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-45 ${active ? "border-[#223B72] bg-[#223B72] text-white" : "border-[#E3E8F1] bg-white text-[#475569] hover:border-[#C5D2E6] hover:bg-[#F4F7FC] hover:text-[#17335C]"}`}
  >
    <Icon size={15} className="shrink-0" />
    <span>{label}</span>
  </button>
);

/* =========================================================
 *   LOADING SKELETON
 * ========================================================= */
const TreeSkeleton = () => (
  <div
    className="flex flex-col items-center animate-pulse"
    aria-label="Loading sponsor members"
    aria-busy="true"
  >
    <div className="h-[175px] w-full max-w-[350px] rounded-[22px] bg-slate-100" />
    <div className="h-10 w-[2px] bg-slate-200" />
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-[275px] rounded-[20px] bg-slate-100" />
      ))}
    </div>
  </div>
);

function CVMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string | number | null;
  tone?: "slate" | "green" | "blue";
}) {
  const tones = {
    slate: "border-[#E8EDF4] bg-[#F8FAFD] text-[#172B4D]",
    green: "border-[#D8EFE3] bg-[#F0FAF5] text-[#15734C]",
    blue: "border-[#DAE6FB] bg-[#F2F6FE] text-[#2957A6]",
  };
  return (
    <div className={`min-w-0 rounded-xl border px-3 py-3 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold leading-4 opacity-75">{label}</p>
      <p className="mt-1.5 break-all text-[17px] font-black leading-tight tabular-nums sm:text-[19px]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* =========================================================
 *   MEMBER CARD
 * ========================================================= */
const MemberCard = ({ member }: { member: DownlineMember }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLeft = member.binary_side === 1;
  const isRight = member.binary_side === 2;
  const accent = isLeft ? "#159C6A" : isRight ? "#4268C9" : "#B8935A";

  const copyMemberId = async () => {
    try {
      await navigator.clipboard.writeText(member.ba_id || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="group relative min-w-0 pt-7">
      {/* Connection Line */}
      <div className="absolute left-1/2 top-0 h-7 w-[2px] -translate-x-1/2 bg-[#C9D6EA]" />
      <div className="h-full overflow-hidden rounded-[22px] border border-[#E3E9F2] bg-white shadow-[0_8px_28px_rgba(17,37,73,.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C3D2E8] hover:shadow-[0_14px_35px_rgba(17,37,73,.10)]">
        <div className="h-1" style={{ backgroundColor: accent }} />
        <div className="p-4 sm:p-5">
          {/* Member Header */}
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px]"
              style={{ color: accent, backgroundColor: `${accent}12` }}
            >
              <UserRound size={23} strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#8B97AA]">
                Member BA ID
              </p>
              <div className="mt-1 flex min-w-0 items-center gap-1">
                <h3 className="min-w-0 break-all text-[15px] font-black tracking-[-.02em] text-[#152844] sm:text-[16px]">
                  {member.ba_id || "Not available"}
                </h3>
                {!!member.ba_id && (
                  <button
                    type="button"
                    onClick={copyMemberId}
                    title="Copy member BA ID"
                    aria-label={`Copy BA ID ${member.ba_id}`}
                    className="shrink-0 rounded-lg p-1.5 text-[#8796AD] hover:bg-[#EFF3FA] hover:text-[#284B82]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#8692A6]">
                Member #{member.member_id}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#E4EAF3] bg-[#F6F8FC] px-2.5 py-1 text-[10px] font-bold text-[#586982]">
              Level {member.level}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold"
              style={{ color: accent, backgroundColor: `${accent}12` }}
            >
              <GitBranch size={13} />
              {SIDE_NAME(member.binary_side)}
            </span>
            {member.unilevel_parent_ba_id && (
              <span
                className="max-w-full truncate rounded-full bg-[#F4F6FA] px-2.5 py-1.5 text-[11px] font-semibold text-[#65758E]"
                title={`Sponsor ID: ${member.unilevel_parent_ba_id}`}
              >
                Sponsor: {member.unilevel_parent_ba_id}
              </span>
            )}
          </div>

          {/* CV Details */}
          <div className="mt-5">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[.09em] text-[#7D8A9F]">
              CV overview
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <CVMetric label="Left CV" value={member.cv_left} tone="green" />
              <CVMetric label="Right CV" value={member.cv_right} tone="blue" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            className="mt-4 flex min-h-[43px] w-full items-center justify-between rounded-xl border border-[#DDE6F4] bg-[#F7F9FE] px-3.5 text-[12px] font-bold text-[#2C4D80] transition-colors hover:bg-[#EBF2FD] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <span>
              {detailsOpen
                ? "Hide CV & placement details"
                : "View CV & placement details"}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {detailsOpen && (
            <div className="mt-4 space-y-4 border-t border-[#E8EDF5] pt-4">
              {/* Sponsor Info */}
              <div className="grid gap-2 rounded-xl bg-[#F7F9FC] p-3 text-[12px]">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#8190A5]">Sponsor ID</span>
                  <span className="break-all font-bold text-[#263B58]">
                    {member.unilevel_parent_ba_id || "Not available"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#8190A5]">Binary parent BA ID</span>
                  <span className="break-all font-bold text-[#263B58]">
                    {member.binary_parent_ba_id || "Not available"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[#8190A5]">Binary position</span>
                  <span className="font-bold text-[#263B58]">
                    {SIDE_NAME(member.binary_side)}
                  </span>
                </div>
              </div>
              {/* Floating CV */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8290A5]">
                  Floating CV
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <CVMetric
                    label="Floating Left"
                    value={member.floating_cv_left}
                  />
                  <CVMetric
                    label="Floating Right"
                    value={member.floating_cv_right}
                  />
                </div>
              </div>
              {/* Total CV */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8290A5]">
                  Total CV
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <CVMetric
                    label="Total Left"
                    value={member.total_cv_left}
                    tone="green"
                  />
                  <CVMetric
                    label="Total Right"
                    value={member.total_cv_right}
                    tone="blue"
                  />
                </div>
              </div>
              {/* Binary Side */}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/* =========================================================
 *   MAIN COMPONENT
 * ========================================================= */
const SponsorTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [legFilter, setLegFilter] = useState<LegFilter>("all");
  const treeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* =======================================================
   *     API CALL - DEPTH 1
   * ======================================================= */
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDistributorDownlineQuery(1);
  const members = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []) as DownlineMember[],
    [data],
  );

  // Search ONLY sponsor IDs present in the loaded direct-downline API response (depth 1).
  // This is not a backend/global sponsor-ID lookup.
  const normalizedSponsorSearch = sponsorSearch.trim().toLowerCase();
  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const matchesSearch =
          !normalizedSponsorSearch ||
          String(member.unilevel_parent_ba_id ?? "")
            .toLowerCase()
            .includes(normalizedSponsorSearch);
        const matchesLeg =
          legFilter === "all" ||
          (legFilter === "left"
            ? member.binary_side === 1
            : member.binary_side === 2);
        return matchesSearch && matchesLeg;
      }),
    [members, normalizedSponsorSearch, legFilter],
  );

  const leftCount = useMemo(
    () => members.filter((member) => member.binary_side === 1).length,
    [members],
  );
  const rightCount = useMemo(
    () => members.filter((member) => member.binary_side === 2).length,
    [members],
  );
  const hasFilters = normalizedSponsorSearch.length > 0 || legFilter !== "all";
  const handleSponsorSearchChange = (value: string) => {
    setSponsorSearch(value);
    if (value.trim()) setIsExpanded(true);
  };

  /* =======================================================
   *     FIT TO VIEW
   * ======================================================= */
  const handleFitToView = useCallback(() => {
    setIsExpanded(true);
    // Scroll to the downline section without shrinking the member cards.
    requestAnimationFrame(() =>
      treeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);

  const resetFilters = () => {
    setSponsorSearch("");
    setLegFilter("all");
  };

  return (
    <div className="sponsor-tree-ui min-w-0 overflow-hidden rounded-[24px] border border-[#E3EAF5] bg-[#F8FAFD] shadow-[0_10px_35px_rgba(18,38,71,.035)]">
      <FontImport />
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0E1B3D] via-[#172D57] to-[#284B81] px-5 py-6 text-white sm:px-7 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 -bottom-24 h-56 w-56 rounded-full bg-[#6388C6]/10 blur-2xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border border-white/20 bg-white/10">
              <Network size={24} />
            </div>
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#B9D0F6]">
                <Sparkles size={12} /> My Network
              </p>
              <h1 className="text-[24px] font-black tracking-[-.035em] sm:text-[29px]">
                Sponsor Tree
              </h1>
              <p className="mt-1.5 max-w-xl text-[12px] leading-5 text-[#D1DDF0] sm:text-[13px]">
                Explore your directly sponsored members, check their CV, and
                find the right account quickly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-[12px] font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />{" "}
            Refresh data
          </button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[15px] border border-white/15 bg-white/10 p-3.5">
            <p className="text-[11px] text-[#D1DDF0]">Direct members</p>
            <p className="mt-1 text-[25px] font-black tabular-nums">
              {isLoading ? "…" : members.length}
            </p>
          </div>
          <div className="rounded-[15px] border border-white/15 bg-white/10 p-3.5">
            <p className="text-[11px] text-[#D1DDF0]">Left leg members</p>
            <p className="mt-1 text-[25px] font-black tabular-nums">
              {isLoading ? "…" : leftCount}
            </p>
          </div>
          <div className="rounded-[15px] border border-white/15 bg-white/10 p-3.5">
            <p className="text-[11px] text-[#D1DDF0]">Right leg members</p>
            <p className="mt-1 text-[25px] font-black tabular-nums">
              {isLoading ? "…" : rightCount}
            </p>
          </div>
          <div className="rounded-[15px] border border-white/15 bg-white/10 p-3.5">
            <p className="text-[11px] text-[#D1DDF0]">Other positions</p>
            <p className="mt-1 text-[25px] font-black tabular-nums">
              {isLoading ? "…" : members.length - leftCount - rightCount}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* ================= SPONSOR ID SEARCH ================= */}
        <section
          className="rounded-[20px] border border-[#E3EAF4] bg-white p-4 shadow-[0_4px_15px_rgba(16,39,78,.025)] sm:p-5"
          aria-label="Find a sponsor or filter the network"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#172A49]">
                <Search size={18} className="text-[#3D69B0]" /> Find members
              </h2>
              <p className="mt-1 text-[12px] text-[#71829A]">
                Search Sponsor ID and filter by binary position.
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-[#315EA1] hover:bg-[#EEF4FC]"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
          <label
            htmlFor="sponsor-tree-search"
            className="mb-2 block text-[12px] font-bold text-[#344761]"
          >
            Search by Sponsor ID
          </label>
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#91A0B4]"
            />
            <input
              ref={searchRef}
              id="sponsor-tree-search"
              type="search"
              value={sponsorSearch}
              onChange={(event) =>
                handleSponsorSearchChange(event.target.value)
              }
              placeholder="Type Sponsor BA ID, e.g. AIA1675197-001"
              autoComplete="off"
              className="h-[48px] w-full rounded-[13px] border border-[#DCE5F1] bg-[#FCFDFF] pl-11 pr-10 text-[13px] font-semibold text-[#193150] outline-none transition focus:border-[#527EC1] focus:ring-4 focus:ring-[#527EC1]/10"
            />
            {sponsorSearch && (
              <button
                type="button"
                onClick={() => {
                  setSponsorSearch("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear sponsor ID search"
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#74869F] hover:bg-[#EDF2FA]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter members by leg"
          >
            <span className="mr-1 text-[11px] font-bold text-[#75849B]">
              Show:
            </span>
            {(
              [
                ["all", `All members (${members.length})`],
                ["left", `Left leg (${leftCount})`],
                ["right", `Right leg (${rightCount})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLegFilter(value);
                  setIsExpanded(true);
                }}
                aria-pressed={legFilter === value}
                className={`min-h-[36px] rounded-full border px-3.5 text-[11px] font-bold transition-colors ${legFilter === value ? "border-[#244C86] bg-[#244C86] text-white" : "border-[#DFE7F2] bg-white text-[#61718A] hover:bg-[#F4F7FC]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F4F7FC] p-3 text-[11px] leading-5 text-[#71829A]">
            <Info size={15} className="mt-0.5 shrink-0 text-[#6483B2]" />
            <p>
              Search matches Sponsor IDs within the loaded direct-downline data
              (depth 1). It does not search all network levels.
            </p>
          </div>
        </section>

        {/* ================= TREE STRUCTURE ================= */}
        <section
          ref={treeRef}
          className="mt-5 scroll-mt-5 rounded-[20px] border border-[#E3EAF4] bg-white p-4 sm:p-6"
          aria-label="Sponsor tree structure"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDF1F7] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-[16px] font-black text-[#172A49]">
                <GitBranch size={18} className="text-[#3B69AE]" /> Direct
                downline structure
              </h2>
              <p className="mt-1 text-[12px] text-[#77859A]">
                Your account is the starting point. Member cards appear below.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToolbarButton
                icon={Maximize2}
                label="Expand"
                onClick={() => setIsExpanded(true)}
                active={isExpanded}
              />
              <ToolbarButton
                icon={Minimize2}
                label="Collapse"
                onClick={() => setIsExpanded(false)}
                active={!isExpanded}
              />
              <ToolbarButton
                icon={Scan}
                label="Focus view"
                onClick={handleFitToView}
              />
            </div>
          </div>
          <div className="mt-6 flex min-w-0 flex-col items-center">
            {/* ================= ROOT NODE ================= */}
            <div className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-[20px] border border-[#CAD9EE] bg-gradient-to-b from-[#F6F9FE] to-white p-5 text-center shadow-[0_6px_24px_rgba(15,37,75,.05)] sm:p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#172D57] text-white">
                <UserRound size={26} />
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#7A8AA2]">
                Main distributor
              </p>
              <h3 className="mt-1 text-[20px] font-black text-[#172D57]">
                Your account
              </h3>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E9F6EF] px-3.5 py-2 text-[11px] font-bold text-[#177950]">
                <Users size={14} /> {members.length} Direct Members
              </span>
              {isExpanded && !isLoading && (
                <p className="mt-3 text-[11px] leading-5 text-[#7A8AA2]">
                  {isError
                    ? "Member data could not be loaded."
                    : members.length
                      ? "Your direct sponsor network is shown below."
                      : "No direct downline members are available yet."}
                </p>
              )}
            </div>

            {/* ================= DOWNLINE MEMBERS ================= */}
            {isExpanded && (
              <>
                {isLoading ? (
                  <div className="mt-7 w-full">
                    <TreeSkeleton />
                  </div>
                ) : isError ? (
                  <div className="mt-7 flex w-full max-w-md flex-col items-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                    <AlertCircle size={25} className="text-red-500" />
                    <p className="mt-3 font-bold text-[#9F2B2B]">
                      Unable to load downline members
                    </p>
                    <p className="mt-1 text-[12px] text-[#9A5961]">
                      Please refresh your data to try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetch()}
                      className="mt-4 rounded-xl bg-[#172D57] px-4 py-2.5 text-[12px] font-bold text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div
                    role="status"
                    className="mt-7 flex w-full max-w-lg flex-col items-center rounded-2xl border border-dashed border-[#D8E1EE] bg-[#FAFBFE] p-7 text-center"
                  >
                    <Search size={24} className="text-[#91A3BC]" />
                    <h3 className="mt-3 text-[14px] font-bold text-[#344761]">
                      {hasFilters
                        ? "No matching members found"
                        : "Your direct downline is empty"}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5 text-[#8190A5]">
                      {hasFilters
                        ? "Try another Sponsor ID or change the leg filter."
                        : "Members will appear here when they are available in the API."}
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 rounded-xl bg-[#172D57] px-4 py-2.5 text-[12px] font-bold text-white"
                      >
                        Show all members
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Main Connector */}
                    <div className="h-8 w-[2px] bg-[#C9D6EA]" />
                    {/* Members Count */}
                    <div className="mb-1 flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#E2EBF6] bg-[#F6F9FE] px-3 py-1.5 text-[11px] font-bold text-[#45628C]">
                      <CheckCircle2 size={14} className="text-[#1C9B68]" />{" "}
                      Showing {filteredMembers.length} of {members.length}{" "}
                      direct members
                    </div>
                    {/* Member Cards */}
                    <div className="relative w-full">
                      {/* Horizontal Connection: only shown when columns correspond to visible cards. */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredMembers.map((member) => (
                          <MemberCard key={member.member_id} member={member} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {/* Collapsed Message */}
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D7E2F1] bg-[#F3F7FD] px-5 text-[12px] font-bold text-[#315B93] hover:bg-[#E9F1FC]"
              >
                <ChevronDown size={16} /> Show {members.length} direct members
              </button>
            )}
            {/* Updating Indicator */}
            {isFetching && !isLoading && (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#8A97AA]"
              >
                <Loader2 size={14} className="animate-spin" /> Updating sponsor
                tree...
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SponsorTree;
