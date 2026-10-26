"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GitBranch,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  ChevronDown,
  Network,
  ShoppingBag,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  useGetDistributorPendingPlacementsQuery,
  useSetDistributorPlacementMutation,
} from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";
import type {
  PendingPlacement,
} from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";
import Loding from "@/components/common/Loding";

// ==================================================
// DESIGN TOKENS
// ==================================================

const NAVY = "#0E1B3D";
const INDIGO = "#3955A6";
const EMERALD = "#1f9d6b";
const BRASS = "#B8935A";
const RED = "#c0392b";

// ==================================================
// HELPERS
// ==================================================

function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

// API date strings are formatted without converting their timezone.
function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const [datePart, timePart] = value.split(" ");
  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;

  const date = `${day}/${month}/${year}`;
  return timePart ? `${date} ${timePart.slice(0, 5)}` : date;
}

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }
  return String(value);
}

// ==================================================
// FONT
// ==================================================

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
    `}</style>
  );
}

// ==================================================
// LOADING / ERROR
// ==================================================

function PendingPlacementsLoader() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[16px] border border-[#e7e9ee] bg-white">
     <Loding />
    </div>
  );
}

function PendingPlacementsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
      <AlertCircle size={34} className="text-[#c0392b]" />
      <h2 className="mt-3 text-[16px] font-bold text-[#101828]">
        Unable to load pending placements
      </h2>
      <p className="mt-1 max-w-md text-[12px] text-[#667085]">
        The pending placement data could not be retrieved. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12px] font-semibold text-white"
        style={{ backgroundColor: NAVY }}
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

// ==================================================
// STAT CARD
// ==================================================

function StatCard({
  label,
  value,
  icon,
  color,
  background,
  note,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  background: string;
  note?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[13px] border border-[#e7e9ee] bg-white p-3.5 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)] sm:p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>
        <p className="mt-1 break-words text-[21px] font-black" style={{ color }}>
          {value}
        </p>
        {note && <p className="mt-0.5 text-[10px] text-[#98a2b3]">{note}</p>}
      </div>
    </div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function PlacementStatus({ member }: { member: PendingPlacement }) {
  if (member.is_overdue) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0ef] px-2.5 py-1.5 text-[10px] font-bold text-[#b42318]">
        <ShieldAlert size={12} /> Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4e5] px-2.5 py-1.5 text-[10px] font-bold text-[#a15c07]">
      <Clock3 size={12} /> Pending placement
    </span>
  );
}

// ==================================================
// PLACE ACTION CELL
// ==================================================

function PlaceAction({
  member,
  isPlacing,
  onPlace,
}: {
  member: PendingPlacement;
  isPlacing: boolean;
  onPlace: (baId: string, side: 1 | 2) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || isPlacing) {
      setMenuPosition(null);
      return;
    }

    // Keep the menu attached to the Place button even when the table scrolls.
    // Rendering through a portal prevents the table's overflow-x-auto from clipping it.
    const MENU_WIDTH = 144;
    const MENU_HEIGHT = 84;
    const VIEWPORT_GAP = 8;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth || MENU_WIDTH;
      const menuHeight = menuRef.current?.offsetHeight || MENU_HEIGHT;
      const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - menuWidth - VIEWPORT_GAP);
      const left = Math.max(VIEWPORT_GAP, Math.min(rect.right - menuWidth, maxLeft));
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove =
        spaceBelow < menuHeight + VIEWPORT_GAP && rect.top > menuHeight + VIEWPORT_GAP;

      const preferredTop = openAbove ? rect.top - menuHeight - 4 : rect.bottom + 4;
      const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - menuHeight - VIEWPORT_GAP);
      const top = Math.max(VIEWPORT_GAP, Math.min(preferredTop, maxTop));

      setMenuPosition({ top, left });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    // Capture scroll events from the table and other scrollable containers too.
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, isPlacing]);

  const placeMember = (side: 1 | 2) => {
    setOpen(false);
    setMenuPosition(null);
    onPlace(member.ba_id, side);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={isPlacing}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e5e9ef] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#3955A6] transition-colors hover:bg-[#f7f8fa] disabled:opacity-50"
      >
        {isPlacing ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <ArrowLeftRight size={12} />
        )}
        Place
        <ChevronDown
          size={12}
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        />
      </button>

      {open && !isPlacing && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <>
              {/* Full-screen click-away layer; the menu is stacked above it. */}
              <button
                type="button"
                aria-label="Close placement menu"
                onClick={() => {
                  setOpen(false);
                  setMenuPosition(null);
                }}
                className="fixed inset-0 z-[2147483646] m-0 cursor-default border-0 bg-transparent p-0"
              />

              <div
                ref={menuRef}
                role="menu"
                style={{ top: menuPosition.top, left: menuPosition.left }}
                className="fixed z-[2147483647] w-36 overflow-hidden rounded-[10px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_-10px_rgba(16,24,40,0.2)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => placeMember(1)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11px] font-semibold text-[#344054] hover:bg-[#f7f8fa]"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eaf7f0] text-[9px] font-black text-[#18794e]">
                    L
                  </span>
                  Place Left
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => placeMember(2)}
                  className="flex w-full items-center gap-2 border-t border-[#f0f2f5] px-3 py-2.5 text-left text-[11px] font-semibold text-[#344054] hover:bg-[#f7f8fa]"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eceffb] text-[9px] font-black text-[#3955A6]">
                    R
                  </span>
                  Place Right
                </button>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

// ==================================================
// MEMBER TABLE
// ==================================================

function MemberTable({
  members,
  placingBaId,
  onPlace,
}: {
  members: PendingPlacement[];
  placingBaId: string | null;
  onPlace: (baId: string, side: 1 | 2) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[#e7e9ee] bg-white">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e7e9ee] bg-[#f7f8fa]">
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Member
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Status
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Registered at
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Placement deadline
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Unplaced downlines
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Order status
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.member_id}
              className="border-b border-[#f0f2f5] transition-colors last:border-b-0 hover:bg-[#fafcff]"
            >
              {/* Member (name only — ba_id removed) */}
              <td className="px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eceffb] text-[#3955A6]">
                    <Users size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-[13px] font-bold text-[#101828]">
                      {displayValue(member.fullname)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-4">
                <PlacementStatus member={member} />
              </td>

              {/* Registered at */}
              <td className="px-4 py-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#344054]">
                  <CalendarDays size={13} className="text-[#98a2b3]" />
                  {formatDate(member.registered_at)}
                </p>
              </td>

              {/* Placement deadline */}
              <td className="px-4 py-4">
                <p
                  className={`flex items-center gap-1.5 text-[12px] font-bold ${
                    member.is_overdue ? "text-[#b42318]" : "text-[#344054]"
                  }`}
                >
                  <CalendarDays size={13} className="text-[#98a2b3]" />
                  {formatDate(member.placement_deadline)}
                </p>
              </td>

              {/* Unplaced downlines */}
              <td className="px-4 py-4">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#344054]">
                  <Network size={13} className="text-[#98a2b3]" />
                  {formatNumber(member.unplaced_downline_count)}
                </p>
              </td>

              {/* Order status */}
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${
                    member.has_ordered
                      ? "bg-[#eaf7f0] text-[#18794e]"
                      : "bg-[#fff4e5] text-[#a15c07]"
                  }`}
                >
                  {member.has_ordered ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <ShoppingBag size={12} />
                  )}
                  {member.has_ordered ? "Order placed" : "No order yet"}
                </span>
              </td>

              {/* Action */}
              <td className="px-4 py-4">
                <PlaceAction
                  member={member}
                  isPlacing={placingBaId === member.ba_id}
                  onPlace={onPlace}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================================================
