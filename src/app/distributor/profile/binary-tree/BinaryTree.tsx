"use client";

import {
  Users,
  BarChart3,
  MoveHorizontal,
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
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  useGetDistributorGenealogyTreeQuery,
} from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

import type {
  GenealogyMember,
  DistributorGenealogyData,
} from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

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

const MIN_ZOOM = 0.3;
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
        <Loader2 className="h-8 w-8 animate-spin text-[#3c78e9]" />

        <p className="text-[13px] font-semibold text-[#667085]">
          Loading genealogy tree...
        </p>
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
}: {
  member: GenealogyMember;
  side: TreeSide;
}) {
  const isRoot = side === "root";

  const sideLabel =
    side === "left" ? "LEFT LEG" : side === "right" ? "RIGHT LEG" : "ROOT MEMBER";

  const sideColor = side === "left" ? GREEN : side === "right" ? ORANGE : BLUE;

  const levelColor = LEVEL_COLORS[member.level % LEVEL_COLORS.length];

  return (
    <div
      className={`w-[235px] shrink-0 rounded-[14px] border p-3 shadow-sm transition-shadow hover:shadow-md sm:w-[250px] sm:p-4 ${
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

          <p className=" text-[10px] font-medium text-[#8a92a6]">
            {sideLabel}
          </p>
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
    </div>
  );
}

// --------------------------------------------------
// EMPTY BINARY POSITION
// --------------------------------------------------

function EmptyBranch({ side }: { side: TreeSide }) {
  return (
    <div className="flex min-h-[96px] w-[235px] shrink-0 flex-col items-center justify-center rounded-[14px] border border-dashed border-[#dce2ea] bg-[#fafcff] px-3 py-4 sm:w-[250px]">
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
}: {
  node: GenealogyTreeNode;
  side: TreeSide;
  collapsed: boolean;
}) {
  const hasChildren = Boolean(node.left || node.right);

  return (
    <div className="flex shrink-0 flex-col items-center">
      <MemberNodeCard member={node.member} side={side} />

      {!collapsed && hasChildren && (
        <>
          {/* Vertical connector from parent down to the bar */}
          <div className="h-6 w-px" style={{ backgroundColor: LINE }} />

          <div className="flex items-start justify-center">
            {/* LEFT CHILD */}
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

              {node.left ? (
                <TreeNodeView
                  node={node.left}
                  side="left"
                  collapsed={collapsed}
                />
              ) : (
                <EmptyBranch side="left" />
              )}
            </div>

            {/* RIGHT CHILD */}
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

              {node.right ? (
                <TreeNodeView
                  node={node.right}
                  side="right"
                  collapsed={collapsed}
                />
              ) : (
                <EmptyBranch side="right" />
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

function CVSummary({ data }: { data: DistributorGenealogyData }) {
  const items = [
    { label: "Settled Left CV", value: data.cv_settled_left, color: BLUE },
    { label: "Settled Right CV", value: data.cv_settled_right, color: PURPLE },
    { label: "Floating Left CV", value: data.cv_floating_left, color: GREEN },
    { label: "Floating Right CV", value: data.cv_floating_right, color: ORANGE },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[10px] border border-[#edf0f3] bg-white p-3"
        >
          <p className="text-[11px] font-medium text-[#667085]">{item.label}</p>

          <p
            className="mt-1 break-words text-[17px] font-bold"
            style={{ color: item.color }}
          >
            {formatCV(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

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
  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });

  const treeViewportRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);
  const hasAutoFitted = useRef(false);
  const invertScrollRef = useRef(false);

  invertScrollRef.current = invertScroll;

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
  }, [tree, collapsed]);

  // --------------------------------------------------
  // Mouse wheel pans a wide tree sideways
  // --------------------------------------------------

  useEffect(() => {
    const viewport = treeViewportRef.current;

    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      if (
        Math.abs(event.deltaY) > Math.abs(event.deltaX) &&
        viewport.scrollWidth > viewport.clientWidth
      ) {
        event.preventDefault();

        viewport.scrollLeft +=
          event.deltaY * (invertScrollRef.current ? -1 : 1);
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", onWheel);
  }, [tree]);

  // --------------------------------------------------
  // Zoom
  // --------------------------------------------------

  const handleZoomIn = () => setZoom((current) => clampZoom(current + 0.1));

  const handleZoomOut = () => setZoom((current) => clampZoom(current - 0.1));

  // --------------------------------------------------
  // Fit tree into viewport
  // --------------------------------------------------

  const handleFitToView = () => {
    const viewport = treeViewportRef.current;

    if (!viewport || !contentSize.w) {
      setZoom(DEFAULT_ZOOM);
      return;
    }

    const availableWidth = Math.max(200, viewport.clientWidth - 64);

    setZoom(clampZoom(Math.min(1, availableWidth / contentSize.w)));

    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  };

  // First impression: fit the whole tree automatically once.
  useEffect(() => {
    if (hasAutoFitted.current || !contentSize.w) return;

    hasAutoFitted.current = true;
    handleFitToView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentSize.w]);

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const handleReset = () => {
    setInvertScroll(false);
    setCollapsed(false);
    handleFitToView();
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
      title: "Left Volume",
      value: formatCV(data.left_volume),
      icon: <MoveHorizontal size={22} />,
      color: GREEN,
      background: "#e8faef",
    },
    {
      title: "Right Volume",
      value: formatCV(data.right_volume),
      icon: <MoveHorizontal size={22} />,
      color: ORANGE,
      background: "#fff4e0",
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

          <div className="flex h-[36px] max-w-full items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-3">
            <span className="max-w-[185px] break-all text-[12px] font-semibold text-[#1a2332]">
              {data.root?.ba_id ?? "N/A"}
            </span>

            <ChevronDown size={14} className="shrink-0 text-[#8a92a6]" />
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

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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

      <CVSummary data={data} />

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
                {data.root?.ba_id ?? "Root account"} ·{" "}
                {data.total_nodes ?? data.rows.length} members
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

          {/* ---------- Scrollable canvas ---------- */}
          <div
            ref={treeViewportRef}
            onDoubleClick={handleFullscreen}
            title="Double-click for fullscreen"
            className="max-w-full overflow-auto rounded-b-[12px] border-x border-b border-[#edf0f3] bg-white p-5 sm:p-8"
            style={{
              minHeight: "420px",
              maxHeight: "760px",
              backgroundImage:
                "radial-gradient(#e6eaf0 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            {/* Sized to the zoomed tree so scrollbars are accurate */}
            <div
              className="mx-auto"
              style={{
                width: contentSize.w ? contentSize.w * zoom : undefined,
                height: contentSize.h ? contentSize.h * zoom : undefined,
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
                <TreeNodeView node={tree} side="root" collapsed={collapsed} />
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