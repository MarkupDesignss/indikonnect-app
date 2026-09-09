"use client";

import {
  TrendingUp,
  Database,
  CalendarDays,
  Link2,
  User,
  Circle,
} from "lucide-react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const INDIGO = "#3955A6";
const PLUM = "#6B4C9A";

const FontImport = () => (
  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
    `}</style>
);

const STAT_CARDS = [
  {
    label: "Direct CV",
    value: "0",
    icon: TrendingUp,
    color: INDIGO,
    bg: "#eceffb",
  },
  { label: "Steps", value: "0", icon: Database, color: BRASS, bg: "#f8f1e4" },
  {
    label: "Rank run date",
    value: "15 Aug 2026",
    icon: CalendarDays,
    color: NAVY,
    bg: "#eceefb",
  },
  {
    label: "Pairing commission",
    value: "0",
    icon: Link2,
    color: PLUM,
    bg: "#f1ebf7",
  },
];

const RANK_COLUMNS = [
  "Rank",
  "Prerequisite",
  "Steps",
  "Direct CV",
  "Downline requirement",
];

const ranks = [
  {
    name: "Ruby",
    eyebrow: "Next step",
    color: NAVY,
    prerequisite: "Must have achieved the Sapphire Star rank",
    steps: "110 steps",
    cv: "600 Direct CV*",
    downline:
      "5 downlines with Sapphire Star rank or above and 10 downlines with Platinum Star rank or above",
  },
  {
    name: "Emerald",
    eyebrow: "Then",
    color: INDIGO,
    prerequisite: "Must have achieved the Ruby Star rank",
    steps: "190 steps",
    cv: "1,200 Direct CV*",
    downline: "1 downline with Ruby Star pay rank or above",
  },
  {
    name: "Diamond",
    eyebrow: "Then",
    color: "#98a2b3",
    prerequisite: "Must have achieved the Emerald Star rank",
    steps: "310 steps",
    cv: "1,800 Direct CV*",
    downline: "2 downlines with Emerald Star pay rank or above",
  },
];

const RankInformation = () => {
  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="space-y-6">
      <FontImport />

      {/* Heading */}
      <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">
        Dashboard
      </h1>

      {/* ================= TOP STATS CARDS ================= */}
      <div className="flex flex-wrap gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex h-[84px] min-w-[200px] flex-1 items-center gap-4 rounded-[14px] border border-[#e7e9ee] bg-white p-4 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: bg }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-[#667085]">
                {label}
              </p>
              <p
                className="mt-1 text-[19px] font-black"
                style={{ color: label === "Rank run date" ? color : "#101828" }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DISTRIBUTOR INFO CARD ================= */}
      <div className="flex w-fit min-w-[240px] items-center gap-3 rounded-[14px] border border-[#e7e9ee] bg-white p-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "#eceefb" }}
        >
          <User className="h-5 w-5" style={{ color: NAVY }} />
        </div>
        <div>
          <p className="text-[12.5px] font-semibold text-[#667085]">
            Distributor
          </p>
          <p className="text-[16px] font-bold" style={{ color: NAVY }}>
            AIA126474
          </p>
        </div>
      </div>

      {/* ================= RANKS CHART ================= */}
      <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 sm:p-8">
        <h3 className="text-[18px] font-bold text-[#101828]">Ranks chart</h3>

        {/* Column headers */}
        <div className="mt-6 hidden grid-cols-[1.2fr_1.4fr_0.8fr_1fr_1.6fr] gap-6 border-b border-[#e7e9ee] pb-3 pl-10 text-[11px] font-bold tracking-wide text-[#8a92a6] lg:grid">
          {RANK_COLUMNS.map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-8">
          {ranks.map((rank, idx) => (
            <div key={rank.name} className="flex gap-4">
              {/* Marker column — sized to this row's own content, no percentage guessing */}
              <div className="flex w-4 flex-col items-center self-stretch">
                <span
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                  style={{ backgroundColor: rank.color }}
                />
                {idx !== ranks.length - 1 && (
                  <span
                    className="mt-1 w-[2px] flex-1 rounded-full"
                    style={{ backgroundColor: "#e7e9ee" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2 lg:grid lg:grid-cols-[1.2fr_1.4fr_0.8fr_1fr_1.6fr] lg:gap-6">
                <div>
                  <p className="text-[12.5px] font-semibold text-[#98a2b3]">
                    {rank.eyebrow}
                  </p>
                  <h4
                    className="mt-0.5 text-[19px] font-black"
                    style={{ color: rank.color }}
                  >
                    {rank.name}
                  </h4>
                </div>
                <p className="mt-3 text-[13px] text-[#475066] lg:mt-0">
                  {rank.prerequisite}
                </p>
                <p className="mt-2 text-[13px] text-[#475066] lg:mt-0">
                  {rank.steps}
                </p>
                <p className="mt-2 text-[13px] text-[#475066] lg:mt-0">
                  {rank.cv}
                </p>
                <p className="mt-2 text-[13px] text-[#475066] lg:mt-0">
                  {rank.downline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankInformation;
