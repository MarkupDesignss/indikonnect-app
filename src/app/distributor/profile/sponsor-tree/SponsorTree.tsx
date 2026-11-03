
"use client";

import {
  Maximize2,
  Minimize2,
  Scan,
  Users,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
} from "lucide-react";

import { useRef, useState } from "react";

import {
  useGetDistributorDownlineQuery,
} from "@/lib/redux/api/distributor/distributorDownlineApi";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";

/* =========================================================
   FONT
========================================================= */

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
  `}</style>
);

/* =========================================================
   TYPES
========================================================= */

type ToolbarButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
};

type DownlineMember = {
  member_id: number;
  ba_id: string;

  unilevel_parent_id: number | null;
  unilevel_parent_ba_id: string | null;

  binary_parent_id: number | null;
  binary_parent_ba_id: string | null;
  binary_side: number | null;

  cv_left: string;
  cv_right: string;

  floating_cv_left: string;
  floating_cv_right: string;

  total_cv_left: string;
  total_cv_right: string;

  level: number;
};

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "0";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
};

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-2 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] sm:px-3"
  >
    <Icon size={15} className="shrink-0" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

/* =========================================================
   LOADING SKELETON
========================================================= */

const TreeSkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="h-[175px] w-full max-w-[320px] rounded-[18px] bg-gray-100" />

    <div className="h-10 w-[2px] bg-gray-200" />

    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[190px] rounded-[16px] bg-gray-100"
        />
      ))}
    </div>
  </div>
);

/* =========================================================
   MEMBER CARD
========================================================= */

const MemberCard = ({
  member,
}: {
  member: DownlineMember;
}) => {
  return (
    <div className="relative pt-6">
      {/* Connection Line */}

      <div className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 bg-[#e7e9ee]" />

      <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 transition-all duration-300 hover:border-[#0E1B3D]/20 hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.15)] sm:p-5">

        {/* Member Header */}

        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "#eceefb" }}
          >
            <User
              className="h-5 w-5"
              style={{ color: NAVY }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black text-[#101828]">
              {member.binary_parent_ba_id}
            </p>

           
          </div>

          <span className="shrink-0 rounded-full bg-[#eaf7f0] px-2.5 py-1 text-[10px] font-bold text-[#16834b]">
            Level {member.level}
          </span>
        </div>

        {/* Sponsor Info */}

        <div className="mt-4 rounded-lg bg-[#f8f9fb] p-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 text-[#8a92a6]" />

            <span className="text-[11px] font-semibold text-[#8a92a6]">
              Sponsor ID
            </span>
          </div>

          <p className="mt-1 break-all text-[12px] font-bold text-[#344054]">
            {member.unilevel_parent_ba_id || "—"}
          </p>
        </div>

        {/* CV Details */}

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
            CV Details
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#e7e9ee] p-2.5">
              <p className="text-[10px] font-semibold text-[#98a2b3]">
                Left CV
              </p>

              <p className="mt-1 text-[14px] font-black text-[#101828]">
                {formatNumber(member.cv_left)}
              </p>
            </div>

            <div className="rounded-lg border border-[#e7e9ee] p-2.5">
              <p className="text-[10px] font-semibold text-[#98a2b3]">
                Right CV
              </p>

              <p className="mt-1 text-[14px] font-black text-[#101828]">
                {formatNumber(member.cv_right)}
              </p>
            </div>
          </div>
        </div>

        {/* Floating CV */}

        <div className="mt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
            Floating CV
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#f8f1e4] p-2.5">
              <p className="text-[10px] font-semibold text-[#9b7849]">
                Left
              </p>

              <p className="mt-1 text-[13px] font-bold text-[#344054]">
                {formatNumber(member.floating_cv_left)}
              </p>
            </div>

            <div className="rounded-lg bg-[#f8f1e4] p-2.5">
              <p className="text-[10px] font-semibold text-[#9b7849]">
                Right
              </p>

              <p className="mt-1 text-[13px] font-bold text-[#344054]">
                {formatNumber(member.floating_cv_right)}
              </p>
            </div>
          </div>
        </div>

        {/* Total CV */}

        <div className="mt-3 rounded-lg border border-[#dcefe5] bg-[#f0f9f4] p-3">
          <p className="mb-2 text-[11px] font-bold text-[#16834b]">
            Total CV
          </p>

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-[#667085]">
                Left
              </p>

              <p className="text-[13px] font-black text-[#101828]">
                {formatNumber(member.total_cv_left)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-[#667085]">
                Right
              </p>

              <p className="text-[13px] font-black text-[#101828]">
                {formatNumber(member.total_cv_right)}
              </p>
            </div>
          </div>
        </div>

        {/* Binary Side */}

        {member.binary_side !== null && (
          <div className="mt-3 flex items-center justify-between border-t border-[#f0f2f5] pt-3">
            <span className="text-[11px] font-semibold text-[#8a92a6]">
              Binary Position
            </span>

            <span className="rounded-full bg-[#eceefb] px-2.5 py-1 text-[10px] font-bold text-[#3955A6]">
              {member.binary_side === 1
                ? "Left"
                : member.binary_side === 2
                  ? "Right"
                  : `Side ${member.binary_side}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SponsorTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const treeRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     API CALL - DEPTH 1
  ======================================================= */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDistributorDownlineQuery(1);

  const members = (data?.data || []) as DownlineMember[];

  /* =======================================================
     FIT TO VIEW
  ======================================================= */

  const handleFitToView = () => {
    treeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6"
    >
      <FontImport />

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[17px] font-black tracking-[-0.01em] text-[#101828] sm:text-[19px]">
            Sponsor tree
          </h1>

          <p className="mt-1 text-[12px] text-[#98a2b3]">
            Direct downline members
          </p>
        </div>

        <div className="flex items-center gap-1 self-start rounded-[10px] border border-[#e7e9ee] bg-[#f7f8fa] p-1 sm:self-auto">
          <ToolbarButton
            icon={Maximize2}
            label="Expand all"
            onClick={() => setIsExpanded(true)}
          />

          <ToolbarButton
            icon={Minimize2}
            label="Collapse all"
            onClick={() => setIsExpanded(false)}
          />

          <ToolbarButton
            icon={Scan}
            label="Fit to view"
            onClick={handleFitToView}
          />
        </div>
      </div>

      {/* ================= TREE STRUCTURE ================= */}

      <div
        ref={treeRef}
        className="mt-6 flex min-h-[320px] flex-col items-center sm:mt-8 sm:min-h-[400px]"
      >
        {/* ================= ROOT NODE ================= */}

        <div
          className={`relative z-10 w-full max-w-[340px] rounded-[18px] border p-5 text-center transition-all duration-300 sm:p-7 ${
            isExpanded
              ? "border-[#0E1B3D]/25 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              : "border-[#e7e9ee] bg-white opacity-70"
          }`}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white sm:h-14 sm:w-14"
            style={{ backgroundColor: NAVY }}
          >
            <User className="h-6 w-6" />
          </div>

          <p className="mt-3 text-[12px] font-semibold text-[#98a2b3]">
            Main Distributor
          </p>

          <p className="mt-1 text-[18px] font-black text-[#101828]">
            Your Account
          </p>

          {/* Members Count */}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
              style={{
                color: EMERALD,
                backgroundColor: "#eaf7f0",
              }}
            >
              <Users className="h-3.5 w-3.5" />
              {members.length} Direct Members
            </span>

         
          </div>

          {/* Loading / Error / Empty message */}

          {isExpanded && !isLoading && (
            <div className="mt-5 border-t border-[#f0f2f5] pt-4">
              {isError ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />

                  <p className="text-[13px] text-red-500">
                    Unable to load downline members.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-[12px] font-bold text-[#3955A6] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-5 w-5 text-[#c1c6d0]" />

                  <p className="text-[13px] text-[#8a92a6]">
                    No downline yet
                  </p>
                </div>
              ) : (
                <p className="text-[12px] text-[#667085]">
                  Your direct sponsor network
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= DOWNLINE MEMBERS ================= */}

        {isExpanded && (
          <>
            {isLoading ? (
              <div className="mt-8 w-full">
                <TreeSkeleton />
              </div>
            ) : isError ? null : members.length > 0 ? (
              <>
                {/* Main Connector */}

                <div className="h-8 w-[2px] bg-[#e7e9ee]" />

                {/* Members Count */}

                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#98a2b3]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1f9d6b]" />
                  {members.length} Direct Downline Members
                </div>

                {/* Member Cards */}

                <div className="relative w-full">
                  {/* Horizontal Connection */}

                  {members.length > 1 && (
                    <div className="absolute left-[calc(100%/6)] right-[calc(100%/6)] top-0 hidden h-[2px] bg-[#e7e9ee] xl:block" />
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {members.map((member) => (
                      <MemberCard
                        key={member.member_id}
                        member={member}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* Collapsed Message */}

        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mt-6 flex items-center gap-2 rounded-full border border-[#e7e9ee] bg-[#f8f9fb] px-4 py-2 text-[12px] font-bold text-[#667085] transition-colors hover:bg-[#eceefb] hover:text-[#3955A6]"
          >
            <Users className="h-4 w-4" />
            Show {members.length} direct members
          </button>
        )}

        {/* Updating Indicator */}

        {isFetching && !isLoading && (
          <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#98a2b3]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating sponsor tree...
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorTree;
