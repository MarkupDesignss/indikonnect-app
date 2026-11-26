"use client";

import { Users, Plus, Minus } from "lucide-react";
import type { GenealogyMember } from "@/lib/redux/api/distributor/distributorGenealogyApi";
import Loding from "@/components/common/Loding";


// --------------------------------------------------
// COLORS
// --------------------------------------------------

export const BLUE = "#3268C8";

export const GREEN = "#0E9F75";

export const ORANGE = "#E78A35";

export const LINE = "#B9CBE3";


// --------------------------------------------------
// ZOOM CONFIGURATION
// --------------------------------------------------

export const MIN_ZOOM = 0.03;

export const MAX_ZOOM = 1.8;

export const DEFAULT_ZOOM = 0.8;


// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface GenealogyTreeNode {
  member: GenealogyMember;
  left: GenealogyTreeNode | null;
  right: GenealogyTreeNode | null;
}


export type GenealogyMemberWithMeta = GenealogyMember & {
  full_name?: string | null;
  display_ba_id?: string | null;
  tc_label?: string | null;
  tc_sequence?: number | string | null;
};


export type TreeSide = "root" | "left" | "right";


export interface TreeSize {
  w: number;
  h: number;
}


export interface DragState {
  active: boolean;
  moved: boolean;
  x: number;
  y: number;
  left: number;
  top: number;
}


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

export function toNumber(
  value: string | number | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}


export function formatCV(
  value: string | number | null | undefined,
): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}


export function getMemberName(member: GenealogyMember): string {
  const namedMember = member as GenealogyMemberWithMeta;
  return namedMember.full_name?.trim() || "Unknown Member";
}


export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}


export function clampZoom(value: number): number {
  return Number(
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)).toFixed(2),
  );
}


/**
 * Gets the base/display BA ID from the root BA ID when the API does not
 * provide display_ba_id. Example: AIA1675197-001 -> AIA1675197.
 */
export function deriveDisplayBaId(baId?: string | null): string {
  if (!baId) return "";

  return baId.match(/^(.*?)-\d+(?:-\d+)*$/)?.[1] || baId;
}


// --------------------------------------------------
// BUILD TREE FROM API ROWS
// --------------------------------------------------

export function buildGenealogyTree(
  root: GenealogyMember,
  rows: GenealogyMember[],
): GenealogyTreeNode {
  const childrenByParent = new Map<string, GenealogyMember[]>();

  rows.forEach((member) => {
    const parentBAId = member.binary_parent_ba_id;

    if (!parentBAId || !member.ba_id) return;

    const existing = childrenByParent.get(parentBAId) ?? [];
    existing.push(member);
    childrenByParent.set(parentBAId, existing);
  });

  function createNode(
    member: GenealogyMember,
    ancestors: Set<string>,
  ): GenealogyTreeNode {
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(member.ba_id);

    const children =
      childrenByParent
        .get(member.ba_id)
        ?.filter(
          (child) =>
            child.ba_id !== member.ba_id &&
            !nextAncestors.has(child.ba_id),
        ) ?? [];

    const leftMember = children.find(
      (child) => Number(child.binary_side) === 1,
    );

    const rightMember = children.find(
      (child) => Number(child.binary_side) === 2,
    );

    return {
      member,
      left: leftMember
        ? createNode(leftMember, nextAncestors)
        : null,
      right: rightMember
        ? createNode(rightMember, nextAncestors)
        : null,
    };
  }

  return createNode(root, new Set<string>());
}


// --------------------------------------------------
// LOADER
// --------------------------------------------------

export function TreeLoader() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center rounded-xl border border-[#edf0f3] bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loding />
      </div>
    </div>
  );
}


// --------------------------------------------------
// EMPTY BINARY POSITION
// --------------------------------------------------

export function EmptyBranch({
  side,
  inverted,
}: {
  side: TreeSide;
  inverted: boolean;
}) {
  return (
    <div
      style={{
        transform: inverted ? "scaleY(-1)" : undefined,
      }}
      className="flex min-h-[125px] w-[272px] shrink-0 flex-col items-center justify-center rounded-[17px] border-2 border-dashed border-[#D8E4F1] bg-[#F9FBFE] px-4 py-5 sm:w-[296px]"
    >
      <Users size={23} className="text-[#c0c7d2]" />

      <p className="mt-2 text-[12px] font-semibold text-[#8a92a6]">
        Position available
      </p>

      <p className="mt-1 text-[11px] text-[#a0a8b6]">
        {side === "left" ? "Left position" : "Right position"}
      </p>
    </div>
  );
}


// --------------------------------------------------
// ZOOM CONTROL
// --------------------------------------------------

export function ZoomControl({
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="flex h-[42px] items-center overflow-hidden rounded-[11px] border border-[#DCE5F0] bg-white shadow-sm">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
        className="flex h-full w-10 items-center justify-center text-[#233E64] hover:bg-[#EEF4FC] disabled:opacity-40"
      >
        <Minus size={15} />
      </button>

      <span className="min-w-[60px] border-x border-[#E6EDF6] px-2 text-center text-[12px] font-extrabold tabular-nums text-[#1B355A]">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Zoom in"
        className="flex h-full w-10 items-center justify-center text-[#233E64] hover:bg-[#EEF4FC] disabled:opacity-40"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