// MAIN COMPONENT
// ==================================================

export default function PendingPlacements() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorPendingPlacementsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [setPlacement, { isLoading: isPlacingMutation }] =
    useSetDistributorPlacementMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");

  // track which member is currently being placed (for per-row spinner)
  const [placingBaId, setPlacingBaId] = useState<string | null>(null);

  // toast-like feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const members = response?.data ?? [];

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const searchableValues = [
        member.ba_id,
        member.fullname,
        member.registered_at,
        member.placement_deadline,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query),
        );

      const matchesOrder =
        orderFilter === "all" ||
        (orderFilter === "ordered" && member.has_ordered) ||
        (orderFilter === "not_ordered" && !member.has_ordered);

      const matchesDeadline =
        deadlineFilter === "all" ||
        (deadlineFilter === "overdue" && member.is_overdue) ||
        (deadlineFilter === "upcoming" && !member.is_overdue);

      return matchesSearch && matchesOrder && matchesDeadline;
    });
  }, [members, searchQuery, orderFilter, deadlineFilter]);

  const totalPending = response?.total ?? members.length;
  const overdueCount = members.filter((member) => member.is_overdue).length;
  const noOrderCount = members.filter((member) => !member.has_ordered).length;
  const totalUnplacedDownlines = members.reduce(
    (sum, member) => sum + (member.unplaced_downline_count ?? 0),
    0,
  );

  const handlePlace = async (baId: string, side: 1 | 2) => {
    setPlacingBaId(baId);
    setFeedback(null);
    try {
      const result = await setPlacement({ ba_id: baId, side }).unwrap();
      if (result.success === false) {
        setFeedback({
          type: "error",
          message: result.message || "Failed to set placement.",
        });
        return;
      }
      setFeedback({
        type: "success",
        message:
          result.message ||
          `Member placed successfully on the ${side === 1 ? "left" : "right"} side.`,
      });
      // refetch to reflect updated pending list
      void refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Something went wrong while setting placement.";
      setFeedback({ type: "error", message });
    } finally {
      setPlacingBaId(null);
    }
  };

  if (isLoading) return <PendingPlacementsLoader />;

  if (isError || response?.success === false) {
    return <PendingPlacementsError onRetry={() => void refetch()} />;
  }

  const clearFilters = () => {
    setSearchQuery("");
    setOrderFilter("all");
    setDeadlineFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) || orderFilter !== "all" || deadlineFilter !== "all";

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="min-w-0 space-y-6 rounded-[16px] border border-[#e7e9ee] bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
    >
      <FontImport />

      {/* =========================================
          HEADER
      ========================================= */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eceffb] text-[#3955A6]">
            <Network size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-black tracking-[-0.01em] text-[#101828]">
              Pending Placements
            </h1>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#667085] sm:text-[13px]">
              Track newly registered members, order status, placement deadlines
              and available tree slots.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-[#e5e9ef] bg-white px-3 text-[12px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa] disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =========================================
          FEEDBACK BANNER
      ========================================= */}
      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[12px] font-semibold ${
            feedback.type === "success"
              ? "border-[#bfe8d4] bg-[#eaf7f0] text-[#18794e]"
              : "border-[#f5c6c2] bg-[#fff0ef] text-[#b42318]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <p className="flex-1">{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending placements"
          value={formatNumber(totalPending)}
          icon={<Users size={20} />}
          color={INDIGO}
          background="#eceffb"
          note="Records returned by API"
        />
        <StatCard
          label="No order yet"
          value={formatNumber(noOrderCount)}
          icon={<ShoppingBag size={20} />}
          color={BRASS}
          background="#f8f1e4"
          note="Members without an order"
        />
        <StatCard
          label="Overdue"
          value={formatNumber(overdueCount)}
          icon={<AlertCircle size={20} />}
          color={overdueCount ? RED : EMERALD}
          background={overdueCount ? "#fff0ef" : "#eaf7f0"}
          note="Past placement deadline"
        />
        <StatCard
          label="Unplaced downlines"
          value={formatNumber(totalUnplacedDownlines)}
          icon={<GitBranch size={20} />}
          color={NAVY}
          background="#eceefb"
          note="Sum across displayed members"
        />
      </div>

      {/* =========================================
          SEARCH & FILTERS
      ========================================= */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-bold text-[#101828]">
              Pending member list
            </h2>
            <p className="mt-1 text-[11px] text-[#667085]">
              Search by name or distributor ID.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#667085]">
            Showing {filteredMembers.length} of {members.length}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_190px_190px]">
          <div className="relative min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search member name or ID..."
              className="h-[41px] w-full rounded-[9px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[12px] text-[#101828] outline-none placeholder:text-[#a0a8b6] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={orderFilter}
              onChange={(event) => setOrderFilter(event.target.value)}
              className="h-[41px] w-full appearance-none rounded-[9px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 pr-9 text-[12px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            >
              <option value="all">All order statuses</option>
              <option value="ordered">Order placed</option>
              <option value="not_ordered">No order yet</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={deadlineFilter}
              onChange={(event) => setDeadlineFilter(event.target.value)}
              className="h-[41px] w-full appearance-none rounded-[9px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 pr-9 text-[12px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            >
              <option value="all">All deadlines</option>
              <option value="overdue">Overdue only</option>
              <option value="upcoming">Not overdue</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-semibold text-[#3955A6] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================
          MEMBER TABLE
      ========================================= */}
      {filteredMembers.length ? (
        <MemberTable
          members={filteredMembers}
          placingBaId={placingBaId}
          onPlace={handlePlace}
        />
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[14px] bg-[#f7f8fa] p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
            <Inbox size={22} className="text-[#98a2b3]" />
          </div>
          <p className="text-[13px] font-semibold text-[#344054]">
            {members.length
              ? "No matching members found"
              : "No pending placements found"}
          </p>
          <p className="max-w-md text-[12px] text-[#8a92a6]">
            {members.length
              ? "Try changing the search term or filters."
              : "There are currently no pending placement records in the API response."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-semibold text-[#3955A6] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* =========================================
          FOOTER
      ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f2f5] pt-4">
        <p className="text-[11px] text-[#8a92a6]">
          Pending placements data is loaded from the distributor genealogy API.
          {isPlacingMutation && " · Setting placement..."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching || isPlacingMutation}
          className="flex items-center gap-2 text-[12px] font-semibold text-[#3955A6] hover:underline disabled:opacity-50"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Update placements
        </button>
      </div>
    </div>
  );
}