"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  GitBranch,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Network,
  RefreshCw,
  Scan,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
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
    .sponsor-tree-ui .tabular { font-variant-numeric: tabular-nums; }
    .sponsor-tree-ui .sponsor-tree-scroll::-webkit-scrollbar { height: 7px; }
    .sponsor-tree-ui .sponsor-tree-scroll::-webkit-scrollbar-thumb { border-radius: 999px; background: #CBD7E9; }
    @media (prefers-reduced-motion: reduce) {
      .sponsor-tree-ui *, .sponsor-tree-ui *::before, .sponsor-tree-ui *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `}</style>
);

/* =========================================================
 *   TYPES
 * ========================================================= */
type DownlineMember = {
  member_id: number;
  ba_id: string;
  unilevel_parent_id: number | null;
  unilevel_parent_ba_id: string | null;
  binary_parent_id: number | null;
  binary_parent_ba_id: string | null;
  binary_side: number | null;
  cv_left: string | number | null;
  cv_right: string | number | null;
  floating_cv_left: string | number | null;
  floating_cv_right: string | number | null;
  total_cv_left: string | number | null;
  total_cv_right: string | number | null;
  level: number;
  // Name is optional: display it only when the API actually provides it.
  full_name?: string | null;
  member_name?: string | null;
  name?: string | null;
};

type LegFilter = "all" | "left" | "right" | "other";
type MemberSide = "left" | "right" | "other";
type ToolbarButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

/* =========================================================
 *   HELPERS
 * ========================================================= */
const formatNumber = (value?: string | number | null): string => {
  if (value === undefined || value === null || value === "") return "0";
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : String(value);
};

const SIDE_NAME = (side: number | null): string =>
  side === 1 ? "Left leg" : side === 2 ? "Right leg" : "Not assigned";

const memberSide = (member: DownlineMember): MemberSide =>
  member.binary_side === 1
    ? "left"
    : member.binary_side === 2
      ? "right"
      : "other";

const memberName = (member: DownlineMember): string => {
  const name = [member.full_name, member.member_name, member.name].find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return name?.trim() || `Member #${member.member_id}`;
};

const initialsFrom = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase() || "M";
};

const tones = {
  left: { line: "#18A371", ring: "#D9F1E5", bg: "#ECF9F2", text: "#12744E" },
  right: { line: "#4E7DD1", ring: "#DAE7FB", bg: "#EEF4FE", text: "#315DA8" },
  other: { line: "#A0A8B7", ring: "#E4E8EF", bg: "#F4F6F9", text: "#647084" },
} as const;

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
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={`flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B75CA]/40 disabled:opacity-45 ${
      active
        ? "border-[#244A83] bg-[#244A83] text-white"
        : "border-[#E0E8F2] bg-white text-[#536B88] hover:bg-[#EFF4FC]"
    }`}
  >
    <Icon size={16} strokeWidth={1.9} />
  </button>
);

/* =========================================================
 *   LOADING SKELETON
 * ========================================================= */
const TreeSkeleton = () => (
  <div
    className="flex flex-col items-center gap-3 py-3 animate-pulse"
    aria-busy="true"
  >
    <div className="h-[90px] w-[240px] rounded-2xl bg-[#EAF0F8]" />
    <div className="h-7 w-px bg-[#D4DFED]" />
    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[150px] w-[205px] rounded-xl bg-[#EFF3F8]" />
      ))}
    </div>
  </div>
);

/* =========================================================
 *   CV METRIC
 * ========================================================= */
