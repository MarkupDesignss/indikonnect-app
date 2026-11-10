"use client";

import {
  Users,
  BarChart3,
  ChevronDown,
  RefreshCw,
  Minimize2,
  Maximize2,
  Fullscreen,
  Network,
  UserRound,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useGetDistributorGenealogyTreeQuery } from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

import type {
  GenealogyMember,
  DistributorGenealogyData,
} from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

import Loding from "@/components/common/Loding";

// --------------------------------------------------
// COLORS
// --------------------------------------------------
const NAVY = "#1a2332";

const BLUE = "#3c78e9";

const GREEN = "#17b963";

const PURPLE = "#a855f7";

const ORANGE = "#f97316";

const LINE = "#cbd5e1";

const LEVEL_COLORS = [PURPLE, BLUE, GREEN, ORANGE, "#0891b2", "#be185d"];

const MIN_ZOOM = 0.03; // Allow large trees to fit completely within the viewport
const MAX_ZOOM = 1.4;

const DEFAULT_ZOOM = 0.8;

// --------------------------------------------------
// TYPES
// --------------------------------------------------
interface GenealogyTreeNode {
  member: GenealogyMember;

  left: GenealogyTreeNode | null;

  right: GenealogyTreeNode | null;
}

type TreeSide = "root" | "left" | "right";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCV(value: string | number | null | undefined): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatStatus(value?: string | null): string {
  if (!value) return "N/A";

  return value

    .replace(/[_-]/g, " ")

    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function clampZoom(value: number): number {
  return Number(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)).toFixed(2));
}

// --------------------------------------------------
// BUILD TREE FROM API ROWS
// --------------------------------------------------
function buildGenealogyTree(
  root: GenealogyMember,

  rows: GenealogyMember[],
): GenealogyTreeNode {
  const childrenByParent = new Map<string, GenealogyMember[]>();

  rows.forEach((member) => {
    const parentBAId = member.binary_parent_ba_id;

    if (!parentBAId || !member.ba_id) {
      return;
    }

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
            child.ba_id !== member.ba_id && !nextAncestors.has(child.ba_id),
        ) ?? [];

    // Binary tree allows one member on each side.
    const leftMember = children.find(
      (child) => Number(child.binary_side) === 1,
    );

    const rightMember = children.find(
      (child) => Number(child.binary_side) === 2,
    );

    return {
      member,

      left: leftMember ? createNode(leftMember, nextAncestors) : null,

      right: rightMember ? createNode(rightMember, nextAncestors) : null,
    };
  }

  return createNode(root, new Set<string>());
}

