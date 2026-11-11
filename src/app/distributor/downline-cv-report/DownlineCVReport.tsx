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
  Layers3,
  ShieldCheck,
  CircleHelp,
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
  "rounded-[22px] border border-[#E6EBF2] bg-white shadow-[0_8px_32px_-20px_rgba(15,23,42,.18)]";

const btn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#172B52] px-5 text-[13px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(23,43,82,.45)] transition hover:bg-[#223F73] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50";

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

      <div className="mt-1.5 break-all text-[17px] font-extrabold tabular-nums text-[#182E50]">
        {value(amount)}
      </div>
    </div>
  );
}

function Detail({ member }: { member: Member }) {
  return (
    <div className="mt-3 rounded-[18px] border border-[#E1E9F4] bg-gradient-to-br from-[#F5F8FE] to-white p-3.5 sm:p-5">
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
        <div className="relative z-[1] flex w-8 shrink-0 justify-center pt-[23px] sm:w-11">
          {node.children.length > 0 ? (
            <button
              type="button"

              onClick={() => onToggle(node.key)}

              aria-expanded={childrenOpen}

              aria-label={`${childrenOpen ? "Collapse" : "Expand"} ${getId(member)}`}

              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D6E2F1] bg-white text-[#244E82] shadow-sm transition hover:border-[#8EACD2] hover:bg-[#EDF5FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
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
          <div className="flex flex-wrap items-center gap-3 px-3.5 py-4 sm:gap-4 sm:px-5 sm:py-4.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E6F0FF] to-[#EEF2FB] text-[#244C7E] ring-1 ring-[#DAE5F4]">
              <UserRound size={19} fill="currentColor" strokeWidth={1.3} />
            </span>

            <div className="min-w-[145px] flex-1">
              <p className="break-all text-[14px] font-extrabold tracking-tight text-[#192F55] sm:text-[15px]">
                {getId(member) || "Member ID unavailable"}
              </p>

              <p className="mt-1 truncate text-[12px] font-medium text-[#65748C] sm:text-[13px]">
                {getName(member)}
              </p>
              {node.children.length > 0 && (
                <p className="mt-1 text-[10px] font-semibold text-[#8797AB]">
                  {node.children.length} direct child{" "}
                  {node.children.length === 1 ? "member" : "members"}
                </p>
              )}
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

                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#CAD9ED] bg-[#F3F7FE] px-3 text-[12px] font-semibold text-[#24558E] transition hover:bg-[#E5F0FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                {detailIsOpen ? "Hide details" : "View details"}
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
        <div className="relative ml-4 border-l-2 border-[#DCE7F3] pl-2.5 pt-3 sm:ml-5 sm:pl-4">
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
      className="min-h-[100dvh] w-full min-w-0 bg-[#F5F7FC] p-3 text-[#263449] sm:p-5 lg:p-7"

      style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1540px] space-y-5">
        <header className="relative isolate overflow-hidden rounded-[25px] bg-gradient-to-br from-[#0D1F40] via-[#172D54] to-[#295386] px-5 py-6 text-white shadow-[0_18px_35px_-18px_rgba(16,42,79,.6)] sm:px-7 sm:py-7 lg:px-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[40px] border-white/[0.045]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-120px] right-[20%] h-64 w-64 rounded-full bg-blue-300/[0.07] blur-2xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner sm:h-14 sm:w-14">
                <Network size={25} />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-blue-100/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{" "}
                  DISTRIBUTOR NETWORK
                </div>
                <h1 className="text-[24px] font-extrabold tracking-tight sm:text-[31px]">
                  Downline Members
                </h1>
                <p className="mt-2 max-w-xl text-[12px] leading-5 text-blue-100/85 sm:text-[13px]">
                  Explore your team hierarchy, find a member, and view their
                  business CV breakdown.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Updating..." : "Refresh data"}
            </button>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-[11px] font-medium text-blue-100/90">
            <span className="inline-flex items-center gap-2">
              <UsersRound size={14} />{" "}
              {isLoading ? "Loading" : value(members.length)} loaded members
            </span>
            <span className="inline-flex items-center gap-2">
              <Layers3 size={14} /> {maxLevel} highest reported level
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} /> Live API hierarchy
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`${card} flex items-center gap-4 p-5 sm:p-6`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#24578E]">
              <UserRound size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8290A4]">
                Direct referrals in loaded tree
              </p>
              <p className="mt-1 text-[29px] font-extrabold leading-none tabular-nums text-[#172E51]">
                {isLoading ? "—" : value(direct)}
              </p>
            </div>
          </div>
          <div className={`${card} flex items-center gap-4 p-5 sm:p-6`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F8F1] text-[#168358]">
              <UsersRound size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8290A4]">
                Total API records
              </p>
              <p className="mt-1 text-[29px] font-extrabold leading-none tabular-nums text-[#172E51]">
                {isLoading ? "—" : value(totalMembers)}
              </p>
            </div>
          </div>
          <div className={`${card} flex items-center gap-4 p-5 sm:p-6`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4E7] text-[#B57321]">
              <GitBranch size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8290A4]">
                Highest level in loaded tree
              </p>
              <p className="mt-1 text-[29px] font-extrabold leading-none tabular-nums text-[#172E51]">
                {isLoading ? "—" : maxLevel}
              </p>
            </div>
          </div>
        </section>

        <section className={`${card} p-4 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-tight text-[#1D304E] sm:text-[20px]">
                Referral Network
              </h2>

              <p className="mt-0.5 text-[11px] text-[#8590A0]">
                Expand a member to browse their team. Select “View details” for
                CV and placement information.
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

                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#D5E2F2] bg-[#F4F8FF] px-4 text-[12px] font-semibold text-[#295789] hover:bg-[#E8F1FF] disabled:opacity-50"
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

            className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E7EBF2] bg-[#F8FAFE] p-3 sm:p-4"
          >
            <div className="relative min-w-[180px] flex-1 sm:min-w-[280px]">
              <Search
                size={15}

                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#929EB0]"
              />

              <input
                aria-label="Search members"

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                placeholder="Search member ID, BA ID, name or parent..."

                className="h-11 w-full rounded-xl border border-[#DCE4EF] bg-white pl-10 pr-9 text-[13px] font-medium text-[#1D304D] outline-none placeholder:font-normal placeholder:text-[#9CAABD] transition focus:border-[#759BCB] focus:ring-4 focus:ring-blue-100/70"
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

                className="min-h-11 rounded-xl border border-[#D5E2F2] bg-white px-4 text-[12px] font-semibold text-[#526076] hover:bg-[#EDF4FC]"
              >
                Clear
              </button>
            )}
          </form>

          <p className="mt-3 flex items-center gap-2 text-[11px] text-[#8290A4]">
            <CircleHelp size={14} /> Search by BA ID, member, name, parent or
            level. Press Search to apply.
          </p>

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
            <div className="mt-6 space-y-3 rounded-2xl bg-[#F9FBFF] p-2 sm:p-4">
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
            <div className="mt-5 flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#DAE5F2] bg-[#FAFCFF] p-6 text-center text-[13px] text-[#8793A5]">
              {search
                ? "No matching members found"
                : "No downline members available"}
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setAppliedSearch("");
                  }}
                  className="rounded-xl bg-[#172B52] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#254575]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          <p className="mt-5 border-t border-[#EDF0F4] pt-3 text-[10px] text-[#939DAA]">
            Parent-child connections use the API's unilevel parent BA ID.
            Missing names, dates and status are shown as unavailable rather than
            invented.
          </p>
        </section>
      </div>
    </main>
  );
}
