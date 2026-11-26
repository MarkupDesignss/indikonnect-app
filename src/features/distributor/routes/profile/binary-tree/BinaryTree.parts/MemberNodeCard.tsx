"use client";

import { Network, UserRound } from "lucide-react";
import { useRef } from "react";
import type { GenealogyMember } from "@/lib/redux/api/distributor/distributorGenealogyApi";
import { BLUE, GREEN, ORANGE, TreeSide, formatCV, getMemberName } from "@/features/distributor/routes/profile/binary-tree/BinaryTree.parts/support";


// --------------------------------------------------
// MEMBER NODE CARD
// --------------------------------------------------

export function MemberNodeCard({
  member,
  side,
  inverted,
  onOpenBranch,
}: {
  member: GenealogyMember;
  side: TreeSide;
  inverted: boolean;
  onOpenBranch: (baId: string) => void;
}) {
  const lastTapRef = useRef(0);

  const isRoot = side === "root";
  const displayName = getMemberName(member);

  const sideLabel =
    side === "left"
      ? "LEFT LEG"
      : side === "right"
        ? "RIGHT LEG"
        : "";

  const sideColor =
    side === "left"
      ? GREEN
      : side === "right"
        ? ORANGE
        : BLUE;

  const handleOpen = () => {
    onOpenBranch(member.ba_id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${displayName} branch`}
      title="Double-click / double-tap to see this member and all sub-branches"
      onDoubleClick={(event) => {
        event.stopPropagation();
        handleOpen();
      }}
      onTouchEnd={(event) => {
        const now = Date.now();

        if (now - lastTapRef.current < 350) {
          event.preventDefault();
          event.stopPropagation();
          lastTapRef.current = 0;
          handleOpen();
        } else {
          lastTapRef.current = now;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      style={{
        transform: inverted ? "scaleY(-1)" : undefined,
      }}
      className={`group relative w-[272px] shrink-0 cursor-pointer overflow-hidden rounded-[19px] border p-4 shadow-[0_6px_22px_rgba(25,51,96,.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8CAFE6] hover:shadow-[0_16px_36px_rgba(25,51,96,.15)] focus:outline-none focus:ring-4 focus:ring-[#3268C8]/20 sm:w-[296px] ${
        isRoot
          ? "border-[#8FAFE5] bg-gradient-to-b from-[#F0F6FF] to-white"
          : "border-[#DDE7F3] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px]"
          style={{
            backgroundColor: isRoot ? "#e1eaff" : "#edf3ff",
            color: sideColor,
          }}
        >
          {isRoot ? <Network size={23} /> : <UserRound size={23} />}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="break-words text-[15px] font-extrabold leading-snug tracking-[-.01em] text-[#182F52]"
            title={displayName}
          >
            {displayName}
          </p>

          <p className="mt-1 break-all text-[10px] font-semibold tracking-[.02em] text-[#3268C8]">
            {member.ba_id || "N/A"}
          </p>

          {sideLabel && (
            <p className="mt-1 text-[10px] font-bold tracking-[.09em] text-[#71829A]">
              {sideLabel}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-[13px] border border-[#E7EDF5] bg-[#F7F9FD] p-3.5">
          <p className="text-[11px] font-medium text-[#8a92a6]">
            Left CV
          </p>
          <p className="mt-1 break-words text-[19px] font-extrabold tabular-nums tracking-tight text-[#182F52]">
            {formatCV(member.cv_left)}
          </p>
        </div>

        <div className="rounded-[13px] border border-[#E7EDF5] bg-[#F7F9FD] p-3.5">
          <p className="text-[11px] font-medium text-[#8a92a6]">
            Right CV
          </p>
          <p className="mt-1 break-words text-[19px] font-extrabold tabular-nums tracking-tight text-[#182F52]">
            {formatCV(member.cv_right)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[#8a92a6]">Floating Left</p>
          <p className="mt-1 text-[12px] font-semibold text-[#3955A6]">
            {formatCV(member.floating_cv_left)}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-[#8a92a6]">Floating Right</p>
          <p className="mt-1 text-[12px] font-semibold text-[#3955A6]">
            {formatCV(member.floating_cv_right)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleOpen();
        }}
        className="ml-auto mt-4 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[#295DB2] text-white shadow-[0_6px_12px_rgba(41,93,178,.16)] transition-all hover:bg-[#1D488F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#295DB2]"
        aria-label={`View ${displayName}'s branch`}
        title={`View ${displayName}'s branch`}
      >
        <Network size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
