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
  ArrowRight,
  Sparkles,
  CalendarClock,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ReactNode } from "react";

import { createPortal } from "react-dom";

import {
  useGetDistributorPendingPlacementsQuery,
  useSetDistributorPlacementMutation,
} from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";

import type { PendingPlacement } from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";

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

      @import url('https\://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

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
    <div className="flex min-w-0 items-center gap-3 rounded-[17px] border border-[#e5eaf2] bg-white p-4 shadow-[0_4px_20px_rgba(14,27,61,0.035)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(14,27,61,0.08)] sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#667085] sm:text-[12px]">
          {label}
        </p>

        <p
          className="mt-1 break-words text-[25px] font-black tracking-tight"
          style={{ color }}
        >
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

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

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

      const maxLeft = Math.max(
        VIEWPORT_GAP,
        window.innerWidth - menuWidth - VIEWPORT_GAP,
      );

      const left = Math.max(
        VIEWPORT_GAP,
        Math.min(rect.right - menuWidth, maxLeft),
      );

      const spaceBelow = window.innerHeight - rect.bottom;

      const openAbove =
        spaceBelow < menuHeight + VIEWPORT_GAP &&
        rect.top > menuHeight + VIEWPORT_GAP;

      const preferredTop = openAbove
        ? rect.top - menuHeight - 4
        : rect.bottom + 4;

      const maxTop = Math.max(
        VIEWPORT_GAP,
        window.innerHeight - menuHeight - VIEWPORT_GAP,
      );

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

          className={
            open ? "rotate-180 transition-transform" : "transition-transform"
          }
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
    <>
      {/* Compact member cards: avoid horizontal scrolling on mobile/tablet. */}
      <div className="grid gap-3 lg:hidden sm:grid-cols-2">
        {members.map((member) => (
          <article
            key={member.member_id}
            className="overflow-hidden rounded-[17px] border border-[#e5eaf2] bg-white shadow-[0_4px_20px_rgba(14,27,61,.04)]"
          >
            <div className="flex items-start justify-between gap-2 border-b border-[#eff2f7] p-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2ff] text-[#3955A6]">
                  <UserRound size={19} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-extrabold text-[#101828]">
                    {displayValue(member.fullname)}
                  </p>
                  <p className="mt-0.5 break-all text-[10px] font-semibold text-[#8a94a5]">
                    {member.ba_id}
                  </p>
                </div>
              </div>
              <PlacementStatus member={member} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 p-4 text-[11px]">
              <div>
                <p className="text-[#929cab]">Registered</p>
                <p className="mt-1 font-semibold text-[#344054]">
                  {formatDate(member.registered_at)}
                </p>
              </div>
              <div>
                <p className="text-[#929cab]">Placement deadline</p>
                <p
                  className={`mt-1 font-bold ${member.is_overdue ? "text-[#b42318]" : "text-[#344054]"}`}
                >
                  {formatDate(member.placement_deadline)}
                </p>
              </div>
              <div>
                <p className="text-[#929cab]">Unplaced downlines</p>
                <p className="mt-1 font-bold text-[#344054]">
                  {formatNumber(member.unplaced_downline_count)}
                </p>
              </div>
              <div>
                <p className="text-[#929cab]">Order</p>
                <p
                  className={`mt-1 font-semibold ${member.has_ordered ? "text-[#1f9d6b]" : "text-[#a15c07]"}`}
                >
                  {member.has_ordered ? "Order placed" : "No order yet"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#eff2f7] bg-[#fbfcff] px-4 py-3">
              <span className="text-[11px] font-medium text-[#7e899a]">
                Assign position
              </span>
              <PlaceAction
                member={member}
                isPlacing={placingBaId === member.ba_id}
                onPlace={onPlace}
              />
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-[16px] lg:block border border-[#e5eaf2] bg-white shadow-[0_4px_24px_rgba(14,27,61,0.035)]">
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
    </>
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

  // Confirm the chosen position before changing the member's placement.
  const [pendingChoice, setPendingChoice] = useState<{
    baId: string;
    side: 1 | 2;
    name: string;
  } | null>(null);

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
          String(value ?? "")
            .toLowerCase()
            .includes(query),
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

  const requestPlacement = (baId: string, side: 1 | 2) => {
    if (isPlacingMutation || placingBaId) return;
    const member = members.find((item) => item.ba_id === baId);
    setPendingChoice({ baId, side, name: member?.fullname || "Member" });
  };

  const handlePlace = async (baId: string, side: 1 | 2) => {
    setPendingChoice(null);
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

      className="min-w-0 space-y-5 bg-[#f6f8fc] p-3 sm:p-5 lg:p-6"
    >
      <FontImport />

      {/* =========================================*

          HEADER

*      ========================================= */}

      <header className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0E1B3D] via-[#172D59] to-[#2958A1] px-5 py-6 text-white shadow-[0_14px_40px_rgba(14,27,61,.15)] sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-28 h-64 w-64 rounded-full border-[34px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-white/5 blur-2xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Network size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-blue-100/80">
                Distributor network / Management
              </p>
              <h1 className="mt-1 text-[22px] font-black tracking-tight sm:text-[28px]">
                Pending Placements
              </h1>
              <p className="mt-1 max-w-xl text-[12px] leading-5 text-blue-100/85 sm:text-[13px]">
                Review unplaced members, monitor deadlines and assign a left or
                right position.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching || isPlacingMutation}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 text-[12px] font-bold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />{" "}
            {isFetching ? "Refreshing..." : "Refresh list"}
          </button>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[11px] text-blue-100/90">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            {totalPending} pending members
          </span>
          {overdueCount > 0 && (
            <span className="rounded-full border border-rose-200/20 bg-rose-300/15 px-3 py-1.5 text-rose-100">
              {overdueCount} overdue
            </span>
          )}
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            Live data from distributor API
          </span>
        </div>
      </header>

      {/* =========================================*

          FEEDBACK BANNER

*      ========================================= */}

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

      {/* =========================================*

          SUMMARY CARDS

*      ========================================= */}

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

      {/* =========================================*

          SEARCH & FILTERS

*      ========================================= */}

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

      {/* =========================================*

          MEMBER TABLE

*      ========================================= */}

      {filteredMembers.length ? (
        <MemberTable
          members={filteredMembers}

          placingBaId={placingBaId}

          onPlace={requestPlacement}
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

      {/* =========================================*

          FOOTER

*      ========================================= */}

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

      {pendingChoice && (
        <div
          className="fixed inset-0 z-[2147483600] flex items-center justify-center bg-[#101828]/60 p-4 backdrop-blur-[3px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPlacingMutation)
              setPendingChoice(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-placement-title"
            className="w-full max-w-md overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(0,0,0,.25)]"
          >
            <div className="border-b border-[#edf0f5] px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#edf2ff] text-[#3955A6]">
                  <GitBranch size={21} />
                </span>
                <button
                  type="button"
                  aria-label="Cancel placement"
                  disabled={isPlacingMutation}
                  onClick={() => setPendingChoice(null)}
                  className="rounded-lg p-2 text-[#6b7586] hover:bg-[#f4f6fa]"
                >
                  <X size={17} />
                </button>
              </div>
              <h2
                id="confirm-placement-title"
                className="mt-3 text-[18px] font-extrabold text-[#101828]"
              >
                Confirm member placement
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[#667085]">
                Please review the position before submitting this placement to
                the API.
              </p>
            </div>
            <div className="space-y-3 px-5 py-5 sm:px-6">
              <div className="rounded-xl bg-[#f7f9fd] p-4 text-[12px]">
                <p className="font-bold text-[#101828]">{pendingChoice.name}</p>
                <p className="mt-1 break-all text-[#667085]">
                  BA ID: {pendingChoice.baId}
                </p>
                <p className="mt-3 text-[#667085]">
                  Selected position:{" "}
                  <strong
                    className={
                      pendingChoice.side === 1
                        ? "text-[#1f9d6b]"
                        : "text-[#3955A6]"
                    }
                  >
                    {pendingChoice.side === 1 ? "Left leg" : "Right leg"}
                  </strong>
                </p>
              </div>
              <p className="text-[11px] leading-5 text-[#8a94a5]">
                Placement availability and rules are validated by your backend.
                A successful response will refresh the pending list.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={isPlacingMutation}
                  onClick={() => setPendingChoice(null)}
                  className="h-10 flex-1 rounded-xl border border-[#e0e6ef] bg-white text-[12px] font-bold text-[#475467] hover:bg-[#f7f9fc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPlacingMutation}
                  onClick={() =>
                    void handlePlace(pendingChoice.baId, pendingChoice.side)
                  }
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0E1B3D] text-[12px] font-bold text-white hover:bg-[#223a69] disabled:opacity-50"
                >
                  {isPlacingMutation ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}{" "}
                  Confirm placement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
