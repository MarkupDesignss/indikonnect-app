"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  GitBranch,
  Loader2,
  Network,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useGetDistributorDownlineQuery } from "@/lib/redux/api/distributor/distributorDownlineApi";
import type { DistributorDownlineMember } from "@/lib/redux/api/distributor/distributorDownlineApi";

/**
 * Full IndieKonnect downline genealogy screen.
 * Uses the existing authenticated RTK Query endpoint: no mocked accounts.
 * Hierarchy is built from the parent BA IDs returned by the API.
 * The screenshot supplies the appearance, not the example member values.
 * Drop into the EXISTING distributor layout; it doesn't duplicate Sidebar/Header.
 */
type Member = DistributorDownlineMember & {
  name?: string | null;
  member_name?: string | null;
  full_name?: string | null;
  status?: string | null;
  membership_status?: string | null;
  created_at?: string | null;
  joined_at?: string | null;
  activated_at?: string | null;
  date_created?: string | null;
  registered_at?: string | null;
  unilevel_parent_ba_id?: string | null;
  binary_parent_ba_id?: string | null;
};

type Node = { member: Member; key: string; children: Node[] };
const card =
  "rounded-[14px] border border-[#E7EAF0] bg-white shadow-[0_2px_8px_rgba(16,24,40,.025)]";
const btn =
  "inline-flex h-9 items-center justify-center gap-2 rounded-[9px] bg-[#171717] px-4 text-[12px] font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50";
