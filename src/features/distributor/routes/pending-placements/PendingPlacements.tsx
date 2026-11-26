"use client";

import { AlertCircle, CheckCircle2, GitBranch, Inbox, Loader2, RefreshCw, Search, Users, ChevronDown, Network, ShoppingBag, X } from "lucide-react";

import { useMemo, useState } from "react";


import {
  useGetDistributorPendingPlacementsQuery,
  useSetDistributorPlacementMutation,
} from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";


import { BRASS, EMERALD, FontImport, INDIGO, NAVY, PendingPlacementsError, PendingPlacementsLoader, RED, formatNumber } from "@/features/distributor/routes/pending-placements/PendingPlacements.parts/support";
import { StatCard } from "@/features/distributor/routes/pending-placements/PendingPlacements.parts/StatCard";
import { MemberTable } from "@/features/distributor/routes/pending-placements/PendingPlacements.parts/MemberTable";


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
