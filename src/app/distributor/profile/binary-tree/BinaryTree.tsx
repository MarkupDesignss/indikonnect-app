"use client";

import {
  Users,
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

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  useGetDistributorGenealogyTreeQuery,
} from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

import type {
  GenealogyMember,
} from "../../../../lib/redux/api/distributor/distributorGenealogyApi";

import Loding from "@/components/common/Loding";

// --------------------------------------------------
// COLORS
// --------------------------------------------------

const BLUE = "#3268C8";
const GREEN = "#0E9F75";
const ORANGE = "#E78A35";
const LINE = "#B9CBE3";

// --------------------------------------------------
// ZOOM CONFIGURATION
// --------------------------------------------------

const MIN_ZOOM = 0.03;
const MAX_ZOOM = 1.8;
const DEFAULT_ZOOM = 0.8;

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface GenealogyTreeNode {
  member: GenealogyMember;
  left: GenealogyTreeNode | null;
  right: GenealogyTreeNode | null;
}

type GenealogyMemberWithMeta = GenealogyMember & {
  full_name?: string | null;
  display_ba_id?: string | null;
  tc_label?: string | null;
  tc_sequence?: number | string | null;
};

type TreeSide = "root" | "left" | "right";

interface TreeSize {
  w: number;
  h: number;
}

