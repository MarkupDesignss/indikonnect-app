"use client";

import { Maximize2, Minimize2, Scan, Users } from "lucide-react";
import { useState } from "react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";

const FontImport = () => (
  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        /* In production, prefer next/font/google over a runtime @import for this. */
    `}</style>
);

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
  >
    <Icon size={15} />
    {label}
  </button>
);

const SponsorTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
    >
      <FontImport />

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[19px] font-black tracking-[-0.01em] text-[#101828]">
          Sponsor tree
        </h1>

        <div className="flex items-center gap-1 rounded-[10px] border border-[#e7e9ee] bg-[#f7f8fa] p-1">
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
          <ToolbarButton icon={Scan} label="Fit to view" />
        </div>
      </div>

      {/* ================= TREE STRUCTURE ================= */}
      <div className="mt-8 flex min-h-[400px] flex-col items-center justify-center">
        {/* Root Node */}
        <div
          className={`w-[380px] rounded-[18px] border p-8 text-center transition-all duration-300 ${
            isExpanded
              ? "border-[#0E1B3D]/25 bg-white opacity-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              : "border-[#e7e9ee] bg-white opacity-60"
          }`}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ backgroundColor: NAVY }}
          >
            SK
          </div>

          <p className="mt-4 text-[12px] text-[#98a2b3]">AIA182931-001</p>
          <p className="mt-1 text-[19px] font-black text-[#101828]">
            Saurabh Kainth
          </p>

          {/* Status and Rank Badges */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[12.5px] font-semibold"
              style={{ color: EMERALD, backgroundColor: "#eaf7f0" }}
            >
              Activated
            </span>
            <span
              className="rounded-full px-3 py-1 text-[12.5px] font-semibold"
              style={{ color: BRASS, backgroundColor: "#f8f1e4" }}
            >
              Silver
            </span>
          </div>

          {/* No Downline Message */}
          {isExpanded && (
            <div className="mt-6 flex flex-col items-center gap-2 border-t border-[#f0f2f5] pt-5">
              <Users className="h-5 w-5 text-[#c1c6d0]" />
              <p className="text-[13.5px] text-[#8a92a6]">No downline yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorTree;
