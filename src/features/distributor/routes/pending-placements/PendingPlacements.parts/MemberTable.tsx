"use client";

import { CalendarDays, CheckCircle2, Users, Network, ShoppingBag, UserRound } from "lucide-react";
import type { PendingPlacement } from "@/lib/redux/api/distributor/distributorPendingPlacementsApi";
import { PlacementStatus, displayValue, formatDate, formatNumber } from "@/features/distributor/routes/pending-placements/PendingPlacements.parts/support";
import { PlaceAction } from "@/features/distributor/routes/pending-placements/PendingPlacements.parts/PlaceAction";


// ==================================================

// MEMBER TABLE

// ==================================================

export function MemberTable({
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