const value = (n: unknown) => {
  if (n == null || n === "" || !Number.isFinite(Number(n))) return "—";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
};
const dateText = (raw: unknown) => {
  const text = String(raw ?? "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!match) return text || "—";
  const day = new Date(
    Date.UTC(+match[1], +match[2] - 1, +match[3]),
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return match[4] ? `${day}, ${match[4]}:${match[5]}` : day;
};
function getId(member: Member) {
  return String(member.ba_id ?? member.member_id ?? "").trim();
}
function getName(member: Member) {
  return (
    member.member_name || member.full_name || member.name || "Name not provided"
  );
}
function getStatus(member: Member) {
  return String(member.membership_status || member.status || "").trim();
}
function getDate(member: Member) {
  return dateText(
    member.activated_at ||
      member.joined_at ||
      member.created_at ||
      member.date_created ||
      member.registered_at,
  );
}
function getParent(member: Member) {
  // This is a UNILEVEL referral tree. Binary parent is not interchangeable with
  // referral parent, so it is shown in details rather than used as a fallback.
  return String(member.unilevel_parent_ba_id ?? "").trim();
}
function getKey(member: Member, i: number) {
  return `${getId(member) || "unknown"}:${String(member.member_id ?? i)}`;
}

function buildTree(members: Member[]) {
  const nodes = members.map((member, i): Node => ({
    member,
    key: getKey(member, i),
    children: [],
  }));
  const byBa = new Map<string, Node>();
  nodes.forEach((node) => {
    const id = getId(node.member);
    if (id && !byBa.has(id)) byBa.set(id, node);
  });
  const roots: Node[] = [];
  for (const node of nodes) {
    const parentId = getParent(node.member);
    const parent =
      parentId && parentId !== getId(node.member)
        ? byBa.get(parentId)
        : undefined;
    if (!parent) {
      roots.push(node);
      continue;
    }
    // Broken API cycles should never lock the renderer or lose records.
    let ancestor: Node | undefined = parent;
    const seen = new Set<string>();
    let cyclic = false;
    while (ancestor) {
      if (ancestor === node || seen.has(ancestor.key)) {
        cyclic = true;
        break;
      }
      seen.add(ancestor.key);
      const nextId = getParent(ancestor.member);
      ancestor =
        nextId && nextId !== getId(ancestor.member)
          ? byBa.get(nextId)
          : undefined;
    }
    if (cyclic) roots.push(node);
    else parent.children.push(node);
  }
  return roots;
}
function flatten(nodes: Node[]): Node[] {
  const all: Node[] = [];
  const visited = new Set<string>();
  const walk = (n: Node) => {
    if (visited.has(n.key)) return;
    visited.add(n.key);
    all.push(n);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return all;
}

function StatusBadge({ member }: { member: Member }) {
  const status = getStatus(member);
  if (!status)
    return (
      <span className="text-[10px] text-[#A0A8B4]">Status unavailable</span>
    );
  const active = /^(active|activated|approved|qualified)$/i.test(status);
  const pending = /pending|registered|processing/i.test(status);
  const classes = active
    ? "border-[#D6EDE2] bg-[#EAF8F1] text-[#247B58]"
    : pending
      ? "border-[#F3E6C7] bg-[#FFF9E8] text-[#9C792A]"
      : "border-[#E8EAF0] bg-[#F5F6F8] text-[#6B7280]";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${classes}`}
    >
      {status.replace(/[_-]/g, " ")}
    </span>
  );
}
function Metric({ label, amount }: { label: string; amount: unknown }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#E9EDF2] bg-white p-3">
      <div className="text-[10px] font-medium text-[#828B98]">{label}</div>
      <div className="mt-1 break-all text-[15px] font-bold text-[#273449]">
        {value(amount)}
      </div>
    </div>
  );
}
function Detail({ member }: { member: Member }) {
  return (
    <div className="mt-2 rounded-[12px] border border-[#E6EBF2] bg-[#F9FAFC] p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[#303B4F]">
        <GitBranch size={15} /> Member & CV breakdown
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Left CV" amount={member.cv_left} />
        <Metric label="Right CV" amount={member.cv_right} />
        <Metric label="Floating left CV" amount={member.floating_cv_left} />
        <Metric label="Floating right CV" amount={member.floating_cv_right} />
        <Metric label="Total left CV" amount={member.total_cv_left} />
        <Metric label="Total right CV" amount={member.total_cv_right} />
      </div>
      <div className="mt-3 grid gap-x-4 gap-y-2 text-[11px] text-[#687487] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          Member ID:{" "}
          <strong className="text-[#354155]">{member.member_id ?? "—"}</strong>
        </div>
        <div>
          Unilevel parent:{" "}
          <strong className="break-all text-[#354155]">
            {member.unilevel_parent_ba_id || "—"}
          </strong>
        </div>
        <div>
          Binary parent:{" "}
          <strong className="break-all text-[#354155]">
            {member.binary_parent_ba_id || "—"}
          </strong>
        </div>
        <div>
          Binary side:{" "}
          <strong className="text-[#354155]">
            {member.binary_side === 1
              ? "Left"
              : member.binary_side === 2
                ? "Right"
                : "—"}
          </strong>
        </div>
        <div>
          Level:{" "}
          <strong className="text-[#354155]">{member.level ?? "—"}</strong>
        </div>
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  open,
  onToggle,
  detailsOpen,
  onDetailToggle,
  searchActive,
}: {
  node: Node;
  depth: number;
  open: Set<string>;
  onToggle: (key: string) => void;
  detailsOpen: Set<string>;
  onDetailToggle: (key: string) => void;
  searchActive: boolean;
}) {
  const member = node.member;
  const childrenOpen = searchActive || open.has(node.key);
  const level = member.level ?? depth;
  const detailIsOpen = detailsOpen.has(node.key);
  return (
    <div className="relative min-w-0">
      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
        <div className="relative z-[1] flex w-8 shrink-0 justify-center pt-[20px] sm:w-10">
          {node.children.length > 0 ? (
            <button
              type="button"
              onClick={() => onToggle(node.key)}
              aria-expanded={childrenOpen}
              aria-label={`${childrenOpen ? "Collapse" : "Expand"} ${getId(member)}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E8EF] bg-white text-[#264369] transition hover:border-[#B9C7D8] hover:bg-[#F3F6FA]"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${childrenOpen ? "rotate-180" : ""}`}
              />
            </button>
          ) : (
            <span className="mt-3 h-2 w-2 rounded-full border border-[#BCC7D8] bg-white" />
          )}
        </div>
        <div className={`${card} min-w-0 flex-1 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-3 px-3 py-3.5 sm:gap-4 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF3FB] text-[#244C7E]">
              <UserRound size={19} fill="currentColor" strokeWidth={1.3} />
            </span>
            <div className="min-w-[120px] flex-1">
              <p className="break-all text-[12px] font-bold text-[#213C63] sm:text-[13px]">
                {getId(member) || "Member ID unavailable"}
              </p>
              <p className="mt-0.5 truncate text-[12px] font-medium text-[#303846] sm:text-[13px]">
                {getName(member)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded-full border border-[#DBE6FF] bg-[#EDF3FF] px-3 py-1.5 text-[10px] font-bold uppercase text-[#3563B5]">
                {Number(level) === 0 ? "Root" : `Level ${level}`}
              </span>
              <StatusBadge member={member} />
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-[#48678C] sm:text-[12px]">
                {getDate(member)}
              </span>
              <button
                type="button"
                onClick={() => onDetailToggle(node.key)}
                aria-expanded={detailIsOpen}
                className="rounded-[8px] border border-[#E6EAF0] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#59687C] hover:bg-[#F6F8FB]"
              >
                {detailIsOpen ? "Hide CV" : "View CV"}
              </button>
            </div>
          </div>
          {detailIsOpen && (
            <div className="border-t border-[#EFF1F5] px-3 pb-3 sm:px-5">
              <Detail member={member} />
            </div>
          )}
        </div>
      </div>
      {node.children.length > 0 && childrenOpen && (
        <div className="relative ml-4 border-l border-[#E4E9F0] pl-2.5 pt-3 sm:ml-5 sm:pl-4">
          <div className="space-y-3">
            {node.children.map((child) => (
              <div
                key={child.key}
                className="relative before:absolute before:-left-2.5 before:top-[34px] before:h-px before:w-2.5 before:bg-[#E4E9F0] sm:before:-left-4 sm:before:w-4"
              >
                <TreeItem
                  node={child}
                  depth={depth + 1}
                  open={open}
                  onToggle={onToggle}
                  detailsOpen={detailsOpen}
                  onDetailToggle={onDetailToggle}
                  searchActive={searchActive}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DownlineTreePage() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorDownlineQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const members = useMemo(
    () => (Array.isArray(response?.data) ? response.data : []) as Member[],
    [response?.data],
  );
  const [query, setQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  const [details, setDetails] = useState<Set<string>>(() => new Set());
  const roots = useMemo(() => buildTree(members), [members]);
  const all = useMemo(() => flatten(roots), [roots]);
  const search = appliedSearch.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!search) return new Set<string>();
    return new Set(
      all
        .filter(({ member }) =>
          [
            member.member_id,
            member.ba_id,
            member.level,
            member.unilevel_parent_ba_id,
            member.binary_parent_ba_id,
            getName(member),
            getStatus(member),
          ].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(search),
          ),
        )
        .map((n) => n.key),
    );
  }, [all, search]);
  const filtered = useMemo(() => {
    if (!search) return roots;
    const include = (node: Node): Node | null => {
      const children = node.children
        .map(include)
        .filter((v): v is Node => v !== null);
      return matches.has(node.key) || children.length
        ? { ...node, children }
        : null;
    };
    return roots.map(include).filter((v): v is Node => v !== null);
  }, [roots, search, matches]);
  const rootKeys = useMemo(() => new Set(roots.map((r) => r.key)), [roots]);
  const shownOpen = useMemo(() => {
    const open = new Set([...expanded]);
    rootKeys.forEach((k) => {
      if (!closed.has(k)) open.add(k);
    });
    return open;
  }, [expanded, rootKeys, closed]);
  const toggle = (key: string) => {
    if (rootKeys.has(key)) {
      setClosed((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleDetails = (key: string) =>
    setDetails((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const expandAll = () => {
    setExpanded(new Set(all.map((n) => n.key)));
    setClosed(new Set());
  };
  const collapseAll = () => {
    setExpanded(new Set());
    setClosed(new Set(rootKeys));
  };
  const isAllExpanded =
    all.length > 0 &&
    all.every((n) => !n.children.length || shownOpen.has(n.key));
  // Real direct referrals are those whose unilevel parent matches a root BA ID.
  const direct = members.filter(
    (m) => getParent(m) && roots.some((r) => getParent(m) === getId(r.member)),
  ).length;
  const totalMembers = response?.total ?? members.length;
  const maxLevel = members.reduce(
    (max, member) => Math.max(max, Number(member.level) || 0),
    0,
  );

  return (
    <main
      className="min-h-[100dvh] w-full min-w-0 bg-[#F8F9FB] p-3 text-[#263449] sm:p-5 lg:p-6"
      style={{ fontFamily: "'Lato', Arial, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1500px] space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-[#8B96A7]">
              Distributor / Downline
            </p>
            <h1 className="mt-1 text-[23px] font-bold tracking-tight text-[#202936]">
              Downline Members
            </h1>
            <p className="mt-1 text-[12px] text-[#8792A2]">
              Explore your live referral hierarchy and each member&apos;s CV
              breakdown.
            </p>
          </div>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="flex h-9 items-center gap-2 rounded-[9px] border border-[#E1E5EB] bg-white px-3 text-[11px] font-bold text-[#4C5A6C] hover:bg-[#F4F6F8] disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>
        <section
          className={`${card} flex items-center gap-4 p-4 sm:gap-6 sm:p-5`}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EDF3FD] text-[#254F81] sm:h-16 sm:w-16">
            <Network size={27} />
          </div>
          <div className="h-14 w-px bg-[#E7EBF1]" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64738B]">
              Direct Referred
            </p>
            <p className="mt-1 text-[32px] font-bold leading-tight text-[#254F81] sm:text-[38px]">
              {isLoading ? "—" : value(direct)}
            </p>
            <p className="text-[12px] text-[#456A96]">
              Direct referrals in loaded genealogy
            </p>
          </div>
          <div className="ml-auto hidden text-right text-[11px] text-[#8994A4] sm:block">
            {value(totalMembers)} total API records{" "}
            <span className="mx-2 text-[#D0D5DE]">|</span> Maximum level:{" "}
            {maxLevel}
          </div>
        </section>
        <section className={`${card} p-3 sm:p-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#222D3D]">
                Referral Network
              </h2>
              <p className="mt-0.5 text-[11px] text-[#8590A0]">
                Expand members to explore their referral structure
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#8995A5]">
                {search
                  ? `${matches.size} matches`
                  : `${members.length} members`}
              </span>
              <button
                type="button"
                disabled={!all.length}
                onClick={isAllExpanded ? collapseAll : expandAll}
                className="flex h-9 items-center gap-1.5 rounded-[9px] border border-[#E3E8EE] px-3 text-[11px] font-semibold text-[#526076] hover:bg-[#F7F8FA] disabled:opacity-50"
              >
                {isAllExpanded ? (
                  <ChevronsDownUp size={14} />
                ) : (
                  <ChevronsUpDown size={14} />
                )}
                {isAllExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(query);
            }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <div className="relative min-w-[200px] max-w-[470px] flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#929EB0]"
              />
              <input
                aria-label="Search members"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member ID, BA ID, name or parent..."
                className="h-10 w-full rounded-[10px] border border-[#E1E6EE] bg-[#FAFBFC] pl-9 pr-9 text-[12px] outline-none placeholder:text-[#ABB3C0] focus:border-[#95A4B9] focus:bg-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setAppliedSearch("");
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8B97A8]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className={btn}>
              <Search size={14} /> Search
            </button>
            {appliedSearch && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setAppliedSearch("");
                }}
                className="h-9 rounded-[9px] border border-[#E2E7EF] bg-white px-3 text-[11px] font-semibold text-[#526076]"
              >
                Clear
              </button>
            )}
          </form>
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center gap-2 text-[12px] text-[#728095]">
              <Loader2 className="animate-spin" size={18} /> Loading
              genealogy...
            </div>
          ) : isError || response?.success === false ? (
            <div className="flex min-h-[230px] flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="text-[#B75B5B]" size={27} />
              <p className="text-[13px] font-semibold">
                Unable to load downline data
              </p>
              <button className={btn} onClick={() => void refetch()}>
                Try again
              </button>
            </div>
          ) : filtered.length ? (
            <div className="mt-5 space-y-3">
              {filtered.map((node) => (
                <TreeItem
                  key={node.key}
                  node={node}
                  depth={0}
                  open={shownOpen}
                  onToggle={toggle}
                  detailsOpen={details}
                  onDetailToggle={toggleDetails}
                  searchActive={!!search}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[210px] items-center justify-center text-[12px] text-[#8793A5]">
              {search
                ? "No matching members found"
                : "No downline members available"}
            </div>
          )}
          <p className="mt-5 border-t border-[#EDF0F4] pt-3 text-[10px] text-[#939DAA]">
            Parent-child connections use the API&apos;s unilevel parent BA ID.
            Missing names, dates and status are shown as unavailable rather than
            invented.
          </p>
        </section>
      </div>
    </main>
  );
}