// --------------------------------------------------
// LOADER
// --------------------------------------------------
function TreeLoader() {
  return (
    <div className="flex min-h-[350px] w-full items-center justify-center rounded-xl border border-[#edf0f3] bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loding />
      </div>
    </div>
  );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------
function StatCard({
  title,

  value,

  icon,

  color,

  background,
}: {
  title: string;

  value: string | number;

  icon: React.ReactNode;

  color: string;

  background: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-2 shadow-sm sm:gap-3 sm:p-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"

        style={{ backgroundColor: background, color }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#5a6276] sm:text-[12px]">
          {title}
        </p>

        <p
          className="mt-1 break-words text-[14px] font-semibold sm:text-[18px]"

          style={{ color }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// MEMBER NODE CARD
// --------------------------------------------------
function MemberNodeCard({
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

  const sideLabel =
    side === "left"
      ? "LEFT LEG"
      : side === "right"
        ? "RIGHT LEG"
        : "ROOT MEMBER";

  const sideColor = side === "left" ? GREEN : side === "right" ? ORANGE : BLUE;

  const levelColor = LEVEL_COLORS[member.level % LEVEL_COLORS.length];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${member.ba_id} branch (double-click or press Enter)`}
      title="Double-click / double-tap to see this member and all sub-branches"
      onDoubleClick={(event) => {
        event.stopPropagation();
        onOpenBranch(member.ba_id);
      }}
      onTouchEnd={(event) => {
        const now = Date.now();
        if (now - lastTapRef.current < 350) {
          event.preventDefault();
          event.stopPropagation();
          lastTapRef.current = 0;
          onOpenBranch(member.ba_id);
        } else {
          lastTapRef.current = now;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenBranch(member.ba_id);
        }
      }}
      style={{ transform: inverted ? "scaleY(-1)" : undefined }}
      className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3c78e9] w-[235px] shrink-0 rounded-[14px] border p-3 shadow-sm transition-shadow hover:shadow-md sm:w-[250px] sm:p-4 ${
        isRoot ? "border-[#3c78e9] bg-[#f0f4ff]" : "border-[#edf0f3] bg-white"
      }`}
    >
      {/* Member heading */}

      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"

          style={{
            backgroundColor: isRoot ? "#e1eaff" : "#edf3ff",

            color: sideColor,
          }}
        >
          {isRoot ? <Network size={21} /> : <UserRound size={21} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-all text-[13px] font-bold text-[#1a2332]">
            {member.ba_id}
          </p>

          <p className=" text-[10px] font-medium text-[#8a92a6]">{sideLabel}</p>
        </div>

        <span
          className="shrink-0 rounded-md px-2 py-1 text-[10px] font-bold"

          style={{
            color: levelColor,

            backgroundColor: `${levelColor}15`,
          }}
        >
          {isRoot ? "ROOT" : `L${member.level}`}
        </span>
      </div>

      {/* CV data */}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[#f7f8fa] p-2">
          <p className="text-[10px] font-medium text-[#8a92a6]">Left CV</p>

          <p className="mt-1 break-words text-[12px] font-bold text-[#1a2332]">
            {formatCV(member.cv_left)}
          </p>
        </div>

        <div className="rounded-lg bg-[#f7f8fa] p-2">
          <p className="text-[10px] font-medium text-[#8a92a6]">Right CV</p>

          <p className="mt-1 break-words text-[12px] font-bold text-[#1a2332]">
            {formatCV(member.cv_right)}
          </p>
        </div>
      </div>

      {/* Floating CV */}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-[#8a92a6]">Floating Left</p>

          <p className="mt-0.5 text-[11px] font-semibold text-[#3955A6]">
            {formatCV(member.floating_cv_left)}
          </p>
        </div>

        <div>
          <p className="text-[9px] text-[#8a92a6]">Floating Right</p>

          <p className="mt-0.5 text-[11px] font-semibold text-[#3955A6]">
            {formatCV(member.floating_cv_right)}
          </p>
        </div>
      </div>

      {/* Direct branch action: also works when double-click is intercepted by touch/drag devices. */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpenBranch(member.ba_id);
        }}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#cddcf7] bg-[#eff5ff] px-2 py-2 text-[11px] font-semibold text-[#2759b3] transition hover:bg-[#e3edff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3c78e9]"
        aria-label={`Open branch for ${member.ba_id}`}
      >
        <Network size={13} /> Open Branch
      </button>
    </div>
  );
}

// --------------------------------------------------
// EMPTY BINARY POSITION
// --------------------------------------------------
function EmptyBranch({
  side,
  inverted,
}: {
  side: TreeSide;
  inverted: boolean;
}) {
  return (
    <div
      style={{ transform: inverted ? "scaleY(-1)" : undefined }}
      className="flex min-h-[96px] w-[235px] shrink-0 flex-col items-center justify-center rounded-[14px] border border-dashed border-[#dce2ea] bg-[#fafcff] px-3 py-4 sm:w-[250px]"
    >
      <Users size={20} className="text-[#c0c7d2]" />

      <p className="mt-2 text-[11px] font-semibold text-[#8a92a6]">No member</p>

      <p className="mt-0.5 text-[10px] text-[#a0a8b6]">
        {side === "left" ? "Left position" : "Right position"}
      </p>
    </div>
  );
}

// --------------------------------------------------
// RECURSIVE TREE NODE
// Connectors are drawn per child, so lines always meet
// exactly at each card's centre, whatever the subtree width.
// --------------------------------------------------
function TreeNodeView({
  node,

  side,

  collapsed,

  inverted,
  onOpenBranch,
}: {
  node: GenealogyTreeNode;

  side: TreeSide;

  collapsed: boolean;

  inverted: boolean;
  onOpenBranch: (baId: string) => void;
}) {
  const hasChildren = Boolean(node.left || node.right);

  // Keep binary LEFT/RIGHT positions unchanged. The wrapper is flipped vertically
  // when inverted, and each card counter-flips so its text remains readable.
  const visualBranches: Array<{
    node: GenealogyTreeNode | null;
    side: TreeSide;
  }> = [
    { node: node.left, side: "left" },

    { node: node.right, side: "right" },
  ];

  return (
    <div className="flex shrink-0 flex-col items-center">
      <MemberNodeCard
        member={node.member}
        side={side}
        inverted={inverted}
        onOpenBranch={onOpenBranch}
      />

      {!collapsed && hasChildren && (
        <>
          {/* Vertical connector from parent down to the bar */}

          <div className="h-6 w-px" style={{ backgroundColor: LINE }} />

          <div className="flex items-start justify-center">
            {/* LEFT SLOT: position stays left, even when vertically inverted */}

            <div className="relative flex flex-col items-center px-3 pt-6 sm:px-4">
              {/* horizontal: centre -> right edge */}

              <div
                className="absolute left-1/2 right-0 top-0 h-px"

                style={{ backgroundColor: LINE }}
              />

              {/* vertical drop */}

              <div
                className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2"

                style={{ backgroundColor: LINE }}
              />

              {visualBranches[0].node ? (
                <TreeNodeView
                  node={visualBranches[0].node}
                  side={visualBranches[0].side}
                  collapsed={collapsed}
                  inverted={inverted}
                  onOpenBranch={onOpenBranch}
                />
              ) : (
                <EmptyBranch
                  side={visualBranches[0].side}
                  inverted={inverted}
                />
              )}
            </div>

            {/* RIGHT SLOT: position stays right, even when vertically inverted */}

            <div className="relative flex flex-col items-center px-3 pt-6 sm:px-4">
              {/* horizontal: left edge -> centre */}

              <div
                className="absolute left-0 right-1/2 top-0 h-px"

                style={{ backgroundColor: LINE }}
              />

              {/* vertical drop */}

              <div
                className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2"

                style={{ backgroundColor: LINE }}
              />

              {visualBranches[1].node ? (
                <TreeNodeView
                  node={visualBranches[1].node}
                  side={visualBranches[1].side}
                  collapsed={collapsed}
                  inverted={inverted}
                  onOpenBranch={onOpenBranch}
                />
              ) : (
                <EmptyBranch
                  side={visualBranches[1].side}
                  inverted={inverted}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------
// CV SUMMARY
// --------------------------------------------------
// --------------------------------------------------
// ZOOM CONTROL (sits beside Expand / Collapse)
// --------------------------------------------------
function ZoomControl({
  zoom,

  onZoomIn,

  onZoomOut,
}: {
  zoom: number;

  onZoomIn: () => void;

  onZoomOut: () => void;
}) {
  return (
    <div className="flex h-[34px] items-center overflow-hidden rounded-md border border-[#e5e9ef] bg-white">
      <button
        type="button"

        onClick={onZoomOut}

        disabled={zoom <= MIN_ZOOM}

        aria-label="Zoom out"

        className="flex h-full w-8 items-center justify-center text-[#1a2332] hover:bg-[#f5f6fa] disabled:opacity-40"
      >
        <Minus size={14} />
      </button>

      <span className="min-w-[48px] border-x border-[#edf0f3] px-2 text-center text-[12px] font-semibold tabular-nums text-[#1a2332]">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"

        onClick={onZoomIn}

        disabled={zoom >= MAX_ZOOM}

        aria-label="Zoom in"

        className="flex h-full w-8 items-center justify-center text-[#1a2332] hover:bg-[#f5f6fa] disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
const BinaryTree = () => {
  const {
    data: response,

    isLoading,

    isError,

    isFetching,

    refetch,
  } = useGetDistributorGenealogyTreeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [invertScroll, setInvertScroll] = useState(false);

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const [collapsed, setCollapsed] = useState(false);
  // Selected member acts as the root of the displayed subtree; full API tree remains intact.
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [branchHistory, setBranchHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const invertScrollRef = useRef(invertScroll);
  invertScrollRef.current = invertScroll;

  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });

  const treeViewportRef = useRef<HTMLDivElement>(null);

  const treeContentRef = useRef<HTMLDivElement>(null);

  const hasAutoFitted = useRef(false);

  const data = response?.data;

  // --------------------------------------------------
  // Build real hierarchy from API rows
  // --------------------------------------------------
  const tree = useMemo(() => {
    if (!data) return null;

    const root =
      data.root ??
      data.rows?.find((member) => member.level === 0) ??
      data.rows?.[0];

    if (!root) return null;

    return buildGenealogyTree(root, data.rows ?? []);
  }, [data]);

  // Index the complete loaded tree so search includes every API-supplied depth.
  const nodesById = useMemo(() => {
    const index = new Map<string, GenealogyTreeNode>();
    if (!tree) return index;
    const stack = [tree];
    while (stack.length) {
      const node = stack.pop()!;
      if (index.has(node.member.ba_id)) continue;
      index.set(node.member.ba_id, node);
      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }
    return index;
  }, [tree]);

  const currentRootId =
    activeRootId && nodesById.has(activeRootId)
      ? activeRootId
      : (tree?.member.ba_id ?? "");
  const displayedTree = nodesById.get(currentRootId) ?? tree;

  // Drill into any branch while keeping a navigation trail for Back and Full Tree.
  const openBranch = (baId: string) => {
    const target = nodesById.get(baId);
    if (!target) {
      setSearchError(
        "This BA ID is not in the currently loaded genealogy tree.",
      );
      return;
    }
    setSearchError("");
    setSearchQuery("");
    setSearchOpen(false);
    if (baId === currentRootId) return;
    setBranchHistory((previous) => [...previous, currentRootId]);
    setActiveRootId(baId);
    setCollapsed(false);
    setContentSize({ w: 0, h: 0 });
    hasAutoFitted.current = false;
  };

  const goBackBranch = () => {
    const previous = branchHistory[branchHistory.length - 1];
    if (!previous) return;
    setBranchHistory((history) => history.slice(0, -1));
    setActiveRootId(previous);
    setCollapsed(false);
    setContentSize({ w: 0, h: 0 });
    hasAutoFitted.current = false;
  };

  const showFullTree = () => {
    setActiveRootId(null);
    setBranchHistory([]);
    setSearchQuery("");
    setSearchError("");
    setSearchOpen(false);
    setCollapsed(false);
    setContentSize({ w: 0, h: 0 });
    hasAutoFitted.current = false;
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [...nodesById.values()].filter((node) =>
      node.member.ba_id.toLowerCase().includes(q),
    );
    return results
      .sort((a, b) => {
        const aExact = a.member.ba_id.toLowerCase() === q ? -1 : 0;
        const bExact = b.member.ba_id.toLowerCase() === q ? -1 : 0;
        return aExact - bExact || a.member.ba_id.localeCompare(b.member.ba_id);
      })
      .slice(0, 60);
  }, [nodesById, searchQuery]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // --------------------------------------------------

  // Dynamic level labels
  // --------------------------------------------------
  const maximumLevel = useMemo(() => {
    const rowMax = Math.max(
      0,

      ...(data?.rows ?? []).map((member) => member.level ?? 0),
    );

    return Math.max(rowMax, data?.depth ?? 0);
  }, [data]);

  const levels = useMemo(
    () =>
      Array.from({ length: maximumLevel + 1 }, (_, level) => ({
        level,

        label: level === 0 ? "Root level" : `Level ${level}`,

        color: LEVEL_COLORS[level % LEVEL_COLORS.length],
      })),

    [maximumLevel],
  );

  // --------------------------------------------------
  // Measure the real (unscaled) tree size so the scroll
  // area always matches the zoomed size.
  // --------------------------------------------------
  useEffect(() => {
    const element = treeContentRef.current;

    if (!element) return;

    const update = () =>
      setContentSize({
        w: element.offsetWidth,

        h: element.offsetHeight,
      });

    update();

    const observer = new ResizeObserver(update);

    observer.observe(element);

    return () => observer.disconnect();
  }, [displayedTree, collapsed, invertScroll]);

  // --------------------------------------------------
  // Wheel navigation: always allow natural vertical scrolling on smaller screens.
  // Horizontal panning is available through Shift + Wheel when the tree is wide.
  // --------------------------------------------------
  useEffect(() => {
    const viewport = treeViewportRef.current;

    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return; // preserve browser zoom
      if (event.shiftKey && viewport.scrollWidth > viewport.clientWidth) {
        event.preventDefault();

        viewport.scrollLeft += event.deltaY || event.deltaX;

        return;
      }

      // If the tree has vertical overflow, never convert down-scroll into sideways scroll.
      // Native touch scrolling and mouse wheels can reach lower hierarchy levels.
      if (viewport.scrollHeight > viewport.clientHeight + 1) return;

      // On desktop with no vertical overflow, use the wheel for wide-tree panning.
      if (
        window.matchMedia("(min-width: 1024px)").matches &&
        Math.abs(event.deltaY) > Math.abs(event.deltaX) &&
        viewport.scrollWidth > viewport.clientWidth + 1
      ) {
        event.preventDefault();

        viewport.scrollLeft += event.deltaY;
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", onWheel);
  }, [tree]);

  // Click-and-drag panning on desktop/trackpads. Touch devices retain native 2D swipe.
  const dragRef = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });

  const onTreePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const viewport = treeViewportRef.current;

    if (!viewport) return;

    dragRef.current = {
      active: true,

      x: event.clientX,

      y: event.clientY,

      left: viewport.scrollLeft,

      top: viewport.scrollTop,
    };
  };

  const onTreePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    const viewport = treeViewportRef.current;

    if (!drag.active || !viewport) return;

    const dx = event.clientX - drag.x;

    const dy = event.clientY - drag.y;

    if (Math.abs(dx) + Math.abs(dy) <= 4) return;

    if (!viewport.hasPointerCapture(event.pointerId)) {
      viewport.setPointerCapture(event.pointerId);
    }

    viewport.scrollLeft = drag.left - dx;

    viewport.scrollTop = drag.top - dy;
  };

  const onTreePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;

    const viewport = treeViewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
  };

  const scrollHierarchyDown = () => {
    treeViewportRef.current?.scrollBy({
      top: Math.max(240, treeViewportRef.current.clientHeight * 0.65),
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // --------------------------------------------------
  // Zoom
  // --------------------------------------------------
  const handleZoomIn = () => setZoom((current) => clampZoom(current + 0.1));

  const handleZoomOut = () => setZoom((current) => clampZoom(current - 0.1));

  // --------------------------------------------------
  // Fit tree into viewport
  // --------------------------------------------------
  const centerTreeInViewport = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewport = treeViewportRef.current;

        if (!viewport) return;

        viewport.scrollLeft = Math.max(
          0,
          (viewport.scrollWidth - viewport.clientWidth) / 2,
        );

        viewport.scrollTop = invertScrollRef.current
          ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
          : 0;
      });
    });
  };

  const handleFitToView = () => {
    const viewport = treeViewportRef.current;

    const element = treeContentRef.current;

    if (!viewport || !element) return;

    // Measure the true unscaled dimensions; both horizontal AND vertical space matter.
    const realWidth = Math.max(1, element.offsetWidth);

    const realHeight = Math.max(1, element.offsetHeight);

    const width = Math.max(1, viewport.clientWidth - 56);

    const height = Math.max(1, viewport.clientHeight - 56);

    const nextZoom = clampZoom(
      Math.min(1, width / realWidth, height / realHeight),
    );

    setZoom(nextZoom);

    centerTreeInViewport();
  };

  // Initial fit is performed only after the real tree has been measured.
  useEffect(() => {
    if (
      hasAutoFitted.current ||
      !displayedTree ||
      !contentSize.w ||
      !contentSize.h
    )
      return;

    hasAutoFitted.current = true;

    const frame = requestAnimationFrame(() => {
      // On phones preserve readable cards and let users scroll vertically/horizontally.
      // The Fit to View button remains available for an overview of the entire tree.
      if (window.matchMedia("(max-width: 767px)").matches) {
        setZoom(DEFAULT_ZOOM);

        centerTreeInViewport();
      } else {
        handleFitToView();
      }
    });

    return () => cancelAnimationFrame(frame);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedTree, contentSize.w, contentSize.h]);

  // Keep the displayed tree centered after manual zoom or an orientation change.
  useEffect(() => {
    if (!displayedTree) return;

    centerTreeInViewport();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, invertScroll]);

  const handleReset = () => {
    showFullTree();
    setInvertScroll(false);

    setCollapsed(false);

    // Refit after expanding, once the browser has calculated the new tree dimensions.
    requestAnimationFrame(() => requestAnimationFrame(() => handleFitToView()));
  };

  // --------------------------------------------------
  // Fullscreen
  // --------------------------------------------------
  const handleFullscreen = () => {
    const viewport = treeViewportRef.current;

    if (viewport?.requestFullscreen) {
      void viewport.requestFullscreen();
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (isLoading) {
    return <TreeLoader />;
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (isError || response?.success === false) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-[12px] border border-[#edf0f3] bg-white p-6 text-center">
        <AlertCircle className="h-9 w-9 text-[#dc3545]" />

        <h2 className="mt-3 text-[16px] font-bold text-[#1a2332]">
          Unable to load Binary Tree
        </h2>

        <p className="mt-1 max-w-md text-[13px] text-[#8a92a6]">
          The genealogy data could not be loaded. Please try again.
        </p>

        <button
          type="button"

          onClick={() => refetch()}

          className="mt-4 flex items-center gap-2 rounded-lg bg-[#1a2332] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#2c3a50]"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Empty response
  // --------------------------------------------------
  if (!data || !tree) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[12px] border border-[#edf0f3] bg-white p-6 text-center">
        <Network size={32} className="text-[#98a2b3]" />

        <p className="mt-3 text-[14px] font-semibold text-[#1a2332]">
          No genealogy data found
        </p>

        <button
          type="button"

          onClick={() => refetch()}

          className="mt-4 rounded-lg border border-[#e5e9ef] px-4 py-2 text-[12px] font-semibold text-[#1a2332] hover:bg-[#f7f8fa]"
        >
          Refresh
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Dynamic statistics
  // --------------------------------------------------
  const stats = [
    {
      title: "Total Members",

      value: formatCV(data.total_nodes ?? data.rows.length),

      icon: <Users size={22} />,

      color: BLUE,

      background: "#edf3ff",
    },

    {
      title: "Tree Levels",

      value: String(maximumLevel + 1),

      icon: <BarChart3 size={22} />,

      color: PURPLE,

      background: "#f3e8ff",
    },

    {
      title: "Weaker Leg",

      value: formatStatus(data.weaker_leg),

      icon: <Network size={22} />,

      color: NAVY,

      background: "#edf0f3",
    },
  ];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="w-full min-w-0 rounded-[12px] border border-[#edf0f3] bg-white p-3 shadow-sm sm:p-5">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a2332] sm:h-10 sm:w-10">
            <Network className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-[#1a2332] sm:text-[18px]">
              Binary Tree
            </h1>

            <p className="text-[10px] text-[#8a92a6] sm:text-[11px]">
              Visualize your downline structure and team hierarchy
            </p>
          </div>
        </div>

        {/* Controls */}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#5a6276]">
            ROOT ACCOUNT
          </span>

          <button
            type="button"
            onClick={showFullTree}
            title="Show original complete tree"
            className="flex h-[36px] max-w-full items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-3 hover:bg-[#f5f6fa]"
          >
            <span className="max-w-[185px] break-all text-[12px] font-semibold text-[#1a2332]">
              {currentRootId || "N/A"}
            </span>

            <ChevronDown size={14} className="shrink-0 text-[#8a92a6]" />
          </button>

          {/* Search any BA ID across all loaded hierarchy levels */}
          <div ref={searchRef} className="relative w-full sm:w-[270px]">
            <div className="flex h-[36px] items-center gap-2 rounded-[7px] border border-[#dce3ed] bg-white px-2.5 focus-within:border-[#3c78e9]">
              <Search size={15} className="shrink-0 text-[#64748b]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                  setSearchError("");
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    const exact = nodesById.get(searchQuery.trim());
                    const match = exact ?? searchResults[0];
                    if (match) openBranch(match.member.ba_id);
                    else if (searchQuery.trim())
                      setSearchError("BA ID not found in the loaded tree.");
                  }
                  if (event.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search any level BA ID"
                aria-label="Search BA ID across all levels"
                className="min-w-0 w-full bg-transparent text-[12px] outline-none placeholder:text-[#94a3b8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                    setSearchError("");
                  }}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {searchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-[40px] z-50 max-h-[300px] overflow-y-auto rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-xl">
                {searchResults.length ? (
                  searchResults.map((node) => (
                    <button
                      key={node.member.ba_id}
                      type="button"
                      onClick={() => openBranch(node.member.ba_id)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left hover:bg-[#eff5ff]"
                    >
                      <span className="min-w-0 truncate text-[12px] font-semibold text-[#1a2332]">
                        {node.member.ba_id}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#64748b]">
                        Level {node.member.level}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-[12px] text-[#64748b]">
                    No matching BA ID in loaded tree.
                  </div>
                )}
                {searchResults.length === 60 && (
                  <div className="px-3 py-2 text-[10px] text-[#64748b]">
                    Showing first 60 matches. Type more characters to narrow
                    results.
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"

            onClick={() => refetch()}

            disabled={isFetching}

            className="flex h-[36px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-3 text-[12px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"

            onClick={() => setInvertScroll((value) => !value)}

            aria-pressed={invertScroll}

            aria-label={
              invertScroll
                ? "Restore root at top"
                : "Invert hierarchy vertically with root at bottom"
            }

            title={
              invertScroll
                ? "Root at bottom, descendants above. Click to restore."
                : "Flip the tree top-to-bottom while keeping left and right legs unchanged."
            }

            className="flex h-[36px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-3"
          >
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                invertScroll ? "bg-[#1a2332]" : "bg-[#e5e9ef]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                  invertScroll ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>

            <span className="whitespace-nowrap text-[11px] font-medium text-[#1a2332]">
              Invert Scroll
            </span>
          </button>
        </div>
      </div>

      {/* ================= STATISTICS ================= */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <StatCard
            key={item.title}

            title={item.title}

            value={item.value}

            icon={item.icon}

            color={item.color}

            background={item.background}
          />
        ))}
      </div>

      {/* ================= CV SUMMARY ================= */}

      {/* ================= MAIN CONTENT ================= */}

      <div className="mt-6 flex min-w-0 flex-col gap-4 xl:flex-row">
        {/* LEVELS PANEL */}

        <aside className="w-full shrink-0 rounded-[12px] border border-[#edf0f3] bg-white p-4 xl:w-[185px]">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#1a2332]">
            Levels
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {levels.map((level) => (
              <div key={level.level} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"

                  style={{ backgroundColor: level.color }}
                >
                  {level.level}
                </span>

                <span className="text-[12px] font-medium text-[#5a6276]">
                  {level.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-[#edf0f3] pt-4">
            <p className="text-[11px] text-[#8a92a6]">Total nodes</p>

            <p className="mt-1 text-[21px] font-bold text-[#1a2332]">
              {data.total_nodes ?? data.rows.length}
            </p>

            <p className="mt-3 text-[11px] text-[#8a92a6]">Maximum depth</p>

            <p className="mt-1 text-[16px] font-bold text-[#3c78e9]">
              {data.depth ?? maximumLevel}
            </p>

            <p className="mt-3 text-[11px] text-[#8a92a6]">Weaker leg</p>

            <p className="mt-1 text-[13px] font-bold text-[#1a2332]">
              {formatStatus(data.weaker_leg)}
            </p>
          </div>
        </aside>

        {/* TREE VIEWPORT */}

        <div className="min-w-0 flex-1">
          {/* ---------- Toolbar: zoom sits beside Expand / Collapse ---------- */}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[12px] border border-[#edf0f3] bg-[#fafcff] px-3 py-3 sm:px-4">
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-[#1a2332]">
                Team hierarchy
              </h3>

              <p className="mt-1 break-all text-[11px] text-[#8a92a6]">
                {currentRootId || "Root account"} · {nodesById.size} members in
                loaded tree
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* On compact screens, jump down through the hierarchy with one tap. */}

              <button
                type="button"

                onClick={scrollHierarchyDown}

                className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa] lg:hidden"

                aria-label="Scroll down the team hierarchy"
              >
                <ChevronDown size={15} /> Scroll Down
              </button>

              {branchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={goBackBranch}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[#dce3ed] bg-white px-3 text-[11px] font-semibold hover:bg-[#f5f6fa]"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {currentRootId !== tree.member.ba_id && (
                <button
                  type="button"
                  onClick={showFullTree}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[#dce3ed] bg-white px-3 text-[11px] font-semibold hover:bg-[#f5f6fa]"
                >
                  <Network size={14} /> Full Tree
                </button>
              )}
              <ZoomControl
                zoom={zoom}

                onZoomIn={handleZoomIn}

                onZoomOut={handleZoomOut}
              />

              <span className="hidden h-6 w-px bg-[#e5e9ef] sm:block" />

              <button
                type="button"

                onClick={() => setCollapsed(false)}

                disabled={!collapsed}

                className="flex h-[34px] items-center gap-1.5 rounded-md border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa] disabled:opacity-40"
              >
                <Maximize2 size={13} />
                Expand All
              </button>

              <button
                type="button"

                onClick={() => setCollapsed(true)}

                disabled={collapsed}

                className="flex h-[34px] items-center gap-1.5 rounded-md border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa] disabled:opacity-40"
              >
                <Minimize2 size={13} />
                Collapse All
              </button>

              <button
                type="button"

                onClick={handleFitToView}

                className="flex h-[34px] items-center gap-1.5 rounded-md border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa]"
              >
                <Fullscreen size={13} />
                Fit to View
              </button>
            </div>
          </div>

          {/* Current branch and drill-down navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-x border-[#edf0f3] bg-[#f8fbff] px-4 py-2 text-[11px]">
            <div className="flex min-w-0 flex-wrap items-center gap-1 text-[#64748b]">
              <Network size={13} /> <span>Viewing:</span>
              <strong className="break-all text-[#1a2332]">
                {currentRootId}
              </strong>
              {currentRootId !== tree.member.ba_id && (
                <span className="rounded bg-[#e6efff] px-2 py-0.5 font-semibold text-[#365eb2]">
                  Subtree
                </span>
              )}
            </div>
            <span className="text-[#64748b]">
              Double-click a member (double-tap on mobile) to open their branch
            </span>
          </div>
          {searchError && (
            <p
              role="alert"
              className="border-x border-[#edf0f3] px-4 py-2 text-[11px] text-red-600"
            >
              {searchError}
            </p>
          )}

          {/* ---------- Scrollable canvas ---------- */}

          <div
            ref={treeViewportRef}

            onPointerDown={onTreePointerDown}

            onPointerMove={onTreePointerMove}

            onPointerUp={onTreePointerUp}

            onPointerCancel={onTreePointerUp}

            title="Double-click any member card to open its branch"

            className="max-w-full overflow-auto overscroll-contain rounded-b-[12px] border-x border-b border-[#edf0f3] bg-white p-5 sm:p-8"

            style={{
              height: "clamp(360px, 65vh, 760px)",

              WebkitOverflowScrolling: "touch",

              touchAction: "pan-x pan-y",

              maxHeight: "760px",

              backgroundImage: "radial-gradient(#e6eaf0 1px, transparent 1px)",

              backgroundSize: "18px 18px",
            }}
          >
            {/* Sized to the zoomed tree so scrollbars are accurate */}

            <div
              className="mx-auto"

              style={{
                width: contentSize.w ? contentSize.w * zoom : undefined,

                height: contentSize.h ? contentSize.h * zoom : undefined,

                // Flip all connector geometry vertically without swapping the legs.
                transform: invertScroll ? "scaleY(-1)" : undefined,
              }}
            >
              <div
                ref={treeContentRef}

                className="w-max pb-2"

                style={{
                  transform: `scale(${zoom})`,

                  transformOrigin: "top left",
                }}
              >
                <TreeNodeView
                  node={displayedTree!}
                  side="root"
                  collapsed={collapsed}
                  inverted={invertScroll}
                  onOpenBranch={openBranch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LEGEND ================= */}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
        <span className="text-[12px] font-bold text-[#1a2332]">LEGEND</span>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#3c78e9]" />

          <span className="text-[11px] text-[#5a6276]">Root member</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#17b963]" />

          <span className="text-[11px] text-[#5a6276]">Left leg</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f97316]" />

          <span className="text-[11px] text-[#5a6276]">Right leg</span>
        </div>

        <div className="ml-auto">
          <button
            type="button"

            onClick={handleReset}

            className="flex items-center gap-2 rounded-md border border-[#e5e9ef] bg-white px-3 py-2 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa]"
          >
            <RefreshCw size={13} />
            Reset View
          </button>
        </div>
      </div>

      {/* ================= API REFRESH STATUS ================= */}

      {isFetching && (
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] font-medium text-[#8a92a6]">
          <Loader2 size={13} className="animate-spin" />
          Updating genealogy tree...
        </div>
      )}
    </div>
  );
};

export default BinaryTree;