interface DragState {
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

function toNumber(
  value: string | number | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCV(
  value: string | number | null | undefined,
): string {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function getMemberName(member: GenealogyMember): string {
  const namedMember = member as GenealogyMemberWithMeta;
  return namedMember.full_name?.trim() || "Unknown Member";
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function clampZoom(value: number): number {
  return Number(
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)).toFixed(2),
  );
}

/**
 * Gets the base/display BA ID from the root BA ID when the API does not
 * provide display_ba_id. Example: AIA1675197-001 -> AIA1675197.
 */
function deriveDisplayBaId(baId?: string | null): string {
  if (!baId) return "";

  return baId.match(/^(.*?)-\d+(?:-\d+)*$/)?.[1] || baId;
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

function TreeLoader() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center rounded-xl border border-[#edf0f3] bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loding />
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
// RECURSIVE TREE NODE
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
          <div
            className="h-8 w-px"
            style={{ backgroundColor: LINE }}
          />

          <div className="flex items-start justify-center">
            <div className="relative flex flex-col items-center px-4 pt-8 sm:px-5">
              <div
                className="absolute left-1/2 right-0 top-0 h-px"
                style={{ backgroundColor: LINE }}
              />

              <div
                className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2"
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

            <div className="relative flex flex-col items-center px-4 pt-8 sm:px-5">
              <div
                className="absolute left-0 right-1/2 top-0 h-px"
                style={{ backgroundColor: LINE }}
              />

              <div
                className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2"
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
// ZOOM CONTROL
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

  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [branchHistory, setBranchHistory] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState("");

  // TC dropdown state.
  const [rootDropdownOpen, setRootDropdownOpen] = useState(false);

  const [contentSize, setContentSize] = useState<TreeSize>({
    w: 0,
    h: 0,
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const rootDropdownRef = useRef<HTMLDivElement>(null);
  const treeViewportRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);

  const invertScrollRef = useRef(invertScroll);

  const dragRef = useRef<DragState>({
    active: false,
    moved: false,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
  });

  const data = response?.data;

  useEffect(() => {
    invertScrollRef.current = invertScroll;
  }, [invertScroll]);

  // --------------------------------------------------
  // ROOT META + DISPLAY BA ID + TC OPTIONS
  // --------------------------------------------------

  const rootMeta = data?.root as GenealogyMemberWithMeta | undefined;

  const displayBaId =
    rootMeta?.display_ba_id?.trim() ||
    deriveDisplayBaId(rootMeta?.ba_id);

  // The requested full_name is displayed where VIEW ROOT was shown.
  const rootDisplayName = rootMeta
    ? getMemberName(rootMeta)
    : "Unknown Member";

  /**
   * TC dropdown includes rows whose BA ID is either exactly the display BA ID
   * or starts with `${display_ba_id}-`. Only rows carrying a TC label are shown.
   */
  const rootTCOptions = useMemo(() => {
    if (!data || !displayBaId) return [];

    const rows: GenealogyMemberWithMeta[] = [
      ...((data.rows ?? []) as GenealogyMemberWithMeta[]),
    ];

    // Include root if the API does not also include it in rows.
    if (
      data.root &&
      !rows.some((member) => member.ba_id === data.root?.ba_id)
    ) {
      rows.unshift(data.root as GenealogyMemberWithMeta);
    }

    const matchingMembers = rows.filter((member) => {
      const baId = member.ba_id?.trim() || "";
      const tcLabel = member.tc_label?.trim();

      return (
        Boolean(tcLabel) &&
        (baId === displayBaId || baId.startsWith(`${displayBaId}-`))
      );
    });

    // Avoid duplicate BA IDs in the dropdown.
    const uniqueMembers = Array.from(
      new Map(
        matchingMembers.map((member) => [member.ba_id, member]),
      ).values(),
    );

    return uniqueMembers.sort((a, b) => {
      const sequenceA = Number(
        a.tc_sequence ?? Number.MAX_SAFE_INTEGER,
      );
      const sequenceB = Number(
        b.tc_sequence ?? Number.MAX_SAFE_INTEGER,
      );

      if (sequenceA !== sequenceB) {
        return sequenceA - sequenceB;
      }

      return (a.tc_label || "").localeCompare(b.tc_label || "");
    });
  }, [data, displayBaId]);

  // --------------------------------------------------
  // BUILD TREE
  // --------------------------------------------------

  const tree = useMemo(() => {
    if (!data) return null;

    const rows = data.rows ?? [];
    const root =
      data.root ??
      rows.find((member) => Number(member.level) === 0) ??
      rows[0];

    if (!root) return null;

    return buildGenealogyTree(root, rows);
  }, [data]);

  // --------------------------------------------------
  // INDEX ALL LOADED MEMBERS
  // --------------------------------------------------

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

  const currentRootMember =
    nodesById.get(currentRootId)?.member ?? tree?.member;

  const currentRootTC =
    (currentRootMember as GenealogyMemberWithMeta | undefined)
      ?.tc_label || "Select TC";

  // --------------------------------------------------
  // SEARCH: NAME + BA ID
  // --------------------------------------------------

  const searchResults = useMemo(() => {
    const query = normalizeSearch(searchQuery);

    if (!query) return [];

    const allNodes = [...nodesById.values()];

    const results = allNodes.filter((node) => {
      const memberName = normalizeSearch(getMemberName(node.member));
      const baId = normalizeSearch(node.member.ba_id || "");

      return memberName.includes(query) || baId.includes(query);
    });

    // Exact BA ID first, then exact name, then partial matches.
    return results
      .sort((a, b) => {
        const aId = normalizeSearch(a.member.ba_id || "");
        const bId = normalizeSearch(b.member.ba_id || "");
        const aName = normalizeSearch(getMemberName(a.member));
        const bName = normalizeSearch(getMemberName(b.member));

        const aPriority =
          aId === query ? 0 : aName === query ? 1 : 2;
        const bPriority =
          bId === query ? 0 : bName === query ? 1 : 2;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return aName.localeCompare(bName);
      })
      .slice(0, 60);
  }, [nodesById, searchQuery]);

  // --------------------------------------------------
  // CLOSE SEARCH DROPDOWN
  // --------------------------------------------------

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
  // CLOSE TC DROPDOWN
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        rootDropdownRef.current &&
        !rootDropdownRef.current.contains(event.target as Node)
      ) {
        setRootDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // --------------------------------------------------
  // CENTER TREE
  // --------------------------------------------------

  const centerTreeInViewport = useCallback(() => {
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
  }, []);

  // --------------------------------------------------
  // OPEN MEMBER BRANCH
  // --------------------------------------------------

  const openBranch = useCallback(
    (baId: string) => {
      const target = nodesById.get(baId);

      if (!target) {
        setSearchError(
          "This BA ID is not in the currently loaded genealogy tree.",
        );
        setRootDropdownOpen(false);
        return;
      }

      setSearchError("");
      setSearchQuery("");
      setSearchOpen(false);
      setRootDropdownOpen(false);

      if (baId === currentRootId) {
        centerTreeInViewport();
        return;
      }

      setBranchHistory((previous) => [...previous, currentRootId]);
      setActiveRootId(baId);
      setCollapsed(false);
      setZoom(DEFAULT_ZOOM);
      setContentSize({ w: 0, h: 0 });
    }, [nodesById, currentRootId, centerTreeInViewport],
  );

  // --------------------------------------------------
  // BACK NAVIGATION
  // --------------------------------------------------

  const goBackBranch = () => {
    const previous = branchHistory[branchHistory.length - 1];
    if (!previous) return;

    setBranchHistory((history) => history.slice(0, -1));
    setActiveRootId(previous);
    setCollapsed(false);
    setZoom(DEFAULT_ZOOM);
    setContentSize({ w: 0, h: 0 });
  };

  // --------------------------------------------------
  // SHOW FULL TREE
  // --------------------------------------------------

  const showFullTree = () => {
    setActiveRootId(null);
    setBranchHistory([]);
    setSearchQuery("");
    setSearchError("");
    setSearchOpen(false);
    setRootDropdownOpen(false);
    setCollapsed(false);
    setZoom(DEFAULT_ZOOM);
    setContentSize({ w: 0, h: 0 });
    centerTreeInViewport();
  };

  // --------------------------------------------------
  // MEASURE TREE SIZE
  // --------------------------------------------------

  useEffect(() => {
    const element = treeContentRef.current;
    if (!element) return;

    const update = () => {
      const nextWidth = element.offsetWidth;
      const nextHeight = element.offsetHeight;

      setContentSize((previous) => {
        if (
          previous.w === nextWidth &&
          previous.h === nextHeight
        ) {
          return previous;
        }

        return {
          w: nextWidth,
          h: nextHeight,
        };
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [displayedTree, collapsed]);

  // --------------------------------------------------
  // WHEEL NAVIGATION
  // --------------------------------------------------

  useEffect(() => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;

      if (
        event.shiftKey &&
        viewport.scrollWidth > viewport.clientWidth
      ) {
        event.preventDefault();
        viewport.scrollLeft += event.deltaY || event.deltaX;
        return;
      }

      if (viewport.scrollHeight > viewport.clientHeight + 1) {
        return;
      }

      if (
        window.matchMedia("(min-width: 1024px)").matches &&
        Math.abs(event.deltaY) > Math.abs(event.deltaX) &&
        viewport.scrollWidth > viewport.clientWidth + 1
      ) {
        event.preventDefault();
        viewport.scrollLeft += event.deltaY;
      }
    };

    viewport.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => viewport.removeEventListener("wheel", onWheel);
  }, [displayedTree]);

  // --------------------------------------------------
  // MOUSE DRAG PANNING
  // --------------------------------------------------

  const onTreePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;

    if (
      target.closest(
        "button, input, select, textarea, [role='button']",
      )
    ) {
      return;
    }

    const viewport = treeViewportRef.current;
    if (!viewport) return;

    dragRef.current = {
      active: true,
      moved: false,
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
  };

  const onTreePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = dragRef.current;
    const viewport = treeViewportRef.current;

    if (!drag.active || !viewport) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (!drag.moved && Math.abs(dx) + Math.abs(dy) <= 4) {
      return;
    }

    drag.moved = true;

    if (!viewport.hasPointerCapture(event.pointerId)) {
      viewport.setPointerCapture(event.pointerId);
    }

    viewport.scrollLeft = drag.left - dx;
    viewport.scrollTop = drag.top - dy;
  };

  const onTreePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    dragRef.current.active = false;

    const viewport = treeViewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  // --------------------------------------------------
  // SCROLL DOWN
  // --------------------------------------------------

  const scrollHierarchyDown = () => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      top: Math.max(240, viewport.clientHeight * 0.65),
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // ZOOM
  // --------------------------------------------------

  const handleZoomIn = () => {
    setZoom((current) => clampZoom(current + 0.1));
  };

  const handleZoomOut = () => {
    setZoom((current) => clampZoom(current - 0.1));
  };

  // --------------------------------------------------
  // FIT TO VIEW
  // --------------------------------------------------

  const handleFitToView = () => {
    const viewport = treeViewportRef.current;
    const element = treeContentRef.current;

    if (!viewport || !element) return;

    const realWidth = Math.max(1, element.offsetWidth);
    const realHeight = Math.max(1, element.offsetHeight);

    const width = Math.max(1, viewport.clientWidth - 60);
    const height = Math.max(1, viewport.clientHeight - 60);

    const nextZoom = clampZoom(
      Math.min(1, width / realWidth, height / realHeight),
    );

    setZoom(nextZoom);
    centerTreeInViewport();
  };

  // --------------------------------------------------
  // INITIAL TREE POSITION
  // --------------------------------------------------

  useEffect(() => {
    if (!displayedTree) return;

    centerTreeInViewport();
  }, [
    displayedTree,
    zoom,
    invertScroll,
    collapsed,
    contentSize.w,
    contentSize.h,
    centerTreeInViewport,
  ]);

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    showFullTree();
    setInvertScroll(false);
    setCollapsed(false);
    setZoom(DEFAULT_ZOOM);
  };

  // --------------------------------------------------
  // FULLSCREEN
  // --------------------------------------------------

  const handleFullscreen = async () => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (viewport.requestFullscreen) {
        await viewport.requestFullscreen();
      }
    } catch (error) {
      console.error("Unable to toggle fullscreen:", error);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (isLoading) {
    return <TreeLoader />;
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (isError || response?.success === false) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[12px] border border-[#edf0f3] bg-white p-6 text-center">
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
  // EMPTY RESPONSE
  // --------------------------------------------------

  if (!data || !tree) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[12px] border border-[#edf0f3] bg-white p-6 text-center">
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
  // UI
  // --------------------------------------------------

  return (
    <div className="w-full min-w-0 rounded-[24px] border border-[#E0E8F3] bg-white p-3 shadow-[0_12px_40px_-22px_rgba(23,43,77,.24)] sm:p-5">
      {/* HEADER */}
      <div className="relative mb-5 overflow-hidden rounded-[23px] bg-gradient-to-br from-[#172C4D] via-[#244C89] to-[#3673CE] px-5 py-6 text-white shadow-[0_16px_36px_-22px_rgba(23,44,77,.7)] sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[35px] border-white/[.06]"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border border-white/20 bg-white/15">
              <Network className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#C6DEFF]">
                Network workspace
              </p>

              <h1 className="text-[23px] font-extrabold tracking-[-.035em] sm:text-[28px]">
                Your Binary Team Tree
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#DDEAFF] sm:text-[13px]">
                Explore your team, search for a member or open any member to
                see their complete downline.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col gap-4 rounded-[19px] border border-[#DEE7F3] bg-[#F8FAFD] p-4 sm:p-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-extrabold text-[#1F3C65]">
            <Search size={15} />
            Find a member or branch
          </div>

          <p className="mb-3 text-[12px] leading-5 text-[#667B96]">
            Search across all loaded hierarchy levels. Select a result to open
            its entire branch.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* ROOT FULL NAME + TC DROPDOWN */}
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <span
                title={rootDisplayName}
                className="max-w-[190px] truncate text-[12px] font-bold text-[#1a3559]"
              >
                {rootDisplayName}
              </span>

              <div ref={rootDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setRootDropdownOpen((previous) => !previous)
                  }
                  aria-haspopup="listbox"
                  aria-expanded={rootDropdownOpen}
                  title="Select a TC member"
                  className="flex h-[44px] min-w-[145px] items-center justify-between gap-3 rounded-[12px] border border-[#C9D8EB] bg-[#EDF4FF] px-4 text-left transition-all hover:border-[#8CAFE6] hover:bg-[#E5EFFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3268C8]/10"
                >
                  <span className="text-[13px] font-extrabold tracking-[-.01em] text-[#1D3557]">
                    {currentRootTC}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#8394AC] transition-transform duration-200 ${
                      rootDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {rootDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Select TC member"
                    className="absolute left-0 top-[52px] z-[120] w-[280px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[15px] border border-[#D9E6F5] bg-white shadow-[0_20px_50px_rgba(18,43,83,.18)]"
                  >
                    <div className="border-b border-[#EDF1F6] bg-[#F7FAFF] px-4 py-3">
                      <p className="text-[12px] font-extrabold text-[#1D3557]">
                        Select TC
                      </p>
                      <p className="mt-1 text-[10px] text-[#8493A8]">
                        Choose a member to view their branch
                      </p>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto overscroll-contain p-2">
                      {rootTCOptions.length > 0 ? (
                        <div className="space-y-1">
                          {rootTCOptions.map((member) => {
                            const isActive =
                              member.ba_id === currentRootId;
                            const tcLabel = member.tc_label || "N/A";

                            return (
                              <button
                                key={member.ba_id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() =>
                                  openBranch(member.ba_id)
                                }
                                className={`flex w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-3 text-left transition-colors ${
                                  isActive
                                    ? "border-[#C9DDFB] bg-[#EEF5FF]"
                                    : "border-transparent hover:bg-[#F3F7FD]"
                                }`}
                              >
                                <span className="min-w-0 flex-1">
                                  <span
                                    className={`block text-[13px] font-extrabold ${
                                      isActive
                                        ? "text-[#245BB0]"
                                        : "text-[#1D3557]"
                                    }`}
                                  >
                                    {tcLabel}
                                  </span>

                                  <span
                                    className="mt-1 block truncate text-[10px] font-medium text-[#8291A7]"
                                    title={member.ba_id}
                                  >
                                    {member.ba_id}
                                  </span>
                                </span>

                                {isActive && (
                                  <span className="shrink-0 rounded-full bg-[#DCEBFF] px-2 py-1 text-[9px] font-bold text-[#285DAE]">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-3 py-6 text-center">
                          <Network
                            size={22}
                            className="mx-auto text-[#A0AEC0]"
                          />
                          <p className="mt-2 text-[12px] font-semibold text-[#475569]">
                            No TC members found
                          </p>
                          <p className="mt-1 text-[10px] text-[#94A3B8]">
                            No matching TC records are available.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEARCH DROPDOWN */}
            <div
              ref={searchRef}
              className="relative w-full min-w-[220px] sm:w-[310px]"
            >
              <div className="flex h-[54px] items-center gap-2.5 rounded-[13px] border border-[#C7D7EB] bg-white px-3 focus-within:border-[#3268C8] focus-within:ring-4 focus-within:ring-[#3268C8]/10">
                <Search
                  size={18}
                  className="shrink-0 text-[#64748b]"
                />

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
                      const query = normalizeSearch(searchQuery);
                      if (!query) return;

                      const exactBAId = [...nodesById.values()].find(
                        (node) =>
                          normalizeSearch(node.member.ba_id || "") ===
                          query,
                      );

                      const exactName = [...nodesById.values()].find(
                        (node) =>
                          normalizeSearch(getMemberName(node.member)) ===
                          query,
                      );

                      const match =
                        exactBAId || exactName || searchResults[0];

                      if (match) {
                        openBranch(match.member.ba_id);
                      } else {
                        setSearchError(
                          "Member not found in the loaded tree.",
                        );
                      }
                    }

                    if (event.key === "Escape") {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search member name or BA ID..."
                  aria-label="Search member name or BA ID across all levels"
                  className="w-full min-w-0 bg-transparent text-[13px] font-semibold text-[#1D3557] outline-none placeholder:font-normal placeholder:text-[#8FA0B7]"
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
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#64748b] hover:bg-[#EFF4FA] hover:text-[#1D3557]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {searchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-[62px] z-[100] max-h-[400px] overflow-y-auto overscroll-contain rounded-[16px] border border-[#D9E6F5] bg-white p-2 shadow-[0_20px_50px_rgba(18,43,83,.18)]">
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((node) => {
                        const memberName = getMemberName(node.member);
                        const memberBAId = node.member.ba_id || "N/A";

                        return (
                          <button
                            key={node.member.ba_id}
                            type="button"
                            onClick={() =>
                              openBranch(node.member.ba_id)
                            }
                            className="flex w-full items-center justify-between gap-3 rounded-[10px] px-3.5 py-3 text-left transition-colors hover:bg-[#EFF5FF] active:bg-[#E4EEFC]"
                          >
                            <span className="min-w-0 flex-1">
                              <span
                                className="block truncate text-[13px] font-bold leading-5 text-[#172C4D]"
                                title={memberName}
                              >
                                {memberName}
                              </span>

                              <span
                                className="mt-1 block break-all text-[10px] font-semibold tracking-[.02em] text-[#3268C8]"
                                title={memberBAId}
                              >
                                {memberBAId}
                              </span>
                            </span>

                            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#F0F5FC] px-2.5 py-1 text-[10px] font-medium text-[#64748b]">
                              Level {node.member.level}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-5 text-center">
                      <Search
                        size={20}
                        className="mx-auto text-[#A0AEC0]"
                      />
                      <p className="mt-2 text-[12px] font-semibold text-[#475569]">
                        No matching member found
                      </p>
                      <p className="mt-1 text-[10px] text-[#94A3B8]">
                        Try searching with another name or BA ID.
                      </p>
                    </div>
                  )}

                  {searchResults.length === 60 && (
                    <div className="mt-1 border-t border-[#EDF1F6] px-3 py-2.5 text-center text-[10px] text-[#64748b]">
                      Showing first 60 matches. Type more characters to
                      narrow results.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-[44px] items-center gap-2 rounded-[11px] border border-[#D8E3F1] bg-white px-4 text-[12px] font-bold text-[#2A476F] hover:bg-[#EDF4FD] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {/* REVERSE TREE */}
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
              className="flex h-[44px] items-center gap-2 rounded-[11px] border border-[#D8E3F1] bg-white px-4 transition-colors hover:bg-[#EDF4FD]"
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
                Reverse tree direction
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-5 w-full min-w-0">
        <div className="w-full min-w-0">
          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-[18px] border border-[#DCE6F2] bg-[#F4F8FD] px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <h3 className="text-[17px] font-extrabold text-[#1A3559]">
                Team Hierarchy
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={scrollHierarchyDown}
                className="inline-flex h-[36px] items-center gap-1.5 rounded-md border border-[#e5e9ef] bg-white px-3 text-[11px] font-semibold text-[#1a2332] hover:bg-[#f5f6fa] lg:hidden"
                aria-label="Scroll down the team hierarchy"
              >
                <ChevronDown size={15} />
                Scroll Down
              </button>

              {branchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={goBackBranch}
                  className="inline-flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC]"
                >
                  <ArrowLeft size={14} />
                </button>
              )}

              {currentRootId !== tree.member.ba_id && (
                <button
                  type="button"
                  onClick={showFullTree}
                  className="inline-flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC]"
                >
                  <Network size={14} />
                  Full Tree
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
                className="flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC] disabled:opacity-40"
              >
                <Maximize2 size={14} />
                Expand All
              </button>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                disabled={collapsed}
                className="flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC] disabled:opacity-40"
              >
                <Minimize2 size={14} />
                Collapse All
              </button>

              <button
                type="button"
                onClick={handleFitToView}
                className="flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC]"
              >
                <Fullscreen size={14} />
                Fit to View
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                title="Open tree in fullscreen"
                aria-label="Toggle fullscreen"
                className="flex h-[42px] items-center gap-1.5 rounded-[11px] border border-[#D7E2F0] bg-white px-3.5 text-[12px] font-bold text-[#244269] hover:bg-[#EAF2FC]"
              >
                <Maximize2 size={14} />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
          </div>

          {/* TREE INSTRUCTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-x border-[#DCE6F2] bg-[#EDF5FF] px-4 py-3 text-[12px] sm:px-5">
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

          {/* TREE VIEWPORT */}
          <div
            ref={treeViewportRef}
            onPointerDown={onTreePointerDown}
            onPointerMove={onTreePointerMove}
            onPointerUp={onTreePointerUp}
            onPointerCancel={onTreePointerUp}
            title="Double-click any member card to open its branch"
            className="w-full max-w-full overflow-auto overscroll-contain rounded-b-[18px] border-x border-b border-[#DCE6F2] bg-white p-4 sm:p-8"
            style={{
              height: "clamp(540px, 75vh, 950px)",
              minHeight: "540px",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y",
              backgroundImage:
                "radial-gradient(#D9E5F4 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            <div
              className="relative mx-auto"
              style={{
                width: contentSize.w
                  ? contentSize.w * zoom
                  : undefined,
                height: contentSize.h
                  ? contentSize.h * zoom
                  : undefined,
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
                  node={displayedTree}
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

      {/* LEGEND */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
        <span className="text-[12px] font-bold text-[#1a2332]">
          LEGEND
        </span>

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

      {/* API REFRESH STATUS */}
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