function CVMetric({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[#E7EDF5] bg-[#F7F9FD] px-2.5 py-2">
      <p className="text-[10px] text-[#7C8BA1]">{label}</p>
      <p
        className="tabular mt-0.5 truncate text-[13px] font-extrabold text-[#223957]"
        title={formatNumber(value)}
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* =========================================================
 *   MEMBER CARD: small branch node, details open separately
 * ========================================================= */
function MemberCard({
  member,
  onDetails,
}: {
  member: DownlineMember;
  onDetails: (member: DownlineMember) => void;
}) {
  const name = memberName(member);
  const tone = tones[memberSide(member)];

  return (
    <article className="group relative flex w-[204px] shrink-0 flex-col rounded-[15px] border border-[#DAE5F3] bg-white px-3 py-3 shadow-[0_5px_16px_rgba(23,48,88,.055)] transition-colors hover:border-[#9EBBE2]">
      {/* Member Header */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[11px] font-extrabold"
          style={{ backgroundColor: tone.bg, color: tone.text }}
        >
          {initialsFrom(name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-[12px] font-extrabold leading-5 text-[#193253]"
            title={name}
          >
            {name}
          </h3>
          <p className="mt-0.5 truncate text-[10px] text-[#8291A5]">
            Member #{member.member_id}
          </p>
        </div>
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: tone.line }}
          title={SIDE_NAME(member.binary_side)}
        />
      </div>

      {/* CV Details */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <CVMetric label="Left CV" value={member.cv_left} />
        <CVMetric label="Right CV" value={member.cv_right} />
      </div>

      {/* Smaller action preserves all other details without enlarging the tree. */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span
          className="truncate text-[10px] font-bold"
          style={{ color: tone.text }}
        >
          {SIDE_NAME(member.binary_side)}
        </span>
        <button
          type="button"
          onClick={() => onDetails(member)}
          aria-label={`View CV and placement details for ${name}`}
          title="View CV & placement details"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#EDF3FD] text-[#315FAD] hover:bg-[#DDEBFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E91DE]"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
 *   MEMBER DETAILS MODAL: expanded metrics stay out of the tree
 * ========================================================= */
function MemberDetails({
  member,
  onClose,
}: {
  member: DownlineMember | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [member?.ba_id]);

  useEffect(() => {
    if (!member) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [member, onClose]);

  if (!member) return null;

  const name = memberName(member);
  const copyId = async () => {
    if (!member.ba_id) return;
    try {
      await navigator.clipboard.writeText(member.ba_id);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0E1C33]/55 p-3 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sponsor-member-details-title"
        className="max-h-[90dvh] w-full max-w-[470px] overflow-y-auto rounded-[20px] bg-white p-5 shadow-[0_25px_80px_rgba(0,0,0,.20)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E7EDF5] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#326BC3]">
              <UserRound size={20} />
            </span>
            <div className="min-w-0">
              <h2
                id="sponsor-member-details-title"
                className="break-words text-[16px] font-extrabold text-[#193253]"
              >
                {name}
              </h2>
              <p className="text-[11px] text-[#73859E]">
                Member #{member.member_id} · {SIDE_NAME(member.binary_side)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close member details"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6C7D93] hover:bg-[#F0F4F9]"
          >
            <X size={17} />
          </button>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#7C8BA1]">
          CV overview
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <CVMetric label="Left CV" value={member.cv_left} />
          <CVMetric label="Right CV" value={member.cv_right} />
        </div>
        {/* Floating CV */}
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#7C8BA1]">
          Floating CV
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <CVMetric label="Floating Left" value={member.floating_cv_left} />
          <CVMetric label="Floating Right" value={member.floating_cv_right} />
        </div>
        {/* Total CV */}
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#7C8BA1]">
          Total CV
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <CVMetric label="Total Left" value={member.total_cv_left} />
          <CVMetric label="Total Right" value={member.total_cv_right} />
        </div>
        {/* Sponsor Info */}
        <div className="mt-4 space-y-3 rounded-xl border border-[#E5EBF3] bg-[#F9FBFD] p-3">
          <div className="flex items-start justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-[#71829B]">BA ID</span>
            <span className="flex min-w-0 items-start gap-1 break-all text-right font-bold text-[#253F61]">
              {member.ba_id || "—"}
              {!!member.ba_id && (
                <button
                  type="button"
                  onClick={() => void copyId()}
                  title="Copy BA ID"
                  aria-label="Copy BA ID"
                  className="shrink-0 text-[#315EAA]"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-[#71829B]">Sponsor ID</span>
            <span className="break-all text-right font-bold text-[#253F61]">
              {member.unilevel_parent_ba_id || "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-[#71829B]">Binary parent</span>
            <span className="break-all text-right font-bold text-[#253F61]">
              {member.binary_parent_ba_id || "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-[#71829B]">Binary position</span>
            <span className="font-bold text-[#253F61]">
              {SIDE_NAME(member.binary_side)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
 *   COMPACT DIRECT BRANCH
 *   Depth 1 API: connect direct members to the parent only.
 *   Do not fabricate deeper binary/unilevel hierarchy.
 * ========================================================= */
function DirectBranch({
  members,
  onDetails,
}: {
  members: DownlineMember[];
  onDetails: (member: DownlineMember) => void;
}) {
  const count = members.length;
  return (
    <div className="flex min-w-full w-max flex-col items-center px-3 py-2">
      {/* ================= ROOT NODE ================= */}
      <div className="relative z-10 flex w-[236px] items-center gap-2.5 rounded-[15px] border border-[#C8D9F0] bg-[#EEF5FF] p-3 shadow-[0_5px_18px_rgba(27,58,103,.06)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#254C89] text-white">
          <Network size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7289AB]">
            Main distributor
          </p>
          <h3 className="mt-0.5 text-[13px] font-extrabold text-[#1C3A63]">
            Your account
          </h3>
          <p className="text-[10px] text-[#6F8199]">
            {count} direct {count === 1 ? "member" : "members"}
          </p>
        </div>
      </div>

      {count > 0 && (
        <>
          {/* Vertical trunk, then horizontal sibling connector */}
          <div className="h-7 w-px bg-[#B8CBE3]" />
          <div className="relative flex w-max items-start">
            {count > 1 && (
              <div className="pointer-events-none absolute left-[114px] right-[114px] top-0 h-px bg-[#B8CBE3]" />
            )}
            {members.map((member) => (
              <div
                key={`${member.member_id}-${member.ba_id}`}
                className="relative flex w-[228px] shrink-0 flex-col items-center px-3 pt-7"
              >
                <div className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-[#B8CBE3]" />
                <MemberCard member={member} onDetails={onDetails} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
 *   MAIN COMPONENT
 * ========================================================= */
const SponsorTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [legFilter, setLegFilter] = useState<LegFilter>("all");
  const [selectedMember, setSelectedMember] = useState<DownlineMember | null>(
    null,
  );
  const treeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* =======================================================
   *     API CALL - DEPTH 1
   * ======================================================= */
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDistributorDownlineQuery(1);

  const members = useMemo<DownlineMember[]>(
    () => (Array.isArray(data?.data) ? (data.data as DownlineMember[]) : []),
    [data],
  );

  /* Search ONLY members already supplied by the depth 1 API.
     This is not a backend/global member search. */
  const normalizedSearch = sponsorSearch.trim().toLowerCase();
  const filteredMembers = useMemo(() => {
    return members.filter((member: DownlineMember) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          memberName(member),
          member.ba_id,
          member.unilevel_parent_ba_id,
          member.binary_parent_ba_id,
          member.member_id,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );
      const matchesLeg =
        legFilter === "all" || memberSide(member) === legFilter;
      return matchesSearch && matchesLeg;
    });
  }, [members, normalizedSearch, legFilter]);

  const counts = useMemo(
    () => ({
      left: members.filter((member: DownlineMember) => member.binary_side === 1)
        .length,
      right: members.filter(
        (member: DownlineMember) => member.binary_side === 2,
      ).length,
      other: members.filter(
        (member: DownlineMember) =>
          member.binary_side !== 1 && member.binary_side !== 2,
      ).length,
    }),
    [members],
  );

  const hasFilters = Boolean(normalizedSearch || legFilter !== "all");

  /* =======================================================
   *     FIT TO VIEW
   * ======================================================= */
  const handleFitToView = useCallback(() => {
    setIsExpanded(true);
    requestAnimationFrame(() => {
      treeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const scroll = scrollRef.current;
      if (scroll)
        scroll.scrollLeft = Math.max(
          0,
          (scroll.scrollWidth - scroll.clientWidth) / 2,
        );
    });
  }, []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll)
      scroll.scrollLeft = Math.max(
        0,
        (scroll.scrollWidth - scroll.clientWidth) / 2,
      );
  }, [filteredMembers.length, isExpanded]);

  const resetFilters = () => {
    setSponsorSearch("");
    setLegFilter("all");
    setIsExpanded(true);
  };

  return (
    <div className="sponsor-tree-ui min-w-0 rounded-[20px] border border-[#E0E7F2] bg-[#F7F9FC] text-[#193253]">
      <FontImport />
      {/* ================= HEADER ================= */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDF5] bg-white px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF2FE] text-[#3569BC]">
            <GitBranch size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[15px] font-extrabold text-[#1C3457]">
              Sponsor Tree
            </h1>
            <p className="text-[10px] text-[#8190A5]">
              Direct members: {isLoading ? "…" : members.length} · Left:{" "}
              {counts.left} · Right: {counts.right}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#DEE7F2] bg-white px-3 text-[11px] font-bold text-[#47648D] hover:bg-[#F2F6FD] disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </header>

      <div className="p-3 sm:p-4">
        {/* ================= SPONSOR ID SEARCH ================= */}
        <div className="flex flex-wrap items-center gap-2 rounded-[13px] border border-[#E2E9F3] bg-white p-2.5 sm:p-3">
          <div className="relative min-w-[180px] flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8799AF]"
            />
            <input
              ref={searchRef}
              type="search"
              value={sponsorSearch}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSponsorSearch(event.target.value);
                if (event.target.value.trim()) setIsExpanded(true);
              }}
              placeholder="Search member, BA ID or sponsor…"
              aria-label="Search members"
              className="h-9 w-full rounded-[9px] border border-[#DFE8F4] bg-[#FBFCFF] pl-9 pr-8 text-[11px] font-semibold text-[#254468] outline-none placeholder:font-normal focus:border-[#5282CA] focus:ring-2 focus:ring-[#5282CA]/10 sm:text-[12px]"
            />
            {!!sponsorSearch && (
              <button
                type="button"
                onClick={() => {
                  setSponsorSearch("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#76889F] hover:bg-[#EDF3F9]"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter members by leg"
          >
            {(
              [
                { value: "all", label: "All", count: members.length },
                { value: "left", label: "Left", count: counts.left },
                { value: "right", label: "Right", count: counts.right },
                ...(counts.other
                  ? [{ value: "other", label: "Other", count: counts.other }]
                  : []),
              ] as { value: LegFilter; label: string; count: number }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setLegFilter(option.value);
                  setIsExpanded(true);
                }}
                aria-pressed={legFilter === option.value}
                className={`h-8 rounded-[8px] border px-2.5 text-[10px] font-bold ${
                  legFilter === option.value
                    ? "border-[#29558E] bg-[#29558E] text-white"
                    : "border-[#E2E9F3] bg-white text-[#6D7F96] hover:bg-[#F3F7FC]"
                }`}
              >
                {option.label} {option.count}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              aria-label="Clear filters"
              title="Clear filters"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687F9C] hover:bg-[#EDF3F9]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ================= TREE STRUCTURE ================= */}
        <section
          ref={treeRef}
          className="mt-3 rounded-[15px] border border-[#E2E9F3] bg-white p-3"
          aria-label="Sponsor tree structure"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECF0F6] pb-2.5">
            <div className="flex items-center gap-2">
              <Network size={16} className="text-[#3769B8]" />
              <span className="text-[12px] font-extrabold text-[#25405F]">
                Direct sponsor branch
              </span>
              <span className="text-[10px] text-[#8898AA]">Depth 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ToolbarButton
                icon={Maximize2}
                label="Expand branch"
                onClick={() => setIsExpanded(true)}
                active={isExpanded}
              />
              <ToolbarButton
                icon={Minimize2}
                label="Collapse branch"
                onClick={() => setIsExpanded(false)}
                active={!isExpanded}
              />
              <ToolbarButton
                icon={Scan}
                label="Center tree"
                onClick={handleFitToView}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="overflow-hidden">
              <TreeSkeleton />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <AlertCircle size={22} className="text-[#C94D4D]" />
              <p className="text-[12px] font-bold text-[#A64545]">
                Could not load sponsor members.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-[#29558E] px-3 py-2 text-[11px] font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredMembers.length === 0 && hasFilters ? (
            <div className="py-8 text-center">
              <Search size={20} className="mx-auto text-[#91A2B8]" />
              <p className="mt-2 text-[12px] font-semibold text-[#627892]">
                No matching members
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-[11px] font-bold text-[#3069B8]"
              >
                Show all members
              </button>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="sponsor-tree-scroll max-w-full overflow-x-auto overflow-y-hidden pb-3"
              >
                <DirectBranch
                  members={isExpanded ? filteredMembers : []}
                  onDetails={setSelectedMember}
                />
              </div>
              {!isExpanded && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDF4FD] px-3 py-2 text-[11px] font-bold text-[#3769B8]"
                  >
                    <ChevronDown size={14} /> Show {filteredMembers.length}{" "}
                    members
                  </button>
                </div>
              )}
              {isFetching && !isLoading && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-[#8190A6]">
                  <Loader2 size={13} className="animate-spin" /> Updating tree…
                </div>
              )}
            </>
          )}
          <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-[#8B99AC]">
            <Info size={12} className="mt-0.5 shrink-0" />
            Only direct members returned by the depth 1 API are shown. Scroll
            horizontally to explore the branch.
          </p>
        </section>
      </div>

      <MemberDetails
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};

export default SponsorTree;
